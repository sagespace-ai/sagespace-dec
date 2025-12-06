import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '../../../lib/rateLimit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const rateLimitResult = await rateLimit(req, 'general');
  if (!rateLimitResult.success) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Check admin access
  const isAdmin = await checkAdminAccess(user.id);
  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'PUT':
        return await handlePut(req, res, user.id);
      case 'DELETE':
        return await handleDelete(req, res, user.id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Admin users API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

// GET /api/admin/users
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, search, page = '1', limit = '50' } = req.query;

  if (id) {
    // Get specific user
    const { data: user, error } = await supabase.auth.admin.getUserById(id as string);
    if (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', id as string)
      .single();

    // Get stats
    const { count: postsCount } = await supabase
      .from('feed_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id as string);

    const { count: followersCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', id as string);

    return res.status(200).json({
      ...user,
      profile,
      stats: {
        posts: postsCount || 0,
        followers: followersCount || 0
      }
    });
  }

  // List users with pagination
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;

  let query = supabase
    .from('users')
    .select('*', { count: 'exact' })
    .range(offset, offset + limitNum - 1)
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data: users, error, count } = await query;

  if (error) {
    throw error;
  }

  return res.status(200).json({
    users: users || [],
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: count || 0,
      pages: Math.ceil((count || 0) / limitNum)
    }
  });
}

// PUT /api/admin/users
async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  adminUserId: string
) {
  const { id, ...updates } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Update user in auth
  if (updates.email || updates.password) {
    const { error: authError } = await supabase.auth.admin.updateUserById(id, {
      email: updates.email,
      password: updates.password
    });
    if (authError) {
      throw authError;
    }
    delete updates.email;
    delete updates.password;
  }

  // Update user profile
  if (Object.keys(updates).length > 0) {
    const { data: updated, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log action
    await logAuditAction(adminUserId, 'user.updated', 'user', id, { updates });

    return res.status(200).json(updated);
  }

  return res.status(200).json({ success: true });
}

// DELETE /api/admin/users?id=xxx
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  adminUserId: string
) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Delete user (cascade will handle related data)
  const { error } = await supabase.auth.admin.deleteUser(id as string);

  if (error) {
    throw error;
  }

  // Log action
  await logAuditAction(adminUserId, 'user.deleted', 'user', id as string, {});

  return res.status(200).json({ success: true });
}

// Helper functions
async function checkAdminAccess(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', userId)
    .single();

  return !!data;
}

async function logAuditAction(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  details: Record<string, any>
) {
  await supabase
    .from('audit_logs')
    .insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details
    });
}
