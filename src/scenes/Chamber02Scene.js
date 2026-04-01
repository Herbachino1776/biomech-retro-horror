import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { SkitterServitor } from '../entities/SkitterServitor.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { COLORS, PLAYER, SKITTER, WORLD } from '../data/milestone1Config.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';
import { createDirectionalCameraBias } from '../systems/DirectionalCameraBias.js';
import { restartRunFromDeath } from '../systems/RunReset.js';
import { AudioDirector } from '../audio/AudioDirector.js';
import { applyChamberEntryRestore } from '../systems/VesselRunEconomy.js';
import { bossPitRunState } from '../systems/BossPitRunState.js';

const CHAMBER02_WORLD_WIDTH = 4300;

const CHAMBER02_EXIT_CORRIDOR = {
  startX: 3560,
  width: 620,
  floorY: 424,
  floorHeight: 96,
  thresholdX: 4160,
  thresholdY: 374,
  thresholdWidth: 108,
  thresholdHeight: 212,
  cameraHintX: 3910
};

const CHAMBER02_PLATFORMS = [];

const CHAMBER02_TOLL_KEEPER_CONFIG = {
  ...SKITTER,
  textureKey: ASSET_KEYS.chamber02TollKeeperSkitter,
  variantName: 'TOLL-KEEPER',
  health: 7,
  speed: 46,
  attackCooldownMs: 3000,
  windupMs: 820,
  attackActiveMs: 320,
  attackRecoveryMs: 620,
  hesitationMs: 560,
  attackTriggerRange: 158,
  attackRange: 192,
  preferredRange: 136,
  rangeBand: 20,
  lungeSpeedBonus: 104,
  lungeJumpVelocity: -92,
  recoilVelocityX: 144,
  recoilVelocityY: -84,
  patrolDistance: 72,
  awakenPlayerX: 2820,
  wakeDelayMs: 0,
  body: { width: 74, height: 44, offsetX: 32, offsetY: 94 },
  presentation: {
    alpha: 1,
    display: { width: 284, height: 218 },
    origin: { x: 0.52, y: 0.965 },
    stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.46 }
  },
  eyeGlowColor: 0xe9ffb4,
  eyeGlowWidth: 44,
  eyeGlowHeight: 22,
  eyeGlowOffsetX: 24,
  eyeGlowYOffset: 18,
  eyeGlowAlphaBase: 0.42,
  eyeGlowWindupAlphaGain: 0.46,
  audioProfile: 'tollkeeper'
};

const CHAMBER02_ENCOUNTER_POCKETS = [
  {
    id: 'ossuary-procession-pocket-01',
    zoneX: 1000,
    zoneY: WORLD.floorY - 76,
    zoneWidth: 520,
    zoneHeight: 236,
    spawns: [
      { type: 'basic', x: 840, awakenPlayerX: 620, patrolDistance: 86, wakeDelayMs: 0 },
      { type: 'basic', x: 1020, awakenPlayerX: 760, patrolDistance: 108, wakeDelayMs: 80 },
      { type: 'basic', x: 1180, awakenPlayerX: 880, patrolDistance: 92, wakeDelayMs: 140 }
    ]
  },
  {
    id: 'ossuary-procession-pocket-02',
    zoneX: 1910,
    zoneY: WORLD.floorY - 76,
    zoneWidth: 640,
    zoneHeight: 240,
    spawns: [
      { type: 'basic', x: 1670, awakenPlayerX: 1420, patrolDistance: 126, wakeDelayMs: 0 },
      { type: 'basic', x: 1880, awakenPlayerX: 1540, patrolDistance: 104, wakeDelayMs: 110 },
      { type: 'basic', x: 2090, awakenPlayerX: 1660, patrolDistance: 110, wakeDelayMs: 170 }
    ]
  },
  {
    id: 'horn-vault-reveal-domain',
    zoneX: 2880,
    zoneY: WORLD.floorY - 82,
    zoneWidth: 840,
    zoneHeight: 248,
    spawns: [
      { type: 'basic', x: 2540, awakenPlayerX: 2240, patrolDistance: 116, wakeDelayMs: 0 },
      { type: 'tollKeeper', x: 2880, awakenPlayerX: 2480, patrolDistance: 84, wakeDelayMs: 100 },
      { type: 'basic', x: 3170, awakenPlayerX: 2600, patrolDistance: 108, wakeDelayMs: 150 },
      { type: 'tollKeeper', x: 3340, awakenPlayerX: 2730, patrolDistance: 92, wakeDelayMs: 220 }
    ]
  }
];


const CHAMBER02_BOSS_PIT_ALTAR = {
  x: 620,
  y: 402,
  width: 198,
  height: 198,
  zoneWidth: 196,
  zoneHeight: 216,
  promptOffsetY: -168
};

const CHAMBER02_SEGMENTS = [
  { type: 'opening', x: 420, width: 780, tint: 0xc1b199, alpha: 0.72 },
  { type: 'corridor', x: 1180, width: 700, tint: 0xb3a48f, alpha: 0.58 },
  { type: 'corridor', x: 1960, width: 760, tint: 0xa59682, alpha: 0.54 },
  { type: 'reveal', x: 2900, width: 980, tint: 0xcab79f, alpha: 0.8 },
  { type: 'threshold', x: 3820, width: 760, tint: 0xcfbca4, alpha: 0.72 }
];

const EXIT_GATE_UNLOCK_AUDIO_DELAY_MS = 2000;

const CHAMBER02_EXIT_GATE = {
  x: 3480,
  y: 272,
  displayWidth: 404,
  displayHeight: 444,
  barrierWidth: 86,
  barrierHeight: 252,
  zoneOffsetX: -96,
  zoneY: 402,
  zoneWidth: 164,
  zoneHeight: 172,
  interactPromptOffsetY: -128,
  lockedTint: 0x927f66,
  lockedAlpha: 0.76,
  unlockedTint: 0xd7c5ac,
  unlockedAlpha: 0.96
};

export class Chamber02Scene extends Phaser.Scene {
  constructor() {
    super('Chamber02Scene');
  }

  init(data) {
    this.transitionContext = data ?? {};
    this.hasCompletedBossPitLoop = Boolean(this.transitionContext?.returnFromBossPit) || bossPitRunState.hasChamber02BossPitCompleted();
  }

  create() {
    console.info('[Chamber02Scene] create start', this.transitionContext);
    let startupStep = 'init-world';
    try {
      this.physics.world.gravity.y = WORLD.gravityY;
      this.cameras.main.setBounds(0, 0, CHAMBER02_WORLD_WIDTH, WORLD.height);
      this.physics.world.setBounds(0, 0, CHAMBER02_WORLD_WIDTH, WORLD.height);

      this.cameras.main.setBackgroundColor('#070707');

      this.platforms = this.physics.add.staticGroup();
      this.currentBossPitAltar = null;
      this.currentExitGateZone = null;
      this.currentExitThresholdZone = null;
      this.isExitGateTransitionActive = false;
      this.isHandingOffToChamber03 = false;
      this.isRestartingRun = false;
      this.exitGateUnlockAudioTimer = null;
      this.exitGatePromptText = null;
      this.bossPitPromptText = null;
      this.chamber03StartHasRun = false;
      this.bossPitTransitionActive = false;
      this.isSceneEntryReadyForTransitions = false;
      this.sceneEntryFadeInActive = false;

      this.sceneEntryFadeInActive = true;
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
        this.sceneEntryFadeInActive = false;
        this.isSceneEntryReadyForTransitions = true;
      });
      this.cameras.main.fadeIn(700, 0, 0, 0);

      startupStep = 'render-backdrop';
      this.renderProcessionalBackdrop();
      startupStep = 'create-platforms';
      this.createPlatforms();
      startupStep = 'create-boss-pit-altar';
      this.createBossPitAltar();

      startupStep = 'audio';
      this.audioDirector = new AudioDirector(this);
      this.audioDirector.playAmbientLoop(ASSET_KEYS.ambientChamber02Loop01);

      startupStep = 'create-player';
      const spawnX = this.transitionContext?.returnFromBossPit ? this.transitionContext.returnPlayerX ?? 1110 : 150;
      const spawnY = this.transitionContext?.returnFromBossPit ? this.transitionContext.returnPlayerY ?? PLAYER.startY : 360;
      this.player = new Player(this, spawnX, spawnY, PLAYER);
      const entryIntegrity = applyChamberEntryRestore(this.transitionContext);
      this.player.health = entryIntegrity.current;
      this.player.maxHealth = entryIntegrity.max;
      this.applyGameplayReadabilitySupport(this.player.sprite, { fill: 0xd8cfbb, alpha: 0.18, scale: 1.1 });
      this.physics.add.collider(this.player.sprite, this.platforms);

      startupStep = 'create-enemies';
      this.enemies = [];
      this.tollKeepers = [];
      this.createEnemyEncounter();

      startupStep = 'create-ui';
      this.hud = new HudOverlay(this);
      this.mobileControls = new MobileControls(this);
      this.setupMobileUiCamera();

      this.restartText = this.add
        .text(this.scale.width / 2, 90, '', {
          fontFamily: 'monospace',
          fontSize: '22px',
          color: '#d2c2ac',
          align: 'center'
        })
        .setScrollFactor(0)
        .setDepth(35)
        .setOrigin(0.5)
        .setVisible(false);
      this.uiCamera?.ignore(this.restartText);

      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyAttack = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
      this.keyInteract = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      this.keyRestart = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

      startupStep = 'camera-layout';
      this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08, -140, 0);

      this.directionalCameraBias = createDirectionalCameraBias({
        camera: this.cameras.main,
        player: this.player,
        desktopBaseOffsetX: -140,
        portraitBaseOffsetX: -120,
        desktopLookAheadX: 56,
        portraitLookAheadX: 24
      });
      this.scale.on('resize', this.applyResponsiveLayout, this);
      this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.scale.off('resize', this.applyResponsiveLayout, this);
        this.exitGateUnlockAudioTimer?.remove(false);
        this.exitGateUnlockAudioTimer = null;
        console.log('[Chamber02Scene] shutdown event fired');
        this.audioDirector?.shutdown();
        this.cleanupSceneUi();
      });

      this.applyResponsiveLayout();
      this.directionalCameraBias?.update();
      this.hud.update(this.player.health, this.player.maxHealth);
      if (this.transitionContext?.returnFromBossPit) {
        this.hasCompletedBossPitLoop = true;
        bossPitRunState.markChamber02BossPitCompleted();
      }
      console.info('[Chamber02Scene] create complete');
    } catch (error) {
      console.error(`[Chamber02Scene] create failed during ${startupStep}`, error);
      this.cameras.main?.setBackgroundColor('#210707');
      this.add.text(this.scale.width / 2, this.scale.height / 2, 'CHAMBER 02 BOOT FAILURE\nSee console logs', {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffb9b9',
        align: 'center'
      })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(100);
      throw error;
    }
  }

  renderProcessionalBackdrop() {
    this.add
      .rectangle(CHAMBER02_WORLD_WIDTH / 2, WORLD.height / 2, CHAMBER02_WORLD_WIDTH, WORLD.height, COLORS.backdrop, 1)
      .setOrigin(0.5)
      .setDepth(-14);

    CHAMBER02_SEGMENTS.forEach((segment, index) => {
      const segmentX = segment.x;
      const parityTint = index % 2 === 0 ? segment.tint : Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(segment.tint),
        Phaser.Display.Color.ValueToColor(0x9d8f7b),
        100,
        34
      ).color;
      if (this.textures.exists(ASSET_KEYS.chamber02BackgroundPlate)) {
        this.add
          .image(segmentX, 220, ASSET_KEYS.chamber02BackgroundPlate)
          .setDisplaySize(segment.width + 36, segment.type === 'reveal' ? 416 : 388)
          .setTint(parityTint)
          .setAlpha(segment.alpha)
          .setDepth(-13.2 + index * 0.03);
      } else {
        this.add
          .rectangle(segmentX, 220, segment.width + 36, segment.type === 'reveal' ? 416 : 388, COLORS.architecture, segment.alpha * 0.76)
          .setStrokeStyle(2, COLORS.rust, 0.25)
          .setDepth(-13.2 + index * 0.03);
      }

      if (this.textures.exists(ASSET_KEYS.chamber02ForegroundHornArch) && segment.type !== 'opening') {
        this.add
          .image(segmentX + (segment.type === 'reveal' ? 46 : 22), 272, ASSET_KEYS.chamber02ForegroundHornArch)
          .setDisplaySize(segment.type === 'reveal' ? 270 : 214, segment.type === 'reveal' ? 280 : 220)
          .setTint(0xb39f89)
          .setAlpha(segment.type === 'reveal' ? 0.22 : 0.16)
          .setDepth(-11.2);
      }
      this.add.ellipse(segmentX, WORLD.floorY - 24, segment.width * 0.78, 56, 0x070605, 0.14 + index * 0.01).setDepth(-9.95);
    });

    const floorStripHeight = 116;
    if (this.textures.exists(ASSET_KEYS.chamber02FloorStrip)) {
      this.add
        .tileSprite(CHAMBER02_WORLD_WIDTH / 2, WORLD.floorY + 4, CHAMBER02_WORLD_WIDTH, floorStripHeight, ASSET_KEYS.chamber02FloorStrip)
        .setTint(0xd8cab4)
        .setAlpha(0.78)
        .setDepth(-10);
    }

    this.sanctumAura = this.add
      .ellipse(CHAMBER02_BOSS_PIT_ALTAR.x, 404, 500, 96, COLORS.sickly, 0.12)
      .setDepth(-9);

    this.ambientVeil = this.add.ellipse(CHAMBER02_BOSS_PIT_ALTAR.x, 286, 660, 340, COLORS.sickly, 0.03).setDepth(-7.5).setScale(1, 1);
  }

  createPlatforms() {
    this.createInvisiblePlatform(CHAMBER02_WORLD_WIDTH / 2, WORLD.floorY + 28, CHAMBER02_WORLD_WIDTH, 72);

    CHAMBER02_PLATFORMS.forEach((platform) => {
      this.createInvisiblePlatform(platform.x, platform.y, platform.width, platform.height);
    });

    if (this.textures.exists(ASSET_KEYS.chamber02VertebralHornGate)) {
      this.hornGateMonument = this.add
        .image(1970, 274, ASSET_KEYS.chamber02VertebralHornGate)
        .setDisplaySize(420, 452)
        .setCrop(194, 166, 640, 1140)
        .setTint(0xd4c5af)
        .setAlpha(0.82)
        .setDepth(-6);
    }

    this.createExitGate();
    this.createExitCorridor();
  }


  createInvisiblePlatform(x, y, width, height) {
    const platform = this.add.rectangle(x, y, width, height, 0x000000, 0).setOrigin(0.5);
    platform.setVisible(false);
    this.physics.add.existing(platform, true);
    this.platforms.add(platform);
    return platform;
  }

  createExitGate() {
    this.exitGateBarrier = this.createInvisiblePlatform(
      CHAMBER02_EXIT_GATE.x + 8,
      WORLD.floorY - 6 - CHAMBER02_EXIT_GATE.barrierHeight / 2,
      CHAMBER02_EXIT_GATE.barrierWidth,
      CHAMBER02_EXIT_GATE.barrierHeight
    ).setDepth(-5.5);

    if (this.textures.exists(ASSET_KEYS.chamber02VertebralHornGate)) {
      this.exitGateArt = this.add
        .image(CHAMBER02_EXIT_GATE.x, CHAMBER02_EXIT_GATE.y, ASSET_KEYS.chamber02VertebralHornGate)
        .setDisplaySize(CHAMBER02_EXIT_GATE.displayWidth, CHAMBER02_EXIT_GATE.displayHeight)
        .setCrop(194, 166, 640, 1140)
        .setTint(CHAMBER02_EXIT_GATE.lockedTint)
        .setAlpha(CHAMBER02_EXIT_GATE.lockedAlpha)
        .setDepth(-5.4);
    } else {
      this.exitGateArt = this.add
        .rectangle(CHAMBER02_EXIT_GATE.x, WORLD.floorY - 126, 112, 252, COLORS.foreground, 0.94)
        .setStrokeStyle(3, COLORS.bone, 0.8)
        .setDepth(-5.4);
    }

    this.exitGateSigil = this.add
      .ellipse(CHAMBER02_EXIT_GATE.x - 26, 324, 50, 108, COLORS.sickly, 0.14)
      .setDepth(-5.3);
    this.exitGateReadyAura = this.add
      .ellipse(CHAMBER02_EXIT_GATE.x - 96, CHAMBER02_EXIT_GATE.zoneY, 138, 88, COLORS.sickly, 0.1)
      .setDepth(-5.25)
      .setVisible(false);

    this.exitGatePromptText = null;

    this.exitGateZone = this.add
      .zone(
        CHAMBER02_EXIT_GATE.x + CHAMBER02_EXIT_GATE.zoneOffsetX,
        CHAMBER02_EXIT_GATE.zoneY,
        CHAMBER02_EXIT_GATE.zoneWidth,
        CHAMBER02_EXIT_GATE.zoneHeight
      )
      .setOrigin(0.5);
    this.physics.add.existing(this.exitGateZone, true);
  }


  createExitCorridor() {
    const corridorCenterX = CHAMBER02_EXIT_CORRIDOR.startX + CHAMBER02_EXIT_CORRIDOR.width / 2;

    this.add
      .rectangle(corridorCenterX, WORLD.floorY - 34, CHAMBER02_EXIT_CORRIDOR.width + 56, 172, COLORS.oil, 0.22)
      .setDepth(-10.4);

    if (this.textures.exists(ASSET_KEYS.chamber02BackgroundPlate)) {
      this.exitCorridorFloorVisual = this.add
        .tileSprite(
          corridorCenterX,
          CHAMBER02_EXIT_CORRIDOR.floorY - 8,
          CHAMBER02_EXIT_CORRIDOR.width,
          168,
          ASSET_KEYS.chamber02BackgroundPlate
        )
        .setTint(0xb8a58e)
        .setAlpha(0.22)
        .setDepth(-10.2);
    } else {
      this.exitCorridorFloorVisual = this.add
        .rectangle(
          corridorCenterX,
          CHAMBER02_EXIT_CORRIDOR.floorY,
          CHAMBER02_EXIT_CORRIDOR.width,
          CHAMBER02_EXIT_CORRIDOR.floorHeight,
          0x6e5f50,
          0.72
        )
        .setDepth(-10.2);
    }

    if (this.textures.exists(ASSET_KEYS.chamber02FloorStrip)) {
      this.exitCorridorVein = this.add
        .tileSprite(
          corridorCenterX,
          WORLD.floorY + 18,
          CHAMBER02_EXIT_CORRIDOR.width,
          84,
          ASSET_KEYS.chamber02FloorStrip
        )
        .setTint(0xd0c1ab)
        .setAlpha(0.8)
        .setDepth(-9.7);
    } else {
      this.exitCorridorVein = this.add
        .rectangle(corridorCenterX, CHAMBER02_EXIT_CORRIDOR.floorY - 10, CHAMBER02_EXIT_CORRIDOR.width, 20, COLORS.bone, 0.18)
        .setDepth(-9.7);
    }

    this.add
      .ellipse(corridorCenterX, WORLD.floorY + 10, CHAMBER02_EXIT_CORRIDOR.width, 42, 0x050404, 0.24)
      .setDepth(-9.6);

    if (this.textures.exists(ASSET_KEYS.chamber02ForegroundHornArch)) {
      this.exitCorridorArch = this.add
        .image(CHAMBER02_EXIT_CORRIDOR.startX + 176, WORLD.floorY - 116, ASSET_KEYS.chamber02ForegroundHornArch)
        .setDisplaySize(196, 258)
        .setTint(0xc7b39b)
        .setAlpha(0.32)
        .setDepth(-5.2)
        .setVisible(false);

      this.exitThresholdAura = this.add
        .image(CHAMBER02_EXIT_CORRIDOR.thresholdX - 24, WORLD.floorY - 118, ASSET_KEYS.chamber02ForegroundHornArch)
        .setDisplaySize(220, 286)
        .setTint(0xd7c4ad)
        .setAlpha(0.38)
        .setDepth(-5.05)
        .setFlipX(true)
        .setVisible(false);
    } else {
      this.exitCorridorArch = this.add
        .rectangle(
          CHAMBER02_EXIT_CORRIDOR.startX + 140,
          WORLD.floorY - 126,
          70,
          244,
          COLORS.architecture,
          0.7
        )
        .setStrokeStyle(2, COLORS.bone, 0.3)
        .setDepth(-5.2)
        .setVisible(false);

      this.exitThresholdAura = this.add
        .ellipse(CHAMBER02_EXIT_CORRIDOR.thresholdX, CHAMBER02_EXIT_CORRIDOR.thresholdY + 28, 132, 204, COLORS.sickly, 0.05)
        .setDepth(-5.05)
        .setVisible(false);
    }

    this.exitThresholdZone = this.add
      .zone(
        CHAMBER02_EXIT_CORRIDOR.thresholdX,
        CHAMBER02_EXIT_CORRIDOR.thresholdY,
        CHAMBER02_EXIT_CORRIDOR.thresholdWidth,
        CHAMBER02_EXIT_CORRIDOR.thresholdHeight
      )
      .setOrigin(0.5);
    this.physics.add.existing(this.exitThresholdZone, true);
  }

  createTollKeeperEncounter() {
    return this.tollKeepers;
  }

  createBossPitAltar() {
    const altarTextureKey = this.textures.exists(ASSET_KEYS.bossPit02AltarTrap)
      ? ASSET_KEYS.bossPit02AltarTrap
      : null;
    const altar = altarTextureKey
      ? this.add.image(CHAMBER02_BOSS_PIT_ALTAR.x, CHAMBER02_BOSS_PIT_ALTAR.y, altarTextureKey)
        .setDisplaySize(CHAMBER02_BOSS_PIT_ALTAR.width, CHAMBER02_BOSS_PIT_ALTAR.height)
        .setTint(0xd8c4ad)
        .setAlpha(0.88)
        .setDepth(-5.1)
      : this.add
        .ellipse(CHAMBER02_BOSS_PIT_ALTAR.x, CHAMBER02_BOSS_PIT_ALTAR.y - 10, CHAMBER02_BOSS_PIT_ALTAR.width, CHAMBER02_BOSS_PIT_ALTAR.height, COLORS.sickly, 0.16)
        .setDepth(-5.1);
    this.add
      .ellipse(CHAMBER02_BOSS_PIT_ALTAR.x, WORLD.floorY + 8, CHAMBER02_BOSS_PIT_ALTAR.width + 84, 40, 0x030303, 0.34)
      .setDepth(-5.05);

    const zone = this.add
      .zone(
        CHAMBER02_BOSS_PIT_ALTAR.x,
        CHAMBER02_BOSS_PIT_ALTAR.y,
        CHAMBER02_BOSS_PIT_ALTAR.zoneWidth,
        CHAMBER02_BOSS_PIT_ALTAR.zoneHeight
      )
      .setOrigin(0.5);
    this.physics.add.existing(zone, true);

    this.bossPitPromptText = this.add
      .text(CHAMBER02_BOSS_PIT_ALTAR.x, CHAMBER02_BOSS_PIT_ALTAR.y + CHAMBER02_BOSS_PIT_ALTAR.promptOffsetY, 'Press [E] Descend', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#d6c5ac',
        backgroundColor: '#14100d'
      })
      .setPadding(8, 4, 8, 4)
      .setOrigin(0.5)
      .setDepth(16)
      .setVisible(false);

    this.currentBossPitAltar = null;
    this.bossPitAltar = { altar, zone };
  }

  createEnemyEncounter() {
    CHAMBER02_ENCOUNTER_POCKETS.forEach((pocket) => {
      this.add.ellipse(pocket.zoneX, WORLD.floorY - 4, pocket.zoneWidth * 0.56, 72, 0x040303, 0.1).setDepth(-6.02);
      pocket.spawns.forEach((spawn) => {
        const enemyConfig = spawn.type === 'tollKeeper'
          ? {
            ...CHAMBER02_TOLL_KEEPER_CONFIG,
            awakenPlayerX: spawn.awakenPlayerX,
            wakeDelayMs: spawn.wakeDelayMs,
            patrolDistance: spawn.patrolDistance ?? CHAMBER02_TOLL_KEEPER_CONFIG.patrolDistance
          }
          : {
            ...SKITTER,
            awakenPlayerX: spawn.awakenPlayerX,
            wakeDelayMs: spawn.wakeDelayMs ?? 500,
            patrolDistance: spawn.patrolDistance ?? 180
          };
        const enemy = this.createSkitterEnemy(spawn.x, PLAYER.startY, enemyConfig);
        if (spawn.type === 'tollKeeper') {
          enemy.isTollKeeper = true;
          this.tollKeepers.push(enemy);
        }
        this.enemies.push(enemy);
      });
    });

    return this.enemies;
  }

  createSkitterEnemy(x, y, config) {
    const enemy = new SkitterServitor(this, x, y, config);
    this.physics.add.collider(enemy.sprite, this.platforms);
    this.physics.add.overlap(this.player.attackHitbox, enemy.sprite, (attackZone, enemySprite) => {
      this.handlePlayerHitEnemy(attackZone, enemySprite, enemy);
    });
    this.physics.add.overlap(this.player.sprite, enemy.sprite, (playerSprite, enemySprite) => {
      this.handleEnemyContactPlayer(playerSprite, enemySprite, enemy);
    });
    return enemy;
  }

  refreshBossPitAltarPresence() {
    this.currentBossPitAltar = null;
    this.bossPitPromptText?.setVisible(false);

    if (!this.bossPitAltar?.zone
      || this.hasCompletedBossPitLoop
      || this.bossPitTransitionActive
      || this.isExitGateTransitionActive
      || !this.isSceneEntryReadyForTransitions
      || this.sceneEntryFadeInActive) {
      return;
    }

    this.physics.overlap(this.player.sprite, this.bossPitAltar.zone, () => {
      this.currentBossPitAltar = this.bossPitAltar;
    });

    if (this.currentBossPitAltar) {
      this.bossPitPromptText?.setVisible(true);
    }
  }

  tryBeginBossPitTransition(mobileInput) {
    if (!this.currentBossPitAltar
      || this.hasCompletedBossPitLoop
      || this.bossPitTransitionActive
      || this.isExitGateTransitionActive
      || !this.isSceneEntryReadyForTransitions
      || this.sceneEntryFadeInActive) {
      return;
    }

    const interactPressed = Phaser.Input.Keyboard.JustDown(this.keyInteract)
      || Phaser.Input.Keyboard.JustDown(this.keyEnter)
      || mobileInput.interactPressed;
    if (!interactPressed) {
      return;
    }

    console.info('[Chamber02Scene] boss pit altar interaction accepted');
    this.beginBossPitTransition();
  }

  beginBossPitTransition() {
    if (this.bossPitTransitionActive || this.hasCompletedBossPitLoop || !this.isSceneEntryReadyForTransitions) {
      return;
    }

    this.bossPitTransitionActive = true;
    this.bossPitTransitionCompleted = false;
    console.info('[Chamber02Scene] starting Chamber02BossPitScene transition');

    const camera = this.cameras.main;
    this.currentBossPitAltar = null;
    this.mobileControls.setMode('dialogue');
    this.player.body.setVelocity(0, 0);
    this.enemies.forEach((enemy) => enemy.body?.setVelocity(0, 0));
    this.audioDirector?.stopAmbientLoop();
    this.hud?.setVisible(false);
    this.mobileControls.setMode('init');
    this.uiCamera?.setVisible(false);
    this.bossPitPromptText?.setVisible(false);

    camera.resetFX();

    const onFadeOutComplete = () => {
      console.info('[Chamber02Scene] boss pit fade-out callback fired');
      this.bossPitTransitionCompleted = true;
      console.info("[Chamber02Scene] calling scene.start('Chamber02BossPitScene')");
      try {
        this.scene.start('Chamber02BossPitScene', {
          fromScene: this.scene.key,
          altarX: CHAMBER02_BOSS_PIT_ALTAR.x,
          altarY: CHAMBER02_BOSS_PIT_ALTAR.y
        });
      } catch (error) {
        console.error("[Chamber02Scene] scene.start('Chamber02BossPitScene') failed", error);
        this.recoverBossPitTransitionFailure();
      }
    };

    camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, onFadeOutComplete);
    this.tweens.add({
      targets: this.player.sprite,
      y: this.player.sprite.y + 38,
      duration: 260,
      ease: 'Sine.easeIn'
    });
    console.info('[Chamber02Scene] boss pit sink tween started');
    camera.shake(250, 0.004, true);
    console.info('[Chamber02Scene] boss pit fade-out started');
    camera.fadeOut(420, 0, 0, 0);

    this.time.delayedCall(1100, () => {
      if (!this.bossPitTransitionCompleted) {
        console.warn('[Chamber02Scene] boss pit handoff watchdog fired before scene.start completion');
        this.recoverBossPitTransitionFailure();
      }
    });
  }

  recoverBossPitTransitionFailure() {
    this.bossPitTransitionActive = false;
    this.bossPitTransitionCompleted = false;
    this.cameras.main.resetFX();
    this.cameras.main.fadeIn(180, 0, 0, 0);
    this.uiCamera?.setVisible(true);
    this.hud?.setVisible(true);
    this.mobileControls?.setMode('gameplay');
  }

  update(time) {
    const mobileInput = this.mobileControls.getInputState();

    if (this.player.isDead) {
      this.mobileControls.setMode('dead');
      this.restartText.setVisible(true).setText('VESSEL FAILURE\nPress [R] to re-seed chamber');
      if ((Phaser.Input.Keyboard.JustDown(this.keyRestart) || mobileInput.interactPressed) && !this.isRestartingRun) {
        this.isRestartingRun = true;
        this.cleanupSceneUi();
        restartRunFromDeath(this);
      }
      return;
    }

    this.restartText.setVisible(false);

    if (this.isHandingOffToChamber03) {
      this.mobileControls.setMode('init');
      this.player.body.setVelocity(0, 0);
      this.player.body.setEnable(false);
      this.enemies.forEach((enemy) => enemy.body?.setVelocity(0, 0));
      return;
    }

    if (this.isExitGateTransitionActive || this.bossPitTransitionActive) {
      this.mobileControls.setMode('dialogue');
      this.player.body.setVelocity(0, 0);
      this.enemies.forEach((enemy) => enemy.body.setVelocity(0, 0));
      return;
    }

    this.mobileControls.setMode('gameplay');

    this.player.update(time, {
      left: this.cursors.left.isDown || mobileInput.left,
      right: this.cursors.right.isDown || mobileInput.right,
      jumpPressed:
        Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
        mobileInput.jumpPressed,
      attackPressed: Phaser.Input.Keyboard.JustDown(this.keyAttack) || mobileInput.attackPressed
    });

    this.refreshBossPitAltarPresence();
    this.tryBeginBossPitTransition(mobileInput);
    this.refreshExitGateState();
    this.refreshExitGateZonePresence();
    this.refreshExitThresholdZonePresence();
    this.tryBeginExitGateTransition();
    this.updateExitGateAura(time);

    this.enemies.forEach((enemy) => enemy.update(time, this.player.sprite.x));

    this.directionalCameraBias?.update();
    this.hud.update(this.player.health, this.player.maxHealth);
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

  countDefeatedTollKeepers() {
    return this.tollKeepers.filter((enemy) => enemy.dead).length;
  }

  areAllTollKeepersDefeated() {
    return this.tollKeepers.length > 0 && this.countDefeatedTollKeepers() === this.tollKeepers.length;
  }

  applyExitGateVisualState(unlocked) {
    if (!this.exitGateArt) {
      return;
    }

    const targetTint = unlocked ? CHAMBER02_EXIT_GATE.unlockedTint : CHAMBER02_EXIT_GATE.lockedTint;
    const targetAlpha = unlocked ? CHAMBER02_EXIT_GATE.unlockedAlpha : CHAMBER02_EXIT_GATE.lockedAlpha;

    if (typeof this.exitGateArt.setTint === 'function') {
      this.exitGateArt.setTint(targetTint);
    } else if (typeof this.exitGateArt.setFillStyle === 'function') {
      this.exitGateArt.setFillStyle(targetTint, targetAlpha);
    }

    if (typeof this.exitGateArt.setAlpha === 'function') {
      this.exitGateArt.setAlpha(targetAlpha);
    }
  }

  refreshExitGateState() {
    const unlocked = this.areAllTollKeepersDefeated();
    if (this.exitGateUnlocked === unlocked) {
      return;
    }

    this.exitGateUnlocked = unlocked;
    if (unlocked) {
      this.exitGateUnlockAudioTimer?.remove(false);
      this.exitGateUnlockAudioTimer = this.time.delayedCall(EXIT_GATE_UNLOCK_AUDIO_DELAY_MS, () => {
        this.audioDirector?.playGateUnlock();
        this.exitGateUnlockAudioTimer = null;
      });
    } else {
      this.exitGateUnlockAudioTimer?.remove(false);
      this.exitGateUnlockAudioTimer = null;
    }
    this.exitGateSigil?.setAlpha(unlocked ? 0.3 : 0.14);
    this.applyExitGateVisualState(unlocked);
    this.exitGateBarrier?.setVisible(!unlocked);
    this.exitGateReadyAura?.setVisible(unlocked);
    this.exitCorridorArch?.setVisible(unlocked);
    this.exitThresholdAura?.setVisible(false);

    if (this.exitGateBarrier?.body) {
      this.exitGateBarrier.body.enable = !unlocked;
      this.exitGateBarrier.body.updateFromGameObject?.();
    }
  }

  refreshExitGateZonePresence() {
    this.currentExitGateZone = null;
    
    if (!this.exitGateZone) {
      this.exitGatePromptText?.setVisible(false);
      return;
    }

    this.physics.overlap(this.player.sprite, this.exitGateZone, () => {
      this.currentExitGateZone = this.exitGateZone;
    });

    this.exitGatePromptText?.setVisible(false);
  }

  refreshExitThresholdZonePresence() {
    this.currentExitThresholdZone = null;

    if (!this.exitGateUnlocked || !this.exitThresholdZone || this.isHandingOffToChamber03) {
      return;
    }

    this.physics.overlap(this.player.sprite, this.exitThresholdZone, () => {
      this.currentExitThresholdZone = this.exitThresholdZone;
    });
  }

  tryBeginExitGateTransition() {
    if (!this.exitGateUnlocked || !this.currentExitThresholdZone || this.isExitGateTransitionActive) {
      return;
    }

    this.beginExitGateTransitionToChamber03();
  }

  beginExitGateTransitionToChamber03() {
    if (this.isExitGateTransitionActive || this.isHandingOffToChamber03) {
      return;
    }
    this.hardStartChamber03();
  }

  hardStartChamber03() {
    if (this.chamber03StartHasRun || this.isHandingOffToChamber03) {
      return;
    }

    this.isExitGateTransitionActive = true;
    this.isHandingOffToChamber03 = true;
    this.chamber03StartHasRun = true;

    console.log('[Chamber02->Chamber03] handoff lock engaged');

    this.currentExitThresholdZone = null;
    this.currentExitGateZone = null;
    this.exitThresholdZone?.disableBody?.(true, true);
    this.exitThresholdAura?.setVisible(false);
    this.exitGatePromptText?.setVisible(false);
    this.exitGateReadyAura?.setVisible(false);

    this.mobileControls.setMode('init');
    this.player.body.setVelocity(0, 0);
    this.player.body.setEnable(false);
    this.player.attackHitbox?.body?.setEnable(false);

    this.enemies.forEach((enemy) => {
      enemy.body?.setVelocity(0, 0);
      enemy.body?.setEnable(false);
      enemy.attackHitbox?.body?.setEnable(false);
    });

    this.audioDirector?.stopAmbientLoop({ fadeOut: false });

    this.time.delayedCall(20, () => {
      console.log("[Chamber02Scene] calling scene.start('Chamber03Scene')");
      try {
        this.scene.start('Chamber03Scene', {
          enteredFrom: 'chamber02-physical-threshold',
          progressionSource: 'toll-keeper-corridor-threshold'
        });
      } catch (error) {
        console.error("[Chamber02Scene] scene.start('Chamber03Scene') failed", error);
      }
    });
  }

  setupMobileUiCamera() {
    if (!this.mobileControls.enabled) {
      return;
    }

    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'Chamber02MobileUiCamera');

    const mobileUiElements = this.mobileControls.getUiElements();
    const mobileUiSet = new Set(mobileUiElements);
    const nonMobileObjects = this.children.list.filter((element) => !mobileUiSet.has(element));

    this.cameras.main.ignore(mobileUiElements);
    this.uiCamera.ignore(nonMobileObjects);
    if (this.restartText) {
      this.uiCamera.ignore(this.restartText);
    }
  }


  applyGameplayReadabilitySupport(target) {
    if (!target) {
      return null;
    }

    return null;
  }

  cleanupSceneUi() {
    this.restartText?.setVisible(false);
    this.exitGatePromptText?.setVisible(false);
    this.bossPitPromptText?.setVisible(false);
    this.mobileControls?.setMode('init');
    this.hud?.setVisible(false);
  }

  updateExitGateAura(time) {
    if (this.exitGateReadyAura?.visible) {
      const gatePulse = 0.12 + (Math.sin(time / 180) + 1) * 0.045;
      this.exitGateReadyAura.setAlpha(gatePulse).setScale(1 + Math.sin(time / 320) * 0.04, 1);
    }

    if (this.exitThresholdAura?.visible) {
      const thresholdPulse = 0.14 + (Math.sin(time / 210) + 1) * 0.06;
      this.exitThresholdAura.setAlpha(thresholdPulse).setScale(1 + Math.sin(time / 290) * 0.03, 1.02);
    }
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
      this.restartText.setPosition(
        width / 2,
        Math.max(PORTRAIT_LAYOUT.restartTextMinY, worldBandHeight * PORTRAIT_LAYOUT.restartTextRatioY)
      );
      return;
    }

    camera.setViewport(0, 0, width, height);
    camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
    this.directionalCameraBias?.setLayout({ isPortrait: false, followOffsetY: PORTRAIT_LAYOUT.desktopFollowOffsetY });
    this.mobileControls.setReservedBottomPx(0);
    this.restartText.setPosition(width / 2, 90);
  }
}
