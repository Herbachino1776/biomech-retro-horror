import { ASSET_KEYS } from './assetKeys.js';

// Chamber 02 first-pass planning artifact.
// Scope guard: this is preload + integration-role scaffolding only.
// Do not treat this as permission to ship Chamber 02 gameplay in Milestone 2.
export const CHAMBER02_ART_PLAN = {
  chamberId: 'chamber02',
  doctrine: 'Ritual Alignment Readability',
  focalSetpieceKey: ASSET_KEYS.chamber02VertebralHornGate,
  assets: [
    {
      key: ASSET_KEYS.chamber02VertebralHornGate,
      rawSourcePath: 'art/raw/chamber02/vertebral_horn_gate_01_source.png',
      intendedProductionPath: 'assets/chambers/chamber02/vertebral-horn-gate-01.png',
      role: 'Focal monument / orientation anchor setpiece',
      firstPassStatus: 'wired-preload-only',
      integrationNotes:
        'Strong silhouette and ritual hierarchy are immediately usable; keep symmetry/beam treatment tuned conservatively until chamber layout lock.'
    },
    {
      key: ASSET_KEYS.chamber02BackgroundPlate,
      rawSourcePath: 'art/raw/chamber02/chamber02_background_plate_01_source.png',
      intendedProductionPath: 'assets/chambers/chamber02/chamber02-background-plate-01.png',
      role: 'Structural background and wall language',
      firstPassStatus: 'wired-preload-only',
      integrationNotes:
        'Immediately usable for orientation/value grouping once introduced in a dedicated Chamber 02 scene pass.'
    },
    {
      key: ASSET_KEYS.chamber02FloorStrip,
      rawSourcePath: 'art/raw/chamber02/chamber02_floor_strip_01_source.png',
      intendedProductionPath: 'assets/chambers/chamber02/chamber02-floor-strip-01.png',
      role: 'Processional traversal surface',
      firstPassStatus: 'wired-preload-only',
      integrationNotes:
        'Immediately usable for lane readability; final tiling/crop should be tuned against gameplay silhouette contrast.'
    },
    {
      key: ASSET_KEYS.chamber02ForegroundHornArch,
      rawSourcePath: 'art/raw/chamber02/foreground_vertebral_horn_arch_01_source.png',
      intendedProductionPath: 'assets/chambers/chamber02/foreground-vertebral-horn-arch-01.png',
      role: 'Foreground depth framing silhouette',
      firstPassStatus: 'scaffolded-not-placed',
      integrationNotes:
        'Potentially too dominant if layered early; defer world placement until orientation surfaces and combat lanes are validated first.'
    },
    {
      key: ASSET_KEYS.chamber02RitualAlignmentLandmark,
      rawSourcePath: 'art/raw/chamber02/ritual_alignment_landmark_01_source.png',
      intendedProductionPath: 'assets/chambers/chamber02/ritual-alignment-landmark-01.png',
      role: 'Readable ritual landmark for doctrine signaling',
      firstPassStatus: 'scaffolded-for-lore-affordance',
      integrationNotes:
        'Use as a constrained interactable or alignment cue; avoid overcommitting to centered beam language before gameplay route lock.'
    }
  ],
  nextStep:
    'Create a minimal Chamber02Scene art-blockout using background + floor + gate first, then validate readability on iPhone portrait and desktop before adding foreground arch/landmark placement.'
};
