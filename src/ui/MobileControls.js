import Phaser from 'phaser';
import { MOBILE_CONTROLS_LAYOUT } from '../data/layoutConfig.js';

const CONTROL_COLORS = {
  outer: 0x1f1714,
  shell: 0x2c211c,
  inner: 0x352720,
  stroke: 0x8f7d72,
  active: 0x6f8c59,
  glyph: '#d2c2ac',
  glyphMuted: '#8f7d72',
  shadow: 0x090706
};

const GAMEPLAY_RING_ALPHA = 0.54;
const FOCUSED_RING_ALPHA = 0.82;

export class MobileControls {
  constructor(scene) {
    this.scene = scene;
    this.enabled = scene.sys.game.device.input.touch;
    this.mode = 'init';
    this.isPortrait = false;

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
    this.joystickShadow = this.scene.add
      .ellipse(0, 0, 0, 0, CONTROL_COLORS.shadow, 0.28)
      .setDepth(59)
      .setScrollFactor(0);
    this.joystickBase = this.scene.add.circle(0, 0, 1, CONTROL_COLORS.outer, 0.68).setDepth(60).setScrollFactor(0);
    this.joystickShell = this.scene.add.circle(0, 0, 1, CONTROL_COLORS.shell, 0.74).setDepth(60.2).setScrollFactor(0);
    this.joystickCore = this.scene.add.circle(0, 0, 1, CONTROL_COLORS.inner, 0.52).setDepth(60.3).setScrollFactor(0);
    this.joystickKnob = this.scene.add.circle(0, 0, 1, CONTROL_COLORS.inner, GAMEPLAY_RING_ALPHA).setDepth(61).setScrollFactor(0);
    this.joystickMarkLeft = this.scene.add.text(0, 0, '◁', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: CONTROL_COLORS.glyphMuted,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(60.5).setScrollFactor(0);
    this.joystickMarkRight = this.scene.add.text(0, 0, '▷', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: CONTROL_COLORS.glyphMuted,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(60.5).setScrollFactor(0);
    this.joystickZone = this.scene.add.zone(0, 0, 1, 1)
      .setOrigin(0.5)
      .setDepth(62)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: false })
      .on('pointerdown', (pointer) => this.startJoystick(pointer));

    this.uiElements.push(
      this.joystickShadow,
      this.joystickBase,
      this.joystickShell,
      this.joystickCore,
      this.joystickKnob,
      this.joystickMarkLeft,
      this.joystickMarkRight,
      this.joystickZone
    );

    this.jumpControl = this.createButton('JUMP', 'jump');
    this.attackControl = this.createButton('ATTACK', 'attack');
    this.interactControl = this.createButton('RITE', 'interact', 0.6);

    this.layout();
    this.setMode('gameplay');
  }

  createButton(label, action, alpha = GAMEPLAY_RING_ALPHA) {
    const shadow = this.scene.add.ellipse(0, 0, 1, 1, CONTROL_COLORS.shadow, 0.28).setDepth(59).setScrollFactor(0);
    const outer = this.scene.add.circle(0, 0, 1, CONTROL_COLORS.outer, 0.72).setDepth(60).setScrollFactor(0);
    const shell = this.scene.add.circle(0, 0, 1, CONTROL_COLORS.shell, 0.76).setDepth(60.15).setScrollFactor(0);
    const ring = this.scene.add.circle(0, 0, 1, CONTROL_COLORS.inner, alpha).setDepth(60.3).setScrollFactor(0);

    const text = this.scene.add.text(0, 1, label, {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: CONTROL_COLORS.glyph,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(61).setScrollFactor(0);

    const hitArea = this.scene.add.zone(0, 0, 1, 1).setOrigin(0.5).setDepth(62).setScrollFactor(0);

    const control = {
      action,
      shadow,
      outer,
      shell,
      ring,
      text,
      hitArea,
      radius: 1,
      setRadius: (radius, hitMultiplier) => {
        const hitDiameter = radius * 2 * hitMultiplier;
        control.radius = radius;
        shadow.setSize(radius * 2.12, radius * 1.08);
        outer.setRadius(radius);
        outer.setStrokeStyle(Math.max(1, Math.round(radius * 0.07)), CONTROL_COLORS.stroke, 0.54);
        shell.setRadius(radius * 0.86);
        shell.setStrokeStyle(Math.max(1, Math.round(radius * 0.05)), CONTROL_COLORS.stroke, 0.22);
        ring.setRadius(radius * 0.68);
        ring.setStrokeStyle(Math.max(1, Math.round(radius * 0.06)), CONTROL_COLORS.stroke, 0.9);
        text.setFontSize(radius >= 34 ? '13px' : '11px');
        hitArea.setSize(hitDiameter, hitDiameter);
      },
      setPosition: (x, y) => {
        shadow.setPosition(x, y + Math.max(4, control.radius * 0.14));
        outer.setPosition(x, y);
        shell.setPosition(x, y);
        ring.setPosition(x, y);
        text.setPosition(x, y + 1);
        hitArea.setPosition(x, y);
      },
      setVisible: (visible) => {
        shadow.setVisible(visible);
        outer.setVisible(visible);
        shell.setVisible(visible);
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
    this.uiElements.push(shadow, outer, shell, ring, text, hitArea);
    return control;
  }

  getOrientationValue(value) {
    if (typeof value === 'number') {
      return value;
    }

    return this.isPortrait ? value.portrait : value.landscape;
  }

  refreshControlGeometry() {
    const joystickBaseRadius = this.getOrientationValue(MOBILE_CONTROLS_LAYOUT.joystick.baseRadius);
    const joystickKnobRadius = this.getOrientationValue(MOBILE_CONTROLS_LAYOUT.joystick.knobRadius);
    const joystickHitDiameter = this.getOrientationValue(MOBILE_CONTROLS_LAYOUT.joystick.hitDiameter);

    this.joystickShadow.setSize(joystickBaseRadius * 2.4, joystickBaseRadius * 1.18);
    this.joystickBase.setRadius(joystickBaseRadius).setStrokeStyle(2, CONTROL_COLORS.stroke, 0.48);
    this.joystickShell.setRadius(joystickBaseRadius * 0.86).setStrokeStyle(2, CONTROL_COLORS.stroke, 0.22);
    this.joystickCore.setRadius(joystickBaseRadius * 0.64).setStrokeStyle(1, CONTROL_COLORS.stroke, 0.16);
    this.joystickKnob.setRadius(joystickKnobRadius).setStrokeStyle(2, CONTROL_COLORS.stroke, 0.92);
    this.joystickZone.setSize(joystickHitDiameter, joystickHitDiameter);
    this.joystickMarkLeft.setFontSize(joystickBaseRadius > 50 ? '12px' : '11px');
    this.joystickMarkRight.setFontSize(joystickBaseRadius > 50 ? '12px' : '11px');

    const hitMultiplier = this.getOrientationValue(MOBILE_CONTROLS_LAYOUT.actionButtons.hitMultiplier);
    this.attackControl.setRadius(this.getOrientationValue(MOBILE_CONTROLS_LAYOUT.actionButtons.attackRadius), hitMultiplier);
    this.jumpControl.setRadius(this.getOrientationValue(MOBILE_CONTROLS_LAYOUT.actionButtons.jumpRadius), hitMultiplier);
    this.interactControl.setRadius(this.getOrientationValue(MOBILE_CONTROLS_LAYOUT.actionButtons.interactRadius), hitMultiplier);
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
    const maxDistance = this.getOrientationValue(MOBILE_CONTROLS_LAYOUT.joystick.maxTravel);
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

    this.isPortrait = height >= width;
    const safeAreaBottom = this.getSafeAreaInsetPx('bottom');
    const orientationLayout = this.isPortrait ? MOBILE_CONTROLS_LAYOUT.portrait : MOBILE_CONTROLS_LAYOUT.landscape;

    this.refreshControlGeometry();

    const leftAnchorX = Math.max(orientationLayout.horizontalEdgeInset, width * orientationLayout.leftAnchorRatio);
    const defaultReservedBottom = this.isPortrait
      ? orientationLayout.baseBandHeight + safeAreaBottom + MOBILE_CONTROLS_LAYOUT.safeAreaBottomPadding
      : 0;

    const reservedBottom = Math.max(this.reservedBottomPx, defaultReservedBottom);
    const controlsTopY = this.isPortrait ? height - reservedBottom : 0;
    const lowerAnchorY = this.isPortrait
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

    this.joystickShadow.setPosition(leftAnchorX, lowerAnchorY + Math.max(4, this.joystickBase.radius * 0.18));
    this.joystickBase.setPosition(leftAnchorX, lowerAnchorY);
    this.joystickShell.setPosition(leftAnchorX, lowerAnchorY);
    this.joystickCore.setPosition(leftAnchorX, lowerAnchorY);
    this.joystickZone.setPosition(leftAnchorX, lowerAnchorY);
    this.joystickMarkLeft.setPosition(leftAnchorX - this.joystickBase.radius * 0.42, lowerAnchorY + 1);
    this.joystickMarkRight.setPosition(leftAnchorX + this.joystickBase.radius * 0.42, lowerAnchorY + 1);
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

    this.joystickShadow.setVisible(gameplayVisible);
    this.joystickBase.setVisible(gameplayVisible);
    this.joystickShell.setVisible(gameplayVisible);
    this.joystickCore.setVisible(gameplayVisible);
    this.joystickKnob.setVisible(gameplayVisible);
    this.joystickMarkLeft.setVisible(gameplayVisible);
    this.joystickMarkRight.setVisible(gameplayVisible);
    this.joystickZone.setVisible(gameplayVisible);
    this.jumpControl.setVisible(gameplayVisible);
    this.attackControl.setVisible(gameplayVisible);

    this.interactControl.setVisible(mode !== 'init');
    this.releaseAll();

    if (mode === 'dialogue' || mode === 'dead') {
      const safeAreaTop = this.getSafeAreaInsetPx('top');
      const orientationLayout = this.scene.scale.height >= this.scene.scale.width
        ? MOBILE_CONTROLS_LAYOUT.portrait
        : MOBILE_CONTROLS_LAYOUT.landscape;
      this.interactControl.setPosition(
        this.scene.scale.width - orientationLayout.dialogueInteractInset,
        orientationLayout.dialogueInteractY + safeAreaTop + MOBILE_CONTROLS_LAYOUT.safeAreaTopPadding
      );
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
