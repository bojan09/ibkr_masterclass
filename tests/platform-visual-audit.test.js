import test from "node:test";
import assert from "node:assert/strict";
import { auditVisual, auditVisualCatalog } from "../scripts/audit-platform-visuals.mjs";

const visual = Object.freeze({
  id: "official-example",
  imageUrl: "https://www.ibkrguides.com/ibkrdesktop/resources/images/example.png",
});

function response({ status = 200, type = "image/png", url = visual.imageUrl } = {}) {
  return { ok: status >= 200 && status < 300, status, url, headers: new Headers({ "content-type": type }) };
}

test("official visual audit accepts a successful official image response", async () => {
  const result = await auditVisual(visual, async () => response());
  assert.deepEqual(result, { id: visual.id, ok: true, status: 200, contentType: "image/png", finalUrl: visual.imageUrl });
});

test("official visual audit rejects errors, non-images, and off-host redirects", async () => {
  const unavailable = await auditVisual(visual, async () => response({ status: 404 }));
  const document = await auditVisual(visual, async () => response({ type: "text/html" }));
  const redirect = await auditVisual(visual, async () => response({ url: "https://example.com/image.png" }));
  assert.equal(unavailable.ok, false);
  assert.match(unavailable.error, /HTTP 404/);
  assert.equal(document.ok, false);
  assert.match(document.error, /content type/i);
  assert.equal(redirect.ok, false);
  assert.match(redirect.error, /official IBKR host/i);
});

test("catalog audit retains one result per visual when a request throws", async () => {
  const items = [visual, { ...visual, id: "network-error" }];
  let calls = 0;
  const results = await auditVisualCatalog(items, async () => {
    calls += 1;
    if (calls === 2) throw new Error("offline");
    return response();
  });
  assert.equal(results.length, 2);
  assert.equal(results[0].ok, true);
  assert.equal(results[1].ok, false);
  assert.match(results[1].error, /offline/);
});
