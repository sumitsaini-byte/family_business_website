import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
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

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/login';
  };

  return (
    <>
      <nav id="admin-navbar" className={scrolled ? 'scrolled' : ''}>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.55rem',
          fontWeight: '600',
          letterSpacing: '0.02em',
          color: 'var(--charcoal)',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{color: 'var(--gold)'}}>Admin</span> Panel
        </div>
        
        <ul className={`admin-nav-links ${menuOpen ? 'mobile-open' : ''}`}>
          <li>
            <Link 
              to="/admin" 
              onClick={closeMenu}
              className={location.pathname === '/admin' ? 'active' : ''}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/admin-bookings" 
              onClick={closeMenu}
              className={location.pathname === '/admin-bookings' ? 'active' : ''}
            >
              Bookings
            </Link>
          </li>
          <li>
            <Link 
              to="/admin-reviews" 
              onClick={closeMenu}
              className={location.pathname === '/admin-reviews' ? 'active' : ''}
            >
              Reviews
            </Link>
          </li>
          <li>
            <Link 
              to="/admin-products" 
              onClick={closeMenu}
              className={location.pathname === '/admin-products' ? 'active' : ''}
            >
              Products
            </Link>
          </li>
          <li>
            <Link 
              to="/admin-inventory" 
              onClick={closeMenu}
              className={location.pathname === '/admin-inventory' ? 'active' : ''}
            >
              Inventory
            </Link>
          </li>
          <li>
            <Link 
              to="/admin-package-inquiries" 
              onClick={closeMenu}
              className={location.pathname.startsWith('/admin-package-inquiries') ? 'active' : ''}
            >
              Package Leads
            </Link>
          </li>
          <li>
            <Link 
              to="/admin-carousel" 
              onClick={closeMenu}
              className={location.pathname === '/admin-carousel' ? 'active' : ''}
            >
              Carousel
            </Link>
          </li>
          <li>
            <Link 
              to="/admin-gallery" 
              onClick={closeMenu}
              className={location.pathname === '/admin-gallery' ? 'active' : ''}
            >
              Gallery
            </Link>
          </li>
          <li>
            <Link 
              to="/admin-users" 
              onClick={closeMenu}
              className={location.pathname === '/admin-users' ? 'active' : ''}
            >
              Users
            </Link>
          </li>
          <li>
            <button onClick={handleLogout} className="admin-logout-btn">
              Logout
            </button>
          </li>
        </ul>
        
        <div className="admin-hamburger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>

      <style jsx>{`
        #admin-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.4rem 5%;
          background: rgba(28, 28, 28, 0.95);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid var(--gold);
          transition: box-shadow 0.3s;
        }
        
        #admin-navbar.scrolled {
          box-shadow: 0 2px 30px rgba(0,0,0,0.1);
        }

        .admin-nav-links {
          display: flex;
          gap: 2.4rem;
          list-style: none;
          align-items: center;
        }

        .admin-nav-links a {
          text-decoration: none;
          color: #fff;
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          transition: color 0.2s;
          position: relative;
        }

        .admin-nav-links a::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--gold);
          transform: scaleX(0);
          transition: transform 0.25s;
        }

        .admin-nav-links a:hover {
          color: var(--gold);
        }

        .admin-nav-links a:hover::after {
          transform: scaleX(1);
        }

        .admin-nav-links a.active {
          color: var(--gold);
        }

        .admin-nav-links a.active::after {
          transform: scaleX(1);
        }

        .admin-logout-btn {
          background: var(--gold);
          color: var(--charcoal) !important;
          padding: 0.55rem 1.4rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.2s !important;
          text-decoration: none !important;
        }

        .admin-logout-btn:hover {
          background: #fff !important;
          color: var(--charcoal) !important;
          transform: translateY(-1px);
        }

        .admin-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          z-index: 2001;
          position: relative;
        }

        .admin-hamburger span {
          width: 24px;
          height: 1.5px;
          background: #fff;
          transition: all 0.3s;
        }

        .admin-nav-links.mobile-open {
          display: flex !important;
          flex-direction: column !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background: rgba(28, 28, 28, 0.98) !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 2rem !important;
          z-index: 3000 !important;
          backdrop-filter: blur(12px) !important;
        }

        @media (max-width: 900px) {
          .admin-nav-links {
            display: none;
          }
          .admin-hamburger {
            display: flex;
          }
        }
      `}</style>
    </>
  );
};

export default AdminNavbar;
