import { WORLD } from '../data/milestone1Config.js';

const DEFAULT_FLOOR_PLANE_Y = WORLD.floorY + 2;

function getConfiguredFloorPlaneY(entity) {
  const configFloor = entity?.config?.presentation?.grounding?.floorPlaneY
    ?? entity?.config?.grounding?.floorPlaneY
    ?? entity?.config?.floorPlaneY;

  if (Number.isFinite(configFloor)) {
    return configFloor;
  }

  const sceneFloor = entity?.scene?.enemyFloorPlaneY;
  if (Number.isFinite(sceneFloor)) {
    return sceneFloor;
  }

  return DEFAULT_FLOOR_PLANE_Y;
}

function getFloorOffsetY(entity) {
  const offset = entity?.config?.presentation?.grounding?.floorOffsetY
    ?? entity?.config?.grounding?.floorOffsetY
    ?? entity?.config?.groundYOffset
    ?? 0;
  return Number.isFinite(offset) ? offset : 0;
}

export function getGroundedVisualY(entity, floorPlaneY = getConfiguredFloorPlaneY(entity)) {
  const sprite = entity?.sprite;
  if (!sprite) {
    return null;
  }

  const originY = Number.isFinite(sprite.originY) ? sprite.originY : 0.5;
  const displayHeight = sprite.displayHeight ?? sprite.height ?? 0;
  return floorPlaneY - displayHeight * (1 - originY) + getFloorOffsetY(entity);
}

export function applyEnemyFloorClamp(entity, floorPlaneY = getConfiguredFloorPlaneY(entity)) {
  const sprite = entity?.sprite;
  if (!sprite?.active) {
    return;
  }

  const groundedY = getGroundedVisualY(entity, floorPlaneY);
  if (!Number.isFinite(groundedY)) {
    return;
  }

  const body = entity.body;
  if (!body?.enable) {
    if (sprite.y > groundedY) {
      sprite.y = groundedY;
    }
    return;
  }

  const floorOvershoot = body.bottom - floorPlaneY;
  if (floorOvershoot <= 0.5) {
    return;
  }

  body.y -= floorOvershoot;
  body.prev.y = body.y;
  if (body.velocity.y > 0) {
    body.velocity.y = 0;
  }
}
