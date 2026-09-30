// Connects the game to the page: draws everything and handles clicks.
const game = new Game();
const hadSave = SaveManager.load(game);

const RES_NAMES = { wood: "wood", berries: "berries", moonlight: "moonlight" };
const $ = id => document.getElementById(id);
let inspected = null;      // tile the player clicked to look at
let lastMapKey = "";
let lastElves = -1;
let introOpen = !hadSave;   // show the story the first time
let winOpen = game.won;     // true once the ending screen is showing
let winTimer = null;

function costText(cost) {
  return Object.entries(cost).map(([r, n]) => n + " " + RES_NAMES[r]).join(", ");
}

function formatRate(r) {
  return (r >= 0 ? "+" : "") + r.toFixed(1) + "/s";
}

// ---------- Map ----------
function renderMap() {
  const selected = game.getBuilding(game.selected);
  const key = game.map.tiles.map(t => t.building || "").join(",") + "|" + game.selected + "|" + game.day.isNight();
  if (key === lastMapKey) return;   // nothing changed, don't redraw
  lastMapKey = key;

  const mapEl = $("map");
  mapEl.classList.toggle("night", game.day.isNight());
  mapEl.classList.toggle("placing", !!selected);
  mapEl.innerHTML = "";

  for (const tile of game.map.tiles) {
    const button = document.createElement("button");
    button.className = "tile";
    const b = game.getBuilding(tile.building);
    button.setAttribute("aria-label", b ? b.name : tile.terrain);
    if (b && b.id === "worldtree") button.classList.add("tall");

    if (selected) {
      if (selected.canPlaceOn(tile)) {
        button.classList.add("can-place");
        if (selected instanceof ProducerBuilding) {
          const bonus = game.map.bonusAt(selected, tile);
          if (bonus > 1) {
            const badge = document.createElement("span");
            badge.className = "badge";
            badge.textContent = "+" + Math.round((bonus - 1) * 100) + "%";
            button.appendChild(badge);
          }
        }
      } else {
        button.classList.add("blocked");
      }
    }

    button.insertAdjacentHTML("afterbegin",
      `<svg viewBox="0 0 64 64" aria-hidden="true"><g class="ground">${Sprites.terrain(tile)}</g><g class="house">${Sprites.building(tile.building)}</g></svg>`);

    button.onclick = function () {
      if (game.selected) {
        game.place(tile);
        inspected = null;
      } else {
        inspected = tile;
      }
      update();
    };
    mapEl.appendChild(button);
  }
}

// Little glowing elves floating over the map
function renderWisps() {
  const count = Math.min(Math.floor(game.resources.elves), 20);
  if (count === lastElves) return;
  lastElves = count;
  const box = $("wisps");
  box.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const w = document.createElement("span");
    w.className = "wisp";
    w.style.left = (5 + Sprites.random(i + 1) * 90) + "%";
    w.style.top = (10 + Sprites.random(i + 50) * 80) + "%";
    w.style.animationDuration = (5 + Sprites.random(i + 90) * 6).toFixed(1) + "s";
    w.style.animationDelay = "-" + (i * 0.7).toFixed(1) + "s";
    box.appendChild(w);
  }
}

// Text under the map that explains what is going on
function renderInfo() {
  const selected = game.getBuilding(game.selected);
  let text;
  if (selected) {
    text = "Placing " + selected.name + " for " + costText(selected.getCost()) +
      ". Glowing tiles are free. Press Esc or click the building again to stop.";
  } else if (inspected && inspected.building) {
    const b = game.getBuilding(inspected.building);
    text = b.name + ": ";
    if (b instanceof ProducerBuilding) {
      const bonus = Math.round((game.map.bonusAt(b, inspected) - 1) * 100);
      text += (b.perSecond * game.map.bonusAt(b, inspected) * game.multipliers[b.resource]).toFixed(1) +
        " " + b.resource + " per second" + (bonus > 0 ? " (+" + bonus + "% bonus here)" : "") +
        (b instanceof MoonWell && !game.day.isNight() ? ", resting until night." : ".");
    } else if (b instanceof HousingBuilding) {
      text += "home for " + b.getCapacity(game) + " elves.";
    } else {
      text += "the heart of the forest.";
    }
  } else if (inspected) {
    const names = { grass: "Grass. You can build here.", forest: "Forest. Lodges next to it cut 50% more wood.",
      water: "River. Berry Groves next to it grow 50% more.", rock: "Rock. Nothing can be built here.",
      glade: "Sacred glade. Only the World Tree can grow here." };
    text = names[inspected.terrain];
  } else {
    text = "Choose a building from the Build list, then click a tile on the map.";
  }
  $("info").textContent = text;
}

// ---------- Build menu and upgrades (created once, updated every second) ----------
function createMenus() {
  for (const b of game.buildings) {
    const item = document.createElement("button");
    item.className = "build-item";
    item.id = "build-" + b.id;
    item.innerHTML = `<span class="b-icon">${b.icon}</span>
      <span class="b-text"><strong>${b.name}</strong><small>${b.description}</small><em></em></span>`;
    item.onclick = function () { game.select(b.id); inspected = null; update(); };
    $("build-list").appendChild(item);
  }
  for (const u of game.upgrades.upgrades) {
    const item = document.createElement("button");
    item.className = "upgrade-item";
    item.id = "upgrade-" + u.id;
    item.innerHTML = `<strong>${u.name}</strong><small>${u.description}</small><em></em>`;
    item.onclick = function () { game.buyUpgrade(u.id); update(); };
    $("upgrade-list").appendChild(item);
  }
}

function renderMenus() {
  for (const b of game.buildings) {
    const item = $("build-" + b.id);
    const line = item.querySelector("em");
    item.classList.toggle("selected", game.selected === b.id);
    if (b.isMaxed()) {
      line.textContent = "Built";
      item.disabled = true;
    } else if (!b.isUnlocked(game)) {
      line.textContent = "Needs " + b.requiredElves + " elves";
      item.disabled = true;
    } else {
      line.textContent = costText(b.getCost()) + (b.count ? "  (you have " + b.count + ")" : "");
      item.disabled = false;
      item.classList.toggle("short", !game.canAfford(b.getCost()));
    }
  }
  for (const u of game.upgrades.upgrades) {
    const item = $("upgrade-" + u.id);
    const line = item.querySelector("em");
    item.disabled = u.bought;
    item.classList.toggle("short", !u.bought && !game.canAfford(u.cost));
    line.textContent = u.bought ? "Learned" : costText(u.cost);
  }
}

// ---------- Everything ----------
function render() {
  for (const res of ["wood", "berries", "moonlight"]) {
    $(res).textContent = Math.floor(game.resources[res]);
    $("rate-" + res).textContent = formatRate(game.getRate(res));
  }
  $("elves").textContent = Math.floor(game.resources.elves);
  $("capacity").textContent = "room for " + game.getCapacity();

  const night = game.day.isNight();
  document.body.classList.toggle("is-night", night);
  $("daytime").textContent = (night ? "🌙 Night. Day comes in " : "☀️ Day. Night falls in ") +
    game.day.secondsUntilChange() + "s";

  const quest = game.quests.current();
  $("quest-step").textContent = quest ? "Goal " + (game.quests.index + 1) + " of " + game.quests.quests.length : "";
  $("quest-text").textContent = quest ? quest.text : "All goals complete";
  $("quest-reward").textContent = quest && Object.keys(quest.reward).length ? "Reward: " + costText(quest.reward) : "";

  $("gather").textContent = "Gather " + game.gatherAmount + " wood and " + game.gatherAmount + " berries";

  renderMap();
  renderWisps();
  renderInfo();
  renderMenus();

  $("message").textContent = game.message;
  renderEnding();
  $("intro").hidden = !introOpen;
  $("win").hidden = !winOpen;
}

// When the World Tree is planted: let it grow on the map first, then show the results
function renderEnding() {
  if (!game.won || winOpen || winTimer) return;
  document.querySelector(".map-frame").classList.add("awakening");
  winTimer = setTimeout(function () {
    winOpen = true;
    fillResults();
    render();
  }, 3200);
}

function fillResults() {
  const minutes = Math.floor(game.elapsed / 60);
  const seconds = game.elapsed % 60;
  const built = game.map.tiles.filter(t => t.building).length;
  const rows = [
    ["Time", minutes + " min " + seconds + " s"],
    ["Elves", Math.floor(game.resources.elves)],
    ["Buildings", built],
    ["Upgrades", game.upgrades.boughtCount() + " of " + game.upgrades.upgrades.length]
  ];
  $("results").innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
}

function update() {
  SaveManager.save(game);
  render();
}

function restart() {
  SaveManager.clear();
  game.reset();
  inspected = null;
  lastMapKey = "";
  lastElves = -1;
  winOpen = false;
  clearTimeout(winTimer);
  winTimer = null;
  document.querySelector(".map-frame").classList.remove("awakening");
  render();
}

function floatText(button, text) {
  const span = document.createElement("span");
  span.className = "float";
  span.textContent = text;
  span.style.left = (20 + Math.random() * 60) + "%";
  button.appendChild(span);
  setTimeout(() => span.remove(), 900);
}

$("gather").onclick = function () {
  game.gather();
  update();
  floatText(this, "+" + game.gatherAmount + " 🪵 +" + game.gatherAmount + " 🫐");
};
$("restart").onclick = restart;
$("start").onclick = function () { introOpen = false; render(); };
$("story").onclick = function () { introOpen = true; render(); };
$("reset").onclick = function () {
  if (confirm("Delete your progress and start over?")) restart();
};
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && game.selected) { game.selected = null; update(); }
});

createMenus();
// The game waits while the story screen is open
setInterval(function () {
  if (introOpen) return;
  game.tick();
  update();
}, 1000);

if (winOpen) fillResults();
render();
