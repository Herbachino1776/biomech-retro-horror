import Phaser from 'phaser';

export class Player {
  constructor(scene, x, y, config) {
    this.scene = scene;
    this.config = config;
    this.health = config.maxHealth;
    this.facing = 1;
    this.attackActive = false;
    this.lastAttackTime = -Infinity;
    this.lastHitTime = -Infinity;
    this.isDead = false;

    this.usingConceptSprite = scene.textures.exists('playerConceptSprite');
    this.sprite = this.usingConceptSprite
      ? scene.add.image(x, y, 'playerConceptSprite').setOrigin(0.5).setDisplaySize(66, 76)
      : scene.add.rectangle(x, y, 48, 60, 0xb8aa92).setOrigin(0.5);
    scene.physics.add.existing(this.sprite);

    this.body = this.sprite.body;
    this.body.setCollideWorldBounds(true);
    this.body.setGravityY(0);
    this.body.setSize(config.body.width, config.body.height);
    this.body.setOffset(config.body.offsetX, config.body.offsetY);

    this.attackHitbox = scene.add.zone(x + 26, y, 38, 30);
    scene.physics.add.existing(this.attackHitbox);
    this.attackHitbox.body.allowGravity = false;
    this.attackHitbox.body.moves = false;
    this.attackHitbox.body.enable = false;
  }

  update(time, cursors, keyAttack) {
    if (this.isDead) {
      this.body.setVelocityX(0);
      return;
    }

    let direction = 0;
    if (cursors.left.isDown) {
      direction = -1;
    } else if (cursors.right.isDown) {
      direction = 1;
    }

    if (direction !== 0) {
      this.facing = direction;
    }

    this.body.setVelocityX(direction * this.config.moveSpeed);

    if ((Phaser.Input.Keyboard.JustDown(cursors.up) || Phaser.Input.Keyboard.JustDown(cursors.space)) && this.body.blocked.down) {
      this.body.setVelocityY(this.config.jumpVelocity);
    }

    if (Phaser.Input.Keyboard.JustDown(keyAttack) && time > this.lastAttackTime + this.config.attackCooldownMs) {
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
    const offsetX = this.facing * 34;
    this.attackHitbox.setPosition(this.sprite.x + offsetX, this.sprite.y - 2);
  }

  setVisualTint(color) {
    if (this.usingConceptSprite) {
      this.sprite.setTint(color);
      return;
    }

    this.sprite.fillColor = color;
  }
}
