export const WORLD = {
  width: 2200,
  height: 540,
  floorY: 470,
  gravityY: 1000
};

export const PLAYER = {
  maxHealth: 5,
  moveSpeed: 190,
  jumpVelocity: -430,
  body: { width: 30, height: 54, offsetX: 9, offsetY: 6 },
  attackCooldownMs: 400,
  attackDurationMs: 130,
  invulnMs: 550,
  contactDamage: 1,
  startX: 120,
  startY: 390
};

export const SKITTER = {
  health: 3,
  speed: 72,
  aggroRange: 240,
  contactDamage: 1,
  attackCooldownMs: 1000,
  body: { width: 40, height: 24, offsetX: 4, offsetY: 12 },
  patrolDistance: 120,
  startX: 980,
  startY: 430
};

export const DIALOGUE = {
  width: 700,
  height: 140,
  textPadding: 18
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
  { x: 340, y: 360, width: 140, height: 18 },
  { x: 600, y: 322, width: 130, height: 18 },
  { x: 1360, y: 388, width: 200, height: 18 },
  { x: 1750, y: 330, width: 140, height: 18 }
];

export const LORE_ENTRIES = [
  {
    id: 'entry-altar',
    x: 460,
    y: 410,
    width: 70,
    height: 70,
    text: 'The altar exhales through ribbed vents. It remembers every trespass and names none forgiven.'
  }
];
