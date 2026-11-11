import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchHotels, setFilter } from '../features/hotels/hotelsSlice';
import { showToast } from '../features/ui/uiSlice';
import { getHotelLocation, getHotelRating, LUXURY_AMENITIES } from '../utils/hotelHelpers';
import { formatPrice } from '../utils/format';

export default function HomePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.hotels);

  // Search Bar State
  const [searchCity, setSearchCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2 Guests, 1 Room');
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // Fetch hotels for featured section if not yet loaded
  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchHotels({ limit: 8, offset: 0 }));
    }
  }, [dispatch, items.length]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      dispatch(setFilter({ name: 'search', value: searchCity.trim() }));
    }
    navigate('/hotels');
  };

  const handleDestinationClick = (destName) => {
    dispatch(setFilter({ name: 'search', value: destName }));
    navigate('/hotels');
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !/\S+@\S+\.\S+/.test(newsletterEmail)) {
      dispatch(showToast('Please enter a valid email address.', 'error'));
      return;
    }
    dispatch(showToast('Welcome to the Zenvora Privilege Circle. Check your inbox soon!'));
    setNewsletterEmail('');
  };

  // Featured 4 hotels from actual DB data (fallback to items slice)
  const featuredHotels = items.slice(0, 4);

  return (
    <>
      <Helmet>
        <title>Zenvora | Luxury Hotels</title>
        <meta
          name="description"
          content="Experience exceptional luxury, timeless elegance, and heartfelt hospitality at Zenvora's world-renowned luxury hotels."
        />
      </Helmet>

      {/* ──────────────── 1 & 2. LUXURY HERO BANNER ──────────────── */}
      <section className="hero-luxury">
        <div className="hero-luxury__bg" />
        <div className="hero-luxury__overlay" />

        <div className="container hero-luxury__content">
          <div className="hero-badge">
            <span className="hero-badge__line" />
            <span className="hero-badge__text">TIMELESS ELEGANCE EXCEPTIONAL EXPERIENCES</span>
            <span className="hero-badge__line" />
          </div>

          <h1 className="hero-luxury__title">
            Where Timeless Luxury <br />
            <span>Meets Extraordinary Experiences </span>
          </h1>

          <p className="hero-luxury__desc">
            Enjoy peaceful surroundings, thoughtful service, and special moments you'll always remember.
          </p>

          <div className="hero-luxury__actions">
            <Link to="/hotels" className="btn-gold btn-gold--lg">
              Explore Our Finest Stays
            </Link>

          </div>
        </div>

        {/* ──────────────── 3. HOTEL SEARCH SECTION (FLOATING) ──────────────── */}
        <div className="container hero-search-wrap">
          <form className="luxury-search-bar" onSubmit={handleSearchSubmit}>
            <div className="search-field">
              <label htmlFor="search-destination" className="search-field__label">HOTEL OR CITY</label>
              <input
                id="search-destination"
                type="text"
                placeholder="Search by hotel name or city..."
                className="search-field__input"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
              />
            </div>

            <div className="search-divider" />

            <div className="search-field">
              <label htmlFor="search-checkin" className="search-field__label">CHECK-IN</label>
              <input
                id="search-checkin"
                type="date"
                className="search-field__input"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>

            <div className="search-divider" />

            <div className="search-field">
              <label htmlFor="search-checkout" className="search-field__label">CHECK-OUT</label>
              <input
                id="search-checkout"
                type="date"
                className="search-field__input"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>

            <div className="search-divider" />

            <div className="search-field">
              <label htmlFor="search-guests" className="search-field__label">GUESTS & ROOMS</label>
              <select
                id="search-guests"
                className="search-field__input search-field__select"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              >
                <option value="1 Guest, 1 Room">1 Guest, 1 Room</option>
                <option value="2 Guests, 1 Room">2 Guests, 1 Room</option>
                <option value="3 Guests, 2 Rooms">3 Guests, 2 Rooms</option>
                <option value="4+ Guests, Family Suite">4+ Guests, Family Suite</option>
              </select>
            </div>

            <button type="submit" className="btn-gold search-submit">
              <span>FIND HOTELS</span>
            </button>
          </form>
        </div>
      </section>

      {/* ──────────────── 4. EXPLORE OUR DESTINATIONS ──────────────── */}
      <section id="destinations" className="section-luxury">
        <div className="container">
          <div className="section-head text-center">
            <span className="section-kicker">DESTINATIONS TO REMEMBER</span>
            <h2 className="section-title">Explore Iconic Destinations</h2>
            <div className="gold-ornament" />
            <p className="section-desc">
              From charming city stays to peaceful nature retreats, find the perfect place to unwind.
            </p>
          </div>

          <div className="destinations-grid">
            <div
              className="dest-card"
              onClick={() => handleDestinationClick('Udaipur')}
              role="button"
              tabIndex={0}
            >
              <div
                className="dest-card__img"
                style={{
                  backgroundImage:
                    'url(https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80)',
                }}
              />
              <div className="dest-card__content">
                <span className="dest-card__badge">Heritage Hotels</span>
                <h3 className="dest-card__title">Rajasthan</h3>
                <p className="dest-card__subtitle">Udaipur &amp; Jaipur Hotels</p>
                <span className="dest-card__link">Discover Hotels &rarr;</span>
              </div>
            </div>

            <div
              className="dest-card"
              onClick={() => handleDestinationClick('Goa')}
              role="button"
              tabIndex={0}
            >
              <div
                className="dest-card__img"
                style={{
                  backgroundImage:
                    'url(https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80)',
                }}
              />
              <div className="dest-card__content">
                <span className="dest-card__badge">Coastal Havens</span>
                <h3 className="dest-card__title">Goa &amp; Kerala</h3>
                <p className="dest-card__subtitle">Candolim &amp; Backwaters</p>
                <span className="dest-card__link">Discover Hotels &rarr;</span>
              </div>
            </div>

            <div
              className="dest-card"
              onClick={() => handleDestinationClick('Mumbai')}
              role="button"
              tabIndex={0}
            >
              <div
                className="dest-card__img"
                style={{
                  backgroundImage:
                    'url(https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80)',
                }}
              />
              <div className="dest-card__content">
                <span className="dest-card__badge">Urban Grandeur</span>
                <h3 className="dest-card__title">Mumbai</h3>
                <p className="dest-card__subtitle">Skyline &amp; Harbor</p>
                <span className="dest-card__link">Discover Hotels &rarr;</span>
              </div>
            </div>

            <div
              className="dest-card"
              onClick={() => handleDestinationClick('Manali')}
              role="button"
              tabIndex={0}
            >
              <div
                className="dest-card__img"
                style={{
                  backgroundImage:
                    'url(https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80)',
                }}
              />
              <div className="dest-card__content">
                <span className="dest-card__badge">Himalayan Retreats</span>
                <h3 className="dest-card__title">Himalayas</h3>
                <p className="dest-card__subtitle">Manali &amp; Rishikesh</p>
                <span className="dest-card__link">Discover Hotels &rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── 5. FEATURED LUXURY HOTELS ──────────────── */}
      <section className="section-luxury section-luxury--warm">
        <div className="container">
          <div className="section-head text-center">
            <span className="section-kicker">SIGNATURE COLLECTION</span>
            <h2 className="section-title">Featured Grand Hotels</h2>
            <div className="gold-ornament" />
            <p className="section-desc">
              Discover our beautiful hotels, known for exceptional comfort, warm hospitality, and memorable stays.
            </p>
          </div>

          <div className="featured-hotels-grid">
            {featuredHotels.map((hotel) => (
              <div key={hotel.id} className="luxury-hotel-card">
                <div className="luxury-hotel-card__media">
                  <img
                    src={hotel.image_url}
                    alt={hotel.title}
                    className="luxury-hotel-card__img"
                    loading="lazy"
                  />
                  <div className="luxury-hotel-card__rating">
                    ★ {getHotelRating(hotel.id).toFixed(1)}
                  </div>
                  <div className="luxury-hotel-card__location">
                    📍 {getHotelLocation(hotel)}
                  </div>
                </div>

                <div className="luxury-hotel-card__body">
                  <h3 className="luxury-hotel-card__title">
                    <Link to={`/hotels/${hotel.id}`}>{hotel.title}</Link>
                  </h3>
                  <p className="luxury-hotel-card__desc">{hotel.description}</p>

                  <div className="luxury-hotel-card__footer">
                    <div className="luxury-hotel-card__price">
                      <span className="price-label">Starting from</span>
                      <span className="price-val">{formatPrice(hotel.price)}</span>
                      <span className="price-sub">/ night</span>
                    </div>

                    <Link to={`/hotels/${hotel.id}`} className="btn-card-details">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center" style={{ marginTop: '3.5rem' }}>
            <Link to="/hotels" className="btn-gold btn-gold--lg">
              View All 12 Luxury Hotels
            </Link>
          </div>
        </div>
      </section>



      {/* ──────────────── 7. EXPERIENCES & SERVICES ──────────────── */}
      <section id="experiences" className="section-luxury section-luxury--dark">
        <div className="container">
          <div className="section-head text-center">
            <span className="section-kicker section-kicker--gold">SPECIAL HOTEL EXPERIENCES</span>
            <h2 className="section-title text-white">Memorable Stays & Experiences</h2>
            <div className="gold-ornament" />
            <p className="section-desc text-muted-light">
              Enjoy the warmth of Indian hospitality, relaxing stays, and beautiful moments worth remembering.
            </p>
          </div>

          <div className="experiences-grid">
            <div className="experience-item">
              <div className="experience-item__icon">👑</div>
              <h3 className="experience-item__title">Dedicated Guest Services</h3>
              <p className="experience-item__desc">
                From helping you settle in to arranging special dining experiences, our team is always ready to make your stay comfortable and enjoyable.              </p>
            </div>

            <div className="experience-item">
              <div className="experience-item__icon">✨</div>
              <h3 className="experience-item__title">Wellness & Spa Experiences</h3>
              <p className="experience-item__desc">
                Enjoy relaxing spa treatments, calming surroundings, and peaceful moments that refresh your mind and body              </p>
            </div>

            <div className="experience-item">
              <div className="experience-item__icon">🍷</div>
              <h3 className="experience-item__title">SPECIAL DINING MOMENTS</h3>
              <p className="experience-item__desc">
                From traditional recipes to modern favourites, enjoy delicious food made with care and passion.              </p>
            </div>

            <div className="experience-item">
              <div className="experience-item__icon">⛵</div>
              <h3 className="experience-item__title">UNFORGETTABLE BOAT RIDES</h3>
              <p className="experience-item__desc">
                Enjoy peaceful boat rides, beautiful sunset views, and relaxing moments by the water.              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── INCLUDED AMENITIES & FACILITIES ──────────────── */}
      <section id="facilities" className="section-luxury section-luxury--warm">
        <div className="container">
          <div className="section-head text-center">
            <span className="section-kicker">DISTINGUISHED PRIVILEGES</span>
            <h2 className="section-title">Included Amenities &amp; Facilities</h2>
            <div className="gold-ornament" />
            <p className="section-desc">
              Experience the highest standard of luxury living with our complimentary signature amenities and bespoke hotel services.
            </p>
          </div>

          <div className="facilities-homepage-grid">
            {LUXURY_AMENITIES.map((item) => (
              <div key={item.name} className="facility-card">
                <span className="facility-card__icon">{item.icon}</span>
                <div className="facility-card__info">
                  <h3 className="facility-card__title">{item.name}</h3>
                  <p className="facility-card__desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── 8. WHY CHOOSE ZENVORA? ──────────────── */}
      <section id="about" className="section-luxury">
        <div className="container">
          <div className="why-zenvora-grid">
            <div className="why-zenvora__content">
              <span className="section-kicker">A TRADITION OF WARM WELCOMES</span>
              <h2 className="section-title">The Essence of Zenvora</h2>
              <div className="gold-ornament" style={{ margin: '1rem 0 1.5rem' }} />

              <p className="why-zenvora__lead">
                Zenvora brings together beautiful stays, friendly service, and the warmth of Indian hospitality.
              </p>

              <div className="pillars-list">
                <div className="pillar">
                  <div className="pillar__num">01</div>
                  <div className="pillar__text">
                    <h4>Elegant Design &amp; & Comfor</h4>
                    <p>natural, professional and easy for everyone to understand.</p>
                  </div>
                </div>

                <div className="pillar">
                  <div className="pillar__num">02</div>
                  <div className="pillar__text">
                    <h4>The Warmth of The  &amp; True Hospitality</h4>
                    <p>From the moment you arrive, we make sure you feel at home with our caring service.</p>
                  </div>
                </div>

                <div className="pillar">
                  <div className="pillar__num">03</div>
                  <div className="pillar__text">
                    <h4>Memorable Dining Moments</h4>
                    <p>From traditional Indian cuisine to international dishes, enjoy dining experiences for every taste.</p>
                  </div>
                </div>
              </div>

              <Link to="/hotels" className="btn-gold" style={{ marginTop: '2rem' }}>
                Explore Our Story
              </Link>
            </div>

            <div className="why-zenvora__visual">
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80"
                alt="Luxury Hotel Corridor"
                className="why-zenvora__img-primary"
              />
              <div className="why-zenvora__badge-box">
                <span className="badge-num">100%</span>
                <span className="badge-text">Authentic Luxury Hotel Hospitality</span>
              </div>
            </div>
          </div>
        </div>
      </section>


    </>
  );
}

