# Quick Start Guide - RoomFinder

## 📌 Installation & Running the Project

### Option 1: Using NPM Scripts (Recommended)

1. **Install all dependencies:**
```bash
npm run install-all
```

2. **Start both server and client in development mode:**
```bash
npm run dev
```

This will start:
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

### Option 2: Manual Setup

#### Backend Setup:
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and other config
npm run dev
```

#### Frontend Setup (in new terminal):
```bash
cd client
npm install
npm run dev
```

## 🗄️ Database Setup

### MongoDB Local Installation

1. Install MongoDB Community Edition
2. Start MongoDB service:
   - **Windows:** `mongod`
   - **Mac:** `brew services start mongodb-community`
   - **Linux:** `sudo systemctl start mongod`

### MongoDB Cloud (Atlas)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Add to `.env`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/room-rental-system
```

## 🔑 API Testing

### 1. Register a New User
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123",
  "role": "user"
}
```

### 2. Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. Create Room (Owner only)
```bash
POST http://localhost:5000/api/rooms
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Beautiful Single Room",
  "description": "A beautiful room with great amenities",
  "propertyType": "Single Room",
  "roomType": "Single",
  "rent": 8000,
  "securityDeposit": 15000,
  "city": "Palampur",
  "bedrooms": 1,
  "bathrooms": 1,
  "furnishing": "Fully Furnished",
  "amenities": ["Wi-Fi", "Parking", "AC"],
  "address": "123 Main Street"
}
```

## 🧪 Testing Users

### Test Tenant Account
- Email: `tenant@test.com`
- Password: `password123`
- Role: `user`

### Test Owner Account
- Email: `owner@test.com`
- Password: `password123`
- Role: `owner`

## 🛠️ Project Commands

### Frontend Commands
```bash
cd client
npm run dev         # Start dev server
npm run build       # Build for production
npm run preview     # Preview production build
```

### Backend Commands
```bash
cd server
npm run dev         # Start dev server
npm start           # Start production server
```

## 📦 Build for Production

### Frontend
```bash
cd client
npm run build
# Output: dist/ folder
```

### Backend
No build needed, runs with Node.js directly

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check MONGO_URI in .env
- Try with MongoDB Atlas if local installation fails

### Port Already in Use
```bash
# Change PORT in server/.env
PORT=5001
```

### Dependencies Not Installing
```bash
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors
- Check FRONTEND_URL in server/.env
- Ensure it matches your frontend URL

## 📚 File Structure Quick Reference

```
├── server/
│   ├── models/          - Database schemas
│   ├── controllers/     - Business logic
│   ├── routes/          - API endpoints
│   ├── middleware/      - Auth, error handling
│   └── server.js        - Entry point
│
├── client/
│   ├── src/
│   │   ├── components/  - React components
│   │   ├── pages/       - Page components
│   │   ├── services/    - API calls
│   │   └── App.jsx      - Main app component
│   └── index.html       - HTML entry point
```

## 🎯 Next Steps

1. ✅ Start the project
2. 📝 Register a new account
3. 🔍 Browse rooms (empty initially)
4. ➕ Create your first room listing (as owner)
5. 📝 Create a booking request
6. 💬 Check booking requests

## 📞 Support

For issues or questions:
1. Check server console for errors
2. Check browser console (F12) for errors
3. Review API response in Network tab
4. Check .env configuration

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy dist/ folder to Vercel
```

### Backend (Heroku/Render)
```bash
cd server
npm start
```

Set environment variables in hosting platform:
- MONGO_URI
- JWT_SECRET
- FRONTEND_URL

---

**Happy coding! 🎉**
