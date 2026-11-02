import express from 'express';
import { 
  createBooking, 
  getMyBookings, 
  getOwnerBookings,
  updateBookingStatus,
  cancelBooking,
  getPayment,
  createPaymentOrder,
  verifyPayment
} from '../controllers/bookingController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createBooking);
router.get('/my', authenticate, getMyBookings);
router.get('/owner/requests', authenticate, authorize('owner', 'admin'), getOwnerBookings);
router.patch('/:id/status', authenticate, authorize('owner', 'admin'), updateBookingStatus);
router.patch('/:id/cancel', authenticate, cancelBooking);
router.get('/:id/payment', authenticate, getPayment);
router.post('/:id/payment/order', authenticate, createPaymentOrder);
router.post('/:id/payment/verify', authenticate, verifyPayment);

export default router;
