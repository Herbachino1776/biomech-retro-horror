import Phaser from 'phaser';
import { ASSET_KEYS } from '../data/assetKeys.js';

export function triggerBrutalityBasicChunkBurst(scene, { x, y, depth = 6.6 } = {}) {
  if (!scene || !scene.add) {
    return;
  }

  if (scene.textures.exists(ASSET_KEYS.brutalityBasicChunkBurst01)) {
    const chunkCount = 3;
    for (let index = 0; index < chunkCount; index += 1) {
      const burst = scene.add.image(
        x + Phaser.Math.Between(-18, 18),
        y + Phaser.Math.Between(-18, 14),
        ASSET_KEYS.brutalityBasicChunkBurst01
      )
        .setDepth(depth + index * 0.01)
        .setAlpha(0.96)
        .setScale(0.72 + index * 0.12)
        .setRotation(Phaser.Math.FloatBetween(-1.4, 1.4));

      scene.tweens.add({
        targets: burst,
        x: burst.x + Phaser.Math.Between(-44, 44),
        y: burst.y + Phaser.Math.Between(-38, -8),
        alpha: 0,
        scaleX: burst.scaleX * 1.18,
        scaleY: burst.scaleY * 1.18,
        duration: 130 + index * 18,
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
