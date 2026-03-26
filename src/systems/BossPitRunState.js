class BossPitRunState {
  constructor() {
    this.resetForFreshRun();
  }

  resetForFreshRun() {
    this.completed = {
      sector02Chamber02: false
    };
    this.rewardGranted = {
      sector02Chamber02: false
    };
  }

  hasSector02Chamber02BossPitCompleted() {
    return this.completed.sector02Chamber02;
  }

  hasSector02Chamber02BossPitRewardGranted() {
    return this.rewardGranted.sector02Chamber02;
  }

  markSector02Chamber02BossPitCompleted() {
    this.completed.sector02Chamber02 = true;
  }

  markSector02Chamber02BossPitRewardGranted() {
    this.rewardGranted.sector02Chamber02 = true;
  }
}

export const bossPitRunState = new BossPitRunState();
