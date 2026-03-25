import Phaser from 'phaser';
import { AoeTelegraph } from './AoeTelegraph.js';

const DEFAULT_CONFIG = {
  enabled: false,
  cooldownMs: 7800,
  windupMs: 1120,
  activeMs: 260,
  recoveryMs: 820,
  minRange: 180,
  maxRange: 560,
  width: 144,
  originOffsetX: 0,
  originOffsetY: -16,
  damage: 2,
  knockbackX: 260,
  knockbackY: -196,
  telegraphStyle: {},
  depth: 6.12
};

export class LineSweepAttack {
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
    this.lastCastAt = -Infinity;
    this.windupStartedAt = -Infinity;
    this.activeUntil = -Infinity;
    this.recoverUntil = -Infinity;
    this.hasAppliedDamage = false;

    this.startX = owner?.sprite?.x ?? 0;
    this.startY = owner?.sprite?.y ?? 0;
    this.endX = this.startX;
    this.endY = this.startY;
    this.direction = 1;

    this.telegraph = new AoeTelegraph(scene, { depth: this.config.depth, ...this.config.telegraphStyle });
  }

  update(time, targetSprite) {
    if (!this.enabled || !this.owner || this.owner.dead || !targetSprite?.body?.enable) {
      this.resetState();
      return;
    }

    if (this.state === 'windup') {
      this.updateTelegraph(time, false);
      if (time >= this.windupStartedAt + this.config.windupMs) {
        this.openDamageWindow(time, targetSprite);
      }
      return;
    }

    if (this.state === 'active') {
      this.updateTelegraph(time, true);
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
    if (
      time < this.lastCastAt + this.config.cooldownMs
      || this.owner.attackState !== 'idle'
      || this.owner.projectileState !== 'idle'
      || this.owner.groundBurst?.isBusy?.()
      || !this.owner.body?.blocked?.down
    ) {
      return false;
    }

    const dx = targetSprite.x - this.owner.sprite.x;
    const dy = targetSprite.y - this.owner.sprite.y;
    const absDx = Math.abs(dx);
    this.owner.direction = Math.sign(dx) || this.owner.direction;

    return absDx >= this.config.minRange
      && absDx <= this.config.maxRange
      && Math.abs(dy) <= this.config.width * 0.62;
  }

  startWindup(time, targetSprite) {
    this.state = 'windup';
    this.windupStartedAt = time;
    this.hasAppliedDamage = false;

    this.direction = Math.sign(targetSprite.x - this.owner.sprite.x) || this.owner.direction || 1;
    this.startX = this.owner.sprite.x + this.direction * this.config.originOffsetX;
    this.startY = this.owner.sprite.y + this.config.originOffsetY;
    this.endX = this.startX + this.direction * this.config.maxRange;
    this.endY = this.startY;

    this.owner.body.setVelocityX(0);
    this.updateTelegraph(time, false);
  }

  openDamageWindow(time) {
    this.state = 'active';
    this.activeUntil = time + this.config.activeMs;
    this.lastCastAt = time;
    this.owner.hitPulseUntil = time + 280;
    this.scene.audioDirector?.playEnemyAttack(this.owner.config.audioProfile ?? 'miniboss');
  }

  updateTelegraph(time, active) {
    if (this.state !== 'windup' && this.state !== 'active') {
      this.telegraph.clear();
      return;
    }

    const progress = this.state === 'windup'
      ? Phaser.Math.Clamp((time - this.windupStartedAt) / this.config.windupMs, 0, 1)
      : 1;
    this.telegraph.drawLine({
      startX: this.startX,
      startY: this.startY,
      endX: this.endX,
      endY: this.endY,
      width: this.config.width,
      progress,
      time,
      active
    });
  }

  applyDamage(targetSprite, time) {
    this.hasAppliedDamage = true;

    const projectedDistance = (targetSprite.x - this.startX) * this.direction;
    if (projectedDistance < 0 || projectedDistance > this.config.maxRange) {
      return;
    }

    const halfWidth = this.config.width * 0.5;
    if (Math.abs(targetSprite.y - this.startY) > halfWidth) {
      return;
    }

    const tookDamage = this.scene.player.receiveDamage(this.config.damage, time);
    if (!tookDamage) {
      return;
    }

    const knockDirection = this.direction;
    this.scene.player.body.setVelocityX(knockDirection * this.config.knockbackX);
    this.scene.player.body.setVelocityY(this.config.knockbackY);
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
