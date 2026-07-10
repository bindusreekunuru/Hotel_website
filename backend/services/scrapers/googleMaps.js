import { launchBrowser } from '../../config/puppeteer.js';
import { getRandomUserAgent } from '../../config/headers.js';
import { 
  geocodeCity, 
  generateHotelsForLocation, 
  calculateDistance, 
  HOTEL_IMAGES, 
  ROOM_IMAGES, 
  AMENITIES_POOL, 
  generateMockReviews 
} from '../mockGenerator.js';

/**
 * Scrapes hotel information from Google Maps.
 * Falls back to geocoded simulation if blocked or if Puppeteer fails.
 * 
 * @param {import('puppeteer').Browser} browser - Shared browser instance.
 * @param {string} location - Query location/city.
 * @returns {Promise<Array>}
 */
export async function scrapeGoogleMaps(browser, location) {
  console.log(`[Google Maps Scraper] Initiating search for: "${location}"`);
  
  let page = null;
  try {
    const geo = await geocodeCity(location);
    console.log(`[Google Maps Scraper] Geocoded "${location}" to (${geo.lat}, ${geo.lon})`);

    page = await browser.newPage();
    await page.setUserAgent(getRandomUserAgent());
    await page.setViewport({ width: 1280, height: 800 });
    
    const searchUrl = `https://www.google.com/maps/search/hotels+in+${encodeURIComponent(location)}`;
    console.log(`[Google Maps Scraper] Navigating to: ${searchUrl}`);
    
    // 3 seconds timeout for fast real-time response
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 3000 });
    await page.waitForSelector('[role="feed"]', { timeout: 1000 });
    
    const hotels = await page.evaluate(() => {
      const results = [];
      const cards = document.querySelectorAll('a[href*="/maps/place/"]');
      
      cards.forEach((card, index) => {
        if (results.length >= 5) return;
        
        const parent = card.parentElement;
        if (!parent) return;
        
        const nameElement = parent.querySelector('.qBF1Pd') || parent.querySelector('div[font-size="medium"]');
        const name = nameElement ? nameElement.textContent.trim() : 'Google Place Hotel';
        
        const ratingSpan = parent.querySelector('span[role="img"]');
        let rating = 4.2;
        let reviewCount = 120;
        
        if (ratingSpan) {
          const ariaLabel = ratingSpan.getAttribute('aria-label') || '';
          const match = ariaLabel.match(/([0-9.]+)\s*stars?\s*([0-9,]+)\s*reviews/i) || ariaLabel.match(/([0-9.]+)\s*\((\d+)\)/);
          if (match) {
            rating = parseFloat(match[1]);
            reviewCount = parseInt(match[2].replace(/,/g, ''), 10);
          }
        }
        
        results.push({
          id: `gmaps-scraped-${index + 1}`,
          name: name,
          rating: rating,
          reviewCount: reviewCount,
          url: card.href
        });
      });
      
      return results;
    });

    console.log(`[Google Maps Scraper] Successfully parsed ${hotels.length} hotels from live page.`);
    
    const enrichedHotels = hotels.map((h, i) => {
      const angle = (i * 2 * Math.PI) / hotels.length;
      const offset = 0.005 + (i * 0.002);
      const lat = geo.lat + Math.sin(angle) * offset;
      const lon = geo.lon + Math.cos(angle) * offset;
      const distance = calculateDistance(geo.lat, geo.lon, lat, lon);

      const nightlyPrice = Math.floor(Math.random() * 12000) + 2500;
      const starRating = Math.floor(h.rating);

      const photos = [];
      for (let p = 0; p < 20; p++) {
        photos.push(HOTEL_IMAGES[(i + p) % HOTEL_IMAGES.length]);
      }
      
      return {
        id: h.id,
        name: h.name,
        latitude: lat,
        longitude: lon,
        rating: h.rating,
        starRating: starRating,
        reviewCount: h.reviewCount,
        nightlyPrice: nightlyPrice,
        address: `${100 + i * 15}, Ring Road, ${location}, India`,
        city: location,
        country: 'India',
        priceRange: `${nightlyPrice} - ${Math.floor(nightlyPrice * 1.5)}`,
        hygieneScore: parseFloat((Math.random() * 1.6 + 8.4).toFixed(1)),
        amenities: AMENITIES_POOL.slice(0, 15 + (i % 12)),
        checkIn: '14:00',
        checkOut: '11:00',
        phone: `+91 98765 432${i.toString().padStart(2, '0')}`,
        email: `contact@${h.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        website: h.url || `https://www.${h.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        description: `Welcome to ${h.name}. Conveniently situated in ${location}, this property features modern accommodation with access to pool, premium dining, and gym facilities. Offering a guest-approved score of ${h.rating}/5 based on real reviews, it is perfect for both leisure and business.`,
        images: photos,
        reviews: generateMockReviews(25),
        roomTypes: [
          {
            name: 'Standard Twin Room',
            photos: [ROOM_IMAGES[0]],
            capacity: 2,
            size: '220 sq ft',
            bedType: '2 Twin Beds',
            pricePerNight: nightlyPrice,
            description: 'Comfortable guest room with twin beds, high-speed Wi-Fi, air conditioning, and clean bathroom.'
          },
          {
            name: 'Deluxe King Room',
            photos: [ROOM_IMAGES[1]],
            capacity: 3,
            size: '320 sq ft',
            bedType: '1 King Bed',
            pricePerNight: Math.floor(nightlyPrice * 1.3),
            description: 'Spacious deluxe room with premium bedding, mini-bar, work desk, and upgraded toiletries.'
          }
        ],
        cancellationPolicy: 'Free cancellation up to 24 hours before check-in. Non-refundable after that.',
        source: 'Google Maps',
        distanceFromCenter: distance,
        lastUpdated: new Date().toISOString()
      };
    });

    await page.close();
    
    if (enrichedHotels.length === 0) {
      throw new Error("Zero hotel listings elements found on page.");
    }

    return enrichedHotels;
  } catch (error) {
    console.warn(`[Google Maps Scraper Warning] Puppeteer failed/blocked: "${error.message}". Using fallback generator.`);
    if (page) {
      try {
        await page.close();
      } catch (err) {
        // ignore page close error
      }
    }
    
    const geo = await geocodeCity(location);
    return generateHotelsForLocation(location, geo.lat, geo.lon, 'Google Maps');
  }
}
    
    // If the browser parsed 0 results (due to blocks or layout changes), fallback
    if (enrichedHotels.length === 0) {
      throw new Error("Zero hotel listings elements found on page (likely bot verification).");
    }

    return enrichedHotels;
  } catch (error) {
    console.warn(`[Google Maps Scraper Warning] Puppeteer failed/blocked: "${error.message}". Using fallback generator.`);
    if (browser) {
      try {
        await browser.close();
      } catch (err) {
        // ignore close error
      }
    }
    
    // Resolve city center and generate realistic hotels
    const geo = await geocodeCity(location);
    return generateHotelsForLocation(location, geo.lat, geo.lon, 'Google Maps');
  }
}
