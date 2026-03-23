import { AbyssalArchon } from './AbyssalArchon.js';
import { ASSET_KEYS } from '../data/assetKeys.js';

export class PressureDeacon extends AbyssalArchon {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, {
      ...config,
      textureKey: config.textureKey ?? ASSET_KEYS.sector02Chamber02PressureDeacon
    });
  }
}
