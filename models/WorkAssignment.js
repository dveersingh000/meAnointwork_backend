import mongoose from 'mongoose';

const workAssignmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  assignedAt: { type: Date, default: Date.now },
});

export default mongoose.model('WorkAssignment', workAssignmentSchema);
