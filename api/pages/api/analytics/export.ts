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

    const { format = 'json', timeRange = '30d' } = req.query;

    // Get analytics data
    const analyticsData = await getAnalyticsData(user.id, timeRange as string);

    // Format based on requested format
    if (format === 'csv') {
      const csv = convertToCSV(analyticsData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${Date.now()}.csv"`);
      return res.status(200).send(csv);
    } else if (format === 'xlsx') {
      // For Excel, we'd need a library like exceljs
      // For now, return JSON with instructions
      return res.status(200).json({
        message: 'Excel export requires additional setup',
        data: analyticsData
      });
    }

    return res.status(200).json(analyticsData);
  } catch (error: any) {
    console.error('Analytics export error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function getAnalyticsData(userId: string, timeRange: string) {
  const now = new Date();
  let startDate: Date;

  switch (timeRange) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(0); // All time
  }

  // Get feed items
  const { data: feedItems } = await supabase
    .from('feed_items')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString());

  // Get interactions
  const { data: interactions } = await supabase
    .from('feed_interactions')
    .select('*')
    .in('feed_item_id', feedItems?.map(item => item.id) || []);

  // Get comments
  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString());

  // Calculate metrics
  const metrics = {
    total_posts: feedItems?.length || 0,
    total_views: interactions?.filter(i => i.type === 'view').length || 0,
    total_likes: interactions?.filter(i => i.type === 'like').length || 0,
    total_comments: comments?.length || 0,
    total_shares: interactions?.filter(i => i.type === 'share').length || 0,
    avg_engagement: feedItems?.length 
      ? ((interactions?.length || 0) / feedItems.length).toFixed(2)
      : 0
  };

  // Daily breakdown
  const dailyData = generateDailyBreakdown(feedItems || [], interactions || [], startDate);

  return {
    timeRange,
    period: {
      start: startDate.toISOString(),
      end: now.toISOString()
    },
    metrics,
    dailyBreakdown: dailyData,
    topContent: feedItems
      ?.map(item => ({
        id: item.id,
        title: item.title,
        type: item.type,
        created_at: item.created_at,
        views: interactions?.filter(i => i.feed_item_id === item.id && i.type === 'view').length || 0,
        likes: interactions?.filter(i => i.feed_item_id === item.id && i.type === 'like').length || 0,
        comments: comments?.filter(c => c.feed_item_id === item.id).length || 0
      }))
      .sort((a, b) => (b.views + b.likes + b.comments) - (a.views + a.likes + a.comments))
      .slice(0, 10)
  };
}

function generateDailyBreakdown(feedItems: any[], interactions: any[], startDate: Date) {
  const dailyMap = new Map<string, { posts: number; views: number; likes: number; comments: number }>();
  
  const currentDate = new Date();
  const daysDiff = Math.ceil((currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));

  // Initialize all days
  for (let i = 0; i <= daysDiff; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateKey = date.toISOString().split('T')[0];
    dailyMap.set(dateKey, { posts: 0, views: 0, likes: 0, comments: 0 });
  }

  // Count feed items
  feedItems.forEach(item => {
    const dateKey = new Date(item.created_at).toISOString().split('T')[0];
    const day = dailyMap.get(dateKey);
    if (day) day.posts++;
  });

  // Count interactions
  interactions.forEach(interaction => {
    const dateKey = new Date(interaction.created_at).toISOString().split('T')[0];
    const day = dailyMap.get(dateKey);
    if (day) {
      if (interaction.type === 'view') day.views++;
      if (interaction.type === 'like') day.likes++;
    }
  });

  return Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    ...data
  }));
}

function convertToCSV(data: any): string {
  const lines: string[] = [];
  
  // Header
  lines.push('Analytics Export');
  lines.push(`Time Range: ${data.timeRange}`);
  lines.push(`Period: ${data.period.start} to ${data.period.end}`);
  lines.push('');
  
  // Metrics
  lines.push('Metrics');
  lines.push('Metric,Value');
  lines.push(`Total Posts,${data.metrics.total_posts}`);
  lines.push(`Total Views,${data.metrics.total_views}`);
  lines.push(`Total Likes,${data.metrics.total_likes}`);
  lines.push(`Total Comments,${data.metrics.total_comments}`);
  lines.push(`Total Shares,${data.metrics.total_shares}`);
  lines.push(`Avg Engagement,${data.metrics.avg_engagement}`);
  lines.push('');
  
  // Daily Breakdown
  lines.push('Daily Breakdown');
  lines.push('Date,Posts,Views,Likes,Comments');
  data.dailyBreakdown.forEach((day: any) => {
    lines.push(`${day.date},${day.posts},${day.views},${day.likes},${day.comments}`);
  });
  lines.push('');
  
  // Top Content
  lines.push('Top Content');
  lines.push('ID,Title,Type,Views,Likes,Comments,Created At');
  data.topContent.forEach((item: any) => {
    lines.push(`${item.id},"${item.title || ''}",${item.type},${item.views},${item.likes},${item.comments},${item.created_at}`);
  });
  
  return lines.join('\n');
}
