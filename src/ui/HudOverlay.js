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
          .setScrollFactor(0)
          .setDepth(30)
          .setTint(0xd2c2ac)
          .setAlpha(0.9)
      : scene.add.rectangle(16, 16, 220, 62, 0x0f1313, 0.84).setOrigin(0).setScrollFactor(0).setDepth(30);

    if (!hasUiFrame) {
      frame.setStrokeStyle(2, 0x64453a, 0.92);
    }

    this.frame = frame;
    this.frameBacking = scene.add
      .rectangle(0, 0, 0, 0, 0x090807, 0.28)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(29.5);

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

    this.bossBarFrame = scene.add.rectangle(0, 0, 0, 0, 0x090807, 0.86).setScrollFactor(0).setDepth(66).setVisible(false);
    this.bossBarFrame.setStrokeStyle(2, 0x6b5647, 0.9);
    this.bossBarFill = scene.add.rectangle(0, 0, 0, 0, 0x7c1111, 0.96).setScrollFactor(0).setDepth(67).setVisible(false);
    this.bossBarUnderlay = scene.add.rectangle(0, 0, 0, 0, 0x18110f, 0.92).setScrollFactor(0).setDepth(66).setVisible(false);
    this.bossTelegraph = scene.add.rectangle(0, 0, 0, 0, 0xc39146, 0.22).setScrollFactor(0).setDepth(67).setVisible(false);
    this.bossNamePlate = scene.add.rectangle(0, 0, 0, 0, 0x120d0c, 0.78).setScrollFactor(0).setDepth(66).setVisible(false);
    this.bossName = scene.add
      .text(0, 0, '', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#d2c2ac',
        align: 'center'
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(67)
      .setVisible(false);
    this.bossSubtitle = scene.add
      .text(0, 0, '', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#8f7d72',
        align: 'center'
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(67)
      .setVisible(false);

    this.elements = [
      this.frameBacking,
      this.frame,
      this.healthLabel,
      this.healthValue,
      this.bossBarFrame,
      this.bossBarUnderlay,
      this.bossTelegraph,
      this.bossBarFill,
      this.bossNamePlate,
      this.bossName,
      this.bossSubtitle
    ];

    this.layout();
    scene.scale.on('resize', this.layout, this);
    scene.events.once('shutdown', () => {
      scene.scale.off('resize', this.layout, this);
    });
  }

  getSafeAreaInsetPx(edge = 'top') {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return 0;
    }

    const cssVar = `--safe-area-inset-${edge}`;
    const rawValue = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
    const parsed = Number.parseFloat(rawValue);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  layout() {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    const isPortrait = height >= width;
    const safeAreaTop = this.getSafeAreaInsetPx('top');
    const safeAreaBottom = this.getSafeAreaInsetPx('bottom');

    const frameX = isPortrait ? 12 : 16;
    const frameY = safeAreaTop + (isPortrait ? 10 : 14);
    const frameWidth = Math.min(width - frameX * 2, isPortrait ? 176 : 220);
    const frameHeight = isPortrait ? 50 : 62;
    const healthLabelX = frameX + (isPortrait ? 12 : 14);
    const healthLabelY = frameY + (isPortrait ? 9 : 12);
    const healthValueY = frameY + (isPortrait ? 24 : 30);

    if (this.frame.setDisplaySize) {
      this.frame.setPosition(frameX, frameY).setDisplaySize(frameWidth, frameHeight);
    } else {
      this.frame.setPosition(frameX, frameY).setSize(frameWidth, frameHeight);
    }

    this.frameBacking.setPosition(frameX + 5, frameY + 5).setSize(frameWidth - 10, frameHeight - 10);
    this.healthLabel
      .setPosition(healthLabelX, healthLabelY)
      .setFontSize(isPortrait ? '10px' : '12px');
    this.healthValue
      .setPosition(healthLabelX, healthValueY)
      .setFontSize(isPortrait ? '15px' : '18px');

    const frameWidthBoss = Math.min(width - (isPortrait ? 24 : 36), isPortrait ? 232 : 520);
    const frameHeightBoss = isPortrait ? 26 : 52;
    const underlayWidth = frameWidthBoss - (isPortrait ? 20 : 24);
    const underlayHeight = isPortrait ? 6 : 12;
    const centerX = width / 2;
    const centerY = isPortrait
      ? safeAreaTop + frameHeight + 20
      : height - (safeAreaBottom + 18) - frameHeightBoss / 2;

    this.bossBarFrame.setPosition(centerX, centerY).setSize(frameWidthBoss, frameHeightBoss);
    this.bossBarUnderlay.setPosition(centerX, centerY + (isPortrait ? 5 : 10)).setSize(underlayWidth, underlayHeight);
    this.bossTelegraph.setPosition(centerX - underlayWidth / 2, centerY + (isPortrait ? 5 : 10)).setOrigin(0, 0.5).setSize(0, underlayHeight);
    this.bossBarFill.setPosition(centerX - underlayWidth / 2, centerY + (isPortrait ? 5 : 10)).setOrigin(0, 0.5).setSize(underlayWidth, underlayHeight);
    this.bossNamePlate
      .setPosition(centerX, centerY - (isPortrait ? 5 : 10))
      .setSize(Math.min(frameWidthBoss - 18, isPortrait ? 186 : 300), isPortrait ? 12 : 24);
    this.bossName.setPosition(centerX, centerY - (isPortrait ? 6 : 13)).setFontSize(isPortrait ? 10 : 16);
    this.bossSubtitle.setPosition(centerX, centerY + (isPortrait ? 0 : 1)).setFontSize(isPortrait ? 8 : 10).setAlpha(isPortrait ? 0 : 1);
  }

  layoutBossBar() {
    this.layout();
  }

  update(current, max) {
    this.healthValue.setText(`${Math.max(current, 0)} / ${max}`);
  }

  setBossBarState({ visible, name = '', subtitle = '', current = 0, max = 1, telegraph = 0, wounded = false } = {}) {
    [this.bossBarFrame, this.bossBarUnderlay, this.bossTelegraph, this.bossBarFill, this.bossNamePlate, this.bossName, this.bossSubtitle].forEach((element) => {
      element.setVisible(visible);
    });

    if (!visible) {
      return;
    }

    this.layout();
    const ratio = max <= 0 ? 0 : Math.max(0, Math.min(1, current / max));
    const telegraphRatio = Math.max(0, Math.min(1, telegraph));
    this.bossName.setText(name);
    this.bossSubtitle.setText(subtitle);
    this.bossBarFill.displayWidth = Math.max(0, this.bossBarUnderlay.width * ratio);
    this.bossTelegraph.displayWidth = Math.max(0, this.bossBarUnderlay.width * telegraphRatio);
    this.bossBarFill.setFillStyle(wounded ? 0xa46d48 : 0x7c1111, wounded ? 1 : 0.97);
    this.bossBarFrame.setStrokeStyle(2, telegraphRatio > 0 ? 0xae8750 : wounded ? 0x8b6246 : 0x6b5647, 0.96);
    this.bossNamePlate.setFillStyle(telegraphRatio > 0 ? 0x1d140f : 0x120d0c, telegraphRatio > 0 ? 0.88 : 0.78);
    this.bossName.setColor(telegraphRatio > 0 ? '#f0d9a7' : '#dcccb5');
    this.bossSubtitle.setColor(telegraphRatio > 0 ? '#d4b57b' : wounded ? '#c9a282' : '#9a8779');
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
