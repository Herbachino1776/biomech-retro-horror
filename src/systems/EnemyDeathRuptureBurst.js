import Phaser from 'phaser';

const REGULAR_PROFILE = {
  ringWidth: 70,
  ringHeight: 24,
  ringAlpha: 0.24,
  bloodCount: 34,
  tarCount: 15,
  mistCount: 10,
  bloodWidth: [2, 5],
  bloodHeight: [5, 10],
  tarWidth: [2, 4],
  tarHeight: [4, 8],
  mistWidth: [12, 22],
  mistHeight: [6, 12],
  burstRadiusX: 76,
  burstRadiusY: 42,
  bloodLift: [30, 60],
  tarLift: [20, 42],
  mistLift: [12, 28],
  durationMs: 560,
  durationJitterMs: 110,
  depthOffset: 0.14
};

const ELITE_PROFILE = {
  ...REGULAR_PROFILE,
  ringWidth: 92,
  ringHeight: 30,
  ringAlpha: 0.28,
  bloodCount: 52,
  tarCount: 24,
  mistCount: 16,
  bloodWidth: [3, 6],
  bloodHeight: [6, 12],
  tarWidth: [2, 5],
  tarHeight: [5, 10],
  mistWidth: [15, 28],
  mistHeight: [8, 15],
  burstRadiusX: 110,
  burstRadiusY: 58,
  bloodLift: [40, 84],
  tarLift: [26, 56],
  mistLift: [16, 36],
  durationMs: 680,
  durationJitterMs: 130
};

const COLORS = {
  bloodA: 0x5a131c,
  bloodB: 0x761a24,
  bloodSpec: 0x8b252e,
  tarA: 0x0b0a0a,
  tarB: 0x171113,
  mist: 0x311a1d
};

function spawnBurstParticle(scene, centerX, centerY, baseDepth, profile, {
  widthRange,
  heightRange,
  liftRange,
  alpha,
  color,
  xMultiplier = 0.2,
  xTravelMultiplier = 1.22,
  angleRange = 72,
  depthStep = 0
}) {
  const offsetX = Phaser.Math.Between(-profile.burstRadiusX, profile.burstRadiusX);
  const driftY = Phaser.Math.Between(-profile.burstRadiusY * 0.34, profile.burstRadiusY * 0.1);
  const particle = scene.add
    .ellipse(
      centerX + offsetX * xMultiplier,
      centerY + Phaser.Math.Between(-6, 4),
      Phaser.Math.Between(widthRange[0], widthRange[1]),
      Phaser.Math.Between(heightRange[0], heightRange[1]),
      color,
      alpha
    )
    .setDepth(baseDepth + profile.depthOffset + depthStep);

  scene.tweens.add({
    targets: particle,
    x: centerX + offsetX * xTravelMultiplier,
    y: centerY - Phaser.Math.Between(liftRange[0], liftRange[1]) + driftY,
    alpha: 0,
    angle: Phaser.Math.Between(-angleRange, angleRange),
    duration: profile.durationMs + Phaser.Math.Between(-profile.durationJitterMs, profile.durationJitterMs),
    ease: 'Cubic.easeOut',
    onComplete: () => particle.destroy()
  });
}

export function triggerEnemyDeathRuptureBurst(scene, { x, y, depth = 6, isElite = false } = {}) {
  if (!scene) {
    return;
  }

  const profile = isElite ? ELITE_PROFILE : REGULAR_PROFILE;
  const centerX = x ?? 0;
  const centerY = y ?? 0;

  const releaseRing = scene.add
    .ellipse(centerX, centerY + 2, profile.ringWidth, profile.ringHeight, COLORS.bloodA, profile.ringAlpha)
    .setStrokeStyle(1, COLORS.tarA, 0.3)
    .setDepth(depth + profile.depthOffset - 0.01);

  scene.tweens.add({
    targets: releaseRing,
    scaleX: 2.05,
    scaleY: 1.36,
    alpha: 0,
    duration: profile.durationMs + 120,
    ease: 'Quad.easeOut',
    onComplete: () => releaseRing.destroy()
  });

  for (let index = 0; index < profile.bloodCount; index += 1) {
    spawnBurstParticle(scene, centerX, centerY, depth, profile, {
      widthRange: profile.bloodWidth,
      heightRange: profile.bloodHeight,
      liftRange: profile.bloodLift,
      alpha: 0.94,
      color: index % 5 === 0 ? COLORS.bloodSpec : index % 3 === 0 ? COLORS.bloodB : COLORS.bloodA,
      xMultiplier: 0.16,
      xTravelMultiplier: 1.32,
      angleRange: 86,
      depthStep: index * 0.0008
    });
  }

  for (let index = 0; index < profile.tarCount; index += 1) {
    spawnBurstParticle(scene, centerX, centerY, depth, profile, {
      widthRange: profile.tarWidth,
      heightRange: profile.tarHeight,
      liftRange: profile.tarLift,
      alpha: 0.9,
      color: index % 2 === 0 ? COLORS.tarA : COLORS.tarB,
      xMultiplier: 0.18,
      xTravelMultiplier: 1.28,
      angleRange: 58,
      depthStep: 0.04 + index * 0.001
    });
  }

  for (let index = 0; index < profile.mistCount; index += 1) {
    spawnBurstParticle(scene, centerX, centerY, depth, profile, {
      widthRange: profile.mistWidth,
      heightRange: profile.mistHeight,
      liftRange: profile.mistLift,
      alpha: 0.24,
      color: COLORS.mist,
      xMultiplier: 0.14,
      xTravelMultiplier: 1.14,
      angleRange: 34,
      depthStep: 0.02 + index * 0.001
    });
  }
}
