// Template: clone this config, swap keys/tuning, then wire a thin scene wrapper.
export const bossPitConfigTemplate = {
  encounterId: 'replace-me-encounter-id',
  rewardGrantId: 'replace-me-reward-id',
  bootstrap: {
    sceneKey: 'ReplaceMeBossPitScene',
    worldWidth: 1920,
    spawnX: 392,
    spawnY: 360,
    floorColliderHeight: 72,
    floorColliderCenterYOffset: 28,
    cameraLerp: { x: 0.08, y: 0.08 },
    portraitFollowOffsetX: -112,
    desktopFollowOffsetX: -128
  },
  returnFlow: { returnSceneKey: 'ReplaceSourceScene', returnXOffset: 56, returnYOffset: -34 },
  visuals: { backgroundImageKey: 'replace-background-key', backgroundY: 210, backgroundHeight: 480, backgroundAlpha: 0.9 },
  altars: {
    presentation: [],
    returnAltarId: 'return-altar',
    altarImageKey: 'replace-altar-key',
    returnAltarImageKey: 'replace-return-altar-key',
    altarImageFallbackKey: 'replace-fallback-altar-key',
    interaction: { zoneWidth: 196, zoneHeight: 212, promptOffsetY: -170, inactivePrompt: '', activePrompt: '' }
  },
  audio: { ambient: { key: 'replace-ambient-key', volume: 0.1 } },
  arrival: {},
  victory: {},
  deathCamera: {},
  deathPayoffPose: { maxUpwardSnapPx: 8 },
  boss: {},
  runState: { markCompleted: () => {}, hasRewardGranted: () => false, markRewardGranted: () => {} }
};
