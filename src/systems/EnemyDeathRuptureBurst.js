import Phaser from 'phaser';

const REGULAR_PROFILE = {
  bloodCount: 42,
  heavyBloodCount: 6,
  tarCount: 20,
  mistCount: 12,
  bloodWidth: [2, 6],
  bloodHeight: [6, 12],
  heavyBloodWidth: [4, 8],
  heavyBloodHeight: [9, 14],
  tarWidth: [2, 5],
  tarHeight: [5, 10],
  mistWidth: [14, 24],
  mistHeight: [7, 13],
  burstRadiusX: 90,
  burstRadiusY: 52,
  bloodLift: [38, 74],
  heavyBloodLift: [24, 50],
  tarLift: [26, 52],
  mistLift: [14, 34],
  durationMs: 660,
  durationJitterMs: 120,
  depthOffset: 0.14
};

const ELITE_PROFILE = {
  ...REGULAR_PROFILE,
  bloodCount: 60,
  heavyBloodCount: 10,
  tarCount: 30,
  mistCount: 20,
  bloodWidth: [3, 7],
  bloodHeight: [7, 14],
  heavyBloodWidth: [5, 9],
  heavyBloodHeight: [10, 16],
  tarWidth: [2, 6],
  tarHeight: [6, 11],
  mistWidth: [16, 30],
  mistHeight: [8, 16],
  burstRadiusX: 128,
  burstRadiusY: 66,
  bloodLift: [48, 96],
  heavyBloodLift: [34, 66],
  tarLift: [30, 64],
  mistLift: [18, 42],
  durationMs: 760,
  durationJitterMs: 150
};

const COLORS = {
  bloodA: 0x4a1018,
  bloodB: 0x631620,
  bloodSpec: 0x74212a,
  bloodHeavy: 0x381015,
  tarA: 0x0b0a0a,
  tarB: 0x151011,
  mist: 0x271517
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

  for (let index = 0; index < profile.heavyBloodCount; index += 1) {
    spawnBurstParticle(scene, centerX, centerY, depth, profile, {
      widthRange: profile.heavyBloodWidth,
      heightRange: profile.heavyBloodHeight,
      liftRange: profile.heavyBloodLift,
      alpha: 0.9,
      color: index % 2 === 0 ? COLORS.bloodHeavy : COLORS.bloodB,
      xMultiplier: 0.13,
      xTravelMultiplier: 1.18,
      angleRange: 54,
      depthStep: 0.09 + index * 0.001
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
