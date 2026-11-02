import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const clearStoredSession = () => ['token', 'userId', 'userRole', 'roomfinder_demo_mode']
  .forEach((key) => localStorage.removeItem(key))

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
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
}

// Room endpoints
export const roomAPI = {
  getAllRooms: (filters) => api.get('/rooms', { params: filters }),
  getRoomById: (id) => api.get(`/rooms/${id}`),
  createRoom: (data) => api.post('/rooms', data),
  updateRoom: (id, data) => api.put(`/rooms/${id}`, data),
  updateStatus: (id, status) => api.patch(`/rooms/${id}/status`, { status }),
  deleteRoom: (id) => api.delete(`/rooms/${id}`),
  getOwnerRooms: () => api.get('/rooms/owner/my-rooms'),
}

// Booking endpoints
export const bookingAPI = {
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  getOwnerBookings: () => api.get('/bookings/owner/requests'),
  updateBookingStatus: (id, data) => api.patch(`/bookings/${id}/status`, data),
  cancelBooking: (id) => api.patch(`/bookings/${id}/cancel`),
  getPayment: (id) => api.get(`/bookings/${id}/payment`),
  createPaymentOrder: (id) => api.post(`/bookings/${id}/payment/order`),
  verifyPayment: (id, data) => api.post(`/bookings/${id}/payment/verify`, data),
}

export const messageAPI = {
  send: (data) => api.post('/messages', data),
  getOwnerMessages: () => api.get('/messages/owner'),
}

export default api
