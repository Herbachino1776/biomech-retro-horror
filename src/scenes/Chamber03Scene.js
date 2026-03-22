import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';
import { COLORS, PLAYER, WORLD } from '../data/milestone1Config.js';
import { restartRunFromDeath } from '../systems/RunReset.js';
import { AudioDirector } from '../audio/AudioDirector.js';

const CHAMBER03_WORLD = {
  width: 2400,
  height: WORLD.height,
  floorY: WORLD.floorY
};

const CHAMBER03_BOOTSTRAP = {
  spawnX: 268,
  spawnY: 360,
  floorHeight: 72,
  processionalCenterY: 220,
  thresholdGateX: 120,
  thresholdGateY: 278,
  thresholdGateDisplayWidth: 286,
  thresholdGateDisplayHeight: 336,
  thresholdBarrierWidth: 76,
  thresholdBarrierHeight: 236,
  fallbackBackdropTint: 0xb7a790,
  fallbackBackdropAlpha: 0.32,
  floorTint: 0xd2c2ac,
  floorAlpha: 0.82,
  hallVeilAlpha: 0.08,
  landmarkX: 1730,
  landmarkY: 284,
  chamberLabel: 'CHAMBER 03 // OSSUARY CHOIR HALL'
};

const CHAMBER03_PROCESSIONAL_SEGMENT_WIDTH = 520;
const CHAMBER03_LANDMARKS = [
  { x: 640, y: 270, scale: 0.88, alpha: 0.16 },
  { x: 1220, y: 254, scale: 1.02, alpha: 0.22 },
  { x: 1780, y: 282, scale: 1.18, alpha: 0.24 }
];

export class Chamber03Scene extends Phaser.Scene {
  constructor() {
    super('Chamber03Scene');
  }

  init(data) {
    this.transitionContext = data ?? {};
  }

  create() {
    this.player = null;
    this.hud = null;
    this.mobileControls = null;
    this.uiCamera = null;
    this.platforms = this.physics.add.staticGroup();

    this.physics.world.gravity.y = WORLD.gravityY;
    this.cameras.main.setBounds(0, 0, CHAMBER03_WORLD.width, CHAMBER03_WORLD.height);
    this.physics.world.setBounds(0, 0, CHAMBER03_WORLD.width, CHAMBER03_WORLD.height);
    this.cameras.main.setBackgroundColor('#090706');
    this.cameras.main.fadeIn(700, 0, 0, 0);

    this.renderProcessionalBackdrop();
    this.createPlatforms();
    this.createEntryThreshold();

    this.audioDirector = new AudioDirector(this);
    this.audioDirector.playAmbientLoop(ASSET_KEYS.ambientChamber02Loop01);

    this.player = new Player(this, CHAMBER03_BOOTSTRAP.spawnX, CHAMBER03_BOOTSTRAP.spawnY, PLAYER);
    this.applyGameplayReadabilitySupport(this.player.sprite, { fill: 0xd8cfbb, alpha: 0.18, scale: 1.1 });
    this.physics.add.collider(this.player.sprite, this.platforms);

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

    this.chamberLabel = this.add
      .text(this.scale.width / 2, 44, CHAMBER03_BOOTSTRAP.chamberLabel, {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#8f7d72',
        align: 'center'
      })
      .setScrollFactor(0)
      .setDepth(30)
      .setOrigin(0.5);

    this.bootstrapHint = this.add
      .text(this.scale.width / 2, 68, 'BOOTSTRAP SLICE // CHAMBER 02 THRESHOLD CARRIED FORWARD', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#6f8360',
        align: 'center'
      })
      .setScrollFactor(0)
      .setDepth(30)
      .setOrigin(0.5);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyAttack = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.keyRestart = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.cameras.main.centerOn(CHAMBER03_BOOTSTRAP.spawnX + 120, WORLD.floorY - 84);
    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08, -140, 0);

    this.scale.on('resize', this.applyResponsiveLayout, this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.applyResponsiveLayout, this);
      this.audioDirector?.shutdown();
      this.cleanupSceneUi();
    });

    this.applyResponsiveLayout();
    this.hud.update(this.player.health, PLAYER.maxHealth);
  }

  renderProcessionalBackdrop() {
    this.add
      .rectangle(CHAMBER03_WORLD.width / 2, CHAMBER03_WORLD.height / 2, CHAMBER03_WORLD.width, CHAMBER03_WORLD.height, COLORS.backdrop, 1)
      .setOrigin(0.5)
      .setDepth(-14);

    const segmentCount = Math.ceil(CHAMBER03_WORLD.width / CHAMBER03_PROCESSIONAL_SEGMENT_WIDTH) + 1;

    for (let i = 0; i < segmentCount; i += 1) {
      const segmentX = i * CHAMBER03_PROCESSIONAL_SEGMENT_WIDTH + CHAMBER03_PROCESSIONAL_SEGMENT_WIDTH / 2;
      const parityTint = i % 2 === 0 ? 0xc3b39a : 0xb19f87;

      if (this.textures.exists(ASSET_KEYS.chamber02BackgroundPlate)) {
        this.add
          .image(segmentX, CHAMBER03_BOOTSTRAP.processionalCenterY, ASSET_KEYS.chamber02BackgroundPlate)
          .setDisplaySize(CHAMBER03_PROCESSIONAL_SEGMENT_WIDTH + 44, 396)
          .setTint(parityTint)
          .setAlpha(0.46)
          .setDepth(-13);
      } else {
        this.add
          .rectangle(segmentX, CHAMBER03_BOOTSTRAP.processionalCenterY, CHAMBER03_PROCESSIONAL_SEGMENT_WIDTH + 44, 396, COLORS.architecture, 0.52)
          .setStrokeStyle(2, COLORS.rust, 0.25)
          .setDepth(-13);
      }

      if (this.textures.exists(ASSET_KEYS.chamber02ForegroundHornArch) && i % 2 === 1) {
        this.add
          .image(segmentX + 16, 270, ASSET_KEYS.chamber02ForegroundHornArch)
          .setDisplaySize(250, 236)
          .setTint(0xb6a28d)
          .setAlpha(0.16)
          .setDepth(-11.5);
      }
    }

    this.add
      .ellipse(CHAMBER03_WORLD.width / 2, 274, CHAMBER03_WORLD.width - 240, 282, COLORS.oil, 0.24)
      .setDepth(-12);

    CHAMBER03_LANDMARKS.forEach((landmark) => {
      if (this.textures.exists(ASSET_KEYS.chamber02ForegroundHornArch)) {
        this.add
          .image(landmark.x, landmark.y, ASSET_KEYS.chamber02ForegroundHornArch)
          .setDisplaySize(260 * landmark.scale, 252 * landmark.scale)
          .setTint(0xc8b59d)
          .setAlpha(landmark.alpha)
          .setDepth(-11);
        return;
      }

      this.add
        .ellipse(landmark.x, landmark.y + 8, 260 * landmark.scale, 220 * landmark.scale, COLORS.bone, landmark.alpha)
        .setDepth(-11);
    });

    this.add
      .ellipse(CHAMBER03_BOOTSTRAP.landmarkX, CHAMBER03_BOOTSTRAP.landmarkY + 18, 420, 240, COLORS.sickly, CHAMBER03_BOOTSTRAP.hallVeilAlpha)
      .setDepth(-10.8);

    this.add
      .ellipse(CHAMBER03_WORLD.width - 240, WORLD.floorY - 66, 280, 140, COLORS.oil, 0.22)
      .setDepth(-10.6);
  }

  createPlatforms() {
    this.floor = this.createInvisiblePlatform(
      CHAMBER03_WORLD.width / 2,
      WORLD.floorY + 28,
      CHAMBER03_WORLD.width,
      CHAMBER03_BOOTSTRAP.floorHeight
    );

    if (this.textures.exists(ASSET_KEYS.chamber02FloorStrip)) {
      this.add
        .tileSprite(CHAMBER03_WORLD.width / 2, WORLD.floorY + 4, CHAMBER03_WORLD.width, 116, ASSET_KEYS.chamber02FloorStrip)
        .setTint(CHAMBER03_BOOTSTRAP.floorTint)
        .setAlpha(CHAMBER03_BOOTSTRAP.floorAlpha)
        .setDepth(-10);
    } else if (this.textures.exists(ASSET_KEYS.chamber01FloorStrip)) {
      this.add
        .tileSprite(CHAMBER03_WORLD.width / 2, WORLD.floorY + 10, CHAMBER03_WORLD.width, 88, ASSET_KEYS.chamber01FloorStrip)
        .setTint(CHAMBER03_BOOTSTRAP.floorTint)
        .setAlpha(0.78)
        .setDepth(-10);
    } else {
      this.add
        .rectangle(CHAMBER03_WORLD.width / 2, WORLD.floorY + 10, CHAMBER03_WORLD.width, 86, COLORS.foreground, 0.92)
        .setDepth(-10);
      this.add
        .rectangle(CHAMBER03_WORLD.width / 2, WORLD.floorY - 20, CHAMBER03_WORLD.width, 8, COLORS.bone, 0.28)
        .setDepth(-9.8);
    }
  }

  createEntryThreshold() {
    this.entryThresholdBarrier = this.createInvisiblePlatform(
      CHAMBER03_BOOTSTRAP.thresholdGateX + 24,
      WORLD.floorY - 4 - CHAMBER03_BOOTSTRAP.thresholdBarrierHeight / 2,
      CHAMBER03_BOOTSTRAP.thresholdBarrierWidth,
      CHAMBER03_BOOTSTRAP.thresholdBarrierHeight
    ).setDepth(-5.6);

    if (this.textures.exists(ASSET_KEYS.chamber02VertebralHornGate)) {
      this.entryThresholdArt = this.add
        .image(
          CHAMBER03_BOOTSTRAP.thresholdGateX,
          CHAMBER03_BOOTSTRAP.thresholdGateY,
          ASSET_KEYS.chamber02VertebralHornGate
        )
        .setDisplaySize(
          CHAMBER03_BOOTSTRAP.thresholdGateDisplayWidth,
          CHAMBER03_BOOTSTRAP.thresholdGateDisplayHeight
        )
        .setCrop(194, 166, 640, 1140)
        .setTint(0xd1c0a7)
        .setAlpha(0.76)
        .setDepth(-5.4);
    } else {
      this.entryThresholdArt = this.add
        .rectangle(CHAMBER03_BOOTSTRAP.thresholdGateX, WORLD.floorY - 122, 112, 252, COLORS.foreground, 0.92)
        .setStrokeStyle(3, COLORS.bone, 0.8)
        .setDepth(-5.4);
    }

    this.entryThresholdSigil = this.add
      .ellipse(CHAMBER03_BOOTSTRAP.thresholdGateX + 22, 326, 42, 94, COLORS.sickly, 0.14)
      .setDepth(-5.3);
    this.entryThresholdAura = this.add
      .ellipse(CHAMBER03_BOOTSTRAP.thresholdGateX + 126, WORLD.floorY - 10, 176, 96, COLORS.sickly, 0.12)
      .setDepth(-5.25);
    this.entryThresholdLabel = this.add
      .text(CHAMBER03_BOOTSTRAP.thresholdGateX + 112, WORLD.floorY - 138, 'THRESHOLD SEALED BEHIND YOU', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#b8ab8c',
        align: 'center'
      })
      .setOrigin(0.5)
      .setDepth(-5.22)
      .setAlpha(0.74);
  }

  createInvisiblePlatform(x, y, width, height) {
    const platform = this.add.rectangle(x, y, width, height, 0x000000, 0).setOrigin(0.5);
    platform.setVisible(false);
    this.physics.add.existing(platform, true);
    this.platforms.add(platform);
    return platform;
  }

  update(time) {
    const mobileInput = this.mobileControls?.getInputState?.() ?? {
      left: false,
      right: false,
      jumpPressed: false,
      attackPressed: false,
      interactPressed: false
    };

    if (!this.player || !this.cursors || !this.keyAttack || !this.keyRestart || !this.restartText) {
      return;
    }

    if (this.player.isDead) {
      this.mobileControls?.setMode('dead');
      this.restartText.setVisible(true).setText('VESSEL FAILURE\nPress [R] to re-seed chamber');
      if (Phaser.Input.Keyboard.JustDown(this.keyRestart) || mobileInput.interactPressed) {
        this.cleanupSceneUi();
        restartRunFromDeath(this);
      }
      return;
    }

    this.restartText.setVisible(false);
    this.mobileControls?.setMode('gameplay');

    this.player.update(time, {
      left: this.cursors.left.isDown || mobileInput.left,
      right: this.cursors.right.isDown || mobileInput.right,
      jumpPressed:
        Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
        mobileInput.jumpPressed,
      attackPressed: Phaser.Input.Keyboard.JustDown(this.keyAttack) || mobileInput.attackPressed
    });

    this.hud?.update(this.player.health, PLAYER.maxHealth);
  }

  setupMobileUiCamera() {
    if (!this.mobileControls?.enabled) {
      return;
    }

    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'Chamber03MobileUiCamera');

    const mobileUiElements = this.mobileControls.getUiElements();
    const mobileUiSet = new Set(mobileUiElements);
    const nonMobileObjects = this.children.list.filter((element) => !mobileUiSet.has(element));

    this.cameras.main.ignore(mobileUiElements);
    this.uiCamera.ignore(nonMobileObjects);
  }

  applyGameplayReadabilitySupport(target, { fill = 0xd2c2ac, alpha = 0.16, scale = 1.08 } = {}) {
    if (!target) {
      return null;
    }

    const shadow = this.add
      .ellipse(target.x, WORLD.floorY + 6, 104 * scale, 22 * scale, 0x050404, alpha * 1.05)
      .setDepth(target.depth - 0.6);
    const halo = this.add
      .ellipse(target.x, target.y - 6, 84 * scale, 118 * scale, fill, alpha)
      .setDepth(target.depth - 0.4);

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

  cleanupSceneUi() {
    this.restartText?.setVisible(false);
    this.chamberLabel?.setVisible(false);
    this.bootstrapHint?.setVisible(false);
    this.mobileControls?.setMode('init');
    this.hud?.setVisible(false);
  }

  applyResponsiveLayout() {
    const camera = this.cameras.main;
    const width = this.scale.width;
    const height = this.scale.height;
    const isPortraitMobile = this.mobileControls?.enabled && height >= width;

    if (this.uiCamera) {
      this.uiCamera.setViewport(0, 0, width, height);
    }

    this.chamberLabel?.setPosition(width / 2, 44);
    this.bootstrapHint?.setPosition(width / 2, 68);

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
      camera.setFollowOffset(-120, PORTRAIT_LAYOUT.portraitFollowOffsetY);
      this.mobileControls.setReservedBottomPx(height - worldBandHeight);
      this.restartText?.setPosition(
        width / 2,
        Math.max(PORTRAIT_LAYOUT.restartTextMinY, worldBandHeight * PORTRAIT_LAYOUT.restartTextRatioY)
      );
      return;
    }

    camera.setViewport(0, 0, width, height);
    camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
    camera.setFollowOffset(-140, PORTRAIT_LAYOUT.desktopFollowOffsetY);
    this.mobileControls?.setReservedBottomPx(0);
    this.restartText?.setPosition(width / 2, 90);
  }
}
