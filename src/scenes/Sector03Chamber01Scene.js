import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { SkitterServitor } from '../entities/SkitterServitor.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import { AudioDirector } from '../audio/AudioDirector.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { PLAYER, SKITTER, WORLD } from '../data/milestone1Config.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';
import { createDirectionalCameraBias } from '../systems/DirectionalCameraBias.js';
import { restartRunFromDeath } from '../systems/RunReset.js';
import { applyChamberEntryRestore } from '../systems/VesselRunEconomy.js';
import { bossPitRunState } from '../systems/BossPitRunState.js';

const CRADLE_BOOTSTRAP = {
  sceneKey: 'Sector03Chamber01Scene',
  worldWidth: 6020,
  floorColliderHeight: 72,
  spawnX: 220,
  spawnY: PLAYER.startY,
  cameraLerp: { x: 0.08, y: 0.08 },
  portraitFollowOffsetX: -112,
  desktopFollowOffsetX: -156,
  backdropDepth: -16,
  lowerBandY: WORLD.floorY - 86,
  lowerBandHeight: 302,
  lowerBandAlpha: 0.22,
  refusalsBandY: WORLD.floorY - 148,
  refusalsBandHeight: 182,
  refusalsBandAlpha: 0.14
};

const CRADLE_SEGMENTS = [
  { key: ASSET_KEYS.sector03Chamber01BackgroundOpeningRecess, x: 420, y: 216, width: 940, height: 480, tint: 0xd4c8b8, alpha: 0.78, depth: -14.78 },
  { key: ASSET_KEYS.sector03Chamber01BackgroundEntryGallery, x: 1260, y: 216, width: 940, height: 470, tint: 0xcbbeae, alpha: 0.74, depth: -14.74 },
  { key: ASSET_KEYS.sector03Chamber01BackgroundWallModule01, x: 2050, y: 214, width: 860, height: 454, tint: 0xb2a99b, alpha: 0.6, depth: -14.64 },
  { key: ASSET_KEYS.sector03Chamber01BackgroundFeatureWall01, x: 2880, y: 212, width: 920, height: 474, tint: 0xd7c8b6, alpha: 0.74, depth: -14.76 },
  { key: ASSET_KEYS.sector03Chamber01BackgroundWallModule02, x: 3690, y: 214, width: 860, height: 454, tint: 0x9e9588, alpha: 0.56, depth: -14.6 },
  { key: ASSET_KEYS.sector03Chamber01BackgroundFeatureWall02, x: 4520, y: 212, width: 940, height: 474, tint: 0xcebfae, alpha: 0.72, depth: -14.74 },
  { key: ASSET_KEYS.sector03Chamber01BackgroundThreshold, x: 5400, y: 212, width: 940, height: 474, tint: 0xddceb8, alpha: 0.78, depth: -14.8 }
];

const CRADLE_RIBS = [
  { x: 980, ribWidth: 28, ribHeight: 308, archWidth: 246, archHeight: 148, alpha: 0.16, depth: -11.74 },
  { x: 2440, ribWidth: 32, ribHeight: 344, archWidth: 280, archHeight: 168, alpha: 0.18, depth: -11.82 },
  { x: 3940, ribWidth: 34, ribHeight: 362, archWidth: 298, archHeight: 176, alpha: 0.2, depth: -11.88 },
  { x: 5360, ribWidth: 36, ribHeight: 386, archWidth: 328, archHeight: 188, alpha: 0.22, depth: -11.96 }
];

const FAILED_SAINT = {
  ...SKITTER,
  textureKey: ASSET_KEYS.sector03Chamber01EnemyBasicFailedSaint,
  speed: 56,
  aggroRange: 254,
  patrolDistance: 128,
  presentation: {
    alpha: 0.98,
    display: { width: 184, height: 152 },
    origin: { x: 0.52, y: 0.95 },
    stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.44 }
  },
  eyeGlowColor: 0xe4d6b4,
  eyeGlowWidth: 30,
  eyeGlowHeight: 14,
  eyeGlowOffsetX: 14,
  eyeGlowYOffset: 10,
  eyeGlowAlphaBase: 0.28,
  eyeGlowWindupAlphaGain: 0.24,
  body: { width: 54, height: 30, offsetX: 10, offsetY: 18 },
  corpseRemainsProfile: 'sector3Basic'
};

const BIRD_JUDGE = {
  ...FAILED_SAINT,
  textureKey: ASSET_KEYS.sector03Chamber01EnemyBasicBirdJudge,
  speed: 58,
  patrolDistance: 136,
  presentation: {
    ...FAILED_SAINT.presentation,
    display: { width: 188, height: 154 }
  },
  eyeGlowColor: 0xe7dfc6,
  corpseRemainsProfile: 'sector3Basic'
};

const WITHHELD_VESSEL = {
  ...SKITTER,
  textureKey: ASSET_KEYS.sector03Chamber01EnemyEliteWithheldVessel,
  variantName: 'WITHHELD VESSEL',
  health: 7,
  speed: 46,
  aggroRange: 292,
  attackCooldownMs: 3000,
  windupMs: 860,
  attackActiveMs: 320,
  attackRecoveryMs: 660,
  hesitationMs: 600,
  attackTriggerRange: 166,
  attackRange: 198,
  preferredRange: 140,
  rangeBand: 20,
  lungeSpeedBonus: 102,
  lungeJumpVelocity: -90,
  recoilVelocityX: 148,
  recoilVelocityY: -86,
  patrolDistance: 94,
  body: { width: 74, height: 44, offsetX: 28, offsetY: 90 },
  presentation: {
    alpha: 0.98,
    display: { width: 292, height: 226 },
    origin: { x: 0.52, y: 0.975 },
    stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.46 }
  },
  eyeGlowColor: 0xf0e0be,
  eyeGlowWidth: 40,
  eyeGlowHeight: 18,
  eyeGlowOffsetX: 20,
  eyeGlowYOffset: 18,
  eyeGlowAlphaBase: 0.4,
  eyeGlowWindupAlphaGain: 0.42,
  audioProfile: 'tollkeeper',
  corpseRemainsProfile: 'sector3Elite'
};

const CRADLE_POCKETS = [
  {
    id: 'corridor-entry-denial',
    label: 'ENTRY DENIAL',
    zoneX: 1480,
    zoneY: WORLD.floorY - 72,
    zoneWidth: 660,
    zoneHeight: 226,
    markerWidth: 376,
    markerHeight: 76,
    markerAlpha: 0.08,
    enemies: [
      { type: 'failed-saint', x: 1260, y: PLAYER.startY, patrolDistance: 96 },
      { type: 'bird-judge', x: 1480, y: PLAYER.startY, patrolDistance: 128, wakeDelayMs: 70 },
      { type: 'failed-saint', x: 1680, y: PLAYER.startY, patrolDistance: 92, wakeDelayMs: 120 }
    ]
  },
  {
    id: 'corridor-wall-measures',
    label: 'WALL-MEASURE RUN',
    zoneX: 2320,
    zoneY: WORLD.floorY - 74,
    zoneWidth: 760,
    zoneHeight: 236,
    markerWidth: 428,
    markerHeight: 82,
    markerAlpha: 0.1,
    enemies: [
      { type: 'bird-judge', x: 2060, y: PLAYER.startY, patrolDistance: 126 },
      { type: 'failed-saint', x: 2290, y: PLAYER.startY, patrolDistance: 102, wakeDelayMs: 52 },
      { type: 'bird-judge', x: 2470, y: PLAYER.startY, patrolDistance: 132, wakeDelayMs: 108 },
      { type: 'failed-saint', x: 2600, y: PLAYER.startY, patrolDistance: 94, wakeDelayMs: 154 }
    ]
  },
  {
    id: 'opened-room-withheld-domain',
    label: 'WITHHELD DOMAIN',
    zoneX: 3140,
    zoneY: WORLD.floorY - 76,
    zoneWidth: 1040,
    zoneHeight: 242,
    markerWidth: 556,
    markerHeight: 84,
    markerAlpha: 0.12,
    enemies: [
      { type: 'failed-saint', x: 2790, y: PLAYER.startY, patrolDistance: 100 },
      { type: 'bird-judge', x: 2990, y: PLAYER.startY, patrolDistance: 128, wakeDelayMs: 64 },
      { type: 'withheld-vessel', x: 3240, y: PLAYER.startY, patrolDistance: 90, wakeDelayMs: 124 },
      { type: 'bird-judge', x: 3440, y: PLAYER.startY, patrolDistance: 122, wakeDelayMs: 166 }
    ]
  }
];

const CRADLE_LORE = {
  cutsceneId: 'sector03-chamber01-gallery-refusal-shrine',
  anchor: {
    id: 'gallery-refusal-shrine',
    zoneX: 650,
    zoneY: WORLD.floorY - 78,
    zoneWidth: 214,
    zoneHeight: 210,
    altarX: 650,
    altarY: WORLD.floorY - 104,
    altarDisplayWidth: 194,
    altarDisplayHeight: 194,
    supportWidth: 270,
    supportHeight: 132,
    supportTopY: WORLD.floorY - 80,
    shadowWidth: 334,
    wallPlateWidth: 622,
    wallPlateHeight: 358,
    wallPlateY: WORLD.floorY - 156,
    muralX: 650,
    muralY: 214,
    muralWidth: 472,
    muralHeight: 292,
    muralBackingWidth: 564,
    muralBackingHeight: 342
  }
};

const CRADLE_TRAP_ALTAR = {
  id: 'gallery-withheld-descent-altar',
  zoneX: 3240,
  zoneY: WORLD.floorY - 78,
  zoneWidth: 218,
  zoneHeight: 214,
  altarX: 3240,
  altarY: WORLD.floorY - 106,
  altarDisplayWidth: 208,
  altarDisplayHeight: 208,
  supportWidth: 294,
  supportHeight: 136,
  supportTopY: WORLD.floorY - 82,
  shadowWidth: 360
};

const CRADLE_FORWARD_GATE = {
  barrierX: 5550,
  barrierY: WORLD.floorY - 70,
  barrierWidth: 98,
  barrierHeight: 238,
  thresholdX: 5636,
  thresholdY: WORLD.floorY - 76,
  thresholdWidth: 188,
  thresholdHeight: 224
};

export class Sector03Chamber01Scene extends Phaser.Scene {
  constructor() {
    super(CRADLE_BOOTSTRAP.sceneKey);
  }

  init(data) {
    this.transitionContext = data ?? {};
    this.isRestartingRun = false;
    this.isLoreTransitionActive = false;
    this.hasCompletedLoreBeat = false;
    this.hasTriggeredTrapAltar = false;
    this.hasCompletedBossPitLoop = Boolean(this.transitionContext?.bossPitCompleted || this.transitionContext?.returnFromBossPit)
      || bossPitRunState.hasSector03Chamber01BossPitCompleted();
    this.hasUnlockedForwardPath = false;
    this.hasTriggeredForwardContract = false;
    this.currentForwardThreshold = null;
    this.currentLoreZone = null;
    this.hasEnteredForwardThreshold = false;
    this.forwardThresholdAwaitingFreshInteract = false;
    this.enemies = [];
    this.encounterPockets = [];
    this.loreAnchor = null;
    this.trapAltar = null;
    this.currentTrapAltar = null;
  }

  create() {
    this.createWorldBounds();
    this.createAudio();
    this.createBackdrop();
    this.createPlayerAndColliders();
    this.createEncounterPockets();
    this.createLoreAnchor();
    this.createTrapAltar();
    this.createUiAndInput();
    this.createForwardThreshold();
    this.configureCameraAndLayout();
    this.registerLoreEvents();
    if (this.transitionContext?.returnFromBossPit) {
      this.hasCompletedLoreBeat = true;
      this.hasTriggeredTrapAltar = true;
      this.hasCompletedBossPitLoop = true;
      bossPitRunState.markSector03Chamber01BossPitCompleted();
      this.restoreEncounterStateFromRunCache();
      this.updateTrapAltarVisualState();
    }
    this.cameras.main.fadeIn(650, 0, 0, 0);
  }

  createWorldBounds() {
    this.physics.world.gravity.y = WORLD.gravityY;
    this.cameras.main.setBounds(0, 0, CRADLE_BOOTSTRAP.worldWidth, WORLD.height);
    this.physics.world.setBounds(0, 0, CRADLE_BOOTSTRAP.worldWidth, WORLD.height);
    this.cameras.main.setBackgroundColor('#070505');
    this.platforms = this.physics.add.staticGroup();
  }

  createAudio() {
    this.audioDirector = new AudioDirector(this);
    this.audioDirector.playAmbientLoop(ASSET_KEYS.ambientChamber01Loop01, { volume: 0.105 });
  }

  createBackdrop() {
    this.add.rectangle(CRADLE_BOOTSTRAP.worldWidth / 2, WORLD.height / 2, CRADLE_BOOTSTRAP.worldWidth, WORLD.height, 0x070505, 1).setDepth(CRADLE_BOOTSTRAP.backdropDepth);
    this.add.rectangle(CRADLE_BOOTSTRAP.worldWidth / 2, CRADLE_BOOTSTRAP.lowerBandY, CRADLE_BOOTSTRAP.worldWidth, CRADLE_BOOTSTRAP.lowerBandHeight, 0x251914, CRADLE_BOOTSTRAP.lowerBandAlpha).setDepth(-14.24);
    this.add.rectangle(CRADLE_BOOTSTRAP.worldWidth / 2, CRADLE_BOOTSTRAP.refusalsBandY, CRADLE_BOOTSTRAP.worldWidth, CRADLE_BOOTSTRAP.refusalsBandHeight, 0x1a1310, CRADLE_BOOTSTRAP.refusalsBandAlpha).setDepth(-13.82);

    CRADLE_SEGMENTS.forEach((segment, index) => {
      if (this.textures.exists(segment.key)) {
        this.add.image(segment.x, segment.y, segment.key).setDisplaySize(segment.width, segment.height).setTint(segment.tint).setAlpha(segment.alpha).setDepth(segment.depth);
      } else {
        this.add.rectangle(segment.x, segment.y + 10, segment.width, segment.height, 0x3d2f2a, 0.78).setDepth(segment.depth);
      }
      this.add.ellipse(segment.x, WORLD.floorY - 32, segment.width * 0.82, 62, 0x070504, 0.14 + index * 0.012).setDepth(-14.06);
    });

    CRADLE_RIBS.forEach((marker) => {
      const ribY = WORLD.floorY - marker.ribHeight / 2 - 16;
      const leftRibX = marker.x - marker.archWidth / 2;
      const rightRibX = marker.x + marker.archWidth / 2;
      this.add.rectangle(leftRibX, ribY, marker.ribWidth, marker.ribHeight, 0x2d201a, marker.alpha).setDepth(marker.depth);
      this.add.rectangle(rightRibX, ribY, marker.ribWidth, marker.ribHeight, 0x2d201a, marker.alpha).setDepth(marker.depth);
      this.add.ellipse(marker.x, ribY - marker.ribHeight / 2 + 24, marker.archWidth, marker.archHeight, 0x5e4737, marker.alpha * 0.84).setDepth(marker.depth - 0.04);
      this.add.ellipse(marker.x, WORLD.floorY + 10, marker.archWidth * 1.16, 26, 0x050403, marker.alpha).setDepth(-5.22);
    });

    this.add.rectangle(CRADLE_BOOTSTRAP.worldWidth / 2, WORLD.floorY - 14, CRADLE_BOOTSTRAP.worldWidth, 96, 0x1a1411, 0.95).setDepth(-6.3);
    this.add.rectangle(CRADLE_BOOTSTRAP.worldWidth / 2, WORLD.floorY - 48, CRADLE_BOOTSTRAP.worldWidth, 24, 0x2c2018, 0.76).setDepth(-6.26);
    this.add.ellipse(CRADLE_BOOTSTRAP.worldWidth / 2, WORLD.floorY + 10, CRADLE_BOOTSTRAP.worldWidth, 54, 0x020202, 0.36).setDepth(-5.94);

    if (this.textures.exists(ASSET_KEYS.sector03Chamber01BackgroundThresholdAlt)) {
      this.add.tileSprite(CRADLE_BOOTSTRAP.worldWidth / 2, WORLD.floorY + 6, CRADLE_BOOTSTRAP.worldWidth, 56, ASSET_KEYS.sector03Chamber01BackgroundThresholdAlt)
        .setTint(0xc0ae97)
        .setAlpha(0.12)
        .setDepth(-6.2);
    }

    this.add.rectangle(5480, WORLD.floorY - 138, 520, 264, 0x130d0a, 0.24).setDepth(-13.68);
    if (this.textures.exists(ASSET_KEYS.sector03Chamber01BossRefusalMass)) {
      this.add.image(5440, WORLD.floorY - 162, ASSET_KEYS.sector03Chamber01BossRefusalMass)
        .setDisplaySize(316, 316)
        .setTint(0xcebea9)
        .setAlpha(0.36)
        .setDepth(-8.3);
    }

    this.createInvisiblePlatform(CRADLE_BOOTSTRAP.worldWidth / 2, WORLD.floorY + 28, CRADLE_BOOTSTRAP.worldWidth, CRADLE_BOOTSTRAP.floorColliderHeight);
  }

  createPlayerAndColliders() {
    const spawnX = this.transitionContext?.returnFromBossPit
      ? this.transitionContext.returnPlayerX ?? CRADLE_TRAP_ALTAR.altarX + 52
      : CRADLE_BOOTSTRAP.spawnX;
    const spawnY = this.transitionContext?.returnFromBossPit
      ? this.transitionContext.returnPlayerY ?? CRADLE_BOOTSTRAP.spawnY
      : CRADLE_BOOTSTRAP.spawnY;
    this.player = new Player(this, spawnX, spawnY, PLAYER);
    const entryIntegrity = applyChamberEntryRestore(this.transitionContext);
    this.player.health = entryIntegrity.current;
    this.player.maxHealth = entryIntegrity.max;
    this.applyGameplayReadabilitySupport(this.player.sprite, { fill: 0xd3c6b4, alpha: 0.16, scale: 1.08 });
    this.physics.add.collider(this.player.sprite, this.platforms);
  }

  createEncounterPockets() {
    this.encounterPockets = CRADLE_POCKETS.map((pocketConfig) => this.createEncounterPocket(pocketConfig));
  }

  createEncounterPocket(pocketConfig) {
    const zone = this.add.zone(pocketConfig.zoneX, pocketConfig.zoneY, pocketConfig.zoneWidth, pocketConfig.zoneHeight).setOrigin(0.5);
    this.physics.add.existing(zone, true);

    const markerShadow = this.add.ellipse(pocketConfig.zoneX, WORLD.floorY - 4, pocketConfig.markerWidth, pocketConfig.markerHeight, 0x040302, pocketConfig.markerAlpha).setDepth(-5.84);
    const enemies = pocketConfig.enemies.map((enemyConfig) => this.createEncounterEnemy(enemyConfig, pocketConfig));
    return { ...pocketConfig, zone, markerShadow, enemies, activated: false, resolved: false };
  }

  createEncounterEnemy(enemyConfig, pocketConfig) {
    const baseConfig = enemyConfig.type === 'withheld-vessel'
      ? WITHHELD_VESSEL
      : enemyConfig.type === 'bird-judge'
        ? BIRD_JUDGE
        : FAILED_SAINT;

    const config = {
      ...baseConfig,
      wakeDelayMs: enemyConfig.wakeDelayMs ?? 0,
      patrolDistance: enemyConfig.patrolDistance ?? baseConfig.patrolDistance,
      health: enemyConfig.health ?? baseConfig.health
    };

    const enemy = new SkitterServitor(this, enemyConfig.x, enemyConfig.y, config);
    enemy.encounterPocketId = pocketConfig.id;
    enemy.encounterEnemyStateKey = `${pocketConfig.id}::${enemyConfig.type}::${enemyConfig.x}`;
    enemy.awakened = false;
    enemy.awakenAtTime = null;
    enemy.pocketWakeAtTime = null;

    this.physics.add.collider(enemy.sprite, this.platforms);
    this.physics.add.overlap(this.player.attackHitbox, enemy.sprite, (attackZone, enemySprite) => {
      this.handlePlayerHitEnemy(attackZone, enemySprite, enemy);
    });
    this.physics.add.overlap(this.player.sprite, enemy.sprite, (playerSprite, enemySprite) => {
      this.handleEnemyContactPlayer(playerSprite, enemySprite, enemy);
    });

    this.enemies.push(enemy);
    this.applyGameplayReadabilitySupport(enemy.sprite, enemyConfig.type === 'withheld-vessel'
      ? { fill: 0xddccb5, alpha: 0.16, scale: 1.2 }
      : { fill: 0xcabca9, alpha: 0.12, scale: 1.04 });

    return enemy;
  }

  createLoreAnchor() {
    const anchor = CRADLE_LORE.anchor;

    this.add.rectangle(anchor.altarX, anchor.wallPlateY, anchor.wallPlateWidth, anchor.wallPlateHeight, 0x140d0a, 0.88).setDepth(-13.96);
    if (this.textures.exists(ASSET_KEYS.sector03Chamber01BackgroundFeatureWall02)) {
      this.add.image(anchor.altarX, anchor.wallPlateY, ASSET_KEYS.sector03Chamber01BackgroundFeatureWall02)
        .setDisplaySize(anchor.wallPlateWidth + 20, anchor.wallPlateHeight + 20)
        .setTint(0x7e6f63)
        .setAlpha(0.2)
        .setDepth(-13.88);
    }

    this.add.rectangle(anchor.muralX, WORLD.floorY - 96, anchor.muralBackingWidth - 36, 196, 0x241710, 0.92).setDepth(-13.9);
    this.add.rectangle(anchor.muralX, anchor.muralY, anchor.muralBackingWidth, anchor.muralBackingHeight, 0x1b120d, 0.84).setDepth(-13.8);
    if (this.textures.exists(ASSET_KEYS.sector03Chamber01LoreApparitionRefused)) {
      this.add.image(anchor.muralX, anchor.muralY, ASSET_KEYS.sector03Chamber01LoreApparitionRefused)
        .setDisplaySize(anchor.muralWidth, anchor.muralHeight)
        .setTint(0xdccab3)
        .setAlpha(0.4)
        .setDepth(-13.72);
    }

    this.add.rectangle(anchor.altarX, anchor.supportTopY, anchor.supportWidth, anchor.supportHeight, 0x271810, 0.94).setDepth(-6.24);
    this.add.rectangle(anchor.altarX, WORLD.floorY - 12, anchor.supportWidth + 92, 18, 0x090605, 0.84).setDepth(-6.16);
    this.add.ellipse(anchor.altarX, WORLD.floorY - 18, anchor.shadowWidth, 30, 0x3c281c, 0.18).setDepth(-6.12);
    this.add.ellipse(anchor.altarX, WORLD.floorY + 10, anchor.shadowWidth + 180, 38, 0x020202, 0.36).setDepth(-6.04);

    if (this.textures.exists(ASSET_KEYS.sector03Chamber02LoreAltar)) {
      this.add.image(anchor.altarX, anchor.altarY, ASSET_KEYS.sector03Chamber02LoreAltar)
        .setDisplaySize(anchor.altarDisplayWidth, anchor.altarDisplayHeight)
        .setTint(0xe0ccb5)
        .setAlpha(0.9)
        .setDepth(-6.08);
    }

    const zone = this.add.zone(anchor.zoneX, anchor.zoneY, anchor.zoneWidth, anchor.zoneHeight).setOrigin(0.5);
    this.physics.add.existing(zone, true);

    this.loreAnchor = { ...anchor, zone };
  }

  createTrapAltar() {
    const altar = CRADLE_TRAP_ALTAR;
    this.add.rectangle(altar.altarX, altar.supportTopY, altar.supportWidth, altar.supportHeight, 0x281a14, 0.94).setDepth(-6.24);
    this.add.rectangle(altar.altarX, WORLD.floorY - 12, altar.supportWidth + 88, 18, 0x090605, 0.84).setDepth(-6.16);
    this.add.ellipse(altar.altarX, WORLD.floorY - 18, altar.shadowWidth, 30, 0x412d20, 0.18).setDepth(-6.12);
    this.add.ellipse(altar.altarX, WORLD.floorY + 10, altar.shadowWidth + 180, 38, 0x020202, 0.36).setDepth(-6.04);

    const primaryKey = this.textures.exists(ASSET_KEYS.sector03Chamber02LoreAltar)
      ? ASSET_KEYS.sector03Chamber02LoreAltar
      : null;

    const sprite = primaryKey
      ? this.add.image(altar.altarX, altar.altarY, primaryKey)
        .setDisplaySize(altar.altarDisplayWidth, altar.altarDisplayHeight)
        .setTint(0xd6c4ae)
        .setAlpha(0.86)
        .setDepth(-6.08)
      : this.add.ellipse(altar.altarX, altar.altarY + 6, altar.altarDisplayWidth * 0.78, altar.altarDisplayHeight * 0.82, 0x836d5f, 0.8).setDepth(-6.08);

    const aura = this.add.ellipse(altar.altarX, altar.altarY - 2, altar.altarDisplayWidth * 0.72, altar.altarDisplayHeight * 0.66, 0xc5ad88, 0.08).setDepth(-6.06);
    const zone = this.add.zone(altar.zoneX, altar.zoneY, altar.zoneWidth, altar.zoneHeight).setOrigin(0.5);
    this.physics.add.existing(zone, true);
    this.trapAltar = { ...altar, sprite, aura, zone };
    this.updateTrapAltarVisualState();
  }

  createForwardThreshold() {
    this.forwardBarrier = this.add.rectangle(
      CRADLE_FORWARD_GATE.barrierX,
      CRADLE_FORWARD_GATE.barrierY,
      CRADLE_FORWARD_GATE.barrierWidth,
      CRADLE_FORWARD_GATE.barrierHeight,
      0x140e0a,
      0.4
    ).setDepth(-4.86);

    this.physics.add.existing(this.forwardBarrier, true);
    this.forwardBarrierCollider = this.physics.add.collider(this.player.sprite, this.forwardBarrier);

    this.forwardThresholdZone = this.add.zone(
      CRADLE_FORWARD_GATE.thresholdX,
      CRADLE_FORWARD_GATE.thresholdY,
      CRADLE_FORWARD_GATE.thresholdWidth,
      CRADLE_FORWARD_GATE.thresholdHeight
    ).setOrigin(0.5);
    this.physics.add.existing(this.forwardThresholdZone, true);

    if (this.textures.exists(ASSET_KEYS.sector03Chamber01GateRefusalSeal)) {
      this.add.image(CRADLE_FORWARD_GATE.barrierX, WORLD.floorY - 164, ASSET_KEYS.sector03Chamber01GateRefusalSeal)
        .setDisplaySize(334, 334)
        .setTint(0xd8c3aa)
        .setAlpha(0.86)
        .setDepth(-4.92);
    }

    this.forwardPrompt = null;
  }

  createUiAndInput() {
    this.hud = new HudOverlay(this);
    this.mobileControls = new MobileControls(this);
    this.setupMobileUiCamera();

    this.restartText = this.add.text(this.scale.width / 2, 90, '', {
      fontFamily: 'monospace', fontSize: '22px', color: '#d2c2ac', align: 'center'
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
      this.hud?.setBossBarState({ visible: false });
      this.saveEncounterStateToRunCache();
    });
  }

  configureCameraAndLayout() {
    this.cameras.main.startFollow(this.player.sprite, true, CRADLE_BOOTSTRAP.cameraLerp.x, CRADLE_BOOTSTRAP.cameraLerp.y, CRADLE_BOOTSTRAP.desktopFollowOffsetX, 0);

    this.directionalCameraBias = createDirectionalCameraBias({
      camera: this.cameras.main,
      player: this.player,
      desktopBaseOffsetX: CRADLE_BOOTSTRAP.desktopFollowOffsetX,
      portraitBaseOffsetX: CRADLE_BOOTSTRAP.portraitFollowOffsetX,
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
      this.mobileControls.setMode('dead');
      this.restartText.setVisible(true).setText('VESSEL FAILURE\nPress [R] to re-seed chamber');
      this.enemies.forEach((enemy) => enemy.body?.setVelocity(0, 0));

      if ((Phaser.Input.Keyboard.JustDown(this.keyRestart) || mobileInput.interactPressed) && !this.isRestartingRun) {
        this.isRestartingRun = true;
        restartRunFromDeath(this);
      }
      return;
    }

    if (this.isLoreTransitionActive) {
      this.mobileControls.setMode('dialogue');
      this.player.body.setVelocity(0, 0);
      this.enemies.forEach((enemy) => enemy.body?.setVelocity(0, 0));
      return;
    }

    this.restartText.setVisible(false);
    this.mobileControls.setMode('gameplay');

    const input = {
      left: this.cursors.left.isDown || mobileInput.left,
      right: this.cursors.right.isDown || mobileInput.right,
      jumpPressed: Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.cursors.space) || mobileInput.jumpPressed,
      attackPressed: Phaser.Input.Keyboard.JustDown(this.keyAttack) || mobileInput.attackPressed
    };

    this.player.update(time, input);
    this.refreshEncounterPocketPresence();
    this.updateEncounterPockets(time);
    this.enemies.forEach((enemy) => enemy.update(time, this.player.sprite.x));
    this.refreshLoreZonePresence();
    this.tryBeginLoreSequence(mobileInput);
    this.refreshTrapAltarPresence();
    this.tryBeginTrapAltarDescent(mobileInput);
    this.refreshForwardThresholdPresence();
    this.tryAdvanceForwardThreshold(mobileInput);
    this.directionalCameraBias?.update();
    this.hud.update(this.player.health, this.player.maxHealth);
  }

  refreshEncounterPocketPresence() {
    this.encounterPockets.forEach((pocket) => {
      let playerInsidePocket = false;
      this.physics.overlap(this.player.sprite, pocket.zone, () => {
        playerInsidePocket = true;
      });
    });
  }

  updateEncounterPockets(time) {
    this.encounterPockets.forEach((pocket) => {
      if (pocket.resolved) {
        pocket.markerShadow.setAlpha(0.03);
        return;
      }

      let playerInsidePocket = false;
      this.physics.overlap(this.player.sprite, pocket.zone, () => {
        playerInsidePocket = true;
      });

      if (playerInsidePocket && !pocket.activated) {
        pocket.activated = true;
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
        pocket.markerShadow.setAlpha(0.04);
      }
    });

    if (!this.hasUnlockedForwardPath) {
      const allResolved = this.encounterPockets.every((pocket) => pocket.resolved);
      if (allResolved) {
        this.unlockForwardPath();
      }
    }
  }

  unlockForwardPath() {
    this.hasUnlockedForwardPath = true;
    this.forwardBarrier?.setVisible(false);
    if (this.forwardBarrier?.body) {
      this.forwardBarrier.body.enable = false;
      this.forwardBarrier.body.updateFromGameObject?.();
    }
    this.forwardBarrierCollider?.destroy();
    this.forwardBarrierCollider = null;
    this.forwardPrompt?.setVisible(false);
  }

  refreshLoreZonePresence() {
    this.currentLoreZone = null;

    if (!this.loreAnchor || this.isLoreTransitionActive || this.hasCompletedLoreBeat) {
      return;
    }

    let isInside = false;
    this.physics.overlap(this.player.sprite, this.loreAnchor.zone, () => {
      isInside = true;
      this.currentLoreZone = this.loreAnchor;
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

  refreshTrapAltarPresence() {
    this.currentTrapAltar = null;
    if (!this.trapAltar?.zone || this.isLoreTransitionActive) {
      return;
    }

    this.physics.overlap(this.player.sprite, this.trapAltar.zone, () => {
      this.currentTrapAltar = this.trapAltar;
    });

  }

  tryBeginTrapAltarDescent(mobileInput) {
    if (!this.currentTrapAltar || this.hasCompletedBossPitLoop) {
      return;
    }

    const interactPressed = Phaser.Input.Keyboard.JustDown(this.keyInteract)
      || Phaser.Input.Keyboard.JustDown(this.keyEnter)
      || mobileInput.interactPressed;
    if (!interactPressed) {
      return;
    }

    this.beginTrapAltarDescent();
  }

  beginTrapAltarDescent() {
    if (this.isLoreTransitionActive || this.hasCompletedBossPitLoop) {
      return;
    }

    this.hasTriggeredTrapAltar = true;
    this.currentTrapAltar = null;
    this.mobileControls.setMode('dialogue');
    this.player.body.setVelocity(0, 0);
    this.enemies.forEach((enemy) => enemy.body?.setVelocity(0, 0));
    this.audioDirector?.stopAmbientLoop();
    this.hud?.setVisible(false);
    this.mobileControls.setMode('init');
    this.uiCamera?.setVisible(false);

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.audioDirector?.shutdown();
      this.scene.start('Sector03Chamber01BossPitScene', {
        fromScene: this.scene.key,
        altarX: CRADLE_TRAP_ALTAR.altarX,
        altarY: CRADLE_BOOTSTRAP.spawnY
      });
    });

    this.saveEncounterStateToRunCache();
    this.tweens.add({
      targets: this.player.sprite,
      y: this.player.sprite.y + 38,
      duration: 260,
      ease: 'Sine.easeIn'
    });
    this.cameras.main.shake(250, 0.004, true);
    this.cameras.main.fadeOut(420, 0, 0, 0);
  }

  beginLoreSequence() {
    if (this.isLoreTransitionActive) {
      return;
    }

    this.isLoreTransitionActive = true;
    this.currentLoreZone = null;
    this.mobileControls.setMode('dialogue');
    this.player.body.setVelocity(0, 0);
    this.enemies.forEach((enemy) => enemy.body?.setVelocity(0, 0));
    this.audioDirector?.stopAmbientLoop();
    this.hud?.setVisible(false);
    this.mobileControls.setMode('init');
    this.uiCamera?.setVisible(false);

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.setGameplaySceneVisibility(false);
      this.scene.pause();
      this.scene.launch('LoreCutsceneScene', {
        cutsceneId: CRADLE_LORE.cutsceneId,
        returnSceneKey: this.scene.key
      });
    });

    this.cameras.main.fadeOut(420, 0, 0, 0);
  }

  handleLoreCutsceneComplete({ cutsceneId } = {}) {
    if (cutsceneId !== CRADLE_LORE.cutsceneId) {
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
    this.audioDirector?.playAmbientLoop(ASSET_KEYS.ambientChamber01Loop01, { volume: 0.105 });
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  setGameplaySceneVisibility(isVisible) {
    this.scene.setVisible(isVisible, this.scene.key);
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
        ? 'THRESHOLD MARKED\nENTERING HOUSE OF BORROWED FACES'
        : 'REFUSAL SEAL YIELDED\nPRESS RITE / [E] TO ENTER CHAMBER II'
      : 'REFUSAL SEAL CLOSED';

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
    this.forwardPrompt?.setVisible(true).setText('THRESHOLD MARKED\nENTERING HOUSE OF BORROWED FACES');
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.audioDirector?.shutdown();
      this.scene.start('Sector03Chamber02Scene', {
        fromScene: this.scene.key,
        fromGate: 'gallery-of-failed-measures-threshold'
      });
    });
    this.cameras.main.fadeOut(320, 0, 0, 0);
  }

  restoreEncounterStateFromRunCache() {
    const snapshot = bossPitRunState.getSector03Chamber01EncounterState();
    if (!snapshot) {
      return;
    }

    const deadEnemyKeys = new Set(snapshot.deadEnemyKeys ?? []);
    this.encounterPockets.forEach((pocket) => {
      if (snapshot.resolvedPocketIds?.includes(pocket.id)) {
        pocket.activated = true;
        pocket.resolved = true;
        pocket.markerShadow?.setAlpha(0.04);
      }

      pocket.enemies.forEach((enemy) => {
        if (!deadEnemyKeys.has(enemy.encounterEnemyStateKey)) {
          return;
        }

        enemy.dead = true;
        enemy.awakened = false;
        enemy.awakenAtTime = null;
        enemy.pocketWakeAtTime = null;
        enemy.body?.stop?.();
        if (enemy.body) {
          enemy.body.enable = false;
          enemy.body.setAllowGravity?.(false);
        }
        enemy.sprite?.setVisible(false).setAlpha(0);
        enemy.eyeGlow?.setVisible(false).setAlpha(0);
      });
    });
  }

  saveEncounterStateToRunCache() {
    if (!this.encounterPockets?.length) {
      return;
    }

    const resolvedPocketIds = [];
    const deadEnemyKeys = [];
    this.encounterPockets.forEach((pocket) => {
      if (pocket.resolved || pocket.enemies.every((enemy) => enemy.dead)) {
        resolvedPocketIds.push(pocket.id);
      }

      pocket.enemies.forEach((enemy) => {
        if (enemy.dead) {
          deadEnemyKeys.push(enemy.encounterEnemyStateKey);
        }
      });
    });

    bossPitRunState.setSector03Chamber01EncounterState({ resolvedPocketIds, deadEnemyKeys });
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
    enemy.takeDamage(1, this.time.now);
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

  createInvisiblePlatform(x, y, width, height) {
    const platform = this.add.rectangle(x, y, width, height, 0x000000, 0).setOrigin(0.5);
    platform.setVisible(false);
    this.physics.add.existing(platform, true);
    this.platforms.add(platform);
    return platform;
  }

  setupMobileUiCamera() {
    if (!this.mobileControls.enabled) {
      return;
    }

    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'Sector03Chamber01MobileUiCamera');
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
      this.directionalCameraBias?.setLayout({ isPortrait: true, followOffsetY: PORTRAIT_LAYOUT.portraitFollowOffsetY });
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
    this.directionalCameraBias?.setLayout({ isPortrait: false, followOffsetY: PORTRAIT_LAYOUT.desktopFollowOffsetY });
    this.mobileControls.setReservedBottomPx(0);
    this.restartText?.setPosition(width / 2, 90);
    this.hud?.layout();
  }

  updateTrapAltarVisualState() {
    if (!this.trapAltar) {
      return;
    }

    if (this.hasCompletedBossPitLoop) {
      this.trapAltar.sprite?.setAlpha(0.36).setTint(0x5b5148);
      this.trapAltar.aura?.setAlpha(0.02).setFillStyle(0x3a3229, 0.02);
      this.add.rectangle(CRADLE_TRAP_ALTAR.altarX, CRADLE_TRAP_ALTAR.altarY, CRADLE_TRAP_ALTAR.altarDisplayWidth + 20, CRADLE_TRAP_ALTAR.altarDisplayHeight + 14, 0x000000, 0.42)
        .setDepth(-6.01);
      this.add.ellipse(CRADLE_TRAP_ALTAR.altarX, CRADLE_TRAP_ALTAR.altarY + 8, CRADLE_TRAP_ALTAR.altarDisplayWidth * 0.7, CRADLE_TRAP_ALTAR.altarDisplayHeight * 0.36, 0x000000, 0.38)
        .setDepth(-6);
      return;
    }

    this.trapAltar.sprite?.setAlpha(0.86).setTint(0xd6c4ae);
    this.trapAltar.aura?.setAlpha(0.08).setFillStyle(0xc5ad88, 0.08);
  }

  applyGameplayReadabilitySupport(target) {
    if (!target) {
      return null;
    }

    return null;
  }
}
