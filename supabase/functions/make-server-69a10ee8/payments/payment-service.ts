import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { PaymentRequest, PaymentResult, TxType } from './types.ts';
import { initiateC2B, initiateB2C } from './selcom.ts';
import { initiateCard } from './flutterwave.ts';

async function insertTransaction(
  db: SupabaseClient,
  req: PaymentRequest,
  type: TxType,
  providerRef: string,
  provider: string,
): Promise<void> {
  const { error } = await db.from('transactions').insert({
    user_id: req.userId,
    type,
    provider,
    network: req.network,
    amount: req.amount,
    currency: req.currency,
    status: 'pending',
    provider_ref: providerRef,
    phone: req.phone,
  });
  if (error) throw new Error(`DB insert failed: ${error.message}`);
}

export async function processTopUp(
  db: SupabaseClient,
  req: PaymentRequest,
): Promise<PaymentResult> {
  let result: PaymentResult;
  let provider: string;

  if (req.network === 'card') {
    result = await initiateCard(req);
    provider = 'flutterwave';
  } else {
    result = await initiateC2B(req);
    provider = 'selcom';
  }

  if (result.success) {
    await insertTransaction(db, req, 'topup', result.providerRef, provider);
  }
  return result;
}

export async function processWithdrawal(
  db: SupabaseClient,
  req: PaymentRequest,
  currentBalance: number,
): Promise<PaymentResult> {
  if (currentBalance < req.amount) {
    return { success: false, providerRef: '', status: 'failed', message: 'Salio halitosha' };
  }
  const result = await initiateB2C(req);
  if (result.success) {
    await insertTransaction(db, req, 'withdrawal', result.providerRef, 'selcom');
  }
  return result;
}

export async function processExternalSend(
  db: SupabaseClient,
  req: PaymentRequest,
  currentBalance: number,
): Promise<PaymentResult> {
  if (currentBalance < req.amount) {
    return { success: false, providerRef: '', status: 'failed', message: 'Salio halitosha' };
  }
  const result = await initiateB2C(req);
  if (result.success) {
    await insertTransaction(db, req, 'p2p_send', result.providerRef, 'selcom');
  }
  return result;
}
