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
import { restartRunFromDeath } from '../systems/RunReset.js';
import { triggerSector02BlackOilBlowout } from '../systems/Sector02BlackOilPayoff.js';
import { grantMajorEncounterIntegrityReward } from '../systems/VesselRunEconomy.js';
import { bossPitRunState } from '../systems/BossPitRunState.js';

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
const BOSS_PIT_VICTORY = {
  preExplosionShakeMs: 3000,
  preExplosionShakeIntensity: 0.0058,
  goreFountainCadenceMs: 140,
  explosionFadeDurationMs: 320,
  postExplosionDespawnDelayMs: 320,
  fadeOutDurationMs: 1300,
  fadeOutDelayMs: 780
};

const BOSS_PIT_BOSS = {
  name: 'THE HORN GATE WITNESS',
  subtitle: 'Pitbound Litigator',
  spawnX: 960,
  spawnY: WORLD.floorY - 2,
  activationX: 760,
  textureKey: ASSET_KEYS.bossPit01TheHornGateWitness,
  health: 9,
  contactDamage: 2,
  contactDamageCooldownMs: 1000,
  attackCooldownMs: 3520,
  attackTelegraphMs: 820,
  attackRecoveryMs: 720,
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
  poise: { max: 6, recoverDelayMs: 1800, recoverPerSecond: 1.1, staggerDurationMs: 2100, finisherRange: 148 },
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
    windupMs: 1240,
    activeMs: 140,
    recoveryMs: 980,
    minRange: 120,
    maxRange: 390,
    radius: 128,
    damage: 1,
    yTolerance: 150
  },
  projectile: {
    textureKey: ASSET_KEYS.sector02PressureShardProjectile,
    cooldownMs: 4020,
    windupMs: 840,
    recoveryMs: 930,
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
    this.enemyProjectiles = [];
    this.enemyProjectilesPaused = false;
    this.integrityRewardTracker = new Set();
    this.returnFadeFallbackTimer = null;
    this.victoryGoreFountainTimer = null;
  }

  create() {
    this.createWorld();
    this.createAudio();
    this.createBackdrop();
    this.createPlayerAndCombat();
    this.createUiAndInput();
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
      this.returnFadeFallbackTimer?.remove(false);
      this.returnFadeFallbackTimer = null;
    });
  }

  configureCameraAndLayout() {
    this.cameras.main.startFollow(this.player.sprite, true, BOSS_PIT_BOOTSTRAP.cameraLerp.x, BOSS_PIT_BOOTSTRAP.cameraLerp.y, -128, 0);
    this.scale.on('resize', this.applyResponsiveLayout, this);
    this.applyResponsiveLayout();
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
    if (this.victorySequenceActive) {
      this.mobileControls.setMode('dialogue');
      this.player.body.setVelocity(0, 0);
      this.boss?.body?.setVelocity?.(0, 0);
      this.setEnemyProjectilesPaused(true);
      this.refreshBossBar(time);
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
    this.refreshBossBar(time);
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
    if (this.hasProcessedBossPitVictory) {
      return;
    }

    this.hasProcessedBossPitVictory = true;
    this.victorySequenceActive = true;
    this.player.body.setVelocity(0, 0);
    this.player.body.setEnable(false);
    this.player.attackHitbox?.body?.setEnable(false);
    this.setEnemyProjectilesPaused(true);
    bossPitRunState.markSector02Chamber02BossPitCompleted();
    this.stabilizeBossCorpseForPayoff();
    this.cameras.main.shake(BOSS_PIT_VICTORY.preExplosionShakeMs, BOSS_PIT_VICTORY.preExplosionShakeIntensity, true);
    this.startVictoryGoreFountain();

    this.time.delayedCall(BOSS_PIT_VICTORY.preExplosionShakeMs, () => {
      this.stopVictoryGoreFountain();
      this.startBossExplosionFade();
      triggerSector02BlackOilBlowout(this, {
        source: this.boss.sprite,
        x: this.boss.sprite.x,
        y: (this.boss.sprite.body?.bottom ?? this.boss.sprite.y) - 20,
        depth: this.boss.sprite.depth,
        scale: 1.1
      });
      this.audioDirector?.playBanishmentSting();
      if (!bossPitRunState.hasSector02Chamber02BossPitRewardGranted()) {
        const rewarded = grantMajorEncounterIntegrityReward(this.player, this.integrityRewardTracker, 'sector02-chamber02-bosspit-01-witness');
        if (rewarded) {
          bossPitRunState.markSector02Chamber02BossPitRewardGranted();
        }
      }
      this.time.delayedCall(BOSS_PIT_VICTORY.postExplosionDespawnDelayMs, () => {
        this.despawnBossAfterPayoff();
        this.beginReturnToMainChamber();
      });
    });
  }

  stabilizeBossCorpseForPayoff() {
    if (!this.boss?.sprite?.active) {
      return;
    }

    this.tweens.killTweensOf(this.boss.sprite);
    this.boss.sprite
      .setAlpha(1)
      .setVisible(true)
      .setScale(
        this.boss.baseScaleX * this.boss.config.presentation.scaleX,
        this.boss.baseScaleY * this.boss.config.presentation.scaleY
      )
      .setAngle(0);
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
    this.boss.sprite.setVisible(false).setAlpha(0);
    this.boss.destroyCombatTelegraphs?.();
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
        x: this.boss.sprite.x + Phaser.Math.Between(-40, 40),
        y: (this.boss.sprite.body?.bottom ?? this.boss.sprite.y) - Phaser.Math.Between(88, 118),
        depth: this.boss.sprite.depth + 0.06,
        scale: Phaser.Math.FloatBetween(0.46, 0.62),
        durationMs: 520,
        burstCount: 34,
        sprayCount: 48,
        mistCount: 8,
        emberCount: 6,
        burstRadiusX: 92,
        burstRadiusY: 136,
        dropletWidth: [5, 13],
        dropletHeight: [12, 34],
        sprayWidth: [3, 8],
        sprayHeight: [14, 32],
        splashColor: 0x71131d,
        heavyColor: 0x4f1018,
        highlightColor: 0x9a2a35,
        redSpeckColor: 0xb33941,
        mistColor: 0x251011,
        alpha: 0.98,
        persistPuddle: false
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

  beginReturnToMainChamber() {
    if (this.returnTransitionActive) {
      return;
    }

    this.returnTransitionActive = true;
    this.victorySequenceActive = false;
    this.mobileControls.setMode('init');
    this.player.body.setVelocity(0, 0);
    this.player.body.setEnable(false);
    this.player.attackHitbox?.body?.setEnable(false);
    this.audioDirector?.stopAmbientLoop({ fadeOut: false });
    this.sound.play(ASSET_KEYS.loreExit, { volume: 0.78 });

    this.time.delayedCall(BOSS_PIT_VICTORY.fadeOutDelayMs, () => {
      let hasStartedReturnScene = false;
      const startReturnScene = () => {
        if (hasStartedReturnScene) {
          return;
        }
        hasStartedReturnScene = true;
        this.cameras.main.resetFX();
        this.cameras.main.setAlpha(1);
        this.returnFadeFallbackTimer?.remove(false);
        this.returnFadeFallbackTimer = null;
        this.scene.start(BOSS_PIT_RETURN.returnSceneKey, {
          fromScene: this.scene.key,
          returnFromBossPit: true,
          bossPitCompleted: true,
          skipEntryRestore: true,
          returnPlayerX: (this.transitionContext.altarX ?? 960) + BOSS_PIT_RETURN.returnXOffset,
          returnPlayerY: (this.transitionContext.altarY ?? PLAYER.startY) + BOSS_PIT_RETURN.returnYOffset
        });
      };

      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        startReturnScene();
      });
      this.returnFadeFallbackTimer = this.time.delayedCall(BOSS_PIT_VICTORY.fadeOutDurationMs + 120, startReturnScene);
      this.cameras.main.fadeOut(BOSS_PIT_VICTORY.fadeOutDurationMs, 0, 0, 0);
    });
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
      camera.setFollowOffset(BOSS_PIT_BOOTSTRAP.portraitFollowOffsetX, PORTRAIT_LAYOUT.portraitFollowOffsetY);
    } else {
      camera.setViewport(0, 0, width, height);
      camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
      camera.setFollowOffset(BOSS_PIT_BOOTSTRAP.desktopFollowOffsetX, PORTRAIT_LAYOUT.desktopFollowOffsetY);
    }

    this.restartText.setPosition(width / 2, Math.max(76, height * 0.2));
    this.mobileControls.layout();
  }
}
