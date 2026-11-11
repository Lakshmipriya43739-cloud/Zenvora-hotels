// Helper functions for displaying luxury hotel metadata (location, rating, amenities)

export function getHotelLocation(hotel) {
  if (!hotel) return 'Exclusive Destination';
  const title = (hotel.title || '').toLowerCase();
  
  if (title.includes('pichola') || title.includes('udaipur')) return 'Udaipur, Rajasthan';
  if (title.includes('beach') || title.includes('candolim') || title.includes('goa')) return 'Candolim, Goa';
  if (title.includes('mumbai') || title.includes('skyline')) return 'Mumbai, Maharashtra';
  if (title.includes('jaipur') || title.includes('haveli')) return 'Jaipur, Rajasthan';
  if (title.includes('manali') || title.includes('pine')) return 'Manali, Himachal Pradesh';
  if (title.includes('rishikesh') || title.includes('camp')) return 'Rishikesh, Uttarakhand';
  if (title.includes('kochi') || title.includes('backwater') || title.includes('kerala')) return 'Kochi, Kerala';
  if (title.includes('delhi')) return 'New Delhi';
  if (title.includes('varanasi') || title.includes('ghat')) return 'Varanasi, Uttar Pradesh';
  if (title.includes('mysore')) return 'Mysore, Karnataka';
  if (title.includes('dubai')) return 'Dubai, UAE';
  if (title.includes('singapore') || title.includes('orchard')) return 'Singapore';
  
  // Fallback using coordinates or general label
  if (hotel.latitude > 20 && hotel.longitude > 70 && hotel.longitude < 80) return 'Northern India';
  if (hotel.latitude <= 20 && hotel.longitude > 70 && hotel.longitude < 80) return 'Southern India';
  return 'Prime Global Location';
}

export function getHotelRating(hotelId) {
  // Deterministic luxury ratings between 4.8 and 5.0
  const ratings = [5.0, 4.9, 5.0, 4.8, 4.9, 4.8, 5.0, 4.8, 4.9, 4.8, 5.0, 4.9];
  const idx = typeof hotelId === 'number' ? (hotelId - 1) % ratings.length : 0;
  return ratings[idx] || 4.9;
}

export const LUXURY_AMENITIES = [
  { name: 'Royal Butler Service', icon: '👑', desc: '24/7 dedicated personal concierge' },
  { name: 'Signature Jiva Spa', icon: '✨', desc: 'Ayurvedic treatments & wellness therapies' },
  { name: 'Signature Fine Dining', icon: '🍷', desc: 'Michelin-standard gastronomy & private dining' },
  { name: 'Infinity Pool', icon: '🏊‍♂️', desc: 'Temperature-controlled scenic waters' },
  { name: 'Iconic Architecture', icon: '🏛️', desc: 'Preserved craftsmanship & contemporary decor' },
  { name: 'Limousine Transfer', icon: '🚘', desc: 'Chauffeured luxury airport arrivals' },
  { name: 'High-Speed Wi-Fi', icon: '📶', desc: 'Complimentary seamless connectivity' },
  { name: 'Valet & Concierge', icon: '🛎️', desc: 'Round-the-clock bespoke assistance' },
];

