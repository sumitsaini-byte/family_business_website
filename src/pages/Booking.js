import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { formatRentalDate, getMinimumEndDate, isValidRentalDateRange } from '../utils/rentalDates';

const initialDemoPaymentForm = {
  cardNumber: '4111 1111 1111 1111',
  cardName: 'Demo Student',
  expiry: '12/28',
  cvv: '123'
};

const Booking = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    startDate: '',
    endDate: '',
    additionalRequirements: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateError, setDateError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [pendingBookingData, setPendingBookingData] = useState(null);
  const [showDemoPaymentModal, setShowDemoPaymentModal] = useState(false);
  const [demoPaymentForm, setDemoPaymentForm] = useState(initialDemoPaymentForm);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const { items, totalPrice, clearCart, bookingDates, updateBookingDates, hasSelectedDates } = useCart();

  // Responsive form styles
  const formStyles = {
    formGroup: {
      marginBottom: '1.5rem'
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr'
      }
    },
    formInput: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid var(--border)',
      borderRadius: '4px',
      fontSize: '0.9rem',
      fontFamily: "'DM Sans', sans-serif",
      color: '#2c3e50',
      backgroundColor: 'white',
      '@media (max-width: 768px)': {
        padding: '0.875rem', // Larger touch targets on mobile
        fontSize: '16px' // iOS Safari zoom fix
      }
    },
    phoneInput: {
      '@media (max-width: 768px)': {
        fontSize: '16px' // Prevent zoom on iOS
      }
    },
    formLabel: {
      display: 'block',
      marginBottom: '0.5rem',
      fontSize: '0.9rem',
      color: '#2c3e50',
      fontWeight: '500',
      '@media (max-width: 768px)': {
        fontSize: '0.95rem' // Slightly larger on mobile
      }
    },
    errorText: {
      color: '#e74c3c',
      fontSize: '0.85rem',
      marginTop: '0.5rem',
      '@media (max-width: 768px)': {
        fontSize: '0.9rem' // Readable on mobile
      }
    }
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

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      startDate: bookingDates.startDate,
      endDate: bookingDates.endDate
    }));
  }, [bookingDates.startDate, bookingDates.endDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear relevant error when user types
    if (name === 'phone') setPhoneError('');
    if (name === 'startDate' || name === 'endDate') setDateError('');
    if (submitError) setSubmitError('');

    if (name === 'startDate' || name === 'endDate') {
      setFormData((prev) => {
        const next = {
          ...prev,
          [name]: value
        };

        if (name === 'startDate' && next.endDate && next.endDate <= value) {
          next.endDate = '';
        }

        updateBookingDates({
          startDate: name === 'startDate' ? value : next.startDate,
          endDate: name === 'endDate' ? value : next.endDate
        });

        return next;
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateDateRange = (startDateValue, endDateValue) => {
    if (!startDateValue || !endDateValue) {
      setDateError('Please select both rental start and end dates');
      return false;
    }

    const selectedStartDate = new Date(startDateValue);
    const selectedEndDate = new Date(endDateValue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const twoMonthsFromNow = new Date(today);
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);

    if (selectedStartDate < today) {
      setDateError('Rental start date cannot be in the past');
      return false;
    }

    if (selectedEndDate <= selectedStartDate) {
      setDateError('Rental end date must be after the start date');
      return false;
    }

    if (selectedEndDate > twoMonthsFromNow) {
      setDateError('Rental end date cannot be more than 2 months from now');
      return false;
    }

    setDateError('');
    return true;
  };

  const validatePhone = (phone) => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    // Check if exactly 10 digits
    return cleanPhone.length === 10;
  };

  const closeDemoPaymentModal = () => {
    setShowDemoPaymentModal(false);
    setPendingBookingData(null);
    setDemoPaymentForm(initialDemoPaymentForm);
    setIsSubmitting(false);
  };

  const handleDemoPaymentInputChange = (e) => {
    const { name, value } = e.target;
    setDemoPaymentForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleDemoPaymentSubmit = async (e) => {
    e.preventDefault();

    if (!pendingBookingData) {
      return;
    }

    try {
      setIsSubmitting(true);
      await api.createDemoBooking(pendingBookingData);
      setShowDemoPaymentModal(false);
      setPendingBookingData(null);
      setDemoPaymentForm(initialDemoPaymentForm);
      clearCart();
      setFormSubmitted(true);
    } catch (error) {
      console.error('Error completing demo payment:', error);
      setSubmitError(error.message || 'We could not complete the demo payment.');
      setFormSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    if (!validateDateRange(formData.startDate, formData.endDate)) {
      setFormSubmitted(false);
      return;
    }

    if (!validatePhone(formData.phone)) {
      setPhoneError('Please enter a valid 10-digit phone number');
      setFormSubmitted(false);
      return;
    }

    if (items.length === 0) {
      setSubmitError('Your cart is empty. Add at least one product before booking.');
      setFormSubmitted(false);
      return;
    }

    if (!isValidRentalDateRange(formData.startDate, formData.endDate)) {
      setSubmitError('Please choose a valid rental date range before continuing.');
      setFormSubmitted(false);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const bookingData = {
        ...formData,
        eventDate: formData.startDate,
        startDate: formData.startDate,
        endDate: formData.endDate,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalPrice
      };

      const paymentOrder = await api.createPaymentOrder(bookingData);
      setPaymentSummary(paymentOrder);

      if (paymentOrder.paymentMode === 'demo') {
        setPendingBookingData(bookingData);
        setShowDemoPaymentModal(true);
        setIsSubmitting(false);
        return;
      }
      window.location.href = paymentOrder.paymentUrl;
      return;
    } catch (error) {
      console.error('Error submitting booking:', error);
      setSubmitError(error.message || 'We could not submit your booking right now. Please try again.');
      setFormSubmitted(false);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    
    // Reset form after 5 seconds
    setTimeout(() => {
      setFormSubmitted(false);
      setIsSubmitting(false);
      setFormData({
        customerName: '',
        phone: '',
        address: '',
        startDate: '',
        endDate: '',
        additionalRequirements: ''
      });
      setPaymentSummary(null);
      setPendingBookingData(null);
      setShowDemoPaymentModal(false);
      setDemoPaymentForm(initialDemoPaymentForm);
    }, 5000);
  };

  const faqs = [
    {
      question: 'How far in advance should I book?',
      answer: 'We recommend booking at least 2-3 weeks in advance for small events and 1-2 months for large events to ensure availability.'
    },
    {
      question: 'Do you provide delivery and setup?',
      answer: 'Yes! We provide free delivery, setup, and collection for all bookings within our service area.'
    },
    {
      question: 'What if something gets damaged during the event?',
      answer: 'Minor wear and tear is expected. For significant damage, we charge reasonable repair or replacement costs. We also offer optional damage protection.'
    },
    {
      question: 'Can I customize my rental package?',
      answer: 'Absolutely! We create custom packages based on your specific needs and budget. Just let us know your requirements.'
    }
  ];

  return (
    <>
      {showDemoPaymentModal && paymentSummary && (
        <div className="payment-modal-overlay">
          <div className="payment-modal-card">
            <div className="payment-modal-header">
              <div>
                <div className="section-tag" style={{ marginBottom: '0.35rem' }}>Demo Payment Panel</div>
                <h3 className="payment-modal-title">Advance Payment Checkout</h3>
              </div>
              <button type="button" className="payment-modal-close" onClick={closeDemoPaymentModal}>
                ×
              </button>
            </div>

            <div className="payment-provider-strip">
              <div className="payment-provider-brand">Razorpay Style Demo</div>
              <div className="payment-provider-amount">₹{paymentSummary.advanceAmount.toLocaleString('en-IN')}</div>
            </div>

            <div className="payment-modal-grid">
              <div className="payment-modal-summary">
                <div className="payment-summary-row">
                  <span>Booking total</span>
                  <strong>₹{paymentSummary.totalPrice.toLocaleString('en-IN')}</strong>
                </div>
                <div className="payment-summary-row">
                  <span>Pay now (25%)</span>
                  <strong>₹{paymentSummary.advanceAmount.toLocaleString('en-IN')}</strong>
                </div>
                <div className="payment-summary-row">
                  <span>Remaining</span>
                  <strong>₹{paymentSummary.remainingAmount.toLocaleString('en-IN')}</strong>
                </div>
                <div className="payment-demo-note">
                  This is a classroom demo. The payment panel is simulated and no real amount is deducted.
                </div>
                <div className="payment-demo-card">
                  <div className="payment-demo-card-label">Demo Card Details</div>
                  <div>Card Number: 4111 1111 1111 1111</div>
                  <div>Expiry: 12/28</div>
                  <div>CVV: 123</div>
                  <div>Name: Demo Student</div>
                </div>
              </div>

              <form onSubmit={handleDemoPaymentSubmit} className="payment-modal-form">
                <label className="payment-modal-label">
                  Card Number
                  <input
                    className="payment-modal-input"
                    name="cardNumber"
                    value={demoPaymentForm.cardNumber}
                    onChange={handleDemoPaymentInputChange}
                    required
                  />
                </label>
                <label className="payment-modal-label">
                  Cardholder Name
                  <input
                    className="payment-modal-input"
                    name="cardName"
                    value={demoPaymentForm.cardName}
                    onChange={handleDemoPaymentInputChange}
                    required
                  />
                </label>
                <div className="payment-modal-form-row">
                  <label className="payment-modal-label">
                    Expiry
                    <input
                      className="payment-modal-input"
                      name="expiry"
                      value={demoPaymentForm.expiry}
                      onChange={handleDemoPaymentInputChange}
                      required
                    />
                  </label>
                  <label className="payment-modal-label">
                    CVV
                    <input
                      className="payment-modal-input"
                      name="cvv"
                      value={demoPaymentForm.cvv}
                      onChange={handleDemoPaymentInputChange}
                      required
                    />
                  </label>
                </div>
                <button type="submit" className="form-submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? 'Processing Demo Payment...'
                    : `Pay ₹${paymentSummary.advanceAmount.toLocaleString('en-IN')}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <section id="hero" style={{minHeight: '60vh', padding: '8rem 5% 4rem'}}>
        <div className="hero-text">
          <div className="hero-tag">Get a Quote</div>
          <h1 className="hero-title">
            Book Your<br/>Furniture<br/><em>Today</em>
          </h1>
          <p className="hero-desc">
            Review your cart and submit your event details. We will confirm availability and next steps within 24 hours.
          </p>
          <div className="hero-btns">
            <Link to="/products" className="btn-primary">Browse Collection</Link>
            <a href="tel:+919876543210" className="btn-outline">Call Us</a>
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section id="booking">
        <div className="booking-grid">
          <div className={`reveal ${visibleSections.has(document.querySelector('#booking .reveal:nth-child(1)')) ? 'visible' : ''}`}>
            <div className="section-tag">Get a Quote</div>
            <h2 className="section-title" style={{color: 'var(--cream)'}}>Book Your<br/>Furniture Today</h2>
            <p className="section-sub">Fill out form and we will get back to you within 24 hours with availability and pricing.</p>
            <div className="booking-info-list">
              <div className="booking-info-item">
                <div className="booking-info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="booking-info-title">Call Us Directly</div>
                  <div className="booking-info-desc">+91 98765 43210 — Mon to Sat, 9 AM to 7 PM</div>
                </div>
              </div>
              <div className="booking-info-item">
                <div className="booking-info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="booking-info-title">Email Us</div>
                  <div className="booking-info-desc">bookings@furnishandco.in</div>
                </div>
              </div>
              <div className="booking-info-item">
                <div className="booking-info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="booking-info-title">Our Location</div>
                  <div className="booking-info-desc">123 Market Road, Your City — 400001</div>
                </div>
              </div>
            </div>
          </div>
          <div className={`reveal ${visibleSections.has(document.querySelector('#booking .reveal:nth-child(2)')) ? 'visible' : ''}`}>
            <div className="booking-form">
              {formSubmitted ? (
                <div className="success-msg" style={{display: 'block'}}>
                  Thank you! We will contact you within 24 hours.
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="cart-booking-summary">
                    <div className="cart-booking-summary-header">
                      <div>
                        <div className="section-tag" style={{ marginBottom: '0.35rem' }}>Selected Items</div>
                        <h3 style={{ color: 'var(--cream)', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', marginBottom: '0.35rem' }}>
                          Booking Cart Summary
                        </h3>
                      </div>
                      <Link to="/cart" className="product-btn" style={{ textDecoration: 'none', alignSelf: 'flex-start' }}>
                        Edit Cart
                      </Link>
                    </div>
                    {items.length === 0 ? (
                      <div className="cart-booking-empty">
                        Your cart is empty. Add products before sending a booking request.
                      </div>
                    ) : (
                      <>
                        <div className="cart-booking-lines">
                          {items.map((item) => (
                            <div key={item.productId} className="cart-booking-line">
                              <span>{item.name} x {item.quantity}</span>
                              <strong>₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong>
                            </div>
                          ))}
                        </div>
                        <div className="cart-booking-total">
                          <span>Total Price</span>
                          <strong>₹{totalPrice.toLocaleString('en-IN')}</strong>
                        </div>
                        <div className="cart-booking-total" style={{ marginTop: '0.75rem' }}>
                          <span>Advance to Pay Now (25%)</span>
                          <strong>₹{(paymentSummary?.advanceAmount || totalPrice * 0.25).toLocaleString('en-IN')}</strong>
                        </div>
                        <div className="cart-booking-total" style={{ marginTop: '0.75rem' }}>
                          <span>Remaining on Confirmation</span>
                          <strong>₹{(paymentSummary?.remainingAmount || totalPrice * 0.75).toLocaleString('en-IN')}</strong>
                        </div>
                        <div className="cart-booking-total" style={{ marginTop: '0.75rem' }}>
                          <span>Rental Dates</span>
                          <strong>
                            {hasSelectedDates
                              ? `${formatRentalDate(formData.startDate)} to ${formatRentalDate(formData.endDate)}`
                              : 'Choose dates in catalog'}
                          </strong>
                        </div>
                      </>
                    )}
                  </div>
                  {submitError && (
                    <div style={{ ...formStyles.errorText, marginBottom: '1rem' }}>
                      {submitError}
                    </div>
                  )}
                  <div className="form-row">
                    <div className="form-group">
                      <label style={formStyles.formLabel}>Name</label>
                      <input 
                        style={formStyles.formInput}
                        type="text" 
                        name="customerName"
                        placeholder="Rahul Verma" 
                        value={formData.customerName}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                    <div className="form-group" style={formStyles.formGroup}>
                      <label style={formStyles.formLabel}>Selected Rental Window</label>
                      <div style={{
                        ...formStyles.formInput,
                        minHeight: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#f8f4ee',
                        color: '#2c3e50',
                        fontWeight: '600'
                      }}>
                        {hasSelectedDates
                          ? `${formatRentalDate(formData.startDate)} to ${formatRentalDate(formData.endDate)}`
                          : 'Please choose dates in the catalog first'}
                      </div>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group" style={formStyles.formGroup}>
                      <label style={formStyles.formLabel}>Rental Start Date</label>
                      {dateError && (
                        <div style={formStyles.errorText}>
                          {dateError}
                        </div>
                      )}
                      <input 
                        style={formStyles.formInput}
                        type="date" 
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]} // Today's date
                        max={new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().split('T')[0]} // 2 months from now
                        required 
                      />
                    </div>
                    <div className="form-group" style={formStyles.formGroup}>
                      <label style={formStyles.formLabel}>Rental End Date</label>
                      <input 
                        style={formStyles.formInput}
                        type="date" 
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        min={getMinimumEndDate(formData.startDate) || new Date().toISOString().split('T')[0]}
                        max={new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().split('T')[0]}
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group" style={formStyles.formGroup}>
                      <label style={formStyles.formLabel}>Address</label>
                      <input 
                        style={formStyles.formInput}
                        type="text" 
                        name="address"
                        placeholder="Delivery address or venue location" 
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group" style={formStyles.formGroup}>
                      <label style={formStyles.formLabel}>Phone Number</label>
                      <input 
                        style={{...formStyles.formInput, ...formStyles.phoneInput}}
                        type="tel" 
                        name="phone"
                        placeholder="10-digit phone number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required 
                      />
                      {phoneError && (
                        <div style={formStyles.errorText}>
                          {phoneError}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-group" style={formStyles.formGroup}>
                    <label style={formStyles.formLabel}>Additional Requirements</label>
                    <textarea 
                      style={formStyles.formInput}
                      name="additionalRequirements"
                      placeholder="Any special requests or additional information..."
                      value={formData.additionalRequirements}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>
                  <button type="submit" className="form-submit" disabled={items.length === 0 || isSubmitting || !hasSelectedDates}>
                    {isSubmitting ? 'Processing Payment...' : 'Pay 25% Advance & Confirm Booking'}
                  </button>
                  {!hasSelectedDates && (
                    <div style={{ ...formStyles.errorText, marginTop: '0.75rem' }}>
                      Please choose rental start and end dates before booking.
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
      <section style={{background: 'var(--warm-white)', padding: '6rem 5%'}}>
        <div className={`section-header ${visibleSections.has(document.querySelector('section:nth-child(3) .section-header')) ? 'visible' : ''}`}>
          <div className="section-tag">Frequently Asked Questions</div>
          <h2 className="section-title">Got Questions?</h2>
          <p className="section-sub">Find answers to common questions about our furniture rental services.</p>
        </div>
        <div style={{maxWidth: '800px', margin: '0 auto'}}>
          {faqs.map((faq, index) => (
            <div key={index} style={{background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.5rem', marginBottom: '1rem'}}>
              <h3 style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: 'var(--charcoal)', marginBottom: '1rem'}}>
                {faq.question}
              </h3>
              <p style={{color: 'var(--muted)', lineHeight: '1.6'}}>
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Booking;
