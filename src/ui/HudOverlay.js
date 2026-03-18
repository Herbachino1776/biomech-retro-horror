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

    this.bossBarFrame = scene.add.rectangle(0, 0, 0, 0, 0x090807, 0.88).setScrollFactor(0).setDepth(30).setVisible(false);
    this.bossBarFrame.setStrokeStyle(2, 0x6b5647, 0.95);
    this.bossBarFill = scene.add.rectangle(0, 0, 0, 0, 0x7c1111, 0.95).setScrollFactor(0).setDepth(31).setVisible(false);
    this.bossBarUnderlay = scene.add.rectangle(0, 0, 0, 0, 0x1e1614, 0.95).setScrollFactor(0).setDepth(30).setVisible(false);
    this.bossName = scene.add
      .text(0, 0, '', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#d2c2ac',
        align: 'center'
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(31)
      .setVisible(false);

    this.frame = frame;
    this.elements = [
      this.frame,
      this.healthLabel,
      this.healthValue,
      this.bossBarFrame,
      this.bossBarUnderlay,
      this.bossBarFill,
      this.bossName
    ];

    this.layoutBossBar();
    scene.scale.on('resize', this.layoutBossBar, this);
    scene.events.once('shutdown', () => {
      scene.scale.off('resize', this.layoutBossBar, this);
    });
  }

  layoutBossBar() {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    const isPortrait = height >= width;
    const frameWidth = Math.min(width - 32, isPortrait ? 312 : 520);
    const frameHeight = isPortrait ? 46 : 52;
    const bottomMargin = isPortrait ? 22 : 18;
    const centerX = width / 2;
    const centerY = height - bottomMargin - frameHeight / 2;

    this.bossBarFrame.setPosition(centerX, centerY).setSize(frameWidth, frameHeight);
    this.bossBarUnderlay.setPosition(centerX, centerY + 8).setSize(frameWidth - 24, 12);
    this.bossBarFill.setPosition(centerX - (frameWidth - 24) / 2, centerY + 8).setOrigin(0, 0.5).setSize(frameWidth - 24, 12);
    this.bossName.setPosition(centerX, centerY - 9).setFontSize(isPortrait ? 13 : 16);
  }

  update(current, max) {
    this.healthValue.setText(`${Math.max(current, 0)} / ${max}`);
  }

  setBossBarState({ visible, name = '', current = 0, max = 1 } = {}) {
    [this.bossBarFrame, this.bossBarUnderlay, this.bossBarFill, this.bossName].forEach((element) => {
      element.setVisible(visible);
    });

    if (!visible) {
      return;
    }

    this.layoutBossBar();
    const ratio = max <= 0 ? 0 : Math.max(0, Math.min(1, current / max));
    this.bossName.setText(name);
    this.bossBarFill.displayWidth = Math.max(0, this.bossBarUnderlay.width * ratio);
  }

  setVisible(visible) {
    this.elements.forEach((element) => {
      element.setVisible(visible);
    });
  }

  destroy() {
    this.elements.forEach((element) => {
      if (element?.active) {
        element.destroy();
      }
    });
    this.elements.length = 0;
  }
}
