import Phaser from 'phaser';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { COLORS, WORLD } from '../data/milestone1Config.js';

export class Chamber02Scene extends Phaser.Scene {
  constructor() {
    super('Chamber02Scene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#070707');
    this.cameras.main.fadeIn(700, 0, 0, 0);

    this.add
      .rectangle(WORLD.width / 2, WORLD.height / 2, WORLD.width, WORLD.height, COLORS.backdrop, 1)
      .setOrigin(0.5)
      .setDepth(-12);

    if (this.textures.exists(ASSET_KEYS.chamber02BackgroundPlate)) {
      this.add
        .image(WORLD.width / 2, 218, ASSET_KEYS.chamber02BackgroundPlate)
        .setDisplaySize(WORLD.width, 390)
        .setTint(0xc8baa3)
        .setAlpha(0.68)
        .setDepth(-11);
    }

    if (this.textures.exists(ASSET_KEYS.chamber02FloorStrip)) {
      this.add
        .tileSprite(WORLD.width / 2, WORLD.floorY + 4, WORLD.width, 110, ASSET_KEYS.chamber02FloorStrip)
        .setTint(0xd8cab4)
        .setAlpha(0.84)
        .setDepth(-9);
    } else {
      this.add
        .rectangle(WORLD.width / 2, WORLD.floorY + 28, WORLD.width, 72, COLORS.foreground, 0.9)
        .setOrigin(0.5)
        .setDepth(-9);
    }

    if (this.textures.exists(ASSET_KEYS.chamber02VertebralHornGate)) {
      this.add
        .image(WORLD.width / 2, 270, ASSET_KEYS.chamber02VertebralHornGate)
        .setDisplaySize(370, 440)
        .setCrop(194, 166, 640, 1140)
        .setTint(0xd4c5af)
        .setAlpha(0.82)
        .setDepth(-7);
    }

    this.add.ellipse(WORLD.width / 2, 404, 420, 92, COLORS.sickly, 0.18).setDepth(-6);

    this.add
      .text(WORLD.width / 2, 82, 'CHAMBER 02 // VERTEBRAL THRESHOLD', {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#d2c2ac',
        align: 'center'
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.add
      .text(WORLD.width / 2, 122, 'The gate remembered your marrow and opened without witness.', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#8a9f79',
        align: 'center'
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
  }
}
