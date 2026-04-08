import Phaser from 'phaser';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { ignoreRuntimeWorldObjectFromUiCamera } from '../ui/mobileUiCamera.js';

const BRUTALITY_BURST_PROFILE = Object.freeze({
  chunkCountRange: [20, 30],
  maxDisplaySidePx: [42, 76],
  spawnOffsetX: [-20, 20],
  spawnOffsetY: [-32, -8],
  launchX: [94, 182],
  launchLiftY: [86, 188],
  apexDurationMs: [80, 130],
  settleSpreadX: 108,
  settleDropY: [0, 4],
  settleSinkY: [7, 13],
  settleDurationMs: [230, 430],
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

    const poolShadow = scene.add.ellipse(0, 8, 126, 28, 0x140b0b, 0.4).setScale(0.3, 0.34);
    const poolCore = scene.add.ellipse(-4, 6, 108, 24, 0x5a1318, 0.44).setScale(0.24, 0.26);
    container.add([poolShadow, poolCore]);

    scene.tweens.add({
      targets: [poolShadow, poolCore],
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
      const launchDirection = settleOffsetX >= 0 ? 1 : -1;
      container.add(chunk);

      scene.tweens.add({
        targets: chunk,
        x: spawnOffsetX + launchDirection * Phaser.Math.Between(
          BRUTALITY_BURST_PROFILE.launchX[0],
          BRUTALITY_BURST_PROFILE.launchX[1]
        ),
        y: spawnOffsetY - Phaser.Math.Between(
          BRUTALITY_BURST_PROFILE.launchLiftY[0],
          BRUTALITY_BURST_PROFILE.launchLiftY[1]
        ),
        angle: Phaser.Math.Between(-90, 90),
        duration: Phaser.Math.Between(
          BRUTALITY_BURST_PROFILE.apexDurationMs[0],
          BRUTALITY_BURST_PROFILE.apexDurationMs[1]
        ),
        ease: 'Quad.Out',
        onComplete: () => {
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

          scene.tweens.add({
            targets: chunk,
            x: settleOffsetX,
            y: settledY,
            angle: Phaser.Math.Between(
              BRUTALITY_BURST_PROFILE.settleRotationDeg[0],
              BRUTALITY_BURST_PROFILE.settleRotationDeg[1]
            ),
            duration: Phaser.Math.Between(
              BRUTALITY_BURST_PROFILE.settleDurationMs[0],
              BRUTALITY_BURST_PROFILE.settleDurationMs[1]
            ),
            ease: 'Cubic.easeIn'
          });
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
