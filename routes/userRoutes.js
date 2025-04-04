import express from 'express';
import  protect  from '../middleware/authMiddleware.js';
import {
    getUserTasks,
    getTaskDetail,
    saveTask,
    getTask,
    submitAllTasks,
    getPlanExpiry,
    // getUserSubmission
  } from '../controllers/userController.js';

const router = express.Router();

router.get('/me', protect, (req, res) => {
  res.status(200).json(req.user); // req.user comes from protect middleware
});
router.get('/tasks', protect, getUserTasks);
router.get('/tasks/:id', protect, getTaskDetail);
// router.post('/tasks/:id/submit', protect, submitTask);
router.get('/plan-expiry', protect, getPlanExpiry);
// router.get('/submissions/:id', protect, getUserSubmission);
router.post('/tasks/:id/save', protect, saveTask);
router.get('/tasks/:id/saved', protect, getTask); // for fetching task data
router.post('/submit-all', protect, submitAllTasks); // for fetching task data


export default router;
