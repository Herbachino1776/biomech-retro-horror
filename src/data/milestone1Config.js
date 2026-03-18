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
  speed: 48,
  aggroRange: 220,
  contactDamage: 1,
  attackCooldownMs: 2200,
  windupMs: 520,
  attackActiveMs: 240,
  attackRecoveryMs: 420,
  hurtLockMs: 260,
  hesitationMs: 340,
  attackTriggerRange: 118,
  attackRange: 132,
  preferredRange: 94,
  rangeBand: 26,
  lungeSpeedBonus: 62,
  lungeJumpVelocity: -130,
  recoilVelocityX: 170,
  recoilVelocityY: -110,
  body: { width: 42, height: 26, offsetX: 4, offsetY: 14 },
  patrolDistance: 150,
  awakenPlayerX: 760,
  wakeDelayMs: 700,
  startX: 1160,
  startY: 402
};


export const SKITTER_VARIANTS = {
  tollKeeper: {
    variantName: 'TOLL-KEEPER SKITTER',
    health: 4,
    speed: 42,
    attackCooldownMs: 2700,
    windupMs: 760,
    attackActiveMs: 280,
    attackRecoveryMs: 560,
    hesitationMs: 520,
    attackTriggerRange: 146,
    attackRange: 176,
    preferredRange: 124,
    rangeBand: 22,
    lungeSpeedBonus: 98,
    lungeJumpVelocity: -96,
    patrolDistance: 104,
    presentation: {
      alpha: 0.84,
      scaleX: 1.08,
      scaleY: 1.05,
      tint: 0xbda786
    },
    rangeTellColor: 0xd7c486,
    rangeTellAlphaBase: 0.12,
    rangeTellAlphaGain: 0.2,
    rangeTellStrokeColor: 0xe3d39f,
    rangeTellStrokeAlphaBase: 0.2,
    rangeTellStrokeAlphaGain: 0.24,
    eyeGlowColor: 0xc6db8c,
    eyeGlowWidth: 30,
    eyeGlowHeight: 14,
    eyeGlowOffsetX: 20,
    eyeGlowYOffset: 20,
    eyeGlowAlphaBase: 0.18,
    eyeGlowWindupAlphaGain: 0.28
  }
};

export const DIALOGUE = {
  width: 700,
  height: 140,
  textPadding: 18
};

export const CONCEPT_PRESENTATION = {
  // Conservative grounding tuning: presentation-only origins; collision bodies remain authoritative.
  // `normalization` provides reusable target-height grounding rules for future sprite swaps.
  player: {
    crop: { x: 60, y: 14, width: 888, height: 1460 },
    display: { width: 196, height: 322 },
    origin: { x: 0.5, y: 0.985 },
    normalization: {
      targetDisplayHeight: 252,
      origin: { x: 0.5, y: 0.965 },
      yOffset: -10
    },
    alpha: 0.94
  },
  skitter: {
    crop: { x: 40, y: 340, width: 930, height: 840 },
    display: { width: 158, height: 142 },
    origin: { x: 0.5, y: 0.91 },
    alpha: 0.92
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
  },
  {
    id: 'end-deadgod',
    x: 1940,
    y: 428,
    width: 92,
    height: 82,
    cutsceneId: 'chamber01-deadgod-witness'
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
    prompt: 'Press [E] / [Enter] or tap to continue',
    presentation: {
      imageCrop: {
        x: CONCEPT_PRESENTATION.laughingEngine.crop.x,
        y: CONCEPT_PRESENTATION.laughingEngine.crop.y,
        width: CONCEPT_PRESENTATION.laughingEngine.crop.width,
        height: CONCEPT_PRESENTATION.laughingEngine.crop.height
      }
    }
  }
};

export const CHAMBER01_MINIBOSS = {
  name: 'THE HALF-SKULL ASCENDANT',
  subtitle: 'Laughing Engine Warden',
  health: 15,
  contactDamage: 1,
  contactDamageCooldownMs: 1200,
  attackCooldownMs: 3950,
  attackTelegraphMs: 760,
  attackRecoveryMs: 620,
  attackRange: 210,
  approachRange: 340,
  approachSpeed: 34,
  idleAdvanceSpeed: 12,
  windupDriftSpeed: 10,
  attackSpeed: 174,
  attackLiftVelocity: -150,
  hitPulseMs: 280,
  hurtRecoverMs: 220,
  hurtRecoilVelocityX: 92,
  hurtRecoilVelocityY: -48,
  spawnX: 2060,
  spawnY: 468,
  arenaStartX: 1720,
  body: { width: 86, height: 126, offsetX: 118, offsetY: 146 },
  presentation: {
    display: { width: 338, height: 338 },
    origin: { x: 0.56, y: 0.99 },
    alpha: 1,
    tint: 0xd0bea6,
    scaleX: 1,
    scaleY: 1
  }
};
