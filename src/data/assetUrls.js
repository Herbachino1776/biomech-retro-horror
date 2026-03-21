import chamberBackgroundUrl from '../../assets/concepts/chamber01-background-01.png';
import chamber01WallUrl from '../../art/raw/chamber01/chamber_wall_repeatable_01_source.png';
import chamber01FloorStripUrl from '../../art/raw/chamber01/floor_strip_repeatable_01_source.png';
import chamber01RibArchUrl from '../../art/raw/chamber01/foreground_rib_arch_alpha_01_source.png';
import chamber01ShrineUrl from '../../art/raw/chamber01/lore_shrine_alpha_01_source.png';
import chamber01LaughingEngineWorldUrl from '../../art/raw/chamber01/laughing_engine_world_insert_alpha_01_source.png';
import chamber01DeadgodCutsceneUrl from '../../art/raw/chamber01/chamber01_deadgod_cutscene_01_source.png';
import chamber01HalfSkullMinibossUrl from '../../art/raw/chamber01/chamber01_halfskull_miniboss_01_left_alpha.png';
import chamber02VertebralHornGateUrl from '../../art/raw/chamber02/vertebral_horn_gate_01_source.png';
import chamber02BackgroundPlateUrl from '../../art/raw/chamber02/chamber02_background_plate_01_source.png';
import chamber02FloorStripUrl from '../../art/raw/chamber02/chamber02_floor_strip_01_source.png';
import chamber02ForegroundHornArchUrl from '../../art/raw/chamber02/foreground_vertebral_horn_arch_01_source.png';
import chamber02TollKeeperSkitterUrl from '../../art/raw/chamber02/chamber02_tollkeeper_skitter_01_left_alpha.png';
import chamber02ExitGateLoreUrl from '../../art/raw/chamber02/chamber02_exit_gate_lore_01_source.png';
import chamber03WallModuleUrl from '../../art/raw/chamber03/chamber03_bg_wall_module_01_source.png';
import chamber03EntryNaveUrl from '../../art/raw/chamber03/chamber03_bg_entry_nave_01_source.png';
import chamber03BossDaisUrl from '../../art/raw/chamber03/chamber03_bg_boss_dais_01_source.png';
import chamber03PrecentorBossUrl from '../../art/raw/chamber03/boss_chamber03_precentor_main_01_alpha.png';
import chamber03LoreUrl from '../../art/raw/chamber03/chamber03_lore_01_source.png';
import chamber03ChoirOpeningUrl from '../../art/raw/chamber03/chamber03_bg_choir_opening_01_source.png';
import chamber03ThresholdUrl from '../../art/raw/chamber03/chamber03_bg_threshold_01_source.png';
import playerConceptUrl from '../../assets/concepts/player-concept-03-right-alpha.png';
import skitterConceptUrl from '../../assets/concepts/enemy-concept-01-left.png';
import sentinelConceptUrl from '../../assets/concepts/sentinel-concept-01.png';
import laughingEngineConceptUrl from '../../assets/concepts/laughing-engine-concept-01.png';
import biomechUiFrameUrl from '../../assets/ui/biomech-ui-frame-01.png';
import playerFootstepSlate01Url from '../../assets/audio/footsteps/player_footstep_slate_01.ogg';
import playerFootstepSlate02Url from '../../assets/audio/footsteps/player_footstep_slate_02.ogg';
import playerFootstepSlate03Url from '../../assets/audio/footsteps/player_footstep_slate_03.ogg';
import playerFootstepSlate04Url from '../../assets/audio/footsteps/player_footstep_slate_04.ogg';
import playerAttack01Url from '../../assets/audio/player/player_attack_01.ogg';
import playerHit01Url from '../../assets/audio/player/player_hit_01.ogg';
import playerHurt01Url from '../../assets/audio/player/player_hurt_01.ogg';
import playerDeath01Url from '../../assets/audio/player/player_death_01.ogg';
import skitterAttack01Url from '../../assets/audio/enemy/skitter_attack_01.ogg';
import skitterHurt01Url from '../../assets/audio/enemy/skitter_hurt_01.ogg';
import skitterDeath01Url from '../../assets/audio/enemy/skitter_death_01.ogg';
import tollKeeperAttack01Url from '../../assets/audio/enemy/tollkeeper_attack_01.ogg';
import tollKeeperHurt01Url from '../../assets/audio/enemy/tollkeeper_hurt_01.ogg';
import tollKeeperDeath01Url from '../../assets/audio/enemy/tollkeeper_death_01.ogg';
import minibossAttack01Url from '../../assets/audio/boss/miniboss_attack_01.ogg';
import minibossHurt01Url from '../../assets/audio/boss/miniboss_hurt_01.ogg';
import minibossDeath01Url from '../../assets/audio/boss/miniboss_death_01.ogg';
import gateInteract01Url from '../../assets/audio/ui/gate_interact_01.ogg';
import gateUnlock01Url from '../../assets/audio/ui/gate_unlock_01.ogg';
import loreEnter01Url from '../../assets/audio/ui/lore_enter_01.ogg';
import loreExit01Url from '../../assets/audio/ui/lore_exit_01.ogg';
import banishmentSting01Url from '../../assets/audio/ui/banishment_sting_01.ogg';
import ambientChamber01Loop01Url from '../../assets/audio/ambient/ambient_chamber01_loop_01.ogg';
import ambientChamber02Loop01Url from '../../assets/audio/ambient/ambient_chamber02_loop_01.ogg';

import { PROCEDURAL_AUDIO_URLS } from '../audio/proceduralAudio.js';
import { ASSET_KEYS } from './assetKeys.js';

export const ASSET_URLS = {
  [ASSET_KEYS.chamberBackground]: chamberBackgroundUrl,
  [ASSET_KEYS.chamber01Wall]: chamber01WallUrl,
  [ASSET_KEYS.chamber01FloorStrip]: chamber01FloorStripUrl,
  [ASSET_KEYS.chamber01RibArch]: chamber01RibArchUrl,
  [ASSET_KEYS.chamber01Shrine]: chamber01ShrineUrl,
  [ASSET_KEYS.chamber01LaughingEngineWorld]: chamber01LaughingEngineWorldUrl,
  [ASSET_KEYS.chamber01DeadgodCutscene]: chamber01DeadgodCutsceneUrl,
  [ASSET_KEYS.chamber01HalfSkullMiniboss]: chamber01HalfSkullMinibossUrl,
  [ASSET_KEYS.chamber02VertebralHornGate]: chamber02VertebralHornGateUrl,
  [ASSET_KEYS.chamber02BackgroundPlate]: chamber02BackgroundPlateUrl,
  [ASSET_KEYS.chamber02FloorStrip]: chamber02FloorStripUrl,
  [ASSET_KEYS.chamber02ForegroundHornArch]: chamber02ForegroundHornArchUrl,
  [ASSET_KEYS.chamber02TollKeeperSkitter]: chamber02TollKeeperSkitterUrl,
  [ASSET_KEYS.chamber02ExitGateLore]: chamber02ExitGateLoreUrl,
  [ASSET_KEYS.chamber03WallModule]: chamber03WallModuleUrl,
  [ASSET_KEYS.chamber03EntryNave]: chamber03EntryNaveUrl,
  [ASSET_KEYS.chamber03BossDais]: chamber03BossDaisUrl,
  [ASSET_KEYS.chamber03PrecentorBoss]: chamber03PrecentorBossUrl,
  [ASSET_KEYS.chamber03Lore]: chamber03LoreUrl,
  [ASSET_KEYS.chamber03ChoirOpening]: chamber03ChoirOpeningUrl,
  [ASSET_KEYS.chamber03Threshold]: chamber03ThresholdUrl,
  [ASSET_KEYS.player]: playerConceptUrl,
  [ASSET_KEYS.skitter]: skitterConceptUrl,
  [ASSET_KEYS.sentinel]: sentinelConceptUrl,
  [ASSET_KEYS.laughingEngine]: laughingEngineConceptUrl,
  [ASSET_KEYS.uiFrame]: biomechUiFrameUrl,
  [ASSET_KEYS.playerFootstepSlate01]: playerFootstepSlate01Url,
  [ASSET_KEYS.playerFootstepSlate02]: playerFootstepSlate02Url,
  [ASSET_KEYS.playerFootstepSlate03]: playerFootstepSlate03Url,
  [ASSET_KEYS.playerFootstepSlate04]: playerFootstepSlate04Url,
  [ASSET_KEYS.playerAttack]: playerAttack01Url,
  [ASSET_KEYS.playerAttackFallback]: PROCEDURAL_AUDIO_URLS.playerAttack,
  [ASSET_KEYS.playerHit]: playerHit01Url,
  [ASSET_KEYS.playerHitFallback]: PROCEDURAL_AUDIO_URLS.playerHit,
  [ASSET_KEYS.playerHurt]: playerHurt01Url,
  [ASSET_KEYS.playerHurtFallback]: PROCEDURAL_AUDIO_URLS.playerHurt,
  [ASSET_KEYS.playerDeath]: playerDeath01Url,
  [ASSET_KEYS.playerDeathFallback]: PROCEDURAL_AUDIO_URLS.playerDeath,
  [ASSET_KEYS.enemyAttack]: skitterAttack01Url,
  [ASSET_KEYS.enemyAttackFallback]: PROCEDURAL_AUDIO_URLS.enemyAttack,
  [ASSET_KEYS.enemyHurt]: skitterHurt01Url,
  [ASSET_KEYS.enemyHurtFallback]: PROCEDURAL_AUDIO_URLS.enemyHurt,
  [ASSET_KEYS.enemyDeath]: skitterDeath01Url,
  [ASSET_KEYS.enemyDeathFallback]: PROCEDURAL_AUDIO_URLS.enemyDeath,
  [ASSET_KEYS.tollKeeperAttack]: tollKeeperAttack01Url,
  [ASSET_KEYS.tollKeeperHurt]: tollKeeperHurt01Url,
  [ASSET_KEYS.tollKeeperDeath]: tollKeeperDeath01Url,
  [ASSET_KEYS.minibossAttack]: minibossAttack01Url,
  [ASSET_KEYS.minibossAttackFallback]: PROCEDURAL_AUDIO_URLS.minibossAttack,
  [ASSET_KEYS.minibossHurt]: minibossHurt01Url,
  [ASSET_KEYS.minibossHurtFallback]: PROCEDURAL_AUDIO_URLS.minibossHurt,
  [ASSET_KEYS.minibossDeath]: minibossDeath01Url,
  [ASSET_KEYS.minibossDeathFallback]: PROCEDURAL_AUDIO_URLS.minibossDeath,
  [ASSET_KEYS.gateInteract]: gateInteract01Url,
  [ASSET_KEYS.gateUnlock]: gateUnlock01Url,
  [ASSET_KEYS.loreEnter]: loreEnter01Url,
  [ASSET_KEYS.loreExit]: loreExit01Url,
  [ASSET_KEYS.banishmentSting]: banishmentSting01Url,
  [ASSET_KEYS.ambientChamber01Loop01]: ambientChamber01Loop01Url,
  [ASSET_KEYS.ambientChamber02Loop01]: ambientChamber02Loop01Url
};
