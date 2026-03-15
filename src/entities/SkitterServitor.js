import { CONCEPT_PRESENTATION } from '../data/milestone1Config.js';

export class SkitterServitor {
  constructor(scene, x, y, config) {
    this.scene = scene;
    this.config = config;
    this.health = config.health;
    this.dead = false;
    this.originX = x;
    this.direction = -1;
    this.lastAttackTime = -Infinity;

    this.usingConceptSprite = scene.textures.exists('skitterConceptSprite');
    this.sprite = this.usingConceptSprite
      ? scene.add
          .image(x, y, 'skitterConceptSprite')
          .setOrigin(CONCEPT_PRESENTATION.skitter.origin.x, CONCEPT_PRESENTATION.skitter.origin.y)
          .setDisplaySize(CONCEPT_PRESENTATION.skitter.display.width, CONCEPT_PRESENTATION.skitter.display.height)
          .setCrop(
            CONCEPT_PRESENTATION.skitter.crop.x,
            CONCEPT_PRESENTATION.skitter.crop.y,
            CONCEPT_PRESENTATION.skitter.crop.width,
            CONCEPT_PRESENTATION.skitter.crop.height
          )
          .setDepth(6)
      : scene.add.rectangle(x, y, 48, 34, 0x64453a).setOrigin(0.5).setDepth(6);
    scene.physics.add.existing(this.sprite);

    this.body = this.sprite.body;
    this.body.setCollideWorldBounds(true);
    this.body.setSize(config.body.width, config.body.height);
    this.body.setOffset(config.body.offsetX, config.body.offsetY);
  }

  update(time, playerX) {
    if (this.dead) {
      this.body.setVelocityX(0);
      return;
    }

    const dx = playerX - this.sprite.x;
    const closeEnoughToAggro = Math.abs(dx) < this.config.aggroRange;

    if (closeEnoughToAggro) {
      this.direction = Math.sign(dx) || this.direction;
      this.body.setVelocityX(this.direction * this.config.speed);

      if (Math.abs(dx) < 65 && time > this.lastAttackTime + this.config.attackCooldownMs) {
        this.lastAttackTime = time;
        this.body.setVelocityX(this.direction * (this.config.speed + 90));
        this.body.setVelocityY(-190);
      }
    } else {
      const patrolMin = this.originX - this.config.patrolDistance;
      const patrolMax = this.originX + this.config.patrolDistance;

      if (this.sprite.x < patrolMin) {
        this.direction = 1;
      }
      if (this.sprite.x > patrolMax) {
        this.direction = -1;
      }

      this.body.setVelocityX(this.direction * this.config.speed * 0.5);
    }
  }

  takeDamage(amount) {
    if (this.dead) {
      return;
    }

    this.health -= amount;
    this.setVisualTint(0x6f8c59);

    if (this.health <= 0) {
      this.dead = true;
      this.body.enable = false;
      this.setVisualTint(0x1f1714);
      this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0.2,
        duration: 380
      });
    }
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

      this.sprite.clearTint();
      return;
    }

    this.sprite.fillColor = color;
  }
}
