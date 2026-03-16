import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { COLORS, PLAYER, WORLD } from '../data/milestone1Config.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';

export class Chamber02Scene extends Phaser.Scene {
  constructor() {
    super('Chamber02Scene');
  }

  create() {
    this.physics.world.gravity.y = WORLD.gravityY;
    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);
    this.physics.world.setBounds(0, 0, WORLD.width, WORLD.height);

    this.cameras.main.setBackgroundColor('#070707');
    this.cameras.main.fadeIn(700, 0, 0, 0);

    this.platforms = this.physics.add.staticGroup();

    this.add
      .rectangle(WORLD.width / 2, WORLD.height / 2, WORLD.width, WORLD.height, COLORS.backdrop, 1)
      .setOrigin(0.5)
      .setDepth(-12);

    if (this.textures.exists(ASSET_KEYS.chamber02BackgroundPlate)) {
      this.add
        .image(WORLD.width / 2, 218, ASSET_KEYS.chamber02BackgroundPlate)
        .setDisplaySize(WORLD.width, 390)
        .setTint(0xc8baa3)
        .setAlpha(0.68)
        .setDepth(-11);
    }

    if (this.textures.exists(ASSET_KEYS.chamber02FloorStrip)) {
      this.add
        .tileSprite(WORLD.width / 2, WORLD.floorY + 4, WORLD.width, 110, ASSET_KEYS.chamber02FloorStrip)
        .setTint(0xd8cab4)
        .setAlpha(0.84)
        .setDepth(-9);
    }

    const floor = this.add
      .rectangle(WORLD.width / 2, WORLD.floorY + 28, WORLD.width, 72, COLORS.foreground, 0.9)
      .setOrigin(0.5)
      .setDepth(-8);
    this.physics.add.existing(floor, true);
    this.platforms.add(floor);

    if (this.textures.exists(ASSET_KEYS.chamber02VertebralHornGate)) {
      this.add
        .image(WORLD.width / 2, 270, ASSET_KEYS.chamber02VertebralHornGate)
        .setDisplaySize(370, 440)
        .setCrop(194, 166, 640, 1140)
        .setTint(0xd4c5af)
        .setAlpha(0.82)
        .setDepth(-7);
    }

    this.add.ellipse(WORLD.width / 2, 404, 420, 92, COLORS.sickly, 0.18).setDepth(-6);

    this.gateBarrier = this.add.zone(WORLD.width / 2, 342, 108, 214).setOrigin(0.5);
    this.physics.add.existing(this.gateBarrier, true);
    this.platforms.add(this.gateBarrier);

    this.player = new Player(this, 150, 360, PLAYER);
    this.physics.add.collider(this.player.sprite, this.platforms);

    this.hud = new HudOverlay(this);
    this.mobileControls = new MobileControls(this);
    this.setupMobileUiCamera();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyAttack = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08, -140, 0);
    this.scale.on('resize', this.applyResponsiveLayout, this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.applyResponsiveLayout, this);
    });

    this.applyResponsiveLayout();
    this.hud.update(this.player.health, PLAYER.maxHealth);

    this.add
      .text(WORLD.width / 2, 82, 'CHAMBER 02 // VERTEBRAL THRESHOLD', {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#d2c2ac',
        align: 'center'
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.add
      .text(WORLD.width / 2, 122, 'The gate remembered your marrow and opened without witness.', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#8a9f79',
        align: 'center'
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
  }

  update(time) {
    if (this.player.isDead) {
      this.mobileControls.setMode('dead');
      return;
    }

    this.mobileControls.setMode('gameplay');
    const mobileInput = this.mobileControls.getInputState();

    this.player.update(time, {
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
      this.mobileControls.setReservedBottomPx(height - worldBandHeight);
      return;
    }

    camera.setViewport(0, 0, width, height);
    camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
    this.mobileControls.setReservedBottomPx(0);
  }
}
