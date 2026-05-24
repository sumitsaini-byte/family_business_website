import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer>
      <div className="footer-top">
        <div>
          <div className="footer-brand">Furnish <span>&</span> Co.</div>
          <p className="footer-tagline">Premium furniture rentals for weddings, corporate events, and all occasions. Delivered, set up, and collected.</p>
        </div>
        <div className="footer-col">
          <div className="footer-col-title">Quick Links</div>
          <Link to="/about">About Us</Link>
          <Link to="/products">Catalog</Link>
          <Link to="/services">Services</Link>
          <a href="/#testimonials">Reviews</a>
        </div>
        <div className="footer-col">
          <div className="footer-col-title">Categories</div>
          <Link to="/products">Chairs</Link>
          <Link to="/products">Sofas</Link>
          <Link to="/products">Tables</Link>
          <Link to="/products">Decor Items</Link>
        </div>
        <div className="footer-col">
          <div className="footer-col-title">Contact</div>
          <a href="tel:+919876543210">+91 98765 43210</a>
          <a href="mailto:bookings@furnishandco.in">bookings@furnishandco.in</a>
          <a href="#">123 Market Road, City</a>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-copy">2026 Furnish and Co. All rights reserved.</div>
        <div className="footer-copy">Designed with care for your events</div>
      </div>
    </footer>
  );
};

export default Footer;
