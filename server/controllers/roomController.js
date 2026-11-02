import Room from '../models/Room.js';
import User from '../models/User.js';

export const getAllRooms = async (req, res) => {
  try {
    const { city, minPrice, maxPrice, roomType, furnished, page = 1, limit = 10 } = req.query;
    
    const filter = { status: 'Active' };
    
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.rent = {};
      if (minPrice) filter.rent.$gte = parseInt(minPrice);
      if (maxPrice) filter.rent.$lte = parseInt(maxPrice);
    }
    if (roomType) filter.roomType = roomType;
    if (furnished) filter.furnishing = furnished;
    
    const skip = (page - 1) * limit;
    const rooms = await Room.find(filter)
      .populate('ownerId', 'name profileImage')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await Room.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: rooms,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('ownerId', 'name phone profileImage');
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createRoom = async (req, res) => {
  try {
    const {
      title,
      description,
      propertyType,
      roomType,
      rent,
      city,
      securityDeposit,
      maintenanceCharges,
      electricityCharges,
      waterCharges,
      otherCharges,
      area,
      floor,
      bedrooms,
      bathrooms,
      furnishing,
      amenities,
      images,
      video,
      address,
      state,
      pincode,
      nearbyLandmark,
      latitude,
      longitude,
      availableFrom,
      minimumStay,
      maximumStay,
      rules
    } = req.body;

    if (!title || !description || !propertyType || !roomType || rent == null || !city) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }
    
    const room = new Room({
      ownerId: req.userId,
      title,
      description,
      propertyType,
      roomType,
      rent,
      city,
      securityDeposit,
      maintenanceCharges,
      electricityCharges,
      waterCharges,
      otherCharges,
      area,
      floor,
      bedrooms,
      bathrooms,
      furnishing,
      amenities,
      images,
      video,
      address,
      state,
      pincode,
      nearbyLandmark,
      latitude,
      longitude,
      availableFrom,
      minimumStay,
      maximumStay,
      rules
    });
    
    await room.save();
    
    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const ownerFilter = req.userRole === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, ownerId: req.userId };
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    if (req.userRole !== 'admin' && room.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this room' });
    }

    const editableFields = [
      'title', 'description', 'propertyType', 'roomType', 'rent', 'city',
      'securityDeposit', 'maintenanceCharges', 'electricityCharges', 'waterCharges',
      'otherCharges', 'area', 'floor', 'bedrooms', 'bathrooms', 'furnishing',
      'amenities', 'images', 'video', 'address', 'state', 'pincode',
      'nearbyLandmark', 'latitude', 'longitude', 'availableFrom', 'minimumStay',
      'maximumStay', 'rules'
    ];
    const updates = Object.fromEntries(
      editableFields.filter((field) => Object.hasOwn(req.body, field)).map((field) => [field, req.body[field]])
    );
    const updatedRoom = await Room.findOneAndUpdate(
      ownerFilter,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedRoom) {
      return res.status(403).json({ message: 'Not authorized to update this room' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: updatedRoom
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    if (req.userRole !== 'admin' && room.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this room' });
    }
    
    const ownerFilter = req.userRole === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, ownerId: req.userId };
    const deletedRoom = await Room.findOneAndDelete(ownerFilter);
    if (!deletedRoom) {
      return res.status(403).json({ message: 'Not authorized to delete this room' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRoomStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Active', 'Rented', 'Unavailable'].includes(status)) {
      return res.status(400).json({ message: 'Invalid room status' });
    }

    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.ownerId.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this room' });
    }

    room.status = status;
    await room.save();
    res.status(200).json({ success: true, message: 'Room status updated', data: room });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOwnerRooms = async (req, res) => {
  try {
    const filter = req.userRole === 'admin' ? {} : { ownerId: req.userId };
    const rooms = await Room.find(filter);
    
    res.status(200).json({
      success: true,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
