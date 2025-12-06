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
    console.error('Organization members API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

// GET /api/organizations/members?organization_id=xxx
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { organization_id } = req.query;

  if (!organization_id) {
    return res.status(400).json({ error: 'Organization ID is required' });
  }

  // Check if user has access to this organization
  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organization_id as string)
    .eq('user_id', userId)
    .single();

  const { data: org } = await supabase
    .from('organizations')
    .select('owner_id')
    .eq('id', organization_id as string)
    .single();

  if (!member && org?.owner_id !== userId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Get all members
  const { data: members, error } = await supabase
    .from('organization_members')
    .select(`
      *,
      user:users!organization_members_user_id_fkey(id, name, email, avatar)
    `)
    .eq('organization_id', organization_id as string)
    .order('joined_at', { ascending: false });

  if (error) {
    throw error;
  }

  return res.status(200).json(members || []);
}

// POST /api/organizations/members (invite member)
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { organization_id, user_id, email, role } = req.body;

  if (!organization_id || (!user_id && !email)) {
    return res.status(400).json({ error: 'Organization ID and user ID or email are required' });
  }

  // Check if user is admin/owner
  const { data: org } = await supabase
    .from('organizations')
    .select('owner_id')
    .eq('id', organization_id)
    .single();

  if (!org) {
    return res.status(404).json({ error: 'Organization not found' });
  }

  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organization_id)
    .eq('user_id', userId)
    .single();

  const canInvite = org.owner_id === userId || 
    (member && ['owner', 'admin'].includes(member.role));

  if (!canInvite) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  let targetUserId = user_id;

  // If email provided, find user by email
  if (email && !user_id) {
    const { data: users } = await supabase.auth.admin.listUsers();
    const targetUser = users.users.find(u => u.email === email);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    targetUserId = targetUser.id;
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', organization_id)
    .eq('user_id', targetUserId)
    .single();

  if (existing) {
    return res.status(409).json({ error: 'User is already a member' });
  }

  // Add member
  const { data: newMember, error } = await supabase
    .from('organization_members')
    .insert({
      organization_id,
      user_id: targetUserId,
      role: role || 'member',
      invited_by: userId,
      invited_at: new Date().toISOString(),
      joined_at: new Date().toISOString()
    })
    .select(`
      *,
      user:users!organization_members_user_id_fkey(id, name, email, avatar)
    `)
    .single();

  if (error) {
    throw error;
  }

  return res.status(201).json(newMember);
}

// PUT /api/organizations/members (update role)
async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { id, role } = req.body;

  if (!id || !role) {
    return res.status(400).json({ error: 'Member ID and role are required' });
  }

  // Get member and organization
  const { data: member } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('id', id)
    .single();

  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }

  // Check if user is admin/owner
  const { data: org } = await supabase
    .from('organizations')
    .select('owner_id')
    .eq('id', member.organization_id)
    .single();

  const { data: currentMember } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', member.organization_id)
    .eq('user_id', userId)
    .single();

  const canUpdate = org?.owner_id === userId || 
    (currentMember && ['owner', 'admin'].includes(currentMember.role));

  if (!canUpdate) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  // Prevent changing owner role
  if (member.role === 'owner' && role !== 'owner') {
    return res.status(400).json({ error: 'Cannot change owner role' });
  }

  // Update role
  const { data: updated, error } = await supabase
    .from('organization_members')
    .update({ role })
    .eq('id', id)
    .select(`
      *,
      user:users!organization_members_user_id_fkey(id, name, email, avatar)
    `)
    .single();

  if (error) {
    throw error;
  }

  return res.status(200).json(updated);
}

// DELETE /api/organizations/members?id=xxx
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Member ID is required' });
  }

  // Get member
  const { data: member } = await supabase
    .from('organization_members')
    .select('organization_id, user_id, role')
    .eq('id', id as string)
    .single();

  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }

  // Users can remove themselves, or admins can remove others
  const { data: org } = await supabase
    .from('organizations')
    .select('owner_id')
    .eq('id', member.organization_id)
    .single();

  const { data: currentMember } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', member.organization_id)
    .eq('user_id', userId)
    .single();

  const canRemove = member.user_id === userId || // Self-removal
    org?.owner_id === userId || // Owner
    (currentMember && ['owner', 'admin'].includes(currentMember.role)); // Admin

  if (!canRemove) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  // Prevent removing owner
  if (member.role === 'owner') {
    return res.status(400).json({ error: 'Cannot remove organization owner' });
  }

  // Remove member
  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('id', id as string);

  if (error) {
    throw error;
  }

  return res.status(200).json({ success: true });
}
