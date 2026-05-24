import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { uniqueItemsCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
        <Link to="/" className="nav-logo">Furnish <span>&</span> Co.</Link>
        <ul className={`nav-links ${menuOpen ? 'mobile-open' : ''}`}>
          <li><Link to="/about" onClick={closeMenu}>About</Link></li>
          <li><Link to="/products" onClick={closeMenu}>Catalog</Link></li>
          <li><Link to="/services" onClick={closeMenu}>Services</Link></li>
          <li><Link to="/reviews" onClick={closeMenu}>Reviews</Link></li>
          <li>
            <Link to="/cart" onClick={closeMenu} className="nav-cart-link">
              Cart
              {uniqueItemsCount > 0 && <span className="nav-cart-badge">{uniqueItemsCount}</span>}
            </Link>
          </li>
          <li><Link to="/booking" className="nav-cta" onClick={closeMenu}>Book Now</Link></li>
        </ul>
        <div className="hamburger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>
      <style jsx>{`
        .nav-links.mobile-open {
          display: flex !important;
          flex-direction: column !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background: rgba(247,244,239,0.97) !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 2rem !important;
          z-index: 3000 !important;
          backdrop-filter: blur(12px) !important;
        }
      `}</style>
    </>
  );
};

export default Navbar;
