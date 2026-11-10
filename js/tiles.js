// 16x16 terrain tiles drawn in code, autotiled against their neighbours, and the map pre-renderer.
import { canvas, Painter, ramp, hash, bayer, mix, snes } from './gfx.js';

const px = (g, x, y, c) => { g.fillStyle = c; g.fillRect(x, y, 1, 1); };
const rect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };

// ---------- palettes ----------
const PAL = {
  grass: ['#2f6f30', '#3f8f38', '#50a840', '#70c058', '#98d870'],
  dirt: ['#7a5430', '#a07440', '#c09858', '#d8b478', '#e8cc98'],
  sand: ['#b09058', '#d0b070', '#e8cc88', '#f4e0a8', '#fff0c8'],
  water: ['#183898', '#2050c0', '#3070e0', '#68a0f8', '#c0e0ff'],
  stone: ['#383848', '#585868', '#787888', '#9898a8', '#c0c0c8'],
  wood: ['#4a2810', '#6b3c1c', '#8c5428', '#b07038', '#d09858'],
  plaster: ['#988060', '#c0a880', '#e0cca0', '#f0e0c0', '#fff4e0'],
  cave: ['#281810', '#4a3020', '#6b4830', '#8c6848', '#b08868'],
  cfloor: ['#3a2c28', '#54403a', '#6c5448', '#84705c', '#a08c74'],
  tower: ['#141c38', '#283460', '#3c4c80', '#5868a0', '#8090c0'],
  tfloor: ['#303850', '#485470', '#606c88', '#7c88a0', '#a0aac0'],
  ice: ['#3870a8', '#58a0d0', '#88c8e8', '#b8e8f8', '#ffffff'],
};
export const ROOF = {
  r: ['#601818', '#902828', '#c04030', '#e06848', '#f89878'],
  b: ['#182850', '#284880', '#3868b0', '#5890d8', '#90c0f0'],
  g: ['#183818', '#286030', '#388848', '#58a868', '#90d098'],
  p: ['#381848', '#583070', '#784898', '#9868b8', '#c098e0'],
};

// ---------- shared painted props ----------
function paintTree(seed, rp = ramp('#3c9840', 6), trunk = PAL.wood, pine = false) {
  const p = new Painter(16, 22, { dither: 0.6 });
  p.tube([[8, 15, 2, 0], [8, 21, 2.2, 0]], trunk, { zk: 0.4 });
  if (pine) {
    p.poly([[8, 1], [15, 12], [1, 12]], rp, { z: 6, lum: 0.62, grad: 0.5 });
    p.poly([[8, 5], [15.5, 17], [0.5, 17]], rp, { z: 5, lum: 0.5, grad: 0.4 });
  } else {
    const r = (k) => hash(seed, k);
    p.ball(8, 9, 7.4, 7, rp, { z: 3, amb: 0.2 });
    p.ball(5 + r(1) * 2, 6 + r(2), 3.4, 3, rp, { z: 8, amb: 0.3 });
    p.ball(10 + r(3) * 2, 7 + r(4), 3.2, 3, rp, { z: 8, amb: 0.3 });
    p.ball(8, 12, 4, 2.6, rp, { z: 7, amb: 0.18 });
  }
  return p.finish({ out: '#10200c', inner: 3 });
}
function paintRock(seed, rp = PAL.stone) {
  const p = new Painter(16, 16);
  p.ball(8, 9, 6.5, 5.5, rp, { z: 0, flat: 0.25 });
  p.ball(6, 7, 3, 2.5, rp, { z: 4, amb: 0.35 });
  return p.finish({ out: '#181820' });
}
function paintBush(rp = ramp('#48a048', 5)) {
  const p = new Painter(16, 16);
  p.ball(5, 10, 4.5, 4, rp, { z: 1 }); p.ball(11, 10, 4.5, 4, rp, { z: 1 }); p.ball(8, 7, 5, 4.5, rp, { z: 3 });
  return p.finish({ out: '#10200c', inner: 2 });
}
const PROPS = {};
function prop(name, make) { return PROPS[name] || (PROPS[name] = make()); }

// ---------- texture painters ----------
function grassTex(g, X, Y, P = PAL.grass, dense = 1) {
  rect(g, 0, 0, 16, 16, P[2]);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const h = hash(X * 16 + x, Y * 16 + y, 7);
    if (h < 0.05 * dense) px(g, x, y, P[1]);
    else if (h > 0.965) px(g, x, y, P[3]);
  }
  // tufts
  for (let k = 0; k < 2; k++) {
    if (hash(X, Y, 20 + k) < 0.55) continue;
    const tx = 2 + Math.floor(hash(X, Y, 30 + k) * 11), ty = 3 + Math.floor(hash(X, Y, 40 + k) * 10);
    px(g, tx, ty, P[3]); px(g, tx + 2, ty, P[3]); px(g, tx + 1, ty + 1, P[3]);
    px(g, tx, ty + 1, P[1]); px(g, tx + 2, ty + 1, P[1]); px(g, tx + 1, ty + 2, P[1]);
  }
}
function speckle(g, X, Y, P, k = 3, n = 0.08) {
  rect(g, 0, 0, 16, 16, P[2]);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const h = hash(X * 16 + x, Y * 16 + y, k);
    if (h < n) px(g, x, y, P[1]); else if (h > 1 - n * 0.7) px(g, x, y, P[3]);
  }
  // a few pebbles
  if (hash(X, Y, k + 9) > 0.55) {
    const x = 2 + Math.floor(hash(X, Y, k + 10) * 11), y = 2 + Math.floor(hash(X, Y, k + 11) * 11);
    px(g, x, y, P[4]); px(g, x + 1, y, P[3]); px(g, x, y + 1, P[1]); px(g, x + 1, y + 1, P[1]);
  }
}
function waterTex(g, X, Y, f, P = PAL.water) {
  rect(g, 0, 0, 16, 16, P[2]);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const wx = X * 16 + x, wy = Y * 16 + y;
    const v = Math.sin(wx * 0.4 + wy * 0.15 + f * Math.PI * 2 / 3) + Math.sin(wy * 0.7 - wx * 0.1 - f * Math.PI * 2 / 3) * 0.8;
    if (v > 1.45) px(g, x, y, P[3]);
    else if (v > 1.2 && (wx + wy + f) % 2 === 0) px(g, x, y, P[3]);
    else if (v < -1.4) px(g, x, y, P[1]);
  }
  if (hash(X, Y, 50 + f) > 0.82) { const x = 3 + Math.floor(hash(X, Y, 51) * 9), y = 3 + Math.floor(hash(X, Y, 52) * 9); rect(g, x, y, 3, 1, P[4]); }
}
function bricks(g, P, bw = 8, bh = 4, off = 4, X = 0, Y = 0) {
  rect(g, 0, 0, 16, 16, P[2]);
  for (let y = 0; y < 16; y += bh) {
    const o = ((Y * 16 + y) / bh) % 2 ? off : 0;
    for (let x = -bw; x < 16; x += bw) {
      const xx = x + o, sh = hash(X * 16 + xx, Y * 16 + y, 3);
      rect(g, xx, y, bw, bh, sh > 0.7 ? P[3] : sh < 0.2 ? mix(P[2], P[1], 0.5) : P[2]);
      rect(g, xx, y + bh - 1, bw, 1, P[1]); rect(g, xx + bw - 1, y, 1, bh, P[1]);
      rect(g, xx, y, bw - 1, 1, P[3]);
    }
  }
}

// ---------- tile kinds ----------
// solid: blocks walking.  draw(g, X, Y, n, f): n(dx, dy) gives a neighbour's kind, f is the water frame.
// up(g, ...) draws into the overhang layer for the tile above (tree tops that hide the player).
const GRASSY = new Set(['grass', 'flower', 'tree', 'pine', 'bush', 'rock', 'fence', 'sign', 'tall', 'well', 'stump', 'oforest', 'ograss', 'ohill', 'lamp', 'ostone']);
const isWater = (k) => k === 'water' || k === 'cwater' || k === 'osea' || k === 'twater' || k === 'deep';
const fringe = (g, X, Y, n, base) => {
  // grass spilling over the edges of paths and sand, with a darker lip
  const G = PAL.grass;
  const side = (dx, dy) => GRASSY.has(n(dx, dy));
  for (let i = 0; i < 16; i++) {
    const j = 2 + Math.floor(hash(X * 16 + i, Y * 16, 61) * 2.2), jb = 2 + Math.floor(hash(X * 16 + i, Y * 16 + 16, 61) * 2.2);
    const jl = 2 + Math.floor(hash(X * 16, Y * 16 + i, 62) * 2.2), jr = 2 + Math.floor(hash(X * 16 + 16, Y * 16 + i, 62) * 2.2);
    if (side(0, -1)) { rect(g, i, 0, 1, j, G[2]); px(g, i, j, G[1]); }
    if (side(0, 1)) { rect(g, i, 16 - jb, 1, jb, G[2]); px(g, i, 15 - jb, G[3]); }
    if (side(-1, 0)) { rect(g, 0, i, jl, 1, G[2]); px(g, jl, i, G[1]); }
    if (side(1, 0)) { rect(g, 16 - jr, i, jr, 1, G[2]); px(g, 15 - jr, i, G[1]); }
  }
  // inner corners
  const c = (dx, dy, x, y) => { if (GRASSY.has(n(dx, dy)) && !side(dx, 0) && !side(0, dy)) { rect(g, x, y, 2, 2, G[2]); } };
  c(-1, -1, 0, 0); c(1, -1, 14, 0); c(-1, 1, 0, 14); c(1, 1, 14, 14);
};
const shoreFoam = (g, X, Y, n, f, P = PAL.water) => {
  // light foam where water meets land, a shadow where land rises above it
  for (let i = 0; i < 16; i++) {
    const w = Math.sin((X * 16 + i) * 0.5 + f * 2.1) > 0.3 ? 2 : 1;
    if (!isWater(n(0, -1)) && n(0, -1) !== 'bridge') { rect(g, i, 0, 1, 2, P[0]); rect(g, i, 2, 1, w, P[4]); }
    if (!isWater(n(0, 1)) && n(0, 1) !== 'bridge') rect(g, i, 16 - w, 1, w, P[4]);
    if (!isWater(n(-1, 0)) && n(-1, 0) !== 'bridge') rect(g, 0, i, w, 1, P[4]);
    if (!isWater(n(1, 0)) && n(1, 0) !== 'bridge') rect(g, 16 - w, i, w, 1, P[4]);
  }
};
// wall autotile: a dark top unless the tile below is open, then a lit face
function wallTile(P, top, face) {
  return {
    solid: true,
    draw(g, X, Y, n) {
      const me = n(0, 0), wallish = (k) => k === me || (TILES[k] && TILES[k].wall);
      if (wallish(n(0, 1))) {
        rect(g, 0, 0, 16, 16, top);
        // a lit rim where the top meets open floor
        if (!wallish(n(0, -1))) rect(g, 0, 0, 16, 2, P[1]);
        if (!wallish(n(-1, 0))) rect(g, 0, 0, 2, 16, P[1]);
        if (!wallish(n(1, 0))) rect(g, 14, 0, 2, 16, P[1]);
        for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (hash(X * 16 + x, Y * 16 + y, 77) > 0.985) px(g, x, y, mix(top, P[1], 0.6));
      } else face(g, X, Y, n, P);
    },
    wall: true,
  };
}

export const TILES = {
  grass: { draw: (g, X, Y) => grassTex(g, X, Y) },
  tall: { draw(g, X, Y) { grassTex(g, X, Y); const G = PAL.grass; for (let k = 0; k < 7; k++) { const x = 1 + ((k * 5 + X * 3) % 14), y = 4 + ((k * 7 + Y) % 10); px(g, x, y, G[4]); px(g, x, y + 1, G[3]); px(g, x + 1, y + 2, G[1]); px(g, x - 1, y + 2, G[1]); } } },
  flower: {
    draw(g, X, Y) {
      grassTex(g, X, Y);
      const cols = [['#f8f8f8', '#f8e050'], ['#f87878', '#f8f0a0'], ['#f8d040', '#c06010'], ['#a0a0f8', '#f8f8f8']];
      for (let k = 0; k < 3; k++) {
        const [pc, cc] = cols[Math.floor(hash(X, Y, 80 + k) * 4)], x = 2 + Math.floor(hash(X, Y, 90 + k) * 11), y = 2 + Math.floor(hash(X, Y, 95 + k) * 11);
        px(g, x - 1, y, pc); px(g, x + 1, y, pc); px(g, x, y - 1, pc); px(g, x, y + 1, pc); px(g, x, y, cc); px(g, x, y + 2, PAL.grass[1]);
      }
    },
  },
  dirt: { draw(g, X, Y, n) { speckle(g, X, Y, PAL.dirt, 3); fringe(g, X, Y, n); } },
  sand: { draw(g, X, Y, n) { speckle(g, X, Y, PAL.sand, 5, 0.06); fringe(g, X, Y, n); } },
  water: { solid: true, anim: true, draw(g, X, Y, n, f) { waterTex(g, X, Y, f); shoreFoam(g, X, Y, n, f); } },
  deep: { solid: true, anim: true, draw(g, X, Y, n, f) { waterTex(g, X, Y, f, ramp('#1838a0', 5)); shoreFoam(g, X, Y, n, f, ramp('#1838a0', 5)); } },
  tree: { solid: true, draw(g, X, Y) { grassTex(g, X, Y); g.drawImage(prop('tree' + ((X * 7 + Y * 3) % 3), () => paintTree((X * 7 + Y * 3) % 3)), 0, -6); }, up(g, X, Y) { g.drawImage(prop('tree' + ((X * 7 + Y * 3) % 3), () => paintTree((X * 7 + Y * 3) % 3)), 0, 10); } },
  pine: { solid: true, draw(g, X, Y) { grassTex(g, X, Y); g.drawImage(prop('pine', () => paintTree(0, ramp('#2c7848', 6), PAL.wood, true)), 0, -6); }, up(g) { g.drawImage(prop('pine', () => paintTree(0, ramp('#2c7848', 6), PAL.wood, true)), 0, 10); } },
  bush: { solid: true, draw(g, X, Y) { grassTex(g, X, Y); g.drawImage(prop('bush', () => paintBush()), 0, 0); } },
  rock: { solid: true, draw(g, X, Y) { grassTex(g, X, Y); g.drawImage(prop('rock', () => paintRock(1)), 0, 0); } },
  stump: { solid: true, draw(g, X, Y) { grassTex(g, X, Y); const W = PAL.wood; rect(g, 4, 6, 8, 7, W[2]); rect(g, 4, 5, 8, 3, W[4]); rect(g, 6, 6, 4, 1, W[3]); rect(g, 4, 12, 8, 1, W[0]); rect(g, 3, 6, 1, 7, '#201008'); rect(g, 12, 6, 1, 7, '#201008'); rect(g, 4, 4, 8, 1, '#201008'); rect(g, 4, 13, 8, 1, '#201008'); } },
  fence: {
    solid: true,
    draw(g, X, Y, n) {
      grassTex(g, X, Y);
      const W = PAL.wood, l = n(-1, 0) === 'fence', r = n(1, 0) === 'fence';
      rect(g, l ? 0 : 6, 6, (l ? 6 : 0) + (r ? 10 : 4), 2, W[3]); rect(g, l ? 0 : 6, 8, (l ? 6 : 0) + (r ? 10 : 4), 1, W[0]);
      rect(g, l ? 0 : 6, 10, (l ? 6 : 0) + (r ? 10 : 4), 2, W[3]); rect(g, l ? 0 : 6, 12, (l ? 6 : 0) + (r ? 10 : 4), 1, W[0]);
      rect(g, 6, 3, 4, 12, W[2]); rect(g, 6, 3, 4, 1, W[4]); rect(g, 9, 4, 1, 11, W[1]); rect(g, 5, 3, 1, 12, '#201008'); rect(g, 10, 3, 1, 12, '#201008');
    },
  },
  sign: { solid: true, draw(g, X, Y) { grassTex(g, X, Y); const W = PAL.wood; rect(g, 7, 9, 2, 6, W[1]); rect(g, 2, 3, 12, 7, '#201008'); rect(g, 3, 4, 10, 5, W[3]); rect(g, 3, 4, 10, 1, W[4]); rect(g, 4, 6, 8, 1, W[1]); } },
  well: {
    solid: true,
    draw(g, X, Y) {
      grassTex(g, X, Y); const S = PAL.stone;
      rect(g, 1, 5, 14, 10, '#181820'); rect(g, 2, 6, 12, 8, S[2]); rect(g, 2, 6, 12, 2, S[3]); rect(g, 4, 6, 8, 3, '#102040');
      for (let x = 2; x < 14; x += 4) rect(g, x, 10, 1, 4, S[1]); rect(g, 2, 9, 12, 1, S[1]);
      rect(g, 2, 0, 1, 6, PAL.wood[1]); rect(g, 13, 0, 1, 6, PAL.wood[1]); rect(g, 1, 0, 14, 2, PAL.wood[3]);
    },
  },
  lamp: { solid: true, draw(g, X, Y) { grassTex(g, X, Y); rect(g, 7, 4, 2, 11, '#282830'); rect(g, 5, 14, 6, 2, '#282830'); rect(g, 5, 0, 6, 5, '#282830'); rect(g, 6, 1, 4, 3, '#f8e070'); px(g, 7, 2, '#ffffff'); } },
  // stone town wall and cliffs share the wall autotile
  wall: wallTile(PAL.stone, '#3c3c50', (g, X, Y, n, P) => { bricks(g, P, 8, 4, 4, X, Y); rect(g, 0, 15, 16, 1, '#202028'); }),
  cliff: wallTile(['#40301c', '#6b5030', '#8c6c40', '#b09058', '#d0b078'], '#3f8f38', (g, X, Y, n, P) => {
    rect(g, 0, 0, 16, 16, P[2]);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const h = hash(X * 16 + x, Y * 16 + y, 33); if ((x + Math.floor(hash(X * 16 + x, 0, 34) * 3)) % 5 === 0) px(g, x, y, P[1]); else if (h > 0.93) px(g, x, y, P[3]); }
    rect(g, 0, 0, 16, 2, PAL.grass[1]); for (let x = 0; x < 16; x++) if (hash(X * 16 + x, Y, 35) > 0.5) px(g, x, 2, PAL.grass[1]);
    rect(g, 0, 14, 16, 2, P[0]);
  }),
  // houses
  hwall: { solid: true, draw(g, X, Y, n) { const P = PAL.plaster, W = PAL.wood; rect(g, 0, 0, 16, 16, P[2]); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (hash(X * 16 + x, Y * 16 + y, 4) > 0.92) px(g, x, y, P[1]); rect(g, 0, 0, 16, 2, W[1]); rect(g, 0, 2, 16, 1, P[0]); rect(g, 0, 14, 16, 2, W[1]); if (n(-1, 0) !== 'hwall' && n(-1, 0) !== 'window' && n(-1, 0) !== 'door') rect(g, 0, 0, 2, 16, W[2]); if (n(1, 0) !== 'hwall' && n(1, 0) !== 'window' && n(1, 0) !== 'door') rect(g, 14, 0, 2, 16, W[1]); } },
  window: { solid: true, draw(g, X, Y, n) { TILES.hwall.draw(g, X, Y, (dx, dy) => (dx || dy ? n(dx, dy) : 'hwall')); const W = PAL.wood; rect(g, 3, 4, 10, 9, W[0]); rect(g, 4, 5, 8, 7, '#f8d870'); rect(g, 4, 5, 8, 2, '#fff0b0'); rect(g, 7, 5, 2, 7, W[1]); rect(g, 4, 8, 8, 1, W[1]); rect(g, 2, 13, 12, 2, W[3]); } },
  door: { draw(g, X, Y, n) { TILES.hwall.draw(g, X, Y, (dx, dy) => (dx || dy ? n(dx, dy) : 'hwall')); const W = PAL.wood; rect(g, 2, 2, 12, 14, '#201008'); rect(g, 3, 3, 10, 13, W[2]); rect(g, 3, 3, 10, 1, W[3]); for (let x = 5; x < 13; x += 3) rect(g, x, 4, 1, 12, W[1]); px(g, 11, 10, '#f8d040'); } },
  shop: { solid: true, draw(g, X, Y, n) { TILES.hwall.draw(g, X, Y, (dx, dy) => (dx || dy ? n(dx, dy) : 'hwall')); rect(g, 1, 3, 14, 10, '#201008'); rect(g, 2, 4, 12, 8, '#f0e0b0'); } },
  // church / stone buildings
  swall: { solid: true, draw(g, X, Y) { bricks(g, ['#606070', '#9090a0', '#b8b8c8', '#d8d8e0', '#f0f0f8'], 8, 4, 4, X, Y); rect(g, 0, 14, 16, 2, '#505060'); } },
  swin: { solid: true, draw(g, X, Y) { TILES.swall.draw(g, X, Y); rect(g, 5, 2, 6, 12, '#202030'); rect(g, 6, 3, 4, 10, '#5878d8'); rect(g, 6, 3, 2, 5, '#a0c8f8'); rect(g, 8, 8, 2, 5, '#e05050'); rect(g, 6, 3, 4, 1, '#202030'); } },
  sdoor: { draw(g, X, Y) { TILES.swall.draw(g, X, Y); rect(g, 3, 2, 10, 14, '#201008'); rect(g, 4, 4, 8, 12, PAL.wood[2]); rect(g, 5, 3, 6, 1, PAL.wood[2]); rect(g, 7, 4, 1, 12, PAL.wood[0]); px(g, 6, 10, '#f8d040'); px(g, 9, 10, '#f8d040'); } },
  // roofs carry a colour in the map legend (roof_r, roof_b ...)
  bridge: {
    draw(g, X, Y, n, f) {
      const vert = isWater(n(-1, 0)) && isWater(n(1, 0)), W = PAL.wood;
      waterTex(g, X, Y, f);
      if (vert) { rect(g, 1, 0, 14, 16, W[2]); for (let y = 0; y < 16; y += 4) { rect(g, 1, y + 3, 14, 1, W[0]); rect(g, 1, y, 14, 1, W[4]); } rect(g, 0, 0, 2, 16, W[1]); rect(g, 14, 0, 2, 16, W[1]); rect(g, 0, 0, 1, 16, '#201008'); rect(g, 15, 0, 1, 16, '#201008'); }
      else { rect(g, 0, 1, 16, 14, W[2]); for (let x = 0; x < 16; x += 4) { rect(g, x + 3, 1, 1, 14, W[0]); rect(g, x, 1, 1, 14, W[4]); } rect(g, 0, 0, 16, 2, W[3]); rect(g, 0, 14, 16, 2, W[1]); rect(g, 0, 16, 16, 1, '#201008'); }
    },
    anim: true,
  },
  dock: { draw(g, X, Y, n, f) { waterTex(g, X, Y, f); const W = PAL.wood; rect(g, 0, 0, 16, 16, W[2]); for (let y = 0; y < 16; y += 4) { rect(g, 0, y + 3, 16, 1, W[0]); rect(g, 0, y, 16, 1, W[3]); } rect(g, 1, 1, 1, 1, W[0]); rect(g, 14, 9, 1, 1, W[0]); }, anim: true },
  // interiors
  floor: { draw(g, X, Y) { const W = PAL.wood; rect(g, 0, 0, 16, 16, W[3]); for (let y = 0; y < 16; y += 4) { rect(g, 0, y + 3, 16, 1, W[1]); const o = ((Y * 4 + y / 4) * 7) % 16; rect(g, o, y, 1, 3, W[1]); rect(g, (o + 9) % 16, y, 1, 3, W[2]); } for (let x = 0; x < 16; x++) if (hash(X * 16 + x, Y, 6) > 0.8) px(g, x, (x * 5) % 16, W[2]); } },
  carpet: { draw(g, X, Y, n) { rect(g, 0, 0, 16, 16, '#a82838'); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if ((x + y) % 4 === 0 && (x + Y * 16 + y) % 8 < 2) px(g, x, y, '#c84050'); const e = (k) => k !== 'carpet'; if (e(n(0, -1))) rect(g, 0, 0, 16, 2, '#f0c040'); if (e(n(0, 1))) rect(g, 0, 14, 16, 2, '#f0c040'); if (e(n(-1, 0))) rect(g, 0, 0, 2, 16, '#f0c040'); if (e(n(1, 0))) rect(g, 14, 0, 2, 16, '#f0c040'); } },
  iwall: wallTile(PAL.wood, '#2a1810', (g, X, Y) => { rect(g, 0, 0, 16, 16, '#e8d8b0'); for (let x = 0; x < 16; x += 4) rect(g, x, 0, 2, 13, '#d8c498'); rect(g, 0, 0, 16, 1, '#a08860'); rect(g, 0, 12, 16, 4, PAL.wood[2]); rect(g, 0, 12, 16, 1, PAL.wood[4]); rect(g, 0, 15, 16, 1, PAL.wood[0]); }),
  counter: { solid: true, draw(g, X, Y, n) { TILES.floor.draw(g, X, Y); const W = PAL.wood; rect(g, 0, 2, 16, 13, W[1]); rect(g, 0, 2, 16, 4, W[4]); rect(g, 0, 6, 16, 1, W[0]); for (let x = 1; x < 16; x += 5) rect(g, x, 8, 3, 5, W[2]); rect(g, 0, 15, 16, 1, '#201008'); } },
  table: { solid: true, draw(g, X, Y) { TILES.floor.draw(g, X, Y); const W = PAL.wood; rect(g, 1, 3, 14, 9, '#201008'); rect(g, 2, 4, 12, 6, W[4]); rect(g, 2, 10, 12, 2, W[1]); rect(g, 2, 12, 2, 3, W[0]); rect(g, 12, 12, 2, 3, W[0]); rect(g, 6, 5, 4, 3, '#f0f0f0'); rect(g, 7, 6, 2, 1, '#d06040'); } },
  bed: { solid: true, draw(g, X, Y, n) { TILES.floor.draw(g, X, Y); const top = n(0, -1) !== 'bed'; rect(g, 1, 0, 14, 16, '#201008'); rect(g, 2, top ? 1 : 0, 12, 16, '#5878c8'); if (top) { rect(g, 2, 1, 12, 3, PAL.wood[2]); rect(g, 3, 4, 10, 4, '#f8f8f8'); rect(g, 3, 7, 10, 1, '#c0c0d0'); } rect(g, 2, top ? 8 : 0, 12, 1, '#90b0f0'); } },
  shelf: { solid: true, draw(g, X, Y) { const W = PAL.wood; rect(g, 0, 0, 16, 16, W[1]); rect(g, 1, 1, 14, 14, W[0]); for (let y = 1; y < 15; y += 5) { rect(g, 1, y + 4, 14, 1, W[3]); for (let x = 2; x < 14; x += 2) rect(g, x, y + 1, 1, 3, ['#c03030', '#3050c0', '#30a050', '#e0c040', '#a050c0'][(x + y + X) % 5]); } } },
  pot: { solid: true, draw(g, X, Y, n) { (TILES[n(0, 0) === 'pot' ? 'floor' : 'floor']).draw(g, X, Y); const p = prop('pot', () => { const P = new Painter(16, 16); P.ball(8, 10, 5.5, 5, ramp('#b06838', 5), { z: 0 }); P.ball(8, 5, 3, 1.5, ramp('#804020', 5), { z: 5 }); return P.finish({ out: '#201008' }); }); g.drawImage(p, 0, 0); } },
  barrel: { solid: true, draw(g, X, Y) { TILES.floor.draw(g, X, Y); const W = PAL.wood; rect(g, 2, 2, 12, 13, '#201008'); rect(g, 3, 3, 10, 11, W[2]); rect(g, 3, 3, 10, 3, W[3]); rect(g, 3, 6, 10, 1, '#404050'); rect(g, 3, 11, 10, 1, '#404050'); rect(g, 6, 3, 1, 11, W[1]); rect(g, 10, 3, 1, 11, W[1]); } },
  crate: { solid: true, draw(g, X, Y, n) { (TILES[n(0, 1) === 'dock' ? 'dock' : 'floor'] || TILES.floor).draw(g, X, Y, n, 0); const W = PAL.wood; rect(g, 1, 1, 14, 14, '#201008'); rect(g, 2, 2, 12, 12, W[3]); rect(g, 2, 2, 12, 2, W[4]); rect(g, 2, 7, 12, 1, W[1]); for (let i = 2; i < 14; i++) px(g, i, i, W[1]); } },
  hearth: { solid: true, draw(g, X, Y) { bricks(g, PAL.stone, 8, 4, 4, X, Y); rect(g, 3, 6, 10, 10, '#100808'); rect(g, 5, 10, 6, 5, '#f07020'); rect(g, 6, 11, 4, 3, '#f8d050'); rect(g, 2, 4, 12, 2, PAL.stone[3]); } },
  stairs: { draw(g, X, Y) { const S = PAL.stone; for (let y = 0; y < 16; y += 4) { rect(g, 0, y, 16, 4, S[2 + ((y / 4) % 2)]); rect(g, 0, y + 3, 16, 1, S[0]); rect(g, 0, y, 16, 1, S[4]); } rect(g, 0, 0, 1, 16, S[0]); rect(g, 15, 0, 1, 16, S[0]); } },
  down: { draw(g, X, Y) { rect(g, 0, 0, 16, 16, '#100810'); for (let y = 0; y < 4; y++) { rect(g, 2 + y, 2 + y * 3, 12 - y * 2, 3, ['#706070', '#504050', '#383038', '#201820'][y]); } } },
  altar: { solid: true, draw(g, X, Y) { TILES.carpet.draw(g, X, Y, () => 'carpet'); rect(g, 1, 3, 14, 12, '#606070'); rect(g, 1, 3, 14, 3, '#d8d8e0'); rect(g, 2, 7, 12, 1, '#404050'); rect(g, 6, 0, 4, 4, '#f0d050'); rect(g, 7, 0, 2, 2, '#ffffff'); } },
  pew: { solid: true, draw(g, X, Y) { TILES.floor.draw(g, X, Y); const W = PAL.wood; rect(g, 0, 4, 16, 9, '#201008'); rect(g, 0, 5, 16, 4, W[3]); rect(g, 0, 9, 16, 3, W[1]); } },
  // cave
  cfloor: { draw(g, X, Y) { speckle(g, X, Y, PAL.cfloor, 11, 0.07); if (hash(X, Y, 12) > 0.85) { const x = 3 + Math.floor(hash(X, Y, 13) * 9); rect(g, x, 6, 4, 1, PAL.cfloor[1]); rect(g, x + 1, 7, 3, 1, PAL.cfloor[1]); } } },
  cwall: wallTile(PAL.cave, '#1a100c', (g, X, Y, n, P) => {
    rect(g, 0, 0, 16, 16, P[2]);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const h = hash(X * 16 + x, Y * 16 + y, 21), b = Math.sin((X * 16 + x) * 0.9 + y * 0.3) + Math.sin(y * 0.6 + (X * 16 + x) * 0.2);
      if (b > 1.3) px(g, x, y, P[3]); else if (b < -1.2) px(g, x, y, P[1]); else if (h > 0.95) px(g, x, y, P[4]);
    }
    rect(g, 0, 0, 16, 1, P[1]); rect(g, 0, 13, 16, 3, P[0]); rect(g, 0, 12, 16, 1, P[1]);
  }),
  cwater: { solid: true, anim: true, draw(g, X, Y, n, f) { waterTex(g, X, Y, f, ramp('#285878', 5)); shoreFoam(g, X, Y, n, f, ramp('#285878', 5)); } },
  crystal: { solid: true, draw(g, X, Y) { TILES.cfloor.draw(g, X, Y); const p = prop('crys', () => { const P = new Painter(16, 16, { dither: 0.3 }); const R = ramp('#40c8e8', 5); P.poly([[8, 1], [12, 8], [8, 15], [4, 8]], R, { z: 4, lum: 0.75 }); P.poly([[4, 6], [7, 10], [4, 15], [1, 10]], R, { z: 2, lum: 0.5 }); P.poly([[12, 5], [15, 10], [12, 15], [9, 10]], R, { z: 2, lum: 0.55 }); P.px(7, 4, '#ffffff'); return P.finish({ out: '#081830' }); }); g.drawImage(p, 0, 0); } },
  stal: { solid: true, draw(g, X, Y) { TILES.cfloor.draw(g, X, Y); const p = prop('stal', () => { const P = new Painter(16, 16); const R = PAL.cave; P.poly([[8, 1], [13, 15], [3, 15]], R, { z: 2, lum: 0.65, grad: 0.5 }); P.ball(8, 14, 5, 2, R, { z: 0 }); return P.finish({ out: '#100804' }); }); g.drawImage(p, 0, 0); } },
  // tower
  tfloor: { draw(g, X, Y) { const P = PAL.tfloor; rect(g, 0, 0, 16, 16, P[2]); rect(g, 0, 0, 16, 1, P[3]); rect(g, 0, 0, 1, 16, P[3]); rect(g, 15, 0, 1, 16, P[1]); rect(g, 0, 15, 16, 1, P[1]); for (let y = 1; y < 15; y++) for (let x = 1; x < 15; x++) if (hash(X * 16 + x, Y * 16 + y, 41) > 0.95) px(g, x, y, P[1]); if ((X + Y) % 2 === 0) { px(g, 7, 7, P[3]); px(g, 8, 8, P[1]); } } },
  tcarpet: { draw(g, X, Y, n) { rect(g, 0, 0, 16, 16, '#283c78'); for (let y = 0; y < 16; y += 2) for (let x = (y / 2) % 2; x < 16; x += 4) px(g, x, y, '#3850a0'); const e = (k) => k !== 'tcarpet'; if (e(n(-1, 0))) { rect(g, 0, 0, 2, 16, '#40d0c0'); } if (e(n(1, 0))) { rect(g, 14, 0, 2, 16, '#40d0c0'); } if (e(n(0, -1))) rect(g, 0, 0, 16, 2, '#40d0c0'); if (e(n(0, 1))) rect(g, 0, 14, 16, 2, '#40d0c0'); } },
  twall: wallTile(PAL.tower, '#080c1c', (g, X, Y, n, P) => { bricks(g, P, 16, 8, 8, X, Y); rect(g, 0, 0, 16, 1, P[1]); rect(g, 0, 14, 16, 2, P[0]); if ((X % 3) === 1) { rect(g, 6, 3, 4, 7, '#081020'); rect(g, 7, 4, 2, 5, '#3cc8c0'); px(g, 7, 4, '#c0fff8'); } }),
  tpillar: { solid: true, draw(g, X, Y) { TILES.tfloor.draw(g, X, Y); const p = prop('tpil', () => { const P = new Painter(16, 16); const R = PAL.tower; P.tube([[8, 2, 5, 0], [8, 14, 5, 0]], R); P.ball(8, 14, 6.5, 2.5, R, { z: 2, flat: 0.3 }); return P.finish({ out: '#060818' }); }); g.drawImage(p, 0, 0); }, up(g) { const P = PAL.tower; rect(g, 3, 6, 10, 10, P[2]); rect(g, 3, 6, 3, 10, P[3]); rect(g, 11, 6, 2, 10, P[1]); rect(g, 2, 4, 12, 3, P[3]); rect(g, 2, 4, 12, 1, P[4]); rect(g, 1, 4, 1, 12, '#060818'); rect(g, 14, 4, 1, 12, '#060818'); } },
  twater: { solid: true, anim: true, draw(g, X, Y, n, f) { waterTex(g, X, Y, f, ramp('#2060a8', 5)); shoreFoam(g, X, Y, n, f, ramp('#2060a8', 5)); } },
  void: { solid: true, draw(g, X, Y) { rect(g, 0, 0, 16, 16, '#040410'); if (hash(X, Y, 3) > 0.9) px(g, Math.floor(hash(X, Y, 4) * 16), Math.floor(hash(X, Y, 5) * 16), '#8090c0'); } },
  ice: { draw(g, X, Y) { const P = PAL.ice; rect(g, 0, 0, 16, 16, P[2]); for (let i = 0; i < 16; i++) { px(g, (i + X * 3) % 16, (i * 2 + Y * 5) % 16, P[3]); } rect(g, 0, 0, 16, 1, P[3]); rect(g, 0, 15, 16, 1, P[1]); if ((X + Y) % 3 === 0) { px(g, 4, 4, P[4]); px(g, 5, 5, P[4]); } } },
  // overworld (each tile is a small patch of the land seen from high above)
  ograss: { draw(g, X, Y) { grassTex(g, X, Y, PAL.grass, 0.6); } },
  oforest: {
    solid: false,
    draw(g, X, Y) {
      grassTex(g, X, Y, PAL.grass, 0.5);
      const t = prop('otree', () => { const P = new Painter(10, 11); const R = ramp('#2f8838', 5); P.ball(5, 5, 4.2, 4, R, { z: 2 }); P.ball(3.5, 3.5, 1.8, 1.6, R, { z: 5, amb: 0.4 }); P.tube([[5, 8, 1, 0], [5, 10, 1, 0]], PAL.wood); return P.finish({ out: '#0c1c08' }); });
      const pts = [[0, -2], [7, -1], [3, 5], [9, 6], [-2, 7]];
      for (const [x, y] of pts) g.drawImage(t, x + Math.floor(hash(X, Y, x) * 2), y);
    },
  },
  ohill: { draw(g, X, Y) { grassTex(g, X, Y, PAL.grass, 0.5); const G = PAL.grass; rect(g, 3, 6, 10, 6, G[3]); rect(g, 2, 8, 12, 4, G[3]); rect(g, 5, 5, 6, 1, G[4]); rect(g, 2, 12, 12, 1, G[1]); rect(g, 13, 8, 1, 4, G[1]); } },
  omount: {
    solid: true,
    draw(g, X, Y) {
      grassTex(g, X, Y, PAL.grass, 0.5);
      const m = prop('omount' + ((X + Y) % 2), () => { const P = new Painter(16, 18, { dither: 0.7 }); const R = ['#3a2c20', '#5c4430', '#7c6048', '#a08468', '#e8e0d8']; const s = (X + Y) % 2; P.poly([[8 - s, 1], [16, 17], [0, 17]], R, { z: 2, lum: 0.55, grad: 0.1 }); P.poly([[8 - s, 1], [16, 17], [8 - s, 17]], R, { z: 3, lum: 0.3, grad: 0.1 }); P.poly([[8 - s, 1], [11 - s, 6], [8 - s, 7], [5 - s, 6]], ['#c0c8d8', '#f0f4ff'], { z: 4, lum: 0.7 }); return P.finish({ out: '#1c1410', inner: 0 }); });
      g.drawImage(m, 0, -2);
    },
  },
  osea: { solid: true, anim: true, draw(g, X, Y, n, f) { waterTex(g, X, Y, f, ramp('#2058c8', 5)); shoreFoam(g, X, Y, n, f, ramp('#2058c8', 5)); } },
  osand: { draw(g, X, Y, n) { speckle(g, X, Y, PAL.sand, 5, 0.05); fringe(g, X, Y, n); } },
  oroad: { draw(g, X, Y, n) { speckle(g, X, Y, PAL.dirt, 3, 0.05); fringe(g, X, Y, n); } },
  oswamp: { draw(g, X, Y) { rect(g, 0, 0, 16, 16, '#486848'); for (let k = 0; k < 6; k++) px(g, Math.floor(hash(X, Y, k) * 16), Math.floor(hash(X, Y, k + 9) * 16), '#304830'); } },
};

// tiles that need a colour from the legend
for (const [k, R] of Object.entries(ROOF)) {
  TILES['roof_' + k] = {
    solid: true,
    draw(g, X, Y, n) {
      const me = n(0, 0), roof = (dx, dy) => n(dx, dy) === me;
      rect(g, 0, 0, 16, 16, R[2]);
      for (let y = 0; y < 16; y += 4) {
        const o = ((Y * 4 + y / 4) % 2) * 3;
        rect(g, 0, y + 3, 16, 1, R[0]);
        rect(g, 0, y, 16, 1, R[3]);
        for (let x = o; x < 16; x += 6) rect(g, x, y, 1, 3, R[1]);
      }
      if (!roof(0, -1)) { rect(g, 0, 0, 16, 2, R[4]); rect(g, 0, 2, 16, 1, R[3]); }
      if (!roof(0, 1)) { rect(g, 0, 12, 16, 4, R[0]); rect(g, 0, 12, 16, 1, R[1]); }
      if (!roof(-1, 0)) { rect(g, 0, 0, 2, 16, R[4]); px(g, 2, 0, R[3]); }
      if (!roof(1, 0)) { rect(g, 14, 0, 2, 16, R[1]); rect(g, 15, 0, 1, 16, R[0]); }
      // a chimney now and then
      if (hash(X, Y, 71) > 0.9 && roof(0, 1) && !roof(0, -1)) { rect(g, 10, 0, 4, 7, '#383040'); rect(g, 10, 0, 4, 2, '#686078'); }
    },
  };
}

// ---------- map pre-rendering ----------
// returns { frames: [canvas...], upper: canvas }
export function renderMap(map) {
  const { w, h } = map, frames = [], anim = map.kinds.some((k) => TILES[k] && TILES[k].anim);
  const nf = anim ? 3 : 1;
  const kindAt = (x, y) => map.kinds[map.tile(Math.max(0, Math.min(w - 1, x)), Math.max(0, Math.min(h - 1, y)))];
  const upper = canvas(w * 16, h * 16);
  const t = canvas(16, 16);
  for (let f = 0; f < nf; f++) {
    const c = canvas(w * 16, h * 16);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const k = kindAt(x, y), def = TILES[k];
      if (!def) throw new Error('tile ' + k);
      if (f > 0 && !def.anim) { c.x.drawImage(frames[0], x * 16, y * 16, 16, 16, x * 16, y * 16, 16, 16); continue; }
      t.x.clearRect(0, 0, 16, 16);
      t.x.save();
      def.draw(t.x, x, y, (dx, dy) => kindAt(x + dx, y + dy), f);
      t.x.restore();
      c.x.drawImage(t, x * 16, y * 16);
      if (f === 0 && def.up && y > 0) {
        t.x.clearRect(0, 0, 16, 16);
        def.up(t.x, x, y);
        upper.x.drawImage(t, x * 16, (y - 1) * 16);
      }
    }
    frames.push(c);
  }
  return { frames, upper };
}

// ---------- Earthfall: the orbital station, the ruins of the old world, the rails and the glass desert ----------
const MET = ['#1c2230', '#2c3446', '#424c62', '#5c6880', '#8a96b0'];
const CON = ['#3a3c40', '#55585c', '#6e7276', '#8a8e92', '#aeb2b6'];
const RUST = ['#3a1c10', '#6a3418', '#94502a', '#b87444', '#d8a070'];
const TEAL = ['#0e2a2a', '#18443e', '#256058', '#3a8070', '#68b8a0'];
Object.assign(TILES, {
  // the orbital station Cradle
  metal: { draw(g, X, Y) { rect(g, 0, 0, 16, 16, MET[2]); rect(g, 0, 0, 16, 1, MET[3]); rect(g, 0, 0, 1, 16, MET[3]); rect(g, 15, 0, 1, 16, MET[1]); rect(g, 0, 15, 16, 1, MET[1]); for (const [x, y] of [[2, 2], [13, 2], [2, 13], [13, 13]]) px(g, x, y, MET[4]); if ((X + Y) % 4 === 0) { rect(g, 5, 7, 6, 2, MET[1]); rect(g, 5, 7, 6, 1, MET[0]); } } },
  mwall: wallTile(MET, '#0c1018', (g, X, Y) => { rect(g, 0, 0, 16, 16, MET[2]); rect(g, 0, 0, 16, 2, MET[4]); rect(g, 0, 13, 16, 3, MET[0]); rect(g, 0, 12, 16, 1, MET[1]); rect(g, 7, 2, 2, 10, MET[1]); if (X % 2) { rect(g, 3, 5, 3, 2, (X + Y) % 3 ? '#40f0c0' : '#f0b040'); px(g, 3, 5, '#ffffff'); } }),
  spacewin: { solid: true, draw(g, X, Y) {
    rect(g, 0, 0, 16, 16, '#02040c');
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const gx = X * 16 + x, gy = Y * 16 + y, d = Math.hypot(gx - 160, (gy - 360) * 1.0);
      if (d < 330) { const k = hash(gx >> 2, gy >> 2, 5), sea = Math.sin(gx * 0.05) + Math.cos(gy * 0.09 + gx * 0.02) > 0.6; let c = sea ? '#2a7a3a' : '#1c48a0'; if (k > 0.86) c = '#e8f0f8'; if (d > 322) c = '#7ab8f8'; px(g, x, y, c); }
      else if (hash(gx, gy, 9) > 0.985) px(g, x, y, hash(gx, gy, 3) > 0.5 ? '#ffffff' : '#8890c0');
    }
    rect(g, 0, 0, 16, 2, MET[1]); rect(g, 0, 14, 16, 2, MET[1]); rect(g, 0, 0, 1, 16, MET[3]);
  } },
  console: { solid: true, draw(g, X, Y) { TILES.metal.draw(g, X, Y); rect(g, 1, 3, 14, 11, '#12161e'); rect(g, 2, 4, 12, 7, '#062a24'); for (let k = 0; k < 4; k++) rect(g, 3, 5 + k * 2, 3 + Math.floor(hash(X, Y, k) * 8), 1, k % 2 ? '#40f0c0' : '#20a080'); rect(g, 3, 12, 2, 1, '#f04040'); rect(g, 7, 12, 2, 1, '#40f040'); rect(g, 11, 12, 2, 1, '#f0b040'); } },
  pod: { solid: true, draw(g, X, Y) { TILES.metal.draw(g, X, Y); const p = prop('pod', () => { const P = new Painter(16, 16); P.ball(8, 9, 7, 6.5, ramp('#d8e0f0', 5), { spec: 0.6 }); P.ball(8, 7, 4, 3, ramp('#40c8f0', 5), { z: 6, spec: 0.8 }); return P.finish({ out: '#101828' }); }); g.drawImage(p, 0, 0); } },
  hatch: { draw(g, X, Y) { rect(g, 0, 0, 16, 16, MET[1]); rect(g, 1, 0, 14, 16, MET[3]); rect(g, 7, 0, 2, 16, MET[0]); for (let y = 1; y < 16; y += 4) { rect(g, 1, y, 3, 2, '#f0c040'); rect(g, 12, y, 3, 2, '#f0c040'); } } },
  // the ruins of the old world
  asphalt: { draw(g, X, Y) { speckle(g, X, Y, ['#26282c', '#303236', '#3a3c40', '#46484c', '#585a5e'], 2, 0.08); if (hash(X, Y, 41) > 0.7) { let x = Math.floor(hash(X, Y, 42) * 12) + 2; for (let y = 0; y < 16; y++) { px(g, x, y, '#16181a'); if (hash(X * 16 + y, Y, 43) > 0.6) x += hash(X, y, 44) > 0.5 ? 1 : -1; x = Math.max(0, Math.min(15, x)); } } if (Y % 4 === 0 && X % 2 === 0) rect(g, 3, 7, 10, 2, '#a89040'); } },
  concrete: { draw(g, X, Y) { speckle(g, X, Y, CON, 2, 0.06); rect(g, 0, 0, 16, 1, CON[1]); rect(g, 0, 0, 1, 16, CON[1]); if (hash(X, Y, 51) > 0.75) { const x = 3 + Math.floor(hash(X, Y, 52) * 10); for (let y = 2; y < 14; y++) px(g, x + (y % 3 === 0 ? 1 : 0), y, CON[0]); } } },
  weeds: { draw(g, X, Y) { TILES.concrete.draw(g, X, Y); const G = PAL.grass; for (let k = 0; k < 9; k++) { const x = Math.floor(hash(X, Y, k + 60) * 15), y = 3 + Math.floor(hash(X, Y, k + 70) * 12); px(g, x, y, G[3]); px(g, x, y - 1, G[4]); px(g, x + 1, y, G[2]); } } },
  rail: { draw(g, X, Y) { speckle(g, X, Y, ['#4a4038', '#5a5048', '#6a6058', '#7a7068', '#8a8078'], 3, 0.05); for (let x = 1; x < 16; x += 4) rect(g, x, 2, 2, 12, '#5a3a20'); rect(g, 0, 4, 16, 2, '#8a8e98'); rect(g, 0, 4, 16, 1, '#c0c4cc'); rect(g, 0, 10, 16, 2, '#8a8e98'); rect(g, 0, 10, 16, 1, '#c0c4cc'); } },
  rwall: wallTile(CON, '#202224', (g, X, Y, n, P) => { rect(g, 0, 0, 16, 16, P[2]); for (let y = 2; y < 14; y += 5) rect(g, 0, y, 16, 1, P[1]); rect(g, 0, 13, 16, 3, P[0]); rect(g, 0, 12, 16, 1, P[1]); if (hash(X, Y, 81) > 0.6) { rect(g, 4, 4, 5, 5, P[0]); px(g, 6, 3, RUST[2]); px(g, 6, 2, RUST[3]); } if (hash(X, Y, 82) > 0.7) for (let k = 0; k < 5; k++) px(g, 10 + k % 3, 5 + k, PAL.grass[2]); }),
  car: { solid: true, draw(g, X, Y, n) { (n && ['concrete', 'weeds'].includes(n(0, 1)) ? TILES.concrete : TILES.asphalt).draw(g, X, Y); const p = prop('car' + (X % 2), () => { const P = new Painter(16, 16), R = ramp(X % 2 ? '#a04a28' : '#4a6a88', 5); P.ball(8, 9, 7.5, 5.5, R, { spec: 0.3 }); P.ball(8, 7, 4.5, 3, ramp('#28303a', 4), { z: 5 }); P.ball(3, 13, 1.6, 1.6, ['#101010', '#202020', '#303030', '#404040'], { z: 1 }); P.ball(13, 13, 1.6, 1.6, ['#101010', '#202020', '#303030', '#404040'], { z: 1 }); return P.finish(); }); g.drawImage(p, 0, 0); for (let k = 0; k < 6; k++) px(g, 2 + Math.floor(hash(X, k, 3) * 12), 4 + Math.floor(hash(Y, k, 4) * 8), RUST[2]); } },
  pole: { solid: true, draw(g, X, Y) { TILES.asphalt.draw(g, X, Y); rect(g, 7, 2, 2, 13, '#3a3e44'); rect(g, 7, 2, 1, 13, '#5a5e66'); rect(g, 7, 2, 7, 2, '#3a3e44'); rect(g, 12, 4, 2, 2, '#a0a070'); rect(g, 5, 14, 6, 2, '#2a2e34'); } },
  rubble: { solid: true, draw(g, X, Y) { TILES.concrete.draw(g, X, Y); const p = prop('rub', () => { const P = new Painter(16, 16), R = ramp('#8a8e92', 5); P.ball(6, 10, 5, 4, R, { z: 0 }); P.ball(11, 11, 4, 3, R, { z: 2 }); P.ball(8, 6, 3.5, 3, R, { z: 4 }); return P.finish({ out: '#202224' }); }); g.drawImage(p, 0, 0); px(g, 12, 5, RUST[3]); px(g, 12, 4, RUST[3]); } },
  // the train carriages people live in
  troof: { solid: true, draw(g, X, Y, n) { const top = n(0, -1) !== 'troof'; rect(g, 0, 0, 16, 16, TEAL[2]); for (let x = 0; x < 16; x += 4) rect(g, x, 0, 1, 16, TEAL[1]); if (top) { rect(g, 0, 0, 16, 3, TEAL[4]); rect(g, 0, 3, 16, 1, TEAL[3]); } else { rect(g, 0, 13, 16, 3, TEAL[1]); rect(g, 0, 12, 16, 1, TEAL[3]); } if (hash(X, Y, 91) > 0.75) { rect(g, 6, 6, 4, 3, RUST[1]); px(g, 7, 7, RUST[3]); } } },
  tside: { solid: true, draw(g, X, Y) { rect(g, 0, 0, 16, 16, '#d8ccb0'); rect(g, 0, 0, 16, 2, '#a89c80'); rect(g, 0, 11, 16, 2, '#b84030'); rect(g, 0, 13, 16, 3, '#3a3e44'); rect(g, 3, 3, 10, 6, '#1a2a3a'); rect(g, 3, 3, 10, 1, '#0a141e'); rect(g, 4, 4, 3, 2, '#6a9ac0'); if (hash(X, Y, 93) > 0.6) rect(g, 9, 5, 3, 3, '#f0d070'); } },
  tdoor: { draw(g, X, Y) { rect(g, 0, 0, 16, 16, '#d8ccb0'); rect(g, 0, 11, 16, 2, '#b84030'); rect(g, 4, 1, 8, 15, '#5a5e66'); rect(g, 5, 2, 6, 14, '#3a3e44'); rect(g, 7, 2, 1, 14, '#202226'); rect(g, 5, 4, 6, 3, '#6a9ac0'); } },
  // the city of lights that went out
  neon: wallTile(['#140c1c', '#22142e', '#30203e', '#40305a', '#5a4a7a'], '#0a0612', (g, X, Y) => { rect(g, 0, 0, 16, 16, '#22142e'); rect(g, 0, 13, 16, 3, '#0a0612'); const on = hash(X, Y, 95) > 0.35, c = ['#f048a8', '#48e8f8', '#f8d048'][(X + Y) % 3]; rect(g, 2, 3, 12, 8, '#140a1c'); if (on) { for (let k = 0; k < 3; k++) rect(g, 3 + k * 4, 5, 2, 4, c); rect(g, 3, 4, 10, 1, c); } else { for (let k = 0; k < 3; k++) rect(g, 3 + k * 4, 5, 2, 4, '#3a2a4a'); } }),
  // the glass desert the falling star left behind
  glass: { draw(g, X, Y) { speckle(g, X, Y, ['#0c2a30', '#123a40', '#1a4c52', '#286a6a', '#58a8a0'], 3, 0.05); if (hash(X, Y, 97) > 0.6) { const x = Math.floor(hash(X, Y, 98) * 10) + 3; rect(g, x, 3, 1, 4, '#a8f0e0'); rect(g, x + 1, 4, 1, 2, '#58c8b8'); } } },
  scrystal: { solid: true, draw(g, X, Y) { TILES.glass.draw(g, X, Y); const p = prop('scr' + (X % 2), () => { const P = new Painter(16, 18, { dither: 0.3 }), R = ramp(X % 2 ? '#a060f0' : '#48e8d8', 5); P.poly([[5, 17], [3, 6], [7, 1], [9, 17]], R, { z: 2, lum: 0.7, grad: 0.4 }); P.poly([[8, 17], [11, 5], [14, 9], [13, 17]], R, { z: 1, lum: 0.5, grad: 0.4 }); return P.finish({ out: '#081820' }); }); g.drawImage(p, 0, -2); } },
  // the world map of a broken Earth
  osnow: { draw(g, X, Y) { speckle(g, X, Y, ['#98a8c8', '#c0cce0', '#dce4f0', '#eef2fa', '#ffffff'], 3, 0.06); } },
  oruins: { draw(g, X, Y) { speckle(g, X, Y, CON, 2, 0.05); for (const [x, y, w, h] of [[2, 2, 5, 5], [9, 3, 5, 4], [3, 9, 4, 5], [9, 9, 5, 5]]) { if (hash(X, Y, x + y) > 0.3) { rect(g, x, y, w, h, CON[1]); rect(g, x, y, w, 1, CON[3]); rect(g, x + 1, y + 1, 1, 1, '#f0d070'); } } } },
  oglass: { draw(g, X, Y) { TILES.glass.draw(g, X, Y); } },
  ohwy: { draw(g, X, Y) { speckle(g, X, Y, ['#2a2c30', '#34363a', '#3e4044', '#4a4c50', '#5a5c60'], 2, 0.05); rect(g, 7, 0, 2, 16, '#8a8040'); } },
  ocrater: { solid: true, draw(g, X, Y) { speckle(g, X, Y, ['#1a0c20', '#2a1430', '#3a2040', '#583060', '#8858a0'], 3, 0.08); if (hash(X, Y, 99) > 0.7) { rect(g, 6, 5, 3, 6, '#c088f8'); px(g, 7, 5, '#ffffff'); } } },
});
for (const k of ['oruins', 'oglass', 'ohwy']) TILES[k].world = true;

export const solidKind = (k) => !!(TILES[k] && TILES[k].solid);
