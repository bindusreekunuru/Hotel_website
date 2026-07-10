import rateLimit from 'express-rate-limit';

// Simple in-memory tracker for active Puppeteer instances
let activeBrowsersCount = 0;
const MAX_CONCURRENT_BROWSERS = 5;

/**
 * Increment the active browser count.
 * Throws an error if limit is exceeded.
 */
export function registerBrowserStart() {
  if (activeBrowsersCount >= MAX_CONCURRENT_BROWSERS) {
    throw new Error('Server is currently busy scraping. Maximum concurrent browser limit reached. Please try again in a few seconds.');
  }
  activeBrowsersCount++;
  console.log(`[Concurrency Control] Browser started. Active instances: ${activeBrowsersCount}/${MAX_CONCURRENT_BROWSERS}`);
}

/**
 * Decrement the active browser count.
 */
export function registerBrowserEnd() {
  if (activeBrowsersCount > 0) {
    activeBrowsersCount--;
  }
  console.log(`[Concurrency Control] Browser closed. Active instances: ${activeBrowsersCount}/${MAX_CONCURRENT_BROWSERS}`);
}

/**
 * Get active browser count.
 * @returns {number}
 */
export function getActiveBrowsersCount() {
  return activeBrowsersCount;
}

/**
 * Delay execution for a specified number of milliseconds.
 * Used to enforce a 2-second delay between searches.
 * @param {number} ms 
 * @returns {Promise<void>}
 */
export function delay(ms = 2000) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Standard Express rate limiting middleware.
 * Restricts client requests to prevent abuse.
 */
export const searchRateLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds window
  max: 5, // Limit each IP to 5 search requests per window
  message: {
    error: 'Too many search requests. Please wait a few seconds before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
