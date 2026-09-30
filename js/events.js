// A random event with a message and an effect on the game
class GameEvent {
  constructor(text, effect) {
    this.text = text;
    this.effect = effect;
  }
  trigger(game) {
    this.effect(game);
    return this.text;
  }
}

// Decides when the next random event happens
class EventManager {
  constructor() {
    this.events = [
      new GameEvent("A forest spirit leaves a gift: +30 wood, +30 berries.", g => {
        g.resources.wood += 30; g.resources.berries += 30;
      }),
      new GameEvent("Fireflies light up the river: +10 moonlight.", g => {
        g.resources.moonlight += 10;
      }),
      new GameEvent("A storm breaks some branches: you lose 20% of your wood.", g => {
        g.resources.wood = Math.floor(g.resources.wood * 0.8);
      }),
      new GameEvent("A wandering elf asks to join your grove.", g => {
        if (g.resources.elves < g.getCapacity()) g.resources.elves += 1;
      })
    ];
    this.countdown = this.nextDelay();
  }

  nextDelay() { return 30 + Math.floor(Math.random() * 25); } // 30-54 seconds

  update(game) {
    this.countdown--;
    if (this.countdown <= 0) {
      const event = this.events[Math.floor(Math.random() * this.events.length)];
      game.message = event.trigger(game);
      this.countdown = this.nextDelay();
    }
  }
}
