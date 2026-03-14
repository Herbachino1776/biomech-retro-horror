import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#110d0c');

    this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 42, 'BIOMECH RETRO HORROR', {
        fontFamily: 'monospace',
        fontSize: '32px',
        color: '#d4c8ba',
        align: 'center'
      })
      .setOrigin(0.5);

    this.add
      .text(this.scale.width / 2, this.scale.height / 2 + 2, 'CHAMBER 01 // GRAYBOX SLICE', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#8f7d72',
        align: 'center'
      })
      .setOrigin(0.5);

    this.add
      .text(this.scale.width / 2, this.scale.height / 2 + 48, 'Move: Arrow Keys\nAttack: X\nLore: E\nRestart after death: R\n\nPress Enter', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#8a9f79',
        align: 'center'
      })
      .setOrigin(0.5);

    const enter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    enter.once('down', () => {
      this.scene.start('Chamber01Scene');
    });
  }
}
