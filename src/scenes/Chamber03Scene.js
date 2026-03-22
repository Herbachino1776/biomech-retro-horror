import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { HudOverlay } from '../ui/HudOverlay.js';
import { MobileControls } from '../ui/MobileControls.js';
import { PLAYER, WORLD } from '../data/milestone1Config.js';
import { PORTRAIT_LAYOUT } from '../data/layoutConfig.js';
import { restartRunFromDeath } from '../systems/RunReset.js';

const CHAMBER03_WORLD = {
  width: 2200,
  spawnX: 220,
  spawnY: 360,
  floorY: WORLD.floorY + 8,
  floorHeight: 92,
  floorColliderHeight: 72,
  headerX: 32,
  headerY: 28
};

const CHAMBER03_DEBUG = {
  useFallbackPlayer: false,
  fallbackMoveSpeed: 200,
  fallbackJumpVelocity: -450,
  pointerFlashMs: 650,
  portraitWorldBandHeight: 308
};

class Chamber03FallbackPlayer {
  constructor(scene, x, y) {
    this.scene = scene;
    this.health = PLAYER.maxHealth;
    this.isDead = false;
    this.facing = 1;
    this.attackPhase = 'idle';
    this.attackActive = false;
    this.usingFallback = true;

    this.sprite = scene.add.rectangle(x, y, 42, 64, 0xd8cfbb).setOrigin(0.5, 1).setDepth(6);
    scene.physics.add.existing(this.sprite);

    this.body = this.sprite.body;
    this.body.setCollideWorldBounds(true);
    this.body.setGravityY(0);
    this.body.setSize(42, 64);
    this.body.setOffset(-21, -64);
  }

  update(_time, input) {
    let direction = 0;
    if (input.left) {
      direction = -1;
    } else if (input.right) {
      direction = 1;
    }

    if (direction !== 0) {
      this.facing = direction;
    }

    this.body.setVelocityX(direction * CHAMBER03_DEBUG.fallbackMoveSpeed);
    if (input.jumpPressed && this.body.blocked.down) {
      this.body.setVelocityY(CHAMBER03_DEBUG.fallbackJumpVelocity);
    }

    this.sprite.setFillStyle(direction === 0 ? 0xd8cfbb : 0xb4c78f);
    this.sprite.setStrokeStyle(2, this.body.blocked.down ? 0x120c0b : 0x6f8c59, 0.9);
  }
}

export class Chamber03Scene extends Phaser.Scene {
  constructor() {
    super('Chamber03Scene');
  }

  init(data) {
    this.transitionContext = data ?? {};
    this.tickCount = 0;
    this.didLogFirstHeartbeat = false;
    this.lastPointerMessage = 'none';
    this.pointerFlashUntil = 0;
    this.lastTelemetryLogKey = null;
    this.lastMobilePressLogKey = null;
    this.lastControlMode = 'init';
    this.lastInputSnapshot = null;
    this.playerUsesFallback = CHAMBER03_DEBUG.useFallbackPlayer;
  }

  create() {
    console.log('[Chamber03Scene] create start', this.transitionContext);

    try {
      this.sound?.stopAll();
      this.game?.sound?.stopAll();
      console.log('[Chamber03Scene] lingering audio stopped for debug isolation pass');

      this.physics.world.gravity.y = WORLD.gravityY;
      this.cameras.main.setBounds(0, 0, CHAMBER03_WORLD.width, WORLD.height);
      this.physics.world.setBounds(0, 0, CHAMBER03_WORLD.width, WORLD.height);
      this.cameras.main.setBackgroundColor('#4d3328');

      this.add
        .rectangle(CHAMBER03_WORLD.width / 2, WORLD.height / 2, CHAMBER03_WORLD.width, WORLD.height, 0x4d3328, 1)
        .setDepth(-20);
      this.add
        .rectangle(
          CHAMBER03_WORLD.width / 2,
          CHAMBER03_WORLD.floorY,
          CHAMBER03_WORLD.width,
          CHAMBER03_WORLD.floorHeight,
          0xb29778,
          1
        )
        .setDepth(-11);

      this.add
        .text(CHAMBER03_WORLD.headerX, CHAMBER03_WORLD.headerY, 'CHAMBER 03 BOOT OK', {
          fontFamily: 'monospace',
          fontSize: '28px',
          color: '#f4e6d2',
          stroke: '#120c0b',
          strokeThickness: 6
        })
        .setScrollFactor(0)
        .setDepth(40);

      this.platforms = this.physics.add.staticGroup();
      this.createInvisiblePlatform(
        CHAMBER03_WORLD.width / 2,
        WORLD.floorY + 28,
        CHAMBER03_WORLD.width,
        CHAMBER03_WORLD.floorColliderHeight
      );

      this.player = this.createDebugPlayer();
      this.applyGameplayReadabilitySupport(this.player.sprite, { fill: 0xd8cfbb, alpha: 0.18, scale: 1.1 });
      this.physics.add.collider(this.player.sprite, this.platforms);
      this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08, -140, 0);

      this.hud = new HudOverlay(this);
      this.mobileControls = new MobileControls(this);
      this.mobileControls.setMode('gameplay');

      this.restartText = this.add
        .text(this.scale.width / 2, 90, '', {
          fontFamily: 'monospace',
          fontSize: '22px',
          color: '#d2c2ac',
          align: 'center'
        })
        .setScrollFactor(0)
        .setDepth(35)
        .setOrigin(0.5)
        .setVisible(false);

      this.debugHeartbeatText = this.add
        .text(this.scale.width - 18, 18, '', {
          fontFamily: 'monospace',
          fontSize: '14px',
          color: '#f6ead8',
          align: 'right',
          backgroundColor: '#120c0bcc',
          padding: { x: 8, y: 6 }
        })
        .setOrigin(1, 0)
        .setScrollFactor(0)
        .setDepth(70);

      this.debugInputText = this.add
        .text(18, 88, '', {
          fontFamily: 'monospace',
          fontSize: '13px',
          color: '#d2f0c5',
          align: 'left',
          backgroundColor: '#120c0bcc',
          padding: { x: 8, y: 6 }
        })
        .setScrollFactor(0)
        .setDepth(70);

      this.pointerProofText = this.add
        .text(this.scale.width - 18, 132, 'POINTER: waiting', {
          fontFamily: 'monospace',
          fontSize: '13px',
          color: '#ffe3df',
          align: 'right',
          backgroundColor: '#3b0f12cc',
          padding: { x: 8, y: 5 }
        })
        .setOrigin(1, 0)
        .setScrollFactor(0)
        .setDepth(71);

      this.pointerFlash = this.add
        .rectangle(this.scale.width - 34, 166, 18, 18, 0x6f8c59, 0.95)
        .setOrigin(1, 0)
        .setScrollFactor(0)
        .setDepth(72)
        .setVisible(false);

      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyAttack = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
      this.keyRestart = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

      this.pointerDownHandler = (pointer) => {
        this.lastPointerMessage = `${Math.round(pointer.x)},${Math.round(pointer.y)}`;
        this.pointerFlashUntil = this.time.now + CHAMBER03_DEBUG.pointerFlashMs;
        this.pointerProofText?.setText(`POINTER: ${this.lastPointerMessage}`);
        this.pointerFlash?.setVisible(true).setFillStyle(0x6f8c59, 0.95);
        console.log('[Chamber03Scene] pointerdown received', {
          x: Math.round(pointer.x),
          y: Math.round(pointer.y),
          id: pointer.id
        });
      };
      this.input.on('pointerdown', this.pointerDownHandler);

      this.scale.on('resize', this.applyResponsiveLayout, this);
      this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.scale.off('resize', this.applyResponsiveLayout, this);
        this.input.off('pointerdown', this.pointerDownHandler);
        this.cleanupSceneUi();
      });

      this.applyResponsiveLayout();
      this.hud.update(this.player.health, PLAYER.maxHealth);
      this.updateDebugTelemetry(0, this.mobileControls.getInputState());
      console.log('[Chamber03Scene] create complete', { fallbackPlayer: this.playerUsesFallback });
    } catch (error) {
      console.error('[Chamber03Scene] create failed', error);
      this.renderCreateErrorFallback(error);
    }
  }

  createDebugPlayer() {
    if (this.playerUsesFallback) {
      console.log('[Chamber03Scene] player fallback enabled by debug flag');
      return new Chamber03FallbackPlayer(this, CHAMBER03_WORLD.spawnX, CHAMBER03_WORLD.spawnY);
    }

    try {
      return new Player(this, CHAMBER03_WORLD.spawnX, CHAMBER03_WORLD.spawnY, PLAYER);
    } catch (error) {
      console.warn('[Chamber03Scene] Player path failed, enabling fallback', error);
      this.playerUsesFallback = true;
      console.log('[Chamber03Scene] player fallback enabled after Player failure');
      return new Chamber03FallbackPlayer(this, CHAMBER03_WORLD.spawnX, CHAMBER03_WORLD.spawnY);
    }
  }

  update(time) {
    if (!this.player || !this.mobileControls) {
      return;
    }

    this.tickCount += 1;
    if (!this.didLogFirstHeartbeat) {
      this.didLogFirstHeartbeat = true;
      console.log('[Chamber03Scene] update heartbeat first tick', { tick: this.tickCount, time: Math.round(time) });
    }

    const mobileInput = this.mobileControls.getInputState();
    const inputSnapshot = {
      left: this.cursors.left.isDown || mobileInput.left,
      right: this.cursors.right.isDown || mobileInput.right,
      jumpPressed:
        Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
        mobileInput.jumpPressed,
      attackPressed: Phaser.Input.Keyboard.JustDown(this.keyAttack) || mobileInput.attackPressed
    };

    if (this.player.isDead) {
      this.mobileControls.setMode('dead');
      this.restartText.setVisible(true).setText('VESSEL FAILURE\nPress [R] to re-seed chamber');
      this.updateDebugTelemetry(time, mobileInput);
      if (Phaser.Input.Keyboard.JustDown(this.keyRestart) || mobileInput.interactPressed) {
        this.cleanupSceneUi();
        restartRunFromDeath(this);
      }
      return;
    }

    this.mobileControls.setMode('gameplay');
    this.restartText.setVisible(false);
    this.player.update(time, inputSnapshot);
    this.hud.update(this.player.health, PLAYER.maxHealth);
    this.updateDebugTelemetry(time, mobileInput, inputSnapshot);
  }

  updateDebugTelemetry(time, mobileInput, inputSnapshot = this.lastInputSnapshot) {
    this.lastInputSnapshot = inputSnapshot;

    const keyboardState = {
      left: Boolean(this.cursors?.left?.isDown),
      right: Boolean(this.cursors?.right?.isDown),
      up: Boolean(this.cursors?.up?.isDown || this.cursors?.space?.isDown),
      attack: Boolean(this.keyAttack?.isDown)
    };
    const mobileState = this.mobileControls?.state ?? {
      left: false,
      right: false,
      jump: false,
      attack: false,
      interact: false
    };
    const body = this.player?.body;
    const pointerActive = this.time.now <= this.pointerFlashUntil;
    const heartbeatLines = [
      `tick ${this.tickCount}`,
      `time ${Math.round(time)}`,
      'update RUNNING',
      `player ${this.playerUsesFallback ? 'FALLBACK' : 'PLAYER'}`,
      `mode ${this.mobileControls?.mode ?? 'none'}`
    ];
    const inputLines = [
      `kbd L:${Number(keyboardState.left)} R:${Number(keyboardState.right)} U:${Number(keyboardState.up)} X:${Number(keyboardState.attack)}`,
      `mob L:${Number(mobileState.left)} R:${Number(mobileState.right)} J:${Number(mobileState.jump)} A:${Number(mobileState.attack)} I:${Number(mobileState.interact)}`,
      `mob mode: ${this.mobileControls?.mode ?? 'none'}`,
      `body.enable: ${body?.enable === true}`,
      `blocked.down: ${body?.blocked?.down === true}`,
      `ptr: ${this.lastPointerMessage}`,
      `applied L:${Number(Boolean(inputSnapshot?.left))} R:${Number(Boolean(inputSnapshot?.right))} J:${Number(Boolean(inputSnapshot?.jumpPressed))} A:${Number(Boolean(inputSnapshot?.attackPressed))}`
    ];

    this.debugHeartbeatText?.setText(heartbeatLines.join('\n'));
    this.debugInputText?.setText(inputLines.join('\n'));
    this.pointerFlash?.setVisible(pointerActive);
    if (!pointerActive) {
      this.pointerFlash?.setFillStyle(0x5b2b2f, 0.55);
    }

    const telemetryLogKey = JSON.stringify({
      mode: this.mobileControls?.mode ?? 'none',
      keyboardState,
      mobileState,
      bodyEnabled: body?.enable === true,
      blockedDown: body?.blocked?.down === true,
      pointer: this.lastPointerMessage
    });
    if (telemetryLogKey !== this.lastTelemetryLogKey) {
      this.lastTelemetryLogKey = telemetryLogKey;
      console.log('[Chamber03Scene] telemetry changed', JSON.parse(telemetryLogKey));
    }

    const mobilePressLogKey = JSON.stringify({
      left: mobileState.left,
      right: mobileState.right,
      jump: mobileState.jump,
      attack: mobileState.attack,
      interact: mobileState.interact
    });
    if (mobilePressLogKey !== this.lastMobilePressLogKey) {
      this.lastMobilePressLogKey = mobilePressLogKey;
      console.log('[Chamber03Scene] mobile button state changed', JSON.parse(mobilePressLogKey));
    }

    if (this.mobileControls?.mode !== this.lastControlMode) {
      this.lastControlMode = this.mobileControls?.mode ?? 'none';
      console.log('[Chamber03Scene] mobile controls mode changed', this.lastControlMode);
    }
  }

  createInvisiblePlatform(x, y, width, height) {
    const platform = this.add.rectangle(x, y, width, height, 0x000000, 0).setOrigin(0.5);
    platform.setVisible(false);
    this.physics.add.existing(platform, true);
    this.platforms.add(platform);
    return platform;
  }

  applyGameplayReadabilitySupport(target, { fill = 0xd2c2ac, alpha = 0.16, scale = 1.08 } = {}) {
    if (!target) {
      return null;
    }

    const shadow = this.add
      .ellipse(target.x, WORLD.floorY + 6, 104 * scale, 22 * scale, 0x050404, alpha * 1.05)
      .setDepth(target.depth - 0.6);
    const halo = this.add
      .ellipse(target.x, target.y - 6, 84 * scale, 118 * scale, fill, alpha)
      .setDepth(target.depth - 0.4);

    this.events.on(Phaser.Scenes.Events.UPDATE, () => {
      if (!target.active) {
        halo.setVisible(false);
        shadow.setVisible(false);
        return;
      }

      halo.setVisible(target.visible).setPosition(target.x, target.y - 8).setAlpha(target.visible ? alpha : 0);
      shadow
        .setVisible(target.visible)
        .setPosition(target.x, WORLD.floorY + 6)
        .setAlpha(target.visible ? alpha * 1.05 : 0);
    });

    return { halo, shadow };
  }

  renderCreateErrorFallback(error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    this.cameras.main.setBackgroundColor('#3b0f12');
    this.add.rectangle(CHAMBER03_WORLD.width / 2, WORLD.height / 2, CHAMBER03_WORLD.width, WORLD.height, 0x3b0f12, 1).setDepth(-20);
    this.add.rectangle(CHAMBER03_WORLD.width / 2, CHAMBER03_WORLD.floorY, CHAMBER03_WORLD.width, CHAMBER03_WORLD.floorHeight, 0x6f3b31, 1).setDepth(-11);
    this.add
      .text(CHAMBER03_WORLD.headerX, CHAMBER03_WORLD.headerY, 'CHAMBER 03 CREATE ERROR', {
        fontFamily: 'monospace',
        fontSize: '28px',
        color: '#ffe3df',
        stroke: '#160708',
        strokeThickness: 6,
        wordWrap: { width: this.scale.width - 64 }
      })
      .setScrollFactor(0)
      .setDepth(40);
    this.add
      .text(CHAMBER03_WORLD.headerX, CHAMBER03_WORLD.headerY + 50, errorMessage, {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#ffd4cc',
        wordWrap: { width: this.scale.width - 64 }
      })
      .setScrollFactor(0)
      .setDepth(40);
  }

  cleanupSceneUi() {
    this.restartText?.setVisible(false);
    this.mobileControls?.setMode('init');
    this.hud?.setVisible(false);
  }

  applyResponsiveLayout() {
    const camera = this.cameras.main;
    const width = this.scale.width;
    const height = this.scale.height;
    const isPortraitMobile = this.mobileControls.enabled && height >= width;

    this.restartText?.setPosition(width / 2, 90);
    this.debugHeartbeatText?.setPosition(width - 18, 18);
    this.debugInputText?.setPosition(18, 88);
    this.pointerProofText?.setPosition(width - 18, 132);
    this.pointerFlash?.setPosition(width - 18, 166);

    if (isPortraitMobile) {
      const safeAreaBottom = this.mobileControls.getSafeAreaInsetPx('bottom');
      const worldBandHeight = Math.max(PORTRAIT_LAYOUT.worldBandMin, CHAMBER03_DEBUG.portraitWorldBandHeight);
      camera.setViewport(0, 0, width, Math.min(height, worldBandHeight));
      camera.setZoom(PORTRAIT_LAYOUT.portraitZoom);
      camera.setFollowOffset(-120, PORTRAIT_LAYOUT.portraitFollowOffsetY);
      this.mobileControls.setReservedBottomPx(Math.max(0, height - worldBandHeight - safeAreaBottom));
      this.restartText?.setPosition(width / 2, Math.max(PORTRAIT_LAYOUT.restartTextMinY, worldBandHeight * PORTRAIT_LAYOUT.restartTextRatioY));
      return;
    }

    camera.setViewport(0, 0, width, height);
    camera.setZoom(PORTRAIT_LAYOUT.desktopZoom);
    camera.setFollowOffset(-140, PORTRAIT_LAYOUT.desktopFollowOffsetY);
    this.mobileControls.setReservedBottomPx(0);
  }
}
