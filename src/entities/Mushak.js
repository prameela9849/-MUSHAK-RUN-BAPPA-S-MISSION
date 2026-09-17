// ==========================================================================
// MUSHAK RUN: BAPPA'S MISSION - MUSHAK HERO RUNNER (3D PROCEDURAL CHARACTER)
// Fully animated, 3-lane physics, jumping, sliding, powerup auras & collisions
// ==========================================================================

import * as THREE from 'three';

export const LANE_WIDTH = 2.2;
export const LANES = {
  LEFT: -LANE_WIDTH,
  CENTER: 0,
  RIGHT: LANE_WIDTH
};

export class Mushak {
  constructor(scene) {
    this.scene = scene;
    this.mesh = new THREE.Group();

    // Lane positioning
    this.currentLaneIndex = 1; // 0 = Left, 1 = Center, 2 = Right
    this.targetX = LANES.CENTER;
    this.currentX = LANES.CENTER;
    this.laneChangeSpeed = 16;

    // Jump & Slide Physics
    this.isJumping = false;
    this.isSliding = false;
    this.jumpVelocity = 0;
    this.jumpGravity = -32;
    this.jumpForce = 11.5;
    this.slideTimer = 0;
    this.slideDuration = 0.75; // seconds

    this.baseY = 0.55;
    this.posY = this.baseY;

    // Animation timers
    this.animTime = 0;
    this.isDead = false;

    // Visual Power-Up Meshes
    this.shieldMesh = null;
    this.blessingMesh = null;
    this.rushMesh = null;

    // Bounding Box / Collision Box
    this.collider = new THREE.Box3();
    this.colliderSize = new THREE.Vector3(0.9, 1.2, 0.9);

    this.buildModel();
    this.scene.add(this.mesh);
  }

  buildModel() {
    // Colors & Materials
    const furMat = new THREE.MeshStandardMaterial({
      color: 0xE0E0E0, // Silvery-white divine mouse fur
      roughness: 0.6,
      metalness: 0.1
    });

    const innerEarMat = new THREE.MeshStandardMaterial({
      color: 0xFF80AB, // Pink inner ears
      roughness: 0.8
    });

    const dhotiMat = new THREE.MeshStandardMaterial({
      color: 0xFF6D00, // Vibrant festive saffron dhoti
      roughness: 0.5,
      metalness: 0.2
    });

    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xFFD700, // Radiant gold ornaments & necklace
      roughness: 0.2,
      metalness: 0.8
    });

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x331111, roughness: 0.3 });

    // 1. Torso / Body (Chubby cute mouse body)
    const bodyGeo = new THREE.SphereGeometry(0.5, 16, 16);
    bodyGeo.scale(0.85, 1.05, 0.9);
    this.bodyMesh = new THREE.Mesh(bodyGeo, furMat);
    this.bodyMesh.position.y = 0.45;
    this.bodyMesh.castShadow = true;
    this.mesh.add(this.bodyMesh);

    // 2. Festive Saffron Dhoti & Gold Sash
    const dhotiGeo = new THREE.CylinderGeometry(0.48, 0.42, 0.45, 16);
    this.dhotiMesh = new THREE.Mesh(dhotiGeo, dhotiMat);
    this.dhotiMesh.position.y = 0.32;
    this.dhotiMesh.castShadow = true;
    this.mesh.add(this.dhotiMesh);

    const sashGeo = new THREE.TorusGeometry(0.46, 0.05, 8, 16);
    sashGeo.rotateX(Math.PI / 2);
    const sashMesh = new THREE.Mesh(sashGeo, goldTrimMat);
    sashMesh.position.y = 0.52;
    this.mesh.add(sashMesh);

    // 3. Head & Snout
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.82, 0.15);

    const headGeo = new THREE.SphereGeometry(0.42, 16, 16);
    headGeo.scale(0.9, 0.9, 1.0);
    const headMesh = new THREE.Mesh(headGeo, furMat);
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // Snout
    const snoutGeo = new THREE.ConeGeometry(0.2, 0.38, 12);
    snoutGeo.rotateX(Math.PI / 2);
    const snoutMesh = new THREE.Mesh(snoutGeo, furMat);
    snoutMesh.position.set(0, -0.05, 0.38);
    this.headGroup.add(snoutMesh);

    // Black Nose Tip
    const noseGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const noseMesh = new THREE.Mesh(noseGeo, noseMat);
    noseMesh.position.set(0, -0.05, 0.56);
    this.headGroup.add(noseMesh);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.065, 8, 8);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.16, 0.08, 0.34);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.16, 0.08, 0.34);
    this.headGroup.add(leftEye);
    this.headGroup.add(rightEye);

    // 4. Large Round Expressive Ears
    const earGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.04, 16);
    earGeo.rotateX(Math.PI / 2);

    this.leftEar = new THREE.Group();
    this.leftEar.position.set(-0.34, 0.32, -0.05);
    this.leftEar.rotation.z = 0.35;
    const lEarMesh = new THREE.Mesh(earGeo, furMat);
    const lEarInner = new THREE.Mesh(new THREE.CircleGeometry(0.16, 12), innerEarMat);
    lEarInner.position.z = 0.025;
    this.leftEar.add(lEarMesh, lEarInner);
    this.headGroup.add(this.leftEar);

    this.rightEar = new THREE.Group();
    this.rightEar.position.set(0.34, 0.32, -0.05);
    this.rightEar.rotation.z = -0.35;
    const rEarMesh = new THREE.Mesh(earGeo, furMat);
    const rEarInner = new THREE.Mesh(new THREE.CircleGeometry(0.16, 12), innerEarMat);
    rEarInner.position.z = 0.025;
    this.rightEar.add(rEarMesh, rEarInner);
    this.headGroup.add(this.rightEar);

    this.mesh.add(this.headGroup);

    // 5. Modak Pouch on Hip
    const pouchGeo = new THREE.SphereGeometry(0.16, 12, 12);
    pouchGeo.scale(0.8, 1.1, 0.9);
    const pouchMesh = new THREE.Mesh(pouchGeo, goldTrimMat);
    pouchMesh.position.set(0.42, 0.42, 0);
    this.mesh.add(pouchMesh);

    // 6. Running Limbs
    const limbGeo = new THREE.CapsuleGeometry(0.1, 0.28, 6, 8);

    // Left & Right Legs
    this.leftLeg = new THREE.Mesh(limbGeo, furMat);
    this.leftLeg.position.set(-0.24, 0.16, 0);
    this.leftLeg.castShadow = true;
    this.mesh.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(limbGeo, furMat);
    this.rightLeg.position.set(0.24, 0.16, 0);
    this.rightLeg.castShadow = true;
    this.mesh.add(this.rightLeg);

    // Left & Right Arms
    this.leftArm = new THREE.Mesh(limbGeo, furMat);
    this.leftArm.position.set(-0.42, 0.52, 0);
    this.mesh.add(this.leftArm);

    this.rightArm = new THREE.Mesh(limbGeo, furMat);
    this.rightArm.position.set(0.42, 0.52, 0);
    this.mesh.add(this.rightArm);

    // 7. Animated Tail
    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.2, -0.4),
      new THREE.Vector3(0, 0.4, -0.75),
      new THREE.Vector3(0.1, 0.6, -1.0)
    ]);
    const tailGeo = new THREE.TubeGeometry(tailCurve, 12, 0.04, 6, false);
    this.tailMesh = new THREE.Mesh(tailGeo, furMat);
    this.mesh.add(this.tailMesh);

    // 8. Ground Shadow Projection Disc
    const shadowGeo = new THREE.CircleGeometry(0.55, 16);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.4
    });
    this.shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowDisc.position.y = 0.02;
    this.mesh.add(this.shadowDisc);

    // 9. Divine Shield Power-up Visual
    const shieldGeo = new THREE.SphereGeometry(1.25, 20, 20);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x00E676,
      transparent: true,
      opacity: 0,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x00E676,
      emissiveIntensity: 0.5,
      wireframe: false
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.y = 0.6;
    this.shieldMesh.visible = false;
    this.mesh.add(this.shieldMesh);

    // 10. Bappa's Blessing Golden Aura
    const blessingGeo = new THREE.TorusGeometry(1.1, 0.08, 12, 24);
    blessingGeo.rotateX(Math.PI / 2);
    const blessingMat = new THREE.MeshStandardMaterial({
      color: 0xFFD700,
      emissive: 0xFFD700,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0
    });
    this.blessingMesh = new THREE.Mesh(blessingGeo, blessingMat);
    this.blessingMesh.position.y = 1.35;
    this.blessingMesh.visible = false;
    this.mesh.add(this.blessingMesh);

    this.mesh.position.set(0, this.baseY, 0);
  }

  // --- LANE CONTROL ---
  moveLeft() {
    if (this.isDead) return;
    if (this.currentLaneIndex > 0) {
      this.currentLaneIndex -= 1;
      this.updateTargetLane();
    }
  }

  moveRight() {
    if (this.isDead) return;
    if (this.currentLaneIndex < 2) {
      this.currentLaneIndex += 1;
      this.updateTargetLane();
    }
  }

  updateTargetLane() {
    if (this.currentLaneIndex === 0) this.targetX = LANES.LEFT;
    else if (this.currentLaneIndex === 1) this.targetX = LANES.CENTER;
    else this.targetX = LANES.RIGHT;
  }

  // --- JUMP ACTION ---
  jump() {
    if (this.isDead || this.isJumping) return;
    this.isJumping = true;
    this.isSliding = false; // Jump cancels slide
    this.jumpVelocity = this.jumpForce;
  }

  // --- SLIDE ACTION ---
  slide() {
    if (this.isDead) return;
    if (this.isJumping) {
      // Fast fall down from jump
      this.jumpVelocity = -15;
    }
    this.isSliding = true;
    this.slideTimer = this.slideDuration;
  }

  // --- POWER-UP VISUAL TOGGLES ---
  setShield(active) {
    if (this.shieldMesh) {
      this.shieldMesh.visible = active;
      this.shieldMesh.material.opacity = active ? 0.45 : 0;
    }
  }

  setBlessing(active) {
    if (this.blessingMesh) {
      this.blessingMesh.visible = active;
      this.blessingMesh.material.opacity = active ? 0.85 : 0;
    }
  }

  setRush(active) {
    this.isRushing = active;
  }

  // --- GAMEPLAY UPDATE LOOP ---
  update(delta, forwardZ, gameSpeed) {
    this.animTime += delta * (gameSpeed / 12);

    // 1. Forward Position
    this.mesh.position.z = forwardZ;

    // 2. Smooth Lane Interpolation (Spring-like responsiveness)
    const laneDiff = this.targetX - this.currentX;
    this.currentX += laneDiff * Math.min(1, delta * this.laneChangeSpeed);
    this.mesh.position.x = this.currentX;

    // Lane tilt banking effect
    this.mesh.rotation.z = -laneDiff * 0.18;

    // 3. Jump Physics
    if (this.isJumping) {
      this.posY += this.jumpVelocity * delta;
      this.jumpVelocity += this.jumpGravity * delta;

      if (this.posY <= this.baseY) {
        this.posY = this.baseY;
        this.isJumping = false;
        this.jumpVelocity = 0;
      }
    }

    // 4. Slide Timer & Crouch Geometry
    if (this.isSliding) {
      this.slideTimer -= delta;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // Adjust height & scale for jump/slide
    this.mesh.position.y = this.posY;

    if (this.isSliding) {
      // Crouch scale & flatten down
      this.mesh.scale.set(1.2, 0.45, 1.25);
      this.headGroup.rotation.x = 0.5;
    } else if (this.isJumping) {
      // Stretched athletic leap
      this.mesh.scale.set(0.9, 1.15, 0.95);
      this.headGroup.rotation.x = -0.2;
    } else {
      // Normal running posture
      this.mesh.scale.set(1, 1, 1);
      this.headGroup.rotation.x = 0;
    }

    // Shadow scaling
    if (this.shadowDisc) {
      const heightAboveGround = this.posY - this.baseY;
      const shadowScale = Math.max(0.4, 1 - heightAboveGround * 0.25);
      this.shadowDisc.scale.set(shadowScale, shadowScale, 1);
      this.shadowDisc.material.opacity = Math.max(0.1, 0.4 - heightAboveGround * 0.1);
    }

    // 5. Running Strides Animation
    if (!this.isDead && !this.isSliding) {
      const stride = Math.sin(this.animTime * 18);
      this.leftLeg.rotation.x = stride * 0.7;
      this.rightLeg.rotation.x = -stride * 0.7;
      this.leftArm.rotation.x = -stride * 0.7;
      this.rightArm.rotation.x = stride * 0.7;

      // Ear & tail wiggles
      this.leftEar.rotation.x = Math.sin(this.animTime * 12) * 0.15;
      this.rightEar.rotation.x = Math.cos(this.animTime * 12) * 0.15;
      this.tailMesh.rotation.y = Math.sin(this.animTime * 14) * 0.25;

      // Cute running bounce
      if (!this.isJumping) {
        this.bodyMesh.position.y = 0.45 + Math.abs(Math.sin(this.animTime * 18)) * 0.08;
      }
    }

    // 6. Power-Up Rotations & Glows
    if (this.shieldMesh && this.shieldMesh.visible) {
      this.shieldMesh.rotation.y += delta * 2;
    }
    if (this.blessingMesh && this.blessingMesh.visible) {
      this.blessingMesh.rotation.y += delta * 3;
    }

    // 7. Update Collider Box
    this.updateCollider();
  }

  updateCollider() {
    // Shrunken box height when sliding
    const height = this.isSliding ? 0.55 : 1.2;
    const width = 0.85;
    const depth = 0.85;

    const center = new THREE.Vector3(
      this.mesh.position.x,
      this.mesh.position.y + (this.isSliding ? 0.28 : 0.6),
      this.mesh.position.z
    );

    this.collider.min.set(center.x - width / 2, center.y - height / 2, center.z - depth / 2);
    this.collider.max.set(center.x + width / 2, center.y + height / 2, center.z + depth / 2);
  }

  triggerDeathAnimation() {
    this.isDead = true;
    // Tumble rotation
    this.mesh.rotation.x = -Math.PI / 3;
    this.mesh.rotation.z = Math.PI / 4;
    this.mesh.position.y = 0.3;
  }

  reset() {
    this.isDead = false;
    this.isJumping = false;
    this.isSliding = false;
    this.jumpVelocity = 0;
    this.slideTimer = 0;
    this.currentLaneIndex = 1;
    this.targetX = LANES.CENTER;
    this.currentX = LANES.CENTER;
    this.posY = this.baseY;

    this.mesh.position.set(0, this.baseY, 0);
    this.mesh.rotation.set(0, 0, 0);
    this.mesh.scale.set(1, 1, 1);

    this.setShield(false);
    this.setBlessing(false);
    this.setRush(false);
  }
}
