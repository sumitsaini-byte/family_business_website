import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import { api } from '../services/api';

const AdminPackageInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchInquiries();
  }, [navigate]);

  const fetchInquiries = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const data = await api.getPackageInquiries(token);
      setInquiries(data);
    } catch (fetchError) {
      setError(fetchError.message || 'Failed to load package inquiries');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading package inquiries...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#e74c3c' }}>{error}</div>;
  }

  return (
    <>
      <AdminNavbar />
      <div style={{ padding: '2rem', maxWidth: '1300px', margin: '0 auto', background: 'var(--warm-white)', paddingTop: '6rem', minHeight: '100vh' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', margin: 0 }}>Package Inquiries</h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Review package-specific leads sent from the services page.</p>
        </div>

        <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--cream)' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Customer</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Package</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Phone</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Event Date</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <tr key={inquiry._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>{inquiry.customerName}</td>
                  <td style={{ padding: '1rem' }}>{inquiry.packageName}</td>
                  <td style={{ padding: '1rem' }}>{inquiry.phone}</td>
                  <td style={{ padding: '1rem' }}>{new Date(inquiry.eventDate).toLocaleDateString('en-US')}</td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{inquiry.status}</td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => navigate(`/admin-package-inquiries/${inquiry._id}`)}
                      style={{
                        background: 'transparent',
                        color: 'var(--charcoal)',
                        border: '1px solid var(--border)',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminPackageInquiries;
