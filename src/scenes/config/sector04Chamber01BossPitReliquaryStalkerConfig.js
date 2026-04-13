import { ASSET_KEYS } from '../../data/assetKeys.js';
import { PLAYER, WORLD } from '../../data/milestone1Config.js';
import { bossPitRunState } from '../../systems/BossPitRunState.js';

const PIT_DIFFICULTY_PRESETS = {
  easy: {
    health: 6,
    contactDamage: 1,
    contactDamageCooldownMs: 1720,
    attackCooldownMs: 4040,
    attackTelegraphMs: 1060,
    attackRecoveryMs: 860,
    approachSpeed: 34,
    idleAdvanceSpeed: 13,
    attackSpeed: 168,
    attackLiftVelocity: -26,
    hurtRecoverMs: 280,
    hurtRecoilVelocityX: 76,
    hurtRecoilVelocityY: -52,
    groundBurst: { cooldownMs: 8400, windupMs: 1320, activeMs: 130, recoveryMs: 980 },
    projectile: { cooldownMs: 6200, windupMs: 980, recoveryMs: 900, speed: 212, lifetimeMs: 1700 }
  }
};

const difficultyTier = 'easy';
const selectedDifficulty = PIT_DIFFICULTY_PRESETS[difficultyTier];
const bootstrap = {
  sceneKey: 'Sector04Chamber01BossPitReliquaryStalkerScene',
  worldWidth: 1940,
  spawnX: 386,
  spawnY: PLAYER.startY,
  floorColliderHeight: 72,
  floorColliderCenterYOffset: 28,
  cameraLerp: { x: 0.08, y: 0.08 },
  portraitFollowOffsetX: -112,
  desktopFollowOffsetX: -130
};

const floorPlaneY = WORLD.floorY + bootstrap.floorColliderCenterYOffset - bootstrap.floorColliderHeight / 2;

export const sector04Chamber01BossPitReliquaryStalkerConfig = {
  encounterId: 'sector04-chamber01-bosspit-reliquary-stalker',
  rewardGrantId: 'sector04-chamber01-bosspit-reliquary-stalker',
  bootstrap,
  returnFlow: {
    returnSceneKey: 'Sector04Chamber01Scene',
    returnXOffset: 68,
    returnYOffset: -4
  },
  altars: {
    presentation: [
      { id: 'west-watch-altar', x: 418, y: WORLD.floorY - 102, width: 174, height: 174, tint: 0xffffff, alpha: 0.94 },
      { id: 'east-watch-altar', x: 1110, y: WORLD.floorY - 102, width: 174, height: 174, tint: 0xffffff, alpha: 0.94 },
      { id: 'return-altar', x: 1542, y: WORLD.floorY - 102, width: 208, height: 208, tint: 0xead8bf, alpha: 0.86 }
    ],
    returnAltarId: 'return-altar',
    altarImageKey: ASSET_KEYS.bossPit05AltarTrap,
    returnAltarImageKey: ASSET_KEYS.bossPit05AltarSuper,
    altarImageFallbackKey: ASSET_KEYS.bossPit05AltarTrap,
    interaction: { zoneWidth: 196, zoneHeight: 212, promptOffsetY: -170, inactivePrompt: '', activePrompt: '' }
  },
  visuals: {
    backgroundImageKey: ASSET_KEYS.bossPit19BackgroundReliquaryStalker,
    backgroundY: 208,
    backgroundHeight: 484,
    backgroundAlpha: 0.9
  },
  audio: {
    ambient: { key: ASSET_KEYS.ambientChamber02Loop01, volume: 0.096 }
  },
  victory: {
    preExplosionShakeMs: 3000,
    preExplosionShakeIntensity: 0.0058,
    goreFountainCadenceMs: 82,
    explosionFadeStartDelayMs: 94,
    explosionFadeDurationMs: 320,
    postExplosionDespawnDelayMs: 560
  },
  arrival: {
    lockDurationMs: 2000,
    impactDelayAfterFadeInMs: 42,
    shakeDurationMs: 2000,
    shakeIntensity: 0.0095,
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
    name: 'THE RELIQUARY STALKER',
    subtitle: 'Reduction Crypt Bailiff',
    difficultyTier,
    spawnX: 964,
    spawnY: floorPlaneY,
    floorPlaneY,
    textureKey: ASSET_KEYS.bossPit19ReliquaryStalker,
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
      alpha: 0.99,
      tint: 0xd9ccb8,
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
    markCompleted: () => bossPitRunState.markSector04Chamber01ReliquaryStalkerBossPitCompleted(),
    hasRewardGranted: () => bossPitRunState.hasSector04Chamber01ReliquaryStalkerBossPitRewardGranted(),
    markRewardGranted: () => bossPitRunState.markSector04Chamber01ReliquaryStalkerBossPitRewardGranted()
  }
};
