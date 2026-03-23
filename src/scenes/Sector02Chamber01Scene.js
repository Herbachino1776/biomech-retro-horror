import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import { AudioDirector } from '../audio/AudioDirector.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { COLORS, PLAYER, WORLD } from '../data/milestone1Config.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';
import { restartRunFromDeath } from '../systems/RunReset.js';

const BLACK_AQUEDUCT_BOOTSTRAP = {
  sceneKey: 'Sector02Chamber01Scene',
  worldWidth: 4480,
  floorColliderHeight: 72,
  spawnX: 220,
  spawnY: PLAYER.startY,
  cameraLerp: { x: 0.08, y: 0.08 },
  portraitFollowOffsetX: -112,
  desktopFollowOffsetX: -156,
  backdropDepth: -16,
  lowerBandY: WORLD.floorY - 72,
  lowerBandHeight: 268,
  lowerBandAlpha: 0.22,
  canalY: WORLD.floorY + 54,
  canalHeight: 126,
  canalAlpha: 0.7,
  reflectionY: WORLD.floorY + 28
};

const BLACK_AQUEDUCT_SEGMENTS = [
  {
    key: ASSET_KEYS.sector02Chamber01BackgroundEntryCanal,
    x: 360,
    y: 220,
    width: 860,
    height: 468,
    tint: 0xb7b9ad,
    alpha: 0.7,
    depth: -14.72
  },
  {
    key: ASSET_KEYS.sector02Chamber01BackgroundWallModule,
    x: 1120,
    y: 214,
    width: 792,
    height: 448,
    tint: 0xa5a394,
    alpha: 0.58,
    depth: -14.6
  },
  {
    key: ASSET_KEYS.sector02Chamber01BackgroundSluiceOpening,
    x: 1920,
    y: 218,
    width: 920,
    height: 448,
    tint: 0xb8bdae,
    alpha: 0.7,
    depth: -14.76
  },
  {
    key: ASSET_KEYS.sector02Chamber01BackgroundWallModule,
    x: 2720,
    y: 214,
    width: 812,
    height: 450,
    tint: 0x969487,
    alpha: 0.56,
    depth: -14.58
  },
  {
    key: ASSET_KEYS.sector02Chamber01BackgroundThreshold,
    x: 3500,
    y: 216,
    width: 904,
    height: 452,
    tint: 0xb4b8ab,
    alpha: 0.68,
    depth: -14.74
  },
  {
    key: ASSET_KEYS.sector02Chamber01BackgroundClimax,
    x: 4150,
    y: 208,
    width: 728,
    height: 452,
    tint: 0xb9c0b0,
    alpha: 0.74,
    depth: -14.78
  }
];

const BLACK_AQUEDUCT_RIBS = [
  { x: 820, ribWidth: 26, ribHeight: 300, archWidth: 220, archHeight: 138, alpha: 0.16, depth: -11.7 },
  { x: 2050, ribWidth: 24, ribHeight: 332, archWidth: 244, archHeight: 152, alpha: 0.18, depth: -11.76 },
  { x: 3360, ribWidth: 28, ribHeight: 348, archWidth: 268, archHeight: 164, alpha: 0.2, depth: -11.82 }
];

const BLACK_AQUEDUCT_LORE = {
  cutsceneId: 'sector02-chamber01-basin-reliquary',
  zoneX: 3080,
  zoneY: WORLD.floorY - 74,
  zoneWidth: 180,
  zoneHeight: 208,
  promptOffsetY: -172,
  muralX: 3080,
  muralY: 220,
  muralWidth: 472,
  muralHeight: 290,
  backingWidth: 548,
  backingHeight: 346
};

export class Sector02Chamber01Scene extends Phaser.Scene {
  constructor() {
    super(BLACK_AQUEDUCT_BOOTSTRAP.sceneKey);
  }

  init(data) {
    this.transitionContext = data ?? {};
    this.isRestartingRun = false;
    this.isLoreTransitionActive = false;
    this.currentLoreZone = null;
    this.hasCompletedLoreBeat = false;
  }

  create() {
    this.createWorldBounds();
    this.createAudio();
    this.createBackdrop();
    this.createPlayerAndColliders();
    this.createLoreAnchor();
    this.createUiAndInput();
    this.configureCameraAndLayout();
    this.registerLoreEvents();
  }

  createWorldBounds() {
    this.physics.world.gravity.y = WORLD.gravityY;
    this.cameras.main.setBounds(0, 0, BLACK_AQUEDUCT_BOOTSTRAP.worldWidth, WORLD.height);
    this.physics.world.setBounds(0, 0, BLACK_AQUEDUCT_BOOTSTRAP.worldWidth, WORLD.height);
    this.cameras.main.setBackgroundColor('#050707');
    this.platforms = this.physics.add.staticGroup();
  }

  createAudio() {
    this.audioDirector = new AudioDirector(this);
    this.audioDirector.playAmbientLoop(ASSET_KEYS.ambientChamber02Loop01, { volume: 0.1 });
  }

  createBackdrop() {
    this.add
      .rectangle(
        BLACK_AQUEDUCT_BOOTSTRAP.worldWidth / 2,
        WORLD.height / 2,
        BLACK_AQUEDUCT_BOOTSTRAP.worldWidth,
        WORLD.height,
        0x050707,
        1
      )
      .setDepth(BLACK_AQUEDUCT_BOOTSTRAP.backdropDepth);

    this.add
      .rectangle(
        BLACK_AQUEDUCT_BOOTSTRAP.worldWidth / 2,
        BLACK_AQUEDUCT_BOOTSTRAP.lowerBandY,
        BLACK_AQUEDUCT_BOOTSTRAP.worldWidth,
        BLACK_AQUEDUCT_BOOTSTRAP.lowerBandHeight,
        0x091112,
        BLACK_AQUEDUCT_BOOTSTRAP.lowerBandAlpha
      )
      .setDepth(-14.2);

    this.renderSegmentBackdrop();
    this.renderCanalTrough();
    this.renderArchitecture();
    this.renderWalkway();
    this.createInvisiblePlatform(
      BLACK_AQUEDUCT_BOOTSTRAP.worldWidth / 2,
      WORLD.floorY + 28,
      BLACK_AQUEDUCT_BOOTSTRAP.worldWidth,
      BLACK_AQUEDUCT_BOOTSTRAP.floorColliderHeight
    );
  }

  renderSegmentBackdrop() {
    BLACK_AQUEDUCT_SEGMENTS.forEach((segment, index) => {
      if (this.textures.exists(segment.key)) {
        this.add
          .image(segment.x, segment.y, segment.key)
          .setDisplaySize(segment.width, segment.height)
          .setTint(segment.tint)
          .setAlpha(segment.alpha)
          .setDepth(segment.depth);
      } else {
        this.add
          .rectangle(segment.x, segment.y + 12, segment.width, segment.height, 0x273031, 0.76)
          .setDepth(segment.depth);
      }

      this.add
        .ellipse(segment.x, WORLD.floorY - 28, segment.width * 0.8, 62, 0x040505, 0.12 + index * 0.01)
        .setDepth(-14.08);
    });
  }

  renderCanalTrough() {
    this.add
      .rectangle(
        BLACK_AQUEDUCT_BOOTSTRAP.worldWidth / 2,
        BLACK_AQUEDUCT_BOOTSTRAP.canalY,
        BLACK_AQUEDUCT_BOOTSTRAP.worldWidth,
        BLACK_AQUEDUCT_BOOTSTRAP.canalHeight,
        0x040708,
        BLACK_AQUEDUCT_BOOTSTRAP.canalAlpha
      )
      .setDepth(-13.3);

    this.add
      .ellipse(
        BLACK_AQUEDUCT_BOOTSTRAP.worldWidth / 2,
        BLACK_AQUEDUCT_BOOTSTRAP.reflectionY,
        BLACK_AQUEDUCT_BOOTSTRAP.worldWidth * 0.96,
        74,
        0x27403c,
        0.12
      )
      .setDepth(-13.1);

    [740, 1640, 2660, 3650].forEach((x, index) => {
      this.add
        .ellipse(x, WORLD.floorY + 18, 440 + index * 24, 20, 0x9db29d, 0.06 + index * 0.008)
        .setDepth(-12.95);
      this.add.rectangle(x, WORLD.floorY + 82, 12, 92, 0x121819, 0.42).setDepth(-13.24);
    });
  }

  renderArchitecture() {
    BLACK_AQUEDUCT_RIBS.forEach((marker) => {
      const ribY = WORLD.floorY - marker.ribHeight / 2 - 12;
      const leftRibX = marker.x - marker.archWidth / 2;
      const rightRibX = marker.x + marker.archWidth / 2;

      this.add.rectangle(leftRibX, ribY, marker.ribWidth, marker.ribHeight, 0x1b2122, marker.alpha).setDepth(marker.depth);
      this.add.rectangle(rightRibX, ribY, marker.ribWidth, marker.ribHeight, 0x1b2122, marker.alpha).setDepth(marker.depth);
      this.add
        .ellipse(marker.x, ribY - marker.ribHeight / 2 + 22, marker.archWidth, marker.archHeight, 0x364241, marker.alpha * 0.92)
        .setDepth(marker.depth - 0.04);
      this.add.ellipse(marker.x, WORLD.floorY + 10, marker.archWidth * 1.14, 24, 0x030404, marker.alpha).setDepth(-5.2);
    });
  }

  renderWalkway() {
    // Defer the new floor texture for now: the foothold keeps a conservative opaque walkway
    // so collision/readability stay stable on mobile and desktop.
    this.add
      .rectangle(BLACK_AQUEDUCT_BOOTSTRAP.worldWidth / 2, WORLD.floorY - 14, BLACK_AQUEDUCT_BOOTSTRAP.worldWidth, 96, 0x151716, 0.94)
      .setDepth(-6.3);

    this.add
      .rectangle(BLACK_AQUEDUCT_BOOTSTRAP.worldWidth / 2, WORLD.floorY - 48, BLACK_AQUEDUCT_BOOTSTRAP.worldWidth, 24, 0x202727, 0.74)
      .setDepth(-6.26);

    [520, 1240, 2040, 2860, 3640, 4260].forEach((x, index) => {
      this.add.rectangle(x, WORLD.floorY - 24, 168, 8, 0x6f7f73, 0.18 + index * 0.01).setDepth(-6.18);
      this.add.rectangle(x, WORLD.floorY - 4, 4, 40, 0x050606, 0.32).setDepth(-6.12);
    });

    this.add
      .ellipse(BLACK_AQUEDUCT_BOOTSTRAP.worldWidth / 2, WORLD.floorY + 12, BLACK_AQUEDUCT_BOOTSTRAP.worldWidth, 54, 0x020303, 0.36)
      .setDepth(-5.9);
  }

  createPlayerAndColliders() {
    this.player = new Player(this, BLACK_AQUEDUCT_BOOTSTRAP.spawnX, BLACK_AQUEDUCT_BOOTSTRAP.spawnY, PLAYER);
    this.applyGameplayReadabilitySupport(this.player.sprite, { fill: 0xc2c9bf, alpha: 0.16, scale: 1.08 });
    this.physics.add.collider(this.player.sprite, this.platforms);
  }

  createLoreAnchor() {
    // The lore image is mounted into an opaque wall niche. The altar/gate assets stay deferred
    // in this pass because their transparent silhouettes read too much like floating overlays here.
    this.add.rectangle(BLACK_AQUEDUCT_LORE.muralX, WORLD.floorY - 134, BLACK_AQUEDUCT_LORE.backingWidth, 252, 0x0d1213, 0.74).setDepth(-13.9);
    this.add.rectangle(BLACK_AQUEDUCT_LORE.muralX, WORLD.floorY - 92, BLACK_AQUEDUCT_LORE.backingWidth - 48, 176, 0x1c2324, 0.92).setDepth(-13.82);

    if (this.textures.exists(ASSET_KEYS.sector02Chamber01BackgroundThreshold)) {
      this.add
        .image(BLACK_AQUEDUCT_LORE.muralX, WORLD.floorY - 130, ASSET_KEYS.sector02Chamber01BackgroundThreshold)
        .setDisplaySize(BLACK_AQUEDUCT_LORE.backingWidth, BLACK_AQUEDUCT_LORE.backingHeight)
        .setTint(0x81908a)
        .setAlpha(0.2)
        .setDepth(-13.8);
    }

    if (this.textures.exists(ASSET_KEYS.sector02Chamber01LoreImage)) {
      this.add
        .image(BLACK_AQUEDUCT_LORE.muralX, BLACK_AQUEDUCT_LORE.muralY, ASSET_KEYS.sector02Chamber01LoreImage)
        .setDisplaySize(BLACK_AQUEDUCT_LORE.muralWidth, BLACK_AQUEDUCT_LORE.muralHeight)
        .setTint(0xc7d0bf)
        .setAlpha(0.94)
        .setDepth(-13.65);
    }

    this.add.rectangle(BLACK_AQUEDUCT_LORE.muralX, WORLD.floorY - 6, 382, 18, 0x090b0c, 0.76).setDepth(-6.1);
    this.add.ellipse(BLACK_AQUEDUCT_LORE.muralX, WORLD.floorY + 8, 420, 32, 0x030404, 0.3).setDepth(-6.02);

    this.loreZone = this.add
      .zone(
        BLACK_AQUEDUCT_LORE.zoneX,
        BLACK_AQUEDUCT_LORE.zoneY,
        BLACK_AQUEDUCT_LORE.zoneWidth,
        BLACK_AQUEDUCT_LORE.zoneHeight
      )
      .setOrigin(0.5);
    this.physics.add.existing(this.loreZone, true);

    this.lorePrompt = this.add
      .text(BLACK_AQUEDUCT_LORE.zoneX, BLACK_AQUEDUCT_LORE.zoneY + BLACK_AQUEDUCT_LORE.promptOffsetY, 'READ THE BASIN RELIQUARY', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#cfdbc9',
        align: 'center',
        stroke: '#0d1010',
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setDepth(-4.6)
      .setAlpha(0.9)
      .setVisible(false);

    this.footholdLabel = this.add
      .text(3980, WORLD.floorY - 224, 'BLACK AQUEDUCT\nFOOTHOLD', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#cfd7cc',
        align: 'center',
        stroke: '#0c0f10',
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setDepth(-4.74)
      .setAlpha(0.82);
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
    this.keyInteract = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keyRestart = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.applyResponsiveLayout, this);
      this.audioDirector?.shutdown();
      this.game.events.off('lore-cutscene-complete', this.handleLoreCutsceneComplete, this);
    });
  }

  configureCameraAndLayout() {
    this.cameras.main.startFollow(
      this.player.sprite,
      true,
      BLACK_AQUEDUCT_BOOTSTRAP.cameraLerp.x,
      BLACK_AQUEDUCT_BOOTSTRAP.cameraLerp.y,
      BLACK_AQUEDUCT_BOOTSTRAP.desktopFollowOffsetX,
      0
    );
    this.scale.on('resize', this.applyResponsiveLayout, this);
    this.applyResponsiveLayout();
    this.mobileControls.setMode('gameplay');
    this.hud.update(this.player.health, PLAYER.maxHealth);
  }

  registerLoreEvents() {
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

    if (this.isLoreTransitionActive) {
      this.mobileControls.setMode('dialogue');
      this.player.body.setVelocity(0, 0);
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
    this.refreshLoreZonePresence();
    this.tryBeginLoreSequence(mobileInput);
    this.updateFootholdLabel(time);
    this.hud.update(this.player.health, PLAYER.maxHealth);
  }

  refreshLoreZonePresence() {
    this.currentLoreZone = null;

    if (!this.loreZone || this.isLoreTransitionActive) {
      this.lorePrompt?.setVisible(false);
      return;
    }

    this.physics.overlap(this.player.sprite, this.loreZone, () => {
      this.currentLoreZone = this.loreZone;
    });

    this.lorePrompt?.setVisible(Boolean(this.currentLoreZone));
  }

  tryBeginLoreSequence(mobileInput) {
    if (!this.currentLoreZone) {
      return;
    }

    const interactPressed =
      Phaser.Input.Keyboard.JustDown(this.keyInteract) ||
      Phaser.Input.Keyboard.JustDown(this.keyEnter) ||
      mobileInput.interactPressed;

    if (!interactPressed) {
      return;
    }

    this.beginLoreSequence();
  }

  beginLoreSequence() {
    if (this.isLoreTransitionActive) {
      return;
    }

    this.isLoreTransitionActive = true;
    this.currentLoreZone = null;
    this.lorePrompt?.setVisible(false);
    this.mobileControls.setMode('dialogue');
    this.player.body.setVelocity(0, 0);
    this.audioDirector?.stopAmbientLoop();

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.pause();
      this.scene.launch('LoreCutsceneScene', {
        cutsceneId: BLACK_AQUEDUCT_LORE.cutsceneId,
        returnSceneKey: this.scene.key
      });
    });

    this.cameras.main.fadeOut(420, 0, 0, 0);
  }

  handleLoreCutsceneComplete({ cutsceneId } = {}) {
    if (cutsceneId !== BLACK_AQUEDUCT_LORE.cutsceneId) {
      return;
    }

    this.hasCompletedLoreBeat = true;
    this.resumeFromLore();
  }

  resumeFromLore() {
    this.isLoreTransitionActive = false;
    this.mobileControls.setMode('gameplay');
    this.audioDirector?.playAmbientLoop(ASSET_KEYS.ambientChamber02Loop01, { volume: 0.1 });
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  updateFootholdLabel(time) {
    const completionBoost = this.hasCompletedLoreBeat ? 0.12 : 0;
    this.footholdLabel?.setAlpha(0.68 + (Math.sin(time / 500) + 1) * 0.04 + completionBoost);
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

    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'Sector02Chamber01MobileUiCamera');
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
      camera.setFollowOffset(BLACK_AQUEDUCT_BOOTSTRAP.portraitFollowOffsetX, PORTRAIT_LAYOUT.portraitFollowOffsetY);
      this.mobileControls.setReservedBottomPx(height - worldBandHeight);
      this.restartText.setPosition(
        width / 2,
        Math.max(PORTRAIT_LAYOUT.restartTextMinY, worldBandHeight * PORTRAIT_LAYOUT.restartTextRatioY)
      );
      return;
    }

    camera.setViewport(0, 0, width, height);
    camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
    camera.setFollowOffset(BLACK_AQUEDUCT_BOOTSTRAP.desktopFollowOffsetX, PORTRAIT_LAYOUT.desktopFollowOffsetY);
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
