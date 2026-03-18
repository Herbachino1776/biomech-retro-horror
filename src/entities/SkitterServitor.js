import Phaser from 'phaser';
import { CONCEPT_PRESENTATION } from '../data/milestone1Config.js';
import { ASSET_KEYS } from '../data/assetKeys.js';

export class SkitterServitor {
  constructor(scene, x, y, config) {
    this.scene = scene;
    this.config = config;
    this.health = config.health;
    this.dead = false;
    this.originX = x;
    this.direction = -1;
    this.lastAttackTime = -Infinity;
    this.lastDamageFlashTime = -Infinity;
    this.nextAttackAllowedAt = -Infinity;
    this.awakened = config.awakenPlayerX === undefined;
    this.awakenAtTime = null;
    this.combatState = 'stalk';
    this.stateStartedAt = 0;
    this.stateEndsAt = -Infinity;
    this.attackCommittedAt = -Infinity;
    this.contactDamageWindowUntil = -Infinity;
    this.hurtPushDirection = 0;

    const spriteKey = config.textureKey ?? ASSET_KEYS.skitter;
    const spritePresentation = config.presentation ?? {};
    const defaultPresentation = CONCEPT_PRESENTATION.skitter;
    const crop = spritePresentation.crop ?? defaultPresentation.crop;
    const display = spritePresentation.display ?? defaultPresentation.display;
    const origin = spritePresentation.origin ?? defaultPresentation.origin;

    this.usingConceptSprite = scene.textures.exists(spriteKey);
    this.sprite = this.usingConceptSprite
      ? scene.add
          .image(x, y, spriteKey)
          .setOrigin(origin.x, origin.y)
          .setDisplaySize(display.width, display.height)
          .setAlpha(spritePresentation.alpha ?? defaultPresentation.alpha ?? 1)
          .setDepth(6)
      : scene.add.rectangle(x, y, 48, 34, 0x64453a).setOrigin(0.5).setDepth(6);
    scene.physics.add.existing(this.sprite);

    if (this.usingConceptSprite && crop) {
      this.sprite.setCrop(crop.x, crop.y, crop.width, crop.height);
    }

    if (spritePresentation.scaleX || spritePresentation.scaleY) {
      this.sprite.setScale(spritePresentation.scaleX ?? this.sprite.scaleX, spritePresentation.scaleY ?? this.sprite.scaleY);
    }

    if (spritePresentation.alpha !== undefined) {
      this.sprite.setAlpha(spritePresentation.alpha);
    }

    if (spritePresentation.tint !== undefined) {
      this.presentationTint = spritePresentation.tint;
    }

    this.body = this.sprite.body;
    this.body.setCollideWorldBounds(true);

    const scaleX = Math.abs(this.sprite.scaleX) || 1;
    const scaleY = Math.abs(this.sprite.scaleY) || 1;
    this.body.setSize(config.body.width / scaleX, config.body.height / scaleY);
    this.body.setOffset(config.body.offsetX / scaleX, config.body.offsetY / scaleY);

    this.baseScaleX = this.sprite.scaleX || 1;
    this.baseScaleY = this.sprite.scaleY || 1;
    this.baseAlpha = spritePresentation.alpha ?? defaultPresentation.alpha ?? 0.92;
    this.rangeTell = scene.add
      .ellipse(x, y + 8, config.attackRange * 2, 26, config.rangeTellColor ?? 0xbfa878, 0)
      .setDepth(4.5)
      .setVisible(false);
    this.eyeGlow = scene.add
      .ellipse(x, y - (config.eyeGlowYOffset ?? 18), config.eyeGlowWidth ?? 24, config.eyeGlowHeight ?? 12, config.eyeGlowColor ?? 0x6f8c59, 0)
      .setDepth(6.4)
      .setVisible(true);
  }

  update(time, playerX) {
    this.updateAwakeningState(time, playerX);
    this.updateState(time, playerX);
    this.updateVisuals(time);

    if (this.dead) {
      this.body.setVelocityX(0);
      return;
    }

    if (!this.awakened) {
      this.body.setVelocityX(0);
      return;
    }
  }

  updateAwakeningState(time, playerX) {
    if (this.awakened || this.dead || this.config.awakenPlayerX === undefined) {
      return;
    }

    if (playerX < this.config.awakenPlayerX) {
      this.awakenAtTime = null;
      return;
    }

    if (this.awakenAtTime === null) {
      this.awakenAtTime = time + (this.config.wakeDelayMs ?? 0);
      return;
    }

    if (time >= this.awakenAtTime) {
      this.awakened = true;
      this.awakenAtTime = null;
    }
  }

  updateState(time, playerX) {
    const dx = playerX - this.sprite.x;
    const absDx = Math.abs(dx);
    const closeEnoughToAggro = absDx < this.config.aggroRange;

    if (closeEnoughToAggro && this.combatState !== 'hurt') {
      this.direction = Math.sign(dx) || this.direction;
    }

    switch (this.combatState) {
      case 'windup':
        this.body.setVelocityX(0);
        if (time >= this.stateEndsAt) {
          this.beginAttack(time);
        }
        break;
      case 'attack':
        if (time >= this.stateEndsAt) {
          this.enterState('recovery', time, this.config.attackRecoveryMs);
          this.contactDamageWindowUntil = time;
          this.body.setVelocityX(-this.direction * this.config.speed * 0.18);
        }
        break;
      case 'recovery':
        if (time >= this.stateEndsAt) {
          this.enterState('cooldown', time, this.config.attackCooldownMs + this.config.hesitationMs);
        }
        break;
      case 'cooldown':
        this.runCooldownSpacing(absDx);
        if (time >= this.stateEndsAt) {
          this.enterState('stalk', time);
        }
        break;
      case 'hurt':
        if (time >= this.stateEndsAt) {
          this.enterState('cooldown', time, this.config.attackCooldownMs * 0.7);
        } else {
          this.body.setVelocityX(this.hurtPushDirection * this.config.recoilVelocityX * 0.55);
        }
        break;
      case 'stalk':
      default:
        if (closeEnoughToAggro) {
          this.runAggroStalk(absDx);
          if (absDx <= this.config.attackTriggerRange && time >= this.nextAttackAllowedAt) {
            this.enterState('windup', time, this.config.windupMs);
          }
        } else {
          this.runPatrol();
        }
        break;
    }
  }

  runAggroStalk(absDx) {
    const lowerBound = this.config.preferredRange - this.config.rangeBand;
    const upperBound = this.config.preferredRange + this.config.rangeBand;

    if (absDx < lowerBound) {
      this.body.setVelocityX(-this.direction * this.config.speed * 0.55);
      return;
    }

    if (absDx > upperBound) {
      this.body.setVelocityX(this.direction * this.config.speed);
      return;
    }

    this.body.setVelocityX(this.direction * this.config.speed * 0.18);
  }

  runCooldownSpacing(absDx) {
    const needsSpace = absDx < this.config.preferredRange * 0.82;
    const retreatSpeed = this.config.speed * (needsSpace ? 0.48 : 0.22);
    this.body.setVelocityX(-this.direction * retreatSpeed);
  }

  runPatrol() {
    const patrolMin = this.originX - this.config.patrolDistance;
    const patrolMax = this.originX + this.config.patrolDistance;

    if (this.sprite.x < patrolMin) {
      this.direction = 1;
    }
    if (this.sprite.x > patrolMax) {
      this.direction = -1;
    }

    this.body.setVelocityX(this.direction * this.config.speed * 0.45);
  }

  beginAttack(time) {
    this.lastAttackTime = time;
    this.attackCommittedAt = time;
    this.contactDamageWindowUntil = time + this.config.attackActiveMs;
    this.nextAttackAllowedAt = time + this.config.attackRecoveryMs + this.config.attackCooldownMs;
    this.enterState('attack', time, this.config.attackActiveMs);
    this.body.setVelocityX(this.direction * (this.config.speed + this.config.lungeSpeedBonus));
    this.body.setVelocityY(this.config.lungeJumpVelocity);
  }

  enterState(state, time, duration = 0) {
    this.combatState = state;
    this.stateStartedAt = time;
    this.stateEndsAt = duration > 0 ? time + duration : time;
  }

  takeDamage(amount, time = this.scene.time.now) {
    if (this.dead) {
      return;
    }

    this.awakened = true;
    this.awakenAtTime = null;
    this.health -= amount;
    this.lastDamageFlashTime = time;
    this.contactDamageWindowUntil = time;
    this.nextAttackAllowedAt = time + this.config.attackCooldownMs;
    this.setVisualTint(0x6f8c59);

    if (this.health <= 0) {
      this.dead = true;
      this.body.enable = false;
      this.rangeTell.setVisible(false);
      this.eyeGlow.setVisible(false);
      this.setVisualTint(0x1f1714);
      this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0.2,
        duration: 380
      });
      this.scene.tweens.add({
        targets: [this.rangeTell, this.eyeGlow],
        alpha: 0,
        duration: 180,
        onComplete: () => {
          this.rangeTell.destroy();
          this.eyeGlow.destroy();
        }
      });
      return;
    }

    this.enterState('hurt', time, this.config.hurtLockMs);
    this.body.setVelocityX(this.hurtPushDirection * this.config.recoilVelocityX);
    this.body.setVelocityY(this.config.recoilVelocityY);
  }

  updateVisuals(time) {
    this.updateRangeTell(time);

    if (this.dead) {
      this.updateEyeGlow(time);
      return;
    }

    this.sprite.setFlipX(this.direction > 0);
    this.updateEyeGlow(time);

    if (this.combatState === 'windup') {
      const pulse = 0.82 + Math.sin(time * 0.03) * 0.05;
      this.sprite.setScale(this.baseScaleX * 0.92, this.baseScaleY * 1.04);
      this.setVisualTint(0x98725a);
      this.sprite.setAlpha(pulse);
      return;
    }

    if (this.combatState === 'attack') {
      this.sprite.setScale(this.baseScaleX * 1.04, this.baseScaleY * 0.98);
      this.setVisualTint(0x8f6f55);
      this.sprite.setAlpha(0.95);
      return;
    }

    if (this.combatState === 'hurt') {
      this.sprite.setScale(this.baseScaleX * 1.02, this.baseScaleY * 0.96);
      this.setVisualTint(0x6f8c59);
      this.sprite.setAlpha(0.88);
      return;
    }

    this.sprite.setScale(this.baseScaleX, this.baseScaleY);
    this.sprite.setAlpha(this.baseAlpha);

    if (time < this.lastDamageFlashTime + 120) {
      this.setVisualTint(0x6f8c59);
      return;
    }

    this.setVisualTint(0x64453a);
  }

  updateRangeTell(time) {
    if (this.dead || this.combatState !== 'windup') {
      this.rangeTell.setVisible(false);
      return;
    }

    const windupProgress = Phaser.Math.Clamp((time - this.stateStartedAt) / this.config.windupMs, 0, 1);
    const centerX = this.sprite.x + this.direction * (this.config.attackRange * 0.42);

    this.rangeTell
      .setVisible(true)
      .setPosition(centerX, this.sprite.y + 12)
      .setScale(0.78 + windupProgress * 0.22, 0.88 + windupProgress * 0.12)
      .setAlpha((this.config.rangeTellAlphaBase ?? 0.08) + windupProgress * (this.config.rangeTellAlphaGain ?? 0.14))
      .setStrokeStyle(2, this.config.rangeTellStrokeColor ?? 0xd9c9b2, (this.config.rangeTellStrokeAlphaBase ?? 0.12) + windupProgress * (this.config.rangeTellStrokeAlphaGain ?? 0.18));
  }

  updateEyeGlow(time) {
    if (!this.eyeGlow) {
      return;
    }

    if (this.dead) {
      this.eyeGlow.setVisible(false);
      return;
    }

    const windupProgress = this.combatState === 'windup'
      ? Phaser.Math.Clamp((time - this.stateStartedAt) / this.config.windupMs, 0, 1)
      : 0;
    const eyeOffsetX = (this.config.eyeGlowOffsetX ?? 18) * (this.direction > 0 ? 1 : -1);
    const pulse = this.combatState === 'windup' ? 0.82 + windupProgress * 0.78 : this.combatState === 'attack' ? 1.22 : 0.72 + Math.sin(time * 0.01) * 0.05;

    this.eyeGlow
      .setVisible(this.awakened || this.combatState === 'windup' || this.combatState === 'attack')
      .setPosition(this.sprite.x + eyeOffsetX, this.sprite.y - (this.config.eyeGlowYOffset ?? 18))
      .setScale(pulse, 1 + (pulse - 1) * 0.28)
      .setAlpha((this.config.eyeGlowAlphaBase ?? 0.14) + (this.awakened ? 0.08 : 0) + windupProgress * (this.config.eyeGlowWindupAlphaGain ?? 0.22));
  }

  setHitReactionDirection(direction) {
    this.hurtPushDirection = direction || this.hurtPushDirection || 1;
  }

  canDealContactDamage(time) {
    return !this.dead && this.combatState === 'attack' && time <= this.contactDamageWindowUntil;
  }

  getCombatState() {
    return this.combatState;
  }

  setVisualTint(color) {
    if (this.usingConceptSprite) {
      if (color === 0x6f8c59) {
        this.sprite.setTint(0xb5cb8b);
        return;
      }

      if (color === 0x1f1714) {
        this.sprite.setTint(0x5b4a44);
        return;
      }

      if (this.presentationTint !== undefined) {
        this.sprite.setTint(this.presentationTint);
        return;
      }

      this.sprite.clearTint();
      return;
    }

    this.sprite.fillColor = color;
  }
}
