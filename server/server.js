const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Load environment variables
dotenv.config();

const app = express();
const ADVANCE_PAYMENT_PERCENTAGE = 0.25;
const FRONTEND_BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/furnish-and-co', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // 30 seconds timeout
  socketTimeoutMS: 45000, // 45 seconds timeout
  connectTimeoutMS: 30000, // 30 seconds timeout
  maxPoolSize: 10,
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB Atlas connection error:', err));

// Review Schema
const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  event: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true },
  initials: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);

const packageInquirySchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String, required: true },
  eventDate: { type: Date, required: true },
  guestCount: { type: Number },
  packageSlug: { type: String, required: true },
  packageName: { type: String, required: true },
  packagePrice: { type: String, required: true },
  packageDescription: { type: String, required: true },
  packageFeatures: [{ type: String }],
  additionalRequirements: { type: String },
  status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
  createdAt: { type: Date, default: Date.now }
});

const PackageInquiry = mongoose.model('PackageInquiry', packageInquirySchema);

// Booking Schema
const bookingSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  eventDate: { type: Date, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  additionalRequirements: { type: String },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  totalPrice: { type: Number, required: true, min: 0 },
  advanceAmount: { type: Number, required: true, min: 0 },
  remainingAmount: { type: Number, required: true, min: 0 },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'demo-paid'],
    default: 'pending'
  },
  paymentMode: {
    type: String,
    enum: ['razorpay', 'demo'],
    default: 'demo'
  },
  paymentOrderId: { type: String },
  paymentId: { type: String },
  paymentSignature: { type: String },
  paidAt: { type: Date },
  status: { type: String, enum: ['pending', 'confirmed', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);

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

// Multer configuration for file uploads
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directories exist
const productsUploadsDir = path.join(__dirname, 'uploads', 'products');
const carouselUploadsDir = path.join(__dirname, 'uploads', 'carousel');
const galleryUploadsDir = path.join(__dirname, 'uploads', 'gallery');
if (!fs.existsSync(productsUploadsDir)) {
  fs.mkdirSync(productsUploadsDir, { recursive: true });
}
if (!fs.existsSync(carouselUploadsDir)) {
  fs.mkdirSync(carouselUploadsDir, { recursive: true });
}
if (!fs.existsSync(galleryUploadsDir)) {
  fs.mkdirSync(galleryUploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, productsUploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  }
});

// Carousel image upload middleware
const carouselUpload = multer({ 
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, carouselUploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'carousel-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  }
});

// Gallery image upload middleware
const galleryUpload = multer({ 
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, galleryUploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'gallery-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  }
});

// Authentication middleware
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  totalQuantity: { type: Number, default: 1, min: 0 },
  images: [{
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
    mimetype: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  thumbnailIndex: { type: Number, default: 0 }, // Index of the thumbnail image in images array
  inStock: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Banquet Hall Schema for managing banquet hall images
const banquetHallSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['sofa', 'table', 'chair', 'decor', 'hall', 'other'] },
  description: { type: String },
  images: [{
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
    mimetype: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  mainImageIndex: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const BanquetHall = mongoose.model('BanquetHall', banquetHallSchema);

// Dashboard Image Schema for managing dashboard display images
const dashboardImageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['sofa', 'table', 'chair'] },
  image: {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
    mimetype: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const DashboardImage = mongoose.model('DashboardImage', dashboardImageSchema);

// Carousel Schema for 3 specific carousel images
const carouselSchema = new mongoose.Schema({
  weddingHallImage: {
    filename: { type: String },
    originalName: { type: String },
    path: { type: String },
    size: { type: Number },
    mimetype: { type: String },
    uploadedAt: { type: Date }
  },
  luxurySofaImage: {
    filename: { type: String },
    originalName: { type: String },
    path: { type: String },
    size: { type: Number },
    mimetype: { type: String },
    uploadedAt: { type: Date }
  },
  banquetTablesImage: {
    filename: { type: String },
    originalName: { type: String },
    path: { type: String },
    size: { type: Number },
    mimetype: { type: String },
    uploadedAt: { type: Date }
  },
  updatedAt: { type: Date, default: Date.now }
});

const Carousel = mongoose.model('Carousel', carouselSchema);

// Gallery Schema for multiple gallery images
const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true, enum: ['wedding-hall', 'banquet-tables', 'sofa-lounge', 'decor-setups', 'corporate-setup'] },
  image: {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
    mimetype: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Gallery = mongoose.model('Gallery', gallerySchema);

// Authentication middleware
const authenticateAdmin = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Verify user still exists
    const user = await AdminUser.findOne({ username: decoded.username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid token or user not found.' });
    }
    
    // Check if user is active (if field exists)
    if (user.isActive !== undefined && !user.isActive) {
      return res.status(401).json({ message: 'User account is deactivated.' });
    }
    
    req.admin = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const hasRazorpayCredentials = () => Boolean(
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
);

const normalizeDateValue = (value) => {
  const parsedDate = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  parsedDate.setHours(0, 0, 0, 0);
  return parsedDate;
};

const addDays = (date, days) => {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
};

const resolveBookingStartDate = (booking) => normalizeDateValue(booking.startDate || booking.eventDate);

const resolveBookingEndDate = (booking) => {
  const normalizedEndDate = normalizeDateValue(booking.endDate);
  if (normalizedEndDate) {
    return normalizedEndDate;
  }

  const fallbackStartDate = resolveBookingStartDate(booking);
  return fallbackStartDate ? addDays(fallbackStartDate, 1) : null;
};

const normalizeDateRange = (startDateInput, endDateInput) => {
  const startDate = normalizeDateValue(startDateInput);
  const endDate = normalizeDateValue(endDateInput);

  if (!startDate || !endDate) {
    return null;
  }

  return { startDate, endDate };
};

const isDateRangeOverlapping = (firstStart, firstEnd, secondStart, secondEnd) => (
  firstStart < secondEnd && firstEnd > secondStart
);

const calculateAvailabilityForProducts = async (productIds, startDateInput, endDateInput) => {
  const normalizedRange = normalizeDateRange(startDateInput, endDateInput);
  const availabilityMap = {};

  productIds.forEach((productId) => {
    availabilityMap[String(productId)] = 0;
  });

  if (!normalizedRange || productIds.length === 0) {
    return availabilityMap;
  }

  const paidBookings = await Booking.find({
    paymentStatus: { $in: ['paid', 'demo-paid'] },
    'items.productId': { $in: productIds }
  }).select('items startDate endDate eventDate paymentStatus');

  paidBookings.forEach((booking) => {
    const bookingStartDate = resolveBookingStartDate(booking);
    const bookingEndDate = resolveBookingEndDate(booking);

    if (!bookingStartDate || !bookingEndDate) {
      return;
    }

    if (!isDateRangeOverlapping(
      bookingStartDate,
      bookingEndDate,
      normalizedRange.startDate,
      normalizedRange.endDate
    )) {
      return;
    }

    (booking.items || []).forEach((item) => {
      const productKey = String(item.productId);
      if (availabilityMap[productKey] !== undefined) {
        availabilityMap[productKey] += Number(item.quantity) || 0;
      }
    });
  });

  return availabilityMap;
};

const serializeProductAvailability = (product, bookedQuantity = 0) => {
  const totalQuantity = Math.max(0, Number(product.totalQuantity ?? 1));
  const availableQuantity = product.inStock ? Math.max(0, totalQuantity - bookedQuantity) : 0;

  return {
    ...product.toObject(),
    totalQuantity,
    bookedQuantity,
    availableQuantity,
    isAvailableForDates: availableQuantity > 0
  };
};

const ensureBookingInventoryAvailability = async (normalizedBooking) => {
  const productIds = normalizedBooking.items.map((item) => item.productId);
  const [products, bookedQuantityMap] = await Promise.all([
    Product.find({ _id: { $in: productIds } }),
    calculateAvailabilityForProducts(productIds, normalizedBooking.startDate, normalizedBooking.endDate)
  ]);

  const productMap = new Map(products.map((product) => [String(product._id), product]));

  for (const item of normalizedBooking.items) {
    const product = productMap.get(String(item.productId));

    if (!product) {
      return { ok: false, message: `${item.name} is no longer available.` };
    }

    const totalQuantity = Math.max(0, Number(product.totalQuantity ?? 1));
    const bookedQuantity = bookedQuantityMap[String(item.productId)] || 0;
    const availableQuantity = product.inStock ? Math.max(0, totalQuantity - bookedQuantity) : 0;

    if (!product.inStock || availableQuantity < item.quantity) {
      return {
        ok: false,
        message: `${product.name} has only ${availableQuantity} item(s) available for the selected dates.`
      };
    }
  }

  return { ok: true };
};

const normalizeBookingPayload = (payload) => {
  const normalizedDateRange = normalizeDateRange(payload.startDate || payload.eventDate, payload.endDate);

  const normalizedItems = (payload.items || []).map((item) => ({
    productId: item.productId,
    name: item.name,
    price: Number(item.price),
    quantity: Number(item.quantity)
  }));

  const totalPrice = Number(
    normalizedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)
  );
  const advanceAmount = Number((totalPrice * ADVANCE_PAYMENT_PERCENTAGE).toFixed(2));
  const remainingAmount = Number((totalPrice - advanceAmount).toFixed(2));

  return {
    customerName: payload.customerName,
    phone: payload.phone,
    address: payload.address,
    eventDate: normalizedDateRange ? normalizedDateRange.startDate : new Date(payload.eventDate),
    startDate: normalizedDateRange ? normalizedDateRange.startDate : new Date(payload.eventDate),
    endDate: normalizedDateRange ? normalizedDateRange.endDate : addDays(new Date(payload.eventDate), 1),
    additionalRequirements: payload.additionalRequirements,
    items: normalizedItems,
    totalPrice,
    advanceAmount,
    remainingAmount
  };
};

const bookingValidationRules = [
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate')
    .isISO8601().withMessage('Valid end date is required')
    .custom((value, { req }) => {
      const startDate = normalizeDateValue(req.body.startDate);
      const endDate = normalizeDateValue(value);

      if (!startDate || !endDate) {
        return false;
      }

      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }

      return true;
    }),
  body('items').isArray({ min: 1 }).withMessage('At least one cart item is required'),
  body('items.*.productId').isMongoId().withMessage('Valid product ID is required'),
  body('items.*.name').notEmpty().withMessage('Product name is required'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Valid product price is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Valid product quantity is required')
];

// Create default admin user (run once)
const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await AdminUser.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const defaultAdmin = new AdminUser({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@furnishandco.com',
        role: 'superadmin'
      });
      await defaultAdmin.save();
      console.log('Default admin user created: username=admin, password=admin123');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// Routes

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user in database
    const user = await AdminUser.findOne({ username, isActive: true });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    const token = jwt.sign(
      { username: user.username, role: user.role }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token, 
      admin: { 
        username: user.username, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin user management routes
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await AdminUser.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/admin/users', authenticateAdmin, [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'superadmin']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role } = req.body;
    
    // Check if username already exists
    const existingUser = await AdminUser.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new AdminUser({
      username,
      email,
      password: hashedPassword,
      role
    });
    
    const savedUser = await newUser.save();
    res.status(201).json({
      message: 'Admin user created successfully',
      user: {
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role,
        createdAt: savedUser.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/admin/users/:id/toggle', authenticateAdmin, async (req, res) => {
  try {
    const user = await AdminUser.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();
    
    res.json({
      message: `User ${user.isActive ? 'deactivated' : 'activated'} successfully`,
      isActive: user.isActive
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const user = await AdminUser.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deletion of the last admin
    const adminCount = await AdminUser.countDocuments({ isActive: true });
    if (adminCount <= 1) {
      return res.status(400).json({ message: 'Cannot delete the last admin user' });
    }

    await AdminUser.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/package-inquiries', [
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('eventDate').isISO8601().toDate().withMessage('Valid event date is required'),
  body('packageSlug').notEmpty().withMessage('Package slug is required'),
  body('selectedPackage.name').notEmpty().withMessage('Package name is required'),
  body('selectedPackage.price').notEmpty().withMessage('Package price is required'),
  body('selectedPackage.description').notEmpty().withMessage('Package description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const inquiry = new PackageInquiry({
      customerName: req.body.customerName,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      eventDate: new Date(req.body.eventDate),
      guestCount: req.body.guestCount ? Number(req.body.guestCount) : undefined,
      packageSlug: req.body.packageSlug,
      packageName: req.body.selectedPackage.name,
      packagePrice: req.body.selectedPackage.price,
      packageDescription: req.body.selectedPackage.description,
      packageFeatures: req.body.selectedPackage.features || [],
      additionalRequirements: req.body.additionalRequirements
    });

    const savedInquiry = await inquiry.save();
    res.status(201).json(savedInquiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/admin/package-inquiries', authenticateAdmin, async (req, res) => {
  try {
    const inquiries = await PackageInquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/admin/package-inquiries/:id', authenticateAdmin, async (req, res) => {
  try {
    const inquiry = await PackageInquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Package inquiry not found' });
    }
    res.json(inquiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new review
app.post('/api/reviews', [
  body('name').notEmpty().withMessage('Name is required'),
  body('event').notEmpty().withMessage('Event type is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('text').notEmpty().withMessage('Review text is required'),
  body('initials').notEmpty().withMessage('Initials are required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, event, rating, text, initials } = req.body;
    const review = new Review({ name, event, rating, text, initials });
    const savedReview = await review.save();
    res.status(201).json(savedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all bookings (protected)
app.get('/api/admin/bookings', authenticateAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET admin dashboard stats
app.get('/api/admin/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find();
    const pendingBookings = bookings.filter(b => b.status === 'pending');
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    const completedBookings = bookings.filter(b => b.status === 'completed');
    
    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const pendingRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    
    const stats = {
      totalBookings: bookings.length,
      pendingBookings: pendingBookings.length,
      confirmedBookings: confirmedBookings.length,
      completedBookings: completedBookings.length,
      totalRevenue,
      pendingRevenue,
      averageBookingValue: completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0,
      recentBookings: bookings.slice(0, 10)
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new booking
app.post('/api/bookings', bookingValidationRules, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const normalizedBooking = normalizeBookingPayload(req.body);
    const inventoryAvailability = await ensureBookingInventoryAvailability(normalizedBooking);

    if (!inventoryAvailability.ok) {
      return res.status(400).json({ message: inventoryAvailability.message });
    }

    const booking = new Booking({
      ...normalizedBooking,
      paymentStatus: 'pending',
      paymentMode: hasRazorpayCredentials() ? 'razorpay' : 'demo'
    });
    const savedBooking = await booking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/payments/create-order', bookingValidationRules, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const normalizedBooking = normalizeBookingPayload(req.body);
    const inventoryAvailability = await ensureBookingInventoryAvailability(normalizedBooking);

    if (!inventoryAvailability.ok) {
      return res.status(400).json({ message: inventoryAvailability.message });
    }

    const paymentMode = hasRazorpayCredentials() ? 'razorpay' : 'demo';

    if (paymentMode === 'demo') {
      const demoBooking = new Booking({
        ...normalizedBooking,
        paymentStatus: 'pending',
        paymentMode: 'demo'
      });
      const savedDemoBooking = await demoBooking.save();

      return res.json({
        paymentMode,
        bookingId: savedDemoBooking._id,
        keyId: process.env.RAZORPAY_KEY_ID || '',
        currency: 'INR',
        advanceAmount: normalizedBooking.advanceAmount,
        remainingAmount: normalizedBooking.remainingAmount,
        totalPrice: normalizedBooking.totalPrice
      });
    }

    const draftBooking = new Booking({
      ...normalizedBooking,
      paymentStatus: 'pending',
      paymentMode: 'razorpay'
    });
    const savedDraftBooking = await draftBooking.save();

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/payment_links/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
        ).toString('base64')}`
      },
      body: JSON.stringify({
        amount: Math.round(normalizedBooking.advanceAmount * 100),
        currency: 'INR',
        accept_partial: false,
        reference_id: `booking_${savedDraftBooking._id}`,
        description: '25% advance booking payment',
        customer: {
          name: normalizedBooking.customerName,
          contact: normalizedBooking.phone
        },
        notify: {
          sms: false,
          email: false
        },
        reminder_enable: false,
        callback_url: `${FRONTEND_BASE_URL}/payment-status?bookingId=${savedDraftBooking._id}`,
        callback_method: 'get',
        notes: {
          customerName: normalizedBooking.customerName,
          phone: normalizedBooking.phone,
          bookingId: String(savedDraftBooking._id)
        }
      })
    });

    const razorpayOrder = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      await Booking.findByIdAndDelete(savedDraftBooking._id);
      return res.status(502).json({
        message: razorpayOrder.error?.description || 'Failed to create Razorpay order'
      });
    }

    savedDraftBooking.paymentOrderId = razorpayOrder.id;
    await savedDraftBooking.save();

    res.json({
      paymentMode,
      bookingId: savedDraftBooking._id,
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      paymentUrl: razorpayOrder.short_url,
      advanceAmount: normalizedBooking.advanceAmount,
      remainingAmount: normalizedBooking.remainingAmount,
      totalPrice: normalizedBooking.totalPrice
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/payments/verify-booking', [
  ...bookingValidationRules,
  body('razorpay_order_id').notEmpty().withMessage('Order ID is required'),
  body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required'),
  body('razorpay_signature').notEmpty().withMessage('Payment signature is required')
], async (req, res) => {
  try {
    if (!hasRazorpayCredentials()) {
      return res.status(400).json({ message: 'Razorpay test keys are not configured on the server.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${req.body.razorpay_order_id}|${req.body.razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== req.body.razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed.' });
    }

    const normalizedBooking = normalizeBookingPayload(req.body);
    const inventoryAvailability = await ensureBookingInventoryAvailability(normalizedBooking);

    if (!inventoryAvailability.ok) {
      return res.status(400).json({ message: inventoryAvailability.message });
    }

    const booking = new Booking({
      ...normalizedBooking,
      paymentStatus: 'paid',
      paymentMode: 'razorpay',
      paymentOrderId: req.body.razorpay_order_id,
      paymentId: req.body.razorpay_payment_id,
      paymentSignature: req.body.razorpay_signature,
      paidAt: new Date()
    });

    const savedBooking = await booking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/payments/demo-booking', bookingValidationRules, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const normalizedBooking = normalizeBookingPayload(req.body);
    const inventoryAvailability = await ensureBookingInventoryAvailability(normalizedBooking);

    if (!inventoryAvailability.ok) {
      return res.status(400).json({ message: inventoryAvailability.message });
    }

    const booking = new Booking({
      ...normalizedBooking,
      paymentStatus: 'demo-paid',
      paymentMode: 'demo',
      paymentOrderId: `demo_order_${Date.now()}`,
      paymentId: `demo_payment_${Date.now()}`,
      paidAt: new Date()
    });

    const savedBooking = await booking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/payments/status/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (
      booking.paymentMode === 'demo' ||
      booking.paymentStatus === 'paid' ||
      booking.paymentStatus === 'demo-paid' ||
      booking.paymentStatus === 'failed'
    ) {
      return res.json(booking);
    }

    if (!hasRazorpayCredentials()) {
      return res.status(400).json({ message: 'Razorpay test keys are not configured on the server.' });
    }

    if (!booking.paymentOrderId) {
      return res.json(booking);
    }

    const paymentLinkResponse = await fetch(`https://api.razorpay.com/v1/payment_links/${booking.paymentOrderId}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(
          `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
        ).toString('base64')}`
      }
    });

    const paymentLink = await paymentLinkResponse.json();

    if (!paymentLinkResponse.ok) {
      return res.status(502).json({
        message: paymentLink.error?.description || 'Failed to fetch payment status'
      });
    }

    if (paymentLink.status === 'paid') {
      booking.paymentStatus = 'paid';
      booking.paymentId = paymentLink.payments?.[0]?.payment_id || booking.paymentId;
      booking.paidAt = booking.paidAt || new Date();
      await booking.save();
    } else if (paymentLink.status === 'cancelled' || paymentLink.status === 'expired') {
      booking.paymentStatus = 'failed';
      await booking.save();
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET booking by ID
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update booking status
app.patch('/api/bookings/:id/status', [
  body('status').isIn(['pending', 'confirmed', 'completed']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Product Management Routes

// GET all products (public)
app.get('/api/products', async (req, res) => {
  try {
    const { category, featured, startDate, endDate } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    const bookedQuantityMap = await calculateAvailabilityForProducts(
      products.map((product) => product._id),
      startDate,
      endDate
    );

    res.json(products.map((product) => (
      serializeProductAvailability(product, bookedQuantityMap[String(product._id)] || 0)
    )));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET product by ID (public)
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { startDate, endDate } = req.query;
    const bookedQuantityMap = await calculateAvailabilityForProducts(
      [product._id],
      startDate,
      endDate
    );

    res.json(serializeProductAvailability(product, bookedQuantityMap[String(product._id)] || 0));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new product (admin only)
app.post('/api/products', authenticateAdmin, [
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('totalQuantity').optional().isInt({ min: 0 }).withMessage('Total quantity must be 0 or more')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = new Product({
      ...req.body,
      updatedAt: new Date()
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update product (admin only)
app.put('/api/products/:id', authenticateAdmin, [
  body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('totalQuantity').optional().isInt({ min: 0 }).withMessage('Total quantity must be 0 or more')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE product (admin only)
app.delete('/api/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all products for admin (with more details)
app.get('/api/admin/products', authenticateAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/admin/inventory', authenticateAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const products = await Product.find().sort({ createdAt: -1 });
    const bookedQuantityMap = await calculateAvailabilityForProducts(
      products.map((product) => product._id),
      startDate,
      endDate
    );

    res.json(products.map((product) => (
      serializeProductAvailability(product, bookedQuantityMap[String(product._id)] || 0)
    )));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/admin/products/:id/inventory', authenticateAdmin, [
  body('totalQuantity').isInt({ min: 0 }).withMessage('Total quantity must be 0 or more'),
  body('inStock').optional().isBoolean().withMessage('In stock must be true or false')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = {
      totalQuantity: Number(req.body.totalQuantity)
    };

    if (req.body.inStock !== undefined) {
      updates.inStock = req.body.inStock;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload images for a product
app.post('/api/products/:id/upload-images', authenticateAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    // Add uploaded images to product
    const newImages = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date()
    }));

    product.images.push(...newImages);
    await product.save();

    res.json({ 
      message: 'Images uploaded successfully',
      images: newImages,
      product: product
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Set thumbnail image for a product
app.patch('/api/products/:id/thumbnail', authenticateAdmin, async (req, res) => {
  try {
    const { thumbnailIndex } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (thumbnailIndex < 0 || thumbnailIndex >= product.images.length) {
      return res.status(400).json({ message: 'Invalid thumbnail index' });
    }

    product.thumbnailIndex = thumbnailIndex;
    await product.save();

    res.json({ 
      message: 'Thumbnail set successfully',
      product: product
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an image from a product
app.delete('/api/products/:id/images/:imageIndex', authenticateAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const imageIndex = parseInt(req.params.imageIndex);
    if (imageIndex < 0 || imageIndex >= product.images.length) {
      return res.status(400).json({ message: 'Invalid image index' });
    }

    // Delete file from filesystem
    const imageToDelete = product.images[imageIndex];
    try {
      fs.unlinkSync(imageToDelete.path);
    } catch (error) {
      console.log('File already deleted or not found:', error.message);
    }

    // Remove image from database
    product.images.splice(imageIndex, 1);

    // Adjust thumbnail index if necessary
    if (product.thumbnailIndex >= product.images.length) {
      product.thumbnailIndex = Math.max(0, product.images.length - 1);
    }

    await product.save();

    res.json({ 
      message: 'Image deleted successfully',
      product: product
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CAROUSEL MANAGEMENT ENDPOINTS

// GET carousel images for admin
app.get('/api/admin/carousel', authenticateAdmin, async (req, res) => {
  try {
    let carousel = await Carousel.findOne();
    if (!carousel) {
      carousel = new Carousel();
      await carousel.save();
    }
    res.json(carousel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET carousel images for public display
app.get('/api/carousel', async (req, res) => {
  try {
    let carousel = await Carousel.findOne();
    if (!carousel) {
      carousel = new Carousel();
      await carousel.save();
    }
    res.json(carousel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST upload wedding hall image
app.post('/api/admin/carousel/wedding-hall', authenticateAdmin, carouselUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    let carousel = await Carousel.findOne();
    if (!carousel) {
      carousel = new Carousel();
    }

    // Delete old wedding hall image if exists
    if (carousel.weddingHallImage && carousel.weddingHallImage.path) {
      if (fs.existsSync(carousel.weddingHallImage.path)) {
        fs.unlinkSync(carousel.weddingHallImage.path);
      }
    }

    carousel.weddingHallImage = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date()
    };

    carousel.updatedAt = new Date();
    await carousel.save();

    res.json({
      message: 'Wedding hall image uploaded successfully',
      carousel: carousel
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST upload luxury sofa image
app.post('/api/admin/carousel/luxury-sofa', authenticateAdmin, carouselUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    let carousel = await Carousel.findOne();
    if (!carousel) {
      carousel = new Carousel();
    }

    // Delete old luxury sofa image if exists
    if (carousel.luxurySofaImage && carousel.luxurySofaImage.path) {
      if (fs.existsSync(carousel.luxurySofaImage.path)) {
        fs.unlinkSync(carousel.luxurySofaImage.path);
      }
    }

    carousel.luxurySofaImage = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date()
    };

    carousel.updatedAt = new Date();
    await carousel.save();

    res.json({
      message: 'Luxury sofa image uploaded successfully',
      carousel: carousel
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST upload banquet tables image
app.post('/api/admin/carousel/banquet-tables', authenticateAdmin, carouselUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    let carousel = await Carousel.findOne();
    if (!carousel) {
      carousel = new Carousel();
    }

    // Delete old banquet tables image if exists
    if (carousel.banquetTablesImage && carousel.banquetTablesImage.path) {
      if (fs.existsSync(carousel.banquetTablesImage.path)) {
        fs.unlinkSync(carousel.banquetTablesImage.path);
      }
    }

    carousel.banquetTablesImage = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date()
    };

    carousel.updatedAt = new Date();
    await carousel.save();

    res.json({
      message: 'Banquet tables image uploaded successfully',
      carousel: carousel
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Serve uploaded product images
app.get('/uploads/products/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(productsUploadsDir, filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: 'Image not found' });
  }
});

// Serve uploaded carousel images
app.get('/uploads/carousel/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(carouselUploadsDir, filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: 'Image not found' });
  }
});

// GALLERY MANAGEMENT ENDPOINTS

// GET all gallery images for admin
app.get('/api/admin/gallery', authenticateAdmin, async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ createdAt: -1 });
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all gallery images for public display
app.get('/api/gallery', async (req, res) => {
  try {
    const gallery = await Gallery.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new gallery item
app.post('/api/admin/gallery', authenticateAdmin, [
  // Add validation later if needed
], async (req, res) => {
  try {
    const { title, category } = req.body;
    
    const newGalleryItem = new Gallery({
      title,
      category,
      image: null // Will be set when image is uploaded
    });

    await newGalleryItem.save();
    res.status(201).json(newGalleryItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST upload image for gallery item
app.post('/api/admin/gallery/:id/upload-image', authenticateAdmin, galleryUpload.single('image'), async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // Delete old image if exists
    if (galleryItem.image && galleryItem.image.path) {
      if (fs.existsSync(galleryItem.image.path)) {
        fs.unlinkSync(galleryItem.image.path);
      }
    }

    galleryItem.image = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date()
    };

    galleryItem.updatedAt = new Date();
    await galleryItem.save();

    res.json({
      message: 'Image uploaded successfully',
      galleryItem: galleryItem
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create gallery item with image (combined endpoint)
app.post('/api/admin/gallery/upload', authenticateAdmin, galleryUpload.single('image'), async (req, res) => {
  try {
    const { title, category } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const newGalleryItem = new Gallery({
      title,
      category,
      image: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadedAt: new Date()
      }
    });

    await newGalleryItem.save();
    res.status(201).json(newGalleryItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE gallery item
app.delete('/api/admin/gallery/:id', authenticateAdmin, async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    // Delete image from filesystem
    if (galleryItem.image && galleryItem.image.path) {
      if (fs.existsSync(galleryItem.image.path)) {
        fs.unlinkSync(galleryItem.image.path);
      }
    }

    await Gallery.findByIdAndDelete(req.params.id);

    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH update gallery item details
app.patch('/api/admin/gallery/:id', authenticateAdmin, async (req, res) => {
  try {
    const { title, category, isActive } = req.body;
    const galleryItem = await Gallery.findById(req.params.id);
    
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    if (title !== undefined) galleryItem.title = title;
    if (category !== undefined) galleryItem.category = category;
    if (isActive !== undefined) galleryItem.isActive = isActive;
    
    galleryItem.updatedAt = new Date();
    await galleryItem.save();

    res.json({
      message: 'Gallery item updated successfully',
      galleryItem: galleryItem
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Serve uploaded gallery images
app.get('/uploads/gallery/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(galleryUploadsDir, filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: 'Image not found' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Create default admin user if doesn't exist
  await createDefaultAdmin();
});
