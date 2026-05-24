import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { getMinimumEndDate, isValidRentalDateRange, formatRentalDate } from '../utils/rentalDates';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const { addToCart, bookingDates, updateBookingDates, hasSelectedDates } = useCart();

  useEffect(() => {
    fetchProducts();
  }, [bookingDates.startDate, bookingDates.endDate]);

  useEffect(() => {
    filterProducts();
  }, [products, activeFilter]);

  const fetchProducts = async () => {
    try {
      const data = await api.getProducts(
        isValidRentalDateRange(bookingDates.startDate, bookingDates.endDate)
          ? bookingDates
          : {}
      );
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (activeFilter === 'all') {
      setFilteredProducts(products);
    } else if (activeFilter === 'featured') {
      setFilteredProducts(products.filter(p => p.featured));
    } else {
      setFilteredProducts(products.filter(p => p.category === activeFilter));
    }
  };

  const getDefaultImage = (productName) => {
    return `https://via.placeholder.com/400x300/8B7355/FFFFFF?text=${encodeURIComponent(productName)}`;
  };

  const getImageUrl = (product) => {
    if (product.images && product.images.length > 0) {
      const thumbnailImage = product.images[product.thumbnailIndex || 0];
      return `http://localhost:3000/uploads/products/${thumbnailImage.filename}`;
    }
    return getDefaultImage(product.name);
  };

  const getCategories = () => {
    const categories = [...new Set(products.map(p => p.category))];
    return categories.sort();
  };

  useEffect(() => {
    const handleScroll = () => {
      const reveals = document.querySelectorAll('.reveal');
      const newVisibleSections = new Set(visibleSections);
      
      reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
          newVisibleSections.add(element);
        }
      });
      
      setVisibleSections(newVisibleSections);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleSections]);

  const handleQuantityChange = (product, nextValue) => {
    const requestedValue = Math.max(1, Number(nextValue) || 1);
    const maxQuantity = hasSelectedDates
      ? Math.max(1, Number(product.availableQuantity || 0))
      : requestedValue;
    const normalizedValue = hasSelectedDates
      ? Math.min(requestedValue, maxQuantity)
      : requestedValue;

    setSelectedQuantities((current) => ({
      ...current,
      [product._id]: normalizedValue
    }));
  };

  const getSelectedQuantity = (productId) => {
    return selectedQuantities[productId] || 1;
  };

  const handleDateChange = (event) => {
    const { name, value } = event.target;
    const nextDates = {
      ...bookingDates,
      [name]: value
    };

    if (name === 'startDate' && nextDates.endDate && nextDates.endDate <= value) {
      nextDates.endDate = '';
    }

    updateBookingDates(nextDates);
    setAvailabilityMessage('');
  };

  const handleAddToCart = (product) => {
    if (!isValidRentalDateRange(bookingDates.startDate, bookingDates.endDate)) {
      setAvailabilityMessage('Please choose rental start and end dates first.');
      return;
    }

    if (!product.inStock || Number(product.availableQuantity || 0) <= 0) {
      setAvailabilityMessage(`${product.name} is not available for the selected dates.`);
      return;
    }

    if (getSelectedQuantity(product._id) > Number(product.availableQuantity || 0)) {
      setAvailabilityMessage(`Only ${product.availableQuantity} item(s) of ${product.name} are available for those dates.`);
      return;
    }

    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: getSelectedQuantity(product._id),
      image: getImageUrl(product),
      maxQuantity: product.availableQuantity
    });
    setAvailabilityMessage('');
  };

  const ProductIcon = ({ category }) => {
    if (category === 'chair') {
      return (
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-chair" style={{width: '60px', height: '60px'}}>
          <rect x="25" y="38" width="30" height="4" rx="2" fill="#C9A84C"/>
          <rect x="25" y="28" width="30" height="12" rx="3" fill="#C9A84C"/>
          <rect x="27" y="42" width="4" height="18" rx="2" fill="#C9A84C"/>
          <rect x="49" y="42" width="4" height="18" rx="2" fill="#C9A84C"/>
          <rect x="21" y="26" width="4" height="34" rx="2" fill="#C9A84C"/>
          <rect x="55" y="26" width="4" height="34" rx="2" fill="#C9A84C"/>
        </svg>
      );
    } else if (category === 'sofa') {
      return (
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-chair" style={{width: '60px', height: '60px'}}>
          <rect x="10" y="44" width="60" height="7" rx="3" fill="#C9A84C"/>
          <rect x="8" y="34" width="64" height="12" rx="4" fill="#C9A84C"/>
          <rect x="12" y="51" width="7" height="12" rx="2" fill="#C9A84C"/>
          <rect x="61" y="51" width="7" height="12" rx="2" fill="#C9A84C"/>
          <rect x="8" y="30" width="7" height="24" rx="3" fill="#C9A84C"/>
          <rect x="65" y="30" width="7" height="24" rx="3" fill="#C9A84C"/>
        </svg>
      );
    } else if (category === 'table') {
      return (
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-chair" style={{width: '60px', height: '60px'}}>
          <rect x="12" y="35" width="56" height="5" rx="2" fill="#C9A84C"/>
          <rect x="17" y="40" width="5" height="25" rx="2" fill="#C9A84C"/>
          <rect x="58" y="40" width="5" height="25" rx="2" fill="#C9A84C"/>
          <ellipse cx="40" cy="35" rx="28" ry="5" fill="#C9A84C" opacity="0.4"/>
        </svg>
      );
    } else {
      return (
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-chair" style={{width: '60px', height: '60px'}}>
          <path d="M40 15 L45 30 L60 30 L48 40 L52 55 L40 46 L28 55 L32 40 L20 30 L35 30 Z" fill="#C9A84C" opacity="0.6"/>
          <rect x="36" y="55" width="8" height="15" rx="2" fill="#C9A84C" opacity="0.4"/>
        </svg>
      );
    }
  };

  return (
    <>
      {/* HERO */}
      <section id="hero" style={{minHeight: '60vh', padding: '8rem 5% 4rem'}}>
        <div className="hero-text">
          <div className="hero-tag">Our Collection</div>
          <h1 className="hero-title">
            Premium Furniture<br/>For Every<br/><em>Event</em>
          </h1>
          <p className="hero-desc">
            Choose your rental dates first, then browse the collection with live availability for those dates.
          </p>
          <div className="hero-btns">
            <Link to="/booking" className="btn-primary">Get a Quote</Link>
            <a href="#catalog" className="btn-outline">Browse Items</a>
          </div>
        </div>
      </section>

      {/* CATALOG */}
      <section id="catalog">
        <div className={`section-header ${visibleSections.has(document.querySelector('#catalog .section-header')) ? 'visible' : ''}`}>
          <div className="section-tag">Our Collection</div>
          <h2 className="section-title">Browse Our Catalog</h2>
          <p className="section-sub">Pick your rental dates to see what is available before adding anything to the cart.</p>
        </div>
        <div style={{ maxWidth: '980px', margin: '0 auto 2rem', background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 10px 28px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Rental Start Date</label>
              <input
                type="date"
                name="startDate"
                value={bookingDates.startDate}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
                style={{ width: '100%', padding: '0.85rem', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Rental End Date</label>
              <input
                type="date"
                name="endDate"
                value={bookingDates.endDate}
                onChange={handleDateChange}
                min={getMinimumEndDate(bookingDates.startDate) || new Date().toISOString().split('T')[0]}
                style={{ width: '100%', padding: '0.85rem', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
              {hasSelectedDates && isValidRentalDateRange(bookingDates.startDate, bookingDates.endDate)
                ? `Showing availability from ${formatRentalDate(bookingDates.startDate)} to ${formatRentalDate(bookingDates.endDate)}`
                : 'Select both dates to unlock Add to Cart and live availability.'}
            </div>
          </div>
          {availabilityMessage && (
            <div style={{ marginTop: '1rem', color: '#b42318', fontSize: '0.95rem', fontWeight: '600' }}>
              {availabilityMessage}
            </div>
          )}
        </div>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} 
            onClick={() => setActiveFilter('all')}
          >
            All Products
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'featured' ? 'active' : ''}`} 
            onClick={() => setActiveFilter('featured')}
          >
            Featured
          </button>
          {getCategories().map(category => (
            <button 
              key={category}
              className={`filter-btn ${activeFilter === category ? 'active' : ''}`} 
              onClick={() => setActiveFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="product-grid" id="productGrid">
          {filteredProducts.map(product => (
            <div key={product._id} className="product-card" data-cat={product.category}>
              <div className="product-img">
                <img 
                  src={getImageUrl(product)}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.src = getDefaultImage(product.name);
                  }}
                />
                {product.featured && <div className="product-badge">Featured</div>}
                {product.images && product.images.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.8rem'
                  }}>
                    {product.images.length} photos
                  </div>
                )}
              </div>
              <div className="product-info">
                <div className="product-cat">{product.category}</div>
                <div className="product-name">{product.name}</div>
                <div className="product-desc">{product.description}</div>
                <div style={{
                  marginBottom: '0.85rem',
                  color: hasSelectedDates
                    ? (product.availableQuantity > 0 ? '#15803d' : '#b42318')
                    : '#6b7280',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>
                  {hasSelectedDates
                    ? `${product.availableQuantity} item(s) available for selected dates`
                    : `Total stock: ${product.totalQuantity ?? 1}. Choose dates to check availability.`}
                </div>
                <div className="product-quantity-row">
                  <label htmlFor={`quantity-${product._id}`} className="product-quantity-label">
                    Quantity
                  </label>
                  <div className="product-quantity-control">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(product, getSelectedQuantity(product._id) - 1)}
                    >
                      -
                    </button>
                    <input
                      id={`quantity-${product._id}`}
                      type="number"
                      min="1"
                      max={hasSelectedDates ? Math.max(1, Number(product.availableQuantity || 1)) : undefined}
                      value={getSelectedQuantity(product._id)}
                      onChange={(e) => handleQuantityChange(product, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(product, getSelectedQuantity(product._id) + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="product-footer">
                  <div className="product-price">Rs {product.price} <span>/ rental</span></div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="product-btn"
                      onClick={() => handleAddToCart(product)}
                      disabled={!hasSelectedDates || !product.inStock || Number(product.availableQuantity || 0) <= 0}
                      style={{ opacity: !hasSelectedDates || !product.inStock || Number(product.availableQuantity || 0) <= 0 ? 0.65 : 1 }}
                    >
                      {!hasSelectedDates
                        ? 'Choose Dates'
                        : Number(product.availableQuantity || 0) > 0
                          ? 'Add to Cart'
                          : 'Unavailable'}
                    </button>
                    <Link 
                      to={`/products/${product._id}`}
                      style={{
                        textDecoration: 'none',
                        backgroundColor: '#8B7355',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Products;
