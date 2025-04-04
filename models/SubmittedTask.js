import mongoose from 'mongoose';

const submittedTaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  inputText: String,
  accuracy: Number,
  plagiarism: Object,
  isFinalSubmit: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['draft', 'submitted'],
    default: 'draft',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('SubmittedTask', submittedTaskSchema);
