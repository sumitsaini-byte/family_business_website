import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import AdminNavbar from '../components/AdminNavbar';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    totalQuantity: 1,
    inStock: true,
    featured: false
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const categories = ['Chairs', 'Tables', 'Sofas', 'Decor', 'Lighting', 'Storage', 'Other'];

  useEffect(() => {
    fetchProducts();
  }, [navigate]); // Add navigate as dependency to prevent infinite loop

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:3000/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else if (response.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/login');
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageSelect = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('adminToken');
      const url = editingProduct 
        ? `http://localhost:3000/api/products/${editingProduct._id}`
        : 'http://localhost:3000/api/products';
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const savedProduct = await response.json();
        setSuccess(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
        
        // If there are images to upload, upload them
        if (imageFiles.length > 0) {
          await uploadImages(savedProduct._id);
        } else {
          resetForm();
          fetchProducts();
          setTimeout(() => {
            setShowForm(false);
            setSuccess('');
          }, 2000);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save product');
      }
    } catch (error) {
      setError('Failed to save product');
    }
  };

  const uploadImages = async (productId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`http://localhost:3000/api/products/${productId}/upload-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        setSuccess('Product and images uploaded successfully!');
        resetForm();
        fetchProducts();
        setTimeout(() => {
          setShowForm(false);
          setSuccess('');
        }, 2000);
      } else {
        setError('Failed to upload images');
      }
    } catch (error) {
      setError('Failed to upload images');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      totalQuantity: product.totalQuantity ?? 1,
      inStock: product.inStock,
      featured: product.featured
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess('Product deleted successfully!');
        fetchProducts();
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError('Failed to delete product');
      }
    } catch (error) {
      setError('Failed to delete product');
    }
  };

  const handleImageUpload = (product) => {
    setSelectedProduct(product);
    setShowImageUpload(true);
    setImageFiles([]);
    setError('');
    setSuccess('');
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      setError('Please select images to upload');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`http://localhost:3000/api/products/${selectedProduct._id}/upload-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        setSuccess('Images uploaded successfully!');
        setImageFiles([]);
        fetchProducts();
        setTimeout(() => {
          setShowImageUpload(false);
          setSuccess('');
        }, 2000);
      } else {
        setError('Failed to upload images');
      }
    } catch (error) {
      setError('Failed to upload images');
    }
  };

  const handleSetThumbnail = async (productId, imageIndex) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3000/api/products/${productId}/thumbnail`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ thumbnailIndex: imageIndex })
      });

      if (response.ok) {
        setSuccess('Thumbnail set successfully!');
        fetchProducts();
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError('Failed to set thumbnail');
      }
    } catch (error) {
      setError('Failed to set thumbnail');
    }
  };

  const handleDeleteImage = async (productId, imageIndex) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3000/api/products/${productId}/images/${imageIndex}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess('Image deleted successfully!');
        fetchProducts();
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError('Failed to delete image');
      }
    } catch (error) {
      setError('Failed to delete image');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      totalQuantity: 1,
      inStock: true,
      featured: false
    });
    setEditingProduct(null);
    setImageFiles([]);
    setError('');
  };

  const getImageUrl = (image) => {
    return `http://localhost:3000/uploads/products/${image.filename}`;
  };

  const getDefaultImage = (productName) => {
    return `https://via.placeholder.com/300x200/8B7355/FFFFFF?text=${encodeURIComponent(productName)}`;
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading products...</div>
      </div>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', paddingTop: '6rem', background: 'var(--warm-white)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap', background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: '#2c3e50', margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>Product Management</h2>
          <p style={{ color: 'var(--muted)', margin: '0.5rem 0 0 0', fontSize: '0.95rem' }}>
            Add new rental items, update pricing, and manage product images.
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            resetForm();
          }}
          style={{
            backgroundColor: '#8B7355',
            color: 'white',
            border: 'none',
            padding: '0.9rem 1.6rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            boxShadow: '0 8px 20px rgba(139,115,85,0.18)'
          }}
        >
          + Add New Product
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#e74c3c',
          color: 'white',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: '#27ae60',
          color: 'white',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {success}
        </div>
      )}

      {showForm && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '2rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Price (Rs)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Total Quantity</label>
                <input
                  type="number"
                  name="totalQuantity"
                  value={formData.totalQuantity}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="3"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Product Images (optional)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
              {imageFiles.length > 0 && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                  {imageFiles.length} image(s) selected
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleInputChange}
                  style={{ marginRight: '0.5rem' }}
                />
                In Stock
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  style={{ marginRight: '0.5rem' }}
                />
                Featured Product
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                style={{
                  backgroundColor: '#8B7355',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {products.map(product => (
          <div key={product._id} style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ height: '200px', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {product.images && product.images.length > 0 ? (
                <img
                  src={getImageUrl(product.images[product.thumbnailIndex || 0])}
                  alt={product.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.src = getDefaultImage(product.name);
                  }}
                />
              ) : (
                <img
                  src={getDefaultImage(product.name)}
                  alt={product.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'cover'
                  }}
                />
              )}
              {product.images && product.images.length > 1 && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.8rem'
                }}>
                  {product.images.length} photos
                </div>
              )}
            </div>
            
            <div style={{ padding: '1rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>{product.name}</h3>
              <p style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '0.9rem' }}>{product.category}</p>
              <p style={{ margin: '0 0 1rem 0', color: '#2c3e50', fontSize: '1.1rem', fontWeight: 'bold' }}>Rs {product.price}</p>
              <p style={{ margin: '0 0 1rem 0', color: '#6c757d', fontSize: '0.9rem' }}>Max quantity: {product.totalQuantity ?? 1}</p>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {product.inStock && (
                  <span style={{
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem'
                  }}>In Stock</span>
                )}
                {product.featured && (
                  <span style={{
                    backgroundColor: '#fff3cd',
                    color: '#856404',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem'
                  }}>Featured</span>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleEdit(product)}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleImageUpload(product)}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Add Images
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
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
              
              {product.images && product.images.length > 0 && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#666' }}>Product Images:</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    {product.images.map((image, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img
                          src={getImageUrl(image)}
                          alt={`${product.name} ${index + 1}`}
                          style={{
                            width: '50px',
                            height: '50px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: index === product.thumbnailIndex ? '2px solid #007bff' : '1px solid #ddd',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleSetThumbnail(product._id, index)}
                          title="Click to set as thumbnail"
                        />
                        {index === product.thumbnailIndex && (
                          <div style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            borderRadius: '50%',
                            width: '16px',
                            height: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem'
                          }}>
                            *
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteImage(product._id, index)}
                          style={{
                            position: 'absolute',
                            top: '-5px',
                            left: '-5px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            fontSize: '0.7rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Delete image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    Click image to set as thumbnail
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
          <h3>No products found</h3>
          <p>Start by adding your first product!</p>
        </div>
      )}

      {/* Image Upload Modal */}
      {showImageUpload && selectedProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>
              Add Images for {selectedProduct.name}
            </h3>
            
            {error && (
              <div style={{
                backgroundColor: '#e74c3c',
                color: 'white',
                padding: '1rem',
                borderRadius: '4px',
                marginBottom: '1rem'
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                backgroundColor: '#27ae60',
                color: 'white',
                padding: '1rem',
                borderRadius: '4px',
                marginBottom: '1rem'
              }}>
                {success}
              </div>
            )}
            
            <form onSubmit={handleImageSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Select Images (up to 5 images)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
                {imageFiles.length > 0 && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                    {imageFiles.length} image(s) selected
                  </div>
                )}
              </div>

              {imageFiles.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Preview:
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {imageFiles.map((file, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: '2px',
                          right: '2px',
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          fontSize: '0.7rem',
                          padding: '1px 4px',
                          borderRadius: '2px'
                        }}>
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Upload Images
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowImageUpload(false);
                    setSelectedProduct(null);
                    setImageFiles([]);
                    setError('');
                    setSuccess('');
                  }}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default AdminProducts;
