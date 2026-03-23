import Phaser from 'phaser';

const FALLBACK_RADIUS = 12;

export class EnemyProjectile {
  constructor(scene, config = {}) {
    this.scene = scene;
    this.config = {
      speed: config.speed ?? 260,
      damage: config.damage ?? 1,
      lifetimeMs: config.lifetimeMs ?? 2200,
      bodySize: config.bodySize ?? { width: 20, height: 20 },
      depth: config.depth ?? 6.4,
      rotationSpeed: config.rotationSpeed ?? 360,
      presentation: {
        displayWidth: config.presentation?.displayWidth ?? 46,
        displayHeight: config.presentation?.displayHeight ?? 46,
        alpha: config.presentation?.alpha ?? 0.96,
        tint: config.presentation?.tint,
        fallbackFill: config.presentation?.fallbackFill ?? 0xc4d3bb,
        fallbackStroke: config.presentation?.fallbackStroke ?? 0x56706a
      }
    };

    this.sprite = null;
    this.body = null;
    this.active = false;
    this.spawnedAt = -Infinity;
    this.velocity = new Phaser.Math.Vector2();
  }

  fire({ x, y, velocityX, velocityY, textureKey, damage, lifetimeMs, rotationSpeed, depth, tint } = {}) {
    if (!this.sprite) {
      this.createSprite(textureKey, x, y, depth);
    }

    this.active = true;
    this.damage = damage ?? this.config.damage;
    this.lifetimeMs = lifetimeMs ?? this.config.lifetimeMs;
    this.rotationSpeed = rotationSpeed ?? this.config.rotationSpeed;
    this.spawnedAt = this.scene.time.now;
    this.velocity.set(velocityX, velocityY);

    this.sprite
      .setActive(true)
      .setVisible(true)
      .setPosition(x, y)
      .setAlpha(this.config.presentation.alpha)
      .setAngle(0)
      .setDepth(depth ?? this.config.depth);

    if (this.sprite.setTint) {
      if (tint !== undefined) {
        this.sprite.setTint(tint);
      } else {
        this.sprite.clearTint?.();
      }
    }

    this.body.enable = true;
    this.body.setAllowGravity(false);
    this.body.setVelocity(velocityX, velocityY);
    this.body.updateFromGameObject?.();
  }

  createSprite(textureKey, x, y, depth) {
    const usingTexture = Boolean(textureKey) && this.scene.textures.exists(textureKey);
    this.sprite = usingTexture
      ? this.scene.add
          .image(x, y, textureKey)
          .setDisplaySize(this.config.presentation.displayWidth, this.config.presentation.displayHeight)
          .setOrigin(0.5)
          .setDepth(depth ?? this.config.depth)
      : this.scene.add
          .ellipse(x, y, FALLBACK_RADIUS * 2, FALLBACK_RADIUS * 1.4, this.config.presentation.fallbackFill, 0.94)
          .setStrokeStyle(2, this.config.presentation.fallbackStroke, 0.9)
          .setDepth(depth ?? this.config.depth);

    this.scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body;
    this.body.setAllowGravity(false);
    this.body.setCollideWorldBounds(false);
    this.body.setSize(this.config.bodySize.width, this.config.bodySize.height);
    this.body.enable = false;
    this.sprite.setVisible(false).setActive(false);
  }

  update(time, delta) {
    if (!this.active || !this.sprite?.active) {
      return;
    }

    if (time >= this.spawnedAt + this.lifetimeMs) {
      this.destroyProjectile();
      return;
    }

    this.sprite.angle += (this.rotationSpeed * delta) / 1000;

    const bounds = this.scene.physics.world.bounds;
    const padding = 96;
    if (
      this.sprite.x < bounds.x - padding ||
      this.sprite.x > bounds.x + bounds.width + padding ||
      this.sprite.y < bounds.y - padding ||
      this.sprite.y > bounds.y + bounds.height + padding
    ) {
      this.destroyProjectile();
    }
  }

  pauseMotion() {
    if (!this.active || !this.body) {
      return;
    }

    this.body.setVelocity(0, 0);
  }

  resumeMotion() {
    if (!this.active || !this.body) {
      return;
    }

    this.body.setVelocity(this.velocity.x, this.velocity.y);
  }

  destroyProjectile() {
    if (!this.sprite || !this.body) {
      return;
    }

    this.active = false;
    this.velocity.set(0, 0);
    this.sprite.setVisible(false).setActive(false);
    this.body.stop();
    this.body.enable = false;
  }

  destroy() {
    this.destroyProjectile();
    this.sprite?.destroy();
    this.sprite = null;
    this.body = null;
  }
}
