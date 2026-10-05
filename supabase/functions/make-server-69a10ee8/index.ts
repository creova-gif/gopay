import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import shoppingApp from './shopping.tsx';
import merchantApp from './merchant.tsx';
import adminApp from './admin.tsx';
import securityApp from './security.tsx';
import moviesApp from './movies.tsx';
import billsApp from './bills.tsx';
import membershipApp from './membership.tsx';
import restaurantsApp from './restaurants.tsx';
import ridesApp from './rides.tsx';
import profileApp from './profile.tsx';
import rentalsApp from './rentals.tsx';
import driversApp from './drivers.tsx';
import userApp from './user.tsx';
import notificationsApp from './notifications.tsx';
import analyticsApp from './analytics.tsx';
import budgetsApp from './budgets.tsx';
import gosafariApp from './gosafari.tsx';
import flightsApp from './flights.tsx';
import hotelsApp from './hotels.tsx';
import carsApp from './cars.tsx';
import complianceApp from './compliance.tsx';
import paymentAggregatorApp from './payment-aggregator.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Mount payment aggregator routes
app.route('/make-server-69a10ee8/payment-aggregator', paymentAggregatorApp);
app.route('/make-server-69a10ee8/payment', paymentAggregatorApp);

// Mount performance routes
import performanceApp from './performance.tsx';
app.route('/make-server-69a10ee8/performance', performanceApp);

// Mount integrations routes
import integrationsApp from './integrations.tsx';
app.route('/make-server-69a10ee8/integrations', integrationsApp);

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Utility function to verify user
async function verifyUser(authHeader: string | null) {
  if (!authHeader) {
    return null;
  }
  
  const accessToken = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user?.id) {
    return null;
  }
  
  return user.id;
}

// PIN brute-force protection. Previously every PIN-gated endpoint compared
// wallet.pin directly with no attempt limit at all — a 4-digit PIN (10,000
// possibilities) is practically guessable given an already-valid session
// token and no lockout. This locks PIN-gated actions for 15 minutes after 5
// consecutive wrong attempts, and resets the counter on a correct PIN.
const PIN_MAX_ATTEMPTS = 5;
const PIN_LOCKOUT_MS = 15 * 60 * 1000;

async function checkPin(
  userId: string,
  wallet: any,
  submittedPin: string
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const now = Date.now();

  if (wallet.pinLockedUntil && now < wallet.pinLockedUntil) {
    const minutesLeft = Math.ceil((wallet.pinLockedUntil - now) / 60000);
    return {
      ok: false,
      error: `Too many incorrect PIN attempts. Try again in ${minutesLeft} minute(s).`,
      status: 429,
    };
  }

  if (wallet.pin !== submittedPin) {
    const attempts = (wallet.pinFailedAttempts || 0) + 1;
    wallet.pinFailedAttempts = attempts;
    if (attempts >= PIN_MAX_ATTEMPTS) {
      wallet.pinLockedUntil = now + PIN_LOCKOUT_MS;
      wallet.pinFailedAttempts = 0;
    }
    await kv.set(`wallet:${userId}`, wallet);
    return { ok: false, error: 'Invalid PIN', status: 400 };
  }

  if (wallet.pinFailedAttempts || wallet.pinLockedUntil) {
    wallet.pinFailedAttempts = 0;
    wallet.pinLockedUntil = null;
    await kv.set(`wallet:${userId}`, wallet);
  }

  return { ok: true };
}

// Auth Routes
app.post('/make-server-69a10ee8/auth/signup', async (c) => {
  try {
    const { name, email, phone, nida, password } = await c.req.json();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since no email server configured
      user_metadata: { name, phone, nida },
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      return c.json({ error: authError.message }, 400);
    }

    const userId = authData.user.id;

    // Store user profile
    await kv.set(`user:${userId}`, {
      id: userId,
      email,
      name,
      phone,
      nida,
      createdAt: new Date().toISOString(),
    });

    // Initialize wallet with 100,000 TZS demo balance
    const walletPin = Math.floor(1000 + Math.random() * 9000).toString();
    await kv.set(`wallet:${userId}`, {
      userId,
      balance: 100000,
      currency: 'TZS',
      pin: walletPin,
    });

    // Initialize empty linked accounts
    await kv.set(`linked_accounts:${userId}`, []);

    return c.json({
      success: true,
      userId,
      walletPin,
      mustChangePin: true, // Frontend TODO: prompt user to set their own PIN on first login — see accompanying issues doc
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return c.json({ error: error.message || 'Signup failed' }, 500);
  }
});

// User Profile
app.get('/make-server-69a10ee8/user/profile', async (c) => {
  const userId = await verifyUser(c.req.header('Authorization'));
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const userProfile = await kv.get(`user:${userId}`);
    
    if (!userProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json(userProfile);
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Wallet Balance
app.get('/make-server-69a10ee8/wallet/balance', async (c) => {
  const userId = await verifyUser(c.req.header('Authorization'));
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const wallet = await kv.get(`wallet:${userId}`);
    
    if (!wallet) {
      return c.json({ balance: 0, currency: 'TZS' });
    }

    return c.json({ balance: wallet.balance, currency: wallet.currency });
  } catch (error: any) {
    console.error('Error fetching wallet balance:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Linked Accounts
app.get('/make-server-69a10ee8/wallet/linked-accounts', async (c) => {
  const userId = await verifyUser(c.req.header('Authorization'));
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const accounts = await kv.get(`linked_accounts:${userId}`) || [];
    return c.json({ accounts });
  } catch (error: any) {
    console.error('Error fetching linked accounts:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Link Account
app.post('/make-server-69a10ee8/wallet/link-account', async (c) => {
  const userId = await verifyUser(c.req.header('Authorization'));
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { type, provider, accountNumber, pin } = await c.req.json();

    // Verify PIN
    const wallet = await kv.get(`wallet:${userId}`);
    const pinCheck = await checkPin(userId, wallet, pin);
    if (!pinCheck.ok) {
      return c.json({ error: pinCheck.error }, pinCheck.status);
    }

    const accounts = await kv.get(`linked_accounts:${userId}`) || [];
    
    const newAccount = {
      id: `acc_${Date.now()}`,
      type,
      provider,
      accountNumber,
      createdAt: new Date().toISOString(),
    };

    accounts.push(newAccount);
    await kv.set(`linked_accounts:${userId}`, accounts);

    return c.json({ success: true, account: newAccount });
  } catch (error: any) {
    console.error('Error linking account:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Add Funds
app.post('/make-server-69a10ee8/wallet/add-funds', async (c) => {
  const userId = await verifyUser(c.req.header('Authorization'));
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { amount, source, pin, idempotencyKey } = await c.req.json();

    const wallet = await kv.get(`wallet:${userId}`);
    const pinCheck = await checkPin(userId, wallet, pin);
    if (!pinCheck.ok) {
      return c.json({ error: pinCheck.error }, pinCheck.status);
    }

    // idempotencyKey should be client-generated and stable across retries of
    // the SAME attempt (e.g. UUID created once when the user taps "Add
    // Funds", resent unchanged on any automatic retry). Older clients that
    // don't send one yet get a per-request fallback, which is safe (no
    // crash) but gives no retry protection until the frontend sends a real
    // stable key.
    const key = idempotencyKey || crypto.randomUUID();

    const { data, error } = await supabase.rpc('process_wallet_transaction', {
      p_idempotency_key: key,
      p_user_id: userId,
      p_endpoint: 'wallet/add-funds',
      p_entry_type: 'credit',
      p_amount: parseInt(amount),
      p_currency: wallet.currency || 'TZS',
      p_description: `Added funds from ${source}`,
    });

    if (error) throw error;
    if (data.error) {
      return c.json({ error: data.message || data.error }, data.error === 'conflict' ? 409 : 400);
    }

    // Keep the kv wallet record's cached balance in sync for endpoints that
    // still read it directly (e.g. GET /wallet/balance). The ledger in
    // gopay_ledger / gopay_wallet_balance remains the source of truth.
    wallet.balance = data.newBalance;
    await kv.set(`wallet:${userId}`, wallet);

    return c.json({ success: true, newBalance: data.newBalance, transactionId: data.transactionId });
  } catch (error: any) {
    console.error('Error adding funds:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Send Money
app.post('/make-server-69a10ee8/wallet/send-money', async (c) => {
  const userId = await verifyUser(c.req.header('Authorization'));
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { recipient, amount, pin, idempotencyKey } = await c.req.json();

    const wallet = await kv.get(`wallet:${userId}`);
    const pinCheck = await checkPin(userId, wallet, pin);
    if (!pinCheck.ok) {
      return c.json({ error: pinCheck.error }, pinCheck.status);
    }

    const amountNum = parseInt(amount);
    const key = idempotencyKey || crypto.randomUUID();

    // Balance check + debit happen atomically inside the function (under an
    // advisory lock keyed on the user), so this replaces both the manual
    // "if balance < amount" check and the direct balance mutation that used
    // to happen here.
    const { data, error } = await supabase.rpc('process_wallet_transaction', {
      p_idempotency_key: key,
      p_user_id: userId,
      p_endpoint: 'wallet/send-money',
      p_entry_type: 'debit',
      p_amount: amountNum,
      p_currency: wallet.currency || 'TZS',
      p_description: `Sent to ${recipient}`,
    });

    if (error) throw error;
    if (data.error === 'insufficient_balance') {
      return c.json({ error: 'Insufficient balance' }, 400);
    }
    if (data.error) {
      return c.json({ error: data.message || data.error }, data.error === 'conflict' ? 409 : 400);
    }

    wallet.balance = data.newBalance;
    await kv.set(`wallet:${userId}`, wallet);

    return c.json({ success: true, newBalance: data.newBalance, transactionId: data.transactionId });
  } catch (error: any) {
    console.error('Error sending money:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Recent Transactions
app.get('/make-server-69a10ee8/transactions/recent', async (c) => {
  const userId = await verifyUser(c.req.header('Authorization'));
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const allTransactions = await kv.getByPrefix('transaction:');
    const userTransactions = allTransactions
      .filter((tx: any) => tx.userId === userId)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return c.json({ transactions: userTransactions });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Process Payment
app.post('/make-server-69a10ee8/payments/process', async (c) => {
  const userId = await verifyUser(c.req.header('Authorization'));
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { provider, accountNumber, amount, pin } = await c.req.json();

    const wallet = await kv.get(`wallet:${userId}`);
    const pinCheck = await checkPin(userId, wallet, pin);
    if (!pinCheck.ok) {
      return c.json({ error: pinCheck.error }, pinCheck.status);
    }

    const amountNum = parseInt(amount);
    if (wallet.balance < amountNum) {
      return c.json({ error: 'Insufficient balance' }, 400);
    }

    wallet.balance -= amountNum;
    await kv.set(`wallet:${userId}`, wallet);

    const reference = `PAY${Date.now()}`;
    const transactionId = `tx_${Date.now()}`;
    
    await kv.set(`transaction:${transactionId}`, {
      id: transactionId,
      userId,
      type: 'debit',
      amount: amountNum,
      description: `${provider} - ${accountNumber}`,
      timestamp: new Date().toISOString(),
      status: 'completed',
      category: 'bill_payment',
    });

    // Store payment record
    await kv.set(`payment:${reference}`, {
      reference,
      userId,
      provider,
      accountNumber,
      amount: amountNum,
      timestamp: new Date().toISOString(),
    });

    return c.json({ success: true, reference, newBalance: wallet.balance })
  } catch (error: any) {
    console.error('Error processing payment:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Process Bill Payment with Control Number
app.post('/make-server-69a10ee8/payments/bill-payment', async (c) => {
  const userId = await verifyUser(c.req.header('Authorization'));
  if (!userId) {
    return c.json({ error: 'Unauthorized - Bill payment requires authentication' }, 401);
  }

  try {
    const { provider, controlNumber, accountNumber, amount, phone, pin, paymentMethod, billDetails } = await c.req.json();

    // Verify PIN
    const wallet = await kv.get(`wallet:${userId}`);
    if (!wallet) {
      return c.json({ error: 'Wallet not found' }, 404);
    }
    
    const pinCheck = await checkPin(userId, wallet, pin);
    if (!pinCheck.ok) {
      return c.json({ error: pinCheck.error }, pinCheck.status);
    }

    const amountNum = parseInt(amount);
    if (!amountNum || amountNum <= 0) {
      return c.json({ error: 'Invalid amount' }, 400);
    }

    // Check balance (Tanzania BOT regulation: ensure sufficient funds)
    if (wallet.balance < amountNum) {
      return c.json({ error: 'Insufficient balance - Please top up your wallet' }, 400);
    }

    // Generate payment reference (BOT compliant format)
    const reference = `BP${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Deduct from wallet
    wallet.balance -= amountNum;
    await kv.set(`wallet:${userId}`, wallet);

    // Record transaction (BOT regulation: maintain transaction log)
    const transactionId = `tx_${Date.now()}`;
    await kv.set(`transaction:${transactionId}`, {
      id: transactionId,
      userId,
      type: 'debit',
      amount: amountNum,
      description: `Bill Payment - ${provider}${controlNumber ? ` (CN: ${controlNumber})` : ''}`,
      timestamp: new Date().toISOString(),
      status: 'completed',
      category: 'bill_payment',
      provider: provider,
      reference: reference,
    });

    // Store payment record with control number
    await kv.set(`payment:${reference}`, {
      reference,
      userId,
      provider,
      controlNumber: controlNumber || null,
      accountNumber: accountNumber || null,
      amount: amountNum,
      phone: phone,
      paymentMethod: paymentMethod,
      billDetails: billDetails,
      timestamp: new Date().toISOString(),
      status: 'completed',
      regulatoryCompliance: {
        botRegulated: true,
        transactionLogged: true,
        receiptGenerated: true,
        timestamp: new Date().toISOString()
      }
    });

    // In production, this would call the actual provider API to process the payment
    // For TANESCO, DAWASCO, TRA, etc., integration with TEPSA/GePG systems
    console.log(`Bill payment processed: ${reference} - ${provider} - ${amountNum} TZS`);

    return c.json({ 
      success: true, 
      reference, 
      newBalance: wallet.balance,
      message: 'Payment successful - Receipt sent to your phone'
    });
  } catch (error: any) {
    console.error('Error processing bill payment:', error);
    return c.json({ error: error.message || 'Payment processing failed' }, 500);
  }
});

// Generate Personal QR Code for receiving money
app.post('/make-server-69a10ee8/wallet/generate-qr', async (c) => {
  const userId = await verifyUser(c.req.header('Authorization'));
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { amount } = await c.req.json();
    const userProfile = await kv.get(`user:${userId}`);
    
    const qrCode = `PAY_${userId}_${amount || 0}_${Date.now()}`;
    
    // Store QR code details
    await kv.set(`qr:${qrCode}`, {
      qrCode,
      userId,
      userName: userProfile.name,
      amount: amount ? parseInt(amount) : 0,
      createdAt: new Date().toISOString(),
      status: 'active',
      type: 'personal',
    });

    return c.json({ qrCode, amount: amount || 0, userName: userProfile.name });
  } catch (error: any) {
    console.error('Error generating QR code:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Request Money
app.post('/make-server-69a10ee8/wallet/request-money', async (c) => {
  const userId = await verifyUser(c.req.header('Authorization'));
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { recipient, amount, message } = await c.req.json();
    const userProfile = await kv.get(`user:${userId}`);
    
    const requestId = `REQ_${Date.now()}`;
    
    await kv.set(`request:${requestId}`, {
      requestId,
      fromUserId: userId,
      fromUserName: userProfile.name,
      recipient,
      amount: parseInt(amount),
      message,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    return c.json({ success: true, requestId });
  } catch (error: any) {
    console.error('Error requesting money:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Pay QR Code (Personal or Merchant)
app.post('/make-server-69a10ee8/wallet/pay-qr', async (c) => {
  const userId = await verifyUser(c.req.header('Authorization'));
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { qrCode, amount, pin } = await c.req.json();

    const wallet = await kv.get(`wallet:${userId}`);
    const pinCheck = await checkPin(userId, wallet, pin);
    if (!pinCheck.ok) {
      return c.json({ error: pinCheck.error }, pinCheck.status);
    }

    const qrData = await kv.get(`qr:${qrCode}`);
    if (!qrData || qrData.status !== 'active') {
      return c.json({ error: 'Invalid or expired QR code' }, 400);
    }

    const paymentAmount = qrData.amount > 0 ? qrData.amount : parseInt(amount);

    if (wallet.balance < paymentAmount) {
      return c.json({ error: 'Insufficient balance' }, 400);
    }

    // Deduct from payer
    wallet.balance -= paymentAmount;
    await kv.set(`wallet:${userId}`, wallet);

    // Add to recipient
    const recipientWallet = await kv.get(`wallet:${qrData.userId}`);
    if (recipientWallet) {
      recipientWallet.balance += paymentAmount;
      await kv.set(`wallet:${qrData.userId}`, recipientWallet);
    }

    // Mark QR as used if it's a one-time QR with fixed amount
    if (qrData.amount > 0) {
      qrData.status = 'used';
      await kv.set(`qr:${qrCode}`, qrData);
    }

    // Record transactions
    const transactionId = `tx_${Date.now()}`;
    await kv.set(`transaction:${transactionId}`, {
      id: transactionId,
      userId,
      type: 'debit',
      amount: paymentAmount,
      description: `Payment to ${qrData.userName || 'merchant'}`,
      timestamp: new Date().toISOString(),
      status: 'completed',
      category: 'qr_payment',
    });

    const recipientTxId = `tx_${Date.now() + 1}`;
    await kv.set(`transaction:${recipientTxId}`, {
      id: recipientTxId,
      userId: qrData.userId,
      type: 'credit',
      amount: paymentAmount,
      description: `Received from user`,
      timestamp: new Date().toISOString(),
      status: 'completed',
      category: 'qr_payment',
    });

    return c.json({ 
      success: true, 
      amount: paymentAmount, 
      newBalance: wallet.balance,
      recipientName: qrData.userName 
    });
  } catch (error: any) {
    console.error('Error processing QR payment:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get User Favorites
app.get('/make-server-69a10ee8/favorites', async (c) => {
  const userId = await verifyUser(c.req.header('Authorization'));
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const favorites = await kv.get(`favorites:${userId}`) || [];
    return c.json({ favorites });
  } catch (error: any) {
    console.error('Error fetching favorites:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Add to Favorites
app.post('/make-server-69a10ee8/favorites/add', async (c) => {
  const userId = await verifyUser(c.req.header('Authorization'));
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { type, provider, accountNumber, name } = await c.req.json();
    
    const favorites = await kv.get(`favorites:${userId}`) || [];
    
    const newFavorite = {
      id: `fav_${Date.now()}`,
      type,
      provider,
      accountNumber,
      name,
      createdAt: new Date().toISOString(),
    };

    favorites.push(newFavorite);
    await kv.set(`favorites:${userId}`, favorites);

    return c.json({ success: true, favorite: newFavorite });
  } catch (error: any) {
    console.error('Error adding favorite:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default app;

// Deno.serve is now called from /supabase/functions/make-server/index.ts
// This allows the app to be imported and served from the proper entry point