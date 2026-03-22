import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';
import { COLORS, PLAYER, WORLD } from '../data/milestone1Config.js';
import { restartRunFromDeath } from '../systems/RunReset.js';

const CHAMBER03_WORLD = {
  width: 2400,
  height: WORLD.height,
  floorY: WORLD.floorY
};

const CHAMBER03_BOOTSTRAP = {
  spawnX: 220,
  spawnY: 360,
  floorHeight: 72,
  backdropCenterY: 220,
  fallbackBackdropTint: 0xb7a790,
  fallbackBackdropAlpha: 0.32,
  floorTint: 0xd2c2ac,
  floorAlpha: 0.82,
  landmarkX: 1680,
  landmarkY: 286,
  diagnosticBackground: 0x2d0f12,
  diagnosticFloor: 0xd3c2a4,
  errorBackground: 0x1a0708,
  errorFloor: 0x8b5447
};

export class Chamber03Scene extends Phaser.Scene {
  constructor() {
    super('Chamber03Scene');
  }

  init(data) {
    this.transitionContext = data ?? {};
  }

  create() {
    this.bootDiagnostics = { phases: [] };
    this.platforms = this.physics.add.staticGroup();

    this.renderImmediateBootProof();

    try {
      this.runBootPhase('phase 1: world/camera bounds', () => {
        this.physics.world.gravity.y = WORLD.gravityY;
        this.cameras.main.setBounds(0, 0, CHAMBER03_WORLD.width, CHAMBER03_WORLD.height);
        this.physics.world.setBounds(0, 0, CHAMBER03_WORLD.width, CHAMBER03_WORLD.height);
        this.cameras.main.setBackgroundColor('#090706');
        this.cameras.main.fadeIn(450, 0, 0, 0);
      });

      this.runBootPhase('phase 2: backdrop/floor', () => {
        this.renderBackdrop();
        this.createPlatforms();
      });

      this.runBootPhase('phase 3: player spawn + collider', () => {
        this.player = new Player(this, CHAMBER03_BOOTSTRAP.spawnX, CHAMBER03_BOOTSTRAP.spawnY, PLAYER);
        this.applyGameplayReadabilitySupport(this.player.sprite, { fill: 0xd8cfbb, alpha: 0.18, scale: 1.1 });
        this.physics.add.collider(this.player.sprite, this.platforms);
      });

      this.runBootPhase('phase 4: HUD/mobile controls', () => {
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
          .text(this.scale.width / 2, 44, 'CHAMBER 03 // OSSUARY CHOIR HALL // BOOTSTRAP', {
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#8f7d72',
            align: 'center'
          })
          .setScrollFactor(0)
          .setDepth(30)
          .setOrigin(0.5);
      });

      this.runBootPhase('phase 5: camera follow/layout', () => {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyAttack = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        this.keyRestart = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        this.applyResponsiveLayout();
        this.cameras.main.centerOn(CHAMBER03_BOOTSTRAP.spawnX + 120, WORLD.floorY - 84);
        this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08, -140, 0);

        this.scale.on('resize', this.applyResponsiveLayout, this);
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
          this.scale.off('resize', this.applyResponsiveLayout, this);
          this.cleanupSceneUi();
        });

        this.hud.update(this.player.health, PLAYER.maxHealth);
      });
    } catch (error) {
      this.handleCreateFailure(error);
    }
  }

  runBootPhase(label, fn) {
    console.log(`[Chamber03Scene] ${label} start`);
    this.bootDiagnostics?.phases.push({ label, status: 'start' });
    fn();
    console.log(`[Chamber03Scene] ${label} ok`);
    this.bootDiagnostics?.phases.push({ label, status: 'ok' });
  }

  renderImmediateBootProof() {
    this.bootProofBackground = this.add
      .rectangle(
        CHAMBER03_WORLD.width / 2,
        CHAMBER03_WORLD.height / 2,
        CHAMBER03_WORLD.width,
        CHAMBER03_WORLD.height,
        CHAMBER03_BOOTSTRAP.diagnosticBackground,
        1
      )
      .setOrigin(0.5)
      .setDepth(-40);

    this.bootProofFloor = this.add
      .rectangle(
        CHAMBER03_WORLD.width / 2,
        WORLD.floorY + 8,
        CHAMBER03_WORLD.width,
        92,
        CHAMBER03_BOOTSTRAP.diagnosticFloor,
        0.94
      )
      .setDepth(-39);

    this.bootProofLabel = this.add
      .text(26, 22, 'CHAMBER 03 BOOT OK', {
        fontFamily: 'monospace',
        fontSize: '28px',
        color: '#f5e6c8',
        backgroundColor: '#3d1619',
        padding: { x: 10, y: 6 }
      })
      .setScrollFactor(0)
      .setDepth(120)
      .setOrigin(0, 0);
  }

  handleCreateFailure(error) {
    console.error('[Chamber03Scene] create() boot failure', error);
    this.cameras.main?.setBackgroundColor?.(`#${CHAMBER03_BOOTSTRAP.errorBackground.toString(16).padStart(6, '0')}`);

    if (!this.bootProofBackground?.active) {
      this.bootProofBackground = this.add
        .rectangle(
          CHAMBER03_WORLD.width / 2,
          CHAMBER03_WORLD.height / 2,
          CHAMBER03_WORLD.width,
          CHAMBER03_WORLD.height,
          CHAMBER03_BOOTSTRAP.errorBackground,
          1
        )
        .setOrigin(0.5)
        .setDepth(-40);
    }

    if (!this.bootProofFloor?.active) {
      this.bootProofFloor = this.add
        .rectangle(
          CHAMBER03_WORLD.width / 2,
          WORLD.floorY + 8,
          CHAMBER03_WORLD.width,
          92,
          CHAMBER03_BOOTSTRAP.errorFloor,
          0.94
        )
        .setDepth(-39);
    } else {
      this.bootProofFloor.setFillStyle(CHAMBER03_BOOTSTRAP.errorFloor, 0.94);
    }

    this.bootProofLabel?.setText('CHAMBER 03 BOOT FAILURE').setBackgroundColor('#4a1418');

    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    if (this.bootFailureText?.active) {
      this.bootFailureText.setText(`CHAMBER 03 BOOT FAILURE\n${message}`);
      return;
    }

    this.bootFailureText = this.add
      .text(26, 74, `CHAMBER 03 BOOT FAILURE\n${message}`, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffd7cf',
        backgroundColor: '#22090b',
        wordWrap: { width: Math.max(260, this.scale.width - 52) },
        padding: { x: 10, y: 8 }
      })
      .setScrollFactor(0)
      .setDepth(121)
      .setOrigin(0, 0);
  }

  renderBackdrop() {
    this.add
      .rectangle(CHAMBER03_WORLD.width / 2, CHAMBER03_WORLD.height / 2, CHAMBER03_WORLD.width, CHAMBER03_WORLD.height, COLORS.backdrop, 1)
      .setOrigin(0.5)
      .setDepth(-14);

    const backdropTextureKey = this.textures.exists(ASSET_KEYS.chamber02BackgroundPlate)
      ? ASSET_KEYS.chamber02BackgroundPlate
      : this.textures.exists(ASSET_KEYS.chamberBackground)
        ? ASSET_KEYS.chamberBackground
        : null;

    if (backdropTextureKey) {
      this.add
        .image(CHAMBER03_WORLD.width / 2, CHAMBER03_BOOTSTRAP.backdropCenterY, backdropTextureKey)
        .setDisplaySize(CHAMBER03_WORLD.width + 120, 404)
        .setTint(0xbba98f)
        .setAlpha(0.34)
        .setDepth(-13);
    } else {
      this.add
        .ellipse(
          CHAMBER03_WORLD.width / 2,
          CHAMBER03_BOOTSTRAP.backdropCenterY,
          CHAMBER03_WORLD.width - 180,
          360,
          CHAMBER03_BOOTSTRAP.fallbackBackdropTint,
          CHAMBER03_BOOTSTRAP.fallbackBackdropAlpha
        )
        .setDepth(-13);
    }

    this.add
      .ellipse(CHAMBER03_WORLD.width / 2, 278, CHAMBER03_WORLD.width - 260, 250, COLORS.oil, 0.28)
      .setDepth(-12);

    if (this.textures.exists(ASSET_KEYS.chamber02ForegroundHornArch)) {
      this.add
        .image(CHAMBER03_BOOTSTRAP.landmarkX, CHAMBER03_BOOTSTRAP.landmarkY, ASSET_KEYS.chamber02ForegroundHornArch)
        .setDisplaySize(320, 300)
        .setTint(0xc5b299)
        .setAlpha(0.22)
        .setDepth(-11);
    } else {
      this.add
        .ellipse(CHAMBER03_BOOTSTRAP.landmarkX, CHAMBER03_BOOTSTRAP.landmarkY + 8, 260, 220, COLORS.bone, 0.18)
        .setDepth(-11);
    }
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

  createInvisiblePlatform(x, y, width, height) {
    const platform = this.add.rectangle(x, y, width, height, 0x000000, 0).setOrigin(0.5);
    platform.setVisible(false);
    this.physics.add.existing(platform, true);
    this.platforms.add(platform);
    return platform;
  }

  update(time) {
    if (!this.player || !this.mobileControls || !this.hud || !this.restartText) {
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

    this.chamberLabel?.setPosition(width / 2, 44);

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
    this.mobileControls.setReservedBottomPx(0);
    this.restartText?.setPosition(width / 2, 90);
  }
}
