import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import { PLAYER, WORLD } from '../data/milestone1Config.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';
import { restartRunFromDeath } from '../systems/RunReset.js';

const CHAMBER03_WORLD = {
  width: 2200,
  spawnX: 220,
  spawnY: 360,
  floorY: WORLD.floorY + 8,
  floorHeight: 92,
  floorColliderHeight: 72,
  headerX: 32,
  headerY: 28
};

export class Chamber03Scene extends Phaser.Scene {
  constructor() {
    super('Chamber03Scene');
  }

  init(data) {
    this.transitionContext = data ?? {};
  }

  create() {
    console.log('[Chamber03Scene] BOOT OK create()', this.transitionContext);

    this.physics.world.gravity.y = WORLD.gravityY;
    this.cameras.main.setBounds(0, 0, CHAMBER03_WORLD.width, WORLD.height);
    this.physics.world.setBounds(0, 0, CHAMBER03_WORLD.width, WORLD.height);
    this.cameras.main.setBackgroundColor('#2d201c');

    this.add
      .rectangle(CHAMBER03_WORLD.width / 2, WORLD.height / 2, CHAMBER03_WORLD.width, WORLD.height, 0x2d201c, 1)
      .setDepth(-20);
    this.add
      .rectangle(CHAMBER03_WORLD.width / 2, WORLD.height / 2 - 22, CHAMBER03_WORLD.width - 160, WORLD.height - 120, 0x4c372f, 1)
      .setStrokeStyle(6, 0x8c745f, 0.82)
      .setDepth(-19);
    this.add
      .rectangle(CHAMBER03_WORLD.width / 2, CHAMBER03_WORLD.floorY, CHAMBER03_WORLD.width, CHAMBER03_WORLD.floorHeight, 0xa58b73, 1)
      .setDepth(-11);
    this.add
      .rectangle(CHAMBER03_WORLD.width / 2, WORLD.floorY - 10, CHAMBER03_WORLD.width, 12, 0x8ea26d, 0.26)
      .setDepth(-10.8);

    this.add.text(CHAMBER03_WORLD.headerX, CHAMBER03_WORLD.headerY, 'CHAMBER 03 BOOT OK', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#f4e6d2',
      stroke: '#120c0b',
      strokeThickness: 6
    }).setScrollFactor(0).setDepth(40);

    this.add.text(120, 128, 'CHAMBER 03', {
      fontFamily: 'monospace',
      fontSize: '36px',
      color: '#eadac4',
      stroke: '#120c0b',
      strokeThickness: 6
    }).setDepth(12);

    this.add.text(120, 170, 'EMPTY BOOTSTRAP CHAMBER // RELIABILITY PASS', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#9fb17f'
    }).setDepth(12);

    this.platforms = this.physics.add.staticGroup();
    this.createInvisiblePlatform(
      CHAMBER03_WORLD.width / 2,
      WORLD.floorY + 28,
      CHAMBER03_WORLD.width,
      CHAMBER03_WORLD.floorColliderHeight
    );

    this.player = new Player(this, CHAMBER03_WORLD.spawnX, CHAMBER03_WORLD.spawnY, PLAYER);
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

  update(time) {
    if (!this.player || !this.mobileControls) {
      return;
    }

    const mobileInput = this.mobileControls.getInputState();

    if (this.player.isDead) {
      this.mobileControls.setMode('dead');
      this.restartText.setVisible(true).setText('VESSEL FAILURE\nPress [R] to re-seed chamber');
      if (Phaser.Input.Keyboard.JustDown(this.keyRestart) || mobileInput.interactPressed) {
        this.cleanupSceneUi();
        restartRunFromDeath(this);
      }
      return;
    }

    this.mobileControls.setMode('gameplay');
    this.restartText.setVisible(false);
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
}
