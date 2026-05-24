import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';

const AdminBookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchBooking();
  }, [id, navigate]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/bookings/${id}`);

      if (response.ok) {
        const bookingData = await response.json();
        setBooking(bookingData);
      } else {
        setError('Booking not found');
      }
    } catch (fetchError) {
      setError('Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>Loading booking details...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <>
        <AdminNavbar />
        <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto', paddingTop: '6rem' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', marginBottom: '1rem' }}>Booking Details</h1>
            <p style={{ color: 'var(--error-color, #e74c3c)', marginBottom: '1.5rem' }}>{error || 'Booking not found'}</p>
            <button
              onClick={() => navigate('/admin-bookings')}
              style={{
                background: 'var(--gold)',
                color: 'var(--charcoal)',
                border: 'none',
                padding: '0.75rem 1.25rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Back to Bookings
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', background: 'var(--warm-white)', paddingTop: '6rem', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', margin: 0, color: 'var(--charcoal)' }}>
              Booking Details
            </h1>
            <p style={{ color: 'var(--muted)', margin: '0.5rem 0 0 0', fontSize: '0.95rem' }}>
              Order reference: {booking._id}
            </p>
          </div>
          <button
            onClick={() => navigate('/admin-bookings')}
            style={{
              background: 'transparent',
              color: 'var(--charcoal)',
              border: '1px solid var(--border)',
              padding: '0.75rem 1.25rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to All Bookings
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--charcoal)' }}>
                Customer Information
              </h2>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div><strong>Name:</strong> {booking.customerName}</div>
                <div><strong>Phone:</strong> {booking.phone}</div>
                <div><strong>Address:</strong> {booking.address}</div>
                <div><strong>Event Date:</strong> {formatDate(booking.eventDate)}</div>
                <div><strong>Created At:</strong> {formatDate(booking.createdAt)}</div>
              </div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--charcoal)' }}>
                Booked Items
              </h2>
              <div style={{ display: 'grid', gap: '0.85rem' }}>
                {(booking.items || []).map((item) => (
                  <div
                    key={`${booking._id}-${item.productId || item.name}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      padding: '0.85rem 1rem',
                      background: 'var(--warm-white)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600' }}>{item.name}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                        Quantity: {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: '600', color: 'var(--gold)' }}>
                      ₹{((item.price || 0) * (item.quantity || 0)).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {booking.additionalRequirements && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--charcoal)' }}>
                  Additional Requirements
                </h2>
                <p style={{ color: 'var(--charcoal-soft)', lineHeight: '1.7' }}>{booking.additionalRequirements}</p>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--charcoal)' }}>
                Payment Summary
              </h2>
              <div style={{ display: 'grid', gap: '0.9rem' }}>
                <div><strong>Total Price:</strong> ₹{(booking.totalPrice || 0).toLocaleString('en-IN')}</div>
                <div><strong>Advance Amount:</strong> ₹{(booking.advanceAmount || 0).toLocaleString('en-IN')}</div>
                <div><strong>Remaining Amount:</strong> ₹{(booking.remainingAmount || 0).toLocaleString('en-IN')}</div>
                <div><strong>Payment Status:</strong> <span style={{ textTransform: 'capitalize' }}>{booking.paymentStatus}</span></div>
                <div><strong>Payment Mode:</strong> <span style={{ textTransform: 'capitalize' }}>{booking.paymentMode}</span></div>
                {booking.paymentOrderId && <div><strong>Payment Order ID:</strong> {booking.paymentOrderId}</div>}
                {booking.paymentId && <div><strong>Payment ID:</strong> {booking.paymentId}</div>}
                {booking.paidAt && <div><strong>Paid At:</strong> {formatDate(booking.paidAt)}</div>}
              </div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--charcoal)' }}>
                Booking Status
              </h2>
              <div style={{ display: 'inline-flex', padding: '0.35rem 0.85rem', borderRadius: '999px', background: 'var(--gold)', color: 'var(--charcoal)', fontWeight: '600', textTransform: 'capitalize' }}>
                {booking.status}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminBookingDetails;
