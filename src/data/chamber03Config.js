import { ASSET_KEYS } from './assetKeys.js';
import { COLORS, PLAYER, SKITTER, WORLD } from './milestone1Config.js';

export const CHAMBER03_WORLD_WIDTH = 6580;

export const CHAMBER03_RESCUE_FLAGS = {
  bootMode: 'minimal',
  directBootEnabled: true,
  enableBackdropSequence: false,
  enableEncounters: false,
  enableThresholdLore: false,
  enableBoss: false,
  enableAmbient: false
};

export const CHAMBER03_RESCUE_BOOT = {
  spawnX: 220,
  spawnY: WORLD.floorY - 72,
  visibleFloorHeight: 96,
  backdrop: {
    width: 940,
    height: 380,
    x: 470,
    y: 218
  },
  fallbackPlate: {
    width: 940,
    height: 380,
    fill: 0x1b1412,
    fillAlpha: 0.96,
    stroke: 0xb8aa92,
    strokeAlpha: 0.4,
    ribWidth: 420,
    ribHeight: 88,
    ribAlpha: 0.16,
    glowWidth: 520,
    glowHeight: 46,
    glowAlpha: 0.18
  }
};

export function isChamber03MinimalBootMode() {
  return CHAMBER03_RESCUE_FLAGS.bootMode === 'minimal';
}

export function isChamber03FeatureEnabled(flagName) {
  if (isChamber03MinimalBootMode()) {
    return Boolean(CHAMBER03_RESCUE_FLAGS[flagName]);
  }

  return true;
}

export const CHAMBER03_SEGMENTS = [
  { key: ASSET_KEYS.chamber03EntryNave, width: 940, tint: 0xd7c7b3, alpha: 0.84, y: 218, height: 380 },
  { key: ASSET_KEYS.chamber03WallModule, width: 760, tint: 0xc9b69b, alpha: 0.54, y: 220, height: 356 },
  { key: ASSET_KEYS.chamber03WallModule, width: 760, tint: 0xbead95, alpha: 0.52, y: 220, height: 356 },
  { key: ASSET_KEYS.chamber03ChoirOpening, width: 920, tint: 0xd5c2a5, alpha: 0.82, y: 216, height: 380 },
  { key: ASSET_KEYS.chamber03WallModule, width: 760, tint: 0xc1af95, alpha: 0.52, y: 220, height: 356 },
  { key: ASSET_KEYS.chamber03Threshold, width: 880, tint: 0xd9c8ae, alpha: 0.86, y: 216, height: 382 },
  { key: ASSET_KEYS.chamber03BossDais, width: 1040, tint: 0xdbcbb6, alpha: 0.94, y: 214, height: 402 }
];

const marginX = 120;
let runningX = marginX;
export const CHAMBER03_SEGMENT_LAYOUT = CHAMBER03_SEGMENTS.map((segment, index) => {
  const startX = runningX;
  const centerX = startX + segment.width / 2;
  const layout = { ...segment, index, startX, centerX, endX: startX + segment.width };
  runningX += segment.width;
  return layout;
});

export const CHAMBER03_ENCOUNTERS = [
  {
    id: 'nave-vanguard',
    wakePlayerX: 520,
    enemies: [
      { kind: 'skitter', x: 960, y: 404, awakenPlayerX: 540, wakeDelayMs: 0 },
      { kind: 'skitter', x: 1280, y: 404, awakenPlayerX: 700, wakeDelayMs: 260 }
    ]
  },
  {
    id: 'wall-gauntlet',
    wakePlayerX: 1740,
    enemies: [
      { kind: 'skitter', x: 2030, y: 404, awakenPlayerX: 1760, wakeDelayMs: 0 },
      { kind: 'skitter', x: 2380, y: 404, awakenPlayerX: 1960, wakeDelayMs: 220 },
      { kind: 'elite', x: 2740, y: 404, awakenPlayerX: 2140, wakeDelayMs: 380 }
    ]
  },
  {
    id: 'choir-pocket',
    wakePlayerX: 3190,
    enemies: [
      { kind: 'skitter', x: 3460, y: 404, awakenPlayerX: 3200, wakeDelayMs: 0 },
      { kind: 'elite', x: 3760, y: 404, awakenPlayerX: 3340, wakeDelayMs: 260 }
    ]
  },
  {
    id: 'threshold-watch',
    wakePlayerX: 4340,
    enemies: [
      { kind: 'skitter', x: 4550, y: 404, awakenPlayerX: 4380, wakeDelayMs: 0 },
      { kind: 'skitter', x: 4850, y: 404, awakenPlayerX: 4460, wakeDelayMs: 160 },
      { kind: 'elite', x: 5180, y: 404, awakenPlayerX: 4580, wakeDelayMs: 340 }
    ]
  }
];

export const CHAMBER03_THRESHOLD_LORE = {
  id: 'chamber03-threshold-omen',
  x: 5250,
  y: 404,
  width: 196,
  height: 176,
  cutsceneId: 'chamber03-threshold-omen'
};

export const CHAMBER03_BOSS = {
  name: 'THE PRECENTOR OF ENTRY',
  subtitle: 'Choir of the Opened Dais',
  textureKey: ASSET_KEYS.chamber03PrecentorBoss,
  health: 28,
  maxHealth: 28,
  contactDamage: 2,
  contactDamageCooldownMs: 880,
  approachRange: 410,
  approachSpeed: 58,
  idleAdvanceSpeed: 20,
  attackRange: 244,
  attackCooldownMs: 2650,
  attackTelegraphMs: 980,
  attackRecoveryMs: 760,
  windupDriftSpeed: 12,
  attackSpeed: 240,
  attackLiftVelocity: -132,
  hitPulseMs: 320,
  hurtRecoverMs: 260,
  hurtRecoilVelocityX: 112,
  hurtRecoilVelocityY: -68,
  arenaStartX: 5580,
  arenaLockX: 5440,
  spawnX: 6200,
  spawnY: 472,
  body: { width: 120, height: 154, offsetX: 132, offsetY: 138 },
  presentation: {
    display: { width: 420, height: 362 },
    origin: { x: 0.58, y: 0.985 },
    alpha: 1,
    tint: 0xd8c5ab,
    scaleX: 1,
    scaleY: 1
  },
  audioProfile: 'miniboss'
};

export const CHAMBER03_BOSS_ARENA = {
  barrierX: 5460,
  barrierWidth: 64,
  barrierHeight: 264,
  text: 'SECTOR 01 EXCISED',
  subtitle: 'THE THIRD CHAMBER FALLS QUIET.'
};

export const CHAMBER03_ELITE_CONFIG = {
  ...SKITTER,
  textureKey: ASSET_KEYS.chamber02TollKeeperSkitter,
  variantName: 'CHOIR WARDEN',
  health: 9,
  speed: 54,
  attackCooldownMs: 2850,
  windupMs: 760,
  attackActiveMs: 320,
  attackRecoveryMs: 640,
  hesitationMs: 540,
  attackTriggerRange: 170,
  attackRange: 200,
  preferredRange: 140,
  rangeBand: 22,
  lungeSpeedBonus: 118,
  lungeJumpVelocity: -110,
  recoilVelocityX: 172,
  recoilVelocityY: -90,
  patrolDistance: 84,
  body: { width: 72, height: 44, offsetX: 32, offsetY: 94 },
  presentation: {
    alpha: 1,
    display: { width: 290, height: 222 },
    origin: { x: 0.52, y: 0.965 },
    stateAlpha: { windup: 1, attack: 1, hurt: 1, dead: 0.48 }
  },
  rangeTellColor: 0xe7d49a,
  rangeTellAlphaBase: 0.28,
  rangeTellAlphaGain: 0.38,
  rangeTellStrokeColor: 0xfff1bd,
  rangeTellStrokeAlphaBase: 0.42,
  rangeTellStrokeAlphaGain: 0.28,
  eyeGlowColor: 0xe5f0b0,
  eyeGlowWidth: 42,
  eyeGlowHeight: 20,
  eyeGlowOffsetX: 24,
  eyeGlowYOffset: 18,
  eyeGlowAlphaBase: 0.38,
  eyeGlowWindupAlphaGain: 0.42,
  audioProfile: 'tollkeeper'
};

export const CHAMBER03_SKITTER_CONFIG = {
  ...SKITTER,
  awakenPlayerX: undefined,
  wakeDelayMs: 0
};

export const CHAMBER03_RUNTIME = {
  world: WORLD,
  player: PLAYER,
  colors: COLORS
};
