# Chamber Visual Production Playbook

Practical process record for moving Chamber 01 from concept-stand-in presentation to the project’s locked monumental retro biomechanical horror direction, without breaking the playable vertical slice.

## 1) Purpose of this playbook

This playbook exists to preserve a **repeatable, low-regression production sequence** that already succeeded in this repo:
- keep Chamber 01 playable end-to-end while visual quality hardens,
- align integrated art to the locked palette/silhouette doctrine,
- preserve mobile + desktop input parity and deployment safety,
- avoid reintroducing debug-looking lore presentation patterns.

Use this as the default execution order for Chamber 02 and future chamber art passes unless milestone docs explicitly override it.

---

## 2) What Chamber 01 was lacking before the successful pass

Before the successful hardening pass, Chamber 01 had key gaps that blocked visual identity quality:

1. **Milestone-stability gaps**
   - Mobile controls were not yet fully corrected for both portrait and landscape safe readability.
   - Vertical-slice reliability needed to be preserved before art expansion.

2. **Lore delivery gaps**
   - Lore behavior was closer to a basic trigger/pause pattern, not the now-preferred discrete cinematic lore-screen transition.
   - Visible lore trigger affordance risked reading like debug UI rather than an in-world ritual object.

3. **Art integration pipeline gaps**
   - New chamber art needed a disciplined intake path instead of ad-hoc file scattering.
   - Chamber 01 required a coordinated multi-asset integration pass (wall/floor/rib/shrine/world insert) tied into centralized asset key/URL mapping.

4. **Art-direction cohesion gaps**
   - Concept-source variance required normalization toward the lock: bone/rust/oil-black with sparse sickly green accents, strong silhouette readability, oppressive monumental scale.

---

## 3) Winning sequence of work (exact order that worked)

Follow this order. Do not reorder unless a documented blocker forces it.

### Step A — Milestone 1 stabilization (first)

Goal: freeze playability contracts before visual hardening.

Execution pattern that succeeded:
- stabilize Chamber 01 core loop (start/combat/lore/death/restart),
- keep texture-first rendering with fallback-only resilience,
- keep GitHub Pages base-path behavior intact,
- validate with build.

Why this was first:
- art integration on unstable gameplay or broken deployment multiplies regressions and hides root causes.

### Step B — Mobile control correction (before art expansion)

Goal: protect iPhone-sized playability and input parity before shipping heavier visual presentation.

Execution pattern that succeeded:
- fix portrait + landscape touch layout and hit-area alignment,
- keep controls in screen space (no camera/world drift),
- preserve desktop keyboard parity.

Why this was second:
- control usability regressions are catastrophic to slice acceptance and can be mistaken for visual/readability problems.

### Step C — Cinematic lore-screen implementation

Goal: move from generic trigger behavior to the project’s preferred lore format.

Execution pattern that succeeded:
- implement dedicated lore-screen transition cadence,
- use Laughing Engine / furnace art as the first prototype lore-screen image,
- keep lore writing cryptic and ritual in tone.

Why this came before trigger replacement:
- the interaction affordance should represent the final behavior it triggers.

### Step D — Shrine trigger replacement

Goal: replace debug-feeling lore marker presentation with diegetic in-world ritual affordance.

Execution pattern that succeeded:
- convert visible lore trigger presentation to shrine/ossuary-style prop,
- keep trigger readable as interactable without flattening into generic UI.

Why this follows Step C:
- once lore-screen behavior is locked, shrine representation can be tuned specifically for that flow.

### Step E — Raw art intake folder workflow

Goal: keep incoming art organized and integration-safe.

Execution pattern that succeeded:
- use a dedicated raw intake folder for chamber-specific source drops,
- treat files as non-production-ready until integrated/validated,
- keep naming explicit and chamber-scoped.

Workflow contract:
1. Drop incoming source images into the chamber raw intake folder.
2. Keep files as source inputs (no assumption of final render tuning).
3. Integrate through centralized asset key/URL mapping.
4. Verify texture-first path still wins; fallback remains failure-only.

### Step F — Chamber 01 asset batch integration pass

Goal: perform one coordinated chamber normalization pass instead of scattered one-off swaps.

Execution pattern that succeeded:
- integrate Chamber 01 batch set in one pass:
  - repeatable wall strip,
  - repeatable floor strip,
  - foreground rib arch,
  - lore shrine prop,
  - Laughing Engine world insert,
- route all assets through centralized key/URL mappings,
- preserve gameplay readability and collision clarity at play scale,
- keep build/deploy invariants intact.

Result:
- Chamber 01 moved materially closer to locked biomechanical monument identity while staying playable.

---

## 4) Asset priority doctrine that worked

When integrating art into active gameplay spaces, this priority order produced good outcomes:

1. **Readability-critical interactables first** (lore trigger shrine).
2. **Spatial orientation surfaces second** (wall/floor strips that stabilize scene legibility).
3. **Depth + silhouette reinforcement third** (foreground rib architecture).
4. **Identity anchor insert fourth** (Laughing Engine world insert).
5. **Polish layers last** only after playability checks pass.

Operational rule:
- if an asset pass threatens collision/interactable clarity on mobile, revert/tune that layer before touching polish.

---

## 5) Art-direction doctrine that worked

The following doctrine matched shipped reality and should stay locked:

- Keep the chamber reading as a **massive ancient ritual biomechanical monument**.
- Preserve constrained palette: bone/ivory, rust/dried-blood metal, oil-black/charcoal, bruised brown-purple neutrals.
- Use **sickly green only as sparse signal accent**.
- Favor strong silhouette masses over noisy micro-detail.
- Maintain diegetic forged/grown/vertebral UI-world language.

Important morphology reminder for future generation/integration:
- prefer **alien dinosaur-like fossil language**, not human skull-heavy imagery,
- bias toward hybrid reads like alien triceratops / cyclops / T-rex fossil forms,
- emphasize horns and vertebrae,
- keep bone material obsidian-dark and ancient.

---

## 6) Prompt-language guidance that worked

Use prompt language that produces readable monumental forms rather than noisy concept mashups.

### Positive prompt anchors
- “monumental alien biomechanical ritual chamber”
- “vertebral architecture, horned fossil silhouettes”
- “obsidian-dark fossil bone fused with rusted metal”
- “broad value grouping, mid-distance gameplay readability”
- “sparse sickly green accent signals only”

### Negative prompt anchors
- “no human skull collage as primary motif”
- “no neon cyberpunk glow language”
- “no clean sterile sci-fi plating”
- “no cartoon exaggeration”
- “no full-surface noisy detail clutter”

### Prompting rule
- prompt for **silhouette hierarchy first**, texture detail second.

---

## 7) Integration rules that preserved playability

These were the practical guardrails that prevented regressions during visual hardening:

1. Keep Milestone 1 contracts stable (scene flow, combat timing, restart loop).
2. Preserve mobile controls in screen space with aligned hit areas.
3. Preserve desktop keyboard control path.
4. Keep asset key/URL mapping centralized; avoid ad-hoc pathing.
5. Keep texture-first rendering primary; fallback only on texture load failure.
6. Keep lore delivery as discrete cinematic lore-screen transitions.
7. Keep lore trigger presentation diegetic (shrine/ossuary), not debug markers.
8. Run `npm run build` at the end of every meaningful pass.

---

## 8) Regression warnings for future chamber art passes

Watch for these specific failure patterns:

- Base-path-safe asset loading regresses on GitHub Pages.
- Touch controls clip/misalign after viewport or layout edits.
- Desktop input parity breaks while tuning mobile UX.
- Fallback visuals accidentally become default visuals.
- Floor/sprite grounding reads as sunk or floating after display tuning.
- Lore pacing backslides from cinematic transition to generic overlay behavior.
- Shrine/lore affordance regresses into debug-style label presentation.
- Added detail density reduces interactable readability at gameplay distance.

If any appears, treat as regression to fix at root cause; do not “work around” by changing unrelated systems.

---

## 9) How to repeat this process for Chamber 02 and future spaces

Use this checklist as a production template:

1. Confirm milestone scope: visual hardening only (no unplanned systems).
2. Re-verify platform invariants (mobile touch + desktop keyboard + base path).
3. Stand up chamber-specific raw intake folder and naming convention.
4. Define batch asset set by priority:
   - interactable/readability assets,
   - orientation surfaces,
   - depth/foreground silhouette assets,
   - identity anchor inserts.
5. Integrate via centralized keys/URLs only.
6. Validate lore behavior uses cinematic lore-screen pattern and diegetic shrine trigger affordance.
7. Read at gameplay scale on iPhone-like portrait and desktop.
8. Normalize palette/silhouette toward art lock (including vertebral horned fossil language).
9. Build verify (`npm run build`) before merge.
10. Record pass notes in docs so Chamber 03+ can reuse proven decisions.

Keep iteration oppressive, readable, and incremental. Expand mechanics only when milestone docs explicitly permit.

## 10) Chamber 02 planning doctrine pointer

Before implementation planning or art intake for Chamber 02, align to:
- `docs/chamber-02-planning-doctrine.md`

That document defines Chamber 02 gameplay purpose, visual identity, relationship to Chamber 01, focal setpiece, encounter rhythm, lore beat, introduced idea, and carry-over invariants.
