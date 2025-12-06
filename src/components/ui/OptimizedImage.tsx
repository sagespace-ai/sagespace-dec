import { useState, useEffect, useRef } from 'react'
import { getOptimizedImageUrl, generateSrcSet, generateSizes } from '../../utils/imageOptimization'
import { cn } from '../../lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  quality?: number
  className?: string
  lazy?: boolean
  placeholder?: string
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 80,
  className = '',
  lazy = true,
  placeholder,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const optimizedSrc = getOptimizedImageUrl(src, { width, height, quality })
  const srcSet = width ? generateSrcSet(src, [width, width * 2, width * 3], { quality }) : undefined
  const sizes = width ? generateSizes() : undefined

  useEffect(() => {
    if (!lazy || !imgRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && imgRef.current) {
            // Start loading the image
            if (imgRef.current.dataset.src) {
              imgRef.current.src = imgRef.current.dataset.src
              if (srcSet && imgRef.current.dataset.srcset) {
                imgRef.current.srcset = imgRef.current.dataset.srcset
              }
              observer.disconnect()
            }
          }
        })
      },
      { rootMargin: '50px' }
    )

    observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [lazy, srcSet])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  if (hasError && placeholder) {
    return (
      <div
        className={cn('bg-gray-200 dark:bg-gray-800 flex items-center justify-center', className)}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">{alt}</span>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ width, height }}>
      {/* Placeholder/Blur */}
      {!isLoaded && placeholder && (
        <div
          className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse"
          style={{
            backgroundImage: `url(${placeholder})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
          }}
        />
      )}

      {/* Actual Image */}
      <img
        ref={imgRef}
        src={lazy ? undefined : optimizedSrc}
        data-src={lazy ? optimizedSrc : undefined}
        srcSet={lazy ? undefined : srcSet}
        data-srcset={lazy ? srcSet : undefined}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
      />
    </div>
  )
}
