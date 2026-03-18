export const PORTRAIT_LAYOUT = {
  worldBandRatio: 0.84,
  worldBandMin: 360,
  worldBandMax: 560,
  minControlBand: 168,
  portraitZoom: 1.1,
  // Keep chamber scale monumental on portrait while preserving control usability.
  desktopZoom: 1,
  restartTextMinY: 72,
  restartTextRatioY: 0.2
};

export const MOBILE_CONTROLS_LAYOUT = {
  safeAreaBottomPadding: 16,
  safeAreaTopPadding: 8,
  minAnchorY: 110,
  joystick: {
    baseRadius: 54,
    knobRadius: 26,
    hitDiameter: 156,
    maxTravel: 28,
    deadZone: 10
  },
  actionButtons: {
    jumpRadius: 28,
    attackRadius: 38,
    interactRadius: 28
  },
  portrait: {
    baseBandHeight: 136,
    horizontalEdgeInset: 70,
    leftAnchorRatio: 0.2,
    rightAnchorRatio: 0.81,
    anchorBandRatioY: 0.52,
    attackYOffset: 0,
    jumpOffsetX: 58,
    jumpOffsetY: 48,
    interactOffsetX: 6,
    interactOffsetY: 84,
    maxAnchorBottomPadding: 58
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
    maxAnchorBottomPadding: 56
  }
};
