import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDatabase, mongoose } from '../database.js';
import User from '../models/User.js';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(scriptDir, '..', '.env') });

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim();
const phone = process.env.ADMIN_PHONE?.trim();

if (!email || !password || !name || !phone) {
  console.error('Set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, and ADMIN_PHONE before running this command.');
  process.exitCode = 1;
} else {
  try {
    await connectDatabase();
    const existingUser = await User.findOne({ email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } });

    if (existingUser) {
      console.error('An account with this email already exists. No database changes were made.');
      process.exitCode = 1;
    } else {
      const admin = new User({ name, email, phone, password, role: 'admin' });
      await admin.save();
      console.log('Admin account created successfully.');
    }
  } catch (error) {
    console.error(`Admin account creation failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
