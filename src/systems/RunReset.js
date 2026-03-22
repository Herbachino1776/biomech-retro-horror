import { ASSET_KEYS } from '../data/assetKeys.js';

const CHAMBER01_SCENE_KEY = 'Chamber01Scene';
const CHAMBER02_SCENE_KEY = 'Chamber02Scene';
const CHAMBER03_SCENE_KEY = 'Chamber03Scene';
const CHAMBER03_BOSS_ARENA_SCENE_KEY = 'Chamber03BossArenaScene';
const LORE_SCENE_KEYS = ['LoreScreenScene', 'LoreCutsceneScene'];

export function restartRunFromDeath(scene) {
  if (!scene?.scene) {
    return;
  }

  scene.game?.sound?.get(ASSET_KEYS.loreEnter)?.stop();
  scene.game?.sound?.get(ASSET_KEYS.loreExit)?.stop();

  LORE_SCENE_KEYS.forEach((loreSceneKey) => {
    scene.scene.stop(loreSceneKey);
  });
  scene.scene.stop(CHAMBER03_BOSS_ARENA_SCENE_KEY);
  scene.scene.stop(CHAMBER03_SCENE_KEY);
  scene.scene.stop(CHAMBER02_SCENE_KEY);
  if (scene.scene.isActive(CHAMBER01_SCENE_KEY) || scene.scene.isPaused(CHAMBER01_SCENE_KEY)) {
    scene.scene.stop(CHAMBER01_SCENE_KEY);
  }
  scene.scene.start(CHAMBER01_SCENE_KEY);
}
