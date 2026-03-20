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
    baseRadius: { portrait: 46, landscape: 54 },
    knobRadius: { portrait: 22, landscape: 26 },
    hitDiameter: { portrait: 136, landscape: 156 },
    maxTravel: { portrait: 24, landscape: 28 },
    deadZone: 10
  },
  actionButtons: {
    jumpRadius: { portrait: 24, landscape: 28 },
    attackRadius: { portrait: 32, landscape: 38 },
    interactRadius: { portrait: 24, landscape: 28 },
    hitMultiplier: { portrait: 2.25, landscape: 2.45 }
  },
  portrait: {
    baseBandHeight: 118,
    horizontalEdgeInset: 48,
    leftAnchorRatio: 0.18,
    rightAnchorRatio: 0.84,
    anchorBandRatioY: 0.56,
    attackYOffset: 2,
    jumpOffsetX: 48,
    jumpOffsetY: 40,
    interactOffsetX: 2,
    interactOffsetY: 72,
    maxAnchorBottomPadding: 40,
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
