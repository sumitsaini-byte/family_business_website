import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Services from './pages/Services';
import Booking from './pages/Booking';
import Cart from './pages/Cart';
import PaymentStatus from './pages/PaymentStatus';
import PackageInquiry from './pages/PackageInquiry';
import Reviews from './pages/Reviews';
import Admin from './pages/Admin';
import AdminBookings from './pages/AdminBookings';
import AdminBookingDetails from './pages/AdminBookingDetails';
import AdminPackageInquiries from './pages/AdminPackageInquiries';
import AdminPackageInquiryDetails from './pages/AdminPackageInquiryDetails';
import AdminReviews from './pages/AdminReviews';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminProducts from './pages/AdminProducts';
import AdminCarousel from './pages/AdminCarousel';
import AdminGallery from './pages/AdminGallery';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import AdminInventory from './pages/AdminInventory';

// Layout component for pages with navbar
const PageWithNavbar = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<PageWithNavbar><Home /></PageWithNavbar>} />
        <Route path="/products" element={<PageWithNavbar><Products /></PageWithNavbar>} />
        <Route path="/products/:id" element={<PageWithNavbar><ProductDetails /></PageWithNavbar>} />
        <Route path="/cart" element={<PageWithNavbar><Cart /></PageWithNavbar>} />
        <Route path="/about" element={<PageWithNavbar><About /></PageWithNavbar>} />
        <Route path="/services" element={<PageWithNavbar><Services /></PageWithNavbar>} />
        <Route path="/booking" element={<PageWithNavbar><Booking /></PageWithNavbar>} />
        <Route path="/payment-status" element={<PageWithNavbar><PaymentStatus /></PageWithNavbar>} />
        <Route path="/package-inquiry" element={<PageWithNavbar><PackageInquiry /></PageWithNavbar>} />
        <Route path="/login" element={<Login />} />
        <Route path="/reviews" element={<PageWithNavbar><Reviews /></PageWithNavbar>} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin-bookings" element={<AdminBookings />} />
        <Route path="/admin-bookings/:id" element={<AdminBookingDetails />} />
        <Route path="/admin-package-inquiries" element={<AdminPackageInquiries />} />
        <Route path="/admin-package-inquiries/:id" element={<AdminPackageInquiryDetails />} />
        <Route path="/admin-reviews" element={<AdminReviews />} />
        <Route path="/admin-users" element={<AdminUserManagement />} />
        <Route path="/admin-products" element={<AdminProducts />} />
        <Route path="/admin-inventory" element={<AdminInventory />} />
        <Route path="/admin-carousel" element={<AdminCarousel />} />
        <Route path="/admin-gallery" element={<AdminGallery />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
