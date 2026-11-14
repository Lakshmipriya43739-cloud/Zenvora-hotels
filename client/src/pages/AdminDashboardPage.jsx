import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchHotels, deleteHotel } from '../features/hotels/hotelsSlice';
import { showToast } from '../features/ui/uiSlice';
import { selectUser, selectIsAdmin } from '../features/auth/authSlice';
import { formatPrice, formatDate } from '../utils/format';
import { getHotelLocation } from '../utils/hotelHelpers';
import ConfirmModal from '../components/ConfirmModal';
import Spinner from '../components/Spinner';
import { PencilIcon, TrashIcon, SearchIcon } from '../components/icons';
import { reservationsApi } from '../api';

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

export default function AdminDashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const isAdmin = useSelector(selectIsAdmin);
  const { items, total, listStatus } = useSelector((state) => state.hotels);

  // Tab State: 'hotels' | 'reservations'
  const [activeTab, setActiveTab] = useState('hotels');

  // Hotels State
  const [tableSearch, setTableSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Reservations State
  const [reservations, setReservations] = useState([]);
  const [resLoading, setResLoading] = useState(false);
  const [resSearch, setResSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedResModal, setSelectedResModal] = useState(null);
  const [updatingResId, setUpdatingResId] = useState(null);

  // Enforce Admin access only
  useEffect(() => {
    if (user && !isAdmin) {
      dispatch(showToast('Access denied: Admin privileges required.', 'error'));
      navigate('/', { replace: true });
    }
  }, [user, isAdmin, navigate, dispatch]);

  // Pull all hotels for management
  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchHotels({ limit: 100, offset: 0 }));
    }
  }, [dispatch, isAdmin]);

  // Pull reservations
  const loadReservations = useCallback(async () => {
    if (!isAdmin) return;
    setResLoading(true);
    try {
      const data = await reservationsApi.adminList({
        q: resSearch,
        status: statusFilter,
      });
      setReservations(data.reservations || []);
    } catch (err) {
      dispatch(showToast(err.message || 'Failed to load reservations.', 'error'));
    } finally {
      setResLoading(false);
    }
  }, [isAdmin, resSearch, statusFilter, dispatch]);

  useEffect(() => {
    if (isAdmin) {
      loadReservations();
    }
  }, [isAdmin, loadReservations]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await dispatch(deleteHotel(pendingDelete.id)).unwrap();
      dispatch(showToast(`"${pendingDelete.title}" deleted from database.`));
      dispatch(fetchHotels({ limit: 100, offset: 0 }));
    } catch {
      dispatch(showToast('Could not delete hotel. Please try again.', 'error'));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  const handleStatusChange = async (resId, newStatus) => {
    setUpdatingResId(resId);
    try {
      await reservationsApi.adminUpdateStatus(resId, newStatus);
      dispatch(showToast(`Reservation status updated to ${newStatus}.`));
      await loadReservations();
    } catch (err) {
      dispatch(showToast(err.message || 'Failed to update reservation status.', 'error'));
    } finally {
      setUpdatingResId(null);
    }
  };

  // Filter items in the admin hotels table
  const filteredHotels = items.filter((hotel) => {
    const q = tableSearch.toLowerCase();
    const titleMatch = (hotel.title || '').toLowerCase().includes(q);
    const locMatch = getHotelLocation(hotel).toLowerCase().includes(q);
    return titleMatch || locMatch;
  });

  // Calculate quick metrics
  const avgPrice = items.length > 0
    ? Math.round(items.reduce((acc, h) => acc + Number(h.price || 0), 0) / items.length)
    : 0;

  const pendingCount = reservations.filter((r) => r.status === 'Pending').length;
  const confirmedCount = reservations.filter((r) => r.status === 'Confirmed').length;
  const totalRevenue = reservations
    .filter((r) => r.status !== 'Cancelled')
    .reduce((sum, r) => sum + Number(r.total_amount || 0), 0);

  if (!isAdmin) {
    return (
      <div className="container page text-center">
        <div className="luxury-box" style={{ maxWidth: 520, margin: '3rem auto' }}>
          <h2 className="section-title">Admin Restricted</h2>
          <p className="mt-2 text-muted">You must be logged in as an administrator to access the Zenvora Management Portal.</p>
          <div className="mt-3">
            <Link to="/login" className="btn-gold">
              Sign In as Administrator
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Management Dashboard | Zenvora</title>
      </Helmet>

      {/* Admin Header */}
      <div className="admin-header-banner">
        <div className="container admin-header-content">
          <div>
            <span className="section-kicker section-kicker--gold">Executive Portal</span>
            <h1 className="admin-title">Zenvora Operations Dashboard</h1>
            <p className="admin-subtitle">
              Manage luxury properties, pricing, real-time guest reservations, and status fulfillment across Zenvora hotels.
            </p>
          </div>
          {activeTab === 'hotels' ? (
            <Link to="/hotels/add" className="btn-gold btn-gold--lg">
              + Add New Hotel
            </Link>
          ) : (
            <button
              type="button"
              className="btn-gold btn-gold--lg"
              onClick={loadReservations}
            >
              ↻ Refresh Bookings
            </button>
          )}
        </div>
      </div>

      <div className="container page">
        {/* Metric Cards Row */}
        <div className="admin-stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total Properties</span>
            <span className="stat-val">{total || items.length}</span>
            <span className="stat-sub">Active in PostgreSQL database</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Total Reservations</span>
            <span className="stat-val">{reservations.length}</span>
            <span className="stat-sub">{pendingCount} Pending • {confirmedCount} Confirmed</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Reservation Volume</span>
            <span className="stat-val">{formatPrice(totalRevenue)}</span>
            <span className="stat-sub">Non-cancelled guest bookings</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Average Nightly Tariff</span>
            <span className="stat-val">{formatPrice(avgPrice)}</span>
            <span className="stat-sub">Across all room categories</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs mt-3">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'hotels' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('hotels')}
          >
            Hotel Portfolio ({items.length})
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'reservations' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('reservations')}
          >
            Guest Reservations ({reservations.length})
            {pendingCount > 0 && (
              <span className="admin-tab-pill">{pendingCount} Pending</span>
            )}
          </button>
        </div>

        {/* Tab 1: Hotel Portfolio */}
        {activeTab === 'hotels' && (
          <div className="luxury-box mt-2">
            <div className="admin-table-head">
              <div>
                <h2 className="luxury-box__title">All Hotel Records</h2>
                <p className="text-muted text-sm">Real-time records from PostgreSQL `hotels` table</p>
              </div>

              {/* Search Filter for Table */}
              <div className="admin-table-search">
                <SearchIcon aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Filter by hotel title or location…"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                />
              </div>
            </div>

            {listStatus === 'loading' && items.length === 0 ? (
              <Spinner label="Loading database records…" />
            ) : (
              <div className="table-responsive">
                <table className="luxury-table">
                  <thead>
                    <tr>
                      <th>Photo</th>
                      <th>Hotel Title</th>
                      <th>Location</th>
                      <th>Price / Night</th>
                      <th>Coordinates (Lat, Lng)</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHotels.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                          No hotels found matching "{tableSearch}".
                        </td>
                      </tr>
                    ) : (
                      filteredHotels.map((hotel) => (
                        <tr key={hotel.id}>
                          <td>
                            <img
                              src={hotel.image_url}
                              alt={hotel.title}
                              className="table-hotel-thumb"
                            />
                          </td>
                          <td>
                            <strong>{hotel.title}</strong>
                          </td>
                          <td>
                            <span className="table-location-badge">
                              📍 {getHotelLocation(hotel)}
                            </span>
                          </td>
                          <td>
                            <span className="table-price">{formatPrice(hotel.price)}</span>
                          </td>
                          <td className="text-muted text-sm">
                            {Number(hotel.latitude).toFixed(4)}, {Number(hotel.longitude).toFixed(4)}
                          </td>
                          <td className="text-right">
                            <div className="table-actions">
                              <Link
                                to={`/hotels/${hotel.id}`}
                                className="btn-luxury-outline btn-luxury-outline--xs"
                                title="View details"
                              >
                                View
                              </Link>
                              <Link
                                to={`/hotels/${hotel.id}/edit`}
                                className="icon-btn-luxury"
                                title="Edit listing"
                              >
                                <PencilIcon />
                              </Link>
                              <button
                                type="button"
                                className="icon-btn-luxury icon-btn-luxury--danger"
                                onClick={() => setPendingDelete(hotel)}
                                title="Delete hotel"
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Guest Reservations */}
        {activeTab === 'reservations' && (
          <div className="luxury-box mt-2">
            <div className="admin-table-head">
              <div>
                <h2 className="luxury-box__title">Guest Reservations</h2>
                <p className="text-muted text-sm">Real-time bookings from PostgreSQL `reservations` table</p>
              </div>

              {/* Search & Status Filters */}
              <div className="admin-filters-group">
                <div className="admin-table-search">
                  <SearchIcon aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Search ID, guest, email, hotel…"
                    value={resSearch}
                    onChange={(e) => setResSearch(e.target.value)}
                  />
                </div>

                <select
                  className="input admin-status-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {resLoading && reservations.length === 0 ? (
              <Spinner label="Loading reservation records…" />
            ) : (
              <div className="table-responsive">
                <table className="luxury-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Hotel</th>
                      <th>Guest Details</th>
                      <th>Dates</th>
                      <th>Total Amount</th>
                      <th>Status &amp; Action</th>
                      <th className="text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4 text-muted">
                          No reservations match the selected search or status criteria.
                        </td>
                      </tr>
                    ) : (
                      reservations.map((res) => (
                        <tr key={res.id}>
                          <td>
                            <strong className="booking-ref-code" style={{ fontSize: '0.88rem' }}>
                              {res.booking_reference}
                            </strong>
                            <div className="text-muted text-xs">
                              {formatDate(res.created_at)}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <img
                                src={res.hotel_image_url}
                                alt={res.hotel_title}
                                className="table-hotel-thumb"
                                style={{ width: 40, height: 40 }}
                              />
                              <div>
                                <strong style={{ fontSize: '0.88rem' }}>{res.hotel_title}</strong>
                                <div className="text-muted text-xs">{res.room_type}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <strong>{res.guest_name}</strong>
                            <div className="text-muted text-xs">{res.guest_email}</div>
                            <div className="text-muted text-xs">{res.guests}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.85rem' }}>
                              <span>{res.check_in?.slice(0, 10)}</span>
                              <span className="text-muted" style={{ margin: '0 0.25rem' }}>→</span>
                              <span>{res.check_out?.slice(0, 10)}</span>
                            </div>
                          </td>
                          <td>
                            <strong className="text-gold">{formatPrice(res.total_amount)}</strong>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {getStatusBadge(res.status)}
                              <select
                                className="admin-status-dropdown"
                                value={res.status}
                                disabled={updatingResId === res.id}
                                onChange={(e) => handleStatusChange(res.id, e.target.value)}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                          </td>
                          <td className="text-right">
                            <button
                              type="button"
                              className="btn-luxury-outline btn-luxury-outline--xs"
                              onClick={() => setSelectedResModal(res)}
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal for Hotels */}
      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Confirm Hotel Removal"
        message={`Are you sure you want to delete "${pendingDelete?.title}"? This cannot be undone.`}
        busy={deleting}
        confirmLabel="Delete Hotel"
        confirmVariant="btn--danger"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />

      {/* Reservation Inspection Modal */}
      {selectedResModal && (
        <div className="modal-overlay" onClick={() => setSelectedResModal(null)}>
          <div className="modal-luxury modal-luxury--wide" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setSelectedResModal(null)}
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="voucher-header">
              <span className="section-kicker section-kicker--gold">Executive Audit</span>
              <h3 className="modal-luxury__title">Reservation #{selectedResModal.booking_reference}</h3>
              <p className="text-muted">
                Property: <strong>{selectedResModal.hotel_title}</strong>
              </p>
            </div>

            <div className="voucher-ref-card mt-2">
              <div>
                <span className="voucher-ref-label">Booking Reference</span>
                <span className="voucher-ref-number">{selectedResModal.booking_reference}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                {getStatusBadge(selectedResModal.status)}
                <select
                  className="admin-status-dropdown"
                  value={selectedResModal.status}
                  onChange={async (e) => {
                    const newStatus = e.target.value;
                    await handleStatusChange(selectedResModal.id, newStatus);
                    setSelectedResModal((prev) => ({ ...prev, status: newStatus }));
                  }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="voucher-grid mt-3">
              <div className="voucher-col">
                <h4 className="voucher-col__title">Stay Information</h4>
                <div className="voucher-row">
                  <span>Hotel:</span>
                  <strong>{selectedResModal.hotel_title}</strong>
                </div>
                <div className="voucher-row">
                  <span>Check-in:</span>
                  <strong>{selectedResModal.check_in?.slice(0, 10)}</strong>
                </div>
                <div className="voucher-row">
                  <span>Check-out:</span>
                  <strong>{selectedResModal.check_out?.slice(0, 10)}</strong>
                </div>
                <div className="voucher-row">
                  <span>Suite:</span>
                  <strong>{selectedResModal.room_type}</strong>
                </div>
                <div className="voucher-row">
                  <span>Guests:</span>
                  <strong>{selectedResModal.guests}</strong>
                </div>
              </div>

              <div className="voucher-col">
                <h4 className="voucher-col__title">Guest &amp; Account</h4>
                <div className="voucher-row">
                  <span>Guest Name:</span>
                  <strong>{selectedResModal.guest_name}</strong>
                </div>
                <div className="voucher-row">
                  <span>Guest Email:</span>
                  <strong>{selectedResModal.guest_email}</strong>
                </div>
                <div className="voucher-row">
                  <span>Account User:</span>
                  <strong>{selectedResModal.user_name || '—'} ({selectedResModal.user_account_email || '—'})</strong>
                </div>
                <div className="voucher-row">
                  <span>Booked At:</span>
                  <strong>{formatDate(selectedResModal.created_at)}</strong>
                </div>
                <div className="voucher-row voucher-row--total">
                  <span>Total Amount:</span>
                  <strong className="text-gold">{formatPrice(selectedResModal.total_amount)}</strong>
                </div>
              </div>
            </div>

            {selectedResModal.special_requests && (
              <div className="voucher-box mt-2">
                <span className="meta-label">Guest Special Requests</span>
                <p className="mt-1">{selectedResModal.special_requests}</p>
              </div>
            )}

            <div className="modal-luxury__actions mt-3" style={{ justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-gold"
                onClick={() => setSelectedResModal(null)}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
