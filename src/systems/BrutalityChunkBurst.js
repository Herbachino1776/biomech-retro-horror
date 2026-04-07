import Phaser from 'phaser';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { ignoreRuntimeWorldObjectFromUiCamera } from '../ui/mobileUiCamera.js';

const BRUTALITY_BURST_PROFILE = Object.freeze({
  chunkCountRange: [20, 30],
  launchX: 56,
  launchLift: [8, 32],
  settleSpreadX: 44,
  settleLiftY: [0, 6],
  settleSinkY: [8, 14],
  apexDurationMs: [90, 140],
  settleDurationMs: [300, 500],
  holdBeforeFadeMs: 1700,
  fadeDurationMs: 520
});
const BRUTALITY_BURST_FLOOR_OFFSET_Y = 18;

export function triggerBrutalityBasicChunkBurst(scene, {
  x,
  y,
  floorPlaneY = null,
  depth = 6.6
} = {}) {
  if (!scene || !scene.add) {
    return;
  }

  if (scene.textures.exists(ASSET_KEYS.brutalityBasicChunkBurst01)) {
    const groundedPlaneYBase = Number.isFinite(floorPlaneY) ? floorPlaneY : (y ?? 0) + 26;
    const groundedPlaneY = groundedPlaneYBase + BRUTALITY_BURST_FLOOR_OFFSET_Y;
    const container = scene.add.container(x ?? 0, groundedPlaneY).setDepth(depth);
    ignoreRuntimeWorldObjectFromUiCamera(scene, container);

    const poolShadow = scene.add.ellipse(0, 8, 102, 22, 0x140b0b, 0.32).setScale(0.35, 0.4);
    const poolCore = scene.add.ellipse(0, 6, 88, 18, 0x5a1318, 0.38).setScale(0.24, 0.3);
    container.add([poolShadow, poolCore]);

    scene.tweens.add({
      targets: [poolShadow, poolCore],
      scaleX: 1,
      scaleY: 1,
      duration: 220,
      ease: 'Sine.easeOut'
    });

    const chunkCount = Phaser.Math.Between(
      BRUTALITY_BURST_PROFILE.chunkCountRange[0],
      BRUTALITY_BURST_PROFILE.chunkCountRange[1]
    );

    for (let index = 0; index < chunkCount; index += 1) {
      const targetMaxSide = Phaser.Math.Between(40, 72);
      const spawnOffsetX = Phaser.Math.Between(-12, 12);
      const spawnOffsetY = Phaser.Math.Between(-34, -10);
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

      scene.tweens.add({
        targets: chunk,
        x: spawnOffsetX + Phaser.Math.Between(-BRUTALITY_BURST_PROFILE.launchX, BRUTALITY_BURST_PROFILE.launchX),
        y: spawnOffsetY - Phaser.Math.Between(
          BRUTALITY_BURST_PROFILE.launchLift[0],
          BRUTALITY_BURST_PROFILE.launchLift[1]
        ),
        angle: Phaser.Math.Between(-90, 90),
        duration: Phaser.Math.Between(
          BRUTALITY_BURST_PROFILE.apexDurationMs[0],
          BRUTALITY_BURST_PROFILE.apexDurationMs[1]
        ),
        ease: 'Quad.Out',
        onComplete: () => {
          const halfDisplayHeight = Math.max(1, chunk.displayHeight * 0.5);
          const settleLift = Phaser.Math.Between(
            BRUTALITY_BURST_PROFILE.settleLiftY[0],
            BRUTALITY_BURST_PROFILE.settleLiftY[1]
          );
          const settleSink = Phaser.Math.Between(
            BRUTALITY_BURST_PROFILE.settleSinkY[0],
            BRUTALITY_BURST_PROFILE.settleSinkY[1]
          );
          const settledY = -halfDisplayHeight - settleLift + settleSink + 12;

          scene.tweens.add({
            targets: chunk,
            x: settleOffsetX,
            y: settledY,
            angle: Phaser.Math.Between(-16, 16),
            duration: Phaser.Math.Between(
              BRUTALITY_BURST_PROFILE.settleDurationMs[0],
              BRUTALITY_BURST_PROFILE.settleDurationMs[1]
            ),
            ease: 'Bounce.Out'
          });
        }
      });
    }

    scene.time.delayedCall(BRUTALITY_BURST_PROFILE.holdBeforeFadeMs, () => {
      if (!container.active) {
        return;
      }
      scene.tweens.add({
        targets: container.list,
        alpha: 0,
        duration: BRUTALITY_BURST_PROFILE.fadeDurationMs,
        ease: 'Sine.easeIn',
        onComplete: () => container.destroy(true)
      });
    });

    return;
  }

  const fallback = scene.add.ellipse(x, y, 48, 28, 0x6f231c, 0.9).setDepth(depth);
  scene.tweens.add({
    targets: fallback,
    alpha: 0,
    scaleX: 1.28,
    scaleY: 1.36,
    duration: 600,
    onComplete: () => fallback.destroy()
  });
}
