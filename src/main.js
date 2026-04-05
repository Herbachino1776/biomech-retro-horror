import Phaser from 'phaser';
import { gameConfig } from './data/gameConfig.js';
import { BootScene } from './scenes/BootScene.js';
import { PreTitleScene } from './scenes/PreTitleScene.js';
import { Chamber01Scene } from './scenes/Chamber01Scene.js';
import { LoreScreenScene } from './scenes/LoreScreenScene.js';
import { Chamber02Scene } from './scenes/Chamber02Scene.js';
import { Chamber02BossPitScene } from './scenes/Chamber02BossPitScene.js';
import { Chamber02BossPitHollowSkyScene } from './scenes/Chamber02BossPitHollowSkyScene.js';
import { Chamber03Scene } from './scenes/Chamber03Scene.js';
import { Chamber03BossArenaScene } from './scenes/Chamber03BossArenaScene.js';
import { LoreCutsceneScene } from './scenes/LoreCutsceneScene.js';
import { SectorCompleteScene } from './scenes/SectorCompleteScene.js';
import { Sector02Chamber01Scene } from './scenes/Sector02Chamber01Scene.js';
import { Sector02Chamber02Scene } from './scenes/Sector02Chamber02Scene.js';
import { Sector02Chamber02BossPitScene } from './scenes/Sector02Chamber02BossPitScene.js';
import { Sector02Chamber03Scene } from './scenes/Sector02Chamber03Scene.js';
import { Sector03Chamber01Scene } from './scenes/Sector03Chamber01Scene.js';
import { Sector03Chamber01BossPitScene } from './scenes/Sector03Chamber01BossPitScene.js';
import { Sector03Chamber02Scene } from './scenes/Sector03Chamber02Scene.js';
import { Sector03Chamber02BossPitScene } from './scenes/Sector03Chamber02BossPitScene.js';
import { Sector03Chamber02BossChamberScene } from './scenes/Sector03Chamber02BossChamberScene.js';
import { Sector03Chamber03Scene } from './scenes/Sector03Chamber03Scene.js';
import { Sector03Chamber03BossChamberScene } from './scenes/Sector03Chamber03BossChamberScene.js';
import { Sector04Chamber01Scene } from './scenes/Sector04Chamber01Scene.js';
import { Sector04Chamber01BossPitReliquaryStalkerScene } from './scenes/Sector04Chamber01BossPitReliquaryStalkerScene.js';

const config = {
  ...gameConfig,
  scene: [
    BootScene,
    PreTitleScene,
    Chamber01Scene,
    LoreScreenScene,
    Chamber02Scene,
    Chamber02BossPitScene,
    Chamber02BossPitHollowSkyScene,
    Chamber03Scene,
    Chamber03BossArenaScene,
    LoreCutsceneScene,
    SectorCompleteScene,
    Sector02Chamber01Scene,
    Sector02Chamber02Scene,
    Sector02Chamber02BossPitScene,
    Sector02Chamber03Scene,
    Sector03Chamber01Scene,
    Sector03Chamber01BossPitScene,
    Sector03Chamber02Scene,
    Sector03Chamber02BossPitScene,
    Sector03Chamber02BossChamberScene,
    Sector03Chamber03Scene,
    Sector03Chamber03BossChamberScene,
    Sector04Chamber01Scene,
    Sector04Chamber01BossPitReliquaryStalkerScene
  ],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  }
};

const game = new Phaser.Game(config);

if (typeof window !== 'undefined') {
  window.__BIOMECH_GAME__ = game;
}
