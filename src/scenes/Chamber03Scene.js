import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { SkitterServitor } from '../entities/SkitterServitor.js';
import { PrecentorBoss } from '../entities/PrecentorBoss.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';
import { restartRunFromDeath } from '../systems/RunReset.js';
import { AudioDirector } from '../audio/AudioDirector.js';
import { CHAMBER03_ACTIVE_TEXTURE_KEYS, CHAMBER03_TEXTURE_ASSET_KEYS, queueMissingTextureAssets, pruneUnusedTextures } from '../data/sceneAssetPlan.js';
import {
  CHAMBER03_BOSS,
  CHAMBER03_BOSS_ARENA,
  CHAMBER03_ELITE_CONFIG,
  CHAMBER03_ENCOUNTERS,
  CHAMBER03_RUNTIME,
  CHAMBER03_SEGMENT_LAYOUT,
  CHAMBER03_SKITTER_CONFIG,
  CHAMBER03_THRESHOLD_LORE,
  CHAMBER03_WORLD_WIDTH
} from '../data/chamber03Config.js';

const { world: WORLD, player: PLAYER, colors: COLORS } = CHAMBER03_RUNTIME;

export class Chamber03Scene extends Phaser.Scene {
  constructor() {
    super('Chamber03Scene');
  }

  preload() {
    queueMissingTextureAssets(this, CHAMBER03_TEXTURE_ASSET_KEYS);
  }

  init(data) {
    this.transitionContext = data ?? {};
  }

  create() {
    pruneUnusedTextures(this, CHAMBER03_ACTIVE_TEXTURE_KEYS);
    this.resetStartupState();
    this.createSceneRuntimeState();
    this.createSceneBounds();
    this.createCoreScene();
    this.establishInitialCameraFrame();

    this.audioDirector = new AudioDirector(this);
    this.audioDirector.playAmbientLoop(ASSET_KEYS.ambientChamber02Loop01, { volume: 0.14 });

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
    this.createBossUi();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyAttack = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.keyInteract = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keyRestart = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.bootstrapOptionalSystems();
    this.scale.on('resize', this.applyResponsiveLayout, this);
    this.game.events.on('lore-cutscene-complete', this.handleLoreCutsceneComplete, this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.applyResponsiveLayout, this);
      this.game.events.off('lore-cutscene-complete', this.handleLoreCutsceneComplete, this);
      this.audioDirector?.shutdown();
      this.bossRewardTimer?.remove(false);
      this.cleanupSceneUi();
    });

    this.applyResponsiveLayout();
    this.hud.update(this.player.health, PLAYER.maxHealth);
  }

  resetStartupState() {
    this.input.enabled = true;
    this.physics.world.resume();
    this.physics.world.gravity.y = WORLD.gravityY;
    this.physics.world.timeScale = 1;
    this.time.timeScale = 1;
    this.cameras.main.stopFollow();
    this.cameras.main.resetFX();
    this.cameras.main.setAlpha(1);
    this.cameras.main.clearRenderToTexture();
    this.cameras.main.setBackgroundColor('#050505');
    this.cameras.main.fadeIn(750, 0, 0, 0);
  }

  createSceneRuntimeState() {
    this.platforms = this.physics.add.staticGroup();
    this.loreZones = this.physics.add.staticGroup();
    this.enemies = [];
    this.triggeredLoreIds = new Set();
    this.currentLoreZone = null;
    this.isLoreTransitionActive = false;
    this.hasLaunchedLoreCutscene = false;
    this.isRestartingRun = false;
    this.bossEncounterStarted = false;
    this.bossDefeated = false;
    this.isBossRewardActive = false;
    this.sectorCleared = false;
    this.bossLastAttackHitId = -1;
    this.bossRewardTimer = null;
    this.bossAftermathPool = null;
    this.boss = null;
    this.hasAppliedBootSanityFrame = false;
  }

  createSceneBounds() {
    this.cameras.main.setBounds(0, 0, CHAMBER03_WORLD_WIDTH, WORLD.height);
    this.physics.world.setBounds(0, 0, CHAMBER03_WORLD_WIDTH, WORLD.height);
  }

  createCoreScene() {
    this.renderBackdropSequence();
    this.createPlatforms();
    this.createPlayerSpawn();
  }

  createPlayerSpawn() {
    const spawnX = Phaser.Math.Clamp(PLAYER.startX, 96, CHAMBER03_WORLD_WIDTH - 96);
    const spawnY = Phaser.Math.Clamp(PLAYER.startY, 200, WORLD.floorY - 18);

    this.player = new Player(this, spawnX, spawnY, PLAYER);
    this.applyGameplayReadabilitySupport(this.player.sprite, { fill: 0xd8cfbb, alpha: 0.18, scale: 1.1 });
    this.player.sprite.setDepth(6).setAlpha(1);
    this.physics.add.collider(this.player.sprite, this.platforms);
  }

  createBossUi() {
    this.bossTellRing = this.add.ellipse(CHAMBER03_BOSS.spawnX, CHAMBER03_BOSS.spawnY - 142, 248, 86, 0xd2a355, 0).setDepth(5).setVisible(false);
    this.bossTellHalo = this.add.ellipse(CHAMBER03_BOSS.spawnX, CHAMBER03_BOSS.spawnY - 208, 154, 52, 0xf2ddab, 0).setDepth(5.2).setVisible(false);
    this.bossHitRing = this.add.ellipse(CHAMBER03_BOSS.spawnX, CHAMBER03_BOSS.spawnY - 128, 190, 78, 0xd6e7a4, 0).setDepth(5.3).setVisible(false);
    this.bossDeathHalo = this.add.ellipse(CHAMBER03_BOSS.spawnX, CHAMBER03_BOSS.spawnY - 132, 340, 220, 0xf1e2c8, 0).setDepth(5).setVisible(false);
    this.bossRewardText = this.add
      .text(this.scale.width / 2, this.scale.height * 0.24, `${CHAMBER03_BOSS_ARENA.text}\n${CHAMBER03_BOSS_ARENA.subtitle}`, {
        fontFamily: 'Georgia, Times, serif',
        fontSize: '44px',
        fontStyle: 'bold',
        align: 'center',
        color: '#f4efe5',
        stroke: '#130c0b',
        strokeThickness: 8,
        shadow: { offsetX: 0, offsetY: 7, color: '#050303', blur: 12, fill: true }
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(34)
      .setAlpha(0)
      .setVisible(false);
  }

  bootstrapOptionalSystems() {
    this.runOptionalStartupStep('threshold omen hook', () => {
      this.createThresholdLoreZone();
    });

    this.runOptionalStartupStep('encounter pockets', () => {
      this.createEncounterPockets();
    });

    this.runOptionalStartupStep('boss bootstrap', () => {
      this.createBossEncounter();
    });
  }

  createBossEncounter() {
    this.boss = new PrecentorBoss(this, CHAMBER03_BOSS.spawnX, CHAMBER03_BOSS.spawnY, CHAMBER03_BOSS);
    this.applyGameplayReadabilitySupport(this.boss.sprite, { fill: 0xd6c39d, alpha: 0.16, scale: 1.2 });
    this.physics.add.collider(this.boss.sprite, this.platforms);
    this.physics.add.overlap(this.player.attackHitbox, this.boss.sprite, this.handlePlayerHitBoss, null, this);
    this.physics.add.overlap(this.player.sprite, this.boss.sprite, this.handleBossContactPlayer, null, this);
    this.boss.setActive(false);
    this.boss.sprite.setVisible(false);
    this.boss.solidUnderlay?.setVisible(false);
    this.boss.body.enable = false;
  }

  runOptionalStartupStep(label, step) {
    try {
      step();
    } catch (error) {
      console.warn(`[Chamber03Scene] Optional startup step failed: ${label}`, error);
    }
  }

  update(time) {
    const mobileInput = this.mobileControls.getInputState();

    if (this.player.isDead) {
      this.mobileControls.setMode('dead');
      this.restartText.setVisible(true).setText('VESSEL FAILURE\nPress [R] to re-seed chamber');
      if ((Phaser.Input.Keyboard.JustDown(this.keyRestart) || mobileInput.interactPressed) && !this.isRestartingRun) {
        this.isRestartingRun = true;
        this.cleanupSceneUi();
        restartRunFromDeath(this);
      }
      return;
    }

    this.restartText.setVisible(false);

    if (this.isLoreTransitionActive || this.isBossRewardActive) {
      this.mobileControls.setMode('dialogue');
      this.player.body.setVelocity(0, 0);
      this.enemies.forEach((enemy) => enemy.body.setVelocity(0, 0));
      if (this.boss && !this.boss.dead) {
        this.boss.body.setVelocity(0, 0);
      }
      return;
    }

    this.mobileControls.setMode('gameplay');

    const combinedInput = {
      left: this.cursors.left.isDown || mobileInput.left,
      right: this.cursors.right.isDown || mobileInput.right,
      jumpPressed:
        Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
        mobileInput.jumpPressed,
      attackPressed: Phaser.Input.Keyboard.JustDown(this.keyAttack) || mobileInput.attackPressed
    };

    this.player.update(time, combinedInput);
    this.refreshLoreZonePresence();
    this.tryBeginLoreSequence(mobileInput);

    this.enemies.forEach((enemy) => enemy.update(time, this.player.sprite.x));
    this.tryStartBossEncounter();
    this.boss?.update(time, this.player.sprite);
    this.updateBossArenaFeedback(time);

    this.hud.update(this.player.health, PLAYER.maxHealth);
    this.hud.setBossBarState({
      visible: this.bossEncounterStarted && !this.bossDefeated,
      name: CHAMBER03_BOSS.name,
      subtitle: CHAMBER03_BOSS.subtitle,
      current: this.boss?.health ?? CHAMBER03_BOSS.health,
      max: this.boss?.maxHealth ?? CHAMBER03_BOSS.maxHealth,
      telegraph: this.boss?.getTelegraphProgress(time) ?? 0,
      wounded: this.boss ? time < this.boss.lastDamageFlashTime + 220 : false
    });
  }

  renderBackdropSequence() {
    this.add.rectangle(CHAMBER03_WORLD_WIDTH / 2, WORLD.height / 2, CHAMBER03_WORLD_WIDTH, WORLD.height, COLORS.backdrop, 1).setOrigin(0.5).setDepth(-16);
    this.add.rectangle(CHAMBER03_WORLD_WIDTH / 2, WORLD.height * 0.22, CHAMBER03_WORLD_WIDTH, WORLD.height * 0.44, 0x0e0908, 0.72).setDepth(-15.5);
    this.add.ellipse(CHAMBER03_WORLD_WIDTH / 2, WORLD.floorY + 22, CHAMBER03_WORLD_WIDTH * 0.92, 156, COLORS.oil, 0.42).setDepth(-10.4);

    CHAMBER03_SEGMENT_LAYOUT.forEach((segment, index) => {
      if (this.textures.exists(segment.key)) {
        this.add.image(segment.centerX, segment.y, segment.key)
          .setDisplaySize(segment.width, segment.height)
          .setTint(segment.tint)
          .setAlpha(segment.alpha)
          .setDepth(index === CHAMBER03_SEGMENT_LAYOUT.length - 1 ? -11 : -13);
      } else {
        this.add.rectangle(segment.centerX, segment.y, segment.width, segment.height, COLORS.architecture, 0.54)
          .setStrokeStyle(2, COLORS.rust, 0.34)
          .setDepth(-13);
        this.add.ellipse(segment.centerX, segment.y - 36, segment.width * 0.42, 84, COLORS.bone, 0.14).setDepth(-12.8);
        this.add.rectangle(segment.centerX, segment.y + 34, segment.width * 0.68, segment.height * 0.38, COLORS.foreground, 0.22).setDepth(-12.7);
      }

      const floorGlowAlpha = segment.key === ASSET_KEYS.chamber03BossDais ? 0.18 : segment.key === ASSET_KEYS.chamber03Threshold ? 0.12 : 0.06;
      this.add.ellipse(segment.centerX, WORLD.floorY - 8, segment.width * 0.74, 44, COLORS.sickly, floorGlowAlpha).setDepth(-10);
      this.add.ellipse(segment.centerX, WORLD.floorY + 14, segment.width * 0.92, 72, COLORS.oil, 0.3).setDepth(-9.8);
    });

    const wallModuleCenters = CHAMBER03_SEGMENT_LAYOUT.filter((segment) => segment.key === ASSET_KEYS.chamber03WallModule);
    wallModuleCenters.forEach((segment, index) => {
      this.add.ellipse(segment.centerX + (index % 2 === 0 ? -90 : 90), 242, 210, 160, COLORS.foreground, 0.12).setDepth(-12);
      this.add.ellipse(segment.centerX, 208, 300, 80, COLORS.bone, 0.08).setDepth(-12.2);
    });

    const floorPlateColor = this.textures.exists(ASSET_KEYS.chamber03BossDais) ? COLORS.bone : 0x8a7765;
    this.add.rectangle(CHAMBER03_WORLD_WIDTH / 2, WORLD.floorY + 10, CHAMBER03_WORLD_WIDTH, 96, floorPlateColor, 0.18).setDepth(-10.2);
    this.add.rectangle(CHAMBER03_WORLD_WIDTH / 2, WORLD.floorY + 28, CHAMBER03_WORLD_WIDTH, 34, COLORS.foreground, 0.42).setDepth(-10.1);

    if (!this.textures.exists(ASSET_KEYS.chamber03EntryNave)) {
      this.add.rectangle(320, 220, 560, 340, 0x120e0d, 0.72).setDepth(-12.5);
      this.add.ellipse(320, WORLD.floorY - 8, 360, 52, COLORS.sickly, 0.08).setDepth(-10.1);
    }
  }

  createPlatforms() {
    this.createInvisiblePlatform(CHAMBER03_WORLD_WIDTH / 2, WORLD.floorY + 28, CHAMBER03_WORLD_WIDTH, 72);

    [
      { x: 910, y: 368, width: 200, height: 18 },
      { x: 1700, y: 344, width: 170, height: 18 },
      { x: 2210, y: 386, width: 220, height: 18 },
      { x: 3270, y: 352, width: 180, height: 18 },
      { x: 4370, y: 382, width: 200, height: 18 },
      { x: 5940, y: 334, width: 220, height: 18 }
    ].forEach((platform) => this.createInvisiblePlatform(platform.x, platform.y, platform.width, platform.height));

    this.bossArenaBarrier = this.createInvisiblePlatform(
      CHAMBER03_BOSS_ARENA.barrierX,
      WORLD.floorY - CHAMBER03_BOSS_ARENA.barrierHeight / 2 + 6,
      CHAMBER03_BOSS_ARENA.barrierWidth,
      CHAMBER03_BOSS_ARENA.barrierHeight
    );
    this.bossArenaBarrier.body.enable = false;

    this.bossArenaSeal = this.add.rectangle(CHAMBER03_BOSS_ARENA.barrierX, WORLD.floorY - 126, 54, 262, COLORS.foreground, 0.2)
      .setStrokeStyle(2, COLORS.bone, 0.22)
      .setDepth(-5.2)
      .setVisible(false);
  }

  establishInitialCameraFrame() {
    const camera = this.cameras.main;
    const spawnBandTop = 150;
    const spawnBandBottom = WORLD.floorY - 16;
    const clampedPlayerY = Phaser.Math.Clamp(this.player.sprite.y, spawnBandTop, spawnBandBottom);

    if (clampedPlayerY !== this.player.sprite.y) {
      this.player.sprite.y = clampedPlayerY;
      this.player.body.updateFromGameObject();
      this.player.attackHitbox.body.updateFromGameObject();
    }

    this.applyResponsiveLayout();

    const viewportHeight = camera.height / camera.zoom;
    const targetCenterY = Phaser.Math.Clamp(
      this.player.sprite.y - (camera.followOffset?.y ?? 0),
      viewportHeight * 0.5,
      WORLD.height - viewportHeight * 0.5
    );
    const bootScrollY = Phaser.Math.Clamp(targetCenterY - viewportHeight * 0.5, 0, Math.max(0, WORLD.height - viewportHeight));

    camera.centerOn(this.player.sprite.x - 84, targetCenterY);
    camera.scrollY = bootScrollY;
    camera.startFollow(this.player.sprite, true, 0.08, 0.08, -140, 0);
    camera.setLerp(0.08, 0.08);

    this.hasAppliedBootSanityFrame = true;
  }

  createThresholdLoreZone() {
    const zone = this.add.zone(
      CHAMBER03_THRESHOLD_LORE.x,
      CHAMBER03_THRESHOLD_LORE.y,
      CHAMBER03_THRESHOLD_LORE.width,
      CHAMBER03_THRESHOLD_LORE.height
    ).setOrigin(0.5);
    this.physics.add.existing(zone, true);
    zone.loreEntry = CHAMBER03_THRESHOLD_LORE;
    this.loreZones.add(zone);

    this.add.ellipse(CHAMBER03_THRESHOLD_LORE.x, CHAMBER03_THRESHOLD_LORE.y + 24, 196, 46, COLORS.oil, 0.34).setDepth(-5.1);
    this.add.ellipse(CHAMBER03_THRESHOLD_LORE.x, CHAMBER03_THRESHOLD_LORE.y + 10, 148, 32, COLORS.sickly, 0.16).setDepth(-5.05);
    this.add.ellipse(CHAMBER03_THRESHOLD_LORE.x, CHAMBER03_THRESHOLD_LORE.y - 8, 110, 26, COLORS.bloodMetal, 0.74).setDepth(-5);
    this.add.ellipse(CHAMBER03_THRESHOLD_LORE.x, CHAMBER03_THRESHOLD_LORE.y - 36, 92, 40, COLORS.bone, 0.84).setDepth(-4.9);
    this.add.ellipse(CHAMBER03_THRESHOLD_LORE.x, CHAMBER03_THRESHOLD_LORE.y - 36, 42, 16, COLORS.oil, 0.82).setDepth(-4.85);
    this.add.rectangle(CHAMBER03_THRESHOLD_LORE.x, CHAMBER03_THRESHOLD_LORE.y - 48, 12, 68, COLORS.rust, 0.82).setDepth(-4.83);
    this.add.ellipse(CHAMBER03_THRESHOLD_LORE.x, CHAMBER03_THRESHOLD_LORE.y - 62, 18, 12, COLORS.sickly, 0.4).setDepth(-4.8);
  }

  createEncounterPockets() {
    CHAMBER03_ENCOUNTERS.forEach((encounter) => {
      encounter.enemies.forEach((spawn) => {
        const config = spawn.kind === 'elite'
          ? { ...CHAMBER03_ELITE_CONFIG, awakenPlayerX: spawn.awakenPlayerX, wakeDelayMs: spawn.wakeDelayMs ?? 0 }
          : { ...CHAMBER03_SKITTER_CONFIG, awakenPlayerX: spawn.awakenPlayerX, wakeDelayMs: spawn.wakeDelayMs ?? 0 };
        const enemy = new SkitterServitor(this, spawn.x, spawn.y, config);
        this.applyGameplayReadabilitySupport(enemy.sprite, {
          fill: spawn.kind === 'elite' ? 0xcab07d : 0x9eb26d,
          alpha: spawn.kind === 'elite' ? 0.14 : 0.12,
          scale: spawn.kind === 'elite' ? 1.14 : 1.05
        });
        this.physics.add.collider(enemy.sprite, this.platforms);
        this.physics.add.overlap(this.player.attackHitbox, enemy.sprite, (attackZone, enemySprite) => {
          this.handlePlayerHitEnemy(attackZone, enemySprite, enemy);
        });
        this.physics.add.overlap(this.player.sprite, enemy.sprite, (playerSprite, enemySprite) => {
          this.handleEnemyContactPlayer(playerSprite, enemySprite, enemy);
        });
        this.enemies.push(enemy);
      });
    });
  }

  createInvisiblePlatform(x, y, width, height) {
    const platform = this.add.rectangle(x, y, width, height, 0x000000, 0).setOrigin(0.5);
    platform.setVisible(false);
    this.physics.add.existing(platform, true);
    this.platforms.add(platform);
    return platform;
  }

  refreshLoreZonePresence() {
    this.currentLoreZone = null;
    this.physics.overlap(this.player.sprite, this.loreZones, (_, zone) => {
      if (!zone?.loreEntry || this.triggeredLoreIds.has(zone.loreEntry.id)) {
        return;
      }
      this.currentLoreZone = zone;
    });
  }

  tryBeginLoreSequence(mobileInput) {
    if (!this.currentLoreZone || this.isLoreTransitionActive || this.bossEncounterStarted) {
      return;
    }

    const interactPressed =
      Phaser.Input.Keyboard.JustDown(this.keyInteract) ||
      Phaser.Input.Keyboard.JustDown(this.keyEnter) ||
      mobileInput.interactPressed;

    if (!interactPressed) {
      return;
    }

    const { loreEntry } = this.currentLoreZone;
    this.triggeredLoreIds.add(loreEntry.id);
    this.beginLoreSequence(loreEntry);
  }

  beginLoreSequence(loreEntry) {
    if (!loreEntry?.cutsceneId || this.isLoreTransitionActive) {
      return;
    }

    this.isLoreTransitionActive = true;
    this.hasLaunchedLoreCutscene = false;
    this.mobileControls.setMode('dialogue');
    this.player.body.setVelocity(0, 0);
    this.enemies.forEach((enemy) => enemy.body.setVelocity(0, 0));
    this.audioDirector?.stopAmbientLoop();

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.launchLoreCutscene(loreEntry.cutsceneId);
    });

    if (typeof window !== 'undefined') {
      window.setTimeout(() => this.launchLoreCutscene(loreEntry.cutsceneId), 520);
    }

    this.cameras.main.fadeOut(450, 0, 0, 0);
  }

  launchLoreCutscene(cutsceneId) {
    if (this.hasLaunchedLoreCutscene || !cutsceneId) {
      return;
    }

    this.hasLaunchedLoreCutscene = true;
    this.scene.pause();
    this.scene.launch('LoreCutsceneScene', {
      cutsceneId,
      returnSceneKey: this.scene.key
    });
  }

  handleLoreCutsceneComplete({ cutsceneId } = {}) {
    if (cutsceneId !== CHAMBER03_THRESHOLD_LORE.cutsceneId) {
      return;
    }

    const scenePlugin = this.scene;
    const wasPaused = scenePlugin.isPaused(this.scene.key);
    if (wasPaused) {
      scenePlugin.resume(this.scene.key);
    }

    this.isLoreTransitionActive = false;
    this.hasLaunchedLoreCutscene = false;
    this.input.enabled = true;
    this.physics.world.resume();
    this.physics.world.timeScale = 1;
    this.time.timeScale = 1;
    this.mobileControls?.setMode('gameplay');
    this.player.body.enable = true;
    this.player.body.setVelocity(0, 0);
    this.player.attackHitbox.body.enable = this.player.attackActive;
    this.enemies.forEach((enemy) => {
      enemy.body.enable = !enemy.dead;
      enemy.body.setVelocity(0, enemy.body.velocity.y);
    });
    if (this.boss && !this.boss.dead) {
      this.boss.body.enable = this.bossEncounterStarted;
      this.boss.body.setVelocity(0, 0);
    }

    this.audioDirector?.playAmbientLoop(ASSET_KEYS.ambientChamber02Loop01, { volume: 0.14 });
    this.cameras.main.fadeIn(520, 0, 0, 0);
    this.bossArenaSeal?.setVisible(true).setAlpha(0.32);
  }

  tryStartBossEncounter() {
    if (this.bossEncounterStarted || !this.boss || !this.triggeredLoreIds.has(CHAMBER03_THRESHOLD_LORE.id)) {
      return;
    }

    if (this.player.sprite.x < CHAMBER03_BOSS.arenaStartX) {
      return;
    }

    this.bossEncounterStarted = true;
    this.boss.setActive(true);
    this.boss.sprite.setVisible(true);
    this.boss.solidUnderlay?.setVisible(true);
    this.boss.body.enable = true;
    this.bossArenaBarrier.body.enable = true;
    this.bossArenaBarrier.body.updateFromGameObject?.();
    this.bossArenaSeal?.setVisible(true).setAlpha(0.48);
    this.cameras.main.shake(420, 0.0042);
  }

  handlePlayerHitEnemy(_attackZone, enemySprite, enemy) {
    if (!this.player.attackActive || enemy.dead || !this.isEnemyOverlapTarget(enemySprite, enemy)) {
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

  handleEnemyContactPlayer(_playerSprite, enemySprite, enemy) {
    if (enemy.dead || !this.isEnemyOverlapTarget(enemySprite, enemy)) {
      return;
    }
    if (!enemy.canDealContactDamage(this.time.now)) {
      return;
    }

    const contactDamage = enemy.config.contactDamage ?? 1;
    const tookDamage = this.player.receiveDamage(contactDamage, this.time.now);
    if (tookDamage) {
      const knockDirection = Math.sign(this.player.sprite.x - enemy.sprite.x) || 1;
      this.player.body.setVelocityX(knockDirection * 220);
      this.player.body.setVelocityY(-220);
    }
  }

  handlePlayerHitBoss(_attackZone, enemySprite) {
    if (
      !this.boss ||
      !this.player.attackActive ||
      !this.bossEncounterStarted ||
      this.boss.dead ||
      !this.isEnemyOverlapTarget(enemySprite, this.boss.sprite)
    ) {
      return;
    }

    if (this.bossLastAttackHitId === this.player.attackId) {
      return;
    }

    this.bossLastAttackHitId = this.player.attackId;
    this.boss.takeDamage(1, this.time.now);
    this.audioDirector?.playPlayerHit();
    this.playBossHitFeedback();

    const knockDirection = Math.sign(this.boss.sprite.x - this.player.sprite.x) || this.player.facing;
    this.boss.direction = knockDirection;

    if (this.boss.dead) {
      this.handleBossDefeated();
    }
  }

  handleBossContactPlayer(_playerSprite, enemySprite) {
    if (!this.boss || this.boss.dead || !this.bossEncounterStarted || !this.isEnemyOverlapTarget(enemySprite, this.boss.sprite)) {
      return;
    }

    if (!this.boss.canDealContactDamage(this.time.now)) {
      return;
    }

    const tookDamage = this.player.receiveDamage(CHAMBER03_BOSS.contactDamage, this.time.now);
    if (tookDamage) {
      this.boss.recordContactDamage(this.time.now);
      const knockDirection = Math.sign(this.player.sprite.x - this.boss.sprite.x) || 1;
      this.player.body.setVelocityX(knockDirection * 250);
      this.player.body.setVelocityY(-246);
    }
  }

  handleBossDefeated() {
    this.bossDefeated = true;
    this.boss.setActive(false);
    this.isBossRewardActive = true;
    this.sectorCleared = true;
    this.bossTellRing?.setVisible(false).setAlpha(0);
    this.bossTellHalo?.setVisible(false).setAlpha(0);
    this.bossHitRing?.setVisible(false).setAlpha(0);
    this.spawnBossAftermathPool(this.boss.sprite.x, WORLD.floorY - 6);
    this.bossArenaBarrier.body.enable = false;
    this.bossArenaSeal?.setAlpha(0.12);

    if (this.bossDeathHalo) {
      this.bossDeathHalo.setPosition(this.boss.sprite.x, this.boss.sprite.y - 132).setScale(0.74).setAlpha(0.74).setVisible(true);
      this.tweens.add({
        targets: this.bossDeathHalo,
        scaleX: 1.36,
        scaleY: 1.22,
        alpha: 0,
        duration: 1440,
        ease: 'Quad.easeOut',
        onComplete: () => this.bossDeathHalo?.setVisible(false)
      });
    }

    this.cameras.main.shake(920, 0.0084);
    this.audioDirector?.playBanishmentSting();

    this.bossRewardText.setVisible(true).setAlpha(0).setScale(0.92);
    this.tweens.add({
      targets: this.bossRewardText,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 360,
      ease: 'Quad.easeOut'
    });
    this.time.delayedCall(1320, () => {
      this.tweens.add({
        targets: this.bossRewardText,
        alpha: 0,
        y: this.bossRewardText.y - 18,
        duration: 820,
        ease: 'Quad.easeIn',
        onComplete: () => {
          this.bossRewardText.setVisible(false);
          this.bossRewardText.y = this.scale.height * 0.24;
        }
      });
    });

    this.bossRewardTimer?.remove(false);
    this.bossRewardTimer = this.time.delayedCall(2360, () => {
      this.isBossRewardActive = false;
    });
  }

  spawnBossAftermathPool(x, y) {
    this.bossAftermathPool?.destroy(true);
    const pool = this.add.container(x, y).setDepth(4.8);
    const layers = [
      this.add.ellipse(0, 0, 256, 64, 0x180b0b, 0.64),
      this.add.ellipse(0, -2, 214, 48, 0x451913, 0.54),
      this.add.ellipse(6, -4, 170, 38, 0x6a2419, 0.44),
      this.add.ellipse(-18, -6, 92, 20, 0xa76f57, 0.22),
      this.add.ellipse(42, -8, 64, 16, 0xd9be93, 0.12)
    ];
    pool.add(layers);
    this.bossAftermathPool = pool;
  }

  playBossHitFeedback() {
    this.bossHitRing
      ?.setVisible(true)
      .setAlpha(0.62)
      .setScale(0.84)
      .setPosition(this.boss.sprite.x, this.boss.sprite.y - 128);

    this.tweens.add({
      targets: this.bossHitRing,
      alpha: 0,
      scaleX: 1.2,
      scaleY: 1.1,
      duration: 170,
      ease: 'Quad.easeOut',
      onComplete: () => this.bossHitRing?.setVisible(false)
    });
  }

  updateBossArenaFeedback(time) {
    if (!this.boss) {
      this.bossTellRing?.setVisible(false).setAlpha(0);
      this.bossTellHalo?.setVisible(false).setAlpha(0);
      return;
    }

    if (this.bossTellRing) {
      if (this.bossEncounterStarted && !this.boss.dead && this.boss.isTelegraphing(time)) {
        const progress = this.boss.getTelegraphProgress(time);
        this.bossTellRing
          .setVisible(true)
          .setAlpha(0.2 + progress * 0.32)
          .setScale(1 + progress * 0.16, 1)
          .setPosition(this.boss.sprite.x, this.boss.sprite.y - 148);
        this.bossTellHalo
          ?.setVisible(true)
          .setAlpha(0.16 + progress * 0.24)
          .setScale(1 + progress * 0.06)
          .setPosition(this.boss.sprite.x + this.boss.direction * 14, this.boss.sprite.y - 210 - progress * 10);
      } else {
        this.bossTellRing.setVisible(false).setAlpha(0);
        this.bossTellHalo?.setVisible(false).setAlpha(0);
      }
    }

    if (this.bossArenaSeal?.visible && !this.bossDefeated) {
      this.bossArenaSeal.setAlpha(this.bossEncounterStarted ? 0.22 + (Math.sin(time / 180) + 1) * 0.08 : 0.18);
    }
  }

  isEnemyOverlapTarget(target, enemy) {
    const sprite = enemy?.sprite ?? enemy;
    return target === sprite || target?.gameObject === sprite;
  }

  setupMobileUiCamera() {
    if (!this.mobileControls.enabled) {
      return;
    }

    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'Chamber03MobileUiCamera');
    const mobileUiElements = this.mobileControls.getUiElements();
    const mobileUiSet = new Set(mobileUiElements);
    const nonMobileObjects = this.children.list.filter((element) => !mobileUiSet.has(element));
    this.cameras.main.ignore(mobileUiElements);
    this.uiCamera.ignore(nonMobileObjects);
  }

  applyGameplayReadabilitySupport(target, { fill = 0xd2c2ac, alpha = 0.16, scale = 1.08 } = {}) {
    if (!target) {
      return null;
    }

    const shadow = this.add.ellipse(target.x, WORLD.floorY + 6, 104 * scale, 22 * scale, 0x050404, alpha * 1.05).setDepth(target.depth - 0.6);
    const halo = this.add.ellipse(target.x, target.y - 6, 84 * scale, 118 * scale, fill, alpha).setDepth(target.depth - 0.4);

    this.events.on(Phaser.Scenes.Events.UPDATE, () => {
      if (!target.active) {
        halo.setVisible(false);
        shadow.setVisible(false);
        return;
      }
      halo.setVisible(target.visible).setPosition(target.x, target.y - 8).setAlpha(target.visible ? alpha : 0);
      shadow.setVisible(target.visible).setPosition(target.x, WORLD.floorY + 6).setAlpha(target.visible ? alpha * 1.05 : 0);
    });

    return { halo, shadow };
  }

  cleanupSceneUi() {
    this.restartText?.setVisible(false);
    this.mobileControls?.setMode('init');
    this.hud?.setVisible(false);
  }

  applyResponsiveLayout() {
    const camera = this.cameras.main;
    const width = this.scale.width;
    const height = this.scale.height;
    const mobileControls = this.mobileControls;
    const mobileEnabled = mobileControls?.enabled ?? false;
    const isPortraitMobile = mobileEnabled && height >= width;

    if (this.uiCamera) {
      this.uiCamera.setViewport(0, 0, width, height);
    }

    this.bossRewardText?.setPosition(width / 2, Math.max(100, height * 0.24));

    if (isPortraitMobile) {
      const safeAreaBottom = mobileControls?.getSafeAreaInsetPx('bottom') ?? 0;
      const maxWorldBandFromControlNeeds = height - PORTRAIT_LAYOUT.minControlBand - safeAreaBottom;
      const worldBandMax = Math.max(PORTRAIT_LAYOUT.worldBandMin, Math.min(PORTRAIT_LAYOUT.worldBandMax, maxWorldBandFromControlNeeds));
      const worldBandHeight = Phaser.Math.Clamp(
        Math.floor(height * PORTRAIT_LAYOUT.worldBandRatio),
        PORTRAIT_LAYOUT.worldBandMin,
        worldBandMax
      );
      camera.setViewport(0, 0, width, worldBandHeight);
      camera.setZoom(PORTRAIT_LAYOUT.portraitZoom);
      camera.setFollowOffset(-120, PORTRAIT_LAYOUT.portraitFollowOffsetY);
      if (this.player && this.hasAppliedBootSanityFrame) {
        const viewportHeight = camera.height / camera.zoom;
        const targetCenterY = Phaser.Math.Clamp(this.player.sprite.y - PORTRAIT_LAYOUT.portraitFollowOffsetY, viewportHeight * 0.5, WORLD.height - viewportHeight * 0.5);
        camera.scrollY = Phaser.Math.Clamp(targetCenterY - viewportHeight * 0.5, 0, Math.max(0, WORLD.height - viewportHeight));
      }
      mobileControls?.setReservedBottomPx(height - worldBandHeight);
      this.restartText.setPosition(width / 2, Math.max(PORTRAIT_LAYOUT.restartTextMinY, worldBandHeight * PORTRAIT_LAYOUT.restartTextRatioY));
      return;
    }

    camera.setViewport(0, 0, width, height);
    camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
    camera.setFollowOffset(-140, PORTRAIT_LAYOUT.desktopFollowOffsetY);
    if (this.player && this.hasAppliedBootSanityFrame) {
      const viewportHeight = camera.height / camera.zoom;
      const targetCenterY = Phaser.Math.Clamp(this.player.sprite.y - PORTRAIT_LAYOUT.desktopFollowOffsetY, viewportHeight * 0.5, WORLD.height - viewportHeight * 0.5);
      camera.scrollY = Phaser.Math.Clamp(targetCenterY - viewportHeight * 0.5, 0, Math.max(0, WORLD.height - viewportHeight));
    }
    mobileControls?.setReservedBottomPx(0);
    this.restartText.setPosition(width / 2, 90);
  }
}
