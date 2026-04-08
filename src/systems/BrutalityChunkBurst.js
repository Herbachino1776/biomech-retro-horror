import Phaser from 'phaser';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { ignoreRuntimeWorldObjectFromUiCamera } from '../ui/mobileUiCamera.js';

const BRUTALITY_BURST_PROFILE = Object.freeze({
  chunkCountRange: [20, 30],
  maxDisplaySidePx: [42, 76],
  spawnOffsetX: [-34, 34],
  spawnOffsetY: [-32, -8],
  burstOutwardX: [18, 44],
  arcLiftY: [132, 232],
  flightDurationMs: [360, 560],
  settleSpreadX: 108,
  settleDropY: [0, 4],
  settleSinkY: [7, 13],
  settleRotationDeg: [-28, 28],
  bloodPoolGrowMs: 300
});
const BRUTALITY_BURST_FLOOR_OFFSET_Y = 18;
const BRUTALITY_REMAINS_CAP_PER_SCENE = 34;
const BRUTALITY_REMAINS_DEPTH_OFFSET_FROM_SOURCE = 0.1;
const BRUTALITY_REMAINS_PLAYER_LAYER_CLEARANCE = 0.1;

function ensureBrutalityBurstStore(scene) {
  if (!scene.__brutalityChunkBurstEntries) {
    scene.__brutalityChunkBurstEntries = [];
  }
  return scene.__brutalityChunkBurstEntries;
}

function capBrutalityBurstStore(scene, cap = BRUTALITY_REMAINS_CAP_PER_SCENE) {
  const store = ensureBrutalityBurstStore(scene);
  while (store.length > cap) {
    const entry = store.shift();
    entry?.container?.destroy(true);
  }
}

function resolveGameplayForegroundDepth(scene) {
  const playerBodyDepth = scene?.player?.sprite?.depth;
  const playerWeaponDepth = scene?.player?.weaponSprite?.depth;
  const foregroundDepths = [playerBodyDepth, playerWeaponDepth].filter((value) => Number.isFinite(value));

  if (!foregroundDepths.length) {
    return null;
  }

  return Math.min(...foregroundDepths);
}

function resolveBrutalityPileDepth(scene, requestedDepth) {
  const sourceDepth = Number.isFinite(requestedDepth) ? requestedDepth : 6.6;
  let resolvedDepth = sourceDepth - BRUTALITY_REMAINS_DEPTH_OFFSET_FROM_SOURCE;
  const gameplayForegroundDepth = resolveGameplayForegroundDepth(scene);

  if (Number.isFinite(gameplayForegroundDepth)) {
    resolvedDepth = Math.min(resolvedDepth, gameplayForegroundDepth - BRUTALITY_REMAINS_PLAYER_LAYER_CLEARANCE);
  }

  return resolvedDepth;
}

export function triggerBrutalityBasicChunkBurst(scene, {
  x,
  y,
  floorPlaneY = null,
  depth = 6.6,
  maxPersistPerScene = BRUTALITY_REMAINS_CAP_PER_SCENE
} = {}) {
  if (!scene || !scene.add) {
    return;
  }

  if (scene.textures.exists(ASSET_KEYS.brutalityBasicChunkBurst01)) {
    const groundedPlaneYBase = Number.isFinite(floorPlaneY) ? floorPlaneY : (y ?? 0) + 26;
    const groundedPlaneY = groundedPlaneYBase + BRUTALITY_BURST_FLOOR_OFFSET_Y;
    const containerDepth = resolveBrutalityPileDepth(scene, depth);
    const container = scene.add.container(x ?? 0, groundedPlaneY).setDepth(containerDepth);
    ignoreRuntimeWorldObjectFromUiCamera(scene, container);

    const poolShadow = scene.add.ellipse(0, 10, 138, 36, 0x170707, 0.94).setScale(0.28, 0.32);
    const poolRim = scene.add.ellipse(9, 7, 122, 30, 0x2d090c, 0.96).setScale(0.24, 0.28);
    const poolCore = scene.add.ellipse(-6, 6, 110, 26, 0x4a0d12, 0.98).setScale(0.2, 0.24);
    container.add([poolShadow, poolRim, poolCore]);

    scene.tweens.add({
      targets: [poolShadow, poolRim, poolCore],
      scaleX: 1,
      scaleY: 1,
      duration: BRUTALITY_BURST_PROFILE.bloodPoolGrowMs,
      ease: 'Sine.easeOut'
    });

    const chunkCount = Phaser.Math.Between(
      BRUTALITY_BURST_PROFILE.chunkCountRange[0],
      BRUTALITY_BURST_PROFILE.chunkCountRange[1]
    );

    for (let index = 0; index < chunkCount; index += 1) {
      const targetMaxSide = Phaser.Math.Between(
        BRUTALITY_BURST_PROFILE.maxDisplaySidePx[0],
        BRUTALITY_BURST_PROFILE.maxDisplaySidePx[1]
      );
      const spawnOffsetX = Phaser.Math.Between(
        BRUTALITY_BURST_PROFILE.spawnOffsetX[0],
        BRUTALITY_BURST_PROFILE.spawnOffsetX[1]
      );
      const spawnOffsetY = Phaser.Math.Between(
        BRUTALITY_BURST_PROFILE.spawnOffsetY[0],
        BRUTALITY_BURST_PROFILE.spawnOffsetY[1]
      );
      const settleOffsetX = Phaser.Math.Between(
        -BRUTALITY_BURST_PROFILE.settleSpreadX,
        BRUTALITY_BURST_PROFILE.settleSpreadX
      );

      const chunk = scene.add.image(spawnOffsetX, spawnOffsetY, ASSET_KEYS.brutalityBasicChunkBurst01)
        .setAlpha(0.95)
        .setRotation(Phaser.Math.FloatBetween(-1.1, 1.1))
        .setDepth(container.depth + 0.01 + index * 0.0001);

      const sourceMaxSide = Math.max(chunk.width || 1, chunk.height || 1);
      chunk.setScale(targetMaxSide / sourceMaxSide);
      container.add(chunk);
      const halfDisplayHeight = Math.max(1, chunk.displayHeight * 0.5);
      const settleDrop = Phaser.Math.Between(
        BRUTALITY_BURST_PROFILE.settleDropY[0],
        BRUTALITY_BURST_PROFILE.settleDropY[1]
      );
      const settleSink = Phaser.Math.Between(
        BRUTALITY_BURST_PROFILE.settleSinkY[0],
        BRUTALITY_BURST_PROFILE.settleSinkY[1]
      );
      const settledY = -halfDisplayHeight - settleDrop + settleSink + 10;
      const outwardDirection = settleOffsetX >= 0 ? 1 : -1;
      const burstOutwardX = Phaser.Math.Between(
        BRUTALITY_BURST_PROFILE.burstOutwardX[0],
        BRUTALITY_BURST_PROFILE.burstOutwardX[1]
      );
      const controlX = spawnOffsetX + outwardDirection * burstOutwardX + settleOffsetX * 0.34;
      const controlY = Math.min(
        spawnOffsetY,
        settledY
      ) - Phaser.Math.Between(
        BRUTALITY_BURST_PROFILE.arcLiftY[0],
        BRUTALITY_BURST_PROFILE.arcLiftY[1]
      );
      const startX = spawnOffsetX;
      const startY = spawnOffsetY;
      const startAngle = chunk.angle;
      const endAngle = Phaser.Math.Between(
        BRUTALITY_BURST_PROFILE.settleRotationDeg[0],
        BRUTALITY_BURST_PROFILE.settleRotationDeg[1]
      );

      scene.tweens.addCounter({
        from: 0,
        to: 1,
        duration: Phaser.Math.Between(
          BRUTALITY_BURST_PROFILE.flightDurationMs[0],
          BRUTALITY_BURST_PROFILE.flightDurationMs[1]
        ),
        ease: 'Sine.easeInOut',
        onUpdate: (tween) => {
          const t = tween.getValue();
          const inverse = 1 - t;
          chunk.x = (inverse * inverse * startX) + (2 * inverse * t * controlX) + (t * t * settleOffsetX);
          chunk.y = (inverse * inverse * startY) + (2 * inverse * t * controlY) + (t * t * settledY);
          chunk.angle = Phaser.Math.Linear(startAngle, endAngle, t);
        },
        onComplete: () => {
          chunk.x = settleOffsetX;
          chunk.y = settledY;
          chunk.angle = endAngle;
        }
      });
    }

    const store = ensureBrutalityBurstStore(scene);
    store.push({ container, createdAt: scene.time?.now ?? Date.now() });
    capBrutalityBurstStore(scene, maxPersistPerScene);

    return container;
  }

  const fallback = scene.add.ellipse(x, y, 48, 28, 0x6f231c, 0.9).setDepth(depth);
  ignoreRuntimeWorldObjectFromUiCamera(scene, fallback);
  const store = ensureBrutalityBurstStore(scene);
  store.push({ container: fallback, createdAt: scene.time?.now ?? Date.now() });
  capBrutalityBurstStore(scene, maxPersistPerScene);
  return fallback;
}
