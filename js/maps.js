// Every place in 星墜地球記: the orbital station Cradle, Railtown built from train carriages, the broken
// Earth outside, the Windfarm, and the ruins where conduits have to be turned to bring the power back.
import { hash } from './gfx.js';
import { localize } from './i18n.js';

// characters shared by all maps
const BASE = {
  '.': 'grass', ',': 'flower', ';': 'tall', '=': 'dirt', ':': 'sand', 'T': 'tree', 'P': 'pine', 'n': 'bush', 'o': 'rock',
  'w': 'water', 'W': 'deep', 'F': 'fence', 'O': 'well', 'L': 'lamp', 'C': 'cliff',
  'R': 'roof_r', 'B': 'roof_b', 'G': 'roof_g', 'H': 'hwall', 'N': 'window', 'D': 'door', 'h': 'shop',
  '_': 'floor', 'I': 'iwall', 'r': 'carpet', 'c': 'counter', 't': 'table', 'd': 'bed', 'l': 'shelf', 'p': 'pot', 'y': 'barrel', 'x': 'crate', 'e': 'pew',
  '^': 'stairs', 'v': 'down',
  // Earthfall
  'm': 'metal', 'M': 'mwall', 'Z': 'spacewin', 'k': 'console', 'Q': 'pod', 'j': 'hatch',
  'a': 'asphalt', 'q': 'concrete', 'z': 'weeds', '#': 'rail', 'K': 'rwall', 'V': 'car', '|': 'pole', '%': 'rubble',
  'U': 'troof', 'Y': 'tside', 'J': 'tdoor', 'E': 'neon', 'g': 'glass', '*': 'scrystal',
  '+': 'tfloor', '-': 'tcarpet', 'X': 'twall', '!': 'tpillar', 'i': 'ice',
};
// rows + legend -> a map; legend values are a tile kind or { k: kind, e: entity | (x, y, n) => entity }
function grid(rows, legend = {}, meta = {}) {
  const Lg = { ...BASE, ...legend }, h = rows.length, w = rows[0].length;
  rows.forEach((r, i) => { if (r.length !== w) throw new Error(`${meta.id} row ${i} is ${r.length} wide, not ${w}`); });
  const ents = [], kinds = [], count = {};
  for (let y = 0; y < h; y++) {
    kinds.push([]);
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x], v = Lg[ch];
      if (v === undefined) throw new Error(`${meta.id}: no legend for '${ch}'`);
      if (typeof v === 'string') { kinds[y].push(v); continue; }
      kinds[y].push(v.k);
      const n = (count[ch] = (count[ch] || 0) + 1) - 1;
      const e = typeof v.e === 'function' ? v.e(x, y, n) : v.e;
      if (e) for (const one of [].concat(e)) ents.push({ x, y, ...one });
    }
  }
  return { w, h, kindAt: (x, y) => kinds[y][x], ents, ...meta };
}
function canvasMap(w, h, fill) {
  const g = Array.from({ length: h }, () => Array(w).fill(fill));
  const b = {
    g, w, h,
    set(x, y, c) { if (x >= 0 && y >= 0 && x < w && y < h) g[y][x] = c; },
    get(x, y) { return x >= 0 && y >= 0 && x < w && y < h ? g[y][x] : null; },
    rect(x, y, rw, rh, c) { for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) b.set(x + i, y + j, c); },
    rows() { return g.map((r) => r.join('')); },
  };
  return b;
}
const warp = (to, tx, ty, dir = 'd', extra = {}) => ({ type: 'warp', to, tx, ty, dir, ...extra });
const npc = (id, spriteName, talk, extra = {}) => ({ type: 'npc', id, sprite: spriteName, talk, ...extra });
// a conduit puzzle: pieces start turned away from their solution
function conduits(m, group, src, sink, pieces) {
  m.ents.push({ type: 'source', group, x: src[0], y: src[1] }, { type: 'sink', group, x: sink[0], y: sink[1] });
  for (const [x, y, shape, sol, off] of pieces) m.ents.push({ type: 'pipe', group, x, y, shape, sol, rot: (sol + (off || 0)) % 4, fixed: !off });
}
// a wind turbine that stands still until life comes back to the fields
const turbine = (x, y) => ({ type: 'sprite', x, y, solid: true, draw(g, X, Y, f) {
  g.fillStyle = '#c8ccd4'; g.fillRect(X + 6, Y - 34, 4, 48); g.fillStyle = '#8a8e98'; g.fillRect(X + 9, Y - 34, 1, 48);
  const turn = window.G && window.G.S.flags.sprout ? f / 14 + x : 0.4 + x * 0.7;
  g.save(); g.translate(X + 8, Y - 36); g.rotate(turn);
  for (let k = 0; k < 3; k++) { g.rotate((Math.PI * 2) / 3); g.fillStyle = '#f0f2f6'; g.fillRect(-1, 0, 3, 20); g.fillStyle = '#a8acb4'; g.fillRect(1, 2, 1, 17); }
  g.restore();
  g.fillStyle = '#606470'; g.fillRect(X + 5, Y - 39, 6, 6); g.fillStyle = '#9098a8'; g.fillRect(X + 6, Y - 38, 2, 2);
} });

export const MAPS = {};

// ---------- the orbital station Cradle, AD 2091 ----------
MAPS.cradle = {
  name: '軌道站「搖籃號」', music: 'tower', safe: true,
  build() {
    const b = canvasMap(30, 13, 'M');
    // windows run along the whole upper hull
    for (let x = 1; x < 29; x++) b.set(x, 1, x % 6 === 0 ? 'M' : 'Z');
    b.rect(2, 3, 8, 7, 'm'); b.rect(11, 5, 9, 3, 'm'); b.rect(21, 3, 7, 7, 'm');
    for (let x = 3; x <= 8; x++) b.set(x, 3, 'k');
    for (let x = 12; x <= 18; x++) b.set(x, 4, 'Z');
    b.set(10, 6, 'j'); b.set(20, 6, 'j');
    for (const [x, y] of [[22, 4], [26, 4], [22, 8], [26, 8], [24, 3]]) b.set(x, y, 'Q');
    b.set(14, 7, 'k'); b.set(17, 7, 'k');
    const m = grid(b.rows(), {}, { id: 'cradle' });
    m.ents.push(
      npc('hale', 'hale', 'cr_hale', { x: 5, y: 5, dir: 'd' }),
      npc('ono', 'ono', 'cr_ono', { x: 15, y: 6, dir: 'l' }),
      npc('lumi', 'lumi', 'cr_lumi', { x: 24, y: 5, dir: 'd' }),
      { type: 'solid', talk: 'cr_console', x: 4, y: 3 }, { type: 'solid', talk: 'cr_console', x: 7, y: 3 },
      { type: 'solid', talk: 'cr_window', x: 15, y: 4 },
      { type: 'solid', talk: 'cr_pod', x: 22, y: 4 }, { type: 'solid', talk: 'cr_pod', x: 26, y: 8 },
    );
    m.tint = 'rgba(140,0,0,0.12)';
    m.entry = [5, 7, 'u'];
    return m;
  },
};

// ---------- Railtown: a town living in an old train yard ----------
MAPS.railtown = {
  name: '鐵軌鎮', music: 'town', safe: true,
  build() {
    const b = canvasMap(40, 28, 'q');
    for (let y = 0; y < 28; y++) for (let x = 0; x < 40; x++) { const r = hash(x, y, 3); if (r > 0.82) b.set(x, y, 'z'); else if (r < 0.08) b.set(x, y, 'a'); }
    // a broken wall around the yard, overgrown in places
    b.rect(0, 0, 40, 1, 'K'); b.rect(0, 27, 40, 1, 'K'); b.rect(0, 0, 1, 28, 'K'); b.rect(39, 0, 1, 28, 'K');
    for (let x = 1; x < 39; x++) if (hash(x, 0, 5) > 0.55) b.set(x, 1, 'T');
    for (let y = 2; y < 26; y++) if (hash(0, y, 7) > 0.6) b.set(1, y, 'T');
    // three tracks, and the carriages that people turned into homes sit on them
    for (const y of [7, 14, 21]) b.rect(1, y, 38, 1, '#');
    const D = {};
    const car = (key, x, y, w, door) => { b.rect(x, y - 2, w, 2, 'U'); b.rect(x, y, w, 1, 'Y'); b.set(x + door, y, 'J'); D[key] = [x + door, y]; };
    car('home', 4, 7, 6, 2); car('workshop', 24, 7, 7, 3); car('market', 4, 14, 7, 3); car('inn', 27, 14, 8, 3); car('council', 14, 21, 8, 4); car('tithe', 30, 21, 6, 2);
    // the old engine, rusting at the end of the line
    b.rect(13, 5, 6, 2, 'U'); b.rect(13, 7, 6, 1, 'Y');
    // the exit: a gap in the east wall onto the highway
    b.rect(39, 13, 1, 3, 'a'); b.rect(36, 13, 3, 3, 'a');
    // junk and life between the tracks
    for (const [x, y] of [[11, 10], [19, 17], [33, 10], [8, 24], [25, 24], [36, 18]]) b.set(x, y, 'V');
    for (const [x, y] of [[16, 10], [22, 18], [3, 18], [34, 24], [20, 3]]) b.set(x, y, '%');
    for (const [x, y] of [[10, 4], [30, 4], [12, 17], [30, 11], [6, 25]]) b.set(x, y, '|');
    b.set(22, 11, 'O');
    for (const [x, y] of [[2, 10], [3, 10], [2, 11], [37, 3], [36, 4], [20, 25], [21, 25]]) b.set(x, y, ',');
    const m = grid(b.rows(), {}, { id: 'railtown' });
    const door = (key, to) => m.ents.push({ ...warp(to, 6, 3, 'u'), x: D[key][0], y: D[key][1] });
    door('home', 'saku_home'); door('workshop', 'ran_workshop'); door('market', 'rt_market'); door('inn', 'rt_inn'); door('council', 'rt_council');
    m.ents.push({ type: 'solid', talk: 'rt_tithe', x: D.tithe[0], y: D.tithe[1] });
    for (const y of [13, 14, 15]) m.ents.push({ ...warp('world', 9, 22, 'r', { exit: true }), x: 39, y });
    m.ents.push(
      npc('tess', 'elder', 'rt_tess', { x: 18, y: 23, dir: 'd' }),
      npc('kid1', 'boy', 'rt_kid', { x: 9, y: 10, wander: true }),
      npc('kid2', 'girl', 'rt_kid2', { x: 26, y: 18, wander: true }),
      npc('digger', 'sailor', 'rt_digger', { x: 33, y: 17, dir: 'l' }),
      npc('cook', 'mom', 'rt_cook', { x: 7, y: 17, dir: 'd' }),
      npc('watch', 'guard', 'rt_watch', { x: 36, y: 12, dir: 'd' }),
      npc('gears', 'gears', 'rt_gears', { x: 8, y: 9, dir: 'l', cond: (f) => !f.gears }),
    );
    m.entry = [37, 14, 'l'];
    return m;
  },
};
// carriage interiors: long and narrow, with windows along both sides
function carriage(id, name, kind, back, people) {
  MAPS[id] = { name, music: 'town', safe: true, build() {
    const rows = kind === 'inn' ? ['IIIIIIIIIIIIII', 'Id_d_d__d_d_dI', 'I____________I', 'Ic_c__________I'.slice(0, 13) + 'I', 'IIIIII_IIIIIII']
      : kind === 'shop' ? ['IIIIIIIIIIIIII', 'Ill__lll__lllI', 'I____________I', 'Icccc___ccccI'.padEnd(13, '_') + 'I', 'IIIIII_IIIIIII']
        : kind === 'work' ? ['IIIIIIIIIIIIII', 'Ixxy__ll__yxxI', 'I____________I', 'I_tt______ttxI', 'IIIIII_IIIIIII']
          : kind === 'home' ? ['IIIIIIIIIIIIII', 'Id_l____l__d_I', 'I____________I', 'I__tt____ee__I', 'IIIIII_IIIIIII']
            : ['IIIIIIIIIIIIII', 'Il_e_e__e_e_lI', 'I____________I', 'I_e_e____e_e_I', 'IIIIII_IIIIIII'];
    const m = grid(rows, {}, { id });
    m.ents.push({ ...warp('railtown', back[0], back[1] + 1, 'd'), x: 6, y: 4 }, ...people.map((p) => ({ ...p })));
    m.entry = [6, 3, 'u'];
    return m;
  } };
}
carriage('saku_home', '朔的車廂', 'home', [6, 7], [{ type: 'solid', talk: 'home_bed', x: 1, y: 1 }]);
carriage('ran_workshop', '蘭的工作車廂', 'work', [27, 7], [npc('ranwork', 'ran', 'rt_ranwork', { x: 8, y: 2, dir: 'd', cond: (f) => f.ran && !f.metroDone })]);
carriage('rt_market', '市集車廂', 'shop', [7, 14], [npc('trader', 'merchant', 'rt_shop', { x: 6, y: 2, dir: 'd' })]);
carriage('rt_inn', '臥鋪車廂', 'inn', [30, 14], [npc('innkeep', 'fisher', 'rt_inn', { x: 6, y: 2, dir: 'd' })]);
carriage('rt_council', '議事車廂', 'council', [18, 21], [npc('elder2', 'nun', 'rt_councilor', { x: 6, y: 1, dir: 'd' })]);

// ---------- the broken Earth ----------
MAPS.world = {
  name: '', music: 'field', world: true, safe: true,
  build(flags = {}) {
    const W = 48, H = 36, b = canvasMap(W, H, '.');
    const vn = (x, y, s, k) => { const X = Math.floor(x / s), Y = Math.floor(y / s), fx = x / s - X, fy = y / s - Y, l = (a, c, t) => a + (c - a) * t * t * (3 - 2 * t); return l(l(hash(X, Y, k), hash(X + 1, Y, k), fx), l(hash(X, Y + 1, k), hash(X + 1, Y + 1, k), fx), fy); };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const n = vn(x, y, 5, 1);
      let t = n > 0.6 ? 'f' : n < 0.2 ? 'h' : '.';
      if (x > 43 + Math.round(Math.sin(y * 0.4) * 1.5)) t = '~';
      if (y < 7) t = n > 0.55 ? 'M' : 's';
      if (y >= 7 && y <= 8 && x < 40 && n > 0.35) t = 'M';
      if (x >= 18 && x <= 29 && y >= 13 && y <= 21) t = n > 0.5 ? 'u' : '.';
      if (x >= 26 && x <= 42 && y >= 24) t = 'g';
      if (Math.hypot(x - 34, y - 30) < 3.2 && Math.hypot(x - 34, y - 30) > 1.8) t = 'c';
      b.set(x, y, t);
    }
    const road = (pts) => { for (let i = 0; i + 1 < pts.length; i++) { let [x, y] = pts[i]; const [tx, ty] = pts[i + 1]; for (;;) { if (b.get(x, y) !== '~') b.set(x, y, '='); if (x === tx && y === ty) break; if (x !== tx) x += Math.sign(tx - x); else y += Math.sign(ty - y); } } };
    road([[9, 22], [24, 22], [24, 17]]); road([[16, 22], [16, 11]]); road([[24, 22], [24, 27], [31, 27]]); road([[24, 17], [41, 17]]); road([[12, 22], [12, 26]]);
    // the pass to the north stays shut until the church falls
    road([[30, 17], [30, 9]]); if (flags.cathedralDone) road([[30, 9], [30, 4]]);
    else { b.set(30, 8, 'M'); b.set(30, 7, 'M'); }
    if (flags.cathedralDone) for (let y = 4; y <= 8; y++) b.set(30, y, '=');
    for (const [x, y] of [[9, 22], [12, 26], [16, 10], [24, 17], [31, 27], [42, 17], [30, 3]]) b.set(x, y, y < 7 ? 's' : '.');
    const m = grid(b.rows(), { '.': 'ograss', f: 'oforest', h: 'ohill', '~': 'osea', M: 'omount', s: 'osnow', u: 'oruins', g: 'oglass', '=': 'ohwy', c: 'ocrater' }, { id: 'world' });
    m.ents.push(
      { type: 'icon', icon: 'town', x: 9, y: 22 }, { ...warp('railtown', 38, 14, 'l'), x: 9, y: 22 },
      { type: 'icon', icon: 'cave', x: 12, y: 26 }, { ...warp('metro', 3, 2, 'd'), x: 12, y: 26 },
      { type: 'icon', icon: 'town', x: 16, y: 10 }, { ...warp('windfarm', 16, 22, 'u'), x: 16, y: 10 },
      { type: 'icon', icon: 'tower', x: 24, y: 17 }, { ...warp('neon', 2, 14, 'r'), x: 24, y: 17 },
      { type: 'icon', icon: 'cave', x: 31, y: 27 }, { ...warp('glass', 16, 24, 'u'), x: 31, y: 27 },
      { type: 'icon', icon: 'shrine', x: 42, y: 17 }, { type: 'trigger', run: 'w_cathedral', x: 42, y: 17 },
      { type: 'icon', icon: 'tower', x: 30, y: 3, cond: (f) => !!f.cathedralDone }, { ...warp('vault', 11, 22, 'u'), x: 30, y: 3 },
      { type: 'solid', talk: 'w_barricade', x: 30, y: 9, cond: (f) => !f.cathedralDone },
    );
    m.enc = (x, y) => (y < 8 ? 'snow' : x >= 26 && y >= 24 ? 'glass' : x < 16 && y > 16 ? 'yard' : 'wild');
    return m;
  },
};

// ---------- the Sunken Metro: dark tunnels and the first conduits ----------
MAPS.metro = {
  name: '沉沒地鐵', music: 'cave',
  build() {
    const rows = [
      'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
      'KK^KKKKKKKKKKKKKKKKKKKKKKKKKKK',
      'Kqqq%qqqqqqqqKKKKKKKKKKKKKKKKK',
      'K#############KKKKKKqqqq$qqKKK',
      'Kqqqqqqqqq|qqqKKKKKKqqqqqqqKKK',
      'KKKKKKKKKqKKKKKKKKKKqq%qqqqKKK',
      'KKKKKKKKKqKKKKKKKKKKKKKgKKKKKK',
      'KKqqqqqqqqqqqqqqqqqqqqqqqqKKKK',
      'KKq####################qqqKKKK',
      'KKqqqeqqqqqqqqqqqqqqqeqqqqKKKK',
      'KKKKKKKKqKKKKKKKKKKKKKKKKKKKKK',
      'KKKKqqqqqqqqqqKKKKKKKKKKKKKKKK',
      'KKKKqqqqqqqqqqKKKKKqqqqqqqqqKK',
      'KKKKqqqqqqqqqqgqqqqqqqqqqqqqKK',
      'KKKKqqqqqqqqqqKKKKKqqqqqqqqqKK',
      'KKKKqq@qqqqqqqKKKKKqqqqBqqqqKK',
      'KKKKKKKKKKKKKKKKKKKqqqqqqqqqKK',
      'KKKKKKKKKKKKKKKKKKKqqqqTqqqqKK',
      'KKKKKKKKKKKKKKKKKKKKKKKgKKKKKK',
      'KKKKKKKKKKKKKKKKKKKqqqqqqqqqKK',
      'KKKKKKKKKKKKKKKKKKKqqqqQqqqqKK',
      'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    ];
    const m = grid(rows, {
      '^': { k: 'stairs', e: warp('world', 12, 27, 'd', { exit: true }) },
      $: { k: 'concrete', e: { type: 'chest', id: 'mt1', item: 'ironsword' } },
      e: { k: 'concrete', e: (x, y, n) => ({ type: 'enemy', n, troop: ['m1', 'm2'][n], art: n ? 'bat' : 'rat', hx: x, hy: y, range: 5, sight: 4 }) },
      g: { k: 'concrete', e: (x, y, n) => (n === 0 ? { type: 'gate', group: 9, flag: 'boss1' } : { type: 'gate', group: n + 1 }) },
      '@': { k: 'concrete', e: { type: 'save' } },
      B: { k: 'concrete', e: { type: 'boss', id: 'worm', art: 'serpent', hue: 300, scale: 0.9, talk: 'mt_worm', cond: (f) => !f.boss1 } },
      T: { k: 'concrete', e: { type: 'trigger', run: 'mt_worm', once: 'wormSeen' } },
      Q: { k: 'pod', e: { type: 'solid', talk: 'mt_pod' } },
    }, { id: 'metro', dark: 0.9 });
    // the first conduits: a generator, a bent line and the gate to the lower platform
    conduits(m, 2, [10, 12], [13, 14], [[11, 12, 'I', 1, 1], [12, 12, 'L', 2, 1], [12, 13, 'I', 0, 1], [12, 14, 'L', 0, 2]]);
    // the lower tunnel needs a longer line before the worm's nest opens
    conduits(m, 3, [20, 14], [27, 12], [[21, 14, 'I', 1, 1], [22, 14, 'T', 1, 2], [23, 14, 'I', 1, 1], [24, 14, 'L', 3, 1], [24, 13, 'I', 0, 1], [24, 12, 'L', 1, 2], [25, 12, 'I', 1, 0], [26, 12, 'I', 1, 1]]);
    m.entry = [3, 2, 'd'];
    return m;
  },
};

// ---------- the Windfarm: a village of dead turbines and dying fields ----------
MAPS.windfarm = {
  name: '風車村', music: 'town', safe: true,
  build(flags = {}) {
    const b = canvasMap(34, 24, flags.sprout ? '.' : '=');
    b.rect(0, 0, 34, 2, 'T'); b.rect(0, 0, 2, 24, 'T'); b.rect(32, 0, 2, 24, 'T'); b.rect(0, 23, 34, 1, 'T');
    b.rect(15, 18, 3, 6, flags.sprout ? '=' : 'q');
    // fields: dead dust before, green rows after the first sprout
    for (let y = 14; y < 21; y++) for (let x = 3; x < 13; x++) b.set(x, y, flags.sprout ? (y % 2 ? ';' : '.') : (y % 2 ? '=' : 'q'));
    for (let y = 14; y < 21; y++) for (let x = 21; x < 31; x++) b.set(x, y, flags.sprout ? (y % 2 ? ',' : '.') : (y % 2 ? '=' : 'q'));
    const D = {};
    const house = (k, x, y, w, roof) => { b.rect(x, y, w, 2, roof); b.rect(x, y + 2, w, 2, 'H'); b.set(x + 1, y + 2, 'N'); b.set(x + w - 2, y + 2, 'N'); b.set(x + 2, y + 3, 'D'); D[k] = [x + 2, y + 3]; };
    house('inn', 4, 4, 6, 'G'); house('shop', 23, 4, 6, 'R'); house('mag', 13, 3, 7, 'B');
    b.set(17, 11, 'O'); b.set(10, 10, 'F'); b.set(11, 10, 'F'); b.set(22, 10, 'F'); b.set(23, 10, 'F');
    const m = grid(b.rows(), {}, { id: 'windfarm' });
    m.ents.push({ ...warp('wf_inn', 6, 3, 'u'), x: D.inn[0], y: D.inn[1] }, { ...warp('wf_shop', 6, 3, 'u'), x: D.shop[0], y: D.shop[1] });
    m.ents.push({ type: 'solid', talk: 'wf_maghouse', x: D.mag[0], y: D.mag[1] });
    for (const x of [15, 16, 17]) m.ents.push({ ...warp('world', 16, 11, 'd', { exit: true }), x, y: 23 });
    for (const [x, y] of [[4, 12], [12, 12], [21, 12], [30, 12], [8, 21], [26, 21]]) m.ents.push(turbine(x, y));
    m.ents.push(
      npc('mag', 'elder', 'wf_mag', { x: 16, y: 9, dir: 'd' }),
      npc('farmer', 'merchant', 'wf_farmer', { x: 7, y: 13, dir: 'r' }),
      npc('girl', 'girl', 'wf_girl', { x: 25, y: 13, dir: 'l', wander: true }),
      npc('boy', 'boy', 'wf_boy', { x: 20, y: 17, wander: true }),
      { type: 'trigger', run: 'wf_arrive', once: 'wfSeen', x: 16, y: 21 }, { type: 'trigger', run: 'wf_arrive', once: 'wfSeen', x: 15, y: 21 }, { type: 'trigger', run: 'wf_arrive', once: 'wfSeen', x: 17, y: 21 },
    );
    m.entry = [16, 22, 'u'];
    return m;
  },
};
carriage('wf_inn', '風車村的旅店', 'inn', [6, 7], [npc('wfinn', 'mom', 'wf_innkeep', { x: 6, y: 2, dir: 'd' })]);
MAPS.wf_inn.build = ((o) => () => { const m = o(); for (const e of m.ents) if (e.type === 'warp') { e.to = 'windfarm'; e.tx = 6; e.ty = 8; } return m; })(MAPS.wf_inn.build);
carriage('wf_shop', '風車村的雜貨店', 'shop', [25, 7], [npc('wfshop', 'merchant', 'wf_shop', { x: 6, y: 2, dir: 'd' })]);
MAPS.wf_shop.build = ((o) => () => { const m = o(); for (const e of m.ents) if (e.type === 'warp') { e.to = 'windfarm'; e.tx = 25; e.ty = 8; } return m; })(MAPS.wf_shop.build);

// ---------- Neon City: the old capital, where signs still flicker ----------
MAPS.neon = {
  name: '霓虹廢都', music: 'tower',
  build() {
    const rows = [
      'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
      'EaaaaaaaaaVaaaaaEEEEEaaaaaaaaaaa$aaE',
      'EaEEEEEEaaaaaaaaEEEEEaaEEEEEEaaaaaaE',
      'EaEEEEEEaa|aaaaaaaaaaaaEEEEEEaaVaaaE',
      'EaEEEEEEaaaaEEEEEEEEaaaEEEEEEaaaaaaE',
      'EaaaaaaaaaaaEEEEEEEEaaaaaaaaaaaaaaaE',
      'EEEEEEaEEEEEEEEEEEEEgEEEEEEEEaEEEEEE',
      'EKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqKE',
      'EKqqqqqqqqqqq%qqqqqqqqqqqqqqqqqqqqKE',
      'EKqqqqqqqqqqqqqqqqBqqqqqqqqqqqqqqqKE',
      'EKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqKE',
      'EKqq%qqqqqqqqqqqqqTqqqqqqqqqqq%qqqKE',
      'EKKKKKKKKKKKKKKKKgKKKKKKKKKKKKKKKKKE',
      'EaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaE',
      'aaaaVaaaaa|aaaaaaaaaaaaaaaaaaaaVaaaE',
      'EaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaE',
      'EEEEaEEEEEEEaEEEEEEEaEEEEEEEaEEEEEEE',
      'EaaaaaaaaEaaaaaaaaEaaaaaaaaEaaaaaaaE',
      'Eaaa@aaaaEaaaaeaaaEaaaa$aaaEaaaeaaaE',
      'EaaaaaaaaEaaaaaaaaEaaaaaaaaEaaaaaaaE',
      'EaaaaaaaaEaaaaaaaaEaaaaaaaaEaaaaaaaE',
      'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    ];
    const m = grid(rows, {
      $: { k: 'asphalt', e: (x, y, n) => ({ type: 'chest', id: 'nc' + n, item: ['sageear', 'galeboots'][n] }) },
      e: { k: 'asphalt', e: (x, y, n) => ({ type: 'enemy', n, troop: ['n1', 'n2'][n], art: n ? 'drone' : 'brigand', hue: n ? 120 : 0, hx: x, hy: y, range: 5, sight: 5 }) },
      g: { k: 'asphalt', e: (x, y, n) => (n === 0 ? { type: 'gate', group: 9, flag: 'boss2' } : { type: 'gate', group: 2 }) },
      '@': { k: 'asphalt', e: { type: 'save' } },
      B: { k: 'concrete', e: { type: 'boss', id: 'neonking', art: 'golem', hue: 250, scale: 0.6, talk: 'nc_boss', cond: (f) => !f.boss2 } },
      T: { k: 'concrete', e: { type: 'trigger', run: 'nc_boss', once: 'neonSeen' } },
    }, { id: 'neon', tint: 'rgba(30,0,60,0.25)' });
    // two lines run from one generator: both receivers must light to open the old plaza
    conduits(m, 2, [6, 14], [16, 12], [[7, 14, 'I', 1, 1], [8, 14, 'T', 1, 1], [9, 14, 'I', 1, 0], [10, 14, 'T', 1, 2], [11, 14, 'I', 1, 1], [12, 14, 'I', 1, 0], [13, 14, 'T', 3, 1], [14, 14, 'I', 1, 1], [15, 14, 'I', 1, 0], [16, 14, 'L', 3, 2], [16, 13, 'I', 0, 1]]);
    // the vendor robot that still keeps shop
    m.ents.push(npc('vendor', 'merchant', 'nc_vendor', { x: 13, y: 18, dir: 'd' }));
    m.ents.push({ type: 'solid', talk: 'nc_terminal', x: 30, y: 18 });
    m.ents.push(npc('vey1', 'vey', 'nc_vey', { x: 30, y: 4, dir: 'd', cond: (f) => !f.boss2 && !f.veyMet }));
    for (const y of [13, 14, 15]) m.ents.push({ ...warp('world', 23, 17, 'l', { exit: true }), x: 0, y });
    m.entry = [1, 14, 'r'];
    return m;
  },
};

// ---------- the Glass Desert: where the star fell ----------
MAPS.glass = {
  name: '玻璃沙漠', music: 'cave',
  build() {
    const rows = [
      '**********************************',
      '***ggggggggg******gggggggg$gg*****',
      '**ggggggggggg****ggggggggggggg****',
      '**gggg**gggggggggggg***gggggggg***',
      '***ggg**ggggg*ggggggg**gggggggg***',
      '****gggggggggggggggggggggggggg****',
      '******ggggg*******ggggggggggg*****',
      '******ggegg*******ggggggBggggg****',
      '****gggggggg******gggggggggggg****',
      '***ggggggggggg*****gggggTgggg*****',
      '**gggggg**ggggg*****gggggggg******',
      '**ggggg****ggggggggggggggggg******',
      '**gggggg**gggggggggggggggggg******',
      '***gggggggggggg***ggggeggg********',
      '*****gggggggg*****gggggggg********',
      '****gggg$gggg*****ggggggggggg*****',
      '****ggggggggg******ggggggggggg****',
      '*****ggggggg********gggggggggg****',
      '********ggggggggggggggggggggg*****',
      '*********gggggggg@gggggggggg******',
      '**********ggggggggggggggggg*******',
      '***********ggggggggggggggg********',
      '*************ggggggggggg**********',
      '***************ggggggg************',
      '****************ggg***************',
      '**********************************',
    ];
    const m = grid(rows, {
      $: { k: 'glass', e: (x, y, n) => ({ type: 'chest', id: 'gl' + n, item: ['titanaxe', 'wardcharm'][n] }) },
      e: { k: 'glass', e: (x, y, n) => ({ type: 'enemy', n, troop: ['g1', 'g2'][n], art: n ? 'serpent' : 'crab', hue: n ? 40 : 150, hx: x, hy: y, range: 5, sight: 5 }) },
      '@': { k: 'glass', e: { type: 'save' } },
      B: { k: 'glass', e: { type: 'boss', id: 'scorpion', art: 'crab', hue: 300, scale: 0.8, talk: 'gl_boss', cond: (f) => !f.boss3 } },
      T: { k: 'glass', e: { type: 'trigger', run: 'gl_boss', once: 'scorpSeen' } },
    }, { id: 'glass', tint: 'rgba(0,40,40,0.12)' });
    for (const x of [16, 17, 18]) m.ents.push({ ...warp('world', 31, 28, 'd', { exit: true }), x, y: 24 });
    for (let x = 9; x <= 27; x++) m.ents.push({ type: 'trigger', run: 'gl_vey', once: 'glVey', x, y: 18 });
    m.entry = [17, 23, 'u'];
    return m;
  },
};

// ---------- the Iron Cathedral of the church of the falling star ----------
MAPS.cathedral = {
  name: '鐵之大聖堂', music: 'tower',
  build() {
    const rows = [
      'XXXXXXXXXXXXXXXXXXXXXXXXX',
      'XXXXXXXXXXX+++XXXXXXXXXXX',
      'XX+++++++XX+B+XX+++++++XX',
      'XX+!+++!+XX+++XX+!+++!+XX',
      'XX+++$+++XX+T+XX+++$+++XX',
      'XX+++++++XXXgXXX+++++++XX',
      'XX+!+++!+++---+++!+++!+XX',
      'XX+++++++++---+++++++++XX',
      'XXXXgXXXXXX---XXXXXXgXXXX',
      'XX++++++XXX---XXX++++++XX',
      'XX++++++XXX---XXX++++++XX',
      'XX++e+++XXX---XXX+++e++XX',
      'XX++++++XXX---XXX++++++XX',
      'XXXX+XXXXXX---XXXXXX+XXXX',
      'XX++++++++----++++++++++X',
      'XX+!++!+++----+++!++!+++X',
      'XX++++++++----++++++++++X',
      'XX++++e+++----+++++e++++X',
      'XX++++++++----++++++++++X',
      'XXXXXXXXX@----+XXXXXXXXXX',
      'XXXXXXXXXX----XXXXXXXXXXX',
      'XXXXXXXXXX----XXXXXXXXXXX',
      'XXXXXXXXXX----XXXXXXXXXXX',
      'XXXXXXXXXX----XXXXXXXXXXX',
      'XXXXXXXXXXX--XXXXXXXXXXXX',
    ];
    const m = grid(rows, {
      $: { k: 'tfloor', e: (x, y, n) => ({ type: 'chest', id: 'ca' + n, item: ['mithril', 'powerring'][n] }) },
      e: { k: 'tfloor', e: (x, y, n) => ({ type: 'enemy', n, troop: ['c1', 'c2', 'c3', 'c4'][n], art: n % 2 ? 'gargoyle' : 'brigand', hue: n % 2 ? 180 : 200, hx: x, hy: y, range: 4, sight: 5 }) },
      g: { k: 'tcarpet', e: (x, y, n) => (n === 0 ? { type: 'gate', group: 5, flag: 'caSanctum' } : { type: 'gate', group: n }) },
      '@': { k: 'tfloor', e: { type: 'save' } },
      B: { k: 'tfloor', e: { type: 'boss', id: 'bishop', art: 'knight', hue: 30, scale: 0.7, talk: 'ca_boss', cond: (f) => !f.boss4 } },
      T: { k: 'tfloor', e: { type: 'trigger', run: 'ca_boss', once: 'bishopSeen' } },
    }, { id: 'cathedral', tint: 'rgba(40,10,20,0.16)' });
    // two side chapels each hold a generator: light both receivers by the altar to open the sanctum
    conduits(m, 1, [2, 10], [6, 9], [[3, 10, 'I', 1, 1], [4, 10, 'T', 1, 2], [5, 10, 'I', 1, 1], [6, 10, 'L', 3, 1]]);
    conduits(m, 2, [22, 10], [18, 9], [[21, 10, 'I', 1, 1], [20, 10, 'T', 1, 3], [19, 10, 'I', 1, 1], [18, 10, 'L', 0, 2]]);
    // the sanctum door needs both: the two receivers by the altar light a third
    m.ents.push({ type: 'trigger', run: 'ca_sanctum', x: 12, y: 6 }, { type: 'trigger', run: 'ca_sanctum', x: 13, y: 6 }, { type: 'trigger', run: 'ca_sanctum', x: 11, y: 6 });
    for (const x of [11, 12]) m.ents.push({ ...warp('world', 42, 18, 'd', { exit: true }), x, y: 24 });
    m.ents.push(npc('prisoner', 'boy', 'ca_prisoner', { x: 4, y: 16, dir: 'r' }));
    m.entry = [12, 23, 'u'];
    return m;
  },
};

// ---------- the Seed Vault in the frozen north ----------
MAPS.vault = {
  name: '北方種子庫', music: 'tower',
  build() {
    const rows = [
      'MMMMMMMMMMMMMMMMMMMMMMM',
      'MMMMMMMMZZZZZZZMMMMMMMM',
      'MMMmmmmmmmmmmmmmmmmmMMM',
      'MMMmkmmmmmmBmmmmmmkmMMM',
      'MMMmmmmmmmmmmmmmmmmmMMM',
      'MMMmmmmmmmmTmmmmmmmmMMM',
      'MMMMMMMMMMjjjMMMMMMMMMM',
      'MMMMMMMMMMmmmMMMMMMMMMM',
      'MMiiiiiiiimmmiiiiiiiiMM',
      'MMiiiiiiiiimiiiiiiiiiMM',
      'MMiieiiiiiiiiiiiieiiiMM',
      'MMiiiiiiii$iiiiiiiiiiMM',
      'MMiiiiiiiiiiiiiiiiiiiMM',
      'MMMMMMMMMMmmmMMMMMMMMMM',
      'MMmmmmmmmmmmmmmmmmmmmMM',
      'MMmkmmmmmmmmmmmmmmmkmMM',
      'MMmmmemmmmm@mmmmmemmmMM',
      'MMmmmmmmmmmmmmmmmmmmmMM',
      'MMMMMMMMMmmmmmMMMMMMMMM',
      'MMMMMMMMMmmmmmMMMMMMMMM',
      'MMMMMMMMMmmmmmMMMMMMMMM',
      'MMMMMMMMMmmmmmMMMMMMMMM',
      'MMMMMMMMMMmmmMMMMMMMMMM',
      'MMMMMMMMMMMjMMMMMMMMMMM',
    ];
    const m = grid(rows, {
      $: { k: 'ice', e: { type: 'chest', id: 'va0', item: 'elixir' } },
      e: { k: 'metal', e: (x, y, n) => ({ type: 'enemy', n, troop: ['v1', 'v2', 'v3', 'v1'][n], art: n % 2 ? 'wolf' : 'yeti', hue: n % 2 ? 180 : 0, hx: x, hy: y, range: 4, sight: 5 }) },
      '@': { k: 'metal', e: { type: 'save' } },
      B: { k: 'metal', e: { type: 'boss', id: 'cradle', art: 'core', scale: 0.5, talk: 'va_boss', cond: (f) => !f.boss5 } },
      T: { k: 'metal', e: { type: 'trigger', run: 'va_boss', once: 'cradleSeen' } },
    }, { id: 'vault', tint: 'rgba(120,180,255,0.12)' });
    // the enemies on the ice slide too, so mark them as standing on ice
    m.ents.push({ ...warp('world', 30, 4, 'd', { exit: true }), x: 11, y: 23 });
    m.entry = [11, 22, 'u'];
    return m;
  },
};

// ---------- English place names ----------
localize(MAPS, {
  cradle: ['Orbital Station Cradle'], railtown: ['Railtown'], saku_home: ["Saku's Carriage"], ran_workshop: ["Ran's Workshop"], rt_market: ['Market Car'],
  rt_inn: ['Sleeper Car'], rt_council: ['Council Car'], metro: ['The Sunken Metro'], windfarm: ['Windfarm'], wf_inn: ['Windfarm Inn'], wf_shop: ['Windfarm Store'],
  neon: ['Neon City'], glass: ['The Glass Desert'], cathedral: ['The Iron Cathedral'], vault: ['The Northern Seed Vault'],
}, ['name']);
