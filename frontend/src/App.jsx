import React, { useState, useEffect } from 'react';
import { Moon, Sun, Heart, Sparkles, Building2 } from 'lucide-react';
import axios from 'axios';
import SearchPage from './components/SearchPage';
import ResultsPage from './components/ResultsPage';
import DetailPage from './components/DetailPage';
import LoadingSpinner from './components/LoadingSpinner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function App() {
  const [page, setPage] = useState('search'); // 'search' | 'results' | 'detail'
  const [searchQuery, setSearchQuery] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  
  // Local persistence setups
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('vesta_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('vesta_dark_mode');
    return saved === 'true';
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync Wishlist to local storage
  useEffect(() => {
    localStorage.setItem('vesta_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Sync Dark Mode class to document body
  useEffect(() => {
    localStorage.setItem('vesta_dark_mode', darkMode);
    const bodyClass = document.body.classList;
    if (darkMode) {
      bodyClass.add('dark');
      document.documentElement.classList.add('dark');
    } else {
      bodyClass.remove('dark');
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleToggleWishlist = (hotelId) => {
    setWishlist(prev => 
      prev.includes(hotelId) ? prev.filter(id => id !== hotelId) : [...prev, hotelId]
    );
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setLoading(true);
    setError(null);

    try {
      console.log(`[API Search] Calling endpoint ${API_BASE_URL}/search-hotels with query:`, query);
      const response = await axios.post(`${API_BASE_URL}/search-hotels`, {
        location: query.location,
        checkIn: query.checkIn,
        checkOut: query.checkOut,
        guests: query.guests,
        budgetMin: query.budgetMin,
        budgetMax: query.budgetMax,
        amenities: query.amenities
      });

      if (response.data && response.data.success) {
        setHotels(response.data.hotels || []);
        setPage('results');
      } else {
        throw new Error(response.data?.error || 'Scraping failed to resolve listings.');
      }
    } catch (err) {
      console.error('[API Search Error]', err);
      setError(err.response?.data?.error || err.message || 'Scraper failed to scrape target sites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-805 transition-colors">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => {
              setPage('search');
              setError(null);
            }} 
            className="flex items-center gap-2 group"
          >
            <div className="p-2 bg-gradient-to-tr from-primary-600 to-emerald-600 rounded-xl shadow-md text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-lg font-black bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent dark:from-primary-400 dark:to-emerald-450 tracking-tight">
              VESTA COMPASS
            </span>
          </button>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Wishlist count link */}
            {wishlist.length > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2.5 py-1.5 rounded-xl border border-slate-200/40">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                Wishlist: {wishlist.length}
              </span>
            )}

            {/* Dark Mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-805 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-350"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        {loading ? (
          <div className="min-h-[75vh] flex items-center justify-center">
            <LoadingSpinner isSearchActive={loading} />
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto my-16 px-4">
            <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/30 p-8 rounded-3xl text-center shadow-lg">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto text-xl font-bold">
                !
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                Scraping Failed
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {error}
              </p>
              
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => handleSearch(searchQuery)}
                  className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors"
                >
                  Retry Scraping
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    setPage('search');
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors"
                >
                  Return to Search
                </button>
              </div>
            </div>
          </div>
        ) : page === 'search' ? (
          <SearchPage onSearch={handleSearch} />
        ) : page === 'results' ? (
          <ResultsPage 
            hotels={hotels}
            searchQuery={searchQuery}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onViewDetails={(hotel) => {
              setSelectedHotel(hotel);
              setPage('detail');
            }}
            onBackToSearch={() => setPage('search')}
          />
        ) : page === 'detail' ? (
          <DetailPage 
            hotel={selectedHotel}
            searchQuery={searchQuery}
            isWishlisted={wishlist.includes(selectedHotel.id)}
            onToggleWishlist={handleToggleWishlist}
            onBackToResults={() => setPage('results')}
          />
        ) : null}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-805 py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-bold transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 uppercase tracking-wider font-mono">
            <Sparkles className="w-4.5 h-4.5 text-primary-500" />
            <span>Pure Real-Time comparative engine</span>
          </div>
          <div>
            <span>© 2026 Vesta Compass. Headless Puppeteer extraction. No database log storage.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
