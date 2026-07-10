import React from 'react';
import { Heart, Star, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';

export default function HotelCard({ hotel, isWishlisted, onToggleWishlist, onViewDetails }) {
  const primaryPhoto = hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';
  
  // Format price in Indian Rupees (INR)
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 dark:border-slate-800 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
      {/* Photo Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
        <img 
          src={primaryPhoto} 
          alt={hotel.name} 
          loading="lazy"
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Wishlist Toggle Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(hotel.id);
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 backdrop-blur-sm text-slate-700 dark:text-slate-300 shadow-sm transition-colors duration-200"
          aria-label="Toggle Wishlist"
        >
          <Heart 
            className={`w-5 h-5 transition-transform duration-200 ${isWishlisted ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-600 dark:text-slate-400 hover:text-rose-500'}`} 
          />
        </button>

        {/* Source Badge */}
        <span className="absolute bottom-4 left-4 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-900/75 text-white backdrop-blur-sm shadow-sm font-mono">
          {hotel.source}
        </span>
      </div>

      {/* Hotel Details */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Rating and Distance */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="font-bold text-slate-800 dark:text-slate-200">{hotel.rating}</span>
            <span>({hotel.reviewCount} reviews)</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{hotel.distanceFromCenter} km from center</span>
          </div>
        </div>

        {/* Hotel Name */}
        <h4 className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
          {hotel.name}
        </h4>

        {/* Star Rating Icons */}
        <div className="flex items-center gap-0.5 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star 
              key={i} 
              className={`w-3.5 h-3.5 ${i < hotel.starRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} 
            />
          ))}
          <span className="ml-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">{hotel.type}</span>
        </div>

        {/* Hygiene and Amenities badges */}
        <div className="mt-3 flex flex-wrap gap-1.5 min-h-[26px]">
          {hotel.hygieneScore >= 9 && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30">
              <ShieldCheck className="w-3 h-3" />
              Hygiene {hotel.hygieneScore}
            </span>
          )}
          {hotel.amenities.slice(0, 3).map((amenity, index) => (
            <span 
              key={index}
              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50"
            >
              {amenity}
            </span>
          ))}
          {hotel.amenities.length > 3 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400">
              +{hotel.amenities.length - 3}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="mt-4 border-t border-slate-100 dark:border-slate-800/80 pt-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block tracking-wider">
              Nightly Price
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
              {formatPrice(hotel.nightlyPrice)}
            </span>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={onViewDetails}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors duration-200"
            >
              Details
            </button>
            <a 
              href={hotel.website || 'https://www.google.com/maps'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors duration-200 flex items-center gap-1.5"
            >
              Book
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
