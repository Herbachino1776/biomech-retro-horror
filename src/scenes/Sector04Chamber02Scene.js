import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import { AudioDirector } from '../audio/AudioDirector.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { PLAYER, WORLD } from '../data/milestone1Config.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';
import { createDirectionalCameraBias } from '../systems/DirectionalCameraBias.js';
import { restartRunFromDeath } from '../systems/RunReset.js';
import { applyChamberEntryRestore } from '../systems/VesselRunEconomy.js';

const CHAMBER = {
  sceneKey: 'Sector04Chamber02Scene',
  worldWidth: 7040,
  floorColliderHeight: 72,
  spawnX: 220,
  spawnY: PLAYER.startY,
  cameraLerp: { x: 0.08, y: 0.08 },
  portraitFollowOffsetX: -112,
  desktopFollowOffsetX: -156
};

const SEGMENTS = [
  { key: ASSET_KEYS.sector04Chamber02BackgroundEntry, x: 460, y: 216, width: 980, height: 488, tint: 0xd5c6b2, alpha: 0.8 },
  { key: ASSET_KEYS.sector04Chamber02BackgroundWallModule01, x: 1360, y: 214, width: 860, height: 454, tint: 0xb5a898, alpha: 0.62 },
  { key: ASSET_KEYS.sector04Chamber02BackgroundWallModule02, x: 2140, y: 214, width: 860, height: 454, tint: 0xa19487, alpha: 0.58 },
  { key: ASSET_KEYS.sector04Chamber02BackgroundOpening, x: 3260, y: 212, width: 1080, height: 482, tint: 0xd0c1ad, alpha: 0.76 },
  { key: ASSET_KEYS.sector04Chamber02BackgroundBossDais, x: 4180, y: 212, width: 980, height: 470, tint: 0xc3b19b, alpha: 0.68 },
  { key: ASSET_KEYS.sector04Chamber02BackgroundWallModule02, x: 5100, y: 214, width: 860, height: 454, tint: 0xa89888, alpha: 0.56 },
  { key: ASSET_KEYS.sector04Chamber02BackgroundWallModule01, x: 5880, y: 214, width: 860, height: 454, tint: 0x9e9081, alpha: 0.54 },
  { key: ASSET_KEYS.sector04Chamber02BackgroundThreshold, x: 6760, y: 212, width: 860, height: 460, tint: 0xcdbca8, alpha: 0.74 }
];

const LORE_ALTAR = { x: 760, y: WORLD.floorY - 106 };
const RETURN_ALTAR = { x: 3340, y: WORLD.floorY - 106 };
const THRESHOLD_PROPS = {
  gateX: 6330,
  doorX: 6640,
  y: WORLD.floorY - 128,
  width: 220,
  height: 220
};

export class Sector04Chamber02Scene extends Phaser.Scene {
  constructor() {
    super(CHAMBER.sceneKey);
  }

  init(data) {
    this.transitionContext = data ?? {};
    this.isRestartingRun = false;
  }

  create() {
    this.createWorld();
    this.audioDirector = new AudioDirector(this);
    this.audioDirector.playAmbientLoop(ASSET_KEYS.ambientChamber01Loop01, { volume: 0.102 });
    this.createBackdrop();
    this.createPlayer();
    this.createUi();
    this.configureLayout();
    this.cameras.main.fadeIn(600, 0, 0, 0);
  }

  createWorld() {
    this.physics.world.gravity.y = WORLD.gravityY;
    this.cameras.main.setBounds(0, 0, CHAMBER.worldWidth, WORLD.height);
    this.physics.world.setBounds(0, 0, CHAMBER.worldWidth, WORLD.height);
    this.cameras.main.setBackgroundColor('#070505');
    this.platforms = this.physics.add.staticGroup();
    this.createInvisiblePlatform(CHAMBER.worldWidth / 2, WORLD.floorY + 28, CHAMBER.worldWidth, CHAMBER.floorColliderHeight);
  }

  createBackdrop() {
    this.add.rectangle(CHAMBER.worldWidth / 2, WORLD.height / 2, CHAMBER.worldWidth, WORLD.height, 0x070505, 1).setDepth(-16);

    SEGMENTS.forEach((segment, index) => {
      if (this.textures.exists(segment.key)) {
        this.add.image(segment.x, segment.y, segment.key)
          .setDisplaySize(segment.width, segment.height)
          .setTint(segment.tint)
          .setAlpha(segment.alpha)
          .setDepth(-14.7 + index * 0.01);
      } else {
        this.add.rectangle(segment.x, segment.y + 10, segment.width, segment.height, 0x3d2f2a, 0.78)
          .setDepth(-14.7 + index * 0.01);
      }
      this.add.ellipse(segment.x, WORLD.floorY - 32, segment.width * 0.82, 62, 0x070504, 0.14 + index * 0.012).setDepth(-14.06);
    });

    if (this.textures.exists(ASSET_KEYS.sector04Chamber02AltarLore)) {
      this.add.image(LORE_ALTAR.x, LORE_ALTAR.y, ASSET_KEYS.sector04Chamber02AltarLore)
        .setDisplaySize(206, 206)
        .setTint(0xd8cab6)
        .setAlpha(0.88)
        .setDepth(-6.08);
    }

    if (this.textures.exists(ASSET_KEYS.sector04Chamber02AltarReturn)) {
      this.add.image(RETURN_ALTAR.x, RETURN_ALTAR.y, ASSET_KEYS.sector04Chamber02AltarReturn)
        .setDisplaySize(220, 220)
        .setTint(0xd2c3ae)
        .setAlpha(0.76)
        .setDepth(-6.08);
    }

    if (this.textures.exists(ASSET_KEYS.sector04Chamber02PropGate)) {
      this.add.image(THRESHOLD_PROPS.gateX, THRESHOLD_PROPS.y, ASSET_KEYS.sector04Chamber02PropGate)
        .setDisplaySize(THRESHOLD_PROPS.width, THRESHOLD_PROPS.height)
        .setTint(0xcbb8a0)
        .setAlpha(0.86)
        .setDepth(-5.9);
    }

    if (this.textures.exists(ASSET_KEYS.sector04Chamber02PropThresholdDoor)) {
      this.add.image(THRESHOLD_PROPS.doorX, THRESHOLD_PROPS.y, ASSET_KEYS.sector04Chamber02PropThresholdDoor)
        .setDisplaySize(THRESHOLD_PROPS.width, THRESHOLD_PROPS.height)
        .setTint(0xc3b098)
        .setAlpha(0.84)
        .setDepth(-5.89);
    }

    this.add.rectangle(CHAMBER.worldWidth / 2, WORLD.floorY - 14, CHAMBER.worldWidth, 96, 0x1a1411, 0.95).setDepth(-6.3);
    this.add.rectangle(CHAMBER.worldWidth / 2, WORLD.floorY - 48, CHAMBER.worldWidth, 24, 0x2c2018, 0.76).setDepth(-6.26);
    this.add.ellipse(CHAMBER.worldWidth / 2, WORLD.floorY + 10, CHAMBER.worldWidth, 54, 0x020202, 0.36).setDepth(-5.94);
  }

  createPlayer() {
    this.player = new Player(this, CHAMBER.spawnX, CHAMBER.spawnY, PLAYER);
    const entryIntegrity = applyChamberEntryRestore(this.transitionContext);
    this.player.health = entryIntegrity.current;
    this.player.maxHealth = entryIntegrity.max;
    this.physics.add.collider(this.player.sprite, this.platforms);
  }

  createUi() {
    this.hud = new HudOverlay(this);
    this.mobileControls = new MobileControls(this);
    this.setupMobileUiCamera();

    this.restartText = this.add.text(this.scale.width / 2, 90, '', {
      fontFamily: 'monospace', fontSize: '22px', color: '#d2c2ac', align: 'center'
    }).setScrollFactor(0).setDepth(35).setOrigin(0.5).setVisible(false);
    this.uiCamera?.ignore(this.restartText);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyAttack = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.keyRestart = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.applyResponsiveLayout, this);
      this.audioDirector?.shutdown();
    });
  }

  configureLayout() {
    this.cameras.main.startFollow(this.player.sprite, true, CHAMBER.cameraLerp.x, CHAMBER.cameraLerp.y, CHAMBER.desktopFollowOffsetX, 0);

    this.directionalCameraBias = createDirectionalCameraBias({
      camera: this.cameras.main,
      player: this.player,
      desktopBaseOffsetX: CHAMBER.desktopFollowOffsetX,
      portraitBaseOffsetX: CHAMBER.portraitFollowOffsetX,
      desktopLookAheadX: 56,
      portraitLookAheadX: 24
    });

    this.scale.on('resize', this.applyResponsiveLayout, this);
    this.applyResponsiveLayout();
    this.mobileControls.setMode('gameplay');
    this.directionalCameraBias?.update();
    this.hud.update(this.player.health, this.player.maxHealth);
  }

  update(time) {
    const mobileInput = this.mobileControls.getInputState();
    if (this.player.isDead) {
      this.mobileControls.setMode('dead');
      this.restartText.setVisible(true).setText('VESSEL FAILURE\nPress [R] to re-seed chamber');
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
    this.directionalCameraBias?.update();
    this.hud.update(this.player.health, this.player.maxHealth);
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

    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'Sector04Chamber02MobileUiCamera');
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
}
