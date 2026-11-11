import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchHotel, clearCurrent } from '../features/hotels/hotelsSlice';
import { showToast } from '../features/ui/uiSlice';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { formatPrice, formatCoord } from '../utils/format';
import { getHotelLocation, getHotelRating } from '../utils/hotelHelpers';
import { ArrowLeftIcon } from '../components/icons';
import HotelMap from '../components/HotelMap';
import { selectIsAdmin } from '../features/auth/authSlice';

export default function HotelDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const isAdmin = useSelector(selectIsAdmin);
  const { current: hotel, currentStatus } = useSelector((state) => state.hotels);

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    guestName: '',
    email: '',
    checkIn: '',
    checkOut: '',
    guests: '2 Guests',
    roomType: 'Heritage Deluxe Suite',
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchHotel(id));
    return () => dispatch(clearCurrent());
  }, [dispatch, id]);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingDetails.guestName || !bookingDetails.email || !bookingDetails.checkIn || !bookingDetails.checkOut) {
      dispatch(showToast('Please complete all required reservation fields.', 'error'));
      return;
    }
    setBookingSuccess(true);
    dispatch(showToast(`Reservation confirmed for ${hotel.title}! A voucher has been emailed.`));
    setTimeout(() => {
      setShowBookingModal(false);
      setBookingSuccess(false);
    }, 2500);
  };

  if (currentStatus !== 'succeeded') {
    return (
      <div className="container page">
        {currentStatus === 'failed' ? (
          <EmptyState title="Hotel not found" text="This property may have been removed or the link is incorrect.">
            <Link to="/hotels" className="btn-gold">
              Back to All Hotels
            </Link>
          </EmptyState>
        ) : (
          <Spinner label="Unveiling hotel details…" />
        )}
      </div>
    );
  }

  const location = getHotelLocation(hotel);
  const rating = getHotelRating(hotel.id);

  return (
    <>
      <Helmet>
        <title>{hotel.title} | Zenvora Luxury Hotels</title>
        <meta name="description" content={hotel.description.slice(0, 155)} />
        <meta property="og:title" content={`${hotel.title} | Zenvora`} />
        <meta property="og:description" content={hotel.description.slice(0, 155)} />
        <meta property="og:image" content={hotel.image_url} />
      </Helmet>

      {/* Hero Banner for Details */}
      <div className="hotel-detail-hero">
        <div
          className="hotel-detail-hero__bg"
          style={{ backgroundImage: `url(${hotel.image_url})` }}
        />
        <div className="hotel-detail-hero__overlay" />

        <div className="container hotel-detail-hero__content">
          <Link to="/hotels" className="back-link-luxury">
            <ArrowLeftIcon aria-hidden="true" /> Back to All Hotels
          </Link>

          <div className="hotel-detail-badges">
            <span className="hotel-detail-tag">★ {rating.toFixed(1)} LUXURY HOTEL</span>
            <span className="hotel-detail-tag">📍 {location}</span>
          </div>

          <h1 className="hotel-detail-title">{hotel.title}</h1>

          <div className="hotel-detail-price-tag">
            <span className="price-tag-from">Starting at</span>
            <span className="price-tag-amount">{formatPrice(hotel.price)}</span>
            <span className="price-tag-period">/ night</span>
          </div>
        </div>
      </div>

      <div className="container page">
        <div className="hotel-detail-layout">
          {/* Main Info Column */}
          <div className="hotel-detail-main">
            {/* Overview Card */}
            <div className="luxury-box">
              <span className="section-kicker section-kicker--gold">PROPERTY OVERVIEW</span>
              <h2 className="luxury-box__title">About This Hotel</h2>
              <div className="gold-ornament" style={{ margin: '0.8rem 0 1.2rem' }} />
              
              <p className="hotel-full-description">{hotel.description}</p>

              <div className="hotel-meta-grid">
                <div className="hotel-meta-item">
                  <span className="meta-label">Geographic Coordinates</span>
                  <span className="meta-val">
                    {formatCoord(hotel.latitude)}, {formatCoord(hotel.longitude)}
                  </span>
                </div>
              </div>
            </div>

            {/* Location & Map Section */}
            <div className="luxury-box mt-3">
              <span className="section-kicker section-kicker--gold">PRIME GEOGRAPHY</span>
              <h2 className="luxury-box__title">Location &amp; Surrounding Panorama</h2>
              <div className="gold-ornament" style={{ margin: '0.8rem 0 1.2rem' }} />

              <HotelMap hotel={hotel} />
            </div>
          </div>

          {/* Sidebar Booking & Concierge Card */}
          <aside className="hotel-detail-sidebar">
            <div className="booking-card-luxury">
              <span className="booking-card-kicker">RESERVATION DESK</span>
              <div className="booking-price-header">
                <span className="booking-price-val">{formatPrice(hotel.price)}</span>
                <span className="booking-price-unit">per night</span>
              </div>
              <p className="booking-tax-note">Inclusive of breakfast and luxury butler service</p>

              <hr className="gold-divider" />

              <button
                type="button"
                className="btn-gold w-100 btn-gold--lg"
                onClick={() => setShowBookingModal(true)}
              >
                RESERVE NOW
              </button>

              {/* Admin Edit Link */}
              {isAdmin && (
                <Link
                  to={`/hotels/${hotel.id}/edit`}
                  className="btn-luxury-outline w-100 mt-2 text-center"
                >
                  Edit Hotel Details
                </Link>
              )}

              <div className="concierge-box mt-3">
                <h4 className="concierge-title">Hotel Concierge</h4>
                <p className="concierge-desc">
                  Need assistance with bespoke itineraries, private dining, or chauffeured transfers?
                </p>
                <div className="concierge-line">
                  <span>📞 Reservations:</span>
                  <strong>+1 (800) 555-ZENVORA</strong>
                </div>
                <div className="concierge-line">
                  <span>✉️ Concierge:</span>
                  <strong>concierge@zenvora.com</strong>
                </div>
                <div className="concierge-line">
                  <span>⏰ Check-in:</span>
                  <strong>2:00 PM • Check-out: 12:00 PM</strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Reservation Modal */}
      {showBookingModal && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-luxury" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setShowBookingModal(false)}
              aria-label="Close modal"
            >
              ✕
            </button>

            {bookingSuccess ? (
              <div className="booking-success-view text-center">
                <span className="booking-success-icon">👑</span>
                <h3 className="section-title">Reservation Confirmed</h3>
                <p className="mt-1">
                  Thank you, <strong>{bookingDetails.guestName}</strong>! Your stay at{' '}
                  <strong>{hotel.title}</strong> has been secured.
                </p>
                <p className="text-muted mt-1">
                  A personalized royal itinerary and confirmation code have been sent to{' '}
                  <strong>{bookingDetails.email}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit}>
                <span className="section-kicker section-kicker--gold">INSTANT RESERVATION</span>
                <h3 className="modal-luxury__title">Book Your Stay at {hotel.title}</h3>
                <p className="modal-luxury__subtitle">
                  Rate: <strong>{formatPrice(hotel.price)}</strong> / night
                </p>

                <div className="form-field mt-2">
                  <label className="label" htmlFor="book-name">Guest Full Name *</label>
                  <input
                    id="book-name"
                    type="text"
                    required
                    placeholder="e.g. Maharani Gayatri Devi"
                    className="input"
                    value={bookingDetails.guestName}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, guestName: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label className="label" htmlFor="book-email">Email Address *</label>
                  <input
                    id="book-email"
                    type="email"
                    required
                    placeholder="you@domain.com"
                    className="input"
                    value={bookingDetails.email}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, email: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label className="label" htmlFor="book-checkin">Check-in Date *</label>
                    <input
                      id="book-checkin"
                      type="date"
                      required
                      className="input"
                      value={bookingDetails.checkIn}
                      onChange={(e) => setBookingDetails({ ...bookingDetails, checkIn: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label className="label" htmlFor="book-checkout">Check-out Date *</label>
                    <input
                      id="book-checkout"
                      type="date"
                      required
                      className="input"
                      value={bookingDetails.checkOut}
                      onChange={(e) => setBookingDetails({ ...bookingDetails, checkOut: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label className="label" htmlFor="book-guests">Guests</label>
                    <select
                      id="book-guests"
                      className="input"
                      value={bookingDetails.guests}
                      onChange={(e) => setBookingDetails({ ...bookingDetails, guests: e.target.value })}
                    >
                      <option value="1 Guest">1 Guest</option>
                      <option value="2 Guests">2 Guests</option>
                      <option value="3 Guests">3 Guests</option>
                      <option value="4+ Guests">4+ Guests (Family)</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="label" htmlFor="book-room">Suite Category</label>
                    <select
                      id="book-room"
                      className="input"
                      value={bookingDetails.roomType}
                      onChange={(e) => setBookingDetails({ ...bookingDetails, roomType: e.target.value })}
                    >
                      <option value="Deluxe Room">Deluxe Room</option>
                      <option value="Executive Luxury Suite">Executive Luxury Suite</option>
                      <option value="Presidential Suite">Presidential Suite</option>
                    </select>
                  </div>
                </div>

                <div className="modal-luxury__actions mt-3">
                  <button
                    type="button"
                    className="btn-luxury-outline"
                    onClick={() => setShowBookingModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-gold">
                    Confirm Reservation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
