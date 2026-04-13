import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { SkitterServitor } from '../entities/SkitterServitor.js';
import { EnemyProjectile } from '../entities/EnemyProjectile.js';
import { PressureDeacon } from '../entities/PressureDeacon.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import { AudioDirector } from '../audio/AudioDirector.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { PLAYER, SKITTER, WORLD } from '../data/milestone1Config.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';
import { createDirectionalCameraBias } from '../systems/DirectionalCameraBias.js';
import { restartRunFromDeath } from '../systems/RunReset.js';
import { triggerSector02BlackOilBlowout } from '../systems/Sector02BlackOilPayoff.js';
import { spawnEnemyCorpseRemains } from '../systems/EnemyCorpseRemains.js';
import { applyChamberEntryRestore, grantMajorEncounterIntegrityReward } from '../systems/VesselRunEconomy.js';
import { MajorEncounterResolution } from '../systems/MajorEncounterResolution.js';

const KILN_OF_JUDGEMENT_BOOTSTRAP = {
  sceneKey: 'Sector02Chamber03Scene',
  worldWidth: 6120,
  floorColliderHeight: 72,
  spawnX: 220,
  spawnY: PLAYER.startY,
  cameraLerp: { x: 0.08, y: 0.08 },
  portraitFollowOffsetX: -112,
  desktopFollowOffsetX: -156,
  backdropDepth: -16,
  lowerBandY: WORLD.floorY - 86,
  lowerBandHeight: 308,
  lowerBandAlpha: 0.24
};
const KILN_OF_JUDGEMENT_FLOOR_PLANE_Y = WORLD.floorY + 28 - KILN_OF_JUDGEMENT_BOOTSTRAP.floorColliderHeight / 2;

const KILN_OF_JUDGEMENT_SEGMENTS = [
  { key: ASSET_KEYS.sector02Chamber03BackgroundEntryCondensers, x: 430, y: 220, width: 920, height: 478, tint: 0xc9c8ba, alpha: 0.74, depth: -14.82 },
  { key: ASSET_KEYS.sector02Chamber03BackgroundWallModule, x: 1220, y: 216, width: 812, height: 452, tint: 0xaaa497, alpha: 0.56, depth: -14.66 },
  { key: ASSET_KEYS.sector02Chamber03BackgroundWallModule, x: 1980, y: 216, width: 812, height: 452, tint: 0x91887d, alpha: 0.54, depth: -14.64 },
  { key: ASSET_KEYS.sector02Chamber03BackgroundRefinementKiln, x: 2820, y: 216, width: 980, height: 478, tint: 0xd2c39d, alpha: 0.78, depth: -14.88 },
  { key: ASSET_KEYS.sector02Chamber03BackgroundWallModule, x: 3650, y: 216, width: 824, height: 454, tint: 0x857a71, alpha: 0.52, depth: -14.62 },
  { key: ASSET_KEYS.sector02Chamber03BackgroundThreshold, x: 4480, y: 214, width: 940, height: 462, tint: 0xc8bea8, alpha: 0.74, depth: -14.84 },
  { key: ASSET_KEYS.sector02Chamber03BackgroundBanisherAltar, x: 5340, y: 210, width: 840, height: 472, tint: 0xd8d1bc, alpha: 0.82, depth: -14.9 }
];

const KILN_OF_JUDGEMENT_RIBS = [
  { x: 980, ribWidth: 28, ribHeight: 318, archWidth: 238, archHeight: 146, alpha: 0.18, depth: -11.74 },
  { x: 2460, ribWidth: 32, ribHeight: 346, archWidth: 272, archHeight: 170, alpha: 0.2, depth: -11.82 },
  { x: 4030, ribWidth: 34, ribHeight: 362, archWidth: 298, archHeight: 178, alpha: 0.22, depth: -11.88 },
  { x: 5290, ribWidth: 36, ribHeight: 388, archWidth: 322, archHeight: 188, alpha: 0.24, depth: -11.94 }
];

const KILN_OF_JUDGEMENT_BUTTRESSES = [
  { x: 1490, width: 210, height: 262, capWidth: 298, capHeight: 26, alpha: 0.16, depth: -10.9 },
  { x: 2870, width: 252, height: 294, capWidth: 338, capHeight: 28, alpha: 0.18, depth: -10.94 },
  { x: 4300, width: 230, height: 278, capWidth: 316, capHeight: 28, alpha: 0.2, depth: -10.92 },
  { x: 5300, width: 286, height: 322, capWidth: 380, capHeight: 30, alpha: 0.22, depth: -10.98 }
];

const KILN_SKITTER_BASIC_01 = {
  ...SKITTER,
  textureKey: ASSET_KEYS.sector02Chamber03EnemyBasic01,
  speed: 54,
  aggroRange: 250,
  patrolDistance: 120,
  presentation: {
    alpha: 0.97,
    display: { width: 178, height: 148 },
    origin: { x: 0.52, y: 0.92 },
    stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.44 }
  },
  eyeGlowColor: 0xe0d19a,
  eyeGlowWidth: 32,
  eyeGlowHeight: 14,
  eyeGlowOffsetX: 14,
  eyeGlowYOffset: 10,
  eyeGlowAlphaBase: 0.3,
  eyeGlowWindupAlphaGain: 0.28,
  body: { width: 54, height: 30, offsetX: 10, offsetY: 18 }
};

const KILN_SKITTER_BASIC_02 = {
  ...KILN_SKITTER_BASIC_01,
  textureKey: ASSET_KEYS.sector02Chamber03EnemyBasic02,
  speed: 58,
  patrolDistance: 134,
  presentation: {
    ...KILN_SKITTER_BASIC_01.presentation,
    display: { width: 186, height: 152 }
  },
  eyeGlowColor: 0xe6dfb6
};

const KILN_SKITTER_ELITE = {
  ...SKITTER,
  textureKey: ASSET_KEYS.sector02Chamber03EnemyElite,
  variantName: 'KILN BANISHER CUSTODIAN',
  health: 7,
  speed: 46,
  aggroRange: 292,
  attackCooldownMs: 3040,
  windupMs: 860,
  attackActiveMs: 320,
  attackRecoveryMs: 660,
  hesitationMs: 600,
  attackTriggerRange: 166,
  attackRange: 198,
  preferredRange: 142,
  rangeBand: 20,
  lungeSpeedBonus: 102,
  lungeJumpVelocity: -92,
  recoilVelocityX: 144,
  recoilVelocityY: -84,
  patrolDistance: 96,
  body: { width: 74, height: 44, offsetX: 28, offsetY: 90 },
  presentation: {
    alpha: 0.98,
    display: { width: 292, height: 226 },
    origin: { x: 0.52, y: 0.965 },
    stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.46 }
  },
  eyeGlowColor: 0xf0e4b6,
  eyeGlowWidth: 42,
  eyeGlowHeight: 18,
  eyeGlowOffsetX: 20,
  eyeGlowYOffset: 18,
  eyeGlowAlphaBase: 0.42,
  eyeGlowWindupAlphaGain: 0.44,
  poise: {
    max: 4,
    recoverDelayMs: 1700,
    recoverPerSecond: 1.1,
    staggerDurationMs: 1460,
    finisherRange: 128
  },
  audioProfile: 'tollkeeper'
};

const KILN_ELITE_PROJECTILE = {
  cooldownMs: 4600,
  windupMs: 660,
  recoveryMs: 820,
  minRange: 248,
  maxRange: 500,
  verticalTolerance: 144,
  spawnOffsetX: 60,
  spawnOffsetY: -84,
  speed: 236,
  damage: 1,
  lifetimeMs: 1850,
  rotationSpeed: 400,
  telegraphRadiusX: 74,
  telegraphRadiusY: 22
};

const MAJOR_FINISHER = {
  ritePromptText: 'RITE FINISHER READY',
  elite: { poiseDamagePerHit: 1, shakeDurationMs: 160, shakeIntensity: 0.0054 },
  boss: { poiseDamagePerHit: 1, shakeDurationMs: 420, shakeIntensity: 0.012, subtitle: 'RITE WINDOW: CORE EXPOSED' }
};

const KILN_ENCOUNTER_POCKETS = [
  {
    id: 'kiln-condensers', label: 'CONDENSER THROAT', zoneX: 1280, zoneY: WORLD.floorY - 72, zoneWidth: 560, zoneHeight: 226,
    markerWidth: 336, markerHeight: 74, markerAlpha: 0.08, promptOffsetY: -138,
    enemies: [
      { type: 'basic01', x: 1115, y: PLAYER.startY, patrolDistance: 86 },
      { type: 'basic02', x: 1360, y: PLAYER.startY, patrolDistance: 118, wakeDelayMs: 90 }
    ]
  },
  {
    id: 'kiln-refinement', label: 'REFINEMENT KILN', zoneX: 2870, zoneY: WORLD.floorY - 74, zoneWidth: 820, zoneHeight: 236,
    markerWidth: 438, markerHeight: 82, markerAlpha: 0.1, promptOffsetY: -148,
    enemies: [
      { type: 'basic02', x: 2485, y: PLAYER.startY, patrolDistance: 122 },
      { type: 'basic01', x: 2720, y: PLAYER.startY, patrolDistance: 84, wakeDelayMs: 60 },
      { type: 'basic01', x: 2890, y: PLAYER.startY, patrolDistance: 96, wakeDelayMs: 110 },
      { type: 'elite', x: 3055, y: PLAYER.startY, patrolDistance: 88, wakeDelayMs: 150, projectileCadence: 'measured' },
      { type: 'basic02', x: 3205, y: PLAYER.startY, patrolDistance: 92, wakeDelayMs: 190 }
    ]
  },
  {
    id: 'kiln-threshold', label: 'BANISHER THRESHOLD', zoneX: 4700, zoneY: WORLD.floorY - 76, zoneWidth: 980, zoneHeight: 242,
    markerWidth: 496, markerHeight: 84, markerAlpha: 0.12, promptOffsetY: -154,
    enemies: [
      { type: 'basic01', x: 4330, y: PLAYER.startY, patrolDistance: 102 },
      { type: 'basic02', x: 4635, y: PLAYER.startY, patrolDistance: 122, wakeDelayMs: 90 },
      { type: 'basic01', x: 4870, y: PLAYER.startY, patrolDistance: 104, wakeDelayMs: 140 },
      { type: 'elite', x: 5200, y: PLAYER.startY, patrolDistance: 92, wakeDelayMs: 220, projectileCadence: 'measured' },
      { type: 'basic01', x: 5030, y: PLAYER.startY, patrolDistance: 96, wakeDelayMs: 180 }
    ]
  }
];

const KILN_LORE = {
  cutsceneId: 'sector02-chamber03-kiln-altar',
  anchor: {
    id: 'kiln-judgement-altar',
    label: 'READ THE KILN ALTAR',
    zoneX: 3880,
    zoneY: WORLD.floorY - 80,
    zoneWidth: 220,
    zoneHeight: 210,
    promptOffsetY: -176,
    altarX: 3880,
    altarY: WORLD.floorY - 108,
    altarDisplayWidth: 190,
    altarDisplayHeight: 190,
    supportWidth: 264,
    supportHeight: 134,
    supportTopY: WORLD.floorY - 82,
    shadowWidth: 324,
    wallPlateWidth: 612,
    wallPlateHeight: 346,
    wallPlateY: WORLD.floorY - 156,
    muralX: 3880,
    muralY: 216,
    muralWidth: 452,
    muralHeight: 278,
    muralBackingWidth: 548,
    muralBackingHeight: 334
  }
};

const KILN_FORWARD_GATE = {
  barrierX: 5450,
  barrierY: WORLD.floorY - 70,
  barrierWidth: 96,
  barrierHeight: 236,
  thresholdX: 5595,
  thresholdY: WORLD.floorY - 76,
  thresholdWidth: 210,
  thresholdHeight: 220,
  promptOffsetY: -166
};

const KILN_SORROW_ENGINE = {
  name: 'THE SORROW ENGINE',
  subtitle: 'Banisher Altar Rupture Core',
  health: 10,
  contactDamage: 2,
  contactDamageCooldownMs: 1100,
  attackCooldownMs: 2960,
  attackTelegraphMs: 760,
  attackRecoveryMs: 760,
  attackRange: 208,
  approachRange: 370,
  approachSpeed: 44,
  idleAdvanceSpeed: 18,
  windupDriftSpeed: 11,
  attackSpeed: 206,
  attackLiftVelocity: -130,
  hitPulseMs: 300,
  hurtRecoverMs: 240,
  hurtRecoilVelocityX: 96,
  hurtRecoilVelocityY: -68,
  spawnX: 5334,
  spawnY: KILN_OF_JUDGEMENT_FLOOR_PLANE_Y,
  floorPlaneY: KILN_OF_JUDGEMENT_FLOOR_PLANE_Y,
  activationX: 5020,
  body: { width: 102, height: 136, offsetX: 108, offsetY: 148 },
  audioProfile: 'miniboss',
  poise: {
    max: 8,
    recoverDelayMs: 2200,
    recoverPerSecond: 1,
    staggerDurationMs: 3000,
    finisherRange: 172
  },
  presentation: {
    display: { width: 346, height: 372 },
    origin: { x: 0.54, y: 0.988 },
    alpha: 0.99,
    tint: 0xd8c9b6,
    scaleX: 1,
    scaleY: 1
  },

  lineSweep: {
    enabled: true,
    cooldownMs: 7600,
    windupMs: 1120,
    activeMs: 260,
    recoveryMs: 900,
    minRange: 210,
    maxRange: 580,
    width: 152,
    originOffsetX: 36,
    originOffsetY: -24,
    damage: 2,
    knockbackX: 282,
    knockbackY: -214,
    telegraphStyle: {
      fillColor: 0x120509,
      fillAlpha: 0.22,
      outerRingColor: 0x5a1b23,
      outerRingAlpha: 0.72,
      innerRingColor: 0x2b1018,
      innerRingAlpha: 0.7,
      sigilColor: 0x214345,
      sigilAlpha: 0.34,
      runeColor: 0x341016,
      runeAlpha: 0.72
    }
  },
  projectile: {
    textureKey: ASSET_KEYS.sector02PressureShardProjectile,
    cooldownMs: 5600,
    windupMs: 820,
    recoveryMs: 900,
    minRange: 280,
    maxRange: 620,
    verticalTolerance: 176,
    spawnOffsetX: 84,
    spawnOffsetY: -116,
    speed: 252,
    damage: 1,
    lifetimeMs: 2100,
    rotationSpeed: 420,
    telegraphRadiusX: 96,
    telegraphRadiusY: 30
  },
  deathPayoff: {
    shakeDurationMs: 3000,
    shakeIntensity: 0.017,
    flarePulseDelayMs: 980,
    collapseCueDelayMs: 2120,
    explosionDelayMs: 3000,
    bossBarDropDelayMs: 3440,
    unlockRevealDelayMs: 3760
  },
  blowout: {
    scale: 1.44,
    burstCount: 54,
    burstRadiusX: 270,
    burstRadiusY: 132,
    puddleWidth: 340,
    puddleHeight: 58,
    sprayCount: 98,
    mistCount: 62,
    emberCount: 38,
    durationMs: 1540,
    puddleFadeMs: 2800,
    alpha: 1,
    puddleAlpha: 0.46,
    splashColor: 0x020202,
    heavyColor: 0x030304,
    highlightColor: 0x131518,
    mistColor: 0x141515,
    redSpeckColor: 0x6f0f12
  }
};

const SHOW_SECTOR02_DEBUG_LABELS = false;

export class Sector02Chamber03Scene extends Phaser.Scene {
  constructor() {
    super(KILN_OF_JUDGEMENT_BOOTSTRAP.sceneKey);
  }

  init(data) {
    this.transitionContext = data ?? {};
    this.isRestartingRun = false;
    this.isLoreTransitionActive = false;
    this.hasCompletedLoreBeat = false;
    this.hasUnlockedForwardPath = false;
    this.hasTriggeredForwardContract = false;
    this.currentForwardThreshold = null;
    this.currentLoreZone = null;
    this.hasEnteredForwardThreshold = false;
    this.forwardThresholdAwaitingFreshInteract = false;
    this.enemies = [];
    this.encounterPockets = [];
    this.enemyProjectiles = [];
    this.enemyProjectilesPaused = false;
    this.loreAnchor = null;
    this.sorrowEngine = null;
    this.sorrowEngineDeathSequenceActive = false;
    this.sorrowEngineDeathFinished = false;
    this.hasTriggeredBossReveal = false;
    this.integrityRewardTracker = new Set();
    this.currentRiteFinisherTarget = null;
    this.resolutionLockActive = false;
  }

  create() {
    this.createWorldBounds();
    this.createAudio();
    this.createBackdrop();
    this.createPlayerAndColliders();
    this.createEnemyProjectiles();
    this.createEncounterPockets();
    this.createClimaxEncounter();
    this.createLoreAnchor();
    this.createUiAndInput();
    this.majorEncounterResolution = new MajorEncounterResolution(this);
    this.createForwardThreshold();
    this.configureCameraAndLayout();
    this.registerLoreEvents();
    this.cameras.main.fadeIn(650, 0, 0, 0);
  }

  createWorldBounds() {
    this.physics.world.gravity.y = WORLD.gravityY;
    this.cameras.main.setBounds(0, 0, KILN_OF_JUDGEMENT_BOOTSTRAP.worldWidth, WORLD.height);
    this.physics.world.setBounds(0, 0, KILN_OF_JUDGEMENT_BOOTSTRAP.worldWidth, WORLD.height);
    this.cameras.main.setBackgroundColor('#060403');
    this.platforms = this.physics.add.staticGroup();
  }

  createAudio() {
    this.audioDirector = new AudioDirector(this);
    this.audioDirector.playAmbientLoop(ASSET_KEYS.ambientChamber02Loop01, { volume: 0.11 });
  }

  createBackdrop() {
    this.add.rectangle(KILN_OF_JUDGEMENT_BOOTSTRAP.worldWidth / 2, WORLD.height / 2, KILN_OF_JUDGEMENT_BOOTSTRAP.worldWidth, WORLD.height, 0x060403, 1).setDepth(KILN_OF_JUDGEMENT_BOOTSTRAP.backdropDepth);
    this.add.rectangle(KILN_OF_JUDGEMENT_BOOTSTRAP.worldWidth / 2, KILN_OF_JUDGEMENT_BOOTSTRAP.lowerBandY, KILN_OF_JUDGEMENT_BOOTSTRAP.worldWidth, KILN_OF_JUDGEMENT_BOOTSTRAP.lowerBandHeight, 0x24120c, KILN_OF_JUDGEMENT_BOOTSTRAP.lowerBandAlpha).setDepth(-14.24);
    this.add.ellipse(KILN_OF_JUDGEMENT_BOOTSTRAP.worldWidth / 2, WORLD.floorY - 120, KILN_OF_JUDGEMENT_BOOTSTRAP.worldWidth * 0.88, 320, 0x4b2614, 0.08).setDepth(-14.1);
    this.renderSegmentBackdrop();
    this.renderArchitecture();
    this.renderWalkway();
    this.renderKilnLoreFraming();
    this.renderFinalFraming();
    this.createInvisiblePlatform(KILN_OF_JUDGEMENT_BOOTSTRAP.worldWidth / 2, WORLD.floorY + 28, KILN_OF_JUDGEMENT_BOOTSTRAP.worldWidth, KILN_OF_JUDGEMENT_BOOTSTRAP.floorColliderHeight);
  }

  renderSegmentBackdrop() {
    KILN_OF_JUDGEMENT_SEGMENTS.forEach((segment, index) => {
      if (this.textures.exists(segment.key)) {
        this.add.image(segment.x, segment.y, segment.key).setDisplaySize(segment.width, segment.height).setTint(segment.tint).setAlpha(segment.alpha).setDepth(segment.depth);
      } else {
        this.add.rectangle(segment.x, segment.y + 12, segment.width, segment.height, 0x36251d, 0.76).setDepth(segment.depth);
      }
      this.add.ellipse(segment.x, WORLD.floorY - 30, segment.width * 0.82, 64, 0x070504, 0.14 + index * 0.012).setDepth(-14.02);
    });
  }

  renderArchitecture() {
    KILN_OF_JUDGEMENT_RIBS.forEach((marker) => {
      const ribY = WORLD.floorY - marker.ribHeight / 2 - 12;
      const leftRibX = marker.x - marker.archWidth / 2;
      const rightRibX = marker.x + marker.archWidth / 2;
      this.add.rectangle(leftRibX, ribY, marker.ribWidth, marker.ribHeight, 0x2a1a14, marker.alpha).setDepth(marker.depth);
      this.add.rectangle(rightRibX, ribY, marker.ribWidth, marker.ribHeight, 0x2a1a14, marker.alpha).setDepth(marker.depth);
      this.add.ellipse(marker.x, ribY - marker.ribHeight / 2 + 22, marker.archWidth, marker.archHeight, 0x5d3a24, marker.alpha * 0.8).setDepth(marker.depth - 0.04);
      this.add.ellipse(marker.x, WORLD.floorY + 10, marker.archWidth * 1.16, 26, 0x040303, marker.alpha).setDepth(-5.26);
    });

    KILN_OF_JUDGEMENT_BUTTRESSES.forEach((buttress) => {
      this.add.rectangle(buttress.x, WORLD.floorY - buttress.height / 2 - 18, buttress.width, buttress.height, 0x1b120f, buttress.alpha).setDepth(buttress.depth);
      this.add.rectangle(buttress.x, WORLD.floorY - buttress.height - 18, buttress.capWidth, buttress.capHeight, 0x3d261c, buttress.alpha * 0.88).setDepth(buttress.depth - 0.02);
    });
  }

  renderWalkway() {
    this.add.rectangle(KILN_OF_JUDGEMENT_BOOTSTRAP.worldWidth / 2, WORLD.floorY - 14, KILN_OF_JUDGEMENT_BOOTSTRAP.worldWidth, 98, 0x191311, 0.95).setDepth(-6.3);
    this.add.rectangle(KILN_OF_JUDGEMENT_BOOTSTRAP.worldWidth / 2, WORLD.floorY - 48, KILN_OF_JUDGEMENT_BOOTSTRAP.worldWidth, 24, 0x2b1b15, 0.76).setDepth(-6.26);

    if (this.textures.exists(ASSET_KEYS.sector02Chamber03Floor)) {
      this.add.tileSprite(KILN_OF_JUDGEMENT_BOOTSTRAP.worldWidth / 2, WORLD.floorY + 8, KILN_OF_JUDGEMENT_BOOTSTRAP.worldWidth, 56, ASSET_KEYS.sector02Chamber03Floor).setTint(0xb39c77).setAlpha(0.14).setDepth(-6.22);
    }

    [560, 1280, 2040, 2800, 3560, 4320, 5080, 5680].forEach((x, index) => {
      this.add.rectangle(x, WORLD.floorY - 24, 188, 8, 0x8c6a44, 0.16 + index * 0.008).setDepth(-6.18);
      this.add.rectangle(x, WORLD.floorY - 4, 4, 42, 0x050404, 0.34).setDepth(-6.12);
    });

    this.add.ellipse(KILN_OF_JUDGEMENT_BOOTSTRAP.worldWidth / 2, WORLD.floorY + 12, KILN_OF_JUDGEMENT_BOOTSTRAP.worldWidth, 56, 0x020202, 0.38).setDepth(-5.94);
  }

  renderKilnLoreFraming() {
    const anchor = KILN_LORE.anchor;
    this.add.rectangle(anchor.altarX, anchor.wallPlateY, anchor.wallPlateWidth, anchor.wallPlateHeight, 0x140d0a, 0.86).setDepth(-13.96);
    if (this.textures.exists(ASSET_KEYS.sector02Chamber03BackgroundWallModule)) {
      this.add.image(anchor.altarX, anchor.wallPlateY, ASSET_KEYS.sector02Chamber03BackgroundWallModule)
        .setDisplaySize(anchor.wallPlateWidth + 20, anchor.wallPlateHeight + 18)
        .setTint(0x7a6b60)
        .setAlpha(0.18)
        .setDepth(-13.88);
    }

    this.add.rectangle(anchor.muralX, WORLD.floorY - 96, anchor.muralBackingWidth - 34, 196, 0x26170f, 0.92).setDepth(-13.9);
    this.add.rectangle(anchor.muralX, anchor.muralY, anchor.muralBackingWidth, anchor.muralBackingHeight, 0x1c120d, 0.84).setDepth(-13.8);
    if (this.textures.exists(ASSET_KEYS.sector02Chamber03LoreImage)) {
      this.add.image(anchor.muralX, anchor.muralY, ASSET_KEYS.sector02Chamber03LoreImage)
        .setDisplaySize(anchor.muralWidth, anchor.muralHeight)
        .setTint(0xd6cfbf)
        .setAlpha(0.32)
        .setDepth(-13.74);
    }

    this.add.rectangle(anchor.altarX, anchor.supportTopY, anchor.supportWidth, anchor.supportHeight, 0x25140d, 0.94).setDepth(-6.24);
    this.add.rectangle(anchor.altarX, WORLD.floorY - 12, anchor.supportWidth + 86, 18, 0x090605, 0.84).setDepth(-6.16);
    this.add.ellipse(anchor.altarX, WORLD.floorY - 18, anchor.shadowWidth, 30, 0x3a2418, 0.18).setDepth(-6.12);
    this.add.ellipse(anchor.altarX, WORLD.floorY + 10, anchor.shadowWidth + 170, 38, 0x020202, 0.36).setDepth(-6.04);

    if (this.textures.exists(ASSET_KEYS.bossPit02AltarTrap)) {
      this.add.image(anchor.altarX, anchor.altarY, ASSET_KEYS.bossPit02AltarTrap)
        .setDisplaySize(anchor.altarDisplayWidth, anchor.altarDisplayHeight)
        .setTint(0xd8cdb7)
        .setAlpha(0.9)
        .setDepth(-6.08);
    } else {
      this.add.ellipse(anchor.altarX, anchor.altarY + 6, 146, 148, 0x8a6d5a, 0.72).setDepth(-6.08);
    }
  }

  renderFinalFraming() {
    const altarX = 5340;
    this.add.rectangle(altarX, WORLD.floorY - 114, 520, 258, 0x140d0a, 0.22).setDepth(-13.7);
    this.add.ellipse(altarX, WORLD.floorY + 2, 420, 48, 0x050404, 0.36).setDepth(-5.82);

    if (this.textures.exists(ASSET_KEYS.sector02Chamber03Gate)) {
      this.add.image(5450, WORLD.floorY - 162, ASSET_KEYS.sector02Chamber03Gate).setDisplaySize(350, 350).setTint(0xd3c5af).setAlpha(0.84).setDepth(-4.94);
    } else {
      this.add.ellipse(5450, WORLD.floorY - 162, 270, 320, 0x55453b, 0.82).setStrokeStyle(3, 0xd7d0c0, 0.52).setDepth(-4.94);
    }
  }

  createPlayerAndColliders() {
    this.player = new Player(this, KILN_OF_JUDGEMENT_BOOTSTRAP.spawnX, KILN_OF_JUDGEMENT_BOOTSTRAP.spawnY, PLAYER);
    const entryIntegrity = applyChamberEntryRestore(this.transitionContext);
    this.player.health = entryIntegrity.current;
    this.player.maxHealth = entryIntegrity.max;
    this.applyGameplayReadabilitySupport(this.player.sprite, { fill: 0xd1c6b5, alpha: 0.16, scale: 1.08 });
    this.physics.add.collider(this.player.sprite, this.platforms);
  }

  createEnemyProjectiles() {
    this.enemyProjectiles = [];
    this.enemyProjectileGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.physics.add.overlap(this.player.sprite, this.enemyProjectileGroup, (_playerSprite, projectileSprite) => {
      this.handleEnemyProjectileHit(projectileSprite);
    });
  }

  spawnEnemyProjectile(config) {
    let projectile = this.enemyProjectiles.find((entry) => !entry.active);
    if (!projectile) {
      projectile = new EnemyProjectile(this, {
        speed: config.speed ?? KILN_ELITE_PROJECTILE.speed,
        damage: config.damage ?? KILN_ELITE_PROJECTILE.damage,
        lifetimeMs: config.lifetimeMs ?? KILN_ELITE_PROJECTILE.lifetimeMs,
        rotationSpeed: config.rotationSpeed ?? KILN_ELITE_PROJECTILE.rotationSpeed,
        bodySize: { width: 26, height: 26 },
        depth: config.depth ?? 6.32,
        presentation: {
          displayWidth: 42,
          displayHeight: 42,
          alpha: 0.98,
          fallbackFill: 0xd6ceb8,
          fallbackStroke: 0x7d6b58
        },
        impact: {
          durationMs: 130,
          alpha: 0.86,
          scaleMultiplier: 1.18,
          tint: 0xe5dcc8
        }
      });
      this.enemyProjectiles.push(projectile);
    }

    projectile.owner = config.owner ?? null;
    projectile.fire(config);
    if (projectile.sprite && !this.enemyProjectileGroup.contains(projectile.sprite)) {
      this.enemyProjectileGroup.add(projectile.sprite);
    }
    if (this.enemyProjectilesPaused) {
      projectile.pauseMotion();
    }
    return projectile;
  }

  createEncounterPockets() {
    this.encounterPockets = KILN_ENCOUNTER_POCKETS.map((pocketConfig) => this.createEncounterPocket(pocketConfig));
  }

  createEncounterPocket(pocketConfig) {
    const zone = this.add.zone(pocketConfig.zoneX, pocketConfig.zoneY, pocketConfig.zoneWidth, pocketConfig.zoneHeight).setOrigin(0.5);
    this.physics.add.existing(zone, true);
    const markerShadow = this.add.ellipse(pocketConfig.zoneX, WORLD.floorY - 4, pocketConfig.markerWidth, pocketConfig.markerHeight, 0x030202, pocketConfig.markerAlpha).setDepth(-5.84);
    const promptText = SHOW_SECTOR02_DEBUG_LABELS
      ? this.add.text(pocketConfig.zoneX, pocketConfig.zoneY + pocketConfig.promptOffsetY, pocketConfig.label, { fontFamily: 'monospace', fontSize: '13px', color: '#dfd2c4', align: 'center', stroke: '#120c0a', strokeThickness: 4 }).setOrigin(0.5).setDepth(-4.82).setAlpha(0.82).setVisible(false)
      : null;
    const enemies = pocketConfig.enemies.map((enemyConfig) => this.createEncounterEnemy(enemyConfig, pocketConfig));
    return { ...pocketConfig, zone, markerShadow, promptText, enemies, activated: false, resolved: false };
  }

  createEncounterEnemy(enemyConfig, pocketConfig) {
    const isElite = enemyConfig.type === 'elite';
    const baseConfig = isElite
      ? KILN_SKITTER_ELITE
      : enemyConfig.type === 'basic02'
        ? KILN_SKITTER_BASIC_02
        : KILN_SKITTER_BASIC_01;

    const enemy = new SkitterServitor(this, enemyConfig.x, enemyConfig.y, {
      ...baseConfig,
      wakeDelayMs: enemyConfig.wakeDelayMs ?? 0,
      patrolDistance: enemyConfig.patrolDistance ?? baseConfig.patrolDistance,
      awakenPlayerX: enemyConfig.awakenPlayerX
    });

    enemy.encounterPocketId = pocketConfig.id;
    enemy.awakened = false;
    enemy.awakenAtTime = null;
    enemy.pocketWakeAtTime = null;
    enemy.isElite = isElite;
    enemy.projectileConfig = isElite ? { ...KILN_ELITE_PROJECTILE } : null;
    enemy.projectileState = 'idle';
    enemy.projectileWindupStartedAt = -Infinity;
    enemy.projectileFireAt = -Infinity;
    enemy.projectileRecoverUntil = -Infinity;
    enemy.lastProjectileTime = -Infinity;
    enemy.projectileTelegraph = isElite
      ? this.add.ellipse(enemyConfig.x, enemyConfig.y + KILN_ELITE_PROJECTILE.spawnOffsetY, KILN_ELITE_PROJECTILE.telegraphRadiusX, KILN_ELITE_PROJECTILE.telegraphRadiusY, 0xd7ccb5, 0.12)
        .setStrokeStyle(2, 0xe3d7c0, 0.5)
        .setDepth(enemy.sprite.depth + 0.08)
        .setVisible(false)
      : null;

    this.physics.add.collider(enemy.sprite, this.platforms);
    this.physics.add.overlap(this.player.attackHitbox, enemy.damageHurtbox ?? enemy.sprite, (attackZone, enemySprite) => {
      this.handlePlayerHitEnemy(attackZone, enemySprite, enemy);
    });
    this.physics.add.overlap(this.player.sprite, enemy.sprite, (playerSprite, enemySprite) => {
      this.handleEnemyContactPlayer(playerSprite, enemySprite, enemy);
    });

    this.enemies.push(enemy);
    this.applyGameplayReadabilitySupport(enemy.sprite, isElite
      ? { fill: 0xe2d0b0, alpha: 0.18, scale: 1.2 }
      : { fill: 0xd9c6a8, alpha: 0.12, scale: 1.04 });
    return enemy;
  }

  createLoreAnchor() {
    const anchor = KILN_LORE.anchor;
    const zone = this.add.zone(anchor.zoneX, anchor.zoneY, anchor.zoneWidth, anchor.zoneHeight).setOrigin(0.5);
    this.physics.add.existing(zone, true);
    this.loreAnchor = { ...anchor, zone, prompt: null };
  }

  createClimaxEncounter() {
    this.sorrowEngine = new PressureDeacon(
      this,
      KILN_SORROW_ENGINE.spawnX,
      KILN_SORROW_ENGINE.spawnY,
      {
        ...KILN_SORROW_ENGINE,
        textureKey: ASSET_KEYS.sector02Chamber03BossSorrowEngine
      }
    );
    this.sorrowEngine.setActive(false);
    this.sorrowEngine.sprite.setDepth(6.32);
    this.sorrowEngine.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.sorrowEngine.getCollisionTarget?.() ?? this.sorrowEngine.sprite, this.platforms);
    this.physics.add.overlap(this.player.attackHitbox, this.sorrowEngine.damageHurtbox ?? this.sorrowEngine.sprite, (_attackZone, enemySprite) => {
      this.handlePlayerHitSorrowEngine(enemySprite);
    });
    this.physics.add.overlap(this.player.sprite, this.sorrowEngine.getCollisionTarget?.() ?? this.sorrowEngine.sprite, (_playerSprite, enemySprite) => {
      this.handleSorrowEngineContactPlayer(enemySprite);
    });
    this.applyGameplayReadabilitySupport(this.sorrowEngine.sprite, { fill: 0xd9cab0, alpha: 0.18, scale: 1.26 });
    this.sorrowEngine.projectileTelegraph?.setStrokeStyle(2, 0x7f6f58, 0.62);
  }

  createForwardThreshold() {
    this.forwardBarrier = this.add.rectangle(KILN_FORWARD_GATE.barrierX, KILN_FORWARD_GATE.barrierY, KILN_FORWARD_GATE.barrierWidth, KILN_FORWARD_GATE.barrierHeight, 0x120c0a, 0.38).setDepth(-4.86);
    this.physics.add.existing(this.forwardBarrier, true);
    this.physics.add.collider(this.player.sprite, this.forwardBarrier);

    this.forwardThresholdZone = this.add.zone(KILN_FORWARD_GATE.thresholdX, KILN_FORWARD_GATE.thresholdY, KILN_FORWARD_GATE.thresholdWidth, KILN_FORWARD_GATE.thresholdHeight).setOrigin(0.5);
    this.physics.add.existing(this.forwardThresholdZone, true);
    this.forwardPrompt = SHOW_SECTOR02_DEBUG_LABELS
      ? this.add.text(KILN_FORWARD_GATE.thresholdX, KILN_FORWARD_GATE.thresholdY + KILN_FORWARD_GATE.promptOffsetY, 'KILN GATE SEALED', { fontFamily: 'monospace', fontSize: '14px', color: '#e0d8c8', align: 'center', stroke: '#120c0a', strokeThickness: 4 }).setOrigin(0.5).setDepth(-4.58).setAlpha(0.92).setVisible(false)
      : null;
  }

  createUiAndInput() {
    this.hud = new HudOverlay(this);
    this.mobileControls = new MobileControls(this);
    this.setupMobileUiCamera();
    this.restartText = this.add.text(this.scale.width / 2, 90, '', { fontFamily: 'monospace', fontSize: '22px', color: '#d2c2ac', align: 'center' }).setScrollFactor(0).setDepth(35).setOrigin(0.5).setVisible(false);
    this.uiCamera?.ignore(this.restartText);
    this.riteFinisherPrompt = this.add.text(this.scale.width / 2, this.scale.height * 0.2, MAJOR_FINISHER.ritePromptText, {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ecd8bc',
      align: 'center',
      stroke: '#110b09',
      strokeThickness: 4
    }).setScrollFactor(0).setDepth(35).setOrigin(0.5).setVisible(false);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyAttack = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.keyInteract = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keyRestart = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.applyResponsiveLayout, this);
      this.audioDirector?.shutdown();
      this.game.events.off('lore-cutscene-complete', this.handleLoreCutsceneComplete, this);
      this.enemyProjectiles.forEach((projectile) => projectile.destroy());
      this.enemies.forEach((enemy) => enemy.projectileTelegraph?.destroy?.());
      this.sorrowEngine?.destroyCombatTelegraphs?.();
      this.majorEncounterResolution?.teardown();
    });
  }

  configureCameraAndLayout() {
    this.cameras.main.startFollow(this.player.sprite, true, KILN_OF_JUDGEMENT_BOOTSTRAP.cameraLerp.x, KILN_OF_JUDGEMENT_BOOTSTRAP.cameraLerp.y, KILN_OF_JUDGEMENT_BOOTSTRAP.desktopFollowOffsetX, 0);

    this.directionalCameraBias = createDirectionalCameraBias({
      camera: this.cameras.main,
      player: this.player,
      desktopBaseOffsetX: KILN_OF_JUDGEMENT_BOOTSTRAP.desktopFollowOffsetX,
      portraitBaseOffsetX: KILN_OF_JUDGEMENT_BOOTSTRAP.portraitFollowOffsetX,
      desktopLookAheadX: 56,
      portraitLookAheadX: 24
    });    this.scale.on('resize', this.applyResponsiveLayout, this);
    this.applyResponsiveLayout();
    this.mobileControls.setMode('gameplay');
    this.directionalCameraBias?.update();
    this.hud.update(this.player.health, this.player.maxHealth);
  }

  registerLoreEvents() {
    this.game.events.on('lore-cutscene-complete', this.handleLoreCutsceneComplete, this);
  }

  update(time) {
    const mobileInput = this.mobileControls.getInputState();

    if (this.player.isDead) {
      this.riteFinisherPrompt?.setVisible(false);
      this.mobileControls.setMode('dead');
      this.restartText.setVisible(true).setText('VESSEL FAILURE\nPress [R] to re-seed chamber');
      this.enemies.forEach((enemy) => enemy.body?.setVelocity(0, 0));
      this.setEnemyProjectilesPaused(true);
      if ((Phaser.Input.Keyboard.JustDown(this.keyRestart) || mobileInput.interactPressed) && !this.isRestartingRun) {
        this.isRestartingRun = true;
        restartRunFromDeath(this);
      }
      return;
    }

    if (this.isLoreTransitionActive || this.resolutionLockActive) {
      this.riteFinisherPrompt?.setVisible(false);
      this.mobileControls.setMode('dialogue');
      this.player.body.setVelocity(0, 0);
      this.enemies.forEach((enemy) => enemy.body?.setVelocity(0, 0));
      this.sorrowEngine?.body?.setVelocity?.(0, 0);
      this.setEnemyProjectilesPaused(true);
      return;
    }

    this.restartText.setVisible(false);
    this.mobileControls.setMode('gameplay');
    this.setEnemyProjectilesPaused(false);
    const input = {
      left: this.cursors.left.isDown || mobileInput.left,
      right: this.cursors.right.isDown || mobileInput.right,
      jumpPressed: Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.cursors.space) || mobileInput.jumpPressed,
      attackPressed: Phaser.Input.Keyboard.JustDown(this.keyAttack) || mobileInput.attackPressed
    };

    this.player.update(time, input);
    this.updateSorrowEngineState(time);
    this.refreshEncounterPocketPresence();
    this.updateEncounterPockets(time);
    this.enemies.forEach((enemy) => {
      enemy.update(time, this.player.sprite.x);
      this.updateEliteProjectileState(enemy, time);
    });
    this.sorrowEngine?.update(time, this.player.sprite);
    this.enemyProjectiles.forEach((projectile) => projectile.update(time, this.game.loop.delta));
    this.refreshSorrowEngineBossBar(time);
    this.refreshRiteFinisherTarget();
    if (this.tryTriggerContextualRiteFinisher(mobileInput)) {
      this.directionalCameraBias?.update();
    this.hud.update(this.player.health, this.player.maxHealth);
      return;
    }
    this.refreshLoreZonePresence();
    this.tryBeginLoreSequence(mobileInput);
    this.refreshForwardThresholdPresence();
    this.tryAdvanceForwardThreshold(mobileInput);
    this.directionalCameraBias?.update();
    this.hud.update(this.player.health, this.player.maxHealth);
  }

  refreshRiteFinisherTarget() {
    const playerSprite = this.player?.sprite;
    if (!playerSprite?.active || this.sorrowEngineDeathSequenceActive) {
      this.currentRiteFinisherTarget = null;
      this.riteFinisherPrompt?.setVisible(false);
      return;
    }

    const eligibleElites = this.enemies.filter((enemy) => enemy.isElite && enemy.canReceiveRiteFinisher?.(playerSprite, this.time.now));
    const eligibleTargets = [
      ...eligibleElites,
      this.sorrowEngine?.canReceiveRiteFinisher?.(playerSprite, this.time.now) ? this.sorrowEngine : null
    ].filter(Boolean);

    this.currentRiteFinisherTarget = eligibleTargets.sort((a, b) => (
      Phaser.Math.Distance.Between(playerSprite.x, playerSprite.y, a.sprite.x, a.sprite.y)
      - Phaser.Math.Distance.Between(playerSprite.x, playerSprite.y, b.sprite.x, b.sprite.y)
    ))[0] ?? null;

    this.riteFinisherPrompt?.setVisible(Boolean(this.currentRiteFinisherTarget));
  }

  tryTriggerContextualRiteFinisher(mobileInput) {
    if (!this.currentRiteFinisherTarget) {
      return false;
    }

    const interactPressed = Phaser.Input.Keyboard.JustDown(this.keyInteract) || Phaser.Input.Keyboard.JustDown(this.keyEnter) || mobileInput.interactPressed;
    if (!interactPressed) {
      return false;
    }

    const target = this.currentRiteFinisherTarget;
    this.currentRiteFinisherTarget = null;
    this.riteFinisherPrompt?.setVisible(false);

    if (target === this.sorrowEngine) {
      this.executeSorrowEngineFinisher(target);
      return true;
    }

    this.executeEliteFinisher(target);
    return true;
  }

  executeEliteFinisher(target) {
    if (!target || target.dead) {
      return;
    }

    this.cameras.main.shake(MAJOR_FINISHER.elite.shakeDurationMs, MAJOR_FINISHER.elite.shakeIntensity, true);
    this.triggerSector02BlackOilPayoff(target, { scale: 0.58, burstCount: 10, sprayCount: 18, mistCount: 10, emberCount: 4, durationMs: 680 });
    target.setHitReactionDirection(Math.sign(target.sprite.x - this.player.sprite.x) || this.player.facing);
    target.takeDamage(Math.max(1, target.health), this.time.now);
    this.audioDirector?.playBanishmentSting();
  }

  executeSorrowEngineFinisher(target) {
    if (!target || target.dead || this.sorrowEngineDeathSequenceActive) {
      return;
    }

    this.cameras.main.shake(MAJOR_FINISHER.boss.shakeDurationMs, MAJOR_FINISHER.boss.shakeIntensity, true);
    target.setActive(true);
    target.takeDamage(Math.max(1, target.health), this.time.now);
    this.audioDirector?.playBanishmentSting();
    if (target.dead) {
      this.beginSorrowEngineDeathSequence();
    }
  }

  refreshEncounterPocketPresence() {
    this.encounterPockets.forEach((pocket) => {
      let playerInsidePocket = false;
      this.physics.overlap(this.player.sprite, pocket.zone, () => {
        playerInsidePocket = true;
      });
      pocket.promptText?.setVisible(playerInsidePocket && !pocket.activated && !pocket.resolved);
    });
  }

  updateEncounterPockets(time) {
    this.encounterPockets.forEach((pocket) => {
      if (pocket.resolved) {
        pocket.promptText?.setVisible(false);
        pocket.markerShadow.setAlpha(0.03);
        return;
      }

      let playerInsidePocket = false;
      this.physics.overlap(this.player.sprite, pocket.zone, () => {
        playerInsidePocket = true;
      });

      if (playerInsidePocket && !pocket.activated) {
        pocket.activated = true;
        pocket.promptText?.setText(`${pocket.label}\nKILN JUDGEMENT ACTIVE`).setVisible(true);
        pocket.markerShadow.setAlpha(pocket.markerAlpha + 0.06);
        pocket.enemies.forEach((enemy, index) => {
          if (enemy.dead) {
            return;
          }
          enemy.pocketWakeAtTime = time + (enemy.config.wakeDelayMs ?? 0) + index * 32;
        });
      }

      pocket.enemies.forEach((enemy) => {
        if (!enemy.dead && pocket.activated && !enemy.awakened && enemy.pocketWakeAtTime !== null && time >= enemy.pocketWakeAtTime) {
          enemy.awakened = true;
          enemy.awakenAtTime = null;
          enemy.pocketWakeAtTime = null;
        }
      });

      const allCleared = pocket.enemies.every((enemy) => enemy.dead);
      if (pocket.activated && allCleared) {
        pocket.resolved = true;
        pocket.promptText?.setVisible(false);
        pocket.markerShadow.setAlpha(0.04);
      }
    });

  }

  updateSorrowEngineState() {
    if (!this.sorrowEngine || this.sorrowEngineDeathSequenceActive || this.sorrowEngine.dead) {
      return;
    }

    const pocketsCleared = this.encounterPockets.length > 0 && this.encounterPockets.every((pocket) => pocket.resolved);
    if (!pocketsCleared || !this.hasCompletedLoreBeat) {
      return;
    }

    if (!this.sorrowEngine.active && this.player.sprite.x >= KILN_SORROW_ENGINE.activationX) {
      this.sorrowEngine.setActive(true);
      this.hasTriggeredBossReveal = true;
      this.forwardPrompt?.setText('THE SORROW ENGINE STIRS');
    }
  }

  refreshSorrowEngineBossBar(time) {
    if (!this.sorrowEngine) {
      return;
    }

    const visible = this.sorrowEngine.active && !this.sorrowEngineDeathFinished;
    this.hud.setBossBarState({
      visible,
      name: KILN_SORROW_ENGINE.name,
      subtitle: this.sorrowEngine.isStaggered?.(time) ? MAJOR_FINISHER.boss.subtitle : KILN_SORROW_ENGINE.subtitle,
      current: this.sorrowEngine.health,
      max: this.sorrowEngine.maxHealth,
      telegraph: this.sorrowEngine.getTelegraphProgress(time),
      wounded: time < this.sorrowEngine.hurtUntil
    });
  }

  refreshLoreZonePresence() {
    this.currentLoreZone = null;
    if (!this.loreAnchor || this.isLoreTransitionActive || this.hasCompletedLoreBeat) {
      this.loreAnchor?.prompt?.setVisible(false);
      return;
    }

    let isInside = false;
    this.physics.overlap(this.player.sprite, this.loreAnchor.zone, () => {
      isInside = true;
      this.currentLoreZone = this.loreAnchor;
    });
    this.loreAnchor.prompt?.setVisible(isInside);
  }

  tryBeginLoreSequence(mobileInput) {
    if (!this.currentLoreZone) {
      return;
    }
    const interactPressed = Phaser.Input.Keyboard.JustDown(this.keyInteract) || Phaser.Input.Keyboard.JustDown(this.keyEnter) || mobileInput.interactPressed;
    if (!interactPressed) {
      return;
    }
    this.beginLoreSequence();
  }

  beginLoreSequence() {
    if (this.isLoreTransitionActive) {
      return;
    }

    this.isLoreTransitionActive = true;
    this.currentLoreZone = null;
    this.loreAnchor?.prompt?.setVisible(false);
    this.mobileControls.setMode('dialogue');
    this.player.body.setVelocity(0, 0);
    this.enemies.forEach((enemy) => {
      enemy.body?.setVelocity(0, 0);
      this.clearEliteProjectileState(enemy);
    });
    this.setEnemyProjectilesPaused(true);
    this.audioDirector?.stopAmbientLoop();
    this.hud?.setVisible(false);
    this.mobileControls.setMode('init');
    this.uiCamera?.setVisible(false);

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.setGameplaySceneVisibility(false);
      this.scene.pause();
      this.scene.launch('LoreCutsceneScene', {
        cutsceneId: KILN_LORE.cutsceneId,
        returnSceneKey: this.scene.key
      });
    });

    this.cameras.main.fadeOut(420, 0, 0, 0);
  }

  handleLoreCutsceneComplete({ cutsceneId } = {}) {
    if (cutsceneId !== KILN_LORE.cutsceneId) {
      return;
    }

    this.hasCompletedLoreBeat = true;
    this.resumeFromLore();
  }

  resumeFromLore() {
    this.isLoreTransitionActive = false;
    this.setGameplaySceneVisibility(true);
    this.applyResponsiveLayout();
    this.mobileControls.setMode('gameplay');
    this.hud?.setVisible(true);
    this.uiCamera?.setVisible(true);
    this.setEnemyProjectilesPaused(false);
    this.audioDirector?.playAmbientLoop(ASSET_KEYS.ambientChamber02Loop01, { volume: 0.1 });
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  setGameplaySceneVisibility(isVisible) {
    this.scene.setVisible(isVisible, this.scene.key);
  }

  setEnemyProjectilesPaused(paused) {
    this.enemyProjectilesPaused = paused;
    this.enemyProjectiles.forEach((projectile) => {
      if (!projectile.active) {
        return;
      }
      if (paused) {
        projectile.pauseMotion();
      } else {
        projectile.resumeMotion();
      }
    });
  }

  updateEliteProjectileState(enemy, time) {
    if (!enemy?.isElite || enemy.dead) {
      enemy?.projectileTelegraph?.setVisible(false);
      return;
    }

    if (!enemy.awakened || this.isLoreTransitionActive) {
      this.clearEliteProjectileState(enemy);
      return;
    }

    if (enemy.projectileState === 'windup') {
      enemy.body?.setVelocityX(0);
      this.updateEliteProjectileTelegraph(enemy, time);
      if (time >= enemy.projectileFireAt) {
        this.fireEliteProjectile(enemy, time);
        enemy.projectileState = 'recover';
        enemy.projectileRecoverUntil = time + enemy.projectileConfig.recoveryMs;
        enemy.lastProjectileTime = time;
      }
      return;
    }

    if (enemy.projectileState === 'recover') {
      enemy.body?.setVelocityX(0);
      enemy.projectileTelegraph?.setVisible(false);
      if (time >= enemy.projectileRecoverUntil) {
        this.clearEliteProjectileState(enemy);
      }
      return;
    }

    if (!this.canEliteStartProjectile(enemy, time)) {
      enemy.projectileTelegraph?.setVisible(false);
      return;
    }

    enemy.projectileState = 'windup';
    enemy.projectileWindupStartedAt = time;
    enemy.projectileFireAt = time + enemy.projectileConfig.windupMs;
    enemy.body?.setVelocityX(0);
    this.updateEliteProjectileTelegraph(enemy, time);
  }

  canEliteStartProjectile(enemy, time) {
    if (
      enemy.projectileState !== 'idle' ||
      enemy.attackState !== 'idle' ||
      time < enemy.hurtUntil ||
      time < enemy.lastProjectileTime + enemy.projectileConfig.cooldownMs ||
      !enemy.body?.blocked?.down
    ) {
      return false;
    }

    const dx = this.player.sprite.x - enemy.sprite.x;
    const dy = this.player.sprite.y - enemy.sprite.y;
    const absDx = Math.abs(dx);
    enemy.direction = Math.sign(dx) || enemy.direction;

    return absDx >= enemy.projectileConfig.minRange
      && absDx <= enemy.projectileConfig.maxRange
      && Math.abs(dy) <= enemy.projectileConfig.verticalTolerance;
  }

  fireEliteProjectile(enemy, time) {
    const spawnX = enemy.sprite.x + enemy.direction * enemy.projectileConfig.spawnOffsetX;
    const spawnY = enemy.sprite.y + enemy.projectileConfig.spawnOffsetY;
    const bodyCenterX = this.player.sprite.body?.center?.x ?? this.player.sprite.x;
    const bodyCenterY = this.player.sprite.body?.center?.y ?? this.player.sprite.y;
    const torsoTargetY = bodyCenterY - ((this.player.sprite.body?.height ?? 0) * 0.18);
    const target = new Phaser.Math.Vector2(bodyCenterX, torsoTargetY);
    const velocity = target.subtract(new Phaser.Math.Vector2(spawnX, spawnY)).normalize().scale(enemy.projectileConfig.speed);
    if (Number.isNaN(velocity.x) || Number.isNaN(velocity.y)) {
      velocity.set(enemy.direction * enemy.projectileConfig.speed, 0);
    }

    this.spawnEnemyProjectile({
      owner: enemy,
      x: spawnX,
      y: spawnY,
      velocityX: velocity.x,
      velocityY: velocity.y,
      damage: enemy.projectileConfig.damage,
      lifetimeMs: enemy.projectileConfig.lifetimeMs,
      rotationSpeed: enemy.projectileConfig.rotationSpeed,
      textureKey: ASSET_KEYS.sector02PressureShardProjectile,
      tint: 0xddccb6,
      depth: enemy.sprite.depth + 0.04
    });

    this.audioDirector?.playEnemyAttack(enemy.config.audioProfile ?? 'tollkeeper');
    enemy.hitPulseUntil = time + 180;
    enemy.projectileTelegraph?.setVisible(false);
  }

  updateEliteProjectileTelegraph(enemy, time) {
    if (!enemy.projectileTelegraph || enemy.projectileState !== 'windup' || enemy.dead) {
      enemy.projectileTelegraph?.setVisible(false);
      return;
    }

    const progress = Phaser.Math.Clamp((time - enemy.projectileWindupStartedAt) / enemy.projectileConfig.windupMs, 0, 1);
    const pulse = 1 + Math.sin(time / 40) * 0.08;
    enemy.projectileTelegraph
      .setVisible(true)
      .setPosition(enemy.sprite.x + enemy.direction * 32, enemy.sprite.y + enemy.projectileConfig.spawnOffsetY)
      .setScale(0.94 + progress * 0.2, pulse)
      .setAlpha(0.14 + progress * 0.16)
      .setAngle((time / 16) % 360);
  }

  clearEliteProjectileState(enemy) {
    if (!enemy?.isElite) {
      return;
    }
    enemy.projectileState = 'idle';
    enemy.projectileWindupStartedAt = -Infinity;
    enemy.projectileFireAt = -Infinity;
    enemy.projectileRecoverUntil = -Infinity;
    enemy.projectileTelegraph?.setVisible(false);
  }

  handleEnemyProjectileHit(projectileSprite) {
    const projectile = this.enemyProjectiles.find((entry) => entry.sprite === projectileSprite || projectileSprite?.gameObject === entry.sprite);
    if (!projectile?.active || projectile.inImpact || !this.player?.sprite?.body?.enable) {
      return;
    }

    const impactX = Phaser.Math.Clamp(this.player.sprite.body.center.x, this.player.sprite.body.left + 8, this.player.sprite.body.right - 8);
    const impactY = this.player.sprite.body.center.y - this.player.sprite.body.height * 0.1;
    const damage = projectile.damage ?? KILN_ELITE_PROJECTILE.damage;
    const tookDamage = this.player.receiveDamage(damage, this.time.now);
    projectile.playImpact(impactX, impactY);
    if (!tookDamage) {
      return;
    }

    const knockDirection = Math.sign(this.player.sprite.x - projectile.sprite.x) || 1;
    this.player.body.setVelocityX(knockDirection * 210);
    this.player.body.setVelocityY(-196);
  }

  handlePlayerHitEnemy(_attackZone, target, enemy) {
    if (!this.isEnemyOverlapTarget(target, enemy) || enemy.dead || !this.player.attackActive) {
      return;
    }

    if (enemy.lastAttackHitId === this.player.attackId) {
      return;
    }

    enemy.lastAttackHitId = this.player.attackId;
    const knockDirection = Math.sign(enemy.sprite.x - this.player.sprite.x) || this.player.facing;
    enemy.setHitReactionDirection(knockDirection);
    if (enemy.isElite) {
      enemy.applyPoiseDamage(MAJOR_FINISHER.elite.poiseDamagePerHit, this.time.now);
    }
    enemy.takeDamage(1, this.time.now);
    this.clearEliteProjectileState(enemy);
    this.audioDirector?.playPlayerHit();
  }

  handleEnemyContactPlayer(_playerSprite, target, enemy) {
    if (!this.isEnemyOverlapTarget(target, enemy) || enemy.dead) {
      return;
    }
    if (!enemy.canDealContactDamage(this.time.now)) {
      return;
    }
    const tookDamage = this.player.receiveDamage(SKITTER.contactDamage, this.time.now);
    if (tookDamage) {
      const knockDirection = Math.sign(this.player.sprite.x - enemy.sprite.x) || 1;
      this.player.body.setVelocityX(knockDirection * 220);
      this.player.body.setVelocityY(-220);
    }
  }

  handlePlayerHitSorrowEngine(enemySprite) {
    if (!this.player.attackActive || this.sorrowEngine?.dead || !this.isEnemyOverlapTarget(enemySprite, this.sorrowEngine)) {
      return;
    }

    if (this.sorrowEngine.lastAttackHitId === this.player.attackId) {
      return;
    }

    this.sorrowEngine.lastAttackHitId = this.player.attackId;
    this.sorrowEngine.applyPoiseDamage(MAJOR_FINISHER.boss.poiseDamagePerHit, this.time.now);
    this.sorrowEngine.takeDamage(1, this.time.now);
    this.sorrowEngine.setActive(true);
    this.audioDirector?.playPlayerHit();

    if (this.sorrowEngine.dead && !this.sorrowEngineDeathSequenceActive) {
      this.beginSorrowEngineDeathSequence();
    }
  }

  handleSorrowEngineContactPlayer(enemySprite) {
    if (this.sorrowEngine?.dead || !this.isEnemyOverlapTarget(enemySprite, this.sorrowEngine)) {
      return;
    }

    if (!this.sorrowEngine.canDealContactDamage(this.time.now)) {
      return;
    }

    const tookDamage = this.player.receiveDamage(KILN_SORROW_ENGINE.contactDamage, this.time.now);
    if (!tookDamage) {
      return;
    }

    this.sorrowEngine.recordContactDamage(this.time.now);
    const knockDirection = Math.sign(this.player.sprite.x - this.sorrowEngine.sprite.x) || 1;
    this.player.body.setVelocityX(knockDirection * 242);
    this.player.body.setVelocityY(-226);
  }

  beginSorrowEngineDeathSequence() {
    if (!this.sorrowEngine || this.sorrowEngineDeathSequenceActive || this.majorEncounterResolution?.isResolutionActive('sector02-chamber03-sorrow-engine')) {
      return;
    }

    this.majorEncounterResolution?.begin({
      encounterId: 'sector02-chamber03-sorrow-engine',
      freezePlayer: true,
      disablePlayerAttack: true,
      pauseProjectiles: (paused) => this.setEnemyProjectilesPaused(paused),
      setResolutionLock: (locked) => {
        this.resolutionLockActive = locked;
      },
      onStart: () => {
        this.sorrowEngineDeathSequenceActive = true;
        this.sorrowEngineDeathFinished = false;
        this.tweens.killTweensOf(this.sorrowEngine.sprite);
        this.sorrowEngine.sprite.setAlpha(0.74).setTint(0x0c0c0d);
        this.tweens.add({
          targets: this.sorrowEngine.sprite,
          alpha: 0.9,
          yoyo: true,
          repeat: -1,
          duration: 120,
          ease: 'Sine.inOut'
        });
        this.sorrowEngine.projectileTelegraph?.setVisible(false);
        this.hud.setBossBarState({
          visible: true,
          name: KILN_SORROW_ENGINE.name,
          subtitle: 'RUPTURE IMMINENT',
          current: 0,
          max: this.sorrowEngine.maxHealth,
          telegraph: 1,
          wounded: true
        });
        this.cameras.main.shake(KILN_SORROW_ENGINE.deathPayoff.shakeDurationMs, KILN_SORROW_ENGINE.deathPayoff.shakeIntensity, true);
      },
      stages: [
        {
          atMs: KILN_SORROW_ENGINE.deathPayoff.flarePulseDelayMs,
          run: () => {
            if (!this.sorrowEngine?.sprite?.active) {
              return;
            }
            this.tweens.add({
              targets: this.sorrowEngine.sprite,
              scaleX: this.sorrowEngine.sprite.scaleX * 1.08,
              scaleY: this.sorrowEngine.sprite.scaleY * 1.05,
              yoyo: true,
              duration: 280,
              ease: 'Sine.inOut'
            });
            this.hud.setBossBarState({
              visible: true,
              name: KILN_SORROW_ENGINE.name,
              subtitle: 'CORE LITURGY COLLAPSING',
              current: 0,
              max: this.sorrowEngine.maxHealth,
              telegraph: 1,
              wounded: true
            });
          }
        },
        {
          atMs: KILN_SORROW_ENGINE.deathPayoff.collapseCueDelayMs,
          run: () => {
            this.forwardPrompt?.setText('JUDGEMENT GATE STRAINING');
            this.forwardPrompt?.setVisible(true);
            this.cameras.main.shake(480, 0.012, true);
          }
        },
        {
          atMs: KILN_SORROW_ENGINE.deathPayoff.explosionDelayMs,
          run: () => {
            if (!this.sorrowEngine?.sprite?.active) {
              return;
            }
            this.sorrowEngine.sprite.y = WORLD.floorY + 2 - this.sorrowEngine.sprite.displayHeight * (1 - this.sorrowEngine.sprite.originY);
            this.triggerSector02BlackOilPayoff(this.sorrowEngine, KILN_SORROW_ENGINE.blowout);
            this.audioDirector?.playBanishmentSting();
            this.tweens.killTweensOf(this.sorrowEngine.sprite);
            spawnEnemyCorpseRemains(this, {
              x: this.sorrowEngine.sprite.x,
              groundY: WORLD.floorY + 2,
              depth: this.sorrowEngine.sprite.depth,
              size: 'large'
            });
            this.sorrowEngine.sprite.setVisible(false);
            this.sorrowEngineDeathFinished = true;
          }
        },
        {
          atMs: KILN_SORROW_ENGINE.deathPayoff.bossBarDropDelayMs,
          run: () => {
            this.hud.setBossBarState({ visible: false });
          }
        },
        {
          atMs: KILN_SORROW_ENGINE.deathPayoff.unlockRevealDelayMs,
          run: () => {
            if (this.hasUnlockedForwardPath) {
              return;
            }
            grantMajorEncounterIntegrityReward(this.player, this.integrityRewardTracker, 'sector02-chamber03-sorrow-engine-true-boss');
            this.unlockForwardPath();
          }
        }
      ],
      onComplete: () => {
        this.sorrowEngineDeathSequenceActive = false;
      }
    });
  }

  isEnemyOverlapTarget(target, enemy) {
    const collisionTarget = enemy.getCollisionTarget?.();
    return target === enemy.sprite
      || target === enemy.damageHurtbox
      || target === collisionTarget
      || target?.gameObject === enemy.sprite
      || target?.gameObject === enemy.damageHurtbox
      || target?.gameObject === collisionTarget;
  }

  triggerSector02BlackOilPayoff(targetEnemy, config = {}) {
    const sprite = targetEnemy?.sprite;
    if (!sprite || targetEnemy.blackOilPayoffTriggered) {
      return;
    }

    targetEnemy.blackOilPayoffTriggered = true;
    const floorPlaneY = this.player?.sprite?.body?.bottom ?? WORLD.floorY + 2;
    triggerSector02BlackOilBlowout(this, {
      source: sprite,
      x: sprite.x,
      y: floorPlaneY - 14,
      depth: sprite.depth,
      scale: config.scale ?? 1,
      burstCount: config.burstCount,
      burstRadiusX: config.burstRadiusX,
      burstRadiusY: config.burstRadiusY,
      puddleWidth: config.puddleWidth,
      puddleHeight: config.puddleHeight,
      sprayCount: config.sprayCount,
      mistCount: config.mistCount,
      emberCount: config.emberCount,
      durationMs: config.durationMs
    });
  }

  unlockForwardPath() {
    this.hasUnlockedForwardPath = true;
    this.cameras.main.shake(360, 0.008, true);
    this.cameras.main.flash(220, 22, 18, 14, false);
    this.forwardBarrier?.setAlpha(0.08);
    this.forwardBarrier?.setFillStyle(0xa3896a, 0.08);
    if (this.forwardBarrier?.body) {
      this.forwardBarrier.body.enable = false;
      this.forwardBarrier.body.updateFromGameObject?.();
    }
    this.tweens.killTweensOf(this.forwardBarrier);
    this.tweens.add({
      targets: this.forwardBarrier,
      alpha: 0.24,
      duration: 220,
      yoyo: true,
      ease: 'Sine.inOut'
    });
    this.forwardPrompt?.setVisible(false);
  }

  refreshForwardThresholdPresence() {
    const wasInsideThreshold = this.hasEnteredForwardThreshold;
    this.currentForwardThreshold = null;
    if (!this.forwardThresholdZone) {
      this.hasEnteredForwardThreshold = false;
      this.forwardThresholdAwaitingFreshInteract = false;
      return;
    }
    this.physics.overlap(this.player.sprite, this.forwardThresholdZone, () => {
      this.currentForwardThreshold = this.forwardThresholdZone;
    });
    this.hasEnteredForwardThreshold = Boolean(this.currentForwardThreshold);
    if (!this.hasEnteredForwardThreshold) {
      this.forwardThresholdAwaitingFreshInteract = false;
    } else if (!wasInsideThreshold) {
      this.forwardThresholdAwaitingFreshInteract = true;
    }

    const promptVisible = Boolean(this.currentForwardThreshold) || (this.hasUnlockedForwardPath && !this.hasTriggeredForwardContract);
    const promptText = this.hasUnlockedForwardPath
      ? this.hasTriggeredForwardContract
        ? 'DESCENT MARKED\nENTERING THE CRADLE OF REFUSAL'
        : 'SORROW ENGINE RUPTURED\nPRESS RITE / [E] TO DESCEND INTO SECTOR III'
      : this.hasTriggeredBossReveal
        ? 'SLAUGHTER THE SORROW ENGINE'
        : 'BANISHER GATE SEALED';
    this.forwardPrompt?.setVisible(promptVisible).setText(promptText);
  }

  tryAdvanceForwardThreshold(mobileInput) {
    if (!this.hasUnlockedForwardPath || !this.currentForwardThreshold) {
      return;
    }

    const interactHeld = this.keyInteract?.isDown || this.keyEnter?.isDown || mobileInput.interactHeld;
    if (this.forwardThresholdAwaitingFreshInteract) {
      if (interactHeld) {
        return;
      }
      this.forwardThresholdAwaitingFreshInteract = false;
    }

    const interactPressed = Phaser.Input.Keyboard.JustDown(this.keyInteract) || Phaser.Input.Keyboard.JustDown(this.keyEnter) || mobileInput.interactPressed;
    if (!interactPressed) {
      return;
    }

    this.hasTriggeredForwardContract = true;
    this.forwardPrompt?.setVisible(false);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.cleanupSceneUi?.();
      this.audioDirector?.shutdown();
      this.scene.start('Sector03Chamber01Scene', {
        fromScene: this.scene.key,
        fromGate: 'kiln-of-judgement-threshold'
      });
    });
    this.cameras.main.fadeOut(320, 0, 0, 0);
  }

  createInvisiblePlatform(x, y, width, height) {
    const platform = this.add.rectangle(x, y, width, height, 0x000000, 0).setOrigin(0.5);
    platform.setVisible(false);
    this.physics.add.existing(platform, true);
    this.platforms.add(platform);
    return platform;
  }

  handleDevWarp() {
    if (this.scene.isActive('LoreCutsceneScene')) {
      return;
    }
    this.cleanupSceneUi?.();
    this.audioDirector?.shutdown();
    this.scene.start('Sector03Chamber01Scene', { devWarp: true, source: this.scene.key });
  }

  cleanupSceneUi() {
    this.hud?.setBossBarState({ visible: false });
    this.hud?.setVisible(true);
    this.uiCamera?.setVisible(true);
    this.enemyProjectiles.forEach((projectile) => projectile.destroyProjectile());
  }

  setupMobileUiCamera() {
    if (!this.mobileControls.enabled) {
      return;
    }

    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'Sector02Chamber03MobileUiCamera');
    const mobileUiElements = this.mobileControls.getUiElements();
    const mobileUiSet = new Set(mobileUiElements);
    const nonMobileObjects = this.children.list.filter((element) => !mobileUiSet.has(element));
    this.cameras.main.ignore(mobileUiElements);
    this.uiCamera.ignore(nonMobileObjects);
    if (this.restartText) {
      this.uiCamera.ignore(this.restartText);
    }
  }

  applyResponsiveLayout() {
    const width = this.scale.width;
    const height = this.scale.height;
    const isPortrait = height >= width;
    const camera = this.cameras.main;
    const isPortraitMobile = isPortrait && this.mobileControls.enabled;

    if (this.uiCamera) {
      this.uiCamera.setViewport(0, 0, width, height);
    }

    if (isPortraitMobile) {
      const safeAreaBottom = this.mobileControls.getSafeAreaInsetPx('bottom');
      const maxWorldBandFromControlNeeds = height - PORTRAIT_LAYOUT.minControlBand - safeAreaBottom;
      const worldBandMax = Math.max(
        PORTRAIT_LAYOUT.worldBandMin,
        Math.min(PORTRAIT_LAYOUT.worldBandMax, maxWorldBandFromControlNeeds)
      );
      const worldBandHeight = Phaser.Math.Clamp(
        Math.floor(height * PORTRAIT_LAYOUT.worldBandRatio),
        PORTRAIT_LAYOUT.worldBandMin,
        worldBandMax
      );

      camera.setViewport(0, 0, width, worldBandHeight);
      camera.setZoom(PORTRAIT_LAYOUT.portraitZoom);
      this.directionalCameraBias?.setLayout({ isPortrait: true, followOffsetY: PORTRAIT_LAYOUT.portraitFollowOffsetY });
      this.mobileControls.setReservedBottomPx(height - worldBandHeight);
      this.restartText?.setPosition(width / 2, Math.max(PORTRAIT_LAYOUT.restartTextMinY, worldBandHeight * PORTRAIT_LAYOUT.restartTextRatioY));
      this.hud?.layout();
      return;
    }

    camera.setViewport(0, 0, width, height);
    camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
    this.directionalCameraBias?.setLayout({ isPortrait: false, followOffsetY: PORTRAIT_LAYOUT.desktopFollowOffsetY });
    this.mobileControls.setReservedBottomPx(0);
    this.restartText?.setPosition(width / 2, 90);
    this.hud?.layout();
  }

  applyGameplayReadabilitySupport(target) {
    if (!target) {
      return null;
    }

    return null;
  }
}
