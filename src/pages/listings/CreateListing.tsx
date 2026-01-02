import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCreateListing } from '../../hooks/useListings'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { CATEGORIES, LOCATIONS } from './constants'

export default function CreateListing() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createListing = useCreateListing()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    location: '',
    contact_info: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await createListing.mutateAsync({
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      location: formData.location,
      contact_info: formData.contact_info || undefined,
    })

    navigate('/listings')
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        to="/listings"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('listings.allListings')}
      </Link>

      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {t('listings.createNew')}
        </h1>

        {createListing.isError && (
          <ErrorMessage message={t('common.error')} className="mb-6" />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="label">
              {t('listings.titleLabel')} *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input"
              required
              maxLength={100}
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="label">
              {t('listings.categoryLabel')} *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">-- Select --</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`listings.categories.${cat}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="label">
              {t('listings.priceLabel')} *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="input"
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="label">
              {t('listings.locationLabel')} *
            </label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">-- Select --</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="label">
              {t('listings.descriptionLabel')} *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input min-h-[150px]"
              required
              maxLength={2000}
            />
          </div>

          {/* Contact info */}
          <div>
            <label htmlFor="contact_info" className="label">
              {t('listings.contactLabel')}
            </label>
            <input
              type="text"
              id="contact_info"
              name="contact_info"
              value={formData.contact_info}
              onChange={handleChange}
              className="input"
              placeholder="+371 20000000 or email@example.com"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={createListing.isPending}
              className="btn-primary flex-1 py-3"
            >
              {createListing.isPending ? t('common.loading') : t('listings.publishButton')}
            </button>
            <Link to="/listings" className="btn-secondary py-3">
              {t('common.cancel')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
