import Phaser from 'phaser';
import { ASSET_KEYS } from '../data/assetKeys.js';

const REMAINS_PROFILES = {
  small: {
    pieces: 3,
    scaleRange: [0.2, 0.3],
    spawnRadiusX: 14,
    settleRadiusX: 18,
    settleDropY: [10, 16],
    settleDurationMs: [170, 250]
  },
  medium: {
    pieces: 5,
    scaleRange: [0.28, 0.42],
    spawnRadiusX: 20,
    settleRadiusX: 24,
    settleDropY: [14, 22],
    settleDurationMs: [220, 320]
  },
  large: {
    pieces: 8,
    scaleRange: [0.42, 0.62],
    spawnRadiusX: 30,
    settleRadiusX: 36,
    settleDropY: [18, 30],
    settleDurationMs: [280, 420]
  }
};

const REMAINS_CAP_PER_SCENE = 90;

function ensureStore(scene) {
  if (!scene.__enemyCorpseRemainsEntries) {
    scene.__enemyCorpseRemainsEntries = [];
  }
  return scene.__enemyCorpseRemainsEntries;
}

function capSceneRemains(scene, cap = REMAINS_CAP_PER_SCENE) {
  const store = ensureStore(scene);
  while (store.length > cap) {
    const entry = store.shift();
    entry?.container?.destroy(true);
  }
}

export function spawnEnemyCorpseRemains(scene, {
  x = 0,
  y = 0,
  depth = 6,
  size = 'small',
  textureKey = ASSET_KEYS.enemyGoreClusterMeatBone01,
  maxPersistPerScene = REMAINS_CAP_PER_SCENE
} = {}) {
  if (!scene || !scene.add || !scene.tweens || !scene.textures?.exists(textureKey)) {
    return null;
  }

  const profile = REMAINS_PROFILES[size] ?? REMAINS_PROFILES.small;
  const container = scene.add.container(x, y).setDepth(depth + 0.2);

  for (let index = 0; index < profile.pieces; index += 1) {
    const spawnOffsetX = Phaser.Math.Between(-profile.spawnRadiusX, profile.spawnRadiusX);
    const settleOffsetX = Phaser.Math.Between(-profile.settleRadiusX, profile.settleRadiusX);
    const spawnDrop = Phaser.Math.Between(12, 24);
    const settleDrop = Phaser.Math.Between(profile.settleDropY[0], profile.settleDropY[1]);
    const settleDuration = Phaser.Math.Between(profile.settleDurationMs[0], profile.settleDurationMs[1]);
    const scale = Phaser.Math.FloatBetween(profile.scaleRange[0], profile.scaleRange[1]);

    const piece = scene.add.image(spawnOffsetX, -spawnDrop, textureKey)
      .setAlpha(0.9)
      .setRotation(Phaser.Math.FloatBetween(-0.4, 0.4))
      .setScale(scale)
      .setDepth(container.depth + index * 0.0001);

    container.add(piece);

    scene.tweens.add({
      targets: piece,
      x: settleOffsetX,
      y: settleDrop,
      angle: Phaser.Math.Between(-16, 16),
      alpha: 1,
      duration: settleDuration,
      ease: 'Cubic.easeOut'
    });
  }

  const store = ensureStore(scene);
  store.push({ container, createdAt: scene.time?.now ?? Date.now() });
  capSceneRemains(scene, maxPersistPerScene);

  return container;
}
