import { HalfSkullMiniboss } from './HalfSkullMiniboss.js';
import { ASSET_KEYS } from '../data/assetKeys.js';

export class AbyssalArchon extends HalfSkullMiniboss {
  constructor(scene, x, y, config) {
    super(scene, x, y, {
      ...config,
      textureKey: config.textureKey ?? ASSET_KEYS.sector02Chamber01AbyssalArchon
    });
  }
}
