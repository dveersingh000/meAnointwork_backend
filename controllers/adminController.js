import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import Payment from '../models/Payment.js';
import WorkAssignment from '../models/WorkAssignment.js';
import Task from '../models/Task.js';
import fs from 'fs';
import path from 'path';

export const getAdminMetrics = async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const activePlans = await User.countDocuments({ planExpireDate: { $gte: new Date() } });
      const pendingPayments = await Payment.countDocuments({ status: 'pending' });
      const totalTasks = await Task.countDocuments();
  
      res.json({
        totalUsers,
        activePlans,
        pendingPayments,
        totalTasks
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('ServerError');
    }
  };
  

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('ServerError');
  }
};

export const adminChangePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
  
    if (!currentPassword || !newPassword) {
      return res.status(400).send("MissingFields");
    }
  
    try {
      const admin = await User.findById(req.user._id);
      if (!admin || admin.role !== 'superAdminUser') {
        return res.status(403).send("NotAuthorized");
      }
  
      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) return res.status(401).send("IncorrectPassword");
  
      const isSame = await bcrypt.compare(newPassword, admin.password);
      if (isSame) return res.status(400).send("NewPasswordSameAsOld");
  
      admin.password = await bcrypt.hash(newPassword, 10);
      await admin.save();
  
      res.send("PasswordUpdated");
    } catch (err) {
      console.error(err);
      res.status(500).send("ServerError");
    }
  };
  

export const createUserByAdmin = async (req, res) => {
    const {
      name, email, password, phone,
      workType, planType, amount,
      pincode, state, city, status
    } = req.body;
  
    try {
      const existing = await User.findOne({ email });
      if (existing) return res.status(409).send("UserAlreadyExists");
  
      const hashed = await bcrypt.hash(password, 10);
  
      const newUser = new User({
        name,
        email,
        password: hashed,
        phone,
        workType,
        planType,
        amount,
        pincode,
        state,
        city,
        status,
        role: 'user',
        isLoggedIn: false,
        workAssigned: false,
        planExpireDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        createdAt: new Date(),
      });
  
      await newUser.save();
      res.status(201).send("UserCreated");
    } catch (err) {
      console.error(err);
      res.status(500).send("ServerError");
    }
  };

  export const getAllPayments = async (req, res) => {
    try {
      const payments = await Payment.find().sort({ date: -1 }).populate('userId', 'email');
      
      const formatted = payments.map(p => ({
        userEmail: p.userId?.email || 'N/A',
        amount: p.amount,
        type: p.type,
        status: p.status,
        date: p.date
      }));
  
      res.json(formatted);
    } catch (err) {
      console.error(err);
      res.status(500).send('ServerError');
    }
  };
  
  export const updatePaymentStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      await Payment.findByIdAndUpdate(id, { status });
      res.send("PaymentUpdated");
    } catch (err) {
      res.status(500).send("ServerError");
    }
  };

  export const assignWorkToggle = async (req, res) => {
    const { userId, workAssigned } = req.body;
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).send('UserNotFound');
      user.workAssigned = workAssigned;
      await user.save();
      res.send('WorkAssignmentUpdated');
    } catch (err) {
      console.error(err);
      res.status(500).send('ServerError');
    }
  };



export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).send('ServerError');
  }
};

export const uploadTask = async (req, res) => {
  const { pageName } = req.body;
  const file = req.file;

  if (!file || !pageName) {
    return res.status(400).send('MissingFields');
  }

  try {
    const newTask = new Task({
      pageName,
      filename: file.filename,
      type: file.mimetype.startsWith('image') ? 'image' : 'text'
    });

    await newTask.save();
    res.status(201).send('TaskUploaded');
  } catch (err) {
    console.error(err);
    res.status(500).send('ServerError');
  }
};

export const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).send('TaskNotFound');

    const filePath = path.resolve(`./uploads/${task.filename}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Task.findByIdAndDelete(id);
    res.send('TaskDeleted');
  } catch (err) {
    console.error(err);
    res.status(500).send('ServerError');
  }
};

  
  