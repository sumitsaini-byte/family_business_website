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

// Create or reset the default admin user
const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Check if admin user exists
    const existingAdmin = await AdminUser.findOne({ username: 'admin' });
    if (!existingAdmin) {
      // Create default admin user
      const admin = new AdminUser({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@furnish-and-co.com',
        role: 'admin'
      });
      
      await admin.save();
      console.log('✅ Default admin user created successfully!');
    } else {
      existingAdmin.password = hashedPassword;
      existingAdmin.isActive = true;
      await existingAdmin.save();
      console.log('✅ Existing admin password reset successfully!');
    }

    console.log('📋 Username: admin');
    console.log('📋 Password: admin123');
    
    await mongoose.disconnect();
    console.log('🎯 Admin setup completed');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};

createAdmin();
