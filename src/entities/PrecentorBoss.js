import Phaser from 'phaser';
import { COLORS } from '../data/milestone1Config.js';

const FALLBACK_WIDTH = 220;
const FALLBACK_HEIGHT = 236;

export class PrecentorBoss {
  constructor(scene, x, y, config) {
    this.scene = scene;
    this.config = config;
    this.health = config.health;
    this.maxHealth = config.maxHealth ?? config.health;
    this.dead = false;
    this.active = false;
    this.direction = -1;
    this.lastAttackTime = -Infinity;
    this.lastDamageFlashTime = -Infinity;
    this.lastContactDamageTime = -Infinity;
    this.hitPulseUntil = -Infinity;
    this.hurtUntil = -Infinity;
    this.attackState = 'idle';
    this.attackWindupStartedAt = -Infinity;
    this.attackCommitAt = -Infinity;
    this.attackAudioLocked = false;
    this.deathEffectStarted = false;

    this.usingTexture = scene.textures.exists(config.textureKey);
    this.solidUnderlay = null;

    if (this.usingTexture) {
      this.solidUnderlay = scene.add
        .image(x - 6, y + 5, config.textureKey)
        .setOrigin(config.presentation.origin.x, config.presentation.origin.y)
        .setDisplaySize(config.presentation.display.width * 1.03, config.presentation.display.height * 1.04)
        .setTint(0x514640)
        .setAlpha(0.46)
        .setDepth(5.8);
    }

    this.sprite = this.usingTexture
      ? scene.add
          .image(x, y, config.textureKey)
          .setOrigin(config.presentation.origin.x, config.presentation.origin.y)
          .setDisplaySize(config.presentation.display.width, config.presentation.display.height)
          .setTint(config.presentation.tint)
          .setAlpha(config.presentation.alpha)
          .setDepth(6)
      : scene.add
          .ellipse(x, y - FALLBACK_HEIGHT * 0.46, FALLBACK_WIDTH, FALLBACK_HEIGHT, COLORS.bone, 0.96)
          .setStrokeStyle(4, COLORS.rust, 0.94)
          .setDepth(6);

    this.baseScaleX = this.sprite.scaleX;
    this.baseScaleY = this.sprite.scaleY;

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
    this.syncSolidPresentation();
    if (!active && !this.dead) {
      this.clearAttackState();
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
      this.clearAttackState();
      this.body.setVelocityX(0);
      return;
    }

    if (time < this.hurtUntil) {
      this.body.setVelocityX(this.direction * -this.config.hurtRecoilVelocityX);
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
        if (!this.attackAudioLocked) {
          this.attackAudioLocked = true;
          this.scene.audioDirector?.playEnemyAttack(this.config.audioProfile ?? 'miniboss');
        }
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

  clearAttackState() {
    this.attackState = 'idle';
    this.attackWindupStartedAt = -Infinity;
    this.attackCommitAt = -Infinity;
    this.attackAudioLocked = false;
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
    this.clearAttackState();
    this.health = Math.max(0, this.health - amount);
    this.lastDamageFlashTime = time;
    this.hitPulseUntil = time + this.config.hitPulseMs;
    this.hurtUntil = time + this.config.hurtRecoverMs;
    this.body.setVelocityX(-this.direction * this.config.hurtRecoilVelocityX);
    this.body.setVelocityY(this.config.hurtRecoilVelocityY);
    this.scene.audioDirector?.playEnemyHurt(this.config.audioProfile ?? 'miniboss');

    if (this.health <= 0) {
      this.dead = true;
      this.clearAttackState();
      this.body.enable = false;
      this.scene.audioDirector?.playEnemyDeath(this.config.audioProfile ?? 'miniboss');
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
      this.solidUnderlay?.setTint(0xd0c2aa).setAlpha(0.52);
      this.sprite.setTint(0xf2e5c8);
    }

    const deathTargets = [this.sprite, this.solidUnderlay].filter(Boolean);
    deathTargets.forEach((target) => {
      this.scene.tweens.add({
        targets: target,
        y: target.y - 34,
        scaleX: target.scaleX * 1.08,
        scaleY: target.scaleY * 1.14,
        alpha: 0.12,
        duration: 1220,
        ease: 'Cubic.easeOut'
      });
    });
  }

  syncSolidPresentation() {
    if (!this.solidUnderlay) {
      return;
    }

    this.solidUnderlay
      .setVisible(this.sprite.visible)
      .setPosition(this.sprite.x - 6, this.sprite.y + 5)
      .setScale(this.sprite.scaleX * 1.03, this.sprite.scaleY * 1.04)
      .setAngle(this.sprite.angle);
  }

  updateVisuals(time) {
    const telegraphing = this.isTelegraphing(time);
    const telegraphProgress = this.getTelegraphProgress(time);
    const takingHit = time < this.lastDamageFlashTime + 240;
    const hitPulsing = time < this.hitPulseUntil;
    const hurtRecovering = time < this.hurtUntil;

    if (this.dead) {
      this.solidUnderlay?.setTint(0x7c6f64);
      if (this.usingTexture) {
        this.sprite.setTint(0x93877a);
      }
      this.syncSolidPresentation();
      return;
    }

    let scaleX = this.baseScaleX * (this.config.presentation.scaleX ?? 1);
    let scaleY = this.baseScaleY * (this.config.presentation.scaleY ?? 1);
    let angle = 0;
    let alpha = this.config.presentation.alpha ?? 1;
    let tint = this.config.presentation.tint;
    let underlayTint = 0x514640;
    let underlayAlpha = 0.46;

    if (telegraphing) {
      scaleX *= 1 + telegraphProgress * 0.04;
      scaleY *= 1 - telegraphProgress * 0.02;
      angle = this.direction * telegraphProgress * 4;
      tint = 0xf0d8a9;
      underlayTint = 0x7a5c40;
      underlayAlpha = 0.58;
    } else if (hurtRecovering || takingHit) {
      tint = 0xf7dcc4;
      angle = -this.direction * 4;
      scaleX *= 0.98;
      scaleY *= 1.03;
    } else if (this.attackState === 'recover') {
      tint = 0xd19d78;
      alpha = 0.98;
      scaleX *= 1.04;
      scaleY *= 0.98;
      angle = this.direction * 3;
    }

    if (hitPulsing) {
      const pulse = 1 + Math.sin(time / 44) * 0.022;
      scaleX *= pulse;
      scaleY *= pulse;
    }

    this.sprite
      .setScale(scaleX * Math.sign(this.direction), scaleY)
      .setAngle(angle)
      .setAlpha(alpha);

    if (this.usingTexture) {
      this.sprite.setTint(tint);
    }

    this.solidUnderlay?.setTint(underlayTint).setAlpha(underlayAlpha);
    this.syncSolidPresentation();
  }
}
