import Phaser from 'phaser';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { COLORS, CONCEPT_PRESENTATION, LORE_SCREENS } from '../data/milestone1Config.js';

const LORE_DEPTH = {
  backdrop: 2,
  image: 4,
  frame: 5,
  text: 6,
  prompt: 7
};

const LORE_LAYOUT = {
  portrait: {
    imageWidthRatio: 0.94,
    imageHeightRatio: 0.6,
    imageYOffset: -32,
    shadeHeight: 188,
    titleFontSize: '16px',
    bodyFontSize: '16px',
    bodyLineSpacing: 6,
    promptBottomPadding: 26,
    textInsetX: 20,
    titleRatioY: 0.13,
    bodyRatioY: 0.2
  },
  landscape: {
    imageWidthRatio: 0.88,
    imageHeightRatio: 0.72,
    imageYOffset: -20,
    shadeHeight: 170,
    titleFontSize: '17px',
    bodyFontSize: '19px',
    bodyLineSpacing: 8,
    promptBottomPadding: 34,
    textInsetX: 26,
    titleRatioY: 0.09,
    bodyRatioY: 0.16
  }
};

export class LoreScreenScene extends Phaser.Scene {
  constructor() {
    super('LoreScreenScene');
  }

  create(data) {
    this.returnSceneKey = data?.returnSceneKey ?? 'Chamber01Scene';
    this.screenId = data?.screenId ?? null;
    this.screenConfig = LORE_SCREENS[this.screenId] ?? null;
    this.isClosing = false;

    this.cameras.main.setBackgroundColor('#000000');

    this.backdrop = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 1).setOrigin(0).setDepth(LORE_DEPTH.backdrop);

    this.renderLoreComposition();
    this.bindAdvanceInput();
    this.scale.on('resize', this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.handleResize, this);
      this.input.off('pointerdown', this.requestAdvance, this);
    });

    this.cameras.main.fadeIn(650, 0, 0, 0);
  }

  renderLoreComposition() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const isPortrait = this.scale.height >= this.scale.width;
    const layout = isPortrait ? LORE_LAYOUT.portrait : LORE_LAYOUT.landscape;
    const imageWidth = Math.floor(this.scale.width * layout.imageWidthRatio);
    const imageHeight = Math.floor(this.scale.height * layout.imageHeightRatio);

    this.imageContainer = this.add.container(centerX, centerY).setDepth(LORE_DEPTH.image);

    const hasLoreImage = this.screenConfig?.imageKey && this.textures.exists(this.screenConfig.imageKey);
    if (hasLoreImage) {
      const image = this.add
        .image(0, layout.imageYOffset, this.screenConfig.imageKey)
        .setDisplaySize(imageWidth, imageHeight)
        .setTint(0xd4b9a5)
        .setAlpha(0.94);

      if (this.screenConfig.imageKey === ASSET_KEYS.laughingEngine) {
        image.setCrop(
          CONCEPT_PRESENTATION.laughingEngine.crop.x,
          CONCEPT_PRESENTATION.laughingEngine.crop.y,
          CONCEPT_PRESENTATION.laughingEngine.crop.width,
          CONCEPT_PRESENTATION.laughingEngine.crop.height
        );
      }

      this.imageContainer.add(image);
    } else {
      const fallback = this.add
        .rectangle(0, layout.imageYOffset, imageWidth, imageHeight, COLORS.architecture, 0.95)
        .setStrokeStyle(3, COLORS.rust, 0.95);
      const fallbackLabel = this.add
        .text(0, layout.imageYOffset, 'LORE IMAGE MISSING\nFALLBACK COMPOSITION ACTIVE', {
          fontFamily: 'monospace',
          fontSize: '20px',
          color: '#d2c2ac',
          align: 'center'
        })
        .setOrigin(0.5);
      this.imageContainer.add([fallback, fallbackLabel]);
    }

    const shade = this.add.rectangle(0, imageHeight * 0.24, imageWidth, layout.shadeHeight, 0x000000, 0.58);
    this.imageContainer.add(shade);

    this.addSlowDrift();

    const title = this.screenConfig?.title ?? 'RITUAL RECORD';
    const body = this.screenConfig?.body?.join('\n') ?? 'The chamber keeps its own scripture.';

    this.titleText = this.add
      .text(centerX - imageWidth / 2 + layout.textInsetX, centerY + imageHeight * layout.titleRatioY, title, {
        fontFamily: 'monospace',
        fontSize: layout.titleFontSize,
        color: '#9bb085'
      })
      .setDepth(LORE_DEPTH.text);

    this.bodyText = this.add
      .text(centerX - imageWidth / 2 + layout.textInsetX, centerY + imageHeight * layout.bodyRatioY, body, {
        fontFamily: 'monospace',
        fontSize: layout.bodyFontSize,
        color: '#d2c2ac',
        lineSpacing: layout.bodyLineSpacing,
        wordWrap: { width: imageWidth - layout.textInsetX * 2, useAdvancedWrap: true }
      })
      .setDepth(LORE_DEPTH.text);

    this.promptText = this.add
      .text(centerX, this.scale.height - layout.promptBottomPadding, this.screenConfig?.prompt ?? 'Tap or press Enter to continue', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#8a9f79',
        align: 'center'
      })
      .setOrigin(0.5)
      .setDepth(LORE_DEPTH.prompt);

    this.frame = this.add
      .rectangle(centerX, centerY + layout.imageYOffset, imageWidth + 14, imageHeight + 14, 0x000000, 0)
      .setStrokeStyle(2, COLORS.bone, 0.8)
      .setDepth(LORE_DEPTH.frame);
  }

  addSlowDrift() {
    this.tweens.add({
      targets: this.imageContainer,
      x: this.imageContainer.x + 10,
      y: this.imageContainer.y - 8,
      scaleX: 1.035,
      scaleY: 1.035,
      ease: 'Sine.inOut',
      duration: 7800,
      yoyo: true,
      repeat: -1
    });
  }

  bindAdvanceInput() {
    this.keyInteract = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.input.on('pointerdown', this.requestAdvance, this);
  }

  update() {
    if (this.isClosing) {
      return;
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.keyInteract) ||
      Phaser.Input.Keyboard.JustDown(this.keyEnter) ||
      Phaser.Input.Keyboard.JustDown(this.keySpace)
    ) {
      this.requestAdvance();
    }
  }

  requestAdvance() {
    if (this.isClosing) {
      return;
    }

    this.isClosing = true;

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.resume(this.returnSceneKey);
      this.game.events.emit('lore-screen-complete', { screenId: this.screenId });
      this.scene.stop();
    });

    this.cameras.main.fadeOut(500, 0, 0, 0);
  }

  handleResize(gameSize) {
    this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
    this.scene.restart({
      screenId: this.screenId,
      returnSceneKey: this.returnSceneKey
    });
  }
}
