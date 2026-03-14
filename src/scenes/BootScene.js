import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    const titleStyle = {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#d4c8ba',
      align: 'center'
    };

    const subtitleStyle = {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#8f7d72',
      align: 'center'
    };

    this.cameras.main.setBackgroundColor('#1a1412');

    this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 22, 'BIOMECH RETRO HORROR', titleStyle)
      .setOrigin(0.5);

    this.add
      .text(this.scale.width / 2, this.scale.height / 2 + 16, 'Milestone 0 scaffold online', subtitleStyle)
      .setOrigin(0.5);
  }
}
