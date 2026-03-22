import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { COLORS, PLAYER, WORLD } from '../data/milestone1Config.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';
import { restartRunFromDeath } from '../systems/RunReset.js';

const CHAMBER03_BOSS_ARENA = {
  worldWidth: 1920,
  spawnX: 248,
  spawnY: PLAYER.startY,
  floorColliderHeight: 72,
  floorDisplayHeight: 124,
  floorDepthY: WORLD.floorY - 42,
  floorStripYOffset: 16,
  backdropY: 206,
  backdropWidth: 1200,
  backdropHeight: 560,
  cameraLerp: { x: 0.08, y: 0.08 },
  portraitFollowOffsetX: -96,
  desktopFollowOffsetX: -126,
  lowerDepthBandHeight: 280,
  lowerDepthBandAlpha: 0.18,
  floorShadowAlpha: 0.34,
  playerHalo: {
    fill: 0xd8cfbb,
    alpha: 0.18,
    scale: 1.1
  }
};

export class Chamber03BossArenaScene extends Phaser.Scene {
  constructor() {
    super('Chamber03BossArenaScene');
  }

  init(data) {
    this.transitionContext = data ?? {};
    this.isRestartingRun = false;
  }

  create() {
    this.createWorldBounds();
    this.createArenaEnvironment();
    this.createPlayerAndColliders();
    this.createUiAndInput();
    this.configureCameraAndLayout();
    this.cameras.main.fadeIn(420, 0, 0, 0);
  }

  createWorldBounds() {
    this.physics.world.gravity.y = WORLD.gravityY;
    this.cameras.main.setBounds(0, 0, CHAMBER03_BOSS_ARENA.worldWidth, WORLD.height);
    this.physics.world.setBounds(0, 0, CHAMBER03_BOSS_ARENA.worldWidth, WORLD.height);
    this.cameras.main.setBackgroundColor('#060505');

    this.platforms = this.physics.add.staticGroup();
  }

  createArenaEnvironment() {
    this.add.rectangle(
      CHAMBER03_BOSS_ARENA.worldWidth / 2,
      WORLD.height / 2,
      CHAMBER03_BOSS_ARENA.worldWidth,
      WORLD.height,
      COLORS.backdrop,
      1
    ).setDepth(-16);

    this.add.rectangle(
      CHAMBER03_BOSS_ARENA.worldWidth / 2,
      WORLD.floorY - 92,
      CHAMBER03_BOSS_ARENA.worldWidth,
      CHAMBER03_BOSS_ARENA.lowerDepthBandHeight,
      COLORS.oil,
      CHAMBER03_BOSS_ARENA.lowerDepthBandAlpha
    ).setDepth(-14.2);

    this.renderBossBackdrop();
    this.renderArenaFloor();
    this.createInvisiblePlatform(
      CHAMBER03_BOSS_ARENA.worldWidth / 2,
      WORLD.floorY + 28,
      CHAMBER03_BOSS_ARENA.worldWidth,
      CHAMBER03_BOSS_ARENA.floorColliderHeight
    );
  }

  renderBossBackdrop() {
    if (this.textures.exists(ASSET_KEYS.chamber03BackgroundBossDais)) {
      this.add
        .image(CHAMBER03_BOSS_ARENA.worldWidth / 2, CHAMBER03_BOSS_ARENA.backdropY, ASSET_KEYS.chamber03BackgroundBossDais)
        .setDisplaySize(CHAMBER03_BOSS_ARENA.backdropWidth, CHAMBER03_BOSS_ARENA.backdropHeight)
        .setTint(0xcfbea5)
        .setAlpha(0.8)
        .setDepth(-14.7);
    } else {
      this.add
        .rectangle(
          CHAMBER03_BOSS_ARENA.worldWidth / 2,
          CHAMBER03_BOSS_ARENA.backdropY + 14,
          CHAMBER03_BOSS_ARENA.backdropWidth,
          CHAMBER03_BOSS_ARENA.backdropHeight,
          0x4f4137,
          0.78
        )
        .setDepth(-14.7);

      this.add
        .text(CHAMBER03_BOSS_ARENA.worldWidth / 2, CHAMBER03_BOSS_ARENA.backdropY + 4, 'CHAMBER 03\nBOSS DAIS', {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#d7c8b3',
          align: 'center'
        })
        .setOrigin(0.5)
        .setAlpha(0.8)
        .setDepth(-14.6);
    }

    this.add.ellipse(CHAMBER03_BOSS_ARENA.worldWidth / 2, WORLD.floorY - 40, 860, 132, 0x130f0e, 0.26).setDepth(-13.9);
    this.add.ellipse(CHAMBER03_BOSS_ARENA.worldWidth / 2, WORLD.floorY - 10, 420, 86, COLORS.sickly, 0.1).setDepth(-13.7);
  }

  renderArenaFloor() {
    this.add
      .rectangle(
        CHAMBER03_BOSS_ARENA.worldWidth / 2,
        CHAMBER03_BOSS_ARENA.floorDepthY,
        CHAMBER03_BOSS_ARENA.worldWidth,
        244,
        COLORS.architecture,
        0.62
      )
      .setDepth(-13);

    if (this.textures.exists(ASSET_KEYS.chamber02FloorStrip)) {
      this.add
        .tileSprite(
          CHAMBER03_BOSS_ARENA.worldWidth / 2,
          WORLD.floorY + CHAMBER03_BOSS_ARENA.floorStripYOffset,
          CHAMBER03_BOSS_ARENA.worldWidth,
          CHAMBER03_BOSS_ARENA.floorDisplayHeight,
          ASSET_KEYS.chamber02FloorStrip
        )
        .setTint(0xd1c0a8)
        .setAlpha(0.74)
        .setDepth(-6);
    } else if (this.textures.exists(ASSET_KEYS.chamber01FloorStrip)) {
      this.add
        .tileSprite(
          CHAMBER03_BOSS_ARENA.worldWidth / 2,
          WORLD.floorY + 12,
          CHAMBER03_BOSS_ARENA.worldWidth,
          84,
          ASSET_KEYS.chamber01FloorStrip
        )
        .setTint(0xd7c7b0)
        .setAlpha(0.74)
        .setDepth(-6);
    } else {
      this.add
        .rectangle(
          CHAMBER03_BOSS_ARENA.worldWidth / 2,
          WORLD.floorY + 16,
          CHAMBER03_BOSS_ARENA.worldWidth,
          CHAMBER03_BOSS_ARENA.floorDisplayHeight,
          COLORS.foreground,
          0.92
        )
        .setDepth(-6);
    }

    this.add
      .ellipse(
        CHAMBER03_BOSS_ARENA.worldWidth / 2,
        WORLD.floorY + 10,
        CHAMBER03_BOSS_ARENA.worldWidth,
        58,
        0x050404,
        CHAMBER03_BOSS_ARENA.floorShadowAlpha
      )
      .setDepth(-5);
  }

  createPlayerAndColliders() {
    this.player = new Player(this, CHAMBER03_BOSS_ARENA.spawnX, CHAMBER03_BOSS_ARENA.spawnY, PLAYER);
    this.applyGameplayReadabilitySupport(this.player.sprite, CHAMBER03_BOSS_ARENA.playerHalo);
    this.physics.add.collider(this.player.sprite, this.platforms);
  }

  createUiAndInput() {
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

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.applyResponsiveLayout, this);
    });
  }

  configureCameraAndLayout() {
    this.cameras.main.startFollow(
      this.player.sprite,
      true,
      CHAMBER03_BOSS_ARENA.cameraLerp.x,
      CHAMBER03_BOSS_ARENA.cameraLerp.y,
      CHAMBER03_BOSS_ARENA.desktopFollowOffsetX,
      0
    );
    this.scale.on('resize', this.applyResponsiveLayout, this);
    this.applyResponsiveLayout();
    this.mobileControls.setMode('gameplay');
    this.hud.update(this.player.health, PLAYER.maxHealth);
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

  setupMobileUiCamera() {
    if (!this.mobileControls.enabled) {
      return;
    }

    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'Chamber03BossArenaMobileUiCamera');
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
      camera.setFollowOffset(CHAMBER03_BOSS_ARENA.portraitFollowOffsetX, PORTRAIT_LAYOUT.portraitFollowOffsetY);
      this.mobileControls.setReservedBottomPx(height - worldBandHeight);
      this.restartText.setPosition(
        width / 2,
        Math.max(PORTRAIT_LAYOUT.restartTextMinY, worldBandHeight * PORTRAIT_LAYOUT.restartTextRatioY)
      );
      return;
    }

    camera.setViewport(0, 0, width, height);
    camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
    camera.setFollowOffset(CHAMBER03_BOSS_ARENA.desktopFollowOffsetX, PORTRAIT_LAYOUT.desktopFollowOffsetY);
    this.mobileControls.setReservedBottomPx(0);
    this.restartText.setPosition(width / 2, 90);
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
}
