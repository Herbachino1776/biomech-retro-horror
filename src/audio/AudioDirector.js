import { ASSET_KEYS } from '../data/assetKeys.js';

const SOUND_GROUPS = {
  footstep: {
    keys: [
      ASSET_KEYS.playerFootstepSlate01,
      ASSET_KEYS.playerFootstepSlate02,
      ASSET_KEYS.playerFootstepSlate03,
      ASSET_KEYS.playerFootstepSlate04
    ],
    volume: 0.21,
    detuneRange: 18,
    minIntervalMs: 90,
    allowOverlap: false
  },
  playerAttack: {
    keys: [ASSET_KEYS.playerAttack],
    fallbackKeys: [ASSET_KEYS.playerAttackFallback],
    volume: 0.19,
    detuneRange: 12,
    minIntervalMs: 80,
    allowOverlap: true
  },
  playerHit: {
    keys: [ASSET_KEYS.playerHit],
    fallbackKeys: [ASSET_KEYS.playerHitFallback],
    volume: 0.24,
    detuneRange: 16,
    minIntervalMs: 70,
    allowOverlap: true
  },
  playerHurt: {
    keys: [ASSET_KEYS.playerHurt],
    fallbackKeys: [ASSET_KEYS.playerHurtFallback],
    volume: 0.26,
    detuneRange: 10,
    minIntervalMs: 120,
    allowOverlap: false
  },
  playerDeath: {
    keys: [ASSET_KEYS.playerDeath],
    fallbackKeys: [ASSET_KEYS.playerDeathFallback],
    volume: 0.32,
    detuneRange: 0,
    minIntervalMs: 600,
    allowOverlap: false
  },
  enemyAttack: {
    keys: [ASSET_KEYS.enemyAttack],
    fallbackKeys: [ASSET_KEYS.enemyAttackFallback],
    volume: 0.18,
    detuneRange: 14,
    minIntervalMs: 120,
    allowOverlap: true
  },
  enemyHurt: {
    keys: [ASSET_KEYS.enemyHurt],
    fallbackKeys: [ASSET_KEYS.enemyHurtFallback],
    volume: 0.2,
    detuneRange: 14,
    minIntervalMs: 90,
    allowOverlap: true
  },
  enemyDeath: {
    keys: [ASSET_KEYS.enemyDeath],
    fallbackKeys: [ASSET_KEYS.enemyDeathFallback],
    volume: 0.24,
    detuneRange: 12,
    minIntervalMs: 180,
    allowOverlap: false
  },
  tollKeeperAttack: {
    keys: [ASSET_KEYS.tollKeeperAttack],
    fallbackKeys: [ASSET_KEYS.enemyAttackFallback],
    volume: 0.22,
    detuneRange: 8,
    minIntervalMs: 180,
    allowOverlap: false
  },
  tollKeeperHurt: {
    keys: [ASSET_KEYS.tollKeeperHurt],
    fallbackKeys: [ASSET_KEYS.enemyHurtFallback],
    volume: 0.24,
    detuneRange: 8,
    minIntervalMs: 140,
    allowOverlap: false
  },
  tollKeeperDeath: {
    keys: [ASSET_KEYS.tollKeeperDeath],
    fallbackKeys: [ASSET_KEYS.enemyDeathFallback],
    volume: 0.4,
    detuneRange: 0,
    minIntervalMs: 400,
    allowOverlap: false
  },
  minibossAttack: {
    keys: [ASSET_KEYS.minibossAttack],
    fallbackKeys: [ASSET_KEYS.minibossAttackFallback],
    volume: 0.26,
    detuneRange: 0,
    minIntervalMs: 260,
    allowOverlap: false
  },
  minibossHurt: {
    keys: [ASSET_KEYS.minibossHurt],
    fallbackKeys: [ASSET_KEYS.minibossHurtFallback],
    volume: 0.25,
    detuneRange: 0,
    minIntervalMs: 160,
    allowOverlap: false
  },
  minibossDeath: {
    keys: [ASSET_KEYS.minibossDeath],
    fallbackKeys: [ASSET_KEYS.minibossDeathFallback],
    volume: 0.34,
    detuneRange: 0,
    minIntervalMs: 900,
    allowOverlap: false
  },
  gateInteract: {
    keys: [ASSET_KEYS.gateInteract],
    volume: 0.24,
    detuneRange: 0,
    minIntervalMs: 180,
    allowOverlap: false
  },
  gateUnlock: {
    keys: [ASSET_KEYS.gateUnlock],
    volume: 0.3,
    detuneRange: 0,
    minIntervalMs: 500,
    allowOverlap: false
  },
  loreEnter: {
    keys: [ASSET_KEYS.loreEnter],
    volume: 0.1365,
    detuneRange: 0,
    minIntervalMs: 400,
    allowOverlap: false
  },
  loreExit: {
    keys: [ASSET_KEYS.loreExit],
    volume: 0.26,
    detuneRange: 0,
    minIntervalMs: 300,
    allowOverlap: false
  },
  banishmentSting: {
    keys: [ASSET_KEYS.banishmentSting],
    volume: 0.34,
    detuneRange: 0,
    minIntervalMs: 900,
    allowOverlap: false
  }
};

const PROFILE_MAP = {
  enemy: {
    attack: 'enemyAttack',
    hurt: 'enemyHurt',
    death: 'enemyDeath'
  },
  tollkeeper: {
    attack: 'tollKeeperAttack',
    hurt: 'tollKeeperHurt',
    death: 'tollKeeperDeath'
  },
  miniboss: {
    attack: 'minibossAttack',
    hurt: 'minibossHurt',
    death: 'minibossDeath'
  }
};

const AMBIENT_SOUND_CONFIG = {
  fadeDurationMs: 220,
  volume: 0.13
};

export class AudioDirector {
  constructor(scene) {
    this.scene = scene;
    this.variantCursor = new Map();
    this.lastPlayedAt = new Map();
    this.activeSounds = new Map();
    this.activeAmbient = null;
    this.ambientFadeTween = null;
  }

  playPlayerFootstep() { this.playGroup('footstep'); }
  playPlayerAttack() { this.playGroup('playerAttack'); }
  playPlayerHit() { this.playGroup('playerHit'); }
  playPlayerHurt() { this.playGroup('playerHurt'); }
  playPlayerDeath() { this.playGroup('playerDeath'); }
  playEnemyAttack(profile = 'enemy') { this.playProfileGroup(profile, 'attack'); }
  playEnemyHurt(profile = 'enemy') { this.playProfileGroup(profile, 'hurt'); }
  playEnemyDeath(profile = 'enemy') { this.playProfileGroup(profile, 'death'); }
  playGateInteract() { this.playGroup('gateInteract'); }
  playGateUnlock() { this.playGroup('gateUnlock'); }
  playLoreEnter() { this.playGroup('loreEnter'); }
  playLoreExit() { this.playGroup('loreExit'); }
  playBanishmentSting() { this.playGroup('banishmentSting'); }

  playAmbientLoop(key, config = {}) {
    if (!this.scene.sound || this.scene.sound.mute || !key || !this.scene.cache.audio.exists(key)) {
      return;
    }

    const targetVolume = config.volume ?? AMBIENT_SOUND_CONFIG.volume;
    if (this.activeAmbient?.key === key && this.activeAmbient.isPlaying) {
      this.stopAmbientFadeTween();
      this.activeAmbient.setVolume(targetVolume);
      this.activeAmbient.setMute(false);
      return;
    }

    this.stopAmbientLoop({ fadeOut: false });

    const ambient = this.scene.sound.add(key, {
      loop: true,
      volume: targetVolume
    });
    ambient.play();
    this.activeAmbient = ambient;
  }

  stopAmbientLoop({ fadeOut = true } = {}) {
    if (!this.activeAmbient) {
      return;
    }

    const ambient = this.activeAmbient;
    this.activeAmbient = null;
    this.stopAmbientFadeTween();

    if (!fadeOut || !ambient.isPlaying) {
      ambient.stop();
      ambient.destroy();
      return;
    }

    this.ambientFadeTween = this.scene.tweens.add({
      targets: ambient,
      volume: 0,
      duration: AMBIENT_SOUND_CONFIG.fadeDurationMs,
      onComplete: () => {
        ambient.stop();
        ambient.destroy();
        if (this.ambientFadeTween?.targets?.includes?.(ambient)) {
          this.ambientFadeTween = null;
        }
      }
    });
  }

  stopAmbientFadeTween() {
    if (!this.ambientFadeTween) {
      return;
    }

    this.ambientFadeTween.stop();
    this.ambientFadeTween = null;
  }

  playProfileGroup(profile, event) {
    const group = PROFILE_MAP[profile]?.[event];
    if (group) {
      this.playGroup(group);
    }
  }

  playGroup(groupName) {
    const soundConfig = SOUND_GROUPS[groupName];
    if (!soundConfig || !this.scene.sound || this.scene.sound.mute) {
      return;
    }

    const now = this.scene.time.now;
    const lastPlayedAt = this.lastPlayedAt.get(groupName) ?? -Infinity;
    if (now < lastPlayedAt + soundConfig.minIntervalMs) {
      return;
    }

    const key = this.resolvePlayableKey(groupName, soundConfig.keys, soundConfig.fallbackKeys);
    if (!key) {
      return;
    }
    const detune = soundConfig.detuneRange > 0 ? Math.round((Math.random() * 2 - 1) * soundConfig.detuneRange) : 0;

    if (!soundConfig.allowOverlap) {
      this.activeSounds.get(groupName)?.stop();
    }

    const sound = this.scene.sound.add(key, { volume: soundConfig.volume, detune });
    sound.once('complete', () => {
      if (this.activeSounds.get(groupName) === sound) {
        this.activeSounds.delete(groupName);
      }
      sound.destroy();
    });

    if (!soundConfig.allowOverlap) {
      this.activeSounds.set(groupName, sound);
    }

    this.lastPlayedAt.set(groupName, now);
    sound.play();
  }

  nextVariantKey(groupName, keys) {
    const cursor = this.variantCursor.get(groupName) ?? 0;
    const key = keys[cursor % keys.length];
    this.variantCursor.set(groupName, cursor + 1);
    return key;
  }

  resolvePlayableKey(groupName, keys, fallbackKeys = []) {
    const primaryKey = this.nextLoadedKey(groupName, keys);
    if (primaryKey) {
      return primaryKey;
    }

    return this.nextLoadedKey(`${groupName}-fallback`, fallbackKeys);
  }

  nextLoadedKey(groupName, keys = []) {
    const loadedKeys = keys.filter((key) => this.scene.cache.audio.exists(key));
    if (loadedKeys.length === 0) {
      return null;
    }

    return this.nextVariantKey(groupName, loadedKeys);
  }

  shutdown() {
    this.stopAmbientLoop({ fadeOut: false });
    this.activeSounds.forEach((sound) => sound.stop());
    this.activeSounds.clear();
  }
}

