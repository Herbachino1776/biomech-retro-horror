import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { PressureDeacon } from '../entities/PressureDeacon.js';
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
import { bossPitRunState } from '../systems/BossPitRunState.js';
import { MajorEncounterResolution } from '../systems/MajorEncounterResolution.js';

const BOSS_PIT_BOOTSTRAP = {
  sceneKey: 'Sector03Chamber02BossPitScene',
  worldWidth: 1960,
  spawnX: 364,
  spawnY: PLAYER.startY,
  floorColliderHeight: 72,
  cameraLerp: { x: 0.08, y: 0.08 },
  portraitFollowOffsetX: -112,
  desktopFollowOffsetX: -128
};

const PIT_VARIANTS = {
  bosspit02: {
    name: 'THE STARVED PROPHET OF ASH',
    subtitle: 'Borrowed Mouth Litigant',
    backgroundKey: ASSET_KEYS.bossPit02BackgroundAshProphecyHall,
    bossTextureKey: ASSET_KEYS.bossPit02StarvedProphetOfAsh,
    trapAltarKey: ASSET_KEYS.bossPit02AltarTrap,
    superAltarKey: ASSET_KEYS.bossPit02AltarSuper,
    rewardKey: 'sector03-chamber02-bosspit02-starved-prophet',
    rewardGranted: () => bossPitRunState.hasSector03Chamber02Pit02BossPitRewardGranted(),
    markRewardGranted: () => bossPitRunState.markSector03Chamber02Pit02BossPitRewardGranted(),
    markCompleted: () => bossPitRunState.markSector03Chamber02Pit02BossPitCompleted()
  },
  bosspit03: {
    name: 'THE RED MASK HOLLOW SKY',
    subtitle: 'Sanctum Face-Taker',
    backgroundKey: ASSET_KEYS.bossPit03BackgroundHollowSkyTheatre,
    bossTextureKey: ASSET_KEYS.bossPit03RedMaskHollowSky,
    trapAltarKey: ASSET_KEYS.bossPit02AltarTrap,
    superAltarKey: ASSET_KEYS.bossPit02AltarSuper,
    rewardKey: 'sector03-chamber02-bosspit03-red-mask-hollow-sky',
    rewardGranted: () => bossPitRunState.hasSector03Chamber02Pit03BossPitRewardGranted(),
    markRewardGranted: () => bossPitRunState.markSector03Chamber02Pit03BossPitRewardGranted(),
    markCompleted: () => bossPitRunState.markSector03Chamber02Pit03BossPitCompleted()
  }
};

const BOSS_PIT_BOSS = {
  spawnX: 972,
  spawnY: WORLD.floorY - 2,
  activationX: 740,
  health: 9,
  contactDamage: 2,
  contactDamageCooldownMs: 1100,
  attackCooldownMs: 3000,
  attackTelegraphMs: 680,
  attackRecoveryMs: 620,
  attackRange: 196,
  approachRange: 330,
  approachSpeed: 44,
  idleAdvanceSpeed: 18,
  windupDriftSpeed: 9,
  attackSpeed: 198,
  attackLiftVelocity: -124,
  hitPulseMs: 260,
  hurtRecoverMs: 210,
  hurtRecoilVelocityX: 94,
  hurtRecoilVelocityY: -58,
  body: { width: 92, height: 122, offsetX: 88, offsetY: 152 },
  audioProfile: 'miniboss',
  poise: { max: 5, recoverDelayMs: 1900, recoverPerSecond: 1.1, staggerDurationMs: 2300, finisherRange: 148 },
  presentation: {
    display: { width: 366, height: 384 },
    origin: { x: 0.52, y: 0.986 },
    alpha: 0.99,
    tint: 0xd8c6b0,
    scaleX: 1,
    scaleY: 1
  },
  projectile: {
    textureKey: ASSET_KEYS.sector02PressureShardProjectile,
    cooldownMs: 4400,
    windupMs: 740,
    recoveryMs: 840,
    minRange: 220,
    maxRange: 500,
    verticalTolerance: 156,
    spawnOffsetX: 76,
    spawnOffsetY: -108,
    speed: 244,
    damage: 1,
    lifetimeMs: 1900,
    rotationSpeed: 390,
    telegraphRadiusX: 84,
    telegraphRadiusY: 28
  }
};

const PIT_ALTARS = {
  presentation: [
    { id: 'west-altar', x: 416, y: WORLD.floorY - 102, width: 176, height: 176 },
    { id: 'east-altar', x: 1120, y: WORLD.floorY - 102, width: 176, height: 176 },
    { id: 'return-altar', x: 1550, y: WORLD.floorY - 102, width: 212, height: 212 }
  ],
  interaction: {
    zoneWidth: 196,
    zoneHeight: 212
  }
};


const BOSS_PIT_VICTORY = {
  preExplosionShakeMs: 2900,
  preExplosionShakeIntensity: 0.0059,
  goreFountainCadenceMs: 84,
  explosionFadeStartDelayMs: 90,
  explosionFadeDurationMs: 320,
  postExplosionDespawnDelayMs: 540
};

const BOSS_PIT_DEATH_CAMERA = {
  focusLerp: { x: 0.12, y: 0.12 },
  focusOffsetX: -16,
  focusOffsetY: -26,
  zoomScale: 1.2,
  zoomInDurationMs: 240,
  zoomOutDurationMs: 260
};

export class Sector03Chamber02BossPitScene extends Phaser.Scene {
  constructor() {
    super(BOSS_PIT_BOOTSTRAP.sceneKey);
  }

  init(data) {
    this.transitionContext = data ?? {};
    this.pitVariant = PIT_VARIANTS[this.transitionContext.pitId] ?? PIT_VARIANTS.bosspit02;
    this.returnTransitionActive = false;
    this.isRestartingRun = false;
    this.hasUnlockedExitAltar = false;
    this.enemyProjectiles = [];
    this.enemyProjectilesPaused = false;
    this.currentExitAltar = null;
    this.victorySequenceActive = false;
    this.hasProcessedBossPitVictory = false;
    this.resolutionLockActive = false;
    this.victoryGoreFountainTimer = null;
    this.deathCameraFocusTween = null;
    this.deathCameraRestoreTween = null;
  }

  create() {
    this.physics.world.gravity.y = WORLD.gravityY;
    this.cameras.main.setBounds(0, 0, BOSS_PIT_BOOTSTRAP.worldWidth, WORLD.height);
    this.physics.world.setBounds(0, 0, BOSS_PIT_BOOTSTRAP.worldWidth, WORLD.height);
    this.cameras.main.setBackgroundColor('#020202');
    this.platforms = this.physics.add.staticGroup();
    this.createInvisiblePlatform(BOSS_PIT_BOOTSTRAP.worldWidth / 2, WORLD.floorY + 28, BOSS_PIT_BOOTSTRAP.worldWidth, BOSS_PIT_BOOTSTRAP.floorColliderHeight);

    this.audioDirector = new AudioDirector(this);
    this.audioDirector.playAmbientLoop(ASSET_KEYS.ambientChamber02Loop01, { volume: 0.092 });

    this.createBackdrop();
    this.createCombat();
    this.createUi();
    this.majorEncounterResolution = new MajorEncounterResolution(this);

    this.cameras.main.startFollow(this.player.sprite, true, BOSS_PIT_BOOTSTRAP.cameraLerp.x, BOSS_PIT_BOOTSTRAP.cameraLerp.y, -128, 0);

    this.directionalCameraBias = createDirectionalCameraBias({
      camera: this.cameras.main,
      player: this.player,
      desktopBaseOffsetX: BOSS_PIT_BOOTSTRAP.desktopFollowOffsetX,
      portraitBaseOffsetX: BOSS_PIT_BOOTSTRAP.portraitFollowOffsetX,
      desktopLookAheadX: 44,
      portraitLookAheadX: 18
    });    this.scale.on('resize', this.applyResponsiveLayout, this);
    this.applyResponsiveLayout();
    this.directionalCameraBias?.update();
    this.hud.update(this.player.health, this.player.maxHealth);
    this.cameras.main.fadeIn(420, 0, 0, 0);
  }

  createBackdrop() {
    this.add.rectangle(BOSS_PIT_BOOTSTRAP.worldWidth / 2, WORLD.height / 2, BOSS_PIT_BOOTSTRAP.worldWidth, WORLD.height, 0x050303, 1).setDepth(-16);
    if (this.textures.exists(this.pitVariant.backgroundKey)) {
      this.add.image(BOSS_PIT_BOOTSTRAP.worldWidth / 2, 210, this.pitVariant.backgroundKey)
        .setDisplaySize(BOSS_PIT_BOOTSTRAP.worldWidth, 480)
        .setAlpha(0.88)
        .setDepth(-14.8);
    }
    this.add.rectangle(BOSS_PIT_BOOTSTRAP.worldWidth / 2, WORLD.floorY - 18, BOSS_PIT_BOOTSTRAP.worldWidth, 110, 0x17110e, 0.95).setDepth(-6.2);
    this.add.ellipse(BOSS_PIT_BOOTSTRAP.worldWidth / 2, WORLD.floorY + 10, BOSS_PIT_BOOTSTRAP.worldWidth, 56, 0x010101, 0.36).setDepth(-5.9);
    this.createAltars();
  }

  createCombat() {
    this.player = new Player(this, BOSS_PIT_BOOTSTRAP.spawnX, BOSS_PIT_BOOTSTRAP.spawnY, PLAYER);
    this.physics.add.collider(this.player.sprite, this.platforms);

    this.enemyProjectileGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.physics.add.overlap(this.player.sprite, this.enemyProjectileGroup, (_playerSprite, projectileSprite) => this.handleEnemyProjectileHit(projectileSprite));

    this.boss = new PressureDeacon(this, BOSS_PIT_BOSS.spawnX, BOSS_PIT_BOSS.spawnY, {
      ...BOSS_PIT_BOSS,
      name: this.pitVariant.name,
      subtitle: this.pitVariant.subtitle,
      textureKey: this.pitVariant.bossTextureKey
    });
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

    if (this.returnTransitionActive) {
      this.mobileControls.setMode('dialogue');
      this.player.body.setVelocity(0, 0);
      this.boss?.body?.setVelocity?.(0, 0);
      this.setEnemyProjectilesPaused(true);
      return;
    }

    if (this.victorySequenceActive || this.resolutionLockActive) {
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
    if (!this.boss.dead && !this.boss.active && this.player.sprite.x >= BOSS_PIT_BOSS.activationX) {
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
      this.handleBossPitVictory();
    }
  }

  handleBossPitVictory() {
    const encounterId = `sector03-chamber02-${this.transitionContext.pitId}-bosspit`;
    if (this.hasProcessedBossPitVictory || this.majorEncounterResolution?.isResolutionActive(encounterId)) {
      return;
    }

    this.majorEncounterResolution?.begin({
      encounterId,
      freezePlayer: true,
      disablePlayerAttack: true,
      pauseProjectiles: (paused) => this.setEnemyProjectilesPaused(paused),
      setResolutionLock: (locked) => {
        this.resolutionLockActive = locked;
      },
      onStart: () => {
        this.hasProcessedBossPitVictory = true;
        this.victorySequenceActive = true;
        this.pitVariant.markCompleted();
        this.stabilizeBossCorpseForPayoff();
        this.focusCameraOnBossDeathPayoff();
        this.cameras.main.shake(BOSS_PIT_VICTORY.preExplosionShakeMs, BOSS_PIT_VICTORY.preExplosionShakeIntensity, true);
        this.startVictoryGoreFountain();
      },
      stages: [
        {
          atMs: BOSS_PIT_VICTORY.preExplosionShakeMs,
          run: () => {
            this.stopVictoryGoreFountain();
            triggerSector02BlackOilBlowout(this, {
              source: this.boss.sprite,
              x: this.boss.sprite.x,
              y: (this.boss.sprite.body?.bottom ?? this.boss.sprite.y) - Phaser.Math.Between(94, 132),
              depth: this.boss.sprite.depth + 0.46,
              scale: 1.36,
              durationMs: 760,
              burstCount: 90,
              sprayCount: 116,
              mistCount: 18,
              emberCount: 18,
              burstRadiusX: 152,
              burstRadiusY: 186,
              dropletWidth: [10, 28],
              dropletHeight: [20, 50],
              sprayWidth: [5, 13],
              sprayHeight: [16, 38],
              splashColor: 0x8b111c,
              heavyColor: 0x5e0a13,
              highlightColor: 0xb43645,
              redSpeckColor: 0xc84a55,
              mistColor: 0x1d080b,
              alpha: 0.98,
              includeGroundPool: false,
              persistPuddle: false,
              fadeSource: false
            });
            this.majorEncounterResolution?.schedule(BOSS_PIT_VICTORY.explosionFadeStartDelayMs, () => {
              this.startBossExplosionFade();
            });
            this.audioDirector?.playBanishmentSting();
            if (!this.pitVariant.rewardGranted()) {
              const rewarded = grantMajorEncounterIntegrityReward(this.player, new Set(), this.pitVariant.rewardKey);
              if (rewarded) {
                this.pitVariant.markRewardGranted();
              }
            }
          }
        },
        {
          atMs: BOSS_PIT_VICTORY.preExplosionShakeMs + BOSS_PIT_VICTORY.postExplosionDespawnDelayMs,
          run: () => {
            this.despawnBossAfterPayoff();
          }
        }
      ],
      onComplete: () => {
        this.completeBossPitVictoryState();
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
      .setScale(
        this.boss.baseScaleX * this.boss.config.presentation.scaleX,
        this.boss.baseScaleY * this.boss.config.presentation.scaleY
      )
      .setAngle(0)
      .setY(groundedY);
  }

  focusCameraOnBossDeathPayoff() {
    if (!this.boss?.sprite?.active) {
      return;
    }

    this.deathCameraFocusTween?.remove();
    this.deathCameraRestoreTween?.remove();
    this.cameras.main.startFollow(
      this.boss.sprite,
      true,
      BOSS_PIT_DEATH_CAMERA.focusLerp.x,
      BOSS_PIT_DEATH_CAMERA.focusLerp.y,
      BOSS_PIT_DEATH_CAMERA.focusOffsetX,
      BOSS_PIT_DEATH_CAMERA.focusOffsetY
    );

    this.deathCameraFocusTween = this.tweens.add({
      targets: this.cameras.main,
      zoom: this.cameras.main.zoom * BOSS_PIT_DEATH_CAMERA.zoomScale,
      duration: BOSS_PIT_DEATH_CAMERA.zoomInDurationMs,
      ease: 'Sine.easeOut'
    });
  }

  restoreCameraAfterBossDeathPayoff() {
    this.deathCameraFocusTween?.remove();
    this.deathCameraRestoreTween?.remove();

    this.cameras.main.startFollow(
      this.player.sprite,
      true,
      BOSS_PIT_BOOTSTRAP.cameraLerp.x,
      BOSS_PIT_BOOTSTRAP.cameraLerp.y,
      BOSS_PIT_BOOTSTRAP.desktopFollowOffsetX,
      0
    );

    this.deathCameraRestoreTween = this.tweens.add({
      targets: this.cameras.main,
      zoom: this.mobileControls.enabled && this.scale.height >= this.scale.width ? PORTRAIT_LAYOUT.portraitZoom : 1,
      duration: BOSS_PIT_DEATH_CAMERA.zoomOutDurationMs,
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
      duration: BOSS_PIT_VICTORY.explosionFadeDurationMs,
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
      size: 'large'
    });
    this.boss.sprite.setVisible(false).setAlpha(0);
    this.boss.setActive(false);
    this.boss.body?.setEnable(false);
    this.boss.destroyCombatTelegraphs?.();
  }

  completeBossPitVictoryState() {
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
        x: this.boss.sprite.x + Phaser.Math.Between(-58, 58),
        y: (this.boss.sprite.body?.bottom ?? this.boss.sprite.y) - Phaser.Math.Between(104, 156),
        depth: this.boss.sprite.depth + 0.38,
        scale: Phaser.Math.FloatBetween(0.72, 0.94),
        durationMs: 560,
        burstCount: 54,
        sprayCount: 78,
        mistCount: 7,
        emberCount: 6,
        burstRadiusX: 126,
        burstRadiusY: 170,
        dropletWidth: [8, 20],
        dropletHeight: [18, 44],
        sprayWidth: [4, 11],
        sprayHeight: [14, 36],
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
      delay: BOSS_PIT_VICTORY.goreFountainCadenceMs,
      repeat: Math.ceil(BOSS_PIT_VICTORY.preExplosionShakeMs / BOSS_PIT_VICTORY.goreFountainCadenceMs),
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
    const tookDamage = this.player.receiveDamage(BOSS_PIT_BOSS.contactDamage, this.time.now);
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
      name: this.pitVariant.name,
      subtitle: this.pitVariant.subtitle,
      current: this.boss.health,
      max: this.boss.maxHealth,
      telegraph: this.boss.getTelegraphProgress(time),
      wounded: time < this.boss.hurtUntil
    });
  }

  createAltars() {
    PIT_ALTARS.presentation.forEach((altarConfig) => {
      this.add.rectangle(altarConfig.x, WORLD.floorY - 8, altarConfig.width + 82, 18, 0x080707, 0.8).setDepth(-6.16);
      this.add.ellipse(altarConfig.x, WORLD.floorY - 16, altarConfig.width + 42, 26, 0x1b1714, 0.24).setDepth(-6.12);
      this.add.ellipse(altarConfig.x, WORLD.floorY + 10, altarConfig.width + 152, 36, 0x010101, 0.34).setDepth(-6.04);

      const isReturnAltar = altarConfig.id === 'return-altar';
      const altarKey = isReturnAltar ? this.pitVariant.superAltarKey : this.pitVariant.trapAltarKey;
      const sprite = this.textures.exists(altarKey)
        ? this.add.image(altarConfig.x, altarConfig.y, altarKey)
          .setDisplaySize(altarConfig.width, altarConfig.height)
          .setTint(0xffffff)
          .setAlpha(isReturnAltar ? 0.42 : 0.96)
          .setDepth(-6.08)
        : this.add.ellipse(altarConfig.x, altarConfig.y, altarConfig.width * 0.78, altarConfig.height * 0.72, 0x8b7968, 0.86).setDepth(-6.08);

      const aura = this.add.ellipse(altarConfig.x, altarConfig.y - 4, altarConfig.width * 0.78, altarConfig.height * 0.74, 0xb9ac98, isReturnAltar ? 0.04 : 0.16).setDepth(-6.06);

      if (!isReturnAltar) {
        return;
      }
      const zone = this.add.zone(altarConfig.x, WORLD.floorY - 74, PIT_ALTARS.interaction.zoneWidth, PIT_ALTARS.interaction.zoneHeight).setOrigin(0.5);
      this.physics.add.existing(zone, true);
      this.exitAltar = { sprite, aura, zone };
    });
    this.updateExitAltarVisualState();
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
      this.exitAltar.aura?.setAlpha(0.22).setFillStyle(0xc2b37f, 0.24);
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
      this.scene.start('Sector03Chamber02Scene', {
        fromScene: this.scene.key,
        returnFromBossPit: true,
        pitId: this.transitionContext.pitId,
        skipEntryRestore: true,
        returnPlayerX: this.transitionContext.returnPlayerX,
        returnPlayerY: this.transitionContext.returnPlayerY
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

    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'Sector03Chamber02BossPitMobileUiCamera');
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
