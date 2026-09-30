# Whispering Grove

A small browser city-builder. Build an elf village along the river, plan where every building goes, and awaken the World Tree.
Made with plain HTML, CSS and JavaScript (no libraries, no build step).

**Play it:** (add your GitHub Pages link here)

## How to play
- Choose a building in the **Build** list, then click a tile on the map.
- **Placement matters:** Berry Groves next to the river and Woodcutter's Lodges next to the forest produce 50% more. Moon Wells give +25% to every building around them. The map shows the bonus before you build.
- **Day and night:** Moon Wells only collect moonlight at night.
- Elves eat berries. Build Treehouses so more elves can move in.
- Spend resources and moonlight on **Upgrades**.
- Follow the goals, react to random forest events, and plant the World Tree in the sacred glade to win.
- Progress is saved in your browser.

## Code structure
| File | Job |
|---|---|
| `js/building.js` | `Building` base class and subclasses (`ProducerBuilding`, `MoonWell`, `HousingBuilding`, `WorldTree`) using inheritance and overriding |
| `js/map.js` | `GridMap`: the tile grid, neighbours and placement bonuses |
| `js/daycycle.js` | `DayCycle`: day and night timing |
| `js/upgrades.js` | `Upgrade` and `UpgradeShop` |
| `js/events.js` | `GameEvent` and `EventManager` for random events |
| `js/quests.js` | `Quest` and `QuestLog`: goals that teach the game |
| `js/game.js` | `Game`: the rules (production, food, building, winning). No drawing code |
| `js/scene.js` | SVG drawings for terrain and buildings |
| `js/save.js` | `SaveManager`: save and load with localStorage |
| `js/main.js` | Draws the game on the page and handles clicks |

Game logic (`game.js` and the classes) is kept separate from drawing (`main.js`, `scene.js`).

## Concept art
See the `concept-art/` folder for the art direction, prompts and tools I used.

## How I used AI
(Write this in your own words: which parts AI helped with, what you changed or added yourself, and what you learned.)
