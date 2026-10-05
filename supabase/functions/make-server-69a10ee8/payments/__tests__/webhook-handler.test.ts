import { assertEquals } from 'jsr:@std/assert';
import { handleSelcomWebhook, handleFlutterwaveWebhook } from '../webhook-handler.ts';
import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';

// Updated to mock db.rpc('process_wallet_transaction', ...) and the
// gopay_wallet_balance lookup used to sync the kv cache afterward, matching
// webhook-handler.ts's real behavior (balance changes go through the ledger,
// not a direct kv.set arithmetic update).
function makeDb(txRow: Record<string, unknown> | null, opts?: { balanceAfter?: number; rpcCalls?: any[] }) {
  const rpcCalls = opts?.rpcCalls ?? [];
  return {
    from: (table: string) => {
      if (table === 'gopay_wallet_balance') {
        return {
          select: (_cols: string) => ({
            eq: (_col: string, _val: string) => ({
              single: async () => ({ data: { balance: opts?.balanceAfter ?? 0 }, error: null }),
            }),
          }),
        };
      }
      return {
        select: (_cols: string) => ({
          eq: (_col: string, _val: string) => ({
            single: async () => ({ data: txRow, error: txRow ? null : { message: 'not found' } }),
          }),
        }),
        update: (_data: Record<string, unknown>) => ({
          eq: (_col: string, _val: string) => ({
            select: (_cols: string) => ({
              single: async () => ({
                data: txRow ? { ...txRow, status: 'completed' } : null,
                error: null,
              }),
            }),
          }),
        }),
      };
    },
    rpc: async (fn: string, args: Record<string, unknown>) => {
      rpcCalls.push({ fn, args });
      return { data: { newBalance: opts?.balanceAfter ?? 0 }, error: null };
    },
  } as unknown as SupabaseClient;
}

function makeKv() {
  const store: Record<string, unknown> = {};
  return {
    get: async (key: string) => store[key] ?? null,
    set: async (key: string, val: unknown) => { store[key] = val; },
  };
}

Deno.test('handleSelcomWebhook returns 401 on bad signature', async () => {
  const db = makeDb(null);
  const kv = makeKv();
  const res = await handleSelcomWebhook('{"transid":"X","result":"SUCCESS"}', 'bad-sig', 'secret', db, kv);
  assertEquals(res.status, 401);
});

Deno.test('handleSelcomWebhook returns 200 for unknown providerRef (idempotent)', async () => {
  const db = makeDb(null);
  const kv = makeKv();
  const body = '{"transid":"UNKNOWN-001","result":"SUCCESS"}';
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode('secret'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const correctSig = btoa(String.fromCharCode(...new Uint8Array(sig)));

  const res = await handleSelcomWebhook(body, correctSig, 'secret', db, kv);
  assertEquals(res.status, 200);
});

Deno.test('handleSelcomWebhook on completed topup calls the ledger with the transaction id as idempotency key, and syncs the kv cache', async () => {
  const tx = { id: 'tx-1', user_id: 'u-1', type: 'topup', amount: 10000, currency: 'TZS', status: 'pending', provider_ref: 'SEL-001' };
  const kv = makeKv();
  const rpcCalls: any[] = [];
  const db = makeDb(tx, { balanceAfter: 60000, rpcCalls });

  const body = '{"transid":"SEL-001","result":"SUCCESS"}';
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode('secret'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const correctSig = btoa(String.fromCharCode(...new Uint8Array(sig)));

  const res = await handleSelcomWebhook(body, correctSig, 'secret', db, kv);
  assertEquals(res.status, 200);

  // The ledger, not a raw kv arithmetic update, is what actually moved the
  // balance -- verify it was called with the transaction's own id as the
  // idempotency key (so a redelivered webhook can't double-credit).
  assertEquals(rpcCalls.length, 1);
  assertEquals(rpcCalls[0].fn, 'process_wallet_transaction');
  assertEquals(rpcCalls[0].args.p_idempotency_key, 'webhook-tx-1');
  assertEquals(rpcCalls[0].args.p_entry_type, 'credit');
  assertEquals(rpcCalls[0].args.p_amount, 10000);

  // The kv cache should reflect the ledger's resulting balance afterward.
  const wallet = await kv.get('wallet:u-1') as { balance: number };
  assertEquals(wallet.balance, 60000);
});

Deno.test('handleSelcomWebhook does not call the ledger twice for an already-settled transaction', async () => {
  const tx = { id: 'tx-2', user_id: 'u-1', type: 'topup', amount: 5000, currency: 'TZS', status: 'completed', provider_ref: 'SEL-002' };
  const kv = makeKv();
  const rpcCalls: any[] = [];
  const db = makeDb(tx, { balanceAfter: 0, rpcCalls });

  const body = '{"transid":"SEL-002","result":"SUCCESS"}';
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode('secret'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const correctSig = btoa(String.fromCharCode(...new Uint8Array(sig)));

  const res = await handleSelcomWebhook(body, correctSig, 'secret', db, kv);
  assertEquals(res.status, 200);
  assertEquals(rpcCalls.length, 0); // already settled -- must not re-apply
});

Deno.test('handleFlutterwaveWebhook returns 401 on hash mismatch', async () => {
  const db = makeDb(null);
  const kv = makeKv();
  const res = await handleFlutterwaveWebhook('{}', 'wrong', 'correct-hash', db, kv);
  assertEquals(res.status, 401);
});
