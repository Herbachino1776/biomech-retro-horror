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
import { bossPitRunState } from '../systems/BossPitRunState.js';

const CHAMBER = {
  sceneKey: 'Sector04Chamber01Scene',
  worldWidth: 6280,
  floorColliderHeight: 72,
  spawnX: 220,
  spawnY: PLAYER.startY,
  cameraLerp: { x: 0.08, y: 0.08 },
  portraitFollowOffsetX: -112,
  desktopFollowOffsetX: -156
};

const SEGMENTS = [
  { key: ASSET_KEYS.sector04Chamber01BackgroundEntryTerrace, x: 460, y: 216, width: 980, height: 488, tint: 0xd4c6b3, alpha: 0.8 },
  { key: ASSET_KEYS.sector04Chamber01BackgroundWallModule01, x: 1340, y: 214, width: 840, height: 454, tint: 0xb6a898, alpha: 0.62 },
  { key: ASSET_KEYS.sector04Chamber01BackgroundWallModule02, x: 2120, y: 214, width: 840, height: 454, tint: 0xa69888, alpha: 0.58 },
  { key: ASSET_KEYS.sector04Chamber01BackgroundReductionDisplay, x: 3180, y: 212, width: 1100, height: 488, tint: 0xd3c4b0, alpha: 0.77 },
  { key: ASSET_KEYS.sector04Chamber01BackgroundWallModule01, x: 4200, y: 214, width: 840, height: 454, tint: 0xab9c8d, alpha: 0.56 },
  { key: ASSET_KEYS.sector04Chamber01BackgroundWallModule02, x: 4980, y: 214, width: 840, height: 454, tint: 0xa09184, alpha: 0.54 },
  { key: ASSET_KEYS.sector04Chamber01BackgroundThreshold, x: 5800, y: 212, width: 900, height: 470, tint: 0xcdbca8, alpha: 0.74 }
];

const S4C1_ENEMY_SPAWN_Y = PLAYER.startY - 20;

const ENEMIES = {
  bellHerder: {
    ...SKITTER,
    textureKey: ASSET_KEYS.sector04Chamber01EnemyBasicBellHerder,
    speed: 58,
    aggroRange: 258,
    patrolDistance: 120,
    body: { width: 68, height: 52, offsetX: 18, offsetY: 40 },
    presentation: { alpha: 0.98, display: { width: 252, height: 208 }, origin: { x: 0.52, y: 0.95 }, stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.44 } },
    corpseRemainsProfile: 'sector3Basic'
  },
  branchHusk: {
    ...SKITTER,
    textureKey: ASSET_KEYS.sector04Chamber01EnemyBasicBranchHusk,
    speed: 56,
    aggroRange: 252,
    patrolDistance: 114,
    body: { width: 70, height: 52, offsetX: 18, offsetY: 40 },
    presentation: { alpha: 0.98, display: { width: 254, height: 210 }, origin: { x: 0.52, y: 0.95 }, stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.44 } },
    corpseRemainsProfile: 'sector3Basic'
  },
  shearAttendant: {
    ...SKITTER,
    textureKey: ASSET_KEYS.sector04Chamber01EnemyBasicShearAttendant,
    speed: 60,
    aggroRange: 266,
    patrolDistance: 122,
    body: { width: 70, height: 54, offsetX: 18, offsetY: 40 },
    presentation: { alpha: 0.98, display: { width: 258, height: 214 }, origin: { x: 0.52, y: 0.95 }, stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.44 } },
    corpseRemainsProfile: 'sector3Basic'
  },
  reductionSaint: {
    ...SKITTER,
    textureKey: ASSET_KEYS.sector04Chamber01EnemyEliteReductionSaint,
    health: 8,
    speed: 46,
    aggroRange: 296,
    patrolDistance: 92,
    body: { width: 104, height: 80, offsetX: 42, offsetY: 130 },
    presentation: { alpha: 1, display: { width: 388, height: 314 }, origin: { x: 0.52, y: 0.975 }, stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.52 } },
    corpseRemainsProfile: 'sector3Elite'
  }
};

const ENCOUNTER_POCKETS = [
  {
    id: 'corridor-purging-line',
    label: 'PURGING LINE',
    zoneX: 1540,
    zoneY: WORLD.floorY - 72,
    zoneWidth: 660,
    zoneHeight: 226,
    enemies: [
      { type: 'bellHerder', x: 1300 },
      { type: 'branchHusk', x: 1500, wakeDelayMs: 50 },
      { type: 'shearAttendant', x: 1710, wakeDelayMs: 110 }
    ]
  },
  {
    id: 'corridor-wall-reduction',
    label: 'WALL REDUCTION',
    zoneX: 2350,
    zoneY: WORLD.floorY - 74,
    zoneWidth: 760,
    zoneHeight: 236,
    enemies: [
      { type: 'branchHusk', x: 2080 },
      { type: 'bellHerder', x: 2310, wakeDelayMs: 44 },
      { type: 'shearAttendant', x: 2510, wakeDelayMs: 96 },
      { type: 'bellHerder', x: 2680, wakeDelayMs: 146 }
    ]
  },
  {
    id: 'opened-chamber-reduction-reveal',
    label: 'REDUCTION REVEAL',
    zoneX: 3260,
    zoneY: WORLD.floorY - 76,
    zoneWidth: 1020,
    zoneHeight: 244,
    enemies: [
      { type: 'shearAttendant', x: 2890 },
      { type: 'branchHusk', x: 3100, wakeDelayMs: 56 },
      { type: 'reductionSaint', x: 3340, wakeDelayMs: 126 },
      { type: 'bellHerder', x: 3540, wakeDelayMs: 178 }
    ]
  },
  {
    id: 'threshold-lead-up',
    label: 'THRESHOLD LEAD-UP',
    zoneX: 5060,
    zoneY: WORLD.floorY - 74,
    zoneWidth: 740,
    zoneHeight: 236,
    enemies: [
      { type: 'branchHusk', x: 4820 },
      { type: 'bellHerder', x: 5020, wakeDelayMs: 44 },
      { type: 'shearAttendant', x: 5220, wakeDelayMs: 100 }
    ]
  }
];

const LORE_ANCHOR = {
  x: 670,
  y: WORLD.floorY - 78,
  width: 214,
  height: 210,
  cutsceneId: 'sector04-chamber01-litany-of-reduction'
};

const BOSS_PIT_ALTAR = {
  x: 1060,
  y: WORLD.floorY - 104,
  zoneWidth: 214,
  zoneHeight: 210,
  promptOffsetY: -172,
  interactPrompt: 'TRAP ALTAR // DESCEND INTO BOSS PIT\nPress [E] / [Enter]',
  sceneKey: 'Sector04Chamber01BossPitReliquaryStalkerScene'
};

export class Sector04Chamber01Scene extends Phaser.Scene {
  constructor() {
    super(CHAMBER.sceneKey);
  }

  init(data) {
    this.transitionContext = data ?? {};
    this.isRestartingRun = false;
    this.isLoreTransitionActive = false;
    this.bossPitTransitionActive = false;
    this.hasCompletedLoreBeat = false;
    this.hasCompletedBossPitLoop = Boolean(this.transitionContext?.bossPitCompleted || this.transitionContext?.returnFromBossPit)
      || bossPitRunState.hasSector04Chamber01ReliquaryStalkerBossPitCompleted();
    this.enemies = [];
    this.encounterPockets = [];
    this.currentLoreZone = null;
    this.currentBossPitAltar = null;

    if (this.transitionContext?.returnFromBossPit) {
      this.hasCompletedBossPitLoop = true;
      bossPitRunState.markSector04Chamber01ReliquaryStalkerBossPitCompleted();
    }
  }

  create() {
    this.createWorld();
    this.audioDirector = new AudioDirector(this);
    this.audioDirector.playAmbientLoop(ASSET_KEYS.ambientChamber01Loop01, { volume: 0.104 });
    this.createBackdrop();
    this.createPlayer();
    this.createEncounterPockets();
    this.createLoreAnchor();
    this.createBossPitAltar();
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
        this.add.image(segment.x, segment.y, segment.key).setDisplaySize(segment.width, segment.height).setTint(segment.tint).setAlpha(segment.alpha).setDepth(-14.7 + index * 0.01);
      } else {
        this.add.rectangle(segment.x, segment.y + 10, segment.width, segment.height, 0x3d2f2a, 0.78).setDepth(-14.7 + index * 0.01);
      }
      this.add.ellipse(segment.x, WORLD.floorY - 32, segment.width * 0.82, 62, 0x070504, 0.14 + index * 0.012).setDepth(-14.06);
    });

    if (this.textures.exists(ASSET_KEYS.sector04Chamber01AltarLoreShrine)) {
      this.add.image(670, WORLD.floorY - 104, ASSET_KEYS.sector04Chamber01AltarLoreShrine)
        .setDisplaySize(208, 208)
        .setTint(0xdbccb8)
        .setAlpha(0.88)
        .setDepth(-6.1);
    }

    this.add.ellipse(BOSS_PIT_ALTAR.x, WORLD.floorY - 2, 258, 168, 0x1a1412, this.hasCompletedBossPitLoop ? 0.2 : 0.34).setDepth(-6.11);
    this.add.ellipse(BOSS_PIT_ALTAR.x, WORLD.floorY + 6, 196, 102, 0x060504, this.hasCompletedBossPitLoop ? 0.34 : 0.54).setDepth(-6.1);
    this.add.ellipse(BOSS_PIT_ALTAR.x, WORLD.floorY + 8, 132, 52, 0x020201, this.hasCompletedBossPitLoop ? 0.26 : 0.44).setDepth(-6.09);
    this.add.rectangle(BOSS_PIT_ALTAR.x - 56, WORLD.floorY - 22, 74, 12, 0x33261f, this.hasCompletedBossPitLoop ? 0.22 : 0.38).setDepth(-6.08).setAngle(-12);
    this.add.rectangle(BOSS_PIT_ALTAR.x + 56, WORLD.floorY - 22, 74, 12, 0x33261f, this.hasCompletedBossPitLoop ? 0.22 : 0.38).setDepth(-6.08).setAngle(12);

    const trapAltarKey = ASSET_KEYS.sector03Chamber02LoreAltar;
    if (this.textures.exists(trapAltarKey)) {
      this.add.image(BOSS_PIT_ALTAR.x, BOSS_PIT_ALTAR.y, trapAltarKey)
        .setDisplaySize(206, 206)
        .setTint(0xd9cab6)
        .setAlpha(this.hasCompletedBossPitLoop ? 0.38 : 0.86)
        .setDepth(-6.09);
    } else {
      this.add.ellipse(BOSS_PIT_ALTAR.x, BOSS_PIT_ALTAR.y - 2, 146, 166, 0x7f7063, this.hasCompletedBossPitLoop ? 0.3 : 0.76).setDepth(-6.09);
    }
    this.add.ellipse(BOSS_PIT_ALTAR.x, WORLD.floorY - 4, 176, 150, 0xbda27d, this.hasCompletedBossPitLoop ? 0.04 : 0.09).setDepth(-6.04);

    this.terminalBarrier = this.add.rectangle(6120, WORLD.floorY - 70, 92, 232, 0x140e0a, 0.42).setDepth(-4.86);
    this.physics.add.existing(this.terminalBarrier, true);

    this.add.rectangle(CHAMBER.worldWidth / 2, WORLD.floorY - 14, CHAMBER.worldWidth, 96, 0x1a1411, 0.95).setDepth(-6.3);
    this.add.rectangle(CHAMBER.worldWidth / 2, WORLD.floorY - 48, CHAMBER.worldWidth, 24, 0x2c2018, 0.76).setDepth(-6.26);
    this.add.ellipse(CHAMBER.worldWidth / 2, WORLD.floorY + 10, CHAMBER.worldWidth, 54, 0x020202, 0.36).setDepth(-5.94);
  }

  createPlayer() {
    const spawnX = this.transitionContext?.returnFromBossPit
      ? this.transitionContext.returnPlayerX ?? CHAMBER.spawnX
      : CHAMBER.spawnX;
    const spawnY = this.transitionContext?.returnFromBossPit
      ? this.transitionContext.returnPlayerY ?? CHAMBER.spawnY
      : CHAMBER.spawnY;
    this.player = new Player(this, spawnX, spawnY, PLAYER);
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
        const enemySpawnY = enemyConfig.y ?? S4C1_ENEMY_SPAWN_Y;
        const enemy = new SkitterServitor(this, enemyConfig.x, enemySpawnY, baseConfig);
        enemy.awakened = false;
        enemy.pocketWakeAtTime = null;

        this.physics.add.collider(enemy.sprite, this.platforms);
        this.physics.add.collider(enemy.sprite, this.terminalBarrier);
        this.physics.add.overlap(this.player.attackHitbox, enemy.sprite, (attackZone, enemySprite) => {
          if (!this.player.attackActive || enemy.dead || enemy.lastAttackHitId === this.player.attackId || !(enemySprite === enemy.sprite || enemySprite?.gameObject === enemy.sprite)) {
            return;
          }
          enemy.lastAttackHitId = this.player.attackId;
          const knockDirection = Math.sign(enemy.sprite.x - this.player.sprite.x) || this.player.facing;
          enemy.setHitReactionDirection(knockDirection);
          enemy.takeDamage(1, this.time.now);
          this.audioDirector?.playPlayerHit();
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

  createBossPitAltar() {
    const zone = this.add.zone(BOSS_PIT_ALTAR.x, WORLD.floorY - 78, BOSS_PIT_ALTAR.zoneWidth, BOSS_PIT_ALTAR.zoneHeight).setOrigin(0.5);
    this.physics.add.existing(zone, true);
    const prompt = this.add.text(BOSS_PIT_ALTAR.x, BOSS_PIT_ALTAR.y + BOSS_PIT_ALTAR.promptOffsetY, BOSS_PIT_ALTAR.interactPrompt, {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#e4d8c8',
      align: 'center',
      stroke: '#130d0b',
      strokeThickness: 4
    })
      .setOrigin(0.5)
      .setDepth(-4.74)
      .setAlpha(0.94)
      .setVisible(false);
    this.bossPitAltar = { zone, prompt };
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

    if (this.isLoreTransitionActive || this.bossPitTransitionActive) {
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
    this.updateEncounterPockets(time);
    this.refreshLoreZonePresence();
    this.tryBeginLoreSequence(mobileInput);
    this.refreshBossPitAltarPresence();
    this.tryBeginBossPitTransition(mobileInput);
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
    if (this.bossPitTransitionActive) {
      return;
    }
    if (!this.currentLoreZone) {
      return;
    }
    const interactPressed = Phaser.Input.Keyboard.JustDown(this.keyInteract) || Phaser.Input.Keyboard.JustDown(this.keyEnter) || mobileInput.interactPressed;
    if (!interactPressed) {
      return;
    }

    this.beginLoreSequence();
  }

  refreshBossPitAltarPresence() {
    this.currentBossPitAltar = null;
    if (!this.bossPitAltar || this.isLoreTransitionActive || this.bossPitTransitionActive || this.hasCompletedBossPitLoop) {
      this.bossPitAltar?.prompt?.setVisible(false);
      return;
    }

    this.physics.overlap(this.player.sprite, this.bossPitAltar.zone, () => {
      this.currentBossPitAltar = this.bossPitAltar;
    });
    this.bossPitAltar.prompt?.setVisible(Boolean(this.currentBossPitAltar));
  }

  tryBeginBossPitTransition(mobileInput) {
    if (!this.currentBossPitAltar || this.isLoreTransitionActive || this.bossPitTransitionActive || this.hasCompletedBossPitLoop) {
      return;
    }

    const interactPressed = Phaser.Input.Keyboard.JustDown(this.keyInteract) || Phaser.Input.Keyboard.JustDown(this.keyEnter) || mobileInput.interactPressed;
    if (!interactPressed) {
      return;
    }

    this.beginBossPitTransition();
  }

  beginBossPitTransition() {
    if (!this.currentBossPitAltar || this.isLoreTransitionActive || this.bossPitTransitionActive || this.hasCompletedBossPitLoop) {
      return;
    }

    this.bossPitTransitionActive = true;
    this.currentBossPitAltar = null;
    this.bossPitAltar?.prompt?.setVisible(false);
    this.mobileControls.setMode('dialogue');
    this.player.body.setVelocity(0, 0);
    this.player.body.setEnable(false);
    this.enemies.forEach((enemy) => enemy.body?.setVelocity(0, 0));
    this.audioDirector?.stopAmbientLoop();
    this.hud?.setVisible(false);
    this.mobileControls.setMode('init');
    this.uiCamera?.setVisible(false);

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.audioDirector?.shutdown();
      this.scene.start(BOSS_PIT_ALTAR.sceneKey, {
        fromScene: this.scene.key,
        altarX: BOSS_PIT_ALTAR.x,
        altarY: BOSS_PIT_ALTAR.y
      });
    });

    this.cameras.main.shake(240, 0.0038, true);
    this.cameras.main.fadeOut(420, 0, 0, 0);
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
    this.audioDirector?.playAmbientLoop(ASSET_KEYS.ambientChamber01Loop01, { volume: 0.104 });
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

    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'Sector04Chamber01MobileUiCamera');
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
