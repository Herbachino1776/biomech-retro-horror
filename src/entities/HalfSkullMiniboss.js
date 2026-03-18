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
      this.body.setVelocityX(0);
      return;
    }

    const dx = player.x - this.sprite.x;
    const absDx = Math.abs(dx);
    this.direction = Math.sign(dx) || this.direction;

    if (absDx > this.config.approachRange) {
      this.body.setVelocityX(this.direction * this.config.approachSpeed);
      return;
    }

    this.body.setVelocityX(this.direction * this.config.idleAdvanceSpeed);

    if (absDx <= this.config.attackRange && time >= this.lastAttackTime + this.config.attackCooldownMs) {
      this.lastAttackTime = time;
      this.body.setVelocityX(this.direction * this.config.attackSpeed);
      this.body.setVelocityY(this.config.attackLiftVelocity);
    }
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
    this.health -= amount;
    this.lastDamageFlashTime = time;

    if (this.health <= 0) {
      this.health = 0;
      this.dead = true;
      this.body.enable = false;
      this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0.16,
        duration: 650,
        ease: 'Quad.out'
      });
    }

    return true;
  }

  updateVisuals(time) {
    if (!this.usingTexture) {
      return;
    }

    if (this.dead) {
      this.sprite.setTint(0x5f4e49);
      return;
    }

    if (time < this.lastDamageFlashTime + 140) {
      this.sprite.setTint(0xc5d89a);
      return;
    }

    this.sprite.setTint(this.config.presentation.tint);
  }
}
