import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import { api } from '../services/api';

const Admin = () => {
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [banquetHalls, setBanquetHalls] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

 useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Fetch dashboard stats
      const statsResponse = await fetch('http://localhost:3000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setDashboardStats(statsData);
      }

      // Fetch bookings
      const bookingsResponse = await fetch('http://localhost:3000/api/admin/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);
      }

      // Fetch reviews
      const reviewsData = await api.getReviews();
      setReviews(reviewsData);

      // Fetch banquet hall items
      const banquetHallResponse = await fetch('http://localhost:3000/api/admin/banquet-hall', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (banquetHallResponse.ok) {
        const banquetHallData = await banquetHallResponse.json();
        setBanquetHalls(banquetHallData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch admin data');
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
        fetchData(); // Refresh dashboard stats
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

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

  const getBookedItemsCount = (booking) => {
    return (booking.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  if (loading) {
    return (
      <div style={{padding: '2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontSize: '1.2rem', color: 'var(--muted)'}}>Loading admin dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{padding: '2rem', maxWidth: '1400px', margin: '0 auto', background: 'var(--warm-white)'}}>
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
              Admin Dashboard
            </h1>
            <p style={{color: 'var(--muted)', margin: '0.5rem 0 0 0', fontSize: '0.9rem'}}>
              Furnish & Co. Management System
            </p>
          </div>
          <button
            onClick={() => navigate('/admin-users')}
            style={{
              background: 'var(--gold)',
              color: 'var(--charcoal)',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Manage Users
          </button>
        </div>
        
        {/* Dashboard Stats */}
        {dashboardStats && (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem'}}>
          <div style={{background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center'}}>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '0.5rem'}}>
              {dashboardStats.totalBookings}
            </div>
            <div style={{color: 'var(--muted)', fontSize: '0.9rem'}}>Total Bookings</div>
          </div>
          <div style={{background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center'}}>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#27ae60', marginBottom: '0.5rem'}}>
              {dashboardStats.pendingBookings}
            </div>
            <div style={{color: 'var(--muted)', fontSize: '0.9rem'}}>Pending</div>
          </div>
          <div style={{background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center'}}>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#3498db', marginBottom: '0.5rem'}}>
              {dashboardStats.confirmedBookings}
            </div>
            <div style={{color: 'var(--muted)', fontSize: '0.9rem'}}>Confirmed</div>
          </div>
          <div style={{background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center'}}>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#8e44ad', marginBottom: '0.5rem'}}>
              ₹{dashboardStats.totalRevenue.toLocaleString('en-IN')}
            </div>
            <div style={{color: 'var(--muted)', fontSize: '0.9rem'}}>Total Revenue</div>
          </div>
          <div style={{background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center'}}>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#d35400', marginBottom: '0.5rem'}}>
              ₹{dashboardStats.pendingRevenue.toLocaleString('en-IN')}
            </div>
            <div style={{color: 'var(--muted)', fontSize: '0.9rem'}}>Confirmed Revenue</div>
          </div>
          <div style={{background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center'}}>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--charcoal)', marginBottom: '0.5rem'}}>
              ₹{Math.round(dashboardStats.averageBookingValue).toLocaleString('en-IN')}
            </div>
            <div style={{color: 'var(--muted)', fontSize: '0.9rem'}}>Avg. Booking Value</div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '2rem'}}>
        <h2 style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--charcoal)'}}>
          Quick Actions
        </h2>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
          <button
            onClick={() => navigate('/admin-bookings')}
            style={{
              background: 'var(--gold)',
              color: 'var(--charcoal)',
              border: 'none',
              padding: '1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <div style={{fontSize: '2rem'}}>📋</div>
            <div>View All Bookings</div>
          </button>
          <button
            onClick={() => navigate('/admin-reviews')}
            style={{
              background: 'var(--gold)',
              color: 'var(--charcoal)',
              border: 'none',
              padding: '1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <div style={{fontSize: '2rem'}}>⭐</div>
            <div>Manage Reviews</div>
          </button>
          <button
            onClick={() => navigate('/admin-products')}
            style={{
              background: 'var(--gold)',
              color: 'var(--charcoal)',
              border: 'none',
              padding: '1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <div style={{fontSize: '2rem'}}>📦</div>
            <div>Manage Products</div>
          </button>
          <button
            onClick={() => navigate('/admin-users')}
            style={{
              background: 'var(--gold)',
              color: 'var(--charcoal)',
              border: 'none',
              padding: '1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <div style={{fontSize: '2rem'}}>👥</div>
            <div>User Management</div>
          </button>
        </div>
      </div>

      {dashboardStats && dashboardStats.recentBookings?.length > 0 && (
        <div style={{background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '2rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap'}}>
            <div>
              <h2 style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', margin: 0, color: 'var(--charcoal)'}}>
                Recent Bookings
              </h2>
              <p style={{color: 'var(--muted)', margin: '0.4rem 0 0 0', fontSize: '0.9rem'}}>
                Latest cart-based booking requests with customer and item details
              </p>
            </div>
            <button
              onClick={() => navigate('/admin-bookings')}
              style={{
                background: 'transparent',
                color: 'var(--charcoal)',
                border: '1px solid var(--border)',
                padding: '0.75rem 1.2rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              View All Bookings
            </button>
          </div>

          <div style={{display: 'grid', gap: '1rem'}}>
            {dashboardStats.recentBookings.map((booking) => (
              <div
                key={booking._id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  background: 'var(--warm-white)'
                }}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '1rem'}}>
                  <div>
                    <div style={{fontWeight: '600', color: 'var(--charcoal)', fontSize: '1rem'}}>
                      {booking.customerName}
                    </div>
                    <div style={{fontSize: '0.88rem', color: 'var(--muted)', marginTop: '0.25rem'}}>
                      {booking.phone} • {booking.address}
                    </div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap'}}>
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
                    <div style={{fontWeight: '600', color: 'var(--gold)'}}>
                      ₹{(booking.totalPrice || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem'}}>
                  <div>
                    <div style={{fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em'}}>
                      Event Date
                    </div>
                    <div style={{fontWeight: '500', color: 'var(--charcoal)'}}>
                      {formatDate(booking.eventDate)}
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em'}}>
                      Total Items
                    </div>
                    <div style={{fontWeight: '500', color: 'var(--charcoal)'}}>
                      {getBookedItemsCount(booking)}
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em'}}>
                      Advance Paid
                    </div>
                    <div style={{fontWeight: '500', color: 'var(--charcoal)'}}>
                      ₹{(booking.advanceAmount || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em'}}>
                      Payment
                    </div>
                    <div style={{fontWeight: '500', color: 'var(--charcoal)', textTransform: 'capitalize'}}>
                      {booking.paymentStatus || 'pending'} ({booking.paymentMode || 'demo'})
                    </div>
                  </div>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: '0.45rem'}}>
                  {(booking.items || []).map((item) => (
                    <div
                      key={`${booking._id}-${item.productId || item.name}`}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        fontSize: '0.9rem',
                        color: 'var(--charcoal-soft)'
                      }}
                    >
                      <span>{item.name} x {item.quantity}</span>
                      <span>₹{((item.price || 0) * (item.quantity || 0)).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                {booking.additionalRequirements && (
                  <div style={{marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)'}}>
                    <div style={{fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem'}}>
                      Additional Requirements
                    </div>
                    <div style={{fontSize: '0.9rem', color: 'var(--charcoal-soft)'}}>
                      {booking.additionalRequirements}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Banquet Hall Gallery */}
      {banquetHalls.length > 0 && (
        <div style={{background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '2rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
            <h2 style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', margin: 0, color: 'var(--charcoal)'}}>
              Banquet Hall Gallery
            </h2>
            <button
              onClick={() => navigate('/admin-banquet-hall')}
              style={{
                background: 'var(--gold)',
                color: 'var(--charcoal)',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              Manage Gallery
            </button>
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem'}}>
            {banquetHalls.filter(item => item.isActive && item.images.length > 0).map((item) => {
              const mainImage = item.images[item.mainImageIndex] || item.images[0];
              const imageUrl = mainImage ? `http://localhost:3000/uploads/banquet-hall/${mainImage.filename}` : null;
              
              return (
                <div key={item._id} style={{textAlign: 'center'}}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        marginBottom: '0.5rem',
                        border: '1px solid #eee'
                      }}
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/200x150/8B7355/FFFFFF?text=${encodeURIComponent(item.name)}`;
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '150px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #eee'
                    }}>
                      <span style={{color: '#6c757d', fontSize: '0.9rem'}}>No Image</span>
                    </div>
                  )}
                  <div style={{fontWeight: '500', color: 'var(--charcoal)', marginBottom: '0.25rem'}}>
                    {item.name}
                  </div>
                  <div style={{fontSize: '0.85rem', color: 'var(--muted)', textTransform: 'capitalize'}}>
                    {item.type} ({item.images.length} images)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default Admin;
