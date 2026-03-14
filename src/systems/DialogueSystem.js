export class DialogueSystem {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.active = false;

    this.container = scene.add.container(0, 0).setDepth(40).setVisible(false);

    const insetX = (scene.scale.width - config.width) / 2;
    const insetY = scene.scale.height - config.height - 18;

    const outer = scene.add.rectangle(insetX, insetY, config.width, config.height, 0x0f1313).setOrigin(0);
    outer.setStrokeStyle(3, 0x64453a, 1);

    const inner = scene.add.rectangle(insetX + 8, insetY + 8, config.width - 16, config.height - 16, 0x1f1714).setOrigin(0);
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
