import test from 'node:test';
import assert from 'node:assert/strict';
import User from '../models/User.js';
import { register } from '../controllers/authController.js';

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

const validRegistration = {
  name: 'A User',
  email: 'user@example.com',
  phone: '9876543210',
  password: 'password123'
};

test('registration rejects names shorter than three trimmed characters', async () => {
  const originalFindOne = User.findOne;
  let queried = false;
  User.findOne = async () => {
    queried = true;
    return null;
  };

  try {
    const response = createResponse();
    await register({ body: { ...validRegistration, name: ' A ' } }, response);

    assert.equal(response.statusCode, 400);
    assert.match(response.body.message, /at least 3 characters/);
    assert.equal(queried, false);
  } finally {
    User.findOne = originalFindOne;
  }
});

test('registration rejects mobile numbers that are not valid 10-digit Indian numbers', async () => {
  const originalFindOne = User.findOne;
  let queried = false;
  User.findOne = async () => {
    queried = true;
    return null;
  };

  try {
    for (const phone of ['1234567890', '987654321', '09876543210', '+919876543210']) {
      const response = createResponse();
      await register({ body: { ...validRegistration, phone } }, response);

      assert.equal(response.statusCode, 400, `Expected ${phone} to be rejected`);
      assert.match(response.body.message, /10-digit Indian mobile number/);
    }
    assert.equal(queried, false);
  } finally {
    User.findOne = originalFindOne;
  }
});

test('registration accepts a valid Indian mobile number and trims the name', async () => {
  const originalFindOne = User.findOne;
  const originalSave = User.prototype.save;
  let savedUser;
  User.findOne = async () => null;
  User.prototype.save = async function() {
    savedUser = this;
    return this;
  };

  try {
    const response = createResponse();
    await register({ body: { ...validRegistration, name: '  A User  ' } }, response);

    assert.equal(response.statusCode, 201);
    assert.equal(savedUser.name, 'A User');
    assert.equal(savedUser.phone, '9876543210');
  } finally {
    User.findOne = originalFindOne;
    User.prototype.save = originalSave;
  }
});
