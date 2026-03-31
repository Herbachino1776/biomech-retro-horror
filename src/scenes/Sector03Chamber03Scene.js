import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { SkitterServitor } from '../entities/SkitterServitor.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import { AudioDirector } from '../audio/AudioDirector.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { PLAYER, SKITTER, WORLD } from '../data/milestone1Config.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';
import { createDirectionalCameraBias } from '../systems/DirectionalCameraBias.js';
import { restartRunFromDeath } from '../systems/RunReset.js';
import { applyChamberEntryRestore } from '../systems/VesselRunEconomy.js';

const CHAMBER = {
  sceneKey: 'Sector03Chamber03Scene',
  worldWidth: 6760,
  floorColliderHeight: 72,
  spawnX: 220,
  spawnY: PLAYER.startY,
  cameraLerp: { x: 0.08, y: 0.08 },
  portraitFollowOffsetX: -112,
  desktopFollowOffsetX: -156
};

const SEGMENTS = [
  { key: ASSET_KEYS.sector03Chamber03BackgroundEntryNave, x: 460, y: 216, width: 960, height: 484, tint: 0xd4c8b8, alpha: 0.8 },
  { key: ASSET_KEYS.sector03Chamber03BackgroundWallModule01, x: 1340, y: 214, width: 860, height: 454, tint: 0xb8ab9a, alpha: 0.62 },
  { key: ASSET_KEYS.sector03Chamber03BackgroundWallModule02, x: 2120, y: 214, width: 860, height: 454, tint: 0xa19588, alpha: 0.58 },
  { key: ASSET_KEYS.sector03Chamber03BackgroundWallModule03, x: 2900, y: 214, width: 860, height: 454, tint: 0x998b80, alpha: 0.56 },
  { key: ASSET_KEYS.sector03Chamber03BackgroundRefusalOpening, x: 3900, y: 214, width: 980, height: 474, tint: 0xd3c4b0, alpha: 0.76 },
  { key: ASSET_KEYS.sector03Chamber03BackgroundThreshold, x: 5140, y: 214, width: 920, height: 464, tint: 0xcfbeaa, alpha: 0.74 }
];

const ENEMIES = {
  barrierSinger: {
    ...SKITTER,
    textureKey: ASSET_KEYS.sector03Chamber03EnemyBasicBarrierSinger,
    presentation: { alpha: 0.98, display: { width: 184, height: 152 }, origin: { x: 0.52, y: 0.95 }, stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.44 } },
    corpseRemainsProfile: 'sector3Basic'
  },
  nullClaimant: {
    ...SKITTER,
    textureKey: ASSET_KEYS.sector03Chamber03EnemyBasicNullClaimant,
    presentation: { alpha: 0.98, display: { width: 184, height: 152 }, origin: { x: 0.52, y: 0.95 }, stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.44 } },
    corpseRemainsProfile: 'sector3Basic'
  },
  refusalWarden: {
    ...SKITTER,
    textureKey: ASSET_KEYS.sector03Chamber03EnemyBasicRefusalWarden,
    presentation: { alpha: 0.98, display: { width: 188, height: 154 }, origin: { x: 0.52, y: 0.95 }, stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.44 } },
    corpseRemainsProfile: 'sector3Basic'
  },
  sealedArchetype: {
    ...SKITTER,
    textureKey: ASSET_KEYS.sector03Chamber03EnemyBasicSealedArchetype,
    presentation: { alpha: 0.98, display: { width: 190, height: 154 }, origin: { x: 0.52, y: 0.95 }, stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.44 } },
    corpseRemainsProfile: 'sector3Basic'
  },
  elite: {
    ...SKITTER,
    textureKey: ASSET_KEYS.sector03Chamber03EnemyEliteNonentryArchon,
    health: 8,
    speed: 46,
    aggroRange: 296,
    patrolDistance: 94,
    body: { width: 76, height: 46, offsetX: 30, offsetY: 92 },
    presentation: { alpha: 0.98, display: { width: 312, height: 242 }, origin: { x: 0.52, y: 0.965 }, stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.46 } },
    corpseRemainsProfile: 'sector3Elite'
  }
};

const POCKETS = [
  {
    id: 'entry-nave-procession', label: 'GATE OF REFUSAL', zoneX: 1500, zoneY: WORLD.floorY - 72, zoneWidth: 650, zoneHeight: 226,
    enemies: [{ type: 'barrierSinger', x: 1290 }, { type: 'nullClaimant', x: 1490 }, { type: 'refusalWarden', x: 1680, wakeDelayMs: 80 }]
  },
  {
    id: 'wall-module-run', label: 'WALL OF NONENTRY', zoneX: 2420, zoneY: WORLD.floorY - 72, zoneWidth: 790, zoneHeight: 236,
    enemies: [{ type: 'sealedArchetype', x: 2160 }, { type: 'barrierSinger', x: 2380, wakeDelayMs: 40 }, { type: 'nullClaimant', x: 2580, wakeDelayMs: 96 }, { type: 'refusalWarden', x: 2770, wakeDelayMs: 150 }]
  },
  {
    id: 'refusal-opening-reveal', label: 'REFUSAL OPENING', zoneX: 3940, zoneY: WORLD.floorY - 76, zoneWidth: 1020, zoneHeight: 242,
    enemies: [{ type: 'barrierSinger', x: 3560 }, { type: 'sealedArchetype', x: 3810 }, { type: 'elite', x: 4100 }, { type: 'nullClaimant', x: 4370 }]
  },
  {
    id: 'threshold-leadup', label: 'THRESHOLD OF FIRST REFUSAL', zoneX: 5200, zoneY: WORLD.floorY - 76, zoneWidth: 920, zoneHeight: 242,
    enemies: [{ type: 'refusalWarden', x: 4880 }, { type: 'sealedArchetype', x: 5100 }, { type: 'barrierSinger', x: 5340 }, { type: 'nullClaimant', x: 5560 }]
  }
];

export class Sector03Chamber03Scene extends Phaser.Scene {
  constructor() {
    super(CHAMBER.sceneKey);
  }

  init(data) {
    this.transitionContext = data ?? {};
    this.isRestartingRun = false;
    this.isLoreTransitionActive = false;
    this.hasCompletedLoreBeat = false;
    this.hasUnlockedForwardPath = false;
    this.hasTriggeredForwardContract = false;
    this.currentForwardThreshold = null;
    this.hasEnteredForwardThreshold = false;
    this.forwardThresholdAwaitingFreshInteract = false;
    this.enemies = [];
    this.encounterPockets = [];
    this.currentLoreZone = null;
  }

  create() {
    this.createWorld();
    this.audioDirector = new AudioDirector(this);
    this.audioDirector.playAmbientLoop(ASSET_KEYS.ambientChamber01Loop01, { volume: 0.102 });
    this.createBackdrop();
    this.createPlayer();
    this.createEncounterPockets();
    this.createLoreAnchor();
    this.createUi();
    this.createForwardThreshold();
    this.configureLayout();
    this.cameras.main.fadeIn(600, 0, 0, 0);
  }

  createWorld() {
    this.physics.world.gravity.y = WORLD.gravityY;
    this.cameras.main.setBounds(0, 0, CHAMBER.worldWidth, WORLD.height);
    this.physics.world.setBounds(0, 0, CHAMBER.worldWidth, WORLD.height);
    this.cameras.main.setBackgroundColor('#070505');
    this.platforms = this.physics.add.staticGroup();
    this.createInvisiblePlatform(CHAMBER.worldWidth / 2, WORLD.floorY + 28, CHAMBER.worldWidth, CHAMBER.floorColliderHeight);
  }

  createBackdrop() {
    this.add.rectangle(CHAMBER.worldWidth / 2, WORLD.height / 2, CHAMBER.worldWidth, WORLD.height, 0x070505, 1).setDepth(-16);
    SEGMENTS.forEach((segment, index) => {
      if (this.textures.exists(segment.key)) {
        this.add.image(segment.x, segment.y, segment.key).setDisplaySize(segment.width, segment.height).setTint(segment.tint).setAlpha(segment.alpha).setDepth(-14.7 + index * 0.01);
      } else {
        this.add.rectangle(segment.x, segment.y + 10, segment.width, segment.height, 0x3d2f2a, 0.78).setDepth(-14.7 + index * 0.01);
      }
      this.add.ellipse(segment.x, WORLD.floorY - 32, segment.width * 0.82, 62, 0x070504, 0.14 + index * 0.012).setDepth(-14.06);
    });

    if (this.textures.exists(ASSET_KEYS.sector03Chamber03AltarLoreShrine)) {
      this.add.image(680, WORLD.floorY - 104, ASSET_KEYS.sector03Chamber03AltarLoreShrine).setDisplaySize(204, 204).setTint(0xe0ccb5).setAlpha(0.9).setDepth(-6.08);
    }

    this.add.rectangle(CHAMBER.worldWidth / 2, WORLD.floorY - 14, CHAMBER.worldWidth, 96, 0x1a1411, 0.95).setDepth(-6.3);
    this.add.rectangle(CHAMBER.worldWidth / 2, WORLD.floorY - 48, CHAMBER.worldWidth, 24, 0x2c2018, 0.76).setDepth(-6.26);
    this.add.ellipse(CHAMBER.worldWidth / 2, WORLD.floorY + 10, CHAMBER.worldWidth, 54, 0x020202, 0.36).setDepth(-5.94);
  }

  createPlayer() {
    this.player = new Player(this, CHAMBER.spawnX, CHAMBER.spawnY, PLAYER);
    const entryIntegrity = applyChamberEntryRestore(this.transitionContext);
    this.player.health = entryIntegrity.current;
    this.player.maxHealth = entryIntegrity.max;
    this.physics.add.collider(this.player.sprite, this.platforms);
  }

  createEncounterPockets() {
    this.encounterPockets = POCKETS.map((pocketConfig) => {
      const zone = this.add.zone(pocketConfig.zoneX, pocketConfig.zoneY, pocketConfig.zoneWidth, pocketConfig.zoneHeight).setOrigin(0.5);
      this.physics.add.existing(zone, true);
      const markerShadow = this.add.ellipse(pocketConfig.zoneX, WORLD.floorY - 4, pocketConfig.zoneWidth * 0.62, 78, 0x040302, 0.09).setDepth(-5.84);

      const enemies = pocketConfig.enemies.map((enemyConfig) => {
        const baseConfig = ENEMIES[enemyConfig.type];
        const enemy = new SkitterServitor(this, enemyConfig.x, PLAYER.startY, baseConfig);
        enemy.awakened = false;
        enemy.pocketWakeAtTime = null;

        this.physics.add.collider(enemy.sprite, this.platforms);
        this.physics.add.overlap(this.player.attackHitbox, enemy.sprite, (_attackZone, enemySprite) => {
          if (!this.player.attackActive || enemy.dead || enemy.lastAttackHitId === this.player.attackId || !(enemySprite === enemy.sprite || enemySprite?.gameObject === enemy.sprite)) {
            return;
          }
          enemy.lastAttackHitId = this.player.attackId;
          const knockDirection = Math.sign(enemy.sprite.x - this.player.sprite.x) || this.player.facing;
          enemy.setHitReactionDirection(knockDirection);
          enemy.takeDamage(1, this.time.now);
          this.audioDirector?.playPlayerHit();
        });
        this.physics.add.overlap(this.player.sprite, enemy.sprite, (_p, enemySprite) => {
          if (enemy.dead || !(enemySprite === enemy.sprite || enemySprite?.gameObject === enemy.sprite) || !enemy.canDealContactDamage(this.time.now)) {
            return;
          }
          const tookDamage = this.player.receiveDamage(SKITTER.contactDamage, this.time.now);
          if (tookDamage) {
            const knockDirection = Math.sign(this.player.sprite.x - enemy.sprite.x) || 1;
            this.player.body.setVelocityX(knockDirection * 220);
            this.player.body.setVelocityY(-220);
          }
        });

        this.enemies.push(enemy);
        return enemy;
      });

      return { ...pocketConfig, zone, markerShadow, enemies, activated: false, resolved: false };
    });
  }

  createLoreAnchor() {
    const altarX = 680;
    const zone = this.add.zone(altarX, WORLD.floorY - 78, 214, 210).setOrigin(0.5);
    this.physics.add.existing(zone, true);
    this.loreAnchor = { zone };
  }

  createUi() {
    this.hud = new HudOverlay(this);
    this.mobileControls = new MobileControls(this);
    this.setupMobileUiCamera();

    this.restartText = this.add.text(this.scale.width / 2, 90, '', {
      fontFamily: 'monospace', fontSize: '22px', color: '#d2c2ac', align: 'center'
    }).setScrollFactor(0).setDepth(35).setOrigin(0.5).setVisible(false);
    this.uiCamera?.ignore(this.restartText);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyAttack = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.keyInteract = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keyRestart = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.applyResponsiveLayout, this);
      this.audioDirector?.shutdown();
      this.hud?.setBossBarState({ visible: false });
      this.game.events.off('lore-cutscene-complete', this.handleLoreCutsceneComplete, this);
    });
    this.game.events.on('lore-cutscene-complete', this.handleLoreCutsceneComplete, this);
  }

  createForwardThreshold() {
    this.forwardBarrier = this.add.rectangle(6440, WORLD.floorY - 70, 98, 238, 0x140e0a, 0.4).setDepth(-4.86);
    this.physics.add.existing(this.forwardBarrier, true);
    this.physics.add.collider(this.player.sprite, this.forwardBarrier);

    this.forwardThresholdZone = this.add.zone(6580, WORLD.floorY - 76, 212, 224).setOrigin(0.5);
    this.physics.add.existing(this.forwardThresholdZone, true);
  }

  configureLayout() {
    this.cameras.main.startFollow(this.player.sprite, true, CHAMBER.cameraLerp.x, CHAMBER.cameraLerp.y, CHAMBER.desktopFollowOffsetX, 0);

    this.directionalCameraBias = createDirectionalCameraBias({
      camera: this.cameras.main,
      player: this.player,
      desktopBaseOffsetX: CHAMBER.desktopFollowOffsetX,
      portraitBaseOffsetX: CHAMBER.portraitFollowOffsetX,
      desktopLookAheadX: 56,
      portraitLookAheadX: 24
    });    this.scale.on('resize', this.applyResponsiveLayout, this);
    this.applyResponsiveLayout();
    this.mobileControls.setMode('gameplay');
    this.directionalCameraBias?.update();
    this.hud.update(this.player.health, this.player.maxHealth);
  }

  update(time) {
    const mobileInput = this.mobileControls.getInputState();
    if (this.player.isDead) {
      this.mobileControls.setMode('dead');
      this.restartText.setVisible(true).setText('VESSEL FAILURE\nPress [R] to re-seed chamber');
      this.enemies.forEach((enemy) => enemy.body?.setVelocity(0, 0));
      if ((Phaser.Input.Keyboard.JustDown(this.keyRestart) || mobileInput.interactPressed) && !this.isRestartingRun) {
        this.isRestartingRun = true;
        restartRunFromDeath(this);
      }
      return;
    }

    if (this.isLoreTransitionActive) {
      this.mobileControls.setMode('dialogue');
      this.player.body.setVelocity(0, 0);
      this.enemies.forEach((enemy) => enemy.body?.setVelocity(0, 0));
      return;
    }

    this.restartText.setVisible(false);
    this.mobileControls.setMode('gameplay');

    const input = {
      left: this.cursors.left.isDown || mobileInput.left,
      right: this.cursors.right.isDown || mobileInput.right,
      jumpPressed: Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.cursors.space) || mobileInput.jumpPressed,
      attackPressed: Phaser.Input.Keyboard.JustDown(this.keyAttack) || mobileInput.attackPressed
    };

    this.player.update(time, input);
    this.enemies.forEach((enemy) => enemy.update(time, this.player.sprite.x));
    this.updateEncounterPockets(time);
    this.refreshLoreZonePresence();
    this.tryBeginLoreSequence(mobileInput);
    this.refreshForwardThresholdPresence();
    this.tryAdvanceForwardThreshold(mobileInput);
    this.directionalCameraBias?.update();
    this.hud.update(this.player.health, this.player.maxHealth);
  }

  updateEncounterPockets(time) {
    this.encounterPockets.forEach((pocket) => {
      let inside = false;
      this.physics.overlap(this.player.sprite, pocket.zone, () => { inside = true; });

      if (inside && !pocket.activated) {
        pocket.activated = true;
        pocket.enemies.forEach((enemy, index) => {
          if (!enemy.dead) {
            enemy.pocketWakeAtTime = time + (enemy.config.wakeDelayMs ?? 0) + index * 66;
          }
        });
      }

      pocket.enemies.forEach((enemy) => {
        if (!enemy.dead && !enemy.awakened && enemy.pocketWakeAtTime !== null && time >= enemy.pocketWakeAtTime) {
          enemy.awakened = true;
          enemy.pocketWakeAtTime = null;
        }
      });

      if (pocket.activated && pocket.enemies.every((enemy) => enemy.dead)) {
        pocket.resolved = true;
        pocket.markerShadow.setAlpha(0.03);
      }
    });

    if (!this.hasUnlockedForwardPath && this.encounterPockets.every((pocket) => pocket.resolved) && this.hasCompletedLoreBeat) {
      this.unlockForwardPath();
    }
  }

  refreshLoreZonePresence() {
    this.currentLoreZone = null;
    if (!this.loreAnchor || this.isLoreTransitionActive || this.hasCompletedLoreBeat) {
      return;
    }

    this.physics.overlap(this.player.sprite, this.loreAnchor.zone, () => {
      this.currentLoreZone = this.loreAnchor;
    });
  }

  tryBeginLoreSequence(mobileInput) {
    if (!this.currentLoreZone) {
      return;
    }
    const interactPressed = Phaser.Input.Keyboard.JustDown(this.keyInteract) || Phaser.Input.Keyboard.JustDown(this.keyEnter) || mobileInput.interactPressed;
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
    this.mobileControls.setMode('dialogue');
    this.player.body.setVelocity(0, 0);
    this.enemies.forEach((enemy) => enemy.body?.setVelocity(0, 0));
    this.audioDirector?.stopAmbientLoop();
    this.hud?.setVisible(false);
    this.mobileControls.setMode('init');
    this.uiCamera?.setVisible(false);

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.setGameplaySceneVisibility(false);
      this.scene.pause();
      this.scene.launch('LoreCutsceneScene', {
        cutsceneId: 'sector03-chamber03-gate-of-refusal',
        returnSceneKey: this.scene.key
      });
    });

    this.cameras.main.fadeOut(420, 0, 0, 0);
  }

  handleLoreCutsceneComplete({ cutsceneId } = {}) {
    if (cutsceneId !== 'sector03-chamber03-gate-of-refusal') {
      return;
    }

    this.hasCompletedLoreBeat = true;
    this.resumeFromLore();
  }

  resumeFromLore() {
    this.isLoreTransitionActive = false;
    this.setGameplaySceneVisibility(true);
    this.applyResponsiveLayout();
    this.mobileControls.setMode('gameplay');
    this.hud?.setVisible(true);
    this.uiCamera?.setVisible(true);
    this.audioDirector?.playAmbientLoop(ASSET_KEYS.ambientChamber01Loop01, { volume: 0.102 });
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  setGameplaySceneVisibility(isVisible) {
    this.scene.setVisible(isVisible, this.scene.key);
  }

  unlockForwardPath() {
    this.hasUnlockedForwardPath = true;
    this.forwardBarrier?.setAlpha(0.08);
    this.forwardBarrier?.setFillStyle(0xab9278, 0.08);
    if (this.forwardBarrier?.body) {
      this.forwardBarrier.body.enable = false;
      this.forwardBarrier.body.updateFromGameObject?.();
    }
  }

  refreshForwardThresholdPresence() {
    const wasInsideThreshold = this.hasEnteredForwardThreshold;
    this.currentForwardThreshold = null;
    this.physics.overlap(this.player.sprite, this.forwardThresholdZone, () => {
      this.currentForwardThreshold = this.forwardThresholdZone;
    });

    this.hasEnteredForwardThreshold = Boolean(this.currentForwardThreshold);
    if (!this.hasEnteredForwardThreshold) {
      this.forwardThresholdAwaitingFreshInteract = false;
    } else if (!wasInsideThreshold) {
      this.forwardThresholdAwaitingFreshInteract = true;
    }
  }

  tryAdvanceForwardThreshold(mobileInput) {
    if (!this.hasUnlockedForwardPath || !this.currentForwardThreshold) {
      return;
    }

    const interactHeld = this.keyInteract?.isDown || this.keyEnter?.isDown || mobileInput.interactHeld;
    if (this.forwardThresholdAwaitingFreshInteract) {
      if (interactHeld) {
        return;
      }
      this.forwardThresholdAwaitingFreshInteract = false;
    }

    const interactPressed = Phaser.Input.Keyboard.JustDown(this.keyInteract) || Phaser.Input.Keyboard.JustDown(this.keyEnter) || mobileInput.interactPressed;
    if (!interactPressed) {
      return;
    }

    this.hasTriggeredForwardContract = true;
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.audioDirector?.shutdown();
      this.scene.start('Sector03Chamber03BossChamberScene', {
        fromScene: this.scene.key
      });
    });
    this.cameras.main.fadeOut(320, 0, 0, 0);
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

    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'Sector03Chamber03MobileUiCamera');
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
      const worldBandMax = Math.max(PORTRAIT_LAYOUT.worldBandMin, Math.min(PORTRAIT_LAYOUT.worldBandMax, maxWorldBandFromControlNeeds));
      const worldBandHeight = Phaser.Math.Clamp(Math.floor(height * PORTRAIT_LAYOUT.worldBandRatio), PORTRAIT_LAYOUT.worldBandMin, worldBandMax);

      camera.setViewport(0, 0, width, worldBandHeight);
      camera.setZoom(PORTRAIT_LAYOUT.portraitZoom);
      this.directionalCameraBias?.setLayout({ isPortrait: true, followOffsetY: PORTRAIT_LAYOUT.portraitFollowOffsetY });
      this.mobileControls.setReservedBottomPx(height - worldBandHeight);
      this.restartText?.setPosition(width / 2, Math.max(PORTRAIT_LAYOUT.restartTextMinY, worldBandHeight * PORTRAIT_LAYOUT.restartTextRatioY));
      this.hud?.layout();
      return;
    }

    camera.setViewport(0, 0, width, height);
    camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
    this.directionalCameraBias?.setLayout({ isPortrait: false, followOffsetY: PORTRAIT_LAYOUT.desktopFollowOffsetY });
    this.mobileControls.setReservedBottomPx(0);
    this.restartText?.setPosition(width / 2, 90);
    this.hud?.layout();
  }
}
