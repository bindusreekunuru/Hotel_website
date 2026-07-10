import { scrapeGoogleMaps } from './services/scrapers/googleMaps.js';
import { scrapeMakeMyTrip } from './services/scrapers/makeMyTrip.js';
import { scrapeOYO } from './services/scrapers/oyo.js';
import { scrapeHostelworld } from './services/scrapers/hostelworld.js';
import { geocodeCity } from './services/mockGenerator.js';

async function runVerification() {
  console.log('=== HOTEL PLATFORM BACKEND VERIFICATION ===\n');

  try {
    const testLocation = 'Goa';
    console.log(`Step 1: Geocoding location: "${testLocation}"`);
    const geo = await geocodeCity(testLocation);
    console.log(`Resolved: (${geo.lat}, ${geo.lon}) -> ${geo.displayName}\n`);

    console.log(`Step 2: Testing Google Maps Scraper fallback/live for "${testLocation}"`);
    const gmaps = await scrapeGoogleMaps(testLocation);
    console.log(`Successfully fetched ${gmaps.length} hotels.`);
    console.log(`Sample Hotel: "${gmaps[0]?.name}" at (${gmaps[0]?.latitude}, ${gmaps[0]?.longitude})`);
    console.log(`Images Count: ${gmaps[0]?.images?.length}`);
    console.log(`Amenities Count: ${gmaps[0]?.amenities?.length}`);
    console.log(`Reviews Count: ${gmaps[0]?.reviews?.length}\n`);

    console.log(`Step 3: Testing MakeMyTrip Scraper for "${testLocation}"`);
    const mmt = await scrapeMakeMyTrip(testLocation, '2026-07-15', '2026-07-20');
    console.log(`Successfully fetched ${mmt.length} hotels.`);
    console.log(`Sample Price: ₹${mmt[0]?.nightlyPrice}/night from ${mmt[0]?.source}\n`);

    console.log(`Step 4: Testing OYO Hotels Scraper for "${testLocation}"`);
    const oyo = await scrapeOYO(testLocation);
    console.log(`Successfully fetched ${oyo.length} hotels.\n`);

    console.log(`Step 5: Testing Hostelworld Scraper for "${testLocation}"`);
    const hw = await scrapeHostelworld(testLocation);
    console.log(`Successfully fetched ${hw.length} hotels.\n`);

    console.log('Step 6: Schema Verification');
    const hotel = gmaps[0];
    const requiredFields = [
      'id', 'name', 'address', 'city', 'country', 'latitude', 'longitude',
      'nightlyPrice', 'rating', 'starRating', 'reviewCount', 'hygieneScore',
      'amenities', 'checkIn', 'checkOut', 'phone', 'email', 'website',
      'description', 'images', 'reviews', 'roomTypes', 'cancellationPolicy',
      'source', 'distanceFromCenter', 'lastUpdated'
    ];

    let passed = true;
    for (const field of requiredFields) {
      if (hotel[field] === undefined) {
        console.error(`[FAIL] Field "${field}" is missing in hotel schema!`);
        passed = false;
      }
    }

    if (passed) {
      console.log('[PASS] All required schema fields are present!');
      console.log('\nBackend aggregation verification COMPLETED SUCCESSFULLY.');
      process.exit(0);
    } else {
      console.error('\n[FAIL] Schema check failed.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\nVerification failed with exception:', error);
    process.exit(1);
  }
}

runVerification();
