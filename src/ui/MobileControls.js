import Phaser from 'phaser';

const CONTROL_COLORS = {
  outer: 0x261d19,
  inner: 0x3a2b24,
  stroke: 0x8f7d72,
  active: 0x6f8c59,
  glyph: '#d2c2ac'
};

export class MobileControls {
  constructor(scene) {
    this.scene = scene;
    this.enabled = scene.sys.game.device.input.touch;
    this.mode = 'init';

    this.state = {
      left: false,
      right: false,
      jump: false,
      attack: false,
      interact: false
    };

    this.justPressed = {
      jump: false,
      attack: false,
      interact: false
    };

    this.activePointers = {
      left: new Set(),
      right: new Set(),
      jump: new Set(),
      attack: new Set(),
      interact: new Set()
    };

    this.controls = [];
    this.container = scene.add.container(0, 0).setDepth(60).setScrollFactor(0).setVisible(this.enabled);

    if (!this.enabled) {
      return;
    }

    this.createControls();

    scene.scale.on('resize', this.layout, this);
    scene.events.on('shutdown', this.destroy, this);
    scene.input.on('gameout', this.releaseAll, this);
  }

  createControls() {
    this.dpadBase = this.scene.add.circle(0, 0, 72, CONTROL_COLORS.outer, 0.68).setStrokeStyle(3, CONTROL_COLORS.stroke, 0.8);
    this.container.add(this.dpadBase);

    this.leftControl = this.createButton('◀', 'left', 0, 0, 34);
    this.rightControl = this.createButton('▶', 'right', 0, 0, 34);
    this.upControl = this.createButton('▲', 'jump', 0, 0, 30);
    this.downControl = this.createButton('▼', 'none', 0, 0, 30, 0.45);

    this.attackControl = this.createButton('ATTACK', 'attack', 0, 0, 42);
    this.interactControl = this.createButton('RITE', 'interact', 0, 0, 34);

    this.layout();
    this.setMode('gameplay');
  }

  createButton(label, action, x, y, radius, alpha = 0.75) {
    const button = this.scene.add.container(x, y);
    const ring = this.scene.add.circle(0, 0, radius, CONTROL_COLORS.inner, alpha).setStrokeStyle(2, CONTROL_COLORS.stroke, 0.95);
    const text = this.scene.add
      .text(0, 1, label, {
        fontFamily: 'monospace',
        fontSize: radius > 38 ? '15px' : '14px',
        color: CONTROL_COLORS.glyph,
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    button.add([ring, text]);
    button.ring = ring;
    button.action = action;

    if (action !== 'none') {
      ring
        .setInteractive({ useHandCursor: false })
        .on('pointerdown', (pointer) => this.onPress(action, pointer.id, ring))
        .on('pointerup', (pointer) => this.onRelease(action, pointer.id, ring))
        .on('pointerout', (pointer) => this.onRelease(action, pointer.id, ring));

      this.controls.push(button);
    }

    this.container.add(button);
    return button;
  }

  onPress(action, pointerId, ring) {
    this.activePointers[action].add(pointerId);
    if (!this.state[action]) {
      if (action === 'jump' || action === 'attack' || action === 'interact') {
        this.justPressed[action] = true;
      }
    }

    this.state[action] = true;
    ring.setFillStyle(CONTROL_COLORS.active, 0.9);
  }

  onRelease(action, pointerId, ring) {
    this.activePointers[action].delete(pointerId);
    const stillActive = this.activePointers[action].size > 0;
    this.state[action] = stillActive;

    if (!stillActive) {
      ring.setFillStyle(CONTROL_COLORS.inner, 0.75);
    }
  }

  releaseAll() {
    Object.keys(this.activePointers).forEach((action) => {
      this.activePointers[action].clear();
      if (this.state[action]) {
        this.state[action] = false;
      }
    });

    this.controls.forEach((control) => {
      control.ring.setFillStyle(CONTROL_COLORS.inner, 0.75);
    });
  }

  getInputState() {
    const snapshot = {
      left: this.state.left,
      right: this.state.right,
      jumpPressed: this.justPressed.jump || this.state.jump,
      attackPressed: this.justPressed.attack,
      interactPressed: this.justPressed.interact
    };

    this.justPressed.jump = false;
    this.justPressed.attack = false;
    this.justPressed.interact = false;

    return snapshot;
  }

  layout() {
    if (!this.enabled) {
      return;
    }

    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    const leftAnchorX = Math.max(92, width * 0.17);
    const lowerAnchorY = Math.max(106, height - 96);
    const rightAnchorX = Math.min(width - 92, width * 0.83);

    this.dpadBase.setPosition(leftAnchorX, lowerAnchorY);
    this.leftControl.setPosition(leftAnchorX - 50, lowerAnchorY);
    this.rightControl.setPosition(leftAnchorX + 50, lowerAnchorY);
    this.upControl.setPosition(leftAnchorX, lowerAnchorY - 50);
    this.downControl.setPosition(leftAnchorX, lowerAnchorY + 50);

    this.attackControl.setPosition(rightAnchorX, lowerAnchorY - 10);
    this.interactControl.setPosition(rightAnchorX - 80, lowerAnchorY + 40);
  }

  setMode(mode) {
    if (!this.enabled || this.mode === mode) {
      return;
    }

    this.mode = mode;
    const gameplayVisible = mode === 'gameplay';

    this.dpadBase.setVisible(gameplayVisible);
    this.leftControl.setVisible(gameplayVisible);
    this.rightControl.setVisible(gameplayVisible);
    this.upControl.setVisible(gameplayVisible);
    this.downControl.setVisible(gameplayVisible);
    this.attackControl.setVisible(gameplayVisible);

    this.interactControl.setVisible(mode !== 'gameplay');
    this.releaseAll();

    if (mode === 'dialogue' || mode === 'dead') {
      this.interactControl.setPosition(this.scene.scale.width - 92, 88);
      this.interactControl.ring.setFillStyle(CONTROL_COLORS.inner, 0.9);
    } else {
      this.layout();
    }
  }

  destroy() {
    this.scene.scale.off('resize', this.layout, this);
    this.scene.input.off('gameout', this.releaseAll, this);
    this.releaseAll();
    this.container.destroy(true);
  }
}
