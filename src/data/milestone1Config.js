import { ASSET_KEYS } from './assetKeys.js';

export const WORLD = {
  width: 2200,
  height: 540,
  floorY: 476,
  gravityY: 1000
};

export const PLAYER = {
  maxHealth: 5,
  moveSpeed: 164,
  moveAcceleration: 2200,
  moveDeceleration: 2600,
  attackMoveSpeedMultiplier: 0.3,
  jumpVelocity: -430,
  body: { width: 30, height: 54, offsetX: 9, offsetY: 4 },
  attackCooldownMs: 520,
  attackStartupMs: 110,
  attackActiveMs: 100,
  attackRecoveryMs: 210,
  invulnMs: 550,
  contactDamage: 1,
  startX: 120,
  startY: 368
};

export const SKITTER = {
  health: 3,
  speed: 56,
  aggroRange: 220,
  contactDamage: 1,
  attackCooldownMs: 1500,
  lungeSpeedBonus: 50,
  lungeJumpVelocity: -165,
  body: { width: 42, height: 26, offsetX: 4, offsetY: 14 },
  patrolDistance: 150,
  awakenPlayerX: 760,
  wakeDelayMs: 700,
  startX: 1160,
  startY: 402
};

export const DIALOGUE = {
  width: 700,
  height: 140,
  textPadding: 18
};

export const CONCEPT_PRESENTATION = {
  // Conservative grounding tuning: presentation-only origins; collision bodies remain authoritative.
  player: {
    crop: { x: 560, y: 170, width: 430, height: 800 },
    display: { width: 126, height: 184 },
    origin: { x: 0.5, y: 0.975 }
  },
  skitter: {
    crop: { x: 510, y: 520, width: 540, height: 360 },
    display: { width: 148, height: 104 },
    origin: { x: 0.5, y: 0.93 }
  },
  sentinel: {
    crop: { x: 520, y: 120, width: 520, height: 860 },
    display: { width: 186, height: 304 },
    origin: { x: 0.5, y: 0.9 },
    alpha: 0.66,
    tint: 0xc2b398
  },
  laughingEngine: {
    crop: { x: 360, y: 140, width: 860, height: 770 },
    display: { width: 620, height: 440 },
    origin: { x: 0.5, y: 0.56 },
    alpha: 1,
    tint: 0xffd8c2
  },
  chamberBackdrop: {
    panelWidth: 840,
    panelHeight: 540,
    panelAlpha: 0.86,
    panelTint: 0xffffff,
    slabAlphaWithConcept: 0.14,
    slabAlphaFallbackOnly: 0.9,
    slabTintWithConcept: 0x3b2e29,
    slabTintFallbackOnly: 0x1f1714,
    anchorXs: [405, 1215, 2025]
  },
  uiFrame: {
    crop: { x: 276, y: 720, width: 984, height: 248 }
  }
};

export const COLORS = {
  backdrop: 0x110d0c,
  architecture: 0x1f1714,
  foreground: 0x2f231e,
  bone: 0xb8aa92,
  rust: 0x64453a,
  oil: 0x0f1313,
  sickly: 0x6f8c59,
  bloodMetal: 0x392926
};

export const CHAMBER_PLATFORM_LAYOUT = [
  { x: 330, y: 360, width: 140, height: 18 },
  { x: 700, y: 330, width: 130, height: 18 },
  { x: 1460, y: 384, width: 200, height: 18 },
  { x: 1840, y: 334, width: 140, height: 18 }
];

export const LORE_ENTRIES = [
  {
    id: 'entry-altar',
    x: 540,
    y: 406,
    width: 70,
    height: 70,
    screenId: 'chamber01-laughing-engine'
  }
];

export const LORE_SCREENS = {
  'chamber01-laughing-engine': {
    imageKey: ASSET_KEYS.laughingEngine,
    title: 'CHAMBER 01 // ALTAR ENGINE',
    body: [
      'The furnace laughs without sound.',
      'Bone gears turn where priests once knelt, and the ash remembers your bloodline.',
      'A seal stirs beneath the chamber floor, waiting for the next offering to breathe.'
    ],
    prompt: 'Press [E] / [Enter] or tap to continue'
  },
  'chamber02-vertebral-memory': {
    imageKey: ASSET_KEYS.laughingEngine,
    title: 'CHAMBER 02 // VERTEBRAL MEMORY',
    body: [
      'The horn-gate does not open: it identifies.',
      'Each rib listens for lineage, then braids your marrow into its register.',
      'Passage is a verdict spoken by architecture, not by priests.'
    ],
    prompt: 'Press [E] / [Enter] or tap to continue',
    presentation: {
      imageTint: 0xc1d5a7,
      imageAlpha: 0.9,
      frameColor: 0x8ea875,
      titleColor: '#a6bf8d'
    }
  }
};
