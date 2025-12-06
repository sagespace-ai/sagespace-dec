/**
 * GET /api/sages - Get user's sages
 * POST /api/sages - Create a new sage
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseAdmin, getAuthenticatedUser } from '@/lib/supabase'
import { ApiResponse, Sage } from '@/lib/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Sage | Sage[]>>
) {
  // Get auth token from Authorization header
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '') || null

  // Get authenticated user
  const user = await getAuthenticatedUser(token)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabase = createSupabaseAdmin()

  if (req.method === 'GET') {
    // Get all sages for the user
    const { data, error } = await supabase
      .from('sages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ data: data as Sage[] })
  }

  if (req.method === 'POST') {
    // Create a new sage
    const { name, role, description, avatar, memory, autonomy, data_access, color } = req.body

    // Validate required fields
    if (!name || !role || !description || !avatar || !memory || !autonomy || !data_access || !color) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Validate enum values
    const validMemory = ['local', 'cross-session', 'global'].includes(memory)
    const validAutonomy = ['advisory', 'semi-autonomous', 'autonomous'].includes(autonomy)

    if (!validMemory || !validAutonomy) {
      return res.status(400).json({ error: 'Invalid enum values' })
    }

    const { data, error } = await supabase
      .from('sages')
      .insert({
        user_id: user.id,
        name,
        role,
        description,
        avatar,
        memory,
        autonomy,
        data_access: data_access,
        color,
        active: true,
      })
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(201).json({
      data: data as Sage,
      message: 'Sage created successfully',
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
