import { assert, assertEquals, assertRejects } from 'jsr:@std/assert';
import { initiateB2C, initiateC2B } from '../selcom.ts';
import { initiateCard } from '../flutterwave.ts';
import type { PaymentRequest } from '../types.ts';

// These tests guard the isolation that keeps the payments tests from reaching a
// live provider. They require outbound network to be DENIED, not merely "not granted":
// without --deny-net Deno reports 'prompt', and a host-scoped --allow-net leaves the
// global state at 'prompt' while granting that host. Even with --deny-net, an explicit
// --allow-net=<host> still grants that host (the global state stays 'denied'), so each
// provider host is checked individually as well. The one check that attempts a provider
// call only runs when the global state AND every provider host are denied.
// Add a host to PROVIDER_HOSTS whenever a payment provider host is added to the code.
//
// This file passes only under `npm run test:payments` (or the identical flags). It
// deliberately fails under plain `deno test`; run the payments tests through the script.

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

const PROVIDER_HOSTS = ['api.flutterwave.com:443', 'apigw.selcommobile.com:443'];

function netFullyDenied(): boolean {
  if (Deno.permissions.querySync({ name: 'net' }).state !== 'denied') return false;
  return PROVIDER_HOSTS.every(
    (host) => Deno.permissions.querySync({ name: 'net', host }).state === 'denied',
  );
}

Deno.test('payments tests run with an empty environment (preload active)', () => {
  assertEquals(Object.keys(Deno.env.toObject()), []);
});

Deno.test('outbound network is fully denied to payments tests (--deny-net)', () => {
  assert(netFullyDenied(), 'outbound network is not fully denied; test:payments must run with --deny-net');
});

Deno.test('a provider call attempted during tests fails safely before any connection', async () => {
  if (!netFullyDenied()) throw new Error('refusing to attempt a provider call: outbound network is not fully denied');

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
