import Phaser from 'phaser';

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a1412',
  pixelArt: true,
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
// Keep direct-scene boot opt-in and string-based so config evaluation never
// depends on importing scene classes inside this shared data module.
// Set to 'Chamber03Scene' temporarily when you want BootScene to jump straight
// into the Chamber 03 bootstrap for local testing.
export const BOOT_SCENE_OVERRIDE = null;
