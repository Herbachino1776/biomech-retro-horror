import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { SkitterServitor } from '../entities/SkitterServitor.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { COLORS, PLAYER, SKITTER, WORLD } from '../data/milestone1Config.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';

const CHAMBER02_WORLD_WIDTH = 3600;

const CHAMBER02_PLATFORMS = [
  { x: 700, y: 372, width: 170, height: 20 },
  { x: 1170, y: 338, width: 160, height: 20 },
  { x: 1810, y: 384, width: 230, height: 20 },
  { x: 2420, y: 346, width: 190, height: 20 },
  { x: 3070, y: 376, width: 220, height: 20 }
];

const CHAMBER02_ENEMY_SPAWNS = [
  { x: 1140, y: 402, awakenPlayerX: 830 },
  { x: 2410, y: 402, awakenPlayerX: 2050 },
  { x: 3180, y: 402, awakenPlayerX: 2880 }
];

const CHAMBER02_LORE_TRIGGER = {
  id: 'chamber02-horn-memory',
  x: 2840,
  y: 406,
  width: 78,
  height: 76,
  screenId: 'chamber02-vertebral-memory'
};

export class Chamber02Scene extends Phaser.Scene {
  constructor() {
    super('Chamber02Scene');
  }

  init(data) {
    this.transitionContext = data ?? {};
  }

  create() {
    this.physics.world.gravity.y = WORLD.gravityY;
    this.cameras.main.setBounds(0, 0, CHAMBER02_WORLD_WIDTH, WORLD.height);
    this.physics.world.setBounds(0, 0, CHAMBER02_WORLD_WIDTH, WORLD.height);

    this.cameras.main.setBackgroundColor('#070707');
    this.cameras.main.fadeIn(700, 0, 0, 0);

    this.platforms = this.physics.add.staticGroup();
    this.loreZones = this.physics.add.staticGroup();
    this.triggeredLoreIds = new Set();
    this.currentLoreZone = null;
    this.isLoreTransitionActive = false;

    this.renderProcessionalBackdrop();
    this.createPlatforms();

    this.player = new Player(this, 150, 360, PLAYER);
    this.physics.add.collider(this.player.sprite, this.platforms);

    this.enemies = this.createEnemyEncounter();

    this.hud = new HudOverlay(this);
    this.mobileControls = new MobileControls(this);
    this.setupMobileUiCamera();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyAttack = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.keyInteract = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08, -140, 0);
    this.scale.on('resize', this.applyResponsiveLayout, this);
    this.game.events.on('lore-screen-complete', this.handleLoreScreenComplete, this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.applyResponsiveLayout, this);
      this.game.events.off('lore-screen-complete', this.handleLoreScreenComplete, this);
    });

    this.applyResponsiveLayout();
    this.hud.update(this.player.health, PLAYER.maxHealth);
  }

  renderProcessionalBackdrop() {
    this.add
      .rectangle(CHAMBER02_WORLD_WIDTH / 2, WORLD.height / 2, CHAMBER02_WORLD_WIDTH, WORLD.height, COLORS.backdrop, 1)
      .setOrigin(0.5)
      .setDepth(-14);

    const plateSegmentWidth = 540;
    const segmentCount = Math.ceil(CHAMBER02_WORLD_WIDTH / plateSegmentWidth) + 1;

    for (let i = 0; i < segmentCount; i += 1) {
      const segmentX = i * plateSegmentWidth + plateSegmentWidth / 2;
      const parityTint = i % 2 === 0 ? 0xbfae95 : 0xb1a38e;
      if (this.textures.exists(ASSET_KEYS.chamber02BackgroundPlate)) {
        this.add
          .image(segmentX, 220, ASSET_KEYS.chamber02BackgroundPlate)
          .setDisplaySize(plateSegmentWidth + 44, 382)
          .setTint(parityTint)
          .setAlpha(0.56)
          .setDepth(-13);
      } else {
        this.add
          .rectangle(segmentX, 220, plateSegmentWidth + 44, 382, COLORS.architecture, 0.5)
          .setStrokeStyle(2, COLORS.rust, 0.25)
          .setDepth(-13);
      }

      if (this.textures.exists(ASSET_KEYS.chamber02ForegroundHornArch) && i % 2 === 1) {
        this.add
          .image(segmentX + 32, 276, ASSET_KEYS.chamber02ForegroundHornArch)
          .setDisplaySize(230, 226)
          .setTint(0xb39f89)
          .setAlpha(0.22)
          .setDepth(-11);
      }
    }

    const floorStripHeight = 116;
    if (this.textures.exists(ASSET_KEYS.chamber02FloorStrip)) {
      this.add
        .tileSprite(CHAMBER02_WORLD_WIDTH / 2, WORLD.floorY + 4, CHAMBER02_WORLD_WIDTH, floorStripHeight, ASSET_KEYS.chamber02FloorStrip)
        .setTint(0xd8cab4)
        .setAlpha(0.84)
        .setDepth(-10);
    }

    this.add
      .ellipse(1930, 404, 500, 96, COLORS.sickly, 0.16)
      .setDepth(-9);
  }

  createPlatforms() {
    const floor = this.add
      .rectangle(CHAMBER02_WORLD_WIDTH / 2, WORLD.floorY + 28, CHAMBER02_WORLD_WIDTH, 72, COLORS.foreground, 0.9)
      .setOrigin(0.5)
      .setDepth(-8);
    this.physics.add.existing(floor, true);
    this.platforms.add(floor);

    CHAMBER02_PLATFORMS.forEach((platform) => {
      const slab = this.add.rectangle(platform.x, platform.y, platform.width, platform.height, COLORS.foreground, 0.9).setDepth(-7);
      this.physics.add.existing(slab, true);
      this.platforms.add(slab);
    });

    if (this.textures.exists(ASSET_KEYS.chamber02VertebralHornGate)) {
      this.add
        .image(1970, 274, ASSET_KEYS.chamber02VertebralHornGate)
        .setDisplaySize(420, 452)
        .setCrop(194, 166, 640, 1140)
        .setTint(0xd4c5af)
        .setAlpha(0.82)
        .setDepth(-6);
    }

    this.createLoreShrine();
  }

  createLoreShrine() {
    const entry = CHAMBER02_LORE_TRIGGER;
    const baseY = entry.y + 12;

    this.add.ellipse(entry.x, baseY + 6, 142, 44, COLORS.oil, 0.32).setDepth(-5);
    this.add.ellipse(entry.x, baseY + 3, 108, 30, COLORS.sickly, 0.24).setDepth(-5);
    this.add.rectangle(entry.x, baseY - 2, 122, 26, COLORS.bloodMetal, 0.9).setDepth(-5);
    this.add.ellipse(entry.x, baseY - 22, 82, 36, COLORS.bone, 0.8).setDepth(-5);

    if (this.textures.exists(ASSET_KEYS.chamber02RitualAlignmentLandmark)) {
      this.add
        .image(entry.x, baseY - 26, ASSET_KEYS.chamber02RitualAlignmentLandmark)
        .setDisplaySize(172, 152)
        .setTint(0xc0b093)
        .setAlpha(0.72)
        .setDepth(-4);
    }

    const zone = this.add.zone(entry.x, entry.y, entry.width, entry.height).setOrigin(0.5);
    this.physics.add.existing(zone, true);
    zone.loreEntry = entry;
    this.loreZones.add(zone);
  }

  createEnemyEncounter() {
    const enemies = CHAMBER02_ENEMY_SPAWNS.map((spawn) => {
      const enemyConfig = {
        ...SKITTER,
        awakenPlayerX: spawn.awakenPlayerX,
        wakeDelayMs: 500,
        patrolDistance: 180
      };
      const enemy = new SkitterServitor(this, spawn.x, spawn.y, enemyConfig);
      this.physics.add.collider(enemy.sprite, this.platforms);
      this.physics.add.overlap(this.player.attackHitbox, enemy.sprite, (attackZone, enemySprite) => {
        this.handlePlayerHitEnemy(attackZone, enemySprite, enemy);
      });
      this.physics.add.overlap(this.player.sprite, enemy.sprite, (playerSprite, enemySprite) => {
        this.handleEnemyContactPlayer(playerSprite, enemySprite, enemy);
      });
      return enemy;
    });

    return enemies;
  }

  update(time) {
    if (this.player.isDead) {
      this.mobileControls.setMode('dead');
      return;
    }

    this.mobileControls.setMode(this.isLoreTransitionActive ? 'dialogue' : 'gameplay');
    const mobileInput = this.mobileControls.getInputState();

    if (!this.isLoreTransitionActive) {
      this.player.update(time, {
        left: this.cursors.left.isDown || mobileInput.left,
        right: this.cursors.right.isDown || mobileInput.right,
        jumpPressed:
          Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
          Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
          mobileInput.jumpPressed,
        attackPressed: Phaser.Input.Keyboard.JustDown(this.keyAttack) || mobileInput.attackPressed
      });

      this.enemies.forEach((enemy) => enemy.update(time, this.player.sprite.x));

      this.refreshLoreZonePresence();
      this.tryBeginLoreSequence(mobileInput);
    }

    this.hud.update(this.player.health, PLAYER.maxHealth);
  }

  refreshLoreZonePresence() {
    this.currentLoreZone = null;

    this.physics.overlap(this.player.sprite, this.loreZones, (_, zone) => {
      if (!zone?.loreEntry || this.triggeredLoreIds.has(zone.loreEntry.id)) {
        return;
      }

      this.currentLoreZone = zone;
    });
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

    const loreEntry = this.currentLoreZone.loreEntry;
    if (!loreEntry || this.triggeredLoreIds.has(loreEntry.id)) {
      return;
    }

    this.triggeredLoreIds.add(loreEntry.id);
    this.beginLoreSequence(loreEntry);
  }

  beginLoreSequence(loreEntry) {
    if (!loreEntry?.screenId || this.isLoreTransitionActive) {
      return;
    }

    this.isLoreTransitionActive = true;
    this.mobileControls.setMode('dialogue');
    this.player.body.setVelocity(0, 0);
    this.enemies.forEach((enemy) => {
      enemy.body.setVelocity(0, 0);
    });

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.pause();
      this.scene.launch('LoreScreenScene', {
        screenId: loreEntry.screenId,
        returnSceneKey: this.scene.key
      });
    });

    this.cameras.main.fadeOut(450, 0, 0, 0);
  }

  handleLoreScreenComplete({ screenId } = {}) {
    if (screenId !== CHAMBER02_LORE_TRIGGER.screenId) {
      return;
    }

    this.isLoreTransitionActive = false;
    this.mobileControls.setMode('gameplay');
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  handlePlayerHitEnemy(_attackZone, enemySprite, enemy) {
    if (!this.player.attackActive || enemy.dead || !this.isEnemyOverlapTarget(enemySprite, enemy)) {
      return;
    }

    if (enemy.lastAttackHitId === this.player.attackId) {
      return;
    }

    enemy.lastAttackHitId = this.player.attackId;
    enemy.takeDamage(1, this.time.now);

    const knockDirection = Math.sign(enemy.sprite.x - this.player.sprite.x) || this.player.facing;
    enemy.body.setVelocityX(knockDirection * 160);
    enemy.body.setVelocityY(-120);
  }

  handleEnemyContactPlayer(_playerSprite, enemySprite, enemy) {
    if (enemy.dead || !this.isEnemyOverlapTarget(enemySprite, enemy)) {
      return;
    }

    const tookDamage = this.player.receiveDamage(SKITTER.contactDamage, this.time.now);
    if (tookDamage) {
      const knockDirection = Math.sign(this.player.sprite.x - enemy.sprite.x) || 1;
      this.player.body.setVelocityX(knockDirection * 220);
      this.player.body.setVelocityY(-220);
    }
  }

  isEnemyOverlapTarget(target, enemy) {
    return target === enemy.sprite || target?.gameObject === enemy.sprite;
  }

  setupMobileUiCamera() {
    if (!this.mobileControls.enabled) {
      return;
    }

    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'Chamber02MobileUiCamera');

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
      this.mobileControls.setReservedBottomPx(height - worldBandHeight);
      return;
    }

    camera.setViewport(0, 0, width, height);
    camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
    this.mobileControls.setReservedBottomPx(0);
  }
}
