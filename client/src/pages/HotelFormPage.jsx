import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchHotel, createHotel, updateHotel, clearCurrent } from '../features/hotels/hotelsSlice';
import { showToast } from '../features/ui/uiSlice';
import { selectIsAdmin } from '../features/auth/authSlice';
import Spinner from '../components/Spinner';
import { ArrowLeftIcon } from '../components/icons';

const EMPTY_FORM = {
  title: '',
  description: '',
  price: '',
  latitude: '',
  longitude: '',
};

export default function HotelFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAdmin = useSelector(selectIsAdmin);
  const { current: hotel, currentStatus, saving } = useSelector((state) => state.hotels);

  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Protect route: redirect non-admin users
  useEffect(() => {
    if (!isAdmin) {
      dispatch(showToast('Access denied: Admin privileges required.', 'error'));
      navigate('/', { replace: true });
    }
  }, [isAdmin, navigate, dispatch]);

  // If editing, load the existing hotel data
  useEffect(() => {
    if (!isEdit) return undefined;
    dispatch(fetchHotel(id));
    return () => dispatch(clearCurrent());
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (isEdit && hotel) {
      const tidy = (n) => String(Number(Number(n).toFixed(6)));
      setValues({
        title: hotel.title,
        description: hotel.description,
        price: String(hotel.price),
        latitude: tidy(hotel.latitude),
        longitude: tidy(hotel.longitude),
      });
      setPreviewUrl(hotel.image_url);
    }
  }, [isEdit, hotel]);

  // Clean up object URL when changed
  useEffect(
    () => () => {
      if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  const setField = (name) => (event) => {
    setValues((prev) => ({ ...prev, [name]: event.target.value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (values.title.trim().length < 3) {
      next.title = 'Title must be at least 3 characters long.';
    }
    if (values.description.trim().length < 10) {
      next.description = 'Please write at least 10 characters describing this hotel.';
    }
    const price = Number(values.price);
    if (values.price === '' || Number.isNaN(price) || price < 0 || price > 10_000_000) {
      next.price = 'Price must be a valid number between 0 and 10,000,000.';
    }
    const lat = Number(values.latitude);
    if (values.latitude === '' || Number.isNaN(lat) || lat < -90 || lat > 90) {
      next.latitude = 'Latitude must be between -90 and 90.';
    }
    const lng = Number(values.longitude);
    if (values.longitude === '' || Number.isNaN(lng) || lng < -180 || lng > 180) {
      next.longitude = 'Longitude must be between -180 and 180.';
    }
    if (!isEdit && !imageFile) {
      next.image = 'Please upload a photo for this luxury property.';
    }
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const formData = new FormData();
    formData.append('title', values.title.trim());
    formData.append('description', values.description.trim());
    formData.append('price', values.price);
    formData.append('latitude', values.latitude);
    formData.append('longitude', values.longitude);
    if (imageFile) formData.append('image', imageFile);

    try {
      if (isEdit) {
        await dispatch(updateHotel({ id, formData })).unwrap();
        dispatch(showToast('Sanctuary updated successfully.'));
        navigate(`/hotels/${id}`);
      } else {
        const created = await dispatch(createHotel(formData)).unwrap();
        dispatch(showToast('New sanctuary added to portfolio.'));
        navigate(`/hotels/${created.id}`);
      }
    } catch (payload) {
      if (payload?.errors) {
        setErrors(payload.errors);
      } else {
        dispatch(showToast(payload?.message || 'Could not save the hotel. Please try again.', 'error'));
      }
    }
  };

  if (isEdit && currentStatus !== 'succeeded') {
    return (
      <div className="container page">
        {currentStatus === 'failed' ? (
          <p className="page-sub">This sanctuary could not be loaded. It may have been removed.</p>
        ) : (
          <Spinner label="Loading sanctuary…" />
        )}
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isEdit ? `Edit ${values.title || 'Hotel'}` : 'Add New Sanctuary'} | Zenvora</title>
      </Helmet>

      <div className="container page" style={{ maxWidth: 860 }}>
        <Link to="/admin" className="back-link-luxury">
          <ArrowLeftIcon aria-hidden="true" /> Return to Admin Dashboard
        </Link>

        <div className="luxury-form-card">
          <div className="luxury-form-head">
            <span className="section-kicker section-kicker--gold">
              {isEdit ? 'PORTFOLIO UPDATE' : 'NEW ENROLLMENT'}
            </span>
            <h1 className="luxury-form-title">
              {isEdit ? `Edit "${hotel?.title}"` : 'Enroll a New Luxury Hotel'}
            </h1>
            <p className="luxury-form-desc">
              All properties are stored in PostgreSQL and displayed in both the Grid View and 3D Carousel.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label className="label" htmlFor="title">
                Hotel Title <span className="req">*</span>
              </label>
              <input
                id="title"
                className={`input ${errors.title ? 'input--invalid' : ''}`}
                value={values.title}
                onChange={setField('title')}
                placeholder="e.g. Udaipur Lakeside Heritage Hotel"
                maxLength={160}
              />
              {errors.title && <p className="field-error">{errors.title}</p>}
            </div>

            <div className="form-field">
              <label className="label" htmlFor="description">
                Hotel Description <span className="req">*</span>
              </label>
              <textarea
                id="description"
                rows={4}
                className={`input ${errors.description ? 'input--invalid' : ''}`}
                value={values.description}
                onChange={setField('description')}
                placeholder="Highlight the architectural grandeur, suite features, scenic views, and signature services…"
              />
              {errors.description && <p className="field-error">{errors.description}</p>}
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="label" htmlFor="price">
                  Tariff per Night (₹) <span className="req">*</span>
                </label>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="1"
                  className={`input ${errors.price ? 'input--invalid' : ''}`}
                  value={values.price}
                  onChange={setField('price')}
                  placeholder="18000"
                />
                {errors.price && <p className="field-error">{errors.price}</p>}
              </div>

              <div className="form-field">
                <label className="label" htmlFor="latitude">
                  Latitude (-90 to 90) <span className="req">*</span>
                </label>
                <input
                  id="latitude"
                  type="number"
                  step="any"
                  className={`input ${errors.latitude ? 'input--invalid' : ''}`}
                  value={values.latitude}
                  onChange={setField('latitude')}
                  placeholder="24.5764"
                />
                {errors.latitude && <p className="field-error">{errors.latitude}</p>}
              </div>

              <div className="form-field">
                <label className="label" htmlFor="longitude">
                  Longitude (-180 to 180) <span className="req">*</span>
                </label>
                <input
                  id="longitude"
                  type="number"
                  step="any"
                  className={`input ${errors.longitude ? 'input--invalid' : ''}`}
                  value={values.longitude}
                  onChange={setField('longitude')}
                  placeholder="73.6835"
                />
                {errors.longitude && <p className="field-error">{errors.longitude}</p>}
              </div>
            </div>

            {/* Photo Upload Section */}
            <div className="form-field">
              <span className="label">
                Sanctuary Photo {!isEdit && <span className="req">*</span>}
                {isEdit && <span className="hint-inline"> (leave empty to retain current photo)</span>}
              </span>
              <div className="upload-luxury">
                {previewUrl ? (
                  <img src={previewUrl} alt="Hotel preview" className="upload-luxury__preview" />
                ) : (
                  <div className="upload-luxury__placeholder">No image selected</div>
                )}
                <div className="upload-luxury__side">
                  <label className="btn-luxury-outline btn-luxury-outline--sm" htmlFor="hotel-image">
                    Select High-Res Photo…
                  </label>
                  <p className="hint">JPG, PNG, or WEBP up to 5 MB.</p>
                  {errors.image && <p className="field-error">{errors.image}</p>}
                </div>
              </div>
              <input
                id="hotel-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setImageFile(file);
                  setPreviewUrl(URL.createObjectURL(file));
                  setErrors((prev) => ({ ...prev, image: undefined }));
                }}
              />
            </div>

            <div className="luxury-form-actions">
              <Link to={isEdit ? `/hotels/${id}` : '/admin'} className="btn-luxury-outline">
                Cancel
              </Link>
              <button type="submit" className="btn-gold" disabled={saving}>
                {saving ? 'Saving to Database…' : isEdit ? 'Save Hotel Changes' : 'Add Hotel'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
