import Message from '../models/Message.js';
import Room from '../models/Room.js';

export const createMessage = async (req, res) => {
  try {
    const { roomId, name, email, phone, message, moveInDate } = req.body;
    if (
      !roomId ||
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof phone !== 'string' ||
      typeof message !== 'string' ||
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !message.trim()
    ) {
      return res.status(400).json({ message: 'Room, contact details, and message are required' });
    }
    if (moveInDate && Number.isNaN(Date.parse(moveInDate))) {
      return res.status(400).json({ message: 'Move-in date is invalid' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const createdMessage = await Message.create({
      senderId: req.userId,
      receiverId: room.ownerId,
      roomId,
      senderName: name.trim(),
      senderEmail: email.trim(),
      senderPhone: phone.trim(),
      moveInDate: moveInDate || undefined,
      message: message.trim()
    });

    res.status(201).json({ success: true, data: createdMessage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOwnerMessages = async (req, res) => {
  try {
    const messages = await Message.find({ receiverId: req.userId })
      .populate('senderId', 'name email phone')
      .populate('roomId', 'title city')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ senderId: req.userId }, { receiverId: req.userId }]
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
