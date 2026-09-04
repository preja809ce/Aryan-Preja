import { Link } from 'react-router-dom'
import { FiSearch, FiMapPin, FiHome, FiDollarSign } from 'react-icons/fi'
import { useState } from 'react'

export default function Home() {
  const [searchFilters, setSearchFilters] = useState({
    city: '',
    minPrice: '',
    maxPrice: '',
  })

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    window.location.href = `/browse?${params.toString()}`
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Perfect Room
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Discover comfortable and affordable rooms, PGs, flats and rental properties near you
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  <FiMapPin className="inline mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g., Palampur"
                  value={searchFilters.city}
                  onChange={(e) => setSearchFilters({...searchFilters, city: e.target.value})}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  <FiDollarSign className="inline mr-2" />
                  Min Price
                </label>
                <input
                  type="number"
                  placeholder="₹ Min"
                  value={searchFilters.minPrice}
                  onChange={(e) => setSearchFilters({...searchFilters, minPrice: e.target.value})}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  <FiDollarSign className="inline mr-2" />
                  Max Price
                </label>
                <input
                  type="number"
                  placeholder="₹ Max"
                  value={searchFilters.maxPrice}
                  onChange={(e) => setSearchFilters({...searchFilters, maxPrice: e.target.value})}
                  className="input-field"
                />
              </div>

              <div className="flex items-end">
                <button type="submit" className="btn-primary w-full">
                  <FiSearch className="inline mr-2" />
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { title: 'Search Rooms', desc: 'Browse our large collection', icon: FiSearch },
              { title: 'View Details', desc: 'Check all room information', icon: FiHome },
              { title: 'Contact Owner', desc: 'Direct communication', icon: '💬' },
              { title: 'Book Room', desc: 'Secure your perfect space', icon: '✓' },
            ].map((item, i) => (
              <div key={i} className="card p-6 text-center">
                <div className="text-4xl mb-4">{typeof item.icon === 'string' ? item.icon : <item.icon size={48} className="mx-auto text-blue-600" />}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Locations */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Locations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Palampur', 'Dharamshala', 'Kangra', 'Chandigarh', 'Delhi', 'Shimla'].map((city) => (
              <Link
                key={city}
                to={`/browse?city=${city}`}
                className="card p-8 text-center hover:shadow-xl transition"
              >
                <h3 className="text-xl font-bold mb-2">{city}</h3>
                <p className="text-gray-600 mb-4">Explore rooms in {city}</p>
                <span className="text-blue-600 font-semibold">View Rooms →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* List Your Room CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-teal-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Have a Room to Rent?</h2>
          <p className="text-xl mb-8">List your room and connect with verified tenants</p>
          <Link to="/register" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
            List Your Room
          </Link>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Rooms</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((room) => (
              <div key={room} className="card overflow-hidden">
                <div className="h-48 bg-gray-300 flex items-center justify-center">
                  <FiHome size={64} className="text-gray-400" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">Beautiful Single Room</h3>
                  <p className="text-gray-600 text-sm mb-4">Near University, Palampur</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-blue-600">₹8,000</span>
                    <span className="text-sm text-gray-600">/month</span>
                  </div>
                  <Link to="/room/1" className="btn-primary w-full text-center">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
