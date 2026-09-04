import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiLock, FiShield } from 'react-icons/fi'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await authAPI.login({ email, password })
      if (response.data.user.role !== 'admin') throw new Error('Admin access only')
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('userId', response.data.user.id)
      localStorage.setItem('userRole', 'admin')
      window.location.href = '/admin/dashboard'
    } catch (error) {
      toast.error(error.message === 'Admin access only' ? error.message : error.response?.data?.message || 'Invalid administrator credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="w-14 h-14 rounded-lg bg-slate-900 text-white flex items-center justify-center mx-auto mb-5"><FiShield size={28} /></div>
        <h1 className="text-3xl font-bold text-center mb-2">Admin Control</h1>
        <p className="text-center text-gray-600 mb-8">Website owner sign in</p>
        <input required type="email" className="input-field mb-4" placeholder="Administrator email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <div className="relative mb-6"><FiLock className="absolute left-3 top-3 text-gray-400" /><input required type="password" className="input-field pl-10" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} /></div>
        <button disabled={loading} className="w-full bg-slate-900 text-white rounded-lg px-6 py-2 font-semibold hover:bg-slate-800">{loading ? 'Signing in...' : 'Sign in as administrator'}</button>
        <Link to="/" className="block text-center text-blue-600 mt-6 hover:underline">Back to website</Link>
      </form>
    </div>
  )
}