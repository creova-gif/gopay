import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'npm:@supabase/supabase-js';
import { handleSelcomWebhook } from './payments/webhook-handler.ts';
import * as kv from './kv_store.tsx';

const paymentAggregatorApp = new Hono();

paymentAggregatorApp.use('*', cors());

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Same verification pattern used in index.ts and admin.tsx — derives the
// user id from Supabase's own token verification, never trusts a
// client-supplied userId. Every endpoint in this file that moves money or
// credits rewards must call this and reject on null.
async function verifyUser(authHeader: string | null): Promise<string | null> {
  if (!authHeader) return null;
  const accessToken = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user?.id) return null;
  return user.id;
}

// ============================================
// PAYMENT AGGREGATOR INTEGRATION
// ============================================
// Supports: Selcom, Pesapal, ClickPesa, PayChangu, Jenga API, N-Lynx
// Direct APIs: M-Pesa Daraja, Airtel Money, TigoPesa, Halopesa
// ============================================

interface PaymentRequest {
  amount: number;
  currency: string;
  paymentMethod: 'mpesa' | 'airtel' | 'tigo' | 'halopesa' | 'bank' | 'card';
  phoneNumber?: string;
  accountNumber?: string;
  description: string;
  userId: string;
  reference: string;
}

interface PaymentResponse {
  success: boolean;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  message: string;
  aggregator?: string;
}

// ============================================
// 1. SELCOM PAYMENT GATEWAY (PRIMARY)
// ============================================
// Selcom covers: All mobile money, banks, cards, govt payments
// Docs: https://developer.selcommobile.com

async function processSelcomPayment(payment: PaymentRequest): Promise<PaymentResponse> {
  const selcomApiKey = Deno.env.get('SELCOM_API_KEY');
  const selcomApiSecret = Deno.env.get('SELCOM_API_SECRET');
  const selcomVendor = Deno.env.get('SELCOM_VENDOR_ID') || 'GOPAY';

  if (!selcomApiKey || !selcomApiSecret) {
    console.warn('Selcom credentials not configured, using demo mode');
    return createDemoPaymentResponse('selcom', payment);
  }

  try {
    // Selcom API endpoint
    const selcomEndpoint = 'https://apigw.selcommobile.com/v1/checkout/create-order';

    // Generate order ID
    const orderId = `GO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Map payment method to Selcom gateway
    let gateway = '';
    switch (payment.paymentMethod) {
      case 'mpesa':
        gateway = 'MPESA';
        break;
      case 'airtel':
        gateway = 'AIRTELMONEY';
        break;
      case 'tigo':
        gateway = 'TIGOPESA';
        break;
      case 'halopesa':
        gateway = 'HALOPESA';
        break;
      case 'card':
        gateway = 'MASTERCARD'; // or VISA
        break;
      case 'bank':
        gateway = 'BANKACCOUNT';
        break;
    }

    const requestBody = {
      vendor: selcomVendor,
      order_id: orderId,
      buyer_email: `user-${payment.userId}@gopay.tz`,
      buyer_name: 'goPay User',
      buyer_phone: payment.phoneNumber || '',
      amount: payment.amount,
      currency: payment.currency || 'TZS',
      gateway: gateway,
      payment_methods: [gateway],
      redirect_url: `https://gopay.tz/payment-success?ref=${payment.reference}`,
      cancel_url: `https://gopay.tz/payment-cancel?ref=${payment.reference}`,
      webhook_url: `https://gopay.tz/api/payment-webhook`,
      no_of_items: 1,
    };

    // Sign request (Selcom uses HMAC-SHA256)
    const timestamp = Date.now();
    const signedFields = `vendor=${selcomVendor}&order_id=${orderId}&amount=${payment.amount}&currency=${payment.currency}`;
    
    // In production, implement proper HMAC signing
    const signature = await generateHMAC(signedFields, selcomApiSecret);

    const response = await fetch(selcomEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `SELCOM ${selcomApiKey}`,
        'Digest-Method': 'HS256',
        'Digest': signature,
        'Timestamp': timestamp.toString(),
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (response.ok && result.result === 0) {
      // Store transaction
      await kv.set(`transaction:${orderId}`, {
        transactionId: orderId,
        userId: payment.userId,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        status: 'pending',
        aggregator: 'selcom',
        reference: payment.reference,
        createdAt: new Date().toISOString(),
        selcomData: result,
      });

      return {
        success: true,
        transactionId: orderId,
        status: 'pending',
        message: 'Payment initiated successfully. Complete payment on your phone.',
        aggregator: 'selcom',
      };
    } else {
      throw new Error(result.message || 'Selcom payment failed');
    }
  } catch (error) {
    console.error('Selcom payment error:', error);
    throw error;
  }
}

// ============================================
// 2. M-PESA DARAJA API (DIRECT - VODACOM)
// ============================================
// C2B, B2C, Reversals, Confirmations
// Docs: https://developer.safaricom.co.ke/Documentation

async function processMpesaDaraja(payment: PaymentRequest): Promise<PaymentResponse> {
  const mpesaConsumerKey = Deno.env.get('MPESA_CONSUMER_KEY');
  const mpesaConsumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET');
  const mpesaShortcode = Deno.env.get('MPESA_SHORTCODE') || '174379';
  const mpesaPasskey = Deno.env.get('MPESA_PASSKEY');

  if (!mpesaConsumerKey || !mpesaConsumerSecret) {
    console.warn('M-Pesa credentials not configured, using demo mode');
    return createDemoPaymentResponse('mpesa-daraja', payment);
  }

  try {
    // Step 1: Get OAuth token
    const authResponse = await fetch(
      'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${btoa(`${mpesaConsumerKey}:${mpesaConsumerSecret}`)}`,
        },
      }
    );

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Step 2: STK Push (Lipa na M-Pesa Online)
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = btoa(`${mpesaShortcode}${mpesaPasskey}${timestamp}`);
    
    const transactionId = `GO-MPESA-${Date.now()}`;

    const stkPushResponse = await fetch(
      'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          BusinessShortCode: mpesaShortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: Math.round(payment.amount),
          PartyA: payment.phoneNumber?.replace(/\D/g, ''),
          PartyB: mpesaShortcode,
          PhoneNumber: payment.phoneNumber?.replace(/\D/g, ''),
          CallBackURL: 'https://gopay.tz/api/mpesa-callback',
          AccountReference: payment.reference,
          TransactionDesc: payment.description,
        }),
      }
    );

    const stkResult = await stkPushResponse.json();

    if (stkResult.ResponseCode === '0') {
      await kv.set(`transaction:${transactionId}`, {
        transactionId,
        userId: payment.userId,
        amount: payment.amount,
        status: 'pending',
        aggregator: 'mpesa-daraja',
        mpesaCheckoutRequestID: stkResult.CheckoutRequestID,
        reference: payment.reference,
        createdAt: new Date().toISOString(),
      });

      return {
        success: true,
        transactionId,
        status: 'pending',
        message: 'Check your phone to complete M-Pesa payment',
        aggregator: 'mpesa-daraja',
      };
    } else {
      throw new Error(stkResult.ResponseDescription || 'M-Pesa payment failed');
    }
  } catch (error) {
    console.error('M-Pesa Daraja error:', error);
    throw error;
  }
}

// ============================================
// 3. AIRTEL MONEY API
// ============================================
// Collections, Disbursements, Wallet-to-Wallet

async function processAirtelMoney(payment: PaymentRequest): Promise<PaymentResponse> {
  const airtelClientId = Deno.env.get('AIRTEL_CLIENT_ID');
  const airtelClientSecret = Deno.env.get('AIRTEL_CLIENT_SECRET');
  const airtelApiKey = Deno.env.get('AIRTEL_API_KEY');

  if (!airtelClientId || !airtelClientSecret) {
    console.warn('Airtel Money credentials not configured, using demo mode');
    return createDemoPaymentResponse('airtel', payment);
  }

  try {
    // Step 1: Get OAuth token
    const authResponse = await fetch(
      'https://openapiuat.airtel.africa/auth/oauth2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: airtelClientId,
          client_secret: airtelClientSecret,
          grant_type: 'client_credentials',
        }),
      }
    );

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Step 2: Collection Request
    const transactionId = `GO-AIRTEL-${Date.now()}`;

    const collectionResponse = await fetch(
      'https://openapiuat.airtel.africa/merchant/v1/payments/',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Country': 'TZ',
          'X-Currency': 'TZS',
        },
        body: JSON.stringify({
          reference: transactionId,
          subscriber: {
            country: 'TZ',
            currency: 'TZS',
            msisdn: payment.phoneNumber?.replace(/\D/g, ''),
          },
          transaction: {
            amount: payment.amount,
            country: 'TZ',
            currency: 'TZS',
            id: transactionId,
          },
        }),
      }
    );

    const result = await collectionResponse.json();

    if (result.status?.code === '200' || result.status?.success) {
      await kv.set(`transaction:${transactionId}`, {
        transactionId,
        userId: payment.userId,
        amount: payment.amount,
        status: 'pending',
        aggregator: 'airtel',
        airtelTransactionId: result.data?.transaction?.id,
        reference: payment.reference,
        createdAt: new Date().toISOString(),
      });

      return {
        success: true,
        transactionId,
        status: 'pending',
        message: 'Check your phone to approve Airtel Money payment',
        aggregator: 'airtel',
      };
    } else {
      throw new Error(result.status?.message || 'Airtel Money payment failed');
    }
  } catch (error) {
    console.error('Airtel Money error:', error);
    throw error;
  }
}

// ============================================
// 4. TIGOPESA API
// ============================================
// Pay with Tigo, Merchant API, Push-to-pay

async function processTigoPesa(payment: PaymentRequest): Promise<PaymentResponse> {
  const tigoUsername = Deno.env.get('TIGO_USERNAME');
  const tigoPassword = Deno.env.get('TIGO_PASSWORD');
  const tigoMerchantCode = Deno.env.get('TIGO_MERCHANT_CODE');

  if (!tigoUsername || !tigoPassword) {
    console.warn('TigoPesa credentials not configured, using demo mode');
    return createDemoPaymentResponse('tigo', payment);
  }

  try {
    const transactionId = `GO-TIGO-${Date.now()}`;

    const response = await fetch(
      'https://secure.tigo.com/ivr_payment/payment/transaction/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${tigoUsername}:${tigoPassword}`)}`,
        },
        body: JSON.stringify({
          MasterMerchantCode: tigoMerchantCode,
          MerchantReference: transactionId,
          Amount: payment.amount,
          CustomerMSISDN: payment.phoneNumber?.replace(/\D/g, ''),
          MerchantName: 'goPay',
          Remarks: payment.description,
        }),
      }
    );

    const result = await response.json();

    if (result.ResponseCode === '0' || result.status === 'SUCCESS') {
      await kv.set(`transaction:${transactionId}`, {
        transactionId,
        userId: payment.userId,
        amount: payment.amount,
        status: 'pending',
        aggregator: 'tigo',
        tigoReference: result.ReferenceID,
        reference: payment.reference,
        createdAt: new Date().toISOString(),
      });

      return {
        success: true,
        transactionId,
        status: 'pending',
        message: 'Check your phone to complete TigoPesa payment',
        aggregator: 'tigo',
      };
    } else {
      throw new Error(result.ResponseDescription || 'TigoPesa payment failed');
    }
  } catch (error) {
    console.error('TigoPesa error:', error);
    throw error;
  }
}

// ============================================
// 5. HALOPESA API
// ============================================

async function processHaloPesa(payment: PaymentRequest): Promise<PaymentResponse> {
  const haloApiKey = Deno.env.get('HALOPESA_API_KEY');
  const haloMerchantId = Deno.env.get('HALOPESA_MERCHANT_ID');

  if (!haloApiKey) {
    console.warn('HaloPesa credentials not configured, using demo mode');
    return createDemoPaymentResponse('halopesa', payment);
  }

  try {
    const transactionId = `GO-HALO-${Date.now()}`;

    const response = await fetch(
      'https://api.halopesa.co.tz/collections',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${haloApiKey}`,
        },
        body: JSON.stringify({
          merchant_id: haloMerchantId,
          reference: transactionId,
          amount: payment.amount,
          currency: 'TZS',
          phone_number: payment.phoneNumber,
          description: payment.description,
        }),
      }
    );

    const result = await response.json();

    if (result.status === 'success') {
      await kv.set(`transaction:${transactionId}`, {
        transactionId,
        userId: payment.userId,
        amount: payment.amount,
        status: 'pending',
        aggregator: 'halopesa',
        reference: payment.reference,
        createdAt: new Date().toISOString(),
      });

      return {
        success: true,
        transactionId,
        status: 'pending',
        message: 'Check your phone to complete HaloPesa payment',
        aggregator: 'halopesa',
      };
    } else {
      throw new Error(result.message || 'HaloPesa payment failed');
    }
  } catch (error) {
    console.error('HaloPesa error:', error);
    throw error;
  }
}

// ============================================
// 6. PESAPAL INTEGRATION
// ============================================

async function processPesapal(payment: PaymentRequest): Promise<PaymentResponse> {
  const pesapalKey = Deno.env.get('PESAPAL_CONSUMER_KEY');
  const pesapalSecret = Deno.env.get('PESAPAL_CONSUMER_SECRET');

  if (!pesapalKey || !pesapalSecret) {
    console.warn('Pesapal credentials not configured, using demo mode');
    return createDemoPaymentResponse('pesapal', payment);
  }

  try {
    // OAuth authentication
    const authResponse = await fetch(
      'https://pay.pesapal.com/v3/api/Auth/RequestToken',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consumer_key: pesapalKey,
          consumer_secret: pesapalSecret,
        }),
      }
    );

    const authData = await authResponse.json();
    const token = authData.token;

    const transactionId = `GO-PESAPAL-${Date.now()}`;

    const orderResponse = await fetch(
      'https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: transactionId,
          currency: 'TZS',
          amount: payment.amount,
          description: payment.description,
          callback_url: 'https://gopay.tz/api/pesapal-callback',
          notification_id: 'GOPAY-NOTIFICATION',
          billing_address: {
            phone_number: payment.phoneNumber,
            email_address: `user-${payment.userId}@gopay.tz`,
          },
        }),
      }
    );

    const result = await orderResponse.json();

    if (result.status === '200') {
      await kv.set(`transaction:${transactionId}`, {
        transactionId,
        userId: payment.userId,
        amount: payment.amount,
        status: 'pending',
        aggregator: 'pesapal',
        pesapalOrderId: result.order_tracking_id,
        reference: payment.reference,
        createdAt: new Date().toISOString(),
      });

      return {
        success: true,
        transactionId,
        status: 'pending',
        message: 'Redirecting to payment page...',
        aggregator: 'pesapal',
      };
    } else {
      throw new Error('Pesapal payment failed');
    }
  } catch (error) {
    console.error('Pesapal error:', error);
    throw error;
  }
}

// ============================================
// 7. CLICKPESA INTEGRATION
// ============================================
// ClickPesa: Tanzania payment gateway
// Supports: M-Pesa, Airtel Money, Tigo Pesa, Halopesa, Cards
// Docs: https://developer.clickpesa.com

async function processClickPesa(payment: PaymentRequest): Promise<PaymentResponse> {
  const clickpesaApiKey = Deno.env.get('CLICKPESA_API_KEY');
  const clickpesaSecretKey = Deno.env.get('CLICKPESA_SECRET_KEY');
  const clickpesaMerchantId = Deno.env.get('CLICKPESA_MERCHANT_ID') || 'GOPAY';

  if (!clickpesaApiKey || !clickpesaSecretKey) {
    throw new Error('ClickPesa API credentials not configured. Please contact support.');
  }

  try {
    const transactionId = `GO-CLICKPESA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Map payment method to ClickPesa channel
    let paymentChannel = '';
    switch (payment.paymentMethod) {
      case 'mpesa':
        paymentChannel = 'MPESA';
        break;
      case 'airtel':
        paymentChannel = 'AIRTELMONEY';
        break;
      case 'tigo':
        paymentChannel = 'TIGOPESA';
        break;
      case 'halopesa':
        paymentChannel = 'HALOPESA';
        break;
      case 'card':
        paymentChannel = 'CARD';
        break;
      default:
        paymentChannel = 'MPESA';
    }

    // Clean phone number (remove country code if present, ClickPesa expects local format)
    const cleanPhone = payment.phoneNumber?.replace(/\D/g, '').replace(/^255/, '0') || '';

    const requestBody = {
      merchant_reference: transactionId,
      amount: payment.amount,
      currency: payment.currency || 'TZS',
      payment_channel: paymentChannel,
      phone_number: cleanPhone,
      email: `user-${payment.userId}@gopay.tz`,
      first_name: 'GoPay',
      last_name: 'User',
      description: payment.description || 'Payment via GoPay',
      callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-69a10ee8/payment/clickpesa-callback`,
    };

    console.log('ClickPesa payment request:', { 
      transactionId, 
      amount: payment.amount, 
      channel: paymentChannel,
      phone: cleanPhone 
    });

    const response = await fetch('https://api.clickpesa.com/v1/payments/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clickpesaApiKey}`,
        'X-API-Key': clickpesaApiKey,
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    console.log('ClickPesa API response:', { status: response.status, result });

    if (response.ok && result.status === 'success') {
      // Store transaction
      await kv.set(`transaction:${transactionId}`, {
        transactionId,
        userId: payment.userId,
        amount: payment.amount,
        currency: payment.currency || 'TZS',
        paymentMethod: payment.paymentMethod,
        status: 'pending',
        aggregator: 'clickpesa',
        reference: payment.reference,
        clickpesaTransactionId: result.data?.transaction_id || result.transaction_id,
        clickpesaCheckoutUrl: result.data?.checkout_url || result.checkout_url,
        description: payment.description,
        phoneNumber: cleanPhone,
        createdAt: new Date().toISOString(),
      });

      return {
        success: true,
        transactionId,
        status: 'pending',
        message: payment.paymentMethod === 'card' 
          ? 'Redirecting to card payment page...' 
          : 'Angalia simu yako ili kukamilisha malipo',
        aggregator: 'clickpesa',
      };
    } else {
      const errorMessage = result.message || result.error || 'ClickPesa payment request failed';
      console.error('ClickPesa payment failed:', errorMessage, result);
      throw new Error(`Malipo yameshindikana: ${errorMessage}`);
    }
  } catch (error: any) {
    console.error('ClickPesa payment error:', error);
    throw new Error(`Hitilafu ya malipo: ${error.message}`);
  }
}

// ============================================
// UNIFIED PAYMENT PROCESSOR
// ============================================

paymentAggregatorApp.post('/process-payment', async (c) => {
  const userId = await verifyUser(c.req.header('Authorization'));
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const payment: PaymentRequest & { userId?: string } = await c.req.json();

    // The authenticated user's own verified id is always used for anything
    // that credits/debits an account (rewards below). Any userId sent in the
    // body is ignored for that purpose — it was previously trusted directly,
    // which let a caller credit reward points to an arbitrary account.
    payment.userId = userId;

    // Validate payment
    if (!payment.amount || payment.amount <= 0) {
      return c.json({ error: 'Invalid payment amount' }, 400);
    }

    if (!payment.paymentMethod) {
      return c.json({ error: 'Payment method is required' }, 400);
    }

    let result: PaymentResponse;

    // ALL MOBILE MONEY PAYMENTS GO THROUGH CLICKPESA
    // M-Pesa, Airtel Money, Tigo Pesa, Halopesa, Cards → ClickPesa Gateway
    const mobileMoneyMethods = ['mpesa', 'airtel', 'tigo', 'halopesa', 'card'];
    
    if (mobileMoneyMethods.includes(payment.paymentMethod)) {
      // Use ClickPesa for all mobile money and card payments
      result = await processClickPesa(payment);
    } else {
      // Fallback for other payment methods (bank transfers, etc.)
      const preferredAggregator = Deno.env.get('PREFERRED_AGGREGATOR') || 'clickpesa';

      if (preferredAggregator === 'clickpesa') {
        result = await processClickPesa(payment);
      } else if (preferredAggregator === 'selcom') {
        result = await processSelcomPayment(payment);
      } else if (preferredAggregator === 'pesapal') {
        result = await processPesapal(payment);
      } else {
        // Direct API routing (legacy, not used for mobile money)
        switch (payment.paymentMethod) {
          case 'mpesa':
            result = await processMpesaDaraja(payment);
            break;
          case 'airtel':
            result = await processAirtelMoney(payment);
            break;
          case 'tigo':
            result = await processTigoPesa(payment);
            break;
          case 'halopesa':
            result = await processHaloPesa(payment);
            break;
          default:
            result = await processPesapal(payment);
        }
      }
    }

    // Award GOrewards points (10 points per TZS spent)
    if (result.success) {
      const points = Math.floor(payment.amount * 0.1);
      const currentRewards = await kv.get(`rewards:${payment.userId}`) || {
        points: 0,
        tier: 'Bronze',
        cashback: 0,
      };

      await kv.set(`rewards:${payment.userId}`, {
        ...currentRewards,
        points: currentRewards.points + points,
      });
    }

    return c.json(result);
  } catch (error: any) {
    console.error('Payment processing error:', error);
    return c.json(
      {
        success: false,
        error: error.message || 'Payment processing failed',
      },
      500
    );
  }
});

// ============================================
// B2C - WITHDRAW / DISBURSE TO USER
// ============================================

paymentAggregatorApp.post('/disburse', async (c) => {
  // Previously this endpoint took userId, amount, phoneNumber straight from
  // the request body with no authentication at all — anyone could disburse
  // real money to any phone number. Fixed: caller must be authenticated, the
  // verified user's own id is the only one ever used, and the amount is
  // debited from that user's real ledger balance (with idempotency) before
  // any money-movement API is called.
  const userId = await verifyUser(c.req.header('Authorization'));
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { amount, phoneNumber, paymentMethod, idempotencyKey } = await c.req.json();

    if (!amount || amount <= 0) {
      return c.json({ success: false, error: 'Invalid amount' }, 400);
    }
    if (!phoneNumber || !paymentMethod) {
      return c.json({ success: false, error: 'phoneNumber and paymentMethod are required' }, 400);
    }

    const wallet = await kv.get(`wallet:${userId}`);
    if (!wallet) {
      return c.json({ success: false, error: 'Wallet not found' }, 404);
    }

    // idempotencyKey should be client-generated and stable across retries of
    // the SAME disbursement attempt, matching the pattern used by
    // wallet/add-funds and wallet/send-money.
    const key = idempotencyKey || crypto.randomUUID();

    // Debit first. process_wallet_transaction is expected to reject the
    // debit if it would take the ledger balance negative — that rejection
    // is this endpoint's balance check. If that assumption is wrong (i.e.
    // the function does not itself enforce a non-negative balance), this
    // must be fixed at the database function before this endpoint is
    // considered safe to use with real disbursement credentials.
    const { data: debitResult, error: debitError } = await supabase.rpc('process_wallet_transaction', {
      p_idempotency_key: key,
      p_user_id: userId,
      p_endpoint: 'payment-aggregator/disburse',
      p_entry_type: 'debit',
      p_amount: parseInt(amount),
      p_currency: wallet.currency || 'TZS',
      p_description: `Disbursement to ${phoneNumber} via ${paymentMethod}`,
    });

    if (debitError) throw debitError;
    if (debitResult.error) {
      // Covers both "insufficient balance" and "duplicate idempotency key"
      // style rejections from the ledger function.
      return c.json({ success: false, error: debitResult.message || debitResult.error }, debitResult.error === 'conflict' ? 409 : 400);
    }

    const transactionId = `GO-DISBURSE-${Date.now()}`;
    let result: PaymentResponse;

    try {
      switch (paymentMethod) {
        case 'mpesa':
          result = await disburseMpesa(phoneNumber, amount, transactionId);
          break;
        case 'airtel':
          result = await disburseAirtel(phoneNumber, amount, transactionId);
          break;
        case 'tigo':
          result = await disburseTigo(phoneNumber, amount, transactionId);
          break;
        default:
          throw new Error('Unsupported disbursement method');
      }
    } catch (providerError: any) {
      // The ledger was already debited but the money never actually left —
      // this is exactly the "payment succeeds but the call to move money
      // fails" failure mode. Credit the debit back so the user's real
      // balance is correct, then report the failure.
      await supabase.rpc('process_wallet_transaction', {
        p_idempotency_key: `${key}-refund`,
        p_user_id: userId,
        p_endpoint: 'payment-aggregator/disburse-refund',
        p_entry_type: 'credit',
        p_amount: parseInt(amount),
        p_currency: wallet.currency || 'TZS',
        p_description: `Refund: disbursement to ${phoneNumber} failed at provider`,
      });
      throw providerError;
    }

    if (!result.success) {
      // Provider responded but reported failure (as opposed to throwing) —
      // same compensating-credit logic applies.
      await supabase.rpc('process_wallet_transaction', {
        p_idempotency_key: `${key}-refund`,
        p_user_id: userId,
        p_endpoint: 'payment-aggregator/disburse-refund',
        p_entry_type: 'credit',
        p_amount: parseInt(amount),
        p_currency: wallet.currency || 'TZS',
        p_description: `Refund: disbursement to ${phoneNumber} declined by provider`,
      });
      return c.json(result);
    }

    // Keep the kv wallet record's cached balance in sync, matching the
    // pattern already used in wallet/add-funds — the ledger remains the
    // source of truth.
    wallet.balance = debitResult.newBalance;
    await kv.set(`wallet:${userId}`, wallet);

    return c.json(result);
  } catch (error: any) {
    console.error('Disbursement error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================
// WEBHOOK HANDLERS
// ============================================

// M-Pesa callback
paymentAggregatorApp.post('/mpesa-callback', async (c) => {
  try {
    const callback = await c.req.json();
    console.log('M-Pesa callback received:', { ResultCode: callback.Body?.stkCallback?.ResultCode, CheckoutRequestID: callback.Body?.stkCallback?.CheckoutRequestID });

    // Update transaction status
    if (callback.Body?.stkCallback?.ResultCode === 0) {
      // Payment successful
      const checkoutRequestID = callback.Body.stkCallback.CheckoutRequestID;
      // Update transaction in KV store
    }

    return c.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    return c.json({ ResultCode: 1, ResultDesc: 'Failed' });
  }
});

// Selcom webhook
paymentAggregatorApp.post('/selcom-webhook', async (c) => {
  try {
    // Real signature verification + transaction/ledger update, using the
    // payments/ module ported from an earlier, more complete design that
    // was built but never wired in here. Previously this handler did
    // neither — it only logged and acknowledged receipt.
    //
    // VERIFY BEFORE PRODUCTION USE: the exact header Selcom sends the
    // webhook signature in is not confirmed against Selcom's own docs.
    // 'Digest' is used here because it matches the header name Selcom's
    // own API expects on *outbound* requests from this app (see
    // selcomHeaders() above) — a reasonable starting guess, not a
    // confirmed fact. Getting this wrong fails closed (valid webhooks get
    // rejected with 401), not open, but must be confirmed against a real
    // Selcom merchant dashboard/support contact before this path is relied
    // on with real transactions.
    const rawBody = await c.req.text();
    const signature = c.req.header('Digest') || '';
    const selcomWebhookSecret = Deno.env.get('SELCOM_WEBHOOK_SECRET') || Deno.env.get('SELCOM_API_SECRET') || '';

    const webhook = JSON.parse(rawBody);
    console.log('Selcom webhook received:', { order_id: webhook.order_id, transid: webhook.transid, result: webhook.result });

    if (!selcomWebhookSecret) {
      console.error('Selcom webhook received but no webhook secret is configured — rejecting rather than accepting unverified');
      return c.json({ status: 'not_configured' }, 500);
    }

    const result = await handleSelcomWebhook(rawBody, signature, selcomWebhookSecret, supabase, kv);
    return c.json(result.body, result.status as any);
  } catch (error) {
    console.error('Selcom webhook error:', error);
    return c.json({ status: 'error' }, 500);
  }
});

// ClickPesa webhook
paymentAggregatorApp.post('/clickpesa-callback', async (c) => {
  try {
    const callback = await c.req.json();
    console.log('ClickPesa callback received:', { merchant_reference: callback.merchant_reference, status: callback.status, payment_id: callback.payment_id });

    // Verify signature. Previously this skipped verification entirely (fail
    // open) whenever the secret key or the signature field was absent — an
    // attacker could omit the signature field and have any fabricated
    // callback accepted. Now both a missing server-side secret and a missing
    // or wrong signature are rejected (fail closed).
    const clickpesaSecretKey = Deno.env.get('CLICKPESA_SECRET_KEY');
    if (!clickpesaSecretKey) {
      console.error('ClickPesa webhook received but CLICKPESA_SECRET_KEY is not configured — rejecting rather than accepting unverified');
      return c.json({ status: 'not_configured' }, 500);
    }
    if (!callback.signature) {
      console.error('ClickPesa callback missing signature field');
      return c.json({ status: 'signature_missing' }, 401);
    }
    const expectedSignature = await generateHMAC(
      `${callback.merchant_reference}${callback.status}${callback.amount}`,
      clickpesaSecretKey
    );
    if (callback.signature !== expectedSignature) {
      console.error('ClickPesa signature verification failed');
      return c.json({ status: 'signature_mismatch' }, 401);
    }

    // Update transaction status
    if (callback.status === 'success' || callback.status === 'completed') {
      const transaction = await kv.get(`transaction:${callback.merchant_reference}`);
      if (transaction) {
        await kv.set(`transaction:${callback.merchant_reference}`, {
          ...transaction,
          status: 'completed',
          clickpesaPaymentId: callback.payment_id,
          completedAt: new Date().toISOString(),
        });
      }
    } else if (callback.status === 'failed' || callback.status === 'cancelled') {
      const transaction = await kv.get(`transaction:${callback.merchant_reference}`);
      if (transaction) {
        await kv.set(`transaction:${callback.merchant_reference}`, {
          ...transaction,
          status: 'failed',
          failureReason: callback.message || 'Payment failed',
          failedAt: new Date().toISOString(),
        });
      }
    }

    return c.json({ status: 'received', message: 'Callback processed successfully' });
  } catch (error) {
    console.error('ClickPesa callback error:', error);
    return c.json({ status: 'error', message: 'Callback processing failed' }, 500);
  }
});

// ============================================
// TRANSACTION STATUS
// ============================================

paymentAggregatorApp.get('/transaction/:id', async (c) => {
  try {
    const transactionId = c.req.param('id');
    const transaction = await kv.get(`transaction:${transactionId}`);

    if (!transaction) {
      return c.json({ error: 'Transaction not found' }, 404);
    }

    return c.json(transaction);
  } catch (error: any) {
    console.error('Transaction fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function generateHMAC(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

function createDemoPaymentResponse(aggregator: string, payment: PaymentRequest): PaymentResponse {
  const transactionId = `GO-DEMO-${aggregator.toUpperCase()}-${Date.now()}`;
  
  return {
    success: true,
    transactionId,
    status: 'pending',
    message: `[DEMO MODE] Payment initiated via ${aggregator}. In production, user will receive payment prompt on phone.`,
    aggregator,
  };
}

async function disburseMpesa(phone: string, amount: number, ref: string): Promise<PaymentResponse> {
  // M-Pesa B2C implementation
  return createDemoPaymentResponse('mpesa-b2c', {
    amount,
    currency: 'TZS',
    paymentMethod: 'mpesa',
    phoneNumber: phone,
    description: 'Withdrawal',
    userId: 'system',
    reference: ref,
  });
}

async function disburseAirtel(phone: string, amount: number, ref: string): Promise<PaymentResponse> {
  // Airtel disbursement implementation
  return createDemoPaymentResponse('airtel-disbursement', {
    amount,
    currency: 'TZS',
    paymentMethod: 'airtel',
    phoneNumber: phone,
    description: 'Withdrawal',
    userId: 'system',
    reference: ref,
  });
}

async function disburseTigo(phone: string, amount: number, ref: string): Promise<PaymentResponse> {
  // Tigo disbursement implementation
  return createDemoPaymentResponse('tigo-disbursement', {
    amount,
    currency: 'TZS',
    paymentMethod: 'tigo',
    phoneNumber: phone,
    description: 'Withdrawal',
    userId: 'system',
    reference: ref,
  });
}

export default paymentAggregatorApp;