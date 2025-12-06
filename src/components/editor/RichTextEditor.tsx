import { useRef, useEffect } from 'react'
import { Bold, Italic, Underline, List, Link, Image as ImageIcon } from 'lucide-react'
import { Button2035 } from '../ui/Button2035'
import { sanitizeHtml } from '../../utils/validation'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  className = '',
  minHeight = '200px',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isComposingRef = useRef(false)

  useEffect(() => {
    if (editorRef.current) {
      const currentValue = editorRef.current.innerHTML || ''
      const newValue = value || ''
      // Only update if the value changed externally and is different
      // Sanitize HTML to prevent XSS
      if (currentValue !== newValue) {
        try {
          editorRef.current.innerHTML = sanitizeHtml(newValue)
        } catch (error) {
          // Fallback: use textContent if sanitization fails
          console.warn('HTML sanitization failed, using textContent:', error)
          editorRef.current.textContent = newValue
        }
      }
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current && !isComposingRef.current) {
      try {
        // Sanitize HTML before passing to onChange
        const sanitized = sanitizeHtml(editorRef.current.innerHTML)
        onChange(sanitized)
      } catch (error) {
        // Fallback: use textContent if sanitization fails
        console.warn('HTML sanitization failed in handleInput:', error)
        if (editorRef.current) {
          onChange(editorRef.current.textContent || '')
        }
      }
    }
  }

  const handleCompositionStart = () => {
    isComposingRef.current = true
  }

  const handleCompositionEnd = () => {
    isComposingRef.current = false
    if (editorRef.current) {
      try {
        // Sanitize HTML before passing to onChange
        const sanitized = sanitizeHtml(editorRef.current.innerHTML)
        onChange(sanitized)
      } catch (error) {
        // Fallback: use textContent if sanitization fails
        console.warn('HTML sanitization failed in handleCompositionEnd:', error)
        if (editorRef.current) {
          onChange(editorRef.current.textContent || '')
        }
      }
    }
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  const insertLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      // Validate URL to prevent javascript: protocol
      try {
        const urlObj = new URL(url)
        if (urlObj.protocol === 'javascript:') {
          alert('Invalid URL: JavaScript protocol is not allowed')
          return
        }
        execCommand('createLink', url)
      } catch {
        // If URL parsing fails, try with http:// prefix
        try {
          const urlObj = new URL(`http://${url}`)
          execCommand('createLink', urlObj.href)
        } catch {
          alert('Please enter a valid URL')
        }
      }
    }
  }

  const insertImage = () => {
    const url = prompt('Enter image URL:')
    if (url) {
      // Validate URL to prevent javascript: protocol
      try {
        const urlObj = new URL(url)
        if (urlObj.protocol === 'javascript:') {
          alert('Invalid URL: JavaScript protocol is not allowed')
          return
        }
        execCommand('insertImage', url)
      } catch {
        // If URL parsing fails, try with http:// prefix
        try {
          const urlObj = new URL(`http://${url}`)
          execCommand('insertImage', urlObj.href)
        } catch {
          alert('Please enter a valid URL')
        }
      }
    }
  }

  return (
    <div className={`border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700">
        <Button2035
          variant="ghost"
          size="sm"
          onClick={() => execCommand('bold')}
          className="p-1"
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button2035>
        <Button2035
          variant="ghost"
          size="sm"
          onClick={() => execCommand('italic')}
          className="p-1"
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button2035>
        <Button2035
          variant="ghost"
          size="sm"
          onClick={() => execCommand('underline')}
          className="p-1"
          aria-label="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button2035>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
        <Button2035
          variant="ghost"
          size="sm"
          onClick={() => execCommand('insertUnorderedList')}
          className="p-1"
          aria-label="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button2035>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
        <Button2035
          variant="ghost"
          size="sm"
          onClick={insertLink}
          className="p-1"
          aria-label="Insert Link"
        >
          <Link className="h-4 w-4" />
        </Button2035>
        <Button2035
          variant="ghost"
          size="sm"
          onClick={insertImage}
          className="p-1"
          aria-label="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button2035>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        className="p-4 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none overflow-y-auto"
        style={{ minHeight }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contenteditable] {
          outline: none;
        }
        [contenteditable] img {
          max-width: 100%;
          height: auto;
        }
        [contenteditable] a {
          color: #6366f1;
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
