import express from 'express';
import { createMessage, getMessages, getOwnerMessages } from '../controllers/messageController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createMessage);
router.get('/owner', authenticate, authorize('owner', 'admin'), getOwnerMessages);
router.get('/', authenticate, getMessages);

export default router;
