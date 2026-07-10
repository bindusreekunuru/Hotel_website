import axios from 'axios';

// A collection of Unsplash high-quality hotel-related images
export const HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', // Premium facade
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80', // Pool view
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80', // Modern bedroom
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', // Cozy bed
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', // Hotel lobby
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80', // Resort pool
  'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80', // Room with balcony
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80', // Suite view
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80', // Restaurant
  'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&w=800&q=80', // Beach hotel
  'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80', // Luxury bath
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80', // Modern room
  'https://images.unsplash.com/photo-1606046604972-77cc76aee944?auto=format&fit=crop&w=800&q=80', // Breakfast buffet
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80', // Spa room
  'https://images.unsplash.com/photo-1517840901100-8179e982acb7?auto=format&fit=crop&w=800&q=80', // Lobby check-in
  'https://images.unsplash.com/photo-1561501900-3701fa6a0864?auto=format&fit=crop&w=800&q=80', // Outdoor bar
  'https://images.unsplash.com/photo-1590490359854-dfba19688d70?auto=format&fit=crop&w=800&q=80', // Guest bathroom
  'https://images.unsplash.com/photo-1535827841776-24afc1e255ac?auto=format&fit=crop&w=800&q=80', // Evening pool
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80', // Room service
  'https://images.unsplash.com/photo-1568495248636-6432b97bd949?auto=format&fit=crop&w=800&q=80', // Twin beds
  'https://images.unsplash.com/photo-1506059612708-99d6c258160e?auto=format&fit=crop&w=800&q=80'  // Rooftop bar
];

export const ROOM_IMAGES = [
  'https://images.unsplash.com/photo-1611891404779-496152892e5a?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80'
];

export const AMENITIES_POOL = [
  // Room
  'High-speed Wi-Fi', 'Air conditioning', 'Flat-screen TV', 'Mini bar', 'Coffee maker', 'In-room safe', 'Hairdryer', 'Ironing board', 'Bathrobe & Slippers', 'Premium toiletries',
  // Hotel
  'Swimming pool', 'Fitness center / Gym', '24-hour reception', 'Valet parking', 'Luggage storage', 'Concierge service', 'Meeting rooms', 'Business center', 'Laundry service', 'Elevator',
  // Services & Dining
  'Room service (24/7)', 'Complimentary breakfast', 'In-house restaurant', 'Lounge Bar', 'Spa & Wellness center', 'Airport shuttle', 'Express check-in/out',
  // Accessibility
  'Wheelchair accessible', 'Accessible bathroom', 'Visual alarms', 'Staff trained in sign language'
];

const REVIEWERS = [
  { name: 'Amit Sharma', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
  { name: 'Priya Patel', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' },
  { name: 'Rajesh Kumar', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
  { name: 'Sneha Reddy', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80' },
  { name: 'Vikram Singh', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80' },
  { name: 'Ananya Gupta', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' },
  { name: 'John Doe', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80' },
  { name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80' }
];

const REVIEW_TEXTS = [
  'Absolutely fantastic stay! The room was spotless, the bed was extremely comfortable, and the staff went above and beyond to make us feel welcome. The rooftop restaurant has amazing views.',
  'Great value for money. Located close to the city center and transit links. Wi-Fi was fast and the breakfast buffet had a wide selection. Only downside was slightly slow check-in.',
  'The spa and pool area are exceptional. Cleanliness score is a 10/10. Highly recommend the deluxe suites. Room service was prompt and the food was delicious.',
  'Decent budget option. The room was standard but clean. Staff was friendly. Parking is a bit tight but they have valet. Overall a good stay.',
  'An oasis in the busy city. Excellent noise cancellation, highly professional staff, and great amenities. Pet-friendly as well, which was a huge plus for us!',
  'Had a lovely weekend getaway. The hygiene protocols were strictly followed, making us feel safe. Very close to major shopping hubs.',
  'Beautiful decor and premium feel. The check-out was super quick. Gym was well equipped. Definitely staying here again.',
  'Overall positive experience. Rooms are spacious. The location is excellent but there was some minor construction noise during the daytime.'
];

/**
 * Geocode a city name using OpenStreetMap Nominatim.
 * Falls back to default coordinates (Delhi) if Nominatim fails or blocks.
 */
export async function geocodeCity(cityName) {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: cityName,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'HotelAggregatorPlatform/1.0'
      },
      timeout: 5000
    });

    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon),
        displayName: response.data[0].display_name
      };
    }
  } catch (error) {
    console.warn(`OSM Geocoding failed for ${cityName}, using default.`, error.message);
  }

  // Fallback to Delhi coordinates
  return {
    lat: 28.6139,
    lon: 77.2090,
    displayName: `${cityName}, India (Simulated)`
  };
}

/**
 * Dynamically generate reviews.
 */
export function generateMockReviews(count = 25) {
  const reviews = [];
  for (let i = 0; i < count; i++) {
    const reviewer = REVIEWERS[i % REVIEWERS.length];
    const text = REVIEW_TEXTS[i % REVIEW_TEXTS.length];
    const rating = Math.floor(Math.random() * 3) + 3; // 3, 4, 5 stars
    const date = new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
    
    reviews.push({
      id: `rev-${i}`,
      reviewerName: reviewer.name,
      reviewerAvatar: reviewer.avatar,
      rating: rating,
      date: date,
      text: text,
      helpfulCount: Math.floor(Math.random() * 20) + 1,
      photos: Math.random() > 0.6 ? [HOTEL_IMAGES[(i + 4) % HOTEL_IMAGES.length]] : []
    });
  }
  return reviews;
}

/**
 * Calculate distance between two coordinates in km (Haversine formula).
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return parseFloat(d.toFixed(1));
}

/**
 * Generates an array of beautiful, highly detailed hotels around a central lat/lon.
 */
export function generateHotelsForLocation(cityName, centerLat, centerLon, source = 'Google Maps') {
  const prefix = source.toLowerCase().replace(/[^a-z0-9]/g, '');
  const count = 12; // 12 highly detailed hotels
  const hotels = [];

  const hotelNames = [
    'The Ritz Regency', 'Oasis Grand Resort', 'Jasmine Boutique Hotel',
    'Hilltop Vista Suites', 'Crystal Palace Hotel', 'Urban Echo Lodge',
    'Heritage Inn & Spa', 'Pine Tree Premium', 'Serene Valley Retreat',
    'Ginger Lily Suites', 'Vesta Grand Luxury', 'Backpackers Hostelworld Hub'
  ];

  const hotelTypes = [
    'Luxury Hotel', 'Resort Spa', 'Boutique Hotel',
    'Suite Apartments', 'Premium Business Hotel', 'Eco Lodge',
    'Heritage Inn', 'Modern Hotel', 'Nature Retreat',
    'Cozy Suites', 'Grand Luxury Resort', 'Youth Hostel'
  ];

  for (let i = 0; i < count; i++) {
    // Distribute hotels around the city center (0.005 to 0.04 degrees offset, roughly 1 to 5 km)
    const angle = (i * 2 * Math.PI) / count;
    const distanceOffset = 0.005 + (i * 0.003); // spiral outwards
    const lat = centerLat + Math.sin(angle) * distanceOffset;
    const lon = centerLon + Math.cos(angle) * distanceOffset;

    const basePrice = Math.floor(Math.random() * 25000) + 1200; // ₹1,200 to ₹26,200
    const rating = parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)); // 3.5 to 5.0
    const starRating = Math.floor(rating);

    // Shuffle and pick subsets of photos
    const photos = [];
    for (let p = 0; p < 20; p++) {
      photos.push(HOTEL_IMAGES[(i + p) % HOTEL_IMAGES.length]);
    }

    const distance = calculateDistance(centerLat, centerLon, lat, lon);

    // Room types for details
    const roomTypes = [
      {
        name: 'Standard Room',
        photos: [ROOM_IMAGES[0]],
        capacity: 2,
        size: '220 sq ft',
        bedType: '1 Queen Bed',
        pricePerNight: basePrice,
        description: 'Cozy and functional room equipped with essential amenities, modern decor, and comfortable bedding.'
      },
      {
        name: 'Deluxe Room',
        photos: [ROOM_IMAGES[1]],
        capacity: 3,
        size: '340 sq ft',
        bedType: '1 King Bed or 2 Twin Beds',
        pricePerNight: Math.floor(basePrice * 1.3),
        description: 'Spacious room with a city view, private study table, high-speed Wi-Fi, and premium bathroom amenities.'
      },
      {
        name: 'Executive Suite',
        photos: [ROOM_IMAGES[2]],
        capacity: 4,
        size: '520 sq ft',
        bedType: '1 Super King Bed + 1 Sofa Bed',
        pricePerNight: Math.floor(basePrice * 1.8),
        description: 'Luxurious suite featuring a separate living room, bathtub, private espresso machine, and exclusive access to the lounge bar.'
      }
    ];

    hotels.push({
      id: `${prefix}-${cityName.toLowerCase()}-${i + 1}`,
      name: `${hotelNames[i % hotelNames.length]} (${cityName})`,
      type: hotelTypes[i % hotelTypes.length],
      address: `${10 + i * 3}, Main Ring Road, near City Square, ${cityName}, State, India`,
      city: cityName,
      country: 'India',
      latitude: lat,
      longitude: lon,
      priceRange: `${basePrice} - ${Math.floor(basePrice * 1.8)}`,
      nightlyPrice: basePrice,
      rating: rating,
      starRating: starRating,
      reviewCount: Math.floor(Math.random() * 450) + 50,
      hygieneScore: parseFloat((Math.random() * 1.8 + 8.2).toFixed(1)), // 8.2 to 10.0
      amenities: AMENITIES_POOL.slice(0, 15 + (i % 15)), // Dynamic selection of amenities
      checkIn: '14:00',
      checkOut: '11:00',
      phone: `+91 98765 432${i.toString().padStart(2, '0')}`,
      email: `info@${hotelNames[i].toLowerCase().replace(/\s/g, '')}.com`,
      website: `https://www.${hotelNames[i].toLowerCase().replace(/\s/g, '')}.com`,
      description: `Experience the warmth of hospitality at ${hotelNames[i % hotelNames.length]}. Located in the heart of ${cityName}, only ${distance} km from the city center, our hotel offers modern guest rooms, fine dining options, and state-of-the-art facilities. Ideal for both business travellers and families looking for a relaxing escape. Enjoy complimentary access to high-speed internet, our swimming pool, and our fitness center during your stay.`,
      images: photos,
      reviews: generateMockReviews(25),
      roomTypes: roomTypes,
      cancellationPolicy: 'Free cancellation up to 24 hours before check-in. Non-refundable after that.',
      source: source,
      distanceFromCenter: distance,
      lastUpdated: new Date().toISOString()
    });
  }

  return hotels;
}
