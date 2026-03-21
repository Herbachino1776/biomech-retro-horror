import { ASSET_KEYS } from './assetKeys.js';
import { ASSET_URLS } from './assetUrls.js';

export const GLOBAL_TEXTURE_ASSET_KEYS = [
  ASSET_KEYS.player,
  ASSET_KEYS.skitter,
  ASSET_KEYS.sentinel,
  ASSET_KEYS.uiFrame
];

export const CHAMBER01_TEXTURE_ASSET_KEYS = [
  ASSET_KEYS.chamberBackground,
  ASSET_KEYS.chamber01Wall,
  ASSET_KEYS.chamber01FloorStrip,
  ASSET_KEYS.chamber01RibArch,
  ASSET_KEYS.chamber01Shrine,
  ASSET_KEYS.chamber01LaughingEngineWorld,
  ASSET_KEYS.chamber01DeadgodCutscene,
  ASSET_KEYS.chamber01HalfSkullMiniboss,
  ASSET_KEYS.laughingEngine
];

export const CHAMBER02_TEXTURE_ASSET_KEYS = [
  ASSET_KEYS.chamber02VertebralHornGate,
  ASSET_KEYS.chamber02BackgroundPlate,
  ASSET_KEYS.chamber02FloorStrip,
  ASSET_KEYS.chamber02ForegroundHornArch,
  ASSET_KEYS.chamber02TollKeeperSkitter,
  ASSET_KEYS.chamber02ExitGateLore
];

export const CHAMBER03_TEXTURE_ASSET_KEYS = [
  ASSET_KEYS.chamber03WallModule,
  ASSET_KEYS.chamber03EntryNave,
  ASSET_KEYS.chamber03BossDais,
  ASSET_KEYS.chamber03PrecentorBoss,
  ASSET_KEYS.chamber03Lore,
  ASSET_KEYS.chamber03ChoirOpening,
  ASSET_KEYS.chamber03Threshold
];

export const CHAMBER01_ACTIVE_TEXTURE_KEYS = [
  ...GLOBAL_TEXTURE_ASSET_KEYS,
  ...CHAMBER01_TEXTURE_ASSET_KEYS
];

export const CHAMBER02_ACTIVE_TEXTURE_KEYS = [
  ...GLOBAL_TEXTURE_ASSET_KEYS,
  ...CHAMBER02_TEXTURE_ASSET_KEYS
];

export const CHAMBER03_ACTIVE_TEXTURE_KEYS = [
  ...GLOBAL_TEXTURE_ASSET_KEYS,
  ASSET_KEYS.chamber02TollKeeperSkitter,
  ...CHAMBER03_TEXTURE_ASSET_KEYS
];

export function queueMissingTextureAssets(scene, textureKeys) {
  textureKeys
    .filter((assetKey) => !scene.textures.exists(assetKey))
    .forEach((assetKey) => {
      const assetUrl = ASSET_URLS[assetKey];
      if (assetUrl) {
        scene.load.image(assetKey, assetUrl);
      }
    });
}

export function pruneUnusedTextures(scene, keepTextureKeys) {
  const keepSet = new Set(keepTextureKeys);
  scene.textures.list
    && Object.keys(scene.textures.list)
      .filter((textureKey) => textureKey !== '__DEFAULT' && textureKey !== '__MISSING' && !keepSet.has(textureKey))
      .forEach((textureKey) => {
        scene.textures.remove(textureKey);
      });
}
