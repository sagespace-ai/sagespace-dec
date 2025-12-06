import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '../../lib/rateLimit';

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
    console.error('Workspaces API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

// GET /api/workspaces?organization_id=xxx
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { id, organization_id } = req.query;

  if (id) {
    // Get specific workspace
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', id as string)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Check access
    const hasAccess = await checkWorkspaceAccess(workspace.organization_id, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.status(200).json(workspace);
  }

  if (!organization_id) {
    return res.status(400).json({ error: 'Organization ID is required' });
  }

  // Check organization access
  const hasAccess = await checkOrganizationAccess(organization_id as string, userId);
  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Get all workspaces for organization
  const { data: workspaces, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('organization_id', organization_id as string)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return res.status(200).json(workspaces || []);
}

// POST /api/workspaces
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { organization_id, name, description } = req.body;

  if (!organization_id || !name) {
    return res.status(400).json({ error: 'Organization ID and name are required' });
  }

  // Check if user can create workspaces (editor+)
  const canCreate = await checkWorkspaceCreatePermission(organization_id, userId);
  if (!canCreate) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  // Create workspace
  const { data: workspace, error } = await supabase
    .from('workspaces')
    .insert({
      organization_id,
      name,
      description,
      created_by: userId
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return res.status(201).json(workspace);
}

// PUT /api/workspaces
async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { id, ...updates } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Workspace ID is required' });
  }

  // Get workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('organization_id')
    .eq('id', id)
    .single();

  if (!workspace) {
    return res.status(404).json({ error: 'Workspace not found' });
  }

  // Check permissions (editor+)
  const canUpdate = await checkWorkspaceCreatePermission(workspace.organization_id, userId);
  if (!canUpdate) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  // Update workspace
  const { data: updated, error } = await supabase
    .from('workspaces')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return res.status(200).json(updated);
}

// DELETE /api/workspaces?id=xxx
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Workspace ID is required' });
  }

  // Get workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('organization_id')
    .eq('id', id as string)
    .single();

  if (!workspace) {
    return res.status(404).json({ error: 'Workspace not found' });
  }

  // Check permissions (admin+)
  const canDelete = await checkWorkspaceDeletePermission(workspace.organization_id, userId);
  if (!canDelete) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  // Delete workspace
  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', id as string);

  if (error) {
    throw error;
  }

  return res.status(200).json({ success: true });
}

// Helper functions
async function checkOrganizationAccess(organizationId: string, userId: string): Promise<boolean> {
  const { data: org } = await supabase
    .from('organizations')
    .select('owner_id')
    .eq('id', organizationId)
    .single();

  if (org?.owner_id === userId) return true;

  const { data: member } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single();

  return !!member;
}

async function checkWorkspaceAccess(organizationId: string, userId: string): Promise<boolean> {
  return checkOrganizationAccess(organizationId, userId);
}

async function checkWorkspaceCreatePermission(organizationId: string, userId: string): Promise<boolean> {
  const { data: org } = await supabase
    .from('organizations')
    .select('owner_id')
    .eq('id', organizationId)
    .single();

  if (org?.owner_id === userId) return true;

  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single();

  return member && ['owner', 'admin', 'editor'].includes(member.role);
}

async function checkWorkspaceDeletePermission(organizationId: string, userId: string): Promise<boolean> {
  const { data: org } = await supabase
    .from('organizations')
    .select('owner_id')
    .eq('id', organizationId)
    .single();

  if (org?.owner_id === userId) return true;

  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single();

  return member && ['owner', 'admin'].includes(member.role);
}
