import { ASSET_KEYS } from '../data/assetKeys.js';

const SOUND_GROUPS = {
  footstep: {
    keys: [
      ASSET_KEYS.playerFootstepSlate01,
      ASSET_KEYS.playerFootstepSlate02,
      ASSET_KEYS.playerFootstepSlate03,
      ASSET_KEYS.playerFootstepSlate04
    ],
    volume: 0.18,
    detuneRange: 18,
    minIntervalMs: 90,
    allowOverlap: false
  },
  playerAttack: {
    keys: [ASSET_KEYS.playerAttack],
    fallbackKeys: [ASSET_KEYS.playerAttackFallback],
    volume: 0.22,
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
    volume: 0.18,
    detuneRange: 14,
    minIntervalMs: 120,
    allowOverlap: true
  },
  enemyHurt: {
    keys: [ASSET_KEYS.enemyHurt],
    volume: 0.2,
    detuneRange: 14,
    minIntervalMs: 90,
    allowOverlap: true
  },
  enemyDeath: {
    keys: [ASSET_KEYS.enemyDeath],
    volume: 0.24,
    detuneRange: 12,
    minIntervalMs: 180,
    allowOverlap: false
  },
  tollKeeperAttack: {
    keys: [ASSET_KEYS.tollKeeperAttack],
    volume: 0.22,
    detuneRange: 8,
    minIntervalMs: 180,
    allowOverlap: false
  },
  tollKeeperHurt: {
    keys: [ASSET_KEYS.tollKeeperHurt],
    volume: 0.24,
    detuneRange: 8,
    minIntervalMs: 140,
    allowOverlap: false
  },
  tollKeeperDeath: {
    keys: [ASSET_KEYS.tollKeeperDeath],
    volume: 0.3,
    detuneRange: 0,
    minIntervalMs: 400,
    allowOverlap: false
  },
  minibossAttack: {
    keys: [ASSET_KEYS.minibossAttack],
    volume: 0.26,
    detuneRange: 0,
    minIntervalMs: 260,
    allowOverlap: false
  },
  minibossHurt: {
    keys: [ASSET_KEYS.minibossHurt],
    volume: 0.25,
    detuneRange: 0,
    minIntervalMs: 160,
    allowOverlap: false
  },
  minibossDeath: {
    keys: [ASSET_KEYS.minibossDeath],
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

export class AudioDirector {
  constructor(scene) {
    this.scene = scene;
    this.variantCursor = new Map();
    this.lastPlayedAt = new Map();
    this.activeSounds = new Map();
  }

  playPlayerFootstep() { this.playGroup('footstep'); }
  playPlayerAttack() { this.playGroup('playerAttack'); }
  playPlayerHit() { this.playGroup('playerHit'); }
  playPlayerHurt() { this.playGroup('playerHurt'); }
  playPlayerDeath() { this.playGroup('playerDeath'); }
  playEnemyAttack(profile = 'enemy') { this.playProfileGroup(profile, 'attack'); }
  playEnemyHurt(profile = 'enemy') { this.playProfileGroup(profile, 'hurt'); }
  playEnemyDeath(profile = 'enemy') { this.playProfileGroup(profile, 'death'); }

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
    this.activeSounds.forEach((sound) => sound.stop());
    this.activeSounds.clear();
  }
}
