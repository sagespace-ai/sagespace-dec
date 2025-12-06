/**
 * GET /api/me - Get current user profile
 * PATCH /api/me - Update current user profile
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseAdmin, getAuthenticatedUser } from '@/lib/supabase'
import { ApiResponse, User } from '@/lib/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<User>>
) {
  // Basic CORS handling to allow requests from sagespace.co
  const origin = req.headers.origin
  const allowedOrigins = [
    'https://sagespace.co',
    'https://www.sagespace.co',
  ]

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,PATCH,OPTIONS'
  )
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

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
    // Get user profile
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      // If user doesn't exist in users table, create it
      if (error.code === 'PGRST116') {
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            name: user.email?.split('@')[0] || 'User',
            email: user.email || '',
          })
          .select()
          .single()

        if (insertError) {
          return res.status(500).json({ error: insertError.message })
        }

        return res.status(200).json({
          data: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            avatar: newUser.avatar,
            created_at: newUser.created_at,
            updated_at: newUser.updated_at,
          },
        })
      }

      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({
      data: {
        id: data.id,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
    })
  }

  if (req.method === 'PATCH') {
    // Update user profile
    const { name, avatar } = req.body

    const updateData: Partial<User> = {}
    if (name !== undefined) updateData.name = name
    if (avatar !== undefined) updateData.avatar = avatar

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({
      data: {
        id: data.id,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
      message: 'Profile updated successfully',
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
