import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ReviewForm from '../components/ReviewForm';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const reviewsData = await api.getReviews();
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAdded = () => {
    fetchReviews(); // Refresh reviews after adding a new one
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

  return (
    <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto', background: 'var(--warm-white)', paddingTop: '6rem'}}>
      {/* Header */}
      <div style={{textAlign: 'center', marginBottom: '3rem'}}>
        <h1 style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', margin: 0, color: 'var(--charcoal)'}}>
          Customer Reviews
        </h1>
        <p style={{color: 'var(--muted)', fontSize: '1.1rem', marginTop: '0.5rem'}}>
          See what our customers say about their experience with Furnish & Co.
        </p>
      </div>

      {/* Review Form */}
      <ReviewForm onReviewAdded={handleReviewAdded} />

      {/* Reviews Grid */}
      <div style={{marginTop: '4rem'}}>
        <h2 style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', marginBottom: '2rem', color: 'var(--charcoal)', textAlign: 'center'}}>
          What Our Customers Say
        </h2>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem'}}>
          {reviews.map((review, index) => (
            <div key={review._id} style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              border: '1px solid var(--border)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
            }}
            >
              {/* Rating Badge */}
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'var(--gold)',
                color: 'var(--charcoal)',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{fontSize: '0.7rem'}}>
                    {i < review.rating ? '★' : '☆'}
                  </span>
                ))}
              </div>

              {/* Customer Info */}
              <div style={{display: 'flex', alignItems: 'center', marginBottom: '1.5rem', paddingRight: '6rem'}}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--charcoal)',
                  fontWeight: '700',
                  fontSize: '1.2rem',
                  marginRight: '1rem',
                  boxShadow: '0 4px 15px rgba(201, 168, 76, 0.3)'
                }}>
                  {review.initials}
                </div>
                <div>
                  <div style={{fontWeight: '700', color: 'var(--charcoal)', fontSize: '1.1rem', marginBottom: '0.25rem'}}>
                    {review.name}
                  </div>
                  <div style={{color: 'var(--muted)', fontSize: '0.9rem'}}>
                    {review.event}
                  </div>
                </div>
              </div>

              {/* Review Text */}
              <p style={{
                color: 'var(--charcoal-soft)',
                lineHeight: '1.6',
                fontSize: '1rem',
                marginBottom: '1.5rem',
                fontStyle: 'italic'
              }}>
                "{review.text}"
              </p>

              {/* Date */}
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--muted)',
                textAlign: 'right',
                borderTop: '1px solid var(--border)',
                paddingTop: '1rem'
              }}>
                {formatDate(review.createdAt)}
              </div>
            </div>
          ))}
        </div>

        {reviews.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '4rem',
            background: 'var(--cream)',
            borderRadius: '12px',
            border: '2px dashed var(--border)'
          }}>
            <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📝</div>
            <h3 style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: 'var(--charcoal)', marginBottom: '1rem'}}>
              No Reviews Yet
            </h3>
            <p style={{color: 'var(--muted)', fontSize: '1rem'}}>
              Be the first to share your experience with Furnish & Co.!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
