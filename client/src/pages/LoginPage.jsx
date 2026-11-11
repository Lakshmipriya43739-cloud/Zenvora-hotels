import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { loginUser, clearAuthError, selectAuthStatus, selectAuthError, selectUser } from '../features/auth/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const user = useSelector(selectUser);

  const [form, setForm] = useState({ email: '', password: '' });

  // Already logged in → navigate to home or admin
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(loginUser({ email: form.email, password: form.password }));
  };

  // Quick fill for testing
  const fillAdmin = () => {
    setForm({ email: 'admin@zenvora.com', password: 'Admin@1234' });
  };

  return (
    <>
      <Helmet>
        <title>Sign In | Zenvora Luxury Hotels</title>
      </Helmet>

      <div className="auth-luxury-wrap">
        <div className="auth-luxury-card">
          {/* Brand Emblem */}
          <div className="auth-brand">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#AD8B3A" stroke="#C5A85A" strokeWidth="1.2"/>
            </svg>
            <h2 className="auth-brand-name">ZENVORA</h2>
            <span className="auth-brand-tag">HOTELS</span>
          </div>

          <h1 className="auth-luxury-title">Welcome Back</h1>
          <p className="auth-luxury-sub">Sign in to manage reservations or access administrative privileges.</p>

          {error && (
            <div className="auth-error-banner" role="alert">
              ⚠️ {error}
            </div>
          )}

          <form className="auth-luxury-form" onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label className="label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                className="input"
                type="email"
                name="email"
                placeholder="you@domain.com"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label className="label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                className="input"
                type="password"
                name="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-gold w-100 btn-gold--lg mt-2"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Authenticating…' : 'SIGN IN'}
            </button>
          </form>

          {/* Helper button for admin login evaluation */}
          <div className="demo-credentials-box">
            <p className="demo-title">Administrator Demo Credentials:</p>
            <p className="demo-creds">
              <code>admin@zenvora.com</code> / <code>Admin@1234</code>
            </p>
            <button type="button" className="btn-demo-fill" onClick={fillAdmin}>
              Auto-fill Admin Credentials
            </button>
          </div>

          <div className="auth-switch-links">
            <p>
              New to Zenvora? <Link to="/register">Create a Guest Account</Link>
            </p>
            <p className="mt-1">
              <Link to="/">← Return to Homepage</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
