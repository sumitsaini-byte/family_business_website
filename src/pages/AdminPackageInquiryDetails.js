import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import { api } from '../services/api';

const AdminPackageInquiryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchInquiry(token);
  }, [id, navigate]);

  const fetchInquiry = async (token) => {
    try {
      const data = await api.getPackageInquiry(id, token);
      setInquiry(data);
    } catch (fetchError) {
      setError(fetchError.message || 'Failed to fetch inquiry details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading inquiry details...</div>;
  }

  if (error || !inquiry) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#e74c3c' }}>{error || 'Inquiry not found'}</div>;
  }

  return (
    <>
      <AdminNavbar />
      <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto', background: 'var(--warm-white)', paddingTop: '6rem', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', margin: 0 }}>Package Inquiry Details</h1>
            <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>{inquiry.packageName}</p>
          </div>
          <button
            onClick={() => navigate('/admin-package-inquiries')}
            style={{ background: 'transparent', border: '1px solid var(--border)', padding: '0.75rem 1.2rem', borderRadius: '4px', cursor: 'pointer' }}
          >
            Back to Inquiries
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', marginBottom: '1rem' }}>Customer</h2>
            <div style={{ display: 'grid', gap: '0.9rem' }}>
              <div><strong>Name:</strong> {inquiry.customerName}</div>
              <div><strong>Phone:</strong> {inquiry.phone}</div>
              <div><strong>Email:</strong> {inquiry.email || 'Not provided'}</div>
              <div><strong>Address:</strong> {inquiry.address}</div>
              <div><strong>Event Date:</strong> {new Date(inquiry.eventDate).toLocaleDateString('en-US')}</div>
              <div><strong>Guest Count:</strong> {inquiry.guestCount || 'Not provided'}</div>
            </div>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', marginBottom: '1rem' }}>Package</h2>
            <div style={{ display: 'grid', gap: '0.9rem' }}>
              <div><strong>Name:</strong> {inquiry.packageName}</div>
              <div><strong>Price:</strong> {inquiry.packagePrice}</div>
              <div><strong>Description:</strong> {inquiry.packageDescription}</div>
              <div><strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{inquiry.status}</span></div>
              <div><strong>Created At:</strong> {new Date(inquiry.createdAt).toLocaleString('en-US')}</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginTop: '1.5rem' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', marginBottom: '1rem' }}>Package Features</h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {(inquiry.packageFeatures || []).map((feature) => (
              <div key={feature} style={{ padding: '0.8rem 1rem', background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: '6px' }}>
                {feature}
              </div>
            ))}
          </div>
        </div>

        {inquiry.additionalRequirements && (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginTop: '1.5rem' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', marginBottom: '1rem' }}>Additional Requirements</h2>
            <p style={{ color: 'var(--charcoal-soft)', lineHeight: '1.7' }}>{inquiry.additionalRequirements}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminPackageInquiryDetails;
