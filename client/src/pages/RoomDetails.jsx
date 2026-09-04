import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { FiMapPin, FiHome, FiDollarSign, FiUser, FiMessageSquare, FiX } from 'react-icons/fi'
import { roomAPI, bookingAPI, messageAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function RoomDetails() {
  const { id } = useParams()
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactData, setContactData] = useState({ name: '', email: '', phone: '', message: '', moveInDate: '' })
  const [bookingData, setBookingData] = useState({
    moveInDate: '',
    duration: 1,
    occupants: 1,
    message: ''
  })

  useEffect(() => {
    fetchRoom()
  }, [id])

  const fetchRoom = async () => {
    try {
      const response = await roomAPI.getRoomById(id)
      setRoom(response.data.data)
    } catch (error) {
      console.error('Error fetching room:', error)
      toast.error('Failed to load room details')
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    
    if (!token) {
      toast.error('Please login to book a room')
      return
    }

    if (!bookingData.moveInDate || bookingData.duration < 1 || bookingData.occupants < 1) {
      toast.error('Please provide a move-in date, duration, and occupant count')
      return
    }

    try {
      await bookingAPI.createBooking({
        roomId: id,
        ...bookingData
      })
      toast.success('Booking request sent successfully!')
      setShowBookingForm(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send booking request')
    }
  }

  const handleContact = async (e) => {
    e.preventDefault()
    try {
      await messageAPI.send({ roomId: id, receiverId: room.ownerId?._id, ...contactData })
      toast.success('Your message was sent to the owner.')
      setShowContactForm(false)
      setContactData({ name: '', email: '', phone: '', message: '', moveInDate: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not send your message')
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>
  }

  if (!room) {
    return <div className="text-center py-12"><h2>Room not found</h2></div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Images */}
            <div className="bg-gray-300 rounded-lg h-96 flex items-center justify-center mb-6 overflow-hidden">
              {room.images?.[0]?.url ? <img src={room.images[0].url} alt={room.title} className="w-full h-full object-cover" /> : <div className="text-center text-gray-500"><p>Room Images Gallery</p></div>}
            </div>
            {room.images?.length > 1 && <div className="grid grid-cols-4 gap-3 mb-6">{room.images.slice(0, 4).map((image, index) => <img key={index} src={image.url} alt={`${room.title} ${index + 1}`} className="h-20 w-full object-cover rounded-lg" />)}</div>}
            {room.video?.url && <video controls className="w-full rounded-lg mb-6" src={room.video.url} />}

            {/* Room Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-3xl font-bold mb-2">{room.title}</h1>
              <div className="flex items-center gap-2 text-gray-600 mb-6">
                <FiMapPin size={20} />
                {room.address}, {room.city}, {room.state}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <FiHome size={24} className="mx-auto text-blue-600 mb-2" />
                  <p className="font-semibold">{room.bedrooms} Beds</p>
                </div>
                <div className="text-center">
                  <FiDollarSign size={24} className="mx-auto text-blue-600 mb-2" />
                  <p className="font-semibold">₹{room.rent}</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{room.furnishing}</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{room.roomType} Room</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">About this room</h2>
                <p className="text-gray-700">{room.description}</p>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {room.amenities && room.amenities.map((amenity, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-bold mb-4">Pricing Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monthly Rent:</span>
                    <span className="font-bold">₹{room.rent}</span>
                  </div>
                  {room.securityDeposit && (
                    <div className="flex justify-between">
                      <span>Security Deposit:</span>
                      <span className="font-bold">₹{room.securityDeposit}</span>
                    </div>
                  )}
                  {room.maintenanceCharges && (
                    <div className="flex justify-between">
                      <span>Maintenance:</span>
                      <span className="font-bold">₹{room.maintenanceCharges}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Owner Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                  <FiUser size={32} className="text-gray-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{room.ownerId?.name || 'Room Owner'}</h3>
                  <p className="text-sm text-gray-600">Verified Owner ✓</p>
                </div>
              </div>
              <button onClick={() => setShowContactForm(true)} className="w-full btn-primary mb-2 flex items-center justify-center gap-2">
                <FiMessageSquare size={18} />
                Contact Owner
              </button>
              <button
                onClick={() => setShowBookingForm(!showBookingForm)}
                className="w-full btn-secondary"
              >
                Request Booking
              </button>
            </div>

            {showContactForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Contact Owner</h3>
                  <button type="button" onClick={() => setShowContactForm(false)} aria-label="Close contact form" className="text-gray-500 hover:text-gray-900"><FiX size={20} /></button>
                </div>
                <form onSubmit={handleContact} className="space-y-4">
                  <input required className="input-field" placeholder="Your name" value={contactData.name} onChange={(e) => setContactData({ ...contactData, name: e.target.value })} />
                  <input required type="email" className="input-field" placeholder="Your email" value={contactData.email} onChange={(e) => setContactData({ ...contactData, email: e.target.value })} />
                  <input required type="tel" className="input-field" placeholder="Your phone" value={contactData.phone} onChange={(e) => setContactData({ ...contactData, phone: e.target.value })} />
                  <input type="date" className="input-field" value={contactData.moveInDate} onChange={(e) => setContactData({ ...contactData, moveInDate: e.target.value })} />
                  <textarea required className="input-field h-24 resize-none" placeholder="Hello, I am interested in this room..." value={contactData.message} onChange={(e) => setContactData({ ...contactData, message: e.target.value })}></textarea>
                  <button type="submit" className="w-full btn-primary">Send Message</button>
                </form>
              </div>
            )}

            {/* Booking Form */}
            {showBookingForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="font-bold text-lg mb-4">Request Booking</h3>
                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <label className="block font-semibold mb-2">Move-in Date</label>
                    <input
                      type="date"
                      value={bookingData.moveInDate}
                      onChange={(e) => setBookingData({...bookingData, moveInDate: e.target.value})}
                      required
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2">Duration (Months)</label>
                    <input
                      type="number"
                      min="1"
                      value={bookingData.duration}
                      onChange={(e) => setBookingData({...bookingData, duration: parseInt(e.target.value)})}
                      required
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2">Number of Occupants</label>
                    <input
                      type="number"
                      min="1"
                      value={bookingData.occupants}
                      onChange={(e) => setBookingData({...bookingData, occupants: parseInt(e.target.value)})}
                      required
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2">Message</label>
                    <textarea
                      value={bookingData.message}
                      onChange={(e) => setBookingData({...bookingData, message: e.target.value})}
                      placeholder="Tell the owner about yourself..."
                      className="input-field h-24 resize-none"
                    ></textarea>
                  </div>
                  <button type="submit" className="w-full btn-primary">
                    Send Booking Request
                  </button>
                </form>
              </div>
            )}

            {/* Room Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Available From:</p>
                  <p className="font-semibold">{room.availableFrom ? new Date(room.availableFrom).toLocaleDateString() : 'Available now'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Room Type:</p>
                  <p className="font-semibold">{room.roomType}</p>
                </div>
                <div>
                  <p className="text-gray-600">Property Type:</p>
                  <p className="font-semibold">{room.propertyType}</p>
                </div>
                <div>
                  <p className="text-gray-600">Area:</p>
                  <p className="font-semibold">{room.area ? `${room.area} sq ft` : 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
