import { pathToFileURL } from "node:url";
import { PLATFORM_VISUALS, isAllowedOfficialVisualUrl } from "../data/platform-visuals.js";

function resultFromResponse(visual, response) {
  const contentType = response.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() ?? "";
  const finalUrl = response.url || visual.imageUrl;
  if (!response.ok) return { id: visual.id, ok: false, status: response.status, contentType, finalUrl, error: `HTTP ${response.status}` };
  if (!isAllowedOfficialVisualUrl(finalUrl)) return { id: visual.id, ok: false, status: response.status, contentType, finalUrl, error: "Redirected outside an official IBKR host" };
  if (!contentType.startsWith("image/")) return { id: visual.id, ok: false, status: response.status, contentType, finalUrl, error: `Unexpected content type: ${contentType || "missing"}` };
  return { id: visual.id, ok: true, status: response.status, contentType, finalUrl };
}

async function requestVisual(visual, fetchFn, method) {
  const options = {
    method,
    redirect: "follow",
    headers: { Accept: "image/*" },
  };
  if (fetchFn === globalThis.fetch) options.signal = AbortSignal.timeout(15_000);
  if (method === "GET") options.headers.Range = "bytes=0-0";
  return fetchFn(visual.imageUrl, options);
}

export async function auditVisual(visual, fetchFn = globalThis.fetch) {
  try {
    let response = await requestVisual(visual, fetchFn, "HEAD");
    let result = resultFromResponse(visual, response);
    const shouldRetryWithGet = [403, 405, 501].includes(response.status) || (response.ok && !result.contentType.startsWith("image/"));
    if (shouldRetryWithGet) {
      response = await requestVisual(visual, fetchFn, "GET");
      result = resultFromResponse(visual, response);
    }
    return result;
  } catch (error) {
    return {
      id: visual.id,
      ok: false,
      status: 0,
      contentType: "",
      finalUrl: visual.imageUrl,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function auditVisualCatalog(visuals = PLATFORM_VISUALS, fetchFn = globalThis.fetch, concurrency = 8) {
  const results = new Array(visuals.length);
  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < visuals.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await auditVisual(visuals[index], fetchFn);
    }
  };
  await Promise.all(Array.from({ length: Math.min(Math.max(1, concurrency), visuals.length) }, worker));
  return results;
}

async function main() {
  const results = await auditVisualCatalog();
  const failures = results.filter(({ ok }) => !ok);
  for (const result of failures) console.error(`FAIL ${result.id}: ${result.error} (${result.finalUrl})`);
  console.log(`Official visual audit: ${results.length - failures.length}/${results.length} images available.`);
  if (failures.length) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
