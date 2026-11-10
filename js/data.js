// 星墜地球記 Earthfall Chronicle: the party, their gear, gadgets and the creatures of a broken Earth.
// Enemy stats are fixed and never scale with the party.
import { localize } from './i18n.js';

// special ids are fixed names the battle code knows: starblade (one foe), meteor and ironfall (all foes), arklight (heal all)
export const HEROES = {
  saku:  { name: '朔', title: '拾荒者', sprite: 'saku',  base: { hp: 46, mp: 6,  str: 12, def: 9,  int: 5,  agi: 10 }, grow: { hp: 11, mp: 1.6, str: 2.6, def: 1.9, int: 1.0, agi: 1.5 }, equip: { weapon: 'shortsword', armor: 'cloth', acc: null }, kinds: ['sword', 'light', 'heavy'], special: 'starblade' },
  ran:   { name: '蘭', title: '機械師', sprite: 'ran',   base: { hp: 34, mp: 16, str: 8,  def: 7,  int: 13, agi: 12 }, grow: { hp: 8, mp: 3.8, str: 1.6, def: 1.3, int: 2.6, agi: 1.6 }, equip: { weapon: 'shortbow', armor: 'cloth', acc: null }, kinds: ['bow', 'light', 'robe'], special: 'meteor' },
  gears: { name: '老齒輪', title: '退役兵', sprite: 'gears', base: { hp: 66, mp: 4,  str: 15, def: 12, int: 3,  agi: 6 },  grow: { hp: 14, mp: 0.8, str: 3.0, def: 2.3, int: 0.6, agi: 1.0 }, equip: { weapon: 'handaxe', armor: 'leather', acc: null }, kinds: ['axe', 'light', 'heavy'], special: 'ironfall' },
  rei:   { name: '玲', title: '博士', sprite: 'rei', base: { hp: 30, mp: 10, str: 5, def: 5, int: 12, agi: 8 }, grow: { hp: 6, mp: 2, str: 1, def: 1, int: 2, agi: 1 }, equip: { weapon: null, armor: null, acc: null }, kinds: ['robe'], special: 'arklight' },
  lumi:  { name: '露米', title: '種子守護機', sprite: 'lumi', base: { hp: 38, mp: 18, str: 7,  def: 9,  int: 12, agi: 11 }, grow: { hp: 8, mp: 4.0, str: 1.4, def: 1.6, int: 2.5, agi: 1.5 }, equip: { weapon: 'oakrod', armor: 'robe', acc: null }, kinds: ['rod', 'robe', 'light'], special: 'arklight' },
};
// what each learns as they grow
export const LEARN = {
  saku: [[4, 'heal'], [9, 'guard']],
  ran: [[1, 'flame'], [3, 'ice'], [5, 'sleep'], [7, 'thunder'], [11, 'firestorm']],
  gears: [[1, 'roar'], [8, 'guard']],
  rei: [],
  lumi: [[1, 'heal'], [1, 'holy'], [3, 'cure'], [5, 'shield'], [8, 'healall'], [11, 'revive']],
};
export const expFor = (L) => Math.floor(10 * Math.pow(L - 1, 2) + 12 * (L - 1));

export const ITEMS = {
  herb:     { name: '急救包', price: 12, use: 'heal', power: 45, target: 'ally', desc: '回復 45 HP' },
  hiherb:   { name: '野戰醫療箱', price: 50, use: 'heal', power: 160, target: 'ally', desc: '回復 160 HP' },
  water:    { name: '電池', price: 35, use: 'mp', power: 20, target: 'ally', desc: '回復 20 EP' },
  antidote: { name: '解毒劑', price: 10, use: 'cure', target: 'ally', desc: '解除中毒' },
  plume:    { name: '重啟晶片', price: 220, use: 'revive', power: 0.5, target: 'dead', desc: '讓倒下的同伴重新站起來' },
  smoke:    { name: '閃光彈', price: 25, use: 'escape', target: 'none', desc: '戰鬥中必定逃跑' },
  elixir:   { name: '奈米萬能液', price: 0, use: 'full', target: 'ally', desc: 'HP 與 EP 全滿' },
  // blades
  shortsword: { name: '鐵管刀', price: 30, slot: 'weapon', kind: 'sword', atk: 5 },
  ironsword:  { name: '開山刀', price: 90, slot: 'weapon', kind: 'sword', atk: 11 },
  steelsword: { name: '電漿切割刀', price: 280, slot: 'weapon', kind: 'sword', atk: 20 },
  tideblade:  { name: '曙光刃', price: 0, slot: 'weapon', kind: 'sword', atk: 32, bonus: { agi: 4 } },
  // Lumi's tools
  oakrod:     { name: '澆水器', price: 25, slot: 'weapon', kind: 'rod', atk: 2, bonus: { int: 2 } },
  magerod:    { name: '光合燈', price: 130, slot: 'weapon', kind: 'rod', atk: 5, bonus: { int: 7 } },
  starrod:    { name: '世界之種', price: 0, slot: 'weapon', kind: 'rod', atk: 9, bonus: { int: 14 } },
  // hammers
  handaxe:    { name: '扳手錘', price: 40, slot: 'weapon', kind: 'axe', atk: 9 },
  battleaxe:  { name: '大鐵鎚', price: 240, slot: 'weapon', kind: 'axe', atk: 20 },
  titanaxe:   { name: '打樁機', price: 0, slot: 'weapon', kind: 'axe', atk: 34 },
  // guns
  shortbow:   { name: '釘槍', price: 35, slot: 'weapon', kind: 'bow', atk: 6 },
  elfbow:     { name: '磁軌手槍', price: 250, slot: 'weapon', kind: 'bow', atk: 16, bonus: { agi: 3 } },
  // armour
  cloth:      { name: '工作服', price: 10, slot: 'armor', kind: 'light', def: 2 },
  leather:    { name: '輪胎護甲', price: 60, slot: 'armor', kind: 'light', def: 6 },
  robe:       { name: '防塵斗篷', price: 70, slot: 'armor', kind: 'robe', def: 4, bonus: { int: 2 } },
  chain:      { name: '鋼板背心', price: 210, slot: 'armor', kind: 'heavy', def: 13 },
  holyrobe:   { name: '絕緣外套', price: 230, slot: 'armor', kind: 'robe', def: 10, bonus: { int: 4 } },
  mithril:    { name: '舊世界動力甲', price: 0, slot: 'armor', kind: 'heavy', def: 22 },
  // accessories
  powerring:  { name: '伺服手套', price: 0, slot: 'acc', kind: 'any', bonus: { str: 6 } },
  wardcharm:  { name: '護盾晶片', price: 0, slot: 'acc', kind: 'any', bonus: { def: 6 } },
  galeboots:  { name: '噴射靴', price: 0, slot: 'acc', kind: 'any', bonus: { agi: 7 } },
  sageear:    { name: '瞄準鏡片', price: 0, slot: 'acc', kind: 'any', bonus: { int: 7 } },
  // keys
  tidekey:    { name: '種子方舟', price: 0, key: true, desc: '露米肚子裡的種子庫。裡面是舊世界所有植物的種子。' },
  pass:       { name: '教團通行證', price: 0, key: true, desc: '鐵之教團的通行證。上面刻著一顆墜落的星。' },
  photo:      { name: '褪色的照片', price: 0, key: true, desc: '一對母女在花田裡笑著。背面寫著「玲與小空」。' },
};

// spells: Ran's gadgets, Lumi's light and a little first aid
export const SPELLS = {
  flame:     { name: '燃燒彈', mp: 3, type: 'dmg', el: 'fire', power: 16, k: 1.3, target: 'enemy', fx: 'fire' },
  ice:       { name: '液氮彈', mp: 4, type: 'dmg', el: 'ice', power: 22, k: 1.35, target: 'enemy', fx: 'ice' },
  thunder:   { name: '電磁網', mp: 7, type: 'dmg', el: 'bolt', power: 18, k: 1.05, target: 'enemies', fx: 'bolt' },
  firestorm: { name: '燃料爆破', mp: 14, type: 'dmg', el: 'fire', power: 36, k: 1.45, target: 'enemies', fx: 'fire' },
  sleep:     { name: '催眠音波', mp: 4, type: 'sleep', target: 'enemies', fx: 'sleep' },
  holy:      { name: '光合光束', mp: 4, type: 'dmg', el: 'holy', power: 18, k: 1.2, target: 'enemy', fx: 'holy' },
  heal:      { name: '急救', mp: 3, type: 'heal', power: 32, k: 2.0, target: 'ally', fx: 'heal' },
  healall:   { name: '治癒孢子', mp: 10, type: 'heal', power: 26, k: 1.6, target: 'allies', fx: 'heal' },
  cure:      { name: '淨化', mp: 2, type: 'cure', target: 'ally', fx: 'heal' },
  revive:    { name: '重新啟動', mp: 15, type: 'revive', target: 'dead', fx: 'heal' },
  shield:    { name: '力場', mp: 5, type: 'buff', stat: 'def', target: 'allies', fx: 'buff' },
  guard:     { name: '鐵壁', mp: 4, type: 'buff', stat: 'def', target: 'self', fx: 'buff' },
  roar:      { name: '老兵的怒吼', mp: 2, type: 'buff', stat: 'str', target: 'self', fx: 'buff' },
};
export const SPECIALS = {
  starblade: { name: '破曉斬', desc: '對一個敵人造成巨大傷害', target: 'enemy' },
  meteor:    { name: '火花彈幕', desc: '對所有敵人掃射', target: 'enemies' },
  ironfall:  { name: '鐵砧落', desc: '震碎地面，攻擊所有敵人', target: 'enemies' },
  arklight:  { name: '新芽之光', desc: '全體回復並解除異常', target: 'allies' },
};

// art: key into the monster art; hue turns a family into its stronger cousins
export const ENEMIES = {
  rat:      { name: '鏽鼠', art: 'rat', hp: 24, atk: 11, def: 3, int: 3, agi: 9, exp: 7, gold: 5, drop: ['herb', 0.15] },
  crow:     { name: '灰鴉', art: 'bird', hue: 200, sat: 0.3, hp: 20, atk: 13, def: 2, int: 2, agi: 16, exp: 8, gold: 5 },
  snapweed: { name: '噬人草', art: 'plant', hp: 34, atk: 14, def: 5, int: 4, agi: 6, exp: 10, gold: 6, acts: [['atk', 3], ['spore', 1]] },
  drone:    { name: '哨戒機', art: 'drone', hp: 30, atk: 13, def: 8, int: 10, agi: 12, exp: 10, gold: 9, weak: 'bolt', acts: [['atk', 3], ['ember', 1]] },
  crystrat: { name: '晶殼鼠', art: 'rat', hue: 160, hp: 60, atk: 19, def: 12, int: 6, agi: 10, exp: 16, gold: 12, drop: ['antidote', 0.2] },
  bat:      { name: '隧道蝙蝠', art: 'bat', hp: 50, atk: 22, def: 8, int: 6, agi: 20, exp: 16, gold: 10, acts: [['atk', 3], ['drain', 1]] },
  spark:    { name: '電火花', art: 'wisp', hue: 170, hp: 56, atk: 18, def: 10, int: 18, agi: 16, exp: 18, gold: 14, weak: 'ice', acts: [['atk', 1], ['zap', 2]] },
  worm:     { name: '地鐵巨蟲', art: 'serpent', hue: 300, boss: true, hp: 1250, atk: 34, def: 18, int: 15, agi: 8, exp: 300, gold: 400, acts: [['atk', 3], ['twin', 2], ['spore', 1], ['bubble', 2]] },
  raider:   { name: '廢墟掠奪者', art: 'brigand', hp: 110, atk: 32, def: 18, int: 8, agi: 12, exp: 34, gold: 30, acts: [['atk', 3], ['twin', 1]], drop: ['herb', 0.2] },
  scrapper: { name: '廢鐵兵', art: 'bones', hue: 200, sat: 0.4, hp: 95, atk: 30, def: 22, int: 5, agi: 9, exp: 30, gold: 22, weak: 'bolt', drop: ['water', 0.12] },
  drone2:   { name: '武裝無人機', art: 'drone', hue: 120, hp: 120, atk: 36, def: 24, int: 22, agi: 18, exp: 40, gold: 30, weak: 'bolt', acts: [['atk', 2], ['ember', 2]] },
  neonking: { name: '霓虹巨像', art: 'golem', hue: 250, boss: true, hp: 2000, atk: 42, def: 26, int: 20, agi: 10, exp: 600, gold: 700, weak: 'ice', acts: [['atk', 3], ['twin', 2], ['zap', 2], ['harden', 1]] },
  glasscrab:{ name: '玻璃蟹', art: 'crab', hue: 150, hp: 180, atk: 44, def: 34, int: 10, agi: 8, exp: 58, gold: 40, weak: 'bolt', acts: [['atk', 3], ['bubble', 1]] },
  sandeel:  { name: '沙鰻', art: 'serpent', hue: 40, hp: 160, atk: 42, def: 24, int: 16, agi: 15, exp: 55, gold: 38, acts: [['atk', 3], ['wave', 1]], drop: ['hiherb', 0.12] },
  crysgolem:{ name: '晶石魔像', art: 'golem', hue: 160, hp: 340, atk: 50, def: 46, int: 14, agi: 8, exp: 80, gold: 50, weak: 'bolt', drop: ['water', 0.15] },
  scorpion: { name: '晶蠍女王', art: 'crab', hue: 300, sat: 1.2, boss: true, hp: 2400, atk: 46, def: 30, int: 24, agi: 18, exp: 800, gold: 900, acts: [['atk', 2], ['twin', 2], ['spore', 2], ['wave', 1]] },
  knightc:  { name: '教團騎士', art: 'brigand', hue: 200, hp: 260, atk: 52, def: 34, int: 18, agi: 14, exp: 90, gold: 60, acts: [['atk', 3], ['twin', 1]], drop: ['hiherb', 0.15] },
  angel:    { name: '鋼之天使', art: 'gargoyle', hue: 180, sat: 0.5, hp: 380, atk: 55, def: 50, int: 20, agi: 12, exp: 95, gold: 60, weak: 'bolt' },
  bishop:   { name: '鐵之主教', art: 'knight', hue: 30, boss: true, hp: 2900, atk: 50, def: 32, int: 26, agi: 20, exp: 1000, gold: 1000, acts: [['atk', 2], ['icefang', 2], ['tide', 2], ['mist', 1], ['drain', 1]] },
  frostbeast:{ name: '凍原巨獸', art: 'yeti', hp: 420, atk: 58, def: 40, int: 18, agi: 12, exp: 110, gold: 70, weak: 'fire', acts: [['atk', 3], ['icefang', 1]] },
  ironwolf: { name: '鐵狼', art: 'wolf', hue: 180, sat: 0.4, hp: 300, atk: 56, def: 34, int: 10, agi: 22, exp: 100, gold: 60, acts: [['atk', 3], ['twin', 1]] },
  cradle:   { name: '搖籃', art: 'core', boss: true, hp: 3800, atk: 55, def: 36, int: 22, agi: 20, exp: 0, gold: 0, acts: [['atk', 2], ['twin', 2], ['tide', 2], ['abyss', 1], ['icefang', 1]] },
};
// monster techniques; the ids seren/ordath rules look for are cradle's and bishop's now
export const TECHS = {
  spore:   { name: '孢子', kind: 'status', status: 'poison', target: 'one', fx: 'spore' },
  ember:   { name: '雷射', kind: 'magic', power: 14, k: 1.0, el: 'fire', target: 'one', fx: 'fire' },
  zap:     { name: '放電', kind: 'magic', power: 16, k: 1.0, el: 'bolt', target: 'one', fx: 'bolt' },
  drain:   { name: '吸能', kind: 'drain', power: 1.0, target: 'one', fx: 'drain' },
  twin:    { name: '連擊', kind: 'twin', target: 'one', fx: 'slash' },
  bubble:  { name: '酸液', kind: 'magic', power: 18, k: 0.7, el: 'water', target: 'all', fx: 'bubble' },
  harden:  { name: '強化外殼', kind: 'buff', stat: 'def', target: 'self', fx: 'buff' },
  wave:    { name: '沙暴', kind: 'magic', power: 26, k: 0.8, el: 'water', target: 'all', fx: 'bubble' },
  icefang: { name: '晶刺', kind: 'magic', power: 44, k: 1.2, el: 'ice', target: 'one', fx: 'ice' },
  tide:    { name: '衝擊波', kind: 'magic', power: 30, k: 0.8, el: 'water', target: 'all', fx: 'bubble' },
  mist:    { name: '聖歌', kind: 'status', status: 'sleep', target: 'all', fx: 'sleep' },
  abyss:   { name: '結晶化', kind: 'magic', power: 50, k: 1.0, el: 'dark', target: 'all', fx: 'abyss' },
};
// random encounters on the world map, by zone
export const GROUPS = {
  yard: [[4, ['rat', 'rat']], [3, ['crow']], [3, ['rat', 'crow']], [2, ['snapweed']], [2, ['drone']], [1, ['snapweed', 'rat']]],
  wild: [[3, ['drone', 'snapweed']], [3, ['crow', 'crow', 'rat']], [2, ['raider']], [2, ['drone', 'drone']], [1, ['raider', 'crow']]],
  glass: [[3, ['glasscrab']], [3, ['sandeel']], [2, ['sandeel', 'drone2']], [1, ['glasscrab', 'sandeel']]],
  snow: [[3, ['frostbeast']], [3, ['ironwolf']], [2, ['ironwolf', 'ironwolf']]],
};
// the visible monsters in dungeons each carry their own group
export const TROOPS = {
  m1: ['rat', 'rat'], m2: ['bat', 'crystrat'], m3: ['spark', 'bat'], m4: ['crystrat', 'crystrat'],
  n1: ['raider'], n2: ['scrapper', 'drone2'], n3: ['drone2', 'drone2'], n4: ['raider', 'scrapper'],
  g1: ['glasscrab'], g2: ['sandeel', 'sandeel'], g3: ['crysgolem'], g4: ['glasscrab', 'sandeel'],
  c1: ['knightc'], c2: ['angel'], c3: ['knightc', 'knightc'], c4: ['angel', 'knightc'],
  v1: ['frostbeast'], v2: ['ironwolf', 'ironwolf'], v3: ['crysgolem', 'ironwolf'],
  boss1: ['worm'], boss2: ['neonking'], boss3: ['scorpion'], boss4: ['bishop', 'knightc'], boss5: ['cradle'],
};
export const SHOPS = {
  railtown: ['herb', 'water', 'antidote', 'smoke', 'ironsword', 'leather', 'robe'],
  windfarm: ['herb', 'hiherb', 'water', 'antidote', 'plume', 'smoke', 'steelsword', 'magerod', 'battleaxe', 'elfbow', 'chain', 'holyrobe'],
  neon: ['hiherb', 'water', 'plume', 'steelsword', 'battleaxe', 'elfbow', 'chain', 'holyrobe'],
};

// ---------- English ----------
localize(HEROES, { rei: ['Rei', 'Doctor'], saku: ['Saku', 'Scavenger'], ran: ['Ran', 'Mechanic'], gears: ['Old Gears', 'Veteran'], lumi: ['Lumi', 'Seed Keeper'] }, ['name', 'title']);
localize(ITEMS, {
  herb: ['Med Kit', 'Restores 45 HP'], hiherb: ['Field Kit', 'Restores 160 HP'], water: ['Battery', 'Restores 20 EP'], antidote: ['Antitoxin', 'Cures poison'],
  plume: ['Reboot Chip', 'Gets a fallen ally back up'], smoke: ['Flash Bomb', 'Always escape a battle'], elixir: ['Nano Elixir', 'Fully restores HP and EP'],
  shortsword: ['Pipe Blade'], ironsword: ['Machete'], steelsword: ['Plasma Cutter'], tideblade: ['Daybreak Edge'],
  oakrod: ['Watering Can'], magerod: ['Grow Lamp'], starrod: ['World Seed'], handaxe: ['Wrench Hammer'], battleaxe: ['Sledgehammer'], titanaxe: ['Pile Driver'],
  shortbow: ['Nail Gun'], elfbow: ['Rail Pistol'], cloth: ['Overalls'], leather: ['Tyre Armour'], robe: ['Dust Cloak'], chain: ['Plate Vest'],
  holyrobe: ['Insulated Coat'], mithril: ['Old-World Power Suit'], powerring: ['Servo Glove'], wardcharm: ['Shield Chip'], galeboots: ['Jet Boots'], sageear: ['Scope Visor'],
  tidekey: ['Seed Ark', "The seed vault inside Lumi. It holds a seed of every plant of the old world."],
  pass: ['Church Pass', 'A pass of the Iron Church, stamped with a falling star.'],
  photo: ['Faded Photo', 'A mother and daughter laughing in a flower field. On the back: "Rei and Sora".'],
});
localize(SPELLS, {
  flame: ['Firebomb'], ice: ['Nitro Shot'], thunder: ['Shock Net'], firestorm: ['Fuel Blast'], sleep: ['Lullaby Wave'], holy: ['Sunbeam'],
  heal: ['First Aid'], healall: ['Healing Spores'], cure: ['Purify'], revive: ['Reboot'], shield: ['Force Field'], guard: ['Iron Wall'], roar: ["Veteran's Roar"],
});
localize(SPECIALS, {
  starblade: ['Daybreak', 'Huge damage to one enemy'], meteor: ['Spark Barrage', 'Sprays every enemy with fire'],
  ironfall: ['Anvil Drop', 'Shatters the ground under all enemies'], arklight: ['Sprout Light', 'Heals everyone and cures ailments'],
});
localize(ENEMIES, {
  rat: ['Rust Rat'], crow: ['Ash Crow'], snapweed: ['Snapweed'], drone: ['Sentry Drone'], crystrat: ['Crystal Rat'], bat: ['Tunnel Bat'], spark: ['Live Spark'],
  worm: ['The Metro Worm'], raider: ['Ruin Raider'], scrapper: ['Scrap Soldier'], drone2: ['Gun Drone'], neonking: ['The Neon Colossus'],
  glasscrab: ['Glass Crab'], sandeel: ['Sand Eel'], crysgolem: ['Crystal Golem'], scorpion: ['The Crystal Scorpion Queen'],
  knightc: ['Church Knight'], angel: ['Steel Angel'], bishop: ['The Iron Bishop'], frostbeast: ['Tundra Beast'], ironwolf: ['Iron Wolf'], cradle: ['Cradle'],
});
localize(TECHS, {
  spore: ['Spores'], ember: ['Laser'], zap: ['Discharge'], drain: ['Power Drain'], twin: ['Double Hit'], bubble: ['Acid Spray'], harden: ['Harden Shell'],
  wave: ['Sandstorm'], icefang: ['Crystal Spike'], tide: ['Shockwave'], mist: ['Hymn'], abyss: ['Crystallise'],
});
