import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="luxury-footer">
      <div className="container">
        {/* Top Section */}
        <div className="luxury-footer__grid">
          {/* Brand Col */}
          <div className="luxury-footer__col luxury-footer__col--brand">
            <div className="luxury-brand">
              <div className="luxury-brand__emblem">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#AD8B3A" stroke="#C5A85A" strokeWidth="1.2" />
                </svg>
              </div>
              <div className="luxury-brand__text">
                <span className="brand-name">ZENVORA</span>
                <span className="brand-sub">HOTELS</span>
              </div>
            </div>

            <p className="footer-philosophy">
              A peerless symbol of luxury hospitality, revered globally for elegant architecture,
              impeccable heritage preservation, and unforgettable hotel stays.
            </p>

            <div className="footer-gold-seal">
              <span>ESTD. 1903 • ICONIC LUXURY</span>
            </div>
          </div>

          {/* Destinations Col */}
          <div className="luxury-footer__col">
            <h4 className="footer-col-title">Destinations</h4>
            <ul className="footer-links">
              <li><Link to="/hotels">Udaipur Hotels</Link></li>
              <li><Link to="/hotels">Jaipur Havelis</Link></li>
              <li><Link to="/hotels">Goa Beachfronts</Link></li>
              <li><Link to="/hotels">Mumbai Skyline</Link></li>
              <li><Link to="/hotels">Himalayan Lodges</Link></li>
              <li><Link to="/hotels">Kerala Backwaters</Link></li>
            </ul>
          </div>

          {/* Hotels & Stays */}
          <div className="luxury-footer__col">
            <h4 className="footer-col-title">Hotels &amp; Stays</h4>
            <ul className="footer-links">
              <li><Link to="/hotels">All 12 Hotels</Link></li>
              <li><a href="/#facilities">Included Facilities</a></li>
            </ul>
          </div>

          {/* Concierge & Contact */}
          <div className="luxury-footer__col">
            <h4 className="footer-col-title">Hotel Concierge</h4>
            <div className="footer-contact-info">
              <p><strong>Worldwide Reservations:</strong></p>
              <p className="contact-highlight">+1 (800) 555-ZENVORA</p>
              <p>concierge@zenvora.com</p>
              <p className="mt-1">Premier Boulevard, Heritage District</p>
              <p>Open 24 Hours, 365 Days</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="luxury-footer__bottom">
          <p className="copyright-text">
            © {new Date().getFullYear()} Zenvora Hotels. All Rights Reserved.
          </p>

          <div className="footer-legal-links">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Stay</span>
            <span>•</span>
            <span>Accessibility</span>
            <span>•</span>
            <span>Cookie Preferences</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
