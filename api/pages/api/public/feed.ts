import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '../../../lib/rateLimit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Public API rate limits (stricter)
const PUBLIC_API_LIMITS = {
  feed: { requests: 100, window: 15 * 60 * 1000 }, // 100 req per 15 min
  user: { requests: 50, window: 15 * 60 * 1000 },
  default: { requests: 200, window: 15 * 60 * 1000 }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Public API - requires API key
  const apiKey = req.headers['x-api-key'] as string;
  if (!apiKey || apiKey !== process.env.PUBLIC_API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  // Rate limiting for public API
  const rateLimitResult = await rateLimit(req, 'general', PUBLIC_API_LIMITS.feed);
  if (!rateLimitResult.success) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      retryAfter: rateLimitResult.retryAfter
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Public feed API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

// GET /api/public/feed
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { limit = '20', offset = '0', type, user_id } = req.query;

  const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100); // Max 100
  const offsetNum = parseInt(offset as string, 10) || 0;

  let query = supabase
    .from('feed_items')
    .select(`
      id,
      type,
      title,
      description,
      content,
      media_urls,
      user:users!feed_items_user_id_fkey(id, name, avatar),
      created_at,
      updated_at
    `)
    .eq('status', 'published') // Only published items
    .order('created_at', { ascending: false })
    .range(offsetNum, offsetNum + limitNum - 1);

  if (type) {
    query = query.eq('type', type as string);
  }

  if (user_id) {
    query = query.eq('user_id', user_id as string);
  }

  const { data: items, error, count } = await query;

  if (error) {
    throw error;
  }

  return res.status(200).json({
    items: items || [],
    pagination: {
      limit: limitNum,
      offset: offsetNum,
      total: count || 0,
      hasMore: (count || 0) > offsetNum + limitNum
    }
  });
}
