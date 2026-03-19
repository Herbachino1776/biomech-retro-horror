import { ASSET_KEYS } from '../data/assetKeys.js';

export const LORE_ENTER_VOLUME = 0.1365;
export const LORE_EXIT_VOLUME = 0.26;

export function stopLoreTransitionSounds(soundManager, { stopEnter = true, stopExit = true } = {}) {
  if (!soundManager) {
    return;
  }

  if (stopEnter) {
    soundManager.get(ASSET_KEYS.loreEnter)?.stop();
  }

  if (stopExit) {
    soundManager.get(ASSET_KEYS.loreExit)?.stop();
  }
}

export function playLoreEnter(soundManager) {
  if (!soundManager?.play) {
    return;
  }

  stopLoreTransitionSounds(soundManager);
  soundManager.play(ASSET_KEYS.loreEnter, { volume: LORE_ENTER_VOLUME });
}

export function playLoreExit(soundManager) {
  if (!soundManager?.play) {
    return;
  }

  stopLoreTransitionSounds(soundManager);
  soundManager.play(ASSET_KEYS.loreExit, { volume: LORE_EXIT_VOLUME });
}
