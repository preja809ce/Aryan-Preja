# 🧪 API Testing Guide - RoomFinder

## Prerequisites
- Backend running on `http://localhost:5000`
- Postman, Insomnia, or cURL installed
- MongoDB running

## 📋 Test Endpoints

### 1️⃣ User Registration

**Endpoint:** `POST /api/auth/register`

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "password123",
    "role": "user"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Save the token** for subsequent requests!

---

### 2️⃣ User Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

### 3️⃣ Get Current User

**Endpoint:** `GET /api/auth/me`

**Request:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "user",
    "createdAt": "2026-09-04T10:00:00Z"
  }
}
```

---

### 4️⃣ Create Room (Owner Only)

**Endpoint:** `POST /api/rooms`

**Request:**
```bash
curl -X POST http://localhost:5000/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_OWNER_TOKEN" \
  -d '{
    "title": "Beautiful Single Room Near University",
    "description": "A spacious, well-furnished single room with all modern amenities, located near the university campus.",
    "propertyType": "Single Room",
    "roomType": "Single",
    "rent": 8000,
    "securityDeposit": 15000,
    "maintenanceCharges": 500,
    "electricityCharges": 0,
    "area": 250,
    "floor": "2",
    "bedrooms": 1,
    "bathrooms": 1,
    "furnishing": "Fully Furnished",
    "amenities": ["Wi-Fi", "Parking", "Attached Bathroom", "AC", "Balcony"],
    "address": "123 Main Street, Near University",
    "city": "Palampur",
    "state": "Himachal Pradesh",
    "pincode": "176061",
    "availableFrom": "2026-10-01",
    "minimumStay": 6
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Room created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Beautiful Single Room Near University",
    "rent": 8000,
    "city": "Palampur",
    "status": "Pending Approval",
    "views": 0,
    "createdAt": "2026-09-04T10:00:00Z"
  }
}
```

---

### 5️⃣ Get All Rooms

**Endpoint:** `GET /api/rooms`

**Request:**
```bash
# Get all rooms
curl -X GET http://localhost:5000/api/rooms

# With filters
curl -X GET "http://localhost:5000/api/rooms?city=Palampur&minPrice=5000&maxPrice=10000&roomType=Single"

# With pagination
curl -X GET "http://localhost:5000/api/rooms?page=1&limit=10"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Beautiful Single Room Near University",
      "rent": 8000,
      "city": "Palampur",
      "furnishing": "Fully Furnished",
      "bedrooms": 1,
      "views": 5,
      "status": "Active",
      "ownerId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Owner Name",
        "profileImage": null
      }
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "pages": 1
  }
}
```

---

### 6️⃣ Get Room Details

**Endpoint:** `GET /api/rooms/:id`

**Request:**
```bash
curl -X GET http://localhost:5000/api/rooms/507f1f77bcf86cd799439012
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Beautiful Single Room Near University",
    "description": "A spacious, well-furnished...",
    "rent": 8000,
    "city": "Palampur",
    "amenities": ["Wi-Fi", "Parking", "AC"],
    "views": 6,
    "ownerId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Owner Name",
      "phone": "9876543210"
    }
  }
}
```

---

### 7️⃣ Create Booking Request

**Endpoint:** `POST /api/bookings`

**Request:**
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TENANT_TOKEN" \
  -d '{
    "roomId": "507f1f77bcf86cd799439012",
    "moveInDate": "2026-10-15",
    "duration": 12,
    "occupants": 1,
    "message": "I am a student at the university and looking for a room. I am very interested in your property."
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Booking request sent successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "roomId": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439014",
    "moveInDate": "2026-10-15",
    "duration": 12,
    "status": "Pending",
    "createdAt": "2026-09-04T10:00:00Z"
  }
}
```

---

### 8️⃣ Get My Bookings (Tenant)

**Endpoint:** `GET /api/bookings/my`

**Request:**
```bash
curl -X GET http://localhost:5000/api/bookings/my \
  -H "Authorization: Bearer YOUR_TENANT_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "roomId": {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Beautiful Single Room Near University"
      },
      "ownerId": {
        "name": "Owner Name",
        "phone": "9876543210"
      },
      "moveInDate": "2026-10-15",
      "duration": 12,
      "status": "Pending"
    }
  ]
}
```

---

### 9️⃣ Get Booking Requests (Owner)

**Endpoint:** `GET /api/bookings/owner/requests`

**Request:**
```bash
curl -X GET http://localhost:5000/api/bookings/owner/requests \
  -H "Authorization: Bearer YOUR_OWNER_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "roomId": {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Beautiful Single Room Near University"
      },
      "userId": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "9876543210"
      },
      "moveInDate": "2026-10-15",
      "duration": 12,
      "status": "Pending"
    }
  ]
}
```

---

### 🔟 Update Booking Status (Owner)

**Endpoint:** `PATCH /api/bookings/:id/status`

**Accept Booking:**
```bash
curl -X PATCH http://localhost:5000/api/bookings/507f1f77bcf86cd799439013/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_OWNER_TOKEN" \
  -d '{
    "status": "Accepted"
  }'
```

**Reject Booking:**
```bash
curl -X PATCH http://localhost:5000/api/bookings/507f1f77bcf86cd799439013/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_OWNER_TOKEN" \
  -d '{
    "status": "Rejected",
    "rejectionReason": "Room already rented"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Booking accepted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "status": "Accepted"
  }
}
```

---

### 1️⃣1️⃣ Cancel Booking (Tenant)

**Endpoint:** `PATCH /api/bookings/:id/cancel`

**Request:**
```bash
curl -X PATCH http://localhost:5000/api/bookings/507f1f77bcf86cd799439013/cancel \
  -H "Authorization: Bearer YOUR_TENANT_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "status": "Cancelled"
  }
}
```

---

## ❌ Error Responses

### 400 - Bad Request
```json
{
  "message": "All required fields must be provided"
}
```

### 401 - Unauthorized
```json
{
  "message": "No token provided"
}
```

### 403 - Forbidden
```json
{
  "message": "Access forbidden"
}
```

### 404 - Not Found
```json
{
  "message": "Room not found"
}
```

### 500 - Server Error
```json
{
  "message": "Internal Server Error"
}
```

---

## 🧪 Test Scenarios

### Scenario 1: Complete Booking Flow
1. Register as Tenant → Get token A
2. Register as Owner → Get token B
3. Create room using token B
4. Get room details using token A
5. Create booking using token A
6. Get booking requests using token B
7. Accept booking using token B
8. Verify booking status using token A

### Scenario 2: Filter Rooms
1. Create multiple rooms in different cities
2. Test filters individually
3. Test combined filters
4. Verify pagination

### Scenario 3: Error Handling
1. Try to create room as tenant (should fail)
2. Try to accept booking as tenant (should fail)
3. Try to use invalid token (should fail)
4. Try to access non-existent room (should fail)

---

## 🛠️ Tools for Testing

### Option 1: Postman
- Import endpoints
- Create collection
- Set up environment variables
- Save responses for reference

### Option 2: Insomnia
- Similar to Postman
- Lightweight alternative
- Good for quick testing

### Option 3: cURL (Command Line)
- No GUI needed
- Script-friendly
- Direct HTTP requests

### Option 4: Axios in Node
```javascript
const axios = require('axios');

const testApi = async () => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/auth/login',
      { email: 'john@example.com', password: 'password123' }
    );
    console.log(response.data);
  } catch (error) {
    console.error(error.response.data);
  }
};

testApi();
```

---

## 📊 Test Data Creation Script

Create `test-data.js`:
```javascript
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function createTestData() {
  try {
    // Register tenant
    const tenantRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Test Tenant',
      email: 'tenant@test.com',
      phone: '9876543210',
      password: 'password123',
      role: 'user'
    });
    const tenantToken = tenantRes.data.token;
    console.log('✓ Tenant created');

    // Register owner
    const ownerRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Test Owner',
      email: 'owner@test.com',
      phone: '9876543211',
      password: 'password123',
      role: 'owner'
    });
    const ownerToken = ownerRes.data.token;
    console.log('✓ Owner created');

    // Create room
    const roomRes = await axios.post(
      `${API_URL}/rooms`,
      {
        title: 'Test Room',
        description: 'A test room',
        propertyType: 'Single Room',
        roomType: 'Single',
        rent: 8000,
        city: 'Palampur'
      },
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    );
    const roomId = roomRes.data.data._id;
    console.log('✓ Room created');

    // Create booking
    const bookingRes = await axios.post(
      `${API_URL}/bookings`,
      {
        roomId,
        moveInDate: '2026-10-15',
        duration: 12,
        occupants: 1,
        message: 'Test booking'
      },
      { headers: { Authorization: `Bearer ${tenantToken}` } }
    );
    console.log('✓ Booking created');

    console.log('\n✅ Test data created successfully!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

createTestData();
```

Run with:
```bash
node test-data.js
```

---

## 📝 Success Checklist

- [ ] Backend server starts on port 5000
- [ ] Register endpoint works
- [ ] Login endpoint returns valid token
- [ ] Create room endpoint works (owner only)
- [ ] Get rooms endpoint works
- [ ] Room filtering works
- [ ] Create booking endpoint works
- [ ] Get bookings endpoint works
- [ ] Update booking status works
- [ ] Authentication middleware works
- [ ] Error handling works
- [ ] CORS is enabled

---

## 🎓 Common Issues & Solutions

**Issue:** 401 Unauthorized
- **Solution:** Token missing or expired. Login again.

**Issue:** 403 Forbidden
- **Solution:** User role doesn't have permission. Use correct role.

**Issue:** 404 Not Found
- **Solution:** Resource doesn't exist. Check ID or create it first.

**Issue:** 500 Server Error
- **Solution:** Check server logs. Verify database connection.

---

**Happy Testing! 🚀**
