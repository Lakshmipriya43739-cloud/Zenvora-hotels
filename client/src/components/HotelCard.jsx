import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { formatPrice } from '../utils/format';
import { getHotelLocation, getHotelRating } from '../utils/hotelHelpers';
import { PencilIcon, TrashIcon } from './icons';
import { selectIsAdmin } from '../features/auth/authSlice';

export default function HotelCard({ hotel, onDelete }) {
  const isAdmin = useSelector(selectIsAdmin);

  const location = getHotelLocation(hotel);
  const rating = getHotelRating(hotel.id);

  return (
    <article className="luxury-card">
      {/* Hotel Image with Overlay Badge */}
      <div className="luxury-card__media">
        <Link to={`/hotels/${hotel.id}`} aria-label={`View ${hotel.title}`}>
          <img
            className="luxury-card__img"
            src={hotel.image_url}
            alt={hotel.title}
            loading="lazy"
          />
        </Link>
        <span className="luxury-card__rating">
          ★ {rating.toFixed(1)}
        </span>
        <span className="luxury-card__location">
          📍 {location}
        </span>
      </div>

      {/* Hotel Details Body */}
      <div className="luxury-card__body">
        <h3 className="luxury-card__title">
          <Link to={`/hotels/${hotel.id}`}>{hotel.title}</Link>
        </h3>

        <p className="luxury-card__desc">{hotel.description}</p>

        <div className="luxury-card__footer">
          <div className="luxury-card__price-box">
            <span className="price-lead">From</span>
            <span className="price-amount">{formatPrice(hotel.price)}</span>
            <span className="price-period">/ night</span>
          </div>

          <div className="luxury-card__actions">
            <Link to={`/hotels/${hotel.id}`} className="btn-card-details">
              View Details
            </Link>

            {/* Admin-only Edit and Delete tools */}
            {isAdmin && (
              <div className="luxury-card__admin-tools">
                <Link
                  to={`/hotels/${hotel.id}/edit`}
                  className="icon-btn-luxury"
                  title="Edit Hotel"
                  aria-label={`Edit ${hotel.title}`}
                >
                  <PencilIcon />
                </Link>
                <button
                  type="button"
                  className="icon-btn-luxury icon-btn-luxury--danger"
                  onClick={() => onDelete(hotel)}
                  title="Delete Hotel"
                  aria-label={`Delete ${hotel.title}`}
                >
                  <TrashIcon />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
