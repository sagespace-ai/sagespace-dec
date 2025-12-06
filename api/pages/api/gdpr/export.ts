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

  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Export all user data
    const exportData = await exportUserData(user.id);

    // Log the export
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'gdpr.data_exported',
        resource_type: 'user',
        resource_id: user.id,
        details: {}
      });

    return res.status(200).json(exportData);
  } catch (error: any) {
    console.error('GDPR export error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function exportUserData(userId: string) {
  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  // Get auth user data
  const { data: authUser } = await supabase.auth.admin.getUserById(userId);

  // Get feed items
  const { data: feedItems } = await supabase
    .from('feed_items')
    .select('*')
    .eq('user_id', userId);

  // Get comments
  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('user_id', userId);

  // Get collections
  const { data: collections } = await supabase
    .from('collections')
    .select('*')
    .eq('user_id', userId);

  // Get conversations
  const { data: conversations } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId);

  // Get purchases
  const { data: purchases } = await supabase
    .from('purchases')
    .select('*')
    .eq('user_id', userId);

  // Get follows
  const { data: follows } = await supabase
    .from('follows')
    .select('*')
    .or(`follower_id.eq.${userId},following_id.eq.${userId}`);

  // Get organization memberships
  const { data: orgMemberships } = await supabase
    .from('organization_members')
    .select('*')
    .eq('user_id', userId);

  return {
    export_date: new Date().toISOString(),
    user: {
      profile,
      auth: {
        id: authUser?.user?.id,
        email: authUser?.user?.email,
        created_at: authUser?.user?.created_at
      }
    },
    content: {
      feed_items: feedItems || [],
      comments: comments || [],
      collections: collections || []
    },
    interactions: {
      conversations: conversations || [],
      purchases: purchases || [],
      follows: follows || []
    },
    organizations: {
      memberships: orgMemberships || []
    }
  };
}
