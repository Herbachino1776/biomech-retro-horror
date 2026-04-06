import Phaser from 'phaser';
import { CONCEPT_PRESENTATION, WORLD } from '../data/milestone1Config.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { triggerEnemyDeathRuptureBurst } from '../systems/EnemyDeathRuptureBurst.js';
import { triggerEnemyHitSplatterBurst } from '../systems/EnemyHitSplatterBurst.js';
import { spawnEnemyCorpseRemains } from '../systems/EnemyCorpseRemains.js';

const DEATH_FADE_DURATION_MS = 180;
const DEATH_REMAINS_SPAWN_DELAY_MS = 60;

export class SkitterServitor {
  constructor(scene, x, y, config) {
    this.scene = scene;
    this.config = {
      ...config,
      body: { ...(config?.body ?? {}) },
      poise: { ...(config?.poise ?? {}) },
      presentation: { ...(config?.presentation ?? {}) }
    };
    this.health = this.config.health;
    this.dead = false;
    this.originX = x;
    this.direction = -1;
    this.lastAttackTime = -Infinity;
    this.lastDamageFlashTime = -Infinity;
    this.nextAttackAllowedAt = -Infinity;
    this.awakened = this.config.awakenPlayerX === undefined;
    this.awakenAtTime = null;
    this.combatState = 'stalk';
    this.stateStartedAt = 0;
    this.stateEndsAt = -Infinity;
    this.attackCommittedAt = -Infinity;
    this.contactDamageWindowUntil = -Infinity;
    this.hurtPushDirection = 0;
    this.attackAudioLocked = false;
    this.lastSeenPlayerAt = -Infinity;
    this.pursuitCommittedUntil = -Infinity;
    this.wasAwakenedLastUpdate = this.awakened;
    this.wakeRushUntil = -Infinity;
    this.deathRemainsSpawned = false;
    this.deathRemainsSpawnPoint = null;
    this.active = true;
    this.brutalityAggression = {
      speedMultiplier: 1,
      aggroRangeMultiplier: 1
    };
    this.poiseConfig = {
      max: Math.max(1, this.config.poise?.max ?? 0),
      recoverDelayMs: Math.max(0, this.config.poise?.recoverDelayMs ?? 1400),
      recoverPerSecond: Math.max(0, this.config.poise?.recoverPerSecond ?? 1.4),
      staggerDurationMs: Math.max(260, this.config.poise?.staggerDurationMs ?? 1800),
      finisherRange: Math.max(68, this.config.poise?.finisherRange ?? 132)
    };
    this.poise = this.poiseConfig.max;
    this.poiseBroken = false;
    this.lastPoiseDamageAt = -Infinity;
    this.staggerUntil = -Infinity;

    const spriteKey = this.config.textureKey ?? ASSET_KEYS.skitter;
    const spritePresentation = this.config.presentation ?? {};
    const defaultPresentation = CONCEPT_PRESENTATION.skitter;
    const shouldUseDefaultCrop = spriteKey === ASSET_KEYS.skitter;
    const crop = spritePresentation.crop ?? (shouldUseDefaultCrop ? defaultPresentation.crop : null);
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
    const tunedBodyWidth = this.config.body.width * (this.config.contactBodyWidthScale ?? 0.84);
    const tunedOffsetX = this.config.body.offsetX + (this.config.body.width - tunedBodyWidth) * 0.5;
    this.body.setSize(tunedBodyWidth / scaleX, this.config.body.height / scaleY);
    this.body.setOffset(tunedOffsetX / scaleX, this.config.body.offsetY / scaleY);

    this.baseScaleX = this.sprite.scaleX || 1;
    this.baseScaleY = this.sprite.scaleY || 1;
    this.baseAlpha = spritePresentation.alpha ?? defaultPresentation.alpha ?? 0.92;
    this.stateAlphas = spritePresentation.stateAlpha ?? {};
    this.eyeGlow = scene.add
      .ellipse(
        x,
        y - (this.config.eyeGlowYOffset ?? 18),
        this.config.eyeGlowWidth ?? 24,
        this.config.eyeGlowHeight ?? 12,
        this.config.eyeGlowColor ?? 0x6f8c59,
        0
      )
      .setDepth(6.4)
      .setVisible(true);
  }

  setActive(isActive = true) {
    this.active = Boolean(isActive);
    this.sprite.setActive(this.active).setVisible(this.active);
    this.body.enable = this.active;
    if (!this.active) {
      this.body.setVelocity(0, 0);
      this.contactDamageWindowUntil = -Infinity;
    }
    this.eyeGlow?.setVisible(this.active && !this.dead);
    return this;
  }

  update(time, playerX) {
    if (!this.active) {
      this.body.setVelocity(0, 0);
      return;
    }

    this.updatePoiseState(time);
    this.updateVisuals(time);

    if (this.dead) {
      this.body.setVelocity(0, 0);
      return;
    }

    this.updateAwakeningState(time, playerX);
    if (this.awakened && !this.wasAwakenedLastUpdate) {
      this.wakeRushUntil = time + (this.config.wakeRushMs ?? 420);
      this.nextAttackAllowedAt = Math.min(this.nextAttackAllowedAt, time + (this.config.wakeAttackLeadInMs ?? 160));
      this.pursuitCommittedUntil = Math.max(this.pursuitCommittedUntil, time + (this.config.wakePursuitCommitMs ?? 1180));
      this.direction = Math.sign(playerX - this.sprite.x) || this.direction;
      this.enterState('stalk', time);
    }
    this.wasAwakenedLastUpdate = this.awakened;

    if (this.isStaggered(time)) {
      this.body.setVelocity(0, 0);
      this.contactDamageWindowUntil = time;
      return;
    }

    this.updateState(time, playerX);

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
    const wakeRushActive = time < this.wakeRushUntil;
    const aggroRange = this.getAggroRange();
    const heatSeekRange = (this.config.heatSeekRange ?? this.config.aggroRange * 1.22) * this.brutalityAggression.aggroRangeMultiplier;
    const closeEnoughToAggro = absDx < (wakeRushActive ? Math.max(aggroRange, heatSeekRange) : aggroRange);
    const pressureTrackingRange = (this.config.pressureTrackingRange ?? this.config.aggroRange * 1.5) * this.brutalityAggression.aggroRangeMultiplier;
    const pressureTracking = absDx < pressureTrackingRange;
    const pursuitCommitMs = (this.config.pursuitCommitMs ?? 980) + (wakeRushActive ? (this.config.wakeCommitBonusMs ?? 220) : 0);
    const pursueAfterLosingAggro = time < this.pursuitCommittedUntil;
    const shouldPursue = closeEnoughToAggro || pursueAfterLosingAggro || pressureTracking;

    if (closeEnoughToAggro) {
      this.lastSeenPlayerAt = time;
      this.pursuitCommittedUntil = time + pursuitCommitMs;
    } else if (pressureTracking && this.combatState === 'stalk') {
      this.pursuitCommittedUntil = Math.max(this.pursuitCommittedUntil, time + (this.config.trailingCommitMs ?? 340));
    }

    if (shouldPursue && this.combatState !== 'hurt') {
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
          this.body.setVelocityX(-this.direction * this.getSpeed() * 0.18);
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
        if (shouldPursue) {
          this.runAggroStalk(absDx, time);
          const wakeAttackCommitRange = this.config.wakeAttackCommitRange ?? this.config.attackTriggerRange * 1.16;
          const canStartAttack = absDx <= this.config.attackTriggerRange
            || (wakeRushActive && absDx <= wakeAttackCommitRange);
          if (canStartAttack && time >= this.nextAttackAllowedAt) {
            this.enterState('windup', time, this.config.windupMs);
          }
        } else {
          this.runPatrol(absDx);
        }
        break;
    }
  }

  runAggroStalk(absDx, time) {
    const lowerBound = this.config.preferredRange - this.config.rangeBand;
    const upperBound = this.config.preferredRange + this.config.rangeBand;
    const wakeRushFactor = time < this.wakeRushUntil ? (this.config.wakeRushSpeedFactor ?? 1.16) : 1;
    const baseSpeed = this.getSpeed() * wakeRushFactor;

    if (absDx < lowerBound) {
      this.body.setVelocityX(-this.direction * baseSpeed * 0.24);
      return;
    }

    if (absDx > upperBound) {
      this.body.setVelocityX(this.direction * baseSpeed * 1.24);
      return;
    }

    this.body.setVelocityX(this.direction * baseSpeed * 0.7);
  }

  runCooldownSpacing(absDx) {
    const retreatRange = this.config.preferredRange * 0.66;
    const reengageRange = this.config.preferredRange * 1.18;

    if (absDx < retreatRange) {
      this.body.setVelocityX(-this.direction * this.getSpeed() * 0.38);
      return;
    }

    if (absDx > reengageRange) {
      this.body.setVelocityX(this.direction * this.getSpeed() * 0.74);
      return;
    }

    this.body.setVelocityX(this.direction * this.getSpeed() * 0.34);
  }

  runPatrol(absDx) {
    const patrolMin = this.originX - this.config.patrolDistance;
    const patrolMax = this.originX + this.config.patrolDistance;
    const farFromHome = Math.abs(this.sprite.x - this.originX) > this.config.patrolDistance * 0.45;

    if (this.sprite.x < patrolMin) {
      this.direction = 1;
    }
    if (this.sprite.x > patrolMax) {
      this.direction = -1;
    }

    if (farFromHome && absDx > this.getAggroRange() * 1.15) {
      this.direction = Math.sign(this.originX - this.sprite.x) || this.direction;
      this.body.setVelocityX(this.direction * this.getSpeed() * 0.58);
      return;
    }

    this.body.setVelocityX(this.direction * this.getSpeed() * 0.52);
  }

  beginAttack(time) {
    if (!this.isAliveForAttack()) {
      this.clearAttackState(time, 'stalk');
      return;
    }

    this.lastAttackTime = time;
    this.attackCommittedAt = time;
    this.contactDamageWindowUntil = time + this.config.attackActiveMs;
    this.nextAttackAllowedAt = time + this.config.attackRecoveryMs + this.config.attackCooldownMs;
    this.enterState('attack', time, this.config.attackActiveMs);
    this.body.setVelocityX(this.direction * (this.getSpeed() + this.config.lungeSpeedBonus));
    this.body.setVelocityY(this.config.lungeJumpVelocity);

    if (!this.attackAudioLocked) {
      this.attackAudioLocked = true;
      this.scene.audioDirector?.playEnemyAttack(this.config.audioProfile ?? 'enemy');
    }
  }

  enterState(state, time, duration = 0) {
    this.combatState = state;
    this.stateStartedAt = time;
    this.stateEndsAt = duration > 0 ? time + duration : time;
    if (state !== 'attack' && state !== 'windup') {
      this.attackAudioLocked = false;
    }
  }

  clearAttackState(time = this.scene.time.now, nextState = 'stalk') {
    this.attackCommittedAt = -Infinity;
    this.contactDamageWindowUntil = -Infinity;
    this.attackAudioLocked = false;
    this.enterState(nextState, time);
  }

  isAliveForAttack() {
    return !this.dead && this.body?.enable !== false && this.awakened;
  }

  takeDamage(amount, time = this.scene.time.now, options = {}) {
    if (this.dead) {
      return;
    }

    this.awakened = true;
    this.awakenAtTime = null;
    this.health -= amount;
    this.lastDamageFlashTime = time;
    this.contactDamageWindowUntil = time;
    this.nextAttackAllowedAt = time + this.config.attackCooldownMs;
    this.wakeRushUntil = Math.max(this.wakeRushUntil, time + (this.config.hurtReengageRushMs ?? 260));
    this.pursuitCommittedUntil = Math.max(this.pursuitCommittedUntil, time + (this.config.hurtPursuitCommitMs ?? 1100));
    this.setVisualTint(0x7b6155);
    triggerEnemyHitSplatterBurst(this.scene, {
      x: this.sprite.x + this.hurtPushDirection * 8,
      y: (this.body?.center?.y ?? this.sprite.y) - 8,
      depth: this.sprite.depth
    });

    if (this.health <= 0) {
      this.scene.audioDirector?.playEnemyDeath(this.config.audioProfile ?? 'enemy');
      this.dead = true;
      this.clearAttackState(time, 'dead');
      this.body.stop();
      this.body.setAllowGravity(false);
      this.body.enable = false;
      this.eyeGlow.setVisible(false);
      this.setVisualTint(0x1f1714);
      this.deathRemainsSpawnPoint = this.resolveDeathRemainsSpawnPoint();
      if (!options.skipDefaultDeathFx) {
        triggerEnemyDeathRuptureBurst(this.scene, {
          x: this.sprite.x,
          y: (this.body?.bottom ?? this.sprite.y) - 16,
          depth: this.sprite.depth,
          isElite: Boolean(this.isElite || this.isTollKeeper || this.config.isElite)
        });
      }
      this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0,
        duration: DEATH_FADE_DURATION_MS,
        onComplete: () => {
          this.sprite.setVisible(false);
        }
      });
      this.scene.time.delayedCall(DEATH_REMAINS_SPAWN_DELAY_MS, () => {
        if (this.deathRemainsSpawned) {
          return;
        }
        this.deathRemainsSpawned = true;
        const remainsSize = this.config.corpseRemainsProfile
          ?? (this.isElite || this.isTollKeeper || this.config.isElite ? 'elite' : 'small');
        const remainsSpawnPoint = this.resolveDeathRemainsSpawnPoint();
        spawnEnemyCorpseRemains(this.scene, {
          x: remainsSpawnPoint.x,
          groundY: remainsSpawnPoint.groundY,
          depth: this.sprite.depth,
          size: remainsSize
        });
      });
      this.scene.tweens.add({
        targets: [this.eyeGlow],
        alpha: 0,
        duration: 180,
        onComplete: () => {
          this.eyeGlow.destroy();
        }
      });
      return;
    }

    this.scene.audioDirector?.playEnemyHurt(this.config.audioProfile ?? 'enemy');
    this.enterState('hurt', time, this.config.hurtLockMs);
    this.body.setVelocityX(this.hurtPushDirection * this.config.recoilVelocityX);
    this.body.setVelocityY(this.config.recoilVelocityY);
  }

  resolveDeathRemainsSpawnPoint() {
    if (this.deathRemainsSpawnPoint) {
      return this.deathRemainsSpawnPoint;
    }

    this.deathRemainsSpawnPoint = {
      x: this.sprite.x,
      groundY: this.scene?.player?.sprite?.body?.bottom ?? WORLD.floorY + 2
    };
    return this.deathRemainsSpawnPoint;
  }

  getDeathRemainsSpawnPoint() {
    return this.resolveDeathRemainsSpawnPoint();
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
    this.clearAttackState(time, 'staggered');
    this.body.setVelocity(0, 0);
    this.contactDamageWindowUntil = time;
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

  updateVisuals(time) {
    if (this.dead) {
      this.updateEyeGlow(time);
      return;
    }

    if (typeof this.sprite.setFlipX === 'function') {
      this.sprite.setFlipX(this.direction > 0);
    } else {
      this.sprite.setScale(Math.abs(this.baseScaleX) * (this.direction > 0 ? -1 : 1), this.sprite.scaleY);
    }
    this.updateEyeGlow(time);

    if (this.combatState === 'windup') {
      const pulse = 0.82 + Math.sin(time * 0.03) * 0.05;
      this.sprite.setScale(this.baseScaleX * 0.92, this.baseScaleY * 1.04);
      this.setVisualTint(0x98725a);
      this.sprite.setAlpha(this.getStateAlpha('windup', pulse));
      return;
    }

    if (this.combatState === 'attack') {
      this.sprite.setScale(this.baseScaleX * 1.04, this.baseScaleY * 0.98);
      this.setVisualTint(0x8f6f55);
      this.sprite.setAlpha(this.getStateAlpha('attack', 0.95));
      return;
    }

    if (this.combatState === 'hurt') {
      this.sprite.setScale(this.baseScaleX * 1.02, this.baseScaleY * 0.96);
      this.setVisualTint(0x7b6155);
      this.sprite.setAlpha(this.getStateAlpha('hurt', 0.88));
      return;
    }

    if (this.poiseBroken) {
      const pulse = 0.8 + Math.sin(time * 0.026) * 0.06;
      this.sprite.setScale(this.baseScaleX * 0.9, this.baseScaleY * 0.94);
      this.sprite.setAngle(this.direction * 12);
      this.setVisualTint(0xb4ab95);
      this.sprite.setAlpha(this.getStateAlpha('staggered', pulse));
      return;
    }

    this.sprite.setScale(this.baseScaleX, this.baseScaleY);
    this.sprite.setAlpha(this.baseAlpha);

    if (time < this.lastDamageFlashTime + 120) {
      this.setVisualTint(0x7b6155);
      return;
    }

    this.setVisualTint(0x64453a);
  }

  getStateAlpha(state, fallbackAlpha) {
    return this.stateAlphas[state] ?? fallbackAlpha;
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

  getSpeed() {
    return this.config.speed * this.brutalityAggression.speedMultiplier;
  }

  getAggroRange() {
    return this.config.aggroRange * this.brutalityAggression.aggroRangeMultiplier;
  }

  setBrutalityAggression(active, config = {}) {
    if (active) {
      this.brutalityAggression.speedMultiplier = config.speedMultiplier ?? 1;
      this.brutalityAggression.aggroRangeMultiplier = config.aggroRangeMultiplier ?? 1;
      return;
    }

    this.brutalityAggression.speedMultiplier = 1;
    this.brutalityAggression.aggroRangeMultiplier = 1;
  }

  setVisualTint(color) {
    if (this.usingConceptSprite) {
      if (color === 0x7b6155) {
        this.sprite.setTint(0xc9ab9a);
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
