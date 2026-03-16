import Phaser from 'phaser';
import { gameConfig } from './data/gameConfig.js';
import { BootScene } from './scenes/BootScene.js';
import { Chamber01Scene } from './scenes/Chamber01Scene.js';
import { LoreScreenScene } from './scenes/LoreScreenScene.js';
import { Chamber02Scene } from './scenes/Chamber02Scene.js';

const config = {
  ...gameConfig,
  scene: [BootScene, Chamber01Scene, LoreScreenScene, Chamber02Scene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  }
};

const game = new Phaser.Game(config);

if (typeof window !== 'undefined') {
  window.__BIOMECH_GAME__ = game;
}
