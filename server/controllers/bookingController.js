import Booking from '../models/Booking.js';
import Room from '../models/Room.js';

export const createBooking = async (req, res) => {
  try {
    const { roomId, moveInDate, duration, occupants, message } = req.body;
    
    if (!roomId || !moveInDate || !duration || !occupants) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    const booking = new Booking({
      roomId,
      userId: req.userId,
      ownerId: room.ownerId,
      moveInDate,
      duration,
      occupants,
      message
    });
    
    await booking.save();
    
    res.status(201).json({
      success: true,
      message: 'Booking request sent successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId })
      .populate('roomId')
      .populate('ownerId', 'name phone profileImage');
    
    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ ownerId: req.userId })
      .populate('roomId')
      .populate('userId', 'name email phone');
    
    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }
    
    booking.status = status;
    if (status === 'Rejected' && rejectionReason) {
      booking.rejectionReason = rejectionReason;
    }
    
    await booking.save();
    
    res.status(200).json({
      success: true,
      message: `Booking ${status.toLowerCase()} successfully`,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }
    
    booking.status = 'Cancelled';
    await booking.save();
    
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
