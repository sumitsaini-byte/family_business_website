import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3000/api/admin/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const bookingsData = await response.json();
        setBookings(bookingsData);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3000/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setBookings(prev => 
          prev.map(booking => 
            booking._id === bookingId 
              ? { ...booking, status: newStatus }
              : booking
          )
        );
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'confirmed': return '#27ae60';
      case 'completed': return '#3498db';
      default: return '#95a5a6';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateTotalRevenue = () => {
    return bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  };

  if (loading) {
    return (
      <div style={{padding: '2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontSize: '1.2rem', color: 'var(--muted)'}}>Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{padding: '2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{color: 'var(--error-color, #e74c3c)', fontSize: '1.1rem'}}>{error}</div>
      </div>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div style={{padding: '2rem', maxWidth: '1400px', margin: '0 auto', background: 'var(--warm-white)', paddingTop: '6rem'}}>
      {/* Header */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'}}>
        <div>
          <h1 style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', margin: 0, color: 'var(--charcoal)'}}>
            Booking Management
          </h1>
          <p style={{color: 'var(--muted)', margin: '0.5rem 0 0 0', fontSize: '0.9rem'}}>
            Manage and track all booking inquiries
          </p>
        </div>
        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
          <div style={{textAlign: 'center', padding: '1rem', background: 'var(--warm-white)', borderRadius: '8px', minWidth: '120px'}}>
            <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '0.25rem'}}>
              {bookings.length}
            </div>
            <div style={{fontSize: '0.8rem', color: 'var(--muted)'}}>Total Bookings</div>
          </div>
          <div style={{textAlign: 'center', padding: '1rem', background: 'var(--warm-white)', borderRadius: '8px', minWidth: '120px'}}>
            <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#27ae60', marginBottom: '0.25rem'}}>
              ₹{calculateTotalRevenue().toLocaleString('en-IN')}
            </div>
            <div style={{fontSize: '0.8rem', color: 'var(--muted)'}}>Total Revenue</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem', background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'}}>
        {['all', 'pending', 'confirmed', 'completed'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              background: filter === status ? 'var(--gold)' : 'transparent',
              color: filter === status ? 'var(--charcoal)' : 'var(--muted)',
              border: filter === status ? 'none' : '1px solid var(--border)',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} 
            {status !== 'all' && ` (${bookings.filter(b => b.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div style={{background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'}}>
        <h2 style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', padding: '1.5rem', margin: 0, color: 'var(--charcoal)'}}>
          {filter === 'all' ? 'All Bookings' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Bookings`} ({filteredBookings.length})
        </h2>
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: 'var(--cream)'}}>
                <th style={{padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: '600'}}>Customer</th>
                <th style={{padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: '600'}}>Phone</th>
                <th style={{padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: '600'}}>Address</th>
                <th style={{padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: '600'}}>Event Date</th>
                <th style={{padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: '600'}}>Items</th>
                <th style={{padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: '600'}}>Advance</th>
                <th style={{padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: '600'}}>Payment</th>
                <th style={{padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: '600'}}>Total Price</th>
                <th style={{padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: '600'}}>Status</th>
                <th style={{padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: '600'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => (
                <tr key={booking._id} style={{borderBottom: '1px solid var(--border)'}}>
                  <td style={{padding: '1rem'}}>
                    <div style={{fontWeight: '600'}}>{booking.customerName}</div>
                    {booking.additionalRequirements && (
                      <div style={{fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.35rem'}}>
                        {booking.additionalRequirements}
                      </div>
                    )}
                  </td>
                  <td style={{padding: '1rem'}}>{booking.phone}</td>
                  <td style={{padding: '1rem'}}>{booking.address}</td>
                  <td style={{padding: '1rem'}}>{formatDate(booking.eventDate)}</td>
                  <td style={{padding: '1rem', fontSize: '0.85rem'}}>
                    {(booking.items || []).length > 0 ? (
                      (booking.items || []).map((item) => (
                        <div key={`${booking._id}-${item.productId || item.name}`}>
                          {item.name} x {item.quantity}
                        </div>
                      ))
                    ) : (
                      <div style={{color: 'var(--muted)'}}>No items</div>
                    )}
                  </td>
                  <td style={{padding: '1rem', fontWeight: '600'}}>
                    ₹{booking.advanceAmount?.toLocaleString('en-IN') || '0'}
                  </td>
                  <td style={{padding: '1rem'}}>
                    <div style={{fontWeight: '600', textTransform: 'capitalize'}}>
                      {booking.paymentStatus || 'pending'}
                    </div>
                    <div style={{fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'capitalize'}}>
                      {booking.paymentMode || 'demo'}
                    </div>
                  </td>
                  <td style={{padding: '1rem', fontWeight: 'bold', color: 'var(--gold)'}}>
                    ₹{booking.totalPrice?.toLocaleString('en-IN') || 'N/A'}
                  </td>
                  <td style={{padding: '1rem'}}>
                    <span style={{
                      background: getStatusColor(booking.status),
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {booking.status}
                    </span>
                  </td>
                  <td style={{padding: '1rem'}}>
                    <button
                      onClick={() => navigate(`/admin-bookings/${booking._id}`)}
                      style={{
                        background: 'transparent',
                        color: 'var(--charcoal)',
                        border: '1px solid var(--border)',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '0.5rem',
                        fontSize: '0.85rem'
                      }}
                    >
                      View Details
                    </button>
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                        style={{
                          background: 'var(--gold)',
                          color: 'var(--charcoal)',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginRight: '0.5rem',
                          fontSize: '0.85rem'
                        }}
                      >
                        Confirm
                      </button>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => updateBookingStatus(booking._id, 'completed')}
                        style={{
                          background: '#27ae60',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </>
  );
};

export default AdminBookings;
