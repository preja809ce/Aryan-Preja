import Message from '../models/Message.js';

export const createMessage = async (req, res) => {
  try {
    const { receiverId, roomId, message } = req.body;
    if (!receiverId || !message) {
      return res.status(400).json({ message: 'Recipient and message are required' });
    }

    const createdMessage = await Message.create({
      senderId: req.userId,
      receiverId,
      roomId,
      message
    });

    res.status(201).json({ success: true, data: createdMessage });
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
