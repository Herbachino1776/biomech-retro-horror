import { ASSET_KEYS } from '../../data/assetKeys.js';
import { PLAYER, WORLD } from '../../data/milestone1Config.js';
import { bossPitRunState } from '../../systems/BossPitRunState.js';

const PIT_DIFFICULTY_PRESETS = {
  easy: {
    health: 5,
    contactDamage: 1,
    contactDamageCooldownMs: 1800,
    attackCooldownMs: 4320,
    attackTelegraphMs: 1120,
    attackRecoveryMs: 920,
    approachSpeed: 32,
    idleAdvanceSpeed: 12,
    attackSpeed: 162,
    attackLiftVelocity: 0,
    hurtRecoverMs: 290,
    hurtRecoilVelocityX: 70,
    hurtRecoilVelocityY: -48,
    groundBurst: { cooldownMs: 9800, windupMs: 1480, activeMs: 120, recoveryMs: 1120 },
    projectile: { cooldownMs: 7200, windupMs: 1180, recoveryMs: 1040, speed: 196, lifetimeMs: 1600 }
  }
};

const difficultyTier = 'easy';
const selectedDifficulty = PIT_DIFFICULTY_PRESETS[difficultyTier];
const bootstrap = {
  sceneKey: 'Chamber02BossPitScene',
  worldWidth: 1920,
  spawnX: 392,
  spawnY: PLAYER.startY,
  floorColliderHeight: 72,
  floorColliderCenterYOffset: 28,
  cameraLerp: { x: 0.08, y: 0.08 },
  portraitFollowOffsetX: -112,
  desktopFollowOffsetX: -128
};

const floorPlaneY = WORLD.floorY + bootstrap.floorColliderCenterYOffset - bootstrap.floorColliderHeight / 2;

export const chamber02BossPitConfig = {
  encounterId: 'chamber02-bosspit',
  rewardGrantId: 'chamber02-bosspit-01-witness',
  bootstrap,
  returnFlow: {
    returnSceneKey: 'Chamber02Scene',
    returnXOffset: 56,
    returnYOffset: -34
  },
  altars: {
    presentation: [
      { id: 'west-watch-altar', x: 430, y: WORLD.floorY - 102, width: 174, height: 174, tint: 0xffffff, alpha: 0.96 },
      { id: 'east-watch-altar', x: 1110, y: WORLD.floorY - 102, width: 174, height: 174, tint: 0xffffff, alpha: 0.96 },
      { id: 'return-altar', x: 1530, y: WORLD.floorY - 102, width: 208, height: 208, tint: 0xf1e4cd, alpha: 0.84 }
    ],
    returnAltarId: 'return-altar',
    altarImageKey: ASSET_KEYS.bossPit02AltarTrap,
    returnAltarImageKey: ASSET_KEYS.bossPit02AltarSuper,
    altarImageFallbackKey: ASSET_KEYS.bossPit02AltarTrap,
    interaction: { zoneWidth: 196, zoneHeight: 212, promptOffsetY: -170, inactivePrompt: '', activePrompt: '' }
  },
  visuals: {
    backgroundImageKey: ASSET_KEYS.bossPit02BackgroundAshProphecyHall,
    backgroundY: 210,
    backgroundHeight: 480,
    backgroundAlpha: 0.9
  },
  audio: {
    ambient: { key: ASSET_KEYS.ambientChamber02Loop01, volume: 0.1 }
  },
  victory: {
    preExplosionShakeMs: 3000,
    preExplosionShakeIntensity: 0.0058,
    goreFountainCadenceMs: 86,
    explosionFadeStartDelayMs: 100,
    explosionFadeDurationMs: 320,
    postExplosionDespawnDelayMs: 560
  },
  arrival: {
    lockDurationMs: 2000,
    impactDelayAfterFadeInMs: 48,
    shakeDurationMs: 2000,
    shakeIntensity: 0.0094,
    intimidationGrowlVolume: 0.364,
    intimidationZoomMultiplier: 1.72,
    intimidationZoomInDurationMs: 220,
    zoomReturnDurationMs: 480
  },
  deathCamera: {
    focusLerp: { x: 0.12, y: 0.12 },
    focusOffsetX: -12,
    focusOffsetY: -24,
    zoomScale: 1.2,
    zoomInDurationMs: 250,
    zoomOutDurationMs: 280
  },
  deathPayoffPose: { maxUpwardSnapPx: 8 },
  boss: {
    name: 'THE STARVED PROPHET OF ASH',
    subtitle: 'Ash Prophecy Litigator',
    difficultyTier,
    spawnX: 960,
    spawnY: floorPlaneY,
    floorPlaneY,
    textureKey: ASSET_KEYS.bossPit02StarvedProphetOfAsh,
    health: selectedDifficulty.health,
    contactDamage: selectedDifficulty.contactDamage,
    contactDamageCooldownMs: selectedDifficulty.contactDamageCooldownMs,
    attackCooldownMs: selectedDifficulty.attackCooldownMs,
    attackTelegraphMs: selectedDifficulty.attackTelegraphMs,
    attackRecoveryMs: selectedDifficulty.attackRecoveryMs,
    attackRange: 194,
    approachRange: 324,
    approachSpeed: selectedDifficulty.approachSpeed,
    idleAdvanceSpeed: selectedDifficulty.idleAdvanceSpeed,
    windupDriftSpeed: 9,
    attackSpeed: selectedDifficulty.attackSpeed,
    attackLiftVelocity: selectedDifficulty.attackLiftVelocity,
    hitPulseMs: 260,
    hurtRecoverMs: selectedDifficulty.hurtRecoverMs,
    hurtRecoilVelocityX: selectedDifficulty.hurtRecoilVelocityX,
    hurtRecoilVelocityY: selectedDifficulty.hurtRecoilVelocityY,
    body: { width: 92, height: 122, offsetX: 88, offsetY: 152 },
    audioProfile: 'miniboss',
    poise: { max: 5, recoverDelayMs: 1900, recoverPerSecond: 1.1, staggerDurationMs: 2300, finisherRange: 148 },
    revealViewportPadding: 72,
    presentation: {
      display: { width: 352, height: 372 },
      origin: { x: 0.52, y: 0.986 },
      normalization: {
        visibleFootOffsetY: 96
      },
      alpha: 0.99,
      tint: 0xded8cb,
      scaleX: 1,
      scaleY: 1
    },
    groundBurst: {
      enabled: true,
      cooldownMs: selectedDifficulty.groundBurst.cooldownMs,
      windupMs: selectedDifficulty.groundBurst.windupMs,
      activeMs: selectedDifficulty.groundBurst.activeMs,
      recoveryMs: selectedDifficulty.groundBurst.recoveryMs,
      minRange: 120,
      maxRange: 390,
      radius: 128,
      damage: 1,
      yTolerance: 150
    },
    projectile: {
      textureKey: ASSET_KEYS.sector02PressureShardProjectile,
      cooldownMs: selectedDifficulty.projectile.cooldownMs,
      windupMs: selectedDifficulty.projectile.windupMs,
      recoveryMs: selectedDifficulty.projectile.recoveryMs,
      minRange: 220,
      maxRange: 500,
      verticalTolerance: 156,
      spawnOffsetX: 76,
      spawnOffsetY: -108,
      speed: selectedDifficulty.projectile.speed,
      damage: 1,
      lifetimeMs: selectedDifficulty.projectile.lifetimeMs,
      rotationSpeed: 380,
      telegraphRadiusX: 84,
      telegraphRadiusY: 28
    }
  },
  runState: {
    markCompleted: () => bossPitRunState.markChamber02BossPitCompleted(),
    hasRewardGranted: () => bossPitRunState.hasChamber02BossPitRewardGranted(),
    markRewardGranted: () => bossPitRunState.markChamber02BossPitRewardGranted()
  }
};
