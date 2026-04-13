import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { SkitterServitor } from '../entities/SkitterServitor.js';
import { HalfSkullMiniboss } from '../entities/HalfSkullMiniboss.js';
import { EnemyProjectile } from '../entities/EnemyProjectile.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import {
  COLORS,
  CONCEPT_PRESENTATION,
  LORE_ENTRIES,
  PLAYER,
  SKITTER,
  WORLD
} from '../data/milestone1Config.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';
import { createDirectionalCameraBias } from '../systems/DirectionalCameraBias.js';
import { restartRunFromDeath } from '../systems/RunReset.js';
import { AudioDirector } from '../audio/AudioDirector.js';
import { grantMajorEncounterIntegrityReward } from '../systems/VesselRunEconomy.js';
import { MajorEncounterResolution } from '../systems/MajorEncounterResolution.js';
import { triggerSector02BlackOilBlowout } from '../systems/Sector02BlackOilPayoff.js';
import { beginBossDeathPayoffPackage } from '../systems/BossDeathPayoffPackage.js';
import { BrutalityModeState } from '../systems/BrutalityModeState.js';
import { triggerBrutalityBasicChunkBurst } from '../systems/BrutalityChunkBurst.js';

const CHAMBER = {
  sceneKey: 'Chamber01Scene',
  width: 2720,
  floorColliderHeight: 72,
  floorColliderCenterYOffset: 28,
  spawnX: PLAYER.startX,
  spawnY: PLAYER.startY,
  cameraLerp: { x: 0.08, y: 0.08 },
  portraitFollowOffsetX: -118,
  desktopFollowOffsetX: -148,
  gateX: 2624
};

const CHAMBER_FLOOR_PLANE_Y = WORLD.floorY + CHAMBER.floorColliderCenterYOffset - CHAMBER.floorColliderHeight / 2;
const PLAYER_FLOOR_CLAMP_EPSILON_PX = 0.5;
const PLAYER_HIT_GROUND_RESYNC_DELAY_MS = 260;

const BLIND_CANTOR = {
  encounterId: 'chamber01-blind-cantor-major-encounter',
  name: 'THE BLIND CANTOR',
  subtitle: 'Ritual Choir Profanation',
  health: 4.5 * 0.25,
  contactDamage: 1,
  contactDamageCooldownMs: 1120,
  attackCooldownMs: 2650,
  attackTelegraphMs: 700,
  attackRecoveryMs: 540,
  attackRange: 220,
  approachRange: 360,
  approachSpeed: 52,
  idleAdvanceSpeed: 20,
  windupDriftSpeed: 16,
  attackSpeed: 212,
  attackLiftVelocity: -170,
  hitPulseMs: 330,
  hurtRecoverMs: 240,
  hurtRecoilVelocityX: 120,
  hurtRecoilVelocityY: -64,
  spawnX: 2420,
  spawnY: CHAMBER_FLOOR_PLANE_Y,
  floorPlaneY: CHAMBER_FLOOR_PLANE_Y,
  floorSinkClampPx: 6,
  activationX: 2060,
  arenaStartX: 2020,
  body: { width: 90, height: 134, offsetX: 98, offsetY: 78 },
  textureKey: ASSET_KEYS.sector03Chamber02EnemyBasicBlindCantor,
  audioProfile: 'miniboss',
  presentation: {
    display: { width: 304, height: 292 },
    origin: { x: 0.52, y: 0.97 },
    alpha: 1,
    tint: 0xd8c8b2,
    scaleX: 1,
    scaleY: 1
  },
  resolution: {
    cameraZoomScale: 1.24,
    cameraFocusDurationMs: 260,
    ceremonyDurationMs: 3300,
    preExplosionShakeMs: 2860,
    preExplosionShakeIntensity: 0.0064,
    goreFountainCadenceMs: 76,
    explosionFadeStartDelayMs: 90,
    explosionFadeDurationMs: 340,
    postExplosionDespawnDelayMs: 560
  },
  threat: {
    floorHazardCooldownMs: 2600,
    floorHazardTelegraphMs: 860,
    floorHazardRadius: 64,
    aoeCooldownMs: 4200,
    aoeTelegraphMs: 680,
    aoeRadius: 152,
    projectileCooldownMs: 2300,
    projectileSpeed: 248
  }
};

const POCKET_CONFIGS = [
  {
    id: 'corridor-wall-pocket-01',
    zoneX: 760,
    zoneY: WORLD.floorY - 76,
    zoneWidth: 460,
    zoneHeight: 236,
    enemies: [
      { x: 670, variant: 'basic' },
      { x: 780, variant: 'basic' },
      { x: 890, variant: 'basic' }
    ]
  },
  {
    id: 'corridor-wall-pocket-02',
    zoneX: 1240,
    zoneY: WORLD.floorY - 76,
    zoneWidth: 560,
    zoneHeight: 236,
    enemies: [
      { x: 1080, variant: 'basic' },
      { x: 1200, variant: 'basic' },
      { x: 1320, variant: 'basic' },
      { x: 1440, variant: 'basic' }
    ]
  },
  {
    id: 'corridor-wall-pocket-03',
    zoneX: 1710,
    zoneY: WORLD.floorY - 76,
    zoneWidth: 540,
    zoneHeight: 236,
    enemies: [
      { x: 1570, variant: 'basic' },
      { x: 1690, variant: 'basic' },
      { x: 1810, variant: 'basic' },
      { x: 1930, variant: 'basic' }
    ]
  },
  {
    id: 'opened-reveal-domain',
    zoneX: 2170,
    zoneY: WORLD.floorY - 82,
    zoneWidth: 700,
    zoneHeight: 248,
    enemies: [
      { x: 2020, variant: 'elite' },
      { x: 2170, variant: 'elite' },
      { x: 2310, variant: 'basic' }
    ]
  }
];

const BRUTALITY_MODE = {
  rules: {
    streakTriggerKills: 2,
    streakWindowMs: 5000,
    activeDurationMs: 20000,
    maxActivationsPerChamber: 2
  },
  player: {
    speedMultiplier: 1.1,
    damageMultiplier: 3,
    reachMultiplier: 1.24
  },
  enemyAggression: {
    speedMultiplier: 1.22,
    aggroRangeMultiplier: 1.28
  }
};

const ENEMY_VARIANTS = {
  basic: {
    ...SKITTER,
    awakenPlayerX: undefined,
    presentation: {
      alpha: 0.96,
      display: { width: 168, height: 148 },
      origin: { x: 0.5, y: 0.93 },
      stateAlpha: { windup: 1, attack: 1, hurt: 0.96, dead: 0.44 }
    }
  },
  elite: {
    ...SKITTER,
    awakenPlayerX: undefined,
    isElite: true,
    health: 6,
    speed: 54,
    aggroRange: 286,
    patrolDistance: 88,
    body: { width: 70, height: 42, offsetX: 16, offsetY: 52 },
    corpseRemainsProfile: 'elite',
    presentation: {
      alpha: 0.98,
      display: { width: 238, height: 194 },
      origin: { x: 0.52, y: 0.95 },
      stateAlpha: { windup: 1, attack: 1, hurt: 0.98, dead: 0.46 }
    }
  }
};

const SEGMENTS = [
  { type: 'opening', x: 340, y: 214, w: 700, h: 432, tint: 0xd3c4b0, alpha: 0.74 },
  { type: 'corridor', x: 860, y: 214, w: 540, h: 430, tint: 0xbcae9e, alpha: 0.62 },
  { type: 'corridor', x: 1270, y: 214, w: 540, h: 430, tint: 0xaea08f, alpha: 0.56 },
  { type: 'corridor', x: 1680, y: 214, w: 560, h: 430, tint: 0xa89a8a, alpha: 0.54 },
  { type: 'reveal', x: 2170, y: 214, w: 780, h: 444, tint: 0xd7c7b1, alpha: 0.8 },
  { type: 'threshold', x: 2570, y: 214, w: 420, h: 436, tint: 0xd2c2ab, alpha: 0.74 }
];

const LORE_ENTRY_POSITION_OVERRIDES = {
  'end-deadgod': { x: 2360 }
};

export class Chamber01Scene extends Phaser.Scene {
  constructor() {
    super(CHAMBER.sceneKey);
  }

  create() {
    this.completedLoreBeats = new Set();
    this.triggeredLoreIds = new Set();
    this.integrityRewardTracker = new Set();
    this.currentLoreZone = null;
    this.currentGateZone = null;
    this.hasEnteredGateThreshold = false;
    this.gateAwaitingFreshInteract = false;
    this.isLoreTransitionActive = false;
    this.isGateTransitionActive = false;
    this.isBossCeremonyActive = false;
    this.resolutionLockActive = false;
    this.bossEncounterStarted = false;
    this.bossDefeated = false;
    this.hasProcessedBossVictory = false;
    this.bossCeremonyBossBarActive = false;
    this.bossDeathFlashUntil = -Infinity;
    this.bossProjectilePool = [];
    this.activeBossProjectiles = [];
    this.enemyProjectilesPaused = false;
    this.activeFloorHazards = [];
    this.activeBossShockwaves = [];
    this.nextBossFloorHazardAt = Number.POSITIVE_INFINITY;
    this.nextBossProjectileAt = Number.POSITIVE_INFINITY;
    this.nextBossAoeAt = Number.POSITIVE_INFINITY;
    this.pendingPlayerGroundResyncCall = null;

    this.createWorld();
    this.createBackdrop();
    this.createPlatforms();

    this.audioDirector = new AudioDirector(this);
    this.audioDirector.playAmbientLoop(ASSET_KEYS.ambientChamber01Loop01, { volume: 0.252 });

    this.createPlayer();
    this.createEncounterPockets();
    this.createBoss();
    this.createLoreZones();
    this.createGate();
    this.createUi();
    this.setupBrutalityMode();

    this.majorEncounterResolution = new MajorEncounterResolution(this);

    this.game.events.on('lore-screen-complete', this.handleLoreScreenComplete, this);
    this.game.events.on('lore-cutscene-complete', this.handleLoreCutsceneComplete, this);

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.applyResponsiveLayout, this);
      this.game.events.off('lore-screen-complete', this.handleLoreScreenComplete, this);
      this.game.events.off('lore-cutscene-complete', this.handleLoreCutsceneComplete, this);
      this.audioDirector?.shutdown();
      this.destroyBossProjectilePool();
      this.majorEncounterResolution?.teardown();
      this.hud?.setBossBarState({ visible: false });
      this.pendingPlayerGroundResyncCall?.remove(false);
      this.pendingPlayerGroundResyncCall = null;
      this.brutalityMode?.end(this.time.now);
      this.enemies?.forEach((enemy) => enemy.setBrutalityAggression(false));
      this.boss?.setBrutalityAggression?.(false);
    });

    this.configureLayout();
  }

  createWorld() {
    this.gameplayFloorY = CHAMBER_FLOOR_PLANE_Y;
    this.visualFloorY = CHAMBER_FLOOR_PLANE_Y;
    this.physics.world.gravity.y = WORLD.gravityY;
    this.cameras.main.setBounds(0, 0, CHAMBER.width, WORLD.height);
    this.physics.world.setBounds(0, 0, CHAMBER.width, WORLD.height);
    this.cameras.main.setBackgroundColor(COLORS.backdrop);

    this.platforms = this.physics.add.staticGroup();
    this.createInvisiblePlatform(
      CHAMBER.width / 2,
      WORLD.floorY + CHAMBER.floorColliderCenterYOffset,
      CHAMBER.width,
      CHAMBER.floorColliderHeight
    );
  }

  getGameplayFloorY() {
    return Number.isFinite(this.gameplayFloorY)
      ? this.gameplayFloorY
      : CHAMBER_FLOOR_PLANE_Y;
  }

  createBackdrop() {
    this.add.rectangle(CHAMBER.width / 2, WORLD.height / 2, CHAMBER.width, WORLD.height, COLORS.backdrop, 1).setDepth(-18);

    SEGMENTS.forEach((segment, index) => {
      this.renderSegmentBackdrop(segment, index);
    });

    this.add.rectangle(CHAMBER.width / 2, WORLD.floorY - 16, CHAMBER.width, 98, 0x1a1411, 0.94).setDepth(-6.4);
    this.add.rectangle(CHAMBER.width / 2, WORLD.floorY - 48, CHAMBER.width, 24, 0x2a2019, 0.72).setDepth(-6.3);
    this.add.ellipse(CHAMBER.width / 2, WORLD.floorY + 12, CHAMBER.width, 56, 0x040403, 0.34).setDepth(-6.1);
  }

  renderSegmentBackdrop(segment, index) {
    const depth = -14.6 + index * 0.02;
    const conceptReady = this.textures.exists(ASSET_KEYS.chamberBackground);

    if (segment.type === 'opening' && conceptReady) {
      this.add
        .image(segment.x, segment.y, ASSET_KEYS.chamberBackground)
        .setDisplaySize(segment.w, segment.h)
        .setTint(segment.tint)
        .setAlpha(segment.alpha)
        .setDepth(depth);
    } else if (segment.type === 'corridor' && this.textures.exists(ASSET_KEYS.chamber01Wall)) {
      this.add
        .tileSprite(segment.x, segment.y + 6, segment.w, segment.h, ASSET_KEYS.chamber01Wall)
        .setTint(segment.tint)
        .setAlpha(segment.alpha)
        .setDepth(depth);
    } else if (segment.type === 'reveal' && this.textures.exists(ASSET_KEYS.chamber01LaughingEngineWorld)) {
      this.add
        .image(segment.x, segment.y + 10, ASSET_KEYS.chamber01LaughingEngineWorld)
        .setDisplaySize(segment.w, segment.h)
        .setTint(segment.tint)
        .setAlpha(segment.alpha)
        .setDepth(depth);
    } else {
      this.add.rectangle(segment.x, segment.y, segment.w, segment.h, 0x382b25, segment.alpha * 0.84).setDepth(depth);
    }

    this.add.ellipse(segment.x, WORLD.floorY - 30, segment.w * 0.82, 64, 0x060504, 0.14 + index * 0.01).setDepth(-6.2);
  }

  createPlatforms() {
    const lanePlatforms = [];

    lanePlatforms.forEach((platform) => {
      this.createInvisiblePlatform(platform.x, platform.y, platform.w, platform.h);
    });

    if (this.textures.exists(ASSET_KEYS.chamber01FloorStrip)) {
      this.add
        .tileSprite(CHAMBER.width / 2, WORLD.floorY + 14, CHAMBER.width, 84, ASSET_KEYS.chamber01FloorStrip)
        .setTint(0xd7c8b2)
        .setAlpha(0.78)
        .setDepth(-6.22);
    }

    if (this.textures.exists(ASSET_KEYS.chamber01RibArch)) {
      this.add
        .image(2120, 198, ASSET_KEYS.chamber01RibArch)
        .setDisplaySize(760, 344)
        .setTint(0xd2c3ae)
        .setAlpha(0.5)
        .setDepth(-8.2);
    }

    if (this.textures.exists(ASSET_KEYS.sentinel)) {
      this.add
        .image(2380, 398, ASSET_KEYS.sentinel)
        .setOrigin(CONCEPT_PRESENTATION.sentinel.origin.x, CONCEPT_PRESENTATION.sentinel.origin.y)
        .setDisplaySize(CONCEPT_PRESENTATION.sentinel.display.width, CONCEPT_PRESENTATION.sentinel.display.height)
        .setCrop(
          CONCEPT_PRESENTATION.sentinel.crop.x,
          CONCEPT_PRESENTATION.sentinel.crop.y,
          CONCEPT_PRESENTATION.sentinel.crop.width,
          CONCEPT_PRESENTATION.sentinel.crop.height
        )
        .setTint(0xb8a88f)
        .setAlpha(0.58)
        .setDepth(-7.8);
    }
  }

  createPlayer() {
    this.player = new Player(this, CHAMBER.spawnX, CHAMBER.spawnY, PLAYER);
    this.physics.add.collider(this.player.sprite, this.platforms);
  }

  createEncounterPockets() {
    this.enemies = [];
    this.encounterPockets = POCKET_CONFIGS.map((pocketConfig) => {
      const zone = this.add.zone(pocketConfig.zoneX, pocketConfig.zoneY, pocketConfig.zoneWidth, pocketConfig.zoneHeight).setOrigin(0.5);
      this.physics.add.existing(zone, true);
      const markerShadow = this.add
        .ellipse(pocketConfig.zoneX, WORLD.floorY - 5, pocketConfig.zoneWidth * 0.58, 74, 0x050403, 0.08)
        .setDepth(-6.04);

      const enemies = pocketConfig.enemies.map((enemyConfig) => {
        const config = ENEMY_VARIANTS[enemyConfig.variant] ?? ENEMY_VARIANTS.basic;
        const enemy = new SkitterServitor(this, enemyConfig.x, PLAYER.startY, {
          ...config,
          textureKey: ASSET_KEYS.skitter
        });
        enemy.awakened = false;
        enemy.pocketWakeAtTime = null;

        this.physics.add.collider(enemy.sprite, this.platforms);
        this.physics.add.overlap(this.player.attackHitbox, enemy.sprite, () => this.handlePlayerHitEnemy(enemy));
        this.physics.add.overlap(this.player.sprite, enemy.sprite, () => this.handleEnemyContactPlayer(enemy));

        this.enemies.push(enemy);
        return enemy;
      });

      return {
        ...pocketConfig,
        zone,
        markerShadow,
        enemies,
        activated: false,
        resolved: false
      };
    });
  }

  createBoss() {
    this.boss = new HalfSkullMiniboss(this, BLIND_CANTOR.spawnX, BLIND_CANTOR.spawnY, {
      ...BLIND_CANTOR,
      floorPlaneY: CHAMBER_FLOOR_PLANE_Y
    });
    this.physics.add.collider(this.boss.getCollisionTarget?.() ?? this.boss.sprite, this.platforms);
    this.physics.add.overlap(this.player.attackHitbox, this.boss.damageHurtbox ?? this.boss.sprite, this.handlePlayerHitBoss, null, this);
    this.physics.add.overlap(this.player.sprite, this.boss.getCollisionTarget?.() ?? this.boss.sprite, this.handleBossContactPlayer, null, this);
    this.boss.setActive(false);
    this.boss.sprite.setVisible(false);
    this.boss.body.enable = false;
    this.enemyProjectileGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.physics.add.overlap(this.player.sprite, this.enemyProjectileGroup, (_playerSprite, projectileSprite) => {
      const projectile = projectileSprite?.__enemyProjectileRef;
      this.handleEnemyProjectileHit(projectile);
    });

  }

  createLoreZones() {
    this.loreZones = this.physics.add.staticGroup();
    LORE_ENTRIES.forEach((entry) => {
      const resolvedEntry = { ...entry, ...(LORE_ENTRY_POSITION_OVERRIDES[entry.id] ?? {}) };
      const zone = this.add.zone(resolvedEntry.x, resolvedEntry.y, resolvedEntry.width, resolvedEntry.height).setOrigin(0.5);
      this.physics.add.existing(zone, true);
      zone.loreEntry = resolvedEntry;
      this.loreZones.add(zone);
      this.createLoreShrineProp(resolvedEntry);
    });
  }

  createLoreShrineProp(entry) {
    const baseY = entry.y + 12;
    if (this.textures.exists(ASSET_KEYS.chamber01Shrine)) {
      this.add
        .image(entry.x, baseY - 22, ASSET_KEYS.chamber01Shrine)
        .setDisplaySize(146, 138)
        .setTint(0xd4c4ad)
        .setAlpha(0.86)
        .setDepth(-5.5);
    }

    this.add.ellipse(entry.x, baseY + 5, 136, 42, 0x090606, 0.3).setDepth(-5.4);
  }

  createGate() {
    this.gateBarrier = this.createInvisiblePlatform(CHAMBER.gateX, WORLD.floorY - 86, 84, 236);
    this.gateZone = this.add.zone(CHAMBER.gateX - 84, WORLD.floorY - 76, 168, 220).setOrigin(0.5);
    this.physics.add.existing(this.gateZone, true);

    if (this.textures.exists(ASSET_KEYS.sector04Chamber02PropThresholdDoor)) {
      this.gateArt = this.add
        .image(CHAMBER.gateX - 12, WORLD.floorY - 116, ASSET_KEYS.sector04Chamber02PropThresholdDoor)
        .setDisplaySize(242, 258)
        .setTint(0xc6b49d)
        .setAlpha(0.68)
        .setDepth(-5.24);
    } else if (this.textures.exists(ASSET_KEYS.sector02Chamber02Gate)) {
      this.gateArt = this.add
        .image(CHAMBER.gateX - 12, WORLD.floorY - 124, ASSET_KEYS.sector02Chamber02Gate)
        .setDisplaySize(242, 268)
        .setTint(0xc6b49d)
        .setAlpha(0.68)
        .setDepth(-5.24);
    }

    this.updateGateActivationVisuals();
  }

  createUi() {
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
    this.uiCamera?.ignore(this.restartText);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyAttack = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.keyRestart = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.keyInteract = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
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
    this.directionalCameraBias?.update();
    this.hud.update(this.player.health, this.player.maxHealth);
  }

  update(time) {
    const mobileInput = this.mobileControls.getInputState();

    if (this.player.isDead) {
      this.mobileControls.setMode('dead');
      this.restartText.setVisible(true).setText('VESSEL FAILURE\nPress [R] to re-seed chamber');
      this.enemies.forEach((enemy) => enemy.body?.setVelocity(0, 0));
      this.boss?.body?.setVelocity?.(0, 0);
      this.setEnemyProjectilesPaused(true);
      if (Phaser.Input.Keyboard.JustDown(this.keyRestart) || mobileInput.interactPressed) {
        restartRunFromDeath(this);
      }
      return;
    }

    this.restartText.setVisible(false);

    if (this.isLoreTransitionActive || this.isGateTransitionActive || this.isBossCeremonyActive || this.resolutionLockActive) {
      this.mobileControls.setMode('dialogue');
      this.player.body.setVelocity(0, 0);
      this.enemies.forEach((enemy) => enemy.body?.setVelocity(0, 0));
      this.boss?.body?.setVelocity?.(0, 0);
      this.setEnemyProjectilesPaused(true);
      return;
    }

    this.mobileControls.setMode('gameplay');
    this.setEnemyProjectilesPaused(false);

    const input = {
      left: this.cursors.left.isDown || mobileInput.left,
      right: this.cursors.right.isDown || mobileInput.right,
      jumpPressed:
        Phaser.Input.Keyboard.JustDown(this.cursors.up)
        || Phaser.Input.Keyboard.JustDown(this.cursors.space)
        || mobileInput.jumpPressed,
      attackPressed: Phaser.Input.Keyboard.JustDown(this.keyAttack) || mobileInput.attackPressed
    };

    this.player.update(time, input);
    this.updateEncounterPockets(time);
    this.enemies.forEach((enemy) => enemy.update(time, this.player.sprite.x));

    this.tryStartBossEncounter();
    this.boss.update(time, this.player.sprite);
    this.updateBlindCantorThreats(time);
    this.updateBossProjectiles(time);
    this.updateBossHazards(time);
    this.brutalityMode?.update(time);
    this.syncBrutalityAggression();

    this.refreshLoreZonePresence();
    this.tryBeginLoreSequence(mobileInput);
    this.refreshGateZonePresence();
    this.tryBeginGateTransition(mobileInput);

    this.updateBossArenaFeedback(time);
    this.clampPlayerToFloorBaseline();
    this.directionalCameraBias?.update();
    this.hud.update(this.player.health, this.player.maxHealth);
    this.hud.setBossBarState({
      visible: this.bossEncounterStarted && (!this.bossDefeated || this.bossCeremonyBossBarActive),
      name: BLIND_CANTOR.name,
      subtitle: BLIND_CANTOR.subtitle,
      current: this.bossCeremonyBossBarActive ? 0 : this.boss.health,
      max: this.boss.maxHealth,
      telegraph: this.bossCeremonyBossBarActive ? 1 : this.boss.getTelegraphProgress(time),
      wounded: this.bossCeremonyBossBarActive || time < this.boss.lastDamageFlashTime + 220
    });
  }

  updateEncounterPockets(time) {
    this.encounterPockets.forEach((pocket) => {
      let playerInside = false;
      this.physics.overlap(this.player.sprite, pocket.zone, () => {
        playerInside = true;
      });

      if (playerInside && !pocket.activated && this.completedLoreBeats.has('entry-altar')) {
        pocket.activated = true;
        pocket.enemies.forEach((enemy, index) => {
          if (!enemy.dead) {
            enemy.pocketWakeAtTime = time + index * 80;
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
        pocket.markerShadow.setAlpha(0.024);
      }
    });
  }

  tryStartBossEncounter() {
    if (this.bossEncounterStarted || !this.completedLoreBeats.has('end-deadgod')) {
      return;
    }

    const pocketsResolved = this.encounterPockets.every((pocket) => pocket.resolved);
    if (!pocketsResolved || this.player.sprite.x < BLIND_CANTOR.activationX) {
      return;
    }

    this.bossEncounterStarted = true;
    this.boss.sprite.setVisible(true);
    this.boss.body.enable = true;
    this.boss.setActive(true);
    this.boss.recordContactDamage(this.time.now + 320);
    this.gateArt?.setAlpha(0.56).setTint(0xaa9881);
    this.nextBossFloorHazardAt = this.time.now + 1400;
    this.nextBossProjectileAt = this.time.now + 980;
    this.nextBossAoeAt = this.time.now + 1860;
  }

  handlePlayerHitEnemy(enemy) {
    if (!this.player.attackActive || enemy.dead) {
      return;
    }
    if (enemy.lastAttackHitId === this.player.attackId) {
      return;
    }

    enemy.lastAttackHitId = this.player.attackId;
    const knockDirection = Math.sign(enemy.sprite.x - this.player.sprite.x) || this.player.facing;
    enemy.setHitReactionDirection(knockDirection);
    const now = this.time.now;
    const isBasicEnemy = !enemy.config?.isElite;
    const brutalityActive = this.brutalityMode?.isActive?.() ?? false;
    if (brutalityActive && isBasicEnemy) {
      enemy.takeDamage(Math.max(enemy.health, 1), now, { skipDefaultDeathFx: true });
      if (enemy.dead) {
        const remainsSpawnPoint = enemy.getDeathRemainsSpawnPoint?.() ?? {
          x: enemy.sprite.x,
          groundY: enemy.body?.bottom ?? this.player?.sprite?.body?.bottom
        };
        triggerBrutalityBasicChunkBurst(this, {
          x: remainsSpawnPoint.x,
          y: CHAMBER_FLOOR_PLANE_Y - 16,
          floorPlaneY: CHAMBER_FLOOR_PLANE_Y,
          depth: enemy.sprite.depth - 0.08
        });
        this.cameras.main.shake(86, 0.005, true);
      }
    } else {
      enemy.takeDamage(this.player.getAttackDamage(), now);
    }
    this.audioDirector?.playPlayerHit();
    if (enemy.dead && isBasicEnemy) {
      this.brutalityMode?.registerBasicKill(now);
    }
  }

  handleEnemyContactPlayer(enemy) {
    if (enemy.dead || !enemy.canDealContactDamage(this.time.now)) {
      return;
    }

    const tookDamage = this.player.receiveDamage(enemy.config.contactDamage ?? SKITTER.contactDamage, this.time.now);
    if (tookDamage) {
      const knockDirection = Math.sign(this.player.sprite.x - enemy.sprite.x) || 1;
      this.player.body.setVelocityX(knockDirection * 220);
      this.player.body.setVelocityY(-220);
    }
  }

  handlePlayerHitBoss(_attackZone, bossSprite) {
    if (
      !this.player.attackActive
      || !this.bossEncounterStarted
      || this.boss.dead
      || !this.isEnemyOverlapTarget(bossSprite, this.boss.sprite, this.boss.damageHurtbox)
    ) {
      return;
    }
    if (this.boss.lastAttackHitId === this.player.attackId) {
      return;
    }

    this.boss.lastAttackHitId = this.player.attackId;
    this.boss.takeDamage(1, this.time.now);
    this.audioDirector?.playPlayerHit();

    const knockDirection = Math.sign(this.boss.sprite.x - this.player.sprite.x) || this.player.facing;
    this.boss.direction = knockDirection;

    if (this.boss.dead) {
      this.handleBossDefeated();
    }
  }

  handleBossContactPlayer(_playerSprite, bossSprite) {
    if (this.boss.dead || !this.bossEncounterStarted || !this.isEnemyOverlapTarget(bossSprite, this.boss.sprite)) {
      return;
    }
    if (!this.boss.canDealContactDamage(this.time.now)) {
      return;
    }

    const tookDamage = this.player.receiveDamage(BLIND_CANTOR.contactDamage, this.time.now);
    if (tookDamage) {
      this.boss.recordContactDamage(this.time.now);
      const knockDirection = Math.sign(this.player.sprite.x - this.boss.sprite.x) || 1;
      this.player.body.setVelocityX(knockDirection * 280);
      this.player.body.setVelocityY(-220);
    }
  }

  handleBossDefeated() {
    if (
      this.hasProcessedBossVictory
      || this.majorEncounterResolution?.isResolutionActive(BLIND_CANTOR.encounterId)
      || this.majorEncounterResolution?.hasResolved(BLIND_CANTOR.encounterId)
    ) {
      return;
    }

    beginBossDeathPayoffPackage({
      scene: this,
      encounterId: BLIND_CANTOR.encounterId,
      majorEncounterResolution: this.majorEncounterResolution,
      bossSprite: this.boss?.sprite,
      bossBody: this.boss?.body,
      bossActor: this.boss,
      player: this.player,
      setResolutionLock: (locked) => {
        this.resolutionLockActive = locked;
      },
      pauseProjectiles: (paused) => this.setEnemyProjectilesPaused(paused),
      followPlayer: {
        cameraLerp: CHAMBER.cameraLerp,
        followOffsetX: this.getFollowOffsetX(),
        followOffsetY: 0,
        zoom: this.cameras.main.zoom
      },
      deathCamera: {
        focusLerp: { x: 0.08, y: 0.08 },
        focusOffsetX: 0,
        focusOffsetY: -24,
        zoomScale: BLIND_CANTOR.resolution.cameraZoomScale,
        zoomInDurationMs: BLIND_CANTOR.resolution.cameraFocusDurationMs,
        zoomOutDurationMs: 260
      },
      victory: {
        preExplosionShakeMs: BLIND_CANTOR.resolution.preExplosionShakeMs,
        preExplosionShakeIntensity: BLIND_CANTOR.resolution.preExplosionShakeIntensity,
        goreFountainCadenceMs: BLIND_CANTOR.resolution.goreFountainCadenceMs,
        explosionFadeStartDelayMs: BLIND_CANTOR.resolution.explosionFadeStartDelayMs,
        explosionFadeDurationMs: BLIND_CANTOR.resolution.explosionFadeDurationMs,
        postExplosionDespawnDelayMs: BLIND_CANTOR.resolution.postExplosionDespawnDelayMs,
        fountainBurst: {
          xJitter: [-62, 62],
          yFromBottom: [108, 160],
          depthOffset: 0.38,
          randomScale: [0.74, 0.96],
          durationMs: 600,
          burstCount: 58,
          sprayCount: 82,
          mistCount: 8,
          emberCount: 8,
          burstRadiusX: 128,
          burstRadiusY: 172,
          dropletWidth: [8, 22],
          dropletHeight: [18, 46],
          sprayWidth: [4, 11],
          sprayHeight: [14, 38],
          splashColor: 0x8b111c,
          heavyColor: 0x5e0a13,
          highlightColor: 0xb43645,
          redSpeckColor: 0xc84a55,
          mistColor: 0x1d080b
        },
        blowoutBurst: {
          yFromBottom: [96, 138],
          depthOffset: 0.46,
          scale: 1.32,
          durationMs: 820,
          burstCount: 96,
          sprayCount: 134,
          mistCount: 20,
          emberCount: 18,
          burstRadiusX: 162,
          burstRadiusY: 196,
          dropletWidth: [12, 30],
          dropletHeight: [22, 56],
          sprayWidth: [5, 14],
          sprayHeight: [16, 42],
          splashColor: 0x8b111c,
          heavyColor: 0x5e0a13,
          highlightColor: 0xb43645,
          redSpeckColor: 0xc84a55,
          mistColor: 0x1d080b
        }
      },
      payoffPose: {
        floorPlaneY: CHAMBER_FLOOR_PLANE_Y,
        maxUpwardSnapPx: 22,
        scaleX: this.boss.baseScaleX * this.boss.config.presentation.scaleX,
        scaleY: this.boss.baseScaleY * this.boss.config.presentation.scaleY,
        angle: 0
      },
      corpseRemains: {
        floorPlaneY: CHAMBER_FLOOR_PLANE_Y,
        size: 'sector3Boss'
      },
      onStart: () => {
        this.hasProcessedBossVictory = true;
        this.bossDefeated = true;
        this.bossCeremonyBossBarActive = true;
        this.isBossCeremonyActive = true;
        this.bossDeathFlashUntil = this.time.now + BLIND_CANTOR.resolution.preExplosionShakeMs;
        this.playBossCeremonyStart();
      },
      onPreExplosion: () => {
        grantMajorEncounterIntegrityReward(this.player, this.integrityRewardTracker, BLIND_CANTOR.encounterId);
        this.audioDirector?.playGateUnlock();
        this.updateGateActivationVisuals();
      },
      onComplete: () => {
        this.finishBossCeremony();
      }
    });
  }

  playBossCeremonyStart() {
    this.stabilizeBossCorpseForPayoff();
    this.focusCameraOnBoss();
    this.cameras.main.shake(BLIND_CANTOR.resolution.preExplosionShakeMs, BLIND_CANTOR.resolution.preExplosionShakeIntensity, true);
    this.time.delayedCall(210, () => this.cameras.main.shake(1200, BLIND_CANTOR.resolution.preExplosionShakeIntensity * 0.82, true));
  }

  focusCameraOnBoss() {
    this.cameraPreCeremonyZoom = this.cameras.main.zoom;
    this.cameras.main.pan(this.boss.sprite.x, this.boss.sprite.y - 24, BLIND_CANTOR.resolution.cameraFocusDurationMs, 'Sine.easeInOut');
    this.tweens.add({
      targets: this.cameras.main,
      zoom: this.cameraPreCeremonyZoom * BLIND_CANTOR.resolution.cameraZoomScale,
      duration: BLIND_CANTOR.resolution.cameraFocusDurationMs,
      ease: 'Sine.easeInOut'
    });
  }

  stabilizeBossCorpseForPayoff() {
    if (!this.boss?.sprite?.active) {
      return;
    }

    const floorBottomY = CHAMBER_FLOOR_PLANE_Y;
    const groundedY = floorBottomY - this.boss.sprite.displayHeight * (1 - this.boss.sprite.originY);
    this.tweens.killTweensOf(this.boss.sprite);
    this.boss.sprite
      .setAlpha(1)
      .setVisible(true)
      .setScale(this.boss.baseScaleX * this.boss.config.presentation.scaleX, this.boss.baseScaleY * this.boss.config.presentation.scaleY)
      .setAngle(0)
      .setY(groundedY);
  }

  finishBossCeremony() {
    this.bossCeremonyBossBarActive = false;
    this.hud.setBossBarState({ visible: false });
    this.isBossCeremonyActive = false;

    if (this.cameraPreCeremonyZoom) {
      this.tweens.add({
        targets: this.cameras.main,
        zoom: this.cameraPreCeremonyZoom,
        duration: 260,
        ease: 'Sine.easeInOut'
      });
    }

    this.cameras.main.startFollow(this.player.sprite, true, CHAMBER.cameraLerp.x, CHAMBER.cameraLerp.y, this.getFollowOffsetX(), 0);
  }

  refreshLoreZonePresence() {
    this.currentLoreZone = null;
    this.physics.overlap(this.player.sprite, this.loreZones, (_playerSprite, zone) => {
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

    const interactPressed = Phaser.Input.Keyboard.JustDown(this.keyInteract)
      || Phaser.Input.Keyboard.JustDown(this.keyEnter)
      || mobileInput.interactPressed;
    if (!interactPressed) {
      return;
    }

    const { loreEntry } = this.currentLoreZone;
    if (!loreEntry || this.triggeredLoreIds.has(loreEntry.id)) {
      return;
    }

    this.triggeredLoreIds.add(loreEntry.id);
    this.beginLoreSequence(loreEntry);
  }

  beginLoreSequence(loreEntry) {
    if (this.isLoreTransitionActive) {
      return;
    }

    this.isLoreTransitionActive = true;
    this.mobileControls.setMode('dialogue');
    this.player.body.setVelocity(0, 0);
    this.enemies.forEach((enemy) => enemy.body?.setVelocity(0, 0));
    this.boss?.body?.setVelocity?.(0, 0);
    this.setEnemyProjectilesPaused(true);

    this.audioDirector?.stopAmbientLoop();

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.pause();
      if (loreEntry.cutsceneId) {
        this.scene.launch('LoreCutsceneScene', {
          cutsceneId: loreEntry.cutsceneId,
          returnSceneKey: this.scene.key
        });
        return;
      }

      this.scene.launch('LoreScreenScene', {
        screenId: loreEntry.screenId,
        returnSceneKey: this.scene.key
      });
    });

    this.cameras.main.fadeOut(420, 0, 0, 0);
  }

  handleLoreScreenComplete() {
    if (!this.completedLoreBeats.has('entry-altar') && this.triggeredLoreIds.has('entry-altar')) {
      this.completedLoreBeats.add('entry-altar');
      this.updateGateActivationVisuals();
    }

    this.resumeFromLore();
  }

  handleLoreCutsceneComplete({ cutsceneId } = {}) {
    if (cutsceneId === 'chamber01-deadgod-witness' && !this.completedLoreBeats.has('end-deadgod')) {
      this.completedLoreBeats.add('end-deadgod');
    }

    this.resumeFromLore();
  }

  resumeFromLore() {
    this.isLoreTransitionActive = false;
    this.mobileControls.setMode('gameplay');
    this.audioDirector?.playAmbientLoop(ASSET_KEYS.ambientChamber01Loop01, { volume: 0.252 });
    this.setEnemyProjectilesPaused(false);
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  refreshGateZonePresence() {
    const wasInsideGate = this.hasEnteredGateThreshold;
    this.currentGateZone = null;

    if (!this.gateZone || !this.canUseGate()) {
      this.hasEnteredGateThreshold = false;
      this.gateAwaitingFreshInteract = false;
      return;
    }

    this.physics.overlap(this.player.sprite, this.gateZone, () => {
      this.currentGateZone = this.gateZone;
    });

    this.hasEnteredGateThreshold = Boolean(this.currentGateZone);
    if (!this.hasEnteredGateThreshold) {
      this.gateAwaitingFreshInteract = false;
    } else if (!wasInsideGate) {
      this.gateAwaitingFreshInteract = true;
    }
  }

  canUseGate() {
    return this.completedLoreBeats.has('entry-altar') && this.bossDefeated;
  }

  tryBeginGateTransition(mobileInput) {
    if (!this.currentGateZone || this.isGateTransitionActive) {
      return;
    }

    const interactHeld = this.keyInteract?.isDown || this.keyEnter?.isDown || mobileInput.interactHeld;
    if (this.gateAwaitingFreshInteract) {
      if (interactHeld) {
        return;
      }
      this.gateAwaitingFreshInteract = false;
    }

    const interactPressed = Phaser.Input.Keyboard.JustDown(this.keyInteract)
      || Phaser.Input.Keyboard.JustDown(this.keyEnter)
      || mobileInput.interactPressed;
    if (!interactPressed) {
      return;
    }

    this.audioDirector?.playGateInteract();
    this.beginGateTransitionToChamber02();
  }

  updateGateActivationVisuals() {
    if (!this.gateArt) {
      return;
    }

    if (this.canUseGate()) {
      this.gateArt.setAlpha(0.86).setTint(0xd7c8af);
      return;
    }

    if (this.completedLoreBeats.has('entry-altar')) {
      this.gateArt.setAlpha(0.58).setTint(0xb7a88f);
      return;
    }

    this.gateArt.setAlpha(0.62).setTint(0xb39f85);
  }

  beginGateTransitionToChamber02() {
    if (this.isGateTransitionActive) {
      return;
    }

    this.isGateTransitionActive = true;
    this.mobileControls.setMode('dialogue');
    this.player.body.setVelocity(0, 0);
    this.enemies.forEach((enemy) => enemy.body?.setVelocity(0, 0));
    this.boss?.body?.setVelocity?.(0, 0);
    this.setEnemyProjectilesPaused(true);

    this.audioDirector?.stopAmbientLoop({ fadeOut: false });

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.audioDirector?.shutdown();
      try {
        this.scene.start('Chamber02Scene', {
          enteredFrom: 'chamber01-ritual-threshold-gate',
          progressionSource: 'blind-cantor-banished'
        });
      } catch (error) {
        console.error("[Chamber01->Chamber02] scene.start('Chamber02Scene') failed", error);
        this.isGateTransitionActive = false;
      }
    });

    this.cameras.main.fadeOut(640, 0, 0, 0);
  }

  updateBossArenaFeedback(time) {
    if (time < this.bossDeathFlashUntil) {
      const progress = Phaser.Math.Clamp((this.bossDeathFlashUntil - time) / 560, 0, 1);
      this.cameras.main.setBackgroundColor(Phaser.Display.Color.GetColor(
        20 + Math.round(24 * progress),
        11 + Math.round(14 * progress),
        11 + Math.round(10 * progress)
      ));
      return;
    }

    this.cameras.main.setBackgroundColor(COLORS.backdrop);
  }

  setupBrutalityMode() {
    this.brutalityMode = new BrutalityModeState(this, {
      ...BRUTALITY_MODE.rules,
      onActivated: () => {
        this.player.applyBrutalityMode(BRUTALITY_MODE.player);
        this.audioDirector?.playEnemyAttack('miniboss');
        this.syncBrutalityAggression();
      },
      onEnded: () => {
        this.player.clearBrutalityMode();
        this.enemies.forEach((enemy) => enemy.setBrutalityAggression(false));
        this.boss?.setBrutalityAggression?.(false);
      }
    });
  }

  syncBrutalityAggression() {
    const brutalityActive = this.brutalityMode?.isActive?.() ?? false;
    this.enemies.forEach((enemy) => enemy.setBrutalityAggression(brutalityActive, BRUTALITY_MODE.enemyAggression));
    this.boss?.setBrutalityAggression?.(brutalityActive, BRUTALITY_MODE.enemyAggression);
  }

  updateBlindCantorThreats(time) {
    if (!this.bossEncounterStarted || this.boss?.dead || !this.boss?.active || this.isBossCeremonyActive || this.resolutionLockActive) {
      return;
    }

    if (time >= this.nextBossProjectileAt) {
      this.fireBlindCantorProjectiles();
      this.nextBossProjectileAt = time + BLIND_CANTOR.threat.projectileCooldownMs;
    }

    if (time >= this.nextBossFloorHazardAt) {
      this.spawnFloorHazardTelegraph();
      this.nextBossFloorHazardAt = time + BLIND_CANTOR.threat.floorHazardCooldownMs;
    }

    if (time >= this.nextBossAoeAt) {
      this.castBlindCantorShockwave();
      this.nextBossAoeAt = time + BLIND_CANTOR.threat.aoeCooldownMs;
    }
  }

  fireBlindCantorProjectiles() {
    if (!this.player?.sprite?.active || !this.boss?.sprite?.active) {
      return;
    }

    const originX = this.boss.sprite.x + (this.boss.direction >= 0 ? 52 : -52);
    const originY = this.boss.sprite.y - 78;
    const targetY = this.player.sprite.y - 52;
    [-42, 0, 42].forEach((spreadY) => {
      const projectile = this.getReusableBossProjectile();
      const velocity = new Phaser.Math.Vector2(this.player.sprite.x - originX, targetY + spreadY - originY)
        .normalize()
        .scale(BLIND_CANTOR.threat.projectileSpeed);
      projectile.fire({
        x: originX,
        y: originY + spreadY * 0.18,
        velocityX: velocity.x,
        velocityY: velocity.y,
        textureKey: ASSET_KEYS.sector02PressureShardProjectile,
        lifetimeMs: 2600,
        damage: 1,
        rotationSpeed: 260,
        tint: 0xd6c8b0
      });
      projectile.sprite.__enemyProjectileRef = projectile;
      this.enemyProjectileGroup.add(projectile.sprite);
    });
  }

  spawnFloorHazardTelegraph() {
    const targetX = Phaser.Math.Clamp(
      this.player.sprite.x + Phaser.Math.Between(-84, 84),
      BLIND_CANTOR.arenaStartX + 40,
      CHAMBER.gateX - 128
    );
    const cue = this.add.ellipse(targetX, WORLD.floorY - 6, BLIND_CANTOR.threat.floorHazardRadius * 2, 30, 0x8a1520, 0.1).setDepth(5.95);
    this.tweens.add({
      targets: cue,
      alpha: 0.56,
      width: BLIND_CANTOR.threat.floorHazardRadius * 2.3,
      duration: BLIND_CANTOR.threat.floorHazardTelegraphMs,
      ease: 'Sine.easeIn'
    });

    this.activeFloorHazards.push({
      cue,
      x: targetX,
      triggerAt: this.time.now + BLIND_CANTOR.threat.floorHazardTelegraphMs,
      radius: BLIND_CANTOR.threat.floorHazardRadius
    });
  }

  castBlindCantorShockwave() {
    if (!this.boss?.sprite?.active) {
      return;
    }
    const ring = this.add.circle(this.boss.sprite.x, this.boss.sprite.y - 10, 18, 0xb43a46, 0.18).setDepth(6.15);
    ring.setStrokeStyle(4, 0xd5c4a9, 0.6);
    this.activeBossShockwaves.push({
      ring,
      x: this.boss.sprite.x,
      y: this.boss.sprite.y - 10,
      triggerAt: this.time.now + BLIND_CANTOR.threat.aoeTelegraphMs,
      radius: BLIND_CANTOR.threat.aoeRadius
    });
    this.tweens.add({
      targets: ring,
      scaleX: BLIND_CANTOR.threat.aoeRadius / 18,
      scaleY: BLIND_CANTOR.threat.aoeRadius / 18,
      alpha: 0.62,
      duration: BLIND_CANTOR.threat.aoeTelegraphMs,
      ease: 'Sine.easeOut'
    });
  }

  updateBossHazards(time) {
    this.activeFloorHazards = this.activeFloorHazards.filter((hazard) => {
      if (time < hazard.triggerAt) {
        return true;
      }
      this.triggerSectorFloorRupture(hazard.x, hazard.radius);
      hazard.cue?.destroy();
      return false;
    });

    this.activeBossShockwaves = this.activeBossShockwaves.filter((entry) => {
      if (time < entry.triggerAt) {
        return true;
      }
      entry.ring?.destroy();
      this.applyShockwaveDamage(entry.x, entry.y, entry.radius);
      return false;
    });
  }

  triggerSectorFloorRupture(x, radius) {
    this.cameras.main.shake(120, 0.0042, true);
    triggerSector02BlackOilBlowout(this, {
      source: this.boss.sprite,
      x,
      y: WORLD.floorY - 18,
      depth: 6.1,
      fadeSource: false,
      scale: 0.72,
      durationMs: 540,
      burstCount: 26,
      sprayCount: 38,
      mistCount: 4,
      emberCount: 0,
      burstRadiusX: 84,
      burstRadiusY: 96,
      dropletWidth: [6, 14],
      dropletHeight: [10, 30],
      sprayWidth: [3, 8],
      sprayHeight: [10, 22],
      includeGroundPool: false,
      persistPuddle: false
    });

    const playerDistance = Math.abs(this.player.sprite.x - x);
    if (playerDistance <= radius && this.player.receiveDamage(1, this.time.now)) {
      const knockDirection = Math.sign(this.player.sprite.x - x) || 1;
      this.player.body.setVelocityX(knockDirection * 238);
      this.player.body.setVelocityY(-210);
      this.schedulePlayerGroundingResync();
    }
  }

  applyShockwaveDamage(x, y, radius) {
    const distance = Phaser.Math.Distance.Between(this.player.sprite.x, this.player.sprite.y, x, y);
    if (distance > radius) {
      return;
    }
    if (this.player.receiveDamage(1, this.time.now)) {
      const knockDirection = Math.sign(this.player.sprite.x - x) || 1;
      this.player.body.setVelocityX(knockDirection * 244);
      this.player.body.setVelocityY(-194);
      this.schedulePlayerGroundingResync();
    }
    this.cameras.main.shake(150, 0.005, true);
  }

  schedulePlayerGroundingResync(delayMs = PLAYER_HIT_GROUND_RESYNC_DELAY_MS) {
    this.pendingPlayerGroundResyncCall?.remove(false);
    this.pendingPlayerGroundResyncCall = this.time.delayedCall(delayMs, () => {
      this.pendingPlayerGroundResyncCall = null;
      this.clampPlayerToFloorBaseline({ forceSettle: true });
    });
  }

  clampPlayerToFloorBaseline({ forceSettle = false } = {}) {
    const playerBody = this.player?.body;
    if (!playerBody?.enable || this.player?.isDead) {
      return;
    }

    const floorPlaneY = CHAMBER_FLOOR_PLANE_Y;
    const floorOverflow = playerBody.bottom - floorPlaneY;
    const canSettleNow = forceSettle || playerBody.blocked.down || playerBody.velocity.y >= 0;
    if (!canSettleNow || floorOverflow <= PLAYER_FLOOR_CLAMP_EPSILON_PX) {
      return;
    }

    this.player.sprite.y -= floorOverflow;
    playerBody.updateFromGameObject();
    if (playerBody.velocity.y > 0) {
      playerBody.setVelocityY(0);
    }
    this.player.lastGroundedBodyBottom = floorPlaneY;
  }

  getReusableBossProjectile() {
    const reusable = this.bossProjectilePool.find((entry) => !entry.active);
    if (reusable) {
      return reusable;
    }

    const projectile = new EnemyProjectile(this, {
      speed: BLIND_CANTOR.threat.projectileSpeed,
      damage: 1,
      lifetimeMs: 2400,
      bodySize: { width: 20, height: 20 },
      depth: 6.3,
      rotationSpeed: 320,
      presentation: {
        displayWidth: 40,
        displayHeight: 40,
        alpha: 0.96,
        tint: 0xd8c9b1,
        fallbackFill: 0xc3b39a,
        fallbackStroke: 0x7b6b5d
      }
    });
    this.bossProjectilePool.push(projectile);
    this.activeBossProjectiles.push(projectile);
    return projectile;
  }

  updateBossProjectiles(time) {
    const delta = this.game.loop.delta;
    this.activeBossProjectiles.forEach((projectile) => projectile.update(time, delta));
  }

  handleEnemyProjectileHit(projectile) {
    if (!projectile?.active || this.player.isDead || this.isLoreTransitionActive || this.isGateTransitionActive || this.isBossCeremonyActive) {
      return;
    }

    const tookDamage = this.player.receiveDamage(projectile.damage ?? 1, this.time.now);
    projectile.playImpact(this.player.sprite.x, this.player.sprite.y - 26, 0xe5d8c4);
    if (tookDamage) {
      const knockDirection = Math.sign(this.player.sprite.x - (projectile.sprite?.x ?? this.player.sprite.x - 1)) || 1;
      this.player.body.setVelocityX(knockDirection * 214);
      this.player.body.setVelocityY(-168);
    }
  }

  setEnemyProjectilesPaused(paused) {
    if (this.enemyProjectilesPaused === paused) {
      return;
    }
    this.enemyProjectilesPaused = paused;
    this.activeBossProjectiles.forEach((projectile) => {
      if (paused) {
        projectile.pauseMotion();
      } else {
        projectile.resumeMotion();
      }
    });
  }

  destroyBossProjectilePool() {
    this.activeBossProjectiles.forEach((projectile) => projectile.destroy());
    this.activeBossProjectiles = [];
    this.bossProjectilePool = [];
  }

  setupMobileUiCamera() {
    if (!this.mobileControls.enabled) {
      return;
    }

    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'Chamber01MobileUiCamera');
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

  getFollowOffsetX() {
    if (this.directionalCameraBias) {
      return this.directionalCameraBias.getFollowOffsetX();
    }
    return this.mobileControls.enabled && this.scale.height >= this.scale.width
      ? CHAMBER.portraitFollowOffsetX
      : CHAMBER.desktopFollowOffsetX;
  }

  createInvisiblePlatform(x, y, width, height) {
    const platform = this.add.rectangle(x, y, width, height, 0x000000, 0).setOrigin(0.5);
    platform.setVisible(false);
    this.physics.add.existing(platform, true);
    this.platforms.add(platform);
    return platform;
  }

  isEnemyOverlapTarget(target, sprite, alternateSprite = null) {
    return target === sprite
      || target === alternateSprite
      || target?.gameObject === sprite
      || target?.gameObject === alternateSprite;
  }
}
