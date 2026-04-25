import { ASSET_KEYS } from '../../data/assetKeys.js';
import { PLAYER, WORLD } from '../../data/milestone1Config.js';
import { bossPitRunState } from '../../systems/BossPitRunState.js';
import { HalfSkullMiniboss } from '../../entities/HalfSkullMiniboss.js';

const PIT_DIFFICULTY_PRESETS = {
  easy: {
    health: 5,
    contactDamage: 1,
    contactDamageCooldownMs: 1800,
    attackCooldownMs: 2980,
    attackTelegraphMs: 760,
    attackRecoveryMs: 640,
    approachSpeed: 42,
    idleAdvanceSpeed: 18,
    attackSpeed: 188,
    attackLiftVelocity: -142,
    hurtRecoverMs: 290,
    hurtRecoilVelocityX: 70,
    hurtRecoilVelocityY: -48
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
    name: 'THE PIT JUDGE',
    subtitle: 'Emergency Boss Replacement',
    bossClass: HalfSkullMiniboss,
    difficultyTier,
    spawnX: 960,
    spawnY: floorPlaneY,
    floorPlaneY,
    textureKey: ASSET_KEYS.bossPit20HornedMothJudge,
    health: selectedDifficulty.health,
    contactDamage: selectedDifficulty.contactDamage,
    contactDamageCooldownMs: selectedDifficulty.contactDamageCooldownMs,
    attackCooldownMs: selectedDifficulty.attackCooldownMs,
    attackTelegraphMs: selectedDifficulty.attackTelegraphMs,
    attackRecoveryMs: selectedDifficulty.attackRecoveryMs,
    attackRange: 214,
    approachRange: 356,
    approachSpeed: selectedDifficulty.approachSpeed,
    idleAdvanceSpeed: selectedDifficulty.idleAdvanceSpeed,
    windupDriftSpeed: 14,
    attackSpeed: selectedDifficulty.attackSpeed,
    attackLiftVelocity: selectedDifficulty.attackLiftVelocity,
    hitPulseMs: 260,
    hurtRecoverMs: selectedDifficulty.hurtRecoverMs,
    hurtRecoilVelocityX: selectedDifficulty.hurtRecoilVelocityX,
    hurtRecoilVelocityY: selectedDifficulty.hurtRecoilVelocityY,
    body: { width: 92, height: 122, offsetX: 124, offsetY: 168 },
    audioProfile: 'miniboss',
    poise: { max: 5, recoverDelayMs: 1900, recoverPerSecond: 1.1, staggerDurationMs: 2300, finisherRange: 148 },
    revealViewportPadding: 72,
    presentation: {
      display: { width: 398, height: 404 },
      origin: { x: 0.52, y: 0.986 },
      normalization: {
        visibleFootOffsetY: 110
      },
      alpha: 0.99,
      tint: 0xded8cb,
      scaleX: 1,
      scaleY: 1
    },
    simpleAttackCycleDamage: {
      enabled: true,
      damage: 1
    }
  },
  runState: {
    markCompleted: () => bossPitRunState.markChamber02BossPitCompleted(),
    hasRewardGranted: () => bossPitRunState.hasChamber02BossPitRewardGranted(),
    markRewardGranted: () => bossPitRunState.markChamber02BossPitRewardGranted()
  }
};
