import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiShield, FiUsers, FiHome, FiClipboard, FiTrash2, FiEye } from 'react-icons/fi'
import { bookingAPI, roomAPI } from '../services/api'
import toast from 'react-hot-toast'

const usersKey = 'roomfinder_demo_users'
const read = (key, fallback) => JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])
  const [bookings, setBookings] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (localStorage.getItem('userRole') !== 'admin') {
      navigate('/admin/login')
      return
    }
    loadData()
  }, [])

  const loadData = async () => {
    const [roomResponse, bookingResponse] = await Promise.all([roomAPI.getOwnerRooms(), bookingAPI.getOwnerBookings()])
    setRooms(roomResponse.data.data)
    setBookings(bookingResponse.data.data)
    setUsers(read(usersKey, []))
  }

  const updateStatus = async (room, status) => {
    await roomAPI.updateStatus(room._id, status)
    await loadData()
    toast.success(`Room marked ${status === 'Active' ? 'available' : 'booked'}`)
  }

  const removeRoom = async (room) => {
    if (!window.confirm(`Remove ${room.title}?`)) return
    await roomAPI.deleteRoom(room._id)
    await loadData()
    toast.success('Listing removed')
  }

  const updateBooking = async (booking, status) => {
    await bookingAPI.updateBookingStatus(booking._id, { status })
    await loadData()
    toast.success(`Booking ${status.toLowerCase()}`)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userRole')
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div><p className="text-sm text-blue-700 font-semibold uppercase">Website owner</p><h1 className="text-3xl font-bold flex items-center gap-3"><FiShield /> Admin Dashboard</h1></div>
          <button onClick={logout} className="btn-outline">Log out</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          {[['Users', users.length, FiUsers], ['Listings', rooms.length, FiHome], ['Bookings', bookings.length, FiClipboard], ['Active Rooms', rooms.filter(room => room.status === 'Active').length, FiEye]].map(([label, value, Icon]) => <div key={label} className="bg-white rounded-lg shadow-md p-5 flex items-center gap-4"><Icon className="text-blue-600" size={25} /><div><p className="text-gray-500">{label}</p><p className="text-2xl font-bold">{value}</p></div></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white rounded-lg shadow-md p-6"><h2 className="text-xl font-bold mb-5">Manage Listings</h2><div className="space-y-4">{rooms.length === 0 ? <p className="text-gray-500">No listings yet.</p> : rooms.map(room => <div key={room._id} className="border rounded-lg p-4"><div className="flex justify-between gap-3"><div><h3 className="font-bold">{room.title}</h3><p className="text-sm text-gray-500">{room.city} · ₹{room.rent}/month</p></div><span className="text-sm font-semibold">{room.status}</span></div><div className="flex flex-wrap gap-3 mt-4 text-sm"><Link to={`/room/${room._id}`} className="text-blue-600 inline-flex items-center gap-1"><FiEye /> View</Link><button onClick={() => updateStatus(room, room.status === 'Active' ? 'Rented' : 'Active')} className="text-teal-700">{room.status === 'Active' ? 'Mark booked' : 'Mark available'}</button><button onClick={() => removeRoom(room)} className="text-red-600 inline-flex items-center gap-1"><FiTrash2 /> Remove</button></div></div>)}</div></section>
          <section className="bg-white rounded-lg shadow-md p-6"><h2 className="text-xl font-bold mb-5">Booking Requests</h2><div className="space-y-4">{bookings.length === 0 ? <p className="text-gray-500">No booking requests yet.</p> : bookings.map(booking => <div key={booking._id} className="border rounded-lg p-4"><p className="font-bold">{booking.room?.title || booking.roomId?.title || 'Room booking'}</p><p className="text-sm text-gray-500">Move-in: {booking.moveInDate ? new Date(booking.moveInDate).toLocaleDateString() : 'Not specified'} · {booking.status}</p>{booking.status === 'Pending' && <div className="flex gap-3 mt-3"><button onClick={() => updateBooking(booking, 'Accepted')} className="btn-primary text-sm px-3 py-1">Accept</button><button onClick={() => updateBooking(booking, 'Rejected')} className="btn-outline text-sm px-3 py-1">Reject</button></div>}</div>)}</div></section>
        </div>
      </div>
    </div>
  )
}