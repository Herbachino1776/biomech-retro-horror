import Phaser from 'phaser';

const DEFAULT_DAMAGE_HURTBOX_CONFIG = Object.freeze({
  trimXRatio: 0.05,
  trimYRatio: 0.04,
  minWidth: 26,
  minHeight: 24,
  offsetX: 0,
  offsetY: 0
});

function clampRatio(value) {
  return Phaser.Math.Clamp(Number.isFinite(value) ? value : 0, 0, 0.45);
}

export function resolveDamageHurtboxConfig(config = {}, defaults = {}) {
  const merged = { ...DEFAULT_DAMAGE_HURTBOX_CONFIG, ...defaults, ...(config ?? {}) };
  return {
    trimXRatio: clampRatio(merged.trimXRatio),
    trimYRatio: clampRatio(merged.trimYRatio),
    minWidth: Math.max(8, Number(merged.minWidth) || DEFAULT_DAMAGE_HURTBOX_CONFIG.minWidth),
    minHeight: Math.max(8, Number(merged.minHeight) || DEFAULT_DAMAGE_HURTBOX_CONFIG.minHeight),
    offsetX: Number(merged.offsetX) || 0,
    offsetY: Number(merged.offsetY) || 0
  };
}

export function createDamageHurtbox(scene, sprite) {
  const hurtbox = scene.add.zone(sprite.x, sprite.y, 8, 8).setOrigin(0.5).setVisible(false);
  scene.physics.add.existing(hurtbox);
  hurtbox.body.setAllowGravity(false);
  hurtbox.body.moves = false;
  hurtbox.body.immovable = true;
  return hurtbox;
}

export function syncDamageHurtbox(hurtbox, sprite, config, enabled = true) {
  if (!hurtbox?.body || !sprite?.active) {
    return;
  }

  hurtbox.body.enable = Boolean(enabled);
  if (!hurtbox.body.enable) {
    return;
  }

  const bounds = sprite.getBounds();
  const width = Math.max(config.minWidth, bounds.width * (1 - config.trimXRatio * 2));
  const height = Math.max(config.minHeight, bounds.height * (1 - config.trimYRatio * 2));
  hurtbox.setPosition(bounds.centerX + config.offsetX, bounds.centerY + config.offsetY);
  hurtbox.body.setSize(width, height, true);
}
