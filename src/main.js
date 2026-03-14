import Phaser from 'phaser';
import { gameConfig } from './data/gameConfig.js';
import { BootScene } from './scenes/BootScene.js';

const config = {
  ...gameConfig,
  scene: [BootScene]
};

new Phaser.Game(config);
