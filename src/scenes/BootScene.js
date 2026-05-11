import Phaser from 'phaser';
import { DEBUG_BOOT_OVERRIDES } from '../data/milestone1Config.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { ASSET_URLS } from '../data/assetUrls.js';
import { vesselIntegrityState } from '../systems/VesselIntegrityState.js';
import { AudioDirector } from '../audio/AudioDirector.js';

const TITLE_SCENE_AUDIO = {
  ambientVolume: 0.3276,
  startConfirmDelayMs: 180,
  startGameSfxVolume: 0.34
};

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
    this.hasStarted = false;
    this.isStarting = false;
    this.audioDirector = null;
    this.layoutElements = {};
    this.menuButtons = [];
    this.menuOptions = [
      {
        id: 'start-game',
        label: 'START GAME',
        action: () => this.beginChamber()
      },
      {
        id: 'dev-start',
        label: 'DEV',
        action: () => this.beginDevChamber()
      }
    ];
  }

  preload() {
    this.load.image(ASSET_KEYS.titleScreenBackground01, ASSET_URLS[ASSET_KEYS.titleScreenBackground01]);
    this.load.image(ASSET_KEYS.titleLogoOuterEngine01, ASSET_URLS[ASSET_KEYS.titleLogoOuterEngine01]);
    this.load.image(ASSET_KEYS.chamberBackground, ASSET_URLS[ASSET_KEYS.chamberBackground]);
    this.load.image(ASSET_KEYS.chamber01Wall, ASSET_URLS[ASSET_KEYS.chamber01Wall]);
    this.load.image(ASSET_KEYS.chamber01FloorStrip, ASSET_URLS[ASSET_KEYS.chamber01FloorStrip]);
    this.load.image(ASSET_KEYS.chamber01RibArch, ASSET_URLS[ASSET_KEYS.chamber01RibArch]);
    this.load.image(ASSET_KEYS.chamber01Shrine, ASSET_URLS[ASSET_KEYS.chamber01Shrine]);
    this.load.image(ASSET_KEYS.chamber01LaughingEngineWorld, ASSET_URLS[ASSET_KEYS.chamber01LaughingEngineWorld]);
    this.load.image(ASSET_KEYS.chamber01DeadgodCutscene, ASSET_URLS[ASSET_KEYS.chamber01DeadgodCutscene]);
    this.load.image(ASSET_KEYS.chamber01HalfSkullMiniboss, ASSET_URLS[ASSET_KEYS.chamber01HalfSkullMiniboss]);
    this.load.image(ASSET_KEYS.chamber02VertebralHornGate, ASSET_URLS[ASSET_KEYS.chamber02VertebralHornGate]);
    this.load.image(ASSET_KEYS.chamber02BackgroundPlate, ASSET_URLS[ASSET_KEYS.chamber02BackgroundPlate]);
    this.load.image(ASSET_KEYS.chamber02FloorStrip, ASSET_URLS[ASSET_KEYS.chamber02FloorStrip]);
    this.load.image(ASSET_KEYS.chamber02ForegroundHornArch, ASSET_URLS[ASSET_KEYS.chamber02ForegroundHornArch]);
    this.load.image(ASSET_KEYS.chamber02TollKeeperSkitter, ASSET_URLS[ASSET_KEYS.chamber02TollKeeperSkitter]);
    this.load.image(ASSET_KEYS.chamber03BackgroundEntryNave, ASSET_URLS[ASSET_KEYS.chamber03BackgroundEntryNave]);
    this.load.image(ASSET_KEYS.chamber03BackgroundWallModule, ASSET_URLS[ASSET_KEYS.chamber03BackgroundWallModule]);
    this.load.image(ASSET_KEYS.chamber03BackgroundChoirOpening, ASSET_URLS[ASSET_KEYS.chamber03BackgroundChoirOpening]);
    this.load.image(ASSET_KEYS.chamber03BackgroundThreshold, ASSET_URLS[ASSET_KEYS.chamber03BackgroundThreshold]);
    this.load.image(ASSET_KEYS.chamber03BackgroundBossDais, ASSET_URLS[ASSET_KEYS.chamber03BackgroundBossDais]);
    this.load.image(ASSET_KEYS.chamber03Lore01, ASSET_URLS[ASSET_KEYS.chamber03Lore01]);
    this.load.image(ASSET_KEYS.chamber03BossPrecentor, ASSET_URLS[ASSET_KEYS.chamber03BossPrecentor]);
    this.load.image(ASSET_KEYS.sector02Chamber01BackgroundEntryCanal, ASSET_URLS[ASSET_KEYS.sector02Chamber01BackgroundEntryCanal]);
    this.load.image(ASSET_KEYS.sector02Chamber01BackgroundWallModule, ASSET_URLS[ASSET_KEYS.sector02Chamber01BackgroundWallModule]);
    this.load.image(ASSET_KEYS.sector02Chamber01BackgroundSluiceOpening, ASSET_URLS[ASSET_KEYS.sector02Chamber01BackgroundSluiceOpening]);
    this.load.image(ASSET_KEYS.sector02Chamber01BackgroundThreshold, ASSET_URLS[ASSET_KEYS.sector02Chamber01BackgroundThreshold]);
    this.load.image(ASSET_KEYS.sector02Chamber01BackgroundClimax, ASSET_URLS[ASSET_KEYS.sector02Chamber01BackgroundClimax]);
    this.load.image(ASSET_KEYS.sector02Chamber01EnemyBasic, ASSET_URLS[ASSET_KEYS.sector02Chamber01EnemyBasic]);
    this.load.image(ASSET_KEYS.sector02Chamber01EnemyElite, ASSET_URLS[ASSET_KEYS.sector02Chamber01EnemyElite]);
    this.load.image(ASSET_KEYS.sector02Chamber01AbyssalArchon, ASSET_URLS[ASSET_KEYS.sector02Chamber01AbyssalArchon]);
    this.load.image(ASSET_KEYS.sector02Chamber01LoreAltar, ASSET_URLS[ASSET_KEYS.sector02Chamber01LoreAltar]);
    this.load.image(ASSET_KEYS.sector02Chamber01LoreImage, ASSET_URLS[ASSET_KEYS.sector02Chamber01LoreImage]);
    this.load.image(ASSET_KEYS.sector02Chamber01Gate, ASSET_URLS[ASSET_KEYS.sector02Chamber01Gate]);
    this.load.image(ASSET_KEYS.sector02Chamber01Floor, ASSET_URLS[ASSET_KEYS.sector02Chamber01Floor]);
    this.load.image(ASSET_KEYS.sector02Chamber02BackgroundWallModule, ASSET_URLS[ASSET_KEYS.sector02Chamber02BackgroundWallModule]);
    this.load.image(ASSET_KEYS.sector02Chamber02BackgroundEntryLockBasin, ASSET_URLS[ASSET_KEYS.sector02Chamber02BackgroundEntryLockBasin]);
    this.load.image(ASSET_KEYS.sector02Chamber02BackgroundCompressionVault, ASSET_URLS[ASSET_KEYS.sector02Chamber02BackgroundCompressionVault]);
    this.load.image(ASSET_KEYS.sector02Chamber02BackgroundThreshold, ASSET_URLS[ASSET_KEYS.sector02Chamber02BackgroundThreshold]);
    this.load.image(ASSET_KEYS.sector02Chamber02BackgroundClimaxCrucibleGate, ASSET_URLS[ASSET_KEYS.sector02Chamber02BackgroundClimaxCrucibleGate]);
    this.load.image(ASSET_KEYS.sector02Chamber02EnemyBasic01, ASSET_URLS[ASSET_KEYS.sector02Chamber02EnemyBasic01]);
    this.load.image(ASSET_KEYS.sector02Chamber02EnemyBasic02, ASSET_URLS[ASSET_KEYS.sector02Chamber02EnemyBasic02]);
    this.load.image(ASSET_KEYS.sector02Chamber02EnemyElite, ASSET_URLS[ASSET_KEYS.sector02Chamber02EnemyElite]);
    this.load.image(ASSET_KEYS.sector02Chamber02PressureDeacon, ASSET_URLS[ASSET_KEYS.sector02Chamber02PressureDeacon]);
    this.load.image(ASSET_KEYS.sector02Chamber02LoreAltar, ASSET_URLS[ASSET_KEYS.sector02Chamber02LoreAltar]);
    this.load.image(ASSET_KEYS.sector02Chamber02LoreImage, ASSET_URLS[ASSET_KEYS.sector02Chamber02LoreImage]);
    this.load.image(ASSET_KEYS.sector02Chamber02Gate, ASSET_URLS[ASSET_KEYS.sector02Chamber02Gate]);
    this.load.image(ASSET_KEYS.sector02Chamber02Floor, ASSET_URLS[ASSET_KEYS.sector02Chamber02Floor]);
    this.load.image(ASSET_KEYS.sector02Chamber03BackgroundWallModule, ASSET_URLS[ASSET_KEYS.sector02Chamber03BackgroundWallModule]);
    this.load.image(ASSET_KEYS.sector02Chamber03BackgroundEntryCondensers, ASSET_URLS[ASSET_KEYS.sector02Chamber03BackgroundEntryCondensers]);
    this.load.image(ASSET_KEYS.sector02Chamber03BackgroundRefinementKiln, ASSET_URLS[ASSET_KEYS.sector02Chamber03BackgroundRefinementKiln]);
    this.load.image(ASSET_KEYS.sector02Chamber03BackgroundThreshold, ASSET_URLS[ASSET_KEYS.sector02Chamber03BackgroundThreshold]);
    this.load.image(ASSET_KEYS.sector02Chamber03BackgroundBanisherAltar, ASSET_URLS[ASSET_KEYS.sector02Chamber03BackgroundBanisherAltar]);
    this.load.image(ASSET_KEYS.sector02Chamber03EnemyBasic01, ASSET_URLS[ASSET_KEYS.sector02Chamber03EnemyBasic01]);
    this.load.image(ASSET_KEYS.sector02Chamber03EnemyBasic02, ASSET_URLS[ASSET_KEYS.sector02Chamber03EnemyBasic02]);
    this.load.image(ASSET_KEYS.sector02Chamber03EnemyElite, ASSET_URLS[ASSET_KEYS.sector02Chamber03EnemyElite]);
    this.load.image(ASSET_KEYS.sector02Chamber03LoreAltar, ASSET_URLS[ASSET_KEYS.sector02Chamber03LoreAltar]);
    this.load.image(ASSET_KEYS.sector02Chamber03LoreImage, ASSET_URLS[ASSET_KEYS.sector02Chamber03LoreImage]);
    this.load.image(ASSET_KEYS.sector02Chamber03BossSorrowEngine, ASSET_URLS[ASSET_KEYS.sector02Chamber03BossSorrowEngine]);
    this.load.image(ASSET_KEYS.sector02Chamber03Gate, ASSET_URLS[ASSET_KEYS.sector02Chamber03Gate]);
    this.load.image(ASSET_KEYS.sector02Chamber03Floor, ASSET_URLS[ASSET_KEYS.sector02Chamber03Floor]);
    this.load.image(ASSET_KEYS.sector03Chamber01BackgroundEntryGallery, ASSET_URLS[ASSET_KEYS.sector03Chamber01BackgroundEntryGallery]);
    this.load.image(ASSET_KEYS.sector03Chamber01BackgroundOpeningRecess, ASSET_URLS[ASSET_KEYS.sector03Chamber01BackgroundOpeningRecess]);
    this.load.image(ASSET_KEYS.sector03Chamber01BackgroundWallModule01, ASSET_URLS[ASSET_KEYS.sector03Chamber01BackgroundWallModule01]);
    this.load.image(ASSET_KEYS.sector03Chamber01BackgroundWallModule02, ASSET_URLS[ASSET_KEYS.sector03Chamber01BackgroundWallModule02]);
    this.load.image(ASSET_KEYS.sector03Chamber01BackgroundFeatureWall01, ASSET_URLS[ASSET_KEYS.sector03Chamber01BackgroundFeatureWall01]);
    this.load.image(ASSET_KEYS.sector03Chamber01BackgroundFeatureWall02, ASSET_URLS[ASSET_KEYS.sector03Chamber01BackgroundFeatureWall02]);
    this.load.image(ASSET_KEYS.sector03Chamber01BackgroundThreshold, ASSET_URLS[ASSET_KEYS.sector03Chamber01BackgroundThreshold]);
    this.load.image(ASSET_KEYS.sector03Chamber01BackgroundThresholdAlt, ASSET_URLS[ASSET_KEYS.sector03Chamber01BackgroundThresholdAlt]);
    this.load.image(ASSET_KEYS.sector03Chamber01EnemyBasicFailedSaint, ASSET_URLS[ASSET_KEYS.sector03Chamber01EnemyBasicFailedSaint]);
    this.load.image(ASSET_KEYS.sector03Chamber01EnemyBasicBirdJudge, ASSET_URLS[ASSET_KEYS.sector03Chamber01EnemyBasicBirdJudge]);
    this.load.image(ASSET_KEYS.sector03Chamber01EnemyEliteWithheldVessel, ASSET_URLS[ASSET_KEYS.sector03Chamber01EnemyEliteWithheldVessel]);
    this.load.image(ASSET_KEYS.sector03Chamber01LoreApparitionRefused, ASSET_URLS[ASSET_KEYS.sector03Chamber01LoreApparitionRefused]);
    this.load.image(ASSET_KEYS.sector03Chamber01GateRefusalSeal, ASSET_URLS[ASSET_KEYS.sector03Chamber01GateRefusalSeal]);
    this.load.image(ASSET_KEYS.sector03Chamber01BossRefusalMass, ASSET_URLS[ASSET_KEYS.sector03Chamber01BossRefusalMass]);
    this.load.image(ASSET_KEYS.sector03Chamber02BackgroundEntryNarthex, ASSET_URLS[ASSET_KEYS.sector03Chamber02BackgroundEntryNarthex]);
    this.load.image(ASSET_KEYS.sector03Chamber02BackgroundWallModule01, ASSET_URLS[ASSET_KEYS.sector03Chamber02BackgroundWallModule01]);
    this.load.image(ASSET_KEYS.sector03Chamber02BackgroundWallModule02, ASSET_URLS[ASSET_KEYS.sector03Chamber02BackgroundWallModule02]);
    this.load.image(ASSET_KEYS.sector03Chamber02BackgroundMaskGalleryOpening, ASSET_URLS[ASSET_KEYS.sector03Chamber02BackgroundMaskGalleryOpening]);
    this.load.image(ASSET_KEYS.sector03Chamber02BackgroundThreshold, ASSET_URLS[ASSET_KEYS.sector03Chamber02BackgroundThreshold]);
    this.load.image(ASSET_KEYS.sector03Chamber02BackgroundClimaxSanctum, ASSET_URLS[ASSET_KEYS.sector03Chamber02BackgroundClimaxSanctum]);
    this.load.image(ASSET_KEYS.sector03Chamber02LoreAltar, ASSET_URLS[ASSET_KEYS.sector03Chamber02LoreAltar]);
    this.load.image(ASSET_KEYS.sector03Chamber02LoreImage, ASSET_URLS[ASSET_KEYS.sector03Chamber02LoreImage]);
    this.load.image(ASSET_KEYS.sector03Chamber02EnemyBasicVeilStripper, ASSET_URLS[ASSET_KEYS.sector03Chamber02EnemyBasicVeilStripper]);
    this.load.image(ASSET_KEYS.sector03Chamber02EnemyBasicMaskHusk, ASSET_URLS[ASSET_KEYS.sector03Chamber02EnemyBasicMaskHusk]);
    this.load.image(ASSET_KEYS.sector03Chamber02EnemyBasicBlindCantor, ASSET_URLS[ASSET_KEYS.sector03Chamber02EnemyBasicBlindCantor]);
    this.load.image(ASSET_KEYS.sector03Chamber02EnemyBasicFaceCollector, ASSET_URLS[ASSET_KEYS.sector03Chamber02EnemyBasicFaceCollector]);
    this.load.image(ASSET_KEYS.sector03Chamber02EnemyEliteDoubleFacedNull, ASSET_URLS[ASSET_KEYS.sector03Chamber02EnemyEliteDoubleFacedNull]);
    this.load.image(ASSET_KEYS.sector03Chamber02BossMisassignedSeraph, ASSET_URLS[ASSET_KEYS.sector03Chamber02BossMisassignedSeraph]);
    this.load.image(ASSET_KEYS.sector03Chamber02PropMaskRack, ASSET_URLS[ASSET_KEYS.sector03Chamber02PropMaskRack]);
    this.load.image(ASSET_KEYS.sector03Chamber02PropBlindMirror, ASSET_URLS[ASSET_KEYS.sector03Chamber02PropBlindMirror]);
    this.load.image(ASSET_KEYS.sector03Chamber02PropBonusAltar, ASSET_URLS[ASSET_KEYS.sector03Chamber02PropBonusAltar]);
    this.load.image(ASSET_KEYS.sector03Chamber03BackgroundEntryNave, ASSET_URLS[ASSET_KEYS.sector03Chamber03BackgroundEntryNave]);
    this.load.image(ASSET_KEYS.sector03Chamber03BackgroundWallModule01, ASSET_URLS[ASSET_KEYS.sector03Chamber03BackgroundWallModule01]);
    this.load.image(ASSET_KEYS.sector03Chamber03BackgroundWallModule02, ASSET_URLS[ASSET_KEYS.sector03Chamber03BackgroundWallModule02]);
    this.load.image(ASSET_KEYS.sector03Chamber03BackgroundWallModule03, ASSET_URLS[ASSET_KEYS.sector03Chamber03BackgroundWallModule03]);
    this.load.image(ASSET_KEYS.sector03Chamber03BackgroundRefusalOpening, ASSET_URLS[ASSET_KEYS.sector03Chamber03BackgroundRefusalOpening]);
    this.load.image(ASSET_KEYS.sector03Chamber03BackgroundThreshold, ASSET_URLS[ASSET_KEYS.sector03Chamber03BackgroundThreshold]);
    this.load.image(ASSET_KEYS.sector03Chamber03BackgroundBossArena, ASSET_URLS[ASSET_KEYS.sector03Chamber03BackgroundBossArena]);
    this.load.image(ASSET_KEYS.sector03Chamber03AltarLoreShrine, ASSET_URLS[ASSET_KEYS.sector03Chamber03AltarLoreShrine]);
    this.load.image(ASSET_KEYS.sector03Chamber03LoreImage, ASSET_URLS[ASSET_KEYS.sector03Chamber03LoreImage]);
    this.load.image(ASSET_KEYS.sector03Chamber03EnemyBasicBarrierSinger, ASSET_URLS[ASSET_KEYS.sector03Chamber03EnemyBasicBarrierSinger]);
    this.load.image(ASSET_KEYS.sector03Chamber03EnemyBasicNullClaimant, ASSET_URLS[ASSET_KEYS.sector03Chamber03EnemyBasicNullClaimant]);
    this.load.image(ASSET_KEYS.sector03Chamber03EnemyBasicRefusalWarden, ASSET_URLS[ASSET_KEYS.sector03Chamber03EnemyBasicRefusalWarden]);
    this.load.image(ASSET_KEYS.sector03Chamber03EnemyBasicSealedArchetype, ASSET_URLS[ASSET_KEYS.sector03Chamber03EnemyBasicSealedArchetype]);
    this.load.image(ASSET_KEYS.sector03Chamber03EnemyEliteNonentryArchon, ASSET_URLS[ASSET_KEYS.sector03Chamber03EnemyEliteNonentryArchon]);
    this.load.image(ASSET_KEYS.sector03Chamber03BossFirstRefused, ASSET_URLS[ASSET_KEYS.sector03Chamber03BossFirstRefused]);
    this.load.image(ASSET_KEYS.sector04Chamber01BackgroundEntryTerrace, ASSET_URLS[ASSET_KEYS.sector04Chamber01BackgroundEntryTerrace]);
    this.load.image(ASSET_KEYS.sector04Chamber01BackgroundWallModule01, ASSET_URLS[ASSET_KEYS.sector04Chamber01BackgroundWallModule01]);
    this.load.image(ASSET_KEYS.sector04Chamber01BackgroundWallModule02, ASSET_URLS[ASSET_KEYS.sector04Chamber01BackgroundWallModule02]);
    this.load.image(ASSET_KEYS.sector04Chamber01BackgroundReductionDisplay, ASSET_URLS[ASSET_KEYS.sector04Chamber01BackgroundReductionDisplay]);
    this.load.image(ASSET_KEYS.sector04Chamber01BackgroundThreshold, ASSET_URLS[ASSET_KEYS.sector04Chamber01BackgroundThreshold]);
    this.load.image(ASSET_KEYS.sector04Chamber01AltarLoreShrine, ASSET_URLS[ASSET_KEYS.sector04Chamber01AltarLoreShrine]);
    this.load.image(ASSET_KEYS.sector04Chamber01LoreImage, ASSET_URLS[ASSET_KEYS.sector04Chamber01LoreImage]);
    this.load.image(ASSET_KEYS.sector04Chamber01EnemyBasicBellHerder, ASSET_URLS[ASSET_KEYS.sector04Chamber01EnemyBasicBellHerder]);
    this.load.image(ASSET_KEYS.sector04Chamber01EnemyBasicBranchHusk, ASSET_URLS[ASSET_KEYS.sector04Chamber01EnemyBasicBranchHusk]);
    this.load.image(ASSET_KEYS.sector04Chamber01EnemyBasicShearAttendant, ASSET_URLS[ASSET_KEYS.sector04Chamber01EnemyBasicShearAttendant]);
    this.load.image(ASSET_KEYS.sector04Chamber01EnemyEliteReductionSaint, ASSET_URLS[ASSET_KEYS.sector04Chamber01EnemyEliteReductionSaint]);
    this.load.image(ASSET_KEYS.sector04Chamber02BackgroundEntry, ASSET_URLS[ASSET_KEYS.sector04Chamber02BackgroundEntry]);
    this.load.image(ASSET_KEYS.sector04Chamber02BackgroundWallModule01, ASSET_URLS[ASSET_KEYS.sector04Chamber02BackgroundWallModule01]);
    this.load.image(ASSET_KEYS.sector04Chamber02BackgroundWallModule02, ASSET_URLS[ASSET_KEYS.sector04Chamber02BackgroundWallModule02]);
    this.load.image(ASSET_KEYS.sector04Chamber02BackgroundOpening, ASSET_URLS[ASSET_KEYS.sector04Chamber02BackgroundOpening]);
    this.load.image(ASSET_KEYS.sector04Chamber02BackgroundThreshold, ASSET_URLS[ASSET_KEYS.sector04Chamber02BackgroundThreshold]);
    this.load.image(ASSET_KEYS.sector04Chamber02BackgroundBossDais, ASSET_URLS[ASSET_KEYS.sector04Chamber02BackgroundBossDais]);
    this.load.image(ASSET_KEYS.sector04Chamber02AltarLore, ASSET_URLS[ASSET_KEYS.sector04Chamber02AltarLore]);
    this.load.image(ASSET_KEYS.sector04Chamber02AltarReturn, ASSET_URLS[ASSET_KEYS.sector04Chamber02AltarReturn]);
    this.load.image(ASSET_KEYS.sector04Chamber02EnemyBasic01, ASSET_URLS[ASSET_KEYS.sector04Chamber02EnemyBasic01]);
    this.load.image(ASSET_KEYS.sector04Chamber02EnemyBasic02, ASSET_URLS[ASSET_KEYS.sector04Chamber02EnemyBasic02]);
    this.load.image(ASSET_KEYS.sector04Chamber02EnemyElite, ASSET_URLS[ASSET_KEYS.sector04Chamber02EnemyElite]);
    this.load.image(ASSET_KEYS.sector04Chamber02PropGate, ASSET_URLS[ASSET_KEYS.sector04Chamber02PropGate]);
    this.load.image(ASSET_KEYS.sector04Chamber02PropThresholdDoor, ASSET_URLS[ASSET_KEYS.sector04Chamber02PropThresholdDoor]);
    this.load.image(ASSET_KEYS.sector02PressureShardProjectile, ASSET_URLS[ASSET_KEYS.sector02PressureShardProjectile]);
    this.load.image(ASSET_KEYS.bossPit01BackgroundHornGate, ASSET_URLS[ASSET_KEYS.bossPit01BackgroundHornGate]);
    this.load.image(ASSET_KEYS.bossPit01TheHornGateWitness, ASSET_URLS[ASSET_KEYS.bossPit01TheHornGateWitness]);
    this.load.image(ASSET_KEYS.bossPit01AltarTrap, ASSET_URLS[ASSET_KEYS.bossPit01AltarTrap]);
    this.load.image(ASSET_KEYS.bossPit01AltarSuper, ASSET_URLS[ASSET_KEYS.bossPit01AltarSuper]);
    this.load.image(ASSET_KEYS.bossPit02BackgroundAshProphecyHall, ASSET_URLS[ASSET_KEYS.bossPit02BackgroundAshProphecyHall]);
    this.load.image(ASSET_KEYS.bossPit02StarvedProphetOfAsh, ASSET_URLS[ASSET_KEYS.bossPit02StarvedProphetOfAsh]);
    this.load.image(ASSET_KEYS.bossPit02AltarTrap, ASSET_URLS[ASSET_KEYS.bossPit02AltarTrap]);
    this.load.image(ASSET_KEYS.bossPit02AltarSuper, ASSET_URLS[ASSET_KEYS.bossPit02AltarSuper]);
    this.load.image(ASSET_KEYS.bossPit03BackgroundHollowSkyTheatre, ASSET_URLS[ASSET_KEYS.bossPit03BackgroundHollowSkyTheatre]);
    this.load.image(ASSET_KEYS.bossPit03RedMaskHollowSky, ASSET_URLS[ASSET_KEYS.bossPit03RedMaskHollowSky]);
    this.load.image(ASSET_KEYS.bossPit05AltarTrap, ASSET_URLS[ASSET_KEYS.bossPit05AltarTrap]);
    this.load.image(ASSET_KEYS.bossPit05AltarSuper, ASSET_URLS[ASSET_KEYS.bossPit05AltarSuper]);
    this.load.image(ASSET_KEYS.bossPit19BackgroundReliquaryStalker, ASSET_URLS[ASSET_KEYS.bossPit19BackgroundReliquaryStalker]);
    this.load.image(ASSET_KEYS.bossPit19ReliquaryStalker, ASSET_URLS[ASSET_KEYS.bossPit19ReliquaryStalker]);
    this.load.image(ASSET_KEYS.bossPit20HornedMothJudge, ASSET_URLS[ASSET_KEYS.bossPit20HornedMothJudge]);
    this.load.image(ASSET_KEYS.enemyGoreClusterMeatBone01, ASSET_URLS[ASSET_KEYS.enemyGoreClusterMeatBone01]);
    this.load.image(ASSET_KEYS.brutalityBasicChunkBurst01, ASSET_URLS[ASSET_KEYS.brutalityBasicChunkBurst01]);
    this.load.spritesheet(ASSET_KEYS.player, ASSET_URLS[ASSET_KEYS.player], {
      frameWidth: 658,
      frameHeight: 1300,
      endFrame: 5
    });
    this.load.spritesheet(ASSET_KEYS.playerIdle, ASSET_URLS[ASSET_KEYS.playerIdle], {
      frameWidth: 560,
      frameHeight: 1335,
      endFrame: 4
    });
    this.load.spritesheet(ASSET_KEYS.playerBrutalityWalk, ASSET_URLS[ASSET_KEYS.playerBrutalityWalk], {
      frameWidth: 570,
      frameHeight: 732,
      endFrame: 4
    });
    this.load.spritesheet(ASSET_KEYS.playerBrutalityIdle, ASSET_URLS[ASSET_KEYS.playerBrutalityIdle], {
      frameWidth: 440,
      frameHeight: 732,
      endFrame: 4
    });
    this.load.spritesheet(ASSET_KEYS.s1c1Basic01IdleStrip, ASSET_URLS[ASSET_KEYS.s1c1Basic01IdleStrip], {
      frameWidth: 3072,
      frameHeight: 3072,
      endFrame: 5
    });
    this.load.spritesheet(ASSET_KEYS.s1c1Basic01WalkStrip, ASSET_URLS[ASSET_KEYS.s1c1Basic01WalkStrip], {
      frameWidth: 3072,
      frameHeight: 3072,
      endFrame: 5
    });
    this.load.spritesheet(ASSET_KEYS.s1c1Basic01AttackStrip, ASSET_URLS[ASSET_KEYS.s1c1Basic01AttackStrip], {
      frameWidth: 3072,
      frameHeight: 3072,
      endFrame: 5
    });
    this.load.image(ASSET_KEYS.playerWeaponHammer01, ASSET_URLS[ASSET_KEYS.playerWeaponHammer01]);
    this.load.image(ASSET_KEYS.playerWeaponHammerOfBanishment01, ASSET_URLS[ASSET_KEYS.playerWeaponHammerOfBanishment01]);
    this.load.image(ASSET_KEYS.skitter, ASSET_URLS[ASSET_KEYS.skitter]);
    this.load.image(ASSET_KEYS.sentinel, ASSET_URLS[ASSET_KEYS.sentinel]);
    this.load.image(ASSET_KEYS.laughingEngine, ASSET_URLS[ASSET_KEYS.laughingEngine]);
    this.preloadAudioAsset(ASSET_KEYS.playerFootstepSlate01);
    this.preloadAudioAsset(ASSET_KEYS.playerFootstepSlate02);
    this.preloadAudioAsset(ASSET_KEYS.playerFootstepSlate03);
    this.preloadAudioAsset(ASSET_KEYS.playerFootstepSlate04);
    this.preloadAudioAsset(ASSET_KEYS.playerAttack);
    this.preloadAudioAsset(ASSET_KEYS.playerAttackFallback);
    this.preloadAudioAsset(ASSET_KEYS.playerHit);
    this.preloadAudioAsset(ASSET_KEYS.playerHitFallback);
    this.preloadAudioAsset(ASSET_KEYS.playerHurt);
    this.preloadAudioAsset(ASSET_KEYS.playerHurtFallback);
    this.preloadAudioAsset(ASSET_KEYS.playerDeath);
    this.preloadAudioAsset(ASSET_KEYS.playerDeathFallback);
    this.preloadAudioAsset(ASSET_KEYS.enemyAttack);
    this.preloadAudioAsset(ASSET_KEYS.enemyAttackFallback);
    this.preloadAudioAsset(ASSET_KEYS.enemyHurt);
    this.preloadAudioAsset(ASSET_KEYS.enemyHurtFallback);
    this.preloadAudioAsset(ASSET_KEYS.enemyDeath);
    this.preloadAudioAsset(ASSET_KEYS.enemyDeathFallback);
    this.preloadAudioAsset(ASSET_KEYS.tollKeeperAttack);
    this.preloadAudioAsset(ASSET_KEYS.tollKeeperHurt);
    this.preloadAudioAsset(ASSET_KEYS.tollKeeperDeath);
    this.preloadAudioAsset(ASSET_KEYS.minibossAttack);
    this.preloadAudioAsset(ASSET_KEYS.minibossAttackFallback);
    this.preloadAudioAsset(ASSET_KEYS.minibossHurt);
    this.preloadAudioAsset(ASSET_KEYS.minibossHurtFallback);
    this.preloadAudioAsset(ASSET_KEYS.minibossDeath);
    this.preloadAudioAsset(ASSET_KEYS.minibossDeathFallback);
    this.preloadAudioAsset(ASSET_KEYS.gateInteract);
    this.preloadAudioAsset(ASSET_KEYS.gateUnlock);
    this.preloadAudioAsset(ASSET_KEYS.loreEnter);
    this.preloadAudioAsset(ASSET_KEYS.loreExit);
    this.preloadAudioAsset(ASSET_KEYS.banishmentSting);
    this.preloadAudioAsset(ASSET_KEYS.ambientChamber01Loop01);
    this.preloadAudioAsset(ASSET_KEYS.ambientChamber02Loop01);
  }

  preloadAudioAsset(assetKey) {
    const assetUrl = ASSET_URLS[assetKey];
    if (!assetUrl) {
      return;
    }

    this.load.audio(assetKey, assetUrl);
  }

  create() {
    const skipPreTitle = Boolean(this.scene.settings.data?.skipPreTitle);
    this.hasStarted = false;
    this.isStarting = false;
    this.cameras.main.setBackgroundColor('#110d0c');
    this.stopPersistentAmbient();

    if (DEBUG_BOOT_OVERRIDES.skipTitleAndBootSceneDirect) {
      this.beginChamber();
      return;
    }

    if (!skipPreTitle) {
      this.scene.start('PreTitleScene');
      return;
    }

    this.audioDirector = new AudioDirector(this);
    this.audioDirector.playAmbientLoop(ASSET_KEYS.ambientChamber01Loop01, { volume: TITLE_SCENE_AUDIO.ambientVolume });

    this.createTitleVisuals();
    this.layoutTitleVisuals();
    this.scale.on('resize', this.layoutTitleVisuals, this);

    this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyEnter.on('down', () => this.beginChamber());
    this.keySpace.on('down', () => this.beginChamber());

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.layoutTitleVisuals, this);
      this.keyEnter?.off('down');
      this.keySpace?.off('down');
      this.audioDirector?.shutdown();
      this.audioDirector = null;
    });
  }

  beginChamber() {
    this.beginScene('Chamber01Scene');
  }

  beginDevChamber() {
    this.beginScene('Chamber03Scene');
  }

  beginScene(targetSceneKey) {
    if (this.hasStarted || this.isStarting) {
      return;
    }

    this.isStarting = true;
    this.audioDirector?.stopAmbientLoop({ fadeOut: false });
    this.playStartGameSfx();
    this.disableMenuButtons();
    vesselIntegrityState.resetForFreshRun();

    if (this.sound?.context?.state === 'suspended') {
      this.sound.context.resume().catch(() => {
        // Audio unlock must never block scene transition on mobile browsers.
      });
    }

    this.time.delayedCall(TITLE_SCENE_AUDIO.startConfirmDelayMs, () => {
      this.hasStarted = true;
      const bootTargetScene = DEBUG_BOOT_OVERRIDES.startScene
        ?? targetSceneKey
        ?? (DEBUG_BOOT_OVERRIDES.skipTitleAndBootSceneDirect ? 'Sector04Chamber01Scene' : 'Chamber01Scene');
      this.scene.start(bootTargetScene);
    });
  }

  playStartGameSfx() {
    if (!this.sound || this.sound.mute || !this.cache.audio.exists(ASSET_KEYS.banishmentSting)) {
      return;
    }

    const startGameSfx = this.sound.add(ASSET_KEYS.banishmentSting, {
      volume: TITLE_SCENE_AUDIO.startGameSfxVolume
    });
    startGameSfx.once('complete', () => {
      startGameSfx.destroy();
    });
    startGameSfx.play();
  }

  createTitleVisuals() {
    this.layoutElements.backdropShade = this.add.rectangle(0, 0, 1, 1, 0x060505, 0.9).setOrigin(0).setDepth(2);
    this.layoutElements.background = this.add.image(0, 0, ASSET_KEYS.titleScreenBackground01).setDepth(0);
    this.layoutElements.backgroundVeil = this.add.rectangle(0, 0, 1, 1, 0x090706, 0.34).setOrigin(0).setDepth(3);

    if (this.textures.exists(ASSET_KEYS.titleLogoOuterEngine01)) {
      this.layoutElements.titleLogo = this.add.image(0, 0, ASSET_KEYS.titleLogoOuterEngine01).setDepth(5);
    } else {
      this.layoutElements.titleText = this.add
        .text(0, 0, 'THE OUTER ENGINE', {
          fontFamily: 'monospace',
          fontSize: '46px',
          color: '#ded1bf',
          align: 'center',
          stroke: '#0f0a09',
          strokeThickness: 8
        })
        .setOrigin(0.5)
        .setDepth(5);
    }

    this.layoutElements.subtitle = this.add
      .text(0, 0, 'RITUAL DESCENT PROTOCOL', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#95a67f',
        align: 'center'
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.layoutElements.instructions = this.add
      .text(0, 0, 'MOVE: ARROWS  ATTACK: X  RITE: E  RESTART: R', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#c3b49f',
        align: 'center'
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.layoutElements.menuPanel = this.add.rectangle(0, 0, 1, 1, 0x0f0c0c, 0.7).setDepth(6.4);
    this.layoutElements.menuPanel.setStrokeStyle(2, 0x8c786b, 0.86);

    this.menuButtons = this.menuOptions.map((option) => this.createMenuButton(option));
  }

  createMenuButton(option) {
    const button = this.add.rectangle(0, 0, 1, 1, 0x191311, 0.88).setDepth(7).setStrokeStyle(2, 0x9e8b79, 0.95);
    const label = this.add
      .text(0, 0, option.label, {
        fontFamily: 'monospace',
        fontSize: '28px',
        color: '#e2d6c1',
        align: 'center'
      })
      .setOrigin(0.5)
      .setDepth(7.2);

    button.setInteractive({ useHandCursor: true });
    button.on('pointerover', () => {
      if (this.isStarting) {
        return;
      }
      button.setFillStyle(0x2a201c, 0.96);
      label.setColor('#f0e3cf');
    });
    button.on('pointerout', () => {
      button.setFillStyle(0x191311, 0.88);
      label.setColor('#e2d6c1');
    });
    button.on('pointerdown', () => option.action());

    return { button, label };
  }

  disableMenuButtons() {
    this.menuButtons.forEach(({ button, label }) => {
      button.disableInteractive();
      button.setFillStyle(0x17110f, 0.7);
      label.setAlpha(0.7);
    });
  }

  layoutTitleVisuals() {
    const width = this.scale.width;
    const height = this.scale.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const isPortrait = height >= width;
    const safeTop = this.getSafeAreaInsetPx('top');
    const safeBottom = this.getSafeAreaInsetPx('bottom');

    this.layoutElements.backdropShade.setSize(width, height);
    this.layoutElements.background
      .setPosition(centerX, centerY)
      .setDisplaySize(Math.max(width, height) * 1.24, Math.max(width, height) * 0.82)
      .setAlpha(0.95)
      .setTint(0xb5a28d);
    this.layoutElements.backgroundVeil.setSize(width, height);

    if (this.layoutElements.titleLogo) {
      const maxLogoWidth = Math.min(width * 0.86, isPortrait ? 460 : 640);
      const logoTexture = this.textures.get(ASSET_KEYS.titleLogoOuterEngine01).getSourceImage();
      const logoRatio = logoTexture.width / logoTexture.height;
      this.layoutElements.titleLogo
        .setPosition(centerX, safeTop + (isPortrait ? height * 0.2 : height * 0.24))
        .setDisplaySize(maxLogoWidth, maxLogoWidth / logoRatio);
    } else {
      this.layoutElements.titleText
        .setPosition(centerX, safeTop + (isPortrait ? height * 0.2 : height * 0.24))
        .setFontSize(isPortrait ? '38px' : '52px');
    }

    this.layoutElements.subtitle
      .setPosition(centerX, safeTop + (isPortrait ? height * 0.36 : height * 0.43))
      .setFontSize(isPortrait ? '14px' : '16px');
    this.layoutElements.instructions
      .setPosition(centerX, height - safeBottom - (isPortrait ? 28 : 22))
      .setFontSize(isPortrait ? '12px' : '14px');

    const buttonWidth = Math.min(width - 44, isPortrait ? 352 : 420);
    const buttonHeight = isPortrait ? 74 : 80;
    const panelPadding = isPortrait ? 18 : 22;
    const buttonGap = 14;
    const stackHeight = this.menuButtons.length * buttonHeight + Math.max(0, this.menuButtons.length - 1) * buttonGap;
    const panelWidth = buttonWidth + panelPadding * 2;
    const panelHeight = stackHeight + panelPadding * 2;
    const panelY = centerY + (isPortrait ? height * 0.18 : height * 0.16);

    this.layoutElements.menuPanel.setPosition(centerX, panelY).setSize(panelWidth, panelHeight);

    this.menuButtons.forEach(({ button, label }, index) => {
      const y = panelY - stackHeight / 2 + buttonHeight / 2 + index * (buttonHeight + buttonGap);
      button.setPosition(centerX, y).setSize(buttonWidth, buttonHeight);
      label.setPosition(centerX, y).setFontSize(isPortrait ? '24px' : '28px');
    });
  }

  getSafeAreaInsetPx(edge = 'top') {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return 0;
    }

    const cssVar = `--safe-area-inset-${edge}`;
    const rawValue = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
    const parsed = Number.parseFloat(rawValue);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  stopPersistentAmbient() {
    this.sound?.getAll?.().forEach((sound) => {
      if (sound?.key === ASSET_KEYS.ambientChamber01Loop01 || sound?.key === ASSET_KEYS.ambientChamber02Loop01) {
        sound.stop();
        sound.destroy();
      }
    });
  }
}
