import { WORLD } from '../data/milestone1Config.js';

const DEFAULT_FLOOR_BOTTOM_Y = WORLD.floorY + 2;
const FLOOR_PENETRATION_EPSILON = 0.75;
const UPWARD_CORRECTION_GUARD_VELOCITY = -8;

function syncSpriteToBodyY(sprite, body) {
  if (!sprite || !body) {
    return;
  }

  const displayOriginY = sprite.displayHeight * sprite.originY;
  sprite.y = body.y - body.offset.y + displayOriginY;
}

export function enforceEnemyFloorIntegrity(sprite, body, floorBottomY = DEFAULT_FLOOR_BOTTOM_Y) {
  if (!sprite?.active || !body?.enable || !body.allowGravity) {
    return false;
  }

  const penetration = body.bottom - floorBottomY;
  if (penetration <= FLOOR_PENETRATION_EPSILON) {
    return false;
  }

  if (body.velocity.y < UPWARD_CORRECTION_GUARD_VELOCITY) {
    return false;
  }

  body.y -= penetration;
  body.prev.y = body.y;
  body.velocity.y = 0;
  body.blocked.down = true;
  body.touching.down = true;
  body.wasTouching.down = true;
  syncSpriteToBodyY(sprite, body);
  return true;
}
