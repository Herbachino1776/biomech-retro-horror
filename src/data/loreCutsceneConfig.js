import { ASSET_KEYS } from './assetKeys.js';

export const LORE_CUTSCENES = {
  'chamber01-deadgod-witness': {
    id: 'chamber01-deadgod-witness',
    imageKey: ASSET_KEYS.chamber01DeadgodCutscene,
    title: 'CHAMBER 01 // DEAD GOD WITNESS',
    body: [
      'At the chamber lip, a dead god sags inside the wall and still remembers hunger.',
      'Its split crown twitches through the mortar, counting the breaths you stole from the altar.',
      'What wakes below does not guard this place. It kneels here to inherit the corpse.'
    ],
    prompt: 'Press [E] / [Enter] or tap to continue',
    style: {
      frameColor: 0xb7a88f,
      titleColor: '#a5b48b',
      bodyColor: '#d4c5af',
      promptColor: '#8a9f79',
      imageTint: 0xd9c0ac,
      imageAlpha: 0.95,
      backgroundColor: '#000000',
      motion: {
        panX: 18,
        panY: -12,
        zoom: 1.045,
        duration: 9200,
        shakeX: 4,
        shakeY: 3,
        shakeDuration: 3600
      }
    }
  },
  'chamber03-precentor-threshold': {
    id: 'chamber03-precentor-threshold',
    imageKey: ASSET_KEYS.chamber03Lore01,
    title: 'CHAMBER 03 // THRESHOLD OF THE PRECENTOR',
    body: [
      'The threshold opens like a choir wound and exhales a patient verdict.',
      'Behind the veil, the Precentor braids your name into the rusted liturgy.',
      'When the black returns to bone, the dais will no longer be empty.'
    ],
    prompt: 'Press [E] / [Enter] or tap to continue',
    style: {
      frameColor: 0xbba991,
      titleColor: '#9eb183',
      bodyColor: '#d2c2ac',
      promptColor: '#8aa074',
      imageTint: 0xd7c0ab,
      imageAlpha: 0.95,
      backgroundColor: '#000000',
      motion: {
        panX: 16,
        panY: -10,
        zoom: 1.04,
        duration: 8600,
        shakeX: 3,
        shakeY: 2,
        shakeDuration: 3400
      }
    }
  },
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
