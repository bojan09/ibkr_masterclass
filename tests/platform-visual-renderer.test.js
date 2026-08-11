import test from "node:test";
import assert from "node:assert/strict";

import { nextGalleryIndex, nextTabIndex, renderWalkthroughVisuals } from "../js/platform-visuals.js";

test("walkthrough visuals render a selected step-linked gallery", () => {
  const html = renderWalkthroughVisuals("desktop-watchlist");
  assert.match(html, /Recognize the real screen/);
  assert.match(html, /data-walkthrough-gallery/);
  assert.match(html, /1 of 4/);
  assert.match(html, /data-gallery-previous/);
  assert.match(html, /data-gallery-next/);
  assert.match(html, /role="tablist"/);
  assert.match(html, /aria-selected="true"/);
  assert.match(html, /Supports steps?/);
  assert.match(html, /<details class="mission-visual-provenance">/);
  assert.match(html, /data-enlarge-visual/);
});

test("gallery panels retain official attribution, accessibility, and recovery", () => {
  const html = renderWalkthroughVisuals("desktop-watchlist");
  assert.match(html, /Official IBKR screenshot/);
  assert.match(html, /alt="[^"]{30,}"/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /decoding="async"/);
  assert.match(html, /<dialog[^>]+data-visual-dialog/);
  assert.match(html, /The official screenshot could not be loaded/);
  assert.match(html, /target="_blank" rel="noreferrer"/);
  assert.match(html, /Source updated/);
  assert.match(html, /Mapping reviewed/);
  assert.equal([...html.matchAll(/role="tabpanel"/g)].length, 4);
  assert.equal([...html.matchAll(/class="mission-visual-panel"[^>]* hidden/g)].length, 3);
  const images = [...html.matchAll(/<img\s[^>]+>/g)].map((match) => match[0]);
  assert.equal(images.length, 8);
  assert.ok(images.every((tag) => /loading="lazy"/.test(tag)));
  assert.ok(images.every((tag) => /decoding="async"/.test(tag)));
  assert.ok(images.every((tag) => /referrerpolicy="no-referrer"/.test(tag)));
});

test("gallery thumbnails reference real panels with one selected tab", () => {
  const html = renderWalkthroughVisuals("desktop-watchlist");
  const panelIds = new Set([...html.matchAll(/role="tabpanel"[^>]+id="([^"]+)"/g)].map((match) => match[1]));
  const controls = [...html.matchAll(/role="tab"[^>]+aria-controls="([^"]+)"[^>]+aria-selected="(true|false)"/g)];
  assert.equal(controls.length, 4);
  assert.equal(controls.filter((match) => match[2] === "true").length, 1);
  assert.ok(controls.every((match) => panelIds.has(match[1])));
});

test("walkthrough visual markup connects numbered markers to a text legend", () => {
  const html = renderWalkthroughVisuals("tws-mosaic-layout");
  assert.match(html, /class="mission-visual-marker"/);
  assert.match(html, /style="--marker-x: 78%; --marker-y: 30%"/);
  assert.match(html, /<ol class="mission-visual-legend"/);
  assert.match(html, /Monitor panel/);
  assert.match(html, /Order Entry panel/);
});

test("unknown walkthroughs render no visual section", () => {
  assert.equal(renderWalkthroughVisuals("missing-walkthrough"), "");
});

test("renderer escapes catalog text before inserting it into markup", () => {
  const html = renderWalkthroughVisuals("desktop-watchlist");
  assert.doesNotMatch(html, /<script/i);
  assert.doesNotMatch(html, /javascript:/i);
});

test("gallery selection clamps to available visual indexes", () => {
  assert.equal(nextGalleryIndex(0, -1, 3), 0);
  assert.equal(nextGalleryIndex(0, 1, 3), 1);
  assert.equal(nextGalleryIndex(2, 1, 3), 2);
  assert.equal(nextGalleryIndex(2, -1, 3), 1);
});

test("gallery tab navigation wraps for arrow-key access", () => {
  assert.equal(nextTabIndex(0, -1, 4), 3);
  assert.equal(nextTabIndex(3, 1, 4), 0);
  assert.equal(nextTabIndex(1, 1, 4), 2);
  assert.equal(nextTabIndex(1, -1, 4), 0);
});
