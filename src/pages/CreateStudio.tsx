import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Undo2, Redo2, Send, RefreshCw, Calendar } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { Button2035 } from '../components/ui/Button2035'
import { Card2035, Card2035Header, Card2035Title, Card2035Content } from '../components/ui/Card2035'
import { Input2035 } from '../components/ui/Input2035'
import { BackButton } from '../components/navigation/BackButton'
import { WhatsNext, getContextualNextActions } from '../components/ui/WhatsNext'
import { FadeIn } from '../components/motion/FadeIn'
import { RichTextEditor } from '../components/editor/RichTextEditor'
import { MediaUpload } from '../components/upload/MediaUpload'
import Layout from '../components/Layout'
import { apiService } from '../services/api'
import { useUIStore } from '../store/uiStore'
import { useQueryClient } from '@tanstack/react-query'

type MediaType = 'image' | 'video' | 'audio' | 'text' | 'simulation'

export default function CreateStudio() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const { setActivation } = useUIStore()
  const queryClient = useQueryClient()
  const [selectedType, setSelectedType] = useState<MediaType>('image')
  const [creativity, setCreativity] = useState(75)
  const [fidelity, setFidelity] = useState(50)
  const [prompt, setPrompt] = useState('')
  const [description, setDescription] = useState('')
  const [_uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [_uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<string>('')
  const [scheduledTime, setScheduledTime] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<{
    contentUrl?: string
    thumbnail?: string
    text?: string
  } | null>(null)
  const [showWhatsNext, setShowWhatsNext] = useState(false)

  const mediaTypes: { id: MediaType; label: string; icon: string }[] = [
    { id: 'image', label: 'Image', icon: 'image' },
    { id: 'video', label: 'Video', icon: 'videocam' },
    { id: 'audio', label: 'Audio', icon: 'graphic_eq' },
    { id: 'text', label: 'Text', icon: 'article' },
    { id: 'simulation', label: 'Simulation', icon: 'view_in_ar' },
  ]

  const handleFileUpload = async (files: File[]) => {
    setUploadedFiles(files)
    setIsUploading(true)

    try {
      const { data, error } = await apiService.uploadFiles(files)
      if (error || !data) {
        throw new Error(error || 'Failed to upload files')
      }
      setUploadedUrls(data.urls)
      showToast('Files uploaded successfully', 'success')
    } catch (error: any) {
      console.error('Upload error:', error)
      showToast(error.message || 'Failed to upload files', 'error')
      setUploadedFiles([])
    } finally {
      setIsUploading(false)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('Please enter a description', 'warning')
      return
    }

    setIsGenerating(true)
    setGeneratedContent(null)

    try {
      // Check if content should be scheduled
      const shouldSchedule = scheduledDate && scheduledTime
      const scheduledAt = shouldSchedule
        ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
        : undefined

      // Call create API with generation
      const { data, error } = await apiService.createCreation({
        prompt,
        type: selectedType,
        creativity,
        fidelity,
        title: prompt.substring(0, 50),
      })

      if (error || !data) {
        throw new Error(error || 'Failed to generate content')
      }

      // Store generated content
      if (data.generatedContent) {
        setGeneratedContent(data.generatedContent)
      }

      // Track activation
      setActivation({ createCompleted: true })

      // Invalidate feed query to show new item
      queryClient.invalidateQueries({ queryKey: ['feed'] })

      if (shouldSchedule) {
        showToast(`Content scheduled for ${new Date(scheduledAt!).toLocaleString()}`, 'success')
      } else {
        showToast(`${selectedType} generated successfully!`, 'success')
      }
      setHasGenerated(true)
      setShowWhatsNext(true)
    } catch (error: any) {
      console.error('Generation error:', error)
      showToast(error.message || 'Failed to generate content', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRemix = () => {
    if (generatedContent?.contentUrl || generatedContent?.text) {
      navigate('/remix', {
        state: {
          inputA: {
            text: generatedContent.text || prompt,
            imageUrl: generatedContent.contentUrl,
          },
        },
      })
    } else {
      navigate('/remix')
    }
  }

  // Keyboard shortcut: Ctrl/Cmd + Enter to generate
  useKeyboardShortcut(['mod', 'Enter'], handleGenerate, !isGenerating)

  return (
    <Layout>
      <main id="main-content" className="flex-1 flex flex-col overflow-auto" role="main">
        <header className="flex-shrink-0 flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800 bg-background-light dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Creation Studio</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button2035 variant="primary" size="sm" onClick={() => navigate('/home')}>
              <Send className="h-4 w-4 mr-2" />
              Post
            </Button2035>
            <button 
              className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              aria-label="More options"
            >
              <span className="material-icons-outlined" aria-hidden="true">more_vert</span>
            </button>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
            {/* Preview Area */}
            <div className="flex-1 flex items-center justify-center bg-gray-200/50 dark:bg-gray-900 rounded-lg mb-6 relative overflow-hidden min-h-[400px]">
              {isGenerating ? (
                <div className="text-center p-8">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-gray-500 dark:text-gray-400">
                    Generating your {selectedType}...
                  </p>
                </div>
              ) : generatedContent?.contentUrl ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img
                    src={generatedContent.contentUrl}
                    alt="Generated content"
                    className="max-w-full max-h-full rounded-lg shadow-lg object-contain"
                  />
                </div>
              ) : generatedContent?.text ? (
                <div className="w-full h-full flex items-center justify-center p-8">
                  <div className="max-w-2xl bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                      {generatedContent.text}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <span className="material-icons-outlined text-5xl text-gray-400 dark:text-gray-600">
                    auto_awesome
                  </span>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Your creation will appear here
                  </p>
                </div>
              )}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button 
                  className="bg-background-light dark:bg-background-dark p-2 rounded-full shadow-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                  aria-label="Undo"
                >
                  <Undo2 className="h-5 w-5" aria-hidden="true" />
                </button>
                <button 
                  className="bg-background-light dark:bg-background-dark p-2 rounded-full shadow-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                  aria-label="Redo"
                >
                  <Redo2 className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              {/* Prompt Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prompt
                </label>
                <div className="relative">
                  <Input2035
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe what you want to create..."
                    className="pr-24"
                  />
                  <Button2035
                    variant="primary"
                    size="sm"
                    onClick={handleGenerate}
                    disabled={isGenerating || isUploading}
                    className="absolute top-1/2 right-2 -translate-y-1/2"
                  >
                    {isGenerating ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Generating...
                      </>
                    ) : (
                      'Generate'
                    )}
                  </Button2035>
                </div>
              </div>

              {/* Rich Text Description */}
              <div className="mb-4">
                <label htmlFor="description-editor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Add a detailed description with formatting..."
                  minHeight="120px"
                />
              </div>

              {/* Media Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Media Files (Optional)
                </label>
                <MediaUpload
                  onUpload={handleFileUpload}
                  accept="image/*,video/*"
                  maxSize={10}
                  maxFiles={5}
                />
              </div>

              {/* Scheduling */}
              <div className="mb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Schedule Post (Optional)
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Date
                    </label>
                    <Input2035
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Time
                    </label>
                    <Input2035
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>
                {scheduledDate && scheduledTime && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Scheduled for: {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}
                  </p>
                )}
              </div>


              {/* Media Type Selection */}
              <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {mediaTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      aria-pressed={selectedType === type.id}
                      aria-label={`Select ${type.label} type`}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedType === type.id
                          ? 'bg-primary/10 text-primary'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span className="material-icons-outlined text-base" aria-hidden="true">{type.icon}</span>
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>

                {/* Sliders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <label
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2"
                      htmlFor="creativity"
                    >
                      Creativity: {creativity}%
                    </label>
                    <input
                      id="creativity"
                      type="range"
                      min="0"
                      max="100"
                      value={creativity}
                      onChange={e => setCreativity(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                  <div>
                    <label
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2"
                      htmlFor="fidelity"
                    >
                      Prompt Fidelity: {fidelity}%
                    </label>
                    <input
                      id="fidelity"
                      type="range"
                      min="0"
                      max="100"
                      value={fidelity}
                      onChange={e => setFidelity(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next Suggestions */}
          {showWhatsNext && hasGenerated && (
            <div className="mt-6">
              <WhatsNext
                actions={getContextualNextActions(location.pathname, navigate)}
                className="mb-6"
              />
            </div>
          )}
        </div>

        {/* Success Modal */}
        {hasGenerated && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setHasGenerated(false)}>
            <FadeIn>
              <Card2035 className="max-w-lg w-[90%] md:w-full" onClick={(e) => e.stopPropagation()}>
                <Card2035Header>
                  <Card2035Title>✨ Creation Complete!</Card2035Title>
                </Card2035Header>
                <Card2035Content>
                  <div className="text-center py-4">
                    <div className="text-6xl mb-4">🎉</div>
                    <p className="text-gray-600 dark:text-gray-300 mb-2 text-lg font-medium">
                      Your {selectedType} is being processed
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      It will appear in your feed shortly.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button2035
                        variant="primary"
                        size="md"
                        onClick={() => navigate('/home')}
                        className="flex-1"
                      >
                        View in Feed
                      </Button2035>
                      <Button2035
                        variant="secondary"
                        size="md"
                        onClick={handleRemix}
                        className="flex-1"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Remix This
                      </Button2035>
                      <Button2035
                        variant="ghost"
                        size="md"
                        onClick={() => {
                          setHasGenerated(false)
                          setPrompt('')
                        }}
                        className="flex-1"
                      >
                        Create Another
                      </Button2035>
                    </div>
                  </div>
                </Card2035Content>
              </Card2035>
            </FadeIn>
          </div>
        )}
      </main>
    </Layout>
  )
}
