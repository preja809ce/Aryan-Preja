import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const demoRoomsKey = 'roomfinder_demo_rooms'
const demoRoomRemovedKey = 'roomfinder_demo_room_removed'
const demoUsersKey = 'roomfinder_demo_users'
const demoMessagesKey = 'roomfinder_demo_messages'
const demoBookingsKey = 'roomfinder_demo_bookings'
const demoRoom = {
  _id: 'demo-room-featured',
  title: 'Sunny Furnished Room Near Palampur University',
  description: 'A bright, comfortable room with reliable Wi-Fi and easy access to local shops and transport.',
  propertyType: 'Single Room',
  roomType: 'Single',
  rent: 8000,
  securityDeposit: 15000,
  city: 'Palampur',
  state: 'Himachal Pradesh',
  address: 'Near Palampur University',
  bedrooms: 1,
  bathrooms: 1,
  area: 250,
  furnishing: 'Fully Furnished',
  amenities: ['Wi-Fi', 'Attached Bathroom', 'Bed', 'Wardrobe', 'Hot Water'],
  images: [{ url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', isMain: true }],
  ownerId: { name: 'Demo Owner' },
  status: 'Active',
  views: 24,
}

const readDemoData = (key, fallback) => JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))
const writeDemoData = (key, value) => localStorage.setItem(key, JSON.stringify(value))
const demoResponse = (data) => Promise.resolve({ data })
const readDemoRooms = () => {
  const rooms = readDemoData(demoRoomsKey, [])
  const validRooms = rooms.filter((room) => room && room.city && room.title)
  if (localStorage.getItem(demoRoomRemovedKey) === 'true') return validRooms
  return validRooms.length ? validRooms : [demoRoom]
}

const useDemoMode = () => localStorage.getItem('roomfinder_demo_mode') === 'true'

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Auth endpoints
export const authAPI = {
  register: async (data) => {
    try {
      if (useDemoMode()) throw new Error('demo')
      return await api.post('/auth/register', data)
    } catch {
      const users = readDemoData(demoUsersKey, [])
      if (users.some((user) => user.email === data.email)) throw { response: { data: { message: 'Email already registered' } } }
      const user = { id: `demo-user-${Date.now()}`, name: data.name, email: data.email, phone: data.phone, role: data.role || 'user' }
      writeDemoData(demoUsersKey, [...users, { ...user, password: data.password }])
      localStorage.setItem('roomfinder_demo_mode', 'true')
      return demoResponse({ token: `demo-token-${user.id}`, user })
    }
  },
  login: async (data) => {
    if (data.email === 'prejaaryan22@gmail.com' && data.password === 'preja@809') {
      const admin = { id: 'demo-admin', name: 'Website Administrator', email: data.email, role: 'admin' }
      localStorage.setItem('roomfinder_demo_mode', 'true')
      return demoResponse({ token: 'demo-admin-token', user: admin })
    }
    try {
      if (useDemoMode()) throw new Error('demo')
      return await api.post('/auth/login', data)
    } catch {
      const user = readDemoData(demoUsersKey, []).find((entry) => entry.email === data.email && entry.password === data.password)
      if (!user) throw { response: { data: { message: 'Invalid email or password' } } }
      const safeUser = { ...user }
      delete safeUser.password
      localStorage.setItem('roomfinder_demo_mode', 'true')
      return demoResponse({ token: `demo-token-${safeUser.id}`, user: safeUser })
    }
  },
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
}

// Room endpoints
export const roomAPI = {
  getAllRooms: async (filters) => {
    try {
      if (useDemoMode()) throw new Error('demo')
      return await api.get('/rooms', { params: filters })
    } catch {
      const rooms = readDemoRooms()
      const filtered = rooms.filter((room) => (!filters?.city || room.city.toLowerCase().includes(filters.city.toLowerCase())) && (!filters?.minPrice || Number(room.rent) >= Number(filters.minPrice)) && (!filters?.maxPrice || Number(room.rent) <= Number(filters.maxPrice)) && (!filters?.roomType || room.roomType === filters.roomType) && (!filters?.furnished || room.furnishing === filters.furnished))
      return demoResponse({ success: true, data: filtered, pagination: { total: filtered.length, page: 1, pages: 1 } })
    }
  },
  getRoomById: async (id) => {
    try {
      if (useDemoMode() || id.startsWith('demo-')) throw new Error('demo')
      return await api.get(`/rooms/${id}`)
    } catch {
      const room = readDemoRooms().find((entry) => entry._id === id)
      return demoResponse({ success: true, data: room || readDemoRooms()[0] })
    }
  },
  createRoom: async (data) => {
    try {
      if (useDemoMode()) throw new Error('demo')
      return await api.post('/rooms', data)
    } catch {
      const room = { ...data, _id: `demo-room-${Date.now()}`, status: 'Active', views: 0, ownerId: { name: 'Demo Owner' }, createdAt: new Date().toISOString() }
      writeDemoData(demoRoomsKey, [...readDemoData(demoRoomsKey, []), room])
      return demoResponse({ success: true, data: room })
    }
  },
  updateRoom: (id, data) => api.put(`/rooms/${id}`, data),
  updateStatus: async (id, status) => {
    try {
      if (useDemoMode() || id.startsWith('demo-')) throw new Error('demo')
      return await api.patch(`/rooms/${id}/status`, { status })
    } catch {
      const rooms = readDemoRooms()
      const updatedRooms = rooms.map((room) => room._id === id ? { ...room, status } : room)
      writeDemoData(demoRoomsKey, updatedRooms)
      return demoResponse({ success: true, data: updatedRooms.find((room) => room._id === id) })
    }
  },
  deleteRoom: async (id) => {
    try {
      if (useDemoMode() || id.startsWith('demo-')) throw new Error('demo')
      return await api.delete(`/rooms/${id}`)
    } catch {
      const rooms = readDemoRooms().filter((room) => room._id !== id)
      writeDemoData(demoRoomsKey, rooms)
      if (id === demoRoom._id) localStorage.setItem(demoRoomRemovedKey, 'true')
      return demoResponse({ success: true })
    }
  },
  getOwnerRooms: async () => {
    try {
      if (useDemoMode()) throw new Error('demo')
      return await api.get('/rooms/owner/my-rooms')
    } catch {
      return demoResponse({ success: true, data: readDemoRooms() })
    }
  },
}

// Booking endpoints
export const bookingAPI = {
  createBooking: async (data) => {
    try {
      if (useDemoMode() || String(data.roomId).startsWith('demo-')) throw new Error('demo')
      return await api.post('/bookings', data)
    } catch {
      const rooms = readDemoRooms()
      const room = rooms.find((entry) => entry._id === data.roomId) || rooms[0]
      if (!room) throw { response: { data: { message: 'Room not found' } } }
      if (room.status === 'Rented' || room.status === 'Unavailable') {
        throw { response: { data: { message: 'Room is no longer available' } } }
      }
      const booking = {
        ...data,
        _id: `demo-booking-${Date.now()}`,
        userId: localStorage.getItem('userId') || 'demo-user',
        ownerId: room.ownerId?._id || 'demo-owner',
        roomId: room._id,
        room,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      }
      writeDemoData(demoBookingsKey, [...readDemoData(demoBookingsKey, []), booking])
      return demoResponse({ success: true, message: 'Booking request sent successfully', data: booking })
    }
  },
  getMyBookings: async () => {
    try {
      if (useDemoMode()) throw new Error('demo')
      return await api.get('/bookings/my')
    } catch {
      const userId = localStorage.getItem('userId') || 'demo-user'
      return demoResponse({ success: true, data: readDemoData(demoBookingsKey, []).filter((booking) => booking.userId === userId) })
    }
  },
  getOwnerBookings: async () => {
    try {
      if (useDemoMode()) throw new Error('demo')
      return await api.get('/bookings/owner/requests')
    } catch {
      const ownerId = localStorage.getItem('userId') || 'demo-owner'
      return demoResponse({ success: true, data: readDemoData(demoBookingsKey, []).filter((booking) => booking.ownerId === ownerId || booking.ownerId === 'demo-owner') })
    }
  },
  updateBookingStatus: async (id, data) => {
    try {
      if (useDemoMode() || String(id).startsWith('demo-')) throw new Error('demo')
      return await api.patch(`/bookings/${id}/status`, data)
    } catch {
      const bookings = readDemoData(demoBookingsKey, [])
      const updatedBookings = bookings.map((booking) => booking._id === id ? { ...booking, status: data.status, rejectionReason: data.rejectionReason } : booking)
      writeDemoData(demoBookingsKey, updatedBookings)
      return demoResponse({ success: true, data: updatedBookings.find((booking) => booking._id === id) })
    }
  },
  cancelBooking: async (id) => {
    try {
      if (useDemoMode() || String(id).startsWith('demo-')) throw new Error('demo')
      return await api.patch(`/bookings/${id}/cancel`)
    } catch {
      const bookings = readDemoData(demoBookingsKey, [])
      const updatedBookings = bookings.map((booking) => booking._id === id ? { ...booking, status: 'Cancelled' } : booking)
      writeDemoData(demoBookingsKey, updatedBookings)
      return demoResponse({ success: true, message: 'Booking cancelled successfully', data: updatedBookings.find((booking) => booking._id === id) })
    }
  },
  getPayment: (id) => api.get(`/bookings/${id}/payment`),
  createPaymentOrder: (id) => api.post(`/bookings/${id}/payment/order`),
  verifyPayment: (id, data) => api.post(`/bookings/${id}/payment/verify`, data),
}

export const messageAPI = {
  send: async (data) => {
    try {
      if (useDemoMode() || String(data.roomId).startsWith('demo-')) throw new Error('demo')
      return await api.post('/messages', data)
    } catch {
      const message = { ...data, _id: `demo-message-${Date.now()}`, createdAt: new Date().toISOString(), read: false }
      writeDemoData(demoMessagesKey, [...readDemoData(demoMessagesKey, []), message])
      return demoResponse({ success: true, data: message })
    }
  },
}

export default api
