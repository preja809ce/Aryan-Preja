import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiUser, FiMail, FiPhone, FiLock } from 'react-icons/fi'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role
      })

      const { token, user } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('userId', user.id)
      localStorage.setItem('userRole', user.role)

      toast.success('Registration successful!')
      window.location.href = user.role === 'owner' ? '/owner/dashboard' : '/dashboard'
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-center text-gray-600 mb-8">Join our community today</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-2">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-2">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-2">Phone Number</label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-3 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone"
                required
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-2">I am a</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field"
            >
              <option value="user">Tenant (Looking for room)</option>
              <option value="owner">Room Owner (List rooms)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-2">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-2">Confirm Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
                className="input-field pl-10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-bold hover:underline">
              Login here
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>By registering, you agree to our Terms & Conditions</p>
        </div>
      </div>
    </div>
  )
}
