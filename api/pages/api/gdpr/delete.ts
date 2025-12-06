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
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { confirm } = req.body;
    if (confirm !== 'DELETE_MY_ACCOUNT') {
      return res.status(400).json({ error: 'Confirmation required' });
    }

    // Log the deletion request
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'gdpr.account_deletion_requested',
        resource_type: 'user',
        resource_id: user.id,
        details: {}
      });

    // Delete user account (cascade will handle related data)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      throw deleteError;
    }

    return res.status(200).json({ 
      success: true,
      message: 'Account deleted successfully' 
    });
  } catch (error: any) {
    console.error('GDPR delete error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
