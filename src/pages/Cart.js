import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { formatRentalDate, isValidRentalDateRange } from '../utils/rentalDates';

const Cart = () => {
  const navigate = useNavigate();
  const [availabilityByProduct, setAvailabilityByProduct] = useState({});
  const {
    items,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    totalItems,
    totalPrice,
    bookingDates,
    hasSelectedDates
  } = useCart();

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!items.length || !isValidRentalDateRange(bookingDates.startDate, bookingDates.endDate)) {
        setAvailabilityByProduct({});
        return;
      }

      try {
        const products = await api.getProducts(bookingDates);
        setAvailabilityByProduct(
          products.reduce((accumulator, product) => ({
            ...accumulator,
            [product._id]: product.availableQuantity
          }), {})
        );
      } catch (error) {
        console.error('Failed to fetch cart availability:', error);
      }
    };

    fetchAvailability();
  }, [items, bookingDates.startDate, bookingDates.endDate]);

  const handleProceedToBooking = () => {
    if (items.length === 0 || !isValidRentalDateRange(bookingDates.startDate, bookingDates.endDate)) {
      return;
    }

    navigate('/booking');
  };

  return (
    <>
      <section id="hero" style={{ minHeight: '50vh', padding: '8rem 5% 4rem' }}>
        <div className="hero-text">
          <div className="hero-tag">Your Cart</div>
          <h1 className="hero-title">
            Review Your<br />Selected<br /><em>Furniture</em>
          </h1>
          <p className="hero-desc">
            Adjust quantities, review pricing, and continue to booking when your selection is ready.
          </p>
          <p style={{ color: 'var(--muted)', maxWidth: '560px' }}>
            {hasSelectedDates
              ? `Selected rental dates: ${formatRentalDate(bookingDates.startDate)} to ${formatRentalDate(bookingDates.endDate)}`
              : 'Choose rental dates in the catalog before continuing.'}
          </p>
          <div className="hero-btns">
            <Link to="/products" className="btn-primary">Browse More Items</Link>
            <button
              type="button"
              className="btn-outline"
              onClick={handleProceedToBooking}
              disabled={items.length === 0 || !hasSelectedDates}
              style={{ opacity: items.length === 0 || !hasSelectedDates ? 0.6 : 1 }}
            >
              Proceed to Booking
            </button>
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--warm-white)' }}>
        <div className="section-header">
          <div className="section-tag">Booking Cart</div>
          <h2 className="section-title">Selected Products</h2>
          <p className="section-sub">
            {totalItems > 0
              ? `${totalItems} item${totalItems > 1 ? 's' : ''} ready for booking`
              : 'Your cart is empty. Add products from the catalog to continue.'}
          </p>
          {hasSelectedDates && (
            <p className="section-sub" style={{ marginTop: '0.5rem' }}>
              Rental period: {formatRentalDate(bookingDates.startDate)} to {formatRentalDate(bookingDates.endDate)}
            </p>
          )}
        </div>

        {items.length === 0 ? (
          <div className="cart-shell">
            <div className="cart-empty-state">
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', marginBottom: '0.75rem' }}>
                No items in cart
              </h3>
              <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
                Add furniture from the catalog before proceeding to the booking form.
              </p>
              <Link to="/products" className="btn-primary">Go to Catalog</Link>
            </div>
          </div>
        ) : (
          <div className="cart-shell">
            <div className="cart-items-panel">
              {items.map((item) => (
                <div key={item.productId} className="cart-line-item">
                  <div className="cart-line-media">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="cart-line-content">
                    <div>
                      <div className="cart-line-title">{item.name}</div>
                      <div className="cart-line-price">₹{item.price.toLocaleString('en-IN')} / per day</div>
                    </div>
                    <div className="cart-line-actions">
                      <div className="cart-quantity-control">
                        <button type="button" onClick={() => decrementQuantity(item.productId)}>-</button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => incrementQuantity(item.productId)}
                          disabled={
                            availabilityByProduct[item.productId] !== undefined &&
                            item.quantity >= availabilityByProduct[item.productId]
                          }
                        >
                          +
                        </button>
                      </div>
                      {availabilityByProduct[item.productId] !== undefined && (
                        <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                          Available for selected dates: {availabilityByProduct[item.productId]}
                        </div>
                      )}
                      <div className="cart-line-subtotal">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                      <button
                        type="button"
                        className="cart-remove-btn"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="cart-summary-panel">
              <div className="cart-summary-card">
                <div className="section-tag">Summary</div>
                <h3 className="section-title" style={{ fontSize: '2rem' }}>Booking Total</h3>
                <div className="cart-summary-row">
                  <span>Items</span>
                  <strong>{totalItems}</strong>
                </div>
                <div className="cart-summary-row">
                  <span>Total price</span>
                  <strong>₹{totalPrice.toLocaleString('en-IN')}</strong>
                </div>
                <button type="button" className="form-submit" onClick={handleProceedToBooking}>
                  Proceed to Booking
                </button>
                {!hasSelectedDates && (
                  <p style={{ marginTop: '0.75rem', color: '#b42318', fontSize: '0.92rem' }}>
                    Please go back to the catalog and choose rental dates first.
                  </p>
                )}
              </div>
            </aside>
          </div>
        )}
      </section>
    </>
  );
};

export default Cart;
