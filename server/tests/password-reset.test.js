import test from 'node:test';
import assert from 'node:assert/strict';
import User from '../models/User.js';
import { requestPasswordReset, resetPassword } from '../controllers/authController.js';

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

test('password reset issues an expiring token and updates the password once', async () => {
  const originalFindOne = User.findOne;
  const originalEnvironment = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    FRONTEND_URL: process.env.FRONTEND_URL,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS
  };
  const user = {
    email: 'owner@example.com',
    passwordResetTokenHash: undefined,
    passwordResetExpiresAt: undefined,
    password: 'old-password',
    save: async () => {}
  };

  delete process.env.NODE_ENV;
  delete process.env.VERCEL;
  delete process.env.FRONTEND_URL;
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;

  try {
    User.findOne = async (filter) => {
      if (filter.passwordResetTokenHash) {
        const isUnexpired = filter.passwordResetExpiresAt.$gt < user.passwordResetExpiresAt;
        return isUnexpired && filter.passwordResetTokenHash === user.passwordResetTokenHash ? user : null;
      }
      return new RegExp(filter.email.$regex, filter.email.$options).test(user.email) ? user : null;
    };

    const unknownEmailResponse = createResponse();
    await requestPasswordReset({ body: { email: 'unknown@example.com' } }, unknownEmailResponse);
    assert.equal(unknownEmailResponse.statusCode, 200);
    assert.match(unknownEmailResponse.body.message, /If an account exists/);
    assert.equal(unknownEmailResponse.body.resetUrl, undefined);

    const requestResponse = createResponse();
    await requestPasswordReset({ body: { email: ' OWNER@example.com ' } }, requestResponse);
    assert.equal(requestResponse.statusCode, 200, JSON.stringify(requestResponse.body));
    assert.match(requestResponse.body.message, /If an account exists/);
    assert.ok(requestResponse.body.resetUrl);
    assert.ok(user.passwordResetExpiresAt > new Date());

    const resetUrl = new URL(requestResponse.body.resetUrl);
    const token = resetUrl.searchParams.get('token');
    assert.ok(token);
    assert.notEqual(user.passwordResetTokenHash, token);

    const invalidResponse = createResponse();
    await resetPassword({
      body: { email: user.email, token: 'wrong-token', password: 'new-password' }
    }, invalidResponse);
    assert.equal(invalidResponse.statusCode, 400);
    assert.equal(user.password, 'old-password');

    const resetResponse = createResponse();
    await resetPassword({
      body: { email: user.email, token, password: 'new-password' }
    }, resetResponse);
    assert.equal(resetResponse.statusCode, 200);
    assert.equal(user.password, 'new-password');
    assert.equal(user.passwordResetTokenHash, undefined);
    assert.equal(user.passwordResetExpiresAt, undefined);

    const reusedTokenResponse = createResponse();
    await resetPassword({
      body: { email: user.email, token, password: 'another-password' }
    }, reusedTokenResponse);
    assert.equal(reusedTokenResponse.statusCode, 400);
  } finally {
    User.findOne = originalFindOne;
    Object.entries(originalEnvironment).forEach(([key, value]) => {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    });
  }
});

test('password reset rejects passwords shorter than eight characters', async () => {
  const originalFindOne = User.findOne;
  let queried = false;
  User.findOne = async () => {
    queried = true;
    return null;
  };

  try {
    const response = createResponse();
    await resetPassword({
      body: { email: 'owner@example.com', token: 'valid-token', password: 'short' }
    }, response);

    assert.equal(response.statusCode, 400);
    assert.equal(queried, false);
  } finally {
    User.findOne = originalFindOne;
  }
});
