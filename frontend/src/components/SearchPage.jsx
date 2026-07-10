import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Calendar, Users, Sliders, CheckSquare } from 'lucide-react';
import axios from 'axios';

const AMENITY_OPTIONS = [
  { id: 'wifi', label: 'High-speed Wi-Fi' },
  { id: 'ac', label: 'Air conditioning' },
  { id: 'pool', label: 'Swimming pool' },
  { id: 'parking', label: 'Valet parking / Free Parking' },
  { id: 'restaurant', label: 'In-house restaurant' }
];

export default function SearchPage({ onSearch }) {
  const [location, setLocation] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [isSearchingPredictions, setIsSearchingPredictions] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  
  // Date setups: default check-in is tomorrow, check-out is day after tomorrow
  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const getDayAfterTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  };

  const [checkIn, setCheckIn] = useState(getTomorrowString());
  const [checkOut, setCheckOut] = useState(getDayAfterTomorrowString());
  const [guests, setGuests] = useState(2);
  const [budgetMax, setBudgetMax] = useState(30000);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const autocompleteRef = useRef(null);

  // Close predictions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowPredictions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Nominatim city suggestions as user types
  useEffect(() => {
    if (location.trim().length < 3) {
      setPredictions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPredictions(true);
      try {
        const res = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            q: location,
            format: 'json',
            addressdetails: 1,
            limit: 5,
            featuretype: 'settlement'
          },
          headers: {
            'User-Agent': 'HotelSearchApp/1.0'
          }
        });
        
        const suggestions = res.data.map(item => {
          const address = item.address || {};
          const city = address.city || address.town || address.village || address.state || '';
          const country = address.country || '';
          const display = city ? `${city}, ${country}` : item.display_name;
          return {
            displayName: display,
            cityOnly: city || item.name
          };
        });
        
        // Filter unique names
        const unique = suggestions.filter((v, i, a) => a.findIndex(t => t.displayName === v.displayName) === i);
        setPredictions(unique);
        setShowPredictions(true);
      } catch (err) {
        console.error('Failed to fetch predictions:', err);
      } finally {
        setIsSearchingPredictions(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [location]);

  const handleAmenityToggle = (id) => {
    setSelectedAmenities(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!location) return;

    onSearch({
      location: location,
      checkIn: checkIn,
      checkOut: checkOut,
      guests: parseInt(guests, 10),
      budgetMin: 1000,
      budgetMax: parseInt(budgetMax, 10),
      amenities: selectedAmenities.map(id => {
        const matched = AMENITY_OPTIONS.find(o => o.id === id);
        return matched ? matched.label : id;
      })
    });
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center bg-gradient-to-br from-primary-50 via-slate-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-12 md:py-24">
      {/* Background patterns */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary-300/10 dark:bg-primary-500/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-emerald-300/10 dark:bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative w-full max-w-4xl">
        {/* Hero title */}
        <div className="text-center mb-10 md:mb-14">
          <span className="px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-primary-600 bg-primary-100 dark:bg-primary-950/40 dark:text-primary-400 rounded-full border border-primary-200/40 dark:border-primary-900/20">
            Next-Gen Aggregation
          </span>
          <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
            Find the Best Hotels, <br />
            <span className="bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent dark:from-primary-400 dark:to-emerald-400">
              Scraped Real-Time.
            </span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto font-medium">
            Aggregating Google Maps, MakeMyTrip, OYO, and Hostelworld in-memory. Zero database logs. Pure real-time comparison.
          </p>
        </div>

        {/* Search Panel Card */}
        <form 
          onSubmit={handleSubmit}
          className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/80 shadow-2xl rounded-3xl p-6 md:p-8"
        >
          {/* Main search fields grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Location input with geocoding autocomplete */}
            <div className="md:col-span-2 relative" ref={autocompleteRef}>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Destination
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input 
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where are you going? (e.g. Goa, Delhi)"
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-slate-100 font-medium placeholder-slate-400 text-sm shadow-sm"
                  required
                />
              </div>

              {/* Suggestions Dropdown */}
              {showPredictions && predictions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
                  {predictions.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setLocation(p.cityOnly);
                        setShowPredictions(false);
                      }}
                      className="w-full text-left px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-3 transition-colors duration-150 border-b border-slate-100 dark:border-slate-900 last:border-0"
                    >
                      <MapPin className="h-4 w-4 text-primary-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {p.displayName}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Check-In Date */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Check-In
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input 
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-slate-100 font-medium text-sm shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Check-Out Date */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Check-Out
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input 
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-slate-100 font-medium text-sm shadow-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Secondary Filters Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-200/50 dark:border-slate-800/80 pt-6">
            {/* Guest Count */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                Guests
              </label>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-inner">
                <button
                  type="button"
                  onClick={() => setGuests(prev => Math.max(1, prev - 1))}
                  className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 shadow-sm"
                >
                  -
                </button>
                <span className="flex-grow text-center text-sm font-bold text-slate-800 dark:text-slate-200">
                  {guests} {guests === 1 ? 'Guest' : 'Guests'}
                </span>
                <button
                  type="button"
                  onClick={() => setGuests(prev => Math.min(10, prev + 1))}
                  className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 shadow-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Budget Range */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-slate-400" />
                  Max Budget
                </label>
                <span className="text-sm font-extrabold text-primary-600 dark:text-primary-400">
                  ₹{budgetMax.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="2000"
                max="50000"
                step="1000"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2.5">
                <span>₹2,000</span>
                <span>₹25,000</span>
                <span>₹50,000</span>
              </div>
            </div>

            {/* Amenities filters */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-slate-400" />
                Amenities
              </label>
              <div className="flex flex-col gap-2 max-h-[110px] overflow-y-auto pr-1">
                {AMENITY_OPTIONS.map((option) => (
                  <label 
                    key={option.id}
                    className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-250 cursor-pointer transition-colors duration-150"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(option.id)}
                      onChange={() => handleAmenityToggle(option.id)}
                      className="rounded border-slate-300 dark:border-slate-800 text-primary-500 focus:ring-primary-500 h-4 w-4 cursor-pointer"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Trigger button */}
          <button
            type="submit"
            className="w-full mt-8 bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-700 hover:to-emerald-700 text-white font-extrabold text-base py-4 px-6 rounded-2xl shadow-lg shadow-primary-500/20 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-[1.01]"
          >
            <Search className="h-5 w-5" />
            Search & Aggregate Real-Time
          </button>
        </form>
      </div>
    </div>
  );
}
