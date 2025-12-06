# Disaster Recovery & Backup Strategy

## Overview

This document outlines procedures for database backups, disaster recovery, and handling failed deployments or migrations.

---

## Database Backup Strategy

### Automated Backups

**Platform**: Supabase  
**Frequency**: Daily automated backups  
**Retention**: 7 days (configurable in Supabase dashboard)  
**Location**: Supabase managed storage

### Manual Backups

Before major migrations or deployments:

1. Access Supabase Dashboard
2. Navigate to **Database** → **Backups**
3. Click **Create Backup**
4. Note the backup timestamp and ID
5. Verify backup completion

### Backup Verification

\`\`\`sql
-- Verify backup by checking recent backup timestamps
-- This is done via Supabase Dashboard
\`\`\`

---

## Restore Procedure

### Staging Restore (Test First)

1. **Access Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to **Database** → **Backups**

2. **Select Restore Point**
   - Choose the backup to restore
   - Verify the timestamp is correct

3. **Restore to Staging**
   - Use Supabase's point-in-time recovery
   - Or restore to a staging database instance
   - **Never restore directly to production without testing**

4. **Verify Data Integrity**
   \`\`\`sql
   -- Check table counts
   SELECT 
     'users' as table_name, COUNT(*) as count FROM users
   UNION ALL
   SELECT 'feed_items', COUNT(*) FROM feed_items
   UNION ALL
   SELECT 'organizations', COUNT(*) FROM organizations;
   
   -- Verify critical data
   SELECT * FROM users ORDER BY created_at DESC LIMIT 10;
   \`\`\`

5. **Test Application**
   - Verify authentication works
   - Test critical flows (create content, payments)
   - Check data relationships

6. **Document Issues**
   - Note any data inconsistencies
   - Document missing data
   - Create recovery plan

### Production Restore

**⚠️ WARNING: Only proceed after successful staging restore**

1. **Notify Stakeholders**
   - Alert team of restore operation
   - Set maintenance window if needed

2. **Stop Application Traffic**
   - Pause deployments
   - Set maintenance mode if available

3. **Create Current Backup**
   - Backup current state before restore
   - This allows rollback if restore fails

4. **Execute Restore**
   - Use Supabase Dashboard restore
   - Or use Supabase CLI:
     \`\`\`bash
     supabase db restore --backup-id <backup-id>
     \`\`\`

5. **Verify Restore**
   - Run data integrity checks
   - Test critical endpoints
   - Verify user authentication

6. **Resume Operations**
   - Remove maintenance mode
   - Resume deployments
   - Monitor for issues

---

## Failed Migration Recovery

### Identify Failed Migration

1. Check Supabase Dashboard → **Database** → **Migrations**
2. Look for failed migration status
3. Note the migration file name and timestamp

### Rollback Procedure

1. **Access Supabase SQL Editor**

2. **Review Migration File**
   \`\`\`sql
   -- Example: Check what the migration did
   -- File: supabase/migrations/006_add_teams_and_organizations.sql
   \`\`\`

3. **Create Rollback Script**
   \`\`\`sql
   -- Example rollback for adding a column
   -- ALTER TABLE organizations DROP COLUMN IF EXISTS new_column;
   
   -- Example rollback for creating a table
   -- DROP TABLE IF EXISTS new_table CASCADE;
   \`\`\`

4. **Execute Rollback in Staging**
   - Test rollback script in staging first
   - Verify no data loss
   - Check application functionality

5. **Fix Migration Script**
   - Identify the issue
   - Fix the migration file
   - Test in local/staging environment

6. **Re-apply Migration**
   - After fixing, re-run migration
   - Verify success
   - Test application

### Common Migration Issues

**Issue**: Column already exists
\`\`\`sql
-- Fix: Use IF NOT EXISTS
ALTER TABLE table_name ADD COLUMN IF NOT EXISTS column_name TYPE;
\`\`\`

**Issue**: Foreign key constraint violation
\`\`\`sql
-- Fix: Check for orphaned records first
SELECT * FROM child_table WHERE parent_id NOT IN (SELECT id FROM parent_table);
-- Clean up orphaned records before adding constraint
\`\`\`

**Issue**: RLS policy conflicts
\`\`\`sql
-- Fix: Drop conflicting policies first
DROP POLICY IF EXISTS "policy_name" ON table_name;
-- Then create new policy
\`\`\`

---

## Failed Deployment Recovery

### Identify Failed Deployment

1. Check deployment logs (Vercel/Netlify dashboard)
2. Check application error logs
3. Monitor user reports

### Rollback Procedure

#### Vercel

1. **Access Vercel Dashboard**
2. Navigate to **Deployments**
3. Find last successful deployment
4. Click **...** → **Promote to Production**

#### Manual Rollback

1. **Revert Code**
   \`\`\`bash
   git revert <commit-hash>
   git push origin main
   \`\`\`

2. **Redeploy**
   - Trigger new deployment
   - Or manually deploy previous version

3. **Verify Rollback**
   - Test critical features
   - Check error logs
   - Monitor user reports

### Post-Rollback Actions

1. **Investigate Root Cause**
   - Review deployment logs
   - Check environment variables
   - Verify dependencies

2. **Fix Issues**
   - Address root cause
   - Test fixes in staging
   - Prepare new deployment

3. **Document**
   - Record what went wrong
   - Update deployment procedures
   - Add safeguards if needed

---

## Data Corruption Recovery

### Identify Corruption

- Unusual data patterns
- Missing relationships
- Invalid foreign keys
- Application errors

### Recovery Steps

1. **Stop Application**
   - Prevent further corruption
   - Set maintenance mode

2. **Assess Damage**
   \`\`\`sql
   -- Check for orphaned records
   -- Check for invalid data
   -- Identify affected tables
   \`\`\`

3. **Restore from Backup**
   - Use most recent clean backup
   - Follow restore procedure above

4. **Data Reconciliation**
   - Compare backup vs current state
   - Identify lost data
   - Plan data recovery if possible

5. **Recover Lost Data**
   - If possible, recover from logs
   - Or recreate critical data
   - Document what was lost

---

## Emergency Contacts

- **Supabase Support**: https://supabase.com/support
- **Stripe Support**: https://support.stripe.com
- **Team Lead**: [Contact Info]
- **DevOps**: [Contact Info]

---

## Recovery Testing

### Quarterly Testing

1. **Test Backup Restore**
   - Restore to staging environment
   - Verify data integrity
   - Test application functionality

2. **Test Migration Rollback**
   - Create test migration
   - Apply and rollback
   - Verify no data loss

3. **Document Results**
   - Record test outcomes
   - Update procedures if needed
   - Train team on procedures

---

## Prevention

### Before Major Changes

- ✅ Create manual backup
- ✅ Test in staging first
- ✅ Review migration scripts
- ✅ Have rollback plan ready
- ✅ Notify team

### Monitoring

- ✅ Monitor error rates
- ✅ Watch database performance
- ✅ Track migration success
- ✅ Alert on failures

---

**Last Updated**: Current  
**Next Review**: Quarterly  
**Owner**: Platform Team
