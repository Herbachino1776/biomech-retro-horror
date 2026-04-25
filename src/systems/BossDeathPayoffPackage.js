import Phaser from 'phaser';
import { triggerSector02BlackOilBlowout } from './Sector02BlackOilPayoff.js';
import { spawnEnemyCorpseRemains } from './EnemyCorpseRemains.js';

function resolveBossAnchorY(sprite, fallbackY) {
  return sprite?.body?.bottom ?? sprite?.y ?? fallbackY;
}

export function beginBossDeathPayoffPackage({
  scene,
  encounterId,
  majorEncounterResolution,
  bossSprite,
  bossBody,
  bossActor,
  player,
  setResolutionLock,
  pauseProjectiles,
  followPlayer,
  deathCamera,
  victory,
  payoffPose,
  corpseRemains,
  onStart,
  onPreExplosion,
  onDespawn,
  onComplete,
  onFinally
} = {}) {
  if (!scene || !majorEncounterResolution || !bossSprite || !player || !encounterId) {
    return false;
  }

  if (majorEncounterResolution.isResolutionActive(encounterId) || majorEncounterResolution.hasResolved(encounterId)) {
    return false;
  }

  const state = {
    goreFountainTimer: null,
    deathCameraFocusTween: null,
    deathCameraRestoreTween: null,
    payoffLocation: null
  };

  const stopGoreFountain = () => {
    state.goreFountainTimer?.remove(false);
    state.goreFountainTimer = null;
  };

  const restoreCamera = () => {
    state.deathCameraFocusTween?.remove();
    state.deathCameraRestoreTween?.remove();

    scene.cameras.main.startFollow(
      player.sprite,
      true,
      followPlayer.cameraLerp?.x ?? 0.08,
      followPlayer.cameraLerp?.y ?? 0.08,
      followPlayer.followOffsetX ?? 0,
      followPlayer.followOffsetY ?? 0
    );

    state.deathCameraRestoreTween = scene.tweens.add({
      targets: scene.cameras.main,
      zoom: followPlayer.zoom,
      duration: deathCamera.zoomOutDurationMs,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        followPlayer.onRestored?.();
      }
    });
  };

  const stabilizeBossCorpse = () => {
    const payoffGroundY = payoffPose.floorPlaneY + (payoffPose.visibleFootOffsetY ?? 0);
    const groundedPayoffY = payoffGroundY - bossSprite.displayHeight * (1 - bossSprite.originY);
    const maxRaisedY = bossSprite.y - (payoffPose.maxUpwardSnapPx ?? 0);
    const payoffY = Math.max(groundedPayoffY, maxRaisedY);

    scene.tweens.killTweensOf(bossSprite);
    bossBody?.setVelocity?.(0, 0);
    bossBody?.setAcceleration?.(0, 0);

    if (payoffPose.scaleX || payoffPose.scaleY) {
      bossSprite.setScale(payoffPose.scaleX ?? bossSprite.scaleX, payoffPose.scaleY ?? bossSprite.scaleY);
    }

    bossSprite
      .setAlpha(1)
      .setVisible(true)
      .setX(bossSprite.x)
      .setY(payoffY)
      .setAngle(payoffPose.angle ?? 0);

    state.payoffLocation = {
      x: bossSprite.x,
      y: payoffY,
      floorPlaneY: payoffGroundY
    };
  };

  const focusCameraOnBoss = () => {
    state.deathCameraFocusTween?.remove();
    state.deathCameraRestoreTween?.remove();

    scene.cameras.main.startFollow(
      bossSprite,
      true,
      deathCamera.focusLerp?.x ?? 0.06,
      deathCamera.focusLerp?.y ?? 0.06,
      deathCamera.focusOffsetX ?? 0,
      deathCamera.focusOffsetY ?? 0
    );

    state.deathCameraFocusTween = scene.tweens.add({
      targets: scene.cameras.main,
      zoom: scene.cameras.main.zoom * deathCamera.zoomScale,
      duration: deathCamera.zoomInDurationMs,
      ease: 'Sine.easeOut'
    });
  };

  const spawnGoreBurst = (config) => {
    triggerSector02BlackOilBlowout(scene, {
      source: bossSprite,
      x: bossSprite.x + (config.xJitter ? Phaser.Math.Between(config.xJitter[0], config.xJitter[1]) : 0),
      y: resolveBossAnchorY(bossSprite, bossSprite.y) - Phaser.Math.Between(config.yFromBottom[0], config.yFromBottom[1]),
      depth: bossSprite.depth + (config.depthOffset ?? 0.38),
      scale: config.randomScale ? Phaser.Math.FloatBetween(config.randomScale[0], config.randomScale[1]) : config.scale,
      durationMs: config.durationMs,
      burstCount: config.burstCount,
      sprayCount: config.sprayCount,
      mistCount: config.mistCount,
      emberCount: config.emberCount,
      burstRadiusX: config.burstRadiusX,
      burstRadiusY: config.burstRadiusY,
      dropletWidth: config.dropletWidth,
      dropletHeight: config.dropletHeight,
      sprayWidth: config.sprayWidth,
      sprayHeight: config.sprayHeight,
      splashColor: config.splashColor,
      heavyColor: config.heavyColor,
      highlightColor: config.highlightColor,
      redSpeckColor: config.redSpeckColor,
      mistColor: config.mistColor,
      alpha: config.alpha ?? 0.98,
      includeGroundPool: false,
      persistPuddle: false,
      fadeSource: false
    });
  };

  const startGoreFountain = () => {
    stopGoreFountain();
    if (!bossSprite?.active) {
      return;
    }

    const spawnFountainBurst = () => {
      if (!bossSprite?.active) {
        return;
      }
      spawnGoreBurst(victory.fountainBurst);
    };

    spawnFountainBurst();
    state.goreFountainTimer = scene.time.addEvent({
      delay: victory.goreFountainCadenceMs,
      repeat: Math.ceil(victory.preExplosionShakeMs / victory.goreFountainCadenceMs),
      callback: spawnFountainBurst
    });
  };

  const despawnBoss = () => {
    stopGoreFountain();
    if (!bossSprite) {
      return;
    }

    const corpseFloorPlaneY = Number.isFinite(corpseRemains.floorPlaneY)
      ? corpseRemains.floorPlaneY + (corpseRemains.visibleFootOffsetY ?? 0)
      : state.payoffLocation?.floorPlaneY;

    spawnEnemyCorpseRemains(scene, {
      x: state.payoffLocation?.x ?? bossSprite.x,
      floorPlaneY: corpseFloorPlaneY,
      groundY: corpseRemains.groundY,
      depth: bossSprite.depth,
      size: corpseRemains.size
    });
    bossSprite.setVisible(false).setAlpha(0);
    bossActor?.setActive?.(false);
    bossBody?.setEnable?.(false);
    bossActor?.destroyCombatTelegraphs?.();
    onDespawn?.();
  };

  return majorEncounterResolution.begin({
    encounterId,
    freezePlayer: true,
    disablePlayerAttack: true,
    pauseProjectiles,
    setResolutionLock,
    onStart: () => {
      onStart?.();
      stabilizeBossCorpse();
      focusCameraOnBoss();
      scene.cameras.main.shake(victory.preExplosionShakeMs, victory.preExplosionShakeIntensity, true);
      startGoreFountain();
    },
    stages: [
      {
        atMs: victory.preExplosionShakeMs,
        run: () => {
          stopGoreFountain();
          spawnGoreBurst(victory.blowoutBurst);
          majorEncounterResolution.schedule(victory.explosionFadeStartDelayMs, () => {
            scene.tweens.killTweensOf(bossSprite);
            scene.tweens.add({
              targets: bossSprite,
              alpha: 0,
              duration: victory.explosionFadeDurationMs,
              ease: 'Sine.easeInOut'
            });
          });
          scene.audioDirector?.playBanishmentSting();
          onPreExplosion?.();
        }
      },
      {
        atMs: victory.preExplosionShakeMs + victory.postExplosionDespawnDelayMs,
        run: () => {
          despawnBoss();
        }
      },
      ...(victory.extraStages ?? [])
    ],
    onComplete: () => {
      player.body?.setEnable?.(true);
      player.body?.setVelocity?.(0, 0);
      player.attackHitbox?.body?.setEnable?.(true);
      restoreCamera();
      onComplete?.();
    },
    onFinally: () => {
      stopGoreFountain();
      onFinally?.();
    }
  });
}
