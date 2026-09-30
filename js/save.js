// Saves and loads the game in the browser (localStorage)
class SaveManager {
  static KEY = "whispering-grove-save-v2";

  static save(game) {
    try {
      const data = {
        resources: game.resources,
        tiles: game.map.tiles.map(t => t.building),
        upgrades: game.upgrades.upgrades.filter(u => u.bought).map(u => u.id),
        quest: game.quests.index,
        time: game.day.time,
        elapsed: game.elapsed,
        won: game.won
      };
      localStorage.setItem(SaveManager.KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Could not save:", e);
    }
  }

  static load(game) {
    try {
      const raw = localStorage.getItem(SaveManager.KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      Object.assign(game.resources, data.resources);
      data.tiles.forEach((id, i) => {
        game.map.tiles[i].building = id;
        if (id) game.getBuilding(id).count++;
      });
      for (const id of data.upgrades) {
        const u = game.upgrades.get(id);
        u.bought = true;
        u.apply(game);
      }
      game.quests.index = data.quest || 0;
      game.day.time = data.time || 0;
      game.elapsed = data.elapsed || 0;
      game.won = data.won;
      game.message = "Welcome back to the grove.";
      return true;
    } catch (e) {
      console.warn("Could not load:", e);
      return false;
    }
  }

  static clear() {
    try { localStorage.removeItem(SaveManager.KEY); } catch (e) {}
  }
}
