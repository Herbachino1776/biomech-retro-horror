import Phaser from 'phaser';

const DEFAULTS = {
  desktopLookAheadX: 56,
  portraitLookAheadX: 24,
  lerpFactor: 0.14,
  movementThreshold: 16
};

export class DirectionalCameraBias {
  constructor({ camera, player, desktopBaseOffsetX, portraitBaseOffsetX, desktopLookAheadX, portraitLookAheadX, lerpFactor, movementThreshold }) {
    this.camera = camera;
    this.player = player;
    this.desktopBaseOffsetX = desktopBaseOffsetX;
    this.portraitBaseOffsetX = portraitBaseOffsetX;
    this.desktopLookAheadX = desktopLookAheadX ?? DEFAULTS.desktopLookAheadX;
    this.portraitLookAheadX = portraitLookAheadX ?? DEFAULTS.portraitLookAheadX;
    this.lerpFactor = lerpFactor ?? DEFAULTS.lerpFactor;
    this.movementThreshold = movementThreshold ?? DEFAULTS.movementThreshold;

    this.isPortrait = false;
    this.followOffsetY = 0;
    this.lastDirection = player?.facing === -1 ? -1 : 1;
    this.currentOffsetX = desktopBaseOffsetX;
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
    if (Math.abs(velocityX) >= this.movementThreshold) {
      this.lastDirection = Math.sign(velocityX) || this.lastDirection;
    } else if (this.player.facing === -1 || this.player.facing === 1) {
      this.lastDirection = this.player.facing;
    }

    const targetOffsetX = this.getTargetOffsetX();
    this.currentOffsetX = Phaser.Math.Linear(this.currentOffsetX, targetOffsetX, this.lerpFactor);
    this.camera.setFollowOffset(this.currentOffsetX, this.followOffsetY);
  }

  getTargetOffsetX() {
    const baseOffset = this.isPortrait ? this.portraitBaseOffsetX : this.desktopBaseOffsetX;
    const lookAhead = this.isPortrait ? this.portraitLookAheadX : this.desktopLookAheadX;
    return baseOffset - this.lastDirection * lookAhead;
  }

  getFollowOffsetX() {
    return this.currentOffsetX;
  }
}

export function createDirectionalCameraBias(config) {
  return new DirectionalCameraBias(config);
}
