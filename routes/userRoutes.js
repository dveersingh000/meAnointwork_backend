import express from 'express';
import  protect  from '../middleware/authMiddleware.js';
import {
    getUserTasks,
    getTaskDetail,
    submitTask
  } from '../controllers/userController.js';

const router = express.Router();

router.get('/me', protect, (req, res) => {
  res.status(200).json(req.user); // req.user comes from protect middleware
});
router.get('/tasks', protect, getUserTasks);
router.get('/tasks/:id', protect, getTaskDetail);
router.post('/tasks/:id/submit', protect, submitTask);

export default router;
