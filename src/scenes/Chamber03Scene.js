import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { PLAYER, WORLD } from '../data/milestone1Config.js';

const CHAMBER03_WORLD = {
  width: 2200,
  spawnX: 220,
  spawnY: 360,
  floorY: WORLD.floorY + 8,
  floorHeight: 92,
  floorColliderHeight: 72,
  headerX: 24,
  headerY: 22
};

const CHAMBER03_DEBUG = {
  zoneBandHeightRatioPortrait: 0.28,
  zoneBandHeightRatioLandscape: 0.24,
  zoneBandMinPortrait: 190,
  zoneBandMinLandscape: 128,
  zoneInset: 14,
  zoneGap: 12,
  zoneAlphaIdle: 0.24,
  zoneAlphaActive: 0.56,
  pointerFlashMs: 650
};

const TOUCH_ZONE_STYLES = {
  left: { label: 'LEFT', idleColor: 0x4a6d91, activeColor: 0x7ab6ea },
  right: { label: 'RIGHT', idleColor: 0x4f7d46, activeColor: 0x90da7f },
  jump: { label: 'JUMP', idleColor: 0x8a6130, activeColor: 0xe0b06b },
  attack: { label: 'ATTACK', idleColor: 0x7f4054, activeColor: 0xdf7e9d }
};

export class Chamber03Scene extends Phaser.Scene {
  constructor() {
    super('Chamber03Scene');
  }

  init(data) {
    this.transitionContext = data ?? {};
    this.tickCount = 0;
    this.lastPointerMessage = 'none';
    this.pointerFlashUntil = 0;
    this.localTouchInput = {
      left: false,
      right: false,
      jumpHeld: false,
      jumpQueued: false,
      attackHeld: false,
      attackQueued: false
    };
    this.touchPointers = new Map();
    this.touchZoneEntries = [];
  }

  create() {
    this.sound?.stopAll();
    this.game?.sound?.stopAll();

    this.physics.world.gravity.y = WORLD.gravityY;
    this.cameras.main.setBounds(0, 0, CHAMBER03_WORLD.width, WORLD.height);
    this.physics.world.setBounds(0, 0, CHAMBER03_WORLD.width, WORLD.height);
    this.cameras.main.setBackgroundColor('#433127');

    this.add.rectangle(CHAMBER03_WORLD.width / 2, WORLD.height / 2, CHAMBER03_WORLD.width, WORLD.height, 0x433127, 1).setDepth(-20);
    this.add.rectangle(
      CHAMBER03_WORLD.width / 2,
      CHAMBER03_WORLD.floorY,
      CHAMBER03_WORLD.width,
      CHAMBER03_WORLD.floorHeight,
      0xb59674,
      1
    ).setDepth(-10);

    this.add.text(CHAMBER03_WORLD.headerX, CHAMBER03_WORLD.headerY, 'CHAMBER 03 // EMERGENCY DEBUG PATH', {
      fontFamily: 'monospace',
      fontSize: '26px',
      color: '#f6ead8',
      stroke: '#120c0b',
      strokeThickness: 6
    }).setScrollFactor(0).setDepth(40);

    this.add.text(CHAMBER03_WORLD.headerX, CHAMBER03_WORLD.headerY + 34, 'Direct boot. Scene-local touch controls. Shared mobile controls bypassed.', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#d9c7ae',
      stroke: '#120c0b',
      strokeThickness: 3
    }).setScrollFactor(0).setDepth(40);

    this.platforms = this.physics.add.staticGroup();
    this.createInvisiblePlatform(
      CHAMBER03_WORLD.width / 2,
      WORLD.floorY + 28,
      CHAMBER03_WORLD.width,
      CHAMBER03_WORLD.floorColliderHeight
    );

    this.player = new Player(this, CHAMBER03_WORLD.spawnX, CHAMBER03_WORLD.spawnY, PLAYER);
    this.physics.add.collider(this.player.sprite, this.platforms);
    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08, -140, 0);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyAttack = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    this.debugHeartbeatText = this.add.text(this.scale.width - 16, 16, '', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#f6ead8',
      align: 'right',
      backgroundColor: '#120c0bcc',
      padding: { x: 8, y: 6 }
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(72);

    this.debugInputText = this.add.text(16, 88, '', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#d6f1c2',
      align: 'left',
      backgroundColor: '#120c0bcc',
      padding: { x: 8, y: 6 }
    }).setScrollFactor(0).setDepth(72);

    this.pointerProofText = this.add.text(this.scale.width - 16, 108, 'POINTER: waiting', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffe3df',
      align: 'right',
      backgroundColor: '#3b0f12cc',
      padding: { x: 8, y: 5 }
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(72);

    this.pointerFlash = this.add.rectangle(this.scale.width - 16, 142, 18, 18, 0x6f8c59, 0.95)
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(73)
      .setVisible(false);

    this.createEmergencyTouchZones();

    this.pointerDownHandler = (pointer) => {
      this.lastPointerMessage = `${Math.round(pointer.x)},${Math.round(pointer.y)}`;
      this.pointerFlashUntil = this.time.now + CHAMBER03_DEBUG.pointerFlashMs;
      this.pointerProofText.setText(`POINTER: ${this.lastPointerMessage}`);
      this.pointerFlash.setVisible(true).setFillStyle(0x6f8c59, 0.95);
      this.trackTouchPointer(pointer, true);
    };
    this.pointerMoveHandler = (pointer) => {
      this.trackTouchPointer(pointer, false);
    };
    this.pointerUpHandler = (pointer) => {
      this.releaseTouchPointer(pointer.id);
    };

    this.input.on('pointerdown', this.pointerDownHandler);
    this.input.on('pointermove', this.pointerMoveHandler);
    this.input.on('pointerup', this.pointerUpHandler);
    this.input.on('gameout', () => this.releaseAllTouchPointers());

    this.scale.on('resize', this.applyResponsiveLayout, this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.applyResponsiveLayout, this);
      this.input.off('pointerdown', this.pointerDownHandler);
      this.input.off('pointermove', this.pointerMoveHandler);
      this.input.off('pointerup', this.pointerUpHandler);
      this.releaseAllTouchPointers();
    });

    this.applyResponsiveLayout();
    this.updateTelemetry(0, this.buildAppliedInput());
  }

  update(time) {
    if (!this.player) {
      return;
    }

    this.tickCount += 1;

    const appliedInput = this.buildAppliedInput();
    this.player.update(time, appliedInput);
    this.updateTelemetry(time, appliedInput);
  }

  buildAppliedInput() {
    const localTouchInput = this.getLocalTouchSnapshot();
    return {
      left: this.cursors.left.isDown || localTouchInput.left,
      right: this.cursors.right.isDown || localTouchInput.right,
      jumpPressed:
        Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
        localTouchInput.jumpPressed,
      attackPressed: Phaser.Input.Keyboard.JustDown(this.keyAttack) || localTouchInput.attackPressed,
      debugLocalTouchInput: localTouchInput
    };
  }

  getLocalTouchSnapshot() {
    const snapshot = {
      left: Boolean(this.localTouchInput.left),
      right: Boolean(this.localTouchInput.right),
      jumpHeld: Boolean(this.localTouchInput.jumpHeld),
      attackHeld: Boolean(this.localTouchInput.attackHeld),
      jumpPressed: Boolean(this.localTouchInput.jumpQueued),
      attackPressed: Boolean(this.localTouchInput.attackQueued)
    };

    this.localTouchInput.jumpQueued = false;
    this.localTouchInput.attackQueued = false;
    return snapshot;
  }

  createEmergencyTouchZones() {
    // Temporary Chamber03 emergency debug controls. Remove or replace after shared mobile controls are repaired.
    this.touchZonesLayer = this.add.layer().setDepth(71).setScrollFactor(0);

    ['left', 'right', 'jump', 'attack'].forEach((action) => {
      const style = TOUCH_ZONE_STYLES[action];
      const rect = this.add.rectangle(0, 0, 10, 10, style.idleColor, CHAMBER03_DEBUG.zoneAlphaIdle)
        .setStrokeStyle(2, style.activeColor, 0.9)
        .setScrollFactor(0);
      const text = this.add.text(0, 0, `${style.label}\nIDLE`, {
        fontFamily: 'monospace',
        fontSize: '16px',
        align: 'center',
        color: '#f6ead8',
        stroke: '#120c0b',
        strokeThickness: 4
      }).setOrigin(0.5).setScrollFactor(0);

      const entry = { action, rect, text, bounds: new Phaser.Geom.Rectangle() };
      this.touchZoneEntries.push(entry);
      this.touchZonesLayer.add([rect, text]);
      this.refreshTouchZoneVisual(entry, false);
    });
  }

  layoutEmergencyTouchZones() {
    if (!this.touchZoneEntries.length) {
      return;
    }

    const width = this.scale.width;
    const height = this.scale.height;
    const isPortrait = height >= width;
    const inset = CHAMBER03_DEBUG.zoneInset;
    const gap = CHAMBER03_DEBUG.zoneGap;
    const bandHeight = isPortrait
      ? Math.max(CHAMBER03_DEBUG.zoneBandMinPortrait, Math.round(height * CHAMBER03_DEBUG.zoneBandHeightRatioPortrait))
      : Math.max(CHAMBER03_DEBUG.zoneBandMinLandscape, Math.round(height * CHAMBER03_DEBUG.zoneBandHeightRatioLandscape));
    const bandTop = height - bandHeight - inset;
    const bandWidth = width - inset * 2;
    const columnWidth = Math.max(72, (bandWidth - gap * 3) / 4);
    const attackHeight = Math.max(48, Math.round(bandHeight * 0.32));
    const mainHeight = bandHeight - attackHeight - gap;

    const layout = {
      left: new Phaser.Geom.Rectangle(inset, bandTop, columnWidth, bandHeight),
      right: new Phaser.Geom.Rectangle(inset + columnWidth + gap, bandTop, columnWidth, bandHeight),
      jump: new Phaser.Geom.Rectangle(inset + (columnWidth + gap) * 2, bandTop, columnWidth * 2 + gap, mainHeight),
      attack: new Phaser.Geom.Rectangle(inset + (columnWidth + gap) * 2, bandTop + mainHeight + gap, columnWidth * 2 + gap, attackHeight)
    };

    this.touchZoneEntries.forEach((entry) => {
      const bounds = layout[entry.action];
      entry.bounds.copyFrom(bounds);
      entry.rect.setPosition(bounds.centerX, bounds.centerY).setSize(bounds.width, bounds.height);
      entry.text.setPosition(bounds.centerX, bounds.centerY);
    });
  }

  trackTouchPointer(pointer, allowQueue) {
    const action = this.getTouchZoneActionAt(pointer.x, pointer.y);
    if (!action) {
      this.releaseTouchPointer(pointer.id);
      return;
    }

    const previousAction = this.touchPointers.get(pointer.id);
    if (previousAction === action) {
      return;
    }

    if (previousAction) {
      this.touchPointers.delete(pointer.id);
      this.setTouchActionActive(previousAction, false, pointer.id, false);
    }

    this.touchPointers.set(pointer.id, action);
    this.setTouchActionActive(action, true, pointer.id, allowQueue);
  }

  releaseTouchPointer(pointerId) {
    const action = this.touchPointers.get(pointerId);
    if (!action) {
      return;
    }

    this.touchPointers.delete(pointerId);
    this.setTouchActionActive(action, false, pointerId, false);
  }

  releaseAllTouchPointers() {
    Array.from(this.touchPointers.keys()).forEach((pointerId) => this.releaseTouchPointer(pointerId));
  }

  getTouchZoneActionAt(x, y) {
    const match = this.touchZoneEntries.find((entry) => Phaser.Geom.Rectangle.Contains(entry.bounds, x, y));
    return match?.action ?? null;
  }

  setTouchActionActive(action, active, pointerId, allowQueue) {
    const stillActive = active || Array.from(this.touchPointers.values()).includes(action);

    if (action === 'left' || action === 'right') {
      this.localTouchInput[action] = stillActive;
      if (active && action === 'left') {
        this.localTouchInput.right = false;
      }
      if (active && action === 'right') {
        this.localTouchInput.left = false;
      }
    }

    if (action === 'jump') {
      this.localTouchInput.jumpHeld = stillActive;
      if (active && allowQueue) {
        this.localTouchInput.jumpQueued = true;
      }
    }

    if (action === 'attack') {
      this.localTouchInput.attackHeld = stillActive;
      if (active && allowQueue) {
        this.localTouchInput.attackQueued = true;
      }
    }

    const entry = this.touchZoneEntries.find((item) => item.action === action);
    if (entry) {
      this.refreshTouchZoneVisual(entry, stillActive, pointerId);
    }
  }

  refreshTouchZoneVisual(entry, active, pointerId = null) {
    const style = TOUCH_ZONE_STYLES[entry.action];
    entry.rect
      .setFillStyle(active ? style.activeColor : style.idleColor, active ? CHAMBER03_DEBUG.zoneAlphaActive : CHAMBER03_DEBUG.zoneAlphaIdle)
      .setStrokeStyle(2, active ? style.activeColor : style.idleColor, 0.95);
    entry.text.setText(`${style.label}\n${active ? 'PRESSED' : 'IDLE'}`);
    entry.text.setScale(active ? 1.04 : 1);

    if (pointerId !== null) {
      console.log(`[Chamber03Scene] local touch ${active ? 'down' : 'up'}`, { action: entry.action, pointerId });
    }
  }

  updateTelemetry(time, appliedInput) {
    const body = this.player?.body;
    const local = appliedInput.debugLocalTouchInput;
    const pointerActive = this.time.now <= this.pointerFlashUntil;

    this.debugHeartbeatText.setText([
      `tick ${this.tickCount}`,
      `time ${Math.round(time)}`,
      'update RUNNING',
      'controls LOCAL DEBUG',
      `touch pointers ${this.touchPointers.size}`
    ].join('\n'));

    this.debugInputText.setText([
      `local L:${Number(local.left)} R:${Number(local.right)} JH:${Number(local.jumpHeld)} AH:${Number(local.attackHeld)}`,
      `local queued J:${Number(local.jumpPressed)} A:${Number(local.attackPressed)}`,
      `applied L:${Number(appliedInput.left)} R:${Number(appliedInput.right)} J:${Number(appliedInput.jumpPressed)} A:${Number(appliedInput.attackPressed)}`,
      `player x:${Math.round(this.player.sprite.x)} y:${Math.round(this.player.sprite.y)}`,
      `vel x:${Math.round(body?.velocity?.x ?? 0)} y:${Math.round(body?.velocity?.y ?? 0)}`,
      `grounded ${Number(body?.blocked?.down === true)}`,
      `pointer ${this.lastPointerMessage}`
    ].join('\n'));

    this.pointerFlash.setVisible(pointerActive);
    if (!pointerActive) {
      this.pointerFlash.setFillStyle(0x5b2b2f, 0.55);
    }
  }

  createInvisiblePlatform(x, y, width, height) {
    const platform = this.add.rectangle(x, y, width, height, 0x000000, 0).setOrigin(0.5);
    platform.setVisible(false);
    this.physics.add.existing(platform, true);
    this.platforms.add(platform);
    return platform;
  }

  applyResponsiveLayout() {
    const camera = this.cameras.main;
    const width = this.scale.width;
    const height = this.scale.height;

    camera.setViewport(0, 0, width, height);
    camera.setZoom(height >= width ? 1.02 : 1);
    camera.setFollowOffset(-140, height >= width ? -20 : 0);

    this.debugHeartbeatText?.setPosition(width - 16, 16);
    this.debugInputText?.setPosition(16, 88);
    this.pointerProofText?.setPosition(width - 16, 108);
    this.pointerFlash?.setPosition(width - 16, 142);
    this.layoutEmergencyTouchZones();
  }
}
