// Party, items, equipment, spells and enemies. Enemy stats are fixed and never scale with the party.
import { localize } from './i18n.js';

export const HEROES = {
  kai:  { name: '凱', title: '見習兵', sprite: 'kai',  base: { hp: 44, mp: 6,  str: 12, def: 9,  int: 5,  agi: 9 },  grow: { hp: 11, mp: 1.6, str: 2.6, def: 1.9, int: 1.0, agi: 1.4 }, equip: { weapon: 'shortsword', armor: 'cloth', acc: null }, kinds: ['sword', 'light', 'heavy'], special: 'starblade' },
  nia:  { name: '妮雅', title: '星術士', sprite: 'nia', base: { hp: 30, mp: 18, str: 6,  def: 6,  int: 13, agi: 10 }, grow: { hp: 7, mp: 4.2, str: 1.2, def: 1.2, int: 2.8, agi: 1.5 }, equip: { weapon: 'oakrod', armor: 'cloth', acc: null }, kinds: ['rod', 'robe'], special: 'meteor' },
  barton: { name: '巴頓', title: '老兵', sprite: 'barton', base: { hp: 64, mp: 4,  str: 15, def: 12, int: 3,  agi: 6 },  grow: { hp: 14, mp: 0.8, str: 3.0, def: 2.3, int: 0.6, agi: 1.0 }, equip: { weapon: 'handaxe', armor: 'leather', acc: null }, kinds: ['axe', 'light', 'heavy'], special: 'ironfall' },
  io:   { name: '艾歐', title: '星之子', sprite: 'io',  base: { hp: 36, mp: 16, str: 8,  def: 8,  int: 11, agi: 12 }, grow: { hp: 8, mp: 3.8, str: 1.6, def: 1.5, int: 2.4, agi: 1.6 }, equip: { weapon: 'shortbow', armor: 'robe', acc: null }, kinds: ['bow', 'robe', 'light'], special: 'arklight' },
};
// spells learned by level
export const LEARN = {
  kai: [[4, 'heal'], [9, 'guard']],
  nia: [[1, 'flame'], [3, 'ice'], [5, 'sleep'], [7, 'thunder'], [11, 'firestorm']],
  barton: [[1, 'roar'], [8, 'guard']],
  io: [[1, 'heal'], [1, 'holy'], [3, 'cure'], [5, 'shield'], [8, 'healall'], [11, 'revive']],
};
// total exp needed to reach a level
export const expFor = (L) => Math.floor(10 * Math.pow(L - 1, 2) + 12 * (L - 1));

export const ITEMS = {
  herb:     { name: '藥草', price: 10, use: 'heal', power: 45, target: 'ally', desc: '回復 45 HP' },
  hiherb:   { name: '特效藥草', price: 45, use: 'heal', power: 160, target: 'ally', desc: '回復 160 HP' },
  water:    { name: '星光水', price: 35, use: 'mp', power: 20, target: 'ally', desc: '回復 20 MP' },
  antidote: { name: '解毒草', price: 8, use: 'cure', target: 'ally', desc: '解除中毒' },
  plume:    { name: '流星羽', price: 220, use: 'revive', power: 0.5, target: 'dead', desc: '讓倒下的同伴復活' },
  smoke:    { name: '煙霧彈', price: 20, use: 'escape', target: 'none', desc: '戰鬥中必定逃跑' },
  elixir:   { name: '萬靈藥', price: 0, use: 'full', target: 'ally', desc: 'HP 與 MP 全滿' },
  // equipment: slot, atk/def/bonus, who can wear it
  shortsword: { name: '短劍', price: 30, slot: 'weapon', kind: 'sword', atk: 5 },
  ironsword:  { name: '鐵劍', price: 90, slot: 'weapon', kind: 'sword', atk: 11 },
  steelsword: { name: '鋼劍', price: 280, slot: 'weapon', kind: 'sword', atk: 20 },
  tideblade:  { name: '雷昂之劍', price: 0, slot: 'weapon', kind: 'sword', atk: 32, bonus: { agi: 4 } },
  oakrod:     { name: '樺木杖', price: 25, slot: 'weapon', kind: 'rod', atk: 2, bonus: { int: 2 } },
  magerod:    { name: '星術杖', price: 130, slot: 'weapon', kind: 'rod', atk: 5, bonus: { int: 7 } },
  starrod:    { name: '隕星杖', price: 0, slot: 'weapon', kind: 'rod', atk: 9, bonus: { int: 14 } },
  handaxe:    { name: '手斧', price: 40, slot: 'weapon', kind: 'axe', atk: 9 },
  battleaxe:  { name: '戰斧', price: 240, slot: 'weapon', kind: 'axe', atk: 20 },
  titanaxe:   { name: '破城斧', price: 0, slot: 'weapon', kind: 'axe', atk: 34 },
  shortbow:   { name: '短弓', price: 35, slot: 'weapon', kind: 'bow', atk: 6 },
  elfbow:     { name: '光弦弓', price: 250, slot: 'weapon', kind: 'bow', atk: 16, bonus: { agi: 3 } },
  cloth:      { name: '布衣', price: 10, slot: 'armor', kind: 'light', def: 2 },
  leather:    { name: '皮甲', price: 60, slot: 'armor', kind: 'light', def: 6 },
  robe:       { name: '法袍', price: 70, slot: 'armor', kind: 'robe', def: 4, bonus: { int: 2 } },
  chain:      { name: '鋼板甲', price: 210, slot: 'armor', kind: 'heavy', def: 13 },
  holyrobe:   { name: '星紋袍', price: 230, slot: 'armor', kind: 'robe', def: 10, bonus: { int: 4 } },
  mithril:    { name: '隕鐵鎧', price: 0, slot: 'armor', kind: 'heavy', def: 22 },
  powerring:  { name: '力量指環', price: 0, slot: 'acc', kind: 'any', bonus: { str: 6 } },
  wardcharm:  { name: '守護護符', price: 0, slot: 'acc', kind: 'any', bonus: { def: 6 } },
  galeboots:  { name: '疾風靴', price: 0, slot: 'acc', kind: 'any', bonus: { agi: 7 } },
  sageear:    { name: '星語耳環', price: 0, slot: 'acc', kind: 'any', bonus: { int: 7 } },
  tidekey:    { name: '父親的星盤', price: 0, key: true, desc: '父親留下的星形羅盤。指針總是指向東方的海。' },
};

// type: dmg (magic damage), heal, cure, revive, buff, sleep
export const SPELLS = {
  flame:     { name: '火焰', mp: 3, type: 'dmg', el: 'fire', power: 16, k: 1.3, target: 'enemy', fx: 'fire' },
  ice:       { name: '冰刃', mp: 4, type: 'dmg', el: 'ice', power: 22, k: 1.35, target: 'enemy', fx: 'ice' },
  thunder:   { name: '雷擊', mp: 7, type: 'dmg', el: 'bolt', power: 18, k: 1.05, target: 'enemies', fx: 'bolt' },
  firestorm: { name: '烈焰風暴', mp: 14, type: 'dmg', el: 'fire', power: 36, k: 1.45, target: 'enemies', fx: 'fire' },
  sleep:     { name: '沉睡', mp: 4, type: 'sleep', target: 'enemies', fx: 'sleep' },
  holy:      { name: '光子箭', mp: 4, type: 'dmg', el: 'holy', power: 18, k: 1.2, target: 'enemy', fx: 'holy' },
  heal:      { name: '治癒', mp: 3, type: 'heal', power: 32, k: 2.0, target: 'ally', fx: 'heal' },
  healall:   { name: '群體治癒', mp: 10, type: 'heal', power: 26, k: 1.6, target: 'allies', fx: 'heal' },
  cure:      { name: '解毒', mp: 2, type: 'cure', target: 'ally', fx: 'heal' },
  revive:    { name: '復活', mp: 15, type: 'revive', target: 'dead', fx: 'heal' },
  shield:    { name: '守護', mp: 5, type: 'buff', stat: 'def', target: 'allies', fx: 'buff' },
  guard:     { name: '鐵壁', mp: 4, type: 'buff', stat: 'def', target: 'self', fx: 'buff' },
  roar:      { name: '怒吼', mp: 2, type: 'buff', stat: 'str', target: 'self', fx: 'buff' },
};
export const SPECIALS = {
  starblade: { name: '星芒斬', desc: '對一個敵人造成巨大傷害', target: 'enemy' },
  meteor:    { name: '流星雨', desc: '召喚流星轟擊所有敵人', target: 'enemies' },
  ironfall:  { name: '鐵山崩', desc: '劈開大地，攻擊所有敵人', target: 'enemies' },
  arklight:  { name: '方舟之光', desc: '全體回復並解除異常', target: 'allies' },
};

// art: key into ENEMY_ART; acts: weighted actions
export const ENEMIES = {
  jelly:     { name: '星凝膠', art: 'jelly', hp: 24, atk: 11, def: 3, int: 3, agi: 5, exp: 7, gold: 4, drop: ['herb', 0.15] },
  peckbird:  { name: '鐵喙鳥', art: 'bird', hp: 20, atk: 13, def: 2, int: 2, agi: 16, exp: 8, gold: 5 },
  hornhare:  { name: '角兔', art: 'hare', hp: 34, atk: 14, def: 6, int: 2, agi: 11, exp: 10, gold: 6, drop: ['herb', 0.1] },
  shroom:    { name: '隕孢菇', art: 'shroom', hp: 60, atk: 19, def: 10, int: 8, agi: 7, exp: 16, gold: 12, acts: [['atk', 3], ['spore', 1]], drop: ['antidote', 0.2] },
  redjelly:  { name: '熔核凝膠', art: 'redjelly', hp: 66, atk: 20, def: 8, int: 16, agi: 6, exp: 18, gold: 14, acts: [['atk', 2], ['ember', 1]] },
  bat:       { name: '回音蝙蝠', art: 'bat', hp: 50, atk: 24, def: 8, int: 6, agi: 20, exp: 16, gold: 10, acts: [['atk', 3], ['drain', 1]] },
  rockcrab:  { name: '隕殼蟹', art: 'crab', hp: 95, atk: 28, def: 26, int: 4, agi: 4, exp: 26, gold: 18, drop: ['herb', 0.2] },
  bones:     { name: '礦坑亡骸', art: 'bones', hp: 85, atk: 30, def: 14, int: 5, agi: 9, exp: 28, gold: 20, undead: true, weak: 'holy', drop: ['water', 0.12] },
  clawmaw:   { name: '機鉗蟹王', art: 'clawmaw', boss: true, hp: 1250, atk: 34, def: 18, int: 15, agi: 8, exp: 300, gold: 400, acts: [['atk', 3], ['twin', 2], ['bubble', 2], ['harden', 1]] },
  merrow:    { name: '方舟哨兵', art: 'drone', hp: 180, atk: 46, def: 30, int: 12, agi: 15, exp: 60, gold: 40, acts: [['atk', 4], ['twin', 1]], drop: ['hiherb', 0.1] },
  wisp:      { name: '電漿火', art: 'wisp', hp: 130, atk: 30, def: 22, int: 30, agi: 18, exp: 55, gold: 35, undead: true, weak: 'ice', resist: 'fire', acts: [['atk', 1], ['ember', 2]] },
  gargoyle:  { name: '守門石像', art: 'gargoyle', hp: 380, atk: 55, def: 50, int: 14, agi: 10, exp: 85, gold: 55, weak: 'bolt', drop: ['water', 0.15] },
  serpent:   { name: '鋼鱗海蛇', art: 'serpent', hp: 280, atk: 50, def: 34, int: 18, agi: 13, exp: 90, gold: 60, weak: 'bolt', acts: [['atk', 3], ['wave', 1]], drop: ['hiherb', 0.15] },
  seren:     { name: '鐵騎士', art: 'knight', boss: true, hp: 2900, atk: 48, def: 30, int: 25, agi: 22, exp: 900, gold: 1000, acts: [['atk', 2], ['icefang', 2], ['tide', 2], ['mist', 1], ['drain', 1]] },
  ordath:    { name: '方舟核心 伊吉斯', art: 'core', boss: true, hp: 3800, atk: 55, def: 36, int: 20, agi: 20, exp: 0, gold: 0, acts: [['atk', 2], ['twin', 2], ['tide', 2], ['abyss', 1], ['icefang', 1]] },
};
// enemy techniques
export const TECHS = {
  spore:   { name: '星孢子', kind: 'status', status: 'poison', target: 'one', fx: 'spore' },
  ember:   { name: '火球', kind: 'magic', power: 14, k: 1.0, el: 'fire', target: 'one', fx: 'fire' },
  drain:   { name: '吸能', kind: 'drain', power: 1.0, target: 'one', fx: 'drain' },
  twin:    { name: '連擊', kind: 'twin', target: 'one', fx: 'slash' },
  bubble:  { name: '高壓水砲', kind: 'magic', power: 18, k: 0.7, el: 'water', target: 'all', fx: 'bubble' },
  harden:  { name: '裝甲強化', kind: 'buff', stat: 'def', target: 'self', fx: 'buff' },
  wave:    { name: '鋼鱗浪', kind: 'magic', power: 26, k: 0.8, el: 'water', target: 'all', fx: 'bubble' },
  icefang: { name: '寒鐵斬', kind: 'magic', power: 44, k: 1.2, el: 'ice', target: 'one', fx: 'ice' },
  tide:    { name: '衝擊波', kind: 'magic', power: 30, k: 0.8, el: 'water', target: 'all', fx: 'bubble' },
  mist:    { name: '休眠訊號', kind: 'status', status: 'sleep', target: 'all', fx: 'sleep' },
  abyss:   { name: '重置光', kind: 'magic', power: 50, k: 1.0, el: 'dark', target: 'all', fx: 'abyss' },
};
// encounter tables: [weight, [enemy ids]]
export const GROUPS = {
  plains: [[4, ['jelly', 'jelly']], [3, ['peckbird']], [3, ['jelly', 'peckbird']], [2, ['hornhare']], [2, ['jelly', 'jelly', 'jelly']], [1, ['hornhare', 'jelly']]],
  north: [[3, ['shroom', 'jelly']], [3, ['hornhare', 'hornhare']], [2, ['redjelly']], [2, ['shroom', 'shroom']], [2, ['peckbird', 'peckbird', 'hornhare']], [1, ['redjelly', 'shroom']]],
  shore: [[3, ['redjelly', 'shroom']], [2, ['hornhare', 'redjelly']], [2, ['shroom', 'shroom', 'peckbird']]],
};
// the visible enemies in dungeons each carry their own group
export const TROOPS = {
  cbat: ['bat', 'bat'], cshroom: ['shroom', 'bat'], ccrab: ['rockcrab'], ccrab2: ['rockcrab', 'bat'], cbones: ['bones'], cbones2: ['bones', 'shroom'],
  tmerrow: ['merrow'], tmerrow2: ['merrow', 'wisp'], twisp: ['wisp', 'wisp'], tgarg: ['gargoyle'], tserp: ['serpent'], tmix: ['merrow', 'gargoyle'], twisp3: ['wisp', 'wisp', 'wisp'],
  boss1: ['clawmaw'], boss2: ['seren'], boss3: ['ordath'],
};
export const SHOPS = {
  items: ['herb', 'hiherb', 'water', 'antidote', 'plume', 'smoke'],
  arms: ['ironsword', 'steelsword', 'magerod', 'battleaxe', 'elfbow', 'leather', 'robe', 'chain', 'holyrobe'],
  armsEarly: ['ironsword', 'magerod', 'leather', 'robe'],
};

// ---------- English ----------
localize(HEROES, { kai: ['Kai', 'Cadet'], nia: ['Nia', 'Starcaster'], barton: ['Barton', 'Veteran'], io: ['Io', 'Starchild'] }, ['name', 'title']);
localize(ITEMS, {
  herb: ['Herb', 'Restores 45 HP'], hiherb: ['Hi-Herb', 'Restores 160 HP'], water: ['Star Water', 'Restores 20 MP'],
  antidote: ['Antidote', 'Cures poison'], plume: ['Comet Plume', 'Revives a fallen ally'], smoke: ['Smoke Bomb', 'Always escape a battle'],
  elixir: ['Elixir', 'Fully restores HP and MP'],
  shortsword: ['Short Sword'], ironsword: ['Iron Sword'], steelsword: ['Steel Sword'], tideblade: ["Leon's Sword"],
  oakrod: ['Birch Rod'], magerod: ['Star Rod'], starrod: ['Meteor Rod'], handaxe: ['Hand Axe'], battleaxe: ['Battle Axe'], titanaxe: ['Siege Axe'],
  shortbow: ['Short Bow'], elfbow: ['Light Bow'], cloth: ['Clothes'], leather: ['Leather'], robe: ['Robe'], chain: ['Plate Mail'],
  holyrobe: ['Star Robe'], mithril: ['Meteor Mail'], powerring: ['Power Ring'], wardcharm: ['Ward Charm'], galeboots: ['Gale Boots'],
  sageear: ['Star Earring'], tidekey: ["Father's Starwheel", 'A star-shaped compass left by your father. Its needle always points to the eastern sea.'],
});
localize(SPELLS, {
  flame: ['Flame'], ice: ['Ice Blade'], thunder: ['Thunder'], firestorm: ['Firestorm'], sleep: ['Sleep'], holy: ['Photon Arrow'],
  heal: ['Heal'], healall: ['Heal All'], cure: ['Cure'], revive: ['Revive'], shield: ['Shield'], guard: ['Iron Wall'], roar: ['Roar'],
});
localize(SPECIALS, {
  starblade: ['Starblade', 'Huge damage to one enemy'], meteor: ['Meteor Rain', 'Calls meteors down on all enemies'],
  ironfall: ['Ironfall', 'Splits the ground under all enemies'], arklight: ['Ark Light', 'Heals everyone and cures ailments'],
});
localize(ENEMIES, {
  jelly: ['Star Jelly'], peckbird: ['Ironbeak'], hornhare: ['Horn Hare'], shroom: ['Meteor Shroom'], redjelly: ['Magma Jelly'],
  bat: ['Echo Bat'], rockcrab: ['Starshell Crab'], bones: ['Mine Wraith'], clawmaw: ['Clawcrusher'], merrow: ['Ark Sentry'], wisp: ['Plasma Wisp'],
  gargoyle: ['Gate Golem'], serpent: ['Steelscale'], seren: ['Iron Knight'], ordath: ['Aegis, the Ark Core'],
});
localize(TECHS, {
  spore: ['Star Spore'], ember: ['Fireball'], drain: ['Drain'], twin: ['Double Hit'], bubble: ['Water Cannon'], harden: ['Armour Up'],
  wave: ['Steel Wave'], icefang: ['Coldsteel Cut'], tide: ['Shockwave'], mist: ['Sleep Signal'], abyss: ['Reset Light'],
});
