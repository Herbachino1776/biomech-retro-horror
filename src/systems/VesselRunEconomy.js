import { vesselIntegrityState } from './VesselIntegrityState.js';

const CHAMBER_ENTRY_RESTORE_AMOUNT = 1;
const MAJOR_KILL_MAX_REWARD_AMOUNT = 1;

export function applyChamberEntryRestore(transitionContext = {}) {
  const enteredFromOtherChamber = Boolean(transitionContext.enteredFrom || transitionContext.fromScene);
  if (!enteredFromOtherChamber) {
    return vesselIntegrityState.getIntegritySnapshot();
  }

  return vesselIntegrityState.partialRestore(CHAMBER_ENTRY_RESTORE_AMOUNT);
}

export function grantMajorEncounterIntegrityReward(player, rewardTracker, rewardKey) {
  if (!player || !rewardTracker || !rewardKey || rewardTracker.has(rewardKey)) {
    return false;
  }

  rewardTracker.add(rewardKey);
  player.increaseMaxIntegrity(MAJOR_KILL_MAX_REWARD_AMOUNT);
  return true;
}
