import Phaser from 'phaser';

const HIT_SPLATTER_PROFILE = {
  dropletCount: 8,
  tarCount: 3,
  mistCount: 2,
  burstRadiusX: 16,
  burstRadiusY: 10,
  dropletWidth: [1, 3],
  dropletHeight: [2, 6],
  tarWidth: [1, 2],
  tarHeight: [2, 4],
  mistWidth: [5, 10],
  mistHeight: [3, 6],
  liftDroplet: [8, 18],
  liftTar: [6, 12],
  liftMist: [4, 10],
  durationMs: 200,
  durationJitterMs: 40,
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
  xMultiplier = 0.12,
  angleRange = 36,
  depthStep = 0
}) {
  const offsetX = Phaser.Math.Between(-HIT_SPLATTER_PROFILE.burstRadiusX, HIT_SPLATTER_PROFILE.burstRadiusX);
  const driftY = Phaser.Math.Between(-HIT_SPLATTER_PROFILE.burstRadiusY * 0.2, HIT_SPLATTER_PROFILE.burstRadiusY * 0.18);

  const particle = scene.add
    .ellipse(
      centerX + offsetX * xMultiplier,
      centerY + Phaser.Math.Between(-3, 4),
      Phaser.Math.Between(widthRange[0], widthRange[1]),
      Phaser.Math.Between(heightRange[0], heightRange[1]),
      color,
      alpha
    )
    .setDepth(depth + HIT_SPLATTER_PROFILE.depthOffset + depthStep);

  scene.tweens.add({
    targets: particle,
    x: centerX + offsetX,
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
      alpha: 0.88,
      color: index % 4 === 0 ? HIT_SPLATTER_COLORS.oxbloodSpec : index % 2 === 0 ? HIT_SPLATTER_COLORS.maroonB : HIT_SPLATTER_COLORS.maroonA,
      depthStep: index * 0.001
    });
  }

  for (let index = 0; index < HIT_SPLATTER_PROFILE.tarCount; index += 1) {
    spawnHitParticle(scene, centerX, centerY, depth, {
      widthRange: HIT_SPLATTER_PROFILE.tarWidth,
      heightRange: HIT_SPLATTER_PROFILE.tarHeight,
      liftRange: HIT_SPLATTER_PROFILE.liftTar,
      alpha: 0.82,
      color: index % 2 === 0 ? HIT_SPLATTER_COLORS.tarA : HIT_SPLATTER_COLORS.tarB,
      xMultiplier: 0.1,
      depthStep: 0.04 + index * 0.001
    });
  }

  for (let index = 0; index < HIT_SPLATTER_PROFILE.mistCount; index += 1) {
    spawnHitParticle(scene, centerX, centerY, depth, {
      widthRange: HIT_SPLATTER_PROFILE.mistWidth,
      heightRange: HIT_SPLATTER_PROFILE.mistHeight,
      liftRange: HIT_SPLATTER_PROFILE.liftMist,
      alpha: 0.16,
      color: HIT_SPLATTER_COLORS.mist,
      angleRange: 20,
      depthStep: 0.02 + index * 0.001
    });
  }
}
