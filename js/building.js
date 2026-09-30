// A building type. "count" is how many of this building stand on the map.
class Building {
  constructor(options) {
    this.id = options.id;
    this.name = options.name;
    this.icon = options.icon;
    this.description = options.description;
    this.baseCost = options.baseCost;             // e.g. { wood: 12 }
    this.requiredElves = options.requiredElves || 0;
    this.maxCount = options.maxCount || Infinity;
    this.count = 0;
  }

  // Every new copy costs 50% more than the one before
  getCost() {
    const cost = {};
    for (const res in this.baseCost) {
      cost[res] = Math.ceil(this.baseCost[res] * Math.pow(1.5, this.count));
    }
    return cost;
  }

  isUnlocked(game) { return game.resources.elves >= this.requiredElves; }
  isMaxed() { return this.count >= this.maxCount; }

  // Most buildings need a free grass tile. Subclasses can change this rule.
  canPlaceOn(tile) { return tile.terrain === "grass" && !tile.building; }

  onPlace(game) {}
}

// Makes one resource every second
class ProducerBuilding extends Building {
  constructor(options) {
    super(options);
    this.resource = options.resource;
    this.perSecond = options.perSecond;
    this.bonusTerrain = options.bonusTerrain || null; // works better next to this terrain
  }

  isActive(game) { return true; }

  // How much one building standing on this tile makes per second
  productionAt(game, tile) {
    if (!this.isActive(game)) return 0;
    return this.perSecond * game.map.bonusAt(this, tile) * game.multipliers[this.resource];
  }
}

// A producer that only works at night
class MoonWell extends ProducerBuilding {
  isActive(game) { return game.day.isNight(); }
}

// Gives room for more elves
class HousingBuilding extends Building {
  constructor(options) {
    super(options);
    this.capacity = options.capacity;
  }
  getCapacity(game) { return this.capacity + game.extraCapacity; }
}

// The goal: only one, only in the sacred glade, and placing it wins the game
class WorldTree extends Building {
  constructor(options) {
    super(Object.assign({ maxCount: 1 }, options));
  }
  canPlaceOn(tile) { return tile.terrain === "glade" && !tile.building; }
  onPlace(game) { game.won = true; }
}
