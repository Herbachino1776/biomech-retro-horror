import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { SkitterServitor } from '../entities/SkitterServitor.js';
import { AbyssalArchon } from '../entities/AbyssalArchon.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import { AudioDirector } from '../audio/AudioDirector.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { PLAYER, SKITTER, WORLD } from '../data/milestone1Config.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';
import { restartRunFromDeath } from '../systems/RunReset.js';

const BLACK_AQUEDUCT_BOOTSTRAP = {
  sceneKey: 'Sector02Chamber01Scene',
  worldWidth: 5560,
  floorColliderHeight: 72,
  spawnX: 220,
  spawnY: PLAYER.startY,
  cameraLerp: { x: 0.08, y: 0.08 },
  portraitFollowOffsetX: -112,
  desktopFollowOffsetX: -156,
  backdropDepth: -16,
  lowerBandY: WORLD.floorY - 72,
  lowerBandHeight: 268,
  lowerBandAlpha: 0.22,
  canalY: WORLD.floorY + 54,
  canalHeight: 126,
  canalAlpha: 0.7,
  reflectionY: WORLD.floorY + 28,
  processionalShadowY: WORLD.floorY - 22
};

const BLACK_AQUEDUCT_SEGMENTS = [
  { key: ASSET_KEYS.sector02Chamber01BackgroundEntryCanal, x: 420, y: 220, width: 920, height: 480, tint: 0xb7b9ad, alpha: 0.72, depth: -14.72 },
  { key: ASSET_KEYS.sector02Chamber01BackgroundWallModule, x: 1200, y: 214, width: 812, height: 448, tint: 0xa6a698, alpha: 0.58, depth: -14.6 },
  { key: ASSET_KEYS.sector02Chamber01BackgroundWallModule, x: 1960, y: 214, width: 812, height: 448, tint: 0x96988f, alpha: 0.54, depth: -14.58 },
  { key: ASSET_KEYS.sector02Chamber01BackgroundSluiceOpening, x: 2780, y: 218, width: 940, height: 452, tint: 0xb8bdae, alpha: 0.72, depth: -14.76 },
  { key: ASSET_KEYS.sector02Chamber01BackgroundWallModule, x: 3600, y: 214, width: 824, height: 452, tint: 0x8f9088, alpha: 0.56, depth: -14.56 },
  { key: ASSET_KEYS.sector02Chamber01BackgroundThreshold, x: 4420, y: 216, width: 920, height: 456, tint: 0xb4b8ab, alpha: 0.7, depth: -14.74 },
  { key: ASSET_KEYS.sector02Chamber01BackgroundClimax, x: 5180, y: 208, width: 760, height: 456, tint: 0xb9c0b0, alpha: 0.76, depth: -14.78 }
];

const BLACK_AQUEDUCT_RIBS = [
  { x: 980, ribWidth: 26, ribHeight: 300, archWidth: 220, archHeight: 138, alpha: 0.16, depth: -11.7 },
  { x: 2240, ribWidth: 24, ribHeight: 332, archWidth: 244, archHeight: 152, alpha: 0.18, depth: -11.76 },
  { x: 3720, ribWidth: 28, ribHeight: 348, archWidth: 268, archHeight: 164, alpha: 0.2, depth: -11.82 },
  { x: 4920, ribWidth: 30, ribHeight: 364, archWidth: 292, archHeight: 176, alpha: 0.22, depth: -11.88 }
];

const BLACK_AQUEDUCT_SKITTER_CONFIG = {
  ...SKITTER,
  textureKey: ASSET_KEYS.sector02Chamber01EnemyBasic,
  aggroRange: 244,
  speed: 52,
  patrolDistance: 110,
  awakenPlayerX: undefined,
  wakeDelayMs: 0,
  presentation: {
    alpha: 0.96,
    display: { width: 184, height: 150 },
    origin: { x: 0.52, y: 0.92 },
    stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.44 }
  },
  eyeGlowColor: 0xb8d2a5,
  eyeGlowWidth: 30,
  eyeGlowHeight: 14,
  eyeGlowOffsetX: 14,
  eyeGlowYOffset: 10,
  eyeGlowAlphaBase: 0.3,
  eyeGlowWindupAlphaGain: 0.28,
  body: { width: 54, height: 30, offsetX: 10, offsetY: 18 }
};

const BLACK_AQUEDUCT_TOLL_KEEPER_CONFIG = {
  ...SKITTER,
  textureKey: ASSET_KEYS.sector02Chamber01EnemyElite,
  variantName: 'AQUEDUCT TOLL-KEEPER',
  health: 7,
  speed: 44,
  aggroRange: 280,
  attackCooldownMs: 3000,
  windupMs: 820,
  attackActiveMs: 320,
  attackRecoveryMs: 620,
  hesitationMs: 560,
  attackTriggerRange: 162,
  attackRange: 194,
  preferredRange: 138,
  rangeBand: 20,
  lungeSpeedBonus: 102,
  lungeJumpVelocity: -92,
  recoilVelocityX: 144,
  recoilVelocityY: -84,
  patrolDistance: 84,
  awakenPlayerX: undefined,
  wakeDelayMs: 0,
  body: { width: 72, height: 42, offsetX: 28, offsetY: 94 },
  presentation: {
    alpha: 0.98,
    display: { width: 288, height: 220 },
    origin: { x: 0.52, y: 0.965 },
    stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.46 }
  },
  eyeGlowColor: 0xe4f2bd,
  eyeGlowWidth: 40,
  eyeGlowHeight: 18,
  eyeGlowOffsetX: 20,
  eyeGlowYOffset: 18,
  eyeGlowAlphaBase: 0.42,
  eyeGlowWindupAlphaGain: 0.44,
  audioProfile: 'tollkeeper'
};

const BLACK_AQUEDUCT_ARCHON_CONFIG = {
  name: 'ABYSSAL ARCHON',
  subtitle: 'Canal Threshold Adjudicator',
  health: 10,
  contactDamage: 2,
  contactDamageCooldownMs: 1050,
  attackCooldownMs: 3100,
  attackTelegraphMs: 660,
  attackRecoveryMs: 480,
  attackRange: 188,
  approachRange: 320,
  approachSpeed: 38,
  idleAdvanceSpeed: 14,
  windupDriftSpeed: 8,
  attackSpeed: 182,
  attackLiftVelocity: -124,
  hitPulseMs: 260,
  hurtRecoverMs: 200,
  hurtRecoilVelocityX: 90,
  hurtRecoilVelocityY: -54,
  spawnX: 5060,
  spawnY: WORLD.floorY + 2,
  activationX: 4740,
  body: { width: 78, height: 118, offsetX: 118, offsetY: 150 },
  audioProfile: 'miniboss',
  presentation: {
    display: { width: 262, height: 284 },
    origin: { x: 0.55, y: 0.985 },
    alpha: 0.98,
    tint: 0xcbd2c1,
    scaleX: 1,
    scaleY: 1
  }
};

const BLACK_AQUEDUCT_CLIMAX_GATE = {
  barrierX: 5180,
  barrierY: WORLD.floorY - 68,
  barrierWidth: 92,
  barrierHeight: 232,
  thresholdX: 5320,
  thresholdY: WORLD.floorY - 74,
  thresholdWidth: 220,
  thresholdHeight: 220,
  promptOffsetY: -158
};

const BLACK_AQUEDUCT_ENCOUNTER_POCKETS = [
  {
    id: 'black-aqueduct-pocket-early',
    label: 'EARLY PRESSURE',
    zoneX: 1210,
    zoneY: WORLD.floorY - 72,
    zoneWidth: 540,
    zoneHeight: 220,
    promptOffsetY: -134,
    markerWidth: 330,
    markerHeight: 70,
    markerAlpha: 0.08,
    enemies: [
      { type: 'skitter', x: 1160, y: PLAYER.startY, patrolDistance: 84, wakeDelayMs: 0 },
      { type: 'skitter', x: 1395, y: PLAYER.startY, patrolDistance: 104, wakeDelayMs: 120 }
    ]
  },
  {
    id: 'black-aqueduct-pocket-mid',
    label: 'MID PRESSURE',
    zoneX: 2580,
    zoneY: WORLD.floorY - 72,
    zoneWidth: 720,
    zoneHeight: 232,
    promptOffsetY: -138,
    markerWidth: 392,
    markerHeight: 74,
    markerAlpha: 0.1,
    enemies: [
      { type: 'skitter', x: 2300, y: PLAYER.startY, patrolDistance: 120, wakeDelayMs: 0 },
      { type: 'skitter', x: 2570, y: PLAYER.startY, patrolDistance: 100, wakeDelayMs: 110 },
      { type: 'skitter', x: 2825, y: PLAYER.startY, patrolDistance: 136, wakeDelayMs: 240 }
    ]
  },
  {
    id: 'black-aqueduct-pocket-late',
    label: 'LATE PRESSURE',
    zoneX: 4460,
    zoneY: WORLD.floorY - 76,
    zoneWidth: 860,
    zoneHeight: 240,
    promptOffsetY: -146,
    markerWidth: 460,
    markerHeight: 80,
    markerAlpha: 0.12,
    enemies: [
      { type: 'skitter', x: 4170, y: PLAYER.startY, patrolDistance: 114, wakeDelayMs: 0 },
      { type: 'tollkeeper', x: 4480, y: PLAYER.startY, patrolDistance: 80, wakeDelayMs: 180 },
      { type: 'skitter', x: 4810, y: PLAYER.startY, patrolDistance: 124, wakeDelayMs: 320 }
    ]
  }
];

const BLACK_AQUEDUCT_LORE = {
  cutsceneId: 'sector02-chamber01-basin-reliquary',
  anchors: [
    {
      id: 'entry-basin-altar',
      label: 'READ THE ENTRY RELIQUARY',
      zoneX: 860,
      zoneY: WORLD.floorY - 74,
      zoneWidth: 172,
      zoneHeight: 190,
      promptOffsetY: -156,
      altarX: 860,
      altarY: WORLD.floorY - 92,
      altarDisplayWidth: 164,
      altarDisplayHeight: 164,
      supportWidth: 228,
      supportHeight: 122,
      supportTopY: WORLD.floorY - 76,
      shadowWidth: 262,
      wallPlateWidth: 286,
      wallPlateHeight: 202,
      wallPlateY: WORLD.floorY - 150
    },
    {
      id: 'basin-reliquary',
      label: 'READ THE BASIN RELIQUARY',
      zoneX: 3660,
      zoneY: WORLD.floorY - 74,
      zoneWidth: 180,
      zoneHeight: 208,
      promptOffsetY: -176,
      altarX: 3660,
      altarY: WORLD.floorY - 88,
      altarDisplayWidth: 188,
      altarDisplayHeight: 188,
      supportWidth: 228,
      supportHeight: 116,
      supportTopY: WORLD.floorY - 72,
      shadowWidth: 278,
      wallPlateWidth: 548,
      wallPlateHeight: 346,
      wallPlateY: WORLD.floorY - 132,
      muralX: 3660,
      muralY: 220,
      muralWidth: 472,
      muralHeight: 290,
      muralBackingWidth: 548,
      muralBackingHeight: 346
    }
  ]
};

export class Sector02Chamber01Scene extends Phaser.Scene {
  constructor() {
    super(BLACK_AQUEDUCT_BOOTSTRAP.sceneKey);
  }

  init(data) {
    this.transitionContext = data ?? {};
    this.isRestartingRun = false;
    this.isLoreTransitionActive = false;
    this.currentLoreZone = null;
    this.hasCompletedLoreBeat = false;
    this.hasUnlockedForwardPath = false;
    this.hasTriggeredForwardContract = false;
    this.enemies = [];
    this.encounterPockets = [];
    this.loreAnchors = [];
  }

  create() {
    this.createWorldBounds();
    this.createAudio();
    this.createBackdrop();
    this.createPlayerAndColliders();
    this.createEncounterPockets();
    this.createClimaxEncounter();
    this.createLoreAnchors();
    this.createUiAndInput();
    this.createForwardThreshold();
    this.configureCameraAndLayout();
    this.registerLoreEvents();
    this.cameras.main.fadeIn(650, 0, 0, 0);
  }

  createWorldBounds() {
    this.physics.world.gravity.y = WORLD.gravityY;
    this.cameras.main.setBounds(0, 0, BLACK_AQUEDUCT_BOOTSTRAP.worldWidth, WORLD.height);
    this.physics.world.setBounds(0, 0, BLACK_AQUEDUCT_BOOTSTRAP.worldWidth, WORLD.height);
    this.cameras.main.setBackgroundColor('#050707');
    this.platforms = this.physics.add.staticGroup();
  }

  createAudio() {
    this.audioDirector = new AudioDirector(this);
    this.audioDirector.playAmbientLoop(ASSET_KEYS.ambientChamber02Loop01, { volume: 0.1 });
  }

  createBackdrop() {
    this.add.rectangle(BLACK_AQUEDUCT_BOOTSTRAP.worldWidth / 2, WORLD.height / 2, BLACK_AQUEDUCT_BOOTSTRAP.worldWidth, WORLD.height, 0x050707, 1).setDepth(BLACK_AQUEDUCT_BOOTSTRAP.backdropDepth);
    this.add.rectangle(BLACK_AQUEDUCT_BOOTSTRAP.worldWidth / 2, BLACK_AQUEDUCT_BOOTSTRAP.lowerBandY, BLACK_AQUEDUCT_BOOTSTRAP.worldWidth, BLACK_AQUEDUCT_BOOTSTRAP.lowerBandHeight, 0x091112, BLACK_AQUEDUCT_BOOTSTRAP.lowerBandAlpha).setDepth(-14.2);
    this.renderSegmentBackdrop();
    this.renderCanalTrough();
    this.renderArchitecture();
    this.renderWalkway();
    this.renderGateThreshold();
    this.createInvisiblePlatform(BLACK_AQUEDUCT_BOOTSTRAP.worldWidth / 2, WORLD.floorY + 28, BLACK_AQUEDUCT_BOOTSTRAP.worldWidth, BLACK_AQUEDUCT_BOOTSTRAP.floorColliderHeight);
  }

  renderSegmentBackdrop() {
    BLACK_AQUEDUCT_SEGMENTS.forEach((segment, index) => {
      if (this.textures.exists(segment.key)) {
        this.add.image(segment.x, segment.y, segment.key).setDisplaySize(segment.width, segment.height).setTint(segment.tint).setAlpha(segment.alpha).setDepth(segment.depth);
      } else {
        this.add.rectangle(segment.x, segment.y + 12, segment.width, segment.height, 0x273031, 0.76).setDepth(segment.depth);
      }

      this.add.ellipse(segment.x, WORLD.floorY - 28, segment.width * 0.8, 62, 0x040505, 0.12 + index * 0.01).setDepth(-14.08);
    });
  }

  renderCanalTrough() {
    this.add.rectangle(BLACK_AQUEDUCT_BOOTSTRAP.worldWidth / 2, BLACK_AQUEDUCT_BOOTSTRAP.canalY, BLACK_AQUEDUCT_BOOTSTRAP.worldWidth, BLACK_AQUEDUCT_BOOTSTRAP.canalHeight, 0x040708, BLACK_AQUEDUCT_BOOTSTRAP.canalAlpha).setDepth(-13.3);
    this.add.ellipse(BLACK_AQUEDUCT_BOOTSTRAP.worldWidth / 2, BLACK_AQUEDUCT_BOOTSTRAP.reflectionY, BLACK_AQUEDUCT_BOOTSTRAP.worldWidth * 0.96, 74, 0x27403c, 0.12).setDepth(-13.1);

    [740, 1640, 2660, 3650].forEach((x, index) => {
      this.add.ellipse(x, WORLD.floorY + 18, 440 + index * 24, 20, 0x9db29d, 0.06 + index * 0.008).setDepth(-12.95);
      this.add.rectangle(x, WORLD.floorY + 82, 12, 92, 0x121819, 0.42).setDepth(-13.24);
    });
  }

  renderArchitecture() {
    BLACK_AQUEDUCT_RIBS.forEach((marker) => {
      const ribY = WORLD.floorY - marker.ribHeight / 2 - 12;
      const leftRibX = marker.x - marker.archWidth / 2;
      const rightRibX = marker.x + marker.archWidth / 2;

      this.add.rectangle(leftRibX, ribY, marker.ribWidth, marker.ribHeight, 0x1b2122, marker.alpha).setDepth(marker.depth);
      this.add.rectangle(rightRibX, ribY, marker.ribWidth, marker.ribHeight, 0x1b2122, marker.alpha).setDepth(marker.depth);
      this.add.ellipse(marker.x, ribY - marker.ribHeight / 2 + 22, marker.archWidth, marker.archHeight, 0x364241, marker.alpha * 0.92).setDepth(marker.depth - 0.04);
      this.add.ellipse(marker.x, WORLD.floorY + 10, marker.archWidth * 1.14, 24, 0x030404, marker.alpha).setDepth(-5.2);
    });
  }

  renderWalkway() {
    this.add.rectangle(BLACK_AQUEDUCT_BOOTSTRAP.worldWidth / 2, WORLD.floorY - 14, BLACK_AQUEDUCT_BOOTSTRAP.worldWidth, 96, 0x151716, 0.94).setDepth(-6.3);
    this.add.rectangle(BLACK_AQUEDUCT_BOOTSTRAP.worldWidth / 2, WORLD.floorY - 48, BLACK_AQUEDUCT_BOOTSTRAP.worldWidth, 24, 0x202727, 0.74).setDepth(-6.26);

    if (this.textures.exists(ASSET_KEYS.sector02Chamber01Floor)) {
      this.add.tileSprite(BLACK_AQUEDUCT_BOOTSTRAP.worldWidth / 2, WORLD.floorY + 6, BLACK_AQUEDUCT_BOOTSTRAP.worldWidth, 64, ASSET_KEYS.sector02Chamber01Floor).setTint(0x9ea698).setAlpha(0.2).setDepth(-6.22);
    }

    [540, 1280, 2020, 2760, 3500, 4240, 4980].forEach((x, index) => {
      this.add.rectangle(x, WORLD.floorY - 24, 180, 8, 0x6f7f73, 0.16 + index * 0.01).setDepth(-6.18);
      this.add.rectangle(x, WORLD.floorY - 4, 4, 40, 0x050606, 0.32).setDepth(-6.12);
    });

    this.add.ellipse(BLACK_AQUEDUCT_BOOTSTRAP.worldWidth / 2, WORLD.floorY + 12, BLACK_AQUEDUCT_BOOTSTRAP.worldWidth, 54, 0x020303, 0.36).setDepth(-5.9);
  }

  renderGateThreshold() {
    const gateX = 5180;
    const gateY = WORLD.floorY - 164;

    this.add.ellipse(gateX, WORLD.floorY + 4, 360, 44, 0x030404, 0.34).setDepth(-5.82);
    this.add.rectangle(gateX, WORLD.floorY - 106, 420, 232, 0x101515, 0.22).setDepth(-13.72);

    if (this.textures.exists(ASSET_KEYS.sector02Chamber01Gate)) {
      this.add.image(gateX, gateY, ASSET_KEYS.sector02Chamber01Gate).setDisplaySize(340, 340).setTint(0xc2c7b9).setAlpha(0.84).setDepth(-4.92);
    } else {
      this.add.ellipse(gateX, gateY, 260, 312, 0x364240, 0.82).setStrokeStyle(3, 0xd7d5c8, 0.52).setDepth(-4.92);
    }

    this.processionalLabel = this.add.text(gateX - 22, WORLD.floorY - 270, 'BLACK AQUEDUCT\nPROCESSION THRESHOLD', {
      fontFamily: 'monospace', fontSize: '17px', color: '#cfd7cc', align: 'center', stroke: '#0c0f10', strokeThickness: 4
    }).setOrigin(0.5).setDepth(-4.74).setAlpha(0.8);
  }

  createPlayerAndColliders() {
    this.player = new Player(this, BLACK_AQUEDUCT_BOOTSTRAP.spawnX, BLACK_AQUEDUCT_BOOTSTRAP.spawnY, PLAYER);
    this.applyGameplayReadabilitySupport(this.player.sprite, { fill: 0xc2c9bf, alpha: 0.16, scale: 1.08 });
    this.physics.add.collider(this.player.sprite, this.platforms);
  }

  createEncounterPockets() {
    this.encounterPockets = BLACK_AQUEDUCT_ENCOUNTER_POCKETS.map((pocketConfig) => this.createEncounterPocket(pocketConfig));
  }

  createEncounterPocket(pocketConfig) {
    const zone = this.add.zone(pocketConfig.zoneX, pocketConfig.zoneY, pocketConfig.zoneWidth, pocketConfig.zoneHeight).setOrigin(0.5);
    this.physics.add.existing(zone, true);

    const markerShadow = this.add.ellipse(pocketConfig.zoneX, WORLD.floorY - 4, pocketConfig.markerWidth, pocketConfig.markerHeight, 0x030404, pocketConfig.markerAlpha).setDepth(-5.84);
    const promptText = this.add.text(pocketConfig.zoneX, pocketConfig.zoneY + pocketConfig.promptOffsetY, pocketConfig.label, {
      fontFamily: 'monospace', fontSize: '13px', color: '#d3cbc0', align: 'center', stroke: '#111515', strokeThickness: 4
    }).setOrigin(0.5).setDepth(-4.82).setAlpha(0.82).setVisible(false);

    const enemies = pocketConfig.enemies.map((enemyConfig) => this.createEncounterEnemy(enemyConfig, pocketConfig));
    return { ...pocketConfig, zone, markerShadow, promptText, enemies, activated: false, resolved: false };
  }

  createEncounterEnemy(enemyConfig, pocketConfig) {
    const isTollKeeper = enemyConfig.type === 'tollkeeper';
    const baseConfig = isTollKeeper ? BLACK_AQUEDUCT_TOLL_KEEPER_CONFIG : BLACK_AQUEDUCT_SKITTER_CONFIG;
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
    enemy.isTollKeeper = isTollKeeper;

    this.physics.add.collider(enemy.sprite, this.platforms);
    this.physics.add.overlap(this.player.attackHitbox, enemy.sprite, (attackZone, enemySprite) => {
      this.handlePlayerHitEnemy(attackZone, enemySprite, enemy);
    });
    this.physics.add.overlap(this.player.sprite, enemy.sprite, (playerSprite, enemySprite) => {
      this.handleEnemyContactPlayer(playerSprite, enemySprite, enemy);
    });

    this.enemies.push(enemy);
    this.applyGameplayReadabilitySupport(enemy.sprite, isTollKeeper
      ? { fill: 0xd5d7be, alpha: 0.16, scale: 1.22 }
      : { fill: 0xbfc7b7, alpha: 0.12, scale: 1.04 });
    return enemy;
  }

  createClimaxEncounter() {
    this.archonWakeLabel = this.add.text(BLACK_AQUEDUCT_ARCHON_CONFIG.spawnX, WORLD.floorY - 250, 'ABYSSAL ARCHON\nBOUND IN SUMP', {
      fontFamily: 'monospace', fontSize: '16px', color: '#d5ddd1', align: 'center', stroke: '#0c0f10', strokeThickness: 4
    }).setOrigin(0.5).setDepth(-4.76).setAlpha(0.82);

    this.archon = new AbyssalArchon(this, BLACK_AQUEDUCT_ARCHON_CONFIG.spawnX, BLACK_AQUEDUCT_ARCHON_CONFIG.spawnY, BLACK_AQUEDUCT_ARCHON_CONFIG);
    this.archon.setActive(false);
    this.archon.sprite.setDepth(6.2);
    this.archon.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.archon.sprite, this.platforms);
    this.physics.add.overlap(this.player.attackHitbox, this.archon.sprite, (_attackZone, enemySprite) => {
      this.handlePlayerHitArchon(enemySprite);
    });
    this.physics.add.overlap(this.player.sprite, this.archon.sprite, (_playerSprite, enemySprite) => {
      this.handleArchonContactPlayer(enemySprite);
    });

    this.applyGameplayReadabilitySupport(this.archon.sprite, { fill: 0xd8ddcf, alpha: 0.18, scale: 1.28 });
  }

  createLoreAnchors() {
    BLACK_AQUEDUCT_LORE.anchors.forEach((anchorConfig) => {
      this.loreAnchors.push(this.createLoreAnchor(anchorConfig));
    });
    this.footholdLabel = this.add.text(4380, WORLD.floorY - 224, 'BLACK AQUEDUCT\nCHAMBER 01', {
      fontFamily: 'monospace', fontSize: '18px', color: '#cfd7cc', align: 'center', stroke: '#0c0f10', strokeThickness: 4
    }).setOrigin(0.5).setDepth(-4.74).setAlpha(0.82);
  }

  createLoreAnchor(anchorConfig) {
    if (anchorConfig.wallPlateWidth && anchorConfig.wallPlateHeight) {
      this.add.rectangle(anchorConfig.altarX, anchorConfig.wallPlateY, anchorConfig.wallPlateWidth, anchorConfig.wallPlateHeight, 0x091011, 0.88).setDepth(-13.94);
      if (this.textures.exists(ASSET_KEYS.sector02Chamber01BackgroundWallModule)) {
        this.add.image(anchorConfig.altarX, anchorConfig.wallPlateY, ASSET_KEYS.sector02Chamber01BackgroundWallModule)
          .setDisplaySize(anchorConfig.wallPlateWidth + 24, anchorConfig.wallPlateHeight + 18)
          .setTint(0x7f8b87)
          .setAlpha(0.2)
          .setDepth(-13.84);
      }
    }

    if (anchorConfig.muralX && anchorConfig.muralY) {
      this.add.rectangle(anchorConfig.muralX, WORLD.floorY - 94, anchorConfig.muralBackingWidth - 30, 188, 0x1b2425, 0.96).setDepth(-13.88);
      this.add.rectangle(anchorConfig.muralX, anchorConfig.muralY, anchorConfig.muralWidth + 22, anchorConfig.muralHeight + 18, 0x182120, 0.94).setDepth(-13.7);
      if (this.textures.exists(ASSET_KEYS.sector02Chamber01LoreImage)) {
        this.add.image(anchorConfig.muralX, anchorConfig.muralY, ASSET_KEYS.sector02Chamber01LoreImage)
          .setDisplaySize(anchorConfig.muralWidth, anchorConfig.muralHeight)
          .setTint(0xd8e0d0)
          .setAlpha(0.98)
          .setDepth(-13.65);
      } else {
        this.add.text(anchorConfig.muralX, anchorConfig.muralY, 'BLACK AQUEDUCT\nLORE IMAGE FALLBACK', {
          fontFamily: 'monospace', fontSize: '22px', color: '#d5dacd', align: 'center'
        }).setOrigin(0.5).setDepth(-13.64);
      }
    }

    this.add.rectangle(anchorConfig.altarX, anchorConfig.supportTopY, anchorConfig.supportWidth, anchorConfig.supportHeight, 0x111718, 0.94).setDepth(-6.22);
    this.add.rectangle(anchorConfig.altarX, WORLD.floorY - 12, anchorConfig.supportWidth + 84, 18, 0x090b0c, 0.82).setDepth(-6.14);
    this.add.ellipse(anchorConfig.altarX, WORLD.floorY - 18, anchorConfig.shadowWidth, 28, 0x263130, 0.18).setDepth(-6.12);
    this.add.ellipse(anchorConfig.altarX, WORLD.floorY + 10, anchorConfig.shadowWidth + 168, 38, 0x020404, 0.34).setDepth(-6.04);

    if (this.textures.exists(ASSET_KEYS.sector02Chamber01LoreAltar)) {
      this.add.image(anchorConfig.altarX, anchorConfig.altarY, ASSET_KEYS.sector02Chamber01LoreAltar)
        .setDisplaySize(anchorConfig.altarDisplayWidth, anchorConfig.altarDisplayHeight)
        .setTint(0xc1ccbd)
        .setAlpha(0.84)
        .setDepth(-6.08);
    } else {
      this.add.ellipse(anchorConfig.altarX, anchorConfig.altarY + 6, 128, 132, 0x66706b, 0.76).setDepth(-6.08);
    }

    const zone = this.add.zone(anchorConfig.zoneX, anchorConfig.zoneY, anchorConfig.zoneWidth, anchorConfig.zoneHeight).setOrigin(0.5);
    this.physics.add.existing(zone, true);

    const prompt = this.add.text(anchorConfig.zoneX, anchorConfig.zoneY + anchorConfig.promptOffsetY, anchorConfig.label, {
      fontFamily: 'monospace', fontSize: '14px', color: '#cfdbc9', align: 'center', stroke: '#0d1010', strokeThickness: 4
    }).setOrigin(0.5).setDepth(-4.6).setAlpha(0.9).setVisible(false);

    return { ...anchorConfig, zone, prompt };
  }

  createForwardThreshold() {
    this.forwardBarrier = this.add.rectangle(
      BLACK_AQUEDUCT_CLIMAX_GATE.barrierX,
      BLACK_AQUEDUCT_CLIMAX_GATE.barrierY,
      BLACK_AQUEDUCT_CLIMAX_GATE.barrierWidth,
      BLACK_AQUEDUCT_CLIMAX_GATE.barrierHeight,
      0x0b0f10,
      0.38
    ).setDepth(-4.86);
    this.physics.add.existing(this.forwardBarrier, true);
    this.physics.add.collider(this.player.sprite, this.forwardBarrier);

    this.forwardThresholdZone = this.add.zone(
      BLACK_AQUEDUCT_CLIMAX_GATE.thresholdX,
      BLACK_AQUEDUCT_CLIMAX_GATE.thresholdY,
      BLACK_AQUEDUCT_CLIMAX_GATE.thresholdWidth,
      BLACK_AQUEDUCT_CLIMAX_GATE.thresholdHeight
    ).setOrigin(0.5);
    this.physics.add.existing(this.forwardThresholdZone, true);

    this.forwardPrompt = this.add.text(
      BLACK_AQUEDUCT_CLIMAX_GATE.thresholdX,
      BLACK_AQUEDUCT_CLIMAX_GATE.thresholdY + BLACK_AQUEDUCT_CLIMAX_GATE.promptOffsetY,
      'CLIMAX LOCKED',
      { fontFamily: 'monospace', fontSize: '14px', color: '#d7ddd2', align: 'center', stroke: '#0c0f10', strokeThickness: 4 }
    ).setOrigin(0.5).setDepth(-4.58).setAlpha(0.92).setVisible(false);
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
    });
  }

  configureCameraAndLayout() {
    this.cameras.main.startFollow(this.player.sprite, true, BLACK_AQUEDUCT_BOOTSTRAP.cameraLerp.x, BLACK_AQUEDUCT_BOOTSTRAP.cameraLerp.y, BLACK_AQUEDUCT_BOOTSTRAP.desktopFollowOffsetX, 0);
    this.scale.on('resize', this.applyResponsiveLayout, this);
    this.applyResponsiveLayout();
    this.mobileControls.setMode('gameplay');
    this.hud.update(this.player.health, PLAYER.maxHealth);
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
      this.archon?.body?.setVelocity?.(0, 0);

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
      this.archon?.body?.setVelocity?.(0, 0);
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
    this.updateArchonState(time);
    this.refreshEncounterPocketPresence();
    this.updateEncounterPockets(time);
    this.enemies.forEach((enemy) => enemy.update(time, this.player.sprite.x));
    this.archon?.update(time, this.player.sprite);
    this.refreshArchonBossBar(time);
    this.refreshLoreZonePresence();
    this.tryBeginLoreSequence(mobileInput);
    this.refreshForwardThresholdPresence();
    this.tryAdvanceForwardThreshold(mobileInput);
    this.updateFootholdLabel(time);
    this.hud.update(this.player.health, PLAYER.maxHealth);
  }

  refreshEncounterPocketPresence() {
    this.encounterPockets.forEach((pocket) => {
      let playerInsidePocket = false;
      this.physics.overlap(this.player.sprite, pocket.zone, () => {
        playerInsidePocket = true;
      });
      pocket.promptText.setVisible(playerInsidePocket && !pocket.activated && !pocket.resolved);
    });
  }

  updateEncounterPockets(time) {
    this.encounterPockets.forEach((pocket) => {
      if (pocket.resolved) {
        pocket.promptText.setVisible(false);
        pocket.markerShadow.setAlpha(0.03);
        return;
      }

      let playerInsidePocket = false;
      this.physics.overlap(this.player.sprite, pocket.zone, () => {
        playerInsidePocket = true;
      });

      if (playerInsidePocket && !pocket.activated) {
        pocket.activated = true;
        pocket.promptText.setText(`${pocket.label}\nRITUAL PRESSURE`).setVisible(true);
        pocket.markerShadow.setAlpha(pocket.markerAlpha + 0.06);
        pocket.enemies.forEach((enemy, index) => {
          if (enemy.dead) {
            return;
          }
          enemy.pocketWakeAtTime = time + (enemy.config.wakeDelayMs ?? 0) + index * 70;
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
        pocket.promptText.setText(`${pocket.label}\nCHANNEL CLEARED`).setVisible(playerInsidePocket);
        pocket.markerShadow.setAlpha(0.04);
      }
    });
  }

  refreshLoreZonePresence() {
    this.currentLoreZone = null;

    if (!this.loreAnchors.length || this.isLoreTransitionActive || this.hasCompletedLoreBeat) {
      this.loreAnchors.forEach((anchor) => anchor.prompt?.setVisible(false));
      return;
    }

    this.loreAnchors.forEach((anchor) => {
      let isInside = false;
      this.physics.overlap(this.player.sprite, anchor.zone, () => {
        isInside = true;
        this.currentLoreZone = anchor;
      });
      anchor.prompt?.setVisible(isInside);
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
    if (this.isLoreTransitionActive) {
      return;
    }

    this.isLoreTransitionActive = true;
    this.currentLoreZone = null;
    this.loreAnchors.forEach((anchor) => anchor.prompt?.setVisible(false));
    this.mobileControls.setMode('dialogue');
    this.player.body.setVelocity(0, 0);
    this.enemies.forEach((enemy) => enemy.body?.setVelocity(0, 0));
    this.archon?.body?.setVelocity?.(0, 0);
    this.audioDirector?.stopAmbientLoop();
    this.hud?.setVisible(false);
    this.mobileControls.setMode('init');
    this.uiCamera?.setVisible(false);

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.pause();
      this.scene.launch('LoreCutsceneScene', {
        cutsceneId: BLACK_AQUEDUCT_LORE.cutsceneId,
        returnSceneKey: this.scene.key
      });
    });

    this.cameras.main.fadeOut(420, 0, 0, 0);
  }

  handleLoreCutsceneComplete({ cutsceneId } = {}) {
    if (cutsceneId !== BLACK_AQUEDUCT_LORE.cutsceneId) {
      return;
    }

    this.hasCompletedLoreBeat = true;
    this.resumeFromLore();
  }

  resumeFromLore() {
    this.isLoreTransitionActive = false;
    this.mobileControls.setMode('gameplay');
    this.hud?.setVisible(true);
    this.uiCamera?.setVisible(true);
    this.audioDirector?.playAmbientLoop(ASSET_KEYS.ambientChamber02Loop01, { volume: 0.1 });
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  handlePlayerHitArchon(enemySprite) {
    if (!this.player.attackActive || this.archon?.dead || !this.isEnemyOverlapTarget(enemySprite, this.archon)) {
      return;
    }

    if (this.archon.lastAttackHitId === this.player.attackId) {
      return;
    }

    this.archon.lastAttackHitId = this.player.attackId;
    this.archon.takeDamage(1, this.time.now);
    this.archon.setActive(true);
    this.audioDirector?.playPlayerHit();

    if (this.archon.dead && !this.hasUnlockedForwardPath) {
      this.unlockForwardPath();
    }
  }

  handleArchonContactPlayer(enemySprite) {
    if (this.archon?.dead || !this.isEnemyOverlapTarget(enemySprite, this.archon)) {
      return;
    }
    if (!this.archon.canDealContactDamage(this.time.now)) {
      return;
    }

    const tookDamage = this.player.receiveDamage(BLACK_AQUEDUCT_ARCHON_CONFIG.contactDamage, this.time.now);
    if (tookDamage) {
      this.archon.recordContactDamage(this.time.now);
      const knockDirection = Math.sign(this.player.sprite.x - this.archon.sprite.x) || 1;
      this.player.body.setVelocityX(knockDirection * 240);
      this.player.body.setVelocityY(-228);
    }
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

  updateArchonState(time) {
    if (!this.archon || this.archon.dead) {
      return;
    }

    if (!this.archon.active && this.player.sprite.x >= BLACK_AQUEDUCT_ARCHON_CONFIG.activationX) {
      this.archon.setActive(true);
      this.archonWakeLabel?.setText('ABYSSAL ARCHON\nSURFACED').setAlpha(0.96);
    }
  }

  refreshArchonBossBar(time) {
    if (!this.archon) {
      return;
    }

    const visible = !this.archon.dead && (this.archon.active || this.player.sprite.x >= BLACK_AQUEDUCT_ARCHON_CONFIG.activationX - 110);
    this.hud.setBossBarState({
      visible,
      name: BLACK_AQUEDUCT_ARCHON_CONFIG.name,
      subtitle: BLACK_AQUEDUCT_ARCHON_CONFIG.subtitle,
      current: this.archon.health,
      max: this.archon.maxHealth,
      telegraph: this.archon.getTelegraphProgress(time),
      wounded: time < this.archon.hurtUntil
    });

    if (this.archon.dead) {
      this.hud.setBossBarState({ visible: false });
    }
  }

  unlockForwardPath() {
    this.hasUnlockedForwardPath = true;
    this.forwardBarrier?.setAlpha(0.08);
    this.forwardBarrier?.setFillStyle(0x8ca284, 0.08);
    if (this.forwardBarrier?.body) {
      this.forwardBarrier.body.enable = false;
      this.forwardBarrier.body.updateFromGameObject?.();
    }
    this.forwardPrompt?.setText('PATH FORWARD STABILIZED\nENTER THE PROCESSION THRESHOLD');
    this.processionalLabel?.setText('BLACK AQUEDUCT\nTHRESHOLD UNSEALED');
    this.archonWakeLabel?.setText('ABYSSAL ARCHON\nNULLIFIED').setAlpha(0.84);
  }

  refreshForwardThresholdPresence() {
    this.currentForwardThreshold = null;
    if (!this.forwardThresholdZone) {
      return;
    }

    this.physics.overlap(this.player.sprite, this.forwardThresholdZone, () => {
      this.currentForwardThreshold = this.forwardThresholdZone;
    });

    const promptVisible = Boolean(this.currentForwardThreshold) || (this.hasUnlockedForwardPath && !this.hasTriggeredForwardContract);
    const promptText = this.hasUnlockedForwardPath
      ? this.hasTriggeredForwardContract
        ? 'FORWARD CONTRACT MARKED\nSECTOR 2 CHAMBER 2 NOT IN THIS PASS'
        : 'PATH FORWARD STABILIZED\nPRESS RITE / [E] TO MARK DESCENT'
      : 'CLIMAX LOCKED';
    this.forwardPrompt?.setVisible(promptVisible).setText(promptText);
  }

  tryAdvanceForwardThreshold(mobileInput) {
    if (!this.hasUnlockedForwardPath || !this.currentForwardThreshold) {
      return;
    }

    const interactPressed = Phaser.Input.Keyboard.JustDown(this.keyInteract) || Phaser.Input.Keyboard.JustDown(this.keyEnter) || mobileInput.interactPressed;
    if (!interactPressed) {
      return;
    }

    this.hasTriggeredForwardContract = true;
    this.forwardPrompt?.setVisible(true).setText('FORWARD CONTRACT MARKED\nSECTOR 2 CHAMBER 2 PENDING');
    this.processionalLabel?.setText('DESCENT MARKED\nFURTHER CHAMBER PENDING');
  }

  updateFootholdLabel(time) {
    const completionBoost = this.hasCompletedLoreBeat ? 0.12 : 0;
    this.footholdLabel?.setAlpha(0.68 + (Math.sin(time / 500) + 1) * 0.04 + completionBoost);
    this.processionalLabel?.setAlpha(0.72 + (Math.sin(time / 620) + 1) * 0.035 + completionBoost * 0.65);
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
    this.scene.start('Sector02Chamber01Scene', { devWarp: true, source: this.scene.key });
  }

  cleanupSceneUi() {
    this.hud?.setBossBarState({ visible: false });
    this.hud?.setVisible(true);
    this.uiCamera?.setVisible(true);
  }

  setupMobileUiCamera() {
    if (!this.mobileControls.enabled) {
      return;
    }

    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'Sector02Chamber01MobileUiCamera');
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
      const worldBandMax = Math.max(PORTRAIT_LAYOUT.worldBandMin, Math.min(PORTRAIT_LAYOUT.worldBandMax, maxWorldBandFromControlNeeds));
      const worldBandHeight = Phaser.Math.Clamp(Math.floor(height * PORTRAIT_LAYOUT.worldBandRatio), PORTRAIT_LAYOUT.worldBandMin, worldBandMax);

      camera.setViewport(0, 0, width, worldBandHeight);
      camera.setZoom(PORTRAIT_LAYOUT.portraitZoom);
      camera.setFollowOffset(BLACK_AQUEDUCT_BOOTSTRAP.portraitFollowOffsetX, PORTRAIT_LAYOUT.portraitFollowOffsetY);
      this.mobileControls.setReservedBottomPx(height - worldBandHeight);
      this.restartText.setPosition(width / 2, Math.max(PORTRAIT_LAYOUT.restartTextMinY, worldBandHeight * PORTRAIT_LAYOUT.restartTextRatioY));
      return;
    }

    camera.setViewport(0, 0, width, height);
    camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
    camera.setFollowOffset(BLACK_AQUEDUCT_BOOTSTRAP.desktopFollowOffsetX, PORTRAIT_LAYOUT.desktopFollowOffsetY);
    this.mobileControls.setReservedBottomPx(0);
    this.restartText.setPosition(width / 2, 90);
  }

  applyGameplayReadabilitySupport(target, { fill = 0xd2c2ac, alpha = 0.16, scale = 1.08 } = {}) {
    if (!target) {
      return null;
    }

    const shadow = this.add.ellipse(target.x, WORLD.floorY + 6, 104 * scale, 22 * scale, 0x050404, alpha * 1.05).setDepth(target.depth - 0.6);
    const halo = this.add.ellipse(target.x, target.y - 6, 84 * scale, 118 * scale, fill, alpha).setDepth(target.depth - 0.4);

    this.events.on(Phaser.Scenes.Events.UPDATE, () => {
      if (!target.active) {
        halo.setVisible(false);
        shadow.setVisible(false);
        return;
      }

      halo.setVisible(target.visible).setPosition(target.x, target.y - 8).setAlpha(target.visible ? alpha : 0);
      shadow.setVisible(target.visible).setPosition(target.x, WORLD.floorY + 6).setAlpha(target.visible ? alpha * 1.05 : 0);
    });

    return { halo, shadow };
  }
}
