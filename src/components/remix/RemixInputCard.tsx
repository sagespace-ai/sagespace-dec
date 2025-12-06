/**
 * RemixInputCard Component
 * 
 * Input card for Remix feature - accepts text and/or image input.
 * Reuses design system components (Card2035) for consistency.
 */

import { useState, useRef, useEffect } from 'react'
import { X, Image as ImageIcon, FileText, AlertCircle } from 'lucide-react'
import { Card2035, Card2035Content } from '../ui/Card2035'
import { Input2035 } from '../ui/Input2035'
import type { RemixInput } from '../../types/remix'

interface RemixInputCardProps {
  label: string
  value: RemixInput
  onChange: (value: RemixInput) => void
  disabled?: boolean
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function RemixInputCard({ label, value, onChange, disabled }: RemixInputCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(value.imageUrl || null)

  // Update preview when imageUrl changes
  useEffect(() => {
    setImagePreview(value.imageUrl || null)
  }, [value.imageUrl])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...value, text: e.target.value })
    if (error) setError(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError("Image exceeds 5MB limit")
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }
      setError(null)
      const url = URL.createObjectURL(file)
      setImagePreview(url)
      onChange({ ...value, imageUrl: url })
    }
  }

  const clearImage = () => {
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }
    setImagePreview(null)
    onChange({ ...value, imageUrl: undefined })
    setError(null)
  }

  const handleImageUrlChange = (url: string) => {
    setImagePreview(url)
    onChange({ ...value, imageUrl: url || undefined })
  }

  return (
    <Card2035 className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </span>
        </div>
        {!imagePreview && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            disabled={disabled}
            title="Upload Image"
          >
            <ImageIcon size={18} />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-xs text-red-200">
          <AlertCircle size={12} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto hover:text-white">
            <X size={12} />
          </button>
        </div>
      )}

      <Card2035Content className="flex-1 flex flex-col gap-3">
        {/* Image Preview */}
        {imagePreview && (
          <div className="relative w-full h-48 bg-black/20 rounded-lg overflow-hidden shrink-0">
            <img
              src={imagePreview}
              alt="Input preview"
              className="w-full h-full object-cover"
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-red-900/80 transition-colors backdrop-blur-sm"
              disabled={disabled}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Image URL Input (for external images) */}
        {!imagePreview && (
          <Input2035
            type="url"
            placeholder="Or paste image URL..."
            value={value.imageUrl || ''}
            onChange={(e) => handleImageUrlChange(e.target.value)}
            disabled={disabled}
            className="text-sm"
          />
        )}

        {/* Text Input */}
        <textarea
          className="flex-1 min-h-[120px] bg-white/5 dark:bg-white/5 border border-white/10 rounded-[12px] px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-white/20 focus:border-white/20 resize-none text-sm"
          placeholder={`Enter concept for ${label}...`}
          value={value.text || ''}
          onChange={handleTextChange}
          disabled={disabled}
        />

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        {/* Empty State */}
        {!value.text && !imagePreview && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <FileText className="text-gray-400 dark:text-gray-600 w-16 h-16" />
          </div>
        )}
      </Card2035Content>
    </Card2035>
  )
}
