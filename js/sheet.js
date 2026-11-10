// Monster sprites by other pixel artists, shared under CC-BY 3.0 or CC0; CREDITS.md names them all.
// Each monster was cut out of its sheet, recoloured where needed and packed into assets/monsters.png.
// The boxes are [x, y, w, h, scale]: the scale is how big the sprite is drawn, in game pixels per
// sprite pixel. Below 1 the sprite is drawn with the real screen pixels, so it is smaller and finer.
import { canvas } from './gfx.js';

const ATLAS = { rat: [108, 119, 63, 55, 0.75], crow: [0, 0, 68, 118, 0.5], snapweed: [222, 184, 21, 25, 1.25], drone: [194, 184, 27, 26, 1.25], crystrat: [172, 119, 63, 55, 0.75], bat: [396, 119, 64, 38, 0.75], spark: [165, 184, 28, 27, 1], worm: [338, 119, 28, 45, 1.5], raider: [0, 119, 48, 64, 0.75], scrapper: [139, 184, 25, 28, 1.25], drone2: [244, 184, 28, 23, 1.25], neonking: [315, 0, 59, 91, 1.25], glasscrab: [0, 184, 55, 38, 0.75], sandeel: [367, 119, 28, 45, 1], crysgolem: [284, 119, 53, 52, 1], scorpion: [431, 0, 47, 65, 1.5], knightc: [49, 119, 58, 62, 0.75], angel: [375, 0, 55, 76, 0.75], bishop: [69, 0, 122, 103, 1], frostbeast: [56, 184, 82, 29, 0.75], ironwolf: [236, 119, 47, 55, 0.75], cradle: [192, 0, 122, 101, 1] };

// the module waits for the picture, so every monster is ready before the first battle
const img = new Image();
img.src = 'assets/monsters.png';
let ok = false;
try { await img.decode(); ok = true; } catch (err) { console.warn('monster sheet missing, using the drawn monsters', err); }

const cache = new Map();
export const hasSheet = (k) => ok && !!ATLAS[k];
function cut(k, fs) {
  const [x, y, w, h] = ATLAS[k], c = canvas(w, h);
  c.x.drawImage(img, x, y, w, h, 0, 0, w, h);
  c.fs = fs;
  return c;
}
export function sheetArt(k) {
  if (!cache.has(k)) cache.set(k, cut(k, ATLAS[k][4]));
  return cache.get(k);
}
// the one that walks around the map: the same picture, drawn about 22 game pixels tall
export function sheetMini(k) {
  const key = 'mini:' + k;
  if (!cache.has(key)) { const [, , w, h] = ATLAS[k]; cache.set(key, cut(k, Math.min(1, 22 / Math.max(w, h)))); }
  return cache.get(key);
}
