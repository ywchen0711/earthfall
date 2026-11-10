# 星墜地球記 · Earthfall Chronicle

An original 16-bit style RPG set on a ruined Earth, in Traditional Chinese and English. It plays in the browser at the old 256×224 resolution with crisp pixels and optional scanlines.

**Play:** https://ywchen0711.github.io/earthfall/

## The story

**AD 2091.** Finis, an asteroid twelve kilometres wide, is about to hit the Earth. You begin aboard the orbital station Cradle as Dr. Rei, a botanist. With forty minutes left, she loads a seed of every plant on Earth into Lumi, a little seed-keeper robot built from the memories of her daughter Sora, who died at nine. She sends Lumi down in the station's last escape pod with one instruction: wake up when the sky is blue, and make the Earth a garden again.

**Three hundred years later**, the sky is still grey and nothing grows. Saku is a scavenger in Railtown, a town of people living in abandoned train carriages. The Iron Church, which worships the starstones the meteor left behind, demands a tithe the town cannot pay and threatens to take its children instead. To find old-world treasure, Saku dives into the pitch-dark Sunken Metro with his friend Ran, a mechanic. There they find the pod, and Lumi wakes up.

The journey runs in four movements:

- **起** The station's last forty minutes, Railtown's tithe, and the robot in the metro.
- **承** Lumi plants the first flower anyone at the Windfarm has seen in sixty years. In Neon City, Lumi learns she was made as a copy of a dead girl. Ran's sister turns up as a church inquisitor.
- **轉** The "god" of the Iron Cathedral turns out to be Cradle, the station's mind. Dr. Rei uploaded herself into it, and three hundred years alone have bent it.
- **合** At the Seed Vault in the frozen north, a mother and her second daughter meet again.

The world, characters, story and music are original. The monster sprites are by Antifarea, Redshrike, Blarumyrran, LordNeo and Balmer (CC-BY 3.0) and Atrus/Scrittl (CC0); see [CREDITS.md](CREDITS.md).

## How it plays

- **Conduit puzzles.** Ruins are powered by old conduits. Face a piece and press Z to turn it; when a line joins a generator to a receiver, the receiver lights and the doors it controls open. Some rooms need two lines lit at once.
- **Darkness.** The Sunken Metro is pitch black outside a small circle of light.
- **The Windfarm changes.** After Lumi's first sprout, the dead fields turn green and the turbines start turning again.
- **Battles.**
  - Turn-based, front view, with a command for each of the four heroes.
  - Each hero has a gauge that fills in battle; when it is full they can use a special move.
  - Gadgets and spells cost EP.
  - Monsters are 16-bit sprites by other pixel artists, drawn small and fine with your screen's real pixels. Their stats are fixed and never scale with your level.
- **The party:**
  - 朔 Saku, a scavenger with a blade;
  - 蘭 Ran, a mechanic with nail guns and gadget bombs;
  - 老齒輪 Old Gears, a church knight who deserted, with a hammer;
  - 露米 Lumi, a seed keeper who heals with light.

## Controls

| | Keyboard | Gamepad | Touch |
|---|---|---|---|
| Move | arrow keys / WASD | d-pad / stick | on-screen d-pad |
| Confirm, talk, turn a conduit | Z / Enter / Space | A | A |
| Cancel, open the menu | X / Esc | B | B |

Switch between Chinese and English on the title screen or in Config.

## Files

- `js/story.js` holds every scene and conversation.
- `js/maps.js` holds every place, from the station to the Seed Vault, and the conduit puzzles.
- `js/field.js` handles walking, conduits, gates and visible monsters.
- `js/sheet.js` cuts the monster sprites out of `assets/monsters.png`; `js/pixmon.js` keeps the older hand-drawn monsters as a fallback.
- `js/tiles.js` draws the station, ruins, rails, carriages and glass desert.
- `js/battle.js` and `js/rules.js` contain the battles and their maths.
- `js/data.js` holds the heroes, gear and monsters.
- `js/main.js` covers the title, the opening and the ending.
- `js/i18n.js` switches the language.

There is no build step. Open `index.html` through any static web server.
