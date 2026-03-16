const CHAMBER01_SCENE_KEY = 'Chamber01Scene';
const CHAMBER02_SCENE_KEY = 'Chamber02Scene';
const LORE_SCENE_KEY = 'LoreScreenScene';

export function restartRunFromDeath(scene) {
  if (!scene?.scene) {
    return;
  }

  scene.scene.stop(LORE_SCENE_KEY);
  scene.scene.stop(CHAMBER02_SCENE_KEY);
  if (scene.scene.isActive(CHAMBER01_SCENE_KEY) || scene.scene.isPaused(CHAMBER01_SCENE_KEY)) {
    scene.scene.stop(CHAMBER01_SCENE_KEY);
  }
  scene.scene.start(CHAMBER01_SCENE_KEY);
}
