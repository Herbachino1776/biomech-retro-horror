import Phaser from 'phaser';

const DEFAULT_CONFIG = {
  durationMs: 920,
  burstCount: 20,
  sprayCount: 34,
  mistCount: 18,
  emberCount: 10,
  burstRadiusX: 148,
  burstRadiusY: 72,
  dropletWidth: [4, 12],
  dropletHeight: [8, 20],
  sprayWidth: [2, 6],
  sprayHeight: [7, 18],
  mistWidth: [18, 34],
  mistHeight: [10, 18],
  emberWidth: [1, 3],
  emberHeight: [1, 4],
  puddleWidth: 176,
  puddleHeight: 30,
  splashColor: 0x050607,
  heavyColor: 0x0a0b0d,
  highlightColor: 0x181b1c,
  redSpeckColor: 0x5d0f12,
  shadowColor: 0x010102,
  mistColor: 0x232a28,
  depthOffset: 0.18,
  lift: 42,
  alpha: 0.96,
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
  sprayCount,
  mistCount,
  emberCount,
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
    sprayCount: sprayCount ?? DEFAULT_CONFIG.sprayCount,
    mistCount: mistCount ?? DEFAULT_CONFIG.mistCount,
    emberCount: emberCount ?? DEFAULT_CONFIG.emberCount,
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
    .ellipse(centerX, centerY + 14 * scale, config.puddleWidth * 1.28, config.puddleHeight * 1.7, config.shadowColor, 0.52)
    .setDepth(baseDepth - 0.05);
  created.push(craterShadow);

  const releaseRing = scene.add
    .ellipse(centerX, centerY - 4 * scale, config.burstRadiusX * 0.52, config.burstRadiusY * 0.26, config.highlightColor, 0.16)
    .setStrokeStyle(2, config.redSpeckColor, 0.18)
    .setDepth(baseDepth + config.depthOffset);
  created.push(releaseRing);

  const puddle = scene.add
    .ellipse(centerX, centerY + 20 * scale, config.puddleWidth, config.puddleHeight, config.heavyColor, config.persistPuddle ? config.puddleAlpha : 0.32)
    .setStrokeStyle(2, config.redSpeckColor, 0.14)
    .setDepth(baseDepth - 0.02);
  created.push(puddle);

  const spawnDroplet = ({ widthRange, heightRange, color, alpha, depthStep, xMultiplier = 0.16, liftMin = 0.45, liftMax = 1.28, angleRange = 40, scaleXRange = [0.78, 1.24], scaleYRange = [0.76, 1.32], durationJitter = 140 }) => {
    const offsetX = Phaser.Math.Between(-config.burstRadiusX, config.burstRadiusX);
    const offsetY = Phaser.Math.Between(-config.burstRadiusY * 0.22, config.burstRadiusY * 0.18);
    const droplet = scene.add
      .ellipse(
        centerX + offsetX * xMultiplier,
        centerY + Phaser.Math.Between(-6, 8) * scale,
        Phaser.Math.Between(widthRange[0], widthRange[1]) * scale,
        Phaser.Math.Between(heightRange[0], heightRange[1]) * scale,
        color,
        alpha
      )
      .setDepth(baseDepth + config.depthOffset + depthStep);

    created.push(droplet);

    scene.tweens.add({
      targets: droplet,
      x: centerX + offsetX,
      y: centerY - Phaser.Math.Between(config.lift * liftMin, config.lift * liftMax) * scale + offsetY,
      scaleX: Phaser.Math.FloatBetween(scaleXRange[0], scaleXRange[1]),
      scaleY: Phaser.Math.FloatBetween(scaleYRange[0], scaleYRange[1]),
      alpha: 0,
      angle: Phaser.Math.Between(-angleRange, angleRange),
      duration: config.durationMs + Phaser.Math.Between(-durationJitter, durationJitter),
      ease: 'Cubic.easeOut',
      onComplete: () => droplet.destroy()
    });
  };

  for (let index = 0; index < config.burstCount; index += 1) {
    spawnDroplet({
      widthRange: config.dropletWidth,
      heightRange: config.dropletHeight,
      color: index % 5 === 0 ? config.heavyColor : config.splashColor,
      alpha: config.alpha,
      depthStep: index * 0.001,
      xMultiplier: 0.14,
      liftMin: 0.38,
      liftMax: 1.06,
      angleRange: 28,
      scaleXRange: [0.84, 1.12],
      scaleYRange: [0.88, 1.22],
      durationJitter: 120
    });
  }

  for (let index = 0; index < config.sprayCount; index += 1) {
    spawnDroplet({
      widthRange: config.sprayWidth,
      heightRange: config.sprayHeight,
      color: index % 6 === 0 ? config.redSpeckColor : config.splashColor,
      alpha: 0.92,
      depthStep: 0.04 + index * 0.001,
      xMultiplier: 0.08,
      liftMin: 0.72,
      liftMax: 1.6,
      angleRange: 62,
      scaleXRange: [0.6, 1.28],
      scaleYRange: [0.78, 1.5],
      durationJitter: 170
    });
  }

  for (let index = 0; index < config.mistCount; index += 1) {
    spawnDroplet({
      widthRange: config.mistWidth,
      heightRange: config.mistHeight,
      color: config.mistColor,
      alpha: 0.2,
      depthStep: 0.02 + index * 0.0008,
      xMultiplier: 0.12,
      liftMin: 0.28,
      liftMax: 0.92,
      angleRange: 24,
      scaleXRange: [1.08, 1.34],
      scaleYRange: [0.84, 1.16],
      durationJitter: 90
    });
  }

  for (let index = 0; index < config.emberCount; index += 1) {
    spawnDroplet({
      widthRange: config.emberWidth,
      heightRange: config.emberHeight,
      color: config.redSpeckColor,
      alpha: 0.8,
      depthStep: 0.08 + index * 0.0008,
      xMultiplier: 0.1,
      liftMin: 0.8,
      liftMax: 1.5,
      angleRange: 90,
      scaleXRange: [0.9, 1.5],
      scaleYRange: [0.9, 1.6],
      durationJitter: 160
    });
  }

  scene.tweens.add({
    targets: releaseRing,
    scaleX: 2.8,
    scaleY: 1.36,
    alpha: 0,
    duration: config.durationMs,
    ease: 'Quad.easeOut',
    onComplete: () => releaseRing.destroy()
  });

  scene.tweens.add({
    targets: craterShadow,
    scaleX: 1.08,
    scaleY: 1.16,
    alpha: 0.22,
    duration: 640,
    ease: 'Sine.easeOut'
  });

  if (config.persistPuddle) {
    scene.tweens.add({
      targets: puddle,
      alpha: config.puddleAlpha,
      scaleX: 1.18,
      scaleY: 1.06,
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
        alpha: Math.max(0.1, config.puddleAlpha * 0.52),
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
