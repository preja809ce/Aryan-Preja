import Room from '../models/Room.js';
import User from '../models/User.js';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
  'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry'
];

const normalizeText = (value = '') => String(value).trim().replace(/\s+/g, ' ');

const isValidIndianAddress = (value = '') => {
  const normalized = normalizeText(value);
  return normalized.length >= 10 && /[A-Za-z]/.test(normalized) && /^[A-Za-z0-9][A-Za-z0-9\s,./#&'-]*[A-Za-z0-9]$/.test(normalized);
};

const isValidIndianCity = (value = '') => {
  const normalized = normalizeText(value);
  return normalized.length >= 2 && /^[A-Za-z][A-Za-z\s.'-]*$/.test(normalized);
};

const validateIndianLocation = ({ state, city, address, pincode }) => {
  if (!state) return 'State is required for listing in India.';
  if (!INDIAN_STATES.some((item) => item.toLowerCase() === normalizeText(state).toLowerCase())) {
    return 'Only Indian states and union territories are allowed.';
  }
  if (!city || !isValidIndianCity(city)) {
    return 'City must be a valid Indian city name.';
  }
  if (!address || !isValidIndianAddress(address)) {
    return 'Address must be a valid Indian address using letters and common address characters.';
  }
  if (pincode && !/^[1-9][0-9]{5}$/.test(String(pincode).trim())) {
    return 'Pincode must be a valid 6-digit Indian postal code.';
  }
  return '';
};

const isValidCurrentYearFutureDate = (value) => {
  if (!value) return true;

  const selectedDate = value instanceof Date ? new Date(value) : new Date(`${value}T00:00:00`);
  if (Number.isNaN(selectedDate.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return selectedDate >= today && selectedDate.getFullYear() === today.getFullYear();
};

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

    if (!title || !description || !propertyType || !roomType || rent == null || !city || !state) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const locationError = validateIndianLocation({ state, city, address, pincode });
    if (locationError) {
      return res.status(400).json({ message: locationError });
    }

    if (availableFrom && !isValidCurrentYearFutureDate(availableFrom)) {
      return res.status(400).json({
        message: 'Available From date must be today or a future date in the current year.'
      });
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

    if (updates.state || updates.city || updates.address || Object.hasOwn(updates, 'pincode')) {
      const locationError = validateIndianLocation({
        state: updates.state ?? room.state,
        city: updates.city ?? room.city,
        address: updates.address ?? room.address,
        pincode: updates.pincode ?? room.pincode
      });
      if (locationError) {
        return res.status(400).json({ message: locationError });
      }
    }

    if (updates.availableFrom && !isValidCurrentYearFutureDate(updates.availableFrom)) {
      return res.status(400).json({
        message: 'Available From date must be today or a future date in the current year.'
      });
    }

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
