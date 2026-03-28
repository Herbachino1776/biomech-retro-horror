class BossPitRunState {
  constructor() {
    this.resetForFreshRun();
  }

  resetForFreshRun() {
    this.completed = {
      sector02Chamber02: false,
      sector03Chamber01: false
    };
    this.rewardGranted = {
      sector02Chamber02: false,
      sector03Chamber01: false
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

  hasSector03Chamber01BossPitCompleted() {
    return this.completed.sector03Chamber01;
  }

  hasSector03Chamber01BossPitRewardGranted() {
    return this.rewardGranted.sector03Chamber01;
  }

  markSector03Chamber01BossPitCompleted() {
    this.completed.sector03Chamber01 = true;
  }

  markSector03Chamber01BossPitRewardGranted() {
    this.rewardGranted.sector03Chamber01 = true;
  }
}

export const bossPitRunState = new BossPitRunState();
