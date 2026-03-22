export const PORTRAIT_LAYOUT = {
  worldBandRatio: 0.89,
  worldBandMin: 400,
  worldBandMax: 660,
  minControlBand: 136,
  portraitZoom: 1.04,
  portraitFollowOffsetY: -36,
  // Keep chamber scale monumental on portrait while preserving control usability.
  desktopZoom: 1,
  desktopFollowOffsetY: 0,
  restartTextMinY: 72,
  restartTextRatioY: 0.2
};

export const MOBILE_CONTROLS_LAYOUT = {
  safeAreaBottomPadding: 12,
  safeAreaTopPadding: 8,
  minAnchorY: 110,
  joystick: {
    baseRadius: { portrait: 56, landscape: 54 },
    knobRadius: { portrait: 26, landscape: 26 },
    hitDiameter: { portrait: 176, landscape: 156 },
    maxTravel: { portrait: 28, landscape: 28 },
    deadZone: 10
  },
  actionButtons: {
    jumpRadius: { portrait: 34, landscape: 28 },
    attackRadius: { portrait: 42, landscape: 38 },
    interactRadius: { portrait: 32, landscape: 28 },
    hitMultiplier: { portrait: 2.55, landscape: 2.45 }
  },
  portrait: {
    baseBandHeight: 180,
    horizontalEdgeInset: 24,
    leftAnchorRatio: 0.2,
    rightAnchorRatio: 0.84,
    anchorBandRatioY: 0.5,
    attackYOffset: 0,
    jumpOffsetX: 68,
    jumpOffsetY: 52,
    interactOffsetX: 8,
    interactOffsetY: 110,
    maxAnchorBottomPadding: 28,
    dialogueInteractInset: 74,
    dialogueInteractY: 64
  },
  landscape: {
    horizontalEdgeInset: 72,
    leftAnchorRatio: 0.14,
    rightAnchorRatio: 0.88,
    anchorRatioY: 0.84,
    attackYOffset: 2,
    jumpOffsetX: 62,
    jumpOffsetY: 50,
    interactOffsetX: 2,
    interactOffsetY: 88,
    maxAnchorBottomPadding: 56,
    dialogueInteractInset: 92,
    dialogueInteractY: 88
  }
};
