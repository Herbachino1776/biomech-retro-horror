import Phaser from 'phaser';

export class HudOverlay {
  constructor(scene) {
    this.scene = scene;
    this.integrityBarGeometry = { x: 0, y: 0, width: 0, height: 0 };
    this.currentRatio = 1;
    this.currentTrailRatio = 1;
    this.currentMax = 5;

    this.frame = scene.add.rectangle(16, 16, 220, 66, 0x0e1212, 0.9).setOrigin(0).setScrollFactor(0).setDepth(30);
    this.frame.setStrokeStyle(2, 0x6f5247, 0.9);

    this.frameBacking = scene.add
      .rectangle(0, 0, 0, 0, 0x070707, 0.44)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(29.5);

    this.healthLabel = scene.add
      .text(30, 26, 'VESSEL INTEGRITY', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#b59f8f'
      })
      .setScrollFactor(0)
      .setDepth(31);

    this.integrityBarUnderlay = scene.add
      .rectangle(0, 0, 0, 0, 0x14100f, 0.95)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(30.5);

    this.integrityBarPlate = scene.add
      .rectangle(0, 0, 0, 0, 0x0a0b0b, 0.84)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(30.75);

    this.integrityBarTrail = scene.add
      .rectangle(0, 0, 0, 0, 0x7a2c36, 0.62)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(30.9);

    this.integrityBarFill = scene.add
      .rectangle(0, 0, 0, 0, 0xba4a58, 0.98)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(31);

    this.bossBarFrame = scene.add.rectangle(0, 0, 0, 0, 0x080607, 0.9).setScrollFactor(0).setDepth(66).setVisible(false);
    this.bossBarFrame.setStrokeStyle(2, 0x54202a, 0.9);
    this.bossBarFill = scene.add.rectangle(0, 0, 0, 0, 0x4f0815, 0.98).setScrollFactor(0).setDepth(67).setVisible(false);
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
    this.bossBarVisible = false;

    this.elements = [
      this.frameBacking,
      this.frame,
      this.healthLabel,
      this.integrityBarUnderlay,
      this.integrityBarPlate,
      this.integrityBarTrail,
      this.integrityBarFill,
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

    const frameX = isPortrait ? 10 : 16;
    const frameY = safeAreaTop + (isPortrait ? 10 : 14);
    const frameWidth = Math.min(width - frameX * 2, isPortrait ? 188 : 238);
    const frameHeight = isPortrait ? 56 : 66;
    const labelX = frameX + (isPortrait ? 12 : 14);
    const labelY = frameY + (isPortrait ? 8 : 11);

    if (this.frame.setDisplaySize) {
      this.frame.setPosition(frameX, frameY).setDisplaySize(frameWidth, frameHeight);
    } else {
      this.frame.setPosition(frameX, frameY).setSize(frameWidth, frameHeight);
    }

    this.frameBacking.setPosition(frameX + 4, frameY + 4).setSize(frameWidth - 8, frameHeight - 8);
    this.healthLabel.setPosition(labelX, labelY).setFontSize(isPortrait ? '10px' : '12px');

    const barX = frameX + (isPortrait ? 11 : 14);
    const barY = frameY + (isPortrait ? 31 : 38);
    const barWidth = frameWidth - (isPortrait ? 22 : 28);
    const barHeight = isPortrait ? 11 : 13;

    this.integrityBarUnderlay.setPosition(barX - 1, barY - 1).setSize(barWidth + 2, barHeight + 2);
    this.integrityBarPlate.setPosition(barX, barY).setSize(barWidth, barHeight);
    this.integrityBarGeometry = { x: barX, y: barY, width: barWidth, height: barHeight };
    this.refreshIntegrityBarGeometry();

    const frameWidthBoss = Math.min(width - (isPortrait ? 20 : 34), isPortrait ? 266 : 564);
    const frameHeightBoss = isPortrait ? 34 : 62;
    const underlayWidth = frameWidthBoss - (isPortrait ? 18 : 24);
    const underlayHeight = isPortrait ? 10 : 16;
    const centerX = width / 2;
    const centerY = isPortrait
      ? safeAreaTop + frameHeight + 34
      : height - (safeAreaBottom + 18) - frameHeightBoss / 2;

    this.bossBarFrame.setPosition(centerX, centerY).setSize(frameWidthBoss, frameHeightBoss);
    this.bossBarUnderlay.setPosition(centerX, centerY + (isPortrait ? 8 : 12)).setSize(underlayWidth, underlayHeight);
    this.bossTelegraph.setPosition(centerX - underlayWidth / 2, centerY + (isPortrait ? 8 : 12)).setOrigin(0, 0.5).setSize(0, underlayHeight);
    this.bossBarFill.setPosition(centerX - underlayWidth / 2, centerY + (isPortrait ? 8 : 12)).setOrigin(0, 0.5).setSize(underlayWidth, underlayHeight);
    this.bossNamePlate
      .setPosition(centerX, centerY - (isPortrait ? 8 : 12))
      .setSize(Math.min(frameWidthBoss - 16, isPortrait ? 216 : 318), isPortrait ? 14 : 24);
    this.bossName.setPosition(centerX, centerY - (isPortrait ? 9 : 15)).setFontSize(isPortrait ? 11 : 17);
    this.bossSubtitle.setPosition(centerX, centerY - (isPortrait ? 1 : 1)).setFontSize(isPortrait ? 8 : 10).setAlpha(isPortrait ? 0 : 1);
  }

  layoutBossBar() {
    this.layout();
  }

  update(current, max) {
    const safeMax = Math.max(1, Number(max) || 1);
    const clampedCurrent = Phaser.Math.Clamp(Number(current) || 0, 0, safeMax);
    const targetRatio = clampedCurrent / safeMax;
    const frameDelta = Math.max(1 / 120, this.scene.game?.loop?.delta / 1000 || 1 / 60);
    const fillLerp = Phaser.Math.Clamp(frameDelta * 16, 0, 1);
    const trailLerp = Phaser.Math.Clamp(frameDelta * 7, 0, 1);

    this.currentMax = safeMax;
    this.currentRatio = Phaser.Math.Linear(this.currentRatio, targetRatio, fillLerp);
    this.currentTrailRatio = Phaser.Math.Linear(this.currentTrailRatio, targetRatio, trailLerp);
    this.refreshIntegrityBarGeometry();
  }

  refreshIntegrityBarGeometry() {
    const { x, y, width, height } = this.integrityBarGeometry;
    const fillWidth = Math.max(0, width * Phaser.Math.Clamp(this.currentRatio, 0, 1));
    const trailWidth = Math.max(fillWidth, width * Phaser.Math.Clamp(this.currentTrailRatio, 0, 1));

    this.integrityBarTrail.setPosition(x, y).setSize(trailWidth, height);
    this.integrityBarFill.setPosition(x, y).setSize(fillWidth, height);
  }

  setBossBarState({ visible, name = '', subtitle = '', current = 0, max = 1, telegraph = 0, wounded = false } = {}) {
    this.bossBarVisible = Boolean(visible);
    [this.bossBarFrame, this.bossBarUnderlay, this.bossTelegraph, this.bossBarFill, this.bossNamePlate, this.bossName, this.bossSubtitle].forEach((element) => {
      element.setVisible(this.bossBarVisible);
    });

    if (!this.bossBarVisible) {
      return;
    }

    this.layout();
    const ratio = max <= 0 ? 0 : Math.max(0, Math.min(1, current / max));
    const telegraphRatio = Math.max(0, Math.min(1, telegraph));
    this.bossName.setText(name);
    this.bossSubtitle.setText(subtitle);
    this.bossBarFill.displayWidth = Math.max(0, this.bossBarUnderlay.width * ratio);
    this.bossTelegraph.displayWidth = Math.max(0, this.bossBarUnderlay.width * telegraphRatio);
    this.bossBarFill.setFillStyle(wounded ? 0x7c2d3b : 0x4f0815, wounded ? 1 : 0.98);
    this.bossBarFrame.setStrokeStyle(2, telegraphRatio > 0 ? 0xae8750 : wounded ? 0x7f3f4c : 0x54202a, 0.96);
    this.bossNamePlate.setFillStyle(telegraphRatio > 0 ? 0x1d140f : 0x120d0c, telegraphRatio > 0 ? 0.88 : 0.78);
    this.bossName.setColor(telegraphRatio > 0 ? '#f0d9a7' : '#dcccb5');
    this.bossSubtitle.setColor(telegraphRatio > 0 ? '#d4b57b' : wounded ? '#c9a282' : '#9a8779');
  }

  setVisible(visible) {
    const uiVisible = Boolean(visible);
    [this.frameBacking, this.frame, this.healthLabel, this.integrityBarUnderlay, this.integrityBarPlate, this.integrityBarTrail, this.integrityBarFill].forEach((element) => {
      element.setVisible(uiVisible);
    });
    [this.bossBarFrame, this.bossBarUnderlay, this.bossTelegraph, this.bossBarFill, this.bossNamePlate, this.bossName, this.bossSubtitle].forEach((element) => {
      element.setVisible(uiVisible && this.bossBarVisible);
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
