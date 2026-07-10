import React, { useState } from 'react';
import { ArrowLeft, Star, MapPin, Phone, Globe, Calendar, CheckCircle2, ShieldAlert, Heart, RefreshCw, Send } from 'lucide-react';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', rate: 1 },
  { code: 'USD', symbol: '$', rate: 0.012 },
  { code: 'EUR', symbol: '€', rate: 0.011 },
  { code: 'GBP', symbol: '£', rate: 0.0093 }
];

export default function DetailPage({ 
  hotel, 
  searchQuery, 
  isWishlisted, 
  onToggleWishlist, 
  onBackToResults 
}) {
  const [activePhoto, setActivePhoto] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [reviewFilter, setReviewFilter] = useState('all');
  
  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  // Compute stay duration
  const getStayDuration = () => {
    const start = new Date(searchQuery.checkIn);
    const end = new Date(searchQuery.checkOut);
    const diff = end.getTime() - start.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  };

  const nights = getStayDuration();

  // Price conversion helper
  const convertPrice = (inrPrice) => {
    const amount = inrPrice * selectedCurrency.rate;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: selectedCurrency.code,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Filter reviews
  const filteredReviews = hotel.reviews.filter(rev => {
    if (reviewFilter === 'all') return true;
    return rev.rating === parseInt(reviewFilter, 10);
  });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      alert('Your message was successfully compiled in-memory and simulated as sent to the hotel desk!');
    }, 1500);
  };

  // Generate nearby attractions dynamically for coordinate mapping
  const nearbyAttractions = [
    { name: 'City Center Transit Junction', type: 'Transport', distance: '12 mins walk (0.8 km)' },
    { name: 'Traditional Spice Bistro', type: 'Restaurant', distance: '5 mins walk (0.3 km)' },
    { name: 'Royal Heritage Gardens', type: 'Park', distance: '15 mins walk (1.1 km)' },
    { name: 'Grand Emporium Mall', type: 'Shopping', distance: '8 mins walk (0.6 km)' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back button & Action Row */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBackToResults}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </button>

        <div className="flex items-center gap-3">
          {/* Currency selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-805 px-3 py-1.5 rounded-xl">
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCurrency.code}
              onChange={(e) => {
                const currency = CURRENCIES.find(c => c.code === e.target.value);
                setSelectedCurrency(currency);
              }}
              className="bg-transparent border-0 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-0 cursor-pointer"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
              ))}
            </select>
          </div>

          {/* Wishlist toggle */}
          <button 
            onClick={() => onToggleWishlist(hotel.id)}
            className={`p-2 rounded-xl border transition-all ${isWishlisted ? 'bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/20 dark:border-rose-900/35' : 'bg-white border-slate-200 text-slate-500 hover:text-rose-500 dark:bg-slate-900 dark:border-slate-805 dark:text-slate-400'}`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Hotel Title & Basic Stats */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded bg-primary-100 text-primary-700 dark:bg-primary-950/40 dark:text-primary-400">
            {hotel.type}
          </span>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">
            Source: {hotel.source}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mt-2">
          {hotel.name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-extrabold text-slate-800 dark:text-slate-100">{hotel.rating}</span>
            <span>({hotel.reviewCount} guest reviews)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>{hotel.address}</span>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Main Photo */}
        <div className="md:col-span-2 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm bg-slate-200 dark:bg-slate-800">
          <img 
            src={hotel.images[activePhoto]} 
            alt={hotel.name} 
            className="object-cover w-full h-full cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => setShowLightbox(true)}
          />
          <span className="absolute bottom-4 right-4 px-3 py-1.5 text-xs font-bold bg-slate-900/80 text-white rounded-lg backdrop-blur-sm shadow-sm select-none">
            {activePhoto + 1} / {hotel.images.length} Photos
          </span>
        </div>

        {/* Thumbnail Columns */}
        <div className="md:col-span-2 grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1">
          {hotel.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActivePhoto(idx)}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${activePhoto === idx ? 'border-primary-500 scale-[0.97]' : 'border-transparent hover:opacity-90'}`}
            >
              <img src={img} alt="thumbnail" className="object-cover w-full h-full" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Info Blocks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Details, Room Types, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-805 p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-3">
              About the Property
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              {hotel.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-slate-100 dark:border-slate-800/80 pt-6 text-xs font-bold text-slate-500 dark:text-slate-400">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Check-In</span>
                <span className="text-slate-850 dark:text-slate-200 text-sm font-black">{hotel.checkIn}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Check-Out</span>
                <span className="text-slate-850 dark:text-slate-200 text-sm font-black">{hotel.checkOut}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Phone</span>
                <span className="text-slate-850 dark:text-slate-200 text-sm font-black">{hotel.phone}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Cleanliness</span>
                <span className="text-emerald-600 text-sm font-black">{hotel.hygieneScore} / 10</span>
              </div>
            </div>
          </div>

          {/* Room Categories */}
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">
              Available Room Categories
            </h3>
            <div className="space-y-4">
              {hotel.roomTypes.map((room, idx) => (
                <div 
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-2xl overflow-hidden p-4 md:p-5 flex flex-col md:flex-row gap-5 shadow-sm"
                >
                  <div className="w-full md:w-1/3 aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex-shrink-0">
                    <img src={room.photos[0]} alt={room.name} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{room.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {room.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">
                        <span>Capacity: {room.capacity} Guests</span>
                        <span>Size: {room.size}</span>
                        <span>Beds: {room.bedType}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Price / Night</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          {convertPrice(room.pricePerNight)}
                        </span>
                      </div>
                      
                      <a 
                        href={hotel.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-colors"
                      >
                        Reserve Room
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities Categorized */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-805 p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">
              Hotel Amenities
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
              {hotel.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-sm text-slate-650 dark:text-slate-350">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span className="font-semibold">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guest Reviews Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Guest Reviews ({filteredReviews.length})
              </h3>
              <select
                value={reviewFilter}
                onChange={(e) => setReviewFilter(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-xl text-xs font-bold text-slate-650 dark:text-slate-300"
              >
                <option value="all">All Reviews</option>
                <option value="5">5 Stars only</option>
                <option value="4">4 Stars only</option>
                <option value="3">3 Stars only</option>
              </select>
            </div>

            {/* Reviews list */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {filteredReviews.map((rev) => (
                <div 
                  key={rev.id} 
                  className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-805 p-4 rounded-xl shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={rev.reviewerAvatar} alt={rev.reviewerName} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">{rev.reviewerName}</h5>
                        <span className="text-[10px] text-slate-400 font-semibold">{rev.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                    {rev.text}
                  </p>
                  {rev.photos && rev.photos.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {rev.photos.map((photo, pIdx) => (
                        <div key={pIdx} className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200">
                          <img src={photo} alt="reviewer upload" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Sticky Booking Card & Map */}
        <div className="lg:col-span-1 space-y-6">
          {/* Booking Card */}
          <div className="sticky top-6 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-805 rounded-3xl p-6 shadow-md space-y-5">
            <div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rate / Night</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {convertPrice(hotel.nightlyPrice)}
                </span>
              </div>
            </div>

            {/* Pricing details breakdown */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Room Charges ({nights} {nights === 1 ? 'Night' : 'Nights'})</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">
                  {convertPrice(hotel.nightlyPrice * nights)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Taxes & Fees (12%)</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">
                  {convertPrice(hotel.nightlyPrice * nights * 0.12)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3.5 text-sm font-extrabold text-slate-800 dark:text-white">
                <span>Est. Total Due</span>
                <span className="text-primary-600 dark:text-primary-400 font-black">
                  {convertPrice(hotel.nightlyPrice * nights * 1.12)}
                </span>
              </div>
            </div>

            {/* Book link */}
            <a 
              href={hotel.website}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 text-center text-sm font-extrabold rounded-2xl bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              Complete Reservation
            </a>

            {/* Policies */}
            <div className="border-t border-slate-100 dark:border-slate-805 pt-4 space-y-3 text-[10px] text-slate-450 dark:text-slate-500 leading-normal">
              <div className="flex gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>{hotel.cancellationPolicy}</span>
              </div>
              <div className="flex gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span>No db storage: booking links route directly to booking portal.</span>
              </div>
            </div>
          </div>

          {/* Map Location Embed */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-805 p-4 rounded-2xl shadow-sm">
            <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              Embedded Map Location
            </h4>
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-slate-200/50 dark:border-slate-800 bg-slate-100">
              <iframe
                title="Hotel Map"
                src={`https://maps.google.com/maps?q=${hotel.latitude},${hotel.longitude}&z=15&output=embed`}
                width="100%"
                height="100%"
                className="border-0"
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
            
            {/* Walking attractions */}
            <div className="mt-4 border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nearby Attractions</span>
              {nearbyAttractions.map((att, idx) => (
                <div key={idx} className="flex justify-between text-xs font-medium">
                  <span className="text-slate-800 dark:text-slate-350">{att.name}</span>
                  <span className="text-slate-400 dark:text-slate-500 font-bold font-mono text-[10px]">{att.distance}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-805 p-5 rounded-2xl shadow-sm">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Send className="w-4 h-4 text-primary-500" />
              Contact Desk
            </h4>
            
            <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-950 dark:text-slate-100"
                required
              />
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-955 dark:text-slate-100"
                required
              />
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Message details..."
                rows="3"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-955 dark:text-slate-100"
                required
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Lightbox / Gallery overlay modal */}
      {showLightbox && (
        <div className="fixed inset-0 bg-slate-950/95 z-[999] flex flex-col justify-between p-4 backdrop-blur-md">
          {/* Header */}
          <div className="flex justify-between items-center text-white">
            <span className="text-sm font-bold font-mono">
              Photo {activePhoto + 1} of {hotel.images.length}
            </span>
            <button 
              onClick={() => setShowLightbox(false)}
              className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 text-xs font-bold"
            >
              Close Gallery
            </button>
          </div>

          {/* Big Photo display */}
          <div className="flex-grow flex items-center justify-center max-h-[80vh]">
            <img 
              src={hotel.images[activePhoto]} 
              alt="lightbox preview" 
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>

          {/* Bottom slideshow selector */}
          <div className="flex gap-2 overflow-x-auto py-2 justify-center max-w-4xl mx-auto">
            {hotel.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhoto(idx)}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-transform ${activePhoto === idx ? 'border-primary-500 scale-105' : 'border-transparent opacity-60'}`}
              >
                <img src={img} alt="slide thumb" className="object-cover w-full h-full" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
