import Phaser from 'phaser';
import { COLORS, LORE_SCREENS } from '../data/milestone1Config.js';
import { ASSET_KEYS } from '../data/assetKeys.js';

const LORE_DEPTH = {
  backdrop: 2,
  image: 4,
  frame: 5,
  text: 6,
  prompt: 7
};

const MIN_COVER_VISIBLE_RATIO = 0.7;

const LORE_LAYOUT = {
  portrait: {
    imageWidthRatio: 0.96,
    imageHeightRatio: 0.58,
    imageYOffset: -34,
    shadeHeightRatio: 0.48,
    shadeBottomInset: 10,
    titleFontSize: 15,
    bodyFontMax: 15,
    bodyFontMin: 11,
    bodyLineSpacingRatio: 0.24,
    promptBottomPadding: 24,
    textInsetX: 18,
    textTopPadding: 14,
    textBottomPadding: 14,
    titleBodyGap: 8
  },
  landscape: {
    imageWidthRatio: 0.9,
    imageHeightRatio: 0.72,
    imageYOffset: -20,
    shadeHeightRatio: 0.43,
    shadeBottomInset: 8,
    titleFontSize: 17,
    bodyFontMax: 18,
    bodyFontMin: 12,
    bodyLineSpacingRatio: 0.26,
    promptBottomPadding: 34,
    textInsetX: 26,
    textTopPadding: 14,
    textBottomPadding: 16,
    titleBodyGap: 10
  }
};

export class LoreScreenScene extends Phaser.Scene {
  constructor() {
    super('LoreScreenScene');
  }

  create(data) {
    this.returnSceneKey = data?.returnSceneKey ?? 'Chamber01Scene';
    this.sound.get(ASSET_KEYS.loreEnter)?.stop();
    this.sound.get(ASSET_KEYS.loreExit)?.stop();
    this.sound.play?.(ASSET_KEYS.loreEnter);
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
      this.sound.get(ASSET_KEYS.loreEnter)?.stop();
      this.sound.get(ASSET_KEYS.loreExit)?.stop();
    });

    this.cameras.main.fadeIn(650, 0, 0, 0);
  }

  renderLoreComposition() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const isPortrait = this.scale.height >= this.scale.width;
    const layout = this.getActiveLayout(isPortrait);
    const imageWidth = Math.floor(this.scale.width * layout.imageWidthRatio);
    const imageHeight = Math.floor(this.scale.height * layout.imageHeightRatio);
    const shadeHeight = Math.floor(imageHeight * layout.shadeHeightRatio);
    const shadeCenterY = layout.imageYOffset + imageHeight / 2 - shadeHeight / 2 - layout.shadeBottomInset;
    const shadeTopY = centerY + shadeCenterY - shadeHeight / 2;

    this.imageContainer = this.add.container(centerX, centerY).setDepth(LORE_DEPTH.image);

    const hasLoreImage = this.screenConfig?.imageKey && this.textures.exists(this.screenConfig.imageKey);
    if (hasLoreImage) {
      const imageTint = this.screenConfig?.presentation?.imageTint ?? 0xd4b9a5;
      const imageAlpha = this.screenConfig?.presentation?.imageAlpha ?? 0.94;
      const imageTexture = this.textures.get(this.screenConfig.imageKey);
      const sourceImage = imageTexture.getSourceImage();
      const imageCrop = this.screenConfig?.presentation?.imageCrop;
      const sourceAspect = imageCrop
        ? imageCrop.width / imageCrop.height
        : sourceImage.width / sourceImage.height;
      const { imageDisplayWidth, imageDisplayHeight } = this.resolveLoreImageSize({
        sourceAspect,
        frameWidth: imageWidth,
        frameHeight: imageHeight
      });

      const image = this.add
        .image(0, layout.imageYOffset, this.screenConfig.imageKey)
        .setDisplaySize(imageDisplayWidth, imageDisplayHeight)
        .setTint(imageTint)
        .setAlpha(imageAlpha);

      if (imageCrop) {
        image.setCrop(imageCrop.x, imageCrop.y, imageCrop.width, imageCrop.height);
      }

      this.imageContainer.add(image);

      const imageMaskGraphics = this.make.graphics({ x: 0, y: 0, add: false });
      imageMaskGraphics.fillRect(centerX - imageWidth / 2, centerY + layout.imageYOffset - imageHeight / 2, imageWidth, imageHeight);
      image.setMask(imageMaskGraphics.createGeometryMask());
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

    this.shade = this.add
      .rectangle(centerX, centerY + shadeCenterY, imageWidth, shadeHeight, 0x000000, 0.6)
      .setDepth(LORE_DEPTH.image + 0.5);

    this.addSlowDrift(this.imageContainer);

    const title = this.screenConfig?.title ?? 'RITUAL RECORD';
    const body = this.screenConfig?.body?.join('\n') ?? 'The chamber keeps its own scripture.';
    const textLeft = centerX - imageWidth / 2 + layout.textInsetX;
    const textTop = shadeTopY + layout.textTopPadding;
    const textWidth = imageWidth - layout.textInsetX * 2;
    const textHeight = shadeHeight - layout.textTopPadding - layout.textBottomPadding;

    this.titleText = this.add
      .text(textLeft, textTop, title, {
        fontFamily: 'monospace',
        fontSize: `${layout.titleFontSize}px`,
        color: this.screenConfig?.presentation?.titleColor ?? '#9bb085'
      })
      .setDepth(LORE_DEPTH.text);

    const availableBodyHeight = textHeight - this.titleText.height - layout.titleBodyGap;
    const bodyLineSpacing = (fontSize) => Math.max(2, Math.round(fontSize * layout.bodyLineSpacingRatio));
    let bodyFontSize = layout.bodyFontMax;

    this.bodyText = this.add
      .text(textLeft, textTop + this.titleText.height + layout.titleBodyGap, body, {
        fontFamily: 'monospace',
        fontSize: `${bodyFontSize}px`,
        color: '#d2c2ac',
        lineSpacing: bodyLineSpacing(bodyFontSize),
        wordWrap: { width: textWidth, useAdvancedWrap: true }
      })
      .setDepth(LORE_DEPTH.text);

    while (this.bodyText.height > availableBodyHeight && bodyFontSize > layout.bodyFontMin) {
      bodyFontSize -= 1;
      this.bodyText
        .setFontSize(bodyFontSize)
        .setLineSpacing(bodyLineSpacing(bodyFontSize))
        .setWordWrapWidth(textWidth, true);
    }

    const textMaskGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    textMaskGraphics.fillRect(textLeft, textTop, textWidth, textHeight);
    const textMask = textMaskGraphics.createGeometryMask();
    this.titleText.setMask(textMask);
    this.bodyText.setMask(textMask);

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
      .setStrokeStyle(2, this.screenConfig?.presentation?.frameColor ?? COLORS.bone, 0.8)
      .setDepth(LORE_DEPTH.frame);
  }

  resolveLoreImageSize({ sourceAspect, frameWidth, frameHeight }) {
    const frameAspect = frameWidth / frameHeight;

    const coverSize = sourceAspect > frameAspect
      ? { imageDisplayWidth: frameHeight * sourceAspect, imageDisplayHeight: frameHeight }
      : { imageDisplayWidth: frameWidth, imageDisplayHeight: frameWidth / sourceAspect };

    const containSize = sourceAspect > frameAspect
      ? { imageDisplayWidth: frameWidth, imageDisplayHeight: frameWidth / sourceAspect }
      : { imageDisplayWidth: frameHeight * sourceAspect, imageDisplayHeight: frameHeight };

    const visibleRatio = Math.min(frameWidth / coverSize.imageDisplayWidth, frameHeight / coverSize.imageDisplayHeight);

    if (visibleRatio < MIN_COVER_VISIBLE_RATIO) {
      return containSize;
    }

    return coverSize;
  }

  getActiveLayout(isPortrait) {
    const baseLayout = isPortrait ? LORE_LAYOUT.portrait : LORE_LAYOUT.landscape;
    const orientationKey = isPortrait ? 'portrait' : 'landscape';
    const overrides = this.screenConfig?.presentation?.layoutOverrides?.[orientationKey] ?? null;

    if (!overrides) {
      return baseLayout;
    }

    return {
      ...baseLayout,
      ...overrides
    };
  }

  addSlowDrift(target) {
    this.tweens.add({
      targets: target,
      x: target.x + 10,
      y: target.y - 8,
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
    this.sound.get(ASSET_KEYS.loreEnter)?.stop();
    this.sound.get(ASSET_KEYS.loreExit)?.stop();
    this.sound.play?.(ASSET_KEYS.loreExit);

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
