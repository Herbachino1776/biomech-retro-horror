import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { SkitterServitor } from '../entities/SkitterServitor.js';
import { HalfSkullMiniboss } from '../entities/HalfSkullMiniboss.js';
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
import { BrutalityModeState } from '../systems/BrutalityModeState.js';
import { triggerBrutalityBasicChunkBurst } from '../systems/BrutalityChunkBurst.js';
import { beginBossDeathPayoffPackage } from '../systems/BossDeathPayoffPackage.js';
import { MajorEncounterResolution } from '../systems/MajorEncounterResolution.js';

const CHAMBER02_WORLD_WIDTH = 5120;

const CHAMBER02_EXIT_CORRIDOR = {
  startX: 4250,
  width: 680,
  floorY: 424,
  floorHeight: 96,
  thresholdX: 4930,
  thresholdY: 374,
  thresholdWidth: 108,
  thresholdHeight: 212,
  cameraHintX: 4580
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
    zoneX: 1180,
    zoneY: WORLD.floorY - 76,
    zoneWidth: 520,
    zoneHeight: 236,
    spawns: [
      { type: 'basic', x: 980, awakenPlayerX: 760, patrolDistance: 92, wakeDelayMs: 0 },
      { type: 'basic', x: 1180, awakenPlayerX: 900, patrolDistance: 122, wakeDelayMs: 80 },
      { type: 'basic', x: 1360, awakenPlayerX: 1020, patrolDistance: 98, wakeDelayMs: 140 }
    ]
  },
  {
    id: 'ossuary-procession-pocket-02',
    zoneX: 2440,
    zoneY: WORLD.floorY - 76,
    zoneWidth: 640,
    zoneHeight: 240,
    spawns: [
      { type: 'basic', x: 2210, awakenPlayerX: 1900, patrolDistance: 132, wakeDelayMs: 0 },
      { type: 'basic', x: 2440, awakenPlayerX: 2050, patrolDistance: 112, wakeDelayMs: 110 },
      { type: 'basic', x: 2660, awakenPlayerX: 2200, patrolDistance: 116, wakeDelayMs: 170 }
    ]
  },
  {
    id: 'horn-vault-reveal-domain',
    zoneX: 3760,
    zoneY: WORLD.floorY - 82,
    zoneWidth: 980,
    zoneHeight: 248,
    spawns: [
      { type: 'basic', x: 3400, awakenPlayerX: 3120, patrolDistance: 122, wakeDelayMs: 0 },
      { type: 'tollKeeper', x: 3710, awakenPlayerX: 3340, patrolDistance: 92, wakeDelayMs: 100 },
      { type: 'basic', x: 3980, awakenPlayerX: 3460, patrolDistance: 114, wakeDelayMs: 150 },
      { type: 'tollKeeper', x: 4240, awakenPlayerX: 3600, patrolDistance: 96, wakeDelayMs: 220 }
    ]
  }
];


const CHAMBER02_BOSS_PIT_ALTARS = [
  {
    id: 'chamber02-bosspit-ash',
    sceneKey: 'Chamber02BossPitScene',
    completionKey: 'ash',
    x: 620,
    y: 402,
    width: 198,
    height: 198,
    zoneWidth: 196,
    zoneHeight: 216,
    promptOffsetY: -168,
    textureKey: ASSET_KEYS.bossPit02AltarTrap,
    tint: 0xd8c4ad,
    auraWidth: 500,
    auraHeight: 96
  },
  {
    id: 'chamber02-bosspit-hollow-sky',
    sceneKey: 'Chamber02BossPitHollowSkyScene',
    completionKey: 'hollowSky',
    x: 2860,
    y: 402,
    width: 198,
    height: 198,
    zoneWidth: 196,
    zoneHeight: 216,
    promptOffsetY: -168,
    textureKey: ASSET_KEYS.bossPit01AltarTrap,
    tint: 0xdcc7b0,
    auraWidth: 520,
    auraHeight: 100
  }
];

const CHAMBER02_SEGMENTS = [
  { type: 'opening', x: 520, width: 920, tint: 0xc1b199, alpha: 0.72 },
  { type: 'corridor', x: 1480, width: 820, tint: 0xb3a48f, alpha: 0.58 },
  { type: 'corridor', x: 2540, width: 980, tint: 0xa59682, alpha: 0.54 },
  { type: 'reveal', x: 3720, width: 1120, tint: 0xcab79f, alpha: 0.8 },
  { type: 'threshold', x: 4650, width: 860, tint: 0xcfbca4, alpha: 0.72 }
];

const EXIT_GATE_UNLOCK_AUDIO_DELAY_MS = 2000;

const CHAMBER02_EXIT_GATE = {
  x: CHAMBER02_EXIT_CORRIDOR.thresholdX - 24,
  y: 300,
  displayWidth: 284,
  displayHeight: 324,
  barrierWidth: 62,
  barrierHeight: 244,
  zoneOffsetX: -84,
  zoneY: 404,
  zoneWidth: 170,
  zoneHeight: 172,
  interactPromptOffsetY: -128,
  lockedTint: 0x927f66,
  lockedAlpha: 0.76,
  unlockedTint: 0xd7c5ac,
  unlockedAlpha: 0.96
};

const CHAMBER02_END_BOSS = {
  name: 'THE VERTEBRAL TOLL JUDGE',
  subtitle: 'Exit Cantor of Compression',
  spawnX: 4690,
  activationX: 4440,
  health: 6,
  contactDamage: 1,
  contactDamageCooldownMs: 1200,
  attackCooldownMs: 2680,
  attackTelegraphMs: 780,
  attackRecoveryMs: 640,
  attackRange: 210,
  approachRange: 360,
  approachSpeed: 48,
  idleAdvanceSpeed: 18,
  windupDriftSpeed: 14,
  attackSpeed: 204,
  attackLiftVelocity: -138,
  hitPulseMs: 320,
  hurtRecoverMs: 260,
  hurtRecoilVelocityX: 120,
  hurtRecoilVelocityY: -56,
  body: { width: 90, height: 134, offsetX: 98, offsetY: 78 },
  textureKey: ASSET_KEYS.sector02Chamber02PressureDeacon,
  audioProfile: 'miniboss',
  revealViewportPadding: 80,
  bossBarRevealViewportPadding: 36,
  presentation: {
    display: { width: 312, height: 306 },
    origin: { x: 0.52, y: 0.976 },
    normalization: { visibleFootOffsetY: 106 },
    alpha: 0.98,
    tint: 0xd7c5ae
  },
  damageHurtbox: {
    trimXRatio: 0.04,
    trimYRatio: 0.04,
    minWidth: 162,
    minHeight: 214,
    offsetY: -16
  }
};

const BRUTALITY_MODE = {
  rules: {
    streakTriggerKills: 2,
    streakWindowMs: 5000,
    activeDurationMs: 20000,
    maxActivationsPerChamber: 2
  },
  player: {
    speedMultiplier: 1.1,
    damageMultiplier: 3,
    reachMultiplier: 1.24
  },
  enemyAggression: {
    speedMultiplier: 1.22,
    aggroRangeMultiplier: 1.28
  }
};

export class Chamber02Scene extends Phaser.Scene {
  constructor() {
    super('Chamber02Scene');
  }

  init(data) {
    this.transitionContext = data ?? {};
    this.hasCompletedBossPitAshLoop = bossPitRunState.hasChamber02BossPitCompleted();
    this.hasCompletedBossPitHollowSkyLoop = bossPitRunState.hasChamber02HollowSkyBossPitCompleted();
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
      this.currentLoreZone = null;
      this.triggeredLoreIds = new Set();
      this.completedLoreBeats = new Set();
      this.isExitGateTransitionActive = false;
      this.isHandingOffToChamber03 = false;
      this.isRestartingRun = false;
      this.exitGateUnlockAudioTimer = null;
      this.exitGatePromptText = null;
      this.bossPitPromptText = null;
      this.bossPitAltars = [];
      this.chamber03StartHasRun = false;
      this.hasEnteredExitThreshold = false;
      this.exitThresholdAwaitingFreshInteract = false;
      this.isLoreTransitionActive = false;
      this.bossPitTransitionActive = false;
      this.isSceneEntryReadyForTransitions = false;
      this.sceneEntryFadeInActive = false;
      this.endBossEncounterStarted = false;
      this.endBossDefeated = false;
      this.endBossRevealTriggered = false;
      this.endBossBarRevealed = false;
      this.endBossVictorySequenceActive = false;
      this.hasProcessedEndBossVictory = false;

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
      startupStep = 'create-boss-pit-altars';
      this.createBossPitAltars();
      startupStep = 'create-end-lore-beat';
      this.createEndLoreBeat();

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
      this.createEndBoss();
      this.setupBrutalityMode();

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
      this.game.events.on('lore-screen-complete', this.handleLoreScreenComplete, this);
      this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.scale.off('resize', this.applyResponsiveLayout, this);
        this.game.events.off('lore-screen-complete', this.handleLoreScreenComplete, this);
        this.exitGateUnlockAudioTimer?.remove(false);
        this.exitGateUnlockAudioTimer = null;
        console.log('[Chamber02Scene] shutdown event fired');
        this.audioDirector?.shutdown();
        this.brutalityMode?.end(this.time.now);
        this.enemies?.forEach((enemy) => enemy.setBrutalityAggression(false));
        this.endBoss?.setBrutalityAggression?.(false);
        this.hud?.setBossBarState({ visible: false });
        this.majorEncounterResolution?.teardown();
        this.cleanupSceneUi();
      });

      this.applyResponsiveLayout();
      this.directionalCameraBias?.update();
      this.hud.update(this.player.health, this.player.maxHealth);
      if (this.transitionContext?.returnFromBossPit) {
        const returnedFromHollowSky = this.transitionContext?.fromScene === 'Chamber02BossPitHollowSkyScene';
        if (returnedFromHollowSky) {
          this.hasCompletedBossPitHollowSkyLoop = true;
          bossPitRunState.markChamber02HollowSkyBossPitCompleted();
        } else {
          this.hasCompletedBossPitAshLoop = true;
          bossPitRunState.markChamber02BossPitCompleted();
        }
      }
      this.majorEncounterResolution = new MajorEncounterResolution(this);
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

    this.sanctumAuras = CHAMBER02_BOSS_PIT_ALTARS.map((altarConfig, index) => this.add
      .ellipse(altarConfig.x, 404, altarConfig.auraWidth, altarConfig.auraHeight, COLORS.sickly, index === 0 ? 0.12 : 0.09)
      .setDepth(-9));

    this.ambientVeils = CHAMBER02_BOSS_PIT_ALTARS.map((altarConfig, index) => this.add
      .ellipse(altarConfig.x, 286, 660, 340, COLORS.sickly, index === 0 ? 0.03 : 0.026)
      .setDepth(-7.5)
      .setScale(1, 1));
  }

  createPlatforms() {
    this.createInvisiblePlatform(CHAMBER02_WORLD_WIDTH / 2, WORLD.floorY + 28, CHAMBER02_WORLD_WIDTH, 72);

    CHAMBER02_PLATFORMS.forEach((platform) => {
      this.createInvisiblePlatform(platform.x, platform.y, platform.width, platform.height);
    });

    if (this.textures.exists(ASSET_KEYS.chamber02VertebralHornGate)) {
      this.hornGateMonument = this.add
        .image(1970, 274, ASSET_KEYS.chamber02VertebralHornGate)
        .setDisplaySize(292, 360)
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

    if (this.textures.exists(ASSET_KEYS.sector04Chamber02PropThresholdDoor)) {
      this.exitGateArt = this.add
        .image(CHAMBER02_EXIT_GATE.x, CHAMBER02_EXIT_GATE.y, ASSET_KEYS.sector04Chamber02PropThresholdDoor)
        .setDisplaySize(CHAMBER02_EXIT_GATE.displayWidth, CHAMBER02_EXIT_GATE.displayHeight)
        .setTint(CHAMBER02_EXIT_GATE.lockedTint)
        .setAlpha(CHAMBER02_EXIT_GATE.lockedAlpha)
        .setDepth(-4.95);
    } else {
      this.exitGateArt = this.add
        .rectangle(CHAMBER02_EXIT_GATE.x, WORLD.floorY - 126, 112, 252, COLORS.foreground, 0.94)
        .setStrokeStyle(3, COLORS.bone, 0.8)
        .setDepth(-4.95);
    }

    this.exitGateSigil = null;
    this.exitGatePostLeft = null;
    this.exitGatePostRight = null;
    this.exitGateReadyAura = this.add
      .ellipse(CHAMBER02_EXIT_GATE.x - 96, CHAMBER02_EXIT_GATE.zoneY, 138, 88, COLORS.sickly, 0.1)
      .setDepth(-4.9)
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
        .setDisplaySize(208, 276)
        .setTint(0xc7b39b)
        .setAlpha(0.32)
        .setDepth(-5.2)
        .setVisible(false);

      this.exitThresholdAura = this.add
        .image(CHAMBER02_EXIT_CORRIDOR.thresholdX - 24, WORLD.floorY - 118, ASSET_KEYS.chamber02ForegroundHornArch)
        .setDisplaySize(232, 298)
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

  createEndLoreBeat() {
    const loreEntry = {
      id: 'chamber02-vertebral-threshold-tablet',
      x: 4510,
      y: 398,
      zoneWidth: 164,
      zoneHeight: 180,
      screenId: 'chamber02-vertebral-threshold'
    };

    if (this.textures.exists(ASSET_KEYS.sector02Chamber02LoreAltar)) {
      this.endLoreShrine = this.add
        .image(loreEntry.x, WORLD.floorY - 74, ASSET_KEYS.sector02Chamber02LoreAltar)
        .setDisplaySize(198, 188)
        .setAlpha(0.86)
        .setTint(0xd6c4ad)
        .setDepth(-4.98);
    } else {
      this.endLoreShrine = this.add
        .rectangle(loreEntry.x, WORLD.floorY - 74, 140, 156, COLORS.foreground, 0.76)
        .setStrokeStyle(2, COLORS.bone, 0.45)
        .setDepth(-4.98);
    }

    this.endLoreShrineAura = this.add
      .ellipse(loreEntry.x, WORLD.floorY + 10, 216, 54, COLORS.sickly, 0.11)
      .setDepth(-4.92);

    this.endLoreZone = this.add.zone(loreEntry.x, loreEntry.y, loreEntry.zoneWidth, loreEntry.zoneHeight).setOrigin(0.5);
    this.endLoreZone.loreEntry = loreEntry;
    this.physics.add.existing(this.endLoreZone, true);
  }

  createTollKeeperEncounter() {
    return this.tollKeepers;
  }

  createBossPitAltars() {
    this.bossPitAltars = CHAMBER02_BOSS_PIT_ALTARS.map((altarConfig) => {
      const altarTextureKey = this.textures.exists(altarConfig.textureKey)
        ? altarConfig.textureKey
        : null;
      const altar = altarTextureKey
        ? this.add.image(altarConfig.x, altarConfig.y, altarTextureKey)
          .setDisplaySize(altarConfig.width, altarConfig.height)
          .setTint(altarConfig.tint)
          .setAlpha(0.88)
          .setDepth(-5.1)
        : this.add
          .ellipse(altarConfig.x, altarConfig.y - 10, altarConfig.width, altarConfig.height, COLORS.sickly, 0.16)
          .setDepth(-5.1);

      this.add
        .ellipse(altarConfig.x, WORLD.floorY + 8, altarConfig.width + 84, 40, 0x030303, 0.34)
        .setDepth(-5.05);

      const zone = this.add
        .zone(
          altarConfig.x,
          altarConfig.y,
          altarConfig.zoneWidth,
          altarConfig.zoneHeight
        )
        .setOrigin(0.5);
      this.physics.add.existing(zone, true);

      return {
        ...altarConfig,
        altar,
        zone
      };
    });

    this.bossPitPromptText = null;
    this.currentBossPitAltar = null;
  }

  isBossPitAltarCompleted(altarConfig) {
    if (altarConfig?.completionKey === 'hollowSky') {
      return this.hasCompletedBossPitHollowSkyLoop;
    }

    return this.hasCompletedBossPitAshLoop;
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
    this.physics.add.overlap(this.player.attackHitbox, enemy.damageHurtbox ?? enemy.sprite, (attackZone, enemySprite) => {
      this.handlePlayerHitEnemy(attackZone, enemySprite, enemy);
    });
    this.physics.add.overlap(this.player.sprite, enemy.sprite, (playerSprite, enemySprite) => {
      this.handleEnemyContactPlayer(playerSprite, enemySprite, enemy);
    });
    return enemy;
  }

  createEndBoss() {
    this.endBoss = new HalfSkullMiniboss(this, CHAMBER02_END_BOSS.spawnX, WORLD.floorY - 8, {
      ...CHAMBER02_END_BOSS,
      spawnY: WORLD.floorY - 8,
      floorPlaneY: WORLD.floorY - 8
    });
    this.endBoss.setActive(false);
    this.endBoss.sprite.setDepth(6.16).setAlpha(0.94);
    this.physics.add.collider(this.endBoss.getCollisionTarget?.() ?? this.endBoss.sprite, this.platforms);
    this.physics.add.overlap(this.player.attackHitbox, this.endBoss.damageHurtbox ?? this.endBoss.sprite, () => this.handlePlayerHitEndBoss());
    this.physics.add.overlap(this.player.sprite, this.endBoss.getCollisionTarget?.() ?? this.endBoss.sprite, () => this.handleEndBossContactPlayer());
  }

  setupBrutalityMode() {
    this.brutalityMode = new BrutalityModeState(this, {
      ...BRUTALITY_MODE.rules,
      onActivated: () => {
        this.player.applyBrutalityMode(BRUTALITY_MODE.player);
        this.audioDirector?.playEnemyAttack('miniboss');
        this.syncBrutalityAggression();
      },
      onEnded: () => {
        this.player.clearBrutalityMode();
        this.enemies.forEach((enemy) => enemy.setBrutalityAggression(false));
        this.endBoss?.setBrutalityAggression?.(false);
      }
    });
  }

  syncBrutalityAggression() {
    const brutalityActive = this.brutalityMode?.isActive?.() ?? false;
    this.enemies.forEach((enemy) => enemy.setBrutalityAggression(brutalityActive, BRUTALITY_MODE.enemyAggression));
    this.endBoss?.setBrutalityAggression?.(brutalityActive, BRUTALITY_MODE.enemyAggression);
  }

  refreshBossPitAltarPresence() {
    this.currentBossPitAltar = null;
    this.bossPitPromptText?.setVisible(false);

    if (!this.bossPitAltars?.length
      || this.bossPitTransitionActive
      || this.isExitGateTransitionActive
      || !this.isSceneEntryReadyForTransitions
      || this.sceneEntryFadeInActive) {
      return;
    }

    this.bossPitAltars.forEach((altarConfig) => {
      if (!altarConfig?.zone || this.isBossPitAltarCompleted(altarConfig)) {
        return;
      }

      this.physics.overlap(this.player.sprite, altarConfig.zone, () => {
        this.currentBossPitAltar = altarConfig;
      });
    });

    if (this.currentBossPitAltar) {
      this.bossPitPromptText
        ?.setPosition(this.currentBossPitAltar.x, this.currentBossPitAltar.y + this.currentBossPitAltar.promptOffsetY)
        .setVisible(true);
    }
  }

  tryBeginBossPitTransition(mobileInput) {
    if (!this.currentBossPitAltar
      || this.isBossPitAltarCompleted(this.currentBossPitAltar)
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
    if (!this.currentBossPitAltar
      || this.bossPitTransitionActive
      || this.isBossPitAltarCompleted(this.currentBossPitAltar)
      || !this.isSceneEntryReadyForTransitions) {
      return;
    }

    const targetAltar = this.currentBossPitAltar;
    this.bossPitTransitionActive = true;
    console.info(`[Chamber02Scene] starting immediate ${targetAltar.sceneKey} transition`);
    this.currentBossPitAltar = null;
    this.mobileControls.setMode('dialogue');
    this.player.body.setVelocity(0, 0);
    this.player.body.setEnable(false);
    this.enemies.forEach((enemy) => enemy.body?.setVelocity(0, 0));
    this.audioDirector?.stopAmbientLoop();
    this.hud?.setVisible(false);
    this.mobileControls.setMode('init');
    this.uiCamera?.setVisible(false);
    this.bossPitPromptText?.setVisible(false);
    console.info(`[Chamber02Scene] immediate scene.start('${targetAltar.sceneKey}') about to run`);
    try {
      this.scene.start(targetAltar.sceneKey, {
        fromScene: this.scene.key,
        altarX: targetAltar.x,
        altarY: targetAltar.y
      });
    } catch (error) {
      console.error(`[Chamber02Scene] immediate scene.start('${targetAltar.sceneKey}') failed`, error);
      this.bossPitTransitionActive = false;
      this.player.body.setEnable(true);
      this.uiCamera?.setVisible(true);
      this.hud?.setVisible(true);
      this.mobileControls?.setMode('gameplay');
    }
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

    if (this.isExitGateTransitionActive || this.bossPitTransitionActive || this.endBossVictorySequenceActive || this.isLoreTransitionActive) {
      this.mobileControls.setMode('dialogue');
      this.player.body.setVelocity(0, 0);
      this.enemies.forEach((enemy) => enemy.body.setVelocity(0, 0));
      this.endBoss?.body?.setVelocity?.(0, 0);
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
    this.refreshLoreZonePresence();
    this.tryBeginLoreSequence(mobileInput);
    this.refreshExitGateState();
    this.refreshExitGateZonePresence();
    this.refreshExitThresholdZonePresence();
    this.tryBeginExitGateTransition(mobileInput);
    this.updateExitGateAura(time);

    this.enemies.forEach((enemy) => enemy.update(time, this.player.sprite.x));
    this.updateEndBossEncounter(time);
    this.brutalityMode?.update(time);
    this.syncBrutalityAggression();

    this.directionalCameraBias?.update();
    this.hud.update(this.player.health, this.player.maxHealth);
    this.hud.setBossBarState({
      visible: this.endBossBarRevealed && !this.endBossDefeated,
      name: CHAMBER02_END_BOSS.name,
      subtitle: CHAMBER02_END_BOSS.subtitle,
      current: this.endBoss.health,
      max: this.endBoss.maxHealth,
      telegraph: this.endBoss.getTelegraphProgress(time),
      wounded: time < this.endBoss.hurtUntil
    });
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
    const now = this.time.now;
    const isBasicEnemy = !enemy.config?.isElite;
    const brutalityActive = this.brutalityMode?.isActive?.() ?? false;
    if (brutalityActive && isBasicEnemy) {
      enemy.takeDamage(Math.max(enemy.health, 1), now, { skipDefaultDeathFx: true });
      if (enemy.dead) {
        const remainsSpawnPoint = enemy.getDeathRemainsSpawnPoint?.() ?? {
          x: enemy.sprite.x,
          groundY: enemy.body?.bottom ?? this.player?.sprite?.body?.bottom
        };
        triggerBrutalityBasicChunkBurst(this, {
          x: remainsSpawnPoint.x,
          y: WORLD.floorY - 24,
          floorPlaneY: WORLD.floorY - 8,
          depth: enemy.sprite.depth - 0.08
        });
        this.cameras.main.shake(82, 0.005, true);
      }
    } else {
      enemy.takeDamage(this.player.getAttackDamage(), now);
    }
    if (enemy.dead && isBasicEnemy) {
      this.brutalityMode?.registerBasicKill(now);
    }
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

  handlePlayerHitEndBoss() {
    if (
      !this.player.attackActive
      || !this.endBossEncounterStarted
      || !this.endBossRevealTriggered
      || this.endBoss.dead
    ) {
      return;
    }
    if (this.endBoss.lastAttackHitId === this.player.attackId) {
      return;
    }

    this.endBoss.lastAttackHitId = this.player.attackId;
    this.endBoss.takeDamage(1, this.time.now);
    this.audioDirector?.playPlayerHit();
    const knockDirection = Math.sign(this.endBoss.sprite.x - this.player.sprite.x) || this.player.facing;
    this.endBoss.direction = knockDirection;

    if (this.endBoss.dead) {
      this.handleEndBossDefeated();
    }
  }

  handleEndBossContactPlayer() {
    const bossIsDamageActive = Boolean(this.endBossRevealTriggered && this.endBoss?.active && !this.endBoss?.dead);
    if (!bossIsDamageActive || !this.endBoss.canDealContactDamage(this.time.now)) {
      return;
    }
    const tookDamage = this.player.receiveDamage(CHAMBER02_END_BOSS.contactDamage, this.time.now);
    if (!tookDamage) {
      return;
    }
    this.endBoss.recordContactDamage(this.time.now);
    const knockDirection = Math.sign(this.player.sprite.x - this.endBoss.sprite.x) || 1;
    this.player.body.setVelocityX(knockDirection * 240);
    this.player.body.setVelocityY(-220);
  }

  handleEndBossDefeated() {
    if (this.hasProcessedEndBossVictory || this.majorEncounterResolution?.isResolutionActive('chamber02-end-boss')) {
      return;
    }
    this.hasProcessedEndBossVictory = true;
    this.endBossVictorySequenceActive = true;
    beginBossDeathPayoffPackage({
      scene: this,
      encounterId: 'chamber02-end-boss',
      majorEncounterResolution: this.majorEncounterResolution,
      bossSprite: this.endBoss.sprite,
      bossBody: this.endBoss.body,
      bossActor: this.endBoss,
      player: this.player,
      pauseProjectiles: () => {},
      setResolutionLock: (locked) => {
        this.endBossVictorySequenceActive = locked;
      },
      followPlayer: {
        cameraLerp: { x: 0.08, y: 0.08 },
        followOffsetX: -140,
        followOffsetY: 0,
        zoom: this.cameras.main.zoom,
        onRestored: () => this.applyResponsiveLayout()
      },
      deathCamera: {
        focusLerp: { x: 0.12, y: 0.12 },
        focusOffsetX: -8,
        focusOffsetY: -20,
        zoomScale: 1.18,
        zoomInDurationMs: 240,
        zoomOutDurationMs: 300
      },
      payoffPose: {
        floorPlaneY: WORLD.floorY - 8,
        maxUpwardSnapPx: 8,
        visibleFootOffsetY: this.endBoss.normalizedVisibleFootOffsetY ?? 0
      },
      corpseRemains: {
        floorPlaneY: WORLD.floorY - 8,
        visibleFootOffsetY: this.endBoss.normalizedVisibleFootOffsetY ?? 0,
        size: 'boss'
      },
      victory: {
        ceremonyDurationMs: 3200,
        preExplosionShakeMs: 2800,
        preExplosionShakeIntensity: 0.006,
        explosionFadeStartDelayMs: 100,
        explosionFadeDurationMs: 320,
        postExplosionDespawnDelayMs: 520,
        goreFountainCadenceMs: 84
      },
      onComplete: () => {
        this.endBossDefeated = true;
        this.endBossVictorySequenceActive = false;
        this.exitThresholdAura?.setVisible(true);
        this.refreshExitGateState();
      }
    });
  }

  isEnemyOverlapTarget(target, enemy) {
    return target === enemy.sprite || target === enemy.damageHurtbox || target?.gameObject === enemy.sprite || target?.gameObject === enemy.damageHurtbox;
  }

  countDefeatedTollKeepers() {
    return this.tollKeepers.filter((enemy) => enemy.dead).length;
  }

  areAllTollKeepersDefeated() {
    return this.tollKeepers.length > 0 && this.countDefeatedTollKeepers() === this.tollKeepers.length;
  }

  shouldStartEndBossEncounter() {
    return !this.endBossEncounterStarted
      && !this.endBossDefeated
      && this.player.sprite.x >= CHAMBER02_END_BOSS.activationX;
  }

  updateEndBossEncounter(time) {
    if (this.shouldStartEndBossEncounter()) {
      this.endBossEncounterStarted = true;
    }

    if (!this.endBossEncounterStarted || this.endBossDefeated) {
      return;
    }

    if (!this.endBossRevealTriggered && this.isEndBossRevealEligible()) {
      this.revealEndBoss(time);
    }

    this.endBoss.update(time, this.player.sprite);
    this.tryRevealEndBossBar();
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
    const unlocked = this.endBossDefeated;
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

  isEndBossRevealEligible() {
    if (!this.endBoss?.sprite?.active) {
      return false;
    }

    const worldView = this.cameras.main.worldView;
    const padding = CHAMBER02_END_BOSS.revealViewportPadding ?? 72;
    const revealRect = new Phaser.Geom.Rectangle(
      worldView.x + padding,
      worldView.y + padding,
      Math.max(1, worldView.width - padding * 2),
      Math.max(1, worldView.height - padding * 2)
    );
    const bossX = this.endBoss.sprite.x;
    const bossY = this.endBoss.sprite.body?.center?.y ?? this.endBoss.sprite.y;
    return Phaser.Geom.Rectangle.Contains(revealRect, bossX, bossY);
  }

  revealEndBoss(time) {
    if (this.endBossRevealTriggered || this.endBoss?.dead) {
      return;
    }

    this.endBossRevealTriggered = true;
    this.endBoss.setActive(true);
    this.endBoss.body?.setEnable?.(true);
    this.endBoss.recordContactDamage?.(time + 300);
    this.exitGateArt?.setAlpha(0.56).setTint(0x8e7c66);
    this.exitGateReadyAura?.setVisible(false);
  }

  tryRevealEndBossBar() {
    if (!this.endBossRevealTriggered || this.endBossBarRevealed || this.endBoss?.dead) {
      return;
    }

    const padding = CHAMBER02_END_BOSS.bossBarRevealViewportPadding ?? 36;
    if (!this.isBossNearMainCameraView(this.endBoss, padding)) {
      return;
    }

    this.endBossBarRevealed = true;
  }

  isBossNearMainCameraView(boss, padding = 72) {
    if (!boss?.sprite?.active) {
      return false;
    }
    const worldView = this.cameras.main.worldView;
    const paddedView = new Phaser.Geom.Rectangle(
      worldView.x - padding,
      worldView.y - padding,
      worldView.width + padding * 2,
      worldView.height + padding * 2
    );
    return Phaser.Geom.Rectangle.Overlaps(paddedView, boss.sprite.getBounds());
  }

  refreshExitThresholdZonePresence() {
    const wasInsideExitThreshold = this.hasEnteredExitThreshold;
    this.currentExitThresholdZone = null;

    if (!this.exitGateUnlocked || !this.exitThresholdZone || this.isHandingOffToChamber03) {
      this.hasEnteredExitThreshold = false;
      this.exitThresholdAwaitingFreshInteract = false;
      return;
    }

    this.physics.overlap(this.player.sprite, this.exitThresholdZone, () => {
      this.currentExitThresholdZone = this.exitThresholdZone;
    });

    this.hasEnteredExitThreshold = Boolean(this.currentExitThresholdZone);
    if (!this.hasEnteredExitThreshold) {
      this.exitThresholdAwaitingFreshInteract = false;
    } else if (!wasInsideExitThreshold) {
      this.exitThresholdAwaitingFreshInteract = true;
    }
  }

  tryBeginExitGateTransition(mobileInput) {
    if (!this.exitGateUnlocked || !this.currentExitThresholdZone || this.isExitGateTransitionActive) {
      return;
    }

    const interactHeld = this.keyInteract?.isDown || this.keyEnter?.isDown || mobileInput.interactHeld;
    if (this.exitThresholdAwaitingFreshInteract) {
      if (interactHeld) {
        return;
      }
      this.exitThresholdAwaitingFreshInteract = false;
    }

    const interactPressed = Phaser.Input.Keyboard.JustDown(this.keyInteract)
      || Phaser.Input.Keyboard.JustDown(this.keyEnter)
      || mobileInput.interactPressed;
    if (!interactPressed) {
      return;
    }

    this.audioDirector?.playGateInteract();
    this.beginExitGateTransitionToChamber03();
  }

  refreshLoreZonePresence() {
    this.currentLoreZone = null;
    if (!this.endLoreZone || this.triggeredLoreIds.has(this.endLoreZone?.loreEntry?.id)) {
      return;
    }

    this.physics.overlap(this.player.sprite, this.endLoreZone, () => {
      this.currentLoreZone = this.endLoreZone;
    });
  }

  tryBeginLoreSequence(mobileInput) {
    if (!this.currentLoreZone || this.isLoreTransitionActive || this.bossPitTransitionActive || this.endBossVictorySequenceActive) {
      return;
    }

    const interactPressed = Phaser.Input.Keyboard.JustDown(this.keyInteract)
      || Phaser.Input.Keyboard.JustDown(this.keyEnter)
      || mobileInput.interactPressed;
    if (!interactPressed) {
      return;
    }

    const loreEntry = this.currentLoreZone.loreEntry;
    if (!loreEntry || this.triggeredLoreIds.has(loreEntry.id)) {
      return;
    }

    this.triggeredLoreIds.add(loreEntry.id);
    this.beginLoreSequence(loreEntry);
  }

  beginLoreSequence(loreEntry) {
    if (this.isLoreTransitionActive) {
      return;
    }

    this.isLoreTransitionActive = true;
    this.mobileControls.setMode('dialogue');
    this.player.body.setVelocity(0, 0);
    this.enemies.forEach((enemy) => enemy.body?.setVelocity(0, 0));
    this.endBoss?.body?.setVelocity?.(0, 0);
    this.audioDirector?.stopAmbientLoop();

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.pause();
      this.scene.launch('LoreScreenScene', {
        screenId: loreEntry.screenId,
        returnSceneKey: this.scene.key
      });
    });

    this.cameras.main.fadeOut(420, 0, 0, 0);
  }

  handleLoreScreenComplete({ screenId } = {}) {
    if (screenId !== 'chamber02-vertebral-threshold') {
      return;
    }

    this.completedLoreBeats.add('chamber02-vertebral-threshold');
    this.endLoreShrineAura?.setAlpha(0.2);
    this.isLoreTransitionActive = false;
    this.mobileControls.setMode('gameplay');
    this.audioDirector?.playAmbientLoop(ASSET_KEYS.ambientChamber02Loop01);
    this.cameras.main.fadeIn(500, 0, 0, 0);
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
    this.endBoss?.body?.setVelocity?.(0, 0);
    this.endBoss?.body?.setEnable?.(false);
    this.endBoss?.setActive?.(false);

    this.audioDirector?.stopAmbientLoop({ fadeOut: false });

    this.time.delayedCall(20, () => {
      console.log("[Chamber02Scene] calling scene.start('Chamber03Scene')");
      try {
        this.scene.start('Chamber03Scene', {
          enteredFrom: 'chamber02-physical-threshold',
          progressionSource: 'vertebral-toll-judge-threshold'
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
