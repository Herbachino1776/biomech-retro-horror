import Phaser from 'phaser';
import { HalfSkullMiniboss } from './HalfSkullMiniboss.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { GroundBurstAttack } from '../systems/GroundBurstAttack.js';
import { LineSweepAttack } from '../systems/LineSweepAttack.js';
import { applyEnemyFloorClamp } from '../systems/enemyGrounding.js';

const DEFAULT_PROJECTILE_CONFIG = {
  cooldownMs: 3200,
  windupMs: 540,
  recoveryMs: 580,
  minRange: 240,
  maxRange: 620,
  verticalTolerance: 180,
  spawnOffsetX: 74,
  spawnOffsetY: -104,
  speed: 260,
  damage: 2,
  lifetimeMs: 2200,
  rotationSpeed: 420,
  telegraphRadiusX: 88,
  telegraphRadiusY: 28
};

export class AbyssalArchon extends HalfSkullMiniboss {
  constructor(scene, x, y, config) {
    super(scene, x, y, {
      ...config,
      textureKey: config.textureKey ?? ASSET_KEYS.sector02Chamber01AbyssalArchon
    });

    this.projectileConfig = {
      ...DEFAULT_PROJECTILE_CONFIG,
      ...(config.projectile ?? {})
    };
    this.projectileTextureKey = config.projectile?.textureKey ?? ASSET_KEYS.sector02PressureShardProjectile;
    this.projectileState = 'idle';
    this.projectileWindupStartedAt = -Infinity;
    this.projectileFireAt = -Infinity;
    this.projectileRecoverUntil = -Infinity;
    this.lastProjectileTime = -Infinity;


    this.groundBurst = new GroundBurstAttack(scene, this, config.groundBurst ?? {});
    this.lineSweep = new LineSweepAttack(scene, this, config.lineSweep ?? {});
    this.projectileTelegraph = scene.add
      .ellipse(x, y + this.projectileConfig.spawnOffsetY, this.projectileConfig.telegraphRadiusX, this.projectileConfig.telegraphRadiusY, 0xcad8be, 0.12)
      .setStrokeStyle(2, 0xaec797, 0.55)
      .setDepth(this.sprite.depth + 0.08)
      .setVisible(false);
  }

  setActive(active) {
    super.setActive(active);
    if (!active && !this.dead) {
      this.clearProjectileState();
      this.groundBurst?.resetState();
      this.lineSweep?.resetState();
    }
  }

  update(time, player) {
    if (this.dead) {
      this.updateVisuals(time);
      applyEnemyFloorClamp(this);
      this.body.setVelocityX(0);
      this.projectileTelegraph?.setVisible(false);
      this.lineSweep?.resetState();
      return;
    }

    if (!this.active) {
      this.clearProjectileState();
      this.groundBurst?.resetState();
      this.lineSweep?.resetState();
      this.attackState = 'idle';
      this.body.setVelocityX(0);
      this.updateVisuals(time);
      applyEnemyFloorClamp(this);
      return;
    }

    this.groundBurst?.update(time, player);
    if (this.groundBurst?.isBusy()) {
      this.clearProjectileState();
      this.lineSweep?.resetState();
      this.attackState = 'idle';
      this.body.setVelocityX(0);
      this.updateVisuals(time);
      this.updateProjectileTelegraph(time);
      applyEnemyFloorClamp(this);
      return;
    }

    this.lineSweep?.update(time, player);
    if (this.lineSweep?.isBusy()) {
      this.clearProjectileState();
      this.attackState = 'idle';
      this.body.setVelocityX(0);
      this.updateVisuals(time);
      this.updateProjectileTelegraph(time);
      applyEnemyFloorClamp(this);
      return;
    }

    if (this.runProjectileState(time, player)) {
      this.updateVisuals(time);
      this.updateProjectileTelegraph(time);
      applyEnemyFloorClamp(this);
      return;
    }

    super.update(time, player);
    this.updateProjectileTelegraph(time);
  }

  runProjectileState(time, player) {
    if (this.projectileState === 'windup') {
      this.body.setVelocityX(0);
      if (time >= this.projectileFireAt) {
        this.fireProjectileAt(player, time);
        this.projectileState = 'recover';
        this.projectileRecoverUntil = time + this.projectileConfig.recoveryMs;
        this.lastProjectileTime = time;
      }
      return true;
    }

    if (this.projectileState === 'recover') {
      this.body.setVelocityX(0);
      if (time >= this.projectileRecoverUntil) {
        this.clearProjectileState();
      }
      return true;
    }

    if (!this.canStartProjectile(time, player)) {
      return false;
    }

    this.projectileState = 'windup';
    this.projectileWindupStartedAt = time;
    this.projectileFireAt = time + this.projectileConfig.windupMs;
    this.body.setVelocityX(0);
    return true;
  }

  canStartProjectile(time, player) {
    if (
      this.projectileState !== 'idle' ||
      this.attackState !== 'idle' ||
      this.groundBurst?.isBusy?.() ||
      this.lineSweep?.isBusy?.() ||
      time < this.hurtUntil ||
      time < this.lastProjectileTime + this.projectileConfig.cooldownMs ||
      !this.body.blocked.down
    ) {
      return false;
    }

    const dx = player.x - this.sprite.x;
    const dy = player.y - this.sprite.y;
    const absDx = Math.abs(dx);
    this.direction = Math.sign(dx) || this.direction;

    return absDx >= this.projectileConfig.minRange
      && absDx <= this.projectileConfig.maxRange
      && Math.abs(dy) <= this.projectileConfig.verticalTolerance;
  }

  fireProjectileAt(player, time) {
    const spawnX = this.sprite.x + this.direction * this.projectileConfig.spawnOffsetX;
    const spawnY = this.sprite.y + this.projectileConfig.spawnOffsetY;
    const bodyCenterX = player.body?.center?.x ?? player.x;
    const bodyCenterY = player.body?.center?.y ?? player.y;
    const torsoTargetY = bodyCenterY - ((player.body?.height ?? 0) * 0.18);
    const target = new Phaser.Math.Vector2(bodyCenterX, torsoTargetY);
    const velocity = target.subtract(new Phaser.Math.Vector2(spawnX, spawnY)).normalize().scale(this.projectileConfig.speed);

    if (Number.isNaN(velocity.x) || Number.isNaN(velocity.y)) {
      velocity.set(this.direction * this.projectileConfig.speed, 0);
    }

    this.scene.spawnEnemyProjectile?.({
      owner: this,
      x: spawnX,
      y: spawnY,
      velocityX: velocity.x,
      velocityY: velocity.y,
      damage: this.projectileConfig.damage,
      lifetimeMs: this.projectileConfig.lifetimeMs,
      rotationSpeed: this.projectileConfig.rotationSpeed,
      textureKey: this.projectileTextureKey,
      tint: 0xd2e1c4,
      depth: this.sprite.depth + 0.04
    });

    this.scene.audioDirector?.playEnemyAttack(this.config.audioProfile ?? 'miniboss');
    this.hitPulseUntil = time + 180;
  }

  clearAttackState() {
    super.clearAttackState();
    this.clearProjectileState();
    this.groundBurst?.resetState();
    this.lineSweep?.resetState();
  }

  clearProjectileState() {
    this.projectileState = 'idle';
    this.projectileWindupStartedAt = -Infinity;
    this.projectileFireAt = -Infinity;
    this.projectileRecoverUntil = -Infinity;
    this.projectileTelegraph?.setVisible(false);
  }

  getProjectileTelegraphProgress(time = this.scene.time.now) {
    if (this.projectileState !== 'windup' || time >= this.projectileFireAt) {
      return 0;
    }

    return Phaser.Math.Clamp((time - this.projectileWindupStartedAt) / this.projectileConfig.windupMs, 0, 1);
  }

  getTelegraphProgress(time = this.scene.time.now) {
    return Math.max(
      super.getTelegraphProgress(time),
      this.getProjectileTelegraphProgress(time),
      this.groundBurst?.getTelegraphProgress(time) ?? 0,
      this.lineSweep?.getTelegraphProgress(time) ?? 0
    );
  }

  updateProjectileTelegraph(time) {
    if (!this.projectileTelegraph) {
      return;
    }

    if (this.dead || this.projectileState !== 'windup') {
      this.projectileTelegraph.setVisible(false);
      return;
    }

    const progress = this.getProjectileTelegraphProgress(time);
    const pulse = 1 + Math.sin(time / 40) * 0.08;
    this.projectileTelegraph
      .setVisible(true)
      .setPosition(this.sprite.x + this.direction * 34, this.sprite.y + this.projectileConfig.spawnOffsetY)
      .setScale(0.92 + progress * 0.22, pulse)
      .setAlpha(0.14 + progress * 0.16)
      .setAngle((time / 16) % 360);
  }

  destroyCombatTelegraphs() {
    this.projectileTelegraph?.destroy?.();
    this.groundBurst?.destroy?.();
    this.lineSweep?.destroy?.();
    this.projectileTelegraph = null;
    this.groundBurst = null;
    this.lineSweep = null;
  }

  takeDamage(amount, time = this.scene.time.now) {
    const tookDamage = super.takeDamage(amount, time);
    if (tookDamage) {
      this.clearProjectileState();
      this.groundBurst?.resetState();
      this.lineSweep?.resetState();
    }

    if (this.dead) {
      this.projectileTelegraph?.setVisible(false);
    }

    return tookDamage;
  }
}
