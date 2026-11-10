// Boot, the main loop, the title screen (a Mode 7 flight over the island), screen transitions,
// and the glue between the field, battles, menus and story scripts.
import { ctx, W, H, canvas, text, textW, windowBox, HAND, tint, fromGrid } from './gfx.js';
import * as gfx from './gfx.js';
import { input, pollInput, endInput, setupTouch } from './input.js';
import { initAudio, playMusic, stopMusic, sfx, currentSong } from './audio.js';
import { UI, uiTick, say, talk, ask, wait, menu, notice } from './ui.js';
import { S, reset, addMember, addItem, fullHeal, save, load, hasSave, setSpellNamer, stats } from './party.js';
import { SPELLS, GROUPS, TROOPS } from './data.js';
import { MAPS } from './maps.js';
import { F, setMaps, loadMap, updateField, drawField, walkEnt, walkPlayer, findEnt } from './field.js';
import { renderMap } from './tiles.js';
import { startBattle, updateBattle, drawBattle, _B } from './battle.js';
import { fieldMenu, shop, loadSettings } from './menu.js';
import { SCRIPTS } from './story.js';
import { sprite } from './sprites.js';
import { L, LANG, isEn, setLang, onLang } from './i18n.js';

setMaps(MAPS);
// the page itself follows the language too
function pageLang() {
  document.documentElement.lang = isEn() ? 'en' : 'zh-Hant';
  const mb = document.getElementById('menuBtn'); if (mb) mb.textContent = L('選單', 'MENU');
}
pageLang();
onLang(pageLang);
setSpellNamer((s) => SPELLS[s].name);
loadSettings();

// worlds are built lazily with the flags of the moment
for (const m of Object.values(MAPS)) { const b = m.build; m.build = () => b(S.flags); }

let scene = 'boot';
const G = (window.G = { S, F, get scene() { return scene; }, SCRIPTS });

// ---------- transitions ----------
const T = { dark: 0, col: '#000', mosaic: 0, job: null };
function trans(kind, n = 16, col = '#000') {
  return new Promise((res) => { T.job = { kind, n, t: 0, res }; T.col = col; });
}
function updateTrans() {
  const j = T.job;
  if (!j) return;
  j.t++;
  const k = Math.min(1, j.t / j.n);
  if (j.kind === 'out') T.dark = Math.ceil(k * 15) / 15;
  if (j.kind === 'in') T.dark = Math.floor((1 - k) * 15) / 15;
  if (j.kind === 'battle') { T.mosaic = Math.floor(k * 12); T.dark = k > 0.6 ? (k - 0.6) / 0.4 : 0; T.flash = j.t < 12 && j.t % 4 < 2; }
  if (j.t >= j.n) { T.job = null; T.mosaic = 0; T.flash = false; if (j.kind === 'battle') T.dark = 1; j.res(); }
}
function drawTrans() {
  if (T.mosaic > 1) {
    const m = T.mosaic + 1, small = canvas(Math.ceil(W / m), Math.ceil(H / m));
    small.x.drawImage(ctx.canvas, 0, 0, small.width, small.height);
    ctx.drawImage(small, 0, 0, small.width * m, small.height * m);
  }
  if (T.flash) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(0, 0, W, H); }
  if (T.dark > 0) { ctx.globalAlpha = T.dark; ctx.fillStyle = T.col; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  if (FX.flash > 0) { ctx.globalAlpha = Math.min(1, FX.flash / FX.flashN); ctx.fillStyle = FX.flashCol; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}
const FX = { flash: 0, flashN: 1, flashCol: '#fff' };

// ---------- the toolbox handed to story scripts ----------
const mapMusic = () => (F.def.music);
const E = {
  say, talk, ask, wait, sfx,
  music: (n) => (n ? playMusic(n) : stopMusic(0.6)),
  ent: (id) => findEnt(id),
  walk: (e, path, sp) => walkEnt(e, path, sp),
  walkPlayer,
  join(id, ent) { addMember(id); S.flags[id] = true; if (ent) ent.gone = true; sfx('level'); },
  give(id, n = 1) { addItem(id, n); },
  heal: fullHeal,
  save: () => save(0),
  async rest(msg, name = null) {
    await trans('out', 20);
    playMusic('inn', { restart: true });
    fullHeal();
    await wait(170);
    playMusic(mapMusic());
    await trans('in', 20);
    await say(name, msg);
  },
  shop,
  battle: (troop, opts) => runBattle(troop, opts),
  openGates(flag) { for (const e of F.ents) if (e.type === 'gate' && e.flag === flag) e.open = true; S.flags[flag] = true; sfx('gate'); F.shake = 12; },
  removeEnt(x) { const e = typeof x === 'string' ? findEnt(x) : x; if (e) e.gone = true; },
  spawn(e) { const o = { px: e.x * 16, py: e.y * 16, ...e }; F.ents.push(o); return o; },
  flash(col, n) { FX.flash = n; FX.flashN = n; FX.flashCol = col; },
  shake(n) { F.shake = n; },
  async warp(to, x, y, dir) { await warpTo(to, x, y, dir); },
  async resetPuzzle() { await trans('out', 12); loadMap(S.map, F.p.x, F.p.y, F.p.dir); F.banner = 0; await trans('in', 12); },
  async reloadWorld() { await trans('out', 20); loadMap('world', F.p.x, F.p.y, F.p.dir); await trans('in', 30); },
  ending: () => ending(),
  async toPresent() {
    await trans('out', 60, '#ffffff');
    T.col = '#ffffff';
    S.members.length = 0; addMember('saku'); S.gold = 60;
    for (const id of Object.keys(S.inv)) delete S.inv[id];
    S.inv.herb = 3;
    loadMap('railtown', 36, 14, 'l'); F.banner = 0;
    playMusic('town');
    await trans('in', 60, '#ffffff');
    T.col = '#000';
    await SCRIPTS.opening(E);
  },
  async reload() { await trans('out', 16, '#ffffff'); loadMap(S.map, F.p.x, F.p.y, F.p.dir); F.banner = 0; T.col = '#ffffff'; await trans('in', 30, '#ffffff'); T.col = '#000'; },
  // cutscene helpers
  night(tint) { F.map.tint = tint === undefined ? 'rgba(8,16,64,0.42)' : tint; },
  solo(on) { F.solo = on; },
  leave(id) { const i = S.members.findIndex((m) => m.id === id); if (i >= 0) S.members.splice(i, 1); },
  has: (id) => !!S.members.find((m) => m.id === id),
  get p() { return F.p; },
};
F.E = E;
F.runScript = async (name, ent) => {
  const fn = SCRIPTS[name];
  if (!fn) { console.warn('no script', name); return; }
  F.busy = true;
  try { await fn(E, ent); } catch (err) { console.error(err); }
  F.busy = false;
};
F.onWarp = async (w) => {
  F.busy = true;
  sfx(w.to.startsWith('cave') || w.to.startsWith('tower') ? 'stairs' : 'door');
  await warpTo(w.to, w.tx, w.ty, w.dir);
  F.busy = false;
};
F.onMenu = async () => {
  F.busy = true; sfx('ok');
  await fieldMenu({ canSave: !!(F.def.safe || F.def.world) });
  F.busy = false;
};
F.onEncounter = async (zone) => {
  F.busy = true;
  const table = GROUPS[zone], total = table.reduce((s, [w]) => s + w, 0);
  let r = Math.random() * total, troop = table[0][1];
  for (const [w, t] of table) { r -= w; if (r <= 0) { troop = t; break; } }
  await runBattle(troop, { bg: zone === 'shore' ? 'shore' : 'field' });
  F.busy = false;
};
F.onTouchEnemy = async (foe) => {
  F.busy = true;
  const r = await runBattle(TROOPS[foe.troop], { bg: ['metro', 'glass'].includes(S.map) ? 'cave' : 'tower' });
  if (r === 'win') foe.gone = true;
  else { foe.stun = 4; }
  F.busy = false;
};
F.onStep = () => {
  // poison nibbles while walking
  if (S.steps % 4 === 0) for (const m of S.members) if (m.status.poison && m.hp > 1) { m.hp--; FX.flash = 3; FX.flashN = 6; FX.flashCol = '#a040c0'; }
};

async function warpTo(to, x, y, dir) {
  await trans('out', 14);
  loadMap(to, x, y, dir);
  playMusic(mapMusic());
  await trans('in', 14);
}
async function runBattle(troop, opts = {}) {
  sfx('encounter');
  stopMusic();
  await trans('battle', 36);
  scene = 'battle';
  T.dark = 0;
  const r = await startBattle(troop, opts);
  if (r === 'lose') { gameOver(); return new Promise(() => {}); }
  scene = 'field';
  T.dark = 1;
  playMusic(mapMusic(), { restart: true });
  await trans('in', 16);
  return r;
}

// ---------- title ----------
let worldTex = null, sea = null;
function buildTitle() {
  const saved = S.flags; S.flags = {};
  const m = MAPS.world.build();
  S.flags = saved;
  m.kinds = []; const idx = {}; const grid = [];
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) { const k = m.kindAt(x, y); if (idx[k] === undefined) { idx[k] = m.kinds.length; m.kinds.push(k); } grid.push(idx[k]); }
  m.tile = (x, y) => grid[y * m.w + x];
  const r = renderMap(m);
  worldTex = r.frames.map((c) => ({ w: c.width, h: c.height, d: new Uint32Array(c.x.getImageData(0, 0, c.width, c.height).data.buffer) }));
  sea = new Uint32Array(1);
}
const m7 = canvas(W, H);
const m7img = m7.x.createImageData(W, H), m7d = new Uint32Array(m7img.data.buffer);
function mode7(camX, camY, ang, horizon, frame) {
  const tex = worldTex[Math.floor(frame / 20) % worldTex.length];
  const ca = Math.cos(ang), sa = Math.sin(ang), seaC = 0xffe07030;
  for (let y = horizon + 1; y < H; y++) {
    const dist = 5200 / (y - horizon);
    const fog = Math.min(1, dist / 2600);
    const rx = camX + ca * dist, ry = camY + sa * dist;
    const span = dist * 0.9;
    for (let x = 0; x < W; x++) {
      const o = (x - W / 2) / (W / 2) * span;
      const tx = Math.floor(rx - sa * o), ty = Math.floor(ry + ca * o);
      let c;
      if (tx >= 0 && ty >= 0 && tx < tex.w && ty < tex.h) c = tex.d[ty * tex.w + tx];
      else c = tex.d[(((ty % 64) + 64) % 64) * tex.w + (((tx % 64) + 64) % 64)];
      if (fog > 0.35) {
        const f = (fog - 0.35) / 0.65, r = c & 255, g = (c >> 8) & 255, b = (c >> 16) & 255;
        const fr = r + (168 - r) * f, fg = g + (200 - g) * f, fb = b + (240 - b) * f;
        c = 0xff000000 | (Math.round(fb) << 16) | (Math.round(fg) << 8) | Math.round(fr);
      }
      m7d[y * W + x] = c;
    }
  }
  m7.x.putImageData(m7img, 0, 0, 0, horizon + 1, W, H - horizon - 1);
  return m7;
}
function bigText(s, x, y, top, bot, scale = 2) {
  const w = textW(s) + 4, c = canvas(w, 16);
  c.x.drawImage(gfx.glyphs ? gfx.glyphs(s, '#ffffff') : canvas(1, 1), 1, 0);
  const id = c.x.getImageData(0, 0, w, 16), d = id.data;
  for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < w; xx++) {
    const i = (yy * w + xx) * 4;
    if (d[i + 3] > 110) { const t = yy / 14, a = top, b = bot; d[i] = a[0] + (b[0] - a[0]) * t; d[i + 1] = a[1] + (b[1] - a[1]) * t; d[i + 2] = a[2] + (b[2] - a[2]) * t; d[i + 3] = 255; } else d[i + 3] = 0;
  }
  c.x.putImageData(id, 0, 0);
  const o = canvas(w + 2, 18);
  for (const [dx, dy] of [[0, 1], [2, 1], [1, 0], [1, 2], [2, 2]]) o.x.drawImage(tint(c, '#101030'), dx, dy);
  o.x.drawImage(c, 1, 1);
  ctx.drawImage(o, Math.round(x - (o.width * scale) / 2), y, o.width * scale, o.height * scale);
}
const title = { t: 0, sel: 0, ready: false };
function updateTitle() {
  title.t++;
  if (!title.ready) { if (input.anyPressed()) { title.ready = true; sfx('ok'); } return; }
  if (UI.active || T.job) return;
  const opts = titleOpts();
  if (input.repeat('down')) { title.sel = (title.sel + 1) % opts.length; sfx('cursor'); }
  if (input.repeat('up')) { title.sel = (title.sel + opts.length - 1) % opts.length; sfx('cursor'); }
  if (input.pressed('a')) {
    if (opts[title.sel].disabled) { sfx('buzz'); return; }
    sfx('ok');
    if (opts[title.sel].id === 'new') newGame();
    else if (opts[title.sel].id === 'lang') setLang(LANG === 'en' ? 'zh' : 'en');
    else continueGame();
  }
  if (input.pressed('b')) title.ready = false;
}
const titleOpts = () => [{ id: 'new', label: L('新的冒險', 'New Game') }, { id: 'cont', label: L('繼續冒險', 'Continue'), disabled: !hasSave(0) }, { id: 'lang', label: LANG === 'en' ? 'Language: English' : '語言：中文' }];
function drawTitle() {
  const t = title.t, horizon = 84;
  // sky
  for (let y = 0; y <= horizon; y++) { const k = Math.floor((y / horizon) * 10) / 10; ctx.fillStyle = `rgb(${24 + k * 150},${40 + k * 160},${120 + k * 120})`; ctx.fillRect(0, y, W, 1); }
  for (let i = 0; i < 6; i++) { const x = ((i * 53 - t * 0.15) % 300 + 300) % 300 - 30, y = 20 + (i * 17) % 40; ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(x, y, 30 + (i % 3) * 10, 3); ctx.fillRect(x + 6, y - 2, 18, 2); }
  // a falling star now and then
  { const k = t % 360; if (k < 40) { const fx = 40 + k * 4, fy = 6 + k * 1.4; for (let i = 0; i < 10; i++) { ctx.fillStyle = `rgba(255,248,200,${1 - i / 10})`; ctx.fillRect(Math.round(fx - i * 3), Math.round(fy - i * 1.05), 2, 1); } ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(fx), Math.round(fy), 2, 2); } }
  // the broken towers of the old world on the horizon, and the dead station still crossing the sky
  for (const [x, w, hh, cut] of [[8, 14, 34, 6], [26, 10, 22, 0], [40, 18, 46, 10], [64, 12, 28, 4], [150, 16, 40, 8], [170, 10, 26, 0], [184, 20, 52, 12], [210, 12, 30, 5], [228, 16, 38, 0]]) {
    ctx.fillStyle = '#3a4458'; ctx.fillRect(x, horizon - hh, w, hh); ctx.fillStyle = '#4c5870'; ctx.fillRect(x, horizon - hh, 2, hh);
    if (cut) { ctx.fillStyle = '#5868a0'; ctx.fillRect(x + w - cut, horizon - hh, cut, cut); }
    for (let wy = horizon - hh + 4; wy < horizon - 4; wy += 6) for (let wx = x + 3; wx < x + w - 2; wx += 4) if (((wx * 7 + wy * 3) % 11) === 0) { ctx.fillStyle = (t >> 5) % 2 ? '#f0d070' : '#c0a050'; ctx.fillRect(wx, wy, 1, 2); }
  }
  { const sx = (t * 0.25) % (W + 40) - 20; ctx.fillStyle = '#c8d0e0'; ctx.fillRect(Math.round(sx), 30, 5, 2); ctx.fillRect(Math.round(sx) + 2, 28, 1, 6); if ((t >> 4) % 2) { ctx.fillStyle = '#f04040'; ctx.fillRect(Math.round(sx) + 2, 30, 1, 1); } }
  const ang = -Math.PI / 2 + Math.sin(t / 900) * 0.35, cx = 400 + Math.cos(t / 700) * 120, cy = 620 - (t * 0.25) % 420;
  ctx.drawImage(mode7(cx, cy, ang, horizon, t), 0, 0);
  // logo
  if (isEn()) {
    bigText('EARTHFALL', W / 2, 10, [255, 248, 200], [240, 160, 48], 3);
    bigText('CHRONICLE', W / 2, 52, [200, 236, 255], [96, 160, 240], 2);
    text('星墜地球記', W / 2, 92, '#e0f0ff', { align: 'center', shadow: '#101030' });
  } else {
    bigText('星墜地球記', W / 2, 22, [255, 248, 200], [240, 160, 48], 3);
    text('EARTHFALL CHRONICLE', W / 2, 78, '#e0f0ff', { align: 'center', shadow: '#101030' });
  }
  if (!title.ready) {
    if ((t >> 5) % 2) text('PRESS START', W / 2, 170, '#ffffff', { align: 'center' });
    text(L('Z 決定　X 取消／選單　方向鍵 移動', 'Z: OK   X: Cancel/Menu   Arrows: Move'), W / 2, 190, '#e8f0ff', { align: 'center', shadow: '#101030' });
  } else {
    const opts = titleOpts();
    windowBox(66, 136, 124, 64);
    opts.forEach((o, i) => text(o.label, 90, 144 + i * 18, o.disabled ? '#8088a8' : '#f8f8f8'));
    ctx.drawImage(HAND, 74 + ((t >> 3) % 2), 145 + title.sel * 18);
  }
  text(L('© 2026 原創作品', '© 2026 An original game'), W / 2, H - 16, '#e8f0ff', { align: 'center', shadow: '#101030' });
}

// ---------- prologue ----------
const PROLOGUE_ZH = [
  '西元2091年。',
  '',
  '直徑十二公里的小行星「終焉」，',
  '正朝著地球墜落。',
  '',
  '人類最後的希望，',
  '是漂浮在軌道上的研究站──',
  '「搖籃號」。',
];
const PROLOGUE_EN = [
  'AD 2091.',
  '',
  'Finis, an asteroid twelve kilometres wide,',
  'is falling toward the Earth.',
  '',
  "Humanity's last hope",
  'is a research station in orbit:',
  'Cradle.',
];
const prologue = () => (isEn() ? PROLOGUE_EN : PROLOGUE_ZH);
const intro = { t: 0 };
async function newGame() {
  await trans('out', 30);
  reset();
  addMember('rei');
  scene = 'intro'; intro.t = 0;
  T.dark = 0;
}
function updateIntro() {
  intro.t++;
  const done = intro.t > prologue().length * 50 + 200;
  if ((input.pressed('a') || input.pressed('b') || done) && !T.job && !intro.leaving) {
    intro.leaving = true;
    (async () => {
      await trans('out', 30);
      intro.leaving = false;
      scene = 'field';
      loadMap('cradle', 5, 7, 'u');
      playMusic('tower');
      await trans('in', 30);
      F.runScript('cr_intro');
    })();
  }
}
function drawIntro() {
  ctx.fillStyle = '#000010'; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) { const x = (i * 97) % W, y = (i * 61) % H; if ((intro.t + i * 7) % 90 < 70) { ctx.fillStyle = i % 5 ? '#6070a0' : '#ffffff'; ctx.fillRect(x, y, 1, 1); } }
  prologue().forEach((l, i) => {
    const a = Math.max(0, Math.min(1, (intro.t - i * 50) / 40));
    if (a <= 0) return;
    ctx.globalAlpha = a;
    text(l, W / 2, 16 + i * 16, '#e8e8f8', { align: 'center' });
  });
  ctx.globalAlpha = 1;
}

// ---------- continue / game over ----------
async function continueGame() {
  await trans('out', 20);
  if (!load(0)) { await trans('in', 10); return; }
  scene = 'field';
  loadMap(S.map, S.x, S.y, S.dir);
  playMusic(mapMusic());
  await trans('in', 20);
}
const over = { t: 0 };
function gameOver() {
  scene = 'over'; over.t = 0; T.dark = 0; UI.clear(); F.busy = false;
  playMusic('gameover', { restart: true });
}
function updateOver() {
  over.t++;
  if (over.t > 90 && input.pressed('a') && !T.job) {
    (async () => { await trans('out', 30); scene = 'title'; title.ready = false; playMusic('title'); await trans('in', 30); })();
  }
}
function drawOver() {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const a = Math.min(1, over.t / 60);
  ctx.globalAlpha = a;
  bigText('GAME OVER', W / 2, 80, [248, 96, 96], [160, 24, 40], 2);
  text(L('冒險在這裡結束了……', 'Your adventure ends here...'), W / 2, 130, '#c0c0d0', { align: 'center' });
  if (over.t > 90 && (over.t >> 5) % 2) text(L('按 Z 回到標題畫面', 'Press Z to return to the title'), W / 2, 170, '#f8f8f8', { align: 'center' });
  ctx.globalAlpha = 1;
}

// ---------- ending ----------
async function ending() {
  await trans('out', 60, '#ffffff');
  T.col = '#ffffff';
  loadMap('railtown', 20, 12, 'd');
  F.banner = 0;
  for (const e of F.ents) if (e.type === 'npc') e.gone = true;
  const npc = (id, sp, x, y, dir) => E.spawn({ type: 'npc', id, sprite: sp, x, y, dir });
  npc('e_tess', 'elder', 18, 13, 'r'); npc('e_kid', 'boy', 22, 11, 'l'); npc('e_kid2', 'girl', 23, 13, 'l'); npc('e_vey', 'vey', 17, 11, 'd');
  F.map.tint = 'rgba(80,160,255,0.08)';
  playMusic('ending', { restart: true });
  await trans('in', 60, '#ffffff');
  T.col = '#000';
  await wait(30);
  F.busy = true;
  try { await SCRIPTS.epilogue(E); } catch (err) { console.error(err); }
  F.busy = false;
  await wait(40);
  await trans('out', 60);
  scene = 'credits'; credits.t = 0;
  playMusic('ending', { restart: true });
  T.dark = 0;
  save(1);
}
const CREDITS_ZH = [
  ['星墜地球記', 'big'], [''], ['EARTHFALL CHRONICLE'], [''], [''],
  ['— 登場人物 —', 'y'], ['朔　　鐵軌鎮的拾荒者'], ['蘭　　機械師'], ['老齒輪　退役的教團騎士'], ['露米　種子守護機'], [''],
  ['玲博士　搖籃號的植物學家'], ['薇伊　教團審問官'], ['哈爾艦長　工程師小野'], ['泰絲婆婆　瑪格婆婆'], ['鐵軌鎮與風車村的人們'], [''], [''],
  ['— 星墜後的生物 —', 'y'], ['鏽鼠　灰鴉　噬人草　哨戒機'], ['晶殼鼠　隧道蝙蝠　監視眼'], ['廢墟掠奪者　廢鐵兵　武裝無人機'], ['玻璃蛛　沙鰻　晶石魔像'], ['教團騎士　鋼之天使　凍原巨獸　鐵狼'], [''],
  ['地鐵巨蟲'], ['霓虹巨像'], ['晶蠍女王'], ['鐵之主教'], ['搖籃'], [''], [''],
  ['故事、音樂、地圖與人物'], ['以程式碼繪製與合成'], [''], ['怪物圖像 (CC-BY 3.0)'], ['Charles Gabriel (Antifarea)'], ['Stephen "Redshrike" Challener'], ['Blarumyrran   LordNeo   Balmer'], ['Atrus   Scrittl (CC0)'], ['OpenGameArt.org'], [''], ['字型：俐方體11號 (Cubic 11)'], [''], [''],
  ['天空變藍了。'], ['一千兩百萬顆種子，'], ['正在世界的每個角落發芽。'], [''], [''],
  ['感謝你的遊玩！', 'y'], [''], [''], ['—— 完 ——', 'big'],
];
const CREDITS_EN = [
  ['EARTHFALL', 'big'], [''], ['CHRONICLE', 'big'], [''], ['星墜地球記'], [''], [''],
  ['- CAST -', 'y'], ['Saku - scavenger of Railtown'], ['Ran - mechanic'], ['Old Gears - a church knight who deserted'], ['Lumi - seed keeper'], [''],
  ['Dr. Rei - botanist of Cradle'], ['Vey - inquisitor of the church'], ['Captain Hale   Engineer Ono'], ['Granny Tess   Granny Mag'], ['and the people of Railtown and the Windfarm'], [''], [''],
  ['- LIFE AFTER THE EARTHFALL -', 'y'], ['Rust Rat   Ash Crow   Snapweed'], ['Sentry Drone   Crystal Rat   Tunnel Bat'], ['Watcher Eye   Ruin Raider   Scrap Soldier'], ['Gun Drone   Glass Spider   Sand Eel'], ['Crystal Golem   Church Knight   Steel Angel'], ['Tundra Beast   Iron Wolf'], [''],
  ['The Metro Worm'], ['The Neon Colossus'], ['The Crystal Scorpion Queen'], ['The Iron Bishop'], ['Cradle'], [''], [''],
  ['Story, music, maps and heroes'], ['made in code'], [''], ['Monster sprites (CC-BY 3.0)'], ['Charles Gabriel (Antifarea)'], ['Stephen "Redshrike" Challener'], ['Blarumyrran   LordNeo   Balmer'], ['Atrus   Scrittl (CC0)'], ['hosted by OpenGameArt.org'], [''], ['Font: Cubic 11'], [''], [''],
  ['The sky is blue again.'], ['Twelve million seeds'], ['are sprouting all over the world.'], [''], [''],
  ['THANK YOU FOR PLAYING!', 'y'], [''], [''], ['THE END', 'big'],
];
const creditList = () => (isEn() ? CREDITS_EN : CREDITS_ZH);
const credits = { t: 0 };
function updateCredits() {
  credits.t++;
  const end = creditList().length * 18 * 2 + H * 2;
  if ((credits.t > end && input.pressed('a')) && !T.job) {
    (async () => { await trans('out', 40); scene = 'title'; title.ready = false; playMusic('title'); await trans('in', 40); })();
  }
}
function drawCredits() {
  ctx.fillStyle = '#000010'; ctx.fillRect(0, 0, W, H);
  const y0 = H - credits.t / 2;
  const list = creditList();
  list.forEach(([s, k], i) => {
    let y = y0 + i * 18;
    if (k === 'big' && i === list.length - 1) y = Math.max(y, 90);
    if (y < -20 || y > H) return;
    if (k === 'big') bigText(s, W / 2, y - 6, [255, 248, 200], [240, 160, 48], 2);
    else text(s, W / 2, y, k === 'y' ? '#f8e070' : '#e8e8f8', { align: 'center' });
  });
  // the party walks along the shore below
  ctx.fillStyle = '#183898'; ctx.fillRect(0, H - 22, W, 22);
  S.members.forEach((m, i) => { const fr = sprite(m.id).r[Math.floor(credits.t / 8) % 4]; ctx.drawImage(fr, ((credits.t * 0.5 + 40 - i * 20) % (W + 80)) - 40, H - 34); });
}

// ---------- the loop ----------
let acc = 0, last = performance.now();
function step() {
  pollInput();
  uiTick();
  updateTrans();
  if (FX.flash > 0) FX.flash--;
  if (scene === 'field' || scene === 'battle') S.time++;
  const uiOwned = UI.active;
  if (uiOwned) UI.update();
  switch (scene) {
    case 'title': updateTitle(); break;
    case 'intro': updateIntro(); break;
    case 'field': if (!T.job) updateField(); else F.frame++; break;
    case 'battle': updateBattle(); break;
    case 'over': updateOver(); break;
    case 'credits': updateCredits(); break;
  }
  endInput();
}
function draw() {
  switch (scene) {
    case 'boot': ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); text('Loading…', W / 2, H / 2 - 6, '#fff', { align: 'center' }); break;
    case 'title': drawTitle(); break;
    case 'intro': drawIntro(); break;
    case 'field': drawField(); break;
    case 'battle': drawBattle(); break;
    case 'over': drawOver(); break;
    case 'credits': drawCredits(); break;
  }
  UI.draw();
  drawTrans();
}
function frame(now) {
  acc += Math.min(100, now - last); last = now;
  let n = 0;
  while (acc >= 1000 / 60 && n < 4) { step(); acc -= 1000 / 60; n++; }
  if (n) { draw(); if (gfx.present) gfx.present(!document.body.classList.contains('noscan')); }
  requestAnimationFrame(frame);
}

// audio needs a user gesture
const unlock = () => initAudio();
addEventListener('keydown', unlock); addEventListener('pointerdown', unlock); addEventListener('touchstart', unlock);

async function boot() {
  try { await document.fonts.load(FONTSPEC); } catch (e) { /* fall back */ }
  await new Promise((r) => setTimeout(r, 30));
  buildTitle();
  setupTouch();
  scene = 'title';
  playMusic('title');
  window.READY = 1;
}
const FONTSPEC = '12px Cubic11';
requestAnimationFrame(frame);
boot();

// debugging hooks for automated checks
G.T = T; G._B = _B; G.UI = UI; G.newGame = newGame; G.continueGame = continueGame; G.loadMap = loadMap; G.trans = trans; G.runBattle = runBattle; G.E = E; G.addMember = addMember; G.stats = stats;
G.go = (map, x, y) => { scene = 'field'; T.dark = 0; if (x === undefined) { const m = MAPS[map].build(S.flags); [x, y] = m.entry || [Math.floor(m.w / 2), m.h - 2]; } loadMap(map, x, y, 'd'); playMusic(MAPS[map].music); };
void menu; void notice; void currentSong; void fromGrid;
