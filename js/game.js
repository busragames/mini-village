// The game rules. No drawing here, only logic.
class Game {
  constructor() {
    this.reset();
  }

  reset() {
    this.resources = { wood: 30, berries: 30, moonlight: 0, elves: 1 };
    this.multipliers = { wood: 1, berries: 1, moonlight: 1 };
    this.gatherAmount = 1;
    this.extraCapacity = 0;
    this.baseCapacity = 2;
    this.eatPerElf = 0.12;   // berries one elf eats per second
    this.growthRate = 0.2;   // new elves per second when there is room and food
    this.won = false;
    this.elapsed = 0;        // seconds played
    this.selected = null;    // id of the building the player is placing
    this.message = "Pick a Berry Grove from the Build list, then click grass next to the river.";

    this.map = new GridMap();
    this.day = new DayCycle();
    this.events = new EventManager();
    this.upgrades = new UpgradeShop();
    this.quests = new QuestLog();

    // Tip: change numbers here to balance the game
    this.buildings = [
      new ProducerBuilding({ id: "grove", name: "Berry Grove", icon: "🫐",
        description: "Grows berries. +50% next to water.",
        baseCost: { wood: 12 }, resource: "berries", perSecond: 0.6, bonusTerrain: "water" }),
      new ProducerBuilding({ id: "lodge", name: "Woodcutter's Lodge", icon: "🪵",
        description: "Cuts wood. +50% next to forest.",
        baseCost: { berries: 12 }, resource: "wood", perSecond: 0.6, bonusTerrain: "forest" }),
      new HousingBuilding({ id: "treehouse", name: "Treehouse", icon: "🏡",
        description: "A home for 3 elves.",
        baseCost: { wood: 25, berries: 20 }, capacity: 3 }),
      new MoonWell({ id: "well", name: "Moon Well", icon: "🌙",
        description: "Collects moonlight at night. Buildings around it +25%.",
        baseCost: { wood: 60, berries: 50 }, resource: "moonlight", perSecond: 0.6, requiredElves: 4 }),
      new WorldTree({ id: "worldtree", name: "World Tree", icon: "🌳",
        description: "Plant it in the sacred glade to win.",
        baseCost: { wood: 2000, berries: 1500, moonlight: 250 }, requiredElves: 20 })
    ];
  }

  getBuilding(id) { return this.buildings.find(b => b.id === id); }

  getCapacity() {
    let total = this.baseCapacity;
    for (const tile of this.map.tiles) {
      const b = this.getBuilding(tile.building);
      if (b instanceof HousingBuilding) total += b.getCapacity(this);
    }
    return total;
  }

  // What the building on this tile makes per second (0 if nothing)
  tileProduction(tile) {
    const b = this.getBuilding(tile.building);
    if (!(b instanceof ProducerBuilding)) return 0;
    return b.productionAt(this, tile);
  }

  // Net income per second for one resource
  getRate(resource) {
    let rate = 0;
    for (const tile of this.map.tiles) {
      const b = this.getBuilding(tile.building);
      if (b instanceof ProducerBuilding && b.resource === resource) rate += this.tileProduction(tile);
    }
    if (resource === "berries") rate -= this.resources.elves * this.eatPerElf;
    return rate;
  }

  // Runs once per second
  tick() {
    if (this.won) return;
    this.elapsed++;
    this.day.advance();

    for (const tile of this.map.tiles) {
      const b = this.getBuilding(tile.building);
      if (b instanceof ProducerBuilding) this.resources[b.resource] += this.tileProduction(tile);
    }

    const eaten = this.resources.elves * this.eatPerElf;
    if (this.resources.berries >= eaten) {
      this.resources.berries -= eaten;
      if (this.resources.elves < this.getCapacity() && this.resources.berries > 10) {
        this.resources.elves = Math.min(this.getCapacity(), this.resources.elves + this.growthRate);
      }
    } else {
      this.resources.berries = 0;
      this.resources.elves = Math.max(1, this.resources.elves - 0.1);
      this.message = "Your elves are hungry! Plant more Berry Groves.";
    }

    this.events.update(this);
    this.quests.update(this);
  }

  gather() {
    if (this.won) return;
    this.resources.wood += this.gatherAmount;
    this.resources.berries += this.gatherAmount;
  }

  canAfford(cost) {
    for (const res in cost) {
      if (this.resources[res] < cost[res]) return false;
    }
    return true;
  }

  pay(cost) {
    for (const res in cost) this.resources[res] -= cost[res];
  }

  // Choose a building to place (click again to cancel)
  select(id) {
    this.selected = this.selected === id ? null : id;
  }

  // Try to build the selected building on a tile. Returns true if it worked.
  place(tile) {
    const b = this.getBuilding(this.selected);
    if (!b || this.won) return false;
    if (!b.isUnlocked(this) || b.isMaxed()) return false;
    if (!b.canPlaceOn(tile)) {
      this.message = b.id === "worldtree"
        ? "The World Tree can only grow in the sacred glade."
        : "Build on a free grass tile.";
      return false;
    }
    const cost = b.getCost();
    if (!this.canAfford(cost)) {
      this.message = "Not enough resources for a " + b.name + ".";
      return false;
    }
    this.pay(cost);
    tile.building = b.id;
    b.count++;
    b.onPlace(this);
    this.message = b.name + " built.";
    if (b.isMaxed()) this.selected = null;
    this.quests.update(this);
    return true;
  }

  buyUpgrade(id) {
    const u = this.upgrades.get(id);
    if (!u || u.bought) return;
    if (!this.canAfford(u.cost)) {
      this.message = "Not enough resources for " + u.name + ".";
      return;
    }
    this.pay(u.cost);
    u.bought = true;
    u.apply(this);
    this.message = "Learned " + u.name + ".";
    this.quests.update(this);
  }
}
