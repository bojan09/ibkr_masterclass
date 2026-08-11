import test from "node:test";
import assert from "node:assert/strict";

import { normalizeRoute, resolveRoute } from "../js/router.js";

test("normalizeRoute maps an empty hash to the dashboard", () => {
  assert.equal(normalizeRoute(""), "dashboard");
  assert.equal(normalizeRoute("#"), "dashboard");
  assert.equal(normalizeRoute("#/"), "dashboard");
});

test("normalizeRoute removes hash syntax, duplicate slashes, and query text", () => {
  assert.equal(normalizeRoute("#/ibkr-desktop//watchlists/?tour=1"), "ibkr-desktop/watchlists");
});

test("normalizeRoute rejects unsafe path segments", () => {
  assert.equal(normalizeRoute("#/../../account"), "not-found");
  assert.equal(normalizeRoute("#/orders/<script>"), "not-found");
});

test("resolveRoute returns known routes and marks other routes as planned", () => {
  const routes = new Set(["dashboard", "start-here/ibkr-overview"]);

  assert.deepEqual(resolveRoute("#/dashboard", routes), {
    name: "dashboard",
    known: true,
  });
  assert.deepEqual(resolveRoute("#/options/greeks", routes), {
    name: "options/greeks",
    known: false,
  });
});
