import Phaser from 'phaser';

const DEFAULTS = {
  desktopLookAheadX: 56,
  portraitLookAheadX: 24,
  lookAheadBoostMultiplier: 1.75,
  lerpFactor: 0.14,
  directionLerpFactor: 0.16,
  movementThresholdEnter: 26,
  movementThresholdExit: 14,
  idleSettleDelayMs: 260
};

export class DirectionalCameraBias {
  constructor({
    camera,
    player,
    desktopBaseOffsetX,
    portraitBaseOffsetX,
    desktopLookAheadX,
    portraitLookAheadX,
    lookAheadBoostMultiplier,
    lerpFactor,
    directionLerpFactor,
    movementThreshold,
    movementThresholdEnter,
    movementThresholdExit,
    idleSettleDelayMs
  }) {
    this.camera = camera;
    this.player = player;
    this.desktopBaseOffsetX = desktopBaseOffsetX;
    this.portraitBaseOffsetX = portraitBaseOffsetX;

    const resolvedBoostMultiplier = lookAheadBoostMultiplier ?? DEFAULTS.lookAheadBoostMultiplier;
    this.desktopLookAheadX = (desktopLookAheadX ?? DEFAULTS.desktopLookAheadX) * resolvedBoostMultiplier;
    this.portraitLookAheadX = (portraitLookAheadX ?? DEFAULTS.portraitLookAheadX) * resolvedBoostMultiplier;

    this.lerpFactor = lerpFactor ?? DEFAULTS.lerpFactor;
    this.directionLerpFactor = directionLerpFactor ?? DEFAULTS.directionLerpFactor;

    const legacyMovementThreshold = movementThreshold ?? null;
    this.movementThresholdEnter = movementThresholdEnter ?? legacyMovementThreshold ?? DEFAULTS.movementThresholdEnter;
    this.movementThresholdExit = movementThresholdExit ?? Math.min(this.movementThresholdEnter, DEFAULTS.movementThresholdExit);
    this.idleSettleDelayMs = idleSettleDelayMs ?? DEFAULTS.idleSettleDelayMs;

    this.isPortrait = false;
    this.followOffsetY = 0;
    this.lastMovementDirection = player?.facing === -1 ? -1 : 1;
    this.smoothedDirection = this.lastMovementDirection;
    this.currentOffsetX = desktopBaseOffsetX;
    this.isTravelingHorizontally = false;
    this.stationaryTimeMs = 0;
  }

  setLayout({ isPortrait, followOffsetY }) {
    this.isPortrait = !!isPortrait;
    this.followOffsetY = followOffsetY;
    this.currentOffsetX = Phaser.Math.Linear(this.currentOffsetX, this.getTargetOffsetX(), 0.55);
    this.camera.setFollowOffset(this.currentOffsetX, this.followOffsetY);
  }

  update() {
    if (!this.camera || !this.player?.sprite) {
      return;
    }

    if (this.camera._follow !== this.player.sprite) {
      return;
    }

    const velocityX = this.player.body?.velocity?.x ?? 0;
    const speedX = Math.abs(velocityX);

    if (this.isTravelingHorizontally) {
      if (speedX <= this.movementThresholdExit) {
        this.isTravelingHorizontally = false;
      }
    } else if (speedX >= this.movementThresholdEnter) {
      this.isTravelingHorizontally = true;
    }

    if (this.isTravelingHorizontally) {
      const resolvedDirection = Math.sign(velocityX);
      if (resolvedDirection !== 0) {
        this.lastMovementDirection = resolvedDirection;
      }
      this.stationaryTimeMs = 0;
    } else {
      const deltaMs = this.player?.scene?.game?.loop?.delta ?? 16.67;
      this.stationaryTimeMs += deltaMs;
    }

    const desiredDirection = this.stationaryTimeMs > this.idleSettleDelayMs
      ? 0
      : this.lastMovementDirection;

    this.smoothedDirection = Phaser.Math.Linear(this.smoothedDirection, desiredDirection, this.directionLerpFactor);

    const targetOffsetX = this.getTargetOffsetX();
    this.currentOffsetX = Phaser.Math.Linear(this.currentOffsetX, targetOffsetX, this.lerpFactor);
    this.camera.setFollowOffset(this.currentOffsetX, this.followOffsetY);
  }

  getTargetOffsetX() {
    const baseOffset = this.isPortrait ? this.portraitBaseOffsetX : this.desktopBaseOffsetX;
    const lookAhead = this.isPortrait ? this.portraitLookAheadX : this.desktopLookAheadX;
    return baseOffset - this.smoothedDirection * lookAhead;
  }

  getFollowOffsetX() {
    return this.currentOffsetX;
  }
}

export function createDirectionalCameraBias(config) {
  return new DirectionalCameraBias(config);
}
