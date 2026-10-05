import { assertEquals } from 'jsr:@std/assert';
import {
  initiateCard,
  verifyFlutterwaveWebhook,
  parseFlutterwaveWebhookEvent,
} from '../flutterwave.ts';
import type { PaymentRequest } from '../types.ts';

const CARD_REQ: PaymentRequest = {
  userId: 'user-456',
  type: 'topup',
  network: 'card',
  amount: 50000,
  currency: 'TZS',
  phone: '+255712345678',
  reference: 'GO-FW-TEST-001',
  description: 'Card top-up',
};

Deno.test('initiateCard returns demo result when no env credentials', async () => {
  const result = await initiateCard(CARD_REQ);
  assertEquals(result.success, true);
  assertEquals(result.status, 'pending');
  assertEquals(result.demo, true);
});

Deno.test('verifyFlutterwaveWebhook returns true when hash matches', () => {
  const valid = verifyFlutterwaveWebhook('my-secret-hash', 'my-secret-hash');
  assertEquals(valid, true);
});

Deno.test('verifyFlutterwaveWebhook returns false when hash differs', () => {
  const valid = verifyFlutterwaveWebhook('my-secret-hash', 'wrong-hash');
  assertEquals(valid, false);
});

Deno.test('parseFlutterwaveWebhookEvent maps successful charge', () => {
  const body = {
    event: 'charge.completed',
    data: { tx_ref: 'GO-FW-TEST-001', status: 'successful' },
  };
  const event = parseFlutterwaveWebhookEvent(body);
  assertEquals(event.providerRef, 'GO-FW-TEST-001');
  assertEquals(event.status, 'completed');
});

Deno.test('parseFlutterwaveWebhookEvent maps failed charge', () => {
  const body = {
    event: 'charge.completed',
    data: { tx_ref: 'GO-FW-TEST-002', status: 'failed' },
  };
  const event = parseFlutterwaveWebhookEvent(body);
  assertEquals(event.status, 'failed');
});
