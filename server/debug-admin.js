const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Admin User Schema
const adminUserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true }
});

const AdminUser = mongoose.model('AdminUser', adminUserSchema);

// Debug admin login
const debugLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Find admin user
    const user = await AdminUser.findOne({ username: 'admin' });
    console.log('🔍 Found user:', user ? user.username : 'Not found');
    
    if (user) {
      console.log('📋 Stored password hash:', user.password);
      
      // Test password comparison
      const testPassword = 'admin123';
      const isValidPassword = await bcrypt.compare(testPassword, user.password);
      console.log('🔐 Password comparison result:', isValidPassword);
      
      // Test with a new hash
      const testHash = await bcrypt.hash('admin123', 10);
      console.log('🔐 New hash for comparison:', testHash);
      const isValidPassword2 = await bcrypt.compare(testPassword, testHash);
      console.log('🔐 New hash comparison result:', isValidPassword2);
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
};

debugLogin();
