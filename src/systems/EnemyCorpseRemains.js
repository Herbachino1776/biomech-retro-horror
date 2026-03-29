import Phaser from 'phaser';
import { ASSET_KEYS } from '../data/assetKeys.js';

const REMAINS_PROFILES = {
  small: {
    pieceCountRange: [6, 11],
    maxDisplaySidePx: [14, 24],
    spawnRadiusX: 14,
    settleRadiusX: 24,
    spawnDropY: [16, 26],
    settleDropY: [0, 2],
    settleSinkIntoFloorPx: [4, 7],
    settleDurationMs: [130, 210]
  },
  medium: {
    pieceCountRange: [12, 18],
    maxDisplaySidePx: [22, 30],
    spawnRadiusX: 22,
    settleRadiusX: 38,
    spawnDropY: [18, 30],
    settleDropY: [0, 4],
    settleSinkIntoFloorPx: [5, 8],
    settleDurationMs: [150, 230]
  },
  large: {
    pieceCountRange: [18, 24],
    maxDisplaySidePx: [26, 46],
    spawnRadiusX: 28,
    settleRadiusX: 56,
    spawnDropY: [20, 34],
    settleDropY: [1, 7],
    settleSinkIntoFloorPx: [6, 10],
    settleDurationMs: [170, 290]
  },
  elite: {
    pieceCountRange: [14, 22],
    maxDisplaySidePx: [34, 54],
    spawnRadiusX: 30,
    settleRadiusX: 62,
    spawnDropY: [24, 38],
    settleDropY: [0, 5],
    settleSinkIntoFloorPx: [5, 9],
    settleDurationMs: [170, 290]
  }
};

const REMAINS_CAP_PER_SCENE = 90;
const REMAINS_FLOOR_PLANE_OFFSET_Y = 28;

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
  groundY = null,
  floorPlaneY = null,
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
  const groundedPlaneY = (floorPlaneY ?? groundY ?? y) + REMAINS_FLOOR_PLANE_OFFSET_Y;
  const container = scene.add.container(x, groundedPlaneY).setDepth(depth - 0.1);

  for (let index = 0; index < pieceCount; index += 1) {
    const spawnOffsetX = Phaser.Math.Between(-profile.spawnRadiusX, profile.spawnRadiusX);
    const settleOffsetX = Phaser.Math.Between(-profile.settleRadiusX, profile.settleRadiusX);
    const spawnDrop = Phaser.Math.Between(profile.spawnDropY[0], profile.spawnDropY[1]);
    const settleDrop = Phaser.Math.Between(profile.settleDropY[0], profile.settleDropY[1]);
    const settleSinkIntoFloor = Phaser.Math.Between(
      profile.settleSinkIntoFloorPx[0] ?? 0,
      profile.settleSinkIntoFloorPx[1] ?? 0
    );
    const settleDuration = Phaser.Math.Between(profile.settleDurationMs[0], profile.settleDurationMs[1]);
    const targetMaxSidePx = Phaser.Math.Between(profile.maxDisplaySidePx[0], profile.maxDisplaySidePx[1]);

    const piece = scene.add.image(spawnOffsetX, -spawnDrop, textureKey)
      .setAlpha(0.9)
      .setRotation(Phaser.Math.FloatBetween(-0.4, 0.4))
      .setDepth(container.depth + index * 0.0001);

    const sourceMaxSide = Math.max(piece.width || 1, piece.height || 1);
    piece.setScale(targetMaxSidePx / sourceMaxSide);
    const halfDisplayHeight = Math.max(1, piece.displayHeight * 0.5);
    const liftAboveFloor = Math.max(0, settleDrop);
    const settledGroundedY = -halfDisplayHeight - liftAboveFloor + settleSinkIntoFloor;
    piece.y = settledGroundedY - spawnDrop;

    container.add(piece);

    scene.tweens.add({
      targets: piece,
      x: settleOffsetX,
      y: settledGroundedY,
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
