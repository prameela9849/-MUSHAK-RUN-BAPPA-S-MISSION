// ==========================================================================
// MUSHAK RUN: BAPPA'S MISSION - SCORE SYSTEM
// Real calculated score and distance based strictly on physical gameplay
// ==========================================================================

export class ScoreSystem {
  constructor() {
    this.reset();
  }

  reset() {
    this.distance = 0;          // Physical distance in meters
    this.score = 0;             // Calculated total score
    this.collectiblesCount = 0; // Number of themed items collected
    this.multiplier = 1;        // Active score multiplier (e.g. 2x during Blessing)
    this.bonusPoints = 0;       // Bonus points from special actions/powerups
  }

  // Update distance based on delta and runner speed
  updateDistance(speed, delta) {
    // 1 world unit = approx 1 meter
    const metersTravelled = speed * delta;
    this.distance += metersTravelled;
    this.recalculateScore();
  }

  addCollectible(points = 100) {
    this.collectiblesCount += 1;
    this.bonusPoints += points * this.multiplier;
    this.recalculateScore();
  }

  addBonusPoints(points) {
    this.bonusPoints += points * this.multiplier;
    this.recalculateScore();
  }

  setMultiplier(mult) {
    this.multiplier = mult;
    this.recalculateScore();
  }

  recalculateScore() {
    // Real score = (distance in meters * 10) + bonus points from collectibles/powerups
    const distPoints = Math.floor(this.distance * 10);
    this.score = distPoints + this.bonusPoints;
  }

  getFormattedDistance() {
    return `${Math.floor(this.distance)} m`;
  }

  getStats() {
    return {
      score: this.score,
      distance: Math.floor(this.distance),
      collectiblesCount: this.collectiblesCount,
      multiplier: this.multiplier
    };
  }
}

export const scoreSystem = new ScoreSystem();
