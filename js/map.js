// The world: a grid of tiles. Each tile has a terrain and maybe a building.
class GridMap {
  // G = grass, F = forest, W = water, R = rock, * = sacred glade
  static LAYOUT = [
    "FFGGGGWFF",
    "FGGRGGWGF",
    "GGGG*GWGG",
    "WWGGGGWGR",
    "GWWGGWWGG",
    "FGWWWWGGF"
  ];
  static TERRAIN = { G: "grass", F: "forest", W: "water", R: "rock", "*": "glade" };

  constructor() {
    this.height = GridMap.LAYOUT.length;
    this.width = GridMap.LAYOUT[0].length;
    this.tiles = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const letter = GridMap.LAYOUT[y][x];
        this.tiles.push({ x: x, y: y, terrain: GridMap.TERRAIN[letter], building: null });
      }
    }
  }

  tile(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return null;
    return this.tiles[y * this.width + x];
  }

  // The 8 tiles around a tile
  neighbors(tile) {
    const result = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const t = this.tile(tile.x + dx, tile.y + dy);
        if (t) result.push(t);
      }
    }
    return result;
  }

  // Production multiplier for a building standing on this tile
  bonusAt(building, tile) {
    let bonus = 1;
    const around = this.neighbors(tile);
    if (building.bonusTerrain && around.some(t => t.terrain === building.bonusTerrain)) {
      bonus += 0.5;
    }
    if (building.id !== "well") {
      bonus += 0.25 * around.filter(t => t.building === "well").length;
    }
    return bonus;
  }

  placed(id) { return this.tiles.filter(t => t.building === id); }
}
