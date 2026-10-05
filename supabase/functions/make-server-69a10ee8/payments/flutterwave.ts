import type { PaymentRequest, PaymentResult, TxStatus } from './types.ts';
import { constantTimeEqual } from './utils.ts';

const FLW_PAYMENT_URL = 'https://api.flutterwave.com/v3/payments';

function demoResult(req: PaymentRequest): PaymentResult {
  return {
    success: true,
    providerRef: req.reference,
    status: 'pending',
    message: '[DEMO] Card payment initiated',
    demo: true,
  };
}

export async function initiateCard(req: PaymentRequest): Promise<PaymentResult> {
  const secretKey = Deno.env.get('FLUTTERWAVE_SECRET_KEY');
  if (!secretKey) return demoResult(req);

  const body = {
    tx_ref: req.reference,
    amount: req.amount,
    currency: 'TZS',
    redirect_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-69a10ee8/payment/flutterwave-redirect`,
    customer: {
      email: `user-${req.userId}@gopay.tz`,
      phonenumber: req.phone,
      name: 'goPay User',
    },
    customizations: {
      title: 'goPay Wallet Top-Up',
      description: req.description,
      logo: 'https://gopay.tz/logo.png',
    },
  };

  const res = await fetch(FLW_PAYMENT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secretKey}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (!res.ok || data.status !== 'success') {
    return { success: false, providerRef: req.reference, status: 'failed', message: data.message ?? 'Flutterwave error' };
  }
  return {
    success: true,
    providerRef: req.reference,
    status: 'pending',
    message: data.data?.link ?? 'Payment link ready',
  };
}

export function verifyFlutterwaveWebhook(
  storedHash: string,
  receivedHash: string,
): boolean {
  return constantTimeEqual(storedHash, receivedHash);
}

export function parseFlutterwaveWebhookEvent(body: unknown): { providerRef: string; status: TxStatus } {
  const b = body as Record<string, unknown>;
  const data = b.data as Record<string, unknown>;
  const providerRef = String(data?.tx_ref ?? '');
  const flwStatus = String(data?.status ?? '').toLowerCase();
  const status: TxStatus = flwStatus === 'successful' ? 'completed' : 'failed';
  return { providerRef, status };
}
