# Development Guide - RoomFinder

## 🎓 Understanding the Project

This is a full-stack MERN (MongoDB, Express, React, Node.js) application with modern architecture.

## 📐 Architecture

### Frontend (React + Vite)
- **Single Page Application (SPA)**
- **Routing:** React Router v6
- **State Management:** useState, Context API (ready for Redux)
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Build Tool:** Vite (faster than Create React App)

### Backend (Node.js + Express)
- **REST API** with proper routing
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT tokens
- **Middleware:** Custom auth, error handling
- **Security:** bcryptjs, Helmet, CORS

## 🔄 Data Flow

### User Registration/Login Flow
```
Frontend Form → Axios POST → Express Route → Auth Controller 
→ Validate User → Hash Password (bcryptjs) → Save to MongoDB 
→ Generate JWT Token → Send Response → localStorage.setItem(token)
```

### Room Listing Flow
```
Owner Form → API Call → Express Route → Room Controller 
→ Validate Data → Save to MongoDB → Send Response 
→ Frontend Updates State → Re-render UI
```

### Booking Flow
```
Booking Form → POST /api/bookings → Booking Controller 
→ Create Booking Record → Save to MongoDB 
→ Notify Owner (future: email) → Send Response
```

## 📂 Important Files

### Backend

**server.js** - Main server entry point
```
- Express app setup
- Database connection
- Middleware configuration
- Route registration
- Error handling
```

**Models/** - Database schemas
```
- User.js - User schema with password hashing
- Room.js - Room schema with amenities
- Booking.js - Booking request schema
- Review.js - User reviews
- etc.
```

**Controllers/** - Business logic
```
- authController.js - Register, login, get user
- roomController.js - CRUD operations on rooms
- bookingController.js - Booking management
```

**Routes/** - API endpoints
```
- authRoutes.js - /api/auth/*
- roomRoutes.js - /api/rooms/*
- bookingRoutes.js - /api/bookings/*
```

**Middleware/** - Request processing
```
- auth.js - JWT verification and role checking
- errorHandler.js - Centralized error handling
```

### Frontend

**App.jsx** - Main app component with routing
```
- BrowserRouter setup
- Route definitions
- Layout wrapper
```

**services/api.js** - API communication
```
- Axios instance
- Request/response interceptors
- API endpoint functions
```

**components/** - Reusable components
```
- common/ - Navbar, Footer (used across pages)
- pages/ - Major page components
- layouts/ - Layout wrappers
- auth/ - Auth components
```

**pages/** - Page components
```
- Home.jsx - Landing page
- Browse.jsx - Room search/filter
- RoomDetails.jsx - Single room view
- UserDashboard.jsx - User profile/bookings
- OwnerDashboard.jsx - Owner listings/requests
- auth/* - Login/Register
```

**services/api.js** - Backend communication

## 🔐 Authentication Flow

1. **Registration:**
   - User fills form
   - Frontend validates
   - POST to /api/auth/register
   - Backend validates email uniqueness
   - Password hashed with bcryptjs
   - User saved to MongoDB
   - JWT token generated and returned
   - Token stored in localStorage

2. **Login:**
   - User enters credentials
   - POST to /api/auth/login
   - Backend validates email
   - Password compared with hash
   - JWT token generated
   - Token returned and stored

3. **Protected Routes:**
   - Token sent in Authorization header
   - Middleware verifies token
   - If valid: Continue to controller
   - If invalid: Return 401 Unauthorized

## 🎨 Component Hierarchy

```
App
├── Navbar
│   ├── Logo
│   ├── Navigation Links
│   └── Auth Buttons
├── Main Routes
│   ├── Home (/)
│   ├── Browse (/browse)
│   ├── RoomDetails (/room/:id)
│   ├── Login (/login)
│   ├── Register (/register)
│   ├── UserDashboard (/dashboard)
│   ├── OwnerDashboard (/owner/dashboard)
│   ├── AddRoom (/owner/add-room)
│   └── NotFound (*) 
├── Footer
└── Toast Notifications (global)
```

## 📊 Database Schema

### User
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  role: "user" | "owner" | "admin",
  profileImage: { url, publicId },
  city: String,
  createdAt: Date
}
```

### Room
```javascript
{
  _id: ObjectId,
  ownerId: ObjectId (ref: User),
  title: String,
  description: String,
  rent: Number,
  city: String,
  amenities: [String],
  images: [{ url, publicId }],
  status: "Active" | "Pending Approval" | "Rented" | "Unavailable",
  views: Number,
  createdAt: Date
}
```

### Booking
```javascript
{
  _id: ObjectId,
  roomId: ObjectId (ref: Room),
  userId: ObjectId (ref: User),
  ownerId: ObjectId (ref: User),
  moveInDate: Date,
  duration: Number,
  status: "Pending" | "Accepted" | "Rejected",
  createdAt: Date
}
```

## 🔧 Adding New Features

### Example: Add Review Feature

1. **Backend:**
   - Create `Review.js` model (already created)
   - Create `reviewController.js` with CRUD operations
   - Create `reviewRoutes.js` with endpoints
   - Add routes to `server.js`

2. **Frontend:**
   - Create `ReviewForm.jsx` component
   - Add review section to `RoomDetails.jsx`
   - Call API in useEffect
   - Handle form submission

3. **Database:**
   - Schema already defined in Review.js
   - MongoDB creates collection automatically

### Example: Add Favorites Feature

1. **Backend:**
   - Model already created (`Favorite.js`)
   - Create `favoriteController.js`
   - Create `favoriteRoutes.js`

2. **Frontend:**
   - Add heart icon to room cards
   - Toggle favorite on click
   - Call API to save/remove

## 🚀 Performance Optimization

### Frontend
```javascript
// Lazy load components
const Home = lazy(() => import('./pages/Home'))

// Use useMemo for expensive calculations
const filteredRooms = useMemo(() => {
  return rooms.filter(room => room.rent >= minPrice)
}, [rooms, minPrice])

// Implement pagination
// Use proper key prop in lists
// Image optimization (lazy loading)
```

### Backend
```javascript
// Database indexing (already in schemas)
// Pagination on GET endpoints
// Request validation and sanitization
// Caching (future implementation)
// Rate limiting
```

## 📝 Code Standards

### Naming Conventions
- **Components:** PascalCase (Home.jsx, Navbar.jsx)
- **Functions:** camelCase (fetchRooms, handleSubmit)
- **Constants:** UPPER_SNAKE_CASE (API_URL)
- **Files:** kebab-case for utils, PascalCase for components

### Directory Organization
```
By feature/page, not by type:
pages/
├── Home.jsx
├── Browse.jsx
└── admin/
    ├── Dashboard.jsx
    └── Users.jsx

Not:
pages/
components/
utils/
```

### Comments
```javascript
// Use for: Why are we doing this?
// Not: What are we doing? (code should be self-explanatory)

// ✓ Good
const users = await User.find({ role: 'owner' }) // Get only room owners
                                                   // for the leaderboard

// ✗ Bad
const users = await User.find({ role: 'owner' }) // Find users with role owner
```

## 🧪 Testing Workflow

### Manual Testing Checklist

- [ ] Can register as user
- [ ] Can register as owner
- [ ] Can login with correct credentials
- [ ] Login fails with wrong credentials
- [ ] Can create room listing (owner only)
- [ ] Can view room details
- [ ] Can filter rooms
- [ ] Can send booking request
- [ ] Can view booking status
- [ ] Can logout

## 🐛 Common Issues & Solutions

### "Cannot find module"
- Run `npm install` in both directories
- Check import paths

### "MongoDB connection failed"
- Ensure MongoDB is running and listening on port 27017, or use a reachable Atlas URI.
- Check `MONGO_URI` in `server/.env`; the backend loads this file regardless of the working directory.
- On Windows, start the installed MongoDB service from Services or run `Start-Service MongoDB` in an elevated PowerShell.

### "CORS error"
- Check FRONTEND_URL in server .env
- Verify proxy in vite.config.js

### "Token not found"
- Clear localStorage
- Login again
- Check localStorage in DevTools

## 📦 Dependencies Overview

### Backend
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - Authentication
- **bcryptjs** - Password hashing
- **multer** - File upload (ready)
- **cors** - Cross-Origin Resource Sharing
- **helmet** - Security headers
- **dotenv** - Environment variables

### Frontend
- **react** - UI library
- **react-router-dom** - Navigation
- **axios** - HTTP client
- **tailwindcss** - Styling
- **react-hot-toast** - Notifications
- **react-icons** - Icons

## 🔄 Development Workflow

1. **Start both servers:**
   ```bash
   npm run dev
   ```

2. **Make changes:**
   - Frontend: Changes auto-reload with Vite
   - Backend: Use nodemon for auto-restart

3. **Test in browser:**
   - http://localhost:5173

4. **Debug:**
   - Frontend: Chrome DevTools (F12)
   - Backend: Console output / Chrome DevTools Node.js remote debugging

5. **Git workflow:**
   ```bash
   git add .
   git commit -m "Feature: Add X"
   git push
   ```

## 📚 Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Axios Documentation](https://axios-http.com)
- [JWT.io](https://jwt.io)

---

**Happy Developing! 💻**
