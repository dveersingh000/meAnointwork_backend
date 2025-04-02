import mongoose from 'mongoose';

const submittedTaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  inputText: String,
  accuracy: Number,
  plagiarism: Object,
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model('SubmittedTask', submittedTaskSchema);
