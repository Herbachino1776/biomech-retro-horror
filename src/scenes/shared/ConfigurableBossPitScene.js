import Phaser from 'phaser';
import { Player } from '../../entities/Player.js';
import { EnemyProjectile } from '../../entities/EnemyProjectile.js';
import { PressureDeacon } from '../../entities/PressureDeacon.js';
import { HudOverlay } from '../../ui/HudOverlay.js';
import { MobileControls } from '../../ui/MobileControls.js';
import { AudioDirector } from '../../audio/AudioDirector.js';
import { ASSET_KEYS } from '../../data/assetKeys.js';
import { PLAYER, WORLD } from '../../data/milestone1Config.js';
import { PORTRAIT_LAYOUT } from '../../data/layoutConfig.js';
import { createDirectionalCameraBias } from '../../systems/DirectionalCameraBias.js';
import { restartRunFromDeath } from '../../systems/RunReset.js';
import { triggerSector02BlackOilBlowout } from '../../systems/Sector02BlackOilPayoff.js';
import { spawnEnemyCorpseRemains } from '../../systems/EnemyCorpseRemains.js';
import { grantMajorEncounterIntegrityReward } from '../../systems/VesselRunEconomy.js';
import { MajorEncounterResolution } from '../../systems/MajorEncounterResolution.js';
import { beginBossDeathPayoffPackage } from '../../systems/BossDeathPayoffPackage.js';
import { resolveSceneGameplayFloorY, resolveSceneVisualFloorY } from '../../systems/floorGrounding.js';

export function createBossPitSceneClass(config) {
  const BOSS_PIT_BOOTSTRAP = config.bootstrap;
  const BOSS_PIT_RETURN = config.returnFlow;
  const BOSS_PIT_ALTARS = config.altars;
  const BOSS_PIT_VICTORY = config.victory;
  const BOSS_PIT_ARRIVAL = config.arrival;
  const BOSS_PIT_DEATH_CAMERA = config.deathCamera;
  const BOSS_PIT_PAYOFF_POSE = config.deathPayoffPose;
  const BOSS_PIT_BOSS = config.boss;
  const BOSS_PIT_FLOOR_PLANE_Y = WORLD.floorY + BOSS_PIT_BOOTSTRAP.floorColliderCenterYOffset - BOSS_PIT_BOOTSTRAP.floorColliderHeight / 2;
  class ConfigurableBossPitScene extends Phaser.Scene {
  constructor() {
    super(BOSS_PIT_BOOTSTRAP.sceneKey);
  }

  init(data) {
    this.transitionContext = data ?? {};
    this.startupFailure = null;
    this.startupFailureBackdrop = null;
    this.startupDiagnosticsText = null;
    this.startupStep = 'init';
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
    this.arrivalSequenceActive = false;
    this.arrivalWaitingForLanding = false;
    this.arrivalFadeInComplete = false;
    this.arrivalWaitingForFadeIn = false;
    this.arrivalImpactTriggered = false;
    this.arrivalImpactAt = 0;
    this.arrivalReleaseAt = 0;
    this.arrivalIntimidationSound = null;
    this.hasBossRevealTriggered = false;
    this.hasBossBarBeenRevealed = false;
    this.bossDeathPayoffLocation = null;
    this.deathCameraFocusTween = null;
    this.deathCameraRestoreTween = null;
  }

  create() {
    console.info(`[${BOSS_PIT_BOOTSTRAP.sceneKey}] create start`, this.transitionContext);
    try {
      this.startupStep = 'create-world';
      this.createWorld();
      this.startupStep = 'create-audio';
      this.createAudio();
      this.startupStep = 'create-backdrop';
      this.createBackdrop();
      this.startupStep = 'create-player-and-combat';
      this.createPlayerAndCombat();
      this.startupStep = 'create-ui-and-input';
      this.createUiAndInput();
      this.startupStep = 'major-encounter-resolution';
      this.majorEncounterResolution = new MajorEncounterResolution(this);
      this.startupStep = 'configure-camera-and-layout';
      this.configureCameraAndLayout();
      this.startupStep = 'arrival-beat';
      this.beginArrivalBeat();
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
        this.handleArrivalFadeInComplete();
      });
      this.cameras.main.fadeIn(460, 0, 0, 0);
      this.startupStep = 'ready';
      console.info(`[${BOSS_PIT_BOOTSTRAP.sceneKey}] create complete`);
    } catch (error) {
      this.handleStartupFailure(error);
    }
  }

  handleStartupFailure(error) {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    this.startupFailure = { step: this.startupStep, message };
    console.error(`[${BOSS_PIT_BOOTSTRAP.sceneKey}] startup failed at ${this.startupStep}: ${message}`, error);

    this.cameras.main.setBackgroundColor('#150507');
    this.cameras.main.fadeIn(0, 0, 0, 0);
    this.startupFailureBackdrop = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x150507,
      0.94
    ).setDepth(499).setScrollFactor(0);
    this.startupDiagnosticsText = this.add.text(24, 24,
      `${BOSS_PIT_BOOTSTRAP.sceneKey.toUpperCase()} BOOT FAILURE\nSTEP: ${this.startupStep}\n${message}\n\nPress [R] / [E] to return`,
      {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#f2c5c5',
        lineSpacing: 8,
        wordWrap: { width: Math.max(280, this.scale.width - 48), useAdvancedWrap: true }
      }
    )
      .setDepth(500)
      .setScrollFactor(0);

    const keyboard = this.input?.keyboard;
    if (keyboard) {
      this.keyRestart = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
      this.keyInteract = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.keyEnter = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }
    this.mobileControls?.setMode?.('dead');
  }

  createWorld() {
    this.gameplayFloorY = BOSS_PIT_FLOOR_PLANE_Y;
    this.visualFloorY = BOSS_PIT_FLOOR_PLANE_Y;
    this.physics.world.gravity.y = WORLD.gravityY;
    this.cameras.main.setBounds(0, 0, BOSS_PIT_BOOTSTRAP.worldWidth, WORLD.height);
    this.physics.world.setBounds(0, 0, BOSS_PIT_BOOTSTRAP.worldWidth, WORLD.height);
    this.cameras.main.setBackgroundColor('#030304');
    this.platforms = this.physics.add.staticGroup();
    this.createInvisiblePlatform(
      BOSS_PIT_BOOTSTRAP.worldWidth / 2,
      WORLD.floorY + BOSS_PIT_BOOTSTRAP.floorColliderCenterYOffset,
      BOSS_PIT_BOOTSTRAP.worldWidth,
      BOSS_PIT_BOOTSTRAP.floorColliderHeight
    );
  }

  createAudio() {
    this.audioDirector = new AudioDirector(this);
    if (config.audio?.ambient?.key) {
      this.audioDirector.playAmbientLoop(config.audio.ambient.key, { volume: config.audio.ambient.volume ?? 0.1 });
    }
  }

  createBackdrop() {
    const visualFloorY = this.getVisualFloorY();
    this.add.rectangle(BOSS_PIT_BOOTSTRAP.worldWidth / 2, WORLD.height / 2, BOSS_PIT_BOOTSTRAP.worldWidth, WORLD.height, 0x040304, 1).setDepth(-16);
    if (config.visuals?.backgroundImageKey && this.textures.exists(config.visuals.backgroundImageKey)) {
      this.add.image(BOSS_PIT_BOOTSTRAP.worldWidth / 2, config.visuals.backgroundY ?? 210, config.visuals.backgroundImageKey)
        .setDisplaySize(BOSS_PIT_BOOTSTRAP.worldWidth, config.visuals.backgroundHeight ?? 480)
        .setAlpha(config.visuals.backgroundAlpha ?? 0.9)
        .setDepth(-14.8);
    }
    this.add.rectangle(BOSS_PIT_BOOTSTRAP.worldWidth / 2, visualFloorY - 26, BOSS_PIT_BOOTSTRAP.worldWidth, 120, 0x101010, 0.96).setDepth(-6.2);
    this.add.ellipse(BOSS_PIT_BOOTSTRAP.worldWidth / 2, visualFloorY + 8, BOSS_PIT_BOOTSTRAP.worldWidth, 56, 0x010101, 0.36).setDepth(-5.9);
    this.createPitAltars();
  }

  getGameplayFloorY() {
    return resolveSceneGameplayFloorY(this, BOSS_PIT_FLOOR_PLANE_Y);
  }

  getVisualFloorY() {
    return resolveSceneVisualFloorY(this, this.getGameplayFloorY());
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
    this.physics.add.collider(this.boss.getCollisionTarget?.() ?? this.boss.sprite, this.platforms);
    this.physics.add.overlap(this.player.attackHitbox, this.boss.damageHurtbox ?? this.boss.sprite, () => this.handlePlayerHitBoss());
    this.physics.add.overlap(this.player.sprite, this.boss.getCollisionTarget?.() ?? this.boss.sprite, () => this.handleBossContactPlayer());
  }

  createUiAndInput() {
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
      if (this.arrivalIntimidationSound) {
        if (this.arrivalIntimidationSound.isPlaying) {
          this.arrivalIntimidationSound.stop();
        }
        this.arrivalIntimidationSound.destroy();
        this.arrivalIntimidationSound = null;
      }
      this.audioDirector?.shutdown();
      this.enemyProjectiles.forEach((projectile) => projectile.destroy());
      this.boss?.destroyCombatTelegraphs?.();
      this.victoryGoreFountainTimer?.remove(false);
      this.victoryGoreFountainTimer = null;
      this.majorEncounterResolution?.teardown();
    });
  }

  configureCameraAndLayout() {
    this.cameras.main.startFollow(this.player.sprite, true, BOSS_PIT_BOOTSTRAP.cameraLerp.x, BOSS_PIT_BOOTSTRAP.cameraLerp.y, BOSS_PIT_BOOTSTRAP.desktopFollowOffsetX, 0);

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

  beginArrivalBeat() {
    this.arrivalWaitingForLanding = true;
    this.arrivalSequenceActive = false;
    this.arrivalFadeInComplete = false;
    this.arrivalWaitingForFadeIn = true;
    this.arrivalImpactTriggered = false;
    this.arrivalImpactAt = Number.POSITIVE_INFINITY;
    this.arrivalReleaseAt = Number.POSITIVE_INFINITY;
    this.cameras.main.stopFollow();
    this.cameras.main.setFollowOffset(0, 0);
    this.cameras.main.centerOn(this.player.sprite.x, this.player.sprite.y);
    this.player.attackHitbox?.body?.setEnable(false);
    this.mobileControls?.setMode('dialogue');
    this.setEnemyProjectilesPaused(true);
  }

  handleArrivalFadeInComplete() {
    this.arrivalFadeInComplete = true;
    this.armArrivalImpactAfterFadeIn();
  }

  armArrivalImpactAfterFadeIn() {
    if (!this.arrivalSequenceActive || this.arrivalImpactTriggered) {
      return;
    }
    this.arrivalWaitingForFadeIn = false;
    this.arrivalImpactAt = this.time.now + BOSS_PIT_ARRIVAL.impactDelayAfterFadeInMs;
    this.arrivalReleaseAt = this.arrivalImpactAt + BOSS_PIT_ARRIVAL.lockDurationMs;
  }

  isPlayerGroundedForArrival() {
    const body = this.player?.body;
    if (!body?.enable) {
      return false;
    }
    const touchingGround = Boolean(body.blocked?.down || body.touching?.down);
    const stableVerticalVelocity = Math.abs(body.velocity?.y ?? 0) <= 18;
    return touchingGround && stableVerticalVelocity;
  }

  startArrivalSequenceAfterLanding(time) {
    this.arrivalWaitingForLanding = false;
    this.arrivalSequenceActive = true;
    this.arrivalImpactTriggered = false;
    this.player.body.setVelocity(0, 0);
    this.boss?.body?.setVelocity?.(0, 0);
    if (this.arrivalFadeInComplete) {
      this.arrivalWaitingForFadeIn = false;
      this.arrivalImpactAt = time + BOSS_PIT_ARRIVAL.impactDelayAfterFadeInMs;
      this.arrivalReleaseAt = this.arrivalImpactAt + BOSS_PIT_ARRIVAL.lockDurationMs;
      return;
    }

    this.arrivalWaitingForFadeIn = true;
    this.arrivalImpactAt = Number.POSITIVE_INFINITY;
    this.arrivalReleaseAt = Number.POSITIVE_INFINITY;
  }

  resolveArrivalIntimidationGrowlKey() {
    const audioCache = this.cache?.audio;
    if (!audioCache) {
      return null;
    }

    if (audioCache.exists(ASSET_KEYS.minibossAttack)) {
      return ASSET_KEYS.minibossAttack;
    }
    if (audioCache.exists(ASSET_KEYS.minibossAttackFallback)) {
      return ASSET_KEYS.minibossAttackFallback;
    }

    return null;
  }

  playArrivalIntimidationGrowl() {
    const key = this.resolveArrivalIntimidationGrowlKey();
    if (!key || !this.sound || this.sound.mute) {
      return;
    }

    if (this.arrivalIntimidationSound) {
      if (this.arrivalIntimidationSound.isPlaying) {
        this.arrivalIntimidationSound.stop();
      }
      this.arrivalIntimidationSound.destroy();
      this.arrivalIntimidationSound = null;
    }

    const sound = this.sound.add(key, { volume: BOSS_PIT_ARRIVAL.intimidationGrowlVolume });
    this.arrivalIntimidationSound = sound;
    sound.once('complete', () => {
      sound.destroy();
      if (this.arrivalIntimidationSound === sound) {
        this.arrivalIntimidationSound = null;
      }
    });
    sound.play();
  }

  runArrivalBeat(time) {
    this.player.body.setVelocity(0, 0);
    this.boss?.body?.setVelocity?.(0, 0);
    this.setEnemyProjectilesPaused(true);
    this.cameras.main.centerOn(this.player.sprite.x, this.player.sprite.y);

    if (!this.arrivalImpactTriggered && time >= this.arrivalImpactAt) {
      this.arrivalImpactTriggered = true;
      this.cameras.main.shake(BOSS_PIT_ARRIVAL.shakeDurationMs, BOSS_PIT_ARRIVAL.shakeIntensity, true);
      this.tweens.killTweensOf(this.cameras.main);
      this.cameras.main.centerOn(this.player.sprite.x, this.player.sprite.y);
      this.tweens.add({
        targets: this.cameras.main,
        zoom: this.getGameplayZoom() * BOSS_PIT_ARRIVAL.intimidationZoomMultiplier,
        duration: BOSS_PIT_ARRIVAL.intimidationZoomInDurationMs,
        ease: 'Sine.easeOut'
      });
      this.playArrivalIntimidationGrowl();
    }

    if (time >= this.arrivalReleaseAt) {
      this.arrivalSequenceActive = false;
      this.arrivalWaitingForFadeIn = false;
      this.tweens.killTweensOf(this.cameras.main);
      this.cameras.main.startFollow(
        this.player.sprite,
        true,
        BOSS_PIT_BOOTSTRAP.cameraLerp.x,
        BOSS_PIT_BOOTSTRAP.cameraLerp.y,
        BOSS_PIT_BOOTSTRAP.desktopFollowOffsetX,
        0
      );
      this.tweens.add({
        targets: this.cameras.main,
        zoom: this.getGameplayZoom(),
        duration: BOSS_PIT_ARRIVAL.zoomReturnDurationMs,
        ease: 'Sine.easeInOut'
      });
      this.player.attackHitbox?.body?.setEnable(true);
      this.mobileControls?.setMode('gameplay');
    }
  }

  update(time) {
    if (this.startupFailure) {
      const mobileInput = this.mobileControls?.getInputState?.() ?? {};
      const returnPressed = Boolean(
        (this.keyRestart && Phaser.Input.Keyboard.JustDown(this.keyRestart))
        || (this.keyInteract && Phaser.Input.Keyboard.JustDown(this.keyInteract))
        || (this.keyEnter && Phaser.Input.Keyboard.JustDown(this.keyEnter))
        || mobileInput.interactPressed
      );
      if (returnPressed && !this.returnTransitionActive) {
        this.returnTransitionActive = true;
        this.scene.start(BOSS_PIT_RETURN.returnSceneKey, {
          fromScene: this.scene.key,
          returnFromBossPit: false,
          bossPitBootFailed: true,
          bossPitFailureStep: this.startupFailure.step,
          bossPitFailureMessage: this.startupFailure.message
        });
      }
      return;
    }

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
    if (this.arrivalSequenceActive) {
      this.mobileControls.setMode('dialogue');
      this.runArrivalBeat(time);
      this.refreshBossBar(time);
      this.hud.update(this.player.health, this.player.maxHealth);
      return;
    }
    if (this.arrivalWaitingForLanding) {
      this.mobileControls.setMode('dialogue');
      this.setEnemyProjectilesPaused(true);
      this.cameras.main.stopFollow();
      this.cameras.main.setFollowOffset(0, 0);
      this.player.body.setVelocityX(0);
      this.boss?.body?.setVelocity?.(0, 0);
      this.cameras.main.centerOn(this.player.sprite.x, this.player.sprite.y);
      if (this.isPlayerGroundedForArrival()) {
        this.startArrivalSequenceAfterLanding(time);
      }
      this.refreshBossBar(time);
      this.hud.update(this.player.health, this.player.maxHealth);
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
    this.tryTriggerBossReveal();
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
    if (this.hasProcessedBossPitVictory || this.majorEncounterResolution?.isResolutionActive(config.encounterId)) {
      return;
    }

    beginBossDeathPayoffPackage({
      scene: this,
      encounterId: config.encounterId,
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
        cameraLerp: BOSS_PIT_BOOTSTRAP.cameraLerp,
        followOffsetX: BOSS_PIT_BOOTSTRAP.desktopFollowOffsetX,
        followOffsetY: 0,
        zoom: this.getGameplayZoom(),
        onRestored: () => this.applyResponsiveLayout()
      },
      deathCamera: BOSS_PIT_DEATH_CAMERA,
      payoffPose: {
        floorPlaneY: this.getGameplayFloorY(),
        maxUpwardSnapPx: BOSS_PIT_PAYOFF_POSE.maxUpwardSnapPx
      },
      corpseRemains: {
        floorPlaneY: this.getGameplayFloorY(),
        size: 'bossPitBoss'
      },
      victory: {
        preExplosionShakeMs: BOSS_PIT_VICTORY.preExplosionShakeMs,
        preExplosionShakeIntensity: BOSS_PIT_VICTORY.preExplosionShakeIntensity,
        explosionFadeStartDelayMs: BOSS_PIT_VICTORY.explosionFadeStartDelayMs,
        explosionFadeDurationMs: BOSS_PIT_VICTORY.explosionFadeDurationMs,
        postExplosionDespawnDelayMs: BOSS_PIT_VICTORY.postExplosionDespawnDelayMs,
        goreFountainCadenceMs: BOSS_PIT_VICTORY.goreFountainCadenceMs,
        fountainBurst: {
          xJitter: [-58, 58],
          yFromBottom: [104, 156],
          depthOffset: 0.38,
          randomScale: [0.7, 0.92],
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
          mistColor: 0x1e090d
        },
        blowoutBurst: {
          yFromBottom: [90, 126],
          depthOffset: 0.46,
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
          mistColor: 0x1d080b
        }
      },
      onStart: () => {
        this.hasProcessedBossPitVictory = true;
        this.victorySequenceActive = true;
        config.runState.markCompleted?.();
      },
      onPreExplosion: () => {
        if (!config.runState.hasRewardGranted?.()) {
          const rewarded = grantMajorEncounterIntegrityReward(this.player, this.integrityRewardTracker, config.rewardGrantId);
          if (rewarded) {
            config.runState.markRewardGranted?.();
          }
        }
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

    const payoffX = this.boss.sprite.x;
    const payoffGroundY = this.getGameplayFloorY();
    const groundedPayoffY = payoffGroundY - this.boss.sprite.displayHeight * (1 - this.boss.sprite.originY);
    const maxRaisedY = this.boss.sprite.y - BOSS_PIT_PAYOFF_POSE.maxUpwardSnapPx;
    const payoffY = Math.max(groundedPayoffY, maxRaisedY);

    this.tweens.killTweensOf(this.boss.sprite);
    this.boss.body?.setVelocity?.(0, 0);
    this.boss.body?.setAcceleration?.(0, 0);

    this.boss.sprite
      .setAlpha(1)
      .setVisible(true)
      .setX(payoffX)
      .setY(payoffY);

    this.bossDeathPayoffLocation = {
      x: payoffX,
      y: payoffY,
      groundY: payoffGroundY
    };
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
    const remainsX = this.bossDeathPayoffLocation?.x ?? this.boss.sprite.x;
    const remainsGroundY = this.bossDeathPayoffLocation?.groundY
      ?? this.getGameplayFloorY();
    spawnEnemyCorpseRemains(this, {
      x: remainsX,
      floorPlaneY: remainsGroundY,
      depth: this.boss.sprite.depth,
      size: 'bossPitBoss'
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
      zoom: this.getGameplayZoom(),
      duration: BOSS_PIT_DEATH_CAMERA.zoomOutDurationMs,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.applyResponsiveLayout();
      }
    });
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
    if (!this.hasBossBarBeenRevealed && this.hasBossRevealTriggered) {
      this.hasBossBarBeenRevealed = true;
    }

    this.hud.setBossBarState({
      visible: this.hasBossBarBeenRevealed && !this.boss.dead,
      name: BOSS_PIT_BOSS.name,
      subtitle: BOSS_PIT_BOSS.subtitle,
      current: this.boss.health,
      max: this.boss.maxHealth,
      telegraph: this.boss.getTelegraphProgress(time),
      wounded: time < this.boss.hurtUntil
    });
  }

  tryTriggerBossReveal() {
    if (this.hasBossRevealTriggered || this.arrivalSequenceActive || this.boss.dead || this.boss.active) {
      return;
    }
    if (!this.isBossRevealEligible()) {
      return;
    }

    this.hasBossRevealTriggered = true;
    this.boss.setActive(true);
  }

  isBossRevealEligible() {
    if (!this.boss?.sprite?.active) {
      return false;
    }

    const worldView = this.cameras.main.worldView;
    const padding = BOSS_PIT_BOSS.revealViewportPadding ?? 72;
    const revealRect = new Phaser.Geom.Rectangle(
      worldView.x + padding,
      worldView.y + padding,
      Math.max(1, worldView.width - padding * 2),
      Math.max(1, worldView.height - padding * 2)
    );
    const bossX = this.boss.sprite.x;
    const bossY = this.boss.sprite.body?.center?.y ?? this.boss.sprite.y;
    return Phaser.Geom.Rectangle.Contains(revealRect, bossX, bossY);
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
    const visualFloorY = this.getVisualFloorY();
    BOSS_PIT_ALTARS.presentation.forEach((altarConfig) => {
      this.add.rectangle(altarConfig.x, visualFloorY - 10, altarConfig.width + 82, 18, 0x080707, 0.8).setDepth(-6.16);
      this.add.ellipse(altarConfig.x, visualFloorY - 18, altarConfig.width + 42, 26, 0x1b1714, 0.24).setDepth(-6.12);
      this.add.ellipse(altarConfig.x, visualFloorY + 8, altarConfig.width + 152, 36, 0x010101, 0.34).setDepth(-6.04);

      const primaryKey = altarConfig.id === BOSS_PIT_ALTARS.returnAltarId
        ? BOSS_PIT_ALTARS.returnAltarImageKey
        : BOSS_PIT_ALTARS.altarImageKey;
      const fallbackKey = BOSS_PIT_ALTARS.altarImageFallbackKey ?? BOSS_PIT_ALTARS.altarImageKey;
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

      const zone = this.add.zone(altarConfig.x, visualFloorY - 76, BOSS_PIT_ALTARS.interaction.zoneWidth, BOSS_PIT_ALTARS.interaction.zoneHeight).setOrigin(0.5);
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
      this.applyExitAltarSpriteVisualState(0.98, 0xffffff);
      this.exitAltar.aura?.setAlpha(0.24).setFillStyle(0xd2c28a, 0.26);
      return;
    }

    this.applyExitAltarSpriteVisualState(0.84, 0xf1e4cd);
    this.exitAltar.aura?.setAlpha(0.1).setFillStyle(0x8a7e6d, 0.1);
  }

  applyExitAltarSpriteVisualState(alpha, tint) {
    const sprite = this.exitAltar?.sprite;
    sprite?.setAlpha?.(alpha);
    if (typeof sprite?.setTint === 'function') {
      sprite.setTint(tint);
      return;
    }
    if (typeof sprite?.setFillStyle === 'function') {
      sprite.setFillStyle(tint, alpha);
    }
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

    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, `${BOSS_PIT_BOOTSTRAP.sceneKey}MobileUiCamera`);
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

    this.restartText.setPosition(width / 2, Math.max(76, height * 0.2));
    this.mobileControls.layout();
  }

  getGameplayZoom() {
    const width = this.scale.width;
    const height = this.scale.height;
    const isPortraitMobile = this.mobileControls.enabled && height >= width;
    return isPortraitMobile ? PORTRAIT_LAYOUT.portraitZoom : PORTRAIT_LAYOUT.desktopZoom;
  }
  }

  return ConfigurableBossPitScene;
}
