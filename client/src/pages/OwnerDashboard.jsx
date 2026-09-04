import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiPlus, FiHome, FiClipboard, FiEye, FiTrash2, FiExternalLink, FiEdit3 } from 'react-icons/fi'
import { roomAPI, bookingAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function OwnerDashboard() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])
  const [bookings, setBookings] = useState([])
  const [stats, setStats] = useState({
    totalRooms: 0,
    activeRooms: 0,
    pendingRequests: 0,
    totalViews: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [roomsResponse, bookingsResponse] = await Promise.all([
        roomAPI.getOwnerRooms(),
        bookingAPI.getOwnerBookings()
      ])

      const roomsData = roomsResponse.data.data
      const bookingsData = bookingsResponse.data.data

      setRooms(roomsData)
      setBookings(bookingsData)

      const totalViews = roomsData.reduce((sum, room) => sum + (room.views || 0), 0)
      
      setStats({
        totalRooms: roomsData.length,
        activeRooms: roomsData.filter(r => r.status === 'Active').length,
        pendingRequests: bookingsData.filter(b => b.status === 'Pending').length,
        totalViews
      })
    } catch (error) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      Active: 'bg-green-100 text-green-800',
      'Pending Approval': 'bg-yellow-100 text-yellow-800',
      Rented: 'bg-blue-100 text-blue-800',
      Unavailable: 'bg-gray-100 text-gray-800',
      Rejected: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const bookingStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Accepted: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
      Cancelled: 'bg-gray-100 text-gray-800',
      Completed: 'bg-blue-100 text-blue-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const refreshRooms = async () => {
    const response = await roomAPI.getOwnerRooms()
    const roomsData = response.data.data
    setRooms(roomsData)
    setStats(prev => ({ ...prev, totalRooms: roomsData.length, activeRooms: roomsData.filter(room => room.status === 'Active').length, totalViews: roomsData.reduce((sum, room) => sum + (room.views || 0), 0) }))
  }

  const handleStatus = async (room, status) => {
    try {
      await roomAPI.updateStatus(room._id, status)
      await refreshRooms()
      toast.success(status === 'Active' ? 'Room marked available' : 'Room marked booked')
    } catch (error) {
      toast.error('Could not update room status')
    }
  }

  const handleDelete = async (room) => {
    if (!window.confirm(`Remove "${room.title}" from your listings?`)) return
    try {
      await roomAPI.deleteRoom(room._id)
      await refreshRooms()
      toast.success('Room listing removed')
    } catch (error) {
      toast.error('Could not remove room listing')
    }
  }

  const handleBookingStatus = async (booking, status) => {
    try {
      await bookingAPI.updateBookingStatus(booking._id, { status })
      await fetchData()
      toast.success(`Booking ${status.toLowerCase()}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update booking request')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Owner Dashboard</h1>
            <p className="text-gray-600">Manage your room listings and bookings</p>
          </div>
          <Link to="/owner/add-room" className="flex items-center gap-2 btn-primary">
            <FiPlus size={20} />
            Add New Room
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiHome size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600">Total Rooms</p>
                <p className="text-2xl font-bold">{stats.totalRooms}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
              <div>
                <p className="text-gray-600">Active Listings</p>
                <p className="text-2xl font-bold">{stats.activeRooms}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FiClipboard size={24} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold">{stats.pendingRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiEye size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600">Total Views</p>
                <p className="text-2xl font-bold">{stats.totalViews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Listings */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">My Listings</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-12">
                <FiHome size={64} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No rooms listed yet</p>
                <Link to="/owner/add-room" className="text-blue-600 font-bold hover:underline">
                  Create your first listing
                </Link>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {rooms.map((room) => (
                  <div key={room._id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg line-clamp-1">{room.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(room.status)}`}>
                        {room.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{room.city} • ₹{room.rent}/month</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>👁️ {room.views} views</span>
                      <div className="flex gap-2">
                        <Link to={`/room/${room._id}`} className="inline-flex items-center gap-1 text-blue-600 hover:underline" title="View room">
                          <FiExternalLink size={15} /> View
                        </Link>
                        <button onClick={() => handleStatus(room, room.status === 'Active' ? 'Rented' : 'Active')} className="inline-flex items-center gap-1 text-teal-700 hover:underline" title={room.status === 'Active' ? 'Mark as booked' : 'Mark as available'}>
                          <FiEdit3 size={15} /> {room.status === 'Active' ? 'Mark booked' : 'Mark available'}
                        </button>
                        <button onClick={() => handleDelete(room)} className="inline-flex items-center gap-1 text-red-600 hover:underline" title="Remove room">
                          <FiTrash2 size={15} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking Requests */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Booking Requests</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12">
                <FiClipboard size={64} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No booking requests yet</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {bookings.map((booking) => (
                  <div key={booking._id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold">{booking.userId?.name || 'User'}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bookingStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{booking.roomId?.title || 'Room'}</p>
                    <p className="text-gray-600 text-sm">Move-in: {new Date(booking.moveInDate).toLocaleDateString()}</p>
                    {booking.status === 'Pending' && (
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => handleBookingStatus(booking, 'Accepted')} className="text-xs btn-primary px-2 py-1">Accept</button>
                        <button onClick={() => handleBookingStatus(booking, 'Rejected')} className="text-xs btn-outline px-2 py-1">Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
