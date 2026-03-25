import Phaser from 'phaser';
import { AoeTelegraph } from './AoeTelegraph.js';

const DEFAULT_CONFIG = {
  enabled: false,
  cooldownMs: 6400,
  windupMs: 980,
  activeMs: 140,
  recoveryMs: 760,
  minRange: 120,
  maxRange: 420,
  radius: 132,
  burstOffsetX: 0,
  burstOffsetY: 0,
  damage: 1,
  yTolerance: 140,
  burstColor: 0x3f161c,
  burstAlpha: 0.48,
  depth: 6.08,
  telegraphStyle: {}
};

export class GroundBurstAttack {
  constructor(scene, owner, config = {}) {
    this.scene = scene;
    this.owner = owner;
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      telegraphStyle: {
        ...DEFAULT_CONFIG.telegraphStyle,
        ...(config.telegraphStyle ?? {})
      }
    };

    this.enabled = Boolean(this.config.enabled);
    this.state = 'idle';
    this.windupStartedAt = -Infinity;
    this.activeUntil = -Infinity;
    this.recoverUntil = -Infinity;
    this.lastCastAt = -Infinity;
    this.hasAppliedDamage = false;
    this.anchorX = owner?.sprite?.x ?? 0;
    this.anchorY = owner?.sprite?.y ?? 0;
    this.telegraph = new AoeTelegraph(scene, { depth: this.config.depth, ...this.config.telegraphStyle });
  }

  update(time, targetSprite) {
    if (!this.enabled || !this.owner || this.owner.dead || !targetSprite?.body?.enable) {
      this.resetState();
      return;
    }

    if (this.state === 'windup') {
      this.updateTelegraph(time);
      if (time >= this.windupStartedAt + this.config.windupMs) {
        this.openDamageWindow(time, targetSprite);
      }
      return;
    }

    if (this.state === 'active') {
      this.updateBurstVisual(time);
      if (!this.hasAppliedDamage) {
        this.applyDamage(targetSprite, time);
      }
      if (time >= this.activeUntil) {
        this.state = 'recover';
        this.recoverUntil = time + this.config.recoveryMs;
        this.telegraph.clear();
      }
      return;
    }

    if (this.state === 'recover') {
      if (time >= this.recoverUntil) {
        this.resetState();
      }
      return;
    }

    if (this.canStart(time, targetSprite)) {
      this.startWindup(time, targetSprite);
    }
  }

  canStart(time, targetSprite) {
    if (time < this.lastCastAt + this.config.cooldownMs || this.owner.attackState !== 'idle' || this.owner.projectileState !== 'idle') {
      return false;
    }

    const dx = targetSprite.x - this.owner.sprite.x;
    const dy = targetSprite.y - this.owner.sprite.y;
    const absDx = Math.abs(dx);
    this.owner.direction = Math.sign(dx) || this.owner.direction;

    return absDx >= this.config.minRange
      && absDx <= this.config.maxRange
      && Math.abs(dy) <= this.config.yTolerance
      && this.owner.body?.blocked?.down;
  }

  startWindup(time, targetSprite) {
    this.state = 'windup';
    this.windupStartedAt = time;
    this.hasAppliedDamage = false;
    const targetBody = targetSprite.body;
    this.anchorX = targetSprite.x + this.owner.direction * this.config.burstOffsetX;
    this.anchorY = (targetBody?.bottom ?? targetSprite.y + 28) + this.config.burstOffsetY;
    this.owner.body.setVelocityX(0);
    this.updateTelegraph(time);
  }

  updateTelegraph(time) {
    if (this.state !== 'windup') {
      this.telegraph.clear();
      return;
    }

    const progress = Phaser.Math.Clamp((time - this.windupStartedAt) / this.config.windupMs, 0, 1);
    this.telegraph.drawCircle({
      x: this.anchorX,
      y: this.anchorY,
      radius: this.config.radius,
      progress,
      time
    });
  }

  openDamageWindow(time) {
    this.state = 'active';
    this.activeUntil = time + this.config.activeMs;
    this.lastCastAt = time;
    this.owner.hitPulseUntil = time + 220;
    this.scene.audioDirector?.playEnemyAttack(this.owner.config.audioProfile ?? 'miniboss');
  }

  updateBurstVisual(time) {
    const pulse = 1 + Math.sin(time / 34) * 0.12;
    this.telegraph.drawCircle({
      x: this.anchorX,
      y: this.anchorY,
      radius: this.config.radius * pulse,
      progress: 1,
      time
    });
    this.telegraph.graphics.fillStyle(this.config.burstColor, this.config.burstAlpha);
    this.telegraph.graphics.fillCircle(this.anchorX, this.anchorY, this.config.radius * 0.78);
  }

  applyDamage(targetSprite, time) {
    this.hasAppliedDamage = true;
    const distance = Phaser.Math.Distance.Between(targetSprite.x, targetSprite.y, this.anchorX, this.anchorY);
    if (distance > this.config.radius) {
      return;
    }

    const tookDamage = this.scene.player.receiveDamage(this.config.damage, time);
    if (!tookDamage) {
      return;
    }

    const knockDirection = Math.sign(targetSprite.x - this.anchorX) || 1;
    this.scene.player.body.setVelocityX(knockDirection * 220);
    this.scene.player.body.setVelocityY(-210);
  }

  isBusy() {
    return this.state !== 'idle';
  }

  getTelegraphProgress(time = this.scene.time.now) {
    if (this.state !== 'windup') {
      return 0;
    }

    return Phaser.Math.Clamp((time - this.windupStartedAt) / this.config.windupMs, 0, 1);
  }

  resetState() {
    this.state = 'idle';
    this.windupStartedAt = -Infinity;
    this.activeUntil = -Infinity;
    this.recoverUntil = -Infinity;
    this.hasAppliedDamage = false;
    this.telegraph.clear();
  }

  destroy() {
    this.resetState();
    this.telegraph.destroy();
  }
}
