import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { FirstRefused } from '../entities/FirstRefused.js';
import { EnemyProjectile } from '../entities/EnemyProjectile.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import { AudioDirector } from '../audio/AudioDirector.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { PLAYER, WORLD } from '../data/milestone1Config.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';
import { createDirectionalCameraBias } from '../systems/DirectionalCameraBias.js';
import { restartRunFromDeath } from '../systems/RunReset.js';
import { triggerSector02BlackOilBlowout } from '../systems/Sector02BlackOilPayoff.js';
import { spawnEnemyCorpseRemains } from '../systems/EnemyCorpseRemains.js';
import { grantMajorEncounterIntegrityReward } from '../systems/VesselRunEconomy.js';
import { MajorEncounterResolution } from '../systems/MajorEncounterResolution.js';
import { beginBossDeathPayoffPackage } from '../systems/BossDeathPayoffPackage.js';

const CHAMBER = {
  sceneKey: 'Sector03Chamber03BossChamberScene',
  worldWidth: 2040,
  spawnX: 344,
  spawnY: PLAYER.startY,
  floorColliderHeight: 72,
  cameraLerp: { x: 0.08, y: 0.08 },
  portraitFollowOffsetX: -112,
  desktopFollowOffsetX: -128,
  rewardKey: 'sector03-chamber03-major-boss-first-refused'
};

const FIRST_REFUSED_BOSS = {
  name: 'THE FIRST REFUSED',
  subtitle: 'Gate Primarch of Nonentry',
  textureKey: ASSET_KEYS.sector03Chamber03BossFirstRefused,
  spawnX: 1090,
  spawnY: WORLD.floorY - 2,
  activationX: 760,
  health: 13,
  contactDamage: 2,
  contactDamageCooldownMs: 1050,
  attackCooldownMs: 2780,
  attackTelegraphMs: 700,
  attackRecoveryMs: 620,
  attackRange: 212,
  approachRange: 370,
  approachSpeed: 48,
  idleAdvanceSpeed: 20,
  windupDriftSpeed: 10,
  attackSpeed: 212,
  attackLiftVelocity: -132,
  hitPulseMs: 290,
  hurtRecoverMs: 240,
  hurtRecoilVelocityX: 108,
  hurtRecoilVelocityY: -68,
  body: { width: 102, height: 132, offsetX: 96, offsetY: 146 },
  audioProfile: 'miniboss',
  poise: { max: 7, recoverDelayMs: 1900, recoverPerSecond: 1.1, staggerDurationMs: 2500, finisherRange: 164 },
  presentation: {
    display: { width: 404, height: 422 },
    origin: { x: 0.52, y: 0.986 },
    alpha: 0.99,
    tint: 0xd8c6b0,
    scaleX: 1,
    scaleY: 1
  },
  projectile: {
    textureKey: ASSET_KEYS.sector02PressureShardProjectile,
    cooldownMs: 4100,
    windupMs: 760,
    recoveryMs: 860,
    minRange: 220,
    maxRange: 540,
    verticalTolerance: 170,
    spawnOffsetX: 80,
    spawnOffsetY: -116,
    speed: 256,
    damage: 1,
    lifetimeMs: 2000,
    rotationSpeed: 400,
    telegraphRadiusX: 88,
    telegraphRadiusY: 30
  }
};

const ALTAR = {
  x: 1634,
  y: WORLD.floorY - 102,
  width: 218,
  height: 218,
  zoneWidth: 210,
  zoneHeight: 218
};

const VICTORY = {
  preExplosionShakeMs: 3400,
  preExplosionShakeIntensity: 0.0076,
  goreFountainCadenceMs: 80,
  explosionFadeStartDelayMs: 120,
  explosionFadeDurationMs: 390,
  postExplosionDespawnDelayMs: 680
};

const DEATH_CAMERA = {
  focusLerp: { x: 0.12, y: 0.12 },
  focusOffsetX: -12,
  focusOffsetY: -28,
  zoomScale: 1.24,
  zoomInDurationMs: 260,
  zoomOutDurationMs: 280
};

export class Sector03Chamber03BossChamberScene extends Phaser.Scene {
  constructor() {
    super(CHAMBER.sceneKey);
  }

  init(data) {
    this.transitionContext = data ?? {};
    this.returnTransitionActive = false;
    this.isRestartingRun = false;
    this.hasUnlockedExitAltar = false;
    this.enemyProjectiles = [];
    this.enemyProjectilesPaused = false;
    this.currentExitAltar = null;
    this.victorySequenceActive = false;
    this.hasProcessedBossVictory = false;
    this.resolutionLockActive = false;
    this.victoryGoreFountainTimer = null;
    this.deathCameraFocusTween = null;
    this.deathCameraRestoreTween = null;
    this.integrityRewardTracker = new Set();
  }

  create() {
    this.physics.world.gravity.y = WORLD.gravityY;
    this.cameras.main.setBounds(0, 0, CHAMBER.worldWidth, WORLD.height);
    this.physics.world.setBounds(0, 0, CHAMBER.worldWidth, WORLD.height);
    this.cameras.main.setBackgroundColor('#020202');
    this.platforms = this.physics.add.staticGroup();
    this.createInvisiblePlatform(CHAMBER.worldWidth / 2, WORLD.floorY + 28, CHAMBER.worldWidth, CHAMBER.floorColliderHeight);

    this.audioDirector = new AudioDirector(this);
    this.audioDirector.playAmbientLoop(ASSET_KEYS.ambientChamber02Loop01, { volume: 0.095 });

    this.createBackdrop();
    this.createCombat();
    this.createUi();
    this.majorEncounterResolution = new MajorEncounterResolution(this);

    this.cameras.main.startFollow(this.player.sprite, true, CHAMBER.cameraLerp.x, CHAMBER.cameraLerp.y, -128, 0);

    this.directionalCameraBias = createDirectionalCameraBias({
      camera: this.cameras.main,
      player: this.player,
      desktopBaseOffsetX: CHAMBER.desktopFollowOffsetX,
      portraitBaseOffsetX: CHAMBER.portraitFollowOffsetX,
      desktopLookAheadX: 44,
      portraitLookAheadX: 18
    });    this.scale.on('resize', this.applyResponsiveLayout, this);
    this.applyResponsiveLayout();
    this.directionalCameraBias?.update();
    this.hud.update(this.player.health, this.player.maxHealth);
    this.cameras.main.fadeIn(420, 0, 0, 0);
  }

  createBackdrop() {
    this.add.rectangle(CHAMBER.worldWidth / 2, WORLD.height / 2, CHAMBER.worldWidth, WORLD.height, 0x050303, 1).setDepth(-16);
    if (this.textures.exists(ASSET_KEYS.sector03Chamber03BackgroundBossArena)) {
      this.add.image(CHAMBER.worldWidth / 2, 210, ASSET_KEYS.sector03Chamber03BackgroundBossArena)
        .setDisplaySize(CHAMBER.worldWidth, 488)
        .setAlpha(0.9)
        .setTint(0xd2c2ad)
        .setDepth(-14.8);
    }
    this.add.rectangle(CHAMBER.worldWidth / 2, WORLD.floorY - 14, CHAMBER.worldWidth, 96, 0x1a1411, 0.95).setDepth(-6.3);
    this.add.rectangle(CHAMBER.worldWidth / 2, WORLD.floorY - 48, CHAMBER.worldWidth, 24, 0x2c2018, 0.76).setDepth(-6.26);
    this.add.ellipse(CHAMBER.worldWidth / 2, WORLD.floorY + 10, CHAMBER.worldWidth, 54, 0x020202, 0.36).setDepth(-5.94);

    const altarKey = ASSET_KEYS.bossPit02AltarSuper;
    const altarSprite = this.textures.exists(altarKey)
      ? this.add.image(ALTAR.x, ALTAR.y, altarKey).setDisplaySize(ALTAR.width, ALTAR.height).setAlpha(0.42).setDepth(-6.08)
      : this.add.ellipse(ALTAR.x, ALTAR.y + 6, 170, 160, 0x8b7968, 0.82).setDepth(-6.08);
    const altarAura = this.add.ellipse(ALTAR.x, ALTAR.y - 4, 162, 152, 0xb9ac98, 0.04).setDepth(-6.06);
    const zone = this.add.zone(ALTAR.x, WORLD.floorY - 74, ALTAR.zoneWidth, ALTAR.zoneHeight).setOrigin(0.5);
    this.physics.add.existing(zone, true);
    this.exitAltar = { sprite: altarSprite, aura: altarAura, zone };
    this.updateExitAltarVisualState();
  }

  createCombat() {
    this.player = new Player(this, CHAMBER.spawnX, CHAMBER.spawnY, PLAYER);
    this.physics.add.collider(this.player.sprite, this.platforms);

    this.enemyProjectileGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.physics.add.overlap(this.player.sprite, this.enemyProjectileGroup, (_playerSprite, projectileSprite) => this.handleEnemyProjectileHit(projectileSprite));

    this.boss = new FirstRefused(this, FIRST_REFUSED_BOSS.spawnX, FIRST_REFUSED_BOSS.spawnY, FIRST_REFUSED_BOSS);
    this.boss.setActive(false);
    this.boss.sprite.setDepth(6.2);
    this.physics.add.collider(this.boss.getCollisionTarget?.() ?? this.boss.sprite, this.platforms);
    this.physics.add.overlap(this.player.attackHitbox, this.boss.damageHurtbox ?? this.boss.sprite, () => this.handlePlayerHitBoss());
    this.physics.add.overlap(this.player.sprite, this.boss.getCollisionTarget?.() ?? this.boss.sprite, () => this.handleBossContactPlayer());
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
      this.enemyProjectiles.forEach((projectile) => projectile.destroy());
      this.victoryGoreFountainTimer?.remove(false);
      this.victoryGoreFountainTimer = null;
      this.deathCameraFocusTween?.remove();
      this.deathCameraRestoreTween?.remove();
      this.majorEncounterResolution?.teardown();
    });
  }

  update(time) {
    const mobileInput = this.mobileControls.getInputState();
    if (this.player.isDead) {
      this.mobileControls.setMode('dead');
      this.restartText.setVisible(true).setText('VESSEL FAILURE\nPress [R] to re-seed chamber');
      this.boss?.body?.setVelocity?.(0, 0);
      this.setEnemyProjectilesPaused(true);
      if ((Phaser.Input.Keyboard.JustDown(this.keyRestart) || mobileInput.interactPressed) && !this.isRestartingRun) {
        this.isRestartingRun = true;
        restartRunFromDeath(this);
      }
      return;
    }

    if (this.returnTransitionActive || this.victorySequenceActive || this.resolutionLockActive) {
      this.mobileControls.setMode('dialogue');
      this.player.body.setVelocity(0, 0);
      this.boss?.body?.setVelocity?.(0, 0);
      this.setEnemyProjectilesPaused(true);
      this.refreshBossBar(time);
      this.directionalCameraBias?.update();
    this.hud.update(this.player.health, this.player.maxHealth);
      return;
    }

    this.restartText.setVisible(false);
    this.mobileControls.setMode('gameplay');
    this.setEnemyProjectilesPaused(false);

    const input = {
      left: this.cursors.left.isDown || mobileInput.left,
      right: this.cursors.right.isDown || mobileInput.right,
      jumpPressed: Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.cursors.space) || mobileInput.jumpPressed,
      attackPressed: Phaser.Input.Keyboard.JustDown(this.keyAttack) || mobileInput.attackPressed
    };

    this.player.update(time, input);
    if (!this.boss.dead && !this.boss.active && this.player.sprite.x >= FIRST_REFUSED_BOSS.activationX) {
      this.boss.setActive(true);
    }
    this.boss.update(time, this.player.sprite);
    this.enemyProjectiles.forEach((projectile) => projectile.update(time, this.game.loop.delta));

    this.refreshExitAltarPresence();
    this.tryUseExitAltar(mobileInput);
    this.refreshBossBar(time);
    this.directionalCameraBias?.update();
    this.hud.update(this.player.health, this.player.maxHealth);
  }

  spawnEnemyProjectile(config) {
    let projectile = this.enemyProjectiles.find((entry) => !entry.active);
    if (!projectile) {
      projectile = new EnemyProjectile(this, {
        speed: config.speed ?? 238,
        damage: config.damage ?? 1,
        lifetimeMs: config.lifetimeMs ?? 1900,
        rotationSpeed: config.rotationSpeed ?? 380,
        bodySize: { width: 28, height: 28 },
        depth: config.depth ?? 6.3,
        presentation: { displayWidth: 42, displayHeight: 42, alpha: 0.98, fallbackFill: 0xc7d4c0, fallbackStroke: 0x67807a },
        impact: { durationMs: 130, alpha: 0.88, scaleMultiplier: 1.18, tint: 0xe0ead2 }
      });
      this.enemyProjectiles.push(projectile);
    }

    projectile.owner = config.owner ?? null;
    projectile.fire(config);
    if (projectile.sprite && !this.enemyProjectileGroup.contains(projectile.sprite)) {
      this.enemyProjectileGroup.add(projectile.sprite);
    }
    if (this.enemyProjectilesPaused) {
      projectile.pauseMotion();
    }
    return projectile;
  }

  handlePlayerHitBoss() {
    if (!this.player.attackActive || this.boss?.dead) {
      return;
    }
    if (this.boss.lastAttackHitId === this.player.attackId) {
      return;
    }

    this.boss.lastAttackHitId = this.player.attackId;
    this.boss.takeDamage(1, this.time.now);
    this.audioDirector?.playPlayerHit();
    if (this.boss.dead) {
      this.handleBossVictory();
    }
  }

  handleBossVictory() {
    const encounterId = 'sector03-chamber03-major-boss';
    if (this.hasProcessedBossVictory || this.majorEncounterResolution?.isResolutionActive(encounterId)) {
      return;
    }

    beginBossDeathPayoffPackage({
      scene: this,
      encounterId,
      majorEncounterResolution: this.majorEncounterResolution,
      bossSprite: this.boss.sprite,
      bossBody: this.boss.body,
      bossActor: this.boss,
      player: this.player,
      pauseProjectiles: (paused) => this.setEnemyProjectilesPaused(paused),
      setResolutionLock: (locked) => {
        this.resolutionLockActive = locked;
      },
      followPlayer: {
        cameraLerp: CHAMBER.cameraLerp,
        followOffsetX: CHAMBER.desktopFollowOffsetX,
        followOffsetY: 0,
        zoom: this.mobileControls.enabled && this.scale.height >= this.scale.width ? PORTRAIT_LAYOUT.portraitZoom : PORTRAIT_LAYOUT.desktopZoom,
        onRestored: () => this.applyResponsiveLayout()
      },
      deathCamera: DEATH_CAMERA,
      payoffPose: {
        floorPlaneY: WORLD.floorY + 2,
        scaleX: this.boss.baseScaleX * this.boss.config.presentation.scaleX,
        scaleY: this.boss.baseScaleY * this.boss.config.presentation.scaleY
      },
      corpseRemains: {
        groundY: WORLD.floorY + 2,
        size: 'sector3Boss'
      },
      victory: {
        preExplosionShakeMs: VICTORY.preExplosionShakeMs,
        preExplosionShakeIntensity: VICTORY.preExplosionShakeIntensity,
        explosionFadeStartDelayMs: VICTORY.explosionFadeStartDelayMs,
        explosionFadeDurationMs: VICTORY.explosionFadeDurationMs,
        postExplosionDespawnDelayMs: VICTORY.postExplosionDespawnDelayMs,
        goreFountainCadenceMs: VICTORY.goreFountainCadenceMs,
        fountainBurst: {
          xJitter: [-66, 66],
          yFromBottom: [110, 170],
          depthOffset: 0.38,
          randomScale: [0.84, 1.08],
          durationMs: 600,
          burstCount: 68,
          sprayCount: 90,
          mistCount: 9,
          emberCount: 8,
          burstRadiusX: 136,
          burstRadiusY: 186,
          dropletWidth: [8, 24],
          dropletHeight: [18, 46],
          sprayWidth: [4, 12],
          sprayHeight: [14, 38],
          splashColor: 0x86111b,
          heavyColor: 0x560b13,
          highlightColor: 0xa23340,
          redSpeckColor: 0xc24753,
          mistColor: 0x1e090d
        },
        blowoutBurst: {
          yFromBottom: [96, 136],
          depthOffset: 0.46,
          scale: 1.5,
          durationMs: 860,
          burstCount: 108,
          sprayCount: 138,
          mistCount: 24,
          emberCount: 20,
          burstRadiusX: 172,
          burstRadiusY: 206,
          dropletWidth: [12, 34],
          dropletHeight: [24, 58],
          sprayWidth: [6, 15],
          sprayHeight: [16, 42],
          splashColor: 0x8b111c,
          heavyColor: 0x5e0a13,
          highlightColor: 0xb43645,
          redSpeckColor: 0xc84a55,
          mistColor: 0x1d080b
        }
      },
      onStart: () => {
        this.hasProcessedBossVictory = true;
        this.victorySequenceActive = true;
      },
      onPreExplosion: () => {
        grantMajorEncounterIntegrityReward(this.player, this.integrityRewardTracker, CHAMBER.rewardKey);
      },
      onComplete: () => {
        this.victorySequenceActive = false;
        this.mobileControls.setMode('gameplay');
        this.unlockExitAltar();
      }
    });
  }

  stabilizeBossCorpseForPayoff() {
    if (!this.boss?.sprite?.active) {
      return;
    }

    const floorBottomY = WORLD.floorY + 2;
    const groundedY = floorBottomY - this.boss.sprite.displayHeight * (1 - this.boss.sprite.originY);
    this.tweens.killTweensOf(this.boss.sprite);
    this.boss.sprite
      .setAlpha(1)
      .setVisible(true)
      .setScale(this.boss.baseScaleX * this.boss.config.presentation.scaleX, this.boss.baseScaleY * this.boss.config.presentation.scaleY)
      .setAngle(0)
      .setY(groundedY);
  }

  focusCameraOnBossDeathPayoff() {
    if (!this.boss?.sprite?.active) {
      return;
    }

    this.deathCameraFocusTween?.remove();
    this.deathCameraRestoreTween?.remove();
    this.cameras.main.startFollow(this.boss.sprite, true, DEATH_CAMERA.focusLerp.x, DEATH_CAMERA.focusLerp.y, DEATH_CAMERA.focusOffsetX, DEATH_CAMERA.focusOffsetY);

    this.deathCameraFocusTween = this.tweens.add({
      targets: this.cameras.main,
      zoom: this.cameras.main.zoom * DEATH_CAMERA.zoomScale,
      duration: DEATH_CAMERA.zoomInDurationMs,
      ease: 'Sine.easeOut'
    });
  }

  restoreCameraAfterBossDeathPayoff() {
    this.deathCameraFocusTween?.remove();
    this.deathCameraRestoreTween?.remove();

    this.cameras.main.startFollow(this.player.sprite, true, CHAMBER.cameraLerp.x, CHAMBER.cameraLerp.y, CHAMBER.desktopFollowOffsetX, 0);

    this.deathCameraRestoreTween = this.tweens.add({
      targets: this.cameras.main,
      zoom: this.mobileControls.enabled && this.scale.height >= this.scale.width ? PORTRAIT_LAYOUT.portraitZoom : PORTRAIT_LAYOUT.desktopZoom,
      duration: DEATH_CAMERA.zoomOutDurationMs,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.applyResponsiveLayout();
      }
    });
  }

  startBossExplosionFade() {
    if (!this.boss?.sprite?.active) {
      return;
    }

    this.tweens.killTweensOf(this.boss.sprite);
    this.tweens.add({
      targets: this.boss.sprite,
      alpha: 0,
      duration: VICTORY.explosionFadeDurationMs,
      ease: 'Sine.easeInOut'
    });
  }

  despawnBossAfterPayoff() {
    if (!this.boss?.sprite) {
      return;
    }

    this.stopVictoryGoreFountain();
    spawnEnemyCorpseRemains(this, {
      x: this.boss.sprite.x,
      groundY: WORLD.floorY + 2,
      depth: this.boss.sprite.depth,
      size: 'sector3Boss'
    });
    this.boss.sprite.setVisible(false).setAlpha(0);
    this.boss.setActive(false);
    this.boss.body?.setEnable(false);
    this.boss.destroyCombatTelegraphs?.();
  }

  completeBossVictoryState() {
    this.victorySequenceActive = false;
    this.player.body.setEnable(true);
    this.player.body.setVelocity(0, 0);
    this.player.attackHitbox?.body?.setEnable(true);
    this.mobileControls.setMode('gameplay');
    this.restoreCameraAfterBossDeathPayoff();
    this.unlockExitAltar();
  }

  startVictoryGoreFountain() {
    this.stopVictoryGoreFountain();
    if (!this.boss?.sprite?.active) {
      return;
    }

    const spawnFountainBurst = () => {
      if (!this.victorySequenceActive || !this.boss?.sprite?.active) {
        return;
      }

      triggerSector02BlackOilBlowout(this, {
        source: this.boss.sprite,
        x: this.boss.sprite.x + Phaser.Math.Between(-66, 66),
        y: (this.boss.sprite.body?.bottom ?? this.boss.sprite.y) - Phaser.Math.Between(110, 170),
        depth: this.boss.sprite.depth + 0.38,
        scale: Phaser.Math.FloatBetween(0.84, 1.08),
        durationMs: 600,
        burstCount: 68,
        sprayCount: 90,
        mistCount: 9,
        emberCount: 8,
        burstRadiusX: 136,
        burstRadiusY: 186,
        dropletWidth: [8, 24],
        dropletHeight: [18, 46],
        sprayWidth: [4, 12],
        sprayHeight: [14, 38],
        splashColor: 0x86111b,
        heavyColor: 0x560b13,
        highlightColor: 0xa23340,
        redSpeckColor: 0xc24753,
        mistColor: 0x1e090d,
        alpha: 0.98,
        includeGroundPool: false,
        persistPuddle: false,
        fadeSource: false
      });
    };

    spawnFountainBurst();
    this.victoryGoreFountainTimer = this.time.addEvent({
      delay: VICTORY.goreFountainCadenceMs,
      repeat: Math.ceil(VICTORY.preExplosionShakeMs / VICTORY.goreFountainCadenceMs),
      callback: spawnFountainBurst
    });
  }

  stopVictoryGoreFountain() {
    this.victoryGoreFountainTimer?.remove(false);
    this.victoryGoreFountainTimer = null;
  }

  handleBossContactPlayer() {
    if (this.boss?.dead || !this.boss.canDealContactDamage(this.time.now)) {
      return;
    }
    const tookDamage = this.player.receiveDamage(FIRST_REFUSED_BOSS.contactDamage, this.time.now);
    if (tookDamage) {
      this.boss.recordContactDamage(this.time.now);
      const knockDirection = Math.sign(this.player.sprite.x - this.boss.sprite.x) || 1;
      this.player.body.setVelocityX(knockDirection * 240);
      this.player.body.setVelocityY(-220);
    }
  }

  handleEnemyProjectileHit(projectileSprite) {
    const projectile = this.enemyProjectiles.find((entry) => entry.sprite === projectileSprite || projectileSprite?.gameObject === entry.sprite);
    if (!projectile?.active || projectile.inImpact || !this.player?.sprite?.body?.enable) {
      return;
    }

    const impactX = Phaser.Math.Clamp(this.player.body.center.x, this.player.body.left + 8, this.player.body.right - 8);
    const impactY = this.player.body.center.y - this.player.body.height * 0.1;
    const tookDamage = this.player.receiveDamage(projectile.damage ?? 1, this.time.now);
    projectile.playImpact(impactX, impactY);
    if (!tookDamage) {
      return;
    }

    const knockDirection = Math.sign(this.player.sprite.x - projectile.sprite.x) || 1;
    this.player.body.setVelocityX(knockDirection * 210);
    this.player.body.setVelocityY(-196);
  }

  refreshBossBar(time) {
    this.hud.setBossBarState({
      visible: !this.boss.dead && this.boss.active,
      name: FIRST_REFUSED_BOSS.name,
      subtitle: FIRST_REFUSED_BOSS.subtitle,
      current: this.boss.health,
      max: this.boss.maxHealth,
      telegraph: this.boss.getTelegraphProgress(time),
      wounded: time < this.boss.hurtUntil
    });
  }

  unlockExitAltar() {
    if (this.hasUnlockedExitAltar) {
      return;
    }
    this.hasUnlockedExitAltar = true;
    this.updateExitAltarVisualState();
    this.sound.play(ASSET_KEYS.gateUnlock, { volume: 0.6 });
  }

  updateExitAltarVisualState() {
    if (!this.exitAltar) {
      return;
    }

    if (this.hasUnlockedExitAltar) {
      this.exitAltar.sprite?.setAlpha(0.96).setTint(0xffffff);
      this.exitAltar.aura?.setAlpha(0.24).setFillStyle(0xc2b37f, 0.24);
      return;
    }

    this.exitAltar.sprite?.setAlpha(0.42).setTint(0x85796d);
    this.exitAltar.aura?.setAlpha(0.04).setFillStyle(0x6f6559, 0.04);
  }

  refreshExitAltarPresence() {
    this.currentExitAltar = null;
    if (!this.exitAltar?.zone || this.returnTransitionActive) {
      return;
    }

    this.physics.overlap(this.player.sprite, this.exitAltar.zone, () => {
      this.currentExitAltar = this.exitAltar;
    });
  }

  tryUseExitAltar(mobileInput) {
    if (!this.hasUnlockedExitAltar || !this.currentExitAltar) {
      return;
    }

    const interactPressed = Phaser.Input.Keyboard.JustDown(this.keyInteract)
      || Phaser.Input.Keyboard.JustDown(this.keyEnter)
      || mobileInput.interactPressed;
    if (!interactPressed) {
      return;
    }

    this.returnTransitionActive = true;
    this.audioDirector?.stopAmbientLoop({ fadeOut: false });
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('Sector04Chamber01Scene', {
        fromScene: this.scene.key,
        enteredFrom: 'sector03-chamber03-final-altar',
        progressionSource: 'gate-of-refusal-final-altar',
        fromGate: 'gate-of-refusal-final-altar',
        sectorLabel: 'SECTOR IV'
      });
    });
    this.cameras.main.fadeOut(420, 0, 0, 0);
  }

  setEnemyProjectilesPaused(paused) {
    this.enemyProjectilesPaused = paused;
    this.enemyProjectiles.forEach((projectile) => {
      if (!projectile.active) {
        return;
      }
      if (paused) {
        projectile.pauseMotion();
      } else {
        projectile.resumeMotion();
      }
    });
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

    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'Sector03Chamber03BossChamberMobileUiCamera');
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
      const topLetterbox = Math.floor((height - worldBandHeight) / 2);
      camera.setViewport(0, topLetterbox, width, worldBandHeight);
      camera.setZoom(PORTRAIT_LAYOUT.portraitZoom);
      this.directionalCameraBias?.setLayout({ isPortrait: true, followOffsetY: PORTRAIT_LAYOUT.portraitFollowOffsetY });
    } else {
      camera.setViewport(0, 0, width, height);
      camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
      this.directionalCameraBias?.setLayout({ isPortrait: false, followOffsetY: PORTRAIT_LAYOUT.desktopFollowOffsetY });
    }

    this.hud?.layout();
  }
}
