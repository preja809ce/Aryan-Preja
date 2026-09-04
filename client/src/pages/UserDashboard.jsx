import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiBookmark, FiClipboard, FiUser, FiX, FiXCircle } from 'react-icons/fi'
import { bookingAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function UserDashboard() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getMyBookings()
      setBookings(response.data.data)
    } catch (error) {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Accepted: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
      Cancelled: 'bg-gray-100 text-gray-800',
      Completed: 'bg-blue-100 text-blue-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const handleCancelBooking = async (booking) => {
    if (!window.confirm('Remove this booking request?')) return
    try {
      await bookingAPI.cancelBooking(booking._id)
      setBookings(prev => prev.map(item => item._id === booking._id ? { ...item, status: 'Cancelled' } : item))
      toast.success('Booking request removed')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not remove booking request')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <FiUser size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Welcome to Your Dashboard</h1>
              <p className="text-gray-600">Manage your bookings and profile</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiClipboard size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
              <div>
                <p className="text-gray-600">Accepted</p>
                <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'Accepted').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
              <div>
                <p className="text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'Pending').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Bookings */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-2 mb-6">
            <FiClipboard size={24} className="text-blue-600" />
            <h2 className="text-2xl font-bold">My Booking Requests</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <FiBookmark size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No bookings yet</p>
              <p className="text-sm text-gray-500">Search and book your perfect room to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Room</th>
                    <th className="px-6 py-3 text-left font-semibold">Move-in Date</th>
                    <th className="px-6 py-3 text-left font-semibold">Duration</th>
                    <th className="px-6 py-3 text-left font-semibold">Status</th>
                    <th className="px-6 py-3 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{booking.roomId?.title || 'Room'}</td>
                      <td className="px-6 py-4">{new Date(booking.moveInDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{booking.duration} months</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-3">
                        <button onClick={() => setSelectedBooking(booking)} className="text-blue-600 hover:underline font-semibold">
                          View Details
                        </button>
                        {(booking.status === 'Pending' || booking.status === 'Accepted') && (
                          <button onClick={() => handleCancelBooking(booking)} className="inline-flex items-center gap-1 text-red-600 hover:underline font-semibold">
                            <FiXCircle size={16} /> Remove Request
                          </button>
                        )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal="true" aria-labelledby="booking-details-title">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b pb-4">
              <div>
                <p className="text-sm text-gray-500">Booking Request</p>
                <h2 id="booking-details-title" className="text-2xl font-bold">{selectedBooking.roomId?.title || selectedBooking.room?.title || 'Room booking'}</h2>
              </div>
              <button onClick={() => setSelectedBooking(null)} aria-label="Close booking details" className="text-gray-500 hover:text-gray-900">
                <FiX size={22} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 text-sm">
              <div><p className="text-gray-500">Status</p><span className={`inline-block mt-1 px-3 py-1 rounded-full font-semibold ${getStatusColor(selectedBooking.status)}`}>{selectedBooking.status}</span></div>
              <div><p className="text-gray-500">Move-in date</p><p className="font-semibold">{selectedBooking.moveInDate ? new Date(selectedBooking.moveInDate).toLocaleDateString() : 'Not specified'}</p></div>
              <div><p className="text-gray-500">Duration</p><p className="font-semibold">{selectedBooking.duration || 0} months</p></div>
              <div><p className="text-gray-500">Occupants</p><p className="font-semibold">{selectedBooking.occupants || 1}</p></div>
            </div>
            <div className="border-t pt-4">
              <p className="text-gray-500 text-sm">Message</p>
              <p className="mt-1 text-gray-700">{selectedBooking.message || 'No message added.'}</p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              {(selectedBooking.status === 'Pending' || selectedBooking.status === 'Accepted') && (
                <button onClick={() => { setSelectedBooking(null); handleCancelBooking(selectedBooking) }} className="btn-outline text-red-600 border-red-200">
                  Remove Request
                </button>
              )}
              <button onClick={() => setSelectedBooking(null)} className="btn-primary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
