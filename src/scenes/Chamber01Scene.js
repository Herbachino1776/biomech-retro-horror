import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { SkitterServitor } from '../entities/SkitterServitor.js';
import { DialogueSystem } from '../systems/DialogueSystem.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import {
  CHAMBER_PLATFORM_LAYOUT,
  CONCEPT_PRESENTATION,
  COLORS,
  DIALOGUE,
  LORE_ENTRIES,
  PLAYER,
  SKITTER,
  WORLD
} from '../data/milestone1Config.js';
import { ASSET_KEYS } from '../data/assetKeys.js';

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
    this.physics.add.collider(this.enemy.sprite, this.platforms);

    this.physics.add.overlap(this.player.attackHitbox, this.enemy.sprite, this.handlePlayerHitEnemy, null, this);
    this.physics.add.overlap(this.player.sprite, this.enemy.sprite, this.handleEnemyContactPlayer, null, this);

    this.dialogue = new DialogueSystem(this, DIALOGUE);
    this.hud = new HudOverlay(this);
    this.mobileControls = new MobileControls(this);

    this.loreZones = this.physics.add.staticGroup();
    this.triggeredLoreIds = new Set();
    this.createLoreZones();

    this.physics.add.overlap(this.player.sprite, this.loreZones, this.handleLoreTrigger, null, this);

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
    this.keyRestart = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08, -140, 0);
    this.hud.update(this.player.health, PLAYER.maxHealth);
  }

  update(time) {
    const mobileInput = this.mobileControls.getInputState();

    if (this.player.isDead) {
      this.mobileControls.setMode('dead');
      this.restartText.setVisible(true).setText('VESSEL FAILURE\nPress [R] to re-seed chamber');
      if (Phaser.Input.Keyboard.JustDown(this.keyRestart) || mobileInput.interactPressed) {
        this.scene.restart();
      }
      return;
    }

    if (this.dialogue.active) {
      this.mobileControls.setMode('dialogue');
      this.player.body.setVelocityX(0);
      if (Phaser.Input.Keyboard.JustDown(this.keyInteract) || mobileInput.interactPressed) {
        this.dialogue.hide();
      }
      return;
    }

    this.mobileControls.setMode('gameplay');
    this.player.update(time, this.getCombinedInput(mobileInput));
    this.enemy.update(time, this.player.sprite.x);
    this.hud.update(this.player.health, PLAYER.maxHealth);
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
    const floorAlpha = hasBackdropConcept ? 0.62 : 1;
    const platformAlpha = hasBackdropConcept ? 0.58 : 1;
    const gateAlpha = hasBackdropConcept ? 0.66 : 1;

    const floor = this.add
      .rectangle(WORLD.width / 2, WORLD.floorY + 36, WORLD.width, 72, COLORS.foreground, floorAlpha)
      .setOrigin(0.5);
    this.physics.add.existing(floor, true);
    this.platforms.add(floor);

    CHAMBER_PLATFORM_LAYOUT.forEach((platform) => {
      const block = this.add
        .rectangle(platform.x, platform.y, platform.width, platform.height, COLORS.bloodMetal, platformAlpha)
        .setOrigin(0.5);
      this.physics.add.existing(block, true);
      this.platforms.add(block);
    });

    const gate = this.add.rectangle(2100, 390, 34, 160, COLORS.rust, gateAlpha).setOrigin(0.5);
    this.add.text(2060, 300, 'SEALED', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#8f7d72'
    }).setDepth(-7).setAlpha(hasBackdropConcept ? 0.32 : 1);
    this.physics.add.existing(gate, true);
    this.platforms.add(gate);
  }

  renderGrayboxBackdrop() {
    this.add
      .rectangle(WORLD.width / 2, WORLD.height / 2, WORLD.width, WORLD.height, COLORS.backdrop)
      .setOrigin(0.5)
      .setDepth(-12);

    const hasBackdropConcept = this.textures.exists(ASSET_KEYS.chamberBackground);

    if (hasBackdropConcept) {
      CONCEPT_PRESENTATION.chamberBackdrop.anchorXs.forEach((anchorX) => {
        this.add
          .image(anchorX, WORLD.height / 2, ASSET_KEYS.chamberBackground)
          .setDisplaySize(CONCEPT_PRESENTATION.chamberBackdrop.panelWidth, CONCEPT_PRESENTATION.chamberBackdrop.panelHeight)
          .setAlpha(CONCEPT_PRESENTATION.chamberBackdrop.panelAlpha)
          .setTint(CONCEPT_PRESENTATION.chamberBackdrop.panelTint)
          .setDepth(-11);
      });
    }

    const slabAlpha = hasBackdropConcept
      ? CONCEPT_PRESENTATION.chamberBackdrop.slabAlphaWithConcept
      : CONCEPT_PRESENTATION.chamberBackdrop.slabAlphaFallbackOnly;
    const slabTint = hasBackdropConcept
      ? CONCEPT_PRESENTATION.chamberBackdrop.slabTintWithConcept
      : CONCEPT_PRESENTATION.chamberBackdrop.slabTintFallbackOnly;

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

    this.add.text(1032, 355, 'ALTAR ENGINE // FALLBACK SAFETY', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#8f7d72'
    }).setDepth(-7).setAlpha(hasBackdropConcept ? 0.32 : 1);
  }

  createLoreZones() {
    LORE_ENTRIES.forEach((entry) => {
      const zone = this.add.zone(entry.x, entry.y, entry.width, entry.height).setOrigin(0.5);
      this.physics.add.existing(zone, true);
      zone.loreEntry = entry;
      this.loreZones.add(zone);

      this.add.rectangle(entry.x, entry.y, entry.width, entry.height, COLORS.sickly, 0.12);
      this.add.text(entry.x - 30, entry.y - 44, 'LORE', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#8a9f79'
      });
    });
  }

  handleLoreTrigger(playerSprite, zone) {
    const { loreEntry } = zone;
    if (this.triggeredLoreIds.has(loreEntry.id) || this.dialogue.active) {
      return;
    }

    this.triggeredLoreIds.add(loreEntry.id);
    this.dialogue.show(loreEntry.text);
  }

  handlePlayerHitEnemy(attackZone, enemySprite) {
    if (!this.player.attackActive || this.enemy.dead || enemySprite !== this.enemy.sprite) {
      return;
    }

    this.enemy.takeDamage(1);
  }

  handleEnemyContactPlayer(playerSprite, enemySprite) {
    if (this.enemy.dead || enemySprite !== this.enemy.sprite) {
      return;
    }

    const tookDamage = this.player.receiveDamage(SKITTER.contactDamage, this.time.now);
    if (tookDamage) {
      const knockDirection = Math.sign(this.player.sprite.x - this.enemy.sprite.x) || 1;
      this.player.body.setVelocityX(knockDirection * 220);
      this.player.body.setVelocityY(-220);
    }
  }
}
