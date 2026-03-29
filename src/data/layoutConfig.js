export const PORTRAIT_LAYOUT = {
  worldBandRatio: 0.87,
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
    baseRadius: { portrait: 52, landscape: 50 },
    knobRadius: { portrait: 24, landscape: 24 },
    hitDiameter: { portrait: 124, landscape: 118 },
    maxTravel: { portrait: 28, landscape: 28 },
    deadZone: 10
  },
  actionButtons: {
    jumpRadius: { portrait: 29, landscape: 27 },
    attackRadius: { portrait: 36, landscape: 35 },
    interactRadius: { portrait: 27, landscape: 26 },
    devRadius: { portrait: 22, landscape: 20 },
    hitMultiplier: { portrait: 1.22, landscape: 1.24 },
    jumpHitMultiplier: { portrait: 1.26, landscape: 1.28 },
    attackHitMultiplier: { portrait: 1.18, landscape: 1.2 },
    interactHitMultiplier: { portrait: 1.24, landscape: 1.28 },
    devHitMultiplier: { portrait: 1.42, landscape: 1.4 }
  },
  portrait: {
    baseBandHeight: 170,
    horizontalEdgeInset: 24,
    leftAnchorRatio: 0.2,
    rightAnchorRatio: 0.84,
    anchorBandRatioY: 0.64,
    attackYOffset: -8,
    jumpOffsetX: 70,
    jumpOffsetY: 34,
    interactOffsetX: 8,
    interactOffsetY: 82,
    maxAnchorBottomPadding: 28,
    dialogueInteractInset: 74,
    dialogueInteractY: 64,
    devButtonInsetX: 54,
    devButtonInsetY: 68
  },
  landscape: {
    horizontalEdgeInset: 72,
    leftAnchorRatio: 0.14,
    rightAnchorRatio: 0.88,
    anchorRatioY: 0.84,
    attackYOffset: 2,
    jumpOffsetX: 66,
    jumpOffsetY: 50,
    interactOffsetX: 2,
    interactOffsetY: 88,
    maxAnchorBottomPadding: 56,
    dialogueInteractInset: 92,
    dialogueInteractY: 88,
    devButtonInsetX: 56,
    devButtonInsetY: 70
  }
};
