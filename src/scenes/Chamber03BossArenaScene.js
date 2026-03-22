import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { COLORS, PLAYER, WORLD } from '../data/milestone1Config.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';
import { restartRunFromDeath } from '../systems/RunReset.js';
import { AudioDirector } from '../audio/AudioDirector.js';

const CHAMBER03_BOSS_ARENA = {
  worldWidth: 1920,
  spawnX: 248,
  spawnY: PLAYER.startY,
  floorColliderHeight: 72,
  floorDisplayHeight: 124,
  floorDepthY: WORLD.floorY - 42,
  floorStripYOffset: 16,
  backdropY: 206,
  backdropWidth: 1060,
  backdropHeight: 560,
  sideWallWidth: 430,
  sideWallHeight: 540,
  sideWallInset: 82,
  cameraLerp: { x: 0.08, y: 0.08 },
  portraitFollowOffsetX: -96,
  desktopFollowOffsetX: -126,
  lowerDepthBandHeight: 280,
  lowerDepthBandAlpha: 0.18,
  floorShadowAlpha: 0.34,
  bossAnchorX: 1464,
  bossAnchorY: WORLD.floorY - 10,
  bossWidth: 364,
  bossHeight: 418,
  bossOriginX: 0.5,
  bossOriginY: 0.98,
  bossPromptOffsetY: -228,
  bossRevealPromptDuration: 1800,
  omenDelayMs: 260,
  groundedBodyRestingYOffset: 0,
  playerHalo: {
    fill: 0xd8cfbb,
    alpha: 0.18,
    scale: 1.1
  }
};

const CHAMBER03_BOSS_OMEN_CUTSCENE_ID = 'chamber03-precentor-threshold';

const CHAMBER03_BOSS_COMBAT = {
  name: 'THE PRECENTOR OF MARROW',
  subtitle: 'Choir Hall Adjudicator',
  maxHealth: 24,
  phaseTwoThreshold: 10,
  approachRange: 248,
  idealRange: 172,
  closeRetreatRange: 112,
  phaseOne: {
    driftSpeed: 52,
    retreatSpeed: 68,
    lungeTelegraphMs: 760,
    lungeSpeed: 314,
    lungeLiftVelocity: -126,
    lungeDurationMs: 330,
    lungeRecoveryMs: 720,
    lungeCooldownMs: 2150,
    pulseTelegraphMs: 880,
    pulseRecoveryMs: 620,
    pulseCooldownMs: 2650,
    pulseSpeed: 236,
    pulseDamage: 1,
    contactDamage: 1,
    contactDamageCooldownMs: 980
  },
  phaseTwo: {
    driftSpeed: 76,
    retreatSpeed: 92,
    lungeTelegraphMs: 520,
    lungeSpeed: 386,
    lungeLiftVelocity: -168,
    lungeDurationMs: 380,
    lungeRecoveryMs: 440,
    lungeCooldownMs: 1460,
    pulseTelegraphMs: 620,
    pulseRecoveryMs: 360,
    pulseCooldownMs: 1980,
    pulseSpeed: 274,
    pulseDamage: 1,
    contactDamage: 2,
    contactDamageCooldownMs: 860
  },
  body: { width: 112, height: 230, offsetX: 126, offsetY: 150 },
  hurtFlashMs: 220,
  hitPulseMs: 260,
  hurtRecoverMs: 180,
  hurtRecoilVelocityX: 108,
  hurtRecoilVelocityY: -76,
  projectileIntervalMs: 170,
  projectileWidth: 60,
  projectileHeight: 28,
  projectileLifetimeMs: 2100,
  projectileSpawnOffsetX: 118,
  projectileSpawnOffsetY: 26,
  projectilePhaseTwoSpreadY: 22,
  arenaPaddingX: 164
};

const CHAMBER03_FINALE = {
  bloodFlashMs: 860,
  payoffRevealDelayMs: 760,
  payoffHoldMs: 2100,
  progressionRevealDelayMs: 3140,
  progressionInteractDelayMs: 360,
  progressionPromptText: 'DESCEND THROUGH THE RUPTURE',
  payoffTitle: 'THE PRECENTOR IS SILENCED',
  payoffBody: 'Sector I stands complete.\nThe marrow route below has opened.',
  holdingStateReason: 'sector-i-complete-holding-threshold'
};

export class Chamber03BossArenaScene extends Phaser.Scene {
  constructor() {
    super('Chamber03BossArenaScene');
  }

  init(data) {
    this.transitionContext = data ?? {};
    this.isRestartingRun = false;
    this.isOmenBeatActive = false;
    this.hasResolvedOmenBeat = false;
    this.hasActivatedBoss = false;
    this.bossAttackHitId = -1;
    this.isSectorFinaleActive = false;
    this.currentProgressionThresholdZone = null;
  }

  create() {
    this.createWorldBounds();
    this.createArenaEnvironment();
    this.createAudio();
    this.createPlayerAndColliders();
    this.createBossPresentation();
    this.createUiAndInput();
    this.configureCameraAndLayout();
    this.createFinaleProgressionGate();
    this.registerLoreCutsceneReturn();
    this.cameras.main.fadeIn(420, 0, 0, 0);
    this.time.delayedCall(CHAMBER03_BOSS_ARENA.omenDelayMs, () => {
      this.beginPreBossOmenBeat();
    });
  }

  createWorldBounds() {
    this.physics.world.gravity.y = WORLD.gravityY;
    this.cameras.main.setBounds(0, 0, CHAMBER03_BOSS_ARENA.worldWidth, WORLD.height);
    this.physics.world.setBounds(0, 0, CHAMBER03_BOSS_ARENA.worldWidth, WORLD.height);
    this.cameras.main.setBackgroundColor('#060505');

    this.platforms = this.physics.add.staticGroup();
  }

  createArenaEnvironment() {
    this.add.rectangle(
      CHAMBER03_BOSS_ARENA.worldWidth / 2,
      WORLD.height / 2,
      CHAMBER03_BOSS_ARENA.worldWidth,
      WORLD.height,
      COLORS.backdrop,
      1
    ).setDepth(-16);

    this.add.rectangle(
      CHAMBER03_BOSS_ARENA.worldWidth / 2,
      WORLD.floorY - 92,
      CHAMBER03_BOSS_ARENA.worldWidth,
      CHAMBER03_BOSS_ARENA.lowerDepthBandHeight,
      COLORS.oil,
      CHAMBER03_BOSS_ARENA.lowerDepthBandAlpha
    ).setDepth(-14.2);

    this.renderBossBackdrop();
    this.renderArenaFloor();
    this.createInvisiblePlatform(
      CHAMBER03_BOSS_ARENA.worldWidth / 2,
      WORLD.floorY + 28,
      CHAMBER03_BOSS_ARENA.worldWidth,
      CHAMBER03_BOSS_ARENA.floorColliderHeight
    );
  }

  renderBossBackdrop() {
    const centerX = CHAMBER03_BOSS_ARENA.worldWidth / 2;
    const sideWallKey = ASSET_KEYS.chamber03BackgroundWallModule;
    const hasSideWallArt = this.textures.exists(sideWallKey);
    const sideWallOffset = CHAMBER03_BOSS_ARENA.backdropWidth / 2 + CHAMBER03_BOSS_ARENA.sideWallInset;

    if (hasSideWallArt) {
      this.add
        .tileSprite(
          centerX,
          CHAMBER03_BOSS_ARENA.backdropY + 18,
          CHAMBER03_BOSS_ARENA.backdropWidth + 220,
          CHAMBER03_BOSS_ARENA.backdropHeight,
          sideWallKey
        )
        .setTint(0xb8a48f)
        .setAlpha(0.42)
        .setDepth(-14.76);
    }

    [-1, 1].forEach((direction, index) => {
      const wallX = centerX + sideWallOffset * direction;
      const wallDepth = -14.82 + index * 0.01;

      if (hasSideWallArt) {
        this.add
          .image(wallX, CHAMBER03_BOSS_ARENA.backdropY + 12, sideWallKey)
          .setDisplaySize(CHAMBER03_BOSS_ARENA.sideWallWidth, CHAMBER03_BOSS_ARENA.sideWallHeight)
          .setTint(index === 0 ? 0xb8a48f : 0xc1ad96)
          .setAlpha(0.76)
          .setFlipX(direction > 0)
          .setDepth(wallDepth);
      } else {
        this.add
          .rectangle(
            wallX,
            CHAMBER03_BOSS_ARENA.backdropY + 18,
            CHAMBER03_BOSS_ARENA.sideWallWidth,
            CHAMBER03_BOSS_ARENA.sideWallHeight,
            0x473a31,
            0.8
          )
          .setDepth(wallDepth);
      }

      this.add
        .ellipse(wallX, WORLD.floorY - 42, CHAMBER03_BOSS_ARENA.sideWallWidth * 0.88, 108, 0x090707, 0.16)
        .setDepth(-13.95);
    });

    if (this.textures.exists(ASSET_KEYS.chamber03BackgroundBossDais)) {
      this.add
        .image(centerX, CHAMBER03_BOSS_ARENA.backdropY, ASSET_KEYS.chamber03BackgroundBossDais)
        .setDisplaySize(CHAMBER03_BOSS_ARENA.backdropWidth, CHAMBER03_BOSS_ARENA.backdropHeight)
        .setTint(0xcfbea5)
        .setAlpha(0.8)
        .setDepth(-14.7);
    } else if (hasSideWallArt) {
      this.add
        .tileSprite(
          centerX,
          CHAMBER03_BOSS_ARENA.backdropY + 14,
          CHAMBER03_BOSS_ARENA.backdropWidth,
          CHAMBER03_BOSS_ARENA.backdropHeight,
          sideWallKey
        )
        .setTint(0xc3af98)
        .setAlpha(0.68)
        .setDepth(-14.7);
    } else {
      this.add
        .rectangle(
          centerX,
          CHAMBER03_BOSS_ARENA.backdropY + 14,
          CHAMBER03_BOSS_ARENA.backdropWidth,
          CHAMBER03_BOSS_ARENA.backdropHeight,
          0x4f4137,
          0.78
        )
        .setDepth(-14.7);

      this.add
        .text(centerX, CHAMBER03_BOSS_ARENA.backdropY + 4, 'CHAMBER 03\nBOSS DAIS', {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#d7c8b3',
          align: 'center'
        })
        .setOrigin(0.5)
        .setAlpha(0.8)
        .setDepth(-14.6);
    }

    this.add.ellipse(centerX, WORLD.floorY - 40, 860, 132, 0x130f0e, 0.26).setDepth(-13.9);
    this.add.ellipse(centerX, WORLD.floorY - 10, 420, 86, COLORS.sickly, 0.1).setDepth(-13.7);
  }

  renderArenaFloor() {
    this.add
      .rectangle(
        CHAMBER03_BOSS_ARENA.worldWidth / 2,
        CHAMBER03_BOSS_ARENA.floorDepthY,
        CHAMBER03_BOSS_ARENA.worldWidth,
        244,
        COLORS.architecture,
        0.62
      )
      .setDepth(-13);

    if (this.textures.exists(ASSET_KEYS.chamber02FloorStrip)) {
      this.add
        .tileSprite(
          CHAMBER03_BOSS_ARENA.worldWidth / 2,
          WORLD.floorY + CHAMBER03_BOSS_ARENA.floorStripYOffset,
          CHAMBER03_BOSS_ARENA.worldWidth,
          CHAMBER03_BOSS_ARENA.floorDisplayHeight,
          ASSET_KEYS.chamber02FloorStrip
        )
        .setTint(0xd1c0a8)
        .setAlpha(0.74)
        .setDepth(-6);
    } else if (this.textures.exists(ASSET_KEYS.chamber01FloorStrip)) {
      this.add
        .tileSprite(
          CHAMBER03_BOSS_ARENA.worldWidth / 2,
          WORLD.floorY + 12,
          CHAMBER03_BOSS_ARENA.worldWidth,
          84,
          ASSET_KEYS.chamber01FloorStrip
        )
        .setTint(0xd7c7b0)
        .setAlpha(0.74)
        .setDepth(-6);
    } else {
      this.add
        .rectangle(
          CHAMBER03_BOSS_ARENA.worldWidth / 2,
          WORLD.floorY + 16,
          CHAMBER03_BOSS_ARENA.worldWidth,
          CHAMBER03_BOSS_ARENA.floorDisplayHeight,
          COLORS.foreground,
          0.92
        )
        .setDepth(-6);
    }

    this.add
      .ellipse(
        CHAMBER03_BOSS_ARENA.worldWidth / 2,
        WORLD.floorY + 10,
        CHAMBER03_BOSS_ARENA.worldWidth,
        58,
        0x050404,
        CHAMBER03_BOSS_ARENA.floorShadowAlpha
      )
      .setDepth(-5);
  }

  createAudio() {
    this.audioDirector = new AudioDirector(this);
  }

  createPlayerAndColliders() {
    this.player = new Player(this, CHAMBER03_BOSS_ARENA.spawnX, CHAMBER03_BOSS_ARENA.spawnY, PLAYER);
    this.applyGameplayReadabilitySupport(this.player.sprite, CHAMBER03_BOSS_ARENA.playerHalo);
    this.physics.add.collider(this.player.sprite, this.platforms);
  }

  createBossPresentation() {
    const bossX = CHAMBER03_BOSS_ARENA.bossAnchorX;
    const bossY = CHAMBER03_BOSS_ARENA.bossAnchorY;

    this.bossCombat = {
      health: CHAMBER03_BOSS_COMBAT.maxHealth,
      maxHealth: CHAMBER03_BOSS_COMBAT.maxHealth,
      phase: 1,
      state: 'dormant',
      facing: -1,
      lastAttackAt: -Infinity,
      lastLungeAt: -Infinity,
      lastPulseAt: -Infinity,
      stateUntil: -Infinity,
      telegraphStartedAt: -Infinity,
      telegraphDurationMs: 0,
      hitPulseUntil: -Infinity,
      hurtUntil: -Infinity,
      lastDamageFlashTime: -Infinity,
      lastContactDamageTime: -Infinity,
      projectileTimer: null,
      activeProjectiles: [],
      defeated: false,
      attackPatternIndex: 0,
      attackLabel: '',
      phaseShiftAnnounced: false
    };

    this.bossArrivalShadow = this.add.ellipse(bossX, WORLD.floorY + 8, 240, 38, 0x050404, 0).setDepth(-4.2);
    this.bossArrivalAura = this.add.ellipse(bossX, bossY + 18, 228, 312, COLORS.sickly, 0).setDepth(-4.1);
    this.bossArrivalHalo = this.add.ellipse(bossX, bossY - 16, 170, 244, 0xdcccae, 0).setDepth(-4.05);

    if (this.textures.exists(ASSET_KEYS.chamber03BossPrecentor)) {
      this.bossSprite = this.add
        .image(bossX, bossY, ASSET_KEYS.chamber03BossPrecentor)
        .setDisplaySize(CHAMBER03_BOSS_ARENA.bossWidth, CHAMBER03_BOSS_ARENA.bossHeight)
        .setOrigin(CHAMBER03_BOSS_ARENA.bossOriginX, CHAMBER03_BOSS_ARENA.bossOriginY)
        .setTint(0xd2c1aa)
        .setAlpha(0)
        .setDepth(6.2)
        .setVisible(false);
    } else {
      this.bossSprite = this.add
        .ellipse(bossX, bossY, 212, 312, 0x4d3c34, 0)
        .setOrigin(CHAMBER03_BOSS_ARENA.bossOriginX, CHAMBER03_BOSS_ARENA.bossOriginY)
        .setStrokeStyle(3, 0xd7c8b2, 0)
        .setDepth(6.2)
        .setVisible(false);

      this.bossFallbackLabel = this.add
        .text(bossX, bossY - 12, 'PRECENTOR', {
          fontFamily: 'monospace',
          fontSize: '16px',
          color: '#d7c8b2',
          align: 'center'
        })
        .setOrigin(0.5)
        .setDepth(6.24)
        .setVisible(false);
    }

    this.bossBaseScaleX = this.bossSprite.scaleX;
    this.bossBaseScaleY = this.bossSprite.scaleY;

    this.physics.add.existing(this.bossSprite);
    this.bossBody = this.bossSprite.body;
    this.bossBody.setCollideWorldBounds(true);
    this.bossBody.setAllowGravity(true);
    const scaleX = Math.abs(this.bossSprite.scaleX) || 1;
    const scaleY = Math.abs(this.bossSprite.scaleY) || 1;
    this.bossBody.setSize(CHAMBER03_BOSS_COMBAT.body.width / scaleX, CHAMBER03_BOSS_COMBAT.body.height / scaleY);
    this.bossBody.setOffset(CHAMBER03_BOSS_COMBAT.body.offsetX / scaleX, CHAMBER03_BOSS_COMBAT.body.offsetY / scaleY);
    this.bossBody.enable = false;
    this.bossGroundedBodyOffsetY =
      CHAMBER03_BOSS_ARENA.bossHeight * CHAMBER03_BOSS_ARENA.bossOriginY -
      (CHAMBER03_BOSS_COMBAT.body.offsetY + CHAMBER03_BOSS_COMBAT.body.height) +
      CHAMBER03_BOSS_ARENA.groundedBodyRestingYOffset;

    this.physics.add.collider(this.bossSprite, this.platforms);
    this.physics.add.overlap(this.player.attackHitbox, this.bossSprite, this.handlePlayerHitBoss, null, this);
    this.physics.add.overlap(this.player.sprite, this.bossSprite, this.handleBossContactPlayer, null, this);
    this.resetBossPresentationState();

    this.bossStatusPrompt = this.add
      .text(bossX, bossY + CHAMBER03_BOSS_ARENA.bossPromptOffsetY, '', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#a4b687',
        align: 'center',
        stroke: '#0f0b0a',
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(36)
      .setVisible(false);

    this.sectorPayoffText = this.add
      .text(this.scale.width / 2, this.getBossPromptY() + 42, '', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#d7ccb9',
        align: 'center',
        stroke: '#0c0908',
        strokeThickness: 5,
        lineSpacing: 8
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(37)
      .setAlpha(0)
      .setVisible(false);
  }

  createUiAndInput() {
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

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.applyResponsiveLayout, this);
      this.game.events.off('lore-cutscene-complete', this.handleLoreCutsceneComplete, this);
    });
  }

  configureCameraAndLayout() {
    this.cameras.main.startFollow(
      this.player.sprite,
      true,
      CHAMBER03_BOSS_ARENA.cameraLerp.x,
      CHAMBER03_BOSS_ARENA.cameraLerp.y,
      CHAMBER03_BOSS_ARENA.desktopFollowOffsetX,
      0
    );
    this.scale.on('resize', this.applyResponsiveLayout, this);
    this.applyResponsiveLayout();
    this.mobileControls.setMode('gameplay');
    this.hud.update(this.player.health, PLAYER.maxHealth);
    this.updateBossHud(this.time.now);
  }

  createFinaleProgressionGate() {
    const gateX = CHAMBER03_BOSS_ARENA.worldWidth - 202;
    const gateY = WORLD.floorY - 116;

    this.progressionGate = this.add.container(gateX, gateY).setDepth(5.7).setVisible(false).setAlpha(0);

    const gateShadow = this.add.ellipse(0, 132, 248, 42, 0x050404, 0.32);
    const gateAura = this.add.ellipse(0, 8, 136, 232, 0x89a274, 0.18);
    const gateCore = this.add.ellipse(0, -10, 76, 186, 0xd5c3aa, 0.84).setStrokeStyle(3, 0xe4d5bc, 0.3);
    const gateMaw = this.add.ellipse(0, -12, 28, 142, 0x090707, 0.94);
    const leftSpine = this.add.rectangle(-44, 10, 18, 188, 0x2c201c, 0.82).setAngle(-8);
    const rightSpine = this.add.rectangle(44, 10, 18, 188, 0x2c201c, 0.82).setAngle(8);

    this.progressionGate.add([gateShadow, gateAura, gateCore, gateMaw, leftSpine, rightSpine]);

    if (this.textures.exists(ASSET_KEYS.chamber03BackgroundThreshold)) {
      const thresholdShell = this.add
        .image(0, 0, ASSET_KEYS.chamber03BackgroundThreshold)
        .setDisplaySize(236, 304)
        .setTint(0xc7b197)
        .setAlpha(0.86);
      this.progressionGate.add(thresholdShell);
    }

    this.progressionGatePrompt = this.add
      .text(gateX, gateY - 196, CHAMBER03_FINALE.progressionPromptText, {
        fontFamily: 'monospace',
        fontSize: '15px',
        color: '#d8cfba',
        align: 'center',
        stroke: '#100c0b',
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setDepth(35)
      .setVisible(false);

    this.progressionThresholdZone = this.add.zone(gateX, WORLD.floorY - 42, 180, 212).setOrigin(0.5);
    this.physics.add.existing(this.progressionThresholdZone, true);
    this.progressionThresholdZone.body.enable = false;
  }

  registerLoreCutsceneReturn() {
    this.game.events.on('lore-cutscene-complete', this.handleLoreCutsceneComplete, this);
  }

  beginPreBossOmenBeat() {
    if (this.hasResolvedOmenBeat || this.isOmenBeatActive) {
      return;
    }

    const omenCutscene = this.scene.get('LoreCutsceneScene');
    const hasOmenCutscene = Boolean(omenCutscene) && omenCutscene.sys.settings.status !== Phaser.Scenes.STOPPED;

    this.isOmenBeatActive = true;
    this.mobileControls.setMode('init');
    this.player.body.setVelocity(0, 0);
    this.player.body.setEnable(false);
    this.player.attackHitbox?.body?.setEnable(false);

    if (!hasOmenCutscene) {
      this.resolvePreBossOmenBeat({ usedFallback: true });
      return;
    }

    this.scene.pause();
    this.scene.launch('LoreCutsceneScene', {
      cutsceneId: CHAMBER03_BOSS_OMEN_CUTSCENE_ID,
      returnSceneKey: this.scene.key
    });
  }

  handleLoreCutsceneComplete({ cutsceneId } = {}) {
    if (cutsceneId !== CHAMBER03_BOSS_OMEN_CUTSCENE_ID || this.hasResolvedOmenBeat) {
      return;
    }

    this.resolvePreBossOmenBeat({ usedFallback: false });
  }

  resolvePreBossOmenBeat({ usedFallback = false } = {}) {
    if (this.hasResolvedOmenBeat) {
      return;
    }

    this.hasResolvedOmenBeat = true;
    this.isOmenBeatActive = false;
    this.player.body.setEnable(true);
    this.activateBoss({ usedFallback });
  }

  activateBoss({ usedFallback = false } = {}) {
    if (this.hasActivatedBoss) {
      return;
    }

    this.hasActivatedBoss = true;
    this.bossCombat.state = 'idle';
    this.bossCombat.attackLabel = '';
    this.resetBossPresentationState();
    this.bossBody.enable = true;
    this.bossBody.setVelocity(0, 0);
    this.bossSprite.setVisible(true).setAlpha(1);
    this.bossFallbackLabel?.setVisible(true).setAlpha(0.8);
    this.bossArrivalShadow?.setAlpha(0.22);
    this.bossArrivalAura?.setAlpha(usedFallback ? 0.16 : 0.12);
    this.bossArrivalHalo?.setAlpha(usedFallback ? 0.1 : 0.08);
    this.bossStatusPrompt
      ?.setText(usedFallback ? 'THE PRECENTOR ARRIVES WITHOUT OMEN' : 'THE PRECENTOR STANDS IN JUDGMENT')
      .setPosition(this.scale.width / 2, this.getBossPromptY())
      .setVisible(true);

    this.time.delayedCall(CHAMBER03_BOSS_ARENA.bossRevealPromptDuration, () => {
      this.bossStatusPrompt?.setVisible(false);
    });

    this.tweens.add({
      targets: [this.bossSprite, this.bossFallbackLabel].filter(Boolean),
      alpha: { from: 0, to: 1 },
      duration: 520,
      ease: 'Sine.out'
    });

    this.mobileControls.setMode('gameplay');
    this.updateBossHud(this.time.now);
  }

  update(time) {
    const mobileInput = this.mobileControls.getInputState();

    if (this.player.isDead) {
      this.mobileControls.setMode('dead');
      this.restartText.setVisible(true).setText('VESSEL FAILURE\nPress [R] to re-seed chamber');

      if ((Phaser.Input.Keyboard.JustDown(this.keyRestart) || mobileInput.interactPressed) && !this.isRestartingRun) {
        this.isRestartingRun = true;
        restartRunFromDeath(this);
      }

      this.updateBossHud(time);
      return;
    }

    if (this.isOmenBeatActive) {
      this.restartText.setVisible(false);
      this.mobileControls.setMode('init');
      this.player.body.setVelocity(0, 0);
      this.updateBossHud(time);
      return;
    }

    if (this.isSectorFinaleActive) {
      this.restartText.setVisible(false);
      this.mobileControls.setMode('gameplay');
      const finaleInput = {
        left: this.cursors.left.isDown || mobileInput.left,
        right: this.cursors.right.isDown || mobileInput.right,
        jumpPressed:
          Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
          Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
          mobileInput.jumpPressed,
        attackPressed: false
      };
      this.player.update(time, finaleInput);
      this.refreshProgressionThresholdPresence();
      this.tryUseProgressionThreshold(mobileInput);
      this.updateBossHud(time);
      this.updateFinaleGatePulse(time);
      return;
    }

    this.restartText.setVisible(false);
    this.mobileControls.setMode('gameplay');

    const input = {
      left: this.cursors.left.isDown || mobileInput.left,
      right: this.cursors.right.isDown || mobileInput.right,
      jumpPressed:
        Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
        mobileInput.jumpPressed,
      attackPressed: Phaser.Input.Keyboard.JustDown(this.keyAttack) || mobileInput.attackPressed
    };

    this.player.update(time, input);
    this.updateBossPresence(time);
    this.refreshProgressionThresholdPresence();
    this.tryUseProgressionThreshold(mobileInput);
    this.updateFinaleGatePulse(time);
    this.hud.update(this.player.health, PLAYER.maxHealth);
    this.updateBossHud(time);
  }

  getBossPhaseConfig() {
    return this.bossCombat?.phase === 2 ? CHAMBER03_BOSS_COMBAT.phaseTwo : CHAMBER03_BOSS_COMBAT.phaseOne;
  }

  getBossTelegraphProgress(time = this.time.now) {
    if (!this.bossCombat || !this.bossCombat.telegraphDurationMs || !this.isBossTelegraphing()) {
      return 0;
    }

    return Phaser.Math.Clamp(
      (time - this.bossCombat.telegraphStartedAt) / this.bossCombat.telegraphDurationMs,
      0,
      1
    );
  }

  isBossTelegraphing() {
    return this.bossCombat && (this.bossCombat.state === 'telegraph-lunge' || this.bossCombat.state === 'telegraph-pulse');
  }

  updateBossHud(time) {
    this.hud.setBossBarState({
      visible: this.hasActivatedBoss && !this.bossCombat?.defeated,
      name: CHAMBER03_BOSS_COMBAT.name,
      subtitle: this.bossCombat?.phase === 2 ? 'Ruptured Verdict' : CHAMBER03_BOSS_COMBAT.subtitle,
      current: this.bossCombat?.health ?? 0,
      max: this.bossCombat?.maxHealth ?? CHAMBER03_BOSS_COMBAT.maxHealth,
      telegraph: this.getBossTelegraphProgress(time),
      wounded: time < (this.bossCombat?.lastDamageFlashTime ?? -Infinity) + CHAMBER03_BOSS_COMBAT.hurtFlashMs
    });
  }

  handlePlayerHitBoss(_hitbox, bossSprite) {
    if (!this.player.attackActive || !this.hasActivatedBoss || this.bossCombat?.defeated || bossSprite !== this.bossSprite) {
      return;
    }

    if (this.bossAttackHitId === this.player.attackId) {
      return;
    }

    this.bossAttackHitId = this.player.attackId;
    this.damageBoss(1, this.time.now, Math.sign(this.bossSprite.x - this.player.sprite.x) || this.player.facing);
    this.audioDirector?.playPlayerHit();
  }

  damageBoss(amount, time, knockDirection = 1) {
    if (!this.bossCombat || this.bossCombat.defeated) {
      return false;
    }

    this.bossCombat.health = Math.max(0, this.bossCombat.health - amount);
    this.bossCombat.lastDamageFlashTime = time;
    this.bossCombat.hitPulseUntil = time + CHAMBER03_BOSS_COMBAT.hitPulseMs;
    this.bossCombat.hurtUntil = time + CHAMBER03_BOSS_COMBAT.hurtRecoverMs;
    this.bossCombat.state = 'hurt';
    this.bossCombat.stateUntil = this.bossCombat.hurtUntil;
    this.bossCombat.attackLabel = 'RECOIL';
    this.cancelBossProjectileTimer();
    this.bossBody.setVelocityX(-knockDirection * CHAMBER03_BOSS_COMBAT.hurtRecoilVelocityX);
    this.bossBody.setVelocityY(CHAMBER03_BOSS_COMBAT.hurtRecoilVelocityY);
    this.audioDirector?.playEnemyHurt('miniboss');

    if (this.bossCombat.phase === 1 && this.bossCombat.health <= CHAMBER03_BOSS_COMBAT.phaseTwoThreshold) {
      this.triggerBossPhaseShift(time);
    }

    if (this.bossCombat.health <= 0) {
      this.defeatBoss();
    }

    return true;
  }

  triggerBossPhaseShift(time) {
    this.bossCombat.phase = 2;
    this.bossCombat.phaseShiftAnnounced = true;
    this.bossCombat.state = 'phase-shift';
    this.bossCombat.stateUntil = time + 720;
    this.bossCombat.lastAttackAt = time - 520;
    this.bossCombat.attackLabel = 'RUPTURE';
    this.bossStatusPrompt
      ?.setText('THE PRECENTOR SHREDS ITS LITURGY')
      .setPosition(this.scale.width / 2, this.getBossPromptY())
      .setVisible(true);
    this.time.delayedCall(1600, () => {
      this.bossStatusPrompt?.setVisible(false);
    });
    this.tweens.add({
      targets: this.bossArrivalAura,
      alpha: 0.28,
      scaleX: 1.12,
      scaleY: 1.08,
      duration: 320,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.inOut'
    });
    this.tweens.add({
      targets: this.bossArrivalHalo,
      alpha: 0.2,
      duration: 280,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.inOut'
    });
  }

  defeatBoss() {
    if (!this.bossCombat || this.bossCombat.defeated) {
      return;
    }

    this.bossCombat.defeated = true;
    this.bossCombat.state = 'defeated';
    this.cancelBossProjectileTimer();
    this.clearBossProjectiles();
    this.tweens.killTweensOf([this.bossSprite, this.bossFallbackLabel, this.bossArrivalAura, this.bossArrivalHalo].filter(Boolean));
    this.resetBossPresentationState();
    this.bossBody.enable = false;
    this.bossBody.setVelocity(0, 0);
    this.audioDirector?.playEnemyDeath('miniboss');
    this.bossStatusPrompt
      ?.setText(CHAMBER03_FINALE.payoffTitle)
      .setPosition(this.scale.width / 2, this.getBossPromptY())
      .setVisible(true);
    this.sectorPayoffText
      ?.setText(CHAMBER03_FINALE.payoffBody)
      .setPosition(this.scale.width / 2, this.getBossPromptY() + 44);
    this.triggerSectorFinalePayoff();
    this.tweens.add({
      targets: [this.bossSprite, this.bossFallbackLabel].filter(Boolean),
      alpha: 0.06,
      y: '-=42',
      duration: 1180,
      ease: 'Cubic.easeOut'
    });
    this.tweens.add({
      targets: this.bossArrivalAura,
      alpha: 0.06,
      duration: 860,
      ease: 'Sine.out'
    });
    this.tweens.add({
      targets: this.bossArrivalHalo,
      alpha: 0.05,
      duration: 860,
      ease: 'Sine.out'
    });
  }

  triggerSectorFinalePayoff() {
    this.isSectorFinaleActive = true;
    this.currentProgressionThresholdZone = null;
    this.player.attackHitbox?.body?.setEnable(false);
    this.cameras.main.shake(920, 0.028, true);
    this.time.delayedCall(150, () => this.cameras.main.shake(680, 0.024, true));
    this.time.delayedCall(330, () => this.cameras.main.shake(560, 0.02, true));
    this.time.delayedCall(90, () => {
      this.spawnSectorFinaleAftermath(this.bossSprite.x, WORLD.floorY - 2);
    });
    this.time.delayedCall(220, () => {
      this.audioDirector?.playBanishmentSting();
    });
    this.time.delayedCall(CHAMBER03_FINALE.payoffRevealDelayMs, () => {
      this.showSectorPayoffText();
    });
    this.time.delayedCall(CHAMBER03_FINALE.progressionRevealDelayMs, () => {
      this.revealProgressionGate();
    });
  }

  spawnSectorFinaleAftermath(x, y) {
    this.bossAftermathPool?.destroy(true);
    this.bossAftermathBurst?.destroy(true);

    const burst = this.add.container(x, y - 116).setDepth(6.12);
    const splashA = this.add.ellipse(0, 0, 210, 118, 0x561517, 0.82).setAngle(-18);
    const splashB = this.add.ellipse(-52, 8, 132, 80, 0x6e1b1c, 0.72).setAngle(-34);
    const splashC = this.add.ellipse(64, 12, 126, 76, 0x3e1012, 0.68).setAngle(26);
    const mist = this.add.ellipse(0, -22, 244, 126, 0xb97563, 0.14);
    burst.add([splashA, splashB, splashC, mist]);
    burst.setScale(0.32).setAlpha(0);

    this.tweens.add({
      targets: burst,
      scaleX: 1.08,
      scaleY: 1.04,
      alpha: 0.94,
      duration: 360,
      ease: 'Cubic.easeOut',
      yoyo: false
    });
    this.tweens.add({
      targets: burst,
      alpha: 0,
      y: burst.y - 32,
      duration: 980,
      delay: 240,
      ease: 'Sine.easeIn',
      onComplete: () => burst.destroy()
    });

    const pool = this.add.container(x, y).setDepth(1.4);
    const shadow = this.add.ellipse(0, 10, 324, 64, 0x090505, 0.5);
    const outerPool = this.add.ellipse(0, 0, 294, 66, 0x3a1012, 0.9).setStrokeStyle(5, 0x724746, 0.24);
    const midPool = this.add.ellipse(-18, -2, 236, 48, 0x631719, 0.78);
    const tornGloss = this.add.ellipse(42, -10, 118, 18, 0xb97160, 0.2);
    const clotA = this.add.ellipse(-78, 6, 82, 18, 0x220809, 0.5);
    const clotB = this.add.ellipse(70, 8, 64, 16, 0x2b0c0d, 0.46);
    pool.add([shadow, outerPool, midPool, tornGloss, clotA, clotB]);
    pool.setScale(0.15, 0.15).setAlpha(0);

    this.tweens.add({
      targets: pool,
      scaleX: 1.08,
      scaleY: 1,
      alpha: 1,
      duration: 720,
      ease: 'Cubic.easeOut'
    });

    this.bossAftermathBurst = burst;
    this.bossAftermathPool = pool;
  }

  showSectorPayoffText() {
    if (!this.bossStatusPrompt || !this.sectorPayoffText) {
      return;
    }

    this.tweens.killTweensOf([this.bossStatusPrompt, this.sectorPayoffText]);
    this.bossStatusPrompt.setVisible(true).setAlpha(0).setScale(0.94);
    this.sectorPayoffText.setVisible(true).setAlpha(0).setScale(0.96);

    this.tweens.add({
      targets: [this.bossStatusPrompt, this.sectorPayoffText],
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 360,
      ease: 'Cubic.easeOut',
      hold: CHAMBER03_FINALE.payoffHoldMs,
      onComplete: () => {
        this.tweens.add({
          targets: [this.bossStatusPrompt, this.sectorPayoffText],
          alpha: 0,
          duration: 460,
          ease: 'Cubic.easeIn',
          onComplete: () => {
            this.bossStatusPrompt?.setVisible(false);
            this.sectorPayoffText?.setVisible(false);
          }
        });
      }
    });
  }

  revealProgressionGate() {
    if (!this.progressionGate || !this.progressionThresholdZone) {
      return;
    }

    this.progressionGate.setVisible(true);
    this.progressionThresholdZone.body.enable = true;
    this.audioDirector?.playGateUnlock();

    this.tweens.add({
      targets: this.progressionGate,
      alpha: 1,
      duration: 560,
      ease: 'Sine.out'
    });
    this.tweens.add({
      targets: this.progressionGate,
      y: '-=16',
      duration: 520,
      ease: 'Cubic.easeOut'
    });
  }

  refreshProgressionThresholdPresence() {
    this.currentProgressionThresholdZone = null;

    if (!this.progressionThresholdZone?.body?.enable) {
      this.progressionGatePrompt?.setVisible(false);
      return;
    }

    this.physics.overlap(this.player.sprite, this.progressionThresholdZone, () => {
      this.currentProgressionThresholdZone = this.progressionThresholdZone;
    });

    this.progressionGatePrompt?.setVisible(Boolean(this.currentProgressionThresholdZone));
  }

  tryUseProgressionThreshold(mobileInput) {
    if (!this.currentProgressionThresholdZone) {
      return;
    }

    const interactPressed =
      Phaser.Input.Keyboard.JustDown(this.keyInteract) ||
      Phaser.Input.Keyboard.JustDown(this.keyEnter) ||
      mobileInput.interactPressed;

    if (!interactPressed) {
      return;
    }

    this.beginSectorCompleteTransition();
  }

  beginSectorCompleteTransition() {
    if (this.isTransitioningToSectorComplete) {
      return;
    }

    this.isTransitioningToSectorComplete = true;
    this.mobileControls.setMode('init');
    this.progressionGatePrompt?.setVisible(false);
    this.player.body.setVelocity(0, 0);
    this.player.body.setEnable(false);

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('SectorCompleteScene', {
        enteredFrom: 'chamber03-boss-arena',
        progressionSource: 'ruptured-threshold-gate',
        reason: CHAMBER03_FINALE.holdingStateReason
      });
    });
    this.cameras.main.fadeOut(360, 0, 0, 0);
  }

  updateFinaleGatePulse(time) {
    if (!this.progressionGate?.visible) {
      return;
    }

    const [gateShadow, gateAura] = this.progressionGate.list;
    gateAura?.setAlpha(0.12 + (Math.sin(time / 210) + 1) * 0.08).setScale(1 + Math.sin(time / 280) * 0.03, 1.02);
    gateShadow?.setAlpha(0.26 + (Math.sin(time / 320) + 1) * 0.05);
  }

  handleBossContactPlayer(_playerSprite, bossSprite) {
    if (!this.hasActivatedBoss || this.bossCombat?.defeated || bossSprite !== this.bossSprite) {
      return;
    }

    const phase = this.getBossPhaseConfig();
    if (this.time.now < this.bossCombat.lastContactDamageTime + phase.contactDamageCooldownMs) {
      return;
    }

    const tookDamage = this.player.receiveDamage(phase.contactDamage, this.time.now);
    if (!tookDamage) {
      return;
    }

    this.bossCombat.lastContactDamageTime = this.time.now;
    const knockDirection = Math.sign(this.player.sprite.x - this.bossSprite.x) || 1;
    this.player.body.setVelocityX(knockDirection * 228);
    this.player.body.setVelocityY(-188);
  }

  chooseBossAttack(time, absDx) {
    const phase = this.getBossPhaseConfig();
    const pulseReady = time >= this.bossCombat.lastPulseAt + phase.pulseCooldownMs;
    const lungeReady = time >= this.bossCombat.lastLungeAt + phase.lungeCooldownMs;
    const shouldPulse = pulseReady && (absDx > CHAMBER03_BOSS_COMBAT.idealRange + 24 || this.bossCombat.attackPatternIndex % 3 === 2);

    if (shouldPulse) {
      this.startBossTelegraph('telegraph-pulse', phase.pulseTelegraphMs, time, 'CHOIR PULSE');
      return;
    }

    if (lungeReady) {
      this.startBossTelegraph('telegraph-lunge', phase.lungeTelegraphMs, time, this.bossCombat.phase === 1 ? 'JUDGMENT DESCENDS' : 'MARROW REND');
    }
  }

  startBossTelegraph(state, durationMs, time, label) {
    this.bossCombat.state = state;
    this.bossCombat.telegraphStartedAt = time;
    this.bossCombat.telegraphDurationMs = durationMs;
    this.bossCombat.stateUntil = time + durationMs;
    this.bossCombat.attackLabel = label;
    this.bossBody.setVelocityX(0);
    this.audioDirector?.playEnemyAttack('miniboss');
  }

  beginBossLunge(time) {
    const phase = this.getBossPhaseConfig();
    this.bossCombat.state = 'lunge';
    this.bossCombat.stateUntil = time + phase.lungeDurationMs;
    this.bossCombat.lastAttackAt = time;
    this.bossCombat.lastLungeAt = time;
    this.bossCombat.attackPatternIndex += 1;
    this.bossCombat.telegraphDurationMs = 0;
    this.bossBody.setVelocityX(this.bossCombat.facing * phase.lungeSpeed);
    this.bossBody.setVelocityY(phase.lungeLiftVelocity);
  }

  beginBossPulse(time) {
    const phase = this.getBossPhaseConfig();
    this.bossCombat.state = 'pulse';
    this.bossCombat.stateUntil = time + phase.pulseRecoveryMs;
    this.bossCombat.lastAttackAt = time;
    this.bossCombat.lastPulseAt = time;
    this.bossCombat.attackPatternIndex += 1;
    this.bossCombat.telegraphDurationMs = 0;
    this.bossBody.setVelocityX(0);
    this.firePulseVolley(time);
  }

  firePulseVolley(time) {
    const phase = this.getBossPhaseConfig();
    const bursts = this.bossCombat.phase === 2 ? 2 : 1;
    for (let burstIndex = 0; burstIndex < bursts; burstIndex += 1) {
      const delay = burstIndex * CHAMBER03_BOSS_COMBAT.projectileIntervalMs;
      this.time.delayedCall(delay, () => {
        if (!this.bossCombat || this.bossCombat.defeated) {
          return;
        }

        const spreadY = burstIndex === 0 ? 0 : -CHAMBER03_BOSS_COMBAT.projectilePhaseTwoSpreadY;
        this.spawnBossProjectile(this.bossCombat.facing, phase.pulseDamage, phase.pulseSpeed, spreadY, time + delay);
      });
    }
  }

  spawnBossProjectile(direction, damage, speed, offsetY = 0, firedAt = this.time.now) {
    const projectile = this.add.ellipse(
      this.bossSprite.x + direction * CHAMBER03_BOSS_COMBAT.projectileSpawnOffsetX,
      this.bossSprite.y + CHAMBER03_BOSS_COMBAT.projectileSpawnOffsetY + offsetY,
      CHAMBER03_BOSS_COMBAT.projectileWidth,
      CHAMBER03_BOSS_COMBAT.projectileHeight,
      0x9e885f,
      0.92
    ).setDepth(6.05);

    this.physics.add.existing(projectile);
    projectile.body.setAllowGravity(false);
    projectile.body.setVelocityX(direction * speed);
    projectile.body.setSize(CHAMBER03_BOSS_COMBAT.projectileWidth, CHAMBER03_BOSS_COMBAT.projectileHeight);
    projectile.damage = damage;
    projectile.expiresAt = firedAt + CHAMBER03_BOSS_COMBAT.projectileLifetimeMs;
    this.bossCombat.activeProjectiles.push(projectile);
  }

  updateBossProjectiles(time) {
    if (!this.bossCombat?.activeProjectiles?.length) {
      return;
    }

    this.bossCombat.activeProjectiles = this.bossCombat.activeProjectiles.filter((projectile) => {
      const expired = !projectile.active || time >= projectile.expiresAt || projectile.x < -80 || projectile.x > CHAMBER03_BOSS_ARENA.worldWidth + 80;
      if (expired) {
        projectile.destroy();
        return false;
      }

      if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.sprite.getBounds(), projectile.getBounds())) {
        const tookDamage = this.player.receiveDamage(projectile.damage, time);
        if (tookDamage) {
          const knockDirection = Math.sign(this.player.sprite.x - projectile.x) || 1;
          this.player.body.setVelocityX(knockDirection * 188);
          this.player.body.setVelocityY(-132);
        }
        projectile.destroy();
        return false;
      }

      projectile.setAlpha(0.72 + Math.sin(time / 80) * 0.12);
      return true;
    });
  }

  clearBossProjectiles() {
    if (!this.bossCombat?.activeProjectiles) {
      return;
    }

    this.bossCombat.activeProjectiles.forEach((projectile) => projectile.destroy());
    this.bossCombat.activeProjectiles.length = 0;
  }

  cancelBossProjectileTimer() {
    this.bossCombat?.projectileTimer?.remove?.(false);
    if (this.bossCombat) {
      this.bossCombat.projectileTimer = null;
    }
  }

  updateBossPresence(time) {
    if (!this.hasActivatedBoss || !this.bossSprite?.visible || !this.bossCombat) {
      return;
    }

    this.updateBossProjectiles(time);

    const phase = this.getBossPhaseConfig();
    const boss = this.bossCombat;
    const dx = this.player.sprite.x - this.bossSprite.x;
    const absDx = Math.abs(dx);
    boss.facing = Math.sign(dx) || boss.facing;

    if (boss.defeated) {
      this.updateBossVisuals(time, absDx);
      return;
    }

    if (boss.state === 'phase-shift' && time >= boss.stateUntil) {
      boss.state = 'idle';
      boss.attackLabel = '';
    }

    if (boss.state === 'hurt') {
      if (time >= boss.stateUntil) {
        boss.state = 'idle';
        boss.attackLabel = '';
      } else {
        this.bossBody.setVelocityX(-boss.facing * CHAMBER03_BOSS_COMBAT.hurtRecoilVelocityX * 0.48);
        this.updateBossVisuals(time, absDx);
        return;
      }
    }

    if (boss.state === 'telegraph-lunge' && time >= boss.stateUntil) {
      this.beginBossLunge(time);
    } else if (boss.state === 'telegraph-pulse' && time >= boss.stateUntil) {
      this.beginBossPulse(time);
    } else if (boss.state === 'lunge' && time >= boss.stateUntil) {
      boss.state = 'recover';
      boss.stateUntil = time + phase.lungeRecoveryMs;
      this.bossBody.setVelocityX(0);
      boss.attackLabel = 'RECOVER';
    } else if (boss.state === 'pulse' && time >= boss.stateUntil) {
      boss.state = 'recover';
      boss.stateUntil = time + phase.pulseRecoveryMs;
      boss.attackLabel = 'REPOSITION';
    } else if (boss.state === 'recover' && time >= boss.stateUntil) {
      boss.state = 'idle';
      boss.attackLabel = '';
    }

    if (boss.state === 'idle') {
      const minX = CHAMBER03_BOSS_COMBAT.arenaPaddingX;
      const maxX = CHAMBER03_BOSS_ARENA.worldWidth - CHAMBER03_BOSS_COMBAT.arenaPaddingX;

      if (absDx <= CHAMBER03_BOSS_COMBAT.closeRetreatRange) {
        this.bossBody.setVelocityX(-boss.facing * phase.retreatSpeed);
        boss.attackLabel = boss.phase === 1 ? 'MEASURE' : 'RIPOSTE';
      } else if (absDx > CHAMBER03_BOSS_COMBAT.approachRange || this.bossSprite.x < minX || this.bossSprite.x > maxX) {
        this.bossBody.setVelocityX(boss.facing * phase.driftSpeed);
        boss.attackLabel = boss.phase === 1 ? 'APPROACH' : 'HUNT';
      } else {
        this.bossBody.setVelocityX(boss.facing * Math.max(phase.driftSpeed * 0.42, 20));
        this.chooseBossAttack(time, absDx);
      }
    }

    this.updateBossVisuals(time, absDx);
  }

  updateBossVisuals(time, absDx) {
    const telegraphing = this.isBossTelegraphing();
    const telegraphProgress = this.getBossTelegraphProgress(time);
    const takingHit = time < this.bossCombat.lastDamageFlashTime + CHAMBER03_BOSS_COMBAT.hurtFlashMs;
    const hitPulsing = time < this.bossCombat.hitPulseUntil;
    const phaseTwo = this.bossCombat.phase === 2;
    const floatOffset = 0;

    let scaleX = this.bossBaseScaleX * (phaseTwo ? 1.02 : 1);
    let scaleY = this.bossBaseScaleY * (phaseTwo ? 1.01 : 1);
    let angle = 0;
    let tint = phaseTwo ? 0xcab192 : 0xd2c1aa;

    if (telegraphing) {
      const swell = 1.02 + telegraphProgress * (phaseTwo ? 0.08 : 0.05);
      scaleX *= swell;
      scaleY *= swell * 1.03;
      angle = -this.bossCombat.facing * (phaseTwo ? 8 : 5 + telegraphProgress * 6);
      tint = phaseTwo ? 0xe0c27e : 0xd9c6a1;
    } else if (takingHit) {
      scaleX *= 0.98;
      scaleY *= 1.04;
      angle = this.bossCombat.facing * 9;
      tint = 0xd7efaa;
    } else if (hitPulsing) {
      const pulse = 1 + Math.sin(time / 42) * 0.024;
      scaleX *= pulse;
      scaleY *= pulse * 1.01;
    } else if (phaseTwo) {
      angle = Math.sin(time / 130) * 1.8;
    }

    const bossX = this.bossBody?.enable ? this.bossBody.gameObject.x : this.bossSprite.x;
    const bossY = this.bossBody?.enable
      ? this.bossBody.bottom + this.bossGroundedBodyOffsetY + floatOffset
      : CHAMBER03_BOSS_ARENA.bossAnchorY + floatOffset;
    this.bossSprite.setPosition(bossX, bossY);
    this.bossSprite.setScale(scaleX, scaleY);
    this.bossSprite.setAngle(angle);
    if (typeof this.bossSprite.setFlipX === 'function') {
      this.bossSprite.setFlipX(this.bossCombat.facing > 0);
    }
    if (typeof this.bossSprite.setTint === 'function') {
      this.bossSprite.setTint(tint);
    }
    this.bossFallbackLabel
      ?.setPosition(this.bossSprite.x, this.bossSprite.y - 12)
      .setAlpha(this.bossSprite.alpha * 0.8);

    const distanceFactor = Phaser.Math.Clamp(absDx / 320, 0.2, 1);
    this.bossArrivalAura
      ?.setPosition(this.bossSprite.x, this.bossSprite.y + 18 + floatOffset * 0.25)
      .setAlpha((phaseTwo ? 0.18 : 0.12) + (telegraphing ? 0.16 : 0) + distanceFactor * 0.04);
    this.bossArrivalHalo
      ?.setPosition(this.bossSprite.x, this.bossSprite.y - 16 + floatOffset * 0.28)
      .setAlpha((phaseTwo ? 0.12 : 0.08) + (telegraphing ? 0.08 : 0));
    this.bossArrivalShadow
      ?.setPosition(this.bossSprite.x, WORLD.floorY + 8)
      .setAlpha(this.bossCombat.defeated ? 0.08 : 0.2 + (Math.sin(time / (phaseTwo ? 160 : 320)) + 1) * 0.04);
  }

  resetBossPresentationState() {
    if (!this.bossSprite) {
      return;
    }

    this.bossSprite
      .setPosition(CHAMBER03_BOSS_ARENA.bossAnchorX, CHAMBER03_BOSS_ARENA.bossAnchorY)
      .setScale(this.bossBaseScaleX ?? this.bossSprite.scaleX, this.bossBaseScaleY ?? this.bossSprite.scaleY)
      .setAngle(0)
      .setAlpha(0)
      .setVisible(false)
      .setDepth(6.2);

    if (typeof this.bossSprite.setFlipX === 'function') {
      this.bossSprite.setFlipX(false);
    }
    if (typeof this.bossSprite.setTint === 'function') {
      this.bossSprite.setTint(0xd2c1aa);
    }

    this.bossFallbackLabel
      ?.setPosition(CHAMBER03_BOSS_ARENA.bossAnchorX, CHAMBER03_BOSS_ARENA.bossAnchorY - 12)
      .setAlpha(0)
      .setVisible(false)
      .setDepth(6.24);

    this.bossArrivalShadow?.setPosition(CHAMBER03_BOSS_ARENA.bossAnchorX, WORLD.floorY + 8).setAlpha(0).setDepth(-4.2);
    this.bossArrivalAura?.setPosition(CHAMBER03_BOSS_ARENA.bossAnchorX, CHAMBER03_BOSS_ARENA.bossAnchorY + 18).setAlpha(0).setDepth(-4.1);
    this.bossArrivalHalo?.setPosition(CHAMBER03_BOSS_ARENA.bossAnchorX, CHAMBER03_BOSS_ARENA.bossAnchorY - 16).setAlpha(0).setDepth(-4.05);
  }

  getBossPromptY() {
    const cameraHeight = this.cameras.main.height || this.scale.height;
    return Math.max(72, cameraHeight * 0.16);
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

    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'Chamber03BossArenaMobileUiCamera');
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
      camera.setFollowOffset(CHAMBER03_BOSS_ARENA.portraitFollowOffsetX, PORTRAIT_LAYOUT.portraitFollowOffsetY);
      this.mobileControls.setReservedBottomPx(height - worldBandHeight);
      this.restartText.setPosition(
        width / 2,
        Math.max(PORTRAIT_LAYOUT.restartTextMinY, worldBandHeight * PORTRAIT_LAYOUT.restartTextRatioY)
      );
      this.bossStatusPrompt?.setPosition(width / 2, this.getBossPromptY());
      this.sectorPayoffText?.setPosition(width / 2, this.getBossPromptY() + 44);
      return;
    }

    camera.setViewport(0, 0, width, height);
    camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
    camera.setFollowOffset(CHAMBER03_BOSS_ARENA.desktopFollowOffsetX, PORTRAIT_LAYOUT.desktopFollowOffsetY);
    this.mobileControls.setReservedBottomPx(0);
    this.restartText.setPosition(width / 2, 90);
    this.bossStatusPrompt?.setPosition(width / 2, this.getBossPromptY());
    this.sectorPayoffText?.setPosition(width / 2, this.getBossPromptY() + 44);
  }

  applyGameplayReadabilitySupport(target, { fill = 0xd2c2ac, alpha = 0.16, scale = 1.08 } = {}) {
    if (!target) {
      return null;
    }

    const shadow = this.add
      .ellipse(target.x, WORLD.floorY + 6, 104 * scale, 22 * scale, 0x050404, alpha * 1.05)
      .setDepth(target.depth - 0.6);
    const halo = this.add
      .ellipse(target.x, target.y - 6, 84 * scale, 118 * scale, fill, alpha)
      .setDepth(target.depth - 0.4);

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
}
