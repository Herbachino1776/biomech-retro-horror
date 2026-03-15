import { CONCEPT_PRESENTATION } from '../data/milestone1Config.js';
import { ASSET_KEYS } from '../data/assetKeys.js';

export class DialogueSystem {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.active = false;

    this.container = scene.add.container(0, 0).setDepth(40).setScrollFactor(0).setVisible(false);

    const insetX = (scene.scale.width - config.width) / 2;
    const insetY = scene.scale.height - config.height - 18;

    const hasUiFrame = scene.textures.exists(ASSET_KEYS.uiFrame);
    const outer = hasUiFrame
      ? scene.add
          .image(insetX, insetY, ASSET_KEYS.uiFrame)
          .setOrigin(0)
          .setCrop(
            CONCEPT_PRESENTATION.uiFrame.crop.x,
            CONCEPT_PRESENTATION.uiFrame.crop.y,
            CONCEPT_PRESENTATION.uiFrame.crop.width,
            CONCEPT_PRESENTATION.uiFrame.crop.height
          )
          .setDisplaySize(config.width, config.height)
          .setTint(0xd2c2ac)
      : scene.add.rectangle(insetX, insetY, config.width, config.height, 0x0f1313).setOrigin(0);

    if (!hasUiFrame) {
      outer.setStrokeStyle(3, 0x64453a, 1);
    }

    const inner = scene.add.rectangle(insetX + 8, insetY + 8, config.width - 16, config.height - 16, 0x1f1714, 0.94).setOrigin(0);
    inner.setStrokeStyle(1, 0x6f8c59, 0.6);

    this.text = scene.add.text(insetX + config.textPadding, insetY + config.textPadding, '', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#d2c2ac',
      wordWrap: { width: config.width - config.textPadding * 2, useAdvancedWrap: true }
    });

    this.prompt = scene.add.text(insetX + config.width - 190, insetY + config.height - 34, '[E] continue', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#8a9f79'
    });

    this.container.add([outer, inner, this.text, this.prompt]);
  }

  show(message) {
    this.active = true;
    this.text.setText(message);
    this.container.setVisible(true);
  }

  hide() {
    this.active = false;
    this.container.setVisible(false);
  }
}
