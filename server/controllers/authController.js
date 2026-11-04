import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { isEmailConfigured, sendPasswordResetEmail } from '../utils/email.js';

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
const NAME_PATTERN = /^[A-Za-z][A-Za-z\s.'-]*$/;

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
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = typeof phone === 'string' ? phone.trim() : '';
    
    // Validation
    if (!normalizedName || !normalizedEmail || !normalizedPhone || typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (normalizedName.length < 3) {
      return res.status(400).json({ message: 'Name must be at least 3 characters long' });
    }
    if (!NAME_PATTERN.test(normalizedName)) {
      return res.status(400).json({ message: 'Name can contain only letters, spaces, periods, apostrophes, and hyphens' });
    }
    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
      return res.status(400).json({ message: 'Enter a valid 10-digit Indian mobile number' });
    }
    
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    
    const user = new User({
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
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

export const requestPasswordReset = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return res.status(400).json({ message: 'A valid email is required' });
    }

    const isLocalDevelopment = process.env.NODE_ENV === 'development' ||
      (!process.env.NODE_ENV && !process.env.VERCEL);
    const frontendUrl = process.env.FRONTEND_URL ||
      (isLocalDevelopment ? 'http://localhost:5173' : '');
    if ((!isEmailConfigured() || !frontendUrl) && !isLocalDevelopment) {
      return res.status(503).json({ message: 'Password reset email and frontend URL must be configured. Contact the site administrator.' });
    }

    const user = await findUserByEmail(email);
    const response = {
      success: true,
      message: 'If an account exists for this email, password reset instructions have been sent.'
    };

    if (!user) {
      return res.status(200).json(response);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
    await user.save();

    const resetUrl = new URL('/forgot-password', frontendUrl);
    resetUrl.searchParams.set('token', resetToken);
    resetUrl.searchParams.set('email', user.email);

    if (isEmailConfigured()) {
      await sendPasswordResetEmail(user.email, resetUrl.toString());
    } else {
      response.resetUrl = resetUrl.toString();
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: `Could not send password reset instructions: ${error.message}` });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { token, password } = req.body;

    if (!email || typeof token !== 'string' || !token || typeof password !== 'string') {
      return res.status(400).json({ message: 'Email, reset token, and new password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      email,
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset link is invalid or has expired. Request a new one.' });
    }

    user.password = password;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password changed successfully. You can now sign in.' });
  } catch (error) {
    return res.status(500).json({ message: `Could not reset password: ${error.message}` });
  }
};

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
