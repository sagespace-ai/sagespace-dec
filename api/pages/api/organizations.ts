import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '../../lib/rateLimit';
import { captureException, logAuthFailure } from '../../lib/monitoring';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  owner_id: string;
  plan: 'free' | 'pro' | 'enterprise';
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'member' | 'viewer';
  invited_by?: string;
  invited_at?: string;
  joined_at: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Rate limiting
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
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, user.id);
      case 'POST':
        return await handlePost(req, res, user.id);
      case 'PUT':
        return await handlePut(req, res, user.id);
      case 'DELETE':
        return await handleDelete(req, res, user.id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Organizations API error:', error);
    captureException(error, {
      feature: 'content',
      userId: user?.id,
      endpoint: '/api/organizations',
      metadata: { method: req.method },
    });
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

// GET /api/organizations
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { id, slug } = req.query;

  if (id) {
    // Get specific organization
    const { data: org, error } = await supabase
      .from('organizations')
      .select(`
        *,
        owner:users!organizations_owner_id_fkey(id, name, email, avatar),
        members:organization_members(
          id,
          role,
          user:users!organization_members_user_id_fkey(id, name, email, avatar),
          joined_at
        )
      `)
      .eq('id', id as string)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check if user has access
    const isMember = org.owner_id === userId || 
      org.members.some((m: any) => m.user.id === userId);
    
    if (!isMember) {
      logAuthFailure(user.id, '/api/organizations', 'Not a member of organization');
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.status(200).json(org);
  }

  if (slug) {
    // Get by slug
    const { data: org, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug as string)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    return res.status(200).json(org);
  }

  // Get user's organizations
  const { data: orgs, error } = await supabase
    .from('organizations')
    .select(`
      *,
      members:organization_members!inner(
        role,
        user_id
      )
    `)
    .or(`owner_id.eq.${userId},members.user_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return res.status(200).json(orgs || []);
}

// POST /api/organizations
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { name, slug, description, logo_url, plan } = req.body;

  if (!name || !slug) {
    return res.status(400).json({ error: 'Name and slug are required' });
  }

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ error: 'Slug must contain only lowercase letters, numbers, and hyphens' });
  }

  // Check if slug is taken
  const { data: existing } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existing) {
    return res.status(409).json({ error: 'Slug already taken' });
  }

  // Create organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name,
      slug,
      description,
      logo_url,
      owner_id: userId,
      plan: plan || 'free',
      settings: {}
    })
    .select()
    .single();

  if (orgError) {
    throw orgError;
  }

  // Add owner as organization member
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({
      organization_id: org.id,
      user_id: userId,
      role: 'owner',
      joined_at: new Date().toISOString()
    });

  if (memberError) {
    // Rollback organization creation
    await supabase.from('organizations').delete().eq('id', org.id);
    throw memberError;
  }

  return res.status(201).json(org);
}

// PUT /api/organizations
async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { id, ...updates } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Organization ID is required' });
  }

  // Check permissions
  const { data: org } = await supabase
    .from('organizations')
    .select('owner_id')
    .eq('id', id)
    .single();

  if (!org) {
    return res.status(404).json({ error: 'Organization not found' });
  }

  // Check if user is owner or admin
  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', id)
    .eq('user_id', userId)
    .single();

  const canUpdate = org.owner_id === userId || 
    (member && ['owner', 'admin'].includes(member.role));

  if (!canUpdate) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  // Update organization
  const { data: updated, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return res.status(200).json(updated);
}

// DELETE /api/organizations
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Organization ID is required' });
  }

  // Check if user is owner
  const { data: org } = await supabase
    .from('organizations')
    .select('owner_id')
    .eq('id', id as string)
    .single();

  if (!org) {
    return res.status(404).json({ error: 'Organization not found' });
  }

  if (org.owner_id !== userId) {
    return res.status(403).json({ error: 'Only the owner can delete the organization' });
  }

  // Delete organization (cascade will handle members, workspaces, etc.)
  const { error } = await supabase
    .from('organizations')
    .delete()
    .eq('id', id as string);

  if (error) {
    throw error;
  }

  return res.status(200).json({ success: true });
}
