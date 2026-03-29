import Phaser from 'phaser';

const HIT_SPLATTER_PROFILE = {
  dropletCount: 16,
  tarCount: 7,
  mistCount: 5,
  burstRadiusX: 28,
  burstRadiusY: 16,
  dropletWidth: [2, 5],
  dropletHeight: [4, 10],
  tarWidth: [2, 5],
  tarHeight: [5, 9],
  mistWidth: [10, 18],
  mistHeight: [5, 9],
  liftDroplet: [18, 34],
  liftTar: [14, 26],
  liftMist: [10, 18],
  durationMs: 340,
  durationJitterMs: 70,
  depthOffset: 0.09
};

const HIT_SPLATTER_COLORS = {
  maroonA: 0x4f141b,
  maroonB: 0x6a1b24,
  oxbloodSpec: 0x7a2329,
  tarA: 0x080707,
  tarB: 0x141112,
  mist: 0x2a1618
};

function spawnHitParticle(scene, centerX, centerY, depth, {
  widthRange,
  heightRange,
  liftRange,
  alpha,
  color,
  xMultiplier = 0.2,
  xTravelMultiplier = 1.18,
  angleRange = 44,
  depthStep = 0
}) {
  const offsetX = Phaser.Math.Between(-HIT_SPLATTER_PROFILE.burstRadiusX, HIT_SPLATTER_PROFILE.burstRadiusX);
  const driftY = Phaser.Math.Between(-HIT_SPLATTER_PROFILE.burstRadiusY * 0.38, HIT_SPLATTER_PROFILE.burstRadiusY * 0.04);

  const particle = scene.add
    .ellipse(
      centerX + offsetX * xMultiplier,
      centerY + Phaser.Math.Between(-4, 3),
      Phaser.Math.Between(widthRange[0], widthRange[1]),
      Phaser.Math.Between(heightRange[0], heightRange[1]),
      color,
      alpha
    )
    .setDepth(depth + HIT_SPLATTER_PROFILE.depthOffset + depthStep);

  scene.tweens.add({
    targets: particle,
    x: centerX + offsetX * xTravelMultiplier,
    y: centerY - Phaser.Math.Between(liftRange[0], liftRange[1]) + driftY,
    alpha: 0,
    angle: Phaser.Math.Between(-angleRange, angleRange),
    duration: HIT_SPLATTER_PROFILE.durationMs + Phaser.Math.Between(-HIT_SPLATTER_PROFILE.durationJitterMs, HIT_SPLATTER_PROFILE.durationJitterMs),
    ease: 'Cubic.easeOut',
    onComplete: () => particle.destroy()
  });
}

export function triggerEnemyHitSplatterBurst(scene, { x, y, depth = 6 } = {}) {
  if (!scene) {
    return;
  }

  const centerX = x ?? 0;
  const centerY = y ?? 0;

  const punctureFlash = scene.add
    .ellipse(centerX, centerY, 18, 8, HIT_SPLATTER_COLORS.maroonA, 0.44)
    .setStrokeStyle(1, HIT_SPLATTER_COLORS.tarA, 0.45)
    .setDepth(depth + HIT_SPLATTER_PROFILE.depthOffset - 0.01);

  scene.tweens.add({
    targets: punctureFlash,
    scaleX: 1.55,
    scaleY: 1.2,
    alpha: 0,
    duration: 180,
    ease: 'Quad.easeOut',
    onComplete: () => punctureFlash.destroy()
  });

  for (let index = 0; index < HIT_SPLATTER_PROFILE.dropletCount; index += 1) {
    spawnHitParticle(scene, centerX, centerY, depth, {
      widthRange: HIT_SPLATTER_PROFILE.dropletWidth,
      heightRange: HIT_SPLATTER_PROFILE.dropletHeight,
      liftRange: HIT_SPLATTER_PROFILE.liftDroplet,
      alpha: 0.94,
      color: index % 4 === 0 ? HIT_SPLATTER_COLORS.oxbloodSpec : index % 2 === 0 ? HIT_SPLATTER_COLORS.maroonB : HIT_SPLATTER_COLORS.maroonA,
      depthStep: index * 0.001
    });
  }

  for (let index = 0; index < HIT_SPLATTER_PROFILE.tarCount; index += 1) {
    spawnHitParticle(scene, centerX, centerY, depth, {
      widthRange: HIT_SPLATTER_PROFILE.tarWidth,
      heightRange: HIT_SPLATTER_PROFILE.tarHeight,
      liftRange: HIT_SPLATTER_PROFILE.liftTar,
      alpha: 0.84,
      color: index % 2 === 0 ? HIT_SPLATTER_COLORS.tarA : HIT_SPLATTER_COLORS.tarB,
      xMultiplier: 0.14,
      xTravelMultiplier: 1.26,
      angleRange: 50,
      depthStep: 0.04 + index * 0.001
    });
  }

  for (let index = 0; index < HIT_SPLATTER_PROFILE.mistCount; index += 1) {
    spawnHitParticle(scene, centerX, centerY, depth, {
      widthRange: HIT_SPLATTER_PROFILE.mistWidth,
      heightRange: HIT_SPLATTER_PROFILE.mistHeight,
      liftRange: HIT_SPLATTER_PROFILE.liftMist,
      alpha: 0.2,
      color: HIT_SPLATTER_COLORS.mist,
      xMultiplier: 0.16,
      xTravelMultiplier: 1.12,
      angleRange: 30,
      depthStep: 0.02 + index * 0.001
    });
  }
}
