# 星墜地球記 · Earthfall Chronicle

An original top-down RPG in the style of the 16-bit console era, in Traditional Chinese and English. It plays in the browser at the old 256×224 resolution, scaled up with crisp pixels and optional scanlines.

**Play:** https://ywchen0711.github.io/earthfall/

## The story

Ten years ago, a star fell into the eastern sea. Leon, captain of the harbour watch, sailed out to see it and never came home.

Ten years later, on a night just like that one, the same light crosses the sky and falls into the old mine north of Starwatch Harbour. Iron monsters crawl out of the earth. Nia, a girl who has always heard the stars, hears a voice from inside the star: *"It's so cold... help me."*

Kai is Leon's son and a cadet of the watch. He sets out with Nia and his father's starwheel. In the mine they find Barton, the old soldier who rowed away the night Leon vanished and has carried that shame for ten years. Behind the iron crab that guards the pit they find Io, a girl from the star with no memory. All she knows is that she must stop the Ark.

The story runs in four movements:

- **起** The night the star falls, a promise to be home "before the porridge cools", and the girl in the star.
- **承** The mine, Barton's confession, and one warm night at Kai's table where Io learns what "warm" means.
- **轉** The Ark rises from the sea. As the party climbs, Io remembers where she came from. The Ark's guardian turns out to be someone Kai has been waiting for all his life.
- **合** The heart of the Ark, a farewell, and a morning.

The world, characters, story, art and music are all original.

## How it plays

- **Explore.**
  - Walk around the harbour and talk to everyone.
  - Rest at the inn, shop for gear, and save at the chapel or at a star crystal.
  - On the world map, monsters attack at random as you walk.
  - Your party walks in a line behind the leader.
- **Dungeon puzzles.**
  - Push stone blocks onto switches to open gates.
  - Fill pits with blocks to make a path across.
  - Step on switches to raise and lower coloured posts.
  - Slide across ice; you keep going until something stops you.
  - If a block gets stuck, a glowing stone in the room puts the blocks back.
- **Visible monsters.** In dungeons you can see the monsters, and they move one step each time you do. Touching one starts a fight.
- **Turn-based battles.**
  - You give every hero a command, then the round plays out in speed order.
  - Taking and landing hits fills a gauge for each hero. When it is full, they can use their special move: Starblade, Meteor Rain, Ironfall or Ark Light.
  - Some monsters are weak or resistant to certain elements.
  - Poison and sleep are status effects.
- **Enemies have fixed stats** and never scale with your level.

## Languages

The first time you play, the game picks the language your browser uses. You can switch at any time: choose **Language** on the title screen, or open the menu and go to **Config → Language**.

## Controls

| | Keyboard | Gamepad | Touch |
|---|---|---|---|
| Move | arrow keys / WASD | d-pad / stick | on-screen d-pad |
| Confirm, talk, check | Z / Enter / Space | A | A |
| Cancel, open the menu | X / Esc | B | B |
| Menu | C / Tab | Y / Start | MENU (選單) |

## How it looks and sounds

- Characters are hand-drawn 16×24 pixel sprites with four directions and walking frames.
- Monsters and props are painted from shaded shapes on limited colour ramps, then dithered and outlined.
- The title screen flies over the island with a Mode 7-style rotating ground plane, and battles open with a mosaic transition.
- The music is played by a small synthesizer built in code. It has its own main theme, a music-box theme for Io and a farewell piece.
- The Chinese text uses the Cubic 11 (俐方體11號) pixel font. It is free to use, and its license is in `fonts/`.

The engine, the pixel art style and the dungeon layouts are shared with [蒼潮魔塔傳 Spire of the Blue Tide](https://ywchen0711.github.io/spire-tide/).

## Files

- `js/story.js` holds all the dialogue and events.
- `js/main.js` runs the main loop, title screen, prologue, epilogue and credits.
- `js/field.js` handles walking, the trailing party, NPCs, chests, puzzles and visible monsters.
- `js/battle.js` contains battles, effects and backdrops.
- `js/rules.js` has the battle math. It has no drawing code, so it can be simulated in Node.
- `js/maps.js` holds every map, as rows of characters plus a legend.
- `js/data.js` holds heroes, items, spells, monsters and shops.
- `js/party.js` covers stats, levels, the inventory and saving.
- `js/menu.js` covers the field menu, equipment, status, shops and settings.
- `js/ui.js` has the dialogue boxes and list menus.
- `js/i18n.js` switches the language. Text is written as `L('中文', 'English')`.
- `js/gfx.js`, `js/sprites.js`, `js/enemies.js` and `js/tiles.js` draw the pixels, characters, monsters and terrain.
- `js/audio.js` is the synthesizer, sequencer, soundtrack and sound effects.

There is no build step. Open `index.html` through any static web server.
