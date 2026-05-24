import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import { api } from '../services/api';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    event: '',
    rating: 5,
    text: '',
    initials: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchReviews();
  }, [navigate]);

  const fetchReviews = async () => {
    try {
      const reviewsData = await api.getReviews();
      setReviews(reviewsData);
    } catch (error) {
      setError('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowAddForm(false);
        setFormData({ name: '', event: '', rating: 5, text: '', initials: '' });
        fetchReviews(); // Refresh the list
      } else {
        setError('Failed to add review');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchReviews(); // Refresh the list
      } else {
        setError('Failed to delete review');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    if (filter === '5star') return review.rating === 5;
    if (filter === '4star') return review.rating === 4;
    if (filter === '3star') return review.rating <= 3;
    return true;
  });

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{padding: '2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontSize: '1.2rem', color: 'var(--muted)'}}>Loading reviews...</div>
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
            Review Management
          </h1>
          <p style={{color: 'var(--muted)', margin: '0.5rem 0 0 0', fontSize: '0.9rem'}}>
            Manage customer reviews and ratings
          </p>
        </div>
        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
          <div style={{textAlign: 'center', padding: '1rem', background: 'var(--warm-white)', borderRadius: '8px', minWidth: '120px'}}>
            <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '0.25rem'}}>
              {reviews.length}
            </div>
            <div style={{fontSize: '0.8rem', color: 'var(--muted)'}}>Total Reviews</div>
          </div>
          <div style={{textAlign: 'center', padding: '1rem', background: 'var(--warm-white)', borderRadius: '8px', minWidth: '120px'}}>
            <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#27ae60', marginBottom: '0.25rem'}}>
              {calculateAverageRating()} ⭐
            </div>
            <div style={{fontSize: '0.8rem', color: 'var(--muted)'}}>Avg Rating</div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
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
            {showAddForm ? 'Cancel' : 'Add Review'}
          </button>
        </div>
      </div>

      {/* Add Review Form */}
      {showAddForm && (
        <div style={{background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '2rem'}}>
          <h2 style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--charcoal)'}}>
            Add New Review
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem'}}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  color: 'var(--charcoal)',
                  fontWeight: '500'
                }}>
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    fontFamily: "'DM Sans', sans-serif"
                  }}
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  color: 'var(--charcoal)',
                  fontWeight: '500'
                }}>
                  Event Type *
                </label>
                <input
                  type="text"
                  name="event"
                  value={formData.event}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    fontFamily: "'DM Sans', sans-serif"
                  }}
                  placeholder="e.g., Wedding, Corporate Event"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  color: 'var(--charcoal)',
                  fontWeight: '500'
                }}>
                  Initials *
                </label>
                <input
                  type="text"
                  name="initials"
                  value={formData.initials}
                  onChange={handleInputChange}
                  required
                  maxLength={2}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    fontFamily: "'DM Sans', sans-serif"
                  }}
                  placeholder="e.g., JD"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  color: 'var(--charcoal)',
                  fontWeight: '500'
                }}>
                  Rating *
                </label>
                <select
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    fontFamily: "'DM Sans', sans-serif"
                  }}
                >
                  <option value={5}>5 Stars ⭐⭐⭐⭐⭐</option>
                  <option value={4}>4 Stars ⭐⭐⭐⭐</option>
                  <option value={3}>3 Stars ⭐⭐⭐</option>
                  <option value={2}>2 Stars ⭐⭐</option>
                  <option value={1}>1 Star ⭐</option>
                </select>
              </div>
            </div>

            <div style={{marginBottom: '1.5rem'}}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                color: 'var(--charcoal)',
                fontWeight: '500'
              }}>
                Review Text *
              </label>
              <textarea
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                required
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  fontFamily: "'DM Sans', sans-serif",
                  resize: 'vertical'
                }}
                placeholder="Enter customer review text..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'var(--gold)',
                color: 'var(--charcoal)',
                border: 'none',
                padding: '0.875rem',
                borderRadius: '4px',
                fontSize: '1rem',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? 'Adding Review...' : 'Add Review'}
            </button>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem', background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'}}>
        {['all', '5star', '4star', '3star'].map(filterType => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            style={{
              background: filter === filterType ? 'var(--gold)' : 'transparent',
              color: filter === filterType ? 'var(--charcoal)' : 'var(--muted)',
              border: filter === filterType ? 'none' : '1px solid var(--border)',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            {filterType === 'all' ? 'All Reviews' : 
             filterType === '5star' ? '5 Stars' :
             filterType === '4star' ? '4 Stars' : '3 Stars & Below'}
            {filterType !== 'all' && ` (${reviews.filter(r => {
              if (filterType === '5star') return r.rating === 5;
              if (filterType === '4star') return r.rating === 4;
              if (filterType === '3star') return r.rating <= 3;
              return true;
            }).length})`}
          </button>
        ))}
      </div>

      {/* Reviews Grid */}
      <div style={{background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'}}>
        <h2 style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', padding: '1.5rem', margin: 0, color: 'var(--charcoal)'}}>
          {filter === 'all' ? 'All Reviews' : 
           filter === '5star' ? '5 Star Reviews' :
           filter === '4star' ? '4 Star Reviews' : '3 Star Reviews & Below'} ({filteredReviews.length})
        </h2>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', padding: '1.5rem'}}>
          {filteredReviews.map(review => (
            <div key={review._id} style={{
              background: 'var(--warm-white)',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              position: 'relative'
            }}>
              <button
                onClick={() => deleteReview(review._id)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                Delete
              </button>
              
              <div style={{display: 'flex', alignItems: 'center', marginBottom: '1rem', paddingRight: '3rem'}}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'var(--gold)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--charcoal)',
                  fontWeight: '600',
                  marginRight: '1rem'
                }}>
                  {review.initials}
                </div>
                <div>
                  <div style={{fontWeight: '600', color: 'var(--charcoal)'}}>{review.name}</div>
                  <div style={{fontSize: '0.8rem', color: 'var(--muted)'}}>{review.event}</div>
                </div>
              </div>
              <div style={{marginBottom: '0.5rem'}}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{color: i < review.rating ? 'var(--gold)' : '#ddd', marginRight: '2px'}}>
                    ★
                  </span>
                ))}
              </div>
              <p style={{color: 'var(--charcoal-soft)', lineHeight: '1.5', fontSize: '0.9rem', marginBottom: '1rem'}}>
                {review.text}
              </p>
              <div style={{fontSize: '0.8rem', color: 'var(--muted)'}}>
                {formatDate(review.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  );
};

export default AdminReviews;
