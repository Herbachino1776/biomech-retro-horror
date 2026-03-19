import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { SkitterServitor } from '../entities/SkitterServitor.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { COLORS, PLAYER, SKITTER, WORLD } from '../data/milestone1Config.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';
import { restartRunFromDeath } from '../systems/RunReset.js';
import { AudioDirector } from '../audio/AudioDirector.js';

const CHAMBER02_WORLD_WIDTH = 3600;

const CHAMBER02_PLATFORMS = [
  { x: 700, y: 372, width: 170, height: 20 },
  { x: 1170, y: 338, width: 160, height: 20 },
  { x: 1810, y: 384, width: 230, height: 20 },
  { x: 2420, y: 346, width: 190, height: 20 },
  { x: 3070, y: 376, width: 220, height: 20 }
];

const CHAMBER02_TOLL_KEEPER_CONFIG = {
  ...SKITTER,
  textureKey: ASSET_KEYS.chamber02TollKeeperSkitter,
  variantName: 'TOLL-KEEPER',
  health: 7,
  speed: 46,
  attackCooldownMs: 3000,
  windupMs: 820,
  attackActiveMs: 320,
  attackRecoveryMs: 620,
  hesitationMs: 560,
  attackTriggerRange: 158,
  attackRange: 192,
  preferredRange: 136,
  rangeBand: 20,
  lungeSpeedBonus: 104,
  lungeJumpVelocity: -92,
  recoilVelocityX: 144,
  recoilVelocityY: -84,
  patrolDistance: 72,
  awakenPlayerX: 2820,
  wakeDelayMs: 0,
  body: { width: 74, height: 44, offsetX: 32, offsetY: 94 },
  presentation: {
    alpha: 1,
    display: { width: 284, height: 218 },
    origin: { x: 0.52, y: 0.965 },
    stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.46 }
  },
  rangeTellColor: 0xe8d78f,
  rangeTellAlphaBase: 0.32,
  rangeTellAlphaGain: 0.42,
  rangeTellStrokeColor: 0xfff1bd,
  rangeTellStrokeAlphaBase: 0.46,
  rangeTellStrokeAlphaGain: 0.32,
  eyeGlowColor: 0xe9ffb4,
  eyeGlowWidth: 44,
  eyeGlowHeight: 22,
  eyeGlowOffsetX: 24,
  eyeGlowYOffset: 18,
  eyeGlowAlphaBase: 0.42,
  eyeGlowWindupAlphaGain: 0.46,
  audioProfile: 'tollkeeper'
};

const CHAMBER02_TOLL_KEEPER_SPAWNS = [
  { x: 3005, y: 404, awakenPlayerX: 2820, wakeDelayMs: 0 },
  { x: 3325, y: 404, awakenPlayerX: 3010, wakeDelayMs: 220 }
];

const CHAMBER02_ENEMY_SPAWNS = [
  { x: 1600, y: 402, awakenPlayerX: 1360 },
  { x: 2410, y: 402, awakenPlayerX: 2050 }
];

const CHAMBER02_LORE_ENTRY = {
  id: 'entry-chamber02-ossuary',
  x: 1970,
  y: 402,
  width: 170,
  height: 180,
  cutsceneId: 'chamber02-horn-arch'
};

const CHAMBER02_POST_LORE_REACTION = {
  gateTint: 0xbca775,
  gateAlpha: 0.94,
  sanctumAuraAlpha: 0.2,
  ambientVeilAlpha: 0.11
};

const CHAMBER02_EXIT_GATE = {
  x: 3480,
  y: 272,
  displayWidth: 404,
  displayHeight: 444,
  barrierWidth: 86,
  barrierHeight: 252,
  zoneOffsetX: -96,
  zoneY: 402,
  zoneWidth: 164,
  zoneHeight: 172,
  lockedTint: 0x927f66,
  lockedAlpha: 0.76,
  unlockedTint: 0xd7c5ac,
  unlockedAlpha: 0.96,
  loreCutsceneId: 'chamber02-exit-gate'
};

export class Chamber02Scene extends Phaser.Scene {
  constructor() {
    super('Chamber02Scene');
  }

  init(data) {
    this.transitionContext = data ?? {};
  }

  create() {
    this.physics.world.gravity.y = WORLD.gravityY;
    this.cameras.main.setBounds(0, 0, CHAMBER02_WORLD_WIDTH, WORLD.height);
    this.physics.world.setBounds(0, 0, CHAMBER02_WORLD_WIDTH, WORLD.height);

    this.cameras.main.setBackgroundColor('#070707');
    this.cameras.main.fadeIn(700, 0, 0, 0);

    this.platforms = this.physics.add.staticGroup();
    this.loreZones = this.physics.add.staticGroup();
    this.triggeredLoreIds = new Set();
    this.currentLoreZone = null;
    this.currentGateZone = null;
    this.isLoreTransitionActive = false;
    this.isRestartingRun = false;
    this.hasAppliedPostLoreReaction = false;
    this.hasTriggeredExitGateLore = false;

    this.renderProcessionalBackdrop();
    this.createPlatforms();
    this.createLoreZones();

    this.audioDirector = new AudioDirector(this);

    this.player = new Player(this, 150, 360, PLAYER);
    this.physics.add.collider(this.player.sprite, this.platforms);

    this.enemies = [];
    this.tollKeepers = [];
    this.createTollKeeperEncounter();
    this.createEnemyEncounter();

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

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyAttack = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.keyInteract = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keyRestart = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08, -140, 0);
    this.scale.on('resize', this.applyResponsiveLayout, this);
    this.game.events.on('lore-cutscene-complete', this.handleLoreCutsceneComplete, this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.applyResponsiveLayout, this);
      this.game.events.off('lore-cutscene-complete', this.handleLoreCutsceneComplete, this);
      this.audioDirector?.shutdown();
      this.cleanupSceneUi();
    });

    this.applyResponsiveLayout();
    this.hud.update(this.player.health, PLAYER.maxHealth);
  }

  renderProcessionalBackdrop() {
    this.add
      .rectangle(CHAMBER02_WORLD_WIDTH / 2, WORLD.height / 2, CHAMBER02_WORLD_WIDTH, WORLD.height, COLORS.backdrop, 1)
      .setOrigin(0.5)
      .setDepth(-14);

    const plateSegmentWidth = 540;
    const segmentCount = Math.ceil(CHAMBER02_WORLD_WIDTH / plateSegmentWidth) + 1;

    for (let i = 0; i < segmentCount; i += 1) {
      const segmentX = i * plateSegmentWidth + plateSegmentWidth / 2;
      const parityTint = i % 2 === 0 ? 0xbfae95 : 0xb1a38e;
      if (this.textures.exists(ASSET_KEYS.chamber02BackgroundPlate)) {
        this.add
          .image(segmentX, 220, ASSET_KEYS.chamber02BackgroundPlate)
          .setDisplaySize(plateSegmentWidth + 44, 382)
          .setTint(parityTint)
          .setAlpha(0.56)
          .setDepth(-13);
      } else {
        this.add
          .rectangle(segmentX, 220, plateSegmentWidth + 44, 382, COLORS.architecture, 0.5)
          .setStrokeStyle(2, COLORS.rust, 0.25)
          .setDepth(-13);
      }

      if (this.textures.exists(ASSET_KEYS.chamber02ForegroundHornArch) && i % 2 === 1) {
        this.add
          .image(segmentX + 32, 276, ASSET_KEYS.chamber02ForegroundHornArch)
          .setDisplaySize(230, 226)
          .setTint(0xb39f89)
          .setAlpha(0.22)
          .setDepth(-11);
      }
    }

    const floorStripHeight = 116;
    if (this.textures.exists(ASSET_KEYS.chamber02FloorStrip)) {
      this.add
        .tileSprite(CHAMBER02_WORLD_WIDTH / 2, WORLD.floorY + 4, CHAMBER02_WORLD_WIDTH, floorStripHeight, ASSET_KEYS.chamber02FloorStrip)
        .setTint(0xd8cab4)
        .setAlpha(0.84)
        .setDepth(-10);
    }

    this.sanctumAura = this.add
      .ellipse(1930, 404, 500, 96, COLORS.sickly, 0.16)
      .setDepth(-9);

    this.ambientVeil = this.add.ellipse(1970, 286, 660, 340, COLORS.sickly, 0.04).setDepth(-7.5).setScale(1, 1);
  }

  createPlatforms() {
    const floor = this.add
      .rectangle(CHAMBER02_WORLD_WIDTH / 2, WORLD.floorY + 28, CHAMBER02_WORLD_WIDTH, 72, COLORS.foreground, 0.9)
      .setOrigin(0.5)
      .setDepth(-8);
    this.physics.add.existing(floor, true);
    this.platforms.add(floor);

    CHAMBER02_PLATFORMS.forEach((platform) => {
      const slab = this.add.rectangle(platform.x, platform.y, platform.width, platform.height, COLORS.foreground, 0.9).setDepth(-7);
      this.physics.add.existing(slab, true);
      this.platforms.add(slab);
    });

    if (this.textures.exists(ASSET_KEYS.chamber02VertebralHornGate)) {
      this.hornGateMonument = this.add
        .image(1970, 274, ASSET_KEYS.chamber02VertebralHornGate)
        .setDisplaySize(420, 452)
        .setCrop(194, 166, 640, 1140)
        .setTint(0xd4c5af)
        .setAlpha(0.82)
        .setDepth(-6);
    }

    this.createExitGate();
  }

  createExitGate() {
    this.exitGateBarrier = this.add
      .rectangle(CHAMBER02_EXIT_GATE.x + 8, WORLD.floorY - 6, CHAMBER02_EXIT_GATE.barrierWidth, CHAMBER02_EXIT_GATE.barrierHeight, COLORS.architecture, 0)
      .setOrigin(0.5, 1)
      .setDepth(-5.5);
    this.physics.add.existing(this.exitGateBarrier, true);
    this.platforms.add(this.exitGateBarrier);

    if (this.textures.exists(ASSET_KEYS.chamber02VertebralHornGate)) {
      this.exitGateArt = this.add
        .image(CHAMBER02_EXIT_GATE.x, CHAMBER02_EXIT_GATE.y, ASSET_KEYS.chamber02VertebralHornGate)
        .setDisplaySize(CHAMBER02_EXIT_GATE.displayWidth, CHAMBER02_EXIT_GATE.displayHeight)
        .setCrop(194, 166, 640, 1140)
        .setTint(CHAMBER02_EXIT_GATE.lockedTint)
        .setAlpha(CHAMBER02_EXIT_GATE.lockedAlpha)
        .setDepth(-5.4);
    } else {
      this.exitGateArt = this.add
        .rectangle(CHAMBER02_EXIT_GATE.x, WORLD.floorY - 126, 112, 252, COLORS.foreground, 0.94)
        .setStrokeStyle(3, COLORS.bone, 0.8)
        .setDepth(-5.4);
    }

    this.exitGateSigil = this.add
      .ellipse(CHAMBER02_EXIT_GATE.x - 26, 324, 50, 108, COLORS.sickly, 0.14)
      .setDepth(-5.3);
    this.exitGateReadyAura = this.add
      .ellipse(CHAMBER02_EXIT_GATE.x - 96, CHAMBER02_EXIT_GATE.zoneY, 138, 88, COLORS.sickly, 0.1)
      .setDepth(-5.25)
      .setVisible(false);

    this.exitGateZone = this.add
      .zone(
        CHAMBER02_EXIT_GATE.x + CHAMBER02_EXIT_GATE.zoneOffsetX,
        CHAMBER02_EXIT_GATE.zoneY,
        CHAMBER02_EXIT_GATE.zoneWidth,
        CHAMBER02_EXIT_GATE.zoneHeight
      )
      .setOrigin(0.5);
    this.physics.add.existing(this.exitGateZone, true);
  }

  createTollKeeperEncounter() {
    CHAMBER02_TOLL_KEEPER_SPAWNS.forEach((spawn) => {
      const tollKeeper = this.createSkitterEnemy(spawn.x, spawn.y, {
        ...CHAMBER02_TOLL_KEEPER_CONFIG,
        awakenPlayerX: spawn.awakenPlayerX,
        wakeDelayMs: spawn.wakeDelayMs
      });
      tollKeeper.isTollKeeper = true;
      this.tollKeepers.push(tollKeeper);
      this.enemies.push(tollKeeper);
    });

    return this.tollKeepers;
  }

  createEnemyEncounter() {
    CHAMBER02_ENEMY_SPAWNS.forEach((spawn) => {
      const enemyConfig = {
        ...SKITTER,
        awakenPlayerX: spawn.awakenPlayerX,
        wakeDelayMs: spawn.wakeDelayMs ?? 500,
        patrolDistance: spawn.patrolDistance ?? 180
      };
      const enemy = this.createSkitterEnemy(spawn.x, spawn.y, enemyConfig);
      this.enemies.push(enemy);
    });

    return this.enemies;
  }

  createSkitterEnemy(x, y, config) {
    const enemy = new SkitterServitor(this, x, y, config);
    this.physics.add.collider(enemy.sprite, this.platforms);
    this.physics.add.overlap(this.player.attackHitbox, enemy.sprite, (attackZone, enemySprite) => {
      this.handlePlayerHitEnemy(attackZone, enemySprite, enemy);
    });
    this.physics.add.overlap(this.player.sprite, enemy.sprite, (playerSprite, enemySprite) => {
      this.handleEnemyContactPlayer(playerSprite, enemySprite, enemy);
    });
    return enemy;
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

    if (this.isLoreTransitionActive) {
      this.mobileControls.setMode('dialogue');
      return;
    }

    this.mobileControls.setMode('gameplay');

    this.player.update(time, {
      left: this.cursors.left.isDown || mobileInput.left,
      right: this.cursors.right.isDown || mobileInput.right,
      jumpPressed:
        Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
        mobileInput.jumpPressed,
      attackPressed: Phaser.Input.Keyboard.JustDown(this.keyAttack) || mobileInput.attackPressed
    });

    this.refreshLoreZonePresence();
    this.refreshExitGatePresence();
    this.tryBeginLoreSequence(mobileInput);
    this.tryUseExitGate(mobileInput);
    this.refreshExitGateState();
    this.updateExitGateAura(time);

    this.enemies.forEach((enemy) => enemy.update(time, this.player.sprite.x));

    this.hud.update(this.player.health, PLAYER.maxHealth);
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

    const tookDamage = this.player.receiveDamage(SKITTER.contactDamage, this.time.now);
    if (tookDamage) {
      const knockDirection = Math.sign(this.player.sprite.x - enemy.sprite.x) || 1;
      this.player.body.setVelocityX(knockDirection * 220);
      this.player.body.setVelocityY(-220);
    }
  }

  isEnemyOverlapTarget(target, enemy) {
    return target === enemy.sprite || target?.gameObject === enemy.sprite;
  }

  countDefeatedTollKeepers() {
    return this.tollKeepers.filter((enemy) => enemy.dead).length;
  }

  areAllTollKeepersDefeated() {
    return this.tollKeepers.length > 0 && this.countDefeatedTollKeepers() === this.tollKeepers.length;
  }

  applyExitGateVisualState(unlocked) {
    if (!this.exitGateArt) {
      return;
    }

    const targetTint = unlocked ? CHAMBER02_EXIT_GATE.unlockedTint : CHAMBER02_EXIT_GATE.lockedTint;
    const targetAlpha = unlocked ? CHAMBER02_EXIT_GATE.unlockedAlpha : CHAMBER02_EXIT_GATE.lockedAlpha;

    if (typeof this.exitGateArt.setTint === 'function') {
      this.exitGateArt.setTint(targetTint);
    } else if (typeof this.exitGateArt.setFillStyle === 'function') {
      this.exitGateArt.setFillStyle(targetTint, targetAlpha);
    }

    if (typeof this.exitGateArt.setAlpha === 'function') {
      this.exitGateArt.setAlpha(targetAlpha);
    }
  }

  refreshExitGateState() {
    const unlocked = this.areAllTollKeepersDefeated();
    if (this.exitGateUnlocked === unlocked) {
      return;
    }

    this.exitGateUnlocked = unlocked;
    if (unlocked) {
      this.audioDirector?.playGateUnlock();
    }
    this.exitGateSigil?.setAlpha(unlocked ? 0.3 : 0.14);
    this.applyExitGateVisualState(unlocked);
    this.exitGateBarrier?.setVisible(!unlocked);
    this.exitGateReadyAura?.setVisible(unlocked && !this.hasTriggeredExitGateLore);

    if (this.exitGateBarrier?.body) {
      this.exitGateBarrier.body.enable = !unlocked;
      this.exitGateBarrier.body.updateFromGameObject?.();
    }
  }

  createLoreZones() {
    const entry = CHAMBER02_LORE_ENTRY;
    const zone = this.add.zone(entry.x, entry.y, entry.width, entry.height).setOrigin(0.5);
    this.physics.add.existing(zone, true);
    zone.loreEntry = entry;
    this.loreZones.add(zone);
    this.createLoreShrineProp(entry);
  }

  createLoreShrineProp(entry) {
    const baseY = entry.y + 14;
    this.add.ellipse(entry.x, baseY + 4, 188, 44, COLORS.oil, 0.34).setDepth(-5.1);
    this.add.ellipse(entry.x, baseY + 2, 142, 30, COLORS.sickly, 0.16).setDepth(-5.05);
    this.add.rectangle(entry.x, baseY - 2, 134, 22, COLORS.bloodMetal, 0.8).setDepth(-5);
    this.add.rectangle(entry.x, baseY - 8, 88, 14, COLORS.foreground, 0.92).setDepth(-4.95);
    this.add.ellipse(entry.x, baseY - 26, 84, 40, COLORS.bone, 0.86).setDepth(-4.9);
    this.add.ellipse(entry.x, baseY - 24, 44, 16, COLORS.oil, 0.84).setDepth(-4.85);
    this.add.ellipse(entry.x - 28, baseY - 30, 28, 64, COLORS.bone, 0.7).setAngle(-18).setDepth(-4.84);
    this.add.ellipse(entry.x + 28, baseY - 30, 28, 64, COLORS.bone, 0.7).setAngle(18).setDepth(-4.84);
    this.add.rectangle(entry.x, baseY - 34, 10, 54, COLORS.rust, 0.78).setAngle(4).setDepth(-4.83);
    this.add.ellipse(entry.x, baseY - 42, 16, 10, COLORS.sickly, 0.36).setDepth(-4.8);
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

  refreshExitGatePresence() {
    this.currentGateZone = null;

    if (!this.exitGateZone || this.hasTriggeredExitGateLore || !this.areAllTollKeepersDefeated()) {
      return;
    }

    this.physics.overlap(this.player.sprite, this.exitGateZone, () => {
      this.currentGateZone = this.exitGateZone;
    });
  }

  tryBeginLoreSequence(mobileInput) {
    if (!this.currentLoreZone || this.isLoreTransitionActive) {
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
    if (!loreEntry || this.triggeredLoreIds.has(loreEntry.id)) {
      return;
    }

    this.triggeredLoreIds.add(loreEntry.id);
    this.beginLoreSequence(loreEntry);
  }

  tryUseExitGate(mobileInput) {
    if (!this.currentGateZone || this.isLoreTransitionActive || this.hasTriggeredExitGateLore) {
      return;
    }

    const interactPressed =
      Phaser.Input.Keyboard.JustDown(this.keyInteract) ||
      Phaser.Input.Keyboard.JustDown(this.keyEnter) ||
      mobileInput.interactPressed;

    if (!interactPressed) {
      return;
    }

    this.hasTriggeredExitGateLore = true;
    this.audioDirector?.playGateInteract();
    this.beginLoreSequence({ cutsceneId: CHAMBER02_EXIT_GATE.loreCutsceneId });
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

  beginLoreSequence(loreEntry) {
    if (!loreEntry?.cutsceneId || this.isLoreTransitionActive) {
      return;
    }

    this.isLoreTransitionActive = true;
    this.hasLaunchedLoreCutscene = false;
    this.mobileControls.setMode('dialogue');
    this.player.body.setVelocity(0, 0);
    this.enemies.forEach((enemy) => enemy.body.setVelocity(0, 0));

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.launchLoreCutscene(loreEntry.cutsceneId);
    });

    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        this.launchLoreCutscene(loreEntry.cutsceneId);
      }, 520);
    }

    this.cameras.main.fadeOut(450, 0, 0, 0);
  }

  handleLoreCutsceneComplete({ cutsceneId } = {}) {
    if (cutsceneId === CHAMBER02_LORE_ENTRY.cutsceneId) {
      this.applyPostLoreReactionState();
    }

    if (cutsceneId === CHAMBER02_EXIT_GATE.loreCutsceneId) {
      this.exitGateReadyAura?.setVisible(false);
      this.exitGateSigil?.setAlpha(0.38);
    }

    if (cutsceneId !== CHAMBER02_LORE_ENTRY.cutsceneId && cutsceneId !== CHAMBER02_EXIT_GATE.loreCutsceneId) {
      return;
    }

    this.isLoreTransitionActive = false;
    this.mobileControls.setMode('gameplay');
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  applyPostLoreReactionState() {
    if (this.hasAppliedPostLoreReaction) {
      return;
    }

    this.hasAppliedPostLoreReaction = true;
    this.sanctumAura?.setAlpha(CHAMBER02_POST_LORE_REACTION.sanctumAuraAlpha);
    this.ambientVeil?.setAlpha(CHAMBER02_POST_LORE_REACTION.ambientVeilAlpha);
    this.hornGateMonument?.setTint(CHAMBER02_POST_LORE_REACTION.gateTint).setAlpha(CHAMBER02_POST_LORE_REACTION.gateAlpha);

    const sleepingEnemy = this.enemies.find((enemy) => !enemy.dead && !enemy.awakened);
    if (!sleepingEnemy) {
      return;
    }

    sleepingEnemy.awakened = true;
    sleepingEnemy.awakenAtTime = null;
  }

  setupMobileUiCamera() {
    if (!this.mobileControls.enabled) {
      return;
    }

    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'Chamber02MobileUiCamera');

    const mobileUiElements = this.mobileControls.getUiElements();
    const mobileUiSet = new Set(mobileUiElements);
    const nonMobileObjects = this.children.list.filter((element) => !mobileUiSet.has(element));

    this.cameras.main.ignore(mobileUiElements);
    this.uiCamera.ignore(nonMobileObjects);
  }


  cleanupSceneUi() {
    this.restartText?.setVisible(false);
    this.mobileControls?.setMode('init');
    this.hud?.setVisible(false);
  }

  updateExitGateAura(time) {
    if (!this.exitGateReadyAura?.visible) {
      return;
    }

    const pulse = 0.12 + (Math.sin(time / 180) + 1) * 0.045;
    this.exitGateReadyAura.setAlpha(pulse).setScale(1 + Math.sin(time / 320) * 0.04, 1);
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
      const worldBandMax = Math.max(
        PORTRAIT_LAYOUT.worldBandMin,
        Math.min(PORTRAIT_LAYOUT.worldBandMax, maxWorldBandFromControlNeeds)
      );
      const worldBandHeight = Phaser.Math.Clamp(
        Math.floor(height * PORTRAIT_LAYOUT.worldBandRatio),
        PORTRAIT_LAYOUT.worldBandMin,
        worldBandMax
      );
      camera.setViewport(0, 0, width, worldBandHeight);
      camera.setZoom(PORTRAIT_LAYOUT.portraitZoom);
      camera.setFollowOffset(-140, PORTRAIT_LAYOUT.portraitFollowOffsetY);
      this.mobileControls.setReservedBottomPx(height - worldBandHeight);
      this.restartText.setPosition(
        width / 2,
        Math.max(PORTRAIT_LAYOUT.restartTextMinY, worldBandHeight * PORTRAIT_LAYOUT.restartTextRatioY)
      );
      return;
    }

    camera.setViewport(0, 0, width, height);
    camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
    camera.setFollowOffset(-140, PORTRAIT_LAYOUT.desktopFollowOffsetY);
    this.mobileControls.setReservedBottomPx(0);
    this.restartText.setPosition(width / 2, 90);
  }
}
