import { useState } from 'react'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholderClassName?: string
  onClick?: () => void
}

/**
 * LazyImage component with native lazy loading and smooth transitions
 * - Uses loading="lazy" for native browser lazy loading
 * - Shows blur placeholder while loading
 * - Fades in when loaded
 * - Shows fallback on error
 */
export default function LazyImage({ 
  src, 
  alt, 
  className = '', 
  placeholderClassName = '',
  onClick 
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        onClick={onClick}
      >
        <div className="text-gray-400 text-center p-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8 mx-auto mb-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <span className="text-xs">Image unavailable</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${placeholderClassName}`}>
      {/* Blur placeholder */}
      {!isLoaded && (
        <div 
          className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`}
        />
      )}
      
      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        onClick={onClick}
        className={`
          transition-opacity duration-300 ease-in-out
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          ${className}
        `}
      />
    </div>
  )
}
