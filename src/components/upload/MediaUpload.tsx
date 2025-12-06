import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Video, File } from 'lucide-react'
import { Card2035, Card2035Content } from '../ui/Card2035'
import { useToast } from '../../contexts/ToastContext'

interface MediaUploadProps {
  onUpload: (files: File[]) => void
  accept?: string
  maxSize?: number // in MB
  maxFiles?: number
  className?: string
}

export function MediaUpload({
  onUpload,
  accept = 'image/*,video/*',
  maxSize = 10,
  maxFiles = 5,
  className = '',
}: MediaUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File "${file.name}" exceeds maximum size of ${maxSize}MB`
    }
    return null
  }

  const handleFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    const validFiles: File[] = []
    const errors: string[] = []

    fileArray.forEach((file) => {
      const error = validateFile(file)
      if (error) {
        errors.push(error)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      errors.forEach((error) => showToast(error, 'error'))
    }

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles].slice(0, maxFiles)
      setFiles(updatedFiles)
      onUpload(updatedFiles)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(updatedFiles)
    onUpload(updatedFiles)
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return ImageIcon
    if (file.type.startsWith('video/')) return Video
    return File
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-700'}
          ${files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'}
        `}
        onClick={() => files.length < maxFiles && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFileInput}
          className="hidden"
          disabled={files.length >= maxFiles || isUploading}
        />
        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
          {isDragging ? 'Drop files here' : 'Click or drag files to upload'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {accept.includes('image') && accept.includes('video')
            ? 'Images and videos'
            : accept.includes('image')
            ? 'Images only'
            : accept.includes('video')
            ? 'Videos only'
            : 'Files'}
          {' '}up to {maxSize}MB each
          {maxFiles > 1 && ` • Max ${maxFiles} files`}
        </p>
        {files.length > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {files.length} file{files.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => {
            const Icon = getFileIcon(file)
            const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null

            return (
              <Card2035 key={index}>
                <Card2035Content className="p-3">
                  <div className="flex items-center gap-3">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={file.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <Icon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(index)
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      aria-label="Remove file"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </Card2035Content>
              </Card2035>
            )
          })}
        </div>
      )}
    </div>
  )
}
