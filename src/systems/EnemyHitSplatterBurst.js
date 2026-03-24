import Phaser from 'phaser';

const HIT_SPLATTER_PROFILE = {
  dropletCount: 13,
  tarCount: 5,
  mistCount: 4,
  burstRadiusX: 24,
  burstRadiusY: 14,
  dropletWidth: [1, 4],
  dropletHeight: [3, 8],
  tarWidth: [2, 4],
  tarHeight: [4, 7],
  mistWidth: [8, 16],
  mistHeight: [4, 8],
  liftDroplet: [14, 28],
  liftTar: [10, 20],
  liftMist: [8, 16],
  durationMs: 290,
  durationJitterMs: 60,
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
  const driftY = Phaser.Math.Between(-HIT_SPLATTER_PROFILE.burstRadiusY * 0.34, HIT_SPLATTER_PROFILE.burstRadiusY * 0.08);

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

  for (let index = 0; index < HIT_SPLATTER_PROFILE.dropletCount; index += 1) {
    spawnHitParticle(scene, centerX, centerY, depth, {
      widthRange: HIT_SPLATTER_PROFILE.dropletWidth,
      heightRange: HIT_SPLATTER_PROFILE.dropletHeight,
      liftRange: HIT_SPLATTER_PROFILE.liftDroplet,
      alpha: 0.9,
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
