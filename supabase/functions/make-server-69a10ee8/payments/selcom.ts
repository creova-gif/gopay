import type { PaymentRequest, PaymentResult, TxStatus } from './types.ts';
import { computeHmac, constantTimeEqual } from './utils.ts';

const SELCOM_C2B_URL = 'https://apigw.selcommobile.com/v1/checkout/create-order';
const SELCOM_B2C_URL = 'https://apigw.selcommobile.com/v1/checkout/wallet-to-phone';

function demoResult(req: PaymentRequest): PaymentResult {
  return {
    success: true,
    providerRef: `DEMO-SEL-${Date.now()}`,
    status: 'pending',
    message: '[DEMO] Selcom push sent — approve on your phone',
    demo: true,
  };
}

function selcomGateway(network: string): string {
  const map: Record<string, string> = {
    mpesa: 'MPESA',
    tigo: 'TIGOPESA',
    airtel: 'AIRTELMONEY',
    halopesa: 'HALOPESA',
  };
  return map[network] ?? 'MPESA';
}

async function selcomHeaders(
  apiKey: string,
  apiSecret: string,
  vendor: string,
  orderId: string,
  amount: number,
): Promise<Record<string, string>> {
  const timestamp = Date.now().toString();
  const sigPayload = `vendor=${vendor}&order_id=${orderId}&amount=${amount}&currency=TZS`;
  const digest = await computeHmac(sigPayload, apiSecret);
  return {
    'Content-Type': 'application/json',
    Authorization: `SELCOM ${apiKey}`,
    'Digest-Method': 'HS256',
    Digest: digest,
    Timestamp: timestamp,
  };
}

export async function initiateC2B(req: PaymentRequest): Promise<PaymentResult> {
  const apiKey = Deno.env.get('SELCOM_API_KEY');
  const apiSecret = Deno.env.get('SELCOM_API_SECRET');
  const vendor = Deno.env.get('SELCOM_VENDOR_ID') ?? 'GOPAY';

  if (!apiKey || !apiSecret) return demoResult(req);

  const orderId = req.reference;
  const body = {
    vendor,
    order_id: orderId,
    buyer_phone: req.phone.replace(/\D/g, ''),
    buyer_email: `user-${req.userId}@gopay.tz`,
    buyer_name: 'goPay User',
    amount: req.amount,
    currency: 'TZS',
    gateway: selcomGateway(req.network),
    payment_methods: [selcomGateway(req.network)],
    webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-69a10ee8/payment/webhook/selcom`,
    no_of_items: 1,
  };

  const headers = await selcomHeaders(apiKey, apiSecret, vendor, orderId, req.amount);
  const res = await fetch(SELCOM_C2B_URL, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await res.json();

  if (!res.ok || data.result !== 0) {
    return { success: false, providerRef: orderId, status: 'failed', message: data.message ?? 'Selcom error' };
  }
  return { success: true, providerRef: orderId, status: 'pending', message: 'Angalia simu yako' };
}

export async function initiateB2C(req: PaymentRequest): Promise<PaymentResult> {
  const apiKey = Deno.env.get('SELCOM_API_KEY');
  const apiSecret = Deno.env.get('SELCOM_API_SECRET');
  const vendor = Deno.env.get('SELCOM_VENDOR_ID') ?? 'GOPAY';

  if (!apiKey || !apiSecret) return demoResult(req);

  const orderId = req.reference;
  const body = {
    vendor,
    order_id: orderId,
    msisdn: req.phone.replace(/\D/g, ''),
    amount: req.amount,
    currency: 'TZS',
    gateway: selcomGateway(req.network),
    webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-69a10ee8/payment/webhook/selcom`,
  };

  const headers = await selcomHeaders(apiKey, apiSecret, vendor, orderId, req.amount);
  const res = await fetch(SELCOM_B2C_URL, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await res.json();

  if (!res.ok || data.result !== 0) {
    return { success: false, providerRef: orderId, status: 'failed', message: data.message ?? 'Selcom B2C error' };
  }
  return { success: true, providerRef: orderId, status: 'pending', message: 'Inatumwa kwa simu yako' };
}

export async function verifySelcomWebhook(
  rawBody: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const expected = await computeHmac(rawBody, secret);
  return constantTimeEqual(signature, expected);
}

export function parseSelcomWebhookEvent(body: unknown): { providerRef: string; status: TxStatus } {
  const b = body as Record<string, unknown>;
  const providerRef = String(b.transid ?? b.order_id ?? '');
  const result = String(b.result ?? '').toUpperCase();
  const status: TxStatus = result === 'SUCCESS' ? 'completed' : 'failed';
  return { providerRef, status };
}
