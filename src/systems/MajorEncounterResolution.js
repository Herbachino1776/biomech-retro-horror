import Phaser from 'phaser';

export class MajorEncounterResolution {
  constructor(scene) {
    this.scene = scene;
    this.activeResolutions = new Map();
    this.completedResolutions = new Set();
    this.timers = new Set();

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.teardown();
    });
  }

  isResolutionActive(encounterId) {
    return this.activeResolutions.get(encounterId)?.active === true;
  }

  hasResolved(encounterId) {
    return this.completedResolutions.has(encounterId);
  }

  begin({
    encounterId,
    freezePlayer = false,
    disablePlayerAttack = false,
    setResolutionLock,
    pauseProjectiles,
    onStart,
    stages = [],
    onComplete,
    onFinally
  } = {}) {
    if (!encounterId || this.hasResolved(encounterId) || this.isResolutionActive(encounterId)) {
      return false;
    }

    this.activeResolutions.set(encounterId, { active: true });
    setResolutionLock?.(true);

    if (freezePlayer) {
      this.scene.player?.body?.setVelocity?.(0, 0);
      this.scene.player?.body?.setEnable?.(false);
    }

    if (disablePlayerAttack) {
      this.scene.player?.attackHitbox?.body?.setEnable?.(false);
    }

    pauseProjectiles?.(true);
    onStart?.();

    const sortedStages = [...stages].sort((a, b) => (a?.atMs ?? 0) - (b?.atMs ?? 0));
    sortedStages.forEach((stage) => {
      const delayMs = Math.max(0, Number(stage?.atMs) || 0);
      this.schedule(delayMs, () => {
        if (!this.isResolutionActive(encounterId)) {
          return;
        }
        stage?.run?.();
      });
    });

    const finalAtMs = sortedStages.length > 0 ? Math.max(...sortedStages.map((stage) => Number(stage?.atMs) || 0)) : 0;
    this.schedule(finalAtMs, () => {
      if (!this.isResolutionActive(encounterId)) {
        return;
      }

      this.activeResolutions.set(encounterId, { active: false });
      this.completedResolutions.add(encounterId);
      onComplete?.();

      if (freezePlayer) {
        this.scene.player?.body?.setEnable?.(true);
        this.scene.player?.body?.setVelocity?.(0, 0);
      }
      if (disablePlayerAttack) {
        this.scene.player?.attackHitbox?.body?.setEnable?.(true);
      }

      pauseProjectiles?.(false);
      setResolutionLock?.(false);
      onFinally?.();
    });

    return true;
  }

  schedule(delayMs, callback) {
    const timer = this.scene.time.delayedCall(delayMs, () => {
      this.timers.delete(timer);
      callback?.();
    });
    this.timers.add(timer);
    return timer;
  }

  teardown() {
    this.timers.forEach((timer) => timer?.remove?.(false));
    this.timers.clear();
    this.activeResolutions.clear();
    this.completedResolutions.clear();
  }
}
