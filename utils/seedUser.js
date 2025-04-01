import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const hashedPassword = await bcrypt.hash('12345678', 10);

    const user = new User({
      email: 'Stkishan45@gmail.com',
      password: hashedPassword,
      role: 'user', // or 'superAdminUser'
      isDeactivated: false,
      workAssigned: true,
      planExpireDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // valid for 7 days
      isLoggedIn: false
    });

    await user.save();
    console.log('✅ Test user created!');
    process.exit();
  } catch (err) {
    console.error('❌ Error creating user:', err);
    process.exit(1);
  }
};

createUser();
