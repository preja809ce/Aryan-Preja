import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiUpload, FiX } from 'react-icons/fi'
import { roomAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function AddRoom() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: 'Single Room',
    roomType: 'Single',
    rent: '',
    securityDeposit: '',
    maintenanceCharges: '',
    electricityCharges: '',
    area: '',
    floor: '',
    bedrooms: 1,
    bathrooms: 1,
    furnishing: 'Fully Furnished',
    amenities: [],
    address: '',
    city: '',
    state: '',
    pincode: '',
    availableFrom: '',
    minimumStay: 1,
    images: [],
    video: null
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const readFile = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const handleImages = async (event) => {
    const files = Array.from(event.target.files || []).slice(0, 8)
    const images = await Promise.all(files.map(async (file) => ({ url: await readFile(file), name: file.name, isMain: false })))
    setFormData(prev => ({ ...prev, images: [...prev.images, ...images].slice(0, 8) }))
  }

  const handleVideo = async (event) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = await readFile(file)
      setFormData(prev => ({ ...prev, video: { url, name: file.name } }))
    }
  }

  const removeImage = (index) => setFormData(prev => ({ ...prev, images: prev.images.filter((_, imageIndex) => imageIndex !== index) }))

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.rent || !formData.city) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      await roomAPI.createRoom(formData)
      toast.success('Room created successfully!')
      navigate('/owner/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  const amenitiesList = [
    'Wi-Fi', 'Parking', 'Attached Bathroom', 'Hot Water', 'Kitchen',
    'Washing Machine', 'Bed', 'Wardrobe', 'Study Table', 'Fan',
    'AC', 'CCTV', 'Power Backup'
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => navigate('/owner/dashboard')}
          className="flex items-center gap-2 text-blue-600 mb-8 hover:text-blue-700"
        >
          <FiArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2">List Your Room</h1>
          <p className="text-gray-600 mb-8">Step {step} of 3</p>

          {/* Progress Bar */}
          <div className="mb-8 flex gap-2">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition ${
                  s <= step ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              ></div>
            ))}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Basic Information</h2>

              <div>
                <label className="block font-semibold mb-2">Room Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Fully Furnished Single Room Near University"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your room in detail..."
                  className="input-field h-24 resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">Property Type</label>
                  <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="input-field">
                    <option>Single Room</option>
                    <option>Shared Room</option>
                    <option>PG</option>
                    <option>Apartment</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-2">Room Type</label>
                  <select name="roomType" value={formData.roomType} onChange={handleChange} className="input-field">
                    <option>Single</option>
                    <option>Double</option>
                    <option>Shared</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Pricing & Features</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">Monthly Rent (₹) *</label>
                  <input type="number" name="rent" value={formData.rent} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Security Deposit (₹)</label>
                  <input type="number" name="securityDeposit" value={formData.securityDeposit} onChange={handleChange} className="input-field" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">Maintenance (₹)</label>
                  <input type="number" name="maintenanceCharges" value={formData.maintenanceCharges} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Electricity (₹)</label>
                  <input type="number" name="electricityCharges" value={formData.electricityCharges} onChange={handleChange} className="input-field" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">Bedrooms</label>
                  <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Bathrooms</label>
                  <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="input-field" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">Area (sq ft)</label>
                  <input type="number" name="area" value={formData.area} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Furnishing</label>
                  <select name="furnishing" value={formData.furnishing} onChange={handleChange} className="input-field">
                    <option>Fully Furnished</option>
                    <option>Semi Furnished</option>
                    <option>Unfurnished</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Location & Details</h2>

              <div>
                <label className="block font-semibold mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block font-semibold mb-2">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} className="input-field" />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-2">Pincode</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="input-field" />
              </div>

              <div>
                <label className="block font-semibold mb-2">Available From</label>
                <input type="date" name="availableFrom" value={formData.availableFrom} onChange={handleChange} className="input-field" />
              </div>

              <div>
                <label className="block font-semibold mb-4">Amenities</label>
                <div className="grid grid-cols-2 gap-3">
                  {amenitiesList.map(amenity => (
                    <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity)}
                        className="w-4 h-4"
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-2">Room Photos</label>
                <label className="border-2 border-dashed border-blue-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50">
                  <FiUpload size={28} className="text-blue-600 mb-2" />
                  <span className="font-semibold text-blue-700">Upload room photos</span>
                  <span className="text-sm text-gray-500">JPG, PNG or WEBP, up to 8 photos</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImages} className="hidden" />
                </label>
                {formData.images.length > 0 && <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">{formData.images.map((image, index) => <div key={image.url} className="relative"><img src={image.url} alt={image.name} className="h-24 w-full object-cover rounded-lg" /><button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-600"><FiX size={14} /></button></div>)}</div>}
              </div>

              <div>
                <label className="block font-semibold mb-2">Room Video</label>
                <label className="border-2 border-dashed border-teal-300 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50">
                  <FiUpload size={26} className="text-teal-600 mb-2" />
                  <span className="font-semibold text-teal-700">Upload a room video</span>
                  <span className="text-sm text-gray-500">MP4 or WebM</span>
                  <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleVideo} className="hidden" />
                </label>
                {formData.video?.url && <video controls src={formData.video.url} className="mt-4 w-full max-h-48 rounded-lg" />}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between mt-8 gap-4">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="btn-outline"
            >
              Previous
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="btn-primary"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Publishing...' : 'Publish Room'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
