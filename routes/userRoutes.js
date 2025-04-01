import express from 'express';
import  protect  from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, (req, res) => {
  res.status(200).json(req.user); // req.user comes from protect middleware
});

export default router;
