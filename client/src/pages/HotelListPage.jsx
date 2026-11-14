import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchHotels, deleteHotel, setFilter, PAGE_SIZE } from '../features/hotels/hotelsSlice';
import { showToast } from '../features/ui/uiSlice';
import { selectIsAdmin } from '../features/auth/authSlice';
import useDebounce from '../hooks/useDebounce';
import HotelCard from '../components/HotelCard';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import Gallery from '../components/Gallery';
import { SearchIcon, CubeIcon } from '../components/icons';

const POPULAR_LOCATIONS = [
  { label: 'All Destinations', value: '' },
  { label: 'Udaipur', value: 'Udaipur' },
  { label: 'Goa', value: 'Goa' },
  { label: 'Mumbai', value: 'Mumbai' },
  { label: 'Jaipur', value: 'Jaipur' },
  { label: 'Manali', value: 'Manali' },
  { label: 'Kerala', value: 'Backwater' },
  { label: 'Dubai', value: 'Dubai' },
  { label: 'Singapore', value: 'Singapore' },
];

export default function HotelListPage() {
  const dispatch = useDispatch();
  const isAdmin = useSelector(selectIsAdmin);
  const { items, total, listStatus, listError, filters } = useSelector((state) => state.hotels);

  // View mode: '3d' gallery
  const [viewMode] = useState('3d');

  // Search input with debounce
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput);

  // Deletion state
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Sync debounced search to Redux
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      dispatch(setFilter({ name: 'search', value: debouncedSearch }));
    }
  }, [debouncedSearch, dispatch, filters.search]);

  // Keep local search input synced if filters.search changes externally
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  // Offset calculation for pagination (PAGE_SIZE = 8)
  const offset = (filters.page - 1) * PAGE_SIZE;

  // Fetch hotels whenever search, price, or page changes
  useEffect(() => {
    dispatch(
      fetchHotels({
        search: filters.search,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        limit: PAGE_SIZE,
        offset,
      })
    );
  }, [dispatch, filters.search, filters.minPrice, filters.maxPrice, filters.page, offset]);

  // Reset to previous page if last hotel on current page is deleted
  useEffect(() => {
    if (listStatus === 'succeeded' && items.length === 0 && filters.page > 1) {
      dispatch(setFilter({ name: 'page', value: filters.page - 1 }));
    }
  }, [listStatus, items.length, filters.page, dispatch]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await dispatch(deleteHotel(pendingDelete.id)).unwrap();
      dispatch(showToast('Hotel listing deleted successfully.'));
      // Refetch page
      dispatch(
        fetchHotels({
          search: filters.search,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          limit: PAGE_SIZE,
          offset,
        })
      );
    } catch {
      dispatch(showToast('Could not delete this hotel. Please try again.', 'error'));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  const handleLocationSelect = (locVal) => {
    setSearchInput(locVal);
    dispatch(setFilter({ name: 'search', value: locVal }));
  };

  const hasFilters = filters.search || filters.minPrice || filters.maxPrice;

  return (
    <>
      <Helmet>
        <title>Luxury Hotels &amp; Suites | Zenvora</title>
        <meta
          name="description"
          content="Explore Zenvora's collection of 12 iconic luxury hotels, tranquil coastal havens, and mountain retreats."
        />
      </Helmet>

      {/* Listing Page Header Banner */}
      <div className="listing-banner">
        <div className="container listing-banner__content">
          <span className="section-kicker section-kicker--gold">Our Hotels</span>
          <h1 className="listing-banner__title">Luxury Hotels &amp; Suites</h1>
          <div className="gold-ornament" />
          <p className="listing-banner__subtitle">
            Immerse yourself in authentic luxury living. Every hotel is curated to deliver legendary hospitality.
          </p>
        </div>
      </div>

      <div className="container page">
        {/* Controls Bar: Search, Filters, View Mode & Admin Action */}
        <div className="listing-controls">
          {/* Quick Location Pills */}
          <div className="location-pills">
            {POPULAR_LOCATIONS.map((loc) => {
              const active = filters.search === loc.value;
              return (
                <button
                  key={loc.label}
                  type="button"
                  className={`loc-pill ${active ? 'loc-pill--active' : ''}`}
                  onClick={() => handleLocationSelect(loc.value)}
                >
                  {loc.label}
                </button>
              );
            })}
          </div>

          <div className="listing-bar-row">
            {/* Search and Price Filter Form */}
            <form className="luxury-filters" role="search" onSubmit={(e) => e.preventDefault()}>
              <label className="luxury-filter-search">
                <SearchIcon aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search by hotel or location…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  aria-label="Search hotels by title or location"
                />
              </label>

              <div className="luxury-filter-prices">
                <label className="luxury-price-field">
                  <span>Min ₹</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    placeholder="0"
                    value={filters.minPrice}
                    onChange={(e) => dispatch(setFilter({ name: 'minPrice', value: e.target.value }))}
                    aria-label="Minimum price in INR"
                  />
                </label>

                <label className="luxury-price-field">
                  <span>Max ₹</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    placeholder="Any"
                    value={filters.maxPrice}
                    onChange={(e) => dispatch(setFilter({ name: 'maxPrice', value: e.target.value }))}
                    aria-label="Maximum price in INR"
                  />
                </label>
              </div>

              {hasFilters && (
                <button
                  type="button"
                  className="btn-luxury-outline btn-luxury-outline--sm"
                  onClick={() => {
                    setSearchInput('');
                    dispatch(setFilter({ name: 'search', value: '' }));
                    dispatch(setFilter({ name: 'minPrice', value: '' }));
                    dispatch(setFilter({ name: 'maxPrice', value: '' }));
                  }}
                >
                  Reset
                </button>
              )}
            </form>

            {/* View Mode & Admin Add Hotel */}
            <div className="listing-actions-group">
              <div className="view-toggle-luxury" role="group" aria-label="View display">
                <button
                  type="button"
                  className="view-btn view-btn--active"
                  title="3D Gallery View"
                >
                  <CubeIcon /> 3D Gallery
                </button>
              </div>

              {/* Add Hotel: Only visible to authenticated Admin */}
              {isAdmin && (
                <Link to="/hotels/add" className="btn-gold btn-gold--sm">
                  + Add New Hotel
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Listing Results Count Info */}
        <div className="listing-results-bar">
          <span className="results-count">
            Showing {items.length > 0 ? offset + 1 : 0}–{Math.min(offset + PAGE_SIZE, total)} of {total} Hotels
          </span>
          <span className="results-badge">Page {filters.page} of {Math.max(1, Math.ceil(total / PAGE_SIZE))}</span>
        </div>

        {/* Content Section */}
        {listStatus === 'loading' ? (
          <Spinner label="Loading luxury hotels…" />
        ) : listError ? (
          <EmptyState title="Unable to load hotels" text={listError} />
        ) : items.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'No hotels match your filters' : 'No hotels in collection yet'}
            text={
              hasFilters
                ? 'Try a different search destination or adjust your price range.'
                : 'Hotels will appear here once added.'
            }
          >
            {hasFilters ? (
              <button
                type="button"
                className="btn-gold"
                onClick={() => {
                  setSearchInput('');
                  dispatch(setFilter({ name: 'search', value: '' }));
                  dispatch(setFilter({ name: 'minPrice', value: '' }));
                  dispatch(setFilter({ name: 'maxPrice', value: '' }));
                }}
              >
                Clear Filters
              </button>
            ) : isAdmin ? (
              <Link to="/hotels/add" className="btn-gold">
                Add First Hotel
              </Link>
            ) : null}
          </EmptyState>
        ) : (
          <>
            {viewMode === '3d' ? (
              <Gallery
                items={items.map((hotel) => ({
                  id: hotel.id,
                  src: hotel.image_url,
                  title: hotel.title,
                  price: hotel.price,
                  description: hotel.description,
                }))}
              />
            ) : (
              <div className="luxury-cards-grid">
                {items.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} onDelete={setPendingDelete} />
                ))}
              </div>
            )}

            {/* Pagination Controls (8 per page) */}
            <div className="luxury-pagination-wrap">
              <Pagination
                page={filters.page}
                pageSize={PAGE_SIZE}
                total={total}
                onPage={(p) => dispatch(setFilter({ name: 'page', value: p }))}
              />
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal for Admin */}
      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete this hotel?"
        message={`Are you sure you want to delete "${pendingDelete?.title ?? ''}"? This action is permanent and will remove the hotel from the database.`}
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
