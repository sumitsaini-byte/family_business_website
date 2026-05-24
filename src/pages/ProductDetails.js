import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { formatRentalDate, getMinimumEndDate, isValidRentalDateRange } from '../utils/rentalDates';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const { addToCart, bookingDates, updateBookingDates, hasSelectedDates } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id, bookingDates.startDate, bookingDates.endDate]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await api.getProduct(
        id,
        isValidRentalDateRange(bookingDates.startDate, bookingDates.endDate)
          ? bookingDates
          : {}
      );
      setProduct(data);
      setError('');
    } catch (error) {
      setError(error.message || 'Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (currentImageIndex < product.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    if (!isValidRentalDateRange(bookingDates.startDate, bookingDates.endDate)) {
      setAvailabilityMessage('Please choose rental start and end dates first.');
      return;
    }

    if (!product.inStock || Number(product.availableQuantity || 0) <= 0) {
      setAvailabilityMessage('This product is not available for the selected dates.');
      return;
    }

    if (selectedQuantity > Number(product.availableQuantity || 0)) {
      setAvailabilityMessage(`Only ${product.availableQuantity} item(s) are available for those dates.`);
      return;
    }

    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: selectedQuantity,
      maxQuantity: product.availableQuantity,
      image: product.images?.[product.thumbnailIndex || 0]
        ? getImageUrl(product.images[product.thumbnailIndex || 0])
        : 'https://via.placeholder.com/400x300/8B7355/FFFFFF?text=Product'
    });
    setAvailabilityMessage('');
  };

  const handleQuantityChange = (nextValue) => {
    const requestedQuantity = Math.max(1, Number(nextValue) || 1);
    const maxQuantity = hasSelectedDates
      ? Math.max(1, Number(product?.availableQuantity || 0))
      : requestedQuantity;

    setSelectedQuantity(hasSelectedDates ? Math.min(requestedQuantity, maxQuantity) : requestedQuantity);
  };

  const handleDateChange = (event) => {
    const { name, value } = event.target;
    const nextDates = {
      ...bookingDates,
      [name]: value
    };

    if (name === 'startDate' && nextDates.endDate && nextDates.endDate <= value) {
      nextDates.endDate = '';
    }

    updateBookingDates(nextDates);
    setAvailabilityMessage('');
  };

  const handleBack = () => {
    navigate('/products');
  };

  const getImageUrl = (image) => {
    return `http://localhost:3000/uploads/products/${image.filename}`;
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading product details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ color: '#dc3545', marginBottom: '1rem' }}>{error}</div>
          <button
            onClick={handleBack}
            style={{
              backgroundColor: '#8B7355',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to Products
          </button>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div>Product not found</div>
          <button
            onClick={handleBack}
            style={{
              backgroundColor: '#8B7355',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Back to Products
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={{ padding: '2rem' }}>
        {/* Back Button */}
        <button
          onClick={handleBack}
          style={{
            backgroundColor: 'transparent',
            color: '#8B7355',
            border: '1px solid #8B7355',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '2rem',
            fontSize: '0.9rem'
          }}
        >
          ← Back to Products
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Product Images Section */}
          <div>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <h2 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>Product Images</h2>
              
              {product.images && product.images.length > 0 ? (
                <>
                  {/* Main Image */}
                  <div style={{ marginBottom: '1rem' }}>
                    <img
                      src={getImageUrl(product.images[currentImageIndex])}
                      alt={`${product.name} - Image ${currentImageIndex + 1}`}
                      style={{
                        width: '100%',
                        height: '400px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #ddd'
                      }}
                    />
                  </div>

                  {/* Image Navigation */}
                  {product.images.length > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <button
                        onClick={handlePrevImage}
                        disabled={currentImageIndex === 0}
                        style={{
                          backgroundColor: currentImageIndex === 0 ? '#6c757d' : '#8B7355',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          cursor: currentImageIndex === 0 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        ← Previous
                      </button>
                      <span style={{ display: 'flex', alignItems: 'center', color: '#666' }}>
                        {currentImageIndex + 1} / {product.images.length}
                      </span>
                      <button
                        onClick={handleNextImage}
                        disabled={currentImageIndex === product.images.length - 1}
                        style={{
                          backgroundColor: currentImageIndex === product.images.length - 1 ? '#6c757d' : '#8B7355',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          cursor: currentImageIndex === product.images.length - 1 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Next →
                      </button>
                    </div>
                  )}

                  {/* Thumbnail Gallery */}
                  {product.images.length > 1 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem' }}>
                      {product.images.map((image, index) => (
                        <div
                          key={index}
                          onClick={() => handleThumbnailClick(index)}
                          style={{
                            border: currentImageIndex === index ? '2px solid #8B7355' : '1px solid #ddd',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            cursor: 'pointer'
                          }}
                        >
                          <img
                            src={getImageUrl(image)}
                            alt={`${product.name} - Thumbnail ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '80px',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ 
                  height: '200px', 
                  backgroundColor: '#f8f9fa', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderRadius: '8px',
                  color: '#6c757d'
                }}>
                  No images available
                </div>
              )}
            </div>
          </div>

          {/* Product Details Section */}
          <div>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <h2 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>Product Details</h2>
              
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#8B7355' }}>{product.name}</h3>
                <div style={{ color: '#666', marginBottom: '1rem' }}>
                  Category: <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>{product.category}</span>
                </div>
                <div style={{ color: '#666', marginBottom: '1rem' }}>
                  Price: <span style={{ fontWeight: 'bold', color: '#8B7355', fontSize: '1.2rem' }}>₹{product.price}</span>
                </div>
                <div style={{ color: '#666', marginBottom: '1rem' }}>
                  Availability:
                  <span style={{ 
                    fontWeight: 'bold',
                    color: hasSelectedDates
                      ? (Number(product.availableQuantity || 0) > 0 ? '#28a745' : '#dc3545')
                      : (product.inStock ? '#28a745' : '#dc3545'),
                    marginLeft: '0.5rem'
                  }}>
                    {hasSelectedDates
                      ? `${product.availableQuantity} item(s) available`
                      : product.inStock ? 'Choose dates to check' : 'Out of Stock'}
                  </span>
                </div>
                {product.featured && (
                  <div style={{ 
                    backgroundColor: '#fff3cd', 
                    color: '#856404', 
                    padding: '0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.9rem',
                    marginBottom: '1rem'
                  }}>
                    ⭐ Featured Product
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>Description</h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  {product.description}
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f4ee', borderRadius: '8px', border: '1px solid #eadfce' }}>
                <div style={{ margin: '0 0 0.75rem 0', color: '#2c3e50', fontWeight: '600' }}>Choose Rental Dates</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: '500' }}>Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={bookingDates.startDate}
                      onChange={handleDateChange}
                      min={new Date().toISOString().split('T')[0]}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: '500' }}>End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={bookingDates.endDate}
                      onChange={handleDateChange}
                      min={getMinimumEndDate(bookingDates.startDate) || new Date().toISOString().split('T')[0]}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                </div>
                <div style={{ marginTop: '0.75rem', color: '#6b7280', fontSize: '0.92rem' }}>
                  {hasSelectedDates && isValidRentalDateRange(bookingDates.startDate, bookingDates.endDate)
                    ? `Showing availability from ${formatRentalDate(bookingDates.startDate)} to ${formatRentalDate(bookingDates.endDate)}`
                    : 'Select both dates before adding this product to the cart.'}
                </div>
                {availabilityMessage && (
                  <div style={{ marginTop: '0.75rem', color: '#b42318', fontSize: '0.92rem', fontWeight: '600' }}>
                    {availabilityMessage}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', fontWeight: '600' }}>Select Quantity</div>
                <div className="product-quantity-control product-quantity-control-detail">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(selectedQuantity - 1)}
                    disabled={!product.inStock || (hasSelectedDates && Number(product.availableQuantity || 0) <= 0)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={hasSelectedDates ? Math.max(1, Number(product.availableQuantity || 1)) : undefined}
                    value={selectedQuantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    disabled={!product.inStock || (hasSelectedDates && Number(product.availableQuantity || 0) <= 0)}
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(selectedQuantity + 1)}
                    disabled={!product.inStock || (hasSelectedDates && Number(product.availableQuantity || 0) <= 0)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={handleAddToCart}
                  disabled={!hasSelectedDates || !product.inStock || Number(product.availableQuantity || 0) <= 0}
                  style={{
                    backgroundColor: hasSelectedDates && product.inStock && Number(product.availableQuantity || 0) > 0 ? '#8B7355' : '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '4px',
                    cursor: hasSelectedDates && product.inStock && Number(product.availableQuantity || 0) > 0 ? 'pointer' : 'not-allowed',
                    fontSize: '1rem'
                  }}
                >
                  {!hasSelectedDates
                    ? 'Choose Dates First'
                    : Number(product.availableQuantity || 0) > 0
                      ? 'Add to Cart'
                      : 'Unavailable'}
                </button>
                <button
                  onClick={handleBack}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#8B7355',
                    border: '1px solid #8B7355',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Back to Products
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
