# Retro Biomechanical Horror Game

## Asset Brief Pack 01

## Project Intent

This asset brief defines a consistent visual language for a 1990s-style retro biomechanical horror game built as a Phaser browser-game vertical slice. The art direction should feel oppressive, grotesque, ritual-industrial, and fleshy-metallic while remaining gameplay-readable above all else.

The goal is not maximal visual complexity. The goal is **clarity under dread**: strong silhouettes, controlled palette, readable hazards, and textures that imply biomechanical horror without burying gameplay in noise.

---

# Global Art Direction

## Core Visual Pillars

**Era target**
1990s retro game readability, with sprite-first decision making. Visuals should feel like a lost late-90s PC/console horror-action game rather than a modern hyper-rendered illustration.

**Mood target**
Oppressive, damp, ritualized, industrial, decayed, semi-organic machinery. Flesh and metal should feel fused, not merely adjacent.

**Gameplay target**
Every asset must remain readable at gameplay size. Large forms first, medium shapes second, small details last.

**Detail hierarchy**

1. Silhouette
2. Pose / major anatomical or structural reads
3. Value separation
4. Accent color cues
5. Surface detail

---

# Global Palette

Use a restrained global palette. Individual assets may bias toward certain ranges, but all should feel like they belong to the same world.

## Primary Base Colors

* **Charred iron** — near-black brown-gray
* **Oxidized steel** — cold desaturated blue-gray
* **Dried flesh** — muted bruised pink-brown
* **Necrotic red** — dark blood red
* **Bone-ivory** — sickly yellowed pale tone
* **Machine brass** — dirty bronze-gold accent

## Secondary Accent Colors

* **Toxic bile green** — sparing use for fluid, infection, weak luminescence
* **Surgical cyan** — rare cold light for terminals, sensors, energy nodes
* **Hell-orange ember** — reserved for heat vents, ritual glow, boss organs
* **Vein purple** — bruise and tissue-shadow accent

## Value Rules

* Most assets should live in **mid-dark value ranges**
* Bright values should be **rare and meaningful**
* Use accent lights to identify danger points, weak spots, interactables, and UI focus
* Avoid full-spectrum color chaos

---

# Sprite Consistency Doctrine

## Silhouette Doctrine

Every gameplay-critical asset must be identifiable in pure black silhouette at target game scale.

## Proportion Doctrine

Forms may be grotesque, but internal logic must stay consistent. Limbs, mass, joints, and structure should feel intentionally designed rather than randomly melted.

## Surface Doctrine

Textures should suggest:

* fused tendon-metal seams
* ribbed hoses
* corroded plating
* stretched membrane
* scar tissue
* oily fluid residue
* worn ritual engravings

Do not over-render pores, gore, or tiny micro-detail that will vanish in sprite use.

## Readability Doctrine

* Player reads fastest
* Enemies read second
* Environment supports mood but must not camouflage active threats
* UI must frame information without competing with the playfield

## Lighting Doctrine

Use directional, game-friendly lighting. Assets should read under dim, low-key conditions without relying on dramatic cinematic shadow that destroys form clarity.

## Pixel / Sprite Conversion Doctrine

When generating source art intended for sprite conversion:

* keep background plain or transparent when possible
* center subject
* avoid overlapping appendages that merge into visual mush
* keep limb count and pose readable
* avoid extreme perspective distortion
* minimize thin details that will disappear when downscaled

---

# Asset 01 — Player Character

## Purpose in Gameplay

Main controllable character. Must read instantly in motion, in combat, and against dark biomechanical backgrounds.

## Silhouette Description

A compact humanoid silhouette with a slightly hunched, burdened stance. Broad upper torso, narrow waist, reinforced forearms or tool-weapon armature, heavy boots, distinct head shape with either a mask, visor, or cranial rig. The figure should feel fragile inside hostile machinery, but still purposeful.

## Palette Guidance

* Base: charred iron, oxidized steel, dried flesh
* Accents: muted necrotic red, small surgical cyan or pale lens glow
* Very limited bright values on visor, tubes, or chest indicator

## Texture / Material Guidance

* Worn protective suit fused with biomechanical grafting
* Tarnished metal plates over sinew-like underlayers
* Rubber hoses, stitched leather-like seals, scarred armor seams
* Mild wet sheen in select areas, not full-body gloss

## Scale / Proportion Rules

* Roughly 1 head to 5.5–6 heads tall in stylized sprite terms
* Torso slightly oversized for readability
* Hands / forearms slightly exaggerated
* Feet slightly enlarged for platforming and stance clarity
* Head must remain distinct at small scale

## Animation Needs

* Idle
* Walk / run
* Start-stop transition
* Attack 01
* Hurt / recoil
* Death
* Optional: interact / inspect

## Sprite-Sheet or Layout Recommendation

* Side-view sprite sheet
* Consistent frame box
* Recommended rows:

  1. idle
  2. walk
  3. attack
  4. hurt / death
* For vertical slice: 48x48 or 64x64 frame basis depending on scene scale

## Readability Risks to Avoid

* Overly thin limbs
* Excessive dangling tubes around legs
* Head blending into torso
* Too much body texture causing muddy silhouette
* Dark-on-dark values with no separation from background

## Final Polished Image-Generation Prompt

A retro biomechanical horror player character for a 1990s side-view video game, compact humanoid silhouette, slightly hunched but capable stance, worn industrial suit fused with flesh and machine grafts, reinforced forearms, heavy boots, distinct masked head with small visor glow, charred iron armor, oxidized steel, bruised flesh seams, ribbed hoses, scar tissue, ritual-industrial aesthetic, oppressive and grotesque but gameplay readable, clear silhouette, restrained detail, dark background, concept art for sprite extraction, side view, consistent lighting, no clutter, no text

## Simplified Sprite-Conversion Prompt

Side-view retro horror player sprite source, compact humanoid, broad torso, heavy boots, masked head, fused armor and flesh, clean silhouette, limited colors, readable at small size, plain background, no extra props, no text

---

# Asset 02 — Skitter Enemy

## Purpose in Gameplay

Fast low-tier enemy. Harasses player, attacks in bursts, pressures movement, reads as immediate close-range threat.

## Silhouette Description

Low-to-ground multi-limbed creature with a forward-thrusting head or sensory maw. Shape should be crab-like, insectile, or spinally folded, but unmistakably biomechanical. Strong triangular forward motion read. Legs should splay outward enough to distinguish it from debris.

## Palette Guidance

* Base: necrotic red, dried flesh, charred iron
* Accents: tiny bile green or ember-orange eye/sensor points
* Keep it darker than the player but sharper in outline

## Texture / Material Guidance

* Carapace-like metal plating fused with exposed tendon
* Needle legs, piston joints, slick underflesh
* Light oil sheen, scar seams, vent slits
* Should feel fast, nervous, and sharp

## Scale / Proportion Rules

* Small enemy, roughly knee-height to player
* Large head / front mass relative to rear
* Legs can be thin, but main body must remain bold
* Avoid tiny body with unreadable leg clutter

## Animation Needs

* Idle twitch
* Skitter locomotion loop
* Lunge / bite
* Death collapse
* Optional ceiling / wall cling pose if used later

## Sprite-Sheet or Layout Recommendation

* 32x32 or 48x48 frame basis
* Rows:

  1. idle twitch
  2. move
  3. attack
  4. death
* Keep limb arcs consistent frame to frame

## Readability Risks to Avoid

* Too many legs with no clear body core
* Making it visually similar to floor debris
* Excessive spine/tube clutter
* Thin outlines that disappear on dark ground
* Over-detailed head that loses menace when downscaled

## Final Polished Image-Generation Prompt

A skittering biomechanical horror enemy for a 1990s retro side-view game, low to the ground, fast insectile-crab silhouette, fused metal carapace and exposed flesh, sharp forward head, outward-jointed legs, tendon seams, piston-like joints, necrotic red and charred iron palette, tiny toxic sensor glows, grotesque ritual-industrial design, highly readable silhouette, sprite-friendly concept art, side view, restrained detail, dark plain backdrop, no text

## Simplified Sprite-Conversion Prompt

Side-view skitter enemy sprite source, low insectile biomechanical creature, strong front-heavy silhouette, fused flesh and metal, readable legs, limited palette, plain background, no text

---

# Asset 03 — Sentinel / Husk Enemy

## Purpose in Gameplay

Mid-tier enemy. Slower, heavier, more durable. Used as corridor blocker, ranged watcher, or punishing melee wall.

## Silhouette Description

Tall humanoid husk with a static, ominous posture. Thick torso, long arms, small or recessed head, possible shield-like shoulder mass or coffin-like ribcage shape. Should read as a vertical obstruction. Less agile, more inevitability.

## Palette Guidance

* Base: oxidized steel, bone-ivory, dried flesh
* Accents: necrotic red wounds, faint surgical cyan or ember in chest cavity / sensor slit
* More desaturated than skitter enemy

## Texture / Material Guidance

* Heavy shell-like armor grown over corpse-like substrate
* Wrapped cables, exposed ribbed abdomen, pitted plating
* Bone-like protrusions merged with industrial chassis
* Surface should feel dried, ancient, and pressurized

## Scale / Proportion Rules

* Roughly 1.25x to 1.5x player height
* Broad torso and shoulders
* Limbs longer than player’s but more rigid
* Head must not dominate; chest or shoulder structure is the main read

## Animation Needs

* Idle breathing / sway
* Heavy walk
* Attack 01 melee slam or thrust
* Optional ranged charge / fire tell
* Hurt
* Death collapse

## Sprite-Sheet or Layout Recommendation

* 64x64 or 80x80 frame basis
* Rows:

  1. idle
  2. walk
  3. attack
  4. hurt / death
* Keep timing heavier and slower than player

## Readability Risks to Avoid

* Making it too similar to a statue or background pillar
* Overcomplicated shoulder details
* Tiny head and chest in same value range causing loss of form
* Excessive dangling cloth/tube elements
* Symmetry so perfect it feels inert instead of threatening

## Final Polished Image-Generation Prompt

A sentinel husk enemy for a retro biomechanical horror game, tall humanoid obstruction silhouette, broad torso, long rigid arms, recessed head, coffin-like chest structure, fused corpse and machine architecture, oxidized steel, bone-ivory, dried flesh, ritual-industrial anatomy, pitted plating, cables, exposed ribbed understructure, oppressive and grotesque, clearly readable for gameplay, side-view concept for sprite extraction, restrained detail, dark simple background, no text

## Simplified Sprite-Conversion Prompt

Side-view sentinel husk sprite source, tall humanoid enemy, broad torso, recessed head, fused corpse-machine armor, readable silhouette, limited palette, plain background, no text

---

# Asset 04 — Chamber 01 Background

## Purpose in Gameplay

Primary vertical-slice environment backdrop. Establishes mood, location identity, traversal lanes, and contrast for foreground actors.

## Silhouette Description

A ritual-industrial chamber with major background masses: wall columns, suspended cables, ribbed mechanical arches, altar-like machinery, vent shafts, membrane surfaces, and embedded anatomical forms. The large shapes should frame the play space without confusing collision boundaries.

## Palette Guidance

* Base: charred iron, oxidized steel, dried flesh, dark bone tones
* Accents: localized ember-orange furnace glow, occasional bile green fluid channels, rare cyan machine indicators
* Background values should stay darker and lower contrast than gameplay entities

## Texture / Material Guidance

* Ribbed biomechanical walls
* Sewn membrane panels
* Corroded girders fused to vertebra-like supports
* Damp metal, fleshy cables, sacrificial industrial motifs
* Light vapor, ooze channels, and pressure vents

## Scale / Proportion Rules

* Keep large forms chunky and readable
* Background should imply depth through layered masses, not busy detail wallpaper
* Reserve clean negative space behind player movement lanes
* Any repeated motifs should vary enough to avoid tile obviousness

## Animation Needs

* Optional subtle background animation only:

  * vent pulsing
  * slow cable sway
  * minor glow throbs
  * fluid drip loops
* No animation should distract from enemies

## Sprite-Sheet or Layout Recommendation

* Layered parallax-ready export:

  1. far wall / architecture
  2. mid biomechanical structures
  3. foreground occlusion pieces
  4. optional animated overlays
* Create as wide modular slices or looping tiles depending on level plan

## Readability Risks to Avoid

* Background contrast competing with sprites
* Foreground-looking detail placed in non-collidable areas
* Too much red everywhere causing enemy blending
* Random visual noise at player-height horizon line
* Excessive anatomical detail that reads as enemy silhouettes

## Final Polished Image-Generation Prompt

A side-view chamber background for a 1990s retro biomechanical horror game, ritual-industrial interior, oppressive vertical slice environment, ribbed arches, fused metal and flesh walls, corroded structural columns, cables like tendons, altar machinery, membrane panels, pressure vents, dark furnace glow, restrained toxic fluid accents, readable negative space for gameplay, layered composition for parallax, retro game concept art, no characters, no text

## Simplified Sprite-Conversion Prompt

Side-view biomechanical chamber background source, large readable wall shapes, fused metal and flesh architecture, dark values, limited accent glows, clear gameplay space, no characters, no text

---

# Asset 05 — Biomechanical UI Frame

## Purpose in Gameplay

Frames HUD, health, weapon, prompt, and menu elements while reinforcing theme without obstructing readability.

## Silhouette Description

Rigid, asymmetrical ritual-industrial frame pieces with ribbing, clamps, vertebral arcs, cable roots, ocular sockets, vent slits, and sacramental machine motifs. Should feel invasive but organized.

## Palette Guidance

* Base: charred iron, oxidized steel, dirty bone
* Accents: surgical cyan for active selection, necrotic red for warning, ember-orange for boss or overload state
* UI interior fill areas must remain clean and legible

## Texture / Material Guidance

* Corroded metal edges
* Tendon-like inset channels
* Small sutured membrane panels
* Mechanical sockets and pressure tubes
* Keep texture light enough not to muddy text/icons

## Scale / Proportion Rules

* Border elements should stay chunky and simple
* Corners stronger than edge middles
* Internal readable zones must remain rectangular or predictably shaped
* Decorative growths should never intrude on text or bars

## Animation Needs

* Optional idle pulse on active elements
* Damage flash states
* Boss-state glow intensification
* Minimal looping motion only

## Sprite-Sheet or Layout Recommendation

Export as modular UI kit:

* four corners
* horizontal edges
* vertical edges
* panel center fill
* icon sockets
* status bar cap pieces
* selection highlight pieces

## Readability Risks to Avoid

* Overly ornate edging around small text
* Too many sharp protrusions near icons
* Bright decorative highlights competing with health/ammo info
* Flesh textures behind typography
* Uneven framing that makes alignment painful for UI layout

## Final Polished Image-Generation Prompt

A modular biomechanical horror user interface frame for a retro 1990s game, ritual-industrial design, fused corroded metal and organic ribbed elements, asymmetrical but organized frame corners and borders, dark iron, dirty bone, oxidized steel, subtle tendon channels, readable central spaces for HUD text and bars, minimal glowing accents, clean game UI kit concept, isolated on dark neutral background, no text labels

## Simplified Sprite-Conversion Prompt

Retro horror UI frame kit source, modular corners and borders, fused metal and organic design, readable center areas, limited palette, isolated background, no text

---

# Asset 06 — Laughing Engine / Altar Miniboss

## Purpose in Gameplay

Major vertical-slice climax enemy. Anchors a miniboss encounter. Combines ritual altar, engine core, and grotesque face or vocal cavity. Must read as both environment and enemy.

## Silhouette Description

A large anchored mass, wider than tall or roughly square in overall read, with a central “laughing” maw/face structure embedded into a biomechanical altar-engine. Side appendages may include pistons, spinal exhausts, tendon fans, hooked limbs, prayer-wheel turbines, or rib-cage turbines. The center must dominate. It should feel like a blasphemous machine idol.

## Palette Guidance

* Base: charred iron, necrotic red, dried flesh, bone-ivory
* Accents: ember-orange furnace core, bile green fluid sacs, rare cyan sensor punctures
* Brightest values reserved for mouth/core/weak spot states

## Texture / Material Guidance

* Fused altar stone logic translated into metal-flesh machinery
* Ribbed organ chambers
* Teeth-like vents
* Pressurized sacs
* Rotational machinery mixed with stretched membranes
* Oily residue, heat discoloration, ritual engravings

## Scale / Proportion Rules

* Significantly larger than player, ideally screen-dominant in encounter space
* Central face/core should be readable even at a distance
* Side appendages must support the silhouette, not fragment it
* Weak point areas should be placed clearly and consistently

## Animation Needs

* Idle breathing / engine pulse
* Laughing maw open-close cycle
* Core flare
* Attack tells: piston rise, vent burst, cable recoil, jaw spread
* Damage state
* Death / shutdown sequence
* Optional separate animated weak point layer

## Sprite-Sheet or Layout Recommendation

Because of scale, use layered boss parts:

* base body
* maw / face layer
* core glow layer
* appendage layer(s)
* FX overlays
  This is better than one giant monolithic sheet if the boss needs efficient animation in Phaser.

## Readability Risks to Avoid

* Too many side appendages muddying the boss outline
* Face blending into the altar mass
* Over-detail in the center reducing weak-point readability
* Similar colors for damageable and non-damageable zones
* Making it so architectural that players do not realize it is alive

## Final Polished Image-Generation Prompt

A laughing engine altar miniboss for a 1990s retro biomechanical horror game, gigantic ritual-industrial machine idol fused with flesh and metal, central laughing maw embedded in an engine-altar body, ribbed organ chambers, teeth-like vents, furnace core glow, pistons, spinal exhausts, tendon cables, sacrificial machinery, grotesque but highly readable silhouette, oppressive dark palette with focused ember core accents, side-view boss concept for sprite extraction, restrained detail hierarchy, dark neutral background, no text

## Simplified Sprite-Conversion Prompt

Side-view biomechanical miniboss sprite source, giant altar-engine with central laughing maw, fused flesh and metal, clear weak-point core, readable silhouette, limited palette, plain background, no text

---

# Naming Conventions for Exported Files

Use deterministic, production-safe names. No spaces. No vague names like `monster_final2_real`.

## Pattern

`bh_[category]_[assetname]_[variant]_[view]_[size]_[ver]`

## Examples

* `bh_chr_player_base_side_64_v01.png`
* `bh_enemy_skitter_base_side_48_v01.png`
* `bh_enemy_sentinel_base_side_80_v01.png`
* `bh_bg_chamber01_layerfar_side_1024x512_v01.png`
* `bh_ui_frame_corner_topleft_128_v01.png`
* `bh_boss_laughingengine_body_side_256_v01.png`

## Category Prefixes

* `chr` = player / playable character
* `enemy` = enemies
* `boss` = bosses
* `bg` = background / environment
* `ui` = interface
* `fx` = effects
* `prop` = interactables / world objects

## Variant Terms

Use controlled terms only:

* `base`
* `idle`
* `walk`
* `attack`
* `hurt`
* `death`
* `layerfar`
* `layermid`
* `layerfore`
* `glow`
* `weakpoint`

---

# What Codex Should Assume When Integrating These Assets

## General Assumptions

Codex should assume all assets are intended for a **side-view Phaser game vertical slice** with retro readability prioritized over painterly detail.

## Import Assumptions

* Sprites may arrive as clean concept sources first, then require downscaling / sprite conversion
* Transparent backgrounds are preferred for characters, enemies, boss parts, and UI modules
* Backgrounds may be layered for parallax
* Bosses may be multipart rather than single-sheet entities

## Animation Assumptions

* Player and enemies should use consistent frame dimensions per asset
* Idle, locomotion, attack, hurt, and death states are the baseline expectation
* Larger bosses may use layered animation instead of frame-by-frame full redraw

## Readability Assumptions

* Collision and hitboxes should follow major forms, not tiny ornamental protrusions
* Bright accent zones may indicate weak points, interaction points, or UI active states
* Background contrast should remain subordinate to actor readability

## Technical Assumptions

* Codex should preserve original asset proportions unless explicitly directed otherwise
* Downscaling should use crisp nearest-neighbor or controlled pixel cleanup, not blurry interpolation
* When cropping sheets, maintain equal frame alignment and consistent pivot points
* UI slices should be treated as modular pieces, not flattened into a single inflexible slab

## Art Direction Assumptions

Codex should maintain:

* oppressive biomechanical horror tone
* restrained palette discipline
* large-form clarity
* fused flesh-metal material language
* ritual-industrial motifs
* gameplay-first readability

---

# Final Production Summary

This brief pack defines a visual system, not just six disconnected art prompts. Every asset should feel like it was born in the same malignant engine-cathedral: same value discipline, same material logic, same silhouette-first thinking.

The art should clearly communicate that the world is alive in the worst possible way while still letting the player tell at a glance what can move, what can kill them, and what matters.
