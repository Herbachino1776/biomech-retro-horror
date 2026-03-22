import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { COLORS, CONCEPT_PRESENTATION, PLAYER, WORLD } from '../data/milestone1Config.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';
import { restartRunFromDeath } from '../systems/RunReset.js';

const CHAMBER03_BOOTSTRAP = {
  worldWidth: 1920,
  floorColliderHeight: 72,
  floorDisplayHeight: 116,
  floorDepthY: WORLD.floorY - 46,
  spawnX: 180,
  spawnY: PLAYER.startY,
  backgroundPanelY: 224,
  backgroundPanelHeight: 372,
  foregroundArchY: 212,
  foregroundArchHeight: 332,
  floorStripYOffset: 18,
  cameraLerp: { x: 0.08, y: 0.08 },
  portraitFollowOffsetX: -120,
  desktopFollowOffsetX: -140,
  playerHalo: {
    fill: 0xd8cfbb,
    alpha: 0.18,
    scale: 1.1
  }
};

export class Chamber03Scene extends Phaser.Scene {
  constructor() {
    super('Chamber03Scene');
  }

  init(data) {
    this.transitionContext = data ?? {};
    this.isRestartingRun = false;
  }

  create() {
    this.createWorldBounds();
    this.createBackgroundAndFloor();
    this.createPlayerAndColliders();
    this.createUiAndInput();
    this.configureCameraAndLayout();
  }

  createWorldBounds() {
    this.physics.world.gravity.y = WORLD.gravityY;
    this.cameras.main.setBounds(0, 0, CHAMBER03_BOOTSTRAP.worldWidth, WORLD.height);
    this.physics.world.setBounds(0, 0, CHAMBER03_BOOTSTRAP.worldWidth, WORLD.height);
    this.cameras.main.setBackgroundColor('#080707');

    this.platforms = this.physics.add.staticGroup();
  }

  createBackgroundAndFloor() {
    this.add.rectangle(
      CHAMBER03_BOOTSTRAP.worldWidth / 2,
      WORLD.height / 2,
      CHAMBER03_BOOTSTRAP.worldWidth,
      WORLD.height,
      COLORS.backdrop,
      1
    ).setDepth(-16);

    const hasChamber03EntryArt = this.textures.exists(ASSET_KEYS.chamber03BackgroundEntryNave);
    const hasChamber03WallModuleArt = this.textures.exists(ASSET_KEYS.chamber03BackgroundWallModule);

    if (hasChamber03EntryArt) {
      this.add
        .image(960, 212, ASSET_KEYS.chamber03BackgroundEntryNave)
        .setDisplaySize(1740, 432)
        .setTint(0xd1c1ac)
        .setAlpha(0.64)
        .setDepth(-14.6);

      this.add
        .rectangle(CHAMBER03_BOOTSTRAP.worldWidth / 2, WORLD.floorY - 92, CHAMBER03_BOOTSTRAP.worldWidth, 248, COLORS.oil, 0.18)
        .setDepth(-14.4);
    } else {
      for (const anchorX of CONCEPT_PRESENTATION.chamberBackdrop.anchorXs) {
        if (anchorX > CHAMBER03_BOOTSTRAP.worldWidth + CONCEPT_PRESENTATION.chamberBackdrop.panelWidth) {
          continue;
        }

        if (this.textures.exists(ASSET_KEYS.chamber02BackgroundPlate)) {
          this.add
            .image(anchorX, CHAMBER03_BOOTSTRAP.backgroundPanelY, ASSET_KEYS.chamber02BackgroundPlate)
            .setDisplaySize(CONCEPT_PRESENTATION.chamberBackdrop.panelWidth, CHAMBER03_BOOTSTRAP.backgroundPanelHeight)
            .setTint(0xc2b09b)
            .setAlpha(0.26)
            .setDepth(-14);
        } else if (this.textures.exists(ASSET_KEYS.chamberBackground)) {
          this.add
            .image(anchorX, CHAMBER03_BOOTSTRAP.backgroundPanelY, ASSET_KEYS.chamberBackground)
            .setDisplaySize(CONCEPT_PRESENTATION.chamberBackdrop.panelWidth, CONCEPT_PRESENTATION.chamberBackdrop.panelHeight)
            .setTint(0xb39c88)
            .setAlpha(0.12)
            .setDepth(-14);
        } else {
          this.add
            .rectangle(
              anchorX,
              CHAMBER03_BOOTSTRAP.backgroundPanelY,
              CONCEPT_PRESENTATION.chamberBackdrop.panelWidth,
              CHAMBER03_BOOTSTRAP.backgroundPanelHeight,
              COLORS.architecture,
              0.72
            )
            .setDepth(-14);
        }
      }
    }

    if (hasChamber03WallModuleArt) {
      [256, 640, 1280, 1664].forEach((anchorX, index) => {
        this.add
          .image(anchorX, 242 + (index % 2) * 8, ASSET_KEYS.chamber03BackgroundWallModule)
          .setDisplaySize(420, 312)
          .setTint(0xc7b59f)
          .setAlpha(hasChamber03EntryArt ? 0.22 : 0.34)
          .setDepth(-13.6);
      });
    } else if (this.textures.exists(ASSET_KEYS.chamber02ForegroundHornArch)) {
      [360, 960, 1560].forEach((archX, index) => {
        this.add
          .image(archX, CHAMBER03_BOOTSTRAP.foregroundArchY + index * 6, ASSET_KEYS.chamber02ForegroundHornArch)
          .setDisplaySize(288, CHAMBER03_BOOTSTRAP.foregroundArchHeight)
          .setTint(0xb89f86)
          .setAlpha(0.16)
          .setDepth(-12.5);
      });
    }

    this.add
      .rectangle(
        CHAMBER03_BOOTSTRAP.worldWidth / 2,
        CHAMBER03_BOOTSTRAP.floorDepthY,
        CHAMBER03_BOOTSTRAP.worldWidth,
        224,
        COLORS.architecture,
        hasChamber03EntryArt ? 0.58 : 0.7
      )
      .setDepth(-13);

    if (this.textures.exists(ASSET_KEYS.chamber02FloorStrip)) {
      this.add
        .tileSprite(
          CHAMBER03_BOOTSTRAP.worldWidth / 2,
          WORLD.floorY + CHAMBER03_BOOTSTRAP.floorStripYOffset,
          CHAMBER03_BOOTSTRAP.worldWidth,
          CHAMBER03_BOOTSTRAP.floorDisplayHeight,
          ASSET_KEYS.chamber02FloorStrip
        )
        .setTint(hasChamber03EntryArt ? 0xc9b9a3 : 0xd1c0aa)
        .setAlpha(hasChamber03EntryArt ? 0.66 : 0.72)
        .setDepth(-6);
    } else if (this.textures.exists(ASSET_KEYS.chamber01FloorStrip)) {
      this.add
        .tileSprite(
          CHAMBER03_BOOTSTRAP.worldWidth / 2,
          WORLD.floorY + 12,
          CHAMBER03_BOOTSTRAP.worldWidth,
          82,
          ASSET_KEYS.chamber01FloorStrip
        )
        .setTint(0xd7c7b0)
        .setAlpha(0.74)
        .setDepth(-6);
    } else {
      this.add
        .rectangle(
          CHAMBER03_BOOTSTRAP.worldWidth / 2,
          WORLD.floorY + 16,
          CHAMBER03_BOOTSTRAP.worldWidth,
          CHAMBER03_BOOTSTRAP.floorDisplayHeight,
          COLORS.foreground,
          0.92
        )
        .setDepth(-6);
    }

    this.add
      .ellipse(CHAMBER03_BOOTSTRAP.worldWidth / 2, WORLD.floorY + 10, CHAMBER03_BOOTSTRAP.worldWidth, 58, 0x050404, 0.34)
      .setDepth(-5);

    this.createInvisiblePlatform(
      CHAMBER03_BOOTSTRAP.worldWidth / 2,
      WORLD.floorY + 28,
      CHAMBER03_BOOTSTRAP.worldWidth,
      CHAMBER03_BOOTSTRAP.floorColliderHeight
    );
  }

  createPlayerAndColliders() {
    this.player = new Player(this, CHAMBER03_BOOTSTRAP.spawnX, CHAMBER03_BOOTSTRAP.spawnY, PLAYER);
    this.applyGameplayReadabilitySupport(this.player.sprite, CHAMBER03_BOOTSTRAP.playerHalo);
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
      CHAMBER03_BOOTSTRAP.cameraLerp.x,
      CHAMBER03_BOOTSTRAP.cameraLerp.y,
      CHAMBER03_BOOTSTRAP.desktopFollowOffsetX,
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

    const input = {
      left: this.cursors.left.isDown || mobileInput.left,
      right: this.cursors.right.isDown || mobileInput.right,
      jumpPressed:
        Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
        mobileInput.jumpPressed,
      attackPressed: Phaser.Input.Keyboard.JustDown(this.keyAttack) || mobileInput.attackPressed
    };

    this.player.update(time, input);
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

    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'Chamber03MobileUiCamera');
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
      camera.setFollowOffset(CHAMBER03_BOOTSTRAP.portraitFollowOffsetX, PORTRAIT_LAYOUT.portraitFollowOffsetY);
      this.mobileControls.setReservedBottomPx(height - worldBandHeight);
      this.restartText.setPosition(
        width / 2,
        Math.max(PORTRAIT_LAYOUT.restartTextMinY, worldBandHeight * PORTRAIT_LAYOUT.restartTextRatioY)
      );
      return;
    }

    camera.setViewport(0, 0, width, height);
    camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
    camera.setFollowOffset(CHAMBER03_BOOTSTRAP.desktopFollowOffsetX, PORTRAIT_LAYOUT.desktopFollowOffsetY);
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
