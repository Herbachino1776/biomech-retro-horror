import Phaser from 'phaser';
import { CONCEPT_PRESENTATION } from '../data/milestone1Config.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { ASSET_URLS } from '../data/assetUrls.js';
import { CHAMBER01_TEXTURE_ASSET_KEYS, GLOBAL_TEXTURE_ASSET_KEYS } from '../data/sceneAssetPlan.js';
import { CHAMBER03_RESCUE_FLAGS } from '../data/chamber03Config.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
    this.hasStarted = false;
    this.domEnterHandler = null;
    this.domPointerHandler = null;
  }

  preload() {
    [...GLOBAL_TEXTURE_ASSET_KEYS, ...CHAMBER01_TEXTURE_ASSET_KEYS].forEach((assetKey) => {
      this.load.image(assetKey, ASSET_URLS[assetKey]);
    });
    this.preloadAudioAsset(ASSET_KEYS.playerFootstepSlate01);
    this.preloadAudioAsset(ASSET_KEYS.playerFootstepSlate02);
    this.preloadAudioAsset(ASSET_KEYS.playerFootstepSlate03);
    this.preloadAudioAsset(ASSET_KEYS.playerFootstepSlate04);
    this.preloadAudioAsset(ASSET_KEYS.playerAttack);
    this.preloadAudioAsset(ASSET_KEYS.playerAttackFallback);
    this.preloadAudioAsset(ASSET_KEYS.playerHit);
    this.preloadAudioAsset(ASSET_KEYS.playerHitFallback);
    this.preloadAudioAsset(ASSET_KEYS.playerHurt);
    this.preloadAudioAsset(ASSET_KEYS.playerHurtFallback);
    this.preloadAudioAsset(ASSET_KEYS.playerDeath);
    this.preloadAudioAsset(ASSET_KEYS.playerDeathFallback);
    this.preloadAudioAsset(ASSET_KEYS.enemyAttack);
    this.preloadAudioAsset(ASSET_KEYS.enemyAttackFallback);
    this.preloadAudioAsset(ASSET_KEYS.enemyHurt);
    this.preloadAudioAsset(ASSET_KEYS.enemyHurtFallback);
    this.preloadAudioAsset(ASSET_KEYS.enemyDeath);
    this.preloadAudioAsset(ASSET_KEYS.enemyDeathFallback);
    this.preloadAudioAsset(ASSET_KEYS.tollKeeperAttack);
    this.preloadAudioAsset(ASSET_KEYS.tollKeeperHurt);
    this.preloadAudioAsset(ASSET_KEYS.tollKeeperDeath);
    this.preloadAudioAsset(ASSET_KEYS.minibossAttack);
    this.preloadAudioAsset(ASSET_KEYS.minibossAttackFallback);
    this.preloadAudioAsset(ASSET_KEYS.minibossHurt);
    this.preloadAudioAsset(ASSET_KEYS.minibossHurtFallback);
    this.preloadAudioAsset(ASSET_KEYS.minibossDeath);
    this.preloadAudioAsset(ASSET_KEYS.minibossDeathFallback);
    this.preloadAudioAsset(ASSET_KEYS.gateInteract);
    this.preloadAudioAsset(ASSET_KEYS.gateUnlock);
    this.preloadAudioAsset(ASSET_KEYS.loreEnter);
    this.preloadAudioAsset(ASSET_KEYS.loreExit);
    this.preloadAudioAsset(ASSET_KEYS.banishmentSting);
    this.preloadAudioAsset(ASSET_KEYS.ambientChamber01Loop01);
    this.preloadAudioAsset(ASSET_KEYS.ambientChamber02Loop01);
  }


  preloadAudioAsset(assetKey) {
    const assetUrl = ASSET_URLS[assetKey];
    if (!assetUrl) {
      return;
    }

    this.load.audio(assetKey, assetUrl);
  }

  create() {
    this.hasStarted = false;
    this.cameras.main.setBackgroundColor('#110d0c');

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const smallViewport = this.scale.width < 760;

    if (this.textures.exists(ASSET_KEYS.chamberBackground)) {
      this.add
        .image(centerX, centerY, ASSET_KEYS.chamberBackground)
        .setDisplaySize(CONCEPT_PRESENTATION.chamberBackdrop.panelWidth, CONCEPT_PRESENTATION.chamberBackdrop.panelHeight)
        .setAlpha(0.2)
        .setTint(CONCEPT_PRESENTATION.chamberBackdrop.panelTint);
    }

    this.add
      .text(centerX, centerY - (smallViewport ? 88 : 42), 'BIOMECH RETRO HORROR', {
        fontFamily: 'monospace',
        fontSize: smallViewport ? '24px' : '32px',
        color: '#d4c8ba',
        align: 'center'
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY - (smallViewport ? 44 : 2), 'CHAMBERS 01-03 // SECTOR SLICE', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#8f7d72',
        align: 'center'
      })
      .setOrigin(0.5);

    const directBootEnabled = CHAMBER03_RESCUE_FLAGS.directBootEnabled;
    const interactionPrompt = smallViewport ? 'Tap to Begin' : 'Tap or Press Enter';
    const instructionText = smallViewport
      ? `Move: Arrow Keys\nAttack: X\nLore: E\nRestart: R\n\n${interactionPrompt}`
      : `Move: Arrow Keys\nAttack: X\nLore: E\nRestart after death: R\n\n${interactionPrompt}`;

    this.add
      .text(centerX, centerY + (smallViewport ? 48 : 54), instructionText, {
        fontFamily: 'monospace',
        fontSize: smallViewport ? '13px' : '14px',
        color: '#8a9f79',
        align: 'center'
      })
      .setOrigin(0.5);

    const buttonWidth = smallViewport ? 280 : 320;
    const buttonHeight = 74;
    const buttonY = centerY + (smallViewport ? 136 : 158);


    if (directBootEnabled) {
      this.add
        .text(centerX, buttonY - 68, 'DEBUG OVERRIDE: DIRECT BOOT TO CHAMBER 03 (RESCUE MODE)', {
          fontFamily: 'monospace',
          fontSize: smallViewport ? '11px' : '12px',
          color: '#cdbd89',
          align: 'center'
        })
        .setOrigin(0.5);
    }

    const tapRegion = this.add
      .rectangle(centerX, buttonY, buttonWidth, buttonHeight, 0x181211, 0.55)
      .setStrokeStyle(2, 0x8f7d72, 0.9)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(centerX, buttonY, interactionPrompt.toUpperCase(), {
        fontFamily: 'monospace',
        fontSize: smallViewport ? '20px' : '22px',
        color: '#d2c2ac',
        align: 'center'
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: tapRegion,
      alpha: { from: 0.5, to: 0.85 },
      duration: 900,
      yoyo: true,
      repeat: -1
    });

    const enter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    enter.once('down', () => this.beginChamber());
    tapRegion.once('pointerdown', () => this.beginChamber());

    this.input.once('pointerdown', () => {
      this.beginChamber();
    });

    if (typeof window !== 'undefined') {
      this.domEnterHandler = (event) => {
        if (event.code === 'Enter') {
          this.beginChamber();
        }
      };
      this.domPointerHandler = () => {
        this.beginChamber();
      };
      window.addEventListener('keydown', this.domEnterHandler);
      window.addEventListener('pointerdown', this.domPointerHandler, { passive: true });
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (typeof window !== 'undefined') {
        if (this.domEnterHandler) {
          window.removeEventListener('keydown', this.domEnterHandler);
          this.domEnterHandler = null;
        }
        if (this.domPointerHandler) {
          window.removeEventListener('pointerdown', this.domPointerHandler);
          this.domPointerHandler = null;
        }
      }
    });
  }

  beginChamber() {
    if (this.hasStarted) {
      return;
    }

    this.hasStarted = true;

    if (this.sound?.context?.state === 'suspended') {
      this.sound.context.resume().catch(() => {
        // Audio unlock must never block scene transition on mobile browsers.
      });
    }

    const targetSceneKey = CHAMBER03_RESCUE_FLAGS.directBootEnabled ? 'Chamber03Scene' : 'Chamber01Scene';
    this.scene.start(targetSceneKey, CHAMBER03_RESCUE_FLAGS.directBootEnabled ? { fromScene: this.scene.key, directBoot: true } : undefined);
  }
}
