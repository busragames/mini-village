// Day and night. One full day is 60 seconds, the last 20 are night.
class DayCycle {
  constructor() {
    this.length = 60;
    this.nightStart = 40;
    this.time = 0;
  }
  advance() { this.time = (this.time + 1) % this.length; }
  isNight() { return this.time >= this.nightStart; }
  secondsUntilChange() {
    return this.isNight() ? this.length - this.time : this.nightStart - this.time;
  }
}
