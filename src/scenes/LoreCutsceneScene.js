import Phaser from 'phaser';
import { COLORS } from '../data/milestone1Config.js';
import { LORE_CUTSCENES } from '../data/loreCutsceneConfig.js';

const DEPTH = {
  backdrop: 1,
  frame: 3,
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

export class LoreCutsceneScene extends Phaser.Scene {
  constructor() {
    super('LoreCutsceneScene');
  }

  create(data) {
    this.returnSceneKey = data?.returnSceneKey ?? 'Chamber02Scene';
    this.cutsceneId = data?.cutsceneId ?? null;
    this.cutscene = this.cutsceneId ? LORE_CUTSCENES[this.cutsceneId] : null;
    this.isClosing = false;

    const backgroundColor = this.cutscene?.style?.backgroundColor ?? '#000000';
    this.cameras.main.setBackgroundColor(backgroundColor);

    this.drawLayout();
    this.bindContinueInput();

    this.scale.on('resize', this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.handleResize, this);
      this.input.off('pointerdown', this.requestContinue, this);
    });

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  drawLayout() {
    const { width, height } = this.scale;
    const isPortrait = height >= width;
    const layout = isPortrait ? LAYOUT.portrait : LAYOUT.landscape;

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

    this.add
      .rectangle(0, 0, width, height, 0x000000, 1)
      .setOrigin(0)
      .setDepth(DEPTH.backdrop);

    const imageRegion = new Phaser.Geom.Rectangle(containerLeft, containerTop, containerWidth, imageHeight);
    const textRegion = new Phaser.Geom.Rectangle(
      containerLeft,
      imageRegion.bottom + sectionGap,
      containerWidth,
      textHeight
    );
    const promptRegion = new Phaser.Geom.Rectangle(
      containerLeft,
      textRegion.bottom + sectionGap,
      containerWidth,
      promptHeight
    );

    this.drawImageRegion(imageRegion);
    this.drawTextRegion(textRegion, layout);
    this.drawPromptRegion(promptRegion, layout);
  }

  drawImageRegion(region) {
    this.add
      .rectangle(region.centerX, region.centerY, region.width, region.height, 0x0a0a0a, 0.95)
      .setStrokeStyle(2, this.cutscene?.style?.frameColor ?? COLORS.bone, 0.85)
      .setDepth(DEPTH.frame);

    const hasImage = this.cutscene?.imageKey && this.textures.exists(this.cutscene.imageKey);

    if (!hasImage) {
      this.add
        .text(region.centerX, region.centerY, 'LORE IMAGE MISSING\nFALLBACK ACTIVE', {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#d2c2ac',
          align: 'center'
        })
        .setOrigin(0.5)
        .setDepth(DEPTH.image);
      return;
    }

    const texture = this.textures.get(this.cutscene.imageKey).getSourceImage();
    const sourceAspect = texture.width / texture.height;
    const targetAspect = region.width / region.height;

    let drawWidth = region.width;
    let drawHeight = region.height;

    if (sourceAspect > targetAspect) {
      drawHeight = region.width / sourceAspect;
    } else {
      drawWidth = region.height * sourceAspect;
    }

    this.add
      .image(region.centerX, region.centerY, this.cutscene.imageKey)
      .setDisplaySize(drawWidth, drawHeight)
      .setTint(this.cutscene?.style?.imageTint ?? 0xd4b9a5)
      .setAlpha(this.cutscene?.style?.imageAlpha ?? 0.94)
      .setDepth(DEPTH.image);
  }

  drawTextRegion(region, layout) {
    const textPadding = layout.textPadding;

    this.add
      .rectangle(region.centerX, region.centerY, region.width, region.height, 0x080808, 0.8)
      .setStrokeStyle(1, this.cutscene?.style?.frameColor ?? COLORS.rust, 0.5)
      .setDepth(DEPTH.textRegion);

    const title = this.cutscene?.title?.trim();
    const bodyText = Array.isArray(this.cutscene?.body)
      ? this.cutscene.body.join('\n')
      : this.cutscene?.body ?? 'The chamber keeps its own scripture.';

    const textX = region.left + textPadding;
    const maxWidth = region.width - textPadding * 2;
    let nextY = region.top + textPadding;

    if (title) {
      this.add
        .text(textX, nextY, title, {
          fontFamily: 'monospace',
          fontSize: `${layout.titleSize}px`,
          color: this.cutscene?.style?.titleColor ?? '#9bb085'
        })
        .setDepth(DEPTH.text);
      nextY += layout.titleSize + 8;
    }

    const availableHeight = region.bottom - textPadding - nextY;

    let bodyFontSize = layout.bodySize;
    const body = this.add
      .text(textX, nextY, bodyText, {
        fontFamily: 'monospace',
        fontSize: `${bodyFontSize}px`,
        color: this.cutscene?.style?.bodyColor ?? '#d2c2ac',
        wordWrap: { width: maxWidth, useAdvancedWrap: true },
        lineSpacing: layout.bodyLineSpacing
      })
      .setDepth(DEPTH.text);

    while (body.height > availableHeight && bodyFontSize > layout.minBodySize) {
      bodyFontSize -= 1;
      body.setFontSize(bodyFontSize);
    }
  }

  drawPromptRegion(region, layout) {
    this.add
      .rectangle(region.centerX, region.centerY, region.width, region.height, 0x050505, 0.7)
      .setStrokeStyle(1, this.cutscene?.style?.frameColor ?? COLORS.bone, 0.35)
      .setDepth(DEPTH.promptRegion);

    const prompt = this.cutscene?.prompt ?? 'Tap or press Enter to continue';
    this.add
      .text(region.centerX, region.centerY, prompt, {
        fontFamily: 'monospace',
        fontSize: `${layout.promptSize}px`,
        color: this.cutscene?.style?.promptColor ?? '#8a9f79',
        align: 'center',
        wordWrap: { width: region.width - layout.promptPadding * 2, useAdvancedWrap: true }
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.prompt);
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

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.resume(this.returnSceneKey);
      this.game.events.emit('lore-cutscene-complete', { cutsceneId: this.cutsceneId });
      this.scene.stop();
    });

    this.cameras.main.fadeOut(400, 0, 0, 0);
  }

  handleResize(gameSize) {
    this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
    this.scene.restart({
      cutsceneId: this.cutsceneId,
      returnSceneKey: this.returnSceneKey
    });
  }
}
