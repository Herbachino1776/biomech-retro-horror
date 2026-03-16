export const PORTRAIT_LAYOUT = {
  worldBandRatio: 0.8,
  worldBandMin: 340,
  worldBandMax: 520,
  minControlBand: 212,
  portraitZoom: 1.1,
  // Keep chamber scale monumental on portrait while preserving control usability.
  desktopZoom: 1,
  restartTextMinY: 72,
  restartTextRatioY: 0.2
};

export const MOBILE_CONTROLS_LAYOUT = {
  safeAreaBottomPadding: 20,
  safeAreaTopPadding: 8,
  minAnchorY: 110,
  portrait: {
    baseBandHeight: 172,
    horizontalEdgeInset: 86,
    leftAnchorRatio: 0.18,
    rightAnchorRatio: 0.82,
    dpadStep: 50,
    actionYOffset: 12,
    interactOffsetX: 6,
    interactVerticalGap: 72,
    anchorBandRatioY: 0.56,
    maxAnchorBottomPadding: 72
  },
  landscape: {
    horizontalEdgeInset: 74,
    leftAnchorRatio: 0.14,
    rightAnchorRatio: 0.88,
    dpadStep: 46,
    actionYOffset: 20,
    interactOffsetX: 10,
    interactVerticalGap: 74,
    anchorRatioY: 0.84,
    maxAnchorBottomPadding: 58
  }
};
