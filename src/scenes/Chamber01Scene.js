import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { SkitterServitor } from '../entities/SkitterServitor.js';
import { HalfSkullMiniboss } from '../entities/HalfSkullMiniboss.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import {
  CHAMBER_PLATFORM_LAYOUT,
  CHAMBER01_MINIBOSS,
  CONCEPT_PRESENTATION,
  COLORS,
  LORE_ENTRIES,
  PLAYER,
  SKITTER,
  WORLD
} from '../data/milestone1Config.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';
import { restartRunFromDeath } from '../systems/RunReset.js';
import { AudioDirector } from '../audio/AudioDirector.js';
import { grantMajorEncounterIntegrityReward } from '../systems/VesselRunEconomy.js';
import { MajorEncounterResolution } from '../systems/MajorEncounterResolution.js';
import { triggerSector02BlackOilBlowout } from '../systems/Sector02BlackOilPayoff.js';
import { spawnEnemyCorpseRemains } from '../systems/EnemyCorpseRemains.js';

const SHOW_CHAMBER01_DEBUG_LABELS = false;
const HALF_SKULL_RESOLUTION = {
  encounterId: 'chamber01-halfskull-miniboss',
  preExplosionShakeMs: 3000,
  preExplosionShakeIntensity: 0.0058,
  goreFountainCadenceMs: 86,
  explosionFadeStartDelayMs: 100,
  explosionFadeDurationMs: 320,
  postExplosionDespawnDelayMs: 560
};

export class Chamber01Scene extends Phaser.Scene {
  constructor() {
    super('Chamber01Scene');
  }

  create() {
    this.physics.world.gravity.y = WORLD.gravityY;
    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);
    this.physics.world.setBounds(0, 0, WORLD.width, WORLD.height);

    this.renderGrayboxBackdrop();

    this.platforms = this.physics.add.staticGroup();
    this.createPlatforms();

    this.audioDirector = new AudioDirector(this);
    this.audioDirector.playAmbientLoop(ASSET_KEYS.ambientChamber01Loop01, { volume: 0.252 });

    this.player = new Player(this, PLAYER.startX, PLAYER.startY, PLAYER);
    this.applyGameplayReadabilitySupport(this.player.sprite, { fill: 0xd8cfbb, alpha: 0.18, scale: 1.1 });
    this.physics.add.collider(this.player.sprite, this.platforms);

    this.enemy = new SkitterServitor(this, SKITTER.startX, SKITTER.startY, SKITTER);
    this.enemyLastAttackHitId = -1;
    this.physics.add.collider(this.enemy.sprite, this.platforms);

    this.miniboss = new HalfSkullMiniboss(this, CHAMBER01_MINIBOSS.spawnX, CHAMBER01_MINIBOSS.spawnY, CHAMBER01_MINIBOSS);
    this.minibossLastAttackHitId = -1;
    this.physics.add.collider(this.miniboss.sprite, this.platforms);
    this.miniboss.setActive(false);
    this.miniboss.sprite.setVisible(false);
    this.miniboss.body.enable = false;

    this.physics.add.overlap(this.player.attackHitbox, this.enemy.sprite, this.handlePlayerHitEnemy, null, this);
    this.physics.add.overlap(this.player.sprite, this.enemy.sprite, this.handleEnemyContactPlayer, null, this);
    this.physics.add.overlap(this.player.attackHitbox, this.miniboss.sprite, this.handlePlayerHitMiniboss, null, this);
    this.physics.add.overlap(this.player.sprite, this.miniboss.sprite, this.handleMinibossContactPlayer, null, this);

    this.hud = new HudOverlay(this);
    this.mobileControls = new MobileControls(this);

    this.loreZones = this.physics.add.staticGroup();
    this.triggeredLoreIds = new Set();
    this.createLoreZones();

    this.currentLoreZone = null;
    this.currentGateZone = null;
    this.completedLoreBeats = new Set();
    this.isChamber02GateActive = false;
    this.isGateTransitionActive = false;
    this.isLoreTransitionActive = false;
    this.isMinibossRewardActive = false;
    this.minibossEncounterStarted = false;
    this.minibossDefeated = false;
    this.hasProcessedMinibossVictory = false;
    this.minibossCeremonyBossBarActive = false;
    this.integrityRewardTracker = new Set();
    this.minibossDeathFlashUntil = -Infinity;
    this.minibossVictoryGoreFountainTimer = null;
    this.resolutionLockActive = false;
    this.minibossRewardText = this.add
      .text(this.scale.width / 2, this.scale.height * 0.28, 'Blasphemous Demon\nhas been Banished!', {
        fontFamily: 'Georgia, Times, serif',
        fontSize: '42px',
        fontStyle: 'bold',
        align: 'center',
        color: '#f4efe5',
        stroke: '#201514',
        strokeThickness: 8,
        shadow: {
          offsetX: 0,
          offsetY: 6,
          color: '#090404',
          blur: 10,
          fill: true
        }
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(34)
      .setAlpha(0)
      .setVisible(false);

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

    this.setupMobileUiCamera();
    this.majorEncounterResolution = new MajorEncounterResolution(this);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyAttack = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.keyRestart = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.keyInteract = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08, -140, 0);
    this.scale.on('resize', this.applyResponsiveLayout, this);
    this.game.events.on('lore-screen-complete', this.handleLoreScreenComplete, this);
    this.game.events.on('lore-cutscene-complete', this.handleLoreCutsceneComplete, this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.applyResponsiveLayout, this);
      this.game.events.off('lore-screen-complete', this.handleLoreScreenComplete, this);
      this.game.events.off('lore-cutscene-complete', this.handleLoreCutsceneComplete, this);
      this.audioDirector?.shutdown();
      this.stopMinibossVictoryGoreFountain();
      this.majorEncounterResolution?.teardown();
    });

    this.applyResponsiveLayout();
    this.hud.update(this.player.health, this.player.maxHealth);
  }

  update(time) {
    const mobileInput = this.mobileControls.getInputState();

    if (this.player.isDead) {
      this.mobileControls.setMode('dead');
      this.restartText.setVisible(true).setText('VESSEL FAILURE\nPress [R] to re-seed chamber');
      if (Phaser.Input.Keyboard.JustDown(this.keyRestart) || mobileInput.interactPressed) {
        restartRunFromDeath(this);
      }
      return;
    }

    this.restartText.setVisible(false);

    if (this.isLoreTransitionActive || this.isGateTransitionActive || this.isMinibossRewardActive || this.resolutionLockActive) {
      this.mobileControls.setMode('dialogue');
      this.player.body.setVelocity(0, 0);
      this.enemy.body.setVelocity(0, 0);
      if (!this.miniboss.dead) {
        this.miniboss.body.setVelocity(0, 0);
      }
      return;
    }

    this.mobileControls.setMode('gameplay');
    this.refreshLoreZonePresence();
    this.refreshGateZonePresence();
    this.tryBeginLoreSequence(mobileInput);
    this.tryBeginGateTransition(mobileInput);
    this.player.update(time, this.getCombinedInput(mobileInput));
    this.enemy.update(time, this.player.sprite.x);
    this.miniboss.update(time, this.player.sprite);
    this.updateMinibossArenaFeedback(time);
    this.hud.update(this.player.health, this.player.maxHealth);
    this.hud.setBossBarState({
      visible: this.minibossEncounterStarted && (!this.minibossDefeated || this.minibossCeremonyBossBarActive),
      name: CHAMBER01_MINIBOSS.name,
      subtitle: this.minibossCeremonyBossBarActive ? 'BANISHMENT RITE ENGAGED' : CHAMBER01_MINIBOSS.subtitle,
      current: this.minibossCeremonyBossBarActive ? 0 : this.miniboss.health,
      max: this.miniboss.maxHealth,
      telegraph: this.minibossCeremonyBossBarActive ? 1 : this.miniboss.getTelegraphProgress(time),
      wounded: this.minibossCeremonyBossBarActive || time < this.miniboss.lastDamageFlashTime + 220
    });
  }

  getCombinedInput(mobileInput) {
    return {
      left: this.cursors.left.isDown || mobileInput.left,
      right: this.cursors.right.isDown || mobileInput.right,
      jumpPressed:
        Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
        mobileInput.jumpPressed,
      attackPressed: Phaser.Input.Keyboard.JustDown(this.keyAttack) || mobileInput.attackPressed
    };
  }

  createPlatforms() {
    const hasBackdropConcept = this.textures.exists(ASSET_KEYS.chamberBackground);
    const gateAlpha = hasBackdropConcept ? 0.7 : 0.9;

    this.createInvisiblePlatform(WORLD.width / 2, WORLD.floorY + 32, WORLD.width, 64);

    CHAMBER_PLATFORM_LAYOUT
      .filter((platform) => platform.x < 1200)
      .forEach((platform) => {
        this.createInvisiblePlatform(platform.x, platform.y, platform.width, platform.height);
      });

    if (this.textures.exists(ASSET_KEYS.chamber01FloorStrip)) {
      this.add
        .tileSprite(WORLD.width / 2, WORLD.floorY + 12, WORLD.width, 82, ASSET_KEYS.chamber01FloorStrip)
        .setTint(0xd9c9b2)
        .setAlpha(0.8)
        .setDepth(-4);
    }

    const gateX = WORLD.width - 70;
    const gateY = 372;
    const gateHeight = 250;

    this.gateBarrier = this.createInvisiblePlatform(gateX, gateY, 48, gateHeight);

    if (this.textures.exists(ASSET_KEYS.chamber02VertebralHornGate)) {
      this.gateArt = this.add
        .image(gateX - 24, gateY - 48, ASSET_KEYS.chamber02VertebralHornGate)
        .setDisplaySize(200, 260)
        .setCrop(336, 218, 356, 1012)
        .setTint(0xc3b299)
        .setAlpha(gateAlpha)
        .setDepth(-4);
    }

    this.gateSigil = this.add.ellipse(gateX - 26, gateY + 6, 34, 92, COLORS.sickly, 0.12).setDepth(-3);
    this.gateZone = this.add.zone(gateX - 96, gateY + 14, 108, 144).setOrigin(0.5);
    this.physics.add.existing(this.gateZone, true);

    this.updateGateActivationVisuals();
  }


  createInvisiblePlatform(x, y, width, height) {
    const platform = this.add.rectangle(x, y, width, height, 0x000000, 0).setOrigin(0.5);
    platform.setVisible(false);
    this.physics.add.existing(platform, true);
    this.platforms.add(platform);
    return platform;
  }

  renderGrayboxBackdrop() {
    this.add.rectangle(WORLD.width / 2, WORLD.height / 2, WORLD.width, WORLD.height, COLORS.backdrop).setOrigin(0.5).setDepth(-12);
    const hasBackdropConcept = this.textures.exists(ASSET_KEYS.chamberBackground);

    if (hasBackdropConcept) {
      if (this.textures.exists(ASSET_KEYS.chamber01Wall)) {
        this.add.tileSprite(WORLD.width / 2, 220, WORLD.width, 360, ASSET_KEYS.chamber01Wall).setTint(0xdbc8af).setAlpha(0.52).setDepth(-11);
      }

      CONCEPT_PRESENTATION.chamberBackdrop.anchorXs.forEach((anchorX) => {
        this.add
          .image(anchorX, WORLD.height / 2, ASSET_KEYS.chamberBackground)
          .setDisplaySize(CONCEPT_PRESENTATION.chamberBackdrop.panelWidth, CONCEPT_PRESENTATION.chamberBackdrop.panelHeight)
          .setAlpha(CONCEPT_PRESENTATION.chamberBackdrop.panelAlpha)
          .setTint(CONCEPT_PRESENTATION.chamberBackdrop.panelTint)
          .setDepth(-11);
      });
    }

    const slabAlpha = hasBackdropConcept ? CONCEPT_PRESENTATION.chamberBackdrop.slabAlphaWithConcept : CONCEPT_PRESENTATION.chamberBackdrop.slabAlphaFallbackOnly;
    const slabTint = hasBackdropConcept ? CONCEPT_PRESENTATION.chamberBackdrop.slabTintWithConcept : CONCEPT_PRESENTATION.chamberBackdrop.slabTintFallbackOnly;

    this.add.ellipse(420, 192, 760, 228, slabTint, slabAlpha * 0.72).setOrigin(0.5).setDepth(-10);
    this.add.ellipse(1200, 174, 900, 236, slabTint, slabAlpha * 0.72).setOrigin(0.5).setDepth(-10);
    this.add.ellipse(1120, 255, 340, 210, COLORS.oil, hasBackdropConcept ? 0.08 : 1).setStrokeStyle(3, COLORS.rust, hasBackdropConcept ? 0.15 : 0.8).setDepth(-9);
    this.add.ellipse(1120, 255, 18, 160, COLORS.bone, hasBackdropConcept ? 0.06 : 0.9).setDepth(-9);
    this.add.ellipse(1030, 255, 10, 130, COLORS.bone, hasBackdropConcept ? 0.05 : 0.7).setDepth(-9);
    this.add.ellipse(1210, 255, 10, 130, COLORS.bone, hasBackdropConcept ? 0.05 : 0.7).setDepth(-9);

    if (this.textures.exists(ASSET_KEYS.laughingEngine)) {
      this.add
        .image(1120, 255, ASSET_KEYS.laughingEngine)
        .setOrigin(CONCEPT_PRESENTATION.laughingEngine.origin.x, CONCEPT_PRESENTATION.laughingEngine.origin.y)
        .setDisplaySize(CONCEPT_PRESENTATION.laughingEngine.display.width, CONCEPT_PRESENTATION.laughingEngine.display.height)
        .setCrop(
          CONCEPT_PRESENTATION.laughingEngine.crop.x,
          CONCEPT_PRESENTATION.laughingEngine.crop.y,
          CONCEPT_PRESENTATION.laughingEngine.crop.width,
          CONCEPT_PRESENTATION.laughingEngine.crop.height
        )
        .setAlpha(CONCEPT_PRESENTATION.laughingEngine.alpha)
        .setTint(CONCEPT_PRESENTATION.laughingEngine.tint)
        .setDepth(-8);
    }

    if (this.textures.exists(ASSET_KEYS.chamber01LaughingEngineWorld)) {
      this.add.image(1130, 248, ASSET_KEYS.chamber01LaughingEngineWorld).setDisplaySize(640, 320).setTint(0xf0e3ca).setAlpha(0.66).setDepth(-8);
    }

    if (this.textures.exists(ASSET_KEYS.sentinel)) {
      this.add
        .image(1720, 410, ASSET_KEYS.sentinel)
        .setOrigin(CONCEPT_PRESENTATION.sentinel.origin.x, CONCEPT_PRESENTATION.sentinel.origin.y)
        .setDisplaySize(CONCEPT_PRESENTATION.sentinel.display.width, CONCEPT_PRESENTATION.sentinel.display.height)
        .setCrop(
          CONCEPT_PRESENTATION.sentinel.crop.x,
          CONCEPT_PRESENTATION.sentinel.crop.y,
          CONCEPT_PRESENTATION.sentinel.crop.width,
          CONCEPT_PRESENTATION.sentinel.crop.height
        )
        .setAlpha(CONCEPT_PRESENTATION.sentinel.alpha)
        .setTint(CONCEPT_PRESENTATION.sentinel.tint)
        .setDepth(-8);
    }

    if (this.textures.exists(ASSET_KEYS.chamber01RibArch)) {
      this.add.image(1435, 202, ASSET_KEYS.chamber01RibArch).setDisplaySize(760, 360).setTint(0xd4c5af).setAlpha(0.5).setDepth(-6);
    }

    if (!hasBackdropConcept && SHOW_CHAMBER01_DEBUG_LABELS) {
      this.add.text(1032, 355, 'ALTAR ENGINE // FALLBACK SAFETY', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#8f7d72'
      }).setDepth(-7).setAlpha(1);
    }
  }

  setupMobileUiCamera() {
    if (!this.mobileControls.enabled) {
      return;
    }

    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'MobileUiCamera');
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
      camera.setViewport(0, 0, width, worldBandHeight);
      camera.setZoom(PORTRAIT_LAYOUT.portraitZoom);
      camera.setFollowOffset(-120, PORTRAIT_LAYOUT.portraitFollowOffsetY);
      this.mobileControls.setReservedBottomPx(height - worldBandHeight);
      this.restartText.setPosition(width / 2, Math.max(PORTRAIT_LAYOUT.restartTextMinY, worldBandHeight * PORTRAIT_LAYOUT.restartTextRatioY));
      this.layoutMinibossRewardText(width, height, worldBandHeight);
      this.hud.layoutBossBar();
      return;
    }

    camera.setViewport(0, 0, width, height);
    camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
    camera.setFollowOffset(-140, PORTRAIT_LAYOUT.desktopFollowOffsetY);
    this.mobileControls.setReservedBottomPx(0);
    this.restartText.setPosition(width / 2, 90);
    this.layoutMinibossRewardText(width, height, height);
    this.hud.layoutBossBar();
  }

  layoutMinibossRewardText(width = this.scale.width, height = this.scale.height, worldBandHeight = height) {
    if (!this.minibossRewardText) {
      return;
    }

    const isPortrait = height >= width;
    this.minibossRewardText
      .setPosition(width / 2, Math.max(78, worldBandHeight * (isPortrait ? 0.34 : 0.26)))
      .setFontSize(isPortrait ? '28px' : '42px')
      .setStroke('#201514', isPortrait ? 6 : 8)
      .setShadow(0, isPortrait ? 4 : 6, '#090404', isPortrait ? 8 : 10, true, true);
  }

  applyGameplayReadabilitySupport(target, { fill = 0xd2c2ac, alpha = 0.16, scale = 1.08 } = {}) {
    if (!target) {
      return null;
    }

    const halo = this.add
      .ellipse(target.x, target.y - 6, 86 * scale, 120 * scale, fill, alpha)
      .setDepth(target.depth - 0.4);

    target.__gameplayHalo = halo;

    return this.events.on(Phaser.Scenes.Events.UPDATE, () => {
      if (!target.active) {
        halo.setVisible(false);
        return;
      }

      halo
        .setVisible(target.visible)
        .setPosition(target.x, target.y - 8)
        .setAlpha(target.visible ? alpha : 0);
    });
  }

  handleDevWarp() {
    if (this.scene.isActive('LoreScreenScene') || this.scene.isActive('LoreCutsceneScene')) {
      return;
    }

    // Keep the Chamber 01 mobile DEV button aligned with the latest Sector 3 chamber pass.
    this.cleanupSceneUi?.();
    this.audioDirector?.shutdown();
    this.scene.start('Sector03Chamber02Scene', {
      devWarp: true,
      source: this.scene.key
    });
  }

  cleanupSceneUi() {
    this.hud?.setBossBarState({ visible: false });
    this.hud?.setVisible(true);
    this.uiCamera?.setVisible(true);
  }

  createLoreZones() {
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
    const hasBackdropConcept = this.textures.exists(ASSET_KEYS.chamberBackground);
    const fossilAlpha = hasBackdropConcept ? 0.65 : 0.95;

    this.add.ellipse(entry.x, baseY + 6, 132, 42, COLORS.oil, fossilAlpha * 0.35).setDepth(-1);
    this.add.ellipse(entry.x, baseY + 4, 98, 28, COLORS.sickly, fossilAlpha * 0.2).setDepth(-1);
    this.add.rectangle(entry.x, baseY, 118, 24, COLORS.bloodMetal, fossilAlpha).setDepth(-1);
    this.add.rectangle(entry.x, baseY - 4, 84, 18, COLORS.foreground, fossilAlpha * 0.9).setDepth(-1);
    this.add.ellipse(entry.x, baseY - 20, 78, 34, COLORS.bone, fossilAlpha * 0.9).setDepth(-1);
    this.add.ellipse(entry.x, baseY - 20, 50, 18, COLORS.oil, fossilAlpha * 0.8).setDepth(-1);
    this.add.ellipse(entry.x - 30, baseY - 26, 30, 56, COLORS.bone, fossilAlpha * 0.7).setDepth(-1).setAngle(-24);
    this.add.ellipse(entry.x + 30, baseY - 26, 30, 56, COLORS.bone, fossilAlpha * 0.7).setDepth(-1).setAngle(24);
    this.add.rectangle(entry.x, baseY - 27, 10, 52, COLORS.rust, fossilAlpha * 0.75).setDepth(-1).setAngle(4);
    this.add.triangle(entry.x, baseY - 44, 0, 20, 20, 0, 40, 20, COLORS.bone, fossilAlpha * 0.85).setDepth(-1).setOrigin(0.5);
    this.add.ellipse(entry.x - 18, baseY - 15, 10, 6, COLORS.sickly, fossilAlpha * 0.4).setDepth(-1);
    this.add.ellipse(entry.x + 18, baseY - 15, 10, 6, COLORS.sickly, fossilAlpha * 0.4).setDepth(-1);

    if (entry.id === 'end-deadgod' && this.textures.exists(ASSET_KEYS.chamber01DeadgodCutscene)) {
      this.add
        .image(entry.x, baseY - 40, ASSET_KEYS.chamber01DeadgodCutscene)
        .setDisplaySize(152, 116)
        .setTint(0xcebea7)
        .setAlpha(hasBackdropConcept ? 0.56 : 0.84)
        .setDepth(0);
      return;
    }

    if (this.textures.exists(ASSET_KEYS.chamber01Shrine)) {
      this.add.image(entry.x, baseY - 20, ASSET_KEYS.chamber01Shrine).setDisplaySize(140, 116).setCrop(420, 90, 700, 620).setTint(0xcabb9e).setAlpha(hasBackdropConcept ? 0.6 : 0.88).setDepth(0);
    }
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

  refreshGateZonePresence() {
    this.currentGateZone = null;
    if (!this.gateZone || !this.isChamber02GateActive || !this.minibossDefeated) {
      return;
    }

    this.physics.overlap(this.player.sprite, this.gateZone, () => {
      this.currentGateZone = this.gateZone;
    });
  }

  tryBeginLoreSequence(mobileInput) {
    if (!this.currentLoreZone) {
      return;
    }

    const interactPressed = Phaser.Input.Keyboard.JustDown(this.keyInteract) || Phaser.Input.Keyboard.JustDown(this.keyEnter) || mobileInput.interactPressed;
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

  tryBeginGateTransition(mobileInput) {
    if (!this.currentGateZone || this.isGateTransitionActive) {
      return;
    }

    const interactPressed = Phaser.Input.Keyboard.JustDown(this.keyInteract) || Phaser.Input.Keyboard.JustDown(this.keyEnter) || mobileInput.interactPressed;
    if (!interactPressed) {
      return;
    }

    this.audioDirector?.playGateInteract();
    this.beginGateTransitionToChamber02();
  }

  beginLoreSequence(loreEntry) {
    if (this.isLoreTransitionActive) {
      return;
    }

    this.isLoreTransitionActive = true;
    this.mobileControls.setMode('dialogue');
    this.player.body.setVelocity(0, 0);
    this.enemy.body.setVelocity(0, 0);
    if (!this.miniboss.dead) {
      this.miniboss.body.setVelocity(0, 0);
    }

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

    this.cameras.main.fadeOut(450, 0, 0, 0);
  }

  handleLoreScreenComplete() {
    if (!this.completedLoreBeats.has('entry-altar') && this.triggeredLoreIds.has('entry-altar')) {
      this.completedLoreBeats.add('entry-altar');
      this.isChamber02GateActive = true;
      this.updateGateActivationVisuals();
    }

    this.resumeFromLore();
  }

  handleLoreCutsceneComplete({ cutsceneId } = {}) {
    if (cutsceneId === 'chamber01-deadgod-witness' && !this.completedLoreBeats.has('end-deadgod')) {
      this.completedLoreBeats.add('end-deadgod');
      this.startMinibossEncounter();
    }

    this.resumeFromLore();
  }

  resumeFromLore() {
    this.isLoreTransitionActive = false;
    this.mobileControls.setMode('gameplay');
    this.audioDirector?.playAmbientLoop(ASSET_KEYS.ambientChamber01Loop01, { volume: 0.252 });
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  startMinibossEncounter() {
    if (this.minibossEncounterStarted) {
      return;
    }

    this.minibossEncounterStarted = true;
    this.miniboss.sprite.setVisible(true);
    this.miniboss.body.enable = true;
    this.miniboss.setActive(true);
    this.gateSigil?.setAlpha(0.16);
    if (this.gateArt) {
      this.gateArt.setAlpha(0.54).setTint(0xaa9881);
    }
  }

  handlePlayerHitEnemy(_attackZone, enemySprite) {
    if (!this.player.attackActive || this.enemy.dead || !this.isEnemyOverlapTarget(enemySprite, this.enemy.sprite)) {
      return;
    }
    if (this.enemyLastAttackHitId === this.player.attackId) {
      return;
    }

    this.enemyLastAttackHitId = this.player.attackId;
    const knockDirection = Math.sign(this.enemy.sprite.x - this.player.sprite.x) || this.player.facing;
    this.enemy.setHitReactionDirection(knockDirection);
    this.enemy.takeDamage(1, this.time.now);
    this.audioDirector?.playPlayerHit();
  }


  handlePlayerHitMiniboss(_attackZone, enemySprite) {
    if (!this.player.attackActive || !this.minibossEncounterStarted || this.miniboss.dead || !this.isEnemyOverlapTarget(enemySprite, this.miniboss.sprite)) {
      return;
    }
    if (this.minibossLastAttackHitId === this.player.attackId) {
      return;
    }

    this.minibossLastAttackHitId = this.player.attackId;
    this.miniboss.takeDamage(1, this.time.now);
    this.audioDirector?.playPlayerHit();

    const knockDirection = Math.sign(this.miniboss.sprite.x - this.player.sprite.x) || this.player.facing;
    this.miniboss.direction = knockDirection;

    if (this.miniboss.dead) {
      this.handleMinibossDefeated();
    }
  }

  handleEnemyContactPlayer(_playerSprite, enemySprite) {
    if (this.enemy.dead || !this.isEnemyOverlapTarget(enemySprite, this.enemy.sprite)) {
      return;
    }
    if (!this.enemy.canDealContactDamage(this.time.now)) {
      return;
    }

    const tookDamage = this.player.receiveDamage(SKITTER.contactDamage, this.time.now);
    if (tookDamage) {
      const knockDirection = Math.sign(this.player.sprite.x - this.enemy.sprite.x) || 1;
      this.player.body.setVelocityX(knockDirection * 220);
      this.player.body.setVelocityY(-220);
    }
  }

  handleMinibossContactPlayer(_playerSprite, enemySprite) {
    if (this.miniboss.dead || !this.minibossEncounterStarted || !this.isEnemyOverlapTarget(enemySprite, this.miniboss.sprite)) {
      return;
    }
    if (!this.miniboss.canDealContactDamage(this.time.now)) {
      return;
    }

    const tookDamage = this.player.receiveDamage(CHAMBER01_MINIBOSS.contactDamage, this.time.now);
    if (tookDamage) {
      this.miniboss.recordContactDamage(this.time.now);
      const knockDirection = Math.sign(this.player.sprite.x - this.miniboss.sprite.x) || 1;
      this.player.body.setVelocityX(knockDirection * 260);
      this.player.body.setVelocityY(-210);
    }
  }

  handleMinibossDefeated() {
    if (
      this.hasProcessedMinibossVictory
      || this.majorEncounterResolution?.isResolutionActive(HALF_SKULL_RESOLUTION.encounterId)
      || this.majorEncounterResolution?.hasResolved(HALF_SKULL_RESOLUTION.encounterId)
    ) {
      return;
    }

    this.majorEncounterResolution?.begin({
      encounterId: HALF_SKULL_RESOLUTION.encounterId,
      freezePlayer: true,
      disablePlayerAttack: true,
      setResolutionLock: (locked) => {
        this.resolutionLockActive = locked;
      },
      onStart: () => {
        this.hasProcessedMinibossVictory = true;
        this.minibossDefeated = true;
        this.minibossCeremonyBossBarActive = true;
        this.miniboss.setActive(false);
        this.isMinibossRewardActive = true;
        this.minibossDeathFlashUntil = this.time.now + HALF_SKULL_RESOLUTION.preExplosionShakeMs;
        this.playMinibossCeremonyStart();
      },
      stages: [
        {
          atMs: HALF_SKULL_RESOLUTION.preExplosionShakeMs,
          run: () => {
            this.stopMinibossVictoryGoreFountain();
            this.triggerHalfSkullDeathBurst({
              x: this.miniboss.sprite.x,
              y: (this.miniboss.sprite.body?.bottom ?? this.miniboss.sprite.y) - Phaser.Math.Between(90, 126),
              depth: this.miniboss.sprite.depth + 0.46,
              scale: 1.28,
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
              sprayHeight: [16, 38]
            });
            this.majorEncounterResolution?.schedule(HALF_SKULL_RESOLUTION.explosionFadeStartDelayMs, () => {
              this.startMinibossExplosionFade();
            });
            this.audioDirector?.playBanishmentSting();
            this.minibossRewardText?.setText('HALF SKULL\nBANISHED');
            grantMajorEncounterIntegrityReward(this.player, this.integrityRewardTracker, HALF_SKULL_RESOLUTION.encounterId);
            this.audioDirector?.playGateUnlock();
            this.updateGateActivationVisuals();
          }
        },
        {
          atMs: HALF_SKULL_RESOLUTION.preExplosionShakeMs + HALF_SKULL_RESOLUTION.postExplosionDespawnDelayMs,
          run: () => {
            this.despawnMinibossAfterPayoff();
          }
        }
      ],
      onComplete: () => {
        this.finishMinibossCeremony();
      }
    });
  }

  playMinibossCeremonyStart() {
    this.stabilizeMinibossCorpseForPayoff();
    this.cameras.main.shake(HALF_SKULL_RESOLUTION.preExplosionShakeMs, HALF_SKULL_RESOLUTION.preExplosionShakeIntensity, true);
    this.startMinibossVictoryGoreFountain();
    this.minibossRewardText?.setText('BANISHMENT RITE\nACTIVE');

    if (this.minibossRewardText) {
      this.tweens.killTweensOf(this.minibossRewardText);
      this.minibossRewardText.setVisible(true).setAlpha(0).setScale(0.94);
      this.tweens.add({
        targets: this.minibossRewardText,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 320,
        ease: 'Cubic.easeOut'
      });
    }
  }

  stabilizeMinibossCorpseForPayoff() {
    if (!this.miniboss?.sprite?.active) {
      return;
    }

    const floorBottomY = WORLD.floorY + 2;
    const groundedY = floorBottomY - this.miniboss.sprite.displayHeight * (1 - this.miniboss.sprite.originY);
    this.tweens.killTweensOf(this.miniboss.sprite);
    this.miniboss.sprite
      .setAlpha(1)
      .setVisible(true)
      .setScale(
        this.miniboss.baseScaleX * this.miniboss.config.presentation.scaleX,
        this.miniboss.baseScaleY * this.miniboss.config.presentation.scaleY
      )
      .setAngle(0)
      .setY(groundedY);
  }

  startMinibossExplosionFade() {
    if (!this.miniboss?.sprite?.active) {
      return;
    }

    this.tweens.killTweensOf(this.miniboss.sprite);
    this.tweens.add({
      targets: this.miniboss.sprite,
      alpha: 0,
      duration: HALF_SKULL_RESOLUTION.explosionFadeDurationMs,
      ease: 'Sine.easeInOut'
    });
  }

  despawnMinibossAfterPayoff() {
    if (!this.miniboss?.sprite) {
      return;
    }

    this.stopMinibossVictoryGoreFountain();
    spawnEnemyCorpseRemains(this, {
      x: this.miniboss.sprite.x,
      groundY: WORLD.floorY + 2,
      depth: this.miniboss.sprite.depth,
      size: 'large'
    });
    this.miniboss.sprite.setVisible(false).setAlpha(0);
    this.miniboss.setActive(false);
    this.miniboss.body?.setEnable(false);
    this.miniboss.destroyCombatTelegraphs?.();
  }

  startMinibossVictoryGoreFountain() {
    this.stopMinibossVictoryGoreFountain();
    if (!this.miniboss?.sprite?.active) {
      return;
    }

    const spawnFountainBurst = () => {
      if (!this.isMinibossRewardActive || !this.miniboss?.sprite?.active) {
        return;
      }

      this.triggerHalfSkullDeathBurst({
        x: this.miniboss.sprite.x + Phaser.Math.Between(-58, 58),
        y: (this.miniboss.sprite.body?.bottom ?? this.miniboss.sprite.y) - Phaser.Math.Between(104, 156),
        depth: this.miniboss.sprite.depth + 0.38,
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
        sprayHeight: [14, 36]
      });
    };

    spawnFountainBurst();
    this.minibossVictoryGoreFountainTimer = this.time.addEvent({
      delay: HALF_SKULL_RESOLUTION.goreFountainCadenceMs,
      repeat: Math.ceil(HALF_SKULL_RESOLUTION.preExplosionShakeMs / HALF_SKULL_RESOLUTION.goreFountainCadenceMs),
      callback: spawnFountainBurst
    });
  }

  stopMinibossVictoryGoreFountain() {
    this.minibossVictoryGoreFountainTimer?.remove(false);
    this.minibossVictoryGoreFountainTimer = null;
  }

  triggerHalfSkullDeathBurst(config = {}) {
    if (!this.miniboss?.sprite?.active) {
      return;
    }

    triggerSector02BlackOilBlowout(this, {
      source: this.miniboss.sprite,
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

  finishMinibossCeremony() {
    this.stopMinibossVictoryGoreFountain();
    this.minibossCeremonyBossBarActive = false;
    this.hud.setBossBarState({ visible: false });
    this.isMinibossRewardActive = false;
    if (this.minibossRewardText) {
      this.tweens.killTweensOf(this.minibossRewardText);
      this.tweens.add({
        targets: this.minibossRewardText,
        alpha: 0,
        duration: 280,
        ease: 'Cubic.easeIn',
        onComplete: () => this.minibossRewardText.setVisible(false)
      });
    }
  }

  updateMinibossArenaFeedback(time) {
    if (time < this.minibossDeathFlashUntil) {
      const progress = Phaser.Math.Clamp((this.minibossDeathFlashUntil - time) / 520, 0, 1);
      this.cameras.main.setBackgroundColor(Phaser.Display.Color.GetColor(18 + Math.round(20 * progress), 11 + Math.round(14 * progress), 10 + Math.round(10 * progress)));
      return;
    }

    this.cameras.main.setBackgroundColor(COLORS.backdrop);
  }

  updateGateActivationVisuals() {
    if (!this.gateSigil) {
      return;
    }

    if (this.isChamber02GateActive && this.minibossDefeated) {
      this.gateSigil.setAlpha(0.42);
      this.gateArt?.setAlpha(0.82).setTint(0xd7c8af);
      return;
    }

    if (this.isChamber02GateActive) {
      this.gateSigil.setAlpha(0.16);
      this.gateArt?.setAlpha(0.58).setTint(0xb8a88f);
      return;
    }

    this.gateSigil.setAlpha(0.1);
    this.gateArt?.setAlpha(0.6).setTint(0xb8a88f);
  }

  beginGateTransitionToChamber02() {
    if (this.isGateTransitionActive) {
      return;
    }

    this.isGateTransitionActive = true;
    this.mobileControls.setMode('dialogue');
    this.player.body.setVelocity(0, 0);
    this.enemy.body.setVelocity(0, 0);
    this.miniboss.body.setVelocity(0, 0);

    this.audioDirector?.stopAmbientLoop({ fadeOut: false });

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('Chamber02Scene', {
        enteredFrom: 'chamber01-vertebral-horn-gate',
        progressionSource: 'entry-altar'
      });
    });

    this.cameras.main.fadeOut(700, 0, 0, 0);
  }

  isEnemyOverlapTarget(target, sprite) {
    return target === sprite || target?.gameObject === sprite;
  }
}
