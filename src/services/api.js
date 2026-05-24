const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// API service functions
export const api = {
  getProducts: async ({ startDate, endDate, category, featured } = {}) => {
    const params = new URLSearchParams();

    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (category) params.set('category', category);
    if (featured) params.set('featured', 'true');

    const response = await fetch(`${API_BASE_URL}/products${params.toString() ? `?${params.toString()}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  getProduct: async (id, { startDate, endDate } = {}) => {
    const params = new URLSearchParams();

    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/products/${id}${params.toString() ? `?${params.toString()}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch product details');
    return response.json();
  },

  // Reviews
  getReviews: async () => {
    const response = await fetch(`${API_BASE_URL}/reviews`);
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return response.json();
  },

  createReview: async (reviewData) => {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
    if (!response.ok) throw new Error('Failed to create review');
    return response.json();
  },

  createPackageInquiry: async (inquiryData) => {
    const response = await fetch(`${API_BASE_URL}/package-inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inquiryData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to create package inquiry');
    }
    return response.json();
  },

  getPackageInquiries: async (token) => {
    const response = await fetch(`${API_BASE_URL}/admin/package-inquiries`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch package inquiries');
    return response.json();
  },

  getPackageInquiry: async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/admin/package-inquiries/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch package inquiry');
    return response.json();
  },

  // Bookings
  getBookings: async () => {
    const response = await fetch(`${API_BASE_URL}/bookings`);
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  createBooking: async (bookingData) => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    if (!response.ok) throw new Error('Failed to create booking');
    return response.json();
  },

  createPaymentOrder: async (bookingData) => {
    const response = await fetch(`${API_BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to create payment order');
    }
    return response.json();
  },

  verifyBookingPayment: async (paymentData) => {
    const response = await fetch(`${API_BASE_URL}/payments/verify-booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to verify payment');
    }
    return response.json();
  },

  createDemoBooking: async (bookingData) => {
    const response = await fetch(`${API_BASE_URL}/payments/demo-booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to complete demo payment');
    }
    return response.json();
  },

  getPaymentStatus: async (bookingId) => {
    const response = await fetch(`${API_BASE_URL}/payments/status/${bookingId}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch payment status');
    }
    return response.json();
  },

  getBooking: async (id) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}`);
    if (!response.ok) throw new Error('Failed to fetch booking');
    return response.json();
  },

  updateBookingStatus: async (id, status) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update booking status');
    return response.json();
  },

  getAdminInventory: async (token, { startDate, endDate } = {}) => {
    const params = new URLSearchParams();

    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/admin/inventory${params.toString() ? `?${params.toString()}` : ''}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch inventory');
    return response.json();
  },

  updateProductInventory: async (token, productId, inventoryData) => {
    const response = await fetch(`${API_BASE_URL}/admin/products/${productId}/inventory`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(inventoryData)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to update product inventory');
    }

    return response.json();
  }
};
