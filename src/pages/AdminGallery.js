import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';

const AdminGallery = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:3000/api/admin/gallery', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGallery(data);
      } else if (response.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/login');
      } else {
        setError('Failed to fetch gallery items');
      }
    } catch (error) {
      setError('Failed to fetch gallery items');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (files) => {
    setImageFiles(Array.from(files));
  };

  const handleUpload = async () => {
    if (imageFiles.length === 0) {
      setError('Please select images to upload');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('adminToken');
      
      // Upload each image separately with category
      const uploadPromises = imageFiles.map(async (file, index) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('title', file.name.split('.')[0]); // Use filename as title
        formData.append('category', 'wedding-hall'); // Default category, can be changed later
        
        const response = await fetch('http://localhost:3000/api/admin/gallery/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        return response.json();
      });

      await Promise.all(uploadPromises);
      
      setSuccess(`${imageFiles.length} images uploaded successfully!`);
      setImageFiles([]);
      fetchGallery();
      setTimeout(() => setSuccess(''), 3000);
      
      // Clear file input
      const fileInput = document.getElementById('gallery-file-input');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      setError('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this gallery item? This will also delete the associated image.')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3000/api/admin/gallery/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess('Gallery item deleted successfully!');
        fetchGallery();
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError('Failed to delete gallery item');
      }
    } catch (error) {
      setError('Failed to delete gallery item');
    }
  };

  const getImageUrl = (image) => {
    if (!image || !image.filename) return null;
    return `http://localhost:3000/uploads/gallery/${image.filename}`;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'wedding-hall': 'Wedding Hall',
      'banquet-tables': 'Banquet Tables',
      'sofa-lounge': 'Sofa Lounge',
      'decor-setups': 'Decor Setups',
      'corporate-setup': 'Corporate Setup'
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading gallery items...</div>
      </div>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '0.5rem' }}>
            Gallery Management
          </h2>
          <p style={{ color: '#666', margin: 0 }}>
            Upload multiple images for the gallery section
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

        {/* Simple Upload Form */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '1.5rem' }}>
            Upload Gallery Images
          </h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <input
              id="gallery-file-input"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '1rem'
              }}
            />
          </div>

          {imageFiles.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>
                Selected files: {imageFiles.length}
              </p>
              {imageFiles.map((file, index) => (
                <div key={index} style={{ fontSize: '0.9rem', color: '#666' }}>
                  {file.name}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || imageFiles.length === 0}
            style={{
              backgroundColor: uploading || imageFiles.length === 0 ? '#6c757d' : '#8B7355',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: uploading || imageFiles.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '1rem'
            }}
          >
            {uploading ? 'Uploading...' : 'Upload Images'}
          </button>
        </div>

        {/* Gallery Items List */}
        <div style={{ display: 'grid', gap: '2rem' }}>
          {gallery.map((item) => (
            <div key={item._id} style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>
                    {item.title}
                  </h3>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                    Category: {getCategoryLabel(item.category)}
                  </p>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    backgroundColor: item.isActive ? '#d4edda' : '#f8d7da',
                    color: item.isActive ? '#155724' : '#721c24'
                  }}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleDelete(item._id)}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Image Preview */}
              <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>
                  Image Preview
                </h4>
                
                {item.image ? (
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.title}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/400x200/8B7355/FFFFFF?text=${encodeURIComponent(item.title)}`;
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
            </div>
          ))}
        </div>

        {gallery.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p>No gallery items found. Upload some images to get started.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminGallery;
