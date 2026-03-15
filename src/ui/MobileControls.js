import Phaser from 'phaser';

const CONTROL_COLORS = {
  outer: 0x261d19,
  inner: 0x3a2b24,
  stroke: 0x8f7d72,
  active: 0x6f8c59,
  glyph: '#d2c2ac'
};

const GAMEPLAY_RING_ALPHA = 0.75;
const FOCUSED_RING_ALPHA = 0.9;
const SHOW_MOBILE_FIXED_DEBUG_LABEL = true;

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

    this.pointerActionById = new Map();
    this.controls = [];
    this.uiElements = [];

    if (!this.enabled) {
      return;
    }

    this.createControls();

    scene.scale.on('resize', this.layout, this);
    scene.events.on('shutdown', this.destroy, this);
    scene.input.on('gameout', this.releaseAll, this);
    scene.input.on('pointerup', this.handlePointerUpAnywhere, this);
  }

  createControls() {
    this.dpadBase = this.scene.add
      .circle(0, 0, 72, CONTROL_COLORS.outer, 0.68)
      .setStrokeStyle(3, CONTROL_COLORS.stroke, 0.8)
      .setDepth(60)
      .setScrollFactor(0);
    this.uiElements.push(this.dpadBase);

    this.leftControl = this.createButton('◀', 'left', 34);
    this.rightControl = this.createButton('▶', 'right', 34);
    this.upControl = this.createButton('▲', 'jump', 30);
    this.downControl = this.createButton('▼', 'none', 30, 0.45);

    this.attackControl = this.createButton('ATTACK', 'attack', 42);
    this.interactControl = this.createButton('RITE', 'interact', 34);

    if (SHOW_MOBILE_FIXED_DEBUG_LABEL) {
      this.fixedModeLabel = this.scene.add
        .text(8, 8, 'MOBILE HUD: FIXED SCREEN-SPACE', {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#8a9f79',
          backgroundColor: '#140f0dcc',
          padding: { x: 4, y: 3 }
        })
        .setDepth(125)
        .setScrollFactor(0);
      this.uiElements.push(this.fixedModeLabel);
    }

    this.layout();
    this.setMode('gameplay');
  }

  createButton(label, action, radius, alpha = GAMEPLAY_RING_ALPHA) {
    const ring = this.scene.add
      .circle(0, 0, radius, CONTROL_COLORS.inner, alpha)
      .setStrokeStyle(2, CONTROL_COLORS.stroke, 0.95)
      .setDepth(60)
      .setScrollFactor(0);

    const text = this.scene.add
      .text(0, 1, label, {
        fontFamily: 'monospace',
        fontSize: radius > 38 ? '15px' : '14px',
        color: CONTROL_COLORS.glyph,
        fontStyle: 'bold'
      })
      .setOrigin(0.5)
      .setDepth(61)
      .setScrollFactor(0);

    const hitArea = this.scene.add
      .zone(0, 0, radius * 2.5, radius * 2.5)
      .setOrigin(0.5)
      .setDepth(62)
      .setScrollFactor(0);

    const control = {
      action,
      radius,
      ring,
      text,
      hitArea,
      setPosition: (x, y) => {
        ring.setPosition(x, y);
        text.setPosition(x, y + 1);
        hitArea.setPosition(x, y);
      },
      setVisible: (visible) => {
        ring.setVisible(visible);
        text.setVisible(visible);
        hitArea.setVisible(visible);
        if (!visible) {
          hitArea.disableInteractive();
        } else if (action !== 'none') {
          hitArea.setInteractive({ useHandCursor: false });
        }
      }
    };

    if (action !== 'none') {
      hitArea
        .setInteractive({ useHandCursor: false })
        .on('pointerdown', (pointer) => this.onPress(action, pointer.id, control))
        .on('pointerup', (pointer) => this.onRelease(action, pointer.id, control))
        .on('pointerout', (pointer) => this.onRelease(action, pointer.id, control));

      this.controls.push(control);
    }

    this.uiElements.push(ring, text, hitArea);
    return control;
  }

  onPress(action, pointerId, control) {
    this.pointerActionById.set(pointerId, action);
    this.activePointers[action].add(pointerId);

    if (!this.state[action] && (action === 'jump' || action === 'attack' || action === 'interact')) {
      this.justPressed[action] = true;
    }

    this.state[action] = true;
    control.ring.setFillStyle(CONTROL_COLORS.active, FOCUSED_RING_ALPHA);
  }

  onRelease(action, pointerId, control) {
    if (this.pointerActionById.get(pointerId) === action) {
      this.pointerActionById.delete(pointerId);
    }

    this.activePointers[action].delete(pointerId);
    const stillActive = this.activePointers[action].size > 0;
    this.state[action] = stillActive;

    if (!stillActive) {
      control.ring.setFillStyle(CONTROL_COLORS.inner, GAMEPLAY_RING_ALPHA);
    }
  }

  handlePointerUpAnywhere(pointer) {
    const action = this.pointerActionById.get(pointer.id);
    if (!action) {
      return;
    }

    const control = this.controls.find((item) => item.action === action);
    if (control) {
      this.onRelease(action, pointer.id, control);
    }
  }

  releaseAll() {
    Object.keys(this.activePointers).forEach((action) => {
      this.activePointers[action].clear();
      this.state[action] = false;
    });

    this.pointerActionById.clear();

    this.controls.forEach((control) => {
      control.ring.setFillStyle(CONTROL_COLORS.inner, GAMEPLAY_RING_ALPHA);
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

    const leftAnchorX = Math.max(86, width * 0.18);
    const lowerAnchorY = Math.max(100, height - 86);
    const rightAnchorX = Math.min(width - 86, width * 0.82);

    this.dpadBase.setPosition(leftAnchorX, lowerAnchorY);
    this.leftControl.setPosition(leftAnchorX - 50, lowerAnchorY);
    this.rightControl.setPosition(leftAnchorX + 50, lowerAnchorY);
    this.upControl.setPosition(leftAnchorX, lowerAnchorY - 50);
    this.downControl.setPosition(leftAnchorX, lowerAnchorY + 50);

    this.attackControl.setPosition(rightAnchorX, lowerAnchorY - 12);
    this.interactControl.setPosition(rightAnchorX - 82, lowerAnchorY + 38);

    this.scene.input.setPollAlways();
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
      this.interactControl.ring.setFillStyle(CONTROL_COLORS.inner, FOCUSED_RING_ALPHA);
    } else {
      this.layout();
    }
  }

  destroy() {
    this.scene.scale.off('resize', this.layout, this);
    this.scene.input.off('gameout', this.releaseAll, this);
    this.scene.input.off('pointerup', this.handlePointerUpAnywhere, this);
    this.releaseAll();
    this.uiElements.forEach((element) => element.destroy());
    this.uiElements.length = 0;
  }
}
