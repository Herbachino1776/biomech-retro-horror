import Phaser from 'phaser';
import { COLORS } from '../data/milestone1Config.js';
import { LORE_CUTSCENES } from '../data/loreCutsceneConfig.js';
import { playLoreEnter, playLoreExit, stopLoreTransitionSounds } from '../audio/loreAudio.js';

const DEPTH = {
  backdrop: 1,
  frame: 3,
  imageMask: 3.5,
  image: 4,
  textRegion: 5,
  text: 6,
  promptRegion: 7,
  prompt: 8
};

const LAYOUT = {
  portrait: {
    outerMarginX: 12,
    outerMarginY: 14,
    sectionGap: 10,
    imageHeightRatio: 0.48,
    textHeightRatio: 0.39,
    promptHeightRatio: 0.13,
    textPadding: 12,
    promptPadding: 8,
    titleSize: 15,
    bodySize: 14,
    minBodySize: 11,
    bodyLineSpacing: 4,
    promptSize: 13
  },
  landscape: {
    outerMarginX: 24,
    outerMarginY: 18,
    sectionGap: 12,
    imageHeightRatio: 0.52,
    textHeightRatio: 0.34,
    promptHeightRatio: 0.14,
    textPadding: 14,
    promptPadding: 10,
    titleSize: 16,
    bodySize: 15,
    minBodySize: 12,
    bodyLineSpacing: 4,
    promptSize: 14
  }
};

const BLACK_AQUEDUCT_CLOSEUP_LAYOUT = {
  portrait: {
    outerMarginX: 10,
    outerMarginY: 10,
    sectionGap: 10,
    imageHeightRatio: 0.62,
    textHeightRatio: 0.24,
    promptHeightRatio: 0.14,
    textPadding: 12,
    promptPadding: 8,
    titleSize: 14,
    bodySize: 13,
    minBodySize: 10,
    bodyLineSpacing: 3,
    promptSize: 13
  },
  landscape: {
    outerMarginX: 18,
    outerMarginY: 14,
    sectionGap: 10,
    imageHeightRatio: 0.58,
    textHeightRatio: 0.24,
    promptHeightRatio: 0.18,
    textPadding: 14,
    promptPadding: 10,
    titleSize: 15,
    bodySize: 14,
    minBodySize: 11,
    bodyLineSpacing: 4,
    promptSize: 14
  }
};

export class LoreCutsceneScene extends Phaser.Scene {
  constructor() {
    super('LoreCutsceneScene');
  }

  create(data) {
    this.returnSceneKey = data?.returnSceneKey ?? null;
    playLoreEnter(this.sound);
    this.cutsceneId = data?.cutsceneId ?? null;
    this.cutscene = this.cutsceneId ? LORE_CUTSCENES[this.cutsceneId] : null;
    this.cutscene = this.cutscene ?? {
      title: 'RITUAL RECORD',
      body: ['Fallback lore record active.', 'The chamber keeps its own scripture until the proper rite is restored.'],
      prompt: 'Tap or press Enter to continue',
      style: {
        frameColor: COLORS.bone,
        titleColor: '#9bb085',
        bodyColor: '#d2c2ac',
        promptColor: '#8a9f79',
        backgroundColor: '#000000'
      }
    };
    this.isClosing = false;

    const backgroundColor = this.cutscene?.style?.backgroundColor ?? '#000000';
    this.cameras.main.setBackgroundColor(backgroundColor);
    this.layoutElements = [];
    this.layoutMasks = [];

    this.drawLayout();
    this.bindContinueInput();

    this.scale.on('resize', this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.handleResize, this);
      this.input.off('pointerdown', this.requestContinue, this);
      stopLoreTransitionSounds(this.sound, { stopEnter: true, stopExit: false });
      this.clearLayout();
    });

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  clearLayout() {
    this.layoutElements?.forEach((element) => element?.destroy?.());
    this.layoutMasks?.forEach((mask) => mask?.destroy?.());
    this.layoutElements = [];
    this.layoutMasks = [];
  }

  trackLayoutElement(element) {
    if (element) {
      this.layoutElements.push(element);
    }
    return element;
  }

  trackLayoutMask(maskGraphic) {
    if (maskGraphic) {
      this.layoutMasks.push(maskGraphic);
    }
    return maskGraphic;
  }

  drawLayout() {
    this.clearLayout();
    const { width, height } = this.scale;
    const isPortrait = height >= width;
    const layout = this.resolveLayout(isPortrait);
    const compositionKey = this.cutscene?.style?.composition;

    this.trackLayoutElement(this.add.rectangle(0, 0, width, height, 0x000000, 1).setOrigin(0).setDepth(DEPTH.backdrop));

    if (compositionKey === 'black-aqueduct-closeup') {
      this.drawBlackAqueductCloseupLayout(width, height, layout);
      return;
    }

    const containerWidth = width - layout.outerMarginX * 2;
    const containerHeight = height - layout.outerMarginY * 2;
    const sectionGap = layout.sectionGap;

    const sectionTotal = layout.imageHeightRatio + layout.textHeightRatio + layout.promptHeightRatio;
    const usableHeight = containerHeight - sectionGap * 2;

    const imageHeight = Math.floor((layout.imageHeightRatio / sectionTotal) * usableHeight);
    const textHeight = Math.floor((layout.textHeightRatio / sectionTotal) * usableHeight);
    const promptHeight = usableHeight - imageHeight - textHeight;

    const containerLeft = layout.outerMarginX;
    const containerTop = layout.outerMarginY;

    const imageRegion = new Phaser.Geom.Rectangle(containerLeft, containerTop, containerWidth, imageHeight);
    const textRegion = new Phaser.Geom.Rectangle(containerLeft, imageRegion.bottom + sectionGap, containerWidth, textHeight);
    const promptRegion = new Phaser.Geom.Rectangle(containerLeft, textRegion.bottom + sectionGap, containerWidth, promptHeight);

    this.drawImageRegion(imageRegion);
    this.drawTextRegion(textRegion, layout);
    this.drawPromptRegion(promptRegion, layout);
  }

  drawBlackAqueductCloseupLayout(width, height, layout) {
    const containerWidth = width - layout.outerMarginX * 2;
    const containerHeight = height - layout.outerMarginY * 2;
    const promptHeight = Math.max(layout.promptMinHeight ?? 36, Math.floor(containerHeight * layout.promptHeightRatio));
    const textHeight = Math.max(layout.textMinHeight ?? 128, Math.floor(containerHeight * layout.textHeightRatio));
    const bottomInset = layout.bottomInset ?? 12;
    const sectionGap = layout.sectionGap;

    const imageRegion = new Phaser.Geom.Rectangle(layout.outerMarginX, layout.outerMarginY, containerWidth, containerHeight);
    const textWidth = Math.floor(containerWidth * (layout.textWidthRatio ?? 0.86));
    const promptWidth = Math.floor(containerWidth * (layout.promptWidthRatio ?? 0.7));
    const promptX = width / 2 - (layout.promptOffsetX ?? 0);
    const promptY = height - layout.outerMarginY - bottomInset - promptHeight / 2;
    const textY = promptY - promptHeight / 2 - sectionGap - textHeight / 2;
    const textX = width / 2 + (layout.textOffsetX ?? 0);
    const textRegion = new Phaser.Geom.Rectangle(textX - textWidth / 2, textY - textHeight / 2, textWidth, textHeight);
    const promptRegion = new Phaser.Geom.Rectangle(promptX - promptWidth / 2, promptY - promptHeight / 2, promptWidth, promptHeight);

    this.drawImageRegion(imageRegion);
    this.drawTextRegion(textRegion, layout);
    this.drawPromptRegion(promptRegion, layout);
  }

  resolveLayout(isPortrait) {
    const orientationKey = isPortrait ? 'portrait' : 'landscape';
    const compositionKey = this.cutscene?.style?.composition;
    const baseTable = compositionKey === 'black-aqueduct-closeup'
      ? BLACK_AQUEDUCT_CLOSEUP_LAYOUT
      : LAYOUT;
    const baseLayout = baseTable[orientationKey];
    const overrides = this.cutscene?.style?.layoutOverrides?.[orientationKey] ?? {};

    return {
      ...baseLayout,
      ...overrides
    };
  }

  drawImageRegion(region) {
    const imageStyle = this.cutscene?.style ?? {};
    const imageOffsetX = imageStyle.imageOffsetX ?? 0;
    const imageOffsetY = imageStyle.imageOffsetY ?? 0;
    const imageScaleMultiplier = imageStyle.imageScaleMultiplier ?? 1;
    const imageFrameAlpha = imageStyle.imageFrameAlpha ?? 0.96;
    const imageStrokeAlpha = imageStyle.imageStrokeAlpha ?? 0.85;
    const imageFrameColor = imageStyle.imageFrameColor ?? imageStyle.frameColor ?? COLORS.bone;
    const imageFrameThickness = imageStyle.imageFrameThickness ?? 2;
    const imageBackgroundColor = imageStyle.imageBackgroundColor ?? 0x17201f;
    const imageBackgroundAlpha = imageStyle.imageBackgroundAlpha ?? 0.86;

    if (imageFrameAlpha > 0 || imageStrokeAlpha > 0) {
      this.trackLayoutElement(
        this.add
          .rectangle(region.centerX, region.centerY, region.width, region.height, imageBackgroundColor, imageFrameAlpha)
          .setStrokeStyle(imageFrameThickness, imageFrameColor, imageStrokeAlpha)
          .setDepth(DEPTH.frame)
      );
    }

    const hasImage = this.cutscene?.imageKey && this.textures.exists(this.cutscene.imageKey);

    if (imageStyle.composition === 'black-aqueduct-closeup') {
      this.trackLayoutElement(this.add
        .ellipse(region.centerX, region.bottom - 18, region.width * 0.92, Math.max(28, region.height * 0.14), 0x020304, 0.72)
        .setDepth(DEPTH.image - 0.25));
      this.trackLayoutElement(this.add
        .ellipse(region.centerX, region.centerY + region.height * 0.08, region.width * 0.9, region.height * 0.88, 0x101616, 0.18)
        .setDepth(DEPTH.image - 0.24));
    }

    if (imageBackgroundAlpha > 0) {
      this.trackLayoutElement(
        this.add
          .rectangle(
            region.centerX,
            region.centerY,
            region.width - 8,
            region.height - 8,
            imageBackgroundColor,
            imageBackgroundAlpha
          )
          .setDepth(DEPTH.image - 0.2)
      );
    }
    if (!hasImage) {
      this.trackLayoutElement(this.add
        .text(region.centerX, region.centerY, 'LORE IMAGE MISSING\nVISIBLE FALLBACK ACTIVE', {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#d2c2ac',
          align: 'center'
        })
        .setOrigin(0.5)
        .setDepth(DEPTH.image));

      this.trackLayoutElement(this.add
        .rectangle(region.centerX, region.centerY, region.width * 0.48, region.height * 0.28, 0x8ca08c, 0.14)
        .setStrokeStyle(2, 0xcfd6c6, 0.48)
        .setDepth(DEPTH.image - 0.1));
      return;
    }

    const texture = this.textures.get(this.cutscene.imageKey).getSourceImage();
    const sourceAspect = texture.width / texture.height;
    const targetAspect = region.width / region.height;
    const sizingMode = this.cutscene?.style?.imageSizingMode ?? 'contain';

    let drawWidth = region.width;
    let drawHeight = region.height;
    if (sizingMode === 'cover') {
      if (sourceAspect > targetAspect) {
        drawWidth = region.height * sourceAspect;
      } else {
        drawHeight = region.width / sourceAspect;
      }
    } else if (sourceAspect > targetAspect) {
      drawHeight = region.width / sourceAspect;
    } else {
      drawWidth = region.height * sourceAspect;
    }

    drawWidth *= imageScaleMultiplier;
    drawHeight *= imageScaleMultiplier;

    const image = this.trackLayoutElement(this.add
      .image(region.centerX + imageOffsetX, region.centerY + imageOffsetY, this.cutscene.imageKey)
      .setOrigin(imageStyle.imageOriginX ?? 0.5, imageStyle.imageOriginY ?? 0.5)
      .setDisplaySize(drawWidth, drawHeight)
      .setTint(imageStyle.imageTint ?? 0xd4b9a5)
      .setAlpha(imageStyle.imageAlpha ?? 0.94)
      .setDepth(DEPTH.image));

    const maskGraphic = this.trackLayoutMask(this.make.graphics({ x: 0, y: 0, add: false }));
    maskGraphic.fillStyle(0xffffff, 1);
    maskGraphic.fillRect(region.x, region.y, region.width, region.height);
    image.setMask(maskGraphic.createGeometryMask());

    this.applyImageMotion(image);
  }

  applyImageMotion(image) {
    const motion = this.cutscene?.style?.motion;
    if (!motion) {
      return;
    }

    this.tweens.add({
      targets: image,
      x: image.x + (motion.panX ?? 0),
      y: image.y + (motion.panY ?? 0),
      scaleX: image.scaleX * (motion.zoom ?? 1.03),
      scaleY: image.scaleY * (motion.zoom ?? 1.03),
      ease: 'Sine.inOut',
      duration: motion.duration ?? 8000,
      yoyo: true,
      repeat: -1
    });

    this.tweens.add({
      targets: image,
      x: image.x + (motion.shakeX ?? 2),
      y: image.y + (motion.shakeY ?? -2),
      ease: 'Sine.inOut',
      duration: motion.shakeDuration ?? 3200,
      yoyo: true,
      repeat: -1
    });
  }

  drawTextRegion(region, layout) {
    const textPadding = layout.textPadding;
    const textRegionColor = this.cutscene?.style?.textRegionColor ?? 0x0d1010;
    const textRegionAlpha = this.cutscene?.style?.textRegionAlpha ?? 0.94;
    const textRegionStrokeColor = this.cutscene?.style?.textRegionStrokeColor ?? this.cutscene?.style?.frameColor ?? COLORS.rust;
    const textRegionStrokeAlpha = this.cutscene?.style?.textRegionStrokeAlpha ?? 0.5;
    const textRegionStrokeThickness = this.cutscene?.style?.textRegionStrokeThickness ?? 1;

    this.trackLayoutElement(this.add
      .rectangle(region.centerX, region.centerY, region.width, region.height, textRegionColor, textRegionAlpha)
      .setStrokeStyle(textRegionStrokeThickness, textRegionStrokeColor, textRegionStrokeAlpha)
      .setDepth(DEPTH.textRegion));

    if (this.cutscene?.style?.composition === 'black-aqueduct-closeup') {
      this.trackLayoutElement(this.add
        .rectangle(region.centerX, region.top + 8, region.width * 0.92, 12, 0x13191a, 0.9)
        .setDepth(DEPTH.textRegion + 0.05));
    }

    const title = this.cutscene?.title?.trim();
    const bodyText = Array.isArray(this.cutscene?.body)
      ? this.cutscene.body.join('\n')
      : this.cutscene?.body ?? 'The chamber keeps its own scripture.';

    const textX = region.left + textPadding;
    const maxWidth = region.width - textPadding * 2;
    let nextY = region.top + textPadding;

    if (title) {
      this.trackLayoutElement(this.add
        .text(textX, nextY, title, {
          fontFamily: 'monospace',
          fontSize: `${layout.titleSize}px`,
          color: this.cutscene?.style?.titleColor ?? '#9bb085',
          stroke: '#050706',
          strokeThickness: 3
        })
        .setDepth(DEPTH.text));
      nextY += layout.titleSize + 8;
    }

    const availableHeight = region.bottom - textPadding - nextY;
    let bodyFontSize = layout.bodySize;
    const body = this.trackLayoutElement(this.add
      .text(textX, nextY, bodyText, {
        fontFamily: 'monospace',
        fontSize: `${bodyFontSize}px`,
        color: this.cutscene?.style?.bodyColor ?? '#d2c2ac',
        stroke: '#050706',
        strokeThickness: 2,
        wordWrap: { width: maxWidth, useAdvancedWrap: true },
        lineSpacing: layout.bodyLineSpacing
      })
      .setDepth(DEPTH.text));

    while (body.height > availableHeight && bodyFontSize > layout.minBodySize) {
      bodyFontSize -= 1;
      body.setFontSize(bodyFontSize);
    }
  }

  drawPromptRegion(region, layout) {
    const promptRegionColor = this.cutscene?.style?.promptRegionColor ?? 0x050505;
    const promptRegionAlpha = this.cutscene?.style?.promptRegionAlpha ?? 0.7;
    const promptRegionStrokeColor = this.cutscene?.style?.promptRegionStrokeColor ?? this.cutscene?.style?.frameColor ?? COLORS.bone;
    const promptRegionStrokeAlpha = this.cutscene?.style?.promptRegionStrokeAlpha ?? 0.35;
    const promptRegionStrokeThickness = this.cutscene?.style?.promptRegionStrokeThickness ?? 1;

    this.trackLayoutElement(this.add
      .rectangle(region.centerX, region.centerY, region.width, region.height, promptRegionColor, promptRegionAlpha)
      .setStrokeStyle(promptRegionStrokeThickness, promptRegionStrokeColor, promptRegionStrokeAlpha)
      .setDepth(DEPTH.promptRegion));

    const prompt = this.cutscene?.prompt ?? 'Tap or press Enter to continue';
    this.trackLayoutElement(this.add
      .text(region.centerX, region.centerY, prompt, {
        fontFamily: 'monospace',
        fontSize: `${layout.promptSize}px`,
        color: this.cutscene?.style?.promptColor ?? '#8a9f79',
        align: 'center',
        wordWrap: { width: region.width - layout.promptPadding * 2, useAdvancedWrap: true }
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.prompt));
  }

  bindContinueInput() {
    this.keyInteract = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.on('pointerdown', this.requestContinue, this);
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
      this.requestContinue();
    }
  }

  requestContinue() {
    if (this.isClosing) {
      return;
    }

    this.isClosing = true;
    playLoreExit(this.sound);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      if (this.returnSceneKey) {
        this.scene.resume(this.returnSceneKey);
      }
      this.game.events.emit('lore-cutscene-complete', { cutsceneId: this.cutsceneId });
      this.scene.stop();
    });

    this.cameras.main.fadeOut(400, 0, 0, 0);
  }

  handleResize() {
    this.scene.restart({ cutsceneId: this.cutsceneId, returnSceneKey: this.returnSceneKey });
  }
}
