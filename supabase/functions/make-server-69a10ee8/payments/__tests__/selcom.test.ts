import { assertEquals } from 'jsr:@std/assert';
import {
  verifySelcomWebhook,
  parseSelcomWebhookEvent,
  initiateC2B,
  initiateB2C,
} from '../selcom.ts';
import type { PaymentRequest } from '../types.ts';

const BASE_REQ: PaymentRequest = {
  userId: 'user-123',
  type: 'topup',
  network: 'mpesa',
  amount: 10000,
  currency: 'TZS',
  phone: '+255712345678',
  reference: 'GO-TEST-001',
  description: 'Wallet top-up',
};

Deno.test('initiateC2B returns demo result when no env credentials', async () => {
  const result = await initiateC2B(BASE_REQ);
  assertEquals(result.success, true);
  assertEquals(result.status, 'pending');
  assertEquals(result.demo, true);
});

Deno.test('initiateB2C returns demo result when no env credentials', async () => {
  const req: PaymentRequest = { ...BASE_REQ, type: 'withdrawal' };
  const result = await initiateB2C(req);
  assertEquals(result.success, true);
  assertEquals(result.status, 'pending');
  assertEquals(result.demo, true);
});

Deno.test('verifySelcomWebhook returns false for wrong signature', async () => {
  const valid = await verifySelcomWebhook('{"amount":1000}', 'wrong-sig', 'mysecret');
  assertEquals(valid, false);
});

Deno.test('verifySelcomWebhook returns true for correct signature', async () => {
  const body = '{"amount":1000}';
  const secret = 'mysecret';
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const correctSig = btoa(String.fromCharCode(...new Uint8Array(sig)));

  const valid = await verifySelcomWebhook(body, correctSig, secret);
  assertEquals(valid, true);
});

Deno.test('parseSelcomWebhookEvent maps success result code', () => {
  const body = { result: 'SUCCESS', transid: 'SEL-001', msisdn: '255712345678' };
  const event = parseSelcomWebhookEvent(body);
  assertEquals(event.providerRef, 'SEL-001');
  assertEquals(event.status, 'completed');
});

Deno.test('parseSelcomWebhookEvent maps failure result code', () => {
  const body = { result: 'FAILED', transid: 'SEL-002', msisdn: '255712345678' };
  const event = parseSelcomWebhookEvent(body);
  assertEquals(event.providerRef, 'SEL-002');
  assertEquals(event.status, 'failed');
});
