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
  backdropWidth: 1060,
  backdropHeight: 560,
  sideWallWidth: 430,
  sideWallHeight: 540,
  sideWallInset: 82,
  cameraLerp: { x: 0.08, y: 0.08 },
  portraitFollowOffsetX: -96,
  desktopFollowOffsetX: -126,
  lowerDepthBandHeight: 280,
  lowerDepthBandAlpha: 0.18,
  floorShadowAlpha: 0.34,
  bossAnchorX: 1464,
  bossAnchorY: WORLD.floorY - 152,
  bossWidth: 364,
  bossHeight: 418,
  bossPromptOffsetY: -236,
  bossRevealPromptDuration: 1800,
  omenDelayMs: 260,
  playerHalo: {
    fill: 0xd8cfbb,
    alpha: 0.18,
    scale: 1.1
  }
};

const CHAMBER03_BOSS_OMEN_CUTSCENE_ID = 'chamber03-precentor-threshold';

export class Chamber03BossArenaScene extends Phaser.Scene {
  constructor() {
    super('Chamber03BossArenaScene');
  }

  init(data) {
    this.transitionContext = data ?? {};
    this.isRestartingRun = false;
    this.isOmenBeatActive = false;
    this.hasResolvedOmenBeat = false;
    this.hasActivatedBoss = false;
  }

  create() {
    this.createWorldBounds();
    this.createArenaEnvironment();
    this.createPlayerAndColliders();
    this.createBossPresentation();
    this.createUiAndInput();
    this.configureCameraAndLayout();
    this.registerLoreCutsceneReturn();
    this.cameras.main.fadeIn(420, 0, 0, 0);
    this.time.delayedCall(CHAMBER03_BOSS_ARENA.omenDelayMs, () => {
      this.beginPreBossOmenBeat();
    });
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
    const centerX = CHAMBER03_BOSS_ARENA.worldWidth / 2;
    const sideWallKey = ASSET_KEYS.chamber03BackgroundWallModule;
    const hasSideWallArt = this.textures.exists(sideWallKey);
    const sideWallOffset = CHAMBER03_BOSS_ARENA.backdropWidth / 2 + CHAMBER03_BOSS_ARENA.sideWallInset;

    [-1, 1].forEach((direction, index) => {
      const wallX = centerX + sideWallOffset * direction;
      const wallDepth = -14.82 + index * 0.01;

      if (hasSideWallArt) {
        this.add
          .image(wallX, CHAMBER03_BOSS_ARENA.backdropY + 12, sideWallKey)
          .setDisplaySize(CHAMBER03_BOSS_ARENA.sideWallWidth, CHAMBER03_BOSS_ARENA.sideWallHeight)
          .setTint(index === 0 ? 0xb8a48f : 0xc1ad96)
          .setAlpha(0.76)
          .setFlipX(direction > 0)
          .setDepth(wallDepth);
      } else {
        this.add
          .rectangle(
            wallX,
            CHAMBER03_BOSS_ARENA.backdropY + 18,
            CHAMBER03_BOSS_ARENA.sideWallWidth,
            CHAMBER03_BOSS_ARENA.sideWallHeight,
            0x473a31,
            0.8
          )
          .setDepth(wallDepth);
      }

      this.add
        .ellipse(wallX, WORLD.floorY - 42, CHAMBER03_BOSS_ARENA.sideWallWidth * 0.88, 108, 0x090707, 0.16)
        .setDepth(-13.95);
    });

    if (this.textures.exists(ASSET_KEYS.chamber03BackgroundBossDais)) {
      this.add
        .image(centerX, CHAMBER03_BOSS_ARENA.backdropY, ASSET_KEYS.chamber03BackgroundBossDais)
        .setDisplaySize(CHAMBER03_BOSS_ARENA.backdropWidth, CHAMBER03_BOSS_ARENA.backdropHeight)
        .setTint(0xcfbea5)
        .setAlpha(0.8)
        .setDepth(-14.7);
    } else {
      this.add
        .rectangle(
          centerX,
          CHAMBER03_BOSS_ARENA.backdropY + 14,
          CHAMBER03_BOSS_ARENA.backdropWidth,
          CHAMBER03_BOSS_ARENA.backdropHeight,
          0x4f4137,
          0.78
        )
        .setDepth(-14.7);

      this.add
        .text(centerX, CHAMBER03_BOSS_ARENA.backdropY + 4, 'CHAMBER 03\nBOSS DAIS', {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#d7c8b3',
          align: 'center'
        })
        .setOrigin(0.5)
        .setAlpha(0.8)
        .setDepth(-14.6);
    }

    this.add.ellipse(centerX, WORLD.floorY - 40, 860, 132, 0x130f0e, 0.26).setDepth(-13.9);
    this.add.ellipse(centerX, WORLD.floorY - 10, 420, 86, COLORS.sickly, 0.1).setDepth(-13.7);
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

  createBossPresentation() {
    const bossX = CHAMBER03_BOSS_ARENA.bossAnchorX;
    const bossY = CHAMBER03_BOSS_ARENA.bossAnchorY;

    this.bossArrivalShadow = this.add.ellipse(bossX, WORLD.floorY + 8, 240, 38, 0x050404, 0).setDepth(-4.2);
    this.bossArrivalAura = this.add.ellipse(bossX, bossY + 18, 228, 312, COLORS.sickly, 0).setDepth(-4.1);
    this.bossArrivalHalo = this.add.ellipse(bossX, bossY - 16, 170, 244, 0xdcccae, 0).setDepth(-4.05);

    if (this.textures.exists(ASSET_KEYS.chamber03BossPrecentor)) {
      this.bossSprite = this.add
        .image(bossX, bossY, ASSET_KEYS.chamber03BossPrecentor)
        .setDisplaySize(CHAMBER03_BOSS_ARENA.bossWidth, CHAMBER03_BOSS_ARENA.bossHeight)
        .setTint(0xd2c1aa)
        .setAlpha(0)
        .setDepth(-3.9)
        .setVisible(false);
    } else {
      this.bossSprite = this.add
        .ellipse(bossX, bossY + 6, 212, 312, 0x4d3c34, 0)
        .setStrokeStyle(3, 0xd7c8b2, 0)
        .setDepth(-3.9)
        .setVisible(false);

      this.bossFallbackLabel = this.add
        .text(bossX, bossY - 12, 'PRECENTOR', {
          fontFamily: 'monospace',
          fontSize: '16px',
          color: '#d7c8b2',
          align: 'center'
        })
        .setOrigin(0.5)
        .setDepth(-3.88)
        .setVisible(false);
    }

    this.bossStatusPrompt = this.add
      .text(bossX, bossY + CHAMBER03_BOSS_ARENA.bossPromptOffsetY, '', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#a4b687',
        align: 'center',
        stroke: '#0f0b0a',
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setDepth(12)
      .setVisible(false);
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
      this.game.events.off('lore-cutscene-complete', this.handleLoreCutsceneComplete, this);
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

  registerLoreCutsceneReturn() {
    this.game.events.on('lore-cutscene-complete', this.handleLoreCutsceneComplete, this);
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

    if (this.isOmenBeatActive) {
      this.mobileControls.setMode('dialogue');
      this.player.body.setVelocity(0, 0);
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

    this.updateBossPresence(time);
    this.hud.update(this.player.health, PLAYER.maxHealth);
  }

  beginPreBossOmenBeat() {
    if (this.hasResolvedOmenBeat || this.isOmenBeatActive) {
      return;
    }

    this.isOmenBeatActive = true;
    this.mobileControls.setMode('dialogue');
    this.player.body.setVelocity(0, 0);
    this.player.body.setEnable(false);
    this.player.attackHitbox?.body?.setEnable(false);

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.pause();
      this.scene.launch('LoreCutsceneScene', {
        cutsceneId: CHAMBER03_BOSS_OMEN_CUTSCENE_ID,
        returnSceneKey: this.scene.key
      });
    });

    this.cameras.main.fadeOut(380, 0, 0, 0);
  }

  handleLoreCutsceneComplete({ cutsceneId } = {}) {
    if (cutsceneId !== CHAMBER03_BOSS_OMEN_CUTSCENE_ID) {
      return;
    }

    this.resolvePreBossOmenBeat();
  }

  resolvePreBossOmenBeat() {
    this.isOmenBeatActive = false;
    this.hasResolvedOmenBeat = true;
    this.player.body.setEnable(true);
    this.mobileControls.setMode('gameplay');
    this.cameras.main.fadeIn(500, 0, 0, 0);
    this.activateBossEncounterContract();
  }

  activateBossEncounterContract() {
    if (this.hasActivatedBoss || !this.bossSprite) {
      return;
    }

    this.hasActivatedBoss = true;
    this.bossSprite.setVisible(true);

    if (typeof this.bossSprite.setStrokeStyle === 'function') {
      this.bossSprite.setStrokeStyle(3, 0xd7c8b2, 0.65);
    }

    this.bossFallbackLabel?.setVisible(true).setAlpha(0);

    this.tweens.add({
      targets: this.bossSprite,
      alpha: 0.95,
      duration: 640,
      ease: 'Sine.out'
    });
    this.tweens.add({
      targets: this.bossArrivalAura,
      alpha: 0.2,
      duration: 640,
      ease: 'Sine.out'
    });
    this.tweens.add({
      targets: this.bossArrivalHalo,
      alpha: 0.14,
      duration: 640,
      ease: 'Sine.out'
    });
    this.tweens.add({
      targets: this.bossArrivalShadow,
      alpha: 0.28,
      duration: 640,
      ease: 'Sine.out'
    });
    if (this.bossFallbackLabel) {
      this.tweens.add({
        targets: this.bossFallbackLabel,
        alpha: 0.76,
        duration: 640,
        ease: 'Sine.out'
      });
    }

    this.tweens.add({
      targets: this.bossArrivalAura,
      scaleX: 1.04,
      scaleY: 1.02,
      duration: 1200,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1
    });

    this.tweens.add({
      targets: this.bossArrivalHalo,
      scaleX: 1.03,
      scaleY: 1.05,
      duration: 1700,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1
    });

    this.bossStatusPrompt
      ?.setText('THE PRECENTOR TAKES THE DAIS')
      .setScrollFactor(0)
      .setPosition(this.scale.width / 2, Math.max(80, this.cameras.main.height * 0.16))
      .setVisible(true);

    this.time.delayedCall(CHAMBER03_BOSS_ARENA.bossRevealPromptDuration, () => {
      this.bossStatusPrompt?.setVisible(false);
    });
  }

  updateBossPresence(time) {
    if (!this.hasActivatedBoss || !this.bossSprite?.visible) {
      return;
    }

    const floatOffset = Math.sin(time / 420) * 5;
    this.bossSprite.setY(CHAMBER03_BOSS_ARENA.bossAnchorY + floatOffset);
    this.bossArrivalAura?.setPosition(CHAMBER03_BOSS_ARENA.bossAnchorX, CHAMBER03_BOSS_ARENA.bossAnchorY + 18 + floatOffset * 0.35);
    this.bossArrivalHalo?.setPosition(CHAMBER03_BOSS_ARENA.bossAnchorX, CHAMBER03_BOSS_ARENA.bossAnchorY - 16 + floatOffset * 0.45);
    this.bossArrivalShadow?.setAlpha(0.22 + (Math.sin(time / 320) + 1) * 0.03);
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
      this.bossStatusPrompt?.setPosition(width / 2, Math.max(72, worldBandHeight * 0.16));
      return;
    }

    camera.setViewport(0, 0, width, height);
    camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
    camera.setFollowOffset(CHAMBER03_BOSS_ARENA.desktopFollowOffsetX, PORTRAIT_LAYOUT.desktopFollowOffsetY);
    this.mobileControls.setReservedBottomPx(0);
    this.restartText.setPosition(width / 2, 90);
    this.bossStatusPrompt?.setPosition(width / 2, Math.max(80, height * 0.16));
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
