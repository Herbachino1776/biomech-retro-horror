import { WORLD } from '../data/milestone1Config.js';

const DEFAULT_GAMEPLAY_FLOOR_OFFSET_FROM_WORLD = 2;

export function resolveSceneGameplayFloorY(scene, fallbackFloorY = WORLD.floorY + DEFAULT_GAMEPLAY_FLOOR_OFFSET_FROM_WORLD) {
  if (!scene) {
    return fallbackFloorY;
  }

  if (typeof scene.getGameplayFloorY === 'function') {
    const value = scene.getGameplayFloorY();
    if (Number.isFinite(value)) {
      return value;
    }
  }

  if (Number.isFinite(scene.gameplayFloorY)) {
    return scene.gameplayFloorY;
  }

  return fallbackFloorY;
}

export function resolveSceneVisualFloorY(scene, fallbackFloorY = null) {
  if (scene && Number.isFinite(scene.visualFloorY)) {
    return scene.visualFloorY;
  }

  if (Number.isFinite(fallbackFloorY)) {
    return fallbackFloorY;
  }

  return resolveSceneGameplayFloorY(scene);
}

export function placeSpriteFeetOnFloorLine(sprite, floorY, visualFootOffsetY = 0) {
  if (!sprite || !Number.isFinite(floorY)) {
    return;
  }

  sprite.y = floorY - sprite.displayHeight * (1 - sprite.originY) + visualFootOffsetY;
}

export function syncActorSpriteToPhysicsBody({
  sprite,
  body,
  floorY,
  visualCenterOffsetFromBodyCenterX = 0,
  visualFootOffsetY = 0
}) {
  if (!sprite?.active || !body) {
    return;
  }

  const desiredX = (body.center?.x ?? sprite.x) + visualCenterOffsetFromBodyCenterX;
  sprite.x = desiredX;
  placeSpriteFeetOnFloorLine(sprite, floorY, visualFootOffsetY);
}
