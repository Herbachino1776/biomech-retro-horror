import { ASSET_KEYS } from './assetKeys.js';

export const LORE_CUTSCENES = {
  'chamber02-horn-arch': {
    id: 'chamber02-horn-arch',
    imageKey: ASSET_KEYS.chamber02VertebralHornGate,
    title: 'CHAMBER 02 // VERTEBRAL HORN ARCH',
    body: [
      'The arch bends inward like a throat learning your shape.',
      'Ivory spines drink the chamber heat and recite your marrow to the dark.',
      'Beyond the horned ribs, the next seal waits for a name carved in living metal.'
    ],
    prompt: 'Press [E] / [Enter] or tap to continue',
    style: {
      frameColor: 0xb8aa92,
      titleColor: '#9bb085',
      bodyColor: '#d2c2ac',
      promptColor: '#8a9f79',
      imageTint: 0xd4b9a5,
      imageAlpha: 0.94,
      backgroundColor: '#000000'
    }
  }
};
