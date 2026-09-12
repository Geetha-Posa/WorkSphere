require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('No MONGODB_URI found, exiting seed script.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding.');

    const adminEmail = 'admin@test.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists. Exiting.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });

    console.log('Admin user successfully created. Exiting.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
