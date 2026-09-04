# RoomFinder - Room Rental System

A professional, full-stack web application for room rental management and booking. Users can search for rooms, room owners can list their properties, and an admin panel manages the platform.

## 🎯 Features

### For Tenants
- ✅ Browse and search rooms with advanced filters
- ✅ View detailed room information with photos and amenities
- ✅ Send booking requests
- ✅ Track booking status
- ✅ View booking details and remove requests
- ✅ Contact room owners

### For Room Owners
- ✅ Register and create account
- ✅ Add room listings with multiple photos and videos
- ✅ Set prices, amenities, and availability
- ✅ Manage booking requests
- ✅ View analytics and room statistics
- ✅ Accept or reject booking requests
- ✅ Mark rooms booked or available
- ✅ Remove room listings

### For Website Owner / Admin
- ✅ Admin login and protected dashboard
- ✅ View users, listings, and booking totals
- ✅ Approve or reject booking requests
- ✅ Mark rooms booked or available
- ✅ Remove listings

### General
- ✅ User authentication with JWT
- ✅ Role-based access control
- ✅ Responsive design (Mobile, Tablet, Desktop)
- ✅ Modern UI with Tailwind CSS
- ✅ RESTful API

## 🛠️ Technology Stack

### Frontend
- React 18
- Vite (Build tool)
- Tailwind CSS (Styling)
- React Router (Navigation)
- Axios (HTTP Client)
- React Icons (Icon library)
- React Hot Toast (Notifications)

### Backend
- Node.js
- Express.js (Web framework)
- MongoDB (Database)
- Mongoose (ODM)
- JWT (Authentication)
- bcryptjs (Password hashing)
- Helmet (Security)
- CORS

### Infrastructure
- Git/GitHub
- Environment variables (.env)

## 📁 Project Structure

```
room-rental-system/
├── client/                    # Frontend React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # Navbar, Footer, etc.
│   │   │   ├── pages/        # Page components
│   │   │   ├── layouts/      # Layout components
│   │   │   └── auth/         # Auth components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API calls
│   │   ├── context/          # Context API
│   │   ├── hooks/            # Custom hooks
│   │   ├── utils/            # Utilities
│   │   ├── assets/           # Images, icons
│   │   ├── App.jsx           # Main app
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── index.html            # HTML template
│   ├── vite.config.js        # Vite config
│   ├── tailwind.config.js    # Tailwind config
│   ├── package.json
│   └── .env.example
│
├── server/                    # Backend Node app
│   ├── models/               # MongoDB models
│   │   ├── User.js
│   │   ├── Room.js
│   │   ├── Booking.js
│   │   ├── Review.js
│   │   ├── Favorite.js
│   │   ├── Message.js
│   │   └── Notification.js
│   ├── controllers/          # Business logic
│   │   ├── authController.js
│   │   ├── roomController.js
│   │   ├── bookingController.js
│   │   └── messageController.js
│   ├── routes/               # API routes
│   │   ├── authRoutes.js
│   │   ├── roomRoutes.js
│   │   ├── bookingRoutes.js
│   │   └── messageRoutes.js
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js           # Authentication
│   │   └── errorHandler.js   # Error handling
│   ├── config/               # Configuration
│   ├── utils/                # Utility functions
│   ├── services/             # Business services
│   ├── server.js             # Main server file
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/room-rental-system
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:5173
```

5. Start the server:
```bash
npm run dev
```

On Windows PowerShell, use `npm.cmd run dev` if PowerShell blocks `npm.ps1`.

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

### Demo Mode

The frontend automatically uses browser storage when the API or MongoDB is unavailable. This keeps account creation, room search, room details, media previews, bookings, messages, and dashboard actions usable for local testing. Clear site storage to reset demo data.

### Website Owner Login

Open `http://localhost:5173/admin/login`:

```text
Email: admin@roomfinder.local
Password: admin12345
```

These credentials are for local demo testing only. Use secure server-side admin authentication before deployment.

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Rooms
- `GET /api/rooms` - Get all rooms (with filters)
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms` - Create new room (Owner)
- `PUT /api/rooms/:id` - Update room (Owner)
- `DELETE /api/rooms/:id` - Delete room (Owner)
- `GET /api/rooms/owner/my-rooms` - Get owner's rooms
- `PATCH /api/rooms/:id/status` - Mark room active, rented, or unavailable

### Bookings
- `POST /api/bookings` - Create booking request
- `GET /api/bookings/my` - Get user's bookings
- `GET /api/bookings/owner/requests` - Get owner's booking requests
- `PATCH /api/bookings/:id/status` - Update booking status
- `PATCH /api/bookings/:id/cancel` - Cancel booking

### Messages
- `POST /api/messages` - Send a message to an owner
- `GET /api/messages` - Get the current user's messages

### Frontend Routes
- `/` - Home
- `/browse` - Search rooms
- `/room/:id` - Room details, contact, and booking
- `/login` and `/register` - Tenant/room-owner authentication
- `/dashboard` - Tenant bookings
- `/owner/dashboard` - Room-owner listings and booking requests
- `/owner/add-room` - Room listing form with photo/video previews
- `/admin/login` - Website owner login
- `/admin/dashboard` - Website owner controls
- `/forgot-password`, `/privacy`, `/terms` - Public support/legal pages

## 🔐 Authentication

The app uses JWT (JSON Web Tokens) for authentication:

1. User registers/logs in
2. Server returns JWT token
3. Token stored in localStorage
4. Token sent in Authorization header for protected routes
5. Token verified on backend

## 🎨 UI/UX Features

- Clean, modern design
- Responsive layout (Mobile-first)
- Intuitive navigation
- Professional color scheme
- Smooth animations and transitions
- Toast notifications for user feedback
- Loading states
- Error handling

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- CORS protection
- Helmet.js for HTTP headers
- Input validation
- MongoDB injection protection
- Environment variables for secrets

## 🚧 Future Enhancements

- [ ] Advanced search with map integration
- [ ] Payment integration
- [ ] Email notifications
- [ ] Reviews and ratings
- [ ] Real-time notifications
- [ ] Image optimization
- [ ] Video streaming
- [ ] Wishlist feature
- [ ] Advanced analytics

The current photo and video controls create browser previews and store demo listings locally. Cloudinary variables are documented for the future production upload flow; media is not uploaded to Cloudinary yet.

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/room-rental-system
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 💬 Support

For support, email: support@roomfinder.com

## 👨‍💻 Authors

-Aryan Preja-

---

**Happy Coding! 🚀**
>>>>>>> 6e86575 (Initial RoomFinder website)
