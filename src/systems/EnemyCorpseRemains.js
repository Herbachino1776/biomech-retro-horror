import Phaser from 'phaser';
import { ASSET_KEYS } from '../data/assetKeys.js';

const REMAINS_PROFILES = {
  small: {
    pieceCountRange: [2, 4],
    maxDisplaySidePx: [8, 13],
    spawnRadiusX: 10,
    settleRadiusX: 16,
    spawnDropY: [6, 11],
    settleDropY: [5, 12],
    settleDurationMs: [120, 180]
  },
  medium: {
    pieceCountRange: [3, 5],
    maxDisplaySidePx: [11, 18],
    spawnRadiusX: 16,
    settleRadiusX: 28,
    spawnDropY: [7, 13],
    settleDropY: [8, 16],
    settleDurationMs: [140, 220]
  },
  large: {
    pieceCountRange: [5, 7],
    maxDisplaySidePx: [15, 26],
    spawnRadiusX: 26,
    settleRadiusX: 50,
    spawnDropY: [9, 17],
    settleDropY: [11, 24],
    settleDurationMs: [170, 280]
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
  const pieceCount = Phaser.Math.Between(profile.pieceCountRange[0], profile.pieceCountRange[1]);
  const container = scene.add.container(x, y).setDepth(depth + 0.2);

  for (let index = 0; index < pieceCount; index += 1) {
    const spawnOffsetX = Phaser.Math.Between(-profile.spawnRadiusX, profile.spawnRadiusX);
    const settleOffsetX = Phaser.Math.Between(-profile.settleRadiusX, profile.settleRadiusX);
    const spawnDrop = Phaser.Math.Between(profile.spawnDropY[0], profile.spawnDropY[1]);
    const settleDrop = Phaser.Math.Between(profile.settleDropY[0], profile.settleDropY[1]);
    const settleDuration = Phaser.Math.Between(profile.settleDurationMs[0], profile.settleDurationMs[1]);
    const targetMaxSidePx = Phaser.Math.Between(profile.maxDisplaySidePx[0], profile.maxDisplaySidePx[1]);

    const piece = scene.add.image(spawnOffsetX, -spawnDrop, textureKey)
      .setAlpha(0.9)
      .setRotation(Phaser.Math.FloatBetween(-0.4, 0.4))
      .setDepth(container.depth + index * 0.0001);

    const sourceMaxSide = Math.max(piece.width || 1, piece.height || 1);
    piece.setScale(targetMaxSidePx / sourceMaxSide);

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
