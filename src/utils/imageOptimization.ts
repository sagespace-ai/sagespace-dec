/**
 * Image Optimization Utilities
 * 
 * Provides utilities for optimizing images, generating thumbnails,
 * and handling responsive image URLs
 */

export interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
  fit?: 'cover' | 'contain' | 'fill'
}

/**
 * Generate optimized image URL
 * For Supabase Storage, we can use transformations
 * For other sources, return original URL
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  if (!originalUrl) return ''

  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    fit = 'cover',
  } = options

  // If it's a Supabase Storage URL, we can add transformations
  if (originalUrl.includes('supabase.co/storage')) {
    const url = new URL(originalUrl)
    const params = new URLSearchParams()

    if (width) params.append('width', width.toString())
    if (height) params.append('height', height.toString())
    params.append('quality', quality.toString())
    params.append('format', format)
    params.append('fit', fit)

    if (params.toString()) {
      url.search = params.toString()
    }

    return url.toString()
  }

  // For other image sources, return original
  // In production, you might want to use a CDN or image optimization service
  return originalUrl
}

/**
 * Generate responsive image srcset
 */
export function generateSrcSet(
  baseUrl: string,
  widths: number[] = [320, 640, 960, 1280, 1920],
  options: Omit<ImageOptimizationOptions, 'width'> = {}
): string {
  return widths
    .map((width) => {
      const url = getOptimizedImageUrl(baseUrl, { ...options, width })
      return `${url} ${width}w`
    })
    .join(', ')
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(breakpoints: Record<string, string> = {}): string {
  const defaultSizes = {
    '(max-width: 640px)': '100vw',
    '(max-width: 1024px)': '50vw',
    default: '33vw',
  }

  const sizes = { ...defaultSizes, ...breakpoints }
  return Object.entries(sizes)
    .map(([query, size]) => (query === 'default' ? size : `${query} ${size}`))
    .join(', ')
}

/**
 * Lazy load image with intersection observer
 */
export function createLazyImageObserver(
  callback: (entry: IntersectionObserverEntry) => void
): IntersectionObserver {
  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry)
        }
      })
    },
    {
      rootMargin: '50px', // Start loading 50px before image enters viewport
      threshold: 0.01,
    }
  )
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, as: 'image' = 'image'): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = as
    link.href = src
    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`Failed to preload image: ${src}`))
    document.head.appendChild(link)
  })
}

/**
 * Get image dimensions without loading full image
 */
export function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}
