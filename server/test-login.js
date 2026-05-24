const fetch = (...args) => import('node-fetch').then(({ default: nodeFetch }) => nodeFetch(...args));

// Test admin login API
const testLogin = async () => {
  try {
    console.log('🔍 Testing admin login API...');
    
    const response = await fetch('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    console.log('📊 Response status:', response.status);
    console.log('📊 Response data:', data);
    
    if (response.ok && data.token) {
      console.log('✅ Login successful!');
      console.log('🔑 Token:', data.token.substring(0, 50) + '...');
    } else {
      console.log('❌ Login failed:', data.message || 'Unknown error');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testLogin();
