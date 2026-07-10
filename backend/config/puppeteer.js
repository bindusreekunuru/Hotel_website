import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Launch a new Puppeteer browser instance with performance-tuned arguments.
 * @returns {Promise<import('puppeteer').Browser>}
 */
export async function launchBrowser() {
  const args = process.env.HEADLESS_CHROME_ARGS 
    ? process.env.HEADLESS_CHROME_ARGS.split(',') 
    : [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1280,800'
      ];

  try {
    const browser = await puppeteer.launch({
      headless: 'shell', // or true, 'shell' is faster in newer Puppeteer versions
      args: args,
      defaultViewport: {
        width: 1280,
        height: 800
      }
    });
    return browser;
  } catch (error) {
    console.error('Failed to launch Puppeteer browser:', error);
    throw error;
  }
}
