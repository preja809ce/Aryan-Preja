import { Link } from 'react-router-dom'

export default function LegalPage({ type }) {
  const isPrivacy = type === 'privacy'
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-lg shadow-md p-8">
        <p className="text-sm text-blue-600 font-semibold mb-2">RoomFinder</p>
        <h1 className="text-3xl font-bold mb-6">{isPrivacy ? 'Privacy Policy' : 'Terms & Conditions'}</h1>
        {isPrivacy ? (
          <div className="space-y-4 text-gray-700"><p>RoomFinder uses the information you provide to create accounts, manage listings, process booking requests, and support communication between users and owners.</p><p>We do not sell your personal information. Keep your password private and contact support if you notice suspicious activity.</p><p>For questions, contact support@roomfinder.com.</p></div>
        ) : (
          <div className="space-y-4 text-gray-700"><p>By using RoomFinder, you agree to provide accurate account and listing information and to use the platform lawfully.</p><p>RoomFinder provides a marketplace connection between tenants and owners. Users should independently verify property details before making rental decisions.</p><p>For questions, contact support@roomfinder.com.</p></div>
        )}
        <Link to="/" className="inline-block mt-8 text-blue-600 font-semibold hover:underline">Back to RoomFinder</Link>
      </article>
    </div>
  )
}