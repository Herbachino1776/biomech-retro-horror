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

  'chamber02-exit-gate': {
    id: 'chamber02-exit-gate',
    imageKey: ASSET_KEYS.chamber02ExitGateLore,
    title: 'CHAMBER 02 // EXIT TOLL GATE',
    body: [
      'When the toll-keepers split open, the gate remembers a softer cruelty.',
      'Its hinge-flesh parts one vertebra at a time and counts the marrow debt you still carry.',
      'Beyond this sealed mouth, the third chamber waits for a witness willing to be entered first.'
    ],
    prompt: 'Press [E] / [Enter] or tap to continue',
    style: {
      frameColor: 0xb7a383,
      titleColor: '#9bb085',
      bodyColor: '#d4c5af',
      promptColor: '#8a9f79',
      imageTint: 0xd6c0a8,
      imageAlpha: 0.97,
      backgroundColor: '#000000',
      motion: {
        panX: 12,
        panY: -10,
        zoom: 1.035,
        duration: 8800,
        shakeX: 2,
        shakeY: 1,
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
  },

  'chamber03-threshold-omen': {
    id: 'chamber03-threshold-omen',
    imageKey: ASSET_KEYS.chamber03Lore,
    title: 'CHAMBER 03 // THRESHOLD OF ENTRY',
    body: [
      'The threshold peels open before the dais and recites the names of those who entered as offerings.',
      'Choir-hollows sway inside the seam, each one waiting for the Precentor to split your silhouette into praise.',
      'Step closer and the third chamber stops being architecture. It becomes a mouth rehearsing your surrender.'
    ],
    prompt: 'Press [E] / [Enter] or tap to continue',
    style: {
      frameColor: 0xc1af92,
      titleColor: '#a9bb91',
      bodyColor: '#d9ccb8',
      promptColor: '#8fa574',
      imageTint: 0xd7c1aa,
      imageAlpha: 0.97,
      backgroundColor: '#000000',
      motion: {
        panX: 14,
        panY: -8,
        zoom: 1.04,
        duration: 9000,
        shakeX: 3,
        shakeY: 2,
        shakeDuration: 3600
      }
    }
  }
};
