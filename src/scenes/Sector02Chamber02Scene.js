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
import { restartRunFromDeath } from '../systems/RunReset.js';
import { triggerSector02BlackOilBlowout } from '../systems/Sector02BlackOilPayoff.js';
import { applyChamberEntryRestore, grantMajorEncounterIntegrityReward } from '../systems/VesselRunEconomy.js';
import { bossPitRunState } from '../systems/BossPitRunState.js';
import { MajorEncounterResolution } from '../systems/MajorEncounterResolution.js';
import { spawnEnemyCorpseRemains } from '../systems/EnemyCorpseRemains.js';

const COMPRESSION_VAULTS_BOOTSTRAP = {
  sceneKey: 'Sector02Chamber02Scene',
  worldWidth: 5760,
  floorColliderHeight: 72,
  spawnX: 220,
  spawnY: PLAYER.startY,
  cameraLerp: { x: 0.08, y: 0.08 },
  portraitFollowOffsetX: -112,
  desktopFollowOffsetX: -156,
  backdropDepth: -16,
  lowerBandY: WORLD.floorY - 78,
  lowerBandHeight: 286,
  lowerBandAlpha: 0.2,
  pressureBandY: WORLD.floorY - 128,
  pressureBandHeight: 170
};

const CHAMBER_ENTRY_STAGING = {
  settleDelayMs: 180,
  postSettleHoldMs: 220,
  defaultFadeInDurationMs: 650,
  bossPitReturnFadeInDurationMs: 980,
  maskColor: 0x000000,
  maskAlpha: 1
};

const COMPRESSION_VAULTS_SEGMENTS = [
  { key: ASSET_KEYS.sector02Chamber02BackgroundEntryLockBasin, x: 430, y: 220, width: 920, height: 470, tint: 0xc1c3b6, alpha: 0.74, depth: -14.76 },
  { key: ASSET_KEYS.sector02Chamber02BackgroundWallModule, x: 1220, y: 216, width: 820, height: 450, tint: 0xabb0a3, alpha: 0.58, depth: -14.6 },
  { key: ASSET_KEYS.sector02Chamber02BackgroundWallModule, x: 1990, y: 216, width: 820, height: 450, tint: 0x979b91, alpha: 0.56, depth: -14.58 },
  { key: ASSET_KEYS.sector02Chamber02BackgroundCompressionVault, x: 2820, y: 214, width: 980, height: 460, tint: 0xc0c6b8, alpha: 0.76, depth: -14.8 },
  { key: ASSET_KEYS.sector02Chamber02BackgroundWallModule, x: 3650, y: 216, width: 820, height: 450, tint: 0x90958d, alpha: 0.54, depth: -14.56 },
  { key: ASSET_KEYS.sector02Chamber02BackgroundThreshold, x: 4470, y: 216, width: 940, height: 458, tint: 0xbdc3b6, alpha: 0.72, depth: -14.74 },
  { key: ASSET_KEYS.sector02Chamber02BackgroundClimaxCrucibleGate, x: 5310, y: 212, width: 820, height: 462, tint: 0xc9d0c2, alpha: 0.8, depth: -14.82 }
];

const COMPRESSION_VAULTS_RIBS = [
  { x: 1020, ribWidth: 28, ribHeight: 314, archWidth: 240, archHeight: 146, alpha: 0.14, depth: -11.74 },
  { x: 2560, ribWidth: 32, ribHeight: 348, archWidth: 280, archHeight: 170, alpha: 0.16, depth: -11.82 },
  { x: 4050, ribWidth: 30, ribHeight: 330, archWidth: 250, archHeight: 150, alpha: 0.16, depth: -11.78 },
  { x: 5160, ribWidth: 34, ribHeight: 366, archWidth: 304, archHeight: 182, alpha: 0.18, depth: -11.88 }
];

const COMPRESSION_VAULTS_ART_OVERLAYS = [
  { key: ASSET_KEYS.sector02Chamber02BackgroundWallModule, x: 1615, y: 214, width: 1050, height: 474, tint: 0x8a8f86, alpha: 0.18, depth: -13.98 },
  { key: ASSET_KEYS.sector02Chamber02BackgroundCompressionVault, x: 3230, y: 212, width: 1160, height: 490, tint: 0xa3aaa0, alpha: 0.2, depth: -13.99 },
  { key: ASSET_KEYS.sector02Chamber02BackgroundThreshold, x: 4455, y: 210, width: 1080, height: 500, tint: 0x9ca39a, alpha: 0.22, depth: -13.98 },
  { key: ASSET_KEYS.sector02Chamber02BackgroundClimaxCrucibleGate, x: 5215, y: 206, width: 960, height: 520, tint: 0xaeb6ab, alpha: 0.24, depth: -13.97 }
];

const COMPRESSION_VAULTS_BUTTRESSES = [
  { x: 1460, y: WORLD.floorY - 154, width: 208, height: 256, capWidth: 288, capHeight: 26, alpha: 0.16, depth: -10.88 },
  { x: 2880, y: WORLD.floorY - 166, width: 232, height: 280, capWidth: 326, capHeight: 28, alpha: 0.18, depth: -10.94 },
  { x: 4300, y: WORLD.floorY - 162, width: 220, height: 270, capWidth: 308, capHeight: 28, alpha: 0.18, depth: -10.92 },
  { x: 5090, y: WORLD.floorY - 176, width: 256, height: 306, capWidth: 352, capHeight: 30, alpha: 0.22, depth: -10.98 }
];

const COMPRESSION_VAULTS_CLIMAX_FRAMING = {
  approachPlateX: 5000,
  approachPlateY: WORLD.floorY - 146,
  approachPlateWidth: 780,
  approachPlateHeight: 282,
  crucibleShadowWidth: 564,
  crucibleShadowHeight: 44,
  deaconDaisWidth: 356,
  deaconDaisHeight: 44,
  deaconDaisY: WORLD.floorY - 14,
  deaconBackPlateWidth: 440,
  deaconBackPlateHeight: 290,
  deaconBackPlateY: WORLD.floorY - 174
};

const COMPRESSION_VAULTS_SKITTER_BASIC_01 = {
  ...SKITTER,
  textureKey: ASSET_KEYS.sector02Chamber02EnemyBasic01,
  speed: 52,
  aggroRange: 244,
  patrolDistance: 118,
  presentation: {
    alpha: 0.97,
    display: { width: 178, height: 148 },
    origin: { x: 0.52, y: 0.92 },
    stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.44 }
  },
  eyeGlowColor: 0xbfd1a7,
  eyeGlowWidth: 30,
  eyeGlowHeight: 14,
  eyeGlowOffsetX: 14,
  eyeGlowYOffset: 10,
  eyeGlowAlphaBase: 0.28,
  eyeGlowWindupAlphaGain: 0.24,
  body: { width: 54, height: 30, offsetX: 10, offsetY: 18 }
};

const COMPRESSION_VAULTS_SKITTER_BASIC_02 = {
  ...COMPRESSION_VAULTS_SKITTER_BASIC_01,
  textureKey: ASSET_KEYS.sector02Chamber02EnemyBasic02,
  speed: 56,
  patrolDistance: 132,
  presentation: {
    ...COMPRESSION_VAULTS_SKITTER_BASIC_01.presentation,
    display: { width: 186, height: 152 }
  },
  eyeGlowColor: 0xd1ddbb
};

const COMPRESSION_VAULTS_TOLL_KEEPER = {
  ...SKITTER,
  textureKey: ASSET_KEYS.sector02Chamber02EnemyElite,
  variantName: 'PRESSURE TOLL-KEEPER',
  health: 7,
  speed: 45,
  aggroRange: 286,
  attackCooldownMs: 3100,
  windupMs: 840,
  attackActiveMs: 320,
  attackRecoveryMs: 640,
  hesitationMs: 580,
  attackTriggerRange: 164,
  attackRange: 196,
  preferredRange: 140,
  rangeBand: 20,
  lungeSpeedBonus: 100,
  lungeJumpVelocity: -90,
  recoilVelocityX: 144,
  recoilVelocityY: -84,
  patrolDistance: 94,
  body: { width: 74, height: 44, offsetX: 28, offsetY: 90 },
  presentation: {
    alpha: 0.98,
    display: { width: 292, height: 226 },
    origin: { x: 0.52, y: 0.965 },
    stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.46 }
  },
  eyeGlowColor: 0xe8f1c1,
  eyeGlowWidth: 40,
  eyeGlowHeight: 18,
  eyeGlowOffsetX: 20,
  eyeGlowYOffset: 18,
  eyeGlowAlphaBase: 0.42,
  eyeGlowWindupAlphaGain: 0.44,
  poise: {
    max: 4,
    recoverDelayMs: 1700,
    recoverPerSecond: 1.1,
    staggerDurationMs: 1400,
    finisherRange: 126
  },
  audioProfile: 'tollkeeper'
};

const COMPRESSION_VAULTS_ELITE_PROJECTILE = {
  cooldownMs: 4200,
  windupMs: 580,
  recoveryMs: 720,
  minRange: 240,
  maxRange: 520,
  verticalTolerance: 148,
  spawnOffsetX: 64,
  spawnOffsetY: -82,
  speed: 248,
  damage: 1,
  lifetimeMs: 1900,
  rotationSpeed: 420,
  telegraphRadiusX: 74,
  telegraphRadiusY: 24
};

const MAJOR_FINISHER = {
  ritePromptText: 'RITE FINISHER READY',
  promptOffsetY: -132,
  elite: { poiseDamagePerHit: 1, shakeDurationMs: 130, shakeIntensity: 0.0046, subtitle: 'RITE WINDOW: TOLL-KEEPER' },
  miniboss: { poiseDamagePerHit: 1, shakeDurationMs: 260, shakeIntensity: 0.0084, subtitle: 'RITE WINDOW: PRESSURE DEACON' }
};

const COMPRESSION_VAULTS_ENCOUNTER_POCKETS = [
  {
    id: 'compression-vaults-entry-seal',
    label: 'ENTRY LOCK',
    zoneX: 1240,
    zoneY: WORLD.floorY - 72,
    zoneWidth: 520,
    zoneHeight: 226,
    markerWidth: 324,
    markerHeight: 74,
    markerAlpha: 0.08,
    promptOffsetY: -136,
    enemies: [
      { type: 'basic01', x: 1155, y: PLAYER.startY, patrolDistance: 80, wakeDelayMs: 0 },
      { type: 'basic02', x: 1388, y: PLAYER.startY, patrolDistance: 114, wakeDelayMs: 80 }
    ]
  },
  {
    id: 'compression-vaults-mid-procession',
    label: 'PROCESSION NARROWS',
    zoneX: 2760,
    zoneY: WORLD.floorY - 72,
    zoneWidth: 680,
    zoneHeight: 236,
    markerWidth: 388,
    markerHeight: 80,
    markerAlpha: 0.1,
    promptOffsetY: -146,
    enemies: [
      { type: 'basic01', x: 2430, y: PLAYER.startY, patrolDistance: 104, wakeDelayMs: 0 },
      { type: 'basic02', x: 2720, y: PLAYER.startY, patrolDistance: 118, wakeDelayMs: 90 },
      { type: 'basic01', x: 2910, y: PLAYER.startY, patrolDistance: 84, wakeDelayMs: 130 },
      { type: 'basic01', x: 3055, y: PLAYER.startY, patrolDistance: 96, wakeDelayMs: 170 }
    ]
  },
  {
    id: 'compression-vaults-threshold-seal',
    label: 'THRESHOLD PRESSURE',
    zoneX: 4510,
    zoneY: WORLD.floorY - 74,
    zoneWidth: 940,
    zoneHeight: 242,
    markerWidth: 474,
    markerHeight: 84,
    markerAlpha: 0.12,
    promptOffsetY: -152,
    enemies: [
      { type: 'basic02', x: 4185, y: PLAYER.startY, patrolDistance: 114, wakeDelayMs: 0 },
      { type: 'basic01', x: 4380, y: PLAYER.startY, patrolDistance: 108, wakeDelayMs: 70 },
      { type: 'elite', x: 4540, y: PLAYER.startY, patrolDistance: 86, wakeDelayMs: 120, projectileCadence: 'measured' },
      { type: 'basic01', x: 4725, y: PLAYER.startY, patrolDistance: 84, wakeDelayMs: 150 },
      { type: 'basic01', x: 4890, y: PLAYER.startY, patrolDistance: 120, wakeDelayMs: 200 }
    ]
  }
];

const COMPRESSION_VAULTS_LORE = {
  anchor: {
    id: 'compression-vault-trap-altar',
    label: 'READ THE COMPRESSION ALTAR',
    zoneX: 980,
    zoneY: WORLD.floorY - 78,
    zoneWidth: 196,
    zoneHeight: 204,
    promptOffsetY: -170,
    altarX: 980,
    altarY: WORLD.floorY - 102,
    altarDisplayWidth: 178,
    altarDisplayHeight: 178,
    supportWidth: 238,
    supportHeight: 126,
    supportTopY: WORLD.floorY - 78,
    shadowWidth: 292,
    wallPlateWidth: 568,
    wallPlateHeight: 330,
    wallPlateY: WORLD.floorY - 144,
    muralX: 980,
    muralY: 214,
    muralWidth: 436,
    muralHeight: 268,
    muralBackingWidth: 522,
    muralBackingHeight: 322
  }
};

const SHOW_SECTOR02_DEBUG_LABELS = false;

const COMPRESSION_VAULTS_FORWARD_GATE = {
  barrierX: 5310,
  barrierY: WORLD.floorY - 70,
  barrierWidth: 94,
  barrierHeight: 236,
  thresholdX: 5455,
  thresholdY: WORLD.floorY - 76,
  thresholdWidth: 210,
  thresholdHeight: 220,
  promptOffsetY: -162
};

const COMPRESSION_VAULTS_PRESSURE_DEACON = {
  name: 'PRESSURE DEACON',
  subtitle: 'Crucible Mouth Confessor',
  health: 7,
  contactDamage: 2,
  contactDamageCooldownMs: 1180,
  attackCooldownMs: 3200,
  attackTelegraphMs: 760,
  attackRecoveryMs: 700,
  attackRange: 196,
  approachRange: 336,
  approachSpeed: 40,
  idleAdvanceSpeed: 16,
  windupDriftSpeed: 9,
  attackSpeed: 188,
  attackLiftVelocity: -120,
  hitPulseMs: 260,
  hurtRecoverMs: 210,
  hurtRecoilVelocityX: 92,
  hurtRecoilVelocityY: -56,
  spawnX: 5196,
  spawnY: WORLD.floorY - 2,
  activationX: 4890,
  body: { width: 96, height: 132, offsetX: 108, offsetY: 150 },
  audioProfile: 'miniboss',
  poise: {
    max: 6,
    recoverDelayMs: 2000,
    recoverPerSecond: 1.2,
    staggerDurationMs: 2400,
    finisherRange: 160
  },
  presentation: {
    display: { width: 332, height: 356 },
    origin: { x: 0.54, y: 0.988 },
    alpha: 0.985,
    tint: 0xd9e0d3,
    scaleX: 1,
    scaleY: 1
  },

  groundBurst: {
    enabled: true,
    cooldownMs: 7300,
    windupMs: 1120,
    activeMs: 140,
    recoveryMs: 900,
    minRange: 124,
    maxRange: 410,
    radius: 136,
    damage: 1,
    yTolerance: 150,
    burstOffsetY: -2,
    burstColor: 0x3f171c,
    burstAlpha: 0.44,
    telegraphStyle: {
      fillColor: 0x140609,
      fillAlpha: 0.22,
      outerRingColor: 0x5e1b22,
      outerRingAlpha: 0.78,
      innerRingColor: 0x311118,
      innerRingAlpha: 0.64,
      sigilColor: 0x15373a,
      sigilAlpha: 0.28,
      runeColor: 0x2a1217,
      runeAlpha: 0.72,
      depth: 6.12
    }
  },
  projectile: {
    textureKey: ASSET_KEYS.sector02PressureShardProjectile,
    cooldownMs: 5000,
    windupMs: 820,
    recoveryMs: 920,
    minRange: 260,
    maxRange: 560,
    verticalTolerance: 164,
    spawnOffsetX: 82,
    spawnOffsetY: -112,
    speed: 246,
    damage: 1,
    lifetimeMs: 2000,
    rotationSpeed: 400,
    telegraphRadiusX: 94,
    telegraphRadiusY: 30
  },
  blowout: {
    scale: 1.14,
    burstCount: 26,
    burstRadiusX: 182,
    burstRadiusY: 84,
    puddleWidth: 238,
    puddleHeight: 42,
    sprayCount: 42,
    mistCount: 26,
    emberCount: 15,
    durationMs: 980
  }
};

export class Sector02Chamber02Scene extends Phaser.Scene {
  constructor() {
    super(COMPRESSION_VAULTS_BOOTSTRAP.sceneKey);
  }

  init(data) {
    this.transitionContext = data ?? {};
    this.isRestartingRun = false;
    this.isLoreTransitionActive = false;
    this.isBossPitReturnSequenceActive = false;
    this.hasCompletedLoreBeat = false;
    this.hasTriggeredTrapAltar = false;
    this.hasCompletedBossPitLoop = Boolean(this.transitionContext?.bossPitCompleted || this.transitionContext?.returnFromBossPit) || bossPitRunState.hasSector02Chamber02BossPitCompleted();
    this.hasUnlockedForwardPath = false;
    this.hasTriggeredForwardContract = false;
    this.currentForwardThreshold = null;
    this.currentLoreZone = null;
    this.enemies = [];
    this.encounterPockets = [];
    this.enemyProjectiles = [];
    this.enemyProjectilesPaused = false;
    this.loreAnchor = null;
    this.pressureDeacon = null;
    this.currentRiteFinisherTarget = null;
    this.hasEnteredForwardThreshold = false;
    this.forwardThresholdAwaitingFreshInteract = false;
    this.integrityRewardTracker = new Set();
    this.bossPitReturnStagingMask = null;
    this.isEntryStagingActive = false;
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
    this.cameras.main.resetFX();
    this.cameras.main.setAlpha(0);
    this.beginChamberEntryStaging({
      fadeInDurationMs: this.transitionContext?.returnFromBossPit
        ? CHAMBER_ENTRY_STAGING.bossPitReturnFadeInDurationMs
        : CHAMBER_ENTRY_STAGING.defaultFadeInDurationMs
    });

    if (this.transitionContext?.returnFromBossPit) {
      this.scene.setVisible(true, this.scene.key);
      this.restoreViewportLayoutAfterBossPitReturn();
      this.hasCompletedLoreBeat = true;
      this.hasTriggeredTrapAltar = true;
      this.hasCompletedBossPitLoop = true;
      bossPitRunState.markSector02Chamber02BossPitCompleted();
      return;
    }
  }

  createWorldBounds() {
    this.physics.world.gravity.y = WORLD.gravityY;
    this.cameras.main.setBounds(0, 0, COMPRESSION_VAULTS_BOOTSTRAP.worldWidth, WORLD.height);
    this.physics.world.setBounds(0, 0, COMPRESSION_VAULTS_BOOTSTRAP.worldWidth, WORLD.height);
    this.cameras.main.setBackgroundColor('#040506');
    this.platforms = this.physics.add.staticGroup();
  }

  createAudio() {
    this.audioDirector = new AudioDirector(this);
    this.audioDirector.playAmbientLoop(ASSET_KEYS.ambientChamber02Loop01, { volume: 0.11 });
  }

  createBackdrop() {
    this.add.rectangle(COMPRESSION_VAULTS_BOOTSTRAP.worldWidth / 2, WORLD.height / 2, COMPRESSION_VAULTS_BOOTSTRAP.worldWidth, WORLD.height, 0x040506, 1).setDepth(COMPRESSION_VAULTS_BOOTSTRAP.backdropDepth);
    this.add.rectangle(COMPRESSION_VAULTS_BOOTSTRAP.worldWidth / 2, COMPRESSION_VAULTS_BOOTSTRAP.lowerBandY, COMPRESSION_VAULTS_BOOTSTRAP.worldWidth, COMPRESSION_VAULTS_BOOTSTRAP.lowerBandHeight, 0x080d0e, COMPRESSION_VAULTS_BOOTSTRAP.lowerBandAlpha).setDepth(-14.24);
    this.add.rectangle(COMPRESSION_VAULTS_BOOTSTRAP.worldWidth / 2, COMPRESSION_VAULTS_BOOTSTRAP.pressureBandY, COMPRESSION_VAULTS_BOOTSTRAP.worldWidth, COMPRESSION_VAULTS_BOOTSTRAP.pressureBandHeight, 0x101617, 0.1).setDepth(-13.8);
    this.renderSegmentBackdrop();
    this.renderCompressionArchitecture();
    this.renderWalkway();
    this.renderClimaxApproach();
    this.renderGateThreshold();
    this.createInvisiblePlatform(COMPRESSION_VAULTS_BOOTSTRAP.worldWidth / 2, WORLD.floorY + 28, COMPRESSION_VAULTS_BOOTSTRAP.worldWidth, COMPRESSION_VAULTS_BOOTSTRAP.floorColliderHeight);
  }

  renderSegmentBackdrop() {
    COMPRESSION_VAULTS_SEGMENTS.forEach((segment, index) => {
      if (this.textures.exists(segment.key)) {
        this.add.image(segment.x, segment.y, segment.key).setDisplaySize(segment.width, segment.height).setTint(segment.tint).setAlpha(segment.alpha).setDepth(segment.depth);
      } else {
        this.add.rectangle(segment.x, segment.y, segment.width, segment.height, 0x263031, 0.8).setDepth(segment.depth);
      }

      this.add.ellipse(segment.x, WORLD.floorY - 34, segment.width * 0.78, 58, 0x030404, 0.12 + index * 0.012).setDepth(-14.1);
    });
  }

  renderCompressionArchitecture() {
    COMPRESSION_VAULTS_ART_OVERLAYS.forEach((overlay) => {
      if (!this.textures.exists(overlay.key)) {
        return;
      }

      this.add.image(overlay.x, overlay.y, overlay.key)
        .setDisplaySize(overlay.width, overlay.height)
        .setTint(overlay.tint)
        .setAlpha(overlay.alpha)
        .setDepth(overlay.depth);
    });

    COMPRESSION_VAULTS_RIBS.forEach((marker) => {
      const ribY = WORLD.floorY - marker.ribHeight / 2 - 20;
      const leftRibX = marker.x - marker.archWidth / 2;
      const rightRibX = marker.x + marker.archWidth / 2;

      this.add.rectangle(leftRibX, ribY, marker.ribWidth, marker.ribHeight, 0x181d1e, marker.alpha).setDepth(marker.depth);
      this.add.rectangle(rightRibX, ribY, marker.ribWidth, marker.ribHeight, 0x181d1e, marker.alpha).setDepth(marker.depth);
      this.add.ellipse(marker.x, ribY - marker.ribHeight / 2 + 24, marker.archWidth, marker.archHeight, 0x36403f, marker.alpha * 0.9).setDepth(marker.depth - 0.03);
      this.add.rectangle(marker.x, WORLD.floorY - 120, marker.archWidth * 0.66, 22, 0x151b1c, marker.alpha * 0.76).setDepth(-11.3);
      this.add.ellipse(marker.x, WORLD.floorY + 12, marker.archWidth * 1.18, 26, 0x020303, marker.alpha).setDepth(-5.2);
    });

    COMPRESSION_VAULTS_BUTTRESSES.forEach((buttress, index) => {
      this.add.rectangle(buttress.x, buttress.y, buttress.width, buttress.height, 0x131818, buttress.alpha).setDepth(buttress.depth);
      this.add.rectangle(buttress.x, buttress.y - buttress.height * 0.46, buttress.capWidth, buttress.capHeight, 0x252e2d, buttress.alpha * 0.88).setDepth(buttress.depth + 0.02);
      this.add.ellipse(buttress.x, WORLD.floorY - 12, buttress.capWidth * 0.94, 26, 0x020404, 0.14 + index * 0.014).setDepth(-6.02);
    });

    [860, 1680, 2420, 3250, 3980, 4710].forEach((x, index) => {
      this.add.rectangle(x, WORLD.floorY - 188, 18, 144, 0x1b2324, 0.12 + index * 0.008).setDepth(-11.18);
      this.add.rectangle(x, WORLD.floorY - 96, 132, 14, 0x2e3938, 0.09).setDepth(-11.12);
    });
  }

  renderClimaxApproach() {
    const frame = COMPRESSION_VAULTS_CLIMAX_FRAMING;
    this.add.rectangle(frame.approachPlateX, frame.approachPlateY, frame.approachPlateWidth, frame.approachPlateHeight, 0x0a1011, 0.24).setDepth(-13.72);
    this.add.ellipse(frame.approachPlateX + 38, WORLD.floorY - 18, frame.crucibleShadowWidth, frame.crucibleShadowHeight, 0x010203, 0.32).setDepth(-6.06);
    this.add.rectangle(COMPRESSION_VAULTS_PRESSURE_DEACON.spawnX, frame.deaconBackPlateY, frame.deaconBackPlateWidth, frame.deaconBackPlateHeight, 0x101717, 0.28).setDepth(-10.86);
    this.add.rectangle(COMPRESSION_VAULTS_PRESSURE_DEACON.spawnX, frame.deaconDaisY, frame.deaconDaisWidth, frame.deaconDaisHeight, 0x1c2323, 0.62).setDepth(-6.16);
    this.add.rectangle(COMPRESSION_VAULTS_PRESSURE_DEACON.spawnX, frame.deaconDaisY - 16, frame.deaconDaisWidth * 0.84, 10, 0x788175, 0.16).setDepth(-6.14);
    this.add.ellipse(COMPRESSION_VAULTS_PRESSURE_DEACON.spawnX, WORLD.floorY + 8, frame.deaconDaisWidth * 1.12, 34, 0x020304, 0.4).setDepth(-6.1);
  }

  renderWalkway() {
    this.add.rectangle(COMPRESSION_VAULTS_BOOTSTRAP.worldWidth / 2, WORLD.floorY - 12, COMPRESSION_VAULTS_BOOTSTRAP.worldWidth, 92, 0x131515, 0.96).setDepth(-6.3);
    this.add.rectangle(COMPRESSION_VAULTS_BOOTSTRAP.worldWidth / 2, WORLD.floorY - 48, COMPRESSION_VAULTS_BOOTSTRAP.worldWidth, 20, 0x212727, 0.68).setDepth(-6.26);
    this.add.rectangle(COMPRESSION_VAULTS_BOOTSTRAP.worldWidth / 2, WORLD.floorY - 2, COMPRESSION_VAULTS_BOOTSTRAP.worldWidth, 8, 0x2d3534, 0.24).setDepth(-6.2);

    if (this.textures.exists(ASSET_KEYS.sector02Chamber02Floor)) {
      this.add.tileSprite(COMPRESSION_VAULTS_BOOTSTRAP.worldWidth / 2, WORLD.floorY + 4, COMPRESSION_VAULTS_BOOTSTRAP.worldWidth, 48, ASSET_KEYS.sector02Chamber02Floor)
        .setTint(0xa4ab9d)
        .setAlpha(0.14)
        .setDepth(-6.18);
    }

    [620, 1380, 2140, 2900, 3660, 4420, 5180].forEach((x, index) => {
      this.add.rectangle(x, WORLD.floorY - 26, 168, 7, 0x738376, 0.16 + index * 0.008).setDepth(-6.14);
      this.add.rectangle(x, WORLD.floorY - 6, 5, 34, 0x050606, 0.3).setDepth(-6.08);
    });

    this.add.ellipse(COMPRESSION_VAULTS_BOOTSTRAP.worldWidth / 2, WORLD.floorY + 12, COMPRESSION_VAULTS_BOOTSTRAP.worldWidth, 48, 0x010202, 0.34).setDepth(-5.9);
  }

  renderGateThreshold() {
    const gateX = COMPRESSION_VAULTS_FORWARD_GATE.barrierX;
    const gateY = WORLD.floorY - 170;

    this.add.ellipse(gateX, WORLD.floorY + 4, 370, 48, 0x020303, 0.36).setDepth(-5.84);
    this.add.rectangle(gateX, WORLD.floorY - 110, 430, 246, 0x0d1213, 0.26).setDepth(-13.7);

    if (this.textures.exists(ASSET_KEYS.sector02Chamber02Gate)) {
      this.add.image(gateX, gateY, ASSET_KEYS.sector02Chamber02Gate).setDisplaySize(344, 344).setTint(0xc7cec0).setAlpha(0.84).setDepth(-4.92);
    } else {
      this.add.ellipse(gateX, gateY, 270, 320, 0x33403e, 0.82).setStrokeStyle(3, 0xd7d5c8, 0.52).setDepth(-4.92);
    }

    if (SHOW_SECTOR02_DEBUG_LABELS) {
      this.processionalLabel = this.add.text(gateX - 18, WORLD.floorY - 274, 'COMPRESSION VAULTS\nCRUCIBLE GATE', {
        fontFamily: 'monospace', fontSize: '17px', color: '#d2d8cd', align: 'center', stroke: '#0c0f10', strokeThickness: 4
      }).setOrigin(0.5).setDepth(-4.74).setAlpha(0.82);
    }
  }

  createPlayerAndColliders() {
    const spawnX = this.transitionContext?.returnFromBossPit
      ? this.transitionContext.returnPlayerX ?? COMPRESSION_VAULTS_LORE.anchor.altarX + 56
      : COMPRESSION_VAULTS_BOOTSTRAP.spawnX;
    const spawnY = this.transitionContext?.returnFromBossPit
      ? this.transitionContext.returnPlayerY ?? COMPRESSION_VAULTS_BOOTSTRAP.spawnY
      : COMPRESSION_VAULTS_BOOTSTRAP.spawnY;
    this.player = new Player(this, spawnX, spawnY, PLAYER);
    const entryIntegrity = applyChamberEntryRestore(this.transitionContext);
    this.player.health = entryIntegrity.current;
    this.player.maxHealth = entryIntegrity.max;
    this.applyGameplayReadabilitySupport(this.player.sprite, { fill: 0xc2c9bf, alpha: 0.16, scale: 1.08 });
    this.physics.add.collider(this.player.sprite, this.platforms);
  }

  createEnemyProjectiles() {
    this.enemyProjectiles = [];
    this.enemyProjectileGroup = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });
    this.physics.add.overlap(this.player.sprite, this.enemyProjectileGroup, (_playerSprite, projectileSprite) => {
      this.handleEnemyProjectileHit(projectileSprite);
    });
  }

  spawnEnemyProjectile(config) {
    let projectile = this.enemyProjectiles.find((entry) => !entry.active);
    if (!projectile) {
      projectile = new EnemyProjectile(this, {
        speed: config.speed ?? COMPRESSION_VAULTS_ELITE_PROJECTILE.speed,
        damage: config.damage ?? COMPRESSION_VAULTS_ELITE_PROJECTILE.damage,
        lifetimeMs: config.lifetimeMs ?? COMPRESSION_VAULTS_ELITE_PROJECTILE.lifetimeMs,
        rotationSpeed: config.rotationSpeed ?? COMPRESSION_VAULTS_ELITE_PROJECTILE.rotationSpeed,
        bodySize: { width: 28, height: 28 },
        depth: config.depth ?? 6.32,
        presentation: {
          displayWidth: 42,
          displayHeight: 42,
          alpha: 0.98,
          fallbackFill: 0xc7d4c0,
          fallbackStroke: 0x67807a
        },
        impact: {
          durationMs: 130,
          alpha: 0.88,
          scaleMultiplier: 1.18,
          tint: 0xe0ead2
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
    this.encounterPockets = COMPRESSION_VAULTS_ENCOUNTER_POCKETS.map((pocketConfig) => this.createEncounterPocket(pocketConfig));
    if (SHOW_SECTOR02_DEBUG_LABELS) {
      this.footholdLabel = this.add.text(4300, WORLD.floorY - 224, 'SECTOR 02\nCHAMBER 02', {
        fontFamily: 'monospace', fontSize: '18px', color: '#cfd7cc', align: 'center', stroke: '#0c0f10', strokeThickness: 4
      }).setOrigin(0.5).setDepth(-4.74).setAlpha(0.82);
    }
  }

  createEncounterPocket(pocketConfig) {
    const zone = this.add.zone(pocketConfig.zoneX, pocketConfig.zoneY, pocketConfig.zoneWidth, pocketConfig.zoneHeight).setOrigin(0.5);
    this.physics.add.existing(zone, true);

    const markerShadow = this.add.ellipse(pocketConfig.zoneX, WORLD.floorY - 4, pocketConfig.markerWidth, pocketConfig.markerHeight, 0x020304, pocketConfig.markerAlpha).setDepth(-5.84);
    const promptText = SHOW_SECTOR02_DEBUG_LABELS
      ? this.add.text(pocketConfig.zoneX, pocketConfig.zoneY + pocketConfig.promptOffsetY, pocketConfig.label, {
        fontFamily: 'monospace', fontSize: '13px', color: '#d3cbc0', align: 'center', stroke: '#111515', strokeThickness: 4
      }).setOrigin(0.5).setDepth(-4.82).setAlpha(0.82).setVisible(false)
      : null;

    const enemies = pocketConfig.enemies.map((enemyConfig) => this.createEncounterEnemy(enemyConfig, pocketConfig));
    return { ...pocketConfig, zone, markerShadow, promptText, enemies, activated: false, resolved: false };
  }

  createEncounterEnemy(enemyConfig, pocketConfig) {
    const configMap = {
      basic01: COMPRESSION_VAULTS_SKITTER_BASIC_01,
      basic02: COMPRESSION_VAULTS_SKITTER_BASIC_02,
      elite: COMPRESSION_VAULTS_TOLL_KEEPER
    };
    const baseConfig = configMap[enemyConfig.type] ?? COMPRESSION_VAULTS_SKITTER_BASIC_01;
    const config = {
      ...baseConfig,
      awakenPlayerX: enemyConfig.awakenPlayerX,
      wakeDelayMs: enemyConfig.wakeDelayMs ?? 0,
      patrolDistance: enemyConfig.patrolDistance ?? baseConfig.patrolDistance,
      health: enemyConfig.health ?? baseConfig.health
    };

    const enemy = new SkitterServitor(this, enemyConfig.x, enemyConfig.y, config);
    enemy.encounterPocketId = pocketConfig.id;
    enemy.awakened = false;
    enemy.awakenAtTime = null;
    enemy.pocketWakeAtTime = null;
    enemy.isElite = enemyConfig.type === 'elite';
    enemy.projectileConfig = enemy.isElite ? { ...COMPRESSION_VAULTS_ELITE_PROJECTILE } : null;
    enemy.projectileState = 'idle';
    enemy.projectileWindupStartedAt = -Infinity;
    enemy.projectileFireAt = -Infinity;
    enemy.projectileRecoverUntil = -Infinity;
    enemy.lastProjectileTime = -Infinity;
    enemy.projectileTelegraph = enemy.isElite
      ? this.add.ellipse(
        enemy.sprite.x,
        enemy.sprite.y + COMPRESSION_VAULTS_ELITE_PROJECTILE.spawnOffsetY,
        COMPRESSION_VAULTS_ELITE_PROJECTILE.telegraphRadiusX,
        COMPRESSION_VAULTS_ELITE_PROJECTILE.telegraphRadiusY,
        0xcad8be,
        0.1
      ).setStrokeStyle(2, 0xaec797, 0.52).setDepth(enemy.sprite.depth + 0.08).setVisible(false)
      : null;

    this.physics.add.collider(enemy.sprite, this.platforms);
    this.physics.add.overlap(this.player.attackHitbox, enemy.sprite, (attackZone, enemySprite) => {
      this.handlePlayerHitEnemy(attackZone, enemySprite, enemy);
    });
    this.physics.add.overlap(this.player.sprite, enemy.sprite, (playerSprite, enemySprite) => {
      this.handleEnemyContactPlayer(playerSprite, enemySprite, enemy);
    });

    this.enemies.push(enemy);
    this.applyGameplayReadabilitySupport(enemy.sprite, enemy.isElite
      ? { fill: 0xd2d8c3, alpha: 0.16, scale: 1.22 }
      : { fill: 0xbec7b5, alpha: 0.12, scale: 1.04 });
    return enemy;
  }

  createClimaxEncounter() {
    if (SHOW_SECTOR02_DEBUG_LABELS) {
      this.processionalLabel = this.add.text(COMPRESSION_VAULTS_PRESSURE_DEACON.spawnX, WORLD.floorY - 252, 'PRESSURE DEACON\nBOUND IN CRUCIBLE', {
        fontFamily: 'monospace', fontSize: '16px', color: '#d5ddd1', align: 'center', stroke: '#0c0f10', strokeThickness: 4
      }).setOrigin(0.5).setDepth(-4.76).setAlpha(0.82);
    }

    this.pressureDeacon = new PressureDeacon(
      this,
      COMPRESSION_VAULTS_PRESSURE_DEACON.spawnX,
      COMPRESSION_VAULTS_PRESSURE_DEACON.spawnY,
      COMPRESSION_VAULTS_PRESSURE_DEACON
    );
    this.pressureDeacon.setActive(false);
    this.pressureDeacon.sprite.setDepth(6.28);
    this.pressureDeacon.sprite.setPosition(COMPRESSION_VAULTS_PRESSURE_DEACON.spawnX, COMPRESSION_VAULTS_PRESSURE_DEACON.spawnY);
    this.pressureDeacon.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.pressureDeacon.sprite, this.platforms);
    this.physics.add.overlap(this.player.attackHitbox, this.pressureDeacon.sprite, (_attackZone, enemySprite) => {
      this.handlePlayerHitPressureDeacon(enemySprite);
    });
    this.physics.add.overlap(this.player.sprite, this.pressureDeacon.sprite, (_playerSprite, enemySprite) => {
      this.handlePressureDeaconContactPlayer(enemySprite);
    });

    this.applyGameplayReadabilitySupport(this.pressureDeacon.sprite, { fill: 0xe0e6d7, alpha: 0.16, scale: 1.26 });
    this.pressureDeacon.projectileTelegraph?.setStrokeStyle(2, 0x9fb180, 0.58);
  }

  createLoreAnchor() {
    const anchorConfig = COMPRESSION_VAULTS_LORE.anchor;

    this.add.rectangle(anchorConfig.altarX, anchorConfig.wallPlateY, anchorConfig.wallPlateWidth, anchorConfig.wallPlateHeight, 0x091011, 0.88).setDepth(-13.94);
    if (this.textures.exists(ASSET_KEYS.sector02Chamber02BackgroundCompressionVault)) {
      this.add.image(anchorConfig.altarX, anchorConfig.wallPlateY, ASSET_KEYS.sector02Chamber02BackgroundCompressionVault)
        .setDisplaySize(anchorConfig.wallPlateWidth + 32, anchorConfig.wallPlateHeight + 22)
        .setTint(0x7f8b87)
        .setAlpha(0.16)
        .setDepth(-13.84);
    }

    this.add.rectangle(anchorConfig.muralX, WORLD.floorY - 96, anchorConfig.muralBackingWidth - 24, 188, 0x1a2324, 0.96).setDepth(-13.88);
    this.add.rectangle(anchorConfig.muralX, anchorConfig.muralY, anchorConfig.muralWidth + 24, anchorConfig.muralHeight + 20, 0x161f1f, 0.94).setDepth(-13.72);
    if (this.textures.exists(ASSET_KEYS.sector02Chamber02LoreImage)) {
      this.add.image(anchorConfig.muralX, anchorConfig.muralY, ASSET_KEYS.sector02Chamber02LoreImage)
        .setDisplaySize(anchorConfig.muralWidth, anchorConfig.muralHeight)
        .setTint(0xd8e0d0)
        .setAlpha(0.97)
        .setDepth(-13.66);
    } else if (SHOW_SECTOR02_DEBUG_LABELS) {
      this.add.text(anchorConfig.muralX, anchorConfig.muralY, 'COMPRESSION VAULTS\nLORE IMAGE FALLBACK', {
        fontFamily: 'monospace', fontSize: '22px', color: '#d5dacd', align: 'center'
      }).setOrigin(0.5).setDepth(-13.64);
    }

    this.add.rectangle(anchorConfig.altarX, anchorConfig.supportTopY, anchorConfig.supportWidth, anchorConfig.supportHeight, 0x111718, 0.96).setDepth(-6.22);
    this.add.rectangle(anchorConfig.altarX, WORLD.floorY - 12, anchorConfig.supportWidth + 92, 18, 0x090b0c, 0.84).setDepth(-6.14);
    this.add.ellipse(anchorConfig.altarX, WORLD.floorY - 18, anchorConfig.shadowWidth, 28, 0x263130, 0.18).setDepth(-6.12);
    this.add.ellipse(anchorConfig.altarX, WORLD.floorY + 10, anchorConfig.shadowWidth + 176, 38, 0x020404, 0.34).setDepth(-6.04);

    if (this.textures.exists(ASSET_KEYS.sector03Chamber02LoreAltar)) {
      this.add.image(anchorConfig.altarX, anchorConfig.altarY, ASSET_KEYS.sector03Chamber02LoreAltar)
        .setDisplaySize(anchorConfig.altarDisplayWidth, anchorConfig.altarDisplayHeight)
        .setTint(0xc5d0c1)
        .setAlpha(0.88)
        .setDepth(-6.08);
    } else {
      this.add.ellipse(anchorConfig.altarX, anchorConfig.altarY + 6, 128, 132, 0x66706b, 0.76).setDepth(-6.08);
    }

    const zone = this.add.zone(anchorConfig.zoneX, anchorConfig.zoneY, anchorConfig.zoneWidth, anchorConfig.zoneHeight).setOrigin(0.5);
    this.physics.add.existing(zone, true);

    this.loreAnchor = { ...anchorConfig, zone, prompt: null };
    if (this.hasCompletedBossPitLoop) {
      this.renderSpentTrapAltarState();
    }
  }

  renderSpentTrapAltarState() {
    const anchorConfig = COMPRESSION_VAULTS_LORE.anchor;
    this.add.rectangle(anchorConfig.altarX, anchorConfig.altarY, anchorConfig.altarDisplayWidth + 24, anchorConfig.altarDisplayHeight + 16, 0x000000, 0.46)
      .setDepth(-6.01);
    this.add.ellipse(anchorConfig.altarX, anchorConfig.altarY + 8, anchorConfig.altarDisplayWidth * 0.74, anchorConfig.altarDisplayHeight * 0.4, 0x000000, 0.38)
      .setDepth(-6);
  }

  createForwardThreshold() {
    this.forwardBarrier = this.add.rectangle(
      COMPRESSION_VAULTS_FORWARD_GATE.barrierX,
      COMPRESSION_VAULTS_FORWARD_GATE.barrierY,
      COMPRESSION_VAULTS_FORWARD_GATE.barrierWidth,
      COMPRESSION_VAULTS_FORWARD_GATE.barrierHeight,
      0x0b0f10,
      0.4
    ).setDepth(-4.86);
    this.physics.add.existing(this.forwardBarrier, true);
    this.physics.add.collider(this.player.sprite, this.forwardBarrier);

    this.forwardThresholdZone = this.add.zone(
      COMPRESSION_VAULTS_FORWARD_GATE.thresholdX,
      COMPRESSION_VAULTS_FORWARD_GATE.thresholdY,
      COMPRESSION_VAULTS_FORWARD_GATE.thresholdWidth,
      COMPRESSION_VAULTS_FORWARD_GATE.thresholdHeight
    ).setOrigin(0.5);
    this.physics.add.existing(this.forwardThresholdZone, true);

    this.forwardPrompt = SHOW_SECTOR02_DEBUG_LABELS
      ? this.add.text(
        COMPRESSION_VAULTS_FORWARD_GATE.thresholdX,
        COMPRESSION_VAULTS_FORWARD_GATE.thresholdY + COMPRESSION_VAULTS_FORWARD_GATE.promptOffsetY,
        'CRUCIBLE GATE SEALED',
        { fontFamily: 'monospace', fontSize: '14px', color: '#d7ddd2', align: 'center', stroke: '#0c0f10', strokeThickness: 4 }
      ).setOrigin(0.5).setDepth(-4.58).setAlpha(0.92).setVisible(false)
      : null;
  }

  createUiAndInput() {
    this.hud = new HudOverlay(this);
    this.mobileControls = new MobileControls(this);
    this.setupMobileUiCamera();

    this.restartText = this.add.text(this.scale.width / 2, 90, '', {
      fontFamily: 'monospace', fontSize: '22px', color: '#d2c2ac', align: 'center'
    }).setScrollFactor(0).setDepth(35).setOrigin(0.5).setVisible(false);
    this.riteFinisherPrompt = this.add
      .text(this.scale.width / 2, this.scale.height * 0.22, MAJOR_FINISHER.ritePromptText, {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#e7dbc1',
        align: 'center',
        stroke: '#100b0a',
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(35)
      .setVisible(false);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyAttack = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.keyInteract = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keyRestart = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.applyResponsiveLayout, this);
      this.audioDirector?.shutdown();
      this.enemyProjectiles.forEach((projectile) => projectile.destroy());
      this.enemies.forEach((enemy) => enemy.projectileTelegraph?.destroy?.());
      this.pressureDeacon?.destroyCombatTelegraphs?.();
      this.majorEncounterResolution?.teardown();
    });
  }

  configureCameraAndLayout() {
    this.cameras.main.startFollow(this.player.sprite, true, COMPRESSION_VAULTS_BOOTSTRAP.cameraLerp.x, COMPRESSION_VAULTS_BOOTSTRAP.cameraLerp.y, COMPRESSION_VAULTS_BOOTSTRAP.desktopFollowOffsetX, 0);
    this.scale.on('resize', this.applyResponsiveLayout, this);
    this.applyResponsiveLayout();
    this.mobileControls.setMode('gameplay');
    this.hud.update(this.player.health, this.player.maxHealth);
  }

  update(time) {
    const mobileInput = this.mobileControls.getInputState();

    if (this.player.isDead) {
      this.riteFinisherPrompt?.setVisible(false);
      this.mobileControls.setMode('dead');
      this.restartText.setVisible(true).setText('VESSEL FAILURE\nPress [R] to re-seed chamber');
      this.enemies.forEach((enemy) => enemy.body?.setVelocity(0, 0));
      this.pressureDeacon?.body?.setVelocity?.(0, 0);
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
      this.pressureDeacon?.body?.setVelocity?.(0, 0);
      this.setEnemyProjectilesPaused(true);
      return;
    }
    if (this.isBossPitReturnSequenceActive || this.isEntryStagingActive) {
      this.riteFinisherPrompt?.setVisible(false);
      this.mobileControls.setMode('dialogue');
      this.player.body.setVelocity(0, 0);
      this.enemies.forEach((enemy) => enemy.body?.setVelocity(0, 0));
      this.pressureDeacon?.body?.setVelocity?.(0, 0);
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
    this.updatePressureDeaconState(time);
    this.refreshEncounterPocketPresence();
    this.updateEncounterPockets(time);
    this.enemies.forEach((enemy) => enemy.update(time, this.player.sprite.x));
    this.pressureDeacon?.update(time, this.player.sprite);
    this.updateEliteProjectileState(time);
    this.enemyProjectiles.forEach((projectile) => projectile.update(time, this.game.loop.delta));
    this.refreshPressureDeaconBossBar(time);
    this.refreshRiteFinisherTarget();
    if (this.tryTriggerContextualRiteFinisher(mobileInput)) {
      this.updateLabels(time);
      this.hud.update(this.player.health, this.player.maxHealth);
      return;
    }
    this.refreshLoreZonePresence();
    this.tryBeginLoreSequence(mobileInput);
    this.refreshForwardThresholdPresence();
    this.tryAdvanceForwardThreshold(mobileInput);
    this.updateLabels(time);
    this.hud.update(this.player.health, this.player.maxHealth);
  }

  refreshRiteFinisherTarget() {
    const playerSprite = this.player?.sprite;
    if (!playerSprite?.active) {
      this.currentRiteFinisherTarget = null;
      this.riteFinisherPrompt?.setVisible(false);
      return;
    }

    const eligibleElites = this.enemies.filter((enemy) => enemy.isElite && enemy.canReceiveRiteFinisher?.(playerSprite, this.time.now));
    const eligibleTargets = [
      ...eligibleElites,
      this.pressureDeacon?.canReceiveRiteFinisher?.(playerSprite, this.time.now) ? this.pressureDeacon : null
    ].filter(Boolean);

    this.currentRiteFinisherTarget = eligibleTargets.sort((a, b) => (
      Phaser.Math.Distance.Between(playerSprite.x, playerSprite.y, a.sprite.x, a.sprite.y)
      - Phaser.Math.Distance.Between(playerSprite.x, playerSprite.y, b.sprite.x, b.sprite.y)
    ))[0] ?? null;

    if (!this.currentRiteFinisherTarget) {
      this.riteFinisherPrompt?.setVisible(false);
      return;
    }

    this.riteFinisherPrompt
      ?.setVisible(true)
      .setPosition(this.scale.width / 2, Math.max(76, this.scale.height * 0.2));
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

    if (target === this.pressureDeacon) {
      this.executePressureDeaconFinisher(target);
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
    this.triggerSector02BlackOilPayoff(target, { scale: 0.56, burstCount: 10, sprayCount: 16, mistCount: 8, emberCount: 4, durationMs: 620 });
    target.setHitReactionDirection(Math.sign(target.sprite.x - this.player.sprite.x) || this.player.facing);
    target.takeDamage(Math.max(1, target.health), this.time.now);
    this.audioDirector?.playBanishmentSting();
  }

  executePressureDeaconFinisher(target) {
    if (!target || target.dead) {
      return;
    }

    this.cameras.main.shake(MAJOR_FINISHER.miniboss.shakeDurationMs, MAJOR_FINISHER.miniboss.shakeIntensity, true);
    target.setActive(true);
    target.takeDamage(Math.max(1, target.health), this.time.now);
    this.audioDirector?.playBanishmentSting();
    if (!this.hasUnlockedForwardPath) {
      this.resolvePressureDeaconVictory(target);
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
        pocket.promptText?.setText(`${pocket.label}\nPRESSURE RISING`).setVisible(true);
        pocket.markerShadow.setAlpha(pocket.markerAlpha + 0.06);
        pocket.enemies.forEach((enemy, index) => {
          if (enemy.dead) {
            return;
          }
          enemy.pocketWakeAtTime = time + (enemy.config.wakeDelayMs ?? 0) + index * 34;
        });
      }

      pocket.enemies.forEach((enemy) => {
        if (!enemy.dead && !enemy.awakened && enemy.pocketWakeAtTime !== null && time >= enemy.pocketWakeAtTime) {
          enemy.awakened = true;
          enemy.awakenAtTime = null;
          enemy.pocketWakeAtTime = null;
        }
      });

      const remainingEnemies = pocket.enemies.filter((enemy) => !enemy.dead);
      if (pocket.activated && remainingEnemies.length === 0) {
        pocket.resolved = true;
        pocket.promptText?.setText(`${pocket.label}\nSEAL RELIEVED`).setVisible(playerInsidePocket);
        pocket.markerShadow.setAlpha(0.04);
      }
    });

  }

  updateEliteProjectileState(time) {
    this.enemies.forEach((enemy) => {
      if (!enemy.isElite || enemy.dead || !enemy.awakened || this.enemyProjectilesPaused) {
        this.clearEliteProjectileState(enemy);
        return;
      }

      this.updateEliteProjectileTelegraph(enemy, time);

      if (enemy.projectileState === 'windup') {
        enemy.body.setVelocityX(0);
        if (time >= enemy.projectileFireAt) {
          this.fireEliteProjectile(enemy, time);
          enemy.projectileState = 'recover';
          enemy.projectileRecoverUntil = time + enemy.projectileConfig.recoveryMs;
          enemy.lastProjectileTime = time;
        }
        return;
      }

      if (enemy.projectileState === 'recover') {
        enemy.body.setVelocityX(0);
        if (time >= enemy.projectileRecoverUntil) {
          this.clearEliteProjectileState(enemy);
        }
        return;
      }

      if (!this.canEliteFireProjectile(enemy, time)) {
        return;
      }

      enemy.projectileState = 'windup';
      enemy.projectileWindupStartedAt = time;
      enemy.projectileFireAt = time + enemy.projectileConfig.windupMs;
      enemy.body.setVelocityX(0);
    });
  }

  canEliteFireProjectile(enemy, time) {
    if (
      enemy.projectileState !== 'idle' ||
      enemy.combatState !== 'stalk' ||
      time < enemy.lastProjectileTime + enemy.projectileConfig.cooldownMs ||
      !enemy.body?.blocked?.down ||
      !this.player?.sprite?.body?.enable
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
    const target = new Phaser.Math.Vector2(
      this.player.body?.center?.x ?? this.player.sprite.x,
      (this.player.body?.center?.y ?? this.player.sprite.y) - ((this.player.body?.height ?? 0) * 0.18)
    );
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
      tint: 0xd2e1c4,
      depth: enemy.sprite.depth + 0.04
    });

    this.audioDirector?.playEnemyAttack(enemy.config.audioProfile ?? 'tollkeeper');
    enemy.lastAttackTime = time;
  }

  clearEliteProjectileState(enemy) {
    enemy.projectileState = 'idle';
    enemy.projectileWindupStartedAt = -Infinity;
    enemy.projectileFireAt = -Infinity;
    enemy.projectileRecoverUntil = -Infinity;
    enemy.projectileTelegraph?.setVisible(false);
  }

  updateEliteProjectileTelegraph(enemy, time) {
    if (!enemy.projectileTelegraph) {
      return;
    }

    if (enemy.projectileState !== 'windup' || enemy.dead) {
      enemy.projectileTelegraph.setVisible(false);
      return;
    }

    const progress = Phaser.Math.Clamp((time - enemy.projectileWindupStartedAt) / enemy.projectileConfig.windupMs, 0, 1);
    const pulse = 1 + Math.sin(time / 40) * 0.08;
    enemy.projectileTelegraph
      .setVisible(true)
      .setPosition(enemy.sprite.x + enemy.direction * 32, enemy.sprite.y + enemy.projectileConfig.spawnOffsetY)
      .setScale(0.92 + progress * 0.22, pulse)
      .setAlpha(0.12 + progress * 0.16)
      .setAngle((time / 18) % 360);
  }

  refreshLoreZonePresence() {
    this.currentLoreZone = null;

    if (!this.loreAnchor || this.isLoreTransitionActive || this.hasCompletedBossPitLoop) {
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

  updatePressureDeaconState(time) {
    if (!this.pressureDeacon || this.pressureDeacon.dead) {
      return;
    }

    if (!this.pressureDeacon.active && this.player.sprite.x >= COMPRESSION_VAULTS_PRESSURE_DEACON.activationX) {
      this.pressureDeacon.setActive(true);
      this.processionalLabel?.setText('PRESSURE DEACON\nPRESSURE ASCENDING').setAlpha(0.96);
    }
  }

  refreshPressureDeaconBossBar(time) {
    if (!this.pressureDeacon) {
      return;
    }

    const visible = !this.pressureDeacon.dead && (
      this.pressureDeacon.active
      || this.player.sprite.x >= COMPRESSION_VAULTS_PRESSURE_DEACON.activationX - 120
    );

    this.hud.setBossBarState({
      visible,
      name: COMPRESSION_VAULTS_PRESSURE_DEACON.name,
      subtitle: this.pressureDeacon.isStaggered?.(time) ? MAJOR_FINISHER.miniboss.subtitle : COMPRESSION_VAULTS_PRESSURE_DEACON.subtitle,
      current: this.pressureDeacon.health,
      max: this.pressureDeacon.maxHealth,
      telegraph: this.pressureDeacon.getTelegraphProgress(time),
      wounded: time < this.pressureDeacon.hurtUntil
    });

    if (this.pressureDeacon.dead) {
      this.hud.setBossBarState({ visible: false });
    }
  }

  handlePlayerHitPressureDeacon(enemySprite) {
    if (!this.player.attackActive || this.pressureDeacon?.dead || !this.isEnemyOverlapTarget(enemySprite, this.pressureDeacon)) {
      return;
    }

    if (this.pressureDeacon.lastAttackHitId === this.player.attackId) {
      return;
    }

    this.pressureDeacon.lastAttackHitId = this.player.attackId;
    this.pressureDeacon.applyPoiseDamage(MAJOR_FINISHER.miniboss.poiseDamagePerHit, this.time.now);
    this.pressureDeacon.takeDamage(1, this.time.now);
    this.pressureDeacon.setActive(true);
    this.audioDirector?.playPlayerHit();

    if (this.pressureDeacon.dead && !this.hasUnlockedForwardPath) {
      this.resolvePressureDeaconVictory(this.pressureDeacon);
    }
  }

  resolvePressureDeaconVictory(target) {
    this.majorEncounterResolution?.begin({
      encounterId: 'sector02-chamber02-pressure-deacon',
      freezePlayer: true,
      disablePlayerAttack: true,
      pauseProjectiles: (paused) => this.setEnemyProjectilesPaused(paused),
      setResolutionLock: (locked) => {
        this.resolutionLockActive = locked;
      },
      onStart: () => {
        grantMajorEncounterIntegrityReward(this.player, this.integrityRewardTracker, 'sector02-chamber02-pressure-deacon-miniboss');
        target.sprite.y = WORLD.floorY + 2 - target.sprite.displayHeight * (1 - target.sprite.originY);
        this.triggerSector02BlackOilPayoff(target, COMPRESSION_VAULTS_PRESSURE_DEACON.blowout);
        spawnEnemyCorpseRemains(this, {
          x: target.sprite.x,
          groundY: WORLD.floorY + 2,
          depth: target.sprite.depth,
          size: 'large'
        });
        target.sprite.setVisible(false).setAlpha(0);
        target.body?.setEnable(false);
        target.setActive(false);
        this.cameras.main.shake(560, 0.0078, true);
      },
      stages: [{ atMs: 420, run: () => this.unlockForwardPath() }]
    });
  }

  handlePressureDeaconContactPlayer(enemySprite) {
    if (this.pressureDeacon?.dead || !this.isEnemyOverlapTarget(enemySprite, this.pressureDeacon)) {
      return;
    }
    if (!this.pressureDeacon.canDealContactDamage(this.time.now)) {
      return;
    }

    const tookDamage = this.player.receiveDamage(COMPRESSION_VAULTS_PRESSURE_DEACON.contactDamage, this.time.now);
    if (tookDamage) {
      this.pressureDeacon.recordContactDamage(this.time.now);
      const knockDirection = Math.sign(this.player.sprite.x - this.pressureDeacon.sprite.x) || 1;
      this.player.body.setVelocityX(knockDirection * 240);
      this.player.body.setVelocityY(-228);
    }
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
      durationMs: config.durationMs,
      burstCount: config.burstCount,
      burstRadiusX: config.burstRadiusX,
      burstRadiusY: config.burstRadiusY,
      puddleWidth: config.puddleWidth,
      puddleHeight: config.puddleHeight,
      sprayCount: config.sprayCount,
      mistCount: config.mistCount,
      emberCount: config.emberCount
    });
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
    if (this.isLoreTransitionActive || this.hasCompletedBossPitLoop) {
      return;
    }

    this.isLoreTransitionActive = true;
    this.hasTriggeredTrapAltar = true;
    this.currentLoreZone = null;
    this.loreAnchor?.prompt?.setVisible(false);
    this.mobileControls.setMode('dialogue');
    this.player.body.setVelocity(0, 0);
    this.enemies.forEach((enemy) => enemy.body?.setVelocity(0, 0));
    this.pressureDeacon?.body?.setVelocity?.(0, 0);
    this.setEnemyProjectilesPaused(true);
    this.audioDirector?.stopAmbientLoop();
    this.hud?.setVisible(false);
    this.mobileControls.setMode('init');
    this.uiCamera?.setVisible(false);

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.cleanupSceneUi?.();
      this.audioDirector?.shutdown();
      this.scene.start('Sector02Chamber02BossPitScene', {
        fromScene: this.scene.key,
        altarX: COMPRESSION_VAULTS_LORE.anchor.altarX,
        altarY: COMPRESSION_VAULTS_BOOTSTRAP.spawnY
      });
    });

    this.tweens.add({
      targets: this.player.sprite,
      y: this.player.sprite.y + 38,
      duration: 260,
      ease: 'Sine.easeIn'
    });
    this.cameras.main.shake(240, 0.0038, true);
    this.cameras.main.fadeOut(420, 0, 0, 0);
  }

  beginChamberEntryStaging({ fadeInDurationMs = CHAMBER_ENTRY_STAGING.defaultFadeInDurationMs } = {}) {
    this.isEntryStagingActive = true;
    this.isBossPitReturnSequenceActive = Boolean(this.transitionContext?.returnFromBossPit);
    this.hud?.setVisible(true);
    this.uiCamera?.setVisible(true);
    this.mobileControls.setMode('dialogue');
    this.bossPitReturnStagingMask?.destroy();
    this.bossPitReturnStagingMask = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      CHAMBER_ENTRY_STAGING.maskColor,
      CHAMBER_ENTRY_STAGING.maskAlpha
    ).setScrollFactor(0).setDepth(120);
    this.player.body.setEnable(false);
    this.player.attackHitbox?.body?.setEnable(false);

    const settleEntity = (entity, groundedY) => {
      if (!entity?.sprite || !entity?.body) {
        return;
      }

      entity.body.setEnable(false);
      entity.sprite.setPosition(entity.sprite.x, groundedY);
      entity.body.reset(entity.sprite.x, groundedY);
      entity.body.setVelocity(0, 0);
      entity.body.setEnable(true);
    };

    const settleAllEntities = () => {
      settleEntity(this.player, WORLD.floorY - 2);
      this.enemies.forEach((enemy) => settleEntity(enemy, WORLD.floorY - 2));
      settleEntity(this.pressureDeacon, COMPRESSION_VAULTS_PRESSURE_DEACON.spawnY);

      this.player.body.setVelocity(0, 0);
      this.player.body.setEnable(true);
    };

    this.time.delayedCall(CHAMBER_ENTRY_STAGING.settleDelayMs, () => {
      settleAllEntities();
      this.time.delayedCall(CHAMBER_ENTRY_STAGING.postSettleHoldMs, () => {
        this.restoreViewportLayoutAfterBossPitReturn();
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
          this.restoreViewportLayoutAfterBossPitReturn();
          this.cameras.main.setAlpha(1);
          this.bossPitReturnStagingMask?.destroy();
          this.bossPitReturnStagingMask = null;
          this.isBossPitReturnSequenceActive = false;
          this.isEntryStagingActive = false;
          this.mobileControls.setMode('gameplay');
        });
        this.cameras.main.fadeIn(fadeInDurationMs, 0, 0, 0);
      });
    });
  }

  restoreViewportLayoutAfterBossPitReturn() {
    this.applyResponsiveLayout();
    this.cameras.main.setVisible(true);
    this.uiCamera?.setVisible(true);
    this.hud?.setVisible(true);
    this.hud?.layout();
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

  handleEnemyProjectileHit(projectileSprite) {
    const projectile = this.enemyProjectiles.find((entry) => entry.sprite === projectileSprite || projectileSprite?.gameObject === entry.sprite);
    if (!projectile?.active || projectile.inImpact || !this.player?.sprite?.body?.enable) {
      return;
    }

    const impactX = Phaser.Math.Clamp(this.player.body.center.x, this.player.body.left + 8, this.player.body.right - 8);
    const impactY = this.player.body.center.y - this.player.body.height * 0.1;
    const damage = projectile.damage ?? COMPRESSION_VAULTS_ELITE_PROJECTILE.damage;
    const tookDamage = this.player.receiveDamage(damage, this.time.now);
    projectile.playImpact(impactX, impactY);
    if (!tookDamage) {
      return;
    }

    const knockDirection = Math.sign(this.player.sprite.x - projectile.sprite.x) || 1;
    this.player.body.setVelocityX(knockDirection * 210);
    this.player.body.setVelocityY(-196);
  }

  handlePlayerHitEnemy(_attackZone, enemySprite, enemy) {
    if (!this.player.attackActive || enemy.dead || !this.isEnemyOverlapTarget(enemySprite, enemy)) {
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

  handleEnemyContactPlayer(_playerSprite, enemySprite, enemy) {
    if (enemy.dead || !this.isEnemyOverlapTarget(enemySprite, enemy)) {
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

  isEnemyOverlapTarget(target, enemy) {
    return target === enemy.sprite || target?.gameObject === enemy.sprite;
  }

  unlockForwardPath() {
    this.hasUnlockedForwardPath = true;
    this.enemyProjectilesPaused = false;
    this.enemyProjectiles.forEach((projectile) => projectile.destroyProjectile());
    this.forwardBarrier?.setAlpha(0.08);
    this.forwardBarrier?.setFillStyle(0x8ca284, 0.08);
    if (this.forwardBarrier?.body) {
      this.forwardBarrier.body.enable = false;
      this.forwardBarrier.body.updateFromGameObject?.();
    }
    this.forwardPrompt?.setVisible(false);
    this.processionalLabel?.setText('PRESSURE DEACON NULLIFIED\nCHAMBER 3 DESCENT MARKED');
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
        ? 'DESCENT MARKED\nCHAMBER 3 GATE CONSECRATED'
        : 'CRUCIBLE GATE UNSEALED\nPRESS RITE / [E] TO MARK DESCENT'
      : 'CRUCIBLE GATE SEALED';
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
    this.processionalLabel?.setText('CRUCIBLE GATE OPEN\nKILN OF JUDGEMENT AWAITS');
    this.forwardBarrier?.setAlpha(0.04);

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.cleanupSceneUi?.();
      this.audioDirector?.shutdown();
      this.scene.start('Sector02Chamber03Scene', {
        fromScene: this.scene.key,
        fromGate: 'compression-vaults-threshold'
      });
    });

    this.cameras.main.fadeOut(320, 0, 0, 0);
  }

  updateLabels(time) {
    const completionBoost = this.hasUnlockedForwardPath ? 0.12 : 0;
    const loreBoost = this.hasCompletedLoreBeat ? 0.08 : 0;
    this.footholdLabel?.setAlpha(0.68 + (Math.sin(time / 520) + 1) * 0.04 + completionBoost + loreBoost * 0.5);
    this.processionalLabel?.setAlpha(0.72 + (Math.sin(time / 640) + 1) * 0.035 + completionBoost * 0.65 + loreBoost * 0.45);
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
    this.scene.start('Sector02Chamber02Scene', { devWarp: true, source: this.scene.key });
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

    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'Sector02Chamber02MobileUiCamera');
    const mobileUiElements = this.mobileControls.getUiElements();
    const mobileUiSet = new Set(mobileUiElements);
    const nonMobileObjects = this.children.list.filter((element) => !mobileUiSet.has(element));

    this.cameras.main.ignore(mobileUiElements);
    this.uiCamera.ignore(nonMobileObjects);
  }

  applyResponsiveLayout() {
    const camera = this.cameras.main;
    const width = this.scale.width;
    const height = this.scale.height;
    const isPortraitMobile = this.mobileControls.enabled && height >= width;

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
      camera.setFollowOffset(COMPRESSION_VAULTS_BOOTSTRAP.portraitFollowOffsetX, PORTRAIT_LAYOUT.portraitFollowOffsetY);
      this.mobileControls.setReservedBottomPx(height - worldBandHeight);
      this.restartText?.setPosition(
        width / 2,
        Math.max(PORTRAIT_LAYOUT.restartTextMinY, worldBandHeight * PORTRAIT_LAYOUT.restartTextRatioY)
      );
      this.hud?.layout();
      return;
    }

    camera.setViewport(0, 0, width, height);
    camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
    camera.setFollowOffset(COMPRESSION_VAULTS_BOOTSTRAP.desktopFollowOffsetX, PORTRAIT_LAYOUT.desktopFollowOffsetY);
    this.mobileControls.setReservedBottomPx(0);
    this.restartText?.setPosition(width / 2, 90);
    this.hud?.layout();
  }

  applyGameplayReadabilitySupport(target, { fill = 0xd7d1c2, alpha = 0.14, scale = 1.06 } = {}) {
    if (!target) {
      return;
    }

    const halo = this.add.ellipse(target.x, target.y + 6, target.displayWidth * scale, target.displayHeight * scale, fill, alpha).setDepth(target.depth - 0.1);
    halo.setBlendMode(Phaser.BlendModes.SCREEN);

    this.events.on(Phaser.Scenes.Events.UPDATE, () => {
      if (!halo.active || !target.active) {
        return;
      }
      halo.setPosition(target.x, target.y + 6);
      halo.setScale(target.scaleX, target.scaleY);
      halo.setVisible(target.visible);
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => halo.destroy());
  }
}
