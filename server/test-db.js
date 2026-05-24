const mongoose = require('mongoose');
require('dotenv').config();

// Test MongoDB connection and check collections
const testDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Get database info
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n📊 Collections found:');
    if (collections.length === 0) {
      console.log('❌ No collections found yet');
      console.log('💡 Submit a review or booking to create collections');
    } else {
      collections.forEach(collection => {
        console.log(`✅ ${collection.name}`);
      });
    }
    
    // Check documents count
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`📋 ${collection.name}: ${count} documents`);
    }
    
    await mongoose.disconnect();
    console.log('\n🎯 Database test completed');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
};

testDB();
