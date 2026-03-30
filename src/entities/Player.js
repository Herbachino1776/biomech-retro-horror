import Phaser from 'phaser';
import { CONCEPT_PRESENTATION } from '../data/milestone1Config.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { getNormalizedDisplaySize, getNormalizedOrigin, getNormalizedYOffset } from '../systems/conceptSpriteNormalizer.js';
import { vesselIntegrityState } from '../systems/VesselIntegrityState.js';

const PLAYER_WALK_ANIMATION_KEY = 'player-walk';
const PLAYER_IDLE_ANIMATION_KEY = 'player-idle';
const PLAYER_WALK_FPS = 8;
const PLAYER_WALK_MIN_SPEED = 36;
const PLAYER_IDLE_FPS = 5;
const PLAYER_IDLE_MAX_SPEED = 20;
const PLAYER_ATTACK_MANUAL_FRAME_COUNT = 5;
const PLAYER_ATTACK_EXPLICIT_FRAME_KEY_PREFIX = 'player-attack-explicit-frame';

export class Player {
  constructor(scene, x, y, config) {
    this.scene = scene;
    this.config = config;
    const integritySnapshot = vesselIntegrityState.getIntegritySnapshot();
    this.maxHealth = integritySnapshot.max;
    this.health = integritySnapshot.current;
    this.facing = 1;
    this.attackActive = false;
    this.attackPhase = 'idle';
    this.attackId = 0;
    this.currentAttackFrameIndex = 0;
    this.lastAttackTime = -Infinity;
    this.lastHitTime = -Infinity;
    this.lastFootstepAt = -Infinity;
    this.isDead = false;

    this.usingConceptSprite = scene.textures.exists(ASSET_KEYS.player);
    const playerPresentation = CONCEPT_PRESENTATION.player;
    const displaySize = getNormalizedDisplaySize(playerPresentation);
    const origin = getNormalizedOrigin(playerPresentation);
    const visualYOffset = getNormalizedYOffset(playerPresentation);
    this.normalizedVisualDisplaySize = displaySize;
    this.normalizedVisualOrigin = origin;

    this.sprite = this.usingConceptSprite
      ? scene.add
          .sprite(x, y + visualYOffset, ASSET_KEYS.player, 0)
          .setOrigin(origin.x, origin.y)
          .setDisplaySize(displaySize.width, displaySize.height)
          .setAlpha(playerPresentation.alpha ?? 1)
          .setDepth(6)
      : scene.add.rectangle(x, y, 48, 60, 0xb8aa92).setOrigin(0.5).setDepth(6);
    if (this.usingConceptSprite) {
      this.registerWalkAnimation();
      this.registerIdleAnimation();
    }
    scene.physics.add.existing(this.sprite);

    this.body = this.sprite.body;
    this.body.setCollideWorldBounds(true);
    this.body.setGravityY(0);

    const scaleX = Math.abs(this.sprite.scaleX) || 1;
    const scaleY = Math.abs(this.sprite.scaleY) || 1;
    this.body.setSize(config.body.width / scaleX, config.body.height / scaleY);
    this.body.setOffset(config.body.offsetX / scaleX, config.body.offsetY / scaleY);
    this.attackFootPlaneOffsetY = this.sprite.y - (this.body.y + this.body.height);

    this.attackHitbox = scene.add.zone(x + 26, y, 38, 30);
    scene.physics.add.existing(this.attackHitbox);
    this.attackHitbox.body.allowGravity = false;
    this.attackHitbox.body.moves = false;
    this.attackHitbox.body.enable = false;
  }

  update(time, input) {
    if (this.isDead) {
      this.body.setVelocityX(0);
      return;
    }

    let direction = 0;
    if (input.left) {
      direction = -1;
    } else if (input.right) {
      direction = 1;
    }

    if (direction !== 0) {
      this.facing = direction;
    }

    const targetSpeed = direction * this.config.moveSpeed;
    const inAttackCommit = this.attackPhase === 'startup' || this.attackPhase === 'active' || this.attackPhase === 'recovery';
    const allowedMaxSpeed = inAttackCommit
      ? this.config.moveSpeed * this.config.attackMoveSpeedMultiplier
      : this.config.moveSpeed;
    const cappedTargetSpeed = Phaser.Math.Clamp(targetSpeed, -allowedMaxSpeed, allowedMaxSpeed);
    const acceleration = direction === 0 ? this.config.moveDeceleration : this.config.moveAcceleration;
    const deltaSeconds = this.scene.game.loop.delta / 1000;
    const nextVelocityX = Phaser.Math.Clamp(
      this.body.velocity.x + Phaser.Math.Clamp(cappedTargetSpeed - this.body.velocity.x, -acceleration * deltaSeconds, acceleration * deltaSeconds),
      -allowedMaxSpeed,
      allowedMaxSpeed
    );
    this.body.setVelocityX(nextVelocityX);

    if (input.jumpPressed && this.body.blocked.down) {
      this.body.setVelocityY(this.config.jumpVelocity);
    }

    if (input.attackPressed && this.attackPhase === 'idle' && time > this.lastAttackTime + this.config.attackCooldownMs) {
      this.startAttack(time);
    }

    this.updateAttackState(time);

    this.updateVisuals(time);
    this.updateAttackHitbox();
    this.updateFootsteps(time);
  }

  startAttack(time) {
    this.lastAttackTime = time;
    this.attackActive = false;
    this.attackPhase = 'startup';
    this.attackHitbox.body.enable = false;
    this.currentAttackFrameIndex = 0;
    this.setVisualTint(0x6f8c59);
    this.scene.audioDirector?.playPlayerAttack();
  }

  updateAttackState(time) {
    if (this.attackPhase === 'idle') {
      return;
    }

    const attackElapsed = time - this.lastAttackTime;

    if (this.attackPhase === 'startup' && attackElapsed >= this.config.attackStartupMs) {
      this.attackPhase = 'active';
      this.attackActive = true;
      this.attackId += 1;
      this.attackHitbox.body.enable = true;
      return;
    }

    if (this.attackPhase === 'active' && attackElapsed >= this.config.attackStartupMs + this.config.attackActiveMs) {
      this.attackPhase = 'recovery';
      this.attackActive = false;
      this.attackHitbox.body.enable = false;
      return;
    }

    if (this.attackPhase === 'recovery' && attackElapsed >= this.config.attackStartupMs + this.config.attackActiveMs + this.config.attackRecoveryMs) {
      this.endAttack();
    }
  }

  endAttack() {
    this.attackPhase = 'idle';
    this.attackActive = false;
    this.attackHitbox.body.enable = false;
  }

  receiveDamage(amount, time) {
    if (this.isDead || time < this.lastHitTime + this.config.invulnMs) {
      return false;
    }

    this.damage(amount);
    this.lastHitTime = time;

    this.scene.audioDirector?.playPlayerHurt();

    if (this.health <= 0) {
      this.die();
    }

    return true;
  }

  damage(amount = 1) {
    const next = vesselIntegrityState.damage(amount);
    this.health = next.current;
    this.maxHealth = next.max;
    return this.health;
  }

  heal(amount = 1) {
    const next = vesselIntegrityState.heal(amount);
    this.health = next.current;
    this.maxHealth = next.max;
    return this.health;
  }

  partialRestore(amount = 1) {
    return this.heal(amount);
  }

  fullRestore() {
    const next = vesselIntegrityState.fullRestore();
    this.health = next.current;
    this.maxHealth = next.max;
    return this.health;
  }

  setMaxIntegrity(amount) {
    const next = vesselIntegrityState.setMaxIntegrity(amount);
    this.health = next.current;
    this.maxHealth = next.max;
    return this.maxHealth;
  }

  increaseMaxIntegrity(amount = 1) {
    const next = vesselIntegrityState.increaseMaxIntegrity(amount, { restoreCurrent: true });
    this.health = next.current;
    this.maxHealth = next.max;
    return this.maxHealth;
  }

  die() {
    this.isDead = true;
    this.endAttack();
    this.body.setVelocity(0, 0);
    this.body.enable = false;
    this.setVisualTint(0x392926);
    this.scene.audioDirector?.playPlayerDeath();
  }

  updateVisuals(time) {
    if (this.usingConceptSprite) {
      this.updateSpriteAnimationState(time);
    }

    if (this.isDead) {
      this.setVisualTint(0x392926);
      return;
    }

    if (this.attackPhase !== 'idle') {
      this.setVisualTint(0x6f8c59);
      return;
    }

    if (time < this.lastHitTime + 140) {
      this.setVisualTint(0x64453a);
      return;
    }

    this.setVisualTint(0xb8aa92);
  }

  updateSpriteAnimationState(time) {
    this.applyNormalizedVisualPresentation();

    const isGrounded = this.body.blocked.down;
    const horizontalSpeed = Math.abs(this.body.velocity.x);
    const isMovingHorizontally = horizontalSpeed >= PLAYER_WALK_MIN_SPEED;
    const isNearlyStationary = horizontalSpeed <= PLAYER_IDLE_MAX_SPEED;
    const inAttackCommit = this.attackPhase === 'startup' || this.attackPhase === 'active' || this.attackPhase === 'recovery';
    const canAnimate = !this.isDead && !inAttackCommit && isGrounded;
    const canPlayWalk = canAnimate && isMovingHorizontally;
    const canPlayIdle = canAnimate && isNearlyStationary;

    if (inAttackCommit) {
      this.applyManualAttackFrame(time);
      return;
    }

    if (canPlayWalk) {
      if (this.sprite.anims.currentAnim?.key !== PLAYER_WALK_ANIMATION_KEY || !this.sprite.anims.isPlaying) {
        this.sprite.play(PLAYER_WALK_ANIMATION_KEY, true);
      }
      return;
    }

    if (canPlayIdle) {
      if (this.sprite.anims.currentAnim?.key !== PLAYER_IDLE_ANIMATION_KEY || !this.sprite.anims.isPlaying) {
        this.sprite.play(PLAYER_IDLE_ANIMATION_KEY, true);
      }
      return;
    }

    this.setStaticFrame(0);
  }

  registerWalkAnimation() {
    if (this.scene.anims.exists(PLAYER_WALK_ANIMATION_KEY)) {
      return;
    }

    this.scene.anims.create({
      key: PLAYER_WALK_ANIMATION_KEY,
      frames: this.scene.anims.generateFrameNumbers(ASSET_KEYS.player, { start: 0, end: 5 }),
      frameRate: PLAYER_WALK_FPS,
      repeat: -1
    });
  }

  registerIdleAnimation() {
    if (this.scene.anims.exists(PLAYER_IDLE_ANIMATION_KEY)) {
      return;
    }

    this.scene.anims.create({
      key: PLAYER_IDLE_ANIMATION_KEY,
      frames: this.scene.anims.generateFrameNumbers(ASSET_KEYS.playerIdle, { start: 0, end: 4 }),
      frameRate: PLAYER_IDLE_FPS,
      repeat: -1
    });
  }


  applyManualAttackFrame(time) {
    const totalAttackMs = this.config.attackStartupMs + this.config.attackActiveMs + this.config.attackRecoveryMs;
    const safeTotalAttackMs = Math.max(1, totalAttackMs);
    const attackElapsed = Phaser.Math.Clamp(time - this.lastAttackTime, 0, safeTotalAttackMs);
    const normalizedProgress = Phaser.Math.Clamp(attackElapsed / safeTotalAttackMs, 0, 0.999999);
    const frameIndex = Math.min(
      PLAYER_ATTACK_MANUAL_FRAME_COUNT - 1,
      Math.floor(normalizedProgress * PLAYER_ATTACK_MANUAL_FRAME_COUNT)
    );

    if (this.sprite.anims.isPlaying) {
      this.sprite.anims.stop();
    }

    const attackFrameKey = `${PLAYER_ATTACK_EXPLICIT_FRAME_KEY_PREFIX}-${frameIndex}`;
    this.sprite.setTexture(ASSET_KEYS.playerAttackStrip, attackFrameKey);
    this.currentAttackFrameIndex = frameIndex;
    this.applyNormalizedVisualPresentation();

    const attackFootPlaneY = this.body.y + this.body.height + this.attackFootPlaneOffsetY;
    this.sprite.setY(attackFootPlaneY);
  }

  applyNormalizedVisualPresentation() {
    if (!this.usingConceptSprite) {
      return;
    }

    this.sprite
      .setOrigin(this.normalizedVisualOrigin.x, this.normalizedVisualOrigin.y)
      .setDisplaySize(this.normalizedVisualDisplaySize.width, this.normalizedVisualDisplaySize.height);
  }

  setStaticFrame(frameIndex = 0) {
    if (!this.usingConceptSprite) {
      return;
    }

    if (this.sprite.anims.isPlaying) {
      this.sprite.anims.stop();
    }
    this.sprite.setFrame(frameIndex);
  }


  updateFootsteps(time) {
    if (this.isDead || !this.body.blocked.down) {
      return;
    }

    const speed = Math.abs(this.body.velocity.x);
    if (speed < 36) {
      return;
    }

    const intervalMs = Phaser.Math.Clamp(460 - speed * 1.25, 220, 430);
    if (time < this.lastFootstepAt + intervalMs) {
      return;
    }

    this.lastFootstepAt = time;
    this.scene.audioDirector?.playPlayerFootstep();
  }

  updateAttackHitbox() {
    const strikeY = this.body.y + this.body.height - 14;
    const offsetX = this.facing * 28;
    this.attackHitbox.setPosition(this.sprite.x + offsetX, strikeY);
    this.attackHitbox.body.updateFromGameObject();
  }

  setVisualTint(color) {
    if (this.usingConceptSprite) {
      if (color === 0xb8aa92) {
        this.sprite.clearTint();
        return;
      }

      if (color === 0x6f8c59) {
        this.sprite.setTint(0xb4c78f);
        return;
      }

      if (color === 0x64453a) {
        this.sprite.setTint(0xff9f8b);
        return;
      }

      if (color === 0x392926) {
        this.sprite.setTint(0x6a4b44);
        return;
      }

      this.sprite.setTint(color);
      return;
    }

    this.sprite.fillColor = color;
  }
}
