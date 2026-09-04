import { FiFacebook, FiInstagram, FiTwitter, FiLinkedin } from 'react-icons/fi'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">RoomFinder</h3>
            <p className="text-sm">
              Find your perfect room and connect with verified property owners.
            </p>
          </div>

          {/* For Tenants */}
          <div>
            <h4 className="text-white font-bold mb-4">For Tenants</h4>
            <ul className="text-sm space-y-2">
              <li><Link to="/browse" className="hover:text-white transition">Find Rooms</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition">Saved Rooms</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition">My Bookings</Link></li>
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <h4 className="text-white font-bold mb-4">For Owners</h4>
            <ul className="text-sm space-y-2">
              <li><Link to="/register" className="hover:text-white transition">List Your Room</Link></li>
              <li><Link to="/owner/dashboard" className="hover:text-white transition">Manage Listings</Link></li>
              <li><Link to="/owner/dashboard" className="hover:text-white transition">Earnings</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="text-sm space-y-2">
              <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
              <li><a href="mailto:support@roomfinder.com" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-gray-700 pt-8 flex items-center justify-between flex-col md:flex-row gap-4">
          <p className="text-sm text-gray-400">
            &copy; 2026 RoomFinder. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition">
              <FiFacebook size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition">
              <FiInstagram size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition">
              <FiTwitter size={20} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition">
              <FiLinkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
