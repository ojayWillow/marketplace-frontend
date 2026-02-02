import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCreateListing } from '../../hooks/useListings'
import { uploadImage, getImageUrl } from '@marketplace/shared/src/api/uploads'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { CATEGORIES, LOCATIONS } from './constants'

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export default function CreateListing() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createListing = useCreateListing()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    location: '',
    contact_info: '',
  })

  // Image handling state
  const [images, setImages] = useState<{ file: File; preview: string }[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadError(null);
    const newImages: { file: File; preview: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check max images
      if (images.length + newImages.length >= MAX_IMAGES) {
        setUploadError(`Maximum ${MAX_IMAGES} images allowed`);
        break;
      }

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError(`Invalid file type: ${file.name}. Use JPG, PNG, GIF, or WebP.`);
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`File too large: ${file.name}. Max size is 5MB.`);
        continue;
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);
      newImages.push({ file, preview });
    }

    setImages(prev => [...prev, ...newImages]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      // Revoke the preview URL to free memory
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploadError(null);
    
    try {
      // First, upload all images
      setUploading(true);
      const imageUrls: string[] = [];
      
      for (const image of images) {
        const result = await uploadImage(image.file);
        imageUrls.push(result.url);
      }
      
      setUploadedUrls(imageUrls);
      setUploading(false);

      // Then create the listing with image URLs
      await createListing.mutateAsync({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        location: formData.location,
        contact_info: formData.contact_info || undefined,
        images: imageUrls.length > 0 ? imageUrls.join(',') : undefined,
      })

      navigate('/listings')
    } catch (error: any) {
      setUploading(false);
      setUploadError(error?.response?.data?.error || 'Failed to upload images');
    }
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

        {(createListing.isError || uploadError) && (
          <ErrorMessage message={uploadError || t('common.error')} className="mb-6" />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images Upload */}
          <div>
            <label className="label">
              Photos ({images.length}/{MAX_IMAGES})
            </label>
            
            {/* Image previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={img.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-md"
                    >
                      ×
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            {images.length < MAX_IMAGES && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  Click to add photos
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  JPG, PNG, GIF, WebP up to 5MB each
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

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
              disabled={createListing.isPending || uploading}
              className="btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Uploading images...
                </span>
              ) : createListing.isPending ? (
                t('common.loading')
              ) : (
                t('listings.publishButton')
              )}
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
