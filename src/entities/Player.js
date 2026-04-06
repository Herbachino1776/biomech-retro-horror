import Phaser from 'phaser';
import { CONCEPT_PRESENTATION } from '../data/milestone1Config.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { getNormalizedDisplaySize, getNormalizedOrigin, getNormalizedYOffset } from '../systems/conceptSpriteNormalizer.js';
import { vesselIntegrityState } from '../systems/VesselIntegrityState.js';

const PLAYER_WALK_ANIMATION_KEY = 'player-walk';
const PLAYER_IDLE_ANIMATION_KEY = 'player-idle';
const PLAYER_WALK_FPS = 8;
const PLAYER_WALK_MIN_SPEED = 36;
const PLAYER_IDLE_FPS = 5;
const PLAYER_IDLE_MAX_SPEED = 20;
const BRUTALITY_TRANSITION_DURATION_MS = 180;
const BRUTALITY_FORM_SCALE_BOOST = 1.15;
const BRUTALITY_HAMMER_DISPLAY_SCALE = 2.35;
const DEFAULT_BRUTALITY_MODIFIERS = {
  visualScale: 1.28,
  bodyScale: 1.16,
  speedMultiplier: 1.25,
  reachMultiplier: 1.2,
  damageMultiplier: 2
};

export class Player {
  constructor(scene, x, y, config) {
    this.scene = scene;
    this.config = config;
    const integritySnapshot = vesselIntegrityState.getIntegritySnapshot();
    this.maxHealth = integritySnapshot.max;
    this.health = integritySnapshot.current;
    this.facing = 1;
    this.attackActive = false;
    this.attackPhase = 'idle';
    this.attackId = 0;
    this.lastAttackTime = -Infinity;
    this.lastHitTime = -Infinity;
    this.lastFootstepAt = -Infinity;
    this.isDead = false;

    this.usingConceptSprite = scene.textures.exists(ASSET_KEYS.player);
    const playerPresentation = CONCEPT_PRESENTATION.player;
    const displaySize = getNormalizedDisplaySize(playerPresentation);
    const origin = getNormalizedOrigin(playerPresentation);
    const visualYOffset = getNormalizedYOffset(playerPresentation);

    this.sprite = this.usingConceptSprite
      ? scene.add
          .sprite(x, y + visualYOffset, ASSET_KEYS.player, 0)
          .setOrigin(origin.x, origin.y)
          .setDisplaySize(displaySize.width, displaySize.height)
          .setAlpha(playerPresentation.alpha ?? 1)
          .setDepth(6)
      : scene.add.rectangle(x, y, 48, 60, 0xb8aa92).setOrigin(0.5).setDepth(6);
    if (this.usingConceptSprite) {
      this.registerWalkAnimation();
      this.registerIdleAnimation();
    }
    scene.physics.add.existing(this.sprite);

    this.body = this.sprite.body;
    this.body.setCollideWorldBounds(true);
    this.body.setGravityY(0);

    this.baseVisualScale = {
      x: Math.abs(this.sprite.scaleX) || 1,
      y: Math.abs(this.sprite.scaleY) || 1
    };
    this.baseVisualSize = {
      width: this.sprite.displayWidth / this.baseVisualScale.x,
      height: this.sprite.displayHeight / this.baseVisualScale.y
    };
    this.baseBody = {
      width: config.body.width,
      height: config.body.height,
      offsetX: config.body.offsetX,
      offsetY: config.body.offsetY
    };
    this.baseGrounding = {
      visualFeetY: null,
      bodyBottomY: null,
      bodyBottomMinusVisualFeetDelta: 0
    };
    this.applyScaleAndCollision(1, 1);
    this.baseGrounding.visualFeetY = this.getVisualFeetY();
    this.baseGrounding.bodyBottomY = this.body.bottom;
    this.baseGrounding.bodyBottomMinusVisualFeetDelta = this.baseGrounding.bodyBottomY - this.baseGrounding.visualFeetY;

    const attackHitboxConfig = this.config.attackHitbox ?? {};
    this.attackHitbox = scene.add.zone(
      x + (attackHitboxConfig.forwardOffset ?? 42),
      y + (attackHitboxConfig.yOffset ?? 2),
      attackHitboxConfig.width ?? 50,
      attackHitboxConfig.height ?? 34
    );
    scene.physics.add.existing(this.attackHitbox);
    this.attackHitbox.body.allowGravity = false;
    this.attackHitbox.body.moves = false;
    this.attackHitbox.body.enable = false;

    this.weaponSwingTween = null;
    this.baseMoveSpeed = this.config.moveSpeed;
    this.baseAttackHitbox = { ...(this.config.attackHitbox ?? {}) };
    this.brutalityMode = {
      active: false,
      ...DEFAULT_BRUTALITY_MODIFIERS
    };
    this.currentBrutalityVisualScale = 1;
    this.currentBrutalityBodyScale = 1;
    this.brutalityTransition = {
      active: false,
      startedAt: 0,
      durationMs: BRUTALITY_TRANSITION_DURATION_MS,
      fromVisualScale: 1,
      fromBodyScale: 1,
      toVisualScale: 1,
      toBodyScale: 1,
      floorAnchorY: null
    };

    const weaponDisplay = this.config.weaponVisual?.display ?? { width: 72, height: 72 };
    this.baseWeaponDisplay = {
      width: weaponDisplay.width,
      height: weaponDisplay.height
    };
    this.weaponSprite = this.createWeaponSprite(x, y + visualYOffset);
    const restingPose = this.config.weaponVisual?.restingPose;
    this.weaponPoseState = restingPose
      ? {
          offsetX: restingPose.offsetX,
          offsetY: restingPose.offsetY,
          rotationDeg: restingPose.rotationDeg,
          depthOffset: restingPose.depthOffset ?? -1
        }
      : null;
    this.updateWeaponAttachment();
  }

  update(time, input) {
    this.updateBrutalityTransition(time);

    if (this.isDead) {
      this.body.setVelocityX(0);
      return;
    }

    let direction = 0;
    if (input.left) {
      direction = -1;
    } else if (input.right) {
      direction = 1;
    }

    if (direction !== 0) {
      this.facing = direction;
    }

    const targetSpeed = direction * this.config.moveSpeed;
    const inAttackCommit = this.attackPhase === 'startup' || this.attackPhase === 'active' || this.attackPhase === 'recovery';
    const allowedMaxSpeed = inAttackCommit
      ? this.config.moveSpeed * this.config.attackMoveSpeedMultiplier
      : this.config.moveSpeed;
    const cappedTargetSpeed = Phaser.Math.Clamp(targetSpeed, -allowedMaxSpeed, allowedMaxSpeed);
    const acceleration = direction === 0 ? this.config.moveDeceleration : this.config.moveAcceleration;
    const deltaSeconds = this.scene.game.loop.delta / 1000;
    const nextVelocityX = Phaser.Math.Clamp(
      this.body.velocity.x + Phaser.Math.Clamp(cappedTargetSpeed - this.body.velocity.x, -acceleration * deltaSeconds, acceleration * deltaSeconds),
      -allowedMaxSpeed,
      allowedMaxSpeed
    );
    this.body.setVelocityX(nextVelocityX);

    if (input.jumpPressed && this.body.blocked.down) {
      this.body.setVelocityY(this.config.jumpVelocity);
    }

    if (input.attackPressed && this.attackPhase === 'idle' && time > this.lastAttackTime + this.config.attackCooldownMs) {
      this.startAttack(time);
    }

    this.updateAttackState(time);

    this.updateVisuals(time);
    this.updateAttackHitbox();
    this.updateFootsteps(time);
  }

  startAttack(time) {
    this.lastAttackTime = time;
    this.attackActive = false;
    this.attackPhase = 'startup';
    this.attackHitbox.body.enable = false;
    this.playWeaponSwing();
    this.scene.audioDirector?.playPlayerAttack();
  }

  updateAttackState(time) {
    if (this.attackPhase === 'idle') {
      return;
    }

    const attackElapsed = time - this.lastAttackTime;

    if (this.attackPhase === 'startup' && attackElapsed >= this.config.attackStartupMs) {
      this.attackPhase = 'active';
      this.attackActive = true;
      this.attackId += 1;
      this.attackHitbox.body.enable = true;
      return;
    }

    if (this.attackPhase === 'active' && attackElapsed >= this.config.attackStartupMs + this.config.attackActiveMs) {
      this.attackPhase = 'recovery';
      this.attackActive = false;
      this.attackHitbox.body.enable = false;
      return;
    }

    if (this.attackPhase === 'recovery' && attackElapsed >= this.config.attackStartupMs + this.config.attackActiveMs + this.config.attackRecoveryMs) {
      this.endAttack();
    }
  }

  endAttack() {
    this.attackPhase = 'idle';
    this.attackActive = false;
    this.attackHitbox.body.enable = false;
    this.stopWeaponSwingTween();
    this.resetWeaponToRestPose();
  }

  receiveDamage(amount, time) {
    if (this.isDead || time < this.lastHitTime + this.config.invulnMs) {
      return false;
    }

    this.damage(amount);
    this.lastHitTime = time;

    this.scene.audioDirector?.playPlayerHurt();

    if (this.health <= 0) {
      this.die();
    }

    return true;
  }

  damage(amount = 1) {
    const next = vesselIntegrityState.damage(amount);
    this.health = next.current;
    this.maxHealth = next.max;
    return this.health;
  }

  heal(amount = 1) {
    const next = vesselIntegrityState.heal(amount);
    this.health = next.current;
    this.maxHealth = next.max;
    return this.health;
  }

  partialRestore(amount = 1) {
    return this.heal(amount);
  }

  fullRestore() {
    const next = vesselIntegrityState.fullRestore();
    this.health = next.current;
    this.maxHealth = next.max;
    return this.health;
  }

  setMaxIntegrity(amount) {
    const next = vesselIntegrityState.setMaxIntegrity(amount);
    this.health = next.current;
    this.maxHealth = next.max;
    return this.maxHealth;
  }

  increaseMaxIntegrity(amount = 1) {
    const next = vesselIntegrityState.increaseMaxIntegrity(amount, { restoreCurrent: true });
    this.health = next.current;
    this.maxHealth = next.max;
    return this.maxHealth;
  }

  die() {
    this.isDead = true;
    this.endAttack();
    this.body.setVelocity(0, 0);
    this.body.enable = false;
    this.setVisualTint(0x392926);
    this.scene.audioDirector?.playPlayerDeath();
  }

  updateVisuals(time) {
    this.applyFacingVisual();
    this.applyAirborneVisual();
    this.updateWeaponAttachment();

    if (this.usingConceptSprite) {
      this.updateSpriteAnimationState();
    }

    if (this.isDead) {
      this.setVisualTint(0x392926);
      return;
    }

    if (time < this.lastHitTime + 140) {
      this.setVisualTint(0x64453a);
      return;
    }

    this.setVisualTint(0xb8aa92);
  }


  applyFacingVisual() {
    if (!this.usingConceptSprite) {
      return;
    }

    this.sprite.setFlipX(this.facing < 0);
  }

  applyAirborneVisual() {
    if (!this.usingConceptSprite) {
      return;
    }

    const inAttackCommit = this.attackPhase === 'startup' || this.attackPhase === 'active' || this.attackPhase === 'recovery';
    if (inAttackCommit || this.body.blocked.down) {
      this.sprite.setAngle(0);
      return;
    }

    const facing = this.facing >= 0 ? 1 : -1;
    const airborneVisualConfig = this.config.airborneVisual ?? {};
    const jumpTilt = airborneVisualConfig.jumpTiltDeg ?? 6;
    const fallTilt = airborneVisualConfig.fallTiltDeg ?? 9;
    const airborneTilt = this.body.velocity.y < 0 ? jumpTilt : fallTilt;
    this.sprite.setAngle(airborneTilt * facing);
  }

  createWeaponSprite(x, y) {
    const textureKey = this.resolveWeaponTextureKey();
    if (!this.scene.textures.exists(textureKey)) {
      return null;
    }

    return this.scene.add
      .image(x, y, textureKey)
      .setOrigin(0.5, 0.58)
      .setDisplaySize(this.baseWeaponDisplay.width, this.baseWeaponDisplay.height)
      .setDepth((this.sprite.depth ?? 6) - 1);
  }

  resolveWeaponTextureKey() {
    if (this.brutalityMode?.active && this.scene.textures.exists(ASSET_KEYS.playerWeaponHammerOfBanishment01)) {
      return ASSET_KEYS.playerWeaponHammerOfBanishment01;
    }
    return ASSET_KEYS.playerWeaponHammer01;
  }

  applyBrutalityMode(modifiers = {}, time = this.scene.time.now) {
    const nextModifiers = { ...DEFAULT_BRUTALITY_MODIFIERS, ...modifiers };
    this.brutalityMode = {
      ...this.brutalityMode,
      ...nextModifiers,
      active: true
    };
    this.config.moveSpeed = this.baseMoveSpeed * this.brutalityMode.speedMultiplier;
    this.startBrutalityTransition(
      this.brutalityMode.visualScale * BRUTALITY_FORM_SCALE_BOOST,
      this.brutalityMode.bodyScale * BRUTALITY_FORM_SCALE_BOOST,
      time
    );
    this.updateWeaponTexture();
  }

  clearBrutalityMode(time = this.scene.time.now) {
    this.brutalityMode.active = false;
    this.config.moveSpeed = this.baseMoveSpeed;
    this.startBrutalityTransition(1, 1, time);
    this.updateWeaponTexture();
  }

  updateWeaponTexture() {
    if (!this.weaponSprite) {
      return;
    }
    this.weaponSprite.setTexture(this.resolveWeaponTextureKey());
    this.applyWeaponDisplaySize();
  }

  applyWeaponDisplaySize() {
    if (!this.weaponSprite) {
      return;
    }

    const usingBrutalityHammer = this.brutalityMode?.active && this.weaponSprite.texture?.key === ASSET_KEYS.playerWeaponHammerOfBanishment01;
    const displayScale = usingBrutalityHammer ? BRUTALITY_HAMMER_DISPLAY_SCALE : 1;
    this.weaponSprite.setDisplaySize(this.baseWeaponDisplay.width * displayScale, this.baseWeaponDisplay.height * displayScale);
  }

  startBrutalityTransition(targetVisualScale = 1, targetBodyScale = 1, time = this.scene.time.now) {
    this.brutalityTransition.active = true;
    this.brutalityTransition.startedAt = time;
    this.brutalityTransition.fromVisualScale = this.currentBrutalityVisualScale;
    this.brutalityTransition.fromBodyScale = this.currentBrutalityBodyScale;
    this.brutalityTransition.toVisualScale = targetVisualScale;
    this.brutalityTransition.toBodyScale = targetBodyScale;
    this.brutalityTransition.floorAnchorY = this.getVisualFeetAnchorY();
  }

  updateBrutalityTransition(time) {
    if (!this.brutalityTransition.active) {
      return;
    }

    const durationMs = Math.max(1, this.brutalityTransition.durationMs ?? BRUTALITY_TRANSITION_DURATION_MS);
    const rawT = Phaser.Math.Clamp((time - this.brutalityTransition.startedAt) / durationMs, 0, 1);
    const easedT = Phaser.Math.Easing.Cubic.Out(rawT);
    const visualScale = Phaser.Math.Linear(this.brutalityTransition.fromVisualScale, this.brutalityTransition.toVisualScale, easedT);
    const bodyScale = Phaser.Math.Linear(this.brutalityTransition.fromBodyScale, this.brutalityTransition.toBodyScale, easedT);
    this.applyScaleAndCollision(visualScale, bodyScale, this.brutalityTransition.floorAnchorY);

    if (rawT >= 1) {
      this.brutalityTransition.active = false;
      this.brutalityTransition.floorAnchorY = null;
    }
  }

  applyScaleAndCollision(visualScaleMultiplier = 1, bodyScaleMultiplier = 1, floorAnchorY = null) {
    const resolvedVisualFeetAnchorY = Number.isFinite(floorAnchorY) ? floorAnchorY : this.getVisualFeetAnchorY();
    const baselineBodyBottomMinusVisualFeetDelta = Number.isFinite(this.baseGrounding?.bodyBottomMinusVisualFeetDelta)
      ? this.baseGrounding.bodyBottomMinusVisualFeetDelta
      : this.getCurrentBodyBottomMinusVisualFeetDelta();
    const targetBodyBottomY = resolvedVisualFeetAnchorY + baselineBodyBottomMinusVisualFeetDelta;
    const targetScaleX = this.baseVisualScale.x * visualScaleMultiplier;
    const targetScaleY = this.baseVisualScale.y * visualScaleMultiplier;
    this.sprite.setScale(targetScaleX, targetScaleY);
    this.setVisualFeetY(resolvedVisualFeetAnchorY);

    const scaleX = Math.abs(this.sprite.scaleX) || 1;
    const scaleY = Math.abs(this.sprite.scaleY) || 1;
    const baseBodyWidth = this.baseBody.width;
    const baseBodyHeight = this.baseBody.height;
    const bodyWidth = (baseBodyWidth * bodyScaleMultiplier) / scaleX;
    const bodyHeight = (baseBodyHeight * bodyScaleMultiplier) / scaleY;
    const widthGrowthWorld = baseBodyWidth * (bodyScaleMultiplier - 1);
    const bodyOffsetX = (this.baseBody.offsetX - widthGrowthWorld * 0.5) / scaleX;
    const bodyOffsetY = (targetBodyBottomY - this.sprite.y) / scaleY - bodyHeight;
    this.body.setSize(bodyWidth, bodyHeight);
    this.body.setOffset(bodyOffsetX, bodyOffsetY);
    this.body.updateFromGameObject();

    this.currentBrutalityVisualScale = visualScaleMultiplier;
    this.currentBrutalityBodyScale = bodyScaleMultiplier;
  }

  getVisualFeetAnchorY() {
    return this.getVisualFeetY();
  }

  getCurrentBodyBottomMinusVisualFeetDelta() {
    if (!Number.isFinite(this.body?.bottom)) {
      return 0;
    }
    return this.body.bottom - this.getVisualFeetY();
  }

  getVisualFeetY() {
    const scaleY = Math.abs(this.sprite.scaleY) || this.baseVisualScale.y || 1;
    return this.sprite.y + (1 - this.sprite.originY) * this.baseVisualSize.height * scaleY;
  }

  setVisualFeetY(targetFeetY) {
    const scaleY = Math.abs(this.sprite.scaleY) || this.baseVisualScale.y || 1;
    this.sprite.y = targetFeetY - (1 - this.sprite.originY) * this.baseVisualSize.height * scaleY;
  }

  getAttackDamage() {
    if (!this.brutalityMode.active) {
      return 1;
    }
    return Math.max(1, Math.round(this.brutalityMode.damageMultiplier));
  }

  playWeaponSwing() {
    if (!this.weaponSprite || !this.weaponPoseState) {
      return;
    }

    this.stopWeaponSwingTween();

    const swingSteps = [
      this.buildWeaponTweenStep(this.config.weaponVisual?.swingPose?.windup, 1),
      this.buildWeaponTweenStep(this.config.weaponVisual?.swingPose?.downswing, 2),
      this.buildWeaponTweenStep(this.config.weaponVisual?.swingPose?.impactSettle, 1),
      this.buildWeaponTweenStep(this.config.weaponVisual?.swingPose?.recover, -1)
    ];

    const playStep = (stepIndex) => {
      if (stepIndex >= swingSteps.length) {
        this.weaponSwingTween = null;
        if (this.attackPhase === 'idle') {
          this.resetWeaponToRestPose();
        }
        return;
      }

      const step = swingSteps[stepIndex];
      this.weaponSwingTween = this.scene.tweens.add({
        targets: this.weaponPoseState,
        offsetX: step.offsetX,
        offsetY: step.offsetY,
        rotationDeg: step.rotationDeg,
        depthOffset: step.depthOffset,
        duration: step.duration,
        ease: step.ease,
        onUpdate: () => {
          this.applyWeaponPoseState();
        },
        onComplete: () => {
          playStep(stepIndex + 1);
        }
      });
    };

    playStep(0);
  }

  stopWeaponSwingTween() {
    if (!this.weaponSwingTween) {
      return;
    }

    this.weaponSwingTween.stop();
    this.weaponSwingTween.remove();
    this.weaponSwingTween = null;
  }

  buildWeaponTweenStep(pose, depthOffset) {
    const resolvedPose = pose ?? this.config.weaponVisual?.restingPose;

    return {
      offsetX: resolvedPose?.offsetX ?? 0,
      offsetY: resolvedPose?.offsetY ?? 0,
      rotationDeg: resolvedPose?.rotationDeg ?? 0,
      depthOffset,
      duration: resolvedPose?.durationMs ?? 90,
      ease: 'Sine.InOut'
    };
  }

  updateWeaponAttachment() {
    if (!this.weaponSprite || !this.weaponPoseState) {
      return;
    }

    if (this.attackPhase === 'idle') {
      const restPose = this.config.weaponVisual?.restingPose;
      this.weaponPoseState.offsetX = restPose?.offsetX ?? this.weaponPoseState.offsetX;
      this.weaponPoseState.offsetY = restPose?.offsetY ?? this.weaponPoseState.offsetY;
      this.weaponPoseState.rotationDeg = restPose?.rotationDeg ?? this.weaponPoseState.rotationDeg;
      this.weaponPoseState.depthOffset = restPose?.depthOffset ?? -1;
    }

    this.applyWeaponPoseState();
  }

  resetWeaponToRestPose() {
    if (!this.weaponSprite || !this.weaponPoseState) {
      return;
    }

    const restPose = this.config.weaponVisual?.restingPose;
    this.weaponPoseState.offsetX = restPose?.offsetX ?? this.weaponPoseState.offsetX;
    this.weaponPoseState.offsetY = restPose?.offsetY ?? this.weaponPoseState.offsetY;
    this.weaponPoseState.rotationDeg = restPose?.rotationDeg ?? this.weaponPoseState.rotationDeg;
    this.weaponPoseState.depthOffset = restPose?.depthOffset ?? -1;
    this.applyWeaponPoseState();
  }

  applyWeaponPoseState() {
    if (!this.weaponSprite || !this.weaponPoseState) {
      return;
    }

    const facing = this.facing >= 0 ? 1 : -1;
    const inAttackCommit = this.attackPhase === 'startup' || this.attackPhase === 'active' || this.attackPhase === 'recovery';
    const airborneAttackPoseAdjust =
      inAttackCommit && !this.body.blocked.down ? this.config.weaponVisual?.airborneAttackPoseAdjust : null;
    const adjustedOffsetX = this.weaponPoseState.offsetX + (airborneAttackPoseAdjust?.offsetX ?? 0);
    const adjustedOffsetY = this.weaponPoseState.offsetY + (airborneAttackPoseAdjust?.offsetY ?? 0);
    const adjustedRotationDeg = this.weaponPoseState.rotationDeg + (airborneAttackPoseAdjust?.rotationDeg ?? 0);

    this.weaponSprite.setPosition(this.sprite.x + adjustedOffsetX * facing, this.sprite.y + adjustedOffsetY);
    this.weaponSprite.setRotation(Phaser.Math.DegToRad(adjustedRotationDeg * facing));
    this.weaponSprite.setDepth((this.sprite.depth ?? 6) + this.weaponPoseState.depthOffset);
  }

  updateSpriteAnimationState() {
    const isGrounded = this.body.blocked.down;
    const horizontalSpeed = Math.abs(this.body.velocity.x);
    const isMovingHorizontally = horizontalSpeed >= PLAYER_WALK_MIN_SPEED;
    const isNearlyStationary = horizontalSpeed <= PLAYER_IDLE_MAX_SPEED;
    const inAttackCommit = this.attackPhase === 'startup' || this.attackPhase === 'active' || this.attackPhase === 'recovery';
    const canAnimate = !this.isDead && !inAttackCommit && isGrounded;
    const canPlayWalk = canAnimate && isMovingHorizontally;
    const canPlayIdle = canAnimate && isNearlyStationary;

    if (canPlayWalk) {
      if (this.sprite.anims.currentAnim?.key !== PLAYER_WALK_ANIMATION_KEY || !this.sprite.anims.isPlaying) {
        this.sprite.play(PLAYER_WALK_ANIMATION_KEY, true);
      }
      return;
    }

    if (canPlayIdle) {
      if (this.sprite.anims.currentAnim?.key !== PLAYER_IDLE_ANIMATION_KEY || !this.sprite.anims.isPlaying) {
        this.sprite.play(PLAYER_IDLE_ANIMATION_KEY, true);
      }
      return;
    }

    this.setStaticFrame(0);
  }

  registerWalkAnimation() {
    if (this.scene.anims.exists(PLAYER_WALK_ANIMATION_KEY)) {
      return;
    }

    this.scene.anims.create({
      key: PLAYER_WALK_ANIMATION_KEY,
      frames: this.scene.anims.generateFrameNumbers(ASSET_KEYS.player, { start: 0, end: 5 }),
      frameRate: PLAYER_WALK_FPS,
      repeat: -1
    });
  }

  registerIdleAnimation() {
    if (this.scene.anims.exists(PLAYER_IDLE_ANIMATION_KEY)) {
      return;
    }

    this.scene.anims.create({
      key: PLAYER_IDLE_ANIMATION_KEY,
      frames: this.scene.anims.generateFrameNumbers(ASSET_KEYS.playerIdle, { start: 0, end: 4 }),
      frameRate: PLAYER_IDLE_FPS,
      repeat: -1
    });
  }

  setStaticFrame(frameIndex = 0) {
    if (!this.usingConceptSprite) {
      return;
    }

    if (this.sprite.anims.isPlaying) {
      this.sprite.anims.stop();
    }
    this.sprite.setFrame(frameIndex);
  }


  updateFootsteps(time) {
    if (this.isDead || !this.body.blocked.down) {
      return;
    }

    const speed = Math.abs(this.body.velocity.x);
    if (speed < 36) {
      return;
    }

    const intervalMs = Phaser.Math.Clamp(460 - speed * 1.25, 220, 430);
    if (time < this.lastFootstepAt + intervalMs) {
      return;
    }

    this.lastFootstepAt = time;
    this.scene.audioDirector?.playPlayerFootstep();
  }

  updateAttackHitbox() {
    const attackHitboxConfig = this.baseAttackHitbox;
    const reachMultiplier = this.brutalityMode.active ? this.brutalityMode.reachMultiplier : 1;
    const strikeY = this.body.center.y + (attackHitboxConfig.yOffset ?? 2);
    const offsetX = this.facing * (attackHitboxConfig.forwardOffset ?? 42) * reachMultiplier;
    this.attackHitbox.body.setSize((attackHitboxConfig.width ?? 50) * reachMultiplier, attackHitboxConfig.height ?? 34);
    this.attackHitbox.setPosition(this.body.center.x + offsetX, strikeY);
    this.attackHitbox.body.updateFromGameObject();
  }

  setVisualTint(color) {
    if (this.usingConceptSprite) {
      if (color === 0xb8aa92) {
        this.sprite.clearTint();
        return;
      }

      if (color === 0x6f8c59) {
        this.sprite.setTint(0xb4c78f);
        return;
      }

      if (color === 0x64453a) {
        this.sprite.setTint(0xff9f8b);
        return;
      }

      if (color === 0x392926) {
        this.sprite.setTint(0x6a4b44);
        return;
      }

      this.sprite.setTint(color);
      return;
    }

    this.sprite.fillColor = color;
  }
}
