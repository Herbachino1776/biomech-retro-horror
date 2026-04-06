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
import { BrutalityModeState } from '../systems/BrutalityModeState.js';
import { triggerBrutalityBasicChunkBurst } from '../systems/BrutalityChunkBurst.js';

const CHAMBER = {
  sceneKey: 'Sector04Chamber02Scene',
  worldWidth: 8120,
  floorColliderHeight: 72,
  spawnX: 220,
  spawnY: PLAYER.startY,
  cameraLerp: { x: 0.08, y: 0.08 },
  portraitFollowOffsetX: -112,
  desktopFollowOffsetX: -156
};

const SEGMENTS = [
  { key: ASSET_KEYS.sector04Chamber02BackgroundEntry, x: 460, y: 216, width: 980, height: 488, tint: 0xd5c6b2, alpha: 0.8 },
  { key: ASSET_KEYS.sector04Chamber02BackgroundWallModule01, x: 1360, y: 214, width: 860, height: 454, tint: 0xb5a898, alpha: 0.62 },
  { key: ASSET_KEYS.sector04Chamber02BackgroundWallModule02, x: 2140, y: 214, width: 860, height: 454, tint: 0xa19487, alpha: 0.58 },
  { key: ASSET_KEYS.sector04Chamber02BackgroundOpening, x: 3260, y: 212, width: 1080, height: 482, tint: 0xd0c1ad, alpha: 0.76 },
  { key: ASSET_KEYS.sector04Chamber02BackgroundBossDais, x: 4260, y: 212, width: 1020, height: 474, tint: 0xc6b49e, alpha: 0.72 },
  { key: ASSET_KEYS.sector04Chamber02BackgroundWallModule02, x: 5300, y: 214, width: 860, height: 454, tint: 0xaa9a89, alpha: 0.58 },
  { key: ASSET_KEYS.sector04Chamber02BackgroundWallModule01, x: 6080, y: 214, width: 860, height: 454, tint: 0xa19284, alpha: 0.56 },
  { key: ASSET_KEYS.sector04Chamber02BackgroundWallModule02, x: 6860, y: 214, width: 860, height: 454, tint: 0x9b8d80, alpha: 0.54 },
  { key: ASSET_KEYS.sector04Chamber02BackgroundThreshold, x: 7820, y: 212, width: 900, height: 464, tint: 0xcdbca8, alpha: 0.74 }
];

const S4C2_ENEMY_SPAWN_Y = PLAYER.startY - 20;

const ENEMIES = {
  processionHusk: {
    ...SKITTER,
    textureKey: ASSET_KEYS.sector04Chamber02EnemyBasic01,
    speed: 58,
    aggroRange: 258,
    patrolDistance: 122,
    body: { width: 70, height: 54, offsetX: 18, offsetY: 40 },
    presentation: { alpha: 0.98, display: { width: 258, height: 216 }, origin: { x: 0.52, y: 0.95 }, stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.44 } },
    corpseRemainsProfile: 'sector3Basic'
  },
  cordBearer: {
    ...SKITTER,
    textureKey: ASSET_KEYS.sector04Chamber02EnemyBasic02,
    speed: 56,
    aggroRange: 252,
    patrolDistance: 116,
    body: { width: 70, height: 54, offsetX: 18, offsetY: 40 },
    presentation: { alpha: 0.98, display: { width: 262, height: 218 }, origin: { x: 0.52, y: 0.95 }, stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.44 } },
    corpseRemainsProfile: 'sector3Basic'
  },
  anchorElite: {
    ...SKITTER,
    isElite: true,
    textureKey: ASSET_KEYS.sector04Chamber02EnemyElite,
    health: 8,
    speed: 46,
    aggroRange: 300,
    patrolDistance: 94,
    body: { width: 104, height: 82, offsetX: 42, offsetY: 128 },
    presentation: { alpha: 1, display: { width: 396, height: 322 }, origin: { x: 0.52, y: 0.975 }, stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.52 } },
    corpseRemainsProfile: 'sector3Elite'
  }
};

const ENCOUNTER_POCKETS = [
  {
    id: 'corridor-entry-procession',
    label: 'ENTRY PROCESSION',
    zoneX: 1520,
    zoneY: WORLD.floorY - 72,
    zoneWidth: 680,
    zoneHeight: 228,
    enemies: [
      { type: 'processionHusk', x: 1280 },
      { type: 'cordBearer', x: 1490, wakeDelayMs: 54 },
      { type: 'processionHusk', x: 1700, wakeDelayMs: 116 }
    ]
  },
  {
    id: 'corridor-wall-chain',
    label: 'WALL CHAIN',
    zoneX: 2350,
    zoneY: WORLD.floorY - 74,
    zoneWidth: 760,
    zoneHeight: 236,
    enemies: [
      { type: 'cordBearer', x: 2100 },
      { type: 'processionHusk', x: 2320, wakeDelayMs: 44 },
      { type: 'cordBearer', x: 2530, wakeDelayMs: 104 },
      { type: 'processionHusk', x: 2710, wakeDelayMs: 154 }
    ]
  },
  {
    id: 'opened-room-anchor-domain',
    label: 'ANCHOR DOMAIN',
    zoneX: 3820,
    zoneY: WORLD.floorY - 76,
    zoneWidth: 1160,
    zoneHeight: 246,
    enemies: [
      { type: 'processionHusk', x: 3400 },
      { type: 'cordBearer', x: 3630, wakeDelayMs: 58 },
      { type: 'anchorElite', x: 3900, wakeDelayMs: 130 },
      { type: 'cordBearer', x: 4180, wakeDelayMs: 184 }
    ]
  },
  {
    id: 'processional-stretch',
    label: 'PROCESSIONAL STRETCH',
    zoneX: 6080,
    zoneY: WORLD.floorY - 74,
    zoneWidth: 920,
    zoneHeight: 236,
    enemies: [
      { type: 'cordBearer', x: 5720 },
      { type: 'processionHusk', x: 5960, wakeDelayMs: 42 },
      { type: 'cordBearer', x: 6200, wakeDelayMs: 96 },
      { type: 'processionHusk', x: 6450, wakeDelayMs: 146 }
    ]
  },
  {
    id: 'threshold-endcap-leadup',
    label: 'ENDCAP LEAD-UP',
    zoneX: 7420,
    zoneY: WORLD.floorY - 74,
    zoneWidth: 700,
    zoneHeight: 236,
    enemies: [
      { type: 'processionHusk', x: 7180 },
      { type: 'cordBearer', x: 7390, wakeDelayMs: 48 },
      { type: 'processionHusk', x: 7580, wakeDelayMs: 102 }
    ]
  }
];

const LORE_ANCHOR = {
  x: 760,
  y: WORLD.floorY - 78,
  width: 214,
  height: 210,
  cutsceneId: 'sector04-chamber02-return-ledger'
};

const RETURN_ALTAR = { x: 3500, y: WORLD.floorY - 106 };

const THRESHOLD_PROPS = {
  gateX: 7440,
  doorX: 7740,
  y: WORLD.floorY - 128,
  width: 220,
  height: 220,
  barrierX: 7920,
  barrierY: WORLD.floorY - 70,
  barrierWidth: 92,
  barrierHeight: 232
};

const BRUTALITY_MODE = {
  player: {
    visualScale: 1.36,
    bodyScale: 1.29,
    speedMultiplier: 1.12,
    reachMultiplier: 1.2,
    damageMultiplier: 2
  },
  enemyAggression: {
    speedMultiplier: 1.24,
    aggroRangeMultiplier: 1.28
  }
};

export class Sector04Chamber02Scene extends Phaser.Scene {
  constructor() {
    super(CHAMBER.sceneKey);
  }

  init(data) {
    this.transitionContext = data ?? {};
    this.isRestartingRun = false;
    this.isLoreTransitionActive = false;
    this.hasCompletedLoreBeat = false;
    this.currentLoreZone = null;
    this.enemies = [];
    this.encounterPockets = [];
    this.brutalityMode = null;
  }

  create() {
    this.createWorld();
    this.audioDirector = new AudioDirector(this);
    this.audioDirector.playAmbientLoop(ASSET_KEYS.ambientChamber01Loop01, { volume: 0.102 });
    this.createBackdrop();
    this.createPlayer();
    this.createEncounterPockets();
    this.setupBrutalityMode();
    this.createLoreAnchor();
    this.createUi();
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
        this.add.image(segment.x, segment.y, segment.key)
          .setDisplaySize(segment.width, segment.height)
          .setTint(segment.tint)
          .setAlpha(segment.alpha)
          .setDepth(-14.7 + index * 0.01);
      } else {
        this.add.rectangle(segment.x, segment.y + 10, segment.width, segment.height, 0x3d2f2a, 0.78)
          .setDepth(-14.7 + index * 0.01);
      }
      this.add.ellipse(segment.x, WORLD.floorY - 32, segment.width * 0.82, 62, 0x070504, 0.14 + index * 0.012).setDepth(-14.06);
    });

    if (this.textures.exists(ASSET_KEYS.sector04Chamber02AltarLore)) {
      this.add.image(LORE_ANCHOR.x, WORLD.floorY - 104, ASSET_KEYS.sector04Chamber02AltarLore)
        .setDisplaySize(206, 206)
        .setTint(0xd8cab6)
        .setAlpha(0.88)
        .setDepth(-6.08);
    }

    if (this.textures.exists(ASSET_KEYS.sector04Chamber02AltarReturn)) {
      this.add.image(RETURN_ALTAR.x, RETURN_ALTAR.y, ASSET_KEYS.sector04Chamber02AltarReturn)
        .setDisplaySize(220, 220)
        .setTint(0xd2c3ae)
        .setAlpha(0.78)
        .setDepth(-6.08);
    }

    if (this.textures.exists(ASSET_KEYS.sector04Chamber02PropGate)) {
      this.add.image(THRESHOLD_PROPS.gateX, THRESHOLD_PROPS.y, ASSET_KEYS.sector04Chamber02PropGate)
        .setDisplaySize(THRESHOLD_PROPS.width, THRESHOLD_PROPS.height)
        .setTint(0xcbb8a0)
        .setAlpha(0.86)
        .setDepth(-5.9);
    }

    if (this.textures.exists(ASSET_KEYS.sector04Chamber02PropThresholdDoor)) {
      this.add.image(THRESHOLD_PROPS.doorX, THRESHOLD_PROPS.y, ASSET_KEYS.sector04Chamber02PropThresholdDoor)
        .setDisplaySize(THRESHOLD_PROPS.width, THRESHOLD_PROPS.height)
        .setTint(0xc3b098)
        .setAlpha(0.84)
        .setDepth(-5.89);
    }

    this.terminalBarrier = this.add.rectangle(
      THRESHOLD_PROPS.barrierX,
      THRESHOLD_PROPS.barrierY,
      THRESHOLD_PROPS.barrierWidth,
      THRESHOLD_PROPS.barrierHeight,
      0x140e0a,
      0.42
    ).setDepth(-4.86);
    this.physics.add.existing(this.terminalBarrier, true);

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
    this.physics.add.collider(this.player.sprite, this.terminalBarrier);
  }

  createEncounterPockets() {
    this.encounterPockets = ENCOUNTER_POCKETS.map((pocketConfig) => {
      const zone = this.add.zone(pocketConfig.zoneX, pocketConfig.zoneY, pocketConfig.zoneWidth, pocketConfig.zoneHeight).setOrigin(0.5);
      this.physics.add.existing(zone, true);
      const markerShadow = this.add.ellipse(pocketConfig.zoneX, WORLD.floorY - 4, pocketConfig.zoneWidth * 0.62, 78, 0x040302, 0.09).setDepth(-5.84);

      const enemies = pocketConfig.enemies.map((enemyConfig) => {
        const baseConfig = ENEMIES[enemyConfig.type];
        const enemySpawnY = enemyConfig.y ?? S4C2_ENEMY_SPAWN_Y;
        const enemy = new SkitterServitor(this, enemyConfig.x, enemySpawnY, baseConfig);
        enemy.awakened = false;
        enemy.pocketWakeAtTime = null;

        this.physics.add.collider(enemy.sprite, this.platforms);
        this.physics.add.collider(enemy.sprite, this.terminalBarrier);
        this.physics.add.overlap(this.player.attackHitbox, enemy.sprite, (_attackZone, enemySprite) => {
          this.handlePlayerHitEnemy(_attackZone, enemySprite, enemy);
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
    const zone = this.add.zone(LORE_ANCHOR.x, LORE_ANCHOR.y, LORE_ANCHOR.width, LORE_ANCHOR.height).setOrigin(0.5);
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
      this.game.events.off('lore-cutscene-complete', this.handleLoreCutsceneComplete, this);
    });
    this.game.events.on('lore-cutscene-complete', this.handleLoreCutsceneComplete, this);
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
    });

    this.scale.on('resize', this.applyResponsiveLayout, this);
    this.applyResponsiveLayout();
    this.mobileControls.setMode('gameplay');
    this.directionalCameraBias?.update();
    this.hud.update(this.player.health, this.player.maxHealth);
  }

  update(time) {
    this.brutalityMode?.update(time);
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
    this.syncBrutalityAggression();
    this.updateEncounterPockets(time);
    this.refreshLoreZonePresence();
    this.tryBeginLoreSequence(mobileInput);
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
            enemy.pocketWakeAtTime = time + (enemy.config.wakeDelayMs ?? 0) + index * 52;
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

  setupBrutalityMode() {
    this.brutalityMode = new BrutalityModeState(this, {
      onActivated: () => {
        this.player.applyBrutalityMode(BRUTALITY_MODE.player);
        this.audioDirector?.playEnemyAttack('miniboss');
        this.syncBrutalityAggression();
      },
      onEnded: () => {
        this.player.clearBrutalityMode();
        this.enemies.forEach((enemy) => enemy.setBrutalityAggression(false));
      }
    });
  }

  handlePlayerHitEnemy(_attackZone, enemySprite, enemy) {
    if (!this.player.attackActive || enemy.dead || enemy.lastAttackHitId === this.player.attackId || !(enemySprite === enemy.sprite || enemySprite?.gameObject === enemy.sprite)) {
      return;
    }

    enemy.lastAttackHitId = this.player.attackId;
    const now = this.time.now;
    const knockDirection = Math.sign(enemy.sprite.x - this.player.sprite.x) || this.player.facing;
    enemy.setHitReactionDirection(knockDirection);

    const isBasicEnemy = !enemy.config?.isElite;
    const brutalityActive = this.brutalityMode?.isActive?.() ?? false;
    if (brutalityActive && isBasicEnemy) {
      enemy.takeDamage(Math.max(enemy.health, 1), now, { skipDefaultDeathFx: true });
      if (enemy.dead) {
        triggerBrutalityBasicChunkBurst(this, {
          x: enemy.sprite.x,
          y: (enemy.body?.center?.y ?? enemy.sprite.y) - 10,
          depth: enemy.sprite.depth + 0.12
        });
        this.cameras.main.shake(86, 0.005, true);
      }
    } else {
      enemy.takeDamage(this.player.getAttackDamage(), now);
    }

    this.audioDirector?.playPlayerHit();
    if (!enemy.dead) {
      return;
    }

    if (isBasicEnemy) {
      this.brutalityMode?.registerBasicKill(now);
    }
  }

  syncBrutalityAggression() {
    const brutalityActive = this.brutalityMode?.isActive?.() ?? false;
    this.enemies.forEach((enemy) => enemy.setBrutalityAggression(brutalityActive, BRUTALITY_MODE.enemyAggression));
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
        cutsceneId: LORE_ANCHOR.cutsceneId,
        returnSceneKey: this.scene.key
      });
    });

    this.cameras.main.fadeOut(420, 0, 0, 0);
  }

  handleLoreCutsceneComplete({ cutsceneId } = {}) {
    if (cutsceneId !== LORE_ANCHOR.cutsceneId) {
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

    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'Sector04Chamber02MobileUiCamera');
    const mobileUiElements = this.mobileControls.getUiElements();
    const mobileUiSet = new Set(mobileUiElements);
    const nonMobileObjects = this.children.list.filter((element) => !mobileUiSet.has(element));
    this.cameras.main.ignore(mobileUiElements);
    this.uiCamera.ignore(nonMobileObjects);
    if (this.restartText) {
      this.uiCamera.ignore(this.restartText);
    }
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
