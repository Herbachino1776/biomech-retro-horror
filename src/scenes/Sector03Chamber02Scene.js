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
import { bossPitRunState } from '../systems/BossPitRunState.js';

const CHAMBER = {
  sceneKey: 'Sector03Chamber02Scene',
  worldWidth: 6320,
  floorColliderHeight: 72,
  spawnX: 220,
  spawnY: PLAYER.startY,
  cameraLerp: { x: 0.08, y: 0.08 },
  portraitFollowOffsetX: -112,
  desktopFollowOffsetX: -156
};

const SEGMENTS = [
  { key: ASSET_KEYS.sector03Chamber02BackgroundEntryNarthex, x: 450, y: 216, width: 940, height: 480, tint: 0xd4c8b8, alpha: 0.8 },
  { key: ASSET_KEYS.sector03Chamber02BackgroundWallModule01, x: 1320, y: 214, width: 860, height: 454, tint: 0xb8ab9a, alpha: 0.62 },
  { key: ASSET_KEYS.sector03Chamber02BackgroundWallModule02, x: 2100, y: 214, width: 860, height: 454, tint: 0xa19588, alpha: 0.58 },
  { key: ASSET_KEYS.sector03Chamber02BackgroundMaskGalleryOpening, x: 3020, y: 214, width: 980, height: 474, tint: 0xd3c4b0, alpha: 0.76 },
  { key: ASSET_KEYS.sector03Chamber02BackgroundThreshold, x: 4120, y: 214, width: 920, height: 464, tint: 0xcfbeaa, alpha: 0.74 },
  { key: ASSET_KEYS.sector03Chamber02BackgroundClimaxSanctum, x: 5360, y: 212, width: 1160, height: 486, tint: 0xd7c8b4, alpha: 0.82 }
];

const ENEMIES = {
  veil: {
    ...SKITTER,
    textureKey: ASSET_KEYS.sector03Chamber02EnemyBasicVeilStripper,
    presentation: { alpha: 0.98, display: { width: 222, height: 186 }, origin: { x: 0.52, y: 0.95 }, stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.44 } },
    corpseRemainsProfile: 'sector3Basic'
  },
  husk: {
    ...SKITTER,
    textureKey: ASSET_KEYS.sector03Chamber02EnemyBasicMaskHusk,
    presentation: { alpha: 0.98, display: { width: 224, height: 186 }, origin: { x: 0.52, y: 0.95 }, stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.44 } },
    corpseRemainsProfile: 'sector3Basic'
  },
  cantor: {
    ...SKITTER,
    textureKey: ASSET_KEYS.sector03Chamber02EnemyBasicBlindCantor,
    presentation: { alpha: 0.98, display: { width: 226, height: 188 }, origin: { x: 0.52, y: 0.95 }, stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.44 } },
    corpseRemainsProfile: 'sector3Basic'
  },
  collector: {
    ...SKITTER,
    textureKey: ASSET_KEYS.sector03Chamber02EnemyBasicFaceCollector,
    presentation: { alpha: 0.98, display: { width: 232, height: 192 }, origin: { x: 0.52, y: 0.95 }, stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.44 } },
    corpseRemainsProfile: 'sector3Basic'
  },
  elite: {
    ...SKITTER,
    textureKey: ASSET_KEYS.sector03Chamber02EnemyEliteDoubleFacedNull,
    health: 7,
    speed: 46,
    aggroRange: 292,
    patrolDistance: 96,
    body: { width: 74, height: 44, offsetX: 28, offsetY: 90 },
    presentation: { alpha: 0.98, display: { width: 346, height: 268 }, origin: { x: 0.52, y: 0.93 }, stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.46 } },
    corpseRemainsProfile: 'sector3Elite'
  }
};

const POCKETS = [
  {
    id: 'corridor-faces-01', label: 'BORROWED PROCESSION', zoneX: 1520, zoneY: WORLD.floorY - 72, zoneWidth: 660, zoneHeight: 226,
    enemies: [{ type: 'veil', x: 1290 }, { type: 'husk', x: 1500, wakeDelayMs: 40 }, { type: 'cantor', x: 1700, wakeDelayMs: 90 }]
  },
  {
    id: 'corridor-faces-02', label: 'MASK PRESSURE', zoneX: 2280, zoneY: WORLD.floorY - 72, zoneWidth: 730, zoneHeight: 236,
    enemies: [{ type: 'collector', x: 2020 }, { type: 'veil', x: 2240, wakeDelayMs: 40 }, { type: 'husk', x: 2440, wakeDelayMs: 90 }, { type: 'cantor', x: 2610, wakeDelayMs: 150 }]
  },
  {
    id: 'gallery-elite-domain', label: 'GALLERY NULL DOMAIN', zoneX: 3160, zoneY: WORLD.floorY - 76, zoneWidth: 980, zoneHeight: 242,
    enemies: [{ type: 'veil', x: 2860 }, { type: 'collector', x: 3050, wakeDelayMs: 50 }, { type: 'elite', x: 3270, wakeDelayMs: 130 }, { type: 'husk', x: 3470, wakeDelayMs: 190 }]
  }
];

export class Sector03Chamber02Scene extends Phaser.Scene {
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
    this.currentPitAltar = null;
    this.hasCompletedPit02 = bossPitRunState.hasSector03Chamber02Pit02BossPitCompleted();
    this.hasCompletedPit03 = bossPitRunState.hasSector03Chamber02Pit03BossPitCompleted();
  }

  create() {
    this.createWorld();
    this.audioDirector = new AudioDirector(this);
    this.audioDirector.playAmbientLoop(ASSET_KEYS.ambientChamber01Loop01, { volume: 0.108 });
    this.createBackdrop();
    this.createPlayer();
    this.createEncounterPockets();
    this.createLoreAnchor();
    this.createBossPitAltars();
    this.createUi();
    this.createForwardThreshold();
    this.configureLayout();

    if (this.transitionContext?.returnFromBossPit) {
      if (this.transitionContext.pitId === 'bosspit02') {
        this.hasCompletedPit02 = true;
      }
      if (this.transitionContext.pitId === 'bosspit03') {
        this.hasCompletedPit03 = true;
      }
      this.hasCompletedLoreBeat = true;
      this.updatePitAltarState();
      this.restoreEncounterStateFromRunCache();
    }

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

    const props = [
      { key: ASSET_KEYS.sector03Chamber02PropMaskRack, x: 1860, w: 170, h: 170 },
      { key: ASSET_KEYS.sector03Chamber02PropBlindMirror, x: 3360, w: 184, h: 194 },
      { key: ASSET_KEYS.sector03Chamber02LoreAltar, x: 5250, w: 212, h: 212 }
    ];
    props.forEach((prop) => {
      if (!this.textures.exists(prop.key)) {
        return;
      }
      this.add.image(prop.x, WORLD.floorY - 108, prop.key).setDisplaySize(prop.w, prop.h).setTint(0xd7c8b4).setAlpha(0.88).setDepth(-6.14);
    });

    this.add.rectangle(CHAMBER.worldWidth / 2, WORLD.floorY - 14, CHAMBER.worldWidth, 96, 0x1a1411, 0.95).setDepth(-6.3);
    this.add.rectangle(CHAMBER.worldWidth / 2, WORLD.floorY - 48, CHAMBER.worldWidth, 24, 0x2c2018, 0.76).setDepth(-6.26);
    this.add.ellipse(CHAMBER.worldWidth / 2, WORLD.floorY + 10, CHAMBER.worldWidth, 54, 0x020202, 0.36).setDepth(-5.94);

    if (this.textures.exists(ASSET_KEYS.sector03Chamber02BossMisassignedSeraph)) {
      this.add.image(5570, WORLD.floorY - 162, ASSET_KEYS.sector03Chamber02BossMisassignedSeraph)
        .setDisplaySize(316, 316)
        .setTint(0xcebea9)
        .setAlpha(0.32)
        .setDepth(-8.3);
    }
  }

  createPlayer() {
    const spawnX = this.transitionContext?.returnFromBossPit ? this.transitionContext.returnPlayerX ?? CHAMBER.spawnX : CHAMBER.spawnX;
    const spawnY = this.transitionContext?.returnFromBossPit ? this.transitionContext.returnPlayerY ?? CHAMBER.spawnY : CHAMBER.spawnY;
    this.player = new Player(this, spawnX, spawnY, PLAYER);
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
        enemy.encounterPocketId = pocketConfig.id;
        enemy.encounterEnemyStateKey = `${pocketConfig.id}::${enemyConfig.type}::${enemyConfig.x}`;
        enemy.awakened = false;
        enemy.pocketWakeAtTime = null;

        this.physics.add.collider(enemy.sprite, this.platforms);
        this.physics.add.overlap(this.player.attackHitbox, enemy.sprite, (attackZone, enemySprite) => {
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
    const altarX = 640;
    if (this.textures.exists(ASSET_KEYS.sector03Chamber02LoreAltar)) {
      this.add.image(altarX, WORLD.floorY - 104, ASSET_KEYS.sector03Chamber02LoreAltar)
        .setDisplaySize(194, 194)
        .setTint(0xe0ccb5)
        .setAlpha(0.9)
        .setDepth(-6.08);
    }
    const zone = this.add.zone(altarX, WORLD.floorY - 78, 214, 210).setOrigin(0.5);
    this.physics.add.existing(zone, true);
    this.loreAnchor = { zone };
  }

  createBossPitAltars() {
    this.pitAltars = [
      { id: 'bosspit02', x: 3360, y: WORLD.floorY - 106 },
      { id: 'bosspit03', x: 5380, y: WORLD.floorY - 106 }
    ].map((pit) => {
      const sprite = this.textures.exists(ASSET_KEYS.sector03Chamber02LoreAltar)
        ? this.add.image(pit.x, pit.y, ASSET_KEYS.sector03Chamber02LoreAltar).setDisplaySize(208, 208).setTint(0xd6c4ae).setAlpha(0.86).setDepth(-6.08)
        : this.add.ellipse(pit.x, pit.y + 6, 160, 160, 0x836d5f, 0.8).setDepth(-6.08);
      const aura = this.add.ellipse(pit.x, pit.y + 4, 156, 146, 0xc5ad88, 0.08).setDepth(-6.06);
      const zone = this.add.zone(pit.x, WORLD.floorY - 78, 218, 214).setOrigin(0.5);
      this.physics.add.existing(zone, true);
      return { ...pit, sprite, aura, zone };
    });

    this.updatePitAltarState();
  }

  createUi() {
    this.hud = new HudOverlay(this);
    this.mobileControls = new MobileControls(this);
    this.setupMobileUiCamera();

    this.restartText = this.add.text(this.scale.width / 2, 90, '', {
      fontFamily: 'monospace', fontSize: '22px', color: '#d2c2ac', align: 'center'
    }).setScrollFactor(0).setDepth(35).setOrigin(0.5).setVisible(false);

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
      this.saveEncounterStateToRunCache();
    });
    this.game.events.on('lore-cutscene-complete', this.handleLoreCutsceneComplete, this);
  }

  createForwardThreshold() {
    this.forwardBarrier = this.add.rectangle(6030, WORLD.floorY - 70, 98, 238, 0x140e0a, 0.4).setDepth(-4.86);
    this.physics.add.existing(this.forwardBarrier, true);
    this.physics.add.collider(this.player.sprite, this.forwardBarrier);

    this.forwardThresholdZone = this.add.zone(6170, WORLD.floorY - 76, 212, 224).setOrigin(0.5);
    this.physics.add.existing(this.forwardThresholdZone, true);

    this.forwardPrompt = null;
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
    this.refreshPitAltars();
    this.tryBeginPitDescent(mobileInput);
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
            enemy.pocketWakeAtTime = time + (enemy.config.wakeDelayMs ?? 0) + index * 58;
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
        cutsceneId: 'sector03-chamber02-house-of-borrowed-faces',
        returnSceneKey: this.scene.key
      });
    });

    this.cameras.main.fadeOut(420, 0, 0, 0);
  }

  handleLoreCutsceneComplete({ cutsceneId } = {}) {
    if (cutsceneId !== 'sector03-chamber02-house-of-borrowed-faces') {
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
    this.audioDirector?.playAmbientLoop(ASSET_KEYS.ambientChamber01Loop01, { volume: 0.108 });
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  setGameplaySceneVisibility(isVisible) {
    this.scene.setVisible(isVisible, this.scene.key);
  }

  refreshPitAltars() {
    this.currentPitAltar = null;
    this.pitAltars.forEach((altar) => {
      let inside = false;
      this.physics.overlap(this.player.sprite, altar.zone, () => {
        inside = true;
        this.currentPitAltar = altar;
      });

    });
  }

  tryBeginPitDescent(mobileInput) {
    if (!this.currentPitAltar) {
      return;
    }
    const completed = this.currentPitAltar.id === 'bosspit02' ? this.hasCompletedPit02 : this.hasCompletedPit03;
    if (completed) {
      return;
    }

    const interactPressed = Phaser.Input.Keyboard.JustDown(this.keyInteract) || Phaser.Input.Keyboard.JustDown(this.keyEnter) || mobileInput.interactPressed;
    if (!interactPressed) {
      return;
    }

    this.audioDirector?.stopAmbientLoop();
    this.saveEncounterStateToRunCache();
    this.hud?.setVisible(false);
    this.mobileControls.setMode('init');
    this.uiCamera?.setVisible(false);
    const pitId = this.currentPitAltar.id;
    const returnX = this.currentPitAltar.x + 54;
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.audioDirector?.shutdown();
      this.scene.start('Sector03Chamber02BossPitScene', {
        fromScene: this.scene.key,
        pitId,
        returnPlayerX: returnX,
        returnPlayerY: CHAMBER.spawnY
      });
    });
    this.cameras.main.shake(260, 0.004, true);
    this.cameras.main.fadeOut(420, 0, 0, 0);
  }

  restoreEncounterStateFromRunCache() {
    const snapshot = bossPitRunState.getSector03Chamber02EncounterState();
    if (!snapshot) {
      return;
    }

    const deadEnemyKeys = new Set(snapshot.deadEnemyKeys ?? []);
    this.encounterPockets.forEach((pocket) => {
      if (snapshot.resolvedPocketIds?.includes(pocket.id)) {
        pocket.activated = true;
        pocket.resolved = true;
        pocket.markerShadow?.setAlpha(0.03);
      }

      pocket.enemies.forEach((enemy) => {
        if (!deadEnemyKeys.has(enemy.encounterEnemyStateKey)) {
          return;
        }
        enemy.dead = true;
        enemy.awakened = false;
        enemy.pocketWakeAtTime = null;
        enemy.body?.stop?.();
        if (enemy.body) {
          enemy.body.enable = false;
          enemy.body.setAllowGravity?.(false);
        }
        enemy.sprite?.setVisible(false).setAlpha(0);
        enemy.eyeGlow?.setVisible(false).setAlpha(0);
      });
    });
  }

  saveEncounterStateToRunCache() {
    if (!this.encounterPockets?.length) {
      return;
    }

    const resolvedPocketIds = [];
    const deadEnemyKeys = [];
    this.encounterPockets.forEach((pocket) => {
      if (pocket.resolved || pocket.enemies.every((enemy) => enemy.dead)) {
        resolvedPocketIds.push(pocket.id);
      }
      pocket.enemies.forEach((enemy) => {
        if (enemy.dead) {
          deadEnemyKeys.push(enemy.encounterEnemyStateKey);
        }
      });
    });

    bossPitRunState.setSector03Chamber02EncounterState({ resolvedPocketIds, deadEnemyKeys });
  }

  updatePitAltarState() {
    this.pitAltars?.forEach((altar) => {
      const completed = altar.id === 'bosspit02' ? this.hasCompletedPit02 : this.hasCompletedPit03;
      if (completed) {
        altar.sprite?.setAlpha(0.36).setTint(0x5b5148);
        altar.aura?.setAlpha(0.02).setFillStyle(0x3a3229, 0.02);
      } else {
        altar.sprite?.setAlpha(0.86).setTint(0xd6c4ae);
        altar.aura?.setAlpha(0.08).setFillStyle(0xc5ad88, 0.08);
      }
    });
  }

  unlockForwardPath() {
    this.hasUnlockedForwardPath = true;
    this.forwardBarrier?.setAlpha(0.08);
    this.forwardBarrier?.setFillStyle(0xab9278, 0.08);
    if (this.forwardBarrier?.body) {
      this.forwardBarrier.body.enable = false;
      this.forwardBarrier.body.updateFromGameObject?.();
    }
    this.forwardPrompt?.setVisible(false);
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

    const promptVisible = Boolean(this.currentForwardThreshold) || (this.hasUnlockedForwardPath && !this.hasTriggeredForwardContract);
    const promptText = this.hasUnlockedForwardPath
      ? this.hasTriggeredForwardContract
        ? 'THRESHOLD MARKED\nRITE SEALED'
        : 'BORROWED THRESHOLD YIELDED\nPRESS RITE / [E] TO SEAL THE THRESHOLD'
      : this.hasCompletedLoreBeat
        ? 'CLEAR HOSTILES TO UNSEAL THRESHOLD'
        : 'READ THE CHAMBER LORE TO UNSEAL THRESHOLD';

    this.forwardPrompt?.setVisible(promptVisible).setText(promptText);
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
    this.forwardPrompt?.setVisible(true).setText('THRESHOLD MARKED\nRITE SEALED');
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.audioDirector?.shutdown();
      this.scene.start('Sector03Chamber02BossChamberScene', {
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

    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'Sector03Chamber02MobileUiCamera');
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
