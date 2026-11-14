import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import HomePage from './pages/HomePage';
import HotelListPage from './pages/HotelListPage';
import HotelDetailsPage from './pages/HotelDetailsPage';
import HotelFormPage from './pages/HotelFormPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import BookingsPage from './pages/BookingsPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MembershipPage from './pages/MembershipPage';
import { fetchMe } from './features/auth/authSlice';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const dispatch = useDispatch();

  // Restore auth session on page load/refresh if a token exists in localStorage
  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <div className="app-shell">
      <ScrollToTop />
      <Navbar />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hotels" element={<HotelListPage />} />
          <Route path="/hotels/add" element={<HotelFormPage />} />
          <Route path="/hotels/:id" element={<HotelDetailsPage />} />
          <Route path="/hotels/:id/edit" element={<HotelFormPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
      <Toast />
    </div>
  );
}
