import { CONCEPT_PRESENTATION } from '../data/milestone1Config.js';
import { ASSET_KEYS } from '../data/assetKeys.js';

export class Player {
  constructor(scene, x, y, config) {
    this.scene = scene;
    this.config = config;
    this.health = config.maxHealth;
    this.facing = 1;
    this.attackActive = false;
    this.attackId = 0;
    this.lastAttackTime = -Infinity;
    this.lastHitTime = -Infinity;
    this.isDead = false;

    this.usingConceptSprite = scene.textures.exists(ASSET_KEYS.player);
    this.sprite = this.usingConceptSprite
      ? scene.add
          .image(x, y, ASSET_KEYS.player)
          .setOrigin(CONCEPT_PRESENTATION.player.origin.x, CONCEPT_PRESENTATION.player.origin.y)
          .setDisplaySize(CONCEPT_PRESENTATION.player.display.width, CONCEPT_PRESENTATION.player.display.height)
          .setCrop(
            CONCEPT_PRESENTATION.player.crop.x,
            CONCEPT_PRESENTATION.player.crop.y,
            CONCEPT_PRESENTATION.player.crop.width,
            CONCEPT_PRESENTATION.player.crop.height
          )
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

    this.body.setVelocityX(direction * this.config.moveSpeed);

    if (input.jumpPressed && this.body.blocked.down) {
      this.body.setVelocityY(this.config.jumpVelocity);
    }

    if (input.attackPressed && time > this.lastAttackTime + this.config.attackCooldownMs) {
      this.startAttack(time);
    }

    if (this.attackActive && time > this.lastAttackTime + this.config.attackDurationMs) {
      this.endAttack();
    }

    this.updateVisuals(time);
    this.updateAttackHitbox();
  }

  startAttack(time) {
    this.lastAttackTime = time;
    this.attackActive = true;
    this.attackId += 1;
    this.attackHitbox.body.enable = true;
    this.setVisualTint(0x6f8c59);
  }

  endAttack() {
    this.attackActive = false;
    this.attackHitbox.body.enable = false;
  }

  receiveDamage(amount, time) {
    if (this.isDead || time < this.lastHitTime + this.config.invulnMs) {
      return false;
    }

    this.health -= amount;
    this.lastHitTime = time;

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
  }

  updateVisuals(time) {
    if (this.isDead) {
      this.setVisualTint(0x392926);
      return;
    }

    if (this.attackActive) {
      this.setVisualTint(0x6f8c59);
      return;
    }

    if (time < this.lastHitTime + 140) {
      this.setVisualTint(0x64453a);
      return;
    }

    this.setVisualTint(0xb8aa92);
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
