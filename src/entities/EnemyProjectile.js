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
      },
      impact: {
        durationMs: config.impact?.durationMs ?? 120,
        alpha: config.impact?.alpha ?? 0.86,
        scaleMultiplier: config.impact?.scaleMultiplier ?? 1.16,
        tint: config.impact?.tint ?? 0xe6edd8
      }
    };

    this.sprite = null;
    this.body = null;
    this.active = false;
    this.inImpact = false;
    this.impactEndsAt = -Infinity;
    this.spawnedAt = -Infinity;
    this.velocity = new Phaser.Math.Vector2();
    this.baseScaleX = 1;
    this.baseScaleY = 1;
  }

  fire({ x, y, velocityX, velocityY, textureKey, damage, lifetimeMs, rotationSpeed, depth, tint } = {}) {
    if (!this.sprite) {
      this.createSprite(textureKey, x, y, depth);
    }

    this.active = true;
    this.inImpact = false;
    this.impactEndsAt = -Infinity;
    this.damage = damage ?? this.config.damage;
    this.lifetimeMs = lifetimeMs ?? this.config.lifetimeMs;
    this.rotationSpeed = rotationSpeed ?? this.config.rotationSpeed;
    this.spawnedAt = this.scene.time.now;
    this.velocity.set(velocityX, velocityY);

    this.sprite
      .setActive(true)
      .setVisible(true)
      .setPosition(x, y)
      .setScale(this.baseScaleX, this.baseScaleY)
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
    this.syncBodyToSprite();
    this.body.reset(x, y);
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

    this.baseScaleX = this.sprite.scaleX;
    this.baseScaleY = this.sprite.scaleY;

    this.scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body;
    this.body.setAllowGravity(false);
    this.body.setCollideWorldBounds(false);
    this.applyBodySize();
    this.syncBodyToSprite();
    this.body.enable = false;
    this.sprite.setVisible(false).setActive(false);
  }

  applyBodySize() {
    if (!this.body || !this.sprite) {
      return;
    }

    const scaleX = Math.abs(this.sprite.scaleX) || 1;
    const scaleY = Math.abs(this.sprite.scaleY) || 1;
    this.body.setSize(this.config.bodySize.width / scaleX, this.config.bodySize.height / scaleY);
  }

  syncBodyToSprite() {
    if (!this.body || !this.sprite) {
      return;
    }

    const displayWidth = this.sprite.displayWidth ?? this.config.presentation.displayWidth;
    const displayHeight = this.sprite.displayHeight ?? this.config.presentation.displayHeight;
    const scaleX = Math.abs(this.sprite.scaleX) || 1;
    const scaleY = Math.abs(this.sprite.scaleY) || 1;
    const offsetX = ((displayWidth - this.config.bodySize.width) * 0.5) / scaleX;
    const offsetY = ((displayHeight - this.config.bodySize.height) * 0.5) / scaleY;
    this.body.setOffset(offsetX, offsetY);
  }

  update(time, delta) {
    if (!this.active || !this.sprite?.active) {
      return;
    }

    if (this.inImpact) {
      const progress = Phaser.Math.Clamp(1 - ((this.impactEndsAt - time) / this.config.impact.durationMs), 0, 1);
      const scale = this.config.impact.scaleMultiplier - progress * 0.08;
      this.sprite
        .setScale(this.baseScaleX * scale, this.baseScaleY * scale)
        .setAlpha(this.config.impact.alpha * (1 - progress))
        .setAngle(this.sprite.angle + (this.rotationSpeed * 0.32 * delta) / 1000);
      if (time >= this.impactEndsAt) {
        this.destroyProjectile();
      }
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

  playImpact(x = this.sprite?.x, y = this.sprite?.y, tint = this.config.impact.tint) {
    if (!this.active || !this.sprite || !this.body) {
      return;
    }

    this.inImpact = true;
    this.impactEndsAt = this.scene.time.now + this.config.impact.durationMs;
    this.velocity.set(0, 0);
    this.sprite
      .setPosition(x, y)
      .setAlpha(this.config.impact.alpha)
      .setScale(this.baseScaleX * this.config.impact.scaleMultiplier, this.baseScaleY * this.config.impact.scaleMultiplier);
    if (this.sprite.setTint && tint !== undefined) {
      this.sprite.setTint(tint);
    }
    this.body.stop();
    this.body.enable = false;
  }

  destroyProjectile() {
    if (!this.sprite || !this.body) {
      return;
    }

    this.active = false;
    this.inImpact = false;
    this.impactEndsAt = -Infinity;
    this.velocity.set(0, 0);
    this.sprite
      .setVisible(false)
      .setActive(false)
      .setScale(this.baseScaleX, this.baseScaleY)
      .setAlpha(this.config.presentation.alpha)
      .setAngle(0);
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
