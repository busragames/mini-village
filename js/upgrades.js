// A one-time upgrade the player can buy
class Upgrade {
  constructor(id, name, description, cost, apply) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.cost = cost;
    this.apply = apply;   // function(game) that changes the game
    this.bought = false;
  }
}

class UpgradeShop {
  constructor() {
    this.upgrades = [
      new Upgrade("song", "Gathering Song", "Gathering gives 4 of each instead of 1.",
        { wood: 25, berries: 25 }, g => { g.gatherAmount = 4; }),
      new Upgrade("axes", "Elven Axes", "Woodcutter's Lodges work 50% faster.",
        { wood: 60, moonlight: 10 }, g => { g.multipliers.wood *= 1.5; }),
      new Upgrade("honey", "Honeyed Berries", "Berry Groves grow 50% more.",
        { berries: 60, moonlight: 10 }, g => { g.multipliers.berries *= 1.5; }),
      new Upgrade("branches", "Wide Branches", "Every Treehouse holds 2 more elves.",
        { wood: 80, moonlight: 20 }, g => { g.extraCapacity += 2; }),
      new Upgrade("starlight", "Starlit Wells", "Moon Wells collect twice as much moonlight.",
        { berries: 80, moonlight: 25 }, g => { g.multipliers.moonlight *= 2; })
    ];
  }
  get(id) { return this.upgrades.find(u => u.id === id); }
  boughtCount() { return this.upgrades.filter(u => u.bought).length; }
}
