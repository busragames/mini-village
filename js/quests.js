// One goal for the player, with a reward when it is done
class Quest {
  constructor(text, isDone, reward = {}) {
    this.text = text;
    this.isDone = isDone;   // function(game) -> true/false
    this.reward = reward;
  }
}

// The list of quests. They also teach the player how the game works.
class QuestLog {
  constructor() {
    const placed = (g, id) => g.map.placed(id);
    const nextTo = (g, tile, terrain) => g.map.neighbors(tile).some(n => n.terrain === terrain);

    this.quests = [
      new Quest("Plant a Berry Grove next to the river",
        g => placed(g, "grove").some(t => nextTo(g, t, "water")), { wood: 15 }),
      new Quest("Build a Woodcutter's Lodge next to the forest",
        g => placed(g, "lodge").some(t => nextTo(g, t, "forest")), { berries: 15 }),
      new Quest("Build a Treehouse for new elves",
        g => placed(g, "treehouse").length >= 1, { wood: 20, berries: 20 }),
      new Quest("Learn the Gathering Song",
        g => g.upgrades.get("song").bought, { wood: 20 }),
      new Quest("Grow your grove to 4 elves",
        g => g.resources.elves >= 4, { berries: 30 }),
      new Quest("Build a Moon Well",
        g => placed(g, "well").length >= 1, { wood: 40 }),
      new Quest("Collect 20 moonlight under the night sky",
        g => g.resources.moonlight >= 20, { berries: 50 }),
      new Quest("Buy 3 upgrades",
        g => g.upgrades.boughtCount() >= 3, { moonlight: 15 }),
      new Quest("Grow your grove to 20 elves",
        g => g.resources.elves >= 20, { wood: 100, berries: 100 }),
      new Quest("Plant the World Tree in the sacred glade",
        g => g.won)
    ];
    this.index = 0;
  }

  current() { return this.quests[this.index] || null; }

  update(game) {
    const quest = this.current();
    if (!quest || !quest.isDone(game)) return;
    for (const res in quest.reward) game.resources[res] += quest.reward[res];
    if (!game.won) game.message = "Quest complete: " + quest.text + ".";
    this.index++;
  }
}
