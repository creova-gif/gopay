import { assertEquals, assertNotEquals } from 'jsr:@std/assert';
import { computeHmac, constantTimeEqual } from '../utils.ts';

Deno.test('computeHmac returns a base64 string', async () => {
  const result = await computeHmac('hello', 'secret');
  assertEquals(typeof result, 'string');
  assertEquals(result.length > 0, true);
});

Deno.test('computeHmac same inputs produce same output', async () => {
  const a = await computeHmac('payload', 'mysecret');
  const b = await computeHmac('payload', 'mysecret');
  assertEquals(a, b);
});

Deno.test('computeHmac different payloads produce different output', async () => {
  const a = await computeHmac('payload1', 'mysecret');
  const b = await computeHmac('payload2', 'mysecret');
  assertNotEquals(a, b);
});

Deno.test('constantTimeEqual returns true for identical strings', () => {
  assertEquals(constantTimeEqual('abc123', 'abc123'), true);
});

Deno.test('constantTimeEqual returns false for different strings', () => {
  assertEquals(constantTimeEqual('abc123', 'xyz789'), false);
});
