import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { registerUser, clearAuthError, selectAuthStatus, selectAuthError, selectUser } from '../features/auth/authSlice';
import { showToast } from '../features/ui/uiSlice';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const user = useSelector(selectUser);

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      errs.name = 'Full name must be at least 2 characters.';
    }
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Please provide a valid email address.';
    }
    if (!form.password || form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    if (form.password !== form.confirm) {
      errs.confirm = 'Passwords do not match.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    const resultAction = await dispatch(registerUser({ name: form.name, email: form.email, password: form.password }));
    if (registerUser.fulfilled.match(resultAction)) {
      dispatch(showToast('Welcome to Zenvora! Your account has been created.'));
      navigate('/', { replace: true });
    }
  };

  return (
    <>
      <Helmet>
        <title>Register | Zenvora Luxury Hotels</title>
      </Helmet>

      <div className="auth-luxury-wrap">
        <div className="auth-luxury-card">
          <div className="auth-brand">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#AD8B3A" stroke="#C5A85A" strokeWidth="1.2"/>
            </svg>
            <h2 className="auth-brand-name">ZENVORA</h2>
            <span className="auth-brand-tag">HOTELS</span>
          </div>

          <h1 className="auth-luxury-title">Privilege Circle</h1>
          <p className="auth-luxury-sub">Register to explore member-only privileges and seamless reservations.</p>

          {error && (
            <div className="auth-error-banner" role="alert">
              ⚠️ {error}
            </div>
          )}

          <form className="auth-luxury-form" onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label className="label" htmlFor="reg-name">Full Name *</label>
              <input
                id="reg-name"
                className={`input ${fieldErrors.name ? 'input--invalid' : ''}`}
                type="text"
                name="name"
                placeholder="e.g. Princess Gayatri"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                required
              />
              {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
            </div>

            <div className="form-field">
              <label className="label" htmlFor="reg-email">Email Address *</label>
              <input
                id="reg-email"
                className={`input ${fieldErrors.email ? 'input--invalid' : ''}`}
                type="email"
                name="email"
                placeholder="you@domain.com"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                required
              />
              {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
            </div>

            <div className="form-field">
              <label className="label" htmlFor="reg-password">Create Password *</label>
              <input
                id="reg-password"
                className={`input ${fieldErrors.password ? 'input--invalid' : ''}`}
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                required
              />
              {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
            </div>

            <div className="form-field">
              <label className="label" htmlFor="reg-confirm">Confirm Password *</label>
              <input
                id="reg-confirm"
                className={`input ${fieldErrors.confirm ? 'input--invalid' : ''}`}
                type="password"
                name="confirm"
                placeholder="Repeat password"
                autoComplete="new-password"
                value={form.confirm}
                onChange={handleChange}
                required
              />
              {fieldErrors.confirm && <p className="field-error">{fieldErrors.confirm}</p>}
            </div>

            <button
              type="submit"
              className="btn-gold w-100 btn-gold--lg mt-2"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          <div className="auth-switch-links">
            <p>
              Already a member? <Link to="/login">Sign In</Link>
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
