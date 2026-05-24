import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'admin'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
      } else {
        setError('Failed to fetch users');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3000/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({ username: '', email: '', password: '', role: 'admin' });
        fetchUsers(); // Refresh the list
      } else {
        setError(data.message || 'Failed to create user');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3000/api/admin/users/${userId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchUsers(); // Refresh the list
      } else {
        setError('Failed to update user status');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchUsers(); // Refresh the list
      } else {
        setError('Failed to delete user');
      }
    } catch (error) {
      setError('Network error');
    }
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
        <div style={{fontSize: '1.2rem', color: 'var(--muted)'}}>Loading users...</div>
      </div>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto', background: 'var(--warm-white)', paddingTop: '6rem'}}>
      {/* Header */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'}}>
        <div>
          <h1 style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', margin: 0, color: 'var(--charcoal)'}}>
            User Management
          </h1>
          <p style={{color: 'var(--muted)', margin: '0.5rem 0 0 0', fontSize: '0.9rem'}}>
            Manage admin user accounts and permissions
          </p>
        </div>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button
            onClick={() => navigate('/admin')}
            style={{
              background: 'var(--gold)',
              color: 'var(--charcoal)',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              background: '#27ae60',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            {showCreateForm ? 'Cancel' : 'Create User'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      {/* Create User Form */}
      {showCreateForm && (
        <div style={{background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '2rem'}}>
          <h2 style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--charcoal)'}}>
            Create New Admin User
          </h2>
          
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
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  minLength={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    fontFamily: "'DM Sans', sans-serif"
                  }}
                  placeholder="Enter username"
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
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
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
                  placeholder="Enter email"
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
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    fontFamily: "'DM Sans', sans-serif"
                  }}
                  placeholder="Enter password"
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
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    fontFamily: "'DM Sans', sans-serif"
                  }}
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'var(--gold)',
                color: 'var(--charcoal)',
                border: 'none',
                padding: '0.875rem',
                borderRadius: '4px',
                fontSize: '1rem',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? 'Creating User...' : 'Create User'}
            </button>
          </form>
        </div>
      )}

      {/* Users List */}
      {!showCreateForm && (
        <div style={{background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'}}>
          <h2 style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', padding: '1.5rem', margin: 0, color: 'var(--charcoal)'}}>
            Admin Users ({users.length})
          </h2>
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{background: 'var(--cream)'}}>
                  <th style={{padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: '600'}}>Username</th>
                  <th style={{padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: '600'}}>Email</th>
                  <th style={{padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: '600'}}>Role</th>
                  <th style={{padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: '600'}}>Status</th>
                  <th style={{padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: '600'}}>Created</th>
                  <th style={{padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: '600'}}>Last Login</th>
                  <th style={{padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: '600'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} style={{borderBottom: '1px solid var(--border)'}}>
                    <td style={{padding: '1rem', fontWeight: '500'}}>{user.username}</td>
                    <td style={{padding: '1rem'}}>{user.email}</td>
                    <td style={{padding: '1rem'}}>
                      <span style={{
                        background: user.role === 'superadmin' ? '#8e44ad' : 'var(--gold)',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{padding: '1rem'}}>
                      <span style={{
                        background: user.isActive ? '#27ae60' : '#f39c12',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{padding: '1rem'}}>{formatDate(user.createdAt)}</td>
                    <td style={{padding: '1rem'}}>{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</td>
                    <td style={{padding: '1rem'}}>
                      <button
                        onClick={() => toggleUserStatus(user._id)}
                        style={{
                          background: user.isActive ? '#f39c12' : '#27ae60',
                          color: 'white',
                          border: 'none',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginRight: '0.5rem',
                          fontSize: '0.8rem'
                        }}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteUser(user._id)}
                        style={{
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default AdminUserManagement;
