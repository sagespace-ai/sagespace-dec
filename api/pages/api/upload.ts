/**
 * POST /api/upload - Upload media files to Supabase Storage
 * 
 * Handles file uploads for images, videos, and other media
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseAdmin, getAuthenticatedUser } from '../../lib/supabase'
import { ApiResponse } from '../../lib/types'

interface UploadResponse {
  urls: string[]
  fileNames: string[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<UploadResponse>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '') || null
  const user = await getAuthenticatedUser(token)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const supabase = createSupabaseAdmin()

    // Get files from request body (expecting base64 encoded files)
    const { files } = req.body

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' })
    }

    const urls: string[] = []
    const fileNames: string[] = []

    for (const file of files) {
      if (!file.data || !file.name || !file.type) {
        continue
      }

      // Decode base64 data
      const buffer = Buffer.from(file.data, 'base64')

      // Generate unique filename
      const ext = file.name.split('.').pop() || ''
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      const filePath = `${user.id}/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        continue
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath)

      if (urlData?.publicUrl) {
        urls.push(urlData.publicUrl)
        fileNames.push(fileName)
      }
    }

    if (urls.length === 0) {
      return res.status(500).json({ error: 'Failed to upload files' })
    }

    return res.status(200).json({
      data: {
        urls,
        fileNames,
      },
      message: 'Files uploaded successfully',
    })
  } catch (error: any) {
    console.error('[Upload API] Error:', error)
    return res.status(500).json({
      error: error.message || 'Failed to upload files',
    })
  }
}
