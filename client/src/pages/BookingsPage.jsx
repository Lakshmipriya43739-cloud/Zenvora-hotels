import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { reservationsApi } from '../api';
import { selectUser } from '../features/auth/authSlice';
import { showToast } from '../features/ui/uiSlice';
import { formatPrice } from '../utils/format';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';

function getStatusBadge(status) {
  switch (status) {
    case 'Confirmed':
      return <span className="status-badge status-badge--confirmed">● Confirmed</span>;
    case 'Completed':
      return <span className="status-badge status-badge--completed">✓ Completed</span>;
    case 'Cancelled':
      return <span className="status-badge status-badge--cancelled">✕ Cancelled</span>;
    case 'Pending':
    default:
      return <span className="status-badge status-badge--pending">⏳ Pending</span>;
  }
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '—';
  // If YYYY-MM-DD
  const [y, m, d] = dateStr.slice(0, 10).split('-');
  if (!y || !m || !d) return dateStr;
  const dateObj = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 1;
  const inDate = new Date(`${checkIn.slice(0, 10)}T00:00:00Z`);
  const outDate = new Date(`${checkOut.slice(0, 10)}T00:00:00Z`);
  const diff = Math.round((outDate - inDate) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
}

export default function BookingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [activeDetailsModal, setActiveDetailsModal] = useState(null);
  const [pendingCancel, setPendingCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Fetch bookings
  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reservationsApi.listMy();
      setBookings(data.reservations || []);
    } catch (err) {
      setError(err.message || 'Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadBookings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCancelConfirm = async () => {
    if (!pendingCancel) return;
    setCancelling(true);
    try {
      await reservationsApi.cancelMy(pendingCancel.id);
      dispatch(showToast(`Reservation ${pendingCancel.booking_reference} has been cancelled.`));
      setPendingCancel(null);
      // Reload bookings to reflect updated status
      await loadBookings();
    } catch (err) {
      dispatch(showToast(err.message || 'Failed to cancel reservation.', 'error'));
    } finally {
      setCancelling(false);
    }
  };

  if (!user) {
    return (
      <div className="container page text-center">
        <div className="luxury-box" style={{ maxWidth: 540, margin: '4rem auto' }}>
          <span className="booking-crown-icon">👑</span>
          <h2 className="section-title mt-2">Sign In to View Bookings</h2>
          <p className="text-muted mt-2">
            Please sign in to your Zenvora account to access your reservations, booking references, and stay vouchers.
          </p>
          <div className="mt-3">
            <Link to="/login?redirect=/bookings" className="btn-gold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Bookings | Zenvora Luxury Hotels</title>
      </Helmet>

      {/* Header Banner */}
      <div className="admin-header-banner">
        <div className="container admin-header-content">
          <div>
            <span className="section-kicker section-kicker--gold">Guest Itinerary</span>
            <h1 className="admin-title">My Luxury Reservations</h1>
            <p className="admin-subtitle">
              Review your secured palace stays, download itineraries, and manage upcoming royal accommodations.
            </p>
          </div>
          <Link to="/hotels" className="btn-gold btn-gold--lg">
            Book Another Stay
          </Link>
        </div>
      </div>

      <div className="container page">
        {loading ? (
          <Spinner label="Loading your reservations…" />
        ) : error ? (
          <div className="luxury-box text-center py-4">
            <h3 className="section-title">Unable to Load Bookings</h3>
            <p className="text-muted mt-2">{error}</p>
            <button type="button" className="btn-gold mt-3" onClick={loadBookings}>
              Try Again
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            title="No reservations found"
            text="You have no active or previous reservations logged under your account. Indulge in an unforgettable luxury experience across our iconic properties."
          >
            <div className="mt-3">
              <Link to="/hotels" className="btn-gold">
                Explore Hotels &amp; Palaces
              </Link>
            </div>
          </EmptyState>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => {
              const nights = calculateNights(booking.check_in, booking.check_out);
              const canCancel = booking.status === 'Pending' || booking.status === 'Confirmed';

              return (
                <div key={booking.id} className="booking-card">
                  {/* Left: Hotel Thumbnail */}
                  <div className="booking-card__media">
                    <img
                      src={booking.hotel_image_url}
                      alt={booking.hotel_title}
                      className="booking-card__img"
                    />
                    <div className="booking-card__media-badge">
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>

                  {/* Middle: Booking Details */}
                  <div className="booking-card__body">
                    <div className="booking-card__header">
                      <div>
                        <span className="booking-ref-label">Booking ID</span>
                        <h3 className="booking-ref-code">{booking.booking_reference}</h3>
                      </div>
                      <span className="booking-date-sub">
                        Booked on {formatDateDisplay(booking.created_at)}
                      </span>
                    </div>

                    <h4 className="booking-hotel-title">
                      <Link to={`/hotels/${booking.hotel_id}`}>
                        {booking.hotel_title}
                      </Link>
                    </h4>

                    <div className="booking-meta-row">
                      <div className="booking-meta-item">
                        <span className="meta-label">Check-in</span>
                        <strong className="meta-val">{formatDateDisplay(booking.check_in)}</strong>
                      </div>
                      <div className="booking-meta-arrow">→</div>
                      <div className="booking-meta-item">
                        <span className="meta-label">Check-out</span>
                        <strong className="meta-val">{formatDateDisplay(booking.check_out)}</strong>
                      </div>
                      <div className="booking-meta-item">
                        <span className="meta-label">Duration</span>
                        <span className="meta-val">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                      </div>
                      <div className="booking-meta-item">
                        <span className="meta-label">Suite &amp; Guests</span>
                        <span className="meta-val">{booking.room_type} • {booking.guests}</span>
                      </div>
                    </div>

                    {booking.special_requests && (
                      <p className="booking-special-requests">
                        <strong>Requests:</strong> {booking.special_requests}
                      </p>
                    )}
                  </div>

                  {/* Right: Price & Actions */}
                  <div className="booking-card__aside">
                    <div className="booking-price-block">
                      <span className="price-label">Total Amount</span>
                      <span className="price-figure">{formatPrice(booking.total_amount)}</span>
                      <span className="price-tax">Taxes &amp; Butler Inclusive</span>
                    </div>

                    <div className="booking-actions">
                      <button
                        type="button"
                        className="btn-gold btn-gold--sm w-100"
                        onClick={() => setActiveDetailsModal(booking)}
                      >
                        View Details
                      </button>

                      {canCancel && (
                        <button
                          type="button"
                          className="btn-luxury-outline btn-luxury-outline--sm w-100 mt-1"
                          onClick={() => setPendingCancel(booking)}
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {activeDetailsModal && (
        <div className="modal-overlay" onClick={() => setActiveDetailsModal(null)}>
          <div className="modal-luxury modal-luxury--wide" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setActiveDetailsModal(null)}
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="voucher-header">
              <span className="section-kicker section-kicker--gold">Royal Reservation Voucher</span>
              <h3 className="modal-luxury__title">{activeDetailsModal.hotel_title}</h3>
              <p className="text-muted">
                Official booking confirmation for <strong>{activeDetailsModal.guest_name}</strong>
              </p>
            </div>

            <div className="voucher-ref-card mt-2">
              <div>
                <span className="voucher-ref-label">Booking Reference</span>
                <span className="voucher-ref-number">{activeDetailsModal.booking_reference}</span>
              </div>
              <div>{getStatusBadge(activeDetailsModal.status)}</div>
            </div>

            <div className="voucher-grid mt-3">
              <div className="voucher-col">
                <h4 className="voucher-col__title">Stay Itinerary</h4>
                <div className="voucher-row">
                  <span>Check-in:</span>
                  <strong>{formatDateDisplay(activeDetailsModal.check_in)} (From 2:00 PM)</strong>
                </div>
                <div className="voucher-row">
                  <span>Check-out:</span>
                  <strong>{formatDateDisplay(activeDetailsModal.check_out)} (Until 12:00 PM)</strong>
                </div>
                <div className="voucher-row">
                  <span>Duration:</span>
                  <strong>{calculateNights(activeDetailsModal.check_in, activeDetailsModal.check_out)} Nights</strong>
                </div>
                <div className="voucher-row">
                  <span>Category:</span>
                  <strong>{activeDetailsModal.room_type}</strong>
                </div>
                <div className="voucher-row">
                  <span>Guests:</span>
                  <strong>{activeDetailsModal.guests}</strong>
                </div>
              </div>

              <div className="voucher-col">
                <h4 className="voucher-col__title">Guest &amp; Payment</h4>
                <div className="voucher-row">
                  <span>Primary Guest:</span>
                  <strong>{activeDetailsModal.guest_name}</strong>
                </div>
                <div className="voucher-row">
                  <span>Contact Email:</span>
                  <strong>{activeDetailsModal.guest_email}</strong>
                </div>
                <div className="voucher-row">
                  <span>Booked On:</span>
                  <strong>{formatDateDisplay(activeDetailsModal.created_at)}</strong>
                </div>
                <div className="voucher-row">
                  <span>Tariff:</span>
                  <strong>{formatPrice(activeDetailsModal.hotel_price || 0)} / night</strong>
                </div>
                <div className="voucher-row voucher-row--total">
                  <span>Total Amount:</span>
                  <strong className="text-gold">{formatPrice(activeDetailsModal.total_amount)}</strong>
                </div>
              </div>
            </div>

            {activeDetailsModal.special_requests && (
              <div className="voucher-box mt-2">
                <span className="meta-label">Special Requests</span>
                <p className="mt-1">{activeDetailsModal.special_requests}</p>
              </div>
            )}

            <div className="concierge-box mt-3">
              <h4 className="concierge-title">Zenvora Concierge Support</h4>
              <p className="concierge-desc">
                Present this booking reference upon check-in. For limousine assistance or private dining, contact the hotel reservations desk directly at <strong>+1 (800) 555-ZENVORA</strong> or <strong>concierge@zenvora.com</strong>.
              </p>
            </div>

            <div className="modal-luxury__actions mt-3" style={{ justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-gold"
                onClick={() => setActiveDetailsModal(null)}
              >
                Close Voucher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      <ConfirmModal
        open={Boolean(pendingCancel)}
        title="Cancel Luxury Reservation"
        message={`Are you sure you wish to cancel booking reference "${pendingCancel?.booking_reference}" for ${pendingCancel?.hotel_title}? This action cannot be reversed.`}
        busy={cancelling}
        confirmLabel="Cancel Booking"
        confirmVariant="btn--danger"
        onCancel={() => setPendingCancel(null)}
        onConfirm={handleCancelConfirm}
      />
    </>
  );
}

