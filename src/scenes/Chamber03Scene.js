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
const CHAMBER03_FLOOR_BODY = {
  y: WORLD.floorY + 32,
  width: CHAMBER03_WORLD_WIDTH,
  height: 80
};
const CHAMBER03_STEP_PLATFORMS = [
  { x: 820, y: 412, width: 220, height: 18 },
  { x: 1440, y: 386, width: 240, height: 18 },
  { x: 2060, y: 420, width: 220, height: 18 }
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
    this.cameras.main.setBackgroundColor('#090707');
    this.cameras.main.fadeIn(700, 0, 0, 0);

    this.isRestartingRun = false;
    this.platforms = this.physics.add.staticGroup();

    this.renderBackdrop();
    this.renderFloorBand();
    this.createPlatforms();

    this.audioDirector = new AudioDirector(this);
    this.audioDirector.playAmbientLoop(ASSET_KEYS.ambientChamber02Loop01);

    this.player = new Player(this, CHAMBER03_SPAWN.x, CHAMBER03_SPAWN.y, PLAYER);
    this.applyGameplayReadabilitySupport(this.player.sprite, { fill: 0xd8cfbb, alpha: 0.18, scale: 1.08 });
    this.physics.add.collider(this.player.sprite, this.platforms);

    this.hud = new HudOverlay(this);
    this.mobileControls = new MobileControls(this);

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
      .text(this.scale.width / 2, 120, 'CHAMBER 03 // ENTRY NAVE', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#9bb085',
        align: 'center'
      })
      .setScrollFactor(0)
      .setDepth(34)
      .setOrigin(0.5);

    this.setupMobileUiCamera();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyAttack = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.keyRestart = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);

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
    this.add.rectangle(CHAMBER03_WORLD_WIDTH / 2, WORLD.height / 2, CHAMBER03_WORLD_WIDTH, WORLD.height, 0x0a0807, 1).setDepth(-30);

    const hasEntryNaveArt = this.textures.exists(ASSET_KEYS.chamber03BackdropEntryNave);
    const hasWallModuleArt = this.textures.exists(ASSET_KEYS.chamber03BackdropWallModule);
    const panelWidth = 700;
    const panelCount = Math.ceil(CHAMBER03_WORLD_WIDTH / panelWidth) + 1;

    for (let index = 0; index < panelCount; index += 1) {
      const panelCenterX = index * panelWidth + panelWidth / 2;

      if (hasEntryNaveArt) {
        this.add
          .image(panelCenterX, 212, ASSET_KEYS.chamber03BackdropEntryNave)
          .setDisplaySize(panelWidth + 44, 424)
          .setTint(index % 2 === 0 ? 0xd2c0a4 : 0xc1af96)
          .setAlpha(0.56)
          .setDepth(-29);
      } else if (this.textures.exists(ASSET_KEYS.chamber02BackgroundPlate)) {
        this.add
          .image(panelCenterX, 212, ASSET_KEYS.chamber02BackgroundPlate)
          .setDisplaySize(panelWidth + 44, 404)
          .setTint(index % 2 === 0 ? 0xc1ab93 : 0xaf9a82)
          .setAlpha(0.46)
          .setDepth(-29);
      } else {
        this.add
          .rectangle(panelCenterX, 212, panelWidth + 44, 404, COLORS.architecture, 0.58)
          .setStrokeStyle(2, COLORS.rust, 0.28)
          .setDepth(-29);
      }

      if (hasWallModuleArt && index % 2 === 1) {
        this.add
          .image(panelCenterX + 18, 236, ASSET_KEYS.chamber03BackdropWallModule)
          .setDisplaySize(276, 290)
          .setTint(0xc8b59d)
          .setAlpha(0.22)
          .setDepth(-28);
      }
    }

    this.add.ellipse(420, 210, 540, 320, 0x15100e, 0.32).setDepth(-27);
    this.add.ellipse(1400, 196, 700, 340, 0x120d0c, 0.3).setDepth(-27);
    this.add.ellipse(2360, 214, 580, 320, 0x15100e, 0.32).setDepth(-27);
    this.add.rectangle(CHAMBER03_WORLD_WIDTH / 2, WORLD.floorY - 64, CHAMBER03_WORLD_WIDTH, 10, 0xd4c19f, 0.18).setDepth(-26);
  }

  renderFloorBand() {
    if (this.textures.exists(ASSET_KEYS.chamber02FloorStrip)) {
      this.add
        .tileSprite(CHAMBER03_WORLD_WIDTH / 2, WORLD.floorY + 6, CHAMBER03_WORLD_WIDTH, 118, ASSET_KEYS.chamber02FloorStrip)
        .setTint(0xd1c0a7)
        .setAlpha(0.82)
        .setDepth(-24);
    } else {
      this.add.rectangle(CHAMBER03_WORLD_WIDTH / 2, WORLD.floorY + 6, CHAMBER03_WORLD_WIDTH, 118, 0x241d19, 0.94).setDepth(-24);
    }

    this.add.rectangle(CHAMBER03_WORLD_WIDTH / 2, WORLD.floorY + 34, CHAMBER03_WORLD_WIDTH, 76, 0x140f0d, 0.48).setDepth(-23);
    this.add.ellipse(380, WORLD.floorY - 8, 520, 58, 0x91a06f, 0.08).setDepth(-22);
    this.add.ellipse(1310, WORLD.floorY - 18, 660, 66, 0x8f7d72, 0.1).setDepth(-22);
    this.add.ellipse(2210, WORLD.floorY - 10, 520, 58, 0x91a06f, 0.08).setDepth(-22);
  }

  createPlatforms() {
    this.createInvisiblePlatform(
      CHAMBER03_WORLD_WIDTH / 2,
      CHAMBER03_FLOOR_BODY.y,
      CHAMBER03_FLOOR_BODY.width,
      CHAMBER03_FLOOR_BODY.height
    );

    CHAMBER03_STEP_PLATFORMS.forEach((platform) => {
      this.createInvisiblePlatform(platform.x, platform.y, platform.width, platform.height);
      this.add.rectangle(platform.x, platform.y + 4, platform.width, 22, 0x1a1412, 0.48).setDepth(-21.8);
      this.add.rectangle(platform.x, platform.y - 4, platform.width, 6, 0xc9b89d, 0.16).setDepth(-21.7);
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
      return;
    }

    camera.setViewport(0, 0, width, height);
    camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
    camera.setFollowOffset(-132, PORTRAIT_LAYOUT.desktopFollowOffsetY);
    this.mobileControls.setReservedBottomPx(0);
    this.restartText.setPosition(width / 2, 90);
    this.chamberLabel.setPosition(width / 2, 28);
  }
}
