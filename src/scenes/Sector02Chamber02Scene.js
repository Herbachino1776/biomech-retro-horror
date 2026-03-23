import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { SkitterServitor } from '../entities/SkitterServitor.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import { AudioDirector } from '../audio/AudioDirector.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { PLAYER, SKITTER, WORLD } from '../data/milestone1Config.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';
import { restartRunFromDeath } from '../systems/RunReset.js';

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
  lowerBandAlpha: 0.24,
  pressureBandY: WORLD.floorY - 128,
  pressureBandHeight: 170
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
  { x: 1020, ribWidth: 28, ribHeight: 314, archWidth: 240, archHeight: 146, alpha: 0.18, depth: -11.74 },
  { x: 2560, ribWidth: 32, ribHeight: 348, archWidth: 280, archHeight: 170, alpha: 0.22, depth: -11.82 },
  { x: 4050, ribWidth: 30, ribHeight: 330, archWidth: 250, archHeight: 150, alpha: 0.2, depth: -11.78 },
  { x: 5160, ribWidth: 34, ribHeight: 366, archWidth: 304, archHeight: 182, alpha: 0.24, depth: -11.88 }
];

const COMPRESSION_VAULTS_SKITTER_BASIC_01 = {
  ...SKITTER,
  textureKey: ASSET_KEYS.sector02Chamber02EnemyBasic01,
  speed: 50,
  aggroRange: 244,
  patrolDistance: 100,
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
  speed: 54,
  patrolDistance: 118,
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
  speed: 42,
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
  patrolDistance: 80,
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
  audioProfile: 'tollkeeper'
};

const COMPRESSION_VAULTS_ENCOUNTER_POCKETS = [
  {
    id: 'compression-vaults-entry-seal',
    label: 'ENTRY LOCK',
    zoneX: 1260,
    zoneY: WORLD.floorY - 72,
    zoneWidth: 560,
    zoneHeight: 226,
    markerWidth: 336,
    markerHeight: 74,
    markerAlpha: 0.08,
    promptOffsetY: -136,
    enemies: [
      { type: 'basic01', x: 1180, y: PLAYER.startY, patrolDistance: 84, wakeDelayMs: 0 },
      { type: 'basic02', x: 1425, y: PLAYER.startY, patrolDistance: 110, wakeDelayMs: 120 }
    ]
  },
  {
    id: 'compression-vaults-mid-pressure',
    label: 'COMPRESSION BAY',
    zoneX: 2860,
    zoneY: WORLD.floorY - 72,
    zoneWidth: 760,
    zoneHeight: 236,
    markerWidth: 412,
    markerHeight: 80,
    markerAlpha: 0.1,
    promptOffsetY: -142,
    enemies: [
      { type: 'basic01', x: 2510, y: PLAYER.startY, patrolDistance: 108, wakeDelayMs: 0 },
      { type: 'basic02', x: 2790, y: PLAYER.startY, patrolDistance: 120, wakeDelayMs: 120 },
      { type: 'basic02', x: 3070, y: PLAYER.startY, patrolDistance: 126, wakeDelayMs: 240 }
    ]
  },
  {
    id: 'compression-vaults-threshold-seal',
    label: 'THRESHOLD PRESSURE',
    zoneX: 4540,
    zoneY: WORLD.floorY - 74,
    zoneWidth: 920,
    zoneHeight: 242,
    markerWidth: 468,
    markerHeight: 84,
    markerAlpha: 0.12,
    promptOffsetY: -148,
    enemies: [
      { type: 'basic01', x: 4210, y: PLAYER.startY, patrolDistance: 104, wakeDelayMs: 0 },
      { type: 'elite', x: 4550, y: PLAYER.startY, patrolDistance: 82, wakeDelayMs: 180 },
      { type: 'basic02', x: 4890, y: PLAYER.startY, patrolDistance: 126, wakeDelayMs: 320 }
    ]
  }
];

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

export class Sector02Chamber02Scene extends Phaser.Scene {
  constructor() {
    super(COMPRESSION_VAULTS_BOOTSTRAP.sceneKey);
  }

  init(data) {
    this.transitionContext = data ?? {};
    this.isRestartingRun = false;
    this.hasUnlockedForwardPath = false;
    this.hasTriggeredForwardContract = false;
    this.currentForwardThreshold = null;
    this.enemies = [];
    this.encounterPockets = [];
  }

  create() {
    this.createWorldBounds();
    this.createAudio();
    this.createBackdrop();
    this.createPlayerAndColliders();
    this.createEncounterPockets();
    this.createUiAndInput();
    this.createForwardThreshold();
    this.configureCameraAndLayout();
    this.cameras.main.fadeIn(650, 0, 0, 0);
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
    this.renderGateThreshold();
    this.renderLoreAssetPlacementHints();
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

    [860, 1680, 2420, 3250, 3980, 4710].forEach((x, index) => {
      this.add.rectangle(x, WORLD.floorY - 188, 18, 144, 0x1b2324, 0.18 + index * 0.01).setDepth(-11.18);
      this.add.rectangle(x, WORLD.floorY - 96, 132, 14, 0x2e3938, 0.12).setDepth(-11.12);
    });
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

    this.processionalLabel = this.add.text(gateX - 18, WORLD.floorY - 274, 'COMPRESSION VAULTS\nCRUCIBLE GATE', {
      fontFamily: 'monospace', fontSize: '17px', color: '#d2d8cd', align: 'center', stroke: '#0c0f10', strokeThickness: 4
    }).setOrigin(0.5).setDepth(-4.74).setAlpha(0.82);
  }

  renderLoreAssetPlacementHints() {
    const muralX = 2940;
    const muralY = 214;
    this.add.rectangle(muralX, muralY, 520, 310, 0x141a1b, 0.2).setDepth(-13.74);

    if (this.textures.exists(ASSET_KEYS.sector02Chamber02LoreImage)) {
      this.add.image(muralX, muralY, ASSET_KEYS.sector02Chamber02LoreImage)
        .setDisplaySize(448, 272)
        .setTint(0xd8dfd0)
        .setAlpha(0.34)
        .setDepth(-13.68);
    }

    this.add.text(muralX, WORLD.floorY - 252, 'COMPRESSION RECORD', {
      fontFamily: 'monospace', fontSize: '16px', color: '#c6d0c2', align: 'center', stroke: '#0b0d0d', strokeThickness: 4
    }).setOrigin(0.5).setDepth(-4.86).setAlpha(0.72);
  }

  createPlayerAndColliders() {
    this.player = new Player(this, COMPRESSION_VAULTS_BOOTSTRAP.spawnX, COMPRESSION_VAULTS_BOOTSTRAP.spawnY, PLAYER);
    this.applyGameplayReadabilitySupport(this.player.sprite, { fill: 0xc2c9bf, alpha: 0.16, scale: 1.08 });
    this.physics.add.collider(this.player.sprite, this.platforms);
  }

  createEncounterPockets() {
    this.encounterPockets = COMPRESSION_VAULTS_ENCOUNTER_POCKETS.map((pocketConfig) => this.createEncounterPocket(pocketConfig));
    this.footholdLabel = this.add.text(4300, WORLD.floorY - 224, 'SECTOR 02\nCHAMBER 02', {
      fontFamily: 'monospace', fontSize: '18px', color: '#cfd7cc', align: 'center', stroke: '#0c0f10', strokeThickness: 4
    }).setOrigin(0.5).setDepth(-4.74).setAlpha(0.82);
  }

  createEncounterPocket(pocketConfig) {
    const zone = this.add.zone(pocketConfig.zoneX, pocketConfig.zoneY, pocketConfig.zoneWidth, pocketConfig.zoneHeight).setOrigin(0.5);
    this.physics.add.existing(zone, true);

    const markerShadow = this.add.ellipse(pocketConfig.zoneX, WORLD.floorY - 4, pocketConfig.markerWidth, pocketConfig.markerHeight, 0x020304, pocketConfig.markerAlpha).setDepth(-5.84);
    const promptText = this.add.text(pocketConfig.zoneX, pocketConfig.zoneY + pocketConfig.promptOffsetY, pocketConfig.label, {
      fontFamily: 'monospace', fontSize: '13px', color: '#d3cbc0', align: 'center', stroke: '#111515', strokeThickness: 4
    }).setOrigin(0.5).setDepth(-4.82).setAlpha(0.82).setVisible(false);

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

    this.forwardPrompt = this.add.text(
      COMPRESSION_VAULTS_FORWARD_GATE.thresholdX,
      COMPRESSION_VAULTS_FORWARD_GATE.thresholdY + COMPRESSION_VAULTS_FORWARD_GATE.promptOffsetY,
      'CRUCIBLE GATE SEALED',
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
    });
  }

  configureCameraAndLayout() {
    this.cameras.main.startFollow(this.player.sprite, true, COMPRESSION_VAULTS_BOOTSTRAP.cameraLerp.x, COMPRESSION_VAULTS_BOOTSTRAP.cameraLerp.y, COMPRESSION_VAULTS_BOOTSTRAP.desktopFollowOffsetX, 0);
    this.scale.on('resize', this.applyResponsiveLayout, this);
    this.applyResponsiveLayout();
    this.mobileControls.setMode('gameplay');
    this.hud.update(this.player.health, PLAYER.maxHealth);
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
    this.refreshForwardThresholdPresence();
    this.tryAdvanceForwardThreshold(mobileInput);
    this.updateLabels(time);
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
        pocket.promptText.setText(`${pocket.label}\nPRESSURE RISING`).setVisible(true);
        pocket.markerShadow.setAlpha(pocket.markerAlpha + 0.06);
        pocket.enemies.forEach((enemy, index) => {
          if (enemy.dead) {
            return;
          }
          enemy.pocketWakeAtTime = time + (enemy.config.wakeDelayMs ?? 0) + index * 80;
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
        pocket.promptText.setText(`${pocket.label}\nSEAL RELIEVED`).setVisible(playerInsidePocket);
        pocket.markerShadow.setAlpha(0.04);
      }
    });

    if (!this.hasUnlockedForwardPath && this.encounterPockets.length > 0 && this.encounterPockets.every((pocket) => pocket.resolved)) {
      this.unlockForwardPath();
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

  unlockForwardPath() {
    this.hasUnlockedForwardPath = true;
    this.forwardBarrier?.setAlpha(0.08);
    this.forwardBarrier?.setFillStyle(0x8ca284, 0.08);
    if (this.forwardBarrier?.body) {
      this.forwardBarrier.body.enable = false;
      this.forwardBarrier.body.updateFromGameObject?.();
    }
    this.forwardPrompt?.setText('CRUCIBLE GATE UNSEALED\nPRESS RITE / [E] TO MARK DESCENT');
    this.processionalLabel?.setText('COMPRESSION VAULTS\nPRESSURE RELIEVED');
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
        ? 'DESCENT MARKED\nSECTOR 2 CHAMBER 3 PENDING'
        : 'CRUCIBLE GATE UNSEALED\nPRESS RITE / [E] TO MARK DESCENT'
      : 'CRUCIBLE GATE SEALED';
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
    this.forwardPrompt?.setVisible(true).setText('DESCENT MARKED\nSECTOR 2 CHAMBER 3 PENDING');
    this.processionalLabel?.setText('COMPRESSION VAULTS\nCRUCIBLE OF RETURN NEXT');
  }

  updateLabels(time) {
    const completionBoost = this.hasUnlockedForwardPath ? 0.12 : 0;
    this.footholdLabel?.setAlpha(0.68 + (Math.sin(time / 520) + 1) * 0.04 + completionBoost);
    this.processionalLabel?.setAlpha(0.72 + (Math.sin(time / 640) + 1) * 0.035 + completionBoost * 0.65);
  }

  createInvisiblePlatform(x, y, width, height) {
    const platform = this.add.rectangle(x, y, width, height, 0x000000, 0).setOrigin(0.5);
    platform.setVisible(false);
    this.physics.add.existing(platform, true);
    this.platforms.add(platform);
    return platform;
  }

  handleDevWarp() {
    this.cleanupSceneUi?.();
    this.audioDirector?.shutdown();
    this.scene.start('Sector02Chamber02Scene', { devWarp: true, source: this.scene.key });
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
