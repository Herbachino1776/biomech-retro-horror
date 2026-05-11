# Session Handoff

Use this file to start a fresh planning/implementation session from real current state.

## Latest Update (2026-05-11)
- **S1C1 basic enemy strip invisibility regression after runtime-safe slicing fix resolved:**
  - Root cause confirmed in `SkitterServitor`: animated Chamber01 basics correctly entered animation-pack path (`hasAnimationPack === true`), but legacy static skitter crop assumptions could still leak through concept-sprite checks and crop an animated sprite with old static concept-art crop coordinates.
  - `SkitterServitor` now gates default/static crop behavior behind `!hasAnimationPack`, so animation-pack sprites skip the old concept-art crop path entirely unless a future animation-specific crop is explicitly configured.
  - Animation-pack startup now explicitly plays idle once after animation registration (`sprite.play(idle, true)`) to avoid first-frame blank/start timing ambiguity on enemy spawn.
  - BootScene runtime-safe `512x512` frame slicing for `s1c1_basic_01` strips remains unchanged; no further asset resizing was performed.

## Latest Update (2026-05-11)
- **S1C1 basic enemy strip runtime black-square fix landed:**
  - Chamber01 `s1c1_basic_01` animated strips previously loaded runtime as `18432x3072` sheets with `3072x3072` per-frame slicing; this exceeded reliable runtime texture/frame behavior on target WebGL/mobile profiles and produced black-square enemy rendering in scene.
  - Runtime strip assets were replaced in-place (same filenames/paths) with runtime-safe transparent strips at `3072x512` total, using `6` horizontal frames at `512x512` each.
  - `BootScene` spritesheet preload for `s1c1Basic01IdleStrip`, `s1c1Basic01WalkStrip`, and `s1c1Basic01AttackStrip` now uses `frameWidth: 512`, `frameHeight: 512`, `endFrame: 5`.
  - Chamber01 basic enemy animation wiring remains animation-pack based (`idle/walk/attack` keys, frames `0..5`) with no static fallback regression required when textures are present.
  - Chamber01 basic presentation sizing/origin remains tuned at `404x404` and origin `{ x: 0.5, y: 0.94 }` pending runtime visual validation; Blind Cantor/Chamber02+/boss systems unchanged.

## Latest Update (2026-04-27)
- **S1C3 sector-boss finale anchor/UI polish pass landed:**
  - Chamber03 sector-boss death aftermath now resolves a single shared remains anchor midpoint in-scene and uses that same anchor for both the large persistent blood-pool container and boss-tier corpse-remains spawn, eliminating split payoff-site visuals.
  - Shared anchor is derived from current separate anchors (`pool` vs `corpseRemains`) using midpoint calculation `(pool + remains) / 2` on both axes before payload dispatch.
  - Existing delayed boss-remains/blood-pool payoff timing remains intact (`corpseRemains.spawnAtMs` unchanged), so the large pool still appears with the remains-eruption beat, not on lethal hit.
  - Chamber03 sector boss bar now remains hidden until the boss is in/near main camera `worldView` (padded in-view gate), with reveal timing decoupled from internal boss activation.
  - Chamber03 sector boss bar now suppresses label/name plate rendering locally (`hideName: true` + empty name/subtitle) to avoid obscured/wonky boss-name presentation while preserving bar fill/telegraph.
  - DEV target remains `Chamber03Scene`; START GAME remains `Chamber01Scene`.

- **S1C3 sector-boss finale timing/exit-door cleanup landed:**
  - Chamber03BossArena sector-boss payoff now delays corpse-remains spawn timing via payload config (`corpseRemains.spawnAtMs`) so the large persistent blood/remains beat lands at the remains-eruption phase instead of the opening lethal-hit/death-audio beat.
  - Chamber03BossArena boss-dais **EXIT** / next-sector door visual no longer uses the background-threshold plate image; it now uses a proper in-world super-altar prop sprite with key `ASSET_KEYS.bossPit05AltarSuper` (fallbacks: `bossPit02AltarSuper`, then `bossPit01AltarSuper`) while keeping transition collision/zone logic separate from art.
  - Chamber03 boss death sequence remains textless; boss-tier remains stay large/persistent; progression gate unlock flow remains active.
  - DEV target remains `Chamber03Scene`; START GAME remains `Chamber01Scene`.

- **S1C3 finale final cleanup pass landed (boss-name text, dais entrance prop, grounding):**
  - Chamber03 boss HUD now keeps the boss bar but suppresses boss label/title text locally for this encounter (`name`/`subtitle` passed as empty strings), with no global HUD-system rewrite.
  - Chamber03 boss visual fallback name label text was removed from active presentation path (no on-screen boss-name text object shown during fight/death sequence).
  - Chamber03 boss-dais entrance staging no longer renders the background-threshold plate as the door visual; it now places the already-loaded in-world prop sprite `ASSET_KEYS.bossPit01AltarSuper` (fallback: `ASSET_KEYS.bossPit02AltarSuper`) at the entrance gate position/depth while preserving threshold interaction/transition logic.
  - Chamber03 boss grounding was lowered via boss-local presentation normalization (`CHAMBER03_BOSS_COMBAT.presentation.normalization.visibleFootOffsetY = 36`) rather than shared/global floor rewrites.
  - Chamber03 boss death payoff grounding now also consumes the same boss-local normalized visible-foot offset through `payoffPose.visibleFootOffsetY` and `corpseRemains.visibleFootOffsetY` for remains/payoff alignment consistency.
  - DEV target remains `Chamber03Scene`; START GAME remains `Chamber01Scene`.

- **Sector 1 Chamber 3 finale cleanup pass landed (post-PR #458 refinement):**
  - Chamber03 sector-finale active boss visual swapped from `ASSET_KEYS.bossPit20HornedMothJudge` to the already-loaded boss-pit sprite `ASSET_KEYS.bossPit19ReliquaryStalker` to reduce overuse of the prior S1C3 visual while keeping the upgraded payoff pipeline.
  - Sector-boss presentation tuning was kept surgical: boss display size/origin and damage-hurtbox minimums/offsets were retuned for the replacement sprite, while overlap-authority combat and major-encounter resolution remained unchanged.
  - Chamber03 boss-dais entrance visual no longer uses the old threshold/background-plate look; it now uses a proper in-world altar/gate prop sprite (`ASSET_KEYS.bossPit01AltarSuper`) with interaction zone/collision semantics still separated from art.
  - Boss-dais helper text was removed (no visible entrance prompt text at the Chamber03 boss threshold).
  - Sector-finale death ceremony text overlays were suppressed for S1C3 (no visible payoff/body/title text during Chamber03BossArena death sequence); payoff now communicates via camera/audio/gore/remains/gate unlock only.
  - Chamber03 wall-module modernization and BRUTALITY support remain intact.

- **Sector 1 transition hardlock audit status (current):**
  - START GAME -> `Chamber01Scene`: unchanged and still authoritative.
  - DEV -> `Chamber03Scene`: unchanged and still authoritative.
  - Chamber01 -> Chamber02: hardened to Chamber02-style resilient handoff pattern (capture payload first + fade callback + fallback start timer) so fade-event drift cannot be the only path to `scene.start(...)`.
  - Chamber02 -> Chamber03, Chamber03 -> Chamber03BossArena, Chamber03BossArena -> Sector02Chamber01: existing atomic/non-fatal handoff hardening remains in place and unchanged this pass.
  - Chamber02 boss-pit return/handoff logic remains untouched in combat/runtime terms; no Chamber02 combat/boss damage/payoff reopening occurred.

## Latest Update (2026-04-26)
- **Chamber03 sector-boss presentation/payoff modernization landed (Precentor visual retirement):**
  - Chamber03 boss arena now presents the sector finale with the existing boss-pit-grade sprite `ASSET_KEYS.bossPit20HornedMothJudge` (old Precentor sprite presentation retired from active fight path).
  - Chamber03 sector-boss combat identity/presentation now reads as **THE HORNED MARROW JUDGE** (boss bar + encounter text updated), while preserving stable Chamber03 boss-arena flow and progression handoff.
  - Boss sprite grounding/hit contract tuned in-scene (display/origin/body/damage hurtbox) to keep the boss visible, floor-aligned, attack-capable, and damageable via normal overlap authority (`player.attackHitbox` vs damage hurtbox).
  - Sector-boss lethal sequence now uses modern `beginBossDeathPayoffPackage(...)` with explicit required payload fields (`fountainBurst`, `blowoutBurst`) and stronger-than-boss-pit tuning:
    - heavier death-camera zoom/focus and longer staged shake
    - larger gore fountain + blowout burst
    - boss-tier remains upgraded to supported `bossPitBoss` profile with floor lift for persistent large corpse presence
    - banishment sting retained in payoff cadence
  - Added finite-anchor validation before payoff begin and a guarded fallback completion path so payoff exceptions cannot softlock post-boss progression.
  - Chamber03 post-boss progression contract remains intact: gate reveal -> interact -> Sector02Chamber01 handoff.
  - DEV target remains `Chamber03Scene`; START GAME remains `Chamber01Scene`.

- **Chamber03 modernization/content pass landed (forward-authoring pass, no Chamber02 reopen):**
  - Chamber03 world-space/procession pacing expanded (`worldWidth` 4800 -> 6200) with stronger wall-module architectural rhythm and clearer authored sequence: entry composition -> repeated wall-module runs -> encounter pockets -> lore/threshold approach -> boss-arena handoff.
  - Chamber03 processional backdrop now reuses `chamber03BackgroundWallModule` across additional spaced segments to avoid cramped painterly-only reads and keep floor-band readability.
  - Encounter pockets re-authored for BRUTALITY-era pacing:
    - 4 pockets (up from 3) with wider spacing and less overlap spam.
    - basics clustered for 2-kill-in-5s windows.
    - pre-climax elite/toll-keeper pressure retained as miniboss-style pocket anchor.
  - Chamber03 BRUTALITY support added using the stable Chamber02 pattern:
    - trigger: 2 basic kills in 5s
    - active: 20s
    - max 2 activations
    - no extension, no UI/meter
    - enemy aggression sync while active
    - clean teardown on SHUTDOWN and outgoing boss-arena transition.
  - Chamber03 outgoing boss-arena handoff hardened to atomic/non-fatal behavior:
    - destination payload captured first
    - outgoing cleanup guarded
    - fade callback retained but no longer sole start path (fallback timed start included).
  - Chamber03BossArena outgoing progression handoff to Sector02Chamber01 similarly hardened:
    - captured payload + fade callback + fallback timed start.
  - DEV target remains `Chamber03Scene`; START GAME remains `Chamber01Scene`.
  - Known Chamber03 follow-up: interactive runtime playthrough should still validate exact tuning feel on device (build passes do not substitute for full manual pacing/activation combat feel validation).

- **Chamber03 baseline audit completed (controlled stabilization pass):**
  - Scene registration and boot wiring were already valid (`Chamber03Scene` + `Chamber03BossArenaScene` registered in `main.js`; `Chamber02Scene` exit threshold already handoffs to `Chamber03Scene`; `START GAME` remained `Chamber01Scene`).
  - Chamber02 -> Chamber03 payload contract was already valid (`enteredFrom` / `progressionSource` payload does not break Chamber03 `init/create`; Chamber02 fresh-interact threshold rule remains intact and unchanged).
  - Chamber03 baseline flow confirmed: entry/processional combat pockets -> threshold handoff -> Chamber03 boss arena -> pre-boss lore omen -> boss combat + modern death payoff -> progression gate -> Sector02Chamber01 handoff.
  - **Fix applied (narrow):** Chamber03 boss-arena omen launch previously used a scene-status gate that could incorrectly force fallback activation and skip lore. Omen launch now attempts `scene.launch('LoreCutsceneScene', ...)` directly with guarded fallback only on real launch error.
  - Combat/boss status in current lane: main chamber enemies activate/engage via pocket triggers; boss arena keeps normal overlap-based player damage contract (`player.attackHitbox` vs boss damage hurtbox), boss can damage player, payoff pipeline remains modern package.
  - BRUTALITY status: no Chamber03 BRUTALITY wiring in this lane; no BRUTALITY body/floor/collision logic was touched.
  - **Current DEV target updated:** BootScene `DEV` now points to `Chamber03Scene` for focused Chamber03 validation (`START GAME` still `Chamber01Scene`).

- **Chamber02 recovery cycle snapshot (documentation lock):** this run required a full recovery pass across boss-pit activation misdiagnosis, emergency damage fallback removal, atomic/non-fatal boss-pit handoff, lore-screen camera isolation, end-boss visual/boss-bar/damage wiring repair, death-payoff payload hardlock fix, and boss-tier remains polish.
- **Chamber02 end-boss remains payoff polish landed:** the end-boss death package previously passed `corpseRemains.size: 'boss'`, but `EnemyCorpseRemains` has no `boss` profile, so remains silently fell back to `small` and looked underwhelming/missing after ceremony. Chamber02 now uses the supported boss-tier profile (`size: 'bossPitBoss'`) and an explicit floor lift (`floorLiftPx: 52`) when building `corpseRemains.floorPlaneY/groundY`, keeping the final pile large, visible, and grounded after payoff completion.
- **Chamber02 end-boss death hardlock root cause (confirmed):** `Chamber02Scene.handleEndBossDefeated()` invoked `beginBossDeathPayoffPackage(...)` with an incomplete `victory` payload (missing required `fountainBurst` / `blowoutBurst` objects). The package then dereferenced undefined burst config during `onStart` gore setup, throwing after lethal death audio and leaving major-encounter resolution locked (apparent freeze before gore/remains/exit unlock).
- **Fix applied:** Chamber02 now routes lethal handoff through dedicated `beginEndBossDeathPayoff(...)` with one-shot guards, finite anchor/floor validation, required burst config parity with known working bosses, compact lethal/payoff instrumentation logs, and a guarded fallback unlock path if payoff begin/execute fails.
- **Current Chamber02 end-boss progression status:** lore -> reveal/combat -> lethal hit -> payoff gore/remains -> boss bar resolve -> exit unlock -> Chamber03 threshold handoff (with emergency fallback unlock if payoff throws).

- **Chamber02 end boss active-but-invisible regression (post-PR #451) fixed:** the boss visual stack was effectively invalid at runtime because `HalfSkullMiniboss.updateVisuals()` multiplied base scale by undefined `presentation.scaleX/scaleY`, producing non-finite scale and breaking sprite bounds/hurtbox alignment; Chamber02 now also forces explicit reveal-time sprite visibility/alpha/depth and immediate hurtbox resync.
- **End-boss UI wiring fixed:** Chamber02 now explicitly reveals the boss bar at encounter start in `revealEndBoss()` with name/current/max values (hidden pre-activation remains unchanged).
- **End-boss player damage wiring fixed:** normal overlap authority remains `player.attackHitbox` vs `endBoss.damageHurtbox ?? endBoss.sprite`; with scale/hurtbox sync repaired and active-state guard retained, player hits now route to `endBoss.takeDamage(...)`, update the bar, and preserve modern payoff/unlock flow.
- **Current Chamber02 end-boss progression status:** lore trigger -> end-boss reveal/combat -> boss death payoff -> `endBossDefeated` true -> exit unlock -> Chamber03 handoff is restored on the main lane.

- **Chamber02 end boss missing/inactive root cause (confirmed):** end-boss reveal/activation was gated by `isEndBossRevealEligible()` (camera view-box check). In portrait gameplay viewport configurations, the boss center frequently never entered the padded reveal rectangle, so reveal never fired; boss remained inactive, non-damaging, and progression appeared stalled.
- **End boss fix applied:** Chamber02 now activates/reveals the end boss immediately when the player crosses `CHAMBER02_END_BOSS.activationX`; boss body is intentionally disabled at spawn and enabled on reveal so pre-activation collision cannot block lane readability. End boss remains `HalfSkullMiniboss` bound to `ASSET_KEYS.sector02Chamber02PressureDeacon`.
- **Chamber02 lore black/masked root cause (confirmed):** lore rendering could be visually occluded by chamber viewport/layer ordering conditions during launch from Chamber02 (especially with portrait viewport constraints), producing a black/matte-only presentation.
- **Lore screen fix applied:** Chamber02 now explicitly brings `LoreScreenScene` to top when launched, and `LoreScreenScene` now enforces full-screen camera viewport/zoom reset in `create()` to isolate lore composition from chamber viewport state.
- **Current Chamber02 -> Chamber03 progression status:** end lane authority remains boss-first (exit locked before boss death, unlock on payoff completion, fresh-interact threshold handoff to `Chamber03Scene` after unlock).
- **Current DEV target:** unchanged (`START GAME` -> `Chamber01Scene`, `DEV` -> `Chamber02Scene`).

- **Chamber02 altar hardlock (both boss pits, BRUTALITY and non-BRUTALITY) root cause:** source-scene outgoing cleanup remained fatal in Chamber02. `beginBossPitTransition()` and SHUTDOWN-adjacent cleanup could still execute non-defensive teardown calls before/during handoff; any throw in that cleanup path could abort or destabilize transition flow and present as altar freeze even when target pit scenes were valid.
- **Fix applied:** Chamber02 boss-pit handoff is now atomic/non-fatal. It captures `{ altarId, sceneKey, completionKey }` and payload first, marks transition active immediately, wraps `prepareForOutgoingSceneTransition()` in local error containment, and always attempts `scene.start(...)` with explicit start-failure reset/logging.
- **Cleanup hardening applied:** Chamber02 outgoing cleanup and SHUTDOWN cleanup now use per-step guarded calls (`safeInvokeCleanupStep`) with optional chaining so individual failures (enemy aggression reset, HUD cleanup, major encounter teardown, scene UI cleanup, audio shutdown, timer removal, mobile mode reset, etc.) cannot block scene handoff/shutdown.
- **Diagnostics added:** compact transition diagnostics now log `[Chamber02 boss-pit handoff:start]`, `...cleanup-complete`, `...scene-start`, `...scene-start-failed`, plus `[Chamber02 shutdown cleanup failed]` for per-step teardown failures.
- **Chamber02 second boss-pit hardlock root cause identified (exact regression):** commit `de1c601` (PR #448 lane) moved `prepareForOutgoingSceneTransition()` into `beginBossPitTransition()` *before* `scene.start(...)` with no local error containment. Any throw in BRUTALITY teardown could block `scene.start`, leave `bossPitTransitionActive` true, and hardlock altar handoff (especially when entering Hollow Sky while BRUTALITY was active).
- **Fix applied:** Chamber02 boss-pit handoff now captures selected altar identity up front (`id` / `sceneKey` / `completionKey`), builds payload, wraps pre-start cleanup in local `try/catch` so cleanup can never block `scene.start`, logs handoff steps/errors with `[Chamber02 boss-pit transition]`, and still resets `bossPitTransitionActive` if `scene.start` itself throws.
- **Scope confirmation:** this was a source-scene handoff/cleanup-order issue (not Hollow Sky scene registration/config boot, not altar completion mapping, not first pit combat logic).
- **Chamber02 progression authority repaired:** chamber exit progression is now governed by defeating the end boss (**THE VERTEBRAL TOLL JUDGE**) rather than side-encounter completion state; boss-pit loops/toll-keeper cleanup no longer gate end-boss spawn authority.
- **Chamber02 ending boss identity/path:** end boss remains the Chamber02 `HalfSkullMiniboss` behavior path but now binds to `ASSET_KEYS.sector02Chamber02PressureDeacon` (non-original-HalfSkull visual), preserving overlap-based melee damage and modern death/payoff package.
- **Chamber02 lore screen repaired:** `chamber02-vertebral-threshold` lore screen now has explicit non-empty text and a guaranteed loaded image (`ASSET_KEYS.sector02Chamber02PressureDeacon`) for a stable non-blank lore beat.
- **Chamber02 -> Chamber03 status:** exit stays blocked before boss death, unlocks after boss payoff completes, and threshold handoff continues to `Chamber03Scene` with fresh-interact safety preserved.
- **Current DEV target:** BootScene START GAME remains Chamber01Scene; DEV remains Chamber02Scene for end-lane progression validation.
- **Chamber02 Hollow Sky boss-pit handoff stability (source-side) repaired:** direct boot + registration were already valid (`Chamber02BossPitHollowSkyScene` in `main.js` and matching altar `sceneKey`), but Chamber02 altar entry performed multiple pre-handoff cleanup calls before `scene.start`; any pre-start throw could lock transition state and present as a boss-pit hardlock. Fix now uses a blunt immediate `scene.start(targetAltar.sceneKey, payload)` path first (with `fromScene`, `returnFromBossPit: false`, altar return coordinates, and integrity snapshot), avoiding cleanup-gated start dependency. Hollow Sky boss pit remains on stable `HalfSkullMiniboss` combat path with working return/completion flow.

- **Chamber02 ending repaired:** end corridor blockage/deadlock at the exit lane was corrected by relocating the physical gate barrier to the true threshold side, removing confusing ellipse/post gate dressing at the choke, and keeping only intentional collider geometry on progression blockers.
- **Chamber02 gate/threshold approach:** end gate now reads as an in-world prop sprite using `sector04Chamber02PropThresholdDoor` art, with collision/transition zones kept separate from decorative visuals.
- **Chamber02 lore beat restored:** a dedicated end-lane lore shrine trigger (Sector 2 Chamber 2 altar + lore screen image) now fires before the end boss gate flow and returns cleanly back into Chamber02.
- **Progression status into Chamber03:** final threshold remains boss-gated, now requires fresh interact at the unlocked end threshold, and transitions to `Chamber03Scene` through the existing handoff path.
- **Chamber02 modernization:** main chamber has been stretched for wider pacing pockets, prototype boss-pit descend prompt text removed, and gate visuals shifted toward in-world prop/sprite presentation rather than cropped background-style plates.
- **BRUTALITY support (Chamber02):** Chamber02 now runs BRUTALITY state tracking (2 kills / 5s trigger, 20s duration, max 2 activations), basic kills feed streaks, and enemy/toll-keeper aggression syncs while active with clean teardown on scene shutdown.
- **Second boss pit hardlock fix:** Hollow Sky pit hardlocked because `chamber02BossPitHollowSkyConfig` relied on the configurable pit default boss path (`PressureDeacon`) instead of the proven S1C2 `HalfSkullMiniboss` path. The fix explicitly sets `bossClass: HalfSkullMiniboss`, keeps activation-on-arrival-release and return-altar flow, and preserves Hollow Sky art/name while restoring stable sprite/hurtbox overlap combat.
- **Chamber-ending boss:** Chamber02 now includes a main-path end boss near the exit gate (**THE VERTEBRAL TOLL JUDGE**), with normal hurtbox overlap damage flow, delayed reveal/boss-bar behavior, and exit unlock after modern death/payoff resolution.
- **Current DEV target:** BootScene START GAME remains Chamber01Scene; DEV remains Chamber02Scene for S1C2 modernization validation.

## Big-Picture Doctrine (Read First)
- The project is beyond an early vertical slice and now operates as a multi-sector prototype.
- Boss pits are now core structure, not optional side garnish.
- Sector 4 Chamber 1 is now an active content lane.
- Dense lore should be balanced by violent combat payoff, trap-altar tension, and meaningful run-growth rewards.

## Where the Project Actually Is
- **Sector 1 arc is functionally present:** Chamber 01 -> Chamber 02 -> Chamber 03 -> separate boss arena finale.
- **Sector 2 arc is functionally present in prototype form:**
  - Chamber 1: Black Aqueduct Intake
  - Chamber 2: The Compression Vaults
  - Chamber 3: The Kiln of Judgement
  - Chamber 3 boss payoff: The Sorrow Engine
- **Sector 3 state is established beyond bootstrap:**
  - Chamber 1 (**Gallery of Failed Measures**) rebuilt toward later authored-chamber standard
  - Chamber 3 substantially built from uploaded art pack
- **S3 -> S4 handoff has been addressed enough for live forward authoring.**
- **Sector 4 Chamber 1 is actively being built and has already received shell/shrine/enemy passes.**
- **Sector 4 Chamber 2 shell/buildout prep is now a real secondary lane while S4C1 remains primary.**
- **BRUTALITY MODE is now the next-active combat-design milestone lane and should guide near-term chamber encounter composition.**

## Working / Next / Deferred Snapshot

### What is working now
- Core sector progression for Sector 1 and Sector 2.
- Shared major-encounter resolution flow.
- Boss-pit loop structure with deterministic return semantics.
- S1C2 boss-pit recovery lock (The Pit Judge):
  - first diagnostic for "boss won't move/attack/take damage" is activation/reveal state (`boss.active`, body enabled, `hasBossRevealTriggered`, reveal timing), not sprite/hurtbox swaps
  - boss combat activation is on arrival release (`activateBossOnArrivalRelease`), while boss-bar reveal remains a separate in/near-view presentation gate
  - normal damage authority is restored: `player.attackHitbox` overlap vs boss damage hurtbox/sprite
  - emergency fallback damage (`simpleAttackCycleDamage`) is disabled after recovery
  - intended geometry/config lock: `damageHurtbox` (`trimXRatio 0.08`, `trimYRatio 0.08`, `insetBottomPx 0`, `minWidth 180`, `minHeight 240`, `offsetX 0`, `offsetY -20`), remains lift `56px`, `spawnX 1560`
  - DEV default currently starts `Chamber02Scene` for focused S1C2 validation unless milestone direction explicitly changes
- S1C2 boss-pit activation/damage loop has been repaired and should be treated as stable unless runtime testing says otherwise.
- Modern full boss death/payoff treatment in current authored lanes.
- Renderer/camera stability fix that resolved prior global sprite shimmer/sparkle behavior.
- Meaningful fix for feet-hidden-under-black-control-bar readability issue.
- Sector 1 Chamber 1 Phase 2 layout/rhythm retrofit is now landed: longer corridor rhythm, wider pocket spacing, and BRUTALITY-era clustering opportunities while preserving Blind Cantor pilot behavior.

### What is next (active)
- Continue Sector 4 Chamber 1 content buildout and quality shaping.
- Continue Sector 4 Chamber 2 shell/buildout prep as secondary support work.
- Keep Sector 3 consistency/polish carryover aligned while Sector 4 comes online.
- Start BRUTALITY MODE as the next-active combat-design lane so upcoming chambers are authored around streak escalation windows.
- Treat S1C1 retrofit hardening and one-boss pilot work as legitimate targeted support lanes when explicitly requested, not as default roadmap replacement.

### What is deferred (explicit)
- Enemy Class Unification + Grounding/Scale Normalization milestone (family audit + contract cleanup + shared spawnY/body alignment normalization).
- Boss package polish -> global boss retrofit sequence.
- Boss-pack content production lane (roughly a dozen boss concepts + per-boss background planning in `art/raw/bosspit`).
- Character/action animation lane.

## Milestone Snapshot
### Milestone 7 (advanced/largely established)
Established lanes include:
- 7A Vessel Run Economy
- 7B Gore-Driven Combat Feedback
- 7D Projectile + AOE Combat Kit
- 7E Boss / Miniboss Readability pass (first-pass)
- 7F Poise / Stagger / Rite Finisher pass (first-pass)
- first 7G prototype (trap altar + boss pit)
- shared major-encounter resolution + boss-death doctrine hardening
- chamber-end ritual/cinematic motion groundwork

Still available as targeted follow-up:
- 7C Enemy Pursuit + Encounter Chemistry
- 7H Chamber-End Rituals + Cinematic Lore Motion
- 7I Sponge vs Satisfaction Balance

### Milestone 8 (established / active-support)
- Sector 3 buildout + boss-pit expansion are established and still important.
- This lane remains active-support but is no longer the sole primary lane.

### Milestone 9 (active)
- Sector 4 Chamber 1 buildout is active and practical now.
- S3 -> S4 handoff is no longer a placeholder-only future assumption.

### Milestone 10 (next-active combat lane)
- BRUTALITY MODE is now active-planned as the next combat/chamber-authoring focus.
- Preserved target behavior:
  - auto-trigger only: 2 basic-enemy kills within 5 seconds (basics-only counting, no manual trigger)
  - no visible meter/UI or on-screen indicator in v1
  - fixed 20-second mode timer; kills do not extend it
  - taking damage does not cancel/reset mode
  - max 2 activations per chamber
  - streak counting pauses during mode and restarts from zero when mode ends
  - larger/stronger presentation state + temporary Hammer of Banishment
  - BRUTALITY is currently treated as presentation/combat-state overlay (do not casually reopen body/floor/collision logic)
  - increased reach, slight speed boost, and stronger damage while active
  - enemy aggression override during mode (higher speed/aggro/pressure), then clean reset to normal on exit
  - basic enemies die instantly with dedicated brutality gore package
  - elites die in exactly 3 brutality hits with separate elite brutality gore package
  - quick screen shake on brutality kills, with no gameplay stoppage
  - activation cue is audio-only: loud aggressive elite-attack-style sound
  - deferred later FX (not current implementation): viewport chunk impacts, viewport blood splatter, broader screen-FX escalation
- This milestone changes chamber doctrine (density, placement, pacing windows), not just player stat tuning.

## Global Cleanup Lanes to Preserve
- Enemy families are now a real planning/runtime concern (standard enemy vs elite vs miniboss vs boss), not a single interchangeable class.
- Enemy contract cleanup and grounding/scale cleanup should be treated together as a shared milestone lane, not ad-hoc room patches.
- Many enemies in Sector 2 and later are still slightly low and slightly small, and some class contracts remain mixed.
- Preserve the solved feet/control-bar readability correction as a no-regression baseline.

## Boss Package + Content Pipeline Notes
- Boss package abstraction is now mature enough for a true future lane.
- Required sequencing: polish package first, prove one controlled boss pilot for runtime/floor/hurtbox behavior, then retrofit/reimplement boss encounters globally.
- Keep this lane separate from enemy-class unification/grounding work.
- Future content lane should assume approximately a dozen boss concepts across boss-pit/miniboss/full-boss contexts.
- Likely art ingestion pattern: one background image per boss into `art/raw/bosspit`.
- Registered boss-pack inventory and confident/ambiguous pairing notes are tracked in `docs/boss-pack-catalog.md` for future boss-pit/miniboss/full-boss deployment passes.

## Current Build/Platform Baseline
- Phaser 3 + Vite.
- GitHub Pages project-site base path: `/biomech-retro-horror/`.
- Mobile iPhone-sized browser playability is required.
- Desktop keyboard parity is required.

## What Must Not Be Broken
- Base-path-safe deploy behavior.
- Mobile controls visibility/alignment and desktop keyboard parity.
- Sector scene registration + transition handoff contracts.
- Fresh-interact threshold progression rule.
- Lore scene isolation from chamber viewport blackout/matte layers.
- Shared enemy presentation consistency across chambers.
- Projectile hit/damage lifecycle contract.
- Boss pit completion/reward reset behavior across run restart.

## Most Likely Next Gameplay Pass After This Handoff
1. Continue Sector 4 Chamber 1 content buildout.
2. Begin BRUTALITY MODE implementation planning as the next-active combat/chamber-authoring lane while S4 lane advances.
3. Keep Milestone 8 carryover consistency aligned during S4 + BRUTALITY sequencing.
4. Preserve Enemy Class Unification + Grounding/Scale Normalization as a separate milestone after near-term BRUTALITY focus.
5. Preserve boss package polish + global retrofit as a dedicated separate milestone, not background drift work.

## Chamber01 basic enemy sprite-strip retrofit (s1c1_basic_01)
- Chamber01 basic `SkitterServitor` enemies now use animated strips from:
  - `art/raw/enemies/basic/s1c1_basic_01/s1c1_basic_01_idle_strip.png`
  - `art/raw/enemies/basic/s1c1_basic_01/s1c1_basic_01_walk_strip.png`
  - `art/raw/enemies/basic/s1c1_basic_01/s1c1_basic_01_attack_strip.png`
- Strip format wired in preload: 6 horizontal frames, `3072x3072` per frame (`18432x3072` strip), loaded as Phaser spritesheets with `endFrame: 5`.
- Chamber01 basic presentation tuning currently set to:
  - display size: `404x404`
  - origin: `{ x: 0.5, y: 0.94 }`
  - contact body: `{ width: 76, height: 44, offsetX: 28, offsetY: 58 }`
  - damage hurtbox config: `{ trimXRatio: 0.3, trimYRatio: 0.22, insetBottomPx: 8, minWidth: 74, minHeight: 54, offsetX: 0, offsetY: -12 }`
- Scope lock: this pass only replaces Chamber01 **basic** enemies; Blind Cantor / Chamber02+ / boss systems remain unchanged.
