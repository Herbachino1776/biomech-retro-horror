import Phaser from 'phaser';
import { COLORS } from '../data/milestone1Config.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { enforceEnemyFloorIntegrity } from '../systems/EnemyFloorIntegrity.js';

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
    this.hurtUntil = -Infinity;
    this.deathEffectStarted = false;
    this.attackState = 'idle';
    this.attackWindupStartedAt = -Infinity;
    this.attackCommitAt = -Infinity;
    this.attackAudioLocked = false;
    this.poiseConfig = {
      max: Math.max(1, config.poise?.max ?? 10),
      recoverDelayMs: Math.max(0, config.poise?.recoverDelayMs ?? 1650),
      recoverPerSecond: Math.max(0, config.poise?.recoverPerSecond ?? 1.9),
      staggerDurationMs: Math.max(400, config.poise?.staggerDurationMs ?? 2200),
      finisherRange: Math.max(84, config.poise?.finisherRange ?? 156)
    };
    this.poise = this.poiseConfig.max;
    this.poiseBroken = false;
    this.lastPoiseDamageAt = -Infinity;
    this.staggerUntil = -Infinity;

    this.textureKey = config.textureKey ?? ASSET_KEYS.chamber01HalfSkullMiniboss;
    this.usingTexture = scene.textures.exists(this.textureKey);

    this.sprite = this.usingTexture
      ? scene.add
          .image(x, y, this.textureKey)
          .setOrigin(config.presentation.origin.x, config.presentation.origin.y)
          .setDisplaySize(config.presentation.display.width, config.presentation.display.height)
          .setTint(config.presentation.tint)
          .setAlpha(config.presentation.alpha)
          .setDepth(6)
      : scene.add
          .ellipse(x, y - FALLBACK_HEIGHT * 0.48, FALLBACK_WIDTH, FALLBACK_HEIGHT, COLORS.bone, 0.96)
          .setStrokeStyle(4, COLORS.rust, 0.9)
          .setDepth(6);

    this.baseScaleX = this.sprite.scaleX;
    this.baseScaleY = this.sprite.scaleY;

    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body;
    this.body.setCollideWorldBounds(true);
    const scaleX = Math.abs(this.sprite.scaleX) || 1;
    const scaleY = Math.abs(this.sprite.scaleY) || 1;
    const tunedBodyWidth = config.body.width * (config.contactBodyWidthScale ?? 0.88);
    const tunedOffsetX = config.body.offsetX + (config.body.width - tunedBodyWidth) * 0.5;
    this.body.setSize(tunedBodyWidth / scaleX, config.body.height / scaleY);
    this.body.setOffset(tunedOffsetX / scaleX, config.body.offsetY / scaleY);
    this.body.setAllowGravity(true);
  }

  setActive(active) {
    this.active = active;
    if (!active && !this.dead) {
      this.clearAttackState();
      this.body.setVelocityX(0);
    }
  }

  update(time, player) {
    enforceEnemyFloorIntegrity(this.sprite, this.body);
    this.updatePoiseState(time);
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

    if (this.isStaggered(time)) {
      this.body.setVelocity(0, 0);
      this.recordContactDamage(time);
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
        if (!this.canStartAttack()) {
          this.clearAttackState();
          return;
        }

        this.attackState = 'recover';
        this.lastAttackTime = time;
        if (!this.attackAudioLocked) {
          this.attackAudioLocked = true;
          this.scene.audioDirector?.playEnemyAttack(this.config.audioProfile ?? 'miniboss');
        }
        this.body.setVelocityX(this.direction * this.config.attackSpeed);
        const attackRiseClamp = this.config.maxAttackRiseVelocity ?? -28;
        const attackFallClamp = this.config.maxAttackFallVelocity ?? 200;
        this.body.setVelocityY(Phaser.Math.Clamp(this.config.attackLiftVelocity, attackRiseClamp, attackFallClamp));
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

  canStartAttack() {
    return this.active && !this.dead && this.body?.enable !== false;
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
    this.health -= amount;
    this.lastDamageFlashTime = time;
    this.hitPulseUntil = time + this.config.hitPulseMs;
    this.hurtUntil = time + this.config.hurtRecoverMs;
    this.body.setVelocityX(-this.direction * this.config.hurtRecoilVelocityX);
    const hurtRiseClamp = this.config.maxHurtRiseVelocity ?? -24;
    const hurtFallClamp = this.config.maxHurtFallVelocity ?? 220;
    this.body.setVelocityY(Phaser.Math.Clamp(this.config.hurtRecoilVelocityY, hurtRiseClamp, hurtFallClamp));
    this.scene.audioDirector?.playEnemyHurt(this.config.audioProfile ?? 'miniboss');

    if (this.health <= 0) {
      this.scene.audioDirector?.playEnemyDeath(this.config.audioProfile ?? 'miniboss');
      this.health = 0;
      this.dead = true;
      this.clearAttackState();
      this.body.enable = false;
      this.playDeathEffect();
    }

    return true;
  }

  applyPoiseDamage(amount = 1, time = this.scene.time.now) {
    if (this.dead || amount <= 0) {
      return false;
    }

    this.lastPoiseDamageAt = time;
    this.poise = Phaser.Math.Clamp(this.poise - amount, 0, this.poiseConfig.max);
    if (this.poise <= 0 && !this.poiseBroken) {
      this.enterStagger(time);
      return true;
    }

    return false;
  }

  updatePoiseState(time) {
    if (this.dead || this.poiseBroken) {
      return;
    }

    if (time < this.lastPoiseDamageAt + this.poiseConfig.recoverDelayMs) {
      return;
    }

    const dtSeconds = Math.max(0, this.scene.game.loop.delta / 1000);
    this.poise = Phaser.Math.Clamp(this.poise + this.poiseConfig.recoverPerSecond * dtSeconds, 0, this.poiseConfig.max);
  }

  enterStagger(time = this.scene.time.now) {
    this.poiseBroken = true;
    this.staggerUntil = time + this.poiseConfig.staggerDurationMs;
    this.clearAttackState();
    this.body.setVelocity(0, 0);
    this.recordContactDamage(time);
  }

  isStaggered(time = this.scene.time.now) {
    if (!this.poiseBroken || this.dead) {
      return false;
    }

    if (time <= this.staggerUntil) {
      return true;
    }

    this.poiseBroken = false;
    this.poise = this.poiseConfig.max;
    return false;
  }

  canReceiveRiteFinisher(playerSprite, time = this.scene.time.now) {
    if (!this.isStaggered(time) || !playerSprite?.active) {
      return false;
    }

    return Phaser.Math.Distance.Between(playerSprite.x, playerSprite.y, this.sprite.x, this.sprite.y) <= this.poiseConfig.finisherRange;
  }

  playDeathEffect() {
    if (this.deathEffectStarted) {
      return;
    }

    this.deathEffectStarted = true;
    if (this.usingTexture) {
      this.sprite.setTint(0xe7dcc6);
    } else {
      this.sprite.setFillStyle(0xdccfbc, 0.72);
    }
    const deathTargets = [this.sprite];
    deathTargets.forEach((target) => {
      this.scene.tweens.add({
        targets: target,
        y: target.y - 24,
        scaleX: target.scaleX * 1.08,
        scaleY: target.scaleY * 1.12,
        alpha: 0.14,
        duration: 960,
        ease: 'Cubic.easeOut'
      });
    });
  }


  updateVisuals(time) {
    const telegraphing = this.isTelegraphing(time);
    const telegraphProgress = this.getTelegraphProgress(time);
    const takingHit = time < this.lastDamageFlashTime + 220;
    const hitPulsing = time < this.hitPulseUntil;
    const hurtRecovering = time < this.hurtUntil;

    if (this.dead) {
      if (this.usingTexture) {
        this.sprite.setTint(0x8f8377);
      } else {
        this.sprite.setFillStyle(0x8d8176, 0.3);
      }
      return;
    }

    let scaleX = this.baseScaleX * this.config.presentation.scaleX;
    let scaleY = this.baseScaleY * this.config.presentation.scaleY;
    let angle = 0;
    let tint = this.config.presentation.tint;

    if (telegraphing) {
      const pulse = 0.96 + Math.sin(time / 60) * 0.03 + telegraphProgress * 0.11;
      scaleX *= 1.02 + telegraphProgress * 0.03;
      scaleY *= pulse * (1.04 + telegraphProgress * 0.06);
      angle = -this.direction * (5 + telegraphProgress * 8);
      tint = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(0xd4c0a8),
        Phaser.Display.Color.ValueToColor(0xe7ca82),
        100,
        Math.round(telegraphProgress * 100)
      ).color;
    } else if (takingHit || hurtRecovering) {
      const recoilPulse = takingHit ? 1.03 : 1 + Math.sin(time / 42) * 0.02;
      scaleX *= 1.01;
      scaleY *= recoilPulse * 0.98;
      angle = this.direction * (takingHit ? 8 : 4);
      tint = takingHit ? 0xd9efae : 0xb8c987;
    } else if (this.poiseBroken) {
      const staggerPulse = 0.9 + Math.sin(time / 38) * 0.06;
      scaleX *= 0.88;
      scaleY *= staggerPulse * 0.9;
      angle = this.direction * 16;
      tint = 0xd8cdb7;
    } else if (hitPulsing) {
      const pulse = 1 + Math.sin(time / 36) * 0.03;
      scaleX *= pulse;
      scaleY *= pulse * 1.01;
    }

    this.sprite.setScale(scaleX, scaleY);
    this.sprite.setAngle(angle);
    if (this.usingTexture) {
      this.sprite.setTint(tint);
    } else {
      this.sprite.setFillStyle(telegraphing ? 0xd6bb7a : takingHit ? 0xc5d89a : COLORS.bone, telegraphing ? 0.96 : 0.94);
    }

  }
}
