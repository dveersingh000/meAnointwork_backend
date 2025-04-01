import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  role: { type: String, enum: ['superAdminUser', 'user'], default: 'user' },
  isDeactivated: { type: Boolean, default: false },
  status: { type: String, default: 'active' },
  phone: String,
  workType: String,
  planType: String,
  amount: String,
  pincode: String,
  state: String,
  city: String,
  planExpireDate: { type: Date },
  workAssigned: { type: Boolean, default: false },
  isLoggedIn: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);
