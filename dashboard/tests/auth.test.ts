import assert from "node:assert/strict";
import test from "node:test";
import { passwordsMatch, signSession, verifySessionToken } from "../lib/auth/session";

test("session cookie token round-trips and rejects tampering", async () => {
  const token = await signSession("00000000-0000-4000-8000-000000000001");
  const session = await verifySessionToken(token);
  assert.equal(session?.userId, "00000000-0000-4000-8000-000000000001");
  assert.equal(await verifySessionToken(`${token}x`), null);
  assert.equal(await verifySessionToken("not-a-token"), null);
  assert.equal(passwordsMatch("dev", "dev"), true);
  assert.equal(passwordsMatch("nope", "dev"), false);
  assert.equal(passwordsMatch("dev", "dev-longer"), false);
});
