import express from 'express';
import { 
  getAllRooms, 
  getRoomById, 
  createRoom, 
  updateRoom, 
  deleteRoom,
  getOwnerRooms,
  updateRoomStatus
} from '../controllers/roomController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllRooms);
router.get('/owner/my-rooms', authenticate, authorize('owner', 'admin'), getOwnerRooms);
router.get('/:id', getRoomById);
router.post('/', authenticate, authorize('owner', 'admin'), createRoom);
router.put('/:id', authenticate, authorize('owner', 'admin'), updateRoom);
router.patch('/:id/status', authenticate, authorize('owner', 'admin'), updateRoomStatus);
router.delete('/:id', authenticate, authorize('owner', 'admin'), deleteRoom);

export default router;
