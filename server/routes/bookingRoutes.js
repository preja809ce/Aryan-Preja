import express from 'express';
import { 
  createBooking, 
  getMyBookings, 
  getOwnerBookings,
  updateBookingStatus,
  cancelBooking 
} from '../controllers/bookingController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createBooking);
router.get('/my', authenticate, getMyBookings);
router.get('/owner/requests', authenticate, getOwnerBookings);
router.patch('/:id/status', authenticate, updateBookingStatus);
router.patch('/:id/cancel', authenticate, cancelBooking);

export default router;
