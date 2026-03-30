import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { EnemyProjectile } from '../entities/EnemyProjectile.js';
import { PressureDeacon } from '../entities/PressureDeacon.js';
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
  sceneKey: 'Sector02Chamber02BossPitScene',
  worldWidth: 1920,
  spawnX: 392,
  spawnY: PLAYER.startY,
  floorColliderHeight: 72,
  cameraLerp: { x: 0.08, y: 0.08 },
  portraitFollowOffsetX: -112,
  desktopFollowOffsetX: -128
};

const BOSS_PIT_RETURN = {
  returnSceneKey: 'Sector02Chamber02Scene',
  returnXOffset: 56,
  returnYOffset: 0
};

const BOSS_PIT_ALTARS = {
  presentation: [
    { id: 'west-watch-altar', x: 430, y: WORLD.floorY - 102, width: 174, height: 174, tint: 0x8a8378, alpha: 0.32 },
    { id: 'east-watch-altar', x: 1110, y: WORLD.floorY - 102, width: 174, height: 174, tint: 0x8f8579, alpha: 0.34 },
    { id: 'return-altar', x: 1530, y: WORLD.floorY - 102, width: 208, height: 208, tint: 0xb7ad9d, alpha: 0.44 }
  ],
  returnAltarId: 'return-altar',
  interaction: {
    zoneWidth: 196,
    zoneHeight: 212,
    promptOffsetY: -170,
    inactivePrompt: '',
    activePrompt: ''
  }
};

const BOSS_PIT_VICTORY = {
  preExplosionShakeMs: 3000,
  preExplosionShakeIntensity: 0.0058,
  goreFountainCadenceMs: 86,
  explosionFadeStartDelayMs: 100,
  explosionFadeDurationMs: 320,
  postExplosionDespawnDelayMs: 560
};

const BOSS_PIT_BOSS = {
  name: 'THE HORN GATE WITNESS',
  subtitle: 'Pitbound Litigator',
  spawnX: 960,
  spawnY: WORLD.floorY - 2,
  activationX: 760,
  textureKey: ASSET_KEYS.bossPit01TheHornGateWitness,
  health: 8,
  contactDamage: 2,
  contactDamageCooldownMs: 1200,
  attackCooldownMs: 3120,
  attackTelegraphMs: 700,
  attackRecoveryMs: 660,
  attackRange: 194,
  approachRange: 324,
  approachSpeed: 42,
  idleAdvanceSpeed: 17,
  windupDriftSpeed: 9,
  attackSpeed: 192,
  attackLiftVelocity: -120,
  hitPulseMs: 260,
  hurtRecoverMs: 210,
  hurtRecoilVelocityX: 92,
  hurtRecoilVelocityY: -56,
  body: { width: 92, height: 122, offsetX: 88, offsetY: 152 },
  audioProfile: 'miniboss',
  poise: { max: 5, recoverDelayMs: 1900, recoverPerSecond: 1.1, staggerDurationMs: 2300, finisherRange: 148 },
  presentation: {
    display: { width: 352, height: 372 },
    origin: { x: 0.52, y: 0.986 },
    alpha: 0.99,
    tint: 0xded8cb,
    scaleX: 1,
    scaleY: 1
  },
  groundBurst: {
    enabled: true,
    cooldownMs: 6900,
    windupMs: 1080,
    activeMs: 140,
    recoveryMs: 860,
    minRange: 120,
    maxRange: 390,
    radius: 128,
    damage: 1,
    yTolerance: 150
  },
  projectile: {
    textureKey: ASSET_KEYS.sector02PressureShardProjectile,
    cooldownMs: 4600,
    windupMs: 760,
    recoveryMs: 860,
    minRange: 220,
    maxRange: 500,
    verticalTolerance: 156,
    spawnOffsetX: 76,
    spawnOffsetY: -108,
    speed: 238,
    damage: 1,
    lifetimeMs: 1900,
    rotationSpeed: 380,
    telegraphRadiusX: 84,
    telegraphRadiusY: 28
  }
};

export class Sector02Chamber02BossPitScene extends Phaser.Scene {
  constructor() {
    super(BOSS_PIT_BOOTSTRAP.sceneKey);
  }

  init(data) {
    this.transitionContext = data ?? {};
    this.isRestartingRun = false;
    this.returnTransitionActive = false;
    this.victorySequenceActive = false;
    this.hasProcessedBossPitVictory = false;
    this.hasUnlockedExitAltar = false;
    this.enemyProjectiles = [];
    this.enemyProjectilesPaused = false;
    this.integrityRewardTracker = new Set();
    this.victoryGoreFountainTimer = null;
    this.pitAltars = [];
    this.exitAltar = null;
    this.currentExitAltar = null;
    this.resolutionLockActive = false;
  }

  create() {
    this.createWorld();
    this.createAudio();
    this.createBackdrop();
    this.createPlayerAndCombat();
    this.createUiAndInput();
    this.majorEncounterResolution = new MajorEncounterResolution(this);
    this.configureCameraAndLayout();
    this.cameras.main.fadeIn(460, 0, 0, 0);
  }

  createWorld() {
    this.physics.world.gravity.y = WORLD.gravityY;
    this.cameras.main.setBounds(0, 0, BOSS_PIT_BOOTSTRAP.worldWidth, WORLD.height);
    this.physics.world.setBounds(0, 0, BOSS_PIT_BOOTSTRAP.worldWidth, WORLD.height);
    this.cameras.main.setBackgroundColor('#030304');
    this.platforms = this.physics.add.staticGroup();
    this.createInvisiblePlatform(BOSS_PIT_BOOTSTRAP.worldWidth / 2, WORLD.floorY + 28, BOSS_PIT_BOOTSTRAP.worldWidth, BOSS_PIT_BOOTSTRAP.floorColliderHeight);
  }

  createAudio() {
    this.audioDirector = new AudioDirector(this);
    this.audioDirector.playAmbientLoop(ASSET_KEYS.ambientChamber02Loop01, { volume: 0.1 });
  }

  createBackdrop() {
    this.add.rectangle(BOSS_PIT_BOOTSTRAP.worldWidth / 2, WORLD.height / 2, BOSS_PIT_BOOTSTRAP.worldWidth, WORLD.height, 0x040304, 1).setDepth(-16);
    if (this.textures.exists(ASSET_KEYS.bossPit01BackgroundHornGate)) {
      this.add.image(BOSS_PIT_BOOTSTRAP.worldWidth / 2, 210, ASSET_KEYS.bossPit01BackgroundHornGate)
        .setDisplaySize(BOSS_PIT_BOOTSTRAP.worldWidth, 480)
        .setAlpha(0.9)
        .setDepth(-14.8);
    }
    this.add.rectangle(BOSS_PIT_BOOTSTRAP.worldWidth / 2, WORLD.floorY - 24, BOSS_PIT_BOOTSTRAP.worldWidth, 120, 0x101010, 0.96).setDepth(-6.2);
    this.add.ellipse(BOSS_PIT_BOOTSTRAP.worldWidth / 2, WORLD.floorY + 10, BOSS_PIT_BOOTSTRAP.worldWidth, 56, 0x010101, 0.36).setDepth(-5.9);
    this.createPitAltars();
  }

  createPlayerAndCombat() {
    this.player = new Player(this, BOSS_PIT_BOOTSTRAP.spawnX, BOSS_PIT_BOOTSTRAP.spawnY, PLAYER);
    this.physics.add.collider(this.player.sprite, this.platforms);

    this.enemyProjectileGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.physics.add.overlap(this.player.sprite, this.enemyProjectileGroup, (_playerSprite, projectileSprite) => {
      this.handleEnemyProjectileHit(projectileSprite);
    });

    this.boss = new PressureDeacon(this, BOSS_PIT_BOSS.spawnX, BOSS_PIT_BOSS.spawnY, BOSS_PIT_BOSS);
    this.boss.setActive(false);
    this.boss.sprite.setDepth(6.2);
    this.physics.add.collider(this.boss.sprite, this.platforms);
    this.physics.add.overlap(this.player.attackHitbox, this.boss.sprite, () => this.handlePlayerHitBoss());
    this.physics.add.overlap(this.player.sprite, this.boss.sprite, () => this.handleBossContactPlayer());
  }

  createUiAndInput() {
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
      this.enemyProjectiles.forEach((projectile) => projectile.destroy());
      this.boss?.destroyCombatTelegraphs?.();
      this.victoryGoreFountainTimer?.remove(false);
      this.victoryGoreFountainTimer = null;
      this.majorEncounterResolution?.teardown();
    });
  }

  configureCameraAndLayout() {
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
    this.refreshExitAltarPresence();
    this.tryUseExitAltar(mobileInput);
    this.enemyProjectiles.forEach((projectile) => projectile.update(time, this.game.loop.delta));
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
    this.spawnBossHitGush();
    if (this.boss.dead) {
      this.handleBossPitVictory();
    }
  }

  handleBossPitVictory() {
    if (this.hasProcessedBossPitVictory || this.majorEncounterResolution?.isResolutionActive('sector02-chamber02-bosspit')) {
      return;
    }

    this.majorEncounterResolution?.begin({
      encounterId: 'sector02-chamber02-bosspit',
      freezePlayer: true,
      disablePlayerAttack: true,
      pauseProjectiles: (paused) => this.setEnemyProjectilesPaused(paused),
      setResolutionLock: (locked) => {
        this.resolutionLockActive = locked;
      },
      onStart: () => {
        this.hasProcessedBossPitVictory = true;
        this.victorySequenceActive = true;
        bossPitRunState.markSector02Chamber02BossPitCompleted();
        this.stabilizeBossCorpseForPayoff();
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
              y: (this.boss.sprite.body?.bottom ?? this.boss.sprite.y) - Phaser.Math.Between(90, 126),
              depth: this.boss.sprite.depth + 0.46,
              scale: 1.34,
              durationMs: 760,
              burstCount: 88,
              sprayCount: 114,
              mistCount: 16,
              emberCount: 16,
              burstRadiusX: 148,
              burstRadiusY: 184,
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
            if (!bossPitRunState.hasSector02Chamber02BossPitRewardGranted()) {
              const rewarded = grantMajorEncounterIntegrityReward(this.player, this.integrityRewardTracker, 'sector02-chamber02-bosspit-01-witness');
              if (rewarded) {
                bossPitRunState.markSector02Chamber02BossPitRewardGranted();
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
      size: 'sector3Boss'
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
        scale: Phaser.Math.FloatBetween(0.7, 0.92),
        durationMs: 560,
        burstCount: 52,
        sprayCount: 76,
        mistCount: 7,
        emberCount: 6,
        burstRadiusX: 124,
        burstRadiusY: 168,
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

  spawnBossHitGush() {
    if (!this.boss?.sprite?.active) {
      return;
    }

    triggerSector02BlackOilBlowout(this, {
      source: this.boss.sprite,
      x: this.boss.sprite.x + Phaser.Math.Between(-32, 32),
      y: (this.boss.sprite.body?.bottom ?? this.boss.sprite.y) - Phaser.Math.Between(64, 104),
      depth: this.boss.sprite.depth + 0.34,
      scale: Phaser.Math.FloatBetween(0.62, 0.82),
      durationMs: 460,
      burstCount: 26,
      sprayCount: 34,
      mistCount: 4,
      emberCount: 3,
      burstRadiusX: 86,
      burstRadiusY: 104,
      dropletWidth: [6, 14],
      dropletHeight: [14, 30],
      sprayWidth: [3, 8],
      sprayHeight: [12, 24],
      splashColor: 0x7d1019,
      heavyColor: 0x4a0a12,
      highlightColor: 0x9f3340,
      redSpeckColor: 0xba4350,
      mistColor: 0x1a080b,
      alpha: 0.97,
      includeGroundPool: false,
      persistPuddle: false,
      fadeSource: false
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

  beginReturnToMainChamber() {
    if (this.returnTransitionActive) {
      return;
    }

    this.returnTransitionActive = true;
    this.mobileControls.setMode('init');
    this.player.body.setVelocity(0, 0);
    this.player.body.setEnable(false);
    this.player.attackHitbox?.body?.setEnable(false);
    this.audioDirector?.stopAmbientLoop({ fadeOut: false });
    this.sound.play(ASSET_KEYS.loreExit, { volume: 0.78 });

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(BOSS_PIT_RETURN.returnSceneKey, {
        fromScene: this.scene.key,
        returnFromBossPit: true,
        bossPitCompleted: true,
        skipEntryRestore: true,
        returnPlayerX: (this.transitionContext.altarX ?? 960) + BOSS_PIT_RETURN.returnXOffset,
        returnPlayerY: (this.transitionContext.altarY ?? PLAYER.startY) + BOSS_PIT_RETURN.returnYOffset
      });
    });
    this.cameras.main.fadeOut(480, 0, 0, 0);
  }

  refreshBossBar(time) {
    this.hud.setBossBarState({
      visible: !this.boss.dead,
      name: BOSS_PIT_BOSS.name,
      subtitle: BOSS_PIT_BOSS.subtitle,
      current: this.boss.health,
      max: this.boss.maxHealth,
      telegraph: this.boss.getTelegraphProgress(time),
      wounded: time < this.boss.hurtUntil
    });
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

  createPitAltars() {
    BOSS_PIT_ALTARS.presentation.forEach((altarConfig) => {
      this.add.rectangle(altarConfig.x, WORLD.floorY - 8, altarConfig.width + 82, 18, 0x080707, 0.8).setDepth(-6.16);
      this.add.ellipse(altarConfig.x, WORLD.floorY - 16, altarConfig.width + 42, 26, 0x1b1714, 0.24).setDepth(-6.12);
      this.add.ellipse(altarConfig.x, WORLD.floorY + 10, altarConfig.width + 152, 36, 0x010101, 0.34).setDepth(-6.04);

      const primaryKey = altarConfig.id === BOSS_PIT_ALTARS.returnAltarId
        ? ASSET_KEYS.bossPit01AltarSuper
        : ASSET_KEYS.bossPit01AltarTrap;
      const fallbackKey = ASSET_KEYS.bossPit01AltarTrap;
      const altarTextureKey = this.textures.exists(primaryKey)
        ? primaryKey
        : this.textures.exists(fallbackKey)
          ? fallbackKey
          : null;

      const sprite = altarTextureKey
        ? this.add.image(altarConfig.x, altarConfig.y, altarTextureKey)
          .setDisplaySize(altarConfig.width, altarConfig.height)
          .setTint(altarConfig.tint)
          .setAlpha(altarConfig.alpha)
          .setDepth(-6.08)
        : this.add.ellipse(altarConfig.x, altarConfig.y + 4, altarConfig.width * 0.82, altarConfig.height * 0.86, 0x7b7164, altarConfig.alpha).setDepth(-6.08);

      const aura = this.add.ellipse(altarConfig.x, altarConfig.y - 4, altarConfig.width * 0.78, altarConfig.height * 0.74, 0xb9ac98, altarConfig.id === BOSS_PIT_ALTARS.returnAltarId ? 0.04 : 0.02)
        .setDepth(-6.06);

      const altarEntry = { ...altarConfig, sprite, aura };
      this.pitAltars.push(altarEntry);
      if (altarConfig.id !== BOSS_PIT_ALTARS.returnAltarId) {
        return;
      }

      const zone = this.add.zone(altarConfig.x, WORLD.floorY - 74, BOSS_PIT_ALTARS.interaction.zoneWidth, BOSS_PIT_ALTARS.interaction.zoneHeight).setOrigin(0.5);
      this.physics.add.existing(zone, true);
      this.exitAltar = { ...altarEntry, zone, prompt: null };
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
      this.exitAltar.sprite?.setAlpha(0.94).setTint(0xd7cab2);
      this.exitAltar.aura?.setAlpha(0.22).setFillStyle(0xc2b37f, 0.24);
      return;
    }

    this.exitAltar.sprite?.setAlpha(0.44).setTint(0x8f8579);
    this.exitAltar.aura?.setAlpha(0.04).setFillStyle(0x6f6559, 0.04);
  }

  refreshExitAltarPresence() {
    this.currentExitAltar = null;
    if (!this.exitAltar?.zone || this.returnTransitionActive || this.victorySequenceActive) {
      this.exitAltar?.prompt?.setVisible(false);
      return;
    }

    this.physics.overlap(this.player.sprite, this.exitAltar.zone, () => {
      this.currentExitAltar = this.exitAltar;
    });

    this.exitAltar?.prompt?.setVisible(false);
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

    this.beginReturnToMainChamber();
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

    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'Sector02Chamber02BossPitMobileUiCamera');
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
      const topLetterbox = Math.floor((height - worldBandHeight) / 2);
      camera.setViewport(0, topLetterbox, width, worldBandHeight);
      camera.setZoom(PORTRAIT_LAYOUT.portraitZoom);
      this.directionalCameraBias?.setLayout({ isPortrait: true, followOffsetY: PORTRAIT_LAYOUT.portraitFollowOffsetY });
    } else {
      camera.setViewport(0, 0, width, height);
      camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
      this.directionalCameraBias?.setLayout({ isPortrait: false, followOffsetY: PORTRAIT_LAYOUT.desktopFollowOffsetY });
    }

    this.restartText.setPosition(width / 2, Math.max(76, height * 0.2));
    this.mobileControls.layout();
  }
}
