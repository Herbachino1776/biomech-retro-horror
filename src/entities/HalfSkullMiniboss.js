import Phaser from 'phaser';
import { COLORS } from '../data/milestone1Config.js';
import { ASSET_KEYS } from '../data/assetKeys.js';

const FALLBACK_WIDTH = 188;
const FALLBACK_HEIGHT = 208;

export class HalfSkullMiniboss {
  constructor(scene, x, y, config) {
    this.scene = scene;
    this.config = config;
    this.health = config.health;
    this.maxHealth = config.health;
    this.dead = false;
    this.active = false;
    this.direction = -1;
    this.lastAttackTime = -Infinity;
    this.lastDamageFlashTime = -Infinity;
    this.lastContactDamageTime = -Infinity;
    this.hitPulseUntil = -Infinity;
    this.deathEffectStarted = false;
    this.attackState = 'idle';
    this.attackWindupStartedAt = -Infinity;
    this.attackCommitAt = -Infinity;

    this.usingTexture = scene.textures.exists(ASSET_KEYS.chamber01HalfSkullMiniboss);
    this.sprite = this.usingTexture
      ? scene.add
          .image(x, y, ASSET_KEYS.chamber01HalfSkullMiniboss)
          .setOrigin(config.presentation.origin.x, config.presentation.origin.y)
          .setDisplaySize(config.presentation.display.width, config.presentation.display.height)
          .setTint(config.presentation.tint)
          .setAlpha(config.presentation.alpha)
          .setDepth(6)
      : scene.add
          .ellipse(x, y - FALLBACK_HEIGHT * 0.48, FALLBACK_WIDTH, FALLBACK_HEIGHT, COLORS.bone, 0.92)
          .setStrokeStyle(4, COLORS.rust, 0.85)
          .setDepth(6);

    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body;
    this.body.setCollideWorldBounds(true);
    const scaleX = Math.abs(this.sprite.scaleX) || 1;
    const scaleY = Math.abs(this.sprite.scaleY) || 1;
    this.body.setSize(config.body.width / scaleX, config.body.height / scaleY);
    this.body.setOffset(config.body.offsetX / scaleX, config.body.offsetY / scaleY);
    this.body.setAllowGravity(true);
  }

  setActive(active) {
    this.active = active;
    if (!active && !this.dead) {
      this.attackState = 'idle';
      this.body.setVelocityX(0);
    }
  }

  update(time, player) {
    this.updateVisuals(time);

    if (this.dead) {
      this.body.setVelocityX(0);
      return;
    }

    if (!this.active) {
      this.attackState = 'idle';
      this.body.setVelocityX(0);
      return;
    }

    const dx = player.x - this.sprite.x;
    const absDx = Math.abs(dx);
    this.direction = Math.sign(dx) || this.direction;

    if (this.attackState === 'windup') {
      this.body.setVelocityX(this.direction * this.config.windupDriftSpeed);
      if (time >= this.attackCommitAt) {
        this.attackState = 'recover';
        this.lastAttackTime = time;
        this.body.setVelocityX(this.direction * this.config.attackSpeed);
        this.body.setVelocityY(this.config.attackLiftVelocity);
      }
      return;
    }

    if (this.attackState === 'recover') {
      if (time >= this.lastAttackTime + this.config.attackRecoveryMs) {
        this.attackState = 'idle';
      }
      return;
    }

    if (absDx > this.config.approachRange) {
      this.body.setVelocityX(this.direction * this.config.approachSpeed);
      return;
    }

    this.body.setVelocityX(this.direction * this.config.idleAdvanceSpeed);

    if (absDx <= this.config.attackRange && time >= this.lastAttackTime + this.config.attackCooldownMs) {
      this.attackState = 'windup';
      this.attackWindupStartedAt = time;
      this.attackCommitAt = time + this.config.attackTelegraphMs;
      this.body.setVelocityX(this.direction * this.config.windupDriftSpeed);
    }
  }

  isTelegraphing(time = this.scene.time.now) {
    return !this.dead && this.attackState === 'windup' && time < this.attackCommitAt;
  }

  getTelegraphProgress(time = this.scene.time.now) {
    if (!this.isTelegraphing(time)) {
      return 0;
    }

    return Phaser.Math.Clamp((time - this.attackWindupStartedAt) / this.config.attackTelegraphMs, 0, 1);
  }

  canDealContactDamage(time) {
    return time >= this.lastContactDamageTime + this.config.contactDamageCooldownMs;
  }

  recordContactDamage(time) {
    this.lastContactDamageTime = time;
  }

  takeDamage(amount, time = this.scene.time.now) {
    if (this.dead) {
      return false;
    }

    this.active = true;
    this.attackState = 'idle';
    this.health -= amount;
    this.lastDamageFlashTime = time;
    this.hitPulseUntil = time + this.config.hitPulseMs;

    if (this.health <= 0) {
      this.health = 0;
      this.dead = true;
      this.body.enable = false;
      this.playDeathEffect();
    }

    return true;
  }

  playDeathEffect() {
    if (this.deathEffectStarted) {
      return;
    }

    this.deathEffectStarted = true;
    if (this.usingTexture) {
      this.sprite.setTint(0xdccfbc);
    } else {
      this.sprite.setFillStyle(0xdccfbc, 0.56);
    }
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.sprite.y - 24,
      scaleX: this.sprite.scaleX * 1.05,
      scaleY: this.sprite.scaleY * 1.08,
      alpha: 0.08,
      duration: 780,
      ease: 'Cubic.easeOut'
    });
  }

  updateVisuals(time) {
    const telegraphing = this.isTelegraphing(time);
    const telegraphProgress = this.getTelegraphProgress(time);
    const takingHit = time < this.lastDamageFlashTime + 180;
    const hitPulsing = time < this.hitPulseUntil;

    if (this.dead) {
      if (this.usingTexture) {
        this.sprite.setTint(0x80756c);
      } else {
        this.sprite.setFillStyle(0x8d8176, 0.22);
      }
      return;
    }

    if (telegraphing) {
      const pulse = 0.85 + Math.sin(time / 55) * 0.07 + telegraphProgress * 0.08;
      this.sprite.setScale(this.config.presentation.scaleX * pulse, this.config.presentation.scaleY * (1.02 + telegraphProgress * 0.03));
      this.sprite.setAngle(-this.direction * (3 + telegraphProgress * 5));
      if (this.usingTexture) {
        this.sprite.setTint(0xe0c37c);
      } else {
        this.sprite.setFillStyle(0xd6bb7a, 0.82);
      }
      return;
    }

    this.sprite.setScale(this.config.presentation.scaleX, this.config.presentation.scaleY);
    this.sprite.setAngle(0);

    if (takingHit) {
      if (this.usingTexture) {
        this.sprite.setTint(0xc5d89a);
      } else {
        this.sprite.setFillStyle(0xc5d89a, 0.92);
      }
      return;
    }

    if (hitPulsing) {
      const pulse = 1 + Math.sin(time / 36) * 0.03;
      this.sprite.setScale(this.config.presentation.scaleX * pulse, this.config.presentation.scaleY * pulse);
    }

    if (this.usingTexture) {
      this.sprite.setTint(this.config.presentation.tint);
    } else {
      this.sprite.setFillStyle(COLORS.bone, 0.92);
    }
  }
}
