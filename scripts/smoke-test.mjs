/**
 * Route smoke test.
 *
 * Boots against an already-running server and checks every public route for
 * status, server-rendered content, broken asset references, and the markers
 * that show up when a React render fails or a value leaks through undefined.
 *
 * Usage: node scripts/smoke-test.mjs [baseUrl]
 */

const BASE = process.argv[2] ?? "http://localhost:3200";

const ROUTES = [
  { path: "/", expect: ["Jeevun Sandhu", "SHIP IT", "PLAYER STATS", "QUEST LOG", "LEVEL SELECT"] },
  { path: "/about", expect: ["Jeevun", "CASH FLOW", "Run my cash flow"] },
  {
    path: "/projects",
    expect: ["Finance OS", "FinLearn Analytics", "Numerai", "BUG SQUASH", "Squash my bugs"],
  },
  { path: "/projects/finance-os", expect: ["Finance OS"] },
  { path: "/projects/finlearn-analytics", expect: ["FinLearn Analytics"] },
  { path: "/projects/numerai", expect: ["Numerai"] },
  { path: "/experience", expect: ["Palisades"] },
  { path: "/reading", expect: [] },
  { path: "/blog", expect: [] },
  { path: "/blog/why-i-build-with-ai", expect: [] },
  {
    path: "/contact",
    expect: ["Get in touch", "Email", "CLOSE THE DEAL", "Close a deal with me"],
  },
  { path: "/privacy", expect: ["Privacy"] },
  { path: "/experience", expect: ["Experience"] },
  { path: "/blog/rss.xml", expect: ["<rss"], contentType: "xml" },
  { path: "/sitemap.xml", expect: ["<urlset"], contentType: "xml" },
  { path: "/robots.txt", expect: ["User-Agent"], contentType: "text", minLength: 20 },
];

/** Assets the new design depends on. A 404 here is an invisible visual bug. */
const ASSETS = [
  "/avatar.png",
  "/luxury/skyline-dusk.jpg",
  "/luxury/manhattan-gold.jpg",
  "/luxury/watch.jpg",
  "/luxury/flight.jpg",
  "/luxury/aerial-city.jpg",
  "/luxury/supercar.jpg",
  "/luxury/dark-texture.jpg",
  "/luxury/penthouse.jpg",
  "/projects/finance-os.jpg",
  "/projects/finlearn-analytics.jpg",
  "/projects/numerai.jpg",
  "/projects/grid-texture.png",
];

/** Substrings that should never appear in server-rendered HTML. */
const POISON = [
  "Application error",
  "Internal Server Error",
  "undefined%",
  ">undefined<",
  ">NaN<",
  "[object Object]",
  "class=\"undefined\"",
];

let failures = 0;
let checks = 0;

function fail(msg) {
  failures += 1;
  console.log(`  FAIL  ${msg}`);
}
function pass(msg) {
  checks += 1;
  console.log(`  ok    ${msg}`);
}

async function checkRoute(route) {
  const url = `${BASE}${route.path}`;
  let res;
  try {
    res = await fetch(url, { redirect: "manual" });
  } catch (err) {
    fail(`${route.path} — request threw: ${err.message}`);
    return;
  }

  if (res.status !== 200) {
    fail(`${route.path} — status ${res.status}`);
    return;
  }
  pass(`${route.path} — 200`);

  const body = await res.text();

  const minLength = route.minLength ?? 200;
  if (body.length < minLength) {
    fail(`${route.path} — suspiciously short body (${body.length} bytes)`);
  }

  // Compare case-insensitively: several headings are uppercased by CSS, so the
  // HTML carries the original mixed-case text.
  const haystack = body.toLowerCase();
  for (const needle of route.expect) {
    if (haystack.includes(needle.toLowerCase())) {
      pass(`${route.path} — renders "${needle}"`);
    } else {
      fail(`${route.path} — missing expected content "${needle}"`);
    }
  }

  for (const poison of POISON) {
    if (body.includes(poison)) {
      fail(`${route.path} — contains "${poison}"`);
    }
  }

  // Every local src/href the page references should itself resolve.
  if (!route.contentType) {
    const refs = new Set();
    for (const m of body.matchAll(/(?:src|href)="(\/[^"?]*\.(?:png|jpg|jpeg|svg|webp|avif|ico|css|js))"/g)) {
      refs.add(m[1]);
    }
    for (const ref of refs) {
      const r = await fetch(`${BASE}${ref}`, { method: "HEAD" });
      if (r.ok) checks += 1;
      else fail(`${route.path} — broken reference ${ref} (${r.status})`);
    }
  }
}

async function checkAsset(path) {
  const res = await fetch(`${BASE}${path}`, { method: "HEAD" });
  if (res.ok) pass(`asset ${path}`);
  else fail(`asset ${path} — status ${res.status}`);
}

async function checkNotFound() {
  const res = await fetch(`${BASE}/this-route-does-not-exist-xyz`);
  if (res.status === 404) pass("404 page returns 404");
  else fail(`404 page returned ${res.status}`);
  const body = await res.text();
  if (body.length > 200) pass("404 page renders content");
  else fail("404 page body is empty");
}

async function main() {
  console.log(`Smoke testing ${BASE}\n`);

  console.log("Routes:");
  for (const route of ROUTES) await checkRoute(route);

  console.log("\nAssets:");
  for (const asset of ASSETS) await checkAsset(asset);

  console.log("\nError handling:");
  await checkNotFound();

  console.log(`\n${checks} checks passed, ${failures} failed.`);
  process.exit(failures > 0 ? 1 : 0);
}

main();
