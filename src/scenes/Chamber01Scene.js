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

    this.player = new Player(this, PLAYER.startX, PLAYER.startY, PLAYER);
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
    this.minibossEncounterStarted = false;
    this.minibossDefeated = false;

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
    });

    this.applyResponsiveLayout();
    this.hud.update(this.player.health, PLAYER.maxHealth);
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

    if (this.isLoreTransitionActive || this.isGateTransitionActive) {
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
    this.hud.update(this.player.health, PLAYER.maxHealth);
    this.hud.setBossBarState({
      visible: this.minibossEncounterStarted && !this.minibossDefeated,
      name: CHAMBER01_MINIBOSS.name,
      current: this.miniboss.health,
      max: this.miniboss.maxHealth
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
    const floorAlpha = hasBackdropConcept ? 0.2 : 1;
    const platformAlpha = hasBackdropConcept ? 0.58 : 1;
    const gateAlpha = hasBackdropConcept ? 0.7 : 0.9;

    const floor = this.add.rectangle(WORLD.width / 2, WORLD.floorY + 32, WORLD.width, 64, COLORS.foreground, floorAlpha).setOrigin(0.5);
    this.physics.add.existing(floor, true);
    this.platforms.add(floor);

    CHAMBER_PLATFORM_LAYOUT.forEach((platform) => {
      const block = this.add.rectangle(platform.x, platform.y, platform.width, platform.height, COLORS.bloodMetal, platformAlpha).setOrigin(0.5);
      this.physics.add.existing(block, true);
      this.platforms.add(block);

      this.add
        .rectangle(platform.x, platform.y - 4, platform.width, Math.max(10, platform.height + 4), COLORS.oil, hasBackdropConcept ? 0.2 : 0)
        .setOrigin(0.5)
        .setDepth(-5);
    });

    if (this.textures.exists(ASSET_KEYS.chamber01FloorStrip)) {
      this.add
        .tileSprite(WORLD.width / 2, WORLD.floorY + 12, WORLD.width, 82, ASSET_KEYS.chamber01FloorStrip)
        .setTint(0xd9c9b2)
        .setAlpha(0.8)
        .setDepth(-4);
    }

    const gateX = WORLD.width - 70;
    const gateY = 352;
    const gateHeight = 250;

    this.gateBarrier = this.add.rectangle(gateX, gateY, 48, gateHeight).setOrigin(0.5);

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
    this.physics.add.existing(this.gateBarrier, true);
    this.platforms.add(this.gateBarrier);

    this.gateZone = this.add.zone(gateX - 96, gateY + 14, 108, 144).setOrigin(0.5);
    this.physics.add.existing(this.gateZone, true);

    this.updateGateActivationVisuals();
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

    this.add.rectangle(420, 190, 760, 230, slabTint, slabAlpha).setOrigin(0.5).setDepth(-10);
    this.add.rectangle(1200, 170, 900, 240, slabTint, slabAlpha).setOrigin(0.5).setDepth(-10);
    this.add.ellipse(1120, 255, 340, 210, COLORS.oil, hasBackdropConcept ? 0.1 : 1).setStrokeStyle(3, COLORS.rust, hasBackdropConcept ? 0.2 : 0.8).setDepth(-9);
    this.add.rectangle(1120, 255, 18, 160, COLORS.bone, hasBackdropConcept ? 0.08 : 0.9).setDepth(-9);
    this.add.rectangle(1030, 255, 10, 130, COLORS.bone, hasBackdropConcept ? 0.07 : 0.7).setDepth(-9);
    this.add.rectangle(1210, 255, 10, 130, COLORS.bone, hasBackdropConcept ? 0.07 : 0.7).setDepth(-9);

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

    this.add.text(1032, 355, 'ALTAR ENGINE // FALLBACK SAFETY', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#8f7d72'
    }).setDepth(-7).setAlpha(hasBackdropConcept ? 0.32 : 1);
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
      camera.setFollowOffset(-140, PORTRAIT_LAYOUT.portraitFollowOffsetY);
      this.mobileControls.setReservedBottomPx(height - worldBandHeight);
      this.restartText.setPosition(width / 2, Math.max(PORTRAIT_LAYOUT.restartTextMinY, worldBandHeight * PORTRAIT_LAYOUT.restartTextRatioY));
      this.hud.layoutBossBar();
      return;
    }

    camera.setViewport(0, 0, width, height);
    camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
    camera.setFollowOffset(-140, PORTRAIT_LAYOUT.desktopFollowOffsetY);
    this.mobileControls.setReservedBottomPx(0);
    this.restartText.setPosition(width / 2, 90);
    this.hud.layoutBossBar();
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
    this.enemy.takeDamage(1, this.time.now);

    const knockDirection = Math.sign(this.enemy.sprite.x - this.player.sprite.x) || this.player.facing;
    this.enemy.body.setVelocityX(knockDirection * 160);
    this.enemy.body.setVelocityY(-120);
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

    const knockDirection = Math.sign(this.miniboss.sprite.x - this.player.sprite.x) || this.player.facing;
    this.miniboss.body.setVelocityX(knockDirection * 110);
    this.miniboss.body.setVelocityY(-90);

    if (this.miniboss.dead) {
      this.handleMinibossDefeated();
    }
  }

  handleEnemyContactPlayer(_playerSprite, enemySprite) {
    if (this.enemy.dead || !this.isEnemyOverlapTarget(enemySprite, this.enemy.sprite)) {
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
    this.minibossDefeated = true;
    this.miniboss.setActive(false);
    this.updateGateActivationVisuals();
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
