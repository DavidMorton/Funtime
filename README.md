# Pay Zone: A Peacemaker's Descent

A deckbuilding card game you play in your browser. You drill down through three acts of rock, one fight at a time. You beat each hazard in one of two ways: **plug** it with damage, or **reconcile** it with Harmony.

## How to play

Double-click `index.html`. That's it. No install and no build step.

If your browser blocks something when you open the file directly, you can run a small local server from this folder instead:

```
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## What's inside

- **Three acts:** Gulf Coast Sediments, The Salt Dome, and The Pay Zone. Each act has a boss at the bottom.
- **Four card families:**
  - **Drill** cards deal damage.
  - **Lakehouse** cards draw cards and give Energy.
  - **Craft** cards (crochet, drawing, architecture) give Block.
  - **Hymn** cards apply Harmony.
- **Ally cards:** An enemy you reconcile may offer to join your deck.
- **Companions:** At the start, pick the Loyal Mutt, the Orange Tabby, or the Guinea Pig Pair.
- **The local game store:** Buy single cards, open booster packs (with foils), or trade cards in.
- **The binder:** Every card you find is saved across runs. Try to collect them all.
- **Snacks:** Kolaches, cold brew, crawfish boil, and other one-use items that help in a pinch.
- **Hard hat stickers:** 20 achievements to earn across runs. You can see them in the binder.
- **Pressure levels:** Win a descent to unlock a harder difficulty. There are three levels.
- **Stories:** a 2 A.M. escalation, a Prairie School house tour, league night with your son, a Commander pod, a hurricane cone, formal night on a cruise, and more.
- **Music:** Ambient jazz is generated live in the browser. The top bar has buttons to turn the music and sound effects on or off.

## Controls

- Click a card to play it. If the card needs a target, click an enemy next.
- `1`–`0` play cards from your hand.
- `E` ends your turn.
- `Esc` or a right-click cancels targeting.

## Files

| Path | What it holds |
| --- | --- |
| `index.html` | The page |
| `css/style.css` | All styles |
| `js/data.js` | Cards, enemies, keepsakes, events |
| `js/audio.js` | Generated music and sound effects |
| `js/core.js` | Shared helpers, card rendering, saving |
| `js/combat.js` | The combat engine |
| `js/map.js` | Map generation and the descent screen |
| `js/screens.js` | Title, rewards, shop, packs, rest, events, binder, endings |
| `js/main.js` | Startup and keyboard input |

Your progress is saved in your browser's local storage. That includes the run in progress, your binder, and your lifetime stats.
