import Phaser from 'phaser';
import { CONCEPT_PRESENTATION } from '../data/milestone1Config.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { getNormalizedDisplaySize, getNormalizedOrigin, getNormalizedYOffset } from '../systems/conceptSpriteNormalizer.js';

export class Player {
  constructor(scene, x, y, config) {
    this.scene = scene;
    this.config = config;
    this.health = config.maxHealth;
    this.facing = 1;
    this.attackActive = false;
    this.attackPhase = 'idle';
    this.attackId = 0;
    this.lastAttackTime = -Infinity;
    this.lastHitTime = -Infinity;
    this.lastFootstepAt = -Infinity;
    this.isDead = false;

    this.usingConceptSprite = scene.textures.exists(ASSET_KEYS.player);
    const playerPresentation = CONCEPT_PRESENTATION.player;
    const displaySize = getNormalizedDisplaySize(playerPresentation);
    const origin = getNormalizedOrigin(playerPresentation);
    const visualYOffset = getNormalizedYOffset(playerPresentation);

    this.sprite = this.usingConceptSprite
      ? scene.add
          .image(x, y + visualYOffset, ASSET_KEYS.player)
          .setOrigin(origin.x, origin.y)
          .setDisplaySize(displaySize.width, displaySize.height)
          .setCrop(
            playerPresentation.crop.x,
            playerPresentation.crop.y,
            playerPresentation.crop.width,
            playerPresentation.crop.height
          )
          .setAlpha(playerPresentation.alpha ?? 1)
          .setDepth(6)
      : scene.add.rectangle(x, y, 48, 60, 0xb8aa92).setOrigin(0.5).setDepth(6);
    scene.physics.add.existing(this.sprite);

    this.body = this.sprite.body;
    this.body.setCollideWorldBounds(true);
    this.body.setGravityY(0);

    const scaleX = Math.abs(this.sprite.scaleX) || 1;
    const scaleY = Math.abs(this.sprite.scaleY) || 1;
    this.body.setSize(config.body.width / scaleX, config.body.height / scaleY);
    this.body.setOffset(config.body.offsetX / scaleX, config.body.offsetY / scaleY);

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

    this.health -= amount;
    this.lastHitTime = time;

    this.scene.audioDirector?.playPlayerHurt();

    if (this.health <= 0) {
      this.die();
    }

    return true;
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
