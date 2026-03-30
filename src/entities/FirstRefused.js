import { PressureDeacon } from './PressureDeacon.js';
import { ASSET_KEYS } from '../data/assetKeys.js';

export class FirstRefused extends PressureDeacon {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, {
      ...config,
      name: config.name ?? 'THE FIRST REFUSED',
      subtitle: config.subtitle ?? 'Gate Primarch of Nonentry',
      textureKey: config.textureKey ?? ASSET_KEYS.sector03Chamber03BossFirstRefused
    });
  }
}
