const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

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

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await AdminUser.findOne({ username: 'admin' });

    if (admin) {
      admin.password = hashedPassword;
      admin.isActive = true;
      await admin.save();
      console.log('✅ Admin password reset successfully');
    } else {
      await AdminUser.create({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@furnishandco.com',
        role: 'superadmin',
        isActive: true
      });
      console.log('✅ Admin user created successfully');
    }

    console.log('📋 Username: admin');
    console.log('📋 Password: admin123');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Failed to reset admin password:', error);
    process.exitCode = 1;
  }
};

resetAdminPassword();
