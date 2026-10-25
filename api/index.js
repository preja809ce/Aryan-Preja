import app from '../server/app.js';
import { connectDatabase } from '../server/database.js';

export default async function handler(req, res) {
  const requestUrl = new URL(req.url, 'https://vercel.local');
  const route = requestUrl.searchParams.get('route');

  if (route) {
    requestUrl.searchParams.delete('route');
    req.url = `${route}${requestUrl.search}`;
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET must be configured for the deployed application.');
    }

    await connectDatabase();
    return app(req, res);
  } catch (error) {
    console.error('API request failed:', error.message);
    return res.status(503).json({
      success: false,
      message: 'The API is unavailable. Check the database and server configuration.'
    });
  }
}
