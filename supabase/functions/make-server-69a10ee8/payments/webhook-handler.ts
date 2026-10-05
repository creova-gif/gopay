import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { TxStatus } from './types.ts';
import { verifySelcomWebhook, parseSelcomWebhookEvent } from './selcom.ts';
import { verifyFlutterwaveWebhook, parseFlutterwaveWebhookEvent } from './flutterwave.ts';

interface KvStore {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
}

interface HandlerResult {
  status: number;
  body: unknown;
}

// Balance changes triggered by a webhook go through process_wallet_transaction()
// (the append-only ledger built in the wallet-ledger-and-idempotency work),
// not a direct kv.set() on the cached wallet balance. This gives two things
// the original version didn't have: idempotency (the transaction row's own
// id is a stable key, so a webhook redelivered by the provider — a common,
// expected occurrence — cannot double-credit or double-refund), and a
// single source of truth for balance shared with every other wallet
// endpoint, rather than a second, separate balance-mutation path.
async function applyWebhookEvent(
  providerRef: string,
  newStatus: TxStatus,
  db: SupabaseClient,
  kv: KvStore,
): Promise<HandlerResult> {
  const { data: tx, error } = await db
    .from('transactions')
    .select('id,user_id,type,amount,currency,status')
    .eq('provider_ref', providerRef)
    .single();

  if (error || !tx) {
    console.warn('Webhook for unknown provider_ref:', providerRef);
    return { status: 200, body: { ok: true } };
  }

  if (tx.status === 'completed' || tx.status === 'failed') {
    return { status: 200, body: { ok: true, note: 'already settled' } };
  }

  const { error: updateError } = await db
    .from('transactions')
    .update({ status: newStatus })
    .eq('id', tx.id)
    .select('id')
    .single();

  if (updateError) {
    console.error('Failed to update transaction:', updateError.message);
    return { status: 500, body: { error: 'DB update failed' } };
  }

  const shouldCredit = newStatus === 'completed' && tx.type === 'topup';
  const shouldRefund = newStatus === 'failed' && (tx.type === 'withdrawal' || tx.type === 'p2p_send');

  if (shouldCredit || shouldRefund) {
    const { error: ledgerError } = await db.rpc('process_wallet_transaction', {
      p_idempotency_key: `webhook-${tx.id}`,
      p_user_id: tx.user_id,
      p_endpoint: 'payments/webhook',
      p_entry_type: 'credit',
      p_amount: Number(tx.amount),
      p_currency: tx.currency || 'TZS',
      p_description: shouldCredit
        ? `Top-up completed (${providerRef})`
        : `Refund: ${tx.type} failed at provider (${providerRef})`,
    });

    if (ledgerError) {
      console.error('Ledger update failed for webhook event:', ledgerError.message);
      return { status: 500, body: { error: 'Ledger update failed' } };
    }

    // Keep the kv wallet record's cached balance in sync for endpoints that
    // still read it directly — gopay_wallet_balance remains the source of
    // truth, matching the pattern already used in wallet/add-funds and
    // payment-aggregator.tsx's /disburse.
    const { data: balanceRow } = await db
      .from('gopay_wallet_balance')
      .select('balance')
      .eq('user_id', tx.user_id)
      .single();
    if (balanceRow) {
      const wallet = (await kv.get(`wallet:${tx.user_id}`) as Record<string, unknown> | null) ?? {};
      await kv.set(`wallet:${tx.user_id}`, { ...wallet, balance: balanceRow.balance });
    }
  }

  return { status: 200, body: { ok: true } };
}

export async function handleSelcomWebhook(
  rawBody: string,
  signature: string,
  secret: string,
  db: SupabaseClient,
  kv: KvStore,
): Promise<HandlerResult> {
  const valid = await verifySelcomWebhook(rawBody, signature, secret);
  if (!valid) return { status: 401, body: { error: 'Invalid signature' } };

  const body = JSON.parse(rawBody);
  const { providerRef, status } = parseSelcomWebhookEvent(body);
  return applyWebhookEvent(providerRef, status, db, kv);
}

export async function handleFlutterwaveWebhook(
  rawBody: string,
  verifHash: string,
  storedHash: string,
  db: SupabaseClient,
  kv: KvStore,
): Promise<HandlerResult> {
  const valid = verifyFlutterwaveWebhook(storedHash, verifHash);
  if (!valid) return { status: 401, body: { error: 'Invalid hash' } };

  const body = JSON.parse(rawBody);
  const { providerRef, status } = parseFlutterwaveWebhookEvent(body);
  return applyWebhookEvent(providerRef, status, db, kv);
}
