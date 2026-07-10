import { registerBrowserEnd } from './rateLimit.js';

/**
 * Handle scraping-specific errors.
 * Ensures the concurrency counter is cleaned up and browser is registered as closed.
 * 
 * @param {Error} error 
 * @param {string} scraperName 
 */
export function handleScraperError(error, scraperName) {
  console.error(`[Error Handler] Exception in ${scraperName} scraper:`, error.message);
  // Decrement the active browser count since this browser crashed/failed
  registerBrowserEnd();
}

/**
 * Express error handling middleware.
 */
export function globalErrorHandler(err, req, res, next) {
  console.error('[Global Error Handler] Caught exception:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred during processing.';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    hotels: [] // Return empty hotels list so frontend doesn't crash
  });
}
