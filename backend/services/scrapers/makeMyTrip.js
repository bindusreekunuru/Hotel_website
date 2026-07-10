import { launchBrowser } from '../../config/puppeteer.js';
import { getRandomUserAgent } from '../../config/headers.js';
import { geocodeCity, generateHotelsForLocation } from '../mockGenerator.js';

/**
 * Scrapes hotel pricing and availability from MakeMyTrip.
 * Falls back to geocoded simulation if blocked or if Puppeteer fails.
 * 
 * @param {string} location - Query location/city.
 * @param {string} checkIn - Check-in date.
 * @param {string} checkOut - Check-out date.
 * @returns {Promise<Array>}
 */
export async function scrapeMakeMyTrip(location, checkIn, checkOut) {
  console.log(`[MakeMyTrip Scraper] Initiating search for: "${location}" (${checkIn} to ${checkOut})`);
  
  let browser = null;
  try {
    const geo = await geocodeCity(location);
    browser = await launchBrowser();
    const page = await browser.newPage();
    
    await page.setUserAgent(getRandomUserAgent());
    await page.setViewport({ width: 1280, height: 800 });

    const searchUrl = `https://www.makemytrip.com/hotels/hotel-listing/?city=${encodeURIComponent(location)}&checkin=${checkIn}&checkout=${checkOut}`;
    console.log(`[MakeMyTrip Scraper] Navigating to: ${searchUrl}`);

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Wait for listing container elements
    await page.waitForSelector('.listingCard', { timeout: 4000 });
    
    const hotels = await page.evaluate(() => {
      const results = [];
      const cards = document.querySelectorAll('.listingCard');
      
      cards.forEach((card, index) => {
        if (results.length >= 5) return;
        
        const nameNode = card.querySelector('#hlistpg_hotel_name') || card.querySelector('.hotelName');
        const name = nameNode ? nameNode.textContent.trim() : 'MMT Hotel';
        
        const priceNode = card.querySelector('#hlistpg_hotel_shown_price') || card.querySelector('.priceVal');
        let price = 3500;
        if (priceNode) {
          const rawPrice = priceNode.textContent.replace(/[^0-9]/g, '');
          price = parseInt(rawPrice, 10) || 3500;
        }

        results.push({
          id: `mmt-scraped-${index + 1}`,
          name: name,
          nightlyPrice: price,
          rating: parseFloat(card.querySelector('#hlistpg_hotel_user_rating')?.textContent) || 4.1
        });
      });
      return results;
    });

    await browser.close();

    if (hotels.length === 0) {
      throw new Error("Zero hotel listings elements found on MakeMyTrip page (blocked by Cloudflare/Akamai).");
    }

    // Enrich scraped hotels
    return hotels.map((h, i) => {
      const angle = (i * 2 * Math.PI) / hotels.length;
      const offset = 0.007 + (i * 0.003);
      const lat = geo.lat + Math.sin(angle) * offset;
      const lon = geo.lon + Math.cos(angle) * offset;

      return {
        id: h.id,
        name: h.name,
        latitude: lat,
        longitude: lon,
        nightlyPrice: h.nightlyPrice,
        rating: h.rating,
        city: location,
        country: 'India',
        source: 'MakeMyTrip',
        lastUpdated: new Date().toISOString()
      };
    });
  } catch (error) {
    console.warn(`[MakeMyTrip Scraper Warning] Puppeteer failed/blocked: "${error.message}". Using fallback generator.`);
    if (browser) {
      try {
        await browser.close();
      } catch (err) {
        // ignore close error
      }
    }

    const geo = await geocodeCity(location);
    return generateHotelsForLocation(location, geo.lat, geo.lon, 'MakeMyTrip');
  }
}
