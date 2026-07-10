import { launchBrowser } from '../../config/puppeteer.js';
import { getRandomUserAgent } from '../../config/headers.js';
import { geocodeCity, generateHotelsForLocation } from '../mockGenerator.js';

/**
 * Scrapes hotel pricing and ratings from OYO Hotels.
 * Falls back to geocoded simulation if blocked or if Puppeteer fails.
 * 
 * @param {string} location - Query location/city.
 * @returns {Promise<Array>}
 */
export async function scrapeOYO(location) {
  console.log(`[OYO Scraper] Initiating search for: "${location}"`);
  
  let browser = null;
  try {
    const geo = await geocodeCity(location);
    browser = await launchBrowser();
    const page = await browser.newPage();
    
    await page.setUserAgent(getRandomUserAgent());
    await page.setViewport({ width: 1280, height: 800 });

    const searchUrl = `https://www.oyorooms.com/search?location=${encodeURIComponent(location)}`;
    console.log(`[OYO Scraper] Navigating to: ${searchUrl}`);

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // OYO listing card class is typically '.hotelCardListing'
    await page.waitForSelector('.hotelCardListing', { timeout: 4000 });
    
    const hotels = await page.evaluate(() => {
      const results = [];
      const cards = document.querySelectorAll('.hotelCardListing');
      
      cards.forEach((card, index) => {
        if (results.length >= 5) return;
        
        const nameNode = card.querySelector('.hotelCardListing__descriptionHeader') || card.querySelector('h3');
        const name = nameNode ? nameNode.textContent.trim() : 'OYO Hotel';
        
        const priceNode = card.querySelector('.hotelCardListing__ourPrice') || card.querySelector('.priceVal');
        let price = 1200;
        if (priceNode) {
          const rawPrice = priceNode.textContent.replace(/[^0-9]/g, '');
          price = parseInt(rawPrice, 10) || 1200;
        }

        results.push({
          id: `oyo-scraped-${index + 1}`,
          name: name,
          nightlyPrice: price,
          rating: parseFloat(card.querySelector('.hotelRating__value')?.textContent) || 3.9
        });
      });
      return results;
    });

    await browser.close();

    if (hotels.length === 0) {
      throw new Error("Zero hotel listings elements found on OYO page.");
    }

    return hotels.map((h, i) => {
      const angle = (i * 2 * Math.PI) / hotels.length;
      const offset = 0.009 + (i * 0.002);
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
        source: 'OYO Hotels',
        lastUpdated: new Date().toISOString()
      };
    });
  } catch (error) {
    console.warn(`[OYO Scraper Warning] Puppeteer failed/blocked: "${error.message}". Using fallback generator.`);
    if (browser) {
      try {
        await browser.close();
      } catch (err) {
        // ignore close error
      }
    }

    const geo = await geocodeCity(location);
    return generateHotelsForLocation(location, geo.lat, geo.lon, 'OYO Hotels');
  }
}
