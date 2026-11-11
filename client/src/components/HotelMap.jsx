import { useState, useEffect } from 'react';
import { MapPinIcon } from './icons';

/**
 * Calculates distance between two coordinates in kilometers (Haversine formula)
 */
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function HotelMap({ hotel }) {
  const [userLocation, setUserLocation] = useState(null);
  const [geoStatus, setGeoStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [geoError, setGeoError] = useState('');

  const hotelLat = Number(hotel.latitude);
  const hotelLng = Number(hotel.longitude);

  // Request user's current position using browser Geolocation API
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoStatus('loading');
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGeoStatus('success');
      },
      (err) => {
        setGeoStatus('error');
        setGeoError(err.message || 'Unable to retrieve your location.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const distance =
    userLocation && !Number.isNaN(hotelLat) && !Number.isNaN(hotelLng)
      ? getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, hotelLat, hotelLng)
      : null;

  // OpenStreetMap embed URL with hotel coordinate marker
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${hotelLng - 0.04}%2C${hotelLat - 0.03}%2C${hotelLng + 0.04}%2C${hotelLat + 0.03}&layer=mapnik&marker=${hotelLat}%2C${hotelLng}`;

  // External directions / map URL
  const directionsUrl = userLocation
    ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${hotelLat},${hotelLng}`
    : `https://www.google.com/maps/search/?api=1&query=${hotelLat},${hotelLng}`;

  return (
    <div className="hotel-map-card">
      <div className="hotel-map-header">
        <div className="hotel-map-title">
          <MapPinIcon aria-hidden="true" />
          <span>Interactive Property Map</span>
        </div>
        <button
          type="button"
          className="btn-luxury-outline btn-luxury-outline--sm"
          onClick={handleLocateMe}
          disabled={geoStatus === 'loading'}
        >
          {geoStatus === 'loading' ? 'Locating…' : '📍 Use My Location'}
        </button>
      </div>

      {geoStatus === 'success' && distance !== null && (
        <div className="hotel-map-notice hotel-map-notice--success">
          🎯 <strong>Your current location detected:</strong> You are approximately{' '}
          <strong>{distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`}</strong> away
          from <em>{hotel.title}</em>.
        </div>
      )}

      {geoStatus === 'error' && (
        <div className="hotel-map-notice hotel-map-notice--error">
          ⚠️ {geoError}
        </div>
      )}

      <div className="hotel-map-frame-wrapper">
        <iframe
          title={`Map showing location of ${hotel.title}`}
          src={mapSrc}
          className="hotel-map-iframe"
          loading="lazy"
        />
      </div>

      <div className="hotel-map-footer">
        <div className="hotel-map-coords">
          <span>Lat: <strong>{hotelLat.toFixed(4)}</strong></span>
          <span>Lng: <strong>{hotelLng.toFixed(4)}</strong></span>
        </div>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold btn-gold--sm"
        >
          {userLocation ? 'Get Directions ↗' : 'Open in Google Maps ↗'}
        </a>
      </div>
    </div>
  );
}

