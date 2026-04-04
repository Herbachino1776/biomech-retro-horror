import Phaser from 'phaser';

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  // Portrait mobile reserves a bottom controls band via camera viewport.
  // Keep renderer clear color neutral-dark so no brown strip appears behind controls.
  backgroundColor: '#070505',
  pixelArt: true,
  antialias: false,
  antialiasGL: false,
  roundPixels: true,
  render: {
    pixelArt: true,
    antialias: false,
    antialiasGL: false,
    roundPixels: true,
    mipmapFilter: 'NEAREST'
  },
  input: {
    activePointers: 3,
    touch: {
      capture: true
    }
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};
