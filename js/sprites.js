// Hand-drawn 16x24 walking sprites. A sprite is a head (13 rows, by hair style) laid over a body
// (rows 11-23, by outfit), coloured from a per-character palette.
import { canvas, fromGrid, flipX, Painter, ramp } from './gfx.js';

// a half row mirrored into a full 16-pixel row
const M = (h) => { if (h.length !== 8) throw new Error('half ' + h); return h + [...h].reverse().join(''); };
const F = (r) => { r = r.replace(/\|/g, ''); if (r.length !== 16) throw new Error('row ' + r + ' ' + r.length); return r; };
const sym = (rows) => rows.map((r) => (r.replace(/\|/g, '').length === 8 ? M(r.replace(/\|/g, '')) : F(r)));
const full = (rows) => rows.map(F);

// ---------- heads: down, up, left; 13 rows each ----------
const FACE_D = [ // shared lower face for the front view; rows 7-12
  null, null, null, null, null, null, null,
  '.oHs|ssss', '.oHs|ssss', '.oHs|sess', '.oSs|sess', '..oS|sssm', '...o|oSSS',
];
const HEADS = {
  spiky: {
    d: sym(['....|...o', '...o|.oho', '..oh|ohhl', '..oh|hhll', '.ohh|hhhh', '.ohh|hhhh', 'ohhH|hhhH', 'ohHh|Hssh', ...FACE_D.slice(8)]),
    u: sym(['....|...o', '...o|.oho', '..oh|ohhl', '..oh|hhll', '.ohh|hhhh', '.ohh|hhhh', 'ohhH|hhhh', 'ohHh|hhhh', '.oHh|hhhH', '.oHH|hhhh', '.oSH|Hhhh', '..oS|HHHH', '...o|oSSS']),
    l: full(['....|..o.|o.o.|....', '....|oohoh|oho|o...', '...o|hhlh|hlhh|ho..', '..oh|hllh|hhhh|hhoo', '.ohh|hhhh|hhhh|hhho', 'ohhh|hhhh|hhhh|hHHo', 'ohhH|hhhh|hhhh|hHHo', 'oHhs|Hhhh|hhhh|HHo.', '.oHs|sshh|hhhH|HHo.', '.ose|sssS|hhhH|Ho..', '.ose|sssS|sHHH|Ho..', '..os|ssss|SHHH|o...', '...o|oSSS|Sooo|....']),
  },
  long: {
    d: sym(['....|.ooo', '...o|ohhh', '..oh|hlll', '.ohh|hlhh', '.ohh|hhhh', 'ohhh|hhhh', 'ohhH|hhhh', 'ohHh|Hhss', 'ohHs|ssss', 'ohHs|sess', 'oHHs|sess', 'oHHS|sssm', 'oHHo|oSSS']),
    u: sym(['....|.ooo', '...o|ohhh', '..oh|hlll', '.ohh|hlhh', '.ohh|hhhh', 'ohhh|hhhh', 'ohhh|hhhh', 'ohhH|hhhh', 'ohHh|hhhh', 'ohHh|hhhH', 'oHHh|hhhH', 'oHHH|hhHH', 'oHHH|HHHH']),
    l: full(['....|.ooo|oo..|....', '...o|ohhh|hhoo|....', '..oh|hlll|hhhh|o...', '.ohh|lhhh|hhhh|ho..', '.ohh|hhhh|hhhh|hho.', 'ohhh|hhhh|hhhh|hhho', 'ohHh|hhhh|hhhh|hHho', 'oHss|Hhhh|hhhh|hHHo', '.oss|sshh|hhhh|HHHo', '.ose|sssS|hhhh|HHHo', '.ose|sssS|hhhH|HHHo', '..os|ssss|HhHH|HHo.', '...o|oSSo|HHHH|Ho..']),
  },
  ponytail: {
    d: sym(['....|.ooo', '...o|ohhh', '..oh|hlll', '.ohh|lhhh', '.ohh|hhhh', 'ohhh|hhhh', 'ohhH|hhhh', 'ohHh|sHss', ...FACE_D.slice(8)]),
    u: full(['....|.ooo|ooo.|....', '...o|ohhh|hhho|o...', '..oh|hlll|lllh|ho..', '.ohh|lhhh|hhhl|hho.', '.ohh|hhhh|hhhh|hho.', 'ohhh|hhhh|hhhh|hhho', 'ohhh|hhaa|aahh|hhho', 'ohhH|hhhh|hhhh|Hhho', '.oHh|hhhl|lhhh|hHo.', '.oHH|hhhl|hhhh|HHo.', '.oSH|HhHh|hhHH|HSo.', '..oS|HHoh|hoHH|So..', '...o|oSoh|hoSo|o...']),
    l: full(['....|.ooo|oo..|....', '...o|ohhh|hhoo|....', '..oh|hlll|hhhh|o...', '.ohh|lhhh|hhhh|ho..', '.ohh|hhhh|hhhh|aao.', 'ohhh|hhhh|hhhh|aaho', 'ohHh|hhhh|hhhh|ohho', 'oHss|Hhhh|hhhh|ohhH', '.oss|sshh|hhhH|oohH', '.ose|sssS|hhHH|o.oH', '.ose|sssS|sHHo|..oH', '..os|ssss|SHHo|...o', '...o|oSSS|Sooo|....']),
  },
  bun: {
    d: sym(['....|..oo', '....|.ohl', '...o|oohh', '..oh|hlll', '.ohh|lhhh', '.ohh|hhhh', 'ohhH|hhhh', 'ohHh|sssh', ...FACE_D.slice(8)]),
    u: sym(['....|..oo', '....|.ohl', '...o|oohh', '..oh|hlll', '.ohh|lhhh', '.ohh|hhhh', 'ohhH|hhhh', 'ohHh|hhhh', '.oHh|hhhH', '.oHH|hhhh', '.oSH|Hhhh', '..oS|HHHH', '...o|oSSS']),
    l: full(['....|....|..oo|o...', '....|....|.ohl|ho..', '....|oooo|ohhh|o...', '...o|hlll|hhho|....', '..oh|lhhh|hhhh|o...', '.ohh|hhhh|hhhh|ho..', '.ohH|hhhh|hhhh|Hho.', '.oss|Hhhh|hhhh|HHo.', '.oss|sshh|hhhH|HHo.', '.ose|sssS|hhhH|Ho..', '.ose|sssS|sHHH|Ho..', '..os|ssss|SHHH|o...', '...o|oSSS|Sooo|....']),
  },
  bald: { // old man with a white beard
    d: sym(['....|....', '....|.ooo', '...o|osll', '..os|ssss', '.oss|ssss', '.oSs|ssss', 'ohhS|ssss', 'ohhS|ssss', '.ohS|SSss', '.ohs|sess', '.oSs|sess', '..ow|wwww', '..ow|wwww']),
    u: sym(['....|....', '....|.ooo', '...o|osll', '..os|ssss', '.oss|ssss', '.oSs|ssss', 'ohhS|ssss', 'ohhh|SSss', '.ohh|hhSS', '.ohh|hhhh', '.oSh|hhhh', '..oS|HHHH', '...o|oSSS']),
    l: full(['....|....|....|....', '....|.ooo|oo..|....', '...o|slls|ssoo|....', '..os|ssss|ssss|o...', '.oss|ssss|ssss|so..', '.oss|ssss|ssss|Sso.', '.oss|ssss|sssh|hho.', '.oss|ssSS|SShh|hho.', '.oss|ssSS|ssSh|hho.', '.ose|sssS|sssS|ho..', '.oww|wwss|ssSS|o...', 'owww|wwwS|SSoo|....', '.oww|wwwo|oo..|....']),
  },
  beard: { // Garo: shaved head, big red beard
    d: sym(['....|....', '....|.ooo', '...o|osll', '..os|ssss', '.oss|ssss', '.oSs|ssss', '.oSs|ssss', '.oSH|HHss', '.oSs|ssss', '.ohs|sess', 'ohhh|sehh', 'ohhh|hlhh', '.ohh|hhhh']),
    u: sym(['....|....', '....|.ooo', '...o|osll', '..os|ssss', '.oss|ssss', '.oSs|ssss', '.oSs|ssss', '.oSS|ssss', '.oSS|SSss', '.ohS|SSSS', 'ohhh|SSSS', 'ohhh|hhhh', '.ohh|hhhh']),
    l: full(['....|....|....|....', '....|.ooo|oo..|....', '...o|slls|ssoo|....', '..os|ssss|ssss|o...', '.oss|ssss|ssss|so..', '.oss|ssss|ssss|Sso.', '.oss|ssss|ssss|Sso.', '.oHH|ssSS|ssss|Sso.', '.oss|ssss|ssss|So..', '.ose|sssh|sssS|So..', '.ohh|hhhh|hSSS|o...', 'ohhh|lhhh|hhoo|....', '.ohh|hhhh|ho..|....']),
  },
  bandana: {
    d: sym(['....|....', '....|oooo', '...o|aaak', '..oa|aaak', '.oaa|aaaa', '.oAA|AAAA', 'ohhA|AAAA', 'ohhs|ssss', ...FACE_D.slice(8)]),
    u: sym(['....|....', '....|oooo', '...o|aaak', '..oa|aaak', '.oaa|aaaa', '.oAA|AAAA', 'ohhA|AAAA', 'ohhh|hhhh', '.oHh|hhhh', '.oHH|hhhh', '.oSH|Hhhh', '..oS|HHHH', '...o|oSSS']),
    l: full(['....|....|....|....', '....|oooo|oo..|....', '...o|aaak|kaoo|....', '..oa|aaak|aaaa|o...', '.oaa|aaaa|aaaa|ao..', '.oAA|AAAA|AAAA|Ao..', '.ohA|AAAA|AAAA|Aoao', '.oss|hhhh|hhhh|oaao', '.oss|sshh|hhhH|Hoao', '.ose|sssS|hhhH|Ho.o', '.ose|sssS|sHHH|Ho..', '..os|ssss|SHHH|o...', '...o|oSSS|Sooo|....']),
  },
  short: {
    d: sym(['....|....', '....|oooo', '...o|hhhh', '..oh|hlll', '.ohh|lhhh', '.ohh|hhhh', '.ohH|hhhh', '.oHh|Hhss', ...FACE_D.slice(8)]),
    u: sym(['....|....', '....|oooo', '...o|hhhh', '..oh|hlll', '.ohh|lhhh', '.ohh|hhhh', '.ohh|hhhh', '.oHh|hhhh', '.oHh|hhhH', '.oHH|hhhh', '.oSH|Hhhh', '..oS|HHHH', '...o|oSSS']),
    l: full(['....|....|....|....', '....|oooo|oo..|....', '...o|hhhh|hhoo|....', '..oh|hlll|hhhh|o...', '.ohh|lhhh|hhhh|ho..', '.ohh|hhhh|hhhh|hho.', '.ohH|hhhh|hhhh|hHo.', '.oss|Hhhh|hhhh|HHo.', '.oss|sshh|hhhH|HHo.', '.ose|sssS|hhhH|Ho..', '.ose|sssS|sHHH|Ho..', '..os|ssss|SHHH|o...', '...o|oSSS|Sooo|....']),
  },
  helmet: {
    d: sym(['....|....', '....|oooo', '...o|mmmw', '..om|mmmw', '.omm|mmmm', '.omm|mmmm', 'oMMM|MMMM', 'oMMs|ssss', ...FACE_D.slice(8)]),
    u: sym(['....|....', '....|oooo', '...o|mmmw', '..om|mmmw', '.omm|mmmm', '.omm|mmmm', 'oMMM|MMMM', 'oMMm|mmmm', '.oMm|mmmm', '.oMM|mmmm', '.oSM|MMMM', '..oS|SSSS', '...o|oSSS']),
    l: full(['....|....|....|....', '....|oooo|oo..|....', '...o|mmmw|wmoo|....', '..om|mmmw|mmmm|o...', '.omm|mmmm|mmmm|mo..', '.omm|mmmm|mmmm|Mo..', 'oMMM|MMMM|MMMM|MMo.', '.oss|MMmm|mmmm|MMo.', '.oss|ssMm|mmmM|MMo.', '.ose|sssS|MmmM|Mo..', '.ose|sssS|sMMM|Mo..', '..os|ssss|SSSS|o...', '...o|oSSS|Sooo|....']),
  },
  hood: {
    d: sym(['....|....', '....|oooo', '...o|cckk', '..oc|ckkk', '.occ|kkkk', '.ocC|cccc', 'ocCh|hhhh', 'ocCh|ssss', 'ocCs|ssss', 'ocCs|sess', 'oCCs|sess', 'oCCS|sssm', 'oCCo|oSSS']),
    u: sym(['....|....', '....|oooo', '...o|cckk', '..oc|ckkk', '.occ|kkkk', '.occ|cccc', 'occc|cccc', 'occC|cccc', 'occC|cccc', 'oCcC|cccC', 'oCCc|cccC', 'oCCC|ccCC', 'oCCC|CCCC']),
    l: full(['....|....|....|....', '....|oooo|oo..|....', '...o|cckk|kcoo|....', '..oc|ckkk|cccc|o...', '.occ|kkkk|cccc|co..', '.oCc|cccc|cccc|Cco.', 'oChh|hccc|cccc|CCo.', 'oCss|hccc|cccc|CCo.', '.oss|sscc|cccC|CCo.', '.ose|ssCc|cccC|CCo.', '.ose|ssCc|cCCC|CCo.', '..os|sssC|CCCC|Co..', '...o|oSSo|CCCC|o...']),
  },
  pigtails: {
    d: sym(['....|....', '....|oooo', '...o|hhhh', '..oh|hlll', '.ohh|lhhh', 'oohh|hhhh', 'ahhH|hhhh', 'ohHh|sHss', 'ohos|ssss', 'oo.o|sess', '...o|sess', '..oS|sssm', '...o|oSSS']),
    u: sym(['....|....', '....|oooo', '...o|hhhh', '..oh|hlll', '.ohh|lhhh', 'oohh|hhhh', 'ahhh|hhhh', 'ohhH|hhhh', 'oho.|hhhH', 'oo.H|hhhh', '..oH|Hhhh', '..oS|HHHH', '...o|oSSS']),
    l: full(['....|....|....|....', '....|oooo|oo..|....', '...o|hhhh|hhoo|....', '..oh|hlll|hhhh|o...', '.ohh|lhhh|hhhh|ho..', '.ohh|hhhh|hhhh|hhoo', '.ohH|hhhh|hhhh|hHah', '.oss|Hhhh|hhhh|HHoh', '.oss|sshh|hhhH|HHoh', '.ose|sssS|hhhH|Ho.o', '.ose|sssS|sHHH|Ho..', '..os|ssss|SHHH|o...', '...o|oSSS|Sooo|....']),
  },
};

// ---------- bodies: rows 11-23 (13 rows; the first two hide under the head) ----------
const LEGS_D = { // left foot forward / right foot forward for the front view
  stand: ['...o|ppPo|oPpp|o...', '...o|ppPo|oPpp|o...', '...o|bbBo|oBbb|o...', '...o|ooo.|.ooo|o...'],
  a: ['...o|ppPo|oPpp|o...', '...o|bbPo|oPpp|o...', '...o|bbBo|obbb|o...', '....|ooo.|oooo|....'],
};
const BODIES = {
  tunic: {
    d: [sym(['....|....', '....|....', '...o|oaaa', '..ok|caAA', '.okk|cccc', '.okC|cccc', '.osC|cccc', '.oso|bbab', '..oo|Cccc', '...o|Cccc']), LEGS_D],
    u: [sym(['....|....', '....|....', '...o|oSSS', '..ok|caaa', '.okk|cccc', '.okC|cccc', '.osC|cccc', '.oso|bbbb', '..oo|Cccc', '...o|Cccc']), LEGS_D],
    l: { // left view: stand, a, b
      top: full(['....|....|....|....', '....|....|....|....', '...o|aaaa|oo..|....', '..oa|aAck|kco.|....', '..oc|ccck|kcco|....', '..oc|cccC|kcCo|....', '..oc|cccs|sCCo|....', '..ob|bbbs|sbbo|....', '..oc|cccc|CCo.|....', '..oc|cccc|CCo.|....']),
      stand: full(['...o|ppPP|o...|....', '...o|ppPP|o...|....', '..ob|bbBB|o...|....', '..oo|oooo|....|....']),
      a: full(['..op|pooP|Po..|....', '.opp|o..o|PPo.|....', 'obbb|o..o|BBo.|....', 'oooo|....|ooo.|....']),
      b: full(['...o|pPPo|....|....', '...o|pPPo|....|....', '..ob|bBBo|....|....', '..oo|ooo.|....|....']),
    },
  },
  robe: {
    d: [sym(['....|....', '....|....', '...o|oaaa', '..ok|caAA', '.okk|cccc', '.okC|cccc', '.osC|cccc', '.oso|Ccab', '..oC|cccc', '..oC|cccc']), {
      stand: ['..oC|cccc|cccc|Co..', '.oCC|cccc|cccc|CCo.', '.oCC|cccC|Cccc|CCo.', '..oo|bboo|oobb|oo..'],
      a: ['..oC|cccc|cccc|Co..', '.oCC|cccc|cccc|CCo.', '.oCC|cccC|Cccc|CCo.', '..ob|bboo|oooo|oo..'],
    }],
    u: [sym(['....|....', '....|....', '...o|oSSS', '..ok|cccc', '.okk|cccc', '.okC|cccc', '.osC|cccc', '.oso|Cccc', '..oC|cccc', '..oC|cccc']), {
      stand: ['..oC|cccc|cccc|Co..', '.oCC|cccc|cccc|CCo.', '.oCC|cccC|Cccc|CCo.', '..oo|bboo|oobb|oo..'],
      a: ['..oC|cccc|cccc|Co..', '.oCC|cccc|cccc|CCo.', '.oCC|cccC|Cccc|CCo.', '..ob|bboo|oooo|oo..'],
    }],
    l: {
      top: full(['....|....|....|....', '....|....|....|....', '...o|aaaa|oo..|....', '..oa|aAck|kco.|....', '..oc|ccck|kcco|....', '..oc|cccC|kcCo|....', '..oc|cccs|sCCo|....', '..oc|cccs|sCCo|....', '..oc|cccc|CCo.|....', '..oc|cccc|CCCo|....']),
      stand: full(['..oc|cccc|CCCo|....', '.occ|cccc|CCCo|....', '.occ|cccc|cCCC|o...', '..ob|bbBo|ooo.|....']),
      a: full(['..oc|cccc|CCCo|....', '.occ|cccc|cCCC|o...', 'occc|cccc|ccCC|o...', '.obb|o.oo|BBo.|....']),
      b: full(['..oc|cccc|CCCo|....', '.occ|cccc|CCCo|....', '.occ|cccc|cCCo|....', '..ob|bBoo|o...|....']),
    },
  },
  heavy: {
    d: [sym(['....|....', '....|....', '..oo|kkkk', '.okk|kkcc', 'okkk|cccc', 'okkC|cccc', 'osCC|cccc', 'osso|aaAa', '.ooC|Cccc', '..oC|Cccc']), {
      stand: ['..oP|ppPo|oPpp|Po..', '..oP|ppPo|oPpp|Po..', '..ob|bbBo|oBbb|bo..', '..oo|ooo.|.ooo|oo..'],
      a: ['..oP|ppPo|oPpp|Po..', '..ob|bbPo|oPpp|Po..', '..ob|bbBo|obbb|bo..', '...o|ooo.|oooo|o...'],
    }],
    u: [sym(['....|....', '....|....', '..oo|SSSS', '.okk|kkkk', 'okkk|cccc', 'okkC|cccc', 'osCC|cccc', 'osso|aaaa', '.ooC|Cccc', '..oC|Cccc']), {
      stand: ['..oP|ppPo|oPpp|Po..', '..oP|ppPo|oPpp|Po..', '..ob|bbBo|oBbb|bo..', '..oo|ooo.|.ooo|oo..'],
      a: ['..oP|ppPo|oPpp|Po..', '..ob|bbPo|oPpp|Po..', '..ob|bbBo|obbb|bo..', '...o|ooo.|oooo|o...'],
    }],
    l: {
      top: full(['....|....|....|....', '....|....|....|....', '..ok|kkkk|kooo|....', '.okk|kkck|kkkk|o...', '.okc|ccck|kkcC|o...', '.okc|cccC|kkCC|o...', '.okc|cccs|ssCC|o...', '.oaa|aaas|ssaa|o...', '.ocC|cccc|CCCo|....', '.ocC|cccc|CCCo|....']),
      stand: full(['..oP|ppPP|Po..|....', '..oP|ppPP|Po..|....', '.obb|bbBB|Bo..|....', '.ooo|oooo|o...|....']),
      a: full(['.oPp|pooP|PPo.|....', 'oPpp|o..o|PPPo|....', 'obbb|o..o|BBBo|....', 'oooo|....|oooo|....']),
      b: full(['..oP|pPPP|o...|....', '..oP|pPPP|o...|....', '..ob|bBBB|o...|....', '..oo|oooo|....|....']),
    },
  },
};

// ---------- characters ----------
const SKIN = { s: '#f8c898', S: '#d08868', m: '#c06858', e: '#281830', o: '#20101c', w: '#f0f0f8' };
export const CHARS = {
  saku:    { head: 'spiky', body: 'tunic', pal: { h: '#3a3a48', H: '#22222c', l: '#5a5a70', c: '#c86a28', C: '#8a4418', k: '#f0c060', a: '#58a8d8', A: '#2a6890', p: '#4a5868', P: '#2e3844', b: '#4a3a28', B: '#2a2014' } },
  ran:     { head: 'bun', body: 'tunic', pal: { h: '#d85048', H: '#902830', l: '#f88870', c: '#e8c048', C: '#a88020', k: '#5a5a68', a: '#3a3a48', A: '#22222c', p: '#3a4a68', P: '#222e44', b: '#5a3a20', B: '#3a2410' } },
  gears:   { head: 'beard', body: 'heavy', pal: { h: '#b8b8c0', H: '#80808a', l: '#e8e8f0', c: '#5a6a48', C: '#3a4830', k: '#a08850', a: '#c09040', A: '#806020', p: '#4a4038', P: '#2e2620', b: '#3a2818', B: '#22160c', s: '#d8a070', S: '#a87048' } },
  rei:     { head: 'long', body: 'robe', pal: { h: '#2a2a38', H: '#16161e', l: '#4a4a60', c: '#e8ecf4', C: '#a8b0c8', k: '#58c8e8', a: '#58c8e8', A: '#2a88a8', b: '#5a6070', B: '#363a48' } },
  vey:     { head: 'hood', body: 'robe', pal: { h: '#d85048', H: '#902830', l: '#f88870', c: '#c8c8d0', C: '#80808c', k: '#f0f0f8', a: '#8a2030', A: '#5a1018', b: '#404048', B: '#24242a' } },
  hale:    { head: 'short', body: 'heavy', pal: { h: '#a0a0a8', H: '#686870', l: '#d0d0d8', c: '#2a3a68', C: '#182448', k: '#f0c040', a: '#f0c040', A: '#a08020', p: '#2a3448', P: '#182030', b: '#202430', B: '#12141c', s: '#c89070', S: '#986048' } },
  ono:     { head: 'bandana', body: 'tunic', pal: { h: '#3a2818', H: '#22160c', l: '#5a4028', c: '#e0a030', C: '#a06818', k: '#f0e0b0', a: '#4888c8', A: '#2a5890', p: '#3a4a5a', P: '#22303c', b: '#3a3a44', B: '#22222a' } },
  cknight: { head: 'helmet', body: 'heavy', pal: { h: '#8a8a94', H: '#55555e', l: '#c0c0c8', m: '#9a9aa4', M: '#5a5a64', c: '#8a2030', C: '#5a1018', k: '#e0d0a0', a: '#e0d0a0', A: '#a08850', p: '#3a3a42', P: '#22222a', b: '#2a2a30', B: '#16161a' } },
  sister:  { head: 'hood', body: 'robe', pal: { h: '#e0d0b0', H: '#a89070', l: '#fff0d0', c: '#707078', C: '#46464e', k: '#c8c8d0', a: '#8a2030', A: '#5a1018', b: '#303036', B: '#1c1c20' } },
  mom:     { head: 'bun', body: 'robe', pal: { h: '#784828', H: '#4a2810', l: '#a87048', c: '#c06878', C: '#884050', k: '#e898a0', a: '#f0e8d0', A: '#c0b090', b: '#604030', B: '#402010' } },
  elder:   { head: 'bald', body: 'robe', pal: { h: '#d8d8d8', H: '#a0a0a8', l: '#ffffff', c: '#7858a8', C: '#503878', k: '#a888d0', a: '#e0c060', A: '#a08030', b: '#604030', B: '#402010' } },
  sailor:  { head: 'bandana', body: 'tunic', pal: { h: '#583820', H: '#382010', l: '#805838', c: '#f0f0f0', C: '#a8b0c8', k: '#ffffff', a: '#d03838', A: '#902020', p: '#3858a8', P: '#203878', b: '#604020', B: '#402010', s: '#e0a070', S: '#b07048' } },
  merchant:{ head: 'short', body: 'heavy', pal: { h: '#986830', H: '#684018', l: '#c09050', c: '#b07838', C: '#784818', k: '#e8d8b0', a: '#486838', A: '#284818', p: '#584030', P: '#382010', b: '#503020', B: '#301808' } },
  guard:   { head: 'helmet', body: 'tunic', pal: { h: '#a0a0a8', H: '#606068', l: '#ffffff', m: '#b8c0d0', M: '#707890', c: '#a03030', C: '#681818', k: '#b8c0d0', a: '#d8b040', A: '#987018', p: '#505868', P: '#303848', b: '#584030', B: '#382010' } },
  nun:     { head: 'hood', body: 'robe', pal: { h: '#e8d098', H: '#b09060', l: '#fff0c0', c: '#283048', C: '#141828', k: '#485878', a: '#f0f0f0', A: '#b0b0c0', b: '#302018', B: '#201008' } },
  girl:    { head: 'pigtails', body: 'robe', pal: { h: '#e8a830', H: '#b07010', l: '#ffd870', c: '#e87898', C: '#b04868', k: '#ffb0c8', a: '#ffffff', A: '#c0c0d0', b: '#a05030', B: '#703018' } },
  boy:     { head: 'short', body: 'tunic', pal: { h: '#402818', H: '#281408', l: '#684830', c: '#58a038', C: '#386820', k: '#90d068', a: '#e8c048', A: '#a88018', p: '#806040', P: '#584028', b: '#704828', B: '#482810' } },
  fisher:  { head: 'bald', body: 'heavy', pal: { h: '#c8c8c8', H: '#909098', l: '#f0f0f0', c: '#4870a0', C: '#284870', k: '#88a8d0', a: '#806040', A: '#584020', p: '#585048', P: '#383028', b: '#403020', B: '#281808', s: '#e0a070', S: '#b07048' } },
  leon:    { head: 'helmet', body: 'heavy', pal: { h: '#505868', H: '#303440', l: '#8890a0', m: '#5a6070', M: '#353a48', c: '#4a5060', C: '#2a2e3a', k: '#60e8f0', a: '#60e8f0', A: '#2088a8', p: '#3a3e4a', P: '#22252e', b: '#2a2a30', B: '#18181c', s: '#d8b090', S: '#a87858' } },
  herald:  { head: 'long', body: 'robe', pal: { h: '#f0f0f8', H: '#9098b0', l: '#ffffff', c: '#2a2a3a', C: '#16161e', k: '#e83050', a: '#e83050', A: '#901830', b: '#202028', B: '#101014', s: '#d8dce8', S: '#9098b0', e: '#e83050', m: '#9098b0' } },
};

const cache = new Map();
function build(name) {
  const C = CHARS[name], pal = { ...SKIN, ...C.pal };
  pal.H = pal.H || pal.h; pal.l = pal.l || pal.h;
  for (const k of 'mMwkaApPbB') if (!(k in pal)) pal[k] = pal.c || '#888888';
  const head = HEADS[C.head], body = BODIES[C.body];
  const frames = {};
  const make = (headRows, bodyRows) => {
    const c = canvas(16, 24);
    fromGrid(bodyRows, pal, c, 0, 11);
    // the head goes over the body, skipping its clear pixels
    fromGrid(headRows, pal, c, 0, 0);
    return c;
  };
  for (const dir of ['d', 'u']) {
    const [top, legs] = body[dir];
    const st = [...top, ...full(legs.stand)], a = [...top, ...full(legs.a)];
    const aMir = [...top, ...full(legs.a).map((r) => [...r].reverse().join(''))];
    frames[dir] = [make(head[dir], st), make(head[dir], a), make(head[dir], st), make(head[dir], aMir)];
  }
  const L = body.l;
  frames.l = [make(head.l, [...L.top, ...L.stand]), make(head.l, [...L.top, ...L.a]), make(head.l, [...L.top, ...L.stand]), make(head.l, [...L.top, ...L.b])];
  frames.r = frames.l.map(flipX);
  return frames;
}
// frames[dir][0..3]; dir is d, u, l or r
// Lumi: a round seed-keeper robot that floats, with a screen face and a sprout on top
function buildLumi() {
  const frame = (dir, k) => {
    const p = new Painter(16, 24), B = ramp('#e8ecf0', 5), G = ramp('#58c868', 5), F = ['#062a24', '#0a3a30', '#105040', '#186050'];
    const bob = [0, -1, 0, 1][k];
    p.ball(8, 14 + bob, 6.5, 6, B, { z: 2, spec: 0.6 });
    p.ball(8, 20 + bob, 3, 1.5, ramp('#a8b0c0', 4), { z: 1 });
    if (dir !== 'u') {
      const fx = dir === 'l' ? 6 : dir === 'r' ? 10 : 8;
      p.ball(fx, 13 + bob, 4, 3, F, { z: 8, amb: 0.9 });
      p.dots(dir === 'd' ? [[6, 12 + bob], [10, 12 + bob]] : [[fx - 1, 12 + bob], [fx + 1, 12 + bob]], '#60f8d0');
      if (dir === 'd') p.dots([[7, 14 + bob], [8, 15 + bob], [9, 14 + bob]], '#60f8d0');
    } else p.ball(8, 13 + bob, 3, 2, ramp('#c8ccd4', 4), { z: 8 });
    p.tube([[8, 8 + bob, 0.7, 6], [8, 4 + bob, 0.7, 6]], ramp('#3a8848', 4));
    p.poly([[8, 4 + bob], [3, 1 + bob], [5, 5 + bob]], G, { z: 9, lum: 0.7 }); p.poly([[8, 4 + bob], [13, 2 + bob], [11, 6 + bob]], G, { z: 9, lum: 0.6 });
    return p.finish({ out: '#18202a' });
  };
  const out = {};
  for (const d of ['d', 'u', 'l', 'r']) out[d] = [0, 1, 2, 3].map((k) => frame(d, k));
  return out;
}
export function sprite(name) {
  if (name === 'lumi') { let f = cache.get(name); if (!f) { f = buildLumi(); cache.set(name, f); } return f; }
  let f = cache.get(name);
  if (!f) { f = build(name); cache.set(name, f); }
  return f;
}
