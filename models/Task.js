import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  pageName: { type: String, required: true },
  filename: { type: String, required: true },
  type: { type: String, enum: ['image', 'text'], default: 'image' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Task', taskSchema);
