import React, { useState, useMemo } from 'react';
import { ArrowLeft, SlidersHorizontal, Map, Grid, List, Heart, HelpCircle, Star, Sparkles } from 'lucide-react';
import HotelCard from './HotelCard';

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'rating_desc', label: 'Guest Rating' },
  { id: 'distance_asc', label: 'Distance from Center' }
];

export default function ResultsPage({ 
  hotels, 
  searchQuery, 
  wishlist, 
  onToggleWishlist, 
  onViewDetails, 
  onBackToSearch 
}) {
  const [selectedSort, setSelectedSort] = useState('relevance');
  const [filterPriceMax, setFilterPriceMax] = useState(searchQuery.budgetMax || 30000);
  const [filterStars, setFilterStars] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [showOnlyWishlist, setShowOnlyWishlist] = useState(false);
  const [hoveredHotelId, setHoveredHotelId] = useState(null);

  // Extract all unique amenities from the results
  const allAmenities = useMemo(() => {
    const amenitiesSet = new Set();
    hotels.forEach(h => {
      h.amenities?.forEach(a => amenitiesSet.add(a));
    });
    return Array.from(amenitiesSet).slice(0, 10); // Keep top 10 for filtering UI
  }, [hotels]);

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  // Perform client-side filtering and sorting in-memory
  const filteredAndSortedHotels = useMemo(() => {
    let result = [...hotels];

    // Filter by Wishlist
    if (showOnlyWishlist) {
      result = result.filter(h => wishlist.includes(h.id));
    }

    // Filter by Max Price
    result = result.filter(h => h.nightlyPrice <= filterPriceMax);

    // Filter by Stars
    if (filterStars > 0) {
      result = result.filter(h => h.starRating >= filterStars);
    }

    // Filter by selected amenities
    if (selectedAmenities.length > 0) {
      result = result.filter(h => {
        const lowerAmenities = h.amenities.map(a => a.toLowerCase());
        return selectedAmenities.every(a => 
          lowerAmenities.some(la => la.includes(a.toLowerCase()))
        );
      });
    }

    // Sort
    if (selectedSort === 'price_asc') {
      result.sort((a, b) => a.nightlyPrice - b.nightlyPrice);
    } else if (selectedSort === 'price_desc') {
      result.sort((a, b) => b.nightlyPrice - a.nightlyPrice);
    } else if (selectedSort === 'rating_desc') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (selectedSort === 'distance_asc') {
      result.sort((a, b) => a.distanceFromCenter - b.distanceFromCenter);
    }

    return result;
  }, [hotels, showOnlyWishlist, filterPriceMax, filterStars, selectedAmenities, selectedSort, wishlist]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Navigation / Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToSearch}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-805 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              Hotels in {searchQuery.location}
              <span className="text-sm font-semibold px-2 py-0.5 rounded-md bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400">
                {filteredAndSortedHotels.length} Found
              </span>
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              Dates: {searchQuery.checkIn} to {searchQuery.checkOut} • {searchQuery.guests} Guests
            </p>
          </div>
        </div>

        {/* Sort and View Options */}
        <div className="flex items-center gap-3 self-end md:self-center">
          <button
            onClick={() => setShowOnlyWishlist(prev => !prev)}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors border ${showOnlyWishlist ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/30 dark:border-rose-900/30 dark:text-rose-450' : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-805 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <Heart className={`w-4 h-4 ${showOnlyWishlist ? 'fill-current' : ''}`} />
            Wishlist ({wishlist.length})
          </button>

          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm cursor-pointer"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Left Filters, Center Cards, Right Mini Map */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side: Filter Sidebar */}
        <div className="lg:col-span-1 space-y-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-200/50 dark:border-slate-805 shadow-sm h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-base">
              <SlidersHorizontal className="w-4 h-4 text-primary-500" />
              Filter Results
            </h3>
            <button 
              onClick={() => {
                setFilterPriceMax(searchQuery.budgetMax || 30000);
                setFilterStars(0);
                setSelectedAmenities([]);
                setShowOnlyWishlist(false);
              }}
              className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
            >
              Reset All
            </button>
          </div>

          {/* Price Filter */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              <span>Max Price</span>
              <span className="text-primary-600 dark:text-primary-400 font-extrabold font-mono">
                ₹{filterPriceMax.toLocaleString('en-IN')}
              </span>
            </div>
            <input 
              type="range"
              min="1000"
              max={searchQuery.budgetMax || 50000}
              step="500"
              value={filterPriceMax}
              onChange={(e) => setFilterPriceMax(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          </div>

          {/* Star Rating Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Minimum Rating
            </label>
            <div className="flex gap-2">
              {[0, 3, 4, 5].map((stars) => (
                <button
                  key={stars}
                  onClick={() => setFilterStars(stars)}
                  className={`flex-grow py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-colors ${filterStars === stars ? 'bg-primary-50 border-primary-200 text-primary-600 dark:bg-primary-950/40 dark:border-primary-900/30 dark:text-primary-400' : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-805 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  {stars === 0 ? (
                    'Any'
                  ) : (
                    <>
                      {stars} <Star className="w-3 h-3 fill-current text-amber-400" />
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities Filter Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Amenities
            </label>
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {allAmenities.map((amenity, idx) => (
                <label 
                  key={idx}
                  className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 cursor-pointer"
                >
                  <input 
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="rounded border-slate-350 text-primary-500 focus:ring-primary-500 h-4 w-4"
                  />
                  <span>{amenity}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Center / Right Section: Hotel Grid and Map Canvas */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Hotel list column */}
          <div className="md:col-span-2 space-y-6">
            {filteredAndSortedHotels.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-805 rounded-3xl p-12 text-center">
                <Sparkles className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                  No Hotels Match Filters
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Try adjusting your budget range slider, star selection, or amenities filters to explore other options.
                </p>
                <button
                  onClick={() => {
                    setFilterPriceMax(searchQuery.budgetMax || 30000);
                    setFilterStars(0);
                    setSelectedAmenities([]);
                    setShowOnlyWishlist(false);
                  }}
                  className="mt-6 px-5 py-2.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-colors"
                >
                  Reset Active Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredAndSortedHotels.map(hotel => (
                  <div 
                    key={hotel.id}
                    onMouseEnter={() => setHoveredHotelId(hotel.id)}
                    onMouseLeave={() => setHoveredHotelId(null)}
                  >
                    <HotelCard 
                      hotel={hotel}
                      isWishlisted={wishlist.includes(hotel.id)}
                      onToggleWishlist={onToggleWishlist}
                      onViewDetails={() => onViewDetails(hotel)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interactive SVG Map Column */}
          <div className="md:col-span-1 hidden md:block">
            <div className="sticky top-6 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-2xl p-4 overflow-hidden h-[600px] flex flex-col shadow-inner">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                <Map className="w-4 h-4 text-emerald-500" />
                Interactive Map Canvas
              </div>
              
              {/* SVG Coordinate Map */}
              <div className="relative flex-grow bg-slate-250 dark:bg-slate-900 rounded-xl border border-slate-350 dark:border-slate-800 overflow-hidden flex items-center justify-center">
                {/* SVG grid matching hotel offsets */}
                <svg className="absolute inset-0 w-full h-full text-slate-300 dark:text-slate-850" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  {/* City Center Marker */}
                  <circle cx="50%" cy="50%" r="8" className="fill-emerald-500/25 stroke-emerald-500 animate-ping" />
                  <circle cx="50%" cy="50%" r="4" className="fill-emerald-600" />
                </svg>

                {/* City Center Tag */}
                <span className="absolute top-[43%] left-[53%] text-[9px] font-black uppercase text-emerald-600 bg-white/80 dark:bg-slate-900/80 px-1.5 py-0.5 rounded border border-emerald-250/20 backdrop-blur-sm">
                  Center
                </span>

                {/* Hotel Pins based on spiral angle offsets */}
                {filteredAndSortedHotels.map((h, index) => {
                  const angle = (index * 2 * Math.PI) / hotels.length;
                  const distance = 30 + (index * 6);
                  // Translate to SVG coordinate offsets from center (150, 250 range)
                  const x = 50 + Math.sin(angle) * distance * 0.7; // percent
                  const y = 50 + Math.cos(angle) * distance * 0.7;

                  const isHovered = hoveredHotelId === h.id;

                  return (
                    <button
                      key={h.id}
                      onClick={() => onViewDetails(h)}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all duration-300 z-10"
                      style={{ left: `${x}%`, top: `${y}%` }}
                    >
                      <MapPin className={`w-6 h-6 transition-all duration-200 ${isHovered ? 'text-primary-500 scale-125 drop-shadow-md z-30' : 'text-slate-650 dark:text-slate-400 group-hover:text-primary-500 group-hover:scale-110'}`} />
                      
                      {/* Floating tooltip */}
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-7 scale-0 group-hover:scale-100 transition-transform bg-slate-900 text-white text-[9px] font-extrabold px-2 py-1 rounded shadow-lg border border-slate-700 whitespace-nowrap z-40">
                        {h.name.split(' (')[0]} - ₹{h.nightlyPrice}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 text-center uppercase tracking-wide">
                Showing locations scattered around {searchQuery.location} city center.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
