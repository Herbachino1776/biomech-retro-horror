const DEFAULT_MAX_INTEGRITY = 5;

const clampToWhole = (amount) => {
  const parsed = Number(amount);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.round(parsed));
};

class VesselIntegrityState {
  constructor() {
    this.maxIntegrity = DEFAULT_MAX_INTEGRITY;
    this.currentIntegrity = this.maxIntegrity;
  }

  getCurrentIntegrity() {
    return this.currentIntegrity;
  }

  getMaxIntegrity() {
    return this.maxIntegrity;
  }

  getIntegritySnapshot() {
    return {
      current: this.currentIntegrity,
      max: this.maxIntegrity
    };
  }

  damage(amount = 1) {
    const applied = clampToWhole(amount);
    if (applied <= 0) {
      return this.getIntegritySnapshot();
    }

    this.currentIntegrity = Math.max(0, this.currentIntegrity - applied);
    return this.getIntegritySnapshot();
  }

  heal(amount = 1) {
    const applied = clampToWhole(amount);
    if (applied <= 0) {
      return this.getIntegritySnapshot();
    }

    this.currentIntegrity = Math.min(this.maxIntegrity, this.currentIntegrity + applied);
    return this.getIntegritySnapshot();
  }

  partialRestore(amount = 1) {
    return this.heal(amount);
  }

  fullRestore() {
    this.currentIntegrity = this.maxIntegrity;
    return this.getIntegritySnapshot();
  }

  setMaxIntegrity(amount) {
    const nextMax = clampToWhole(amount);
    this.maxIntegrity = Math.max(1, nextMax);
    this.currentIntegrity = Math.min(this.currentIntegrity, this.maxIntegrity);
    return this.getIntegritySnapshot();
  }

  resetForFreshRun() {
    this.maxIntegrity = DEFAULT_MAX_INTEGRITY;
    this.currentIntegrity = this.maxIntegrity;
    return this.getIntegritySnapshot();
  }
}

export const vesselIntegrityState = new VesselIntegrityState();
