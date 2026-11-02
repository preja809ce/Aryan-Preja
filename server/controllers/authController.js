import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const normalizeEmail = (email) => typeof email === 'string' ? email.trim().toLowerCase() : '';
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const findUserByEmail = (email) => User.findOne({
  email: { $regex: `^${escapeRegex(email)}$`, $options: 'i' }
});

const createAuthResponse = (user, res, statusCode, message) => {
  const token = generateToken(user._id, user.role);
  return res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const normalizedEmail = normalizeEmail(email);
    
    // Validation
    if (!name || !normalizedEmail || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password,
      role: role === 'owner' ? 'owner' : 'user'
    });
    
    await user.save();
    
    createAuthResponse(user, res, 201, 'User registered successfully');
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    res.status(500).json({ message: error.message });
  }
};

const loginWithRole = async (req, res, requiredRole) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    
    if (!normalizedEmail || typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const user = await findUserByEmail(normalizedEmail).select('+password');
    if (!user) {
      const message = requiredRole === 'admin'
        ? 'No administrator account with this email exists'
        : 'No account is registered with this email';
      return res.status(404).json({ message });
    }

    if (requiredRole && user.role !== requiredRole) {
      return res.status(403).json({ message: 'This account is not authorized to sign in here' });
    }
    if (!requiredRole && user.role === 'admin') {
      return res.status(403).json({ message: 'Administrator accounts must use administrator sign-in' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    return createAuthResponse(user, res, 200, 'Login successful');
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = (req, res) => loginWithRole(req, res);
export const adminLogin = (req, res) => loginWithRole(req, res, 'admin');

export const logout = (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
