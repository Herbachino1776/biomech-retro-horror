import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { COLORS, PLAYER, WORLD } from '../data/milestone1Config.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';
import { restartRunFromDeath } from '../systems/RunReset.js';
import { AudioDirector } from '../audio/AudioDirector.js';

const CHAMBER03_WORLD_WIDTH = 3320;
const CHAMBER03_ENTRY_SPAWN = { x: 240, y: 356 };
const CHAMBER03_FLOOR_HEIGHT = 72;
const CHAMBER03_PLATFORMS = [
  { x: 880, y: 380, width: 220, height: 18 },
  { x: 1440, y: 348, width: 180, height: 18 },
  { x: 2100, y: 394, width: 260, height: 18 },
  { x: 2780, y: 362, width: 210, height: 18 }
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
    this.physics.world.setBounds(0, 0, CHAMBER03_WORLD_WIDTH, WORLD.height);
    this.cameras.main.setBounds(0, 0, CHAMBER03_WORLD_WIDTH, WORLD.height);
    this.cameras.main.setBackgroundColor('#080707');
    this.cameras.main.fadeIn(700, 0, 0, 0);

    this.isRestartingRun = false;
    this.platforms = this.physics.add.staticGroup();

    this.renderBackdrop();
    this.createPlatforms();

    this.audioDirector = new AudioDirector(this);
    this.audioDirector.playAmbientLoop(ASSET_KEYS.ambientChamber02Loop01);

    this.player = new Player(this, CHAMBER03_ENTRY_SPAWN.x, CHAMBER03_ENTRY_SPAWN.y, PLAYER);
    this.applyGameplayReadabilitySupport(this.player.sprite, { fill: 0xd8cfbb, alpha: 0.18, scale: 1.08 });
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
      .text(this.scale.width / 2, 120, 'CHAMBER 03 // OSSUARY CHOIR HALL', {
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

    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08, -120, 0);
    this.scale.on('resize', this.applyResponsiveLayout, this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.applyResponsiveLayout, this);
      this.audioDirector?.shutdown();
      this.cleanupSceneUi();
    });

    this.applyResponsiveLayout();
    this.hud.update(this.player.health, PLAYER.maxHealth);
  }

  renderBackdrop() {
    this.add.rectangle(CHAMBER03_WORLD_WIDTH / 2, WORLD.height / 2, CHAMBER03_WORLD_WIDTH, WORLD.height, 0x0a0807, 1).setDepth(-20);

    const hasEntryNave = this.textures.exists(ASSET_KEYS.chamber03BackdropEntryNave);
    const hasWallModule = this.textures.exists(ASSET_KEYS.chamber03BackdropWallModule);
    const segmentWidth = 620;
    const segmentCount = Math.ceil(CHAMBER03_WORLD_WIDTH / segmentWidth) + 1;

    for (let i = 0; i < segmentCount; i += 1) {
      const centerX = i * segmentWidth + segmentWidth / 2;
      if (hasEntryNave) {
        this.add
          .image(centerX, 222, ASSET_KEYS.chamber03BackdropEntryNave)
          .setDisplaySize(segmentWidth + 40, 408)
          .setTint(i % 2 === 0 ? 0xd0c0a8 : 0xc0b096)
          .setAlpha(0.46)
          .setDepth(-19);
      } else if (this.textures.exists(ASSET_KEYS.chamber02BackgroundPlate)) {
        this.add
          .image(centerX, 222, ASSET_KEYS.chamber02BackgroundPlate)
          .setDisplaySize(segmentWidth + 40, 392)
          .setTint(i % 2 === 0 ? 0xbca58c : 0xaf997f)
          .setAlpha(0.4)
          .setDepth(-19);
      } else {
        this.add
          .rectangle(centerX, 222, segmentWidth + 40, 392, COLORS.architecture, 0.56)
          .setStrokeStyle(2, COLORS.rust, 0.3)
          .setDepth(-19);
      }

      if (hasWallModule && i % 2 === 1) {
        this.add
          .image(centerX + 60, 244, ASSET_KEYS.chamber03BackdropWallModule)
          .setDisplaySize(248, 256)
          .setTint(0xbdab92)
          .setAlpha(0.18)
          .setDepth(-18);
      }
    }

    this.add.ellipse(500, WORLD.floorY - 42, 780, 220, 0x27311d, 0.11).setDepth(-17);
    this.add.ellipse(1660, WORLD.floorY - 56, 880, 240, 0x3c3327, 0.1).setDepth(-17);
    this.add.ellipse(2800, WORLD.floorY - 36, 820, 220, 0x27311d, 0.1).setDepth(-17);

    if (this.textures.exists(ASSET_KEYS.chamber02FloorStrip)) {
      this.add
        .tileSprite(CHAMBER03_WORLD_WIDTH / 2, WORLD.floorY + 5, CHAMBER03_WORLD_WIDTH, 116, ASSET_KEYS.chamber02FloorStrip)
        .setTint(0xd2c1a8)
        .setAlpha(0.8)
        .setDepth(-16);
    } else {
      this.add.rectangle(CHAMBER03_WORLD_WIDTH / 2, WORLD.floorY + 4, CHAMBER03_WORLD_WIDTH, 108, 0x241d19, 0.92).setDepth(-16);
    }

    this.add.rectangle(CHAMBER03_WORLD_WIDTH / 2, WORLD.floorY - 54, CHAMBER03_WORLD_WIDTH, 8, 0xb6a58f, 0.2).setDepth(-15);
  }

  createPlatforms() {
    this.createInvisiblePlatform(CHAMBER03_WORLD_WIDTH / 2, WORLD.floorY + CHAMBER03_FLOOR_HEIGHT / 2 + 2, CHAMBER03_WORLD_WIDTH, CHAMBER03_FLOOR_HEIGHT);
    CHAMBER03_PLATFORMS.forEach((platform) => {
      this.createInvisiblePlatform(platform.x, platform.y, platform.width, platform.height);
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
      this.restartText.setVisible(true).setText(`VESSEL FAILURE\nPress [R] to re-seed chamber`);
      if ((Phaser.Input.Keyboard.JustDown(this.keyRestart) || mobileInput.interactPressed) && !this.isRestartingRun) {
        this.isRestartingRun = true;
        this.cleanupSceneUi();
        restartRunFromDeath(this);
      }
      return;
    }

    this.restartText.setVisible(false);
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

    this.hud.update(this.player.health, PLAYER.maxHealth);
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
      const worldBandMax = Math.max(PORTRAIT_LAYOUT.worldBandMin, Math.min(PORTRAIT_LAYOUT.worldBandMax, maxWorldBandFromControlNeeds));
      const worldBandHeight = Phaser.Math.Clamp(
        Math.floor(height * PORTRAIT_LAYOUT.worldBandRatio),
        PORTRAIT_LAYOUT.worldBandMin,
        worldBandMax
      );
      camera.setViewport(0, 0, width, worldBandHeight);
      camera.setZoom(PORTRAIT_LAYOUT.portraitZoom);
      camera.setFollowOffset(-96, PORTRAIT_LAYOUT.portraitFollowOffsetY);
      this.mobileControls.setReservedBottomPx(height - worldBandHeight);
      this.restartText.setPosition(width / 2, Math.max(PORTRAIT_LAYOUT.restartTextMinY, worldBandHeight * PORTRAIT_LAYOUT.restartTextRatioY));
      this.chamberLabel.setPosition(width / 2, Math.max(34, worldBandHeight * 0.16));
      return;
    }

    camera.setViewport(0, 0, width, height);
    camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
    camera.setFollowOffset(-120, PORTRAIT_LAYOUT.desktopFollowOffsetY);
    this.mobileControls.setReservedBottomPx(0);
    this.restartText.setPosition(width / 2, 90);
    this.chamberLabel.setPosition(width / 2, 44);
  }
}
