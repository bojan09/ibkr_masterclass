import test from "node:test";
import assert from "node:assert/strict";

import { isMobileViewport } from "../js/ui.js";

test("mobile navigation breakpoint matches the responsive stylesheet", () => {
  assert.equal(isMobileViewport(320), true);
  assert.equal(isMobileViewport(920), true);
  assert.equal(isMobileViewport(921), false);
  assert.equal(isMobileViewport(1440), false);
});
