import Phaser from 'phaser';
import { CONCEPT_PRESENTATION } from '../data/milestone1Config.js';
import { ASSET_KEYS } from '../data/assetKeys.js';
import { getNormalizedDisplaySize, getNormalizedOrigin, getNormalizedYOffset } from '../systems/conceptSpriteNormalizer.js';
import { vesselIntegrityState } from '../systems/VesselIntegrityState.js';

const PLAYER_WALK_ANIMATION_KEY = 'player-walk';
const PLAYER_IDLE_ANIMATION_KEY = 'player-idle';
const PLAYER_ATTACK_ANIMATION_KEY = 'player-attack-strip-05';
const PLAYER_WALK_FPS = 8;
const PLAYER_WALK_MIN_SPEED = 36;
const PLAYER_IDLE_FPS = 5;
const PLAYER_IDLE_MAX_SPEED = 20;
const PLAYER_ATTACK_FPS = 12;
const PLAYER_ATTACK_FRAME_PREFIX = 'attack-frame-';
const PLAYER_ATTACK_FRAME_SEQUENCE = [1, 2, 3, 4, 5];
const PLAYER_WEAPON_FRONT_DEPTH_OFFSET = 0.35;
const PLAYER_WEAPON_BACK_DEPTH_OFFSET = -0.35;
const PLAYER_ATTACK_IMPACT_FRAME = 4;
const PLAYER_ATTACK_FRAME_BOXES = [
  { frame: 1, x: 31, y: 0, w: 259, h: 445 },
  { frame: 2, x: 330, y: 8, w: 259, h: 436 },
  { frame: 3, x: 625, y: 31, w: 259, h: 413 },
  { frame: 4, x: 921, y: 74, w: 285, h: 382 },
  { frame: 5, x: 1247, y: 24, w: 258, h: 421 }
];

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
    this.weaponSprite = null;
    this.attackFrameDataByIndex = new Map();
    this.currentAttackFrameIndex = PLAYER_ATTACK_FRAME_SEQUENCE[0];
    this.currentAttackFrameData = null;
    this.attackTimingWindowMs = null;

    this.usingConceptSprite = scene.textures.exists(ASSET_KEYS.player);
    this.hasAttackStrip = scene.textures.exists(ASSET_KEYS.playerAttackStrip);
    this.hasWeaponFollowStrip = scene.textures.exists(ASSET_KEYS.playerWeaponHammerFollowStrip);
    this.weaponFollowOffsetPackage = scene.cache.json.get(ASSET_KEYS.playerWeaponHammerFollowOffsets) ?? null;
    const playerPresentation = CONCEPT_PRESENTATION.player;
    this.normalizedDisplaySize = getNormalizedDisplaySize(playerPresentation);
    this.normalizedOrigin = getNormalizedOrigin(playerPresentation);
    const visualYOffset = getNormalizedYOffset(playerPresentation);

    this.sprite = this.usingConceptSprite
      ? scene.add
          .sprite(x, y + visualYOffset, ASSET_KEYS.player, 0)
          .setOrigin(this.normalizedOrigin.x, this.normalizedOrigin.y)
          .setDisplaySize(this.normalizedDisplaySize.width, this.normalizedDisplaySize.height)
          .setAlpha(playerPresentation.alpha ?? 1)
          .setDepth(6)
      : scene.add.rectangle(x, y, 48, 60, 0xb8aa92).setOrigin(0.5).setDepth(6);
    if (this.usingConceptSprite) {
      this.registerWalkAnimation();
      this.registerIdleAnimation();
      this.registerAttackFrameData();
      this.registerAttackAnimation();
    }
    scene.physics.add.existing(this.sprite);

    this.body = this.sprite.body;
    this.body.setCollideWorldBounds(true);
    this.body.setGravityY(0);

    const scaleX = Math.abs(this.sprite.scaleX) || 1;
    const scaleY = Math.abs(this.sprite.scaleY) || 1;
    this.body.setSize(config.body.width / scaleX, config.body.height / scaleY);
    this.body.setOffset(config.body.offsetX / scaleX, config.body.offsetY / scaleY);

    this.attackHitbox = scene.add.zone(x + 26, y, 38, 30);
    scene.physics.add.existing(this.attackHitbox);
    this.attackHitbox.body.allowGravity = false;
    this.attackHitbox.body.moves = false;
    this.attackHitbox.body.enable = false;

    if (this.usingConceptSprite) {
      this.sprite.on('animationupdate', this.handleSpriteAnimationUpdate, this);
    }
    this.createWeaponFollowSpriteIfAvailable();
  }

  update(time, input) {
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
    this.currentAttackFrameIndex = PLAYER_ATTACK_FRAME_SEQUENCE[0];
    this.currentAttackFrameData = this.attackFrameDataByIndex.get(this.currentAttackFrameIndex) ?? null;
    this.attackTimingWindowMs = this.computeAttackTimingWindowMs();
    this.attackHitbox.body.enable = false;
    this.playAttackAnimation();
    this.updateWeaponFollowTransform();
    this.setVisualTint(0x6f8c59);
    this.scene.audioDirector?.playPlayerAttack();
  }

  updateAttackState(time) {
    if (this.attackPhase === 'idle') {
      return;
    }

    const attackElapsed = time - this.lastAttackTime;
    const activeStartMs = this.attackTimingWindowMs?.activeStartMs ?? this.config.attackStartupMs;
    const activeEndMs = this.attackTimingWindowMs?.activeEndMs ?? (this.config.attackStartupMs + this.config.attackActiveMs);
    const totalDurationMs = this.attackTimingWindowMs?.totalDurationMs
      ?? (this.config.attackStartupMs + this.config.attackActiveMs + this.config.attackRecoveryMs);

    if (this.attackPhase === 'startup' && attackElapsed >= activeStartMs) {
      this.attackPhase = 'active';
      this.attackActive = true;
      this.attackId += 1;
      this.attackHitbox.body.enable = true;
      return;
    }

    if (this.attackPhase === 'active' && attackElapsed >= activeEndMs) {
      this.attackPhase = 'recovery';
      this.attackActive = false;
      this.attackHitbox.body.enable = false;
      return;
    }

    if (this.attackPhase === 'recovery' && attackElapsed >= totalDurationMs) {
      this.endAttack();
    }
  }

  endAttack() {
    this.attackPhase = 'idle';
    this.attackActive = false;
    this.attackHitbox.body.enable = false;
    this.currentAttackFrameIndex = PLAYER_ATTACK_FRAME_SEQUENCE[0];
    this.currentAttackFrameData = null;
    this.attackTimingWindowMs = null;
    this.hideWeaponFollow();
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
    if (this.usingConceptSprite) {
      this.updateSpriteAnimationState();
    }

    if (this.isDead) {
      this.setVisualTint(0x392926);
      return;
    }

    if (this.attackPhase !== 'idle') {
      this.setVisualTint(0x6f8c59);
      return;
    }

    if (time < this.lastHitTime + 140) {
      this.setVisualTint(0x64453a);
      return;
    }

    this.setVisualTint(0xb8aa92);
  }

  updateSpriteAnimationState() {
    const isGrounded = this.body.blocked.down;
    const horizontalSpeed = Math.abs(this.body.velocity.x);
    const isMovingHorizontally = horizontalSpeed >= PLAYER_WALK_MIN_SPEED;
    const isNearlyStationary = horizontalSpeed <= PLAYER_IDLE_MAX_SPEED;
    const inAttackCommit = this.attackPhase === 'startup' || this.attackPhase === 'active' || this.attackPhase === 'recovery';
    if (!this.isDead && inAttackCommit && this.hasAttackStrip) {
      this.playAttackAnimation();
      this.updateWeaponFollowTransform();
      return;
    }
    this.applyDefaultPresentationFootprint();

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

    this.hideWeaponFollow();
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

  registerAttackFrameData() {
    if (!this.hasAttackStrip) {
      return;
    }

    const attackTexture = this.scene.textures.get(ASSET_KEYS.playerAttackStrip);
    if (!attackTexture) {
      return;
    }

    const packageFrames = this.weaponFollowOffsetPackage?.frames;
    PLAYER_ATTACK_FRAME_BOXES.forEach((frameBox) => {
      const frameName = `${PLAYER_ATTACK_FRAME_PREFIX}${frameBox.frame}`;
      if (!attackTexture.has(frameName)) {
        attackTexture.add(frameName, 0, frameBox.x, frameBox.y, frameBox.w, frameBox.h);
      }
      const packageFrame = packageFrames?.find((entry) => entry.frame === frameBox.frame) ?? null;
      this.attackFrameDataByIndex.set(frameBox.frame, {
        ...frameBox,
        frameName,
        weapon: packageFrame
      });
    });
  }

  registerAttackAnimation() {
    if (!this.hasAttackStrip || this.scene.anims.exists(PLAYER_ATTACK_ANIMATION_KEY)) {
      return;
    }

    this.scene.anims.create({
      key: PLAYER_ATTACK_ANIMATION_KEY,
      frames: PLAYER_ATTACK_FRAME_SEQUENCE.map((frameIndex) => ({
        key: ASSET_KEYS.playerAttackStrip,
        frame: `${PLAYER_ATTACK_FRAME_PREFIX}${frameIndex}`
      })),
      frameRate: PLAYER_ATTACK_FPS,
      repeat: 0
    });
  }

  createWeaponFollowSpriteIfAvailable() {
    if (!this.usingConceptSprite || !this.hasWeaponFollowStrip) {
      return;
    }

    this.weaponSprite = this.scene.add
      .sprite(this.sprite.x, this.sprite.y, ASSET_KEYS.playerWeaponHammerFollowStrip, 0)
      .setOrigin(0, 0)
      .setVisible(false)
      .setAlpha(this.sprite.alpha)
      .setDepth((this.sprite.depth ?? 6) + PLAYER_WEAPON_BACK_DEPTH_OFFSET);
  }

  playAttackAnimation() {
    if (!this.usingConceptSprite || !this.hasAttackStrip) {
      return;
    }

    this.applyAttackPresentationFootprint();
    if (this.sprite.anims.currentAnim?.key !== PLAYER_ATTACK_ANIMATION_KEY) {
      this.sprite.play(PLAYER_ATTACK_ANIMATION_KEY, true);
    }
  }

  handleSpriteAnimationUpdate(_animation, frame) {
    if (this.sprite.anims.currentAnim?.key !== PLAYER_ATTACK_ANIMATION_KEY) {
      return;
    }

    const textureFrame = String(frame.textureFrame ?? '');
    const frameIndex = Number.parseInt(textureFrame.replace(PLAYER_ATTACK_FRAME_PREFIX, ''), 10);
    if (!Number.isInteger(frameIndex)) {
      return;
    }

    this.currentAttackFrameIndex = frameIndex;
    this.currentAttackFrameData = this.attackFrameDataByIndex.get(frameIndex) ?? null;
    this.applyAttackPresentationFootprint();
    this.updateWeaponFollowTransform();
  }

  applyAttackPresentationFootprint() {
    if (!this.usingConceptSprite) {
      return;
    }

    const targetHeight = this.normalizedDisplaySize?.height;
    const frameWidth = this.sprite.frame?.realWidth;
    const frameHeight = this.sprite.frame?.realHeight;
    if (!targetHeight || !frameWidth || !frameHeight) {
      return;
    }

    this.sprite
      .setOrigin(this.normalizedOrigin.x, this.normalizedOrigin.y)
      .setDisplaySize(Math.round(targetHeight * (frameWidth / frameHeight)), targetHeight);
  }

  applyDefaultPresentationFootprint() {
    if (!this.usingConceptSprite || !this.normalizedDisplaySize || !this.normalizedOrigin) {
      return;
    }

    this.sprite
      .setOrigin(this.normalizedOrigin.x, this.normalizedOrigin.y)
      .setDisplaySize(this.normalizedDisplaySize.width, this.normalizedDisplaySize.height);
  }

  computeAttackTimingWindowMs() {
    const totalDurationMs = this.config.attackStartupMs + this.config.attackActiveMs + this.config.attackRecoveryMs;
    const frameDurationMs = totalDurationMs / PLAYER_ATTACK_FRAME_SEQUENCE.length;
    const impactFrameStartMs = frameDurationMs * (PLAYER_ATTACK_IMPACT_FRAME - 1);
    const activeStartMs = Math.max(0, impactFrameStartMs - frameDurationMs * 0.3);
    const activeEndMs = Math.min(totalDurationMs, impactFrameStartMs + frameDurationMs * 0.8);

    return {
      activeStartMs,
      activeEndMs,
      totalDurationMs
    };
  }

  updateWeaponFollowTransform() {
    if (!this.weaponSprite || this.attackPhase === 'idle') {
      this.hideWeaponFollow();
      return;
    }

    const frameData = this.currentAttackFrameData ?? this.attackFrameDataByIndex.get(PLAYER_ATTACK_FRAME_SEQUENCE[0]) ?? null;
    const weaponFrame = frameData?.weapon;
    if (!frameData || !weaponFrame) {
      this.hideWeaponFollow();
      return;
    }

    const sourceToWorldScale = this.sprite.displayHeight / frameData.h;
    const spriteTopLeftX = this.sprite.x - this.sprite.displayWidth * this.sprite.originX;
    const spriteTopLeftY = this.sprite.y - this.sprite.displayHeight * this.sprite.originY;
    const offset = weaponFrame.offset_relative_to_player_crop;
    const weaponX = spriteTopLeftX + offset.x * sourceToWorldScale;
    const weaponY = spriteTopLeftY + offset.y * sourceToWorldScale;
    const renderInFront = weaponFrame.render_order === 'front_of_player';
    const depthOffset = renderInFront ? PLAYER_WEAPON_FRONT_DEPTH_OFFSET : PLAYER_WEAPON_BACK_DEPTH_OFFSET;

    this.weaponSprite
      .setVisible(true)
      .setPosition(weaponX, weaponY)
      .setFrame(frameData.frame - 1)
      .setRotation(Phaser.Math.DegToRad(weaponFrame.rotation_deg ?? 0))
      .setScale((weaponFrame.scale ?? 1) * sourceToWorldScale)
      .setDepth((this.sprite.depth ?? 6) + depthOffset)
      .setAlpha(this.sprite.alpha);
  }

  hideWeaponFollow() {
    this.weaponSprite?.setVisible(false);
  }

  setStaticFrame(frameIndex = 0) {
    if (!this.usingConceptSprite) {
      return;
    }

    if (this.sprite.anims.isPlaying) {
      this.sprite.anims.stop();
    }
    if (this.sprite.texture?.key !== ASSET_KEYS.player) {
      this.sprite.setTexture(ASSET_KEYS.player);
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
    const strikeY = this.body.y + this.body.height - 14;
    const offsetX = this.facing * 28;
    this.attackHitbox.setPosition(this.sprite.x + offsetX, strikeY);
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
