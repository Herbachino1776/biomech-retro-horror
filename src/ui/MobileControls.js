import Phaser from 'phaser';
import { MOBILE_CONTROLS_LAYOUT } from '../data/layoutConfig.js';

const CONTROL_COLORS = {
  outer: 0x261d19,
  inner: 0x3a2b24,
  stroke: 0x8f7d72,
  active: 0x6f8c59,
  glyph: '#d2c2ac'
};

const GAMEPLAY_RING_ALPHA = 0.75;
const FOCUSED_RING_ALPHA = 0.9;

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
      jump: new Set(),
      attack: new Set(),
      interact: new Set()
    };

    this.pointerActionById = new Map();
    this.controls = [];
    this.uiElements = [];
    this.reservedBottomPx = 0;
    this.joystickPointerId = null;
    this.joystickVector = new Phaser.Math.Vector2();

    if (!this.enabled) {
      return;
    }

    this.createControls();

    scene.scale.on('resize', this.layout, this);
    scene.events.on('shutdown', this.destroy, this);
    scene.input.on('gameout', this.releaseAll, this);
    scene.input.on('pointerup', this.handlePointerUpAnywhere, this);
    scene.input.on('pointermove', this.handlePointerMove, this);
  }

  createControls() {
    this.joystickBase = this.scene.add
      .circle(0, 0, MOBILE_CONTROLS_LAYOUT.joystick.baseRadius, CONTROL_COLORS.outer, 0.68)
      .setStrokeStyle(3, CONTROL_COLORS.stroke, 0.8)
      .setDepth(60)
      .setScrollFactor(0);
    this.joystickKnob = this.scene.add
      .circle(0, 0, MOBILE_CONTROLS_LAYOUT.joystick.knobRadius, CONTROL_COLORS.inner, GAMEPLAY_RING_ALPHA)
      .setStrokeStyle(2, CONTROL_COLORS.stroke, 0.95)
      .setDepth(61)
      .setScrollFactor(0);
    this.joystickZone = this.scene.add
      .zone(0, 0, MOBILE_CONTROLS_LAYOUT.joystick.hitDiameter, MOBILE_CONTROLS_LAYOUT.joystick.hitDiameter)
      .setOrigin(0.5)
      .setDepth(62)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: false })
      .on('pointerdown', (pointer) => this.startJoystick(pointer));
    this.uiElements.push(this.joystickBase, this.joystickKnob, this.joystickZone);

    this.jumpControl = this.createButton('JUMP', 'jump', MOBILE_CONTROLS_LAYOUT.actionButtons.jumpRadius);
    this.attackControl = this.createButton('ATTACK', 'attack', MOBILE_CONTROLS_LAYOUT.actionButtons.attackRadius);
    this.interactControl = this.createButton('RITE', 'interact', MOBILE_CONTROLS_LAYOUT.actionButtons.interactRadius, 0.62);

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
        fontSize: radius > 36 ? '14px' : '13px',
        color: CONTROL_COLORS.glyph,
        fontStyle: 'bold'
      })
      .setOrigin(0.5)
      .setDepth(61)
      .setScrollFactor(0);

    const hitArea = this.scene.add
      .zone(0, 0, radius * 2.45, radius * 2.45)
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
        } else {
          hitArea.setInteractive({ useHandCursor: false });
        }
      }
    };

    hitArea
      .setInteractive({ useHandCursor: false })
      .on('pointerdown', (pointer) => this.onPress(action, pointer.id, control))
      .on('pointerup', (pointer) => this.onRelease(action, pointer.id, control))
      .on('pointerout', (pointer) => this.onRelease(action, pointer.id, control));

    this.controls.push(control);
    this.uiElements.push(ring, text, hitArea);
    return control;
  }

  startJoystick(pointer) {
    if (this.joystickPointerId !== null && this.joystickPointerId !== pointer.id) {
      return;
    }

    this.joystickPointerId = pointer.id;
    this.pointerActionById.set(pointer.id, 'joystick');
    this.updateJoystickFromPointer(pointer);
  }

  handlePointerMove(pointer) {
    if (pointer.id !== this.joystickPointerId) {
      return;
    }

    this.updateJoystickFromPointer(pointer);
  }

  updateJoystickFromPointer(pointer) {
    const dx = pointer.x - this.joystickBase.x;
    const dy = pointer.y - this.joystickBase.y;
    const maxDistance = MOBILE_CONTROLS_LAYOUT.joystick.maxTravel;
    const distance = Math.hypot(dx, dy);
    const clampedDistance = Math.min(distance, maxDistance);
    const angle = Math.atan2(dy, dx);
    const knobX = Math.cos(angle) * clampedDistance;
    const knobY = Math.sin(angle) * clampedDistance;

    this.joystickVector.set(knobX, knobY);
    this.joystickKnob.setPosition(this.joystickBase.x + knobX, this.joystickBase.y + knobY);
    this.joystickKnob.setFillStyle(CONTROL_COLORS.active, FOCUSED_RING_ALPHA);
    this.updateDirectionalState();
  }

  updateDirectionalState() {
    const deadZone = MOBILE_CONTROLS_LAYOUT.joystick.deadZone;
    this.state.left = this.joystickVector.x <= -deadZone;
    this.state.right = this.joystickVector.x >= deadZone;
  }

  resetJoystick() {
    this.joystickPointerId = null;
    this.joystickVector.set(0, 0);
    this.state.left = false;
    this.state.right = false;
    this.joystickKnob.setPosition(this.joystickBase.x, this.joystickBase.y);
    this.joystickKnob.setFillStyle(CONTROL_COLORS.inner, GAMEPLAY_RING_ALPHA);
  }

  onPress(action, pointerId, control) {
    this.pointerActionById.set(pointerId, action);
    this.activePointers[action].add(pointerId);

    if (!this.state[action]) {
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

    if (action === 'joystick') {
      this.pointerActionById.delete(pointer.id);
      this.resetJoystick();
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
    this.resetJoystick();

    this.controls.forEach((control) => {
      control.ring.setFillStyle(CONTROL_COLORS.inner, GAMEPLAY_RING_ALPHA);
    });
  }

  setReservedBottomPx(heightPx) {
    this.reservedBottomPx = Math.max(0, heightPx);
    this.layout();
  }

  getInputState() {
    const snapshot = {
      left: this.state.left,
      right: this.state.right,
      jumpPressed: this.justPressed.jump,
      attackPressed: this.justPressed.attack,
      interactPressed: this.justPressed.interact
    };

    this.justPressed.jump = false;
    this.justPressed.attack = false;
    this.justPressed.interact = false;

    return snapshot;
  }

  getSafeAreaInsetPx(edge = 'bottom') {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return 0;
    }

    const cssVar = `--safe-area-inset-${edge}`;
    const rawValue = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
    const parsed = Number.parseFloat(rawValue);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  layout() {
    if (!this.enabled) {
      return;
    }

    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    const isPortrait = height >= width;
    const safeAreaBottom = this.getSafeAreaInsetPx('bottom');
    const orientationLayout = isPortrait ? MOBILE_CONTROLS_LAYOUT.portrait : MOBILE_CONTROLS_LAYOUT.landscape;

    const leftAnchorX = Math.max(orientationLayout.horizontalEdgeInset, width * orientationLayout.leftAnchorRatio);
    const defaultReservedBottom = isPortrait
      ? orientationLayout.baseBandHeight + safeAreaBottom + MOBILE_CONTROLS_LAYOUT.safeAreaBottomPadding
      : 0;

    const reservedBottom = Math.max(this.reservedBottomPx, defaultReservedBottom);
    const controlsTopY = isPortrait ? height - reservedBottom : 0;
    const lowerAnchorY = isPortrait
      ? Phaser.Math.Clamp(
          controlsTopY + reservedBottom * orientationLayout.anchorBandRatioY,
          MOBILE_CONTROLS_LAYOUT.minAnchorY,
          height - safeAreaBottom - orientationLayout.maxAnchorBottomPadding
        )
      : Phaser.Math.Clamp(
          height * orientationLayout.anchorRatioY,
          MOBILE_CONTROLS_LAYOUT.minAnchorY,
          height - safeAreaBottom - orientationLayout.maxAnchorBottomPadding
        );
    const rightAnchorX = Math.min(width - orientationLayout.horizontalEdgeInset, width * orientationLayout.rightAnchorRatio);

    this.joystickBase.setPosition(leftAnchorX, lowerAnchorY);
    this.joystickZone.setPosition(leftAnchorX, lowerAnchorY);
    this.resetJoystick();

    this.attackControl.setPosition(rightAnchorX, lowerAnchorY - orientationLayout.attackYOffset);
    this.jumpControl.setPosition(rightAnchorX - orientationLayout.jumpOffsetX, lowerAnchorY - orientationLayout.jumpOffsetY);
    this.interactControl.setPosition(
      rightAnchorX - orientationLayout.interactOffsetX,
      lowerAnchorY - orientationLayout.interactOffsetY
    );

    this.scene.input.setPollAlways();
  }

  getUiElements() {
    return this.uiElements;
  }

  setMode(mode) {
    if (!this.enabled || this.mode === mode) {
      return;
    }

    this.mode = mode;
    const gameplayVisible = mode === 'gameplay';

    this.joystickBase.setVisible(gameplayVisible);
    this.joystickKnob.setVisible(gameplayVisible);
    this.joystickZone.setVisible(gameplayVisible);
    this.jumpControl.setVisible(gameplayVisible);
    this.attackControl.setVisible(gameplayVisible);

    this.interactControl.setVisible(mode !== 'init');
    this.releaseAll();

    if (mode === 'dialogue' || mode === 'dead') {
      const safeAreaTop = this.getSafeAreaInsetPx('top');
      this.interactControl.setPosition(this.scene.scale.width - 92, 88 + safeAreaTop + MOBILE_CONTROLS_LAYOUT.safeAreaTopPadding);
      this.interactControl.ring.setFillStyle(CONTROL_COLORS.inner, FOCUSED_RING_ALPHA);
    } else {
      this.layout();
    }
  }

  destroy() {
    this.scene.scale.off('resize', this.layout, this);
    this.scene.input.off('gameout', this.releaseAll, this);
    this.scene.input.off('pointerup', this.handlePointerUpAnywhere, this);
    this.scene.input.off('pointermove', this.handlePointerMove, this);
    this.releaseAll();
    this.uiElements.forEach((element) => element.destroy());
    this.uiElements.length = 0;
  }
}
