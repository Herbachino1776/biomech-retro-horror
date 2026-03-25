import Phaser from 'phaser';

const DEFAULT_STYLE = {
  fillColor: 0x15070a,
  fillAlpha: 0.22,
  outerRingColor: 0x5e1b22,
  outerRingAlpha: 0.78,
  innerRingColor: 0x311118,
  innerRingAlpha: 0.66,
  sigilColor: 0x1b3a3a,
  sigilAlpha: 0.3,
  runeColor: 0x2a1217,
  runeAlpha: 0.7,
  depth: 6.1
};

export class AoeTelegraph {
  constructor(scene, style = {}) {
    this.scene = scene;
    this.style = {
      ...DEFAULT_STYLE,
      ...style
    };
    this.graphics = scene.add.graphics().setDepth(this.style.depth).setVisible(false);
    this.visible = false;
    this.shape = null;
  }

  drawCircle({ x, y, radius, progress = 0, time = this.scene.time.now }) {
    if (!radius || radius <= 0) {
      this.clear();
      return;
    }

    const pulse = 1 + Math.sin(time / 120) * 0.04;
    const easedProgress = Phaser.Math.Easing.Cubic.Out(Phaser.Math.Clamp(progress, 0, 1));
    const outerRadius = radius * (0.92 + easedProgress * 0.12) * pulse;
    const innerRadius = outerRadius * 0.72;
    const runeRadius = outerRadius * 0.86;

    this.graphics.clear();
    this.graphics.setVisible(true);
    this.visible = true;
    this.shape = { type: 'circle', x, y, radius };

    this.graphics.fillStyle(this.style.fillColor, this.style.fillAlpha * (0.72 + easedProgress * 0.2));
    this.graphics.fillCircle(x, y, outerRadius * 0.98);

    this.graphics.lineStyle(4, this.style.outerRingColor, this.style.outerRingAlpha * (0.66 + easedProgress * 0.3));
    this.graphics.strokeCircle(x, y, outerRadius);

    this.graphics.lineStyle(2, this.style.innerRingColor, this.style.innerRingAlpha * (0.7 + easedProgress * 0.24));
    this.graphics.strokeCircle(x, y, innerRadius);

    const runeCount = 6;
    for (let i = 0; i < runeCount; i += 1) {
      const angle = (Math.PI * 2 * i) / runeCount + time / 920;
      const runeX = x + Math.cos(angle) * runeRadius;
      const runeY = y + Math.sin(angle) * runeRadius;
      this.graphics.fillStyle(this.style.runeColor, this.style.runeAlpha * (0.58 + easedProgress * 0.34));
      this.graphics.fillCircle(runeX, runeY, 4 + easedProgress * 1.6);
    }

    this.graphics.lineStyle(2, this.style.sigilColor, this.style.sigilAlpha * (0.52 + easedProgress * 0.42));
    this.graphics.strokeCircle(x, y, outerRadius * (0.5 + easedProgress * 0.16));

    this.graphics.lineBetween(x - outerRadius * 0.48, y, x + outerRadius * 0.48, y);
    this.graphics.lineBetween(x, y - outerRadius * 0.48, x, y + outerRadius * 0.48);
  }

  drawLine({ startX, startY, endX, endY, width = 12, progress = 0, time = this.scene.time.now, active = false }) {
    this.graphics.clear();
    this.graphics.setVisible(true);
    this.visible = true;
    this.shape = { type: 'line', startX, startY, endX, endY, width };

    const easedProgress = Phaser.Math.Easing.Cubic.Out(Phaser.Math.Clamp(progress, 0, 1));
    const pulse = 1 + Math.sin(time / 56) * 0.06;
    const lineWidth = width * (0.9 + easedProgress * 0.18) * pulse;
    const edgeWidth = Math.max(2, lineWidth * 0.18);
    const spineWidth = Math.max(2, lineWidth * 0.36);
    const activeBoost = active ? 1.2 : 1;

    this.graphics.lineStyle(lineWidth, 0x090405, 0.36 * activeBoost);
    this.graphics.lineBetween(startX, startY, endX, endY);

    this.graphics.lineStyle(lineWidth * 0.82, this.style.outerRingColor, (0.28 + easedProgress * 0.24) * activeBoost);
    this.graphics.lineBetween(startX, startY, endX, endY);

    this.graphics.lineStyle(spineWidth, this.style.innerRingColor, (0.4 + easedProgress * 0.22) * activeBoost);
    this.graphics.lineBetween(startX, startY, endX, endY);

    this.graphics.lineStyle(edgeWidth, this.style.sigilColor, (0.24 + easedProgress * 0.22) * activeBoost);
    this.graphics.lineBetween(startX, startY, endX, endY);

    const runeCount = 4;
    const dx = endX - startX;
    const dy = endY - startY;
    for (let i = 1; i <= runeCount; i += 1) {
      const t = i / (runeCount + 1);
      const runeX = startX + dx * t;
      const runeY = startY + dy * t;
      const runeRadius = Math.max(2.5, width * 0.12 + easedProgress * 1.2);
      this.graphics.fillStyle(this.style.runeColor, (0.34 + easedProgress * 0.26) * activeBoost);
      this.graphics.fillCircle(runeX, runeY, runeRadius);
    }
  }

  clear() {
    this.graphics.clear();
    this.graphics.setVisible(false);
    this.visible = false;
    this.shape = null;
  }

  destroy() {
    this.clear();
    this.graphics?.destroy();
    this.graphics = null;
  }
}
