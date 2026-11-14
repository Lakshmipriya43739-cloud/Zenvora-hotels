import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { selectUser } from '../features/auth/authSlice';
import { showToast } from '../features/ui/uiSlice';
import Spinner from '../components/Spinner';

export default function MembershipPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Enforce authenticated client or admin
  useEffect(() => {
    const token = localStorage.getItem('zenvora_token');
    if (!token && !user) {
      navigate('/login?redirect=/membership', { replace: true });
    }
  }, [user, navigate]);

  // Fetch logged-in user's membership details
  useEffect(() => {
    const token = localStorage.getItem('zenvora_token');
    if (!token) return;

    let isMounted = true;
    setLoading(true);

    fetch('/api/membership/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Unable to retrieve membership details.');
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setMembership(data.membership);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopyId = () => {
    if (!membership?.membership_id) return;
    navigator.clipboard.writeText(membership.membership_id).then(() => {
      setCopied(true);
      dispatch(showToast(`Membership ID copied: ${membership.membership_id}`));
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return 'Active Member';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  const formatCardNumber = (rawId) => {
    if (!rawId) return 'ZNV • 0000 • 0000';
    const parts = rawId.split('-');
    if (parts.length >= 3) {
      return `${parts[0]} • ${parts[1]} • ${parts[2]}`;
    }
    return rawId;
  };

  if (loading) {
    return (
      <div className="container page text-center py-5">
        <Spinner label="Loading your digital membership card…" />
      </div>
    );
  }

  if (error || !membership) {
    return (
      <div className="container page text-center py-5">
        <div className="luxury-box" style={{ maxWidth: 540, margin: '2rem auto' }}>
          <h2 className="section-title">Membership Notice</h2>
          <p className="text-muted mt-2">{error || 'Could not load membership details.'}</p>
          <div className="mt-3">
            <Link to="/login" className="btn-gold">
              Sign In Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Membership | Zenvora Privilege Circle</title>
      </Helmet>

      {/* Header Banner */}
      <div className="membership-hero-banner">
        <div className="container text-center">
          <span className="section-kicker section-kicker--gold">Zenvora Privilege Circle</span>
          <h1 className="membership-hero-title">My Digital Membership</h1>
          <p className="membership-hero-subtitle">
            Welcome, <strong>{membership.member_name}</strong>. Your personalized digital credentials and elite privileges.
          </p>
        </div>
      </div>

      <div className="container page">
        {/* Main Card & Overview Row */}
        <div className="membership-layout">
          {/* Left Column: Digital Card */}
          <div className="membership-card-column">
            {/* Elegant Dark Green and Gold Luxury Card */}
            <div className="digital-card-wrap">
              <div className="digital-card digital-card--emerald">
                {/* Background Watermark Pattern */}
                <div className="digital-card__watermark" aria-hidden="true">
                  <svg width="220" height="220" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                      fill="#C5A85A"
                      opacity="0.08"
                    />
                  </svg>
                </div>

                {/* Card Top Row: Brand & Tier */}
                <div className="digital-card__header">
                  <div className="digital-card__brand">
                    <div className="digital-card__emblem">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                          fill="#C5A85A"
                          stroke="#E6CF8B"
                          strokeWidth="1.2"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="digital-card__name">ZENVORA</span>
                      <span className="digital-card__sub">Privilege Circle</span>
                    </div>
                  </div>

                  <span className="digital-card__tier-pill">
                    {membership.membership_type}
                  </span>
                </div>

                {/* Card Mid Row: Holographic Chip & Wireless */}
                <div className="digital-card__mid">
                  <div className="digital-card__chip" aria-label="Smart Card Chip">
                    <span className="chip-line" />
                    <span className="chip-line" />
                    <span className="chip-line" />
                  </div>
                  <div className="digital-card__contactless" aria-label="Contactless Pass">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C5A85A" strokeWidth="2">
                      <path d="M8.5 16.5a5 5 0 0 1 0-7" strokeLinecap="round" />
                      <path d="M12 19a8.5 8.5 0 0 0 0-14" strokeLinecap="round" />
                      <path d="M15.5 21.5a12 12 0 0 0 0-19" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Card Number */}
                <div className="digital-card__id-row">
                  <span className="digital-card__id-label">MEMBERSHIP NO.</span>
                  <div className="digital-card__id-val">{formatCardNumber(membership.membership_id)}</div>
                </div>

                {/* Card Bottom Row: Name, Joined, Status */}
                <div className="digital-card__footer">
                  <div className="digital-card__holder">
                    <span className="card-label">Privilege Cardholder</span>
                    <strong className="card-name">{membership.member_name}</strong>
                  </div>

                  <div className="digital-card__meta">
                    <span className="card-label">Valid Thru</span>
                    <strong className="card-val">Lifetime</strong>
                  </div>

                  <div className="digital-card__status">
                    <span className="status-indicator-dot" />
                    <span className="status-text">{membership.status.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Under Card */}
            <div className="membership-actions-row">
              <button
                type="button"
                className="btn-luxury-outline btn-luxury-outline--sm"
                onClick={handleCopyId}
              >
                {copied ? '✓ Copied ID' : '📋 Copy Membership ID'}
              </button>
              <Link to="/hotels" className="btn-gold btn-gold--sm">
                Book with Member Tariff
              </Link>
            </div>
          </div>

          {/* Right Column: Key Membership Details Box */}
          <div className="membership-info-column">
            <div className="luxury-box">
              <span className="section-kicker section-kicker--gold">Credentials Overview</span>
              <h2 className="luxury-box__title">Membership Summary</h2>
              <div className="gold-ornament" style={{ margin: '0.8rem 0 1.25rem' }} />

              <div className="membership-summary-list">
                <div className="summary-item">
                  <span className="summary-label">Member Name</span>
                  <strong className="summary-value">{membership.member_name}</strong>
                </div>

                <div className="summary-item">
                  <span className="summary-label">Membership ID</span>
                  <strong className="summary-value text-gold">{membership.membership_id}</strong>
                </div>

                <div className="summary-item">
                  <span className="summary-label">Membership Type</span>
                  <strong className="summary-value">{membership.membership_type}</strong>
                </div>

                <div className="summary-item">
                  <span className="summary-label">Membership Status</span>
                  <span className="status-badge-active">
                    <span className="status-indicator-dot" /> {membership.status}
                  </span>
                </div>

                <div className="summary-item">
                  <span className="summary-label">Membership Join Date</span>
                  <strong className="summary-value">{formatDate(membership.joined_at)}</strong>
                </div>

                <div className="summary-item">
                  <span className="summary-label">Registered Email</span>
                  <strong className="summary-value text-muted">{membership.email}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="luxury-box mt-3">
          <span className="section-kicker section-kicker--gold">Exclusive Privileges</span>
          <h2 className="luxury-box__title">Included Membership Benefits</h2>
          <div className="gold-ornament" style={{ margin: '0.8rem 0 1.5rem' }} />

          <p className="text-muted" style={{ maxWidth: 760, marginBottom: '2rem' }}>
            As a distinguished member of the Zenvora Privilege Circle, these bespoke courtesies and tier privileges are automatically extended to you across all our hand-curated luxury hotels.
          </p>

          <div className="membership-benefits-grid">
            {membership.benefits?.map((benefit) => (
              <div key={benefit.title} className="benefit-card">
                <div className="benefit-card__icon">{benefit.icon}</div>
                <div className="benefit-card__body">
                  <h3 className="benefit-card__title">{benefit.title}</h3>
                  <p className="benefit-card__desc">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

