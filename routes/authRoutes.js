import express from 'express';
import { registerUser ,loginUser, changePassword , logoutUser } from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/change-password', protect, changePassword);
router.post('/logout', protect, logoutUser);

export default router;
