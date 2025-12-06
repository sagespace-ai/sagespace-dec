/**
 * Multimodal action utilities for the playground
 * These functions handle image upload, code editing, audio recording, and quest creation
 */

export interface ImageUploadResult {
  url: string
  file: File
}

export interface CodeEditorResult {
  code: string
  language: string
}

export interface AudioRecordingResult {
  blob: Blob
  url: string
}

export interface QuestCreationResult {
  title: string
  description: string
  goal: string
  rewardXp?: number
  duration?: number
}

/**
 * Upload an image file
 * @param file - The image file to upload
 * @returns Promise with upload URL
 */
export async function uploadImage(file: File): Promise<ImageUploadResult> {
  try {
    // Check if API endpoint exists
    const response = await fetch("/api/images/upload", {
      method: "POST",
      body: (() => {
        const formData = new FormData()
        formData.append("image", file)
        return formData
      })(),
    })

    if (response.ok) {
      const data = await response.json()
      return {
        url: data.url || data.data?.url || URL.createObjectURL(file),
        file,
      }
    } else {
      console.warn("[multimodal] Image upload API not available, using object URL")
      // Fallback: create object URL for preview
      return {
        url: URL.createObjectURL(file),
        file,
      }
    }
  } catch (error) {
    console.warn("[multimodal] Image upload failed:", error)
    // Fallback: create object URL for preview
    return {
      url: URL.createObjectURL(file),
      file,
    }
  }
}

/**
 * Generate an image from a prompt
 * @param prompt - The image generation prompt
 * @returns Promise with generated image URL
 */
export async function generateImage(prompt: string): Promise<string> {
  try {
    const response = await fetch("/api/images/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    })

    if (response.ok) {
      const data = await response.json()
      return data.url || data.data?.url || ""
    } else {
      console.warn("[multimodal] Image generation API not available")
      return ""
    }
  } catch (error) {
    console.warn("[multimodal] Image generation failed:", error)
    return ""
  }
}

/**
 * Start audio recording
 * @returns Promise with MediaRecorder and stream
 */
export async function startAudioRecording(): Promise<{
  recorder: MediaRecorder
  stream: MediaStream
}> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    return { recorder, stream }
  } catch (error) {
    console.error("[multimodal] Failed to start audio recording:", error)
    throw new Error("Could not access microphone. Please check permissions.")
  }
}

/**
 * Stop audio recording and get blob
 * @param recorder - The MediaRecorder instance
 * @param stream - The MediaStream instance
 * @returns Promise with audio blob and URL
 */
export async function stopAudioRecording(
  recorder: MediaRecorder,
  stream: MediaStream,
): Promise<AudioRecordingResult> {
  return new Promise((resolve, reject) => {
    const chunks: Blob[] = []

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    recorder.onstop = async () => {
      stream.getTracks().forEach((track) => track.stop())
      const blob = new Blob(chunks, { type: "audio/webm" })
      const url = URL.createObjectURL(blob)

      // Try to upload
      try {
        const formData = new FormData()
        formData.append("audio", blob, "recording.webm")

        const response = await fetch("/api/audio/upload", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          resolve({
            blob,
            url: data.url || data.data?.url || url,
          })
        } else {
          // Fallback to object URL
          resolve({ blob, url })
        }
      } catch (error) {
        console.warn("[multimodal] Audio upload failed, using object URL:", error)
        resolve({ blob, url })
      }
    }

    recorder.onerror = (error) => {
      reject(error)
    }

    if (recorder.state === "recording") {
      recorder.stop()
    } else {
      reject(new Error("Recorder is not recording"))
    }
  })
}

/**
 * Upload audio blob
 * @param blob - The audio blob to upload
 * @returns Promise with upload URL
 */
export async function uploadAudio(blob: Blob): Promise<string> {
  try {
    const formData = new FormData()
    formData.append("audio", blob, "recording.webm")

    const response = await fetch("/api/audio/upload", {
      method: "POST",
      body: formData,
    })

    if (response.ok) {
      const data = await response.json()
      return data.url || data.data?.url || URL.createObjectURL(blob)
    } else {
      console.warn("[multimodal] Audio upload API not available")
      return URL.createObjectURL(blob)
    }
  } catch (error) {
    console.warn("[multimodal] Audio upload failed:", error)
    return URL.createObjectURL(blob)
  }
}

/**
 * Create a quest
 * @param questData - Quest creation data
 * @returns Promise with created quest ID
 */
export async function createQuest(questData: QuestCreationResult): Promise<string> {
  try {
    const response = await fetch("/api/quests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(questData),
    })

    if (response.ok) {
      const data = await response.json()
      return data.id || data.data?.id || `quest-${Date.now()}`
    } else {
      console.warn("[multimodal] Quest creation API not available")
      return `quest-${Date.now()}`
    }
  } catch (error) {
    console.warn("[multimodal] Quest creation failed:", error)
    return `quest-${Date.now()}`
  }
}

