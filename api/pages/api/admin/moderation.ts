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
      case 'POST':
        return await handlePost(req, res, user.id);
      case 'PUT':
        return await handlePut(req, res, user.id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Admin moderation API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

// GET /api/admin/moderation?status=pending&resource_type=feed_item
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { status, resource_type, page = '1', limit = '50' } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;

  let query = supabase
    .from('content_moderation')
    .select('*', { count: 'exact' })
    .range(offset, offset + limitNum - 1)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status as string);
  }

  if (resource_type) {
    query = query.eq('resource_type', resource_type as string);
  }

  const { data: records, error, count } = await query;

  if (error) {
    throw error;
  }

  // Fetch actual resource data
  const enrichedRecords = await Promise.all(
    (records || []).map(async (record) => {
      let resource = null;
      
      if (record.resource_type === 'feed_item') {
        const { data } = await supabase
          .from('feed_items')
          .select('*')
          .eq('id', record.resource_id)
          .single();
        resource = data;
      } else if (record.resource_type === 'comment') {
        const { data } = await supabase
          .from('comments')
          .select('*')
          .eq('id', record.resource_id)
          .single();
        resource = data;
      }

      return {
        ...record,
        resource
      };
    })
  );

  return res.status(200).json({
    records: enrichedRecords,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: count || 0,
      pages: Math.ceil((count || 0) / limitNum)
    }
  });
}

// POST /api/admin/moderation (create moderation record)
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  adminUserId: string
) {
  const { resource_type, resource_id, status, reason, moderation_notes } = req.body;

  if (!resource_type || !resource_id || !status) {
    return res.status(400).json({ error: 'Resource type, ID, and status are required' });
  }

  // Create or update moderation record
  const { data: record, error } = await supabase
    .from('content_moderation')
    .upsert({
      resource_type,
      resource_id,
      status,
      reason,
      moderation_notes,
      moderated_by: adminUserId
    }, {
      onConflict: 'resource_type,resource_id'
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  // If rejected, optionally hide/delete the resource
  if (status === 'rejected') {
    // Implementation depends on resource type
    // For now, we just mark it - actual hiding can be done in queries
  }

  // Log action
  await logAuditAction(adminUserId, 'content.moderated', resource_type, resource_id, {
    status,
    reason
  });

  return res.status(201).json(record);
}

// PUT /api/admin/moderation (update moderation record)
async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  adminUserId: string
) {
  const { id, status, reason, moderation_notes } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Moderation record ID is required' });
  }

  // Get existing record
  const { data: existing } = await supabase
    .from('content_moderation')
    .select('*')
    .eq('id', id)
    .single();

  if (!existing) {
    return res.status(404).json({ error: 'Moderation record not found' });
  }

  // Update record
  const { data: updated, error } = await supabase
    .from('content_moderation')
    .update({
      status,
      reason,
      moderation_notes,
      moderated_by: adminUserId
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Log action
  await logAuditAction(adminUserId, 'content.moderated', existing.resource_type, existing.resource_id, {
    status,
    reason,
    previous_status: existing.status
  });

  return res.status(200).json(updated);
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
