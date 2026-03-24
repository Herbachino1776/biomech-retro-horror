import Phaser from 'phaser';

const REGULAR_PROFILE = {
  ringWidth: 54,
  ringHeight: 19,
  ringAlpha: 0.21,
  bloodCount: 24,
  tarCount: 10,
  mistCount: 6,
  bloodWidth: [2, 4],
  bloodHeight: [4, 8],
  tarWidth: [1, 3],
  tarHeight: [3, 6],
  mistWidth: [10, 18],
  mistHeight: [5, 10],
  burstRadiusX: 58,
  burstRadiusY: 30,
  bloodLift: [22, 44],
  tarLift: [14, 30],
  mistLift: [10, 20],
  durationMs: 420,
  durationJitterMs: 80,
  depthOffset: 0.14
};

const ELITE_PROFILE = {
  ...REGULAR_PROFILE,
  ringWidth: 74,
  ringHeight: 24,
  ringAlpha: 0.24,
  bloodCount: 36,
  tarCount: 16,
  mistCount: 9,
  burstRadiusX: 78,
  burstRadiusY: 42,
  bloodLift: [28, 60],
  tarLift: [18, 42],
  mistLift: [12, 28],
  durationMs: 500,
  durationJitterMs: 100
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
  xMultiplier = 0.14,
  angleRange = 54,
  depthStep = 0
}) {
  const offsetX = Phaser.Math.Between(-profile.burstRadiusX, profile.burstRadiusX);
  const driftY = Phaser.Math.Between(-profile.burstRadiusY * 0.2, profile.burstRadiusY * 0.16);
  const particle = scene.add
    .ellipse(
      centerX + offsetX * xMultiplier,
      centerY + Phaser.Math.Between(-4, 6),
      Phaser.Math.Between(widthRange[0], widthRange[1]),
      Phaser.Math.Between(heightRange[0], heightRange[1]),
      color,
      alpha
    )
    .setDepth(baseDepth + profile.depthOffset + depthStep);

  scene.tweens.add({
    targets: particle,
    x: centerX + offsetX,
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
    .setStrokeStyle(1, COLORS.tarA, 0.26)
    .setDepth(depth + profile.depthOffset - 0.01);

  scene.tweens.add({
    targets: releaseRing,
    scaleX: 1.85,
    scaleY: 1.25,
    alpha: 0,
    duration: profile.durationMs,
    ease: 'Quad.easeOut',
    onComplete: () => releaseRing.destroy()
  });

  for (let index = 0; index < profile.bloodCount; index += 1) {
    spawnBurstParticle(scene, centerX, centerY, depth, profile, {
      widthRange: profile.bloodWidth,
      heightRange: profile.bloodHeight,
      liftRange: profile.bloodLift,
      alpha: 0.92,
      color: index % 5 === 0 ? COLORS.bloodSpec : index % 3 === 0 ? COLORS.bloodB : COLORS.bloodA,
      xMultiplier: 0.1,
      angleRange: 70,
      depthStep: index * 0.0008
    });
  }

  for (let index = 0; index < profile.tarCount; index += 1) {
    spawnBurstParticle(scene, centerX, centerY, depth, profile, {
      widthRange: profile.tarWidth,
      heightRange: profile.tarHeight,
      liftRange: profile.tarLift,
      alpha: 0.88,
      color: index % 2 === 0 ? COLORS.tarA : COLORS.tarB,
      xMultiplier: 0.12,
      angleRange: 42,
      depthStep: 0.04 + index * 0.001
    });
  }

  for (let index = 0; index < profile.mistCount; index += 1) {
    spawnBurstParticle(scene, centerX, centerY, depth, profile, {
      widthRange: profile.mistWidth,
      heightRange: profile.mistHeight,
      liftRange: profile.mistLift,
      alpha: 0.2,
      color: COLORS.mist,
      xMultiplier: 0.09,
      angleRange: 28,
      depthStep: 0.02 + index * 0.001
    });
  }
}
