import Phaser from 'phaser';
import { ASSET_KEYS } from '../data/assetKeys.js';

const CARD_STYLE = {
  border: 0xb8a48f,
  panel: 0x120e0d,
  shadow: 0x050404,
  accent: 0x8ea271
};

export class SectorCompleteScene extends Phaser.Scene {
  constructor() {
    super('SectorCompleteScene');
  }

  init(data) {
    this.transitionContext = data ?? {};
  }

  create() {
    this.sound?.getAll?.().forEach((sound) => {
      if (sound?.key === ASSET_KEYS.ambientChamber01Loop01 || sound?.key === ASSET_KEYS.ambientChamber02Loop01) {
        sound.stop();
        sound.destroy();
      }
    });

    const width = this.scale.width;
    const height = this.scale.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const cardWidth = Math.min(width - 40, 700);
    const cardHeight = Math.min(height - 48, 420);

    this.cameras.main.setBackgroundColor('#050404');
    this.input.keyboard?.removeAllKeys(false);

    this.add.rectangle(centerX, centerY, width, height, 0x050404, 1);
    this.add.ellipse(centerX, centerY + 26, cardWidth + 90, cardHeight - 30, CARD_STYLE.shadow, 0.55);

    if (this.textures.exists(ASSET_KEYS.chamber03BackgroundThreshold)) {
      this.add
        .image(centerX, centerY - 54, ASSET_KEYS.chamber03BackgroundThreshold)
        .setDisplaySize(cardWidth * 0.88, cardHeight * 0.56)
        .setTint(0x8d9d7b)
        .setAlpha(0.22);
    }

    this.add
      .rectangle(centerX, centerY, cardWidth, cardHeight, CARD_STYLE.panel, 0.92)
      .setStrokeStyle(3, CARD_STYLE.border, 0.88);

    this.add
      .text(centerX, centerY - 122, 'SECTOR I SEALED', {
        fontFamily: 'monospace',
        fontSize: width < 520 ? '24px' : '30px',
        color: '#d6c8b3',
        align: 'center'
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY - 58, 'The Ossuary Choir falls silent.\nA deeper descent now waits below the ruptured gate.', {
        fontFamily: 'monospace',
        fontSize: width < 520 ? '15px' : '18px',
        color: '#aebd95',
        align: 'center',
        wordWrap: { width: cardWidth - 84, useAdvancedWrap: true },
        lineSpacing: 8
      })
      .setOrigin(0.5);

    this.add
      .text(
        centerX,
        centerY + 36,
        'This is an intentional holding threshold.\nBucket II is not yet embodied in this build.\n\nPress [ENTER] or tap to return to the title rite.',
        {
          fontFamily: 'monospace',
          fontSize: width < 520 ? '13px' : '15px',
          color: '#c7b8a3',
          align: 'center',
          wordWrap: { width: cardWidth - 84, useAdvancedWrap: true },
          lineSpacing: 7
        }
      )
      .setOrigin(0.5);

    const actionPrompt = this.add
      .text(centerX, centerY + 138, 'RETURN TO TITLE', {
        fontFamily: 'monospace',
        fontSize: width < 520 ? '18px' : '20px',
        color: '#d8d0bc',
        align: 'center'
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: actionPrompt,
      alpha: { from: 0.5, to: 1 },
      duration: 900,
      yoyo: true,
      repeat: -1
    });

    const advance = () => {
      if (this.isTransitioning) {
        return;
      }

      this.isTransitioning = true;
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('BootScene');
      });
      this.cameras.main.fadeOut(260, 0, 0, 0);
    };

    this.input.once('pointerdown', advance);
    this.input.keyboard?.once('keydown-ENTER', advance);
    this.input.keyboard?.once('keydown-SPACE', advance);
  }
}
