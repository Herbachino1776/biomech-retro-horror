import Phaser from 'phaser';

const DEFAULT_DAMAGE_HURTBOX_CONFIG = Object.freeze({
  trimXRatio: 0.05,
  trimYRatio: 0.04,
  minWidth: 26,
  minHeight: 24,
  offsetX: 0,
  offsetY: 0,
  insetTopPx: 0,
  insetBottomPx: 0,
  insetLeftPx: 0,
  insetRightPx: 0
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
    offsetY: Number(merged.offsetY) || 0,
    insetTopPx: Math.max(0, Number(merged.insetTopPx) || 0),
    insetBottomPx: Math.max(0, Number(merged.insetBottomPx) || 0),
    insetLeftPx: Math.max(0, Number(merged.insetLeftPx) || 0),
    insetRightPx: Math.max(0, Number(merged.insetRightPx) || 0)
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
  const innerLeft = bounds.left + config.insetLeftPx;
  const innerRight = bounds.right - config.insetRightPx;
  const innerTop = bounds.top + config.insetTopPx;
  const innerBottom = bounds.bottom - config.insetBottomPx;
  const usableWidth = Math.max(1, innerRight - innerLeft);
  const usableHeight = Math.max(1, innerBottom - innerTop);
  const width = Math.max(config.minWidth, usableWidth * (1 - config.trimXRatio * 2));
  const height = Math.max(config.minHeight, usableHeight * (1 - config.trimYRatio * 2));
  const centerX = innerLeft + usableWidth * 0.5;
  const centerY = innerTop + usableHeight * 0.5;
  hurtbox.setPosition(centerX + config.offsetX, centerY + config.offsetY);
  hurtbox.body.setSize(width, height, true);
  hurtbox.body.updateFromGameObject();
}
