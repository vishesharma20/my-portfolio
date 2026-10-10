/*
 * Motion for the Skills-page tree. Pure maths, no DOM, so it can be run and tested on its own.
 *
 * Everything is expressed in "stage pixels": the 1376 x 768 space of the Skills artwork.
 * Timeline after a trunk click (seconds):
 *   0.00  trunk nudges      0.45  branches start      0.80  canopy starts
 *   1.00+ leaves let go     1.35+ apples let go, one by one with uneven gaps
 */

export const STAGE_W = 1376;
export const STAGE_H = 768;

export type Pt = { x: number; y: number };
export type Pose = { dx: number; dy: number; rot: number };

/* ---------- artwork geometry (stage px) ---------- */

export const LAYER_BOX = {
  trunk: { x: 554, y: 354, w: 310, h: 293 },
  branches: { x: 397, y: 193, w: 666, h: 182 },
  canopy: { x: 124, y: 0, w: 1171, h: 365 },
} as const;

export const TRUNK_BASE_Y = 640;
export const TRUNK_TOP_Y = 360;
export const TRUNK_PIVOT_X = 730;
export const BRANCH_PIVOT: Pt = { x: 735, y: 330 };
export const CANOPY_PIVOT: Pt = { x: 735, y: 300 };

/** Outline of the clickable trunk, in stage px. */
export const TRUNK_HIT: Pt[] = [
  [825, 215], [726, 215], [684, 231], [656, 231], [640, 220], [640, 310], [682, 373], [682, 409],
  [661, 465], [641, 480], [616, 535], [592, 560], [557, 566], [557, 594], [568, 600], [560, 643],
  [649, 632], [657, 620], [684, 620], [714, 643], [767, 643], [771, 628], [806, 628], [839, 643],
  [860, 640], [834, 597], [797, 577], [790, 551], [800, 480], [822, 443], [822, 405], [838, 386],
  [840, 370], [849, 369], [849, 245], [825, 242],
].map(([x, y]) => ({ x, y }));

/** Sprite metadata: size of the PNG and where the apple's body centre / radius sit inside it. */
export const APPLE_SPRITES: Record<string, { w: number; h: number; cx: number; cy: number; r: number }> = {
  red: { w: 123, h: 145, cx: 58.0, cy: 87.3, r: 51.7 },
  yellow: { w: 148, h: 138, cx: 65.0, cy: 79.6, r: 49.3 },
  green: { w: 139, h: 135, cx: 55.0, cy: 65.5, r: 59.7 },
  "red-leaf": { w: 152, h: 129, cx: 55.5, cy: 69.7, r: 56.4 },
  blush: { w: 139, h: 126, cx: 56.0, cy: 63.0, r: 59.2 },
  orange: { w: 136, h: 131, cx: 79.5, cy: 67.3, r: 57.8 },
  crimson: { w: 121, h: 137, cx: 57.0, cy: 80.6, r: 49.3 },
};

export const LEAF_SPRITES: { w: number; h: number }[] = [
  { w: 57, h: 88 }, { w: 56, h: 83 }, { w: 55, h: 35 }, { w: 57, h: 76 }, { w: 40, h: 71 }, { w: 68, h: 111 },
  { w: 75, h: 79 }, { w: 74, h: 112 }, { w: 55, h: 79 }, { w: 79, h: 42 }, { w: 97, h: 90 }, { w: 89, h: 74 },
];

/** The seven apples that carry a skill. `hang` is where the painted apple used to be; `land` is its resting spot. */
export type AppleCfg = { id: string; sprite: string; hang: Pt; land: Pt };
export const SKILL_APPLES: AppleCfg[] = [
  { id: "front", sprite: "red", hang: { x: 319, y: 197 }, land: { x: 500, y: 666 } },
  { id: "backend", sprite: "green", hang: { x: 619, y: 202 }, land: { x: 668, y: 704 } },
  { id: "ai", sprite: "red-leaf", hang: { x: 962, y: 187 }, land: { x: 962, y: 668 } },
  { id: "tools", sprite: "yellow", hang: { x: 874, y: 215 }, land: { x: 782, y: 742 } },
  { id: "code", sprite: "crimson", hang: { x: 1058, y: 150 }, land: { x: 1050, y: 730 } },
  { id: "data", sprite: "orange", hang: { x: 1151, y: 267 }, land: { x: 1130, y: 684 } },
  { id: "cloud", sprite: "blush", hang: { x: 444, y: 332 }, land: { x: 585, y: 738 } },
];

/** Apples that only decorate the tree: they hang on the canopy, sway with it, and never fall. */
export const DECOR_APPLES: { sprite: string; x: number; y: number; rot: number }[] = [
  { sprite: "red", x: 319, y: 92, rot: -0.06 }, { sprite: "yellow", x: 452, y: 60, rot: 0.05 },
  { sprite: "orange", x: 392, y: 137, rot: 0.06 }, { sprite: "crimson", x: 469, y: 197, rot: -0.05 },
  { sprite: "crimson", x: 371, y: 255, rot: 0.08 }, { sprite: "green", x: 346, y: 266, rot: -0.1 },
  { sprite: "red-leaf", x: 265, y: 290, rot: 0.04 }, { sprite: "red", x: 586, y: 322, rot: -0.05 },
  { sprite: "blush", x: 699, y: 230, rot: -0.04 }, { sprite: "red", x: 967, y: 35, rot: -0.08 },
  { sprite: "orange", x: 1047, y: 75, rot: 0.03 }, { sprite: "yellow", x: 1082, y: 70, rot: 0.1 },
  { sprite: "red-leaf", x: 1145, y: 131, rot: -0.07 }, { sprite: "yellow", x: 1090, y: 190, rot: 0.05 },
  { sprite: "green", x: 1022, y: 239, rot: -0.03 }, { sprite: "blush", x: 983, y: 356, rot: 0.06 },
];

export const SKILL_APPLE_DIAMETER = 54;
export const DECOR_APPLE_DIAMETER = 58;

/* ---------- small helpers ---------- */

const smooth = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Eases in, rings for a while, then fades to exactly zero. */
function shake(t: number, t0: number, amp: number, period: number, phase: number, rise: number, end: number) {
  const tau = t - t0;
  if (tau <= 0 || tau >= end) return 0;
  const env = smooth(0, rise, tau) * (1 - smooth(end * 0.4, end, tau));
  return amp * env * Math.sin((2 * Math.PI * tau) / period + phase);
}

/* ---------- tree poses ---------- */

/** Sideways movement (px) of the top of the trunk. The base stays planted. */
export function trunkTopDx(t: number) {
  if (t <= 0 || t > 2.6) return 0;
  const env = Math.exp(-t * 2.6) * smooth(0, 0.06, t) * (1 - smooth(1.8, 2.6, t));
  return 3.2 * env * Math.sin(2 * Math.PI * 2.4 * t);
}

export function trunkSkew(t: number) {
  return -Math.atan(trunkTopDx(t) / (TRUNK_BASE_Y - TRUNK_TOP_Y));
}

export function branchPose(t: number): Pose {
  const d = trunkTopDx(t);
  return {
    dx: d + shake(t, 0.45, 1.3, 0.95, -0.2, 0.5, 3.8),
    dy: 0,
    rot: -shake(t, 0.45, 0.0066, 0.95, 0, 0.5, 3.8),
  };
}

export function canopyPose(t: number): Pose {
  const d = trunkTopDx(t);
  return {
    dx: d + shake(t, 0.8, 2.4, 0.95, -0.5, 0.6, 4.0),
    dy: shake(t, 0.8, 1.1, 0.475, 0.4, 0.6, 4.0),
    rot: -shake(t, 0.8, 0.0094, 0.95, -0.4, 0.6, 4.0),
  };
}

/** Same maths a CSS `translate(dx,dy) rotate(rot)` with `transform-origin: o` performs. */
export function applyPose(p: Pt, o: Pt, pose: Pose): Pt {
  const c = Math.cos(pose.rot);
  const s = Math.sin(pose.rot);
  const rx = p.x - o.x;
  const ry = p.y - o.y;
  return { x: o.x + pose.dx + c * rx - s * ry, y: o.y + pose.dy + s * rx + c * ry };
}

/* ---------- apples ---------- */

const GRAVITY = 1300;
const STEP = 1 / 120;

export type AppleSim = {
  cfg: AppleCfg;
  phase: "hang" | "fall" | "roll" | "rest";
  detachAt: number;
  swayPhase: number;
  swayAmp: number;
  swayFreq: number;
  x: number; y: number; // integrated centre
  vx: number; vy: number;
  rot: number; vrot: number;
  fallT: number; // duration of the first drop
  fallStart: number;
  bounces: number;
  landedAt: number;
  scale: number;
  // output
  outX: number; outY: number; outRot: number; outScale: number;
};

export type LeafSim = {
  sprite: number;
  start: Pt;
  t0: number; dur: number; drift: number; amp: number; freq: number; phase: number;
  spin: number; rock: number; scale: number; yEnd: number;
  // output
  x: number; y: number; rot: number; alpha: number; scale0: number;
};

export type TreeSim = {
  t: number;
  apples: AppleSim[];
  leaves: LeafSim[];
  rng: () => number;
};

export function depthScale(y: number) {
  return lerp(0.96, 1.1, clamp01((y - 150) / 570));
}

export function createSim(seed: number): TreeSim {
  const rng = makeRng(seed);
  const order = SKILL_APPLES.map((_, i) => i).sort(() => rng() - 0.5);
  // Uneven gaps between releases (seconds after the first apple lets go).
  const gaps = [0, 0.16, 0.31, 0.45, 0.63, 0.81, 0.99];
  const first = 1.35;
  const apples: AppleSim[] = SKILL_APPLES.map((cfg, i) => {
    const rank = order.indexOf(i);
    const detachAt = first + gaps[rank] + (rank === 0 ? 0 : (rng() - 0.5) * 0.08);
    return {
      cfg, phase: "hang", detachAt,
      swayPhase: rng() * Math.PI * 2, swayAmp: 5 + rng() * 9, swayFreq: 1.1 + rng() * 0.8,
      x: cfg.hang.x, y: cfg.hang.y, vx: 0, vy: 0, rot: 0, vrot: 0,
      fallT: 0, fallStart: 0, bounces: 0, landedAt: -1, scale: 1,
      outX: cfg.hang.x, outY: cfg.hang.y, outRot: 0, outScale: 1,
    };
  });

  // 12 leaves: most let go while the canopy is shaking, three drift down late to give a quiet ending.
  const zones: [number, number, number, number][] = [
    [250, 450, 295, 345], [470, 640, 280, 335], [790, 1000, 265, 320], [1010, 1230, 255, 310],
    [300, 700, 140, 250], [760, 1180, 110, 230],
  ];
  const leafOrder = LEAF_SPRITES.map((_, i) => i).sort(() => rng() - 0.5);
  const leaves: LeafSim[] = leafOrder.map((sprite, n) => {
    const late = n >= 9;
    const z = zones[Math.floor(rng() * zones.length)];
    const t0 = late ? 3.0 + (n - 9) * 0.45 + rng() * 0.25 : 1.0 + n * 0.24 + rng() * 0.16;
    const dir = rng() < 0.5 ? -1 : 1;
    const yEnd = 560 + rng() * 190;
    return {
      sprite,
      start: { x: lerp(z[0], z[1], rng()), y: lerp(z[2], z[3], rng()) },
      t0, dur: late ? 2.9 + rng() * 0.6 : 2.2 + rng() * 1.2,
      drift: dir * (30 + rng() * 120), amp: 14 + rng() * 26, freq: 0.5 + rng() * 0.45, phase: rng() * 6.28,
      spin: dir * (0.3 + rng() * 1.1), rock: 0.35 + rng() * 0.5,
      scale: 0.42 + rng() * 0.2, yEnd,
      x: 0, y: 0, rot: 0, alpha: 0, scale0: 0.5,
    };
  });
  return { t: 0, apples, leaves, rng };
}

function startFall(a: AppleSim, rng: () => number, t: number) {
  const target = a.cfg.land;
  const vy0 = 30;
  const d = target.y - a.y;
  const T = (-vy0 + Math.sqrt(vy0 * vy0 + 2 * GRAVITY * d)) / GRAVITY;
  a.phase = "fall";
  a.fallStart = t;
  a.fallT = T;
  a.vx = (target.x - a.x) / T;
  a.vy = vy0;
  const spinTotal = (rng() < 0.5 ? -1 : 1) * (0.1 + rng() * 0.24);
  a.vrot = spinTotal / T;
  a.swayAmp *= 0.9;
}

function stepApple(a: AppleSim, rng: () => number, t: number, h: number) {
  if (a.phase === "rest") return;
  if (a.phase === "hang") {
    const cp = applyPose({ x: a.cfg.hang.x, y: a.cfg.hang.y }, CANOPY_PIVOT, canopyPose(t));
    const tau = Math.max(0, t - 0.8);
    const ramp = smooth(0, 0.7, tau); // swings harder as the shake builds, until it lets go
    const swing = ramp * 0.1 * Math.sin(2 * Math.PI * a.swayFreq * 1.7 * tau + a.swayPhase);
    a.x = cp.x; a.y = cp.y; a.rot = swing;
    a.outX = a.x; a.outY = a.y; a.outRot = a.rot; a.outScale = 1;
    if (t >= a.detachAt) startFall(a, rng, t);
    return;
  }
  const r = (SKILL_APPLE_DIAMETER / 2) * a.scale;
  if (a.phase === "fall") {
    a.vy += GRAVITY * h;
    a.x += a.vx * h;
    a.y += a.vy * h;
    a.rot += a.vrot * h;
    a.scale = depthScale(a.y);
    const target = a.cfg.land;
    if (a.y >= target.y) {
      a.y = target.y;
      if (a.bounces === 0) {
        a.bounces = 1;
        a.vy = -a.vy * (0.2 + rng() * 0.07); // one small hop
        a.vx *= 0.2;
        a.vrot *= 0.3;
      } else {
        a.vy = 0;
        a.phase = "roll";
        // a few apples pick up a tiny extra roll
        if (Math.abs(a.vx) < 14 && rng() < 0.6) a.vx += (rng() < 0.5 ? -1 : 1) * (14 + rng() * 22);
      }
    }
    return;
  }
  if (a.phase === "roll") {
    a.x += a.vx * h;
    a.vx *= Math.exp(-5.5 * h);
    a.rot += (a.vx / r) * h * 0.5;
    if (Math.abs(a.vx) < 5) {
      a.vx = 0;
      a.phase = "rest";
      a.landedAt = t;
    }
  }
}

function updateOutputs(a: AppleSim, t: number) {
  if (a.phase === "hang") return;
  let ox = a.x;
  if (a.phase === "fall") {
    // lateral wobble that dies out as the apple reaches the ground
    const tau = t - a.fallStart;
    const k = Math.max(0, 1 - tau / Math.max(a.fallT, 0.01));
    ox += a.swayAmp * Math.sin(2 * Math.PI * a.swayFreq * tau + a.swayPhase) * k * k;
  }
  a.outX = ox;
  a.outY = a.y;
  a.outRot = a.rot;
  a.outScale = a.phase === "fall" || a.phase === "roll" || a.phase === "rest" ? depthScale(a.y) : 1;
}

function updateLeaf(l: LeafSim, sim: TreeSim, t: number) {
  const tau = t - l.t0;
  if (tau < 0 || tau > l.dur) {
    l.alpha = 0;
    return;
  }
  const u = tau / l.dur;
  const o = applyPose(l.start, CANOPY_PIVOT, canopyPose(l.t0));
  const eased = 0.35 * u * u + 0.65 * u;
  l.x = o.x + l.drift * u + l.amp * Math.sin(2 * Math.PI * l.freq * tau + l.phase) * (0.3 + 0.7 * u);
  l.y = o.y + (l.yEnd - o.y) * eased;
  l.rot = l.spin * tau + l.rock * Math.cos(2 * Math.PI * l.freq * tau + l.phase);
  l.scale0 = l.scale * (1 + 0.28 * u); // drifts slightly toward the viewer
  l.alpha = smooth(0, 0.1, tau) * (1 - smooth(l.dur - 0.45, l.dur, tau));
  void sim;
}

/** Advance the simulation to time `t` (seconds since the click). */
export function advance(sim: TreeSim, t: number) {
  while (sim.t < t) {
    const h = Math.min(STEP, t - sim.t);
    sim.t += h;
    for (const a of sim.apples) stepApple(a, sim.rng, sim.t, h);
  }
  for (const a of sim.apples) updateOutputs(a, t);
  for (const l of sim.leaves) updateLeaf(l, sim, t);
}

/** True once the tree is calm: nothing is moving any more. */
export function isFinished(sim: TreeSim, t: number) {
  if (t < 4.1) return false;
  if (sim.apples.some((a) => a.phase !== "rest")) return false;
  return sim.leaves.every((l) => t >= l.t0 + l.dur);
}

/** Resting spot of an apple once it has landed (used for reduced-motion and for reset). */
export function restPose(cfg: AppleCfg) {
  return { x: cfg.land.x, y: cfg.land.y, rot: 0, scale: depthScale(cfg.land.y) };
}
