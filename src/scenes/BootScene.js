import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.image('chamberConceptBg', 'assets/concepts/chamber01-background-01.png');
    this.load.image('playerConceptSprite', 'assets/concepts/player-concept-01.png');
    this.load.image('skitterConceptSprite', 'assets/concepts/skitter-concept-01.png');
    this.load.image('sentinelConceptSprite', 'assets/concepts/sentinel-concept-01.png');
    this.load.image('laughingEngineConceptSprite', 'assets/concepts/laughing-engine-concept-01.png');
    this.load.image('uiBiomechFrame', 'assets/ui/biomech-ui-frame-01.png');
  }

  create() {
    this.cameras.main.setBackgroundColor('#110d0c');

    if (this.textures.exists('chamberConceptBg')) {
      this.add
        .image(this.scale.width / 2, this.scale.height / 2, 'chamberConceptBg')
        .setDisplaySize(this.scale.width, this.scale.height)
        .setAlpha(0.2);
    }

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
