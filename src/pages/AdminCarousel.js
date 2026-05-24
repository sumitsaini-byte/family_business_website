import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';

const AdminCarousel = () => {
  const [carousel, setCarousel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState({
    weddingHall: false,
    luxurySofa: false,
    banquetTables: false
  });

  const [formData, setFormData] = useState({
    weddingHall: null,
    luxurySofa: null,
    banquetTables: null
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchCarousel();
  }, []);

  const fetchCarousel = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:3000/api/admin/carousel', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCarousel(data);
      } else if (response.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/login');
      } else {
        setError('Failed to fetch carousel images');
      }
    } catch (error) {
      setError('Failed to fetch carousel images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (field, file) => {
    setFormData({
      ...formData,
      [field]: file
    });
  };

  const handleUpload = async (field, endpoint) => {
    if (!formData[field]) {
      setError(`Please select an image for ${field}`);
      return;
    }

    setUploading({
      ...uploading,
      [field]: true
    });
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('adminToken');
      const formDataToSend = new FormData();
      formDataToSend.append('image', formData[field]);

      const response = await fetch(`http://localhost:3000/api/admin/carousel/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setFormData({
          ...formData,
          [field]: null
        });
        fetchCarousel();
        setTimeout(() => setSuccess(''), 3000);
        
        // Clear file input
        const fileInput = document.getElementById(`${field}-file-input`);
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        setError(data.message || 'Failed to upload image');
      }
    } catch (error) {
      setError('Failed to upload image');
    } finally {
      setUploading({
        ...uploading,
        [field]: false
      });
    }
  };

  const getImageUrl = (image) => {
    if (!image || !image.filename) return null;
    return `http://localhost:3000/uploads/carousel/${image.filename}`;
  };

  const getDefaultImage = (text) => {
    return `https://via.placeholder.com/400x300/8B7355/FFFFFF?text=${encodeURIComponent(text)}`;
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading carousel images...</div>
      </div>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '0.5rem' }}>
            Carousel Management
          </h2>
          <p style={{ color: '#666', margin: 0 }}>
            Upload images for the main website dashboard carousel
          </p>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: '#fee', 
            color: '#c33', 
            padding: '1rem', 
            borderRadius: '4px', 
            marginBottom: '1rem' 
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ 
            backgroundColor: '#efe', 
            color: '#3c3', 
            padding: '1rem', 
            borderRadius: '4px', 
            marginBottom: '1rem' 
          }}>
            {success}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          
          {/* Wedding Hall Image Upload */}
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>
              Wedding Hall Setup
            </h3>
            
            {/* Current Image Preview */}
            <div style={{ marginBottom: '1rem' }}>
              {carousel?.weddingHallImage ? (
                <img
                  src={getImageUrl(carousel.weddingHallImage)}
                  alt="Wedding Hall Setup"
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                  onError={(e) => {
                    e.target.src = getDefaultImage('Wedding Hall Setup');
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #ddd'
                }}>
                  <span style={{ color: '#6c757d' }}>No image uploaded</span>
                </div>
              )}
            </div>

            {/* Upload Form */}
            <div>
              <input
                id="weddingHall-file-input"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('weddingHall', e.target.files[0])}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '1rem'
                }}
              />
              
              {formData.weddingHall && (
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                  Selected: {formData.weddingHall.name}
                </div>
              )}

              <button
                onClick={() => handleUpload('weddingHall', 'wedding-hall')}
                disabled={uploading.weddingHall || !formData.weddingHall}
                style={{
                  width: '100%',
                  backgroundColor: uploading.weddingHall ? '#6c757d' : '#8B7355',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  cursor: uploading.weddingHall ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                {uploading.weddingHall ? 'Uploading...' : 'Upload Wedding Hall Image'}
              </button>
            </div>
          </div>

          {/* Luxury Sofa Image Upload */}
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>
              Luxury Sofa
            </h3>
            
            {/* Current Image Preview */}
            <div style={{ marginBottom: '1rem' }}>
              {carousel?.luxurySofaImage ? (
                <img
                  src={getImageUrl(carousel.luxurySofaImage)}
                  alt="Luxury Sofa"
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                  onError={(e) => {
                    e.target.src = getDefaultImage('Luxury Sofa');
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #ddd'
                }}>
                  <span style={{ color: '#6c757d' }}>No image uploaded</span>
                </div>
              )}
            </div>

            {/* Upload Form */}
            <div>
              <input
                id="luxurySofa-file-input"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('luxurySofa', e.target.files[0])}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '1rem'
                }}
              />
              
              {formData.luxurySofa && (
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                  Selected: {formData.luxurySofa.name}
                </div>
              )}

              <button
                onClick={() => handleUpload('luxurySofa', 'luxury-sofa')}
                disabled={uploading.luxurySofa || !formData.luxurySofa}
                style={{
                  width: '100%',
                  backgroundColor: uploading.luxurySofa ? '#6c757d' : '#8B7355',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  cursor: uploading.luxurySofa ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                {uploading.luxurySofa ? 'Uploading...' : 'Upload Luxury Sofa Image'}
              </button>
            </div>
          </div>

          {/* Banquet Tables Image Upload */}
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>
              Banquet Tables
            </h3>
            
            {/* Current Image Preview */}
            <div style={{ marginBottom: '1rem' }}>
              {carousel?.banquetTablesImage ? (
                <img
                  src={getImageUrl(carousel.banquetTablesImage)}
                  alt="Banquet Tables"
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                  onError={(e) => {
                    e.target.src = getDefaultImage('Banquet Tables');
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #ddd'
                }}>
                  <span style={{ color: '#6c757d' }}>No image uploaded</span>
                </div>
              )}
            </div>

            {/* Upload Form */}
            <div>
              <input
                id="banquetTables-file-input"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('banquetTables', e.target.files[0])}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '1rem'
                }}
              />
              
              {formData.banquetTables && (
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                  Selected: {formData.banquetTables.name}
                </div>
              )}

              <button
                onClick={() => handleUpload('banquetTables', 'banquet-tables')}
                disabled={uploading.banquetTables || !formData.banquetTables}
                style={{
                  width: '100%',
                  backgroundColor: uploading.banquetTables ? '#6c757d' : '#8B7355',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  cursor: uploading.banquetTables ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                {uploading.banquetTables ? 'Uploading...' : 'Upload Banquet Tables Image'}
              </button>
            </div>
          </div>

        </div>

        {/* Instructions */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '8px',
          marginTop: '2rem'
        }}>
          <h4 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Instructions:</h4>
          <ul style={{ color: '#666', margin: 0, paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>Upload one image for each carousel section</li>
            <li style={{ marginBottom: '0.5rem' }}>Images will be saved in MongoDB and local storage</li>
            <li style={{ marginBottom: '0.5rem' }}>These images will be displayed on the main website dashboard</li>
            <li style={{ marginBottom: '0.5rem' }}>Maximum file size: 5MB per image</li>
            <li style={{ marginBottom: '0.5rem' }}>Supported formats: JPG, PNG, GIF</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default AdminCarousel;
