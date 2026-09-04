import express from 'express';
import { createMessage, getMessages } from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createMessage);
router.get('/', authenticate, getMessages);

export default router;
