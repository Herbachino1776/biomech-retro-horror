import Phaser from 'phaser';
import { gameConfig } from './data/gameConfig.js';
import { BootScene } from './scenes/BootScene.js';
import { Chamber01Scene } from './scenes/Chamber01Scene.js';

const config = {
  ...gameConfig,
  scene: [BootScene, Chamber01Scene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  }
};

new Phaser.Game(config);
