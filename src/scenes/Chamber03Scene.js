import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { COLORS, PLAYER, WORLD } from '../data/milestone1Config.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';
import { restartRunFromDeath } from '../systems/RunReset.js';

const CHAMBER03_WORLD = {
  width: 2800,
  spawnX: 220,
  spawnY: 360,
  floorHeight: 78,
  floorBandY: WORLD.floorY + 6,
  backdropY: 216,
  gateX: 220,
  gateY: 286
};

export class Chamber03Scene extends Phaser.Scene {
  constructor() {
    super('Chamber03Scene');
  }

  init(data) {
    this.transitionContext = data ?? {};
  }

  create() {
    console.log('[Chamber03Scene] create() start', this.transitionContext);

    try {
      this.createBootstrapScene();
    } catch (error) {
      console.error('[Chamber03Scene] create() failed', error);
      this.renderCreateFailureFallback(error);
    }
  }

  createBootstrapScene() {
    this.physics.world.gravity.y = WORLD.gravityY;
    this.cameras.main.setBounds(0, 0, CHAMBER03_WORLD.width, WORLD.height);
    this.physics.world.setBounds(0, 0, CHAMBER03_WORLD.width, WORLD.height);

    this.cameras.main.setBackgroundColor('#261917');

    this.add.rectangle(CHAMBER03_WORLD.width / 2, WORLD.height / 2, CHAMBER03_WORLD.width, WORLD.height, 0x261917, 1).setDepth(-20);
    this.bootstrapFloor = this.add.rectangle(
      CHAMBER03_WORLD.width / 2,
      CHAMBER03_WORLD.floorBandY,
      CHAMBER03_WORLD.width,
      CHAMBER03_WORLD.floorHeight,
      0x7f6a55,
      0.95
    ).setDepth(-11);
    this.bootstrapFloorGlow = this.add.rectangle(
      CHAMBER03_WORLD.width / 2,
      WORLD.floorY - 10,
      CHAMBER03_WORLD.width,
      12,
      0xa3b27d,
      0.2
    ).setDepth(-10.9);
    this.bootstrapLabel = this.add.text(CHAMBER03_WORLD.spawnX + 110, 112, 'CHAMBER 03', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#e0d3c1',
      stroke: '#120c0b',
      strokeThickness: 6
    }).setDepth(15);
    this.bootstrapSubLabel = this.add.text(CHAMBER03_WORLD.spawnX + 110, 152, 'BOOTSTRAP CHAMBER // PLACEHOLDER REUSE ACTIVE', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#98a97a'
    }).setDepth(15);

    this.renderReusedBackdrop();

    this.platforms = this.physics.add.staticGroup();
    this.createInvisiblePlatform(CHAMBER03_WORLD.width / 2, WORLD.floorY + 28, CHAMBER03_WORLD.width, 72);

    this.player = new Player(this, CHAMBER03_WORLD.spawnX, CHAMBER03_WORLD.spawnY, PLAYER);
    this.applyGameplayReadabilitySupport(this.player.sprite, { fill: 0xd8cfbb, alpha: 0.18, scale: 1.1 });
    this.physics.add.collider(this.player.sprite, this.platforms);

    this.cameras.main.centerOn(CHAMBER03_WORLD.spawnX, CHAMBER03_WORLD.spawnY - 60);

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

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyAttack = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.keyRestart = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08, -140, 0);
    this.scale.on('resize', this.applyResponsiveLayout, this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.applyResponsiveLayout, this);
      this.cleanupSceneUi();
    });

    this.applyResponsiveLayout();
    this.hud.update(this.player.health, PLAYER.maxHealth);
  }

  renderReusedBackdrop() {
    if (this.textures.exists(ASSET_KEYS.chamber01Wall)) {
      this.add.tileSprite(CHAMBER03_WORLD.width / 2, CHAMBER03_WORLD.backdropY, CHAMBER03_WORLD.width, 360, ASSET_KEYS.chamber01Wall)
        .setTint(0xcdbca5)
        .setAlpha(0.34)
        .setDepth(-18);
    }

    if (this.textures.exists(ASSET_KEYS.chamber02BackgroundPlate)) {
      this.add.tileSprite(CHAMBER03_WORLD.width / 2, CHAMBER03_WORLD.backdropY + 10, CHAMBER03_WORLD.width, 392, ASSET_KEYS.chamber02BackgroundPlate)
        .setTint(0xb8a489)
        .setAlpha(0.4)
        .setDepth(-17);
    }

    if (this.textures.exists(ASSET_KEYS.chamber02VertebralHornGate)) {
      this.add.image(CHAMBER03_WORLD.gateX, CHAMBER03_WORLD.gateY, ASSET_KEYS.chamber02VertebralHornGate)
        .setDisplaySize(292, 350)
        .setCrop(194, 166, 640, 1140)
        .setTint(0xcdb79b)
        .setAlpha(0.78)
        .setDepth(-13);
    }

    if (this.textures.exists(ASSET_KEYS.chamber01FloorStrip)) {
      this.add.tileSprite(CHAMBER03_WORLD.width / 2, WORLD.floorY + 10, CHAMBER03_WORLD.width, 86, ASSET_KEYS.chamber01FloorStrip)
        .setTint(0xd6c7b1)
        .setAlpha(0.5)
        .setDepth(-10.5);
    }

    if (this.textures.exists(ASSET_KEYS.chamber02FloorStrip)) {
      this.add.tileSprite(CHAMBER03_WORLD.width / 2, WORLD.floorY + 12, CHAMBER03_WORLD.width, 106, ASSET_KEYS.chamber02FloorStrip)
        .setTint(0xd2c2a9)
        .setAlpha(0.76)
        .setDepth(-10.4);
    }
  }

  update(_time) {
    if (!this.player || !this.mobileControls) {
      return;
    }

    const mobileInput = this.mobileControls.getInputState();

    if (this.player.isDead) {
      this.mobileControls.setMode('dead');
      this.restartText.setVisible(true).setText(`VESSEL FAILURE\nPress [R] to re-seed chamber`);
      if (Phaser.Input.Keyboard.JustDown(this.keyRestart) || mobileInput.interactPressed) {
        this.cleanupSceneUi();
        restartRunFromDeath(this);
      }
      return;
    }

    this.mobileControls.setMode('gameplay');
    this.restartText.setVisible(false);
    this.player.update(_time, {
      left: this.cursors.left.isDown || mobileInput.left,
      right: this.cursors.right.isDown || mobileInput.right,
      jumpPressed:
        Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
        mobileInput.jumpPressed,
      attackPressed: Phaser.Input.Keyboard.JustDown(this.keyAttack) || mobileInput.attackPressed
    });

    this.hud.update(this.player.health, PLAYER.maxHealth);
  }

  createInvisiblePlatform(x, y, width, height) {
    const platform = this.add.rectangle(x, y, width, height, 0x000000, 0).setOrigin(0.5);
    platform.setVisible(false);
    this.physics.add.existing(platform, true);
    this.platforms.add(platform);
    return platform;
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

  setupMobileUiCamera() {
    if (!this.mobileControls.enabled) {
      return;
    }

    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'Chamber03MobileUiCamera');

    const mobileUiElements = this.mobileControls.getUiElements();
    const mobileUiSet = new Set(mobileUiElements);
    const nonMobileObjects = this.children.list.filter((element) => !mobileUiSet.has(element));

    this.cameras.main.ignore(mobileUiElements);
    this.uiCamera.ignore(nonMobileObjects);
  }

  cleanupSceneUi() {
    this.restartText?.setVisible(false);
    this.mobileControls?.setMode('init');
    this.hud?.setVisible(false);
  }

  applyResponsiveLayout() {
    const camera = this.cameras.main;
    const width = this.scale.width;
    const height = this.scale.height;
    const isPortraitMobile = this.mobileControls.enabled && height >= width;

    if (this.uiCamera) {
      this.uiCamera.setViewport(0, 0, width, height);
    }

    this.restartText?.setPosition(width / 2, 90);

    if (isPortraitMobile) {
      const safeAreaBottom = this.mobileControls.getSafeAreaInsetPx('bottom');
      const maxWorldBandFromControlNeeds = height - PORTRAIT_LAYOUT.minControlBand - safeAreaBottom;
      const worldBandMax = Math.max(PORTRAIT_LAYOUT.worldBandMin, Math.min(PORTRAIT_LAYOUT.worldBandMax, maxWorldBandFromControlNeeds));
      const worldBandHeight = Phaser.Math.Clamp(Math.floor(height * PORTRAIT_LAYOUT.worldBandRatio), PORTRAIT_LAYOUT.worldBandMin, worldBandMax);
      camera.setViewport(0, 0, width, worldBandHeight);
      camera.setZoom(PORTRAIT_LAYOUT.portraitZoom);
      camera.setFollowOffset(-120, PORTRAIT_LAYOUT.portraitFollowOffsetY);
      this.mobileControls.setReservedBottomPx(height - worldBandHeight);
      this.restartText?.setPosition(width / 2, Math.max(PORTRAIT_LAYOUT.restartTextMinY, worldBandHeight * PORTRAIT_LAYOUT.restartTextRatioY));
      return;
    }

    camera.setViewport(0, 0, width, height);
    camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
    camera.setFollowOffset(-140, PORTRAIT_LAYOUT.desktopFollowOffsetY);
    this.mobileControls.setReservedBottomPx(0);
  }

  renderCreateFailureFallback(error) {
    this.cameras.main.setBackgroundColor('#3a1616');
    this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x3a1616, 1).setScrollFactor(0);
    this.add.text(this.scale.width / 2, this.scale.height / 2 - 22, 'CHAMBER 03 BOOT FAILED', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#f0d7cf',
      align: 'center'
    }).setOrigin(0.5).setScrollFactor(0);
    this.add.text(this.scale.width / 2, this.scale.height / 2 + 26, String(error?.message ?? error ?? 'Unknown create() error'), {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#f0d7cf',
      align: 'center',
      wordWrap: { width: Math.max(320, this.scale.width - 80) }
    }).setOrigin(0.5).setScrollFactor(0);
  }
}
