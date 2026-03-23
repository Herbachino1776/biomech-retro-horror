import Phaser from 'phaser';

const DEFAULT_CONFIG = {
  durationMs: 820,
  burstCount: 9,
  burstRadiusX: 94,
  burstRadiusY: 54,
  dropletWidth: [16, 34],
  dropletHeight: [10, 24],
  puddleWidth: 168,
  puddleHeight: 42,
  splashColor: 0x131816,
  highlightColor: 0x3b4d46,
  shadowColor: 0x050607,
  mistColor: 0x84a07f,
  depthOffset: 0.18,
  lift: 26,
  alpha: 0.9,
  persistPuddle: true,
  puddleFadeMs: 2200,
  puddleAlpha: 0.34,
  onComplete: null
};

export function triggerSector02BlackOilBlowout(scene, {
  x,
  y,
  source = null,
  scale = 1,
  depth = null,
  durationMs,
  burstCount,
  burstRadiusX,
  burstRadiusY,
  puddleWidth,
  puddleHeight,
  persistPuddle,
  onComplete,
  ...rest
} = {}) {
  if (!scene) {
    return null;
  }

  const config = {
    ...DEFAULT_CONFIG,
    ...rest,
    durationMs: durationMs ?? DEFAULT_CONFIG.durationMs,
    burstCount: burstCount ?? DEFAULT_CONFIG.burstCount,
    burstRadiusX: (burstRadiusX ?? DEFAULT_CONFIG.burstRadiusX) * scale,
    burstRadiusY: (burstRadiusY ?? DEFAULT_CONFIG.burstRadiusY) * scale,
    puddleWidth: (puddleWidth ?? DEFAULT_CONFIG.puddleWidth) * scale,
    puddleHeight: (puddleHeight ?? DEFAULT_CONFIG.puddleHeight) * scale,
    persistPuddle: persistPuddle ?? DEFAULT_CONFIG.persistPuddle,
    onComplete: onComplete ?? DEFAULT_CONFIG.onComplete
  };

  const centerX = x ?? source?.x ?? 0;
  const centerY = y ?? source?.y ?? 0;
  const baseDepth = depth ?? source?.depth ?? 6;
  const created = [];

  const craterShadow = scene.add
    .ellipse(centerX, centerY + 14 * scale, config.puddleWidth * 1.18, config.puddleHeight * 1.6, config.shadowColor, 0.44)
    .setDepth(baseDepth - 0.05);
  created.push(craterShadow);

  const releaseRing = scene.add
    .ellipse(centerX, centerY - 2 * scale, config.burstRadiusX * 0.56, config.burstRadiusY * 0.34, config.highlightColor, 0.18)
    .setStrokeStyle(2, config.mistColor, 0.3)
    .setDepth(baseDepth + config.depthOffset);
  created.push(releaseRing);

  const puddle = scene.add
    .ellipse(centerX, centerY + 20 * scale, config.puddleWidth, config.puddleHeight, config.splashColor, config.persistPuddle ? config.puddleAlpha : 0.28)
    .setStrokeStyle(2, config.highlightColor, 0.22)
    .setDepth(baseDepth - 0.02);
  created.push(puddle);

  for (let index = 0; index < config.burstCount; index += 1) {
    const offsetX = Phaser.Math.Between(-config.burstRadiusX, config.burstRadiusX);
    const offsetY = Phaser.Math.Between(-config.burstRadiusY, config.burstRadiusY * 0.15);
    const droplet = scene.add
      .ellipse(
        centerX + offsetX * 0.18,
        centerY + 6 * scale,
        Phaser.Math.Between(config.dropletWidth[0], config.dropletWidth[1]) * scale,
        Phaser.Math.Between(config.dropletHeight[0], config.dropletHeight[1]) * scale,
        index % 3 === 0 ? config.highlightColor : config.splashColor,
        config.alpha
      )
      .setDepth(baseDepth + config.depthOffset + index * 0.001);

    created.push(droplet);

    scene.tweens.add({
      targets: droplet,
      x: centerX + offsetX,
      y: centerY - Phaser.Math.Between(config.lift * 0.35, config.lift * 1.2) * scale + offsetY,
      scaleX: Phaser.Math.FloatBetween(0.88, 1.16),
      scaleY: Phaser.Math.FloatBetween(0.84, 1.2),
      alpha: 0,
      angle: Phaser.Math.Between(-30, 30),
      duration: config.durationMs + Phaser.Math.Between(-120, 140),
      ease: 'Cubic.easeOut',
      onComplete: () => droplet.destroy()
    });
  }

  scene.tweens.add({
    targets: releaseRing,
    scaleX: 2.4,
    scaleY: 1.72,
    alpha: 0,
    duration: config.durationMs,
    ease: 'Quad.easeOut',
    onComplete: () => releaseRing.destroy()
  });

  scene.tweens.add({
    targets: craterShadow,
    scaleX: 1.08,
    scaleY: 1.16,
    alpha: 0.16,
    duration: 640,
    ease: 'Sine.easeOut'
  });

  if (config.persistPuddle) {
    scene.tweens.add({
      targets: puddle,
      alpha: config.puddleAlpha,
      scaleX: 1.12,
      duration: 580,
      ease: 'Sine.easeOut'
    });
  } else {
    scene.tweens.add({
      targets: puddle,
      alpha: 0,
      duration: 780,
      ease: 'Quad.easeOut',
      onComplete: () => puddle.destroy()
    });
  }

  if (source?.active) {
    scene.tweens.add({
      targets: source,
      y: source.y - 12 * scale,
      scaleX: source.scaleX * 1.04,
      scaleY: source.scaleY * 0.92,
      alpha: 0.04,
      duration: 720,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        source.setVisible(false);
      }
    });
  }

  if (config.persistPuddle) {
    scene.time.delayedCall(config.puddleFadeMs, () => {
      if (!puddle.active) {
        return;
      }
      scene.tweens.add({
        targets: puddle,
        alpha: Math.max(0.12, config.puddleAlpha * 0.6),
        duration: 900,
        ease: 'Sine.easeOut'
      });
    });
  }

  scene.time.delayedCall(config.durationMs + 60, () => {
    config.onComplete?.({ puddle, craterShadow, x: centerX, y: centerY });
  });

  return { puddle, craterShadow, created };
}
