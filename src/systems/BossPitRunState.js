class BossPitRunState {
  constructor() {
    this.resetForFreshRun();
  }

  resetForFreshRun() {
    this.completed = {
      sector02Chamber02: false,
      sector03Chamber01: false,
      sector03Chamber02Pit02: false,
      sector03Chamber02Pit03: false
    };
    this.rewardGranted = {
      sector02Chamber02: false,
      sector03Chamber01: false,
      sector03Chamber02Pit02: false,
      sector03Chamber02Pit03: false
    };
    this.sector03Chamber02EncounterState = null;
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

  hasSector03Chamber02Pit02BossPitCompleted() {
    return this.completed.sector03Chamber02Pit02;
  }

  hasSector03Chamber02Pit02BossPitRewardGranted() {
    return this.rewardGranted.sector03Chamber02Pit02;
  }

  markSector03Chamber02Pit02BossPitCompleted() {
    this.completed.sector03Chamber02Pit02 = true;
  }

  markSector03Chamber02Pit02BossPitRewardGranted() {
    this.rewardGranted.sector03Chamber02Pit02 = true;
  }

  hasSector03Chamber02Pit03BossPitCompleted() {
    return this.completed.sector03Chamber02Pit03;
  }

  hasSector03Chamber02Pit03BossPitRewardGranted() {
    return this.rewardGranted.sector03Chamber02Pit03;
  }

  markSector03Chamber02Pit03BossPitCompleted() {
    this.completed.sector03Chamber02Pit03 = true;
  }

  markSector03Chamber02Pit03BossPitRewardGranted() {
    this.rewardGranted.sector03Chamber02Pit03 = true;
  }

  getSector03Chamber02EncounterState() {
    return this.sector03Chamber02EncounterState
      ? JSON.parse(JSON.stringify(this.sector03Chamber02EncounterState))
      : null;
  }

  setSector03Chamber02EncounterState(state) {
    this.sector03Chamber02EncounterState = state
      ? JSON.parse(JSON.stringify(state))
      : null;
  }

}

export const bossPitRunState = new BossPitRunState();
