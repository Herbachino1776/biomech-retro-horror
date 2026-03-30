import Phaser from 'phaser';

const PRETITLE_STYLE = {
  backgroundColor: 0x080606,
  panelColor: 0x0f0c0c,
  panelStroke: 0x8c786b,
  textColor: '#d9c9b2',
  textShadow: '#100c0a'
};

const PRETITLE_TRANSITION = {
  fadeOutMs: 140
};

export class PreTitleScene extends Phaser.Scene {
  constructor() {
    super('PreTitleScene');
    this.hasAdvanced = false;
    this.layoutElements = {};
  }

  create() {
    this.hasAdvanced = false;
    this.cameras.main.setBackgroundColor(PRETITLE_STYLE.backgroundColor);
    this.createLayout();
    this.layout();

    this.scale.on('resize', this.layout, this);
    this.input.once('pointerdown', () => this.advanceToTitle());

    this.keyEnter = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keySpace = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyEnter?.on('down', () => this.advanceToTitle());
    this.keySpace?.on('down', () => this.advanceToTitle());

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.layout, this);
      this.keyEnter?.off('down');
      this.keySpace?.off('down');
    });
  }

  createLayout() {
    this.layoutElements.backdrop = this.add.rectangle(0, 0, 1, 1, PRETITLE_STYLE.backgroundColor, 1).setOrigin(0).setDepth(0);
    this.layoutElements.veil = this.add.rectangle(0, 0, 1, 1, 0x0a0807, 0.66).setOrigin(0).setDepth(1);
    this.layoutElements.panel = this.add.rectangle(0, 0, 1, 1, PRETITLE_STYLE.panelColor, 0.78).setDepth(2);
    this.layoutElements.panel.setStrokeStyle(2, PRETITLE_STYLE.panelStroke, 0.92);
    this.layoutElements.prompt = this.add
      .text(0, 0, 'Tap to Begin', {
        fontFamily: 'monospace',
        fontSize: '42px',
        color: PRETITLE_STYLE.textColor,
        stroke: PRETITLE_STYLE.textShadow,
        strokeThickness: 6,
        align: 'center'
      })
      .setOrigin(0.5)
      .setDepth(3);
  }

  layout() {
    const width = this.scale.width;
    const height = this.scale.height;
    const isPortrait = height >= width;
    const panelWidth = Math.min(width - 32, isPortrait ? 360 : 520);
    const panelHeight = isPortrait ? 140 : 156;
    const centerX = width / 2;
    const centerY = height / 2;

    this.layoutElements.backdrop.setSize(width, height);
    this.layoutElements.veil.setSize(width, height);
    this.layoutElements.panel.setPosition(centerX, centerY).setSize(panelWidth, panelHeight);
    this.layoutElements.prompt
      .setPosition(centerX, centerY)
      .setFontSize(isPortrait ? '36px' : '42px');
  }

  async advanceToTitle() {
    if (this.hasAdvanced) {
      return;
    }
    this.hasAdvanced = true;

    if (this.sound?.context?.state === 'suspended') {
      try {
        await this.sound.context.resume();
      } catch {
        // Audio unlock attempt should never block pre-title handoff.
      }
    }

    this.cameras.main.fadeOut(PRETITLE_TRANSITION.fadeOutMs, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('BootScene', { skipPreTitle: true });
    });
  }
}
