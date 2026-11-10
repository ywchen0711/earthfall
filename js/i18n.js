// Language switching. Text is written in place as L('中文', 'English'); data tables get
// getters so .name and .desc follow the current language.

function initial() {
  try { const v = localStorage.getItem('earthfall-lang'); if (v === 'zh' || v === 'en') return v; } catch (e) { /* no storage */ }
  try { return /^zh/i.test(navigator.language) ? 'zh' : 'en'; } catch (e) { return 'zh'; }
}
export let LANG = initial();
const hooks = [];
export function onLang(f) { hooks.push(f); }
export function setLang(l) {
  LANG = l;
  try { localStorage.setItem('earthfall-lang', l); } catch (e) { /* private mode */ }
  try { document.documentElement.lang = l === 'en' ? 'en' : 'zh-Hant'; } catch (e) { /* node */ }
  for (const f of hooks) f(l);
}
export const isEn = () => LANG === 'en';
export const L = (zh, en) => (LANG === 'en' ? en : zh);

// table: { id: { name, desc, ... } }; en: { id: [name, desc] } or { id: { name, desc } }
export function localize(table, en, fields = ['name', 'desc']) {
  for (const [id, tr] of Object.entries(en)) {
    const o = table[id];
    if (!o) continue;
    const vals = Array.isArray(tr) ? Object.fromEntries(fields.map((f, i) => [f, tr[i]])) : tr;
    for (const [f, v] of Object.entries(vals)) {
      if (v === undefined) continue;
      const zh = o[f];
      Object.defineProperty(o, f, { get: () => (LANG === 'en' ? v : zh), enumerable: true, configurable: true });
    }
  }
}

// speaker names in dialogue
const NAMES = {
  朔: 'Saku', 蘭: 'Ran', 老齒輪: 'Old Gears', 露米: 'Lumi', 玲: 'Rei', 薇伊: 'Vey', 搖籃: 'Cradle', 哈爾艦長: 'Captain Hale', 工程師小野: 'Engineer Ono',
  泰絲婆婆: 'Granny Tess', 瑪格婆婆: 'Granny Mag', 教團騎士: 'Church Knight', 教團士兵: 'Church Soldier', 男孩: 'Boy', 小女孩: 'Girl', 拾荒者: 'Scavenger',
  廚娘: 'Cook', 守望者: 'Lookout', 臥鋪車長: 'Bunk Master', 議員: 'Councillor', 農夫: 'Farmer', 旅店老闆: 'Innkeeper', 販賣機器人: 'Vending Robot',
  白衣的修女: 'Sister in White', 霓虹巨像: 'Neon Colossus', 被關的孩子: 'Captive Child', 鐵之主教: 'The Iron Bishop', '？？？': '???', 店員: 'Clerk',
};
export const speaker = (n) => (n && LANG === 'en' ? NAMES[n] || n : n);
