import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
  const {
    name, email, password, phone,
    workType, planType, amount,
    pincode, state, city, status
  } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).send("UserAlreadyExists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      workType,
      planType,
      amount,
      pincode,
      state,
      city,
      status,
      isLoggedIn: false,
      role: 'user',
      workAssigned: false,
      planExpireDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      createdAt: new Date(),
    });

    await newUser.save();
    res.status(201).send("RegistrationSuccess");
  } catch (err) {
    console.error(err);
    res.status(500).send("ServerError");
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).send('LoginDetailsNotMatch');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send('LoginDetailsNotMatch');

    if (user.isDeactivated || new Date(user.planExpireDate) < new Date()) {
      return res.status(403).send('PlanExpire');
    }

    if (user.isLoggedIn) {
      return res.status(409).send('AlreadyLoginExist');
    }

    if (!user.workAssigned) {
      return res.status(400).send('workNotAssign');
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });


    user.isLoggedIn = true;
    await user.save();

    return res.json({ 
      token, 
      email: user.email,
      status: user.role === 'superAdminUser' ? 'superAdminUser' : 'ValidUserPlan'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('ServerError');
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).send('MissingFields');
  }

  try {
    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).send('IncorrectCurrentPassword');

    const sameAsOld = await bcrypt.compare(newPassword, user.password);
    if (sameAsOld) return res.status(400).send('NewPasswordSameAsOld');

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.send('PasswordUpdated');
  } catch (err) {
    console.error(err);
    res.status(500).send('ServerError');
  }
};



export const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send('UserNotFound');

    user.isLoggedIn = false;
    await user.save();

    return res.send('LogoutSuccess');
  } catch (err) {
    console.error(err);
    res.status(500).send('ServerError');
  }
};
