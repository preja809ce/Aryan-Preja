import test from 'node:test';
import assert from 'node:assert/strict';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import { createRoom, updateRoom, deleteRoom } from '../controllers/roomController.js';
import { getMyBookings, getOwnerBookings, updateBookingStatus } from '../controllers/bookingController.js';

const createResponse = () => ({
  statusCode: null,
  body: null,
  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  }
});

test('room creation always assigns the authenticated owner', async () => {
  const originalSave = Room.prototype.save;
  Room.prototype.save = async function() { return this; };

  try {
    const response = createResponse();
    await createRoom({
      userId: '64b000000000000000000001',
      body: {
        title: 'Room A',
        description: 'Owner A room',
        propertyType: 'Single Room',
        roomType: 'Single',
        rent: 8000,
        city: 'Palampur',
        ownerId: '64b000000000000000000002',
        status: 'Active'
      }
    }, response);

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.data.ownerId.toString(), '64b000000000000000000001');
    assert.equal(response.body.data.status, 'Active');
  } finally {
    Room.prototype.save = originalSave;
  }
});

test('room updates scope by owner and ignore ownership/status fields', async () => {
  const originalFindById = Room.findById;
  const originalFindOneAndUpdate = Room.findOneAndUpdate;
  let updateFilter;
  let updateFields;
  Room.findById = async () => ({ ownerId: { toString: () => 'owner-A' } });
  Room.findOneAndUpdate = async (filter, updates) => {
    updateFilter = filter;
    updateFields = updates;
    return { _id: 'room-A', title: updates.title };
  };

  try {
    const response = createResponse();
    await updateRoom({
      params: { id: 'room-A' },
      userId: 'owner-A',
      userRole: 'owner',
      body: { title: 'Updated room', ownerId: 'owner-B', status: 'Rejected' }
    }, response);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(updateFilter, { _id: 'room-A', ownerId: 'owner-A' });
    assert.deepEqual(updateFields, { title: 'Updated room' });
  } finally {
    Room.findById = originalFindById;
    Room.findOneAndUpdate = originalFindOneAndUpdate;
  }
});

test('room deletion refuses a room owned by another owner', async () => {
  const originalFindById = Room.findById;
  const originalFindOneAndDelete = Room.findOneAndDelete;
  let deleted = false;
  Room.findById = async () => ({ ownerId: { toString: () => 'owner-B' } });
  Room.findOneAndDelete = async () => {
    deleted = true;
    return null;
  };

  try {
    const response = createResponse();
    await deleteRoom({
      params: { id: 'room-B' },
      userId: 'owner-A',
      userRole: 'owner'
    }, response);

    assert.equal(response.statusCode, 403);
    assert.equal(deleted, false);
  } finally {
    Room.findById = originalFindById;
    Room.findOneAndDelete = originalFindOneAndDelete;
  }
});

test('owner booking list is selected through rooms actually owned by the owner', async () => {
  const originalRoomFind = Room.find;
  const originalBookingFind = Booking.find;
  const expectedBookings = [{ _id: 'booking-A', roomId: 'room-A', ownerId: 'owner-B' }];
  let bookingFilter;
  Room.find = (filter) => {
    assert.deepEqual(filter, { ownerId: 'owner-A' });
    return { select: async () => [{ _id: 'room-A' }] };
  };
  Booking.find = (filter) => {
    bookingFilter = filter;
    const query = Promise.resolve(expectedBookings);
    query.populate = () => query;
    return query;
  };

  try {
    const response = createResponse();
    await getOwnerBookings({ userId: 'owner-A', userRole: 'owner' }, response);

    assert.deepEqual(bookingFilter, { roomId: { $in: ['room-A'] } });
    assert.deepEqual(response.body.data, expectedBookings);
  } finally {
    Room.find = originalRoomFind;
    Booking.find = originalBookingFind;
  }
});

test('tenant receives owner phone only after booking is accepted', async () => {
  const originalBookingFind = Booking.find;
  const bookings = [
    {
      status: 'Pending',
      roomId: { ownerId: { name: 'Owner A', phone: '1111111111' } },
      toObject() {
        return { status: this.status, roomId: structuredClone(this.roomId) };
      }
    },
    {
      status: 'Payment Required',
      roomId: { ownerId: { name: 'Owner B', phone: '2222222222' } },
      toObject() {
        return { status: this.status, roomId: structuredClone(this.roomId) };
      }
    }
  ];
  Booking.find = () => ({
    populate() { return this; },
    then(resolve, reject) { return Promise.resolve(bookings).then(resolve, reject); }
  });

  try {
    const response = createResponse();
    await getMyBookings({ userId: 'tenant-A' }, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data[0].roomId.ownerId.phone, undefined);
    assert.equal(response.body.data[1].roomId.ownerId.phone, '2222222222');
  } finally {
    Booking.find = originalBookingFind;
  }
});

test('booking status change rejects an owner who does not own the linked room', async () => {
  const originalBookingFindById = Booking.findById;
  const originalRoomFindById = Room.findById;
  let saved = false;
  Booking.findById = async () => ({
    roomId: 'room-B',
    ownerId: 'owner-A',
    status: 'Pending',
    save: async () => { saved = true; }
  });
  Room.findById = async () => ({ ownerId: { toString: () => 'owner-B' } });

  try {
    const response = createResponse();
    await updateBookingStatus({
      params: { id: 'booking-B' },
      userId: 'owner-A',
      userRole: 'owner',
      body: { status: 'Accepted' }
    }, response);

    assert.equal(response.statusCode, 403);
    assert.equal(saved, false);
  } finally {
    Booking.findById = originalBookingFindById;
    Room.findById = originalRoomFindById;
  }
});
