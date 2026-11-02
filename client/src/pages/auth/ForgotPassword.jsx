import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FiLock, FiMail } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { authAPI } from '../../services/api'

export default function ForgotPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetLink, setResetLink] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      if (token) {
        if (password !== confirmPassword) {
          toast.error('Passwords do not match')
          return
        }

        const response = await authAPI.resetPassword({ email, token, password })
        toast.success(response.data.message)
        navigate('/login')
        return
      }

      const response = await authAPI.requestPasswordReset({ email: email.trim().toLowerCase() })
      setResetLink(response.data.resetUrl || '')
      setSubmitted(true)
      toast.success(response.data.message)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password reset failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center px-4 py-12">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2">
          {token ? 'Choose a New Password' : 'Reset Password'}
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {token
            ? 'Enter and confirm your new password.'
            : 'Enter your email to receive password reset instructions.'}
        </p>

        <div className="relative mb-5">
          <FiMail className="absolute left-3 top-3 text-gray-400" />
          <input
            required
            type="email"
            className="input-field pl-10"
            placeholder="Your email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            readOnly={Boolean(token)}
          />
        </div>

        {token && (
          <>
            <div className="relative mb-5">
              <FiLock className="absolute left-3 top-3 text-gray-400" />
              <input
                required
                minLength={8}
                type="password"
                className="input-field pl-10"
                placeholder="New password (at least 8 characters)"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className="relative mb-5">
              <FiLock className="absolute left-3 top-3 text-gray-400" />
              <input
                required
                minLength={8}
                type="password"
                className="input-field pl-10"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
          </>
        )}

        <button disabled={loading} className="btn-primary w-full">
          {loading
            ? 'Please wait...'
            : token ? 'Change Password' : 'Send Reset Instructions'}
        </button>

        {submitted && (
          <p className="text-green-700 text-sm text-center mt-4">
            If this email is registered, password reset instructions have been sent.
          </p>
        )}
        {resetLink && (
          <a href={resetLink} className="block text-center text-blue-600 mt-3 hover:underline">
            Open password reset form
          </a>
        )}
        <Link to="/login" className="block text-center text-blue-600 mt-6 hover:underline">
          Back to Login
        </Link>
      </form>
    </div>
  )
}
