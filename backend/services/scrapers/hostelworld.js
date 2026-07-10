import { launchBrowser } from '../../config/puppeteer.js';
import { getRandomUserAgent } from '../../config/headers.js';
import { geocodeCity, generateHotelsForLocation } from '../mockGenerator.js';

/**
 * Scrapes hostel information and dorm pricing from Hostelworld.
 * Falls back to geocoded simulation if blocked or if Puppeteer fails.
 * 
 * @param {string} location - Query location/city.
 * @returns {Promise<Array>}
 */
export async function scrapeHostelworld(location) {
  console.log(`[Hostelworld Scraper] Initiating search for: "${location}"`);
  
  let browser = null;
  try {
    const geo = await geocodeCity(location);
    browser = await launchBrowser();
    const page = await browser.newPage();
    
    await page.setUserAgent(getRandomUserAgent());
    await page.setViewport({ width: 1280, height: 800 });

    const searchUrl = `https://www.hostelworld.com/findabed.php/ChosenCity.${encodeURIComponent(location)}`;
    console.log(`[Hostelworld Scraper] Navigating to: ${searchUrl}`);

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Hostelworld listing card class is typically '.property-card' or '.property'
    await page.waitForSelector('.property-card', { timeout: 4000 });
    
    const hostels = await page.evaluate(() => {
      const results = [];
      const cards = document.querySelectorAll('.property-card');
      
      cards.forEach((card, index) => {
        if (results.length >= 5) return;
        
        const nameNode = card.querySelector('.title') || card.querySelector('h2');
        const name = nameNode ? nameNode.textContent.trim() : 'Hostelworld Hostel';
        
        const priceNode = card.querySelector('.price') || card.querySelector('.current-price');
        let price = 800; // Hostel dorms are cheaper
        if (priceNode) {
          const rawPrice = priceNode.textContent.replace(/[^0-9]/g, '');
          price = parseInt(rawPrice, 10) || 800;
        }

        results.push({
          id: `hostelworld-scraped-${index + 1}`,
          name: name,
          nightlyPrice: price,
          rating: parseFloat(card.querySelector('.score')?.textContent) || 4.2
        });
      });
      return results;
    });

    await browser.close();

    if (hostels.length === 0) {
      throw new Error("Zero hostel listings elements found on Hostelworld page.");
    }

    return hostels.map((h, i) => {
      const angle = (i * 2 * Math.PI) / hostels.length;
      const offset = 0.01 + (i * 0.002);
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
        source: 'Hostelworld',
        lastUpdated: new Date().toISOString()
      };
    });
  } catch (error) {
    console.warn(`[Hostelworld Scraper Warning] Puppeteer failed/blocked: "${error.message}". Using fallback generator.`);
    if (browser) {
      try {
        await browser.close();
      } catch (err) {
        // ignore close error
      }
    }

    const geo = await geocodeCity(location);
    return generateHotelsForLocation(location, geo.lat, geo.lon, 'Hostelworld');
  }
}
