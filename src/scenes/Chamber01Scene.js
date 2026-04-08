import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { SkitterServitor } from '../entities/SkitterServitor.js';
import { HalfSkullMiniboss } from '../entities/HalfSkullMiniboss.js';
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
import { spawnEnemyCorpseRemains } from '../systems/EnemyCorpseRemains.js';

const CHAMBER = {
  sceneKey: 'Chamber01Scene',
  width: WORLD.width,
  floorColliderHeight: 72,
  floorColliderCenterYOffset: 28,
  spawnX: PLAYER.startX,
  spawnY: PLAYER.startY,
  cameraLerp: { x: 0.08, y: 0.08 },
  portraitFollowOffsetX: -118,
  desktopFollowOffsetX: -148,
  gateX: WORLD.width - 82
};

const CHAMBER_FLOOR_PLANE_Y = WORLD.floorY + CHAMBER.floorColliderCenterYOffset - CHAMBER.floorColliderHeight / 2;

const BLIND_CANTOR = {
  encounterId: 'chamber01-blind-cantor-major-encounter',
  name: 'THE BLIND CANTOR',
  subtitle: 'Ritual Choir Profanation',
  health: 18,
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
  spawnX: 1980,
  spawnY: CHAMBER_FLOOR_PLANE_Y,
  activationX: 1640,
  arenaStartX: 1600,
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
    cameraZoomScale: 1.2,
    cameraFocusDurationMs: 240,
    ceremonyDurationMs: 3300,
    preExplosionShakeMs: 2800,
    preExplosionShakeIntensity: 0.006,
    goreFountainCadenceMs: 78,
    explosionFadeStartDelayMs: 90,
    explosionFadeDurationMs: 340,
    postExplosionDespawnDelayMs: 560
  }
};

const POCKET_CONFIGS = [
  {
    id: 'corridor-wall-pocket-01',
    zoneX: 740,
    zoneY: WORLD.floorY - 76,
    zoneWidth: 420,
    zoneHeight: 236,
    enemies: [
      { x: 610, variant: 'basic' },
      { x: 790, variant: 'basic' }
    ]
  },
  {
    id: 'corridor-wall-pocket-02',
    zoneX: 1160,
    zoneY: WORLD.floorY - 76,
    zoneWidth: 520,
    zoneHeight: 236,
    enemies: [
      { x: 980, variant: 'basic' },
      { x: 1160, variant: 'basic' },
      { x: 1320, variant: 'basic' }
    ]
  },
  {
    id: 'opened-reveal-domain',
    zoneX: 1540,
    zoneY: WORLD.floorY - 82,
    zoneWidth: 660,
    zoneHeight: 248,
    enemies: [
      { x: 1400, variant: 'basic' },
      { x: 1540, variant: 'elite' },
      { x: 1680, variant: 'basic' }
    ]
  }
];

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
  { type: 'reveal', x: 1650, y: 214, w: 760, h: 444, tint: 0xd7c7b1, alpha: 0.8 },
  { type: 'threshold', x: 2050, y: 214, w: 420, h: 436, tint: 0xd2c2ab, alpha: 0.74 }
];

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
    this.bossVictoryGoreFountainTimer = null;

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

    this.majorEncounterResolution = new MajorEncounterResolution(this);

    this.game.events.on('lore-screen-complete', this.handleLoreScreenComplete, this);
    this.game.events.on('lore-cutscene-complete', this.handleLoreCutsceneComplete, this);

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.applyResponsiveLayout, this);
      this.game.events.off('lore-screen-complete', this.handleLoreScreenComplete, this);
      this.game.events.off('lore-cutscene-complete', this.handleLoreCutsceneComplete, this);
      this.audioDirector?.shutdown();
      this.stopBossVictoryGoreFountain();
      this.majorEncounterResolution?.teardown();
      this.hud?.setBossBarState({ visible: false });
    });

    this.configureLayout();
  }

  createWorld() {
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
        .image(1620, 198, ASSET_KEYS.chamber01RibArch)
        .setDisplaySize(760, 344)
        .setTint(0xd2c3ae)
        .setAlpha(0.5)
        .setDepth(-8.2);
    }

    if (this.textures.exists(ASSET_KEYS.sentinel)) {
      this.add
        .image(1960, 398, ASSET_KEYS.sentinel)
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
    this.boss = new HalfSkullMiniboss(this, BLIND_CANTOR.spawnX, BLIND_CANTOR.spawnY, BLIND_CANTOR);
    this.physics.add.collider(this.boss.sprite, this.platforms);
    this.physics.add.overlap(this.player.attackHitbox, this.boss.damageHurtbox ?? this.boss.sprite, this.handlePlayerHitBoss, null, this);
    this.physics.add.overlap(this.player.sprite, this.boss.sprite, this.handleBossContactPlayer, null, this);
    this.boss.setActive(false);
    this.boss.sprite.setVisible(false);
    this.boss.body.enable = false;

    this.bossRewardText = this.add
      .text(this.scale.width / 2, this.scale.height * 0.28, 'BLIND CANTOR\nBANISHED', {
        fontFamily: 'Georgia, Times, serif',
        fontSize: '42px',
        fontStyle: 'bold',
        align: 'center',
        color: '#f4efe5',
        stroke: '#201514',
        strokeThickness: 8,
        shadow: { offsetX: 0, offsetY: 6, color: '#090404', blur: 10, fill: true }
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(34)
      .setAlpha(0)
      .setVisible(false);
  }

  createLoreZones() {
    this.loreZones = this.physics.add.staticGroup();
    LORE_ENTRIES.forEach((entry) => {
      const zone = this.add.zone(entry.x, entry.y, entry.width, entry.height).setOrigin(0.5);
      this.physics.add.existing(zone, true);
      zone.loreEntry = entry;
      this.loreZones.add(zone);
      this.createLoreShrineProp(entry);
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

    if (entry.id === 'end-deadgod' && this.textures.exists(ASSET_KEYS.chamber01DeadgodCutscene)) {
      this.add
        .image(entry.x, baseY - 44, ASSET_KEYS.chamber01DeadgodCutscene)
        .setDisplaySize(162, 120)
        .setTint(0xcab99f)
        .setAlpha(0.56)
        .setDepth(-5.42);
    }

    this.add.ellipse(entry.x, baseY + 5, 136, 42, 0x090606, 0.3).setDepth(-5.4);
  }

  createGate() {
    this.gateBarrier = this.createInvisiblePlatform(CHAMBER.gateX, WORLD.floorY - 86, 84, 236);
    this.gateZone = this.add.zone(CHAMBER.gateX - 84, WORLD.floorY - 76, 168, 220).setOrigin(0.5);
    this.physics.add.existing(this.gateZone, true);

    if (this.textures.exists(ASSET_KEYS.chamber02VertebralHornGate)) {
      this.gateArt = this.add
        .image(CHAMBER.gateX - 12, WORLD.floorY - 122, ASSET_KEYS.chamber02VertebralHornGate)
        .setDisplaySize(228, 288)
        .setCrop(336, 218, 356, 1012)
        .setTint(0xb9aa92)
        .setAlpha(0.64)
        .setDepth(-5.3);
    }

    if (this.textures.exists(ASSET_KEYS.sector02Chamber01Gate)) {
      this.gateFrame = this.add
        .image(CHAMBER.gateX - 12, WORLD.floorY - 120, ASSET_KEYS.sector02Chamber01Gate)
        .setDisplaySize(202, 262)
        .setTint(0xcfbea8)
        .setAlpha(0.52)
        .setDepth(-5.2);
    }

    this.gateSigil = this.add.ellipse(CHAMBER.gateX - 20, WORLD.floorY - 92, 42, 112, COLORS.sickly, 0.1).setDepth(-5.1);
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
      return;
    }

    this.mobileControls.setMode('gameplay');

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

    this.refreshLoreZonePresence();
    this.tryBeginLoreSequence(mobileInput);
    this.refreshGateZonePresence();
    this.tryBeginGateTransition(mobileInput);

    this.updateBossArenaFeedback(time);
    this.directionalCameraBias?.update();
    this.hud.update(this.player.health, this.player.maxHealth);
    this.hud.setBossBarState({
      visible: this.bossEncounterStarted && (!this.bossDefeated || this.bossCeremonyBossBarActive),
      name: BLIND_CANTOR.name,
      subtitle: this.bossCeremonyBossBarActive ? 'CEREMONIAL BANISHMENT' : BLIND_CANTOR.subtitle,
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
    this.gateSigil?.setAlpha(0.16);
    this.gateArt?.setAlpha(0.56).setTint(0xaa9881);
    this.gateFrame?.setAlpha(0.48).setTint(0xa5927a);
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
    enemy.takeDamage(1, this.time.now);
    this.audioDirector?.playPlayerHit();
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

    this.majorEncounterResolution?.begin({
      encounterId: BLIND_CANTOR.encounterId,
      freezePlayer: true,
      disablePlayerAttack: true,
      setResolutionLock: (locked) => {
        this.resolutionLockActive = locked;
      },
      onStart: () => {
        this.hasProcessedBossVictory = true;
        this.bossDefeated = true;
        this.bossCeremonyBossBarActive = true;
        this.boss.setActive(false);
        this.isBossCeremonyActive = true;
        this.bossDeathFlashUntil = this.time.now + BLIND_CANTOR.resolution.preExplosionShakeMs;
        this.playBossCeremonyStart();
      },
      stages: [
        {
          atMs: BLIND_CANTOR.resolution.preExplosionShakeMs,
          run: () => {
            this.stopBossVictoryGoreFountain();
            this.triggerBlindCantorDeathBurst({
              x: this.boss.sprite.x,
              y: (this.boss.sprite.body?.bottom ?? this.boss.sprite.y) - Phaser.Math.Between(96, 138),
              depth: this.boss.sprite.depth + 0.46,
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
              sprayHeight: [16, 42]
            });
            this.majorEncounterResolution?.schedule(BLIND_CANTOR.resolution.explosionFadeStartDelayMs, () => {
              this.startBossExplosionFade();
            });
            this.audioDirector?.playBanishmentSting();
            this.bossRewardText?.setText('BLIND CANTOR\nBANISHED');
            grantMajorEncounterIntegrityReward(this.player, this.integrityRewardTracker, BLIND_CANTOR.encounterId);
            this.audioDirector?.playGateUnlock();
            this.updateGateActivationVisuals();
          }
        },
        {
          atMs: BLIND_CANTOR.resolution.preExplosionShakeMs + BLIND_CANTOR.resolution.postExplosionDespawnDelayMs,
          run: () => {
            this.despawnBossAfterPayoff();
          }
        },
        {
          atMs: BLIND_CANTOR.resolution.ceremonyDurationMs,
          run: () => {
            this.finishBossCeremony();
          }
        }
      ]
    });
  }

  playBossCeremonyStart() {
    this.stabilizeBossCorpseForPayoff();
    this.focusCameraOnBoss();
    this.cameras.main.shake(BLIND_CANTOR.resolution.preExplosionShakeMs, BLIND_CANTOR.resolution.preExplosionShakeIntensity, true);
    this.time.delayedCall(210, () => this.cameras.main.shake(1200, BLIND_CANTOR.resolution.preExplosionShakeIntensity * 0.82, true));
    this.startBossVictoryGoreFountain();
    this.bossRewardText?.setText('CEREMONIAL\nBANISHMENT');

    if (this.bossRewardText) {
      this.tweens.killTweensOf(this.bossRewardText);
      this.bossRewardText.setVisible(true).setAlpha(0).setScale(0.92);
      this.tweens.add({
        targets: this.bossRewardText,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 330,
        ease: 'Cubic.easeOut'
      });
    }
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

  startBossExplosionFade() {
    if (!this.boss?.sprite?.active) {
      return;
    }

    this.tweens.killTweensOf(this.boss.sprite);
    this.tweens.add({
      targets: this.boss.sprite,
      alpha: 0,
      duration: BLIND_CANTOR.resolution.explosionFadeDurationMs,
      ease: 'Sine.easeInOut'
    });
  }

  despawnBossAfterPayoff() {
    if (!this.boss?.sprite) {
      return;
    }

    this.stopBossVictoryGoreFountain();
    spawnEnemyCorpseRemains(this, {
      x: this.boss.sprite.x,
      floorPlaneY: CHAMBER_FLOOR_PLANE_Y,
      depth: this.boss.sprite.depth,
      size: 'sector3Boss'
    });
    this.boss.sprite.setVisible(false).setAlpha(0);
    this.boss.setActive(false);
    this.boss.body?.setEnable(false);
    this.boss.destroyCombatTelegraphs?.();
  }

  startBossVictoryGoreFountain() {
    this.stopBossVictoryGoreFountain();
    if (!this.boss?.sprite?.active) {
      return;
    }

    const spawnFountainBurst = () => {
      if (!this.isBossCeremonyActive || !this.boss?.sprite?.active) {
        return;
      }

      this.triggerBlindCantorDeathBurst({
        x: this.boss.sprite.x + Phaser.Math.Between(-62, 62),
        y: (this.boss.sprite.body?.bottom ?? this.boss.sprite.y) - Phaser.Math.Between(108, 160),
        depth: this.boss.sprite.depth + 0.38,
        scale: Phaser.Math.FloatBetween(0.74, 0.96),
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
        sprayHeight: [14, 38]
      });
    };

    spawnFountainBurst();
    this.bossVictoryGoreFountainTimer = this.time.addEvent({
      delay: BLIND_CANTOR.resolution.goreFountainCadenceMs,
      repeat: Math.ceil(BLIND_CANTOR.resolution.preExplosionShakeMs / BLIND_CANTOR.resolution.goreFountainCadenceMs),
      callback: spawnFountainBurst
    });
  }

  stopBossVictoryGoreFountain() {
    this.bossVictoryGoreFountainTimer?.remove(false);
    this.bossVictoryGoreFountainTimer = null;
  }

  triggerBlindCantorDeathBurst(config = {}) {
    if (!this.boss?.sprite?.active) {
      return;
    }

    triggerSector02BlackOilBlowout(this, {
      source: this.boss.sprite,
      splashColor: 0x8b111c,
      heavyColor: 0x5e0a13,
      highlightColor: 0xb43645,
      redSpeckColor: 0xc84a55,
      mistColor: 0x1d080b,
      alpha: 0.98,
      includeGroundPool: false,
      persistPuddle: false,
      fadeSource: false,
      ...config
    });
  }

  finishBossCeremony() {
    this.stopBossVictoryGoreFountain();
    this.bossCeremonyBossBarActive = false;
    this.hud.setBossBarState({ visible: false });
    this.isBossCeremonyActive = false;

    if (this.bossRewardText) {
      this.tweens.killTweensOf(this.bossRewardText);
      this.tweens.add({
        targets: this.bossRewardText,
        alpha: 0,
        duration: 300,
        ease: 'Cubic.easeIn',
        onComplete: () => this.bossRewardText.setVisible(false)
      });
    }

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
    if (!this.gateSigil) {
      return;
    }

    if (this.canUseGate()) {
      this.gateSigil.setAlpha(0.44);
      this.gateArt?.setAlpha(0.84).setTint(0xd7c8af);
      this.gateFrame?.setAlpha(0.72).setTint(0xe1d3bc);
      return;
    }

    if (this.completedLoreBeats.has('entry-altar')) {
      this.gateSigil.setAlpha(0.16);
      this.gateArt?.setAlpha(0.58).setTint(0xb7a88f);
      this.gateFrame?.setAlpha(0.52).setTint(0xc6b59f);
      return;
    }

    this.gateSigil.setAlpha(0.1);
    this.gateArt?.setAlpha(0.62).setTint(0xb39f85);
    this.gateFrame?.setAlpha(0.48).setTint(0xb6a187);
  }

  beginGateTransitionToChamber02() {
    if (this.isGateTransitionActive) {
      return;
    }

    console.info('[Chamber01->Chamber02] gate transition requested');
    this.isGateTransitionActive = true;
    this.mobileControls.setMode('dialogue');
    this.player.body.setVelocity(0, 0);
    this.enemies.forEach((enemy) => enemy.body?.setVelocity(0, 0));
    this.boss?.body?.setVelocity?.(0, 0);

    this.audioDirector?.stopAmbientLoop({ fadeOut: false });

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      console.info('[Chamber01->Chamber02] fade out complete, starting Chamber02Scene');
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
      this.layoutBossRewardText(width, height, worldBandHeight);
      this.hud?.layout();
      return;
    }

    camera.setViewport(0, 0, width, height);
    camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
    this.directionalCameraBias?.setLayout({ isPortrait: false, followOffsetY: PORTRAIT_LAYOUT.desktopFollowOffsetY });
    this.mobileControls.setReservedBottomPx(0);
    this.restartText?.setPosition(width / 2, 90);
    this.layoutBossRewardText(width, height, height);
    this.hud?.layout();
  }

  layoutBossRewardText(width = this.scale.width, height = this.scale.height, worldBandHeight = height) {
    if (!this.bossRewardText) {
      return;
    }

    const isPortrait = height >= width;
    this.bossRewardText
      .setPosition(width / 2, Math.max(78, worldBandHeight * (isPortrait ? 0.34 : 0.26)))
      .setFontSize(isPortrait ? '28px' : '42px')
      .setStroke('#201514', isPortrait ? 6 : 8)
      .setShadow(0, isPortrait ? 4 : 6, '#090404', isPortrait ? 8 : 10, true, true);
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
