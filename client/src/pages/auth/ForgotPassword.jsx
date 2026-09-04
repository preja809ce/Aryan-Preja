import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMail } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
    toast.success('Password reset instructions requested')
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center px-4 py-12">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2">Reset Password</h1>
        <p className="text-center text-gray-600 mb-8">Enter your email to receive reset instructions.</p>
        <div className="relative mb-5">
          <FiMail className="absolute left-3 top-3 text-gray-400" />
          <input required type="email" className="input-field pl-10" placeholder="Your email address" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <button className="btn-primary w-full">Send Reset Instructions</button>
        {submitted && <p className="text-green-700 text-sm text-center mt-4">If this email is registered, instructions have been sent.</p>}
        <Link to="/login" className="block text-center text-blue-600 mt-6 hover:underline">Back to Login</Link>
      </form>
    </div>
  )
}