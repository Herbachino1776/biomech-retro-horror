# Boss Pack Catalog

## Purpose
This document records the current `art/raw/bosspit/` ingestion state so boss-pit, miniboss, and full-boss deployment can pull from a stable, named library without re-scanning raw filenames each pass.

## Filename Pattern Snapshot
The folder currently contains multiple naming families:
- canonical numbered boss pit pattern: `boss_pit_<nn>_<descriptor>_alpha...png`
- canonical numbered background pattern: `boss_pit_<nn>_bg_<descriptor>.png`
- alternate background pattern: `Pit_BG_<Descriptor>.png`
- altar pattern: `boss_pit_<nn>_altar_bosspit.png` and `boss_pit_<nn>_altar_super.png`
- ambiguous legacy/unpaired pattern: `boss_bosspit_<nn>.png` and `Pit_BG_Boss_04.png`

## Registered Boss Sprite Assets
- `bossPit01TheHornGateWitness` -> `boss_pit_01_the_horn_gate_witness_alpha.png`
- `bossPit02StarvedProphetOfAsh` -> `boss_pit_02_starved_prophet_of_ash_alpha.png`
- `bossPit03RedMaskHollowSky` -> `boss_pit_03_red_mask_hollow_sky_alpha.png`
- `bossPit04CyclopsShepherdOfRuin` -> `boss_pit_04_cyclops_shepherd_of_ruin_alpha.png`
- `bossPit05ClusterThroneEyelessHost` -> `boss_pit_05_cluster_throne_eyeless_host_alpha.png`
- `bossPit12HourglassReliquary` -> `boss_pit_12_hourglass_reliquary_alpha_mirrored.png`
- `bossPit13ScorpionSkullCrawler` -> `boss_pit_13_scorpion_skull_crawler_alpha_mirrored.png`
- `bossPit14CosmicMawIdol` -> `boss_pit_14_cosmic_maw_idol_alpha.png`
- `bossPit15CorpseEngineWorm` -> `boss_pit_15_corpse_engine_worm_alpha.png`
- `bossPit16RamJudicator` -> `boss_pit_16_ram_judicator_alpha_mirrored.png`
- `bossPit17CenserProphet` -> `boss_pit_17_censer_prophet_alpha_semiprofile_mirrored.png`
- `bossPit18PyreCauldronIdol` -> `boss_pit_18_pyre_cauldron_idol_alpha.png`
- `bossPit19ReliquaryStalker` -> `boss_pit_19_reliquary_stalker_alpha.png`
- `bossPit20HornedMothJudge` -> `boss_pit_20_horned_moth_judge_alpha.png`

## Registered Boss-Pit Background Assets
- `bossPit01BackgroundHornGate` -> `boss_pit_01_bg_horn_gate_of_witness.png`
- `bossPit02BackgroundAshProphecyHall` -> `boss_pit_02_bg_ash_prophecy_hall.png`
- `bossPit03BackgroundHollowSkyTheatre` -> `boss_pit_03_bg_hollow_sky_theatre.png`
- `bossPit04BackgroundRuinShepherdBasin` -> `boss_pit_04_bg_ruin_shepherd_basin.png`
- `bossPit05BackgroundClusterThroneVoidCourt` -> `boss_pit_05_bg_cluster_throne_void_court.png`
- `bossPit12BackgroundHourglassReliquary` -> `Pit_BG_Hourglass_Reliquary.png`
- `bossPit13BackgroundScorpionSkullCrawler` -> `Pit_BG_Scorpion_Skull_Crawler.png`
- `bossPit14BackgroundCosmicMawIdol` -> `Pit_BG_Cosmic_Maw_Idol.png`
- `bossPit15BackgroundCorpseEngineWorm` -> `Pit_BG_Corpse_Engine_Worm.png`
- `bossPit16BackgroundRamJudicator` -> `Pit_BG_Ram_Judicator.png`
- `bossPit17BackgroundCenserProphet` -> `Pit_BG_Censer_Prophet.png`
- `bossPit18BackgroundPyreCauldronIdol` -> `Pit_BG_Pyre_Cauldron_Idol.png`
- `bossPit19BackgroundReliquaryStalker` -> `Pit_BG_Reliquary_Stalker.png`
- `bossPit20BackgroundHornedMothJudge` -> `Pit_BG_Horned_Moth_Judge.png`

## Registered Altar Assets (Boss-Pit Entrances)
- `bossPit01AltarTrap`, `bossPit01AltarSuper`
- `bossPit02AltarTrap`, `bossPit02AltarSuper`
- `bossPit04AltarTrap`, `bossPit04AltarSuper`
- `bossPit05AltarTrap`, `bossPit05AltarSuper`

## Confident Boss/Background Pairings
- 01: The Horn Gate Witness <-> Horn Gate of Witness
- 02: Starved Prophet of Ash <-> Ash Prophecy Hall
- 03: Red Mask Hollow Sky <-> Hollow Sky Theatre
- 04: Cyclops Shepherd of Ruin <-> Ruin Shepherd Basin
- 05: Cluster Throne Eyeless Host <-> Cluster Throne Void Court
- 12: Hourglass Reliquary <-> Hourglass Reliquary
- 13: Scorpion Skull Crawler <-> Scorpion Skull Crawler
- 14: Cosmic Maw Idol <-> Cosmic Maw Idol
- 15: Corpse Engine Worm <-> Corpse Engine Worm
- 16: Ram Judicator <-> Ram Judicator
- 17: Censer Prophet <-> Censer Prophet
- 18: Pyre Cauldron Idol <-> Pyre Cauldron Idol
- 19: Reliquary Stalker <-> Reliquary Stalker
- 20: Horned Moth Judge <-> Horned Moth Judge

## Ambiguous / Unpaired Files (Intentionally Not Registered)
These files were discovered but left unpaired in key registration due to low-confidence naming correspondence:
- `boss_bosspit_04.png`
- `boss_bosspit_06.png`
- `boss_bosspit_07.png`
- `boss_bosspit_08.png`
- `boss_bosspit_10.png`
- `boss_bosspit_11.png`
- `Pit_BG_Boss_04.png`
- `delete` (non-asset artifact)

## Integration Intent
This pack is intended as a reusable content library for later boss-pit / miniboss / full-boss deployment passes. The current ingestion pass is registration + catalog only; full scene wiring remains intentionally deferred.
