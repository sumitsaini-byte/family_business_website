import React, { useState } from 'react';
import { api } from '../services/api';

const ReviewForm = ({ onReviewAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    event: '',
    rating: 5,
    text: '',
    initials: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const reviewData = {
        ...formData,
        initials: generateInitials(formData.name)
      };

      await api.createReview(reviewData);
      setMessage('Thank you! Your review has been submitted successfully.');
      setFormData({
        name: '',
        event: '',
        rating: 5,
        text: '',
        initials: ''
      });
      
      if (onReviewAdded) {
        onReviewAdded();
      }
    } catch (error) {
      setMessage('Error submitting review. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      background: 'white',
      padding: '2rem',
      borderRadius: '8px',
      border: '1px solid var(--border)',
      margin: '2rem 0',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    }}>
      <h3 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '1.5rem',
        marginBottom: '1.5rem',
        color: 'var(--charcoal)',
        textAlign: 'center'
      }}>
        Submit a Review
      </h3>
      
      {message && (
        <div style={{
          padding: '1rem',
          marginBottom: '1.5rem',
          borderRadius: '4px',
          background: message.includes('successfully') ? '#d4edda' : '#f8d7da',
          color: message.includes('successfully') ? '#155724' : '#721c24',
          textAlign: 'center',
          fontSize: '0.9rem'
        }}>
          {message}
        </div>
      )}

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
              placeholder="Your name"
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
            <select
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
            >
              <option value="">Select event</option>
              <option value="Wedding">Wedding</option>
              <option value="Corporate Event">Corporate Event</option>
              <option value="Birthday Party">Birthday Party</option>
              <option value="Other">Other</option>
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
            Rating *
          </label>
          <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.5rem'}}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  color: star <= formData.rating ? 'var(--gold)' : '#ddd',
                  transition: 'color 0.2s ease'
                }}
              >
                ★
              </button>
            ))}
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
            Your Review *
          </label>
          <textarea
            name="text"
            value={formData.text}
            onChange={handleInputChange}
            required
            rows="4"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontSize: '0.9rem',
              fontFamily: "'DM Sans', sans-serif",
              resize: 'vertical',
              lineHeight: '1.4'
            }}
            placeholder="Share your experience..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            background: 'var(--gold)',
            color: 'var(--charcoal)',
            border: 'none',
            padding: '0.75rem 2rem',
            borderRadius: '4px',
            fontSize: '1rem',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: '500',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
            display: 'block',
            margin: '0 auto'
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
