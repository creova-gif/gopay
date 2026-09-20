import { assert, assertEquals, assertRejects } from 'jsr:@std/assert';
import { initiateB2C, initiateC2B } from '../selcom.ts';
import { initiateCard } from '../flutterwave.ts';
import type { PaymentRequest } from '../types.ts';

// These tests guard the isolation that keeps the payments tests from reaching a
// live provider. Every network-touching check is skipped by construction when
// the net permission is granted, so this file can never itself contact a provider.

const FAKE_REQ: PaymentRequest = {
  userId: 'isolation-test-user',
  type: 'withdrawal',
  network: 'card',
  amount: 1,
  currency: 'TZS',
  phone: '+255000000000',
  reference: 'GO-ISOLATION-TEST',
  description: 'isolation guard - must never leave the process',
};

function netGranted(): boolean {
  return Deno.permissions.querySync({ name: 'net' }).state === 'granted';
}

Deno.test('payments tests run with an empty environment (preload active)', () => {
  assertEquals(Object.keys(Deno.env.toObject()), []);
});

Deno.test('outbound network permission is not granted to payments tests', () => {
  assert(!netGranted(), 'net permission is granted; test:payments must run with --deny-net');
});

Deno.test('a provider call attempted during tests fails safely before any connection', async () => {
  if (netGranted()) throw new Error('refusing to attempt a provider call: net permission is granted');

  const fakeCredentials = {
    FLUTTERWAVE_SECRET_KEY: 'FLWSECK_TEST-FAKE0123456789abcdef-X',
    SELCOM_API_KEY: 'FAKE-selcom-api-key',
    SELCOM_API_SECRET: 'FAKE-selcom-api-secret',
  };
  const previous = Object.keys(fakeCredentials).map((k) => [k, Deno.env.get(k)] as const);
  for (const [k, v] of Object.entries(fakeCredentials)) Deno.env.set(k, v);
  try {
    await assertRejects(() => initiateCard(FAKE_REQ), Deno.errors.NotCapable);
    await assertRejects(() => initiateC2B(FAKE_REQ), Deno.errors.NotCapable);
    await assertRejects(() => initiateB2C(FAKE_REQ), Deno.errors.NotCapable);
  } finally {
    for (const [k, v] of previous) {
      if (v === undefined) Deno.env.delete(k);
      else Deno.env.set(k, v);
    }
  }
});
