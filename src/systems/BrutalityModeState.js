const DEFAULT_RULES = {
  streakTriggerKills: 2,
  streakWindowMs: 5000,
  activeDurationMs: 20000,
  maxActivationsPerChamber: 2
};

export class BrutalityModeState {
  constructor(scene, config = {}) {
    this.scene = scene;
    this.rules = { ...DEFAULT_RULES, ...config };
    this.listeners = {
      activated: config.onActivated,
      ended: config.onEnded
    };
    this.resetForChamber();
  }

  resetForChamber() {
    this.streakKills = 0;
    this.streakWindowEndsAt = -Infinity;
    this.active = false;
    this.activeUntil = -Infinity;
    this.chamberActivations = 0;
  }

  update(time) {
    if (this.active && time >= this.activeUntil) {
      this.end(time);
    }

    if (!this.active && this.streakKills > 0 && time > this.streakWindowEndsAt) {
      this.resetStreak();
    }
  }

  registerBasicKill(time) {
    if (this.active || this.chamberActivations >= this.rules.maxActivationsPerChamber) {
      return;
    }

    if (this.streakKills <= 0 || time > this.streakWindowEndsAt) {
      this.streakKills = 1;
      this.streakWindowEndsAt = time + this.rules.streakWindowMs;
    } else {
      this.streakKills += 1;
      this.streakWindowEndsAt = time + this.rules.streakWindowMs;
    }

    if (this.streakKills >= this.rules.streakTriggerKills) {
      this.activate(time);
    }
  }

  activate(time) {
    if (this.active || this.chamberActivations >= this.rules.maxActivationsPerChamber) {
      return false;
    }

    this.active = true;
    this.activeUntil = time + this.rules.activeDurationMs;
    this.chamberActivations += 1;
    this.listeners.activated?.({ time, activeUntil: this.activeUntil, chamberActivations: this.chamberActivations });
    return true;
  }

  end(time) {
    if (!this.active) {
      return;
    }

    this.active = false;
    this.activeUntil = -Infinity;
    this.resetStreak();
    this.listeners.ended?.({ time, chamberActivations: this.chamberActivations });
  }

  resetStreak() {
    this.streakKills = 0;
    this.streakWindowEndsAt = -Infinity;
  }

  isActive() {
    return this.active;
  }
}
