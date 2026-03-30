import { PressureDeacon } from './PressureDeacon.js';
import { ASSET_KEYS } from '../data/assetKeys.js';

export class MisassignedSeraph extends PressureDeacon {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, {
      ...config,
      name: config.name ?? 'THE MISASSIGNED SERAPH',
      subtitle: config.subtitle ?? 'House Terminal Adjudicator',
      textureKey: config.textureKey ?? ASSET_KEYS.sector03Chamber02BossMisassignedSeraph
    });
  }
}
