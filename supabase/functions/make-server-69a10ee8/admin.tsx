import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';

const admin = new Hono();

// Helper to get userId from access token
async function getUserId(accessToken: string | null): Promise<string | null> {
  if (!accessToken) return null;
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) return null;
  
  return user.id;
}

// Check if user is admin (simple check - can be enhanced)
async function isAdmin(userId: string): Promise<boolean> {
  const adminUsers = await kv.get('admin:users') || [];
  return adminUsers.includes(userId);
}

// Get all pending merchant applications
admin.get('/merchant-applications', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const userId = await getUserId(accessToken);
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!await isAdmin(userId)) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const pendingIds = await kv.get('merchant:pending') || [];
    const applications = [];

    for (const id of pendingIds) {
      const app = await kv.get(`merchant:${id}`);
      if (app && app.status === 'pending') {
        applications.push(app);
      }
    }

    // Sort by submission date (newest first)
    applications.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    return c.json(applications);

  } catch (error) {
    console.error('Error fetching merchant applications:', error);
    return c.json({ error: 'Failed to fetch merchant applications' }, 500);
  }
});

// Approve merchant application
admin.post('/approve-merchant', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const userId = await getUserId(accessToken);
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!await isAdmin(userId)) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const { applicationId } = await c.req.json();
    
    const merchantData = await kv.get(`merchant:${applicationId}`);
    
    if (!merchantData) {
      return c.json({ error: 'Application not found' }, 404);
    }

    // Update status to approved
    merchantData.status = 'approved';
    merchantData.approvedAt = new Date().toISOString();
    merchantData.approvedBy = userId;
    
    await kv.set(`merchant:${applicationId}`, merchantData);

    // Remove from pending list
    const pendingIds = await kv.get('merchant:pending') || [];
    const updatedPending = pendingIds.filter((id: string) => id !== applicationId);
    await kv.set('merchant:pending', updatedPending);

    // Add to approved merchants list
    const approvedIds = await kv.get('merchant:approved') || [];
    approvedIds.push(applicationId);
    await kv.set('merchant:approved', approvedIds);

    // Initialize merchant stats
    await kv.set(`merchant:${applicationId}:stats`, {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      completedToday: 0,
    });

    // Add merchant to public listings based on type
    const listingKey = `merchants:${merchantData.businessType}`;
    const listings = await kv.get(listingKey) || [];
    listings.push({
      id: applicationId,
      name: merchantData.businessName,
      category: merchantData.businessCategory,
      description: merchantData.description,
      image: merchantData.documents?.businessPhoto || null,
      rating: 4.5,
      deliveryTime: '30-45',
    });
    await kv.set(listingKey, listings);

    return c.json({ success: true });

  } catch (error) {
    console.error('Error approving merchant:', error);
    return c.json({ error: 'Failed to approve merchant' }, 500);
  }
});

// Reject merchant application
admin.post('/reject-merchant', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const userId = await getUserId(accessToken);
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!await isAdmin(userId)) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const { applicationId, reason } = await c.req.json();
    
    const merchantData = await kv.get(`merchant:${applicationId}`);
    
    if (!merchantData) {
      return c.json({ error: 'Application not found' }, 404);
    }

    // Update status to rejected
    merchantData.status = 'rejected';
    merchantData.rejectedAt = new Date().toISOString();
    merchantData.rejectedBy = userId;
    merchantData.rejectionReason = reason;
    
    await kv.set(`merchant:${applicationId}`, merchantData);

    // Remove from pending list
    const pendingIds = await kv.get('merchant:pending') || [];
    const updatedPending = pendingIds.filter((id: string) => id !== applicationId);
    await kv.set('merchant:pending', updatedPending);

    return c.json({ success: true });

  } catch (error) {
    console.error('Error rejecting merchant:', error);
    return c.json({ error: 'Failed to reject merchant' }, 500);
  }
});

// Make a user an admin. Previously this had NO authentication at all —
// anyone could grant admin status to any userId with a single unauthenticated
// request. Fixed with a standard secure-bootstrap pattern: the very first
// admin may be added by any authenticated user only while the admin list is
// still empty. Once at least one admin exists, only an existing admin may
// add another.
admin.post('/add-admin', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const callerId = await getUserId(accessToken);
    if (!callerId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { userId } = await c.req.json();
    if (!userId) {
      return c.json({ error: 'userId is required' }, 400);
    }

    const adminUsers = await kv.get('admin:users') || [];

    if (adminUsers.length > 0 && !adminUsers.includes(callerId)) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    if (!adminUsers.includes(userId)) {
      adminUsers.push(userId);
      await kv.set('admin:users', adminUsers);
    }

    return c.json({ success: true });

  } catch (error) {
    console.error('Error adding admin:', error);
    return c.json({ error: 'Failed to add admin' }, 500);
  }
});

export default admin;
