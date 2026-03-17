export function getNormalizedDisplaySize(presentation) {
  const normalized = presentation?.normalization;
  if (!normalized?.targetDisplayHeight) {
    return presentation.display;
  }

  const cropWidth = presentation.crop?.width;
  const cropHeight = presentation.crop?.height;
  if (!cropWidth || !cropHeight) {
    return presentation.display;
  }

  const clampedHeight = Math.max(normalized.minDisplayHeight ?? 1, normalized.targetDisplayHeight);
  const displayHeight = normalized.maxDisplayHeight ? Math.min(clampedHeight, normalized.maxDisplayHeight) : clampedHeight;
  const displayWidth = Math.round(displayHeight * (cropWidth / cropHeight));

  return {
    width: displayWidth,
    height: displayHeight
  };
}

export function getNormalizedOrigin(presentation) {
  if (presentation?.normalization?.origin) {
    return presentation.normalization.origin;
  }

  return presentation.origin;
}

export function getNormalizedYOffset(presentation) {
  return presentation?.normalization?.yOffset ?? 0;
}
