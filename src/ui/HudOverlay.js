import { CONCEPT_PRESENTATION } from '../data/milestone1Config.js';
import { ASSET_KEYS } from '../data/assetKeys.js';

export class HudOverlay {
  constructor(scene) {
    this.scene = scene;

    const hasUiFrame = scene.textures.exists(ASSET_KEYS.uiFrame);
    const frame = hasUiFrame
      ? scene.add
          .image(16, 16, ASSET_KEYS.uiFrame)
          .setOrigin(0)
          .setCrop(
            CONCEPT_PRESENTATION.uiFrame.crop.x,
            CONCEPT_PRESENTATION.uiFrame.crop.y,
            CONCEPT_PRESENTATION.uiFrame.crop.width,
            CONCEPT_PRESENTATION.uiFrame.crop.height
          )
          .setDisplaySize(220, 62)
          .setScrollFactor(0)
          .setDepth(30)
          .setTint(0xd2c2ac)
      : scene.add.rectangle(16, 16, 220, 62, 0x0f1313).setOrigin(0).setScrollFactor(0).setDepth(30);

    if (!hasUiFrame) {
      frame.setStrokeStyle(2, 0x64453a, 1);
    }

    this.healthLabel = scene.add
      .text(30, 28, 'VESSEL INTEGRITY', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#8f7d72'
      })
      .setScrollFactor(0)
      .setDepth(31);

    this.healthValue = scene.add
      .text(30, 44, '5 / 5', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#d2c2ac'
      })
      .setScrollFactor(0)
      .setDepth(31);

    this.frame = frame;
  }

  update(current, max) {
    this.healthValue.setText(`${Math.max(current, 0)} / ${max}`);
  }
}
