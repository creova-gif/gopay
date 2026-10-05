// Preloaded (deno test --preload) before every payments test module.
// Tests must run against an empty environment so credentials inherited from the
// caller's shell can never select a live-provider code path. Outbound network is
// separately denied by the test command (--deny-net); isolation.test.ts fails if
// either protection is removed.
for (const key of Object.keys(Deno.env.toObject())) {
  Deno.env.delete(key);
}
