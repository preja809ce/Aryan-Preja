import express from 'express';
import {
  register,
  login,
  adminLogin,
  requestPasswordReset,
  resetPassword,
  logout,
  getCurrentUser
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/logout', logout);
router.get('/me', authenticate, getCurrentUser);

export default router;
