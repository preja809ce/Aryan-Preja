import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { FiFilter, FiHome } from 'react-icons/fi'
import { roomAPI } from '../services/api'

export default function Browse() {
  const [searchParams] = useSearchParams()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    roomType: '',
    furnished: '',
  })

  useEffect(() => {
    fetchRooms()
  }, [filters])

  const fetchRooms = async () => {
    setLoading(true)
    try {
      const response = await roomAPI.getAllRooms(
        Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
      )
      setRooms(response.data.data)
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <div className="flex items-center gap-2 mb-6">
                <FiFilter size={20} />
                <h3 className="font-bold text-lg">Filters</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="Enter city"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">Min Price (₹)</label>
                  <input
                    type="number"
                    placeholder="Min price"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">Max Price (₹)</label>
                  <input
                    type="number"
                    placeholder="Max price"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">Room Type</label>
                  <select
                    value={filters.roomType}
                    onChange={(e) => handleFilterChange('roomType', e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Types</option>
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Shared">Shared</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-2">Furnishing</label>
                  <select
                    value={filters.furnished}
                    onChange={(e) => handleFilterChange('furnished', e.target.value)}
                    className="input-field"
                  >
                    <option value="">All</option>
                    <option value="Fully Furnished">Fully Furnished</option>
                    <option value="Semi Furnished">Semi Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Room List */}
          <div className="lg:col-span-3">
            <div className="mb-4">
              <h2 className="text-2xl font-bold">
                {rooms.length > 0 ? `${rooms.length} rooms found` : 'No rooms found'}
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin">
                  <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              </div>
            ) : rooms.length === 0 ? (
              <div className="card p-12 text-center">
                <FiHome size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">No rooms available</h3>
                <p className="text-gray-600">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rooms.map((room) => (
                  <Link
                    key={room._id}
                    to={`/room/${room._id}`}
                    className="card overflow-hidden hover:shadow-xl transition"
                  >
                    <div className="h-48 bg-gray-300 flex items-center justify-center overflow-hidden">
                      {room.images?.[0]?.url ? <img src={room.images[0].url} alt={room.title} className="w-full h-full object-cover" /> : <FiHome size={64} className="text-gray-400" />}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{room.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{room.city}</p>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-2xl font-bold text-blue-600">₹{room.rent}</span>
                        <span className="text-sm text-gray-600">/month</span>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          <FiHome size={16} /> {room.bedrooms} bed
                        </span>
                        <span>{room.furnishing}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-yellow-500">★★★★★</span>
                        <span className="btn-secondary text-sm py-1 px-3">
                          View Details
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
