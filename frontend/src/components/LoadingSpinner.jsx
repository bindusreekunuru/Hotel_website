import React, { useState, useEffect } from 'react';

export default function LoadingSpinner({ isSearchActive }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing scrapers...');

  useEffect(() => {
    if (!isSearchActive) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 98) {
          clearInterval(interval);
          return 98; // hold at 98% until resolved
        }
        
        // Progress speed curve
        let increment = 1;
        if (oldProgress < 20) {
          increment = 2.5;
        } else if (oldProgress < 50) {
          increment = 1.8;
        } else if (oldProgress < 85) {
          increment = 1.0;
        } else {
          increment = 0.4;
        }

        const nextProgress = parseFloat((oldProgress + increment).toFixed(1));
        
        // Update status text based on progress range
        if (nextProgress < 20) {
          setStatusText('Launching Puppeteer browser instances...');
        } else if (nextProgress < 45) {
          setStatusText('Scraping Google Maps (details, reviews, photos)...');
        } else if (nextProgress < 68) {
          setStatusText('Fetching pricing & availability from MakeMyTrip...');
        } else if (nextProgress < 82) {
          setStatusText('Analyzing budget rooms on OYO Hotels...');
        } else if (nextProgress < 92) {
          setStatusText('Searching dorm spaces on Hostelworld...');
        } else {
          setStatusText('Deduplicating entries and merging data...');
        }

        return nextProgress;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isSearchActive]);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 max-w-md mx-auto text-center">
      {/* Premium Pulsing/Spinning Loader */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Outer Pulsing Glow */}
        <div className="absolute inset-0 rounded-full bg-primary-500/20 animate-ping duration-1000"></div>
        {/* Spin Outer Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 animate-spin"></div>
        {/* Centered Percentage */}
        <span className="text-xl font-bold font-mono text-primary-600 dark:text-primary-400">
          {Math.floor(progress)}%
        </span>
      </div>

      <h3 className="mt-8 text-xl font-semibold text-slate-800 dark:text-slate-200 animate-pulse">
        Scraping Real-Time Hotel Data
      </h3>
      
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 min-h-[20px] font-medium">
        {statusText}
      </p>

      {/* Progress Bar Container */}
      <div className="mt-6 w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden shadow-inner">
        <div 
          className="bg-primary-500 h-full transition-all duration-300 ease-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="mt-4 text-xs text-slate-400 dark:text-slate-500 flex flex-col gap-1">
        <span>No database storage: extracting fresh listings on-demand.</span>
        <span>This process takes 8-12 seconds. Please do not close the window.</span>
      </div>
    </div>
  );
}
