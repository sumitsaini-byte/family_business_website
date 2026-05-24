import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import AdminNavbar from '../components/AdminNavbar';
import { getMinimumEndDate } from '../utils/rentalDates';

const AdminInventory = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProductId, setSavingProductId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dateFilters, setDateFilters] = useState({
    startDate: '',
    endDate: ''
  });
  const [draftInventory, setDraftInventory] = useState({});

  const fetchInventory = async (selectedDates = dateFilters) => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const inventory = await api.getAdminInventory(token, selectedDates);
      setProducts(inventory);
      setDraftInventory(
        inventory.reduce((accumulator, product) => ({
          ...accumulator,
          [product._id]: {
            totalQuantity: product.totalQuantity ?? 1,
            inStock: product.inStock
          }
        }), {})
      );
    } catch (fetchError) {
      setError(fetchError.message || 'Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setDateFilters((current) => {
      const next = {
        ...current,
        [name]: value
      };

      if (name === 'startDate' && next.endDate && next.endDate <= value) {
        next.endDate = '';
      }

      return next;
    });
  };

  const handleDraftChange = (productId, field, value) => {
    setDraftInventory((current) => ({
      ...current,
      [productId]: {
        ...current[productId],
        [field]: field === 'inStock' ? value : Math.max(0, Number(value) || 0)
      }
    }));
  };

  const handleInventorySave = async (productId) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/login');
        return;
      }

      setSavingProductId(productId);
      setError('');
      setSuccess('');

      const nextInventory = draftInventory[productId];
      await api.updateProductInventory(token, productId, nextInventory);
      setSuccess('Inventory updated successfully.');
      await fetchInventory();
    } catch (saveError) {
      setError(saveError.message || 'Failed to update inventory.');
    } finally {
      setSavingProductId('');
    }
  };

  return (
    <>
      <AdminNavbar />
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', paddingTop: '6rem', background: 'var(--warm-white)', minHeight: '100vh' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 14px rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: 0, fontSize: '2rem', color: '#2c3e50', fontFamily: "'Cormorant Garamond', serif" }}>Inventory Management</h2>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--muted)' }}>
            Set the maximum quantity for each product and check what is available for the selected rental dates.
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 14px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Rental Start Date</label>
              <input
                type="date"
                name="startDate"
                value={dateFilters.startDate}
                onChange={handleFilterChange}
                min={new Date().toISOString().split('T')[0]}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Rental End Date</label>
              <input
                type="date"
                name="endDate"
                value={dateFilters.endDate}
                onChange={handleFilterChange}
                min={getMinimumEndDate(dateFilters.startDate) || new Date().toISOString().split('T')[0]}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => fetchInventory(dateFilters)}
                style={{ background: '#8B7355', color: 'white', border: 'none', borderRadius: '6px', padding: '0.85rem 1.2rem', cursor: 'pointer' }}
              >
                Check Availability
              </button>
              <button
                type="button"
                onClick={() => {
                  const clearedDates = { startDate: '', endDate: '' };
                  setDateFilters(clearedDates);
                  fetchInventory(clearedDates);
                }}
                style={{ background: '#f4eee6', color: '#2c3e50', border: '1px solid #ddd', borderRadius: '6px', padding: '0.85rem 1.2rem', cursor: 'pointer' }}
              >
                Clear Dates
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ background: '#b42318', color: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: '#15803d', color: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            {success}
          </div>
        )}

        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 14px rgba(0,0,0,0.06)' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>Loading inventory...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f4ee', textAlign: 'left' }}>
                    <th style={{ padding: '1rem' }}>Product</th>
                    <th style={{ padding: '1rem' }}>Category</th>
                    <th style={{ padding: '1rem' }}>Max Quantity</th>
                    <th style={{ padding: '1rem' }}>Booked</th>
                    <th style={{ padding: '1rem' }}>Available</th>
                    <th style={{ padding: '1rem' }}>Manual Stock</th>
                    <th style={{ padding: '1rem' }}>Save</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const draft = draftInventory[product._id] || {
                      totalQuantity: product.totalQuantity ?? 1,
                      inStock: product.inStock
                    };

                    return (
                      <tr key={product._id} style={{ borderTop: '1px solid #eee' }}>
                        <td style={{ padding: '1rem', fontWeight: '600' }}>{product.name}</td>
                        <td style={{ padding: '1rem', color: 'var(--muted)' }}>{product.category}</td>
                        <td style={{ padding: '1rem' }}>{product.totalQuantity}</td>
                        <td style={{ padding: '1rem' }}>{product.bookedQuantity}</td>
                        <td style={{ padding: '1rem', fontWeight: '700', color: product.availableQuantity > 0 ? '#15803d' : '#b42318' }}>
                          {product.availableQuantity}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <input
                              type="number"
                              min="0"
                              value={draft.totalQuantity}
                              onChange={(event) => handleDraftChange(product._id, 'totalQuantity', event.target.value)}
                              style={{ width: '90px', padding: '0.65rem', borderRadius: '6px', border: '1px solid #ddd' }}
                            />
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.95rem' }}>
                              <input
                                type="checkbox"
                                checked={draft.inStock}
                                onChange={(event) => handleDraftChange(product._id, 'inStock', event.target.checked)}
                              />
                              Active
                            </label>
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button
                            type="button"
                            onClick={() => handleInventorySave(product._id)}
                            disabled={savingProductId === product._id}
                            style={{ background: '#1f2937', color: 'white', border: 'none', borderRadius: '6px', padding: '0.75rem 1rem', cursor: 'pointer', opacity: savingProductId === product._id ? 0.7 : 1 }}
                          >
                            {savingProductId === product._id ? 'Saving...' : 'Save'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminInventory;
