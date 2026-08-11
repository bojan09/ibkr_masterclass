import test from "node:test";
import assert from "node:assert/strict";

import { renderMissionVisuals } from "../js/platform-visuals.js";

test("mission visual markup is attributed, accessible, enlargeable, and recoverable", () => {
  const html = renderMissionVisuals("desktop-watchlist");
  assert.match(html, /Recognize the real screen/);
  assert.match(html, /Official IBKR screenshot/);
  assert.match(html, /alt="[^"]{30,}"/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /decoding="async"/);
  assert.match(html, /data-enlarge-visual/);
  assert.match(html, /<dialog[^>]+data-visual-dialog/);
  assert.match(html, /The official screenshot could not be loaded/);
  assert.match(html, /target="_blank" rel="noreferrer"/);
  assert.match(html, /Source updated/);
  assert.match(html, /Mapping reviewed/);
});

test("mission visual markup connects numbered markers to a text legend", () => {
  const html = renderMissionVisuals("tws-mosaic-layout");
  assert.match(html, /class="mission-visual-marker"/);
  assert.match(html, /style="--marker-x: 78%; --marker-y: 30%"/);
  assert.match(html, /<ol class="mission-visual-legend"/);
  assert.match(html, /Monitor panel/);
  assert.match(html, /Order Entry panel/);
});

test("unknown missions render no visual section", () => {
  assert.equal(renderMissionVisuals("missing-mission"), "");
});

test("renderer escapes catalog text before inserting it into markup", () => {
  const html = renderMissionVisuals("desktop-watchlist");
  assert.doesNotMatch(html, /<script/i);
  assert.doesNotMatch(html, /javascript:/i);
});
