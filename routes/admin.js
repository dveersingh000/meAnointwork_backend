import express from 'express';
import { getAdminMetrics, getAllUsers, createUserByAdmin, getAllPayments,
    updatePaymentStatus,
    assignWorkToggle,
    uploadTask,
    getAllTasks,
    deleteTask,
    adminChangePassword, } from '../controllers/adminController.js';
import  upload  from '../middleware/upload.js';
import { protectAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

router.get('/metrics', protectAdmin, getAdminMetrics);

router.get('/users', protectAdmin, getAllUsers);
router.post('/create-user', protectAdmin, createUserByAdmin);
router.get('/payments', protectAdmin, getAllPayments);
router.put('/payments/:id', protectAdmin, updatePaymentStatus);

router.post('/assign-work', protectAdmin, assignWorkToggle);

router.post('/upload-task', protectAdmin, upload.single('taskImage'), uploadTask);
router.get('/tasks', protectAdmin, getAllTasks);
router.delete('/tasks/:id', protectAdmin, deleteTask);

router.post('/change-password', protectAdmin, adminChangePassword);

export default router;
