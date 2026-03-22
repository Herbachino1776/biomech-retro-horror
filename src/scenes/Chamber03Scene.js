import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { COLORS, PLAYER, WORLD } from '../data/milestone1Config.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';
import { restartRunFromDeath } from '../systems/RunReset.js';
import { AudioDirector } from '../audio/AudioDirector.js';

const CHAMBER03_WORLD_WIDTH = 2800;
const CHAMBER03_SPAWN = { x: 220, y: 360 };
const CHAMBER03_FLOOR = {
  x: CHAMBER03_WORLD_WIDTH / 2,
  y: WORLD.floorY + 28,
  width: CHAMBER03_WORLD_WIDTH,
  height: 72
};
const CHAMBER03_PLATFORMS = [
  { x: 820, y: 384, width: 180, height: 20 },
  { x: 1420, y: 352, width: 170, height: 20 },
  { x: 2040, y: 392, width: 220, height: 20 }
];

export class Chamber03Scene extends Phaser.Scene {
  constructor() {
    super('Chamber03Scene');
  }

  init(data) {
    this.transitionContext = data ?? {};
  }

  create() {
    this.physics.world.gravity.y = WORLD.gravityY;
    this.cameras.main.setBounds(0, 0, CHAMBER03_WORLD_WIDTH, WORLD.height);
    this.physics.world.setBounds(0, 0, CHAMBER03_WORLD_WIDTH, WORLD.height);
    this.cameras.main.setBackgroundColor('#070707');
    this.cameras.main.fadeIn(700, 0, 0, 0);

    this.isRestartingRun = false;
    this.platforms = this.physics.add.staticGroup();

    this.renderProcessionalBackdrop();
    this.createPlatforms();

    this.audioDirector = new AudioDirector(this);
    this.audioDirector.playAmbientLoop(ASSET_KEYS.ambientChamber02Loop01);

    this.player = new Player(this, CHAMBER03_SPAWN.x, CHAMBER03_SPAWN.y, PLAYER);
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
      .text(this.scale.width / 2, 28, 'CHAMBER 03 // STABLE ENTRY CHAMBER', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#9bb085',
        align: 'center'
      })
      .setScrollFactor(0)
      .setDepth(34)
      .setOrigin(0.5);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyAttack = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.keyRestart = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

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
      .rectangle(CHAMBER03_WORLD_WIDTH / 2, WORLD.height / 2, CHAMBER03_WORLD_WIDTH, WORLD.height, COLORS.backdrop, 1)
      .setOrigin(0.5)
      .setDepth(-14);

    const segmentWidth = 560;
    const segmentCount = Math.ceil(CHAMBER03_WORLD_WIDTH / segmentWidth) + 1;

    for (let i = 0; i < segmentCount; i += 1) {
      const segmentX = i * segmentWidth + segmentWidth / 2;
      const panelTint = i % 2 === 0 ? 0xbfae95 : 0xb1a38e;

      if (this.textures.exists(ASSET_KEYS.chamber02BackgroundPlate)) {
        this.add
          .image(segmentX, 220, ASSET_KEYS.chamber02BackgroundPlate)
          .setDisplaySize(segmentWidth + 40, 382)
          .setTint(panelTint)
          .setAlpha(0.46)
          .setDepth(-13);
      } else {
        this.add
          .rectangle(segmentX, 220, segmentWidth + 40, 382, COLORS.architecture, 0.5)
          .setStrokeStyle(2, COLORS.rust, 0.25)
          .setDepth(-13);
      }

      if (this.textures.exists(ASSET_KEYS.chamber02ForegroundHornArch) && i % 2 === 1) {
        this.add
          .image(segmentX + 28, 274, ASSET_KEYS.chamber02ForegroundHornArch)
          .setDisplaySize(220, 214)
          .setTint(0xb39f89)
          .setAlpha(0.14)
          .setDepth(-12);
      }
    }

    this.add.ellipse(460, 210, 540, 300, 0x15100e, 0.22).setDepth(-11);
    this.add.ellipse(1420, 208, 620, 320, 0x15100e, 0.22).setDepth(-11);
    this.add.ellipse(2280, 214, 540, 300, 0x15100e, 0.22).setDepth(-11);
  }

  createPlatforms() {
    this.createInvisiblePlatform(CHAMBER03_FLOOR.x, CHAMBER03_FLOOR.y, CHAMBER03_FLOOR.width, CHAMBER03_FLOOR.height);

    if (this.textures.exists(ASSET_KEYS.chamber02FloorStrip)) {
      this.add
        .tileSprite(CHAMBER03_WORLD_WIDTH / 2, WORLD.floorY + 4, CHAMBER03_WORLD_WIDTH, 116, ASSET_KEYS.chamber02FloorStrip)
        .setTint(0xd8cab4)
        .setAlpha(0.78)
        .setDepth(-10);
    } else {
      this.add
        .rectangle(CHAMBER03_WORLD_WIDTH / 2, WORLD.floorY + 4, CHAMBER03_WORLD_WIDTH, 116, COLORS.foreground, 0.88)
        .setDepth(-10);
    }

    this.add.rectangle(CHAMBER03_WORLD_WIDTH / 2, WORLD.floorY + 32, CHAMBER03_WORLD_WIDTH, 70, 0x120e0d, 0.42).setDepth(-9.8);
    this.add.rectangle(CHAMBER03_WORLD_WIDTH / 2, WORLD.floorY - 46, CHAMBER03_WORLD_WIDTH, 8, 0xd4c19f, 0.16).setDepth(-9.7);

    CHAMBER03_PLATFORMS.forEach((platform) => {
      this.createInvisiblePlatform(platform.x, platform.y, platform.width, platform.height);
      this.add.rectangle(platform.x, platform.y + 4, platform.width, 22, 0x1a1412, 0.48).setDepth(-9.4);
      this.add.rectangle(platform.x, platform.y - 4, platform.width, 6, 0xc9b89d, 0.16).setDepth(-9.3);
    });
  }

  createInvisiblePlatform(x, y, width, height) {
    const platform = this.add.rectangle(x, y, width, height, 0x000000, 0).setOrigin(0.5);
    platform.setVisible(false);
    this.physics.add.existing(platform, true);
    this.platforms.add(platform);
    return platform;
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
    this.mobileControls.setMode('gameplay');
    this.player.update(time, this.getCombinedInput(mobileInput));
    this.hud.update(this.player.health, PLAYER.maxHealth);
  }

  getCombinedInput(mobileInput) {
    return {
      left: this.cursors.left.isDown || mobileInput.left,
      right: this.cursors.right.isDown || mobileInput.right,
      jumpPressed:
        Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
        mobileInput.jumpPressed,
      attackPressed: Phaser.Input.Keyboard.JustDown(this.keyAttack) || mobileInput.attackPressed
    };
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

  applyGameplayReadabilitySupport(target, { fill = 0xd2c2ac, alpha = 0.16, scale = 1.08 } = {}) {
    if (!target) {
      return null;
    }

    const shadow = this.add
      .ellipse(target.x, WORLD.floorY + 6, 104 * scale, 22 * scale, 0x050404, alpha * 1.1)
      .setDepth(target.depth - 0.6);
    const halo = this.add
      .ellipse(target.x, target.y - 6, 86 * scale, 120 * scale, fill, alpha)
      .setDepth(target.depth - 0.4);

    target.__gameplayShadow = shadow;
    target.__gameplayHalo = halo;

    return this.events.on(Phaser.Scenes.Events.UPDATE, () => {
      if (!target.active) {
        halo.setVisible(false);
        shadow.setVisible(false);
        return;
      }

      halo
        .setVisible(target.visible)
        .setPosition(target.x, target.y - 8)
        .setAlpha(target.visible ? alpha : 0);
      shadow
        .setVisible(target.visible)
        .setPosition(target.x, WORLD.floorY + 6)
        .setAlpha(target.visible ? alpha * 1.1 : 0);
    });
  }

  cleanupSceneUi() {
    this.restartText?.setVisible(false);
    this.chamberLabel?.setVisible(false);
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
      camera.setFollowOffset(-110, PORTRAIT_LAYOUT.portraitFollowOffsetY);
      this.mobileControls.setReservedBottomPx(height - worldBandHeight);
      this.restartText.setPosition(
        width / 2,
        Math.max(PORTRAIT_LAYOUT.restartTextMinY, worldBandHeight * PORTRAIT_LAYOUT.restartTextRatioY)
      );
      this.chamberLabel.setPosition(width / 2, 26);
      this.hud.layoutBossBar();
      return;
    }

    camera.setViewport(0, 0, width, height);
    camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
    camera.setFollowOffset(-132, PORTRAIT_LAYOUT.desktopFollowOffsetY);
    this.mobileControls.setReservedBottomPx(0);
    this.restartText.setPosition(width / 2, 90);
    this.chamberLabel.setPosition(width / 2, 28);
    this.hud.layoutBossBar();
  }
}
