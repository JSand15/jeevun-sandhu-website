/**
 * Headless engine tests.
 *
 * The mini-game engines are pure logic that only need a 2D context, so they can
 * be driven thousands of frames in Node against a stub canvas. This catches the
 * failure modes that matter and that a page-level smoke test cannot see:
 * exceptions mid-run, state machines that never reach game over, scores that
 * never move, unbounded arrays, and frame-rate dependence.
 *
 * Usage: node scripts/game-engine-test.mjs <compiledDir>
 */

import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

// Resolve against the working directory, not this file, and convert to a file
// URL so dynamic import() treats it as a path rather than a bare specifier.
const DIR = pathToFileURL(resolve(process.argv[2] ?? "./.tmp-engines") + "/").href;

let failures = 0;
let checks = 0;
const ok = (m) => { checks += 1; console.log(`  ok    ${m}`); };
const bad = (m) => { failures += 1; console.log(`  FAIL  ${m}`); };

/** A context stub that records nothing but accepts everything. */
function makeCtx() {
  const noop = () => {};
  const ctx = {
    canvas: { width: 320, height: 180 },
    fillStyle: "", strokeStyle: "", font: "", textAlign: "", textBaseline: "",
    globalAlpha: 1, lineWidth: 1, imageSmoothingEnabled: false,
    fillRect: noop, strokeRect: noop, clearRect: noop, fillText: noop,
    strokeText: noop, beginPath: noop, closePath: noop, moveTo: noop,
    lineTo: noop, arc: noop, fill: noop, stroke: noop, save: noop,
    restore: noop, translate: noop, scale: noop, rotate: noop, clip: noop,
    rect: noop, drawImage: noop, setTransform: noop,
    measureText: (t) => ({ width: String(t).length * 5 }),
    createLinearGradient: () => ({ addColorStop: noop }),
  };
  return ctx;
}

function installGlobals() {
  const store = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
    },
    devicePixelRatio: 1,
  };
  globalThis.localStorage = globalThis.window.localStorage;
  globalThis.document = {
    createElement: () => ({ width: 0, height: 0, getContext: () => makeCtx() }),
  };
}

const NATIVE_RANDOM = Math.random;

/**
 * Replaces Math.random with a seeded LCG.
 *
 * The engines spawn from Math.random, so two runs of the same game otherwise
 * diverge completely and any cross-run comparison measures luck rather than the
 * property under test. Seeding makes a run reproducible, which is what lets the
 * frame-rate check assert real equality.
 */
function seedRandom(seed) {
  let s = seed >>> 0;
  Math.random = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function restoreRandom() {
  Math.random = NATIVE_RANDOM;
}

/** Counts every array field on the instance, to detect unbounded growth. */
function arraySizes(game) {
  let total = 0;
  for (const v of Object.values(game)) {
    if (Array.isArray(v)) total += v.length;
  }
  return total;
}

function drive(game, { frames, dt, inputs = [], send }) {
  const ctx = makeCtx();
  game.init(ctx);
  send(game, { type: "primary" });

  const buckets = inputs.map(() => -1);
  let peakArrays = 0;
  let t = 0;
  let sinceRestart = 0;

  for (let i = 0; i < frames; i += 1) {
    t += dt;
    inputs.forEach((spec, idx) => {
      const bucket = Math.floor(t / spec.every);
      if (bucket !== buckets[idx]) {
        buckets[idx] = bucket;
        spec.fn(game, bucket, send);
      }
    });

    game.update(dt);
    game.render();
    peakArrays = Math.max(peakArrays, arraySizes(game));

    // Keep restarting so a run that ends early still exercises the loop.
    sinceRestart += dt;
    if (game.state === "gameover" && sinceRestart > 1.5) {
      send(game, { type: "primary" });
      sinceRestart = 0;
    }
  }
  return { peakArrays };
}

async function testGame(name, file, className, opts) {
  console.log(`\n${name}:`);
  let Cls;
  try {
    const mod = await import(new URL(file, DIR).href);
    Cls = mod[className];
  } catch (err) {
    bad(`${name} — import failed: ${err.message}`);
    return;
  }
  if (typeof Cls !== "function") {
    bad(`${name} — ${className} is not a constructor`);
    return;
  }
  ok(`${name} — exports ${className}`);

  // 1. Contract surface
  const probe = new Cls();
  for (const m of ["init", "update", "render", "input", "reset", "pause", "resume"]) {
    if (typeof probe[m] === "function") checks += 1;
    else bad(`${name} — missing method ${m}()`);
  }
  ok(`${name} — implements the MiniGame contract`);

  // 2. Starts on the title screen and enters play on primary
  const send = opts.send ?? ((game, action) => game.input(action));

  const g = new Cls();
  g.init(makeCtx());
  if (g.state === "title") ok(`${name} — starts on the title screen`);
  else bad(`${name} — initial state was "${g.state}", expected "title"`);
  send(g, { type: "primary" });
  if (g.state === "playing") ok(`${name} — primary starts a run`);
  else bad(`${name} — primary did not start a run (state "${g.state}")`);

  // 3. Long run at 60Hz without throwing
  try {
    const { peakArrays } = drive(new Cls(), {
      frames: 5400, dt: 1 / 60, inputs: opts.inputs, send,
    });
    ok(`${name} — survived 5400 frames @60Hz`);
    if (peakArrays < 600) ok(`${name} — arrays stayed bounded (peak ${peakArrays})`);
    else bad(`${name} — arrays grew to ${peakArrays} entries, possible leak`);
  } catch (err) {
    bad(`${name} — threw during 60Hz run: ${err.message}`);
  }

  // 4. Same at 144Hz
  try {
    drive(new Cls(), { frames: 5400, dt: 1 / 144, inputs: opts.inputs, send });
    ok(`${name} — survived 5400 frames @144Hz`);
  } catch (err) {
    bad(`${name} — threw during 144Hz run: ${err.message}`);
  }

  // 5. Frame-rate independence.
  //
  //    With Math.random seeded identically, 10 simulated seconds must produce
  //    an identical simulation regardless of refresh rate: the fixed-timestep
  //    accumulator turns 600 frames at 1/60 and 1440 frames at 1/144 into the
  //    same 600 physics steps. Any divergence is a real frame-rate bug.
  try {
    seedRandom(20260819);
    const a = new Cls();
    drive(a, { frames: 600, dt: 1 / 60, inputs: opts.inputs, send });

    seedRandom(20260819);
    const b = new Cls();
    drive(b, { frames: 1440, dt: 1 / 144, inputs: opts.inputs, send });
    restoreRandom();

    if (a.score === b.score) {
      ok(`${name} — frame-rate independent (both scored ${a.score} in 10s)`);
    } else {
      bad(`${name} — frame-rate dependent: 60Hz scored ${a.score}, 144Hz scored ${b.score}`);
    }
  } catch (err) {
    restoreRandom();
    bad(`${name} — threw during frame-rate comparison: ${err.message}`);
  }

  // 6. A huge dt (restored background tab) must not explode
  try {
    const g2 = new Cls(); g2.init(makeCtx()); send(g2, { type: "primary" });
    g2.update(12); g2.render();
    if (Number.isFinite(g2.score)) ok(`${name} — tolerates a 12s frame gap`);
    else bad(`${name} — score became ${g2.score} after a large frame gap`);
  } catch (err) {
    bad(`${name} — threw on a large frame gap: ${err.message}`);
  }

  // 7. pause/resume and reset
  try {
    const g3 = new Cls(); g3.init(makeCtx()); send(g3, { type: "primary" });
    g3.pause();
    if (g3.state === "paused") ok(`${name} — pauses`); else bad(`${name} — pause() left state "${g3.state}"`);
    g3.resume();
    if (g3.state === "playing") ok(`${name} — resumes`); else bad(`${name} — resume() left state "${g3.state}"`);
    g3.reset();
    if (g3.score === 0) ok(`${name} — reset clears the score`); else bad(`${name} — reset left score at ${g3.score}`);
  } catch (err) {
    bad(`${name} — threw during pause/resume/reset: ${err.message}`);
  }

  // 8. It must be possible to actually score. A single seed can be unlucky for
  //    a timing game, so try a handful and require at least one to put points
  //    on the board.
  try {
    let best = 0;
    for (const seed of [1, 7, 42, 1337, 90210]) {
      seedRandom(seed);
      const g4 = new Cls();
      drive(g4, { frames: 3600, dt: 1 / 60, inputs: opts.inputs, send });
      best = Math.max(best, g4.score);
    }
    restoreRandom();
    if (best > 0) ok(`${name} — reachable score (best ${best} across 5 seeds)`);
    else bad(`${name} — score never moved above 0 across 5 seeded 60s runs`);
  } catch (err) {
    restoreRandom();
    bad(`${name} — threw while scoring: ${err.message}`);
  }

  // 9. Events fire and are well-formed
  try {
    const g5 = new Cls();
    const seen = new Set();
    g5.onEvent = (e) => {
      if (!e || typeof e.type !== "string") throw new Error("malformed event");
      seen.add(e.type);
    };
    drive(g5, { frames: 3600, dt: 1 / 60, inputs: opts.inputs, send });
    if (seen.size > 0) ok(`${name} — emits events (${[...seen].join(", ")})`);
    else bad(`${name} — emitted no events at all`);
  } catch (err) {
    bad(`${name} — threw during event check: ${err.message}`);
  }
}

async function main() {
  installGlobals();
  console.log("Headless mini-game engine tests");

  // SHIP IT predates the shared contract and takes plain string actions, so it
  // needs an adapter from the {type} objects the other games use.
  await testGame("SHIP IT", "engine.js", "ShipItGame", {
    send: (game, action) => {
      if (action.type === "primary") game.input("jump");
      else if (action.type === "start") game.input("start");
    },
    inputs: [{ every: 0.65, fn: (g, _n, send) => send(g, { type: "primary" }) }],
  });

  // CASH FLOW: sweep the tray back and forth to catch things.
  await testGame("CASH FLOW", "games/cash-flow.js", "CashFlowGame", {
    inputs: [
      {
        every: 0.75,
        fn: (g, n) => g.input({ type: "move", dir: n % 2 === 0 ? 1 : -1 }),
      },
    ],
  });

  // BUG SQUASH: click around the grid.
  await testGame("BUG SQUASH", "games/bug-squash.js", "BugSquashGame", {
    inputs: [
      {
        every: 0.2,
        fn: (g, n) => {
          const col = n % 3;
          const row = Math.floor(n / 3) % 3;
          g.input({ type: "point", x: 70 + col * 90, y: 55 + row * 42 });
        },
      },
    ],
  });

  // CLOSE THE DEAL: mash the one button.
  await testGame("CLOSE THE DEAL", "games/close-deal.js", "CloseDealGame", {
    inputs: [
      {
        every: 1 / 60,
        fn: (g) => {
          // Press only when the marker is actually over the target, the way a
          // player aiming at the meter would.
          const half = (g.zoneWidth ?? 0) / 2;
          const inZone = Math.abs((g.markerPos ?? -999) - (g.zoneCenter ?? 0)) <= half;
          if (g.state !== "playing" || inZone) g.input({ type: "primary" });
        },
      },
    ],
  });

  console.log(`\n${checks} checks passed, ${failures} failed.`);
  process.exit(failures > 0 ? 1 : 0);
}

main();
