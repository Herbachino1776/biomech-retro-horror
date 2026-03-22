import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { COLORS, PLAYER, WORLD } from '../data/milestone1Config.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';
import { restartRunFromDeath } from '../systems/RunReset.js';

const CHAMBER03_BOOTSTRAP = {
  worldWidth: 4800,
  floorColliderHeight: 72,
  floorDisplayHeight: 118,
  floorDepthY: WORLD.floorY - 48,
  floorStripYOffset: 18,
  spawnX: 208,
  spawnY: PLAYER.startY,
  cameraLerp: { x: 0.08, y: 0.08 },
  portraitFollowOffsetX: -120,
  desktopFollowOffsetX: -160,
  segmentWidth: 640,
  segmentSpacing: 24,
  lowerDepthBandHeight: 252,
  lowerDepthBandAlpha: 0.18,
  floorShadowAlpha: 0.34,
  playerHalo: {
    fill: 0xd8cfbb,
    alpha: 0.18,
    scale: 1.1
  }
};

const CHAMBER03_BOSS_THRESHOLD = {
  portalX: 4540,
  portalY: WORLD.floorY - 112,
  portalWidth: 178,
  portalHeight: 248,
  zoneWidth: 180,
  zoneHeight: 212,
  promptOffsetY: -162,
  shellTint: 0xcbb79f,
  shellAlpha: 0.82,
  auraTint: COLORS.sickly,
  auraAlpha: 0.18,
  fallbackVeinTint: 0xa88e71,
  fallbackVeinAlpha: 0.76
};

const CHAMBER03_PROCESSION = [
  {
    key: ASSET_KEYS.chamber03BackgroundEntryNave,
    width: 900,
    height: 444,
    y: 208,
    tint: 0xcfc0ab,
    alpha: 0.74,
    depth: -14.7
  },
  {
    key: ASSET_KEYS.chamber03BackgroundWallModule,
    width: 660,
    height: 362,
    y: 228,
    tint: 0xc4b29b,
    alpha: 0.54,
    depth: -14.45
  },
  {
    key: ASSET_KEYS.chamber03BackgroundWallModule,
    width: 660,
    height: 362,
    y: 232,
    tint: 0xbba893,
    alpha: 0.5,
    depth: -14.42
  },
  {
    key: ASSET_KEYS.chamber03BackgroundChoirOpening,
    width: 900,
    height: 416,
    y: 220,
    tint: 0xcbb9a1,
    alpha: 0.64,
    depth: -14.6
  },
  {
    key: ASSET_KEYS.chamber03BackgroundWallModule,
    width: 660,
    height: 362,
    y: 228,
    tint: 0xb8a48e,
    alpha: 0.5,
    depth: -14.38
  },
  {
    key: ASSET_KEYS.chamber03BackgroundThreshold,
    width: 860,
    height: 430,
    y: 214,
    tint: 0xc7b49f,
    alpha: 0.68,
    depth: -14.62
  }
];

const CHAMBER03_MARKERS = [
  {
    x: 1450,
    ribWidth: 18,
    ribHeight: 260,
    archWidth: 168,
    archHeight: 114,
    alpha: 0.2,
    depth: -11.8
  },
  {
    x: 2800,
    ribWidth: 20,
    ribHeight: 286,
    archWidth: 182,
    archHeight: 124,
    alpha: 0.22,
    depth: -11.85
  },
  {
    x: 4050,
    ribWidth: 24,
    ribHeight: 316,
    archWidth: 220,
    archHeight: 138,
    alpha: 0.24,
    depth: -11.9
  }
];

export class Chamber03Scene extends Phaser.Scene {
  constructor() {
    super('Chamber03Scene');
  }

  init(data) {
    this.transitionContext = data ?? {};
    this.isRestartingRun = false;
    this.isTransitioningToBossArena = false;
    this.currentBossThresholdZone = null;
  }

  create() {
    this.createWorldBounds();
    this.createBackgroundAndFloor();
    this.createPlayerAndColliders();
    this.createBossThreshold();
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

    this.add.rectangle(
      CHAMBER03_BOOTSTRAP.worldWidth / 2,
      WORLD.floorY - 98,
      CHAMBER03_BOOTSTRAP.worldWidth,
      CHAMBER03_BOOTSTRAP.lowerDepthBandHeight,
      COLORS.oil,
      CHAMBER03_BOOTSTRAP.lowerDepthBandAlpha
    ).setDepth(-14.25);

    this.renderProcessionBackdrop();
    this.renderArchitecturalMarkers();
    this.renderFloor();
    this.createInvisiblePlatform(
      CHAMBER03_BOOTSTRAP.worldWidth / 2,
      WORLD.floorY + 28,
      CHAMBER03_BOOTSTRAP.worldWidth,
      CHAMBER03_BOOTSTRAP.floorColliderHeight
    );
  }

  renderProcessionBackdrop() {
    const startX = 360;

    CHAMBER03_PROCESSION.forEach((segment, index) => {
      const x = startX + index * (CHAMBER03_BOOTSTRAP.segmentWidth + CHAMBER03_BOOTSTRAP.segmentSpacing);
      const hasSegmentArt = this.textures.exists(segment.key);

      if (hasSegmentArt) {
        this.add
          .image(x, segment.y, segment.key)
          .setDisplaySize(segment.width, segment.height)
          .setTint(segment.tint)
          .setAlpha(segment.alpha)
          .setDepth(segment.depth);
      } else {
        this.renderFallbackProcessionSegment(x, segment, index);
      }

      this.add
        .ellipse(x, WORLD.floorY - 34, segment.width * 0.86, 68, 0x0a0808, 0.12 + index * 0.01)
        .setDepth(-14.1);
    });
  }

  renderFallbackProcessionSegment(x, segment, index) {
    const frameColor = index >= CHAMBER03_PROCESSION.length - 2 ? 0x53463d : 0x43372f;
    const panelColor = index === 3 ? 0x635144 : 0x58483d;

    this.add
      .rectangle(x, segment.y + 12, segment.width, segment.height, panelColor, 0.72)
      .setDepth(segment.depth);

    this.add
      .rectangle(x, segment.y + 16, segment.width - 34, segment.height - 46, frameColor, 0.48)
      .setDepth(segment.depth + 0.02);

    this.add
      .text(x, segment.y + 12, `CHAMBER 03\nSEGMENT ${index + 1}`, {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#d6c7b2',
        align: 'center'
      })
      .setOrigin(0.5)
      .setAlpha(0.74)
      .setDepth(segment.depth + 0.04);
  }

  renderArchitecturalMarkers() {
    CHAMBER03_MARKERS.forEach((marker) => {
      const ribY = WORLD.floorY - marker.ribHeight / 2 - 6;
      const leftRibX = marker.x - marker.archWidth / 2;
      const rightRibX = marker.x + marker.archWidth / 2;

      this.add
        .rectangle(leftRibX, ribY, marker.ribWidth, marker.ribHeight, 0x231a17, marker.alpha)
        .setDepth(marker.depth);
      this.add
        .rectangle(rightRibX, ribY, marker.ribWidth, marker.ribHeight, 0x231a17, marker.alpha)
        .setDepth(marker.depth);
      this.add
        .ellipse(marker.x, ribY - marker.ribHeight / 2 + 18, marker.archWidth, marker.archHeight, 0x3f342d, marker.alpha * 0.92)
        .setDepth(marker.depth - 0.04);
      this.add
        .ellipse(marker.x, WORLD.floorY + 8, marker.archWidth * 1.18, 28, 0x050404, marker.alpha * 0.85)
        .setDepth(-5.2);
    });
  }

  renderFloor() {
    this.add
      .rectangle(
        CHAMBER03_BOOTSTRAP.worldWidth / 2,
        CHAMBER03_BOOTSTRAP.floorDepthY,
        CHAMBER03_BOOTSTRAP.worldWidth,
        228,
        COLORS.architecture,
        0.6
      )
      .setDepth(-13);

    const hasFloorStrip = this.textures.exists(ASSET_KEYS.chamber02FloorStrip);

    if (hasFloorStrip) {
      this.add
        .tileSprite(
          CHAMBER03_BOOTSTRAP.worldWidth / 2,
          WORLD.floorY + CHAMBER03_BOOTSTRAP.floorStripYOffset,
          CHAMBER03_BOOTSTRAP.worldWidth,
          CHAMBER03_BOOTSTRAP.floorDisplayHeight,
          ASSET_KEYS.chamber02FloorStrip
        )
        .setTint(0xcab9a1)
        .setAlpha(0.72)
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
      .ellipse(
        CHAMBER03_BOOTSTRAP.worldWidth / 2,
        WORLD.floorY + 10,
        CHAMBER03_BOOTSTRAP.worldWidth,
        58,
        0x050404,
        CHAMBER03_BOOTSTRAP.floorShadowAlpha
      )
      .setDepth(-5);
  }

  createPlayerAndColliders() {
    this.player = new Player(this, CHAMBER03_BOOTSTRAP.spawnX, CHAMBER03_BOOTSTRAP.spawnY, PLAYER);
    this.applyGameplayReadabilitySupport(this.player.sprite, CHAMBER03_BOOTSTRAP.playerHalo);
    this.physics.add.collider(this.player.sprite, this.platforms);
  }

  createBossThreshold() {
    const baseX = CHAMBER03_BOSS_THRESHOLD.portalX;
    const baseY = CHAMBER03_BOSS_THRESHOLD.portalY;
    const hasThresholdArt = this.textures.exists(ASSET_KEYS.chamber03BackgroundThreshold);

    this.add.ellipse(baseX, WORLD.floorY + 10, 248, 40, 0x050404, 0.32).setDepth(-4.6);
    this.bossThresholdAura = this.add
      .ellipse(baseX, baseY + 22, 124, 196, CHAMBER03_BOSS_THRESHOLD.auraTint, CHAMBER03_BOSS_THRESHOLD.auraAlpha)
      .setDepth(-4.5);
    this.bossThresholdInnerAura = this.add
      .ellipse(baseX, baseY + 10, 74, 156, 0xe0d0a2, 0.14)
      .setDepth(-4.45);

    if (hasThresholdArt) {
      this.bossThresholdShell = this.add
        .image(baseX, baseY, ASSET_KEYS.chamber03BackgroundThreshold)
        .setDisplaySize(CHAMBER03_BOSS_THRESHOLD.portalWidth, CHAMBER03_BOSS_THRESHOLD.portalHeight)
        .setTint(CHAMBER03_BOSS_THRESHOLD.shellTint)
        .setAlpha(CHAMBER03_BOSS_THRESHOLD.shellAlpha)
        .setDepth(-4.35);
    } else {
      this.bossThresholdShell = this.add
        .ellipse(baseX, baseY, CHAMBER03_BOSS_THRESHOLD.portalWidth, CHAMBER03_BOSS_THRESHOLD.portalHeight, 0x3e322b, 0.92)
        .setStrokeStyle(3, 0xd2c2ac, 0.5)
        .setDepth(-4.35);

      this.add
        .ellipse(baseX, baseY, 52, 164, CHAMBER03_BOSS_THRESHOLD.fallbackVeinTint, CHAMBER03_BOSS_THRESHOLD.fallbackVeinAlpha)
        .setDepth(-4.3);
      this.add.rectangle(baseX - 44, baseY + 6, 10, 156, 0x2b211d, 0.8).setAngle(-8).setDepth(-4.28);
      this.add.rectangle(baseX + 44, baseY + 6, 10, 156, 0x2b211d, 0.8).setAngle(8).setDepth(-4.28);
    }

    this.bossThresholdPrompt = this.add
      .text(baseX, baseY + CHAMBER03_BOSS_THRESHOLD.promptOffsetY, 'CROSS THE DAIS', {
        fontFamily: 'monospace',
        fontSize: '15px',
        color: '#d9cbb8',
        align: 'center',
        stroke: '#120d0c',
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setDepth(-4.2)
      .setVisible(false);

    this.bossThresholdZone = this.add
      .zone(baseX, WORLD.floorY - 44, CHAMBER03_BOSS_THRESHOLD.zoneWidth, CHAMBER03_BOSS_THRESHOLD.zoneHeight)
      .setOrigin(0.5);
    this.physics.add.existing(this.bossThresholdZone, true);
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

    if (this.isTransitioningToBossArena) {
      this.mobileControls.setMode('init');
      this.player.body.setVelocity(0, 0);
      this.player.body.setEnable(false);
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
    this.refreshBossThresholdPresence();
    this.tryBeginBossArenaTransition(mobileInput);
    this.updateBossThresholdAura(time);
    this.hud.update(this.player.health, PLAYER.maxHealth);
  }

  refreshBossThresholdPresence() {
    this.currentBossThresholdZone = null;

    if (!this.bossThresholdZone || this.isTransitioningToBossArena) {
      this.bossThresholdPrompt?.setVisible(false);
      return;
    }

    this.physics.overlap(this.player.sprite, this.bossThresholdZone, () => {
      this.currentBossThresholdZone = this.bossThresholdZone;
    });

    this.bossThresholdPrompt?.setVisible(Boolean(this.currentBossThresholdZone));
  }

  tryBeginBossArenaTransition(mobileInput) {
    if (!this.currentBossThresholdZone || this.isTransitioningToBossArena) {
      return;
    }

    const interactPressed =
      Phaser.Input.Keyboard.JustDown(this.keyInteract) ||
      Phaser.Input.Keyboard.JustDown(this.keyEnter) ||
      mobileInput.interactPressed;

    if (!interactPressed) {
      return;
    }

    this.beginBossArenaTransition();
  }

  beginBossArenaTransition() {
    if (this.isTransitioningToBossArena) {
      return;
    }

    this.isTransitioningToBossArena = true;
    this.currentBossThresholdZone = null;
    this.bossThresholdPrompt?.setVisible(false);
    this.mobileControls.setMode('init');
    this.player.body.setVelocity(0, 0);
    this.player.body.setEnable(false);
    this.player.attackHitbox?.body?.setEnable(false);

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('Chamber03BossArenaScene', {
        enteredFrom: 'chamber03-boss-threshold',
        progressionSource: 'processional-threshold-gate'
      });
    });

    this.cameras.main.fadeOut(420, 0, 0, 0);
  }

  updateBossThresholdAura(time) {
    if (!this.bossThresholdAura || !this.bossThresholdInnerAura) {
      return;
    }

    const occupied = Boolean(this.currentBossThresholdZone);
    const outerPulse = 0.14 + (Math.sin(time / 190) + 1) * 0.045 + (occupied ? 0.08 : 0);
    const innerPulse = 0.08 + (Math.sin(time / 240) + 1) * 0.03 + (occupied ? 0.06 : 0);

    this.bossThresholdAura.setAlpha(outerPulse).setScale(1 + Math.sin(time / 280) * 0.03, 1.02);
    this.bossThresholdInnerAura.setAlpha(innerPulse).setScale(1 + Math.sin(time / 220) * 0.025, 1.01);
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
