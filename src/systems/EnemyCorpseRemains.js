import Phaser from 'phaser';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { ignoreRuntimeWorldObjectFromUiCamera } from '../ui/mobileUiCamera.js';

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
  },
  sector3Basic: {
    pieceCountRange: [8, 13],
    maxDisplaySidePx: [18, 28],
    spawnRadiusX: 16,
    settleRadiusX: 28,
    spawnDropY: [16, 28],
    settleDropY: [0, 3],
    settleSinkIntoFloorPx: [4, 7],
    settleDurationMs: [140, 220]
  },
  sector3Elite: {
    pieceCountRange: [18, 28],
    maxDisplaySidePx: [42, 64],
    spawnRadiusX: 34,
    settleRadiusX: 68,
    spawnDropY: [24, 38],
    settleDropY: [0, 6],
    settleSinkIntoFloorPx: [5, 10],
    settleDurationMs: [180, 310]
  },
  sector3Boss: {
    pieceCountRange: [10, 14],
    maxDisplaySidePx: [58, 84],
    spawnRadiusX: 30,
    settleRadiusX: 70,
    spawnDropY: [24, 36],
    settleDropY: [0, 5],
    settleSinkIntoFloorPx: [6, 11],
    settleDurationMs: [200, 340]
  }
};

const REMAINS_CAP_PER_SCENE = 90;
const LEGACY_GROUND_Y_TO_FLOOR_PLANE_OFFSET_Y = 28;
const REMAINS_SETTLE_LOWERING_PX = 6;
const BLOOD_POOL_UNDERLAY_OFFSET_Y = 8;
const REMAINS_DEPTH_OFFSET_FROM_SOURCE = 0.1;
const REMAINS_PLAYER_LAYER_CLEARANCE = 0.1;

const BLOOD_POOL_PROFILES = {
  small: { width: 66, height: 20, growMs: 760 },
  medium: { width: 88, height: 24, growMs: 840 },
  large: { width: 116, height: 30, growMs: 920 },
  elite: { width: 122, height: 34, growMs: 980 },
  sector3Basic: { width: 78, height: 24, growMs: 820 },
  sector3Elite: { width: 152, height: 46, growMs: 1040 },
  sector3Boss: { width: 188, height: 56, growMs: 1120 }
};

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

function resolveRemainsDepth(scene, requestedDepth) {
  const sourceDepth = Number.isFinite(requestedDepth) ? requestedDepth : 6;
  let resolvedDepth = sourceDepth - REMAINS_DEPTH_OFFSET_FROM_SOURCE;
  const playerDepth = scene?.player?.sprite?.depth;

  if (Number.isFinite(playerDepth)) {
    resolvedDepth = Math.min(resolvedDepth, playerDepth - REMAINS_PLAYER_LAYER_CLEARANCE);
  }

  return resolvedDepth;
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
  const bloodPoolProfile = BLOOD_POOL_PROFILES[size] ?? BLOOD_POOL_PROFILES.small;
  const pieceCount = Phaser.Math.Between(profile.pieceCountRange[0], profile.pieceCountRange[1]);
  const resolvedFloorPlaneY = floorPlaneY ?? (groundY ?? y) + LEGACY_GROUND_Y_TO_FLOOR_PLANE_OFFSET_Y;
  const groundedPlaneY = resolvedFloorPlaneY;
  const containerDepth = resolveRemainsDepth(scene, depth);
  const container = scene.add.container(x, groundedPlaneY).setDepth(containerDepth);
  ignoreRuntimeWorldObjectFromUiCamera(scene, container);

  const bloodShadow = scene.add
    .ellipse(0, BLOOD_POOL_UNDERLAY_OFFSET_Y, bloodPoolProfile.width * 1.04, bloodPoolProfile.height * 1.18, 0x18080a, 0.34)
    .setScale(0.42, 0.4);
  const bloodPool = scene.add
    .ellipse(0, BLOOD_POOL_UNDERLAY_OFFSET_Y + -3, bloodPoolProfile.width, bloodPoolProfile.height, 0x64171d, 0.56)
    .setStrokeStyle(1, 0x2b0b0e, 0.4)
    .setScale(0.36, 0.34);
  const bloodCore = scene.add
    .ellipse(-2, BLOOD_POOL_UNDERLAY_OFFSET_Y + -4, bloodPoolProfile.width * 0.58, bloodPoolProfile.height * 0.62, 0x7e2125, 0.3)
    .setScale(0.32, 0.3);
  container.add([bloodShadow, bloodPool, bloodCore]);

  scene.tweens.add({
    targets: bloodShadow,
    scaleX: 1,
    scaleY: 1,
    alpha: 0.34,
    duration: bloodPoolProfile.growMs,
    ease: 'Sine.easeOut'
  });
  scene.tweens.add({
    targets: bloodPool,
    scaleX: 1,
    scaleY: 1,
    alpha: 0.56,
    duration: bloodPoolProfile.growMs + 60,
    ease: 'Sine.easeOut'
  });
  scene.tweens.add({
    targets: bloodCore,
    scaleX: 1,
    scaleY: 1,
    alpha: 0.3,
    duration: bloodPoolProfile.growMs + 120,
    ease: 'Sine.easeOut'
  });

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
    const settledGroundedY = -halfDisplayHeight - liftAboveFloor + settleSinkIntoFloor + REMAINS_SETTLE_LOWERING_PX;
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
