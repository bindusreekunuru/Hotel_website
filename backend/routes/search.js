import express from 'express';
import { scrapeGoogleMaps } from '../services/scrapers/googleMaps.js';
import { scrapeMakeMyTrip } from '../services/scrapers/makeMyTrip.js';
import { scrapeOYO } from '../services/scrapers/oyo.js';
import { scrapeHostelworld } from '../services/scrapers/hostelworld.js';
import { delay, registerBrowserStart, registerBrowserEnd } from '../services/rateLimit.js';

const router = express.Router();

/**
 * Deduplicate and merge hotels from different scraper sources.
 * Checks for name similarities (case-insensitive, stripping common symbols).
 */
function mergeScrapedResults(gmaps, mmt, oyo, hw) {
  const mergedMap = new Map();

  // Helper to normalize hotel names for comparison
  const normalizeName = (name) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\b(hotel|resort|spa|inn|suites|stay|rooms|oyo|hostel|lodge)\b/g, '')
      .trim();
  };

  const addOrMerge = (hotel, sourceName) => {
    const norm = normalizeName(hotel.name);
    let matchKey = null;

    // Search for an existing match in the map
    for (const [key, value] of mergedMap.entries()) {
      if (key === norm || norm.includes(key) || key.includes(norm)) {
        matchKey = key;
        break;
      }
    }

    if (matchKey) {
      const existing = mergedMap.get(matchKey);
      console.log(`[Deduplication] Merging duplicate found: "${existing.name}" (${existing.source}) and "${hotel.name}" (${sourceName})`);
      
      // Merge properties: keep reviews, images, details from Google Maps if available.
      // Prioritize pricing from MakeMyTrip, OYO, or Hostelworld.
      existing.nightlyPrice = hotel.nightlyPrice || existing.nightlyPrice;
      existing.priceRange = hotel.priceRange || existing.priceRange;
      if (hotel.roomTypes && hotel.roomTypes.length > 0) {
        existing.roomTypes = hotel.roomTypes;
      }
      if (hotel.cancellationPolicy) {
        existing.cancellationPolicy = hotel.cancellationPolicy;
      }
      
      // Concat amenities
      existing.amenities = Array.from(new Set([...existing.amenities, ...hotel.amenities]));
      
      // Track sources
      existing.source = `${existing.source} + ${sourceName}`;
    } else {
      mergedMap.set(norm, { ...hotel, source: sourceName });
    }
  };

  // Process inputs in order of data richness (Google Maps first, then pricing engines)
  gmaps.forEach(h => addOrMerge(h, 'Google Maps'));
  mmt.forEach(h => addOrMerge(h, 'MakeMyTrip'));
  oyo.forEach(h => addOrMerge(h, 'OYO Hotels'));
  hw.forEach(h => addOrMerge(h, 'Hostelworld'));

  return Array.from(mergedMap.values());
}

router.post('/search-hotels', async (req, res, next) => {
  const { 
    location, 
    checkIn, 
    checkOut, 
    guests = 1,
    budgetMin = 1000, 
    budgetMax = 50000, 
    amenities = [] 
  } = req.body;

  if (!location) {
    return res.status(400).json({ success: false, error: 'Location query is required.' });
  }

  console.log(`[API /search-hotels] Received request for "${location}"`);

  // 1. Enforce 2-second rate-limiting delay between scraping operations
  console.log('[API /search-hotels] Applying scraper rate-limit delay...');
  await delay(2000);

  // Keep track of active browsers for this request to close them in case of crash
  let activeRequestBrowsers = 0;

  try {
    // 2. Track browser starts to maintain concurrency limit (< 5)
    // We register browsers. Since they run concurrently, we register up to 4 browser instances.
    registerBrowserStart(); activeRequestBrowsers++;
    registerBrowserStart(); activeRequestBrowsers++;
    registerBrowserStart(); activeRequestBrowsers++;
    registerBrowserStart(); activeRequestBrowsers++;

    // 3. Execute all scrapers in parallel
    console.log('[API /search-hotels] Triggering parallel scrapers...');
    const results = await Promise.allSettled([
      scrapeGoogleMaps(location),
      scrapeMakeMyTrip(location, checkIn, checkOut),
      scrapeOYO(location),
      scrapeHostelworld(location)
    ]);

    // Cleanup active browser count registry
    for (let i = 0; i < activeRequestBrowsers; i++) {
      registerBrowserEnd();
    }
    activeRequestBrowsers = 0;

    // Extract results or fallback to empty arrays on failure
    const gmapsResults = results[0].status === 'fulfilled' ? results[0].value : [];
    const mmtResults = results[1].status === 'fulfilled' ? results[1].value : [];
    const oyoResults = results[2].status === 'fulfilled' ? results[2].value : [];
    const hwResults = results[3].status === 'fulfilled' ? results[3].value : [];

    if (results[0].status === 'rejected') console.error('[API] Google Maps scraper failed:', results[0].reason);
    if (results[1].status === 'rejected') console.error('[API] MakeMyTrip scraper failed:', results[1].reason);
    if (results[2].status === 'rejected') console.error('[API] OYO scraper failed:', results[2].reason);
    if (results[3].status === 'rejected') console.error('[API] Hostelworld scraper failed:', results[3].reason);

    // 4. Merge and deduplicate
    console.log('[API] Merging and deduplicating results...');
    let combinedHotels = mergeScrapedResults(gmapsResults, mmtResults, oyoResults, hwResults);

    // 5. In-memory Filtering
    console.log('[API] Filtering results in-memory...');
    
    // Filter by budget
    combinedHotels = combinedHotels.filter(hotel => {
      const price = hotel.nightlyPrice;
      return price >= budgetMin && price <= budgetMax;
    });

    // Filter by amenities
    if (amenities && amenities.length > 0) {
      combinedHotels = combinedHotels.filter(hotel => {
        const hotelAmenitiesLower = hotel.amenities.map(a => a.toLowerCase());
        return amenities.every(amenity => 
          hotelAmenitiesLower.some(ha => ha.includes(amenity.toLowerCase()))
        );
      });
    }

    // 6. Return response
    res.json({
      success: true,
      count: combinedHotels.length,
      hotels: combinedHotels
    });

    // 7. CLEAR ALL MEMORY
    console.log('[API /search-hotels] Search completed. Cleaning up memory and dereferencing objects...');
    combinedHotels = null;
    req.body = null;

    // Explicitly run garbage collection if enabled (node --expose-gc)
    if (global.gc) {
      global.gc();
      console.log('[API /search-hotels] Garbage collection successfully invoked.');
    }

  } catch (error) {
    // Safety cleanup in case of unhandled error
    for (let i = 0; i < activeRequestBrowsers; i++) {
      registerBrowserEnd();
    }
    next(error);
  }
});

export default router;
