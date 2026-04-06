import Phaser from 'phaser';
import { ASSET_KEYS } from '../data/assetKeys.js';

export function triggerBrutalityBasicChunkBurst(scene, { x, y, depth = 6.6 } = {}) {
  if (!scene || !scene.add) {
    return;
  }

  if (scene.textures.exists(ASSET_KEYS.brutalityBasicChunkBurst01)) {
    const chunkCount = 3;
    for (let index = 0; index < chunkCount; index += 1) {
      const displayWidth = 94 + index * 18;
      const displayHeight = 82 + index * 14;
      const burst = scene.add.image(
        x + Phaser.Math.Between(-24, 24),
        y + Phaser.Math.Between(-20, 12),
        ASSET_KEYS.brutalityBasicChunkBurst01
      )
        .setDepth(depth + index * 0.02)
        .setAlpha(0.95)
        .setDisplaySize(displayWidth, displayHeight)
        .setRotation(Phaser.Math.FloatBetween(-1.4, 1.4));

      scene.tweens.add({
        targets: burst,
        x: burst.x + Phaser.Math.Between(-58, 58),
        y: burst.y + Phaser.Math.Between(-62, -14),
        alpha: 0,
        displayWidth: displayWidth * 1.22,
        displayHeight: displayHeight * 1.24,
        duration: 140 + index * 20,
        ease: 'Quad.Out',
        onComplete: () => burst.destroy()
      });
    }
    return;
  }

  const fallback = scene.add.ellipse(x, y, 48, 28, 0x6f231c, 0.9).setDepth(depth);
  scene.tweens.add({
    targets: fallback,
    alpha: 0,
    scaleX: 1.28,
    scaleY: 1.36,
    duration: 120,
    onComplete: () => fallback.destroy()
  });
}
