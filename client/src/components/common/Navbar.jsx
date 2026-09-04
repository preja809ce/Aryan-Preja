import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMenu, FiX, FiHome, FiLogOut } from 'react-icons/fi'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))
  const userRole = localStorage.getItem('userRole')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userRole')
    setIsLoggedIn(false)
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <FiHome size={24} />
            RoomFinder
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition">
              Home
            </Link>
            <Link to="/browse" className="text-gray-700 hover:text-blue-600 transition">
              Find Rooms
            </Link>
            {isLoggedIn && userRole === 'owner' && (
              <>
                <Link to="/owner/add-room" className="text-gray-700 hover:text-blue-600 transition">
                  List Room
                </Link>
                <Link to="/owner/dashboard" className="text-gray-700 hover:text-blue-600 transition">
                  Dashboard
                </Link>
              </>
            )}
            {isLoggedIn && userRole === 'user' && (
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 transition">
                Dashboard
              </Link>
            )}
            {isLoggedIn && userRole === 'admin' && (
              <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600 transition">Admin Control</Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <FiLogOut size={18} />
                Logout
              </button>
            ) : (
              <>
                <Link to="/admin/login" className="text-sm text-gray-500 hover:text-blue-600 transition">
                  Website Admin
                </Link>
                <Link to="/login" className="btn-outline">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t">
            <Link to="/" className="block py-2 text-gray-700 hover:text-blue-600">
              Home
            </Link>
            <Link to="/browse" className="block py-2 text-gray-700 hover:text-blue-600">
              Find Rooms
            </Link>
            {isLoggedIn ? (
              <>
                {userRole === 'owner' && (
                  <>
                    <Link to="/owner/add-room" className="block py-2 text-gray-700 hover:text-blue-600">
                      List Room
                    </Link>
                    <Link to="/owner/dashboard" className="block py-2 text-gray-700 hover:text-blue-600">
                      Dashboard
                    </Link>
                  </>
                )}
                {userRole === 'user' && (
                  <Link to="/dashboard" className="block py-2 text-gray-700 hover:text-blue-600">
                    Dashboard
                  </Link>
                )}
                {userRole === 'admin' && (
                  <Link to="/admin/dashboard" className="block py-2 text-gray-700 hover:text-blue-600">Admin Control</Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/admin/login" className="block py-2 text-gray-500 hover:text-blue-600">
                  Website Admin
                </Link>
                <Link to="/login" className="block py-2 text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link to="/register" className="block py-2 text-gray-700 hover:text-blue-600">
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
