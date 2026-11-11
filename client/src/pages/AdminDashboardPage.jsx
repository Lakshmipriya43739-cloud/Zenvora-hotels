import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchHotels, deleteHotel } from '../features/hotels/hotelsSlice';
import { showToast } from '../features/ui/uiSlice';
import { selectUser, selectIsAdmin } from '../features/auth/authSlice';
import { formatPrice } from '../utils/format';
import { getHotelLocation } from '../utils/hotelHelpers';
import ConfirmModal from '../components/ConfirmModal';
import Spinner from '../components/Spinner';
import { PencilIcon, TrashIcon, SearchIcon } from '../components/icons';

export default function AdminDashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const isAdmin = useSelector(selectIsAdmin);
  const { items, total, listStatus } = useSelector((state) => state.hotels);

  const [tableSearch, setTableSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Enforce Admin access only
  useEffect(() => {
    // If not admin, redirect to login or home
    if (user && !isAdmin) {
      dispatch(showToast('Access denied: Admin privileges required.', 'error'));
      navigate('/', { replace: true });
    }
  }, [user, isAdmin, navigate, dispatch]);

  // Pull all hotels for management
  useEffect(() => {
    dispatch(fetchHotels({ limit: 100, offset: 0 }));
  }, [dispatch]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await dispatch(deleteHotel(pendingDelete.id)).unwrap();
      dispatch(showToast(`"${pendingDelete.title}" deleted from database.`));
      // Refresh list
      dispatch(fetchHotels({ limit: 100, offset: 0 }));
    } catch {
      dispatch(showToast('Could not delete hotel. Please try again.', 'error'));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  // Filter items in the admin table
  const filteredItems = items.filter((hotel) => {
    const q = tableSearch.toLowerCase();
    const titleMatch = (hotel.title || '').toLowerCase().includes(q);
    const locMatch = getHotelLocation(hotel).toLowerCase().includes(q);
    return titleMatch || locMatch;
  });

  // Calculate quick metrics
  const avgPrice = items.length > 0
    ? Math.round(items.reduce((acc, h) => acc + Number(h.price || 0), 0) / items.length)
    : 0;

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
            <span className="section-kicker section-kicker--gold">EXECUTIVE PORTAL</span>
            <h1 className="admin-title">Hotel Portfolio Management</h1>
            <p className="admin-subtitle">
              Manage luxury listings, photos, geographic coordinates, and tariff pricing across Zenvora hotels.
            </p>
          </div>

          <Link to="/hotels/add" className="btn-gold btn-gold--lg">
            + Add New Hotel
          </Link>
        </div>
      </div>

      <div className="container page">
        {/* Metric Cards Row */}
        <div className="admin-stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total Hotels</span>
            <span className="stat-val">{total || items.length}</span>
            <span className="stat-sub">Active in PostgreSQL database</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Average Nightly Tariff</span>
            <span className="stat-val">{formatPrice(avgPrice)}</span>
            <span className="stat-sub">Across all room categories</span>
          </div>
        </div>

        {/* Management Table Section */}
        <div className="luxury-box mt-3">
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
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No hotels found matching "{tableSearch}".
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((hotel) => (
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
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Confirm Hotel Removal"
        message={`Are you sure you want to delete "${pendingDelete?.title}"? This cannot be undone.`}
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}

