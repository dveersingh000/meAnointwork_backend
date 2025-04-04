import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  pageName: { type: String, required: true },
  filename: { type: String, required: true },
  type: { type: String, enum: ['image', 'text'], default: 'image' },
  ocrText: {
    type: String,
    default: '',
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Task', taskSchema);
