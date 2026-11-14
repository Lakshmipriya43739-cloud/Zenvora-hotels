import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser, selectIsAdmin } from '../features/auth/authSlice';
import { showToast } from '../features/ui/uiSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectUser);
  const isAdmin = useSelector(selectIsAdmin);

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Monitor scroll to switch transparent navbar to solid luxury background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on page transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Smooth scroll helper for on-page sections
  const scrollToSection = (e, sectionId) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(showToast('You have been logged out of Zenvora.'));
    navigate('/');
  };

  const isHome = location.pathname === '/';

  return (
    <header className={`luxury-navbar ${scrolled || !isHome ? 'luxury-navbar--scrolled' : ''}`}>
      <div className="container luxury-navbar__inner">
        {/* Brand Logo */}
        <Link to="/" className="luxury-brand">
          <div className="luxury-brand__emblem">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#AD8B3A" stroke="#C5A85A" strokeWidth="1.2" />
            </svg>
          </div>
          <div className="luxury-brand__text">
            <span className="brand-name">ZENVORA</span>
            <span className="brand-sub">HOTELS</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="luxury-nav-menu" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => `luxury-nav-link ${isActive ? 'is-active' : ''}`}>
            Home
          </NavLink>
          <a href="/#destinations" className="luxury-nav-link" onClick={(e) => scrollToSection(e, 'destinations')}>
            Destinations
          </a>
          <NavLink to="/hotels" className={({ isActive }) => `luxury-nav-link ${isActive ? 'is-active' : ''}`}>
            Hotels
          </NavLink>
          {user && (
            <NavLink to="/bookings" className={({ isActive }) => `luxury-nav-link ${isActive ? 'is-active' : ''}`}>
              My Bookings
            </NavLink>
          )}
          <a href="/#facilities" className="luxury-nav-link" onClick={(e) => scrollToSection(e, 'facilities')}>
            Facilities
          </a>
          <a href="/#about" className="luxury-nav-link" onClick={(e) => scrollToSection(e, 'about')}>
            About Us
          </a>
        </nav>

        {/* Right Section: Auth & Book a Stay */}
        <div className="luxury-nav-actions">
          {user ? (
            <div className="user-profile-badge">
              {isAdmin && (
                <Link to="/admin" className="role-pill role-pill--admin" title="Admin Dashboard">
                  {user.role}
                </Link>
              )}
              <button
                type="button"
                className="btn-text-logout"
                onClick={handleLogout}
                title="Sign out"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="auth-link">
                Sign In
              </Link>
            </div>
          )}

          {/* Taj-inspired Gold "Book a Stay" Button */}
          <Link to="/hotels" className="btn-gold btn-book-stay">
            Book a Stay
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="mobile-hamburger"
            aria-label="Toggle navigation"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer">
          <NavLink to="/" end className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            Home
          </NavLink>
          <a href="/#destinations" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            Destinations
          </a>
          <NavLink to="/hotels" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            Hotels
          </NavLink>
          {user && (
            <NavLink to="/bookings" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              My Bookings
            </NavLink>
          )}
          <a href="/#facilities" className="mobile-nav-link" onClick={(e) => { scrollToSection(e, 'facilities'); setMobileMenuOpen(false); }}>
            Facilities
          </a>
          <a href="/#about" className="mobile-nav-link" onClick={(e) => { scrollToSection(e, 'about'); setMobileMenuOpen(false); }}>
            About Us
          </a>

          <div className="mobile-menu-footer">
            {user ? (
              <div className="mobile-user-row">
                {isAdmin ? (
                  <span>
                    Signed in as <Link to="/admin" className="role-pill role-pill--admin" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
                  </span>
                ) : (
                  <span>Signed in</span>
                )}
                <button type="button" className="btn-gold btn-gold--sm" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="mobile-auth-row">
                <Link to="/login" className="btn-luxury-outline" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
                <Link to="/register" className="btn-gold" onClick={() => setMobileMenuOpen(false)}>
                  Register
                </Link>
              </div>
            )}
            <Link to="/hotels" className="btn-gold w-100 mt-2" onClick={() => setMobileMenuOpen(false)}>
              Book a Stay
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
