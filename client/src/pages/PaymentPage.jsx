import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiCheckCircle, FiDownload, FiEye, FiLoader } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { bookingAPI } from '../services/api'

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

export default function PaymentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login')
      return
    }
    bookingAPI.getPayment(id).then((response) => setSummary(response.data.data)).catch((error) => {
      toast.error(error.response?.data?.message || 'Payment is not available')
      navigate('/dashboard')
    }).finally(() => setLoading(false))
  }, [id, navigate])

  const startPayment = async () => {
    setPaying(true)
    setPaymentError('')
    try {
      const response = await bookingAPI.createPaymentOrder(id)
      const order = response.data.data
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = resolve
          script.onerror = reject
          document.body.appendChild(script)
        })
      }
      const checkout = new window.Razorpay({
        key: order.razorpayKeyId,
        amount: order.totalAmount * 100,
        currency: 'INR',
        name: 'RoomFinder',
        description: order.roomName,
        order_id: order.razorpayOrderId,
        handler: async (paymentResponse) => {
          try {
            const verified = await bookingAPI.verifyPayment(id, paymentResponse)
            setResult(verified.data.data)
            toast.success('Payment successful')
          } catch (error) {
            const message = error.response?.data?.message || 'Payment failed. Please try again.'
            setPaymentError(message)
            toast.error(message)
          } finally {
            setPaying(false)
          }
        },
        modal: { ondismiss: () => { setPaying(false); setPaymentError('Payment failed. Please try again.') } },
        theme: { color: '#2563eb' },
      })
      checkout.open()
    } catch (error) {
      setPaying(false)
      const message = error.response?.data?.message || 'Payment failed. Please try again.'
      setPaymentError(message)
      toast.error(message)
    }
  }

  const downloadReceipt = () => {
    const payment = result.payment
    const booking = result.booking
    const receipt = `RoomFinder Payment Receipt\n\nBooking ID: ${booking._id}\nRoom: ${booking.roomId?.title || ''}\nPayment amount: ${money(payment.amount)}\nTransaction ID: ${payment.transactionId}\nPayment date: ${new Date(payment.paidAt).toLocaleString()}\nMove-in date: ${new Date(booking.moveInDate).toLocaleDateString()}`
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([receipt], { type: 'text/plain' }))
    link.download = `roomfinder-receipt-${booking._id}.txt`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><FiLoader className="animate-spin text-blue-600" size={32} /></div>
  if (result) return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        <FiCheckCircle className="mx-auto text-green-600" size={58} />
        <h1 className="mt-4 text-3xl font-bold">Payment Successful!</h1>
        <p className="mt-2 text-gray-600">Your room booking has been confirmed.</p>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left border-t pt-6">
          <p><span className="text-gray-500">Booking ID</span><br /><strong>{result.booking._id}</strong></p>
          <p><span className="text-gray-500">Room details</span><br /><strong>{result.booking.roomId?.title}</strong></p>
          <p><span className="text-gray-500">Payment amount</span><br /><strong>{money(result.payment.amount)}</strong></p>
          <p><span className="text-gray-500">Transaction ID</span><br /><strong className="break-all">{result.payment.transactionId}</strong></p>
          <p><span className="text-gray-500">Payment date</span><br /><strong>{new Date(result.payment.paidAt).toLocaleString()}</strong></p>
          <p><span className="text-gray-500">Move-in date</span><br /><strong>{new Date(result.booking.moveInDate).toLocaleDateString()}</strong></p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="btn-primary inline-flex items-center gap-2"><FiEye /> View Booking</button>
          <button onClick={downloadReceipt} className="btn-outline inline-flex items-center gap-2"><FiDownload /> Download Receipt</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"><FiArrowLeft /> Back to bookings</button>
        <h1 className="mt-6 text-3xl font-bold">Complete your payment</h1>
        <p className="mt-2 text-gray-600">Payment is available because the owner accepted your booking request.</p>
        <div className="mt-8 divide-y border rounded-lg">
          <p className="flex justify-between gap-4 p-4"><span>Room name</span><strong>{summary?.roomName}</strong></p>
          <p className="flex justify-between gap-4 p-4"><span>Owner name</span><strong>{summary?.ownerName}</strong></p>
          <p className="flex justify-between gap-4 p-4"><span>Move-in date</span><strong>{new Date(summary?.moveInDate).toLocaleDateString()}</strong></p>
          <p className="flex justify-between gap-4 p-4"><span>Monthly rent</span><strong>{money(summary?.monthlyRent)}</strong></p>
          <p className="flex justify-between gap-4 p-4"><span>Security deposit</span><strong>{money(summary?.securityDeposit)}</strong></p>
          <p className="flex justify-between gap-4 p-4"><span>Platform fee</span><strong>{money(summary?.platformFee)}</strong></p>
          <p className="flex justify-between gap-4 p-4 text-lg"><span>Total amount</span><strong>{money(summary?.totalAmount)}</strong></p>
        </div>
        <p className="mt-4 text-sm text-gray-500">Payment deadline: {summary?.paymentDeadline ? new Date(summary.paymentDeadline).toLocaleString() : 'Not specified'}</p>
        {paymentError && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{paymentError}</p>}
        <button disabled={paying} onClick={startPayment} className="btn-primary mt-8 w-full py-3 disabled:opacity-60">
          {paying ? 'Opening secure payment...' : paymentError ? 'Retry Payment' : `Pay ${money(summary?.totalAmount)}`}
        </button>
        {paying && <p className="mt-3 text-center text-sm text-gray-500">Payment failed? Close the gateway and use Retry Payment to try again.</p>}
      </div>
    </div>
  )
}
