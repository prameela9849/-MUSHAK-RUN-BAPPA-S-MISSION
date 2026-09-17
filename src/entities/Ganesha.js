// ==========================================================================
// MUSHAK RUN: BAPPA'S MISSION - LORD GANESHA (SACRED GUIDE & COMMANDER)
// Respectful 3D stylized divine representation with crown, trunk, modak & lotus halo
// ==========================================================================

import * as THREE from 'three';

export class Ganesha {
  constructor(scene) {
    this.scene = scene;
    this.mesh = new THREE.Group();
    this.animTime = 0;

    this.buildModel();
    this.scene.add(this.mesh);
  }

  buildModel() {
    // Divine Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xFFB74D, // Radiant warm golden/saffron divine complexion
      roughness: 0.45,
      metalness: 0.15
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xFFD700, // Golden Mukut (crown) & sacred ornaments
      roughness: 0.2,
      metalness: 0.85
    });

    const silkMat = new THREE.MeshStandardMaterial({
      color: 0xD50000, // Sacred vermilion pitambaram/dhoti
      roughness: 0.5,
      metalness: 0.1
    });

    const lotusMat = new THREE.MeshStandardMaterial({
      color: 0xFF4081, // Pink sacred lotus pedestal
      roughness: 0.4
    });

    const modakMat = new THREE.MeshStandardMaterial({
      color: 0xFFF9C4, // Golden modak sweet
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0xFFD54F,
      emissiveIntensity: 0.4
    });

    // 1. Sacred Lotus Throne / Base
    const throneGroup = new THREE.Group();
    const baseCyl = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.4, 24), goldMat);
    baseCyl.position.y = 0.2;
    throneGroup.add(baseCyl);

    // Lotus Petals ring
    const petalCount = 12;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petalGeo = new THREE.SphereGeometry(0.35, 12, 12);
      petalGeo.scale(1.2, 0.4, 1.8);
      const petalMesh = new THREE.Mesh(petalGeo, lotusMat);
      petalMesh.position.set(Math.cos(angle) * 1.5, 0.3, Math.sin(angle) * 1.5);
      petalMesh.rotation.y = -angle + Math.PI / 2;
      petalMesh.rotation.x = 0.3;
      throneGroup.add(petalMesh);
    }
    this.mesh.add(throneGroup);

    // 2. Body / Torso
    const torsoGeo = new THREE.SphereGeometry(0.85, 20, 20);
    torsoGeo.scale(1.1, 1.15, 1.0);
    const torsoMesh = new THREE.Mesh(torsoGeo, skinMat);
    torsoMesh.position.y = 1.35;
    torsoMesh.castShadow = true;
    this.mesh.add(torsoMesh);

    // Dhoti wrap
    const dhotiGeo = new THREE.CylinderGeometry(0.92, 1.05, 0.8, 20);
    const dhotiMesh = new THREE.Mesh(dhotiGeo, silkMat);
    dhotiMesh.position.y = 0.85;
    dhotiMesh.castShadow = true;
    this.mesh.add(dhotiMesh);

    // Gold Waistband & Sacred Thread (Janeu)
    const beltGeo = new THREE.TorusGeometry(0.9, 0.08, 12, 24);
    beltGeo.rotateX(Math.PI / 2);
    const beltMesh = new THREE.Mesh(beltGeo, goldMat);
    beltMesh.position.y = 1.15;
    this.mesh.add(beltMesh);

    // 3. Elephant Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 2.15, 0.1);

    const headGeo = new THREE.SphereGeometry(0.68, 20, 20);
    headGeo.scale(1.0, 1.0, 0.95);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // 4. Elegant Curved Trunk (Vakratunda)
    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0.55),
      new THREE.Vector3(0, -0.4, 0.85),
      new THREE.Vector3(-0.25, -0.75, 0.95),
      new THREE.Vector3(-0.45, -0.65, 0.85) // Sweetly curled to the left holding modak
    ]);
    const trunkGeo = new THREE.TubeGeometry(trunkCurve, 20, 0.18, 12, false);
    const trunkMesh = new THREE.Mesh(trunkGeo, skinMat);
    headGroup.add(trunkMesh);

    // 5. Large Divine Ears (Shurpa Karna)
    const earGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.06, 16);
    earGeo.rotateX(Math.PI / 2);

    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(-0.72, 0.1, 0);
    leftEar.rotation.y = 0.4;
    headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, skinMat);
    rightEar.position.set(0.72, 0.1, 0);
    rightEar.rotation.y = -0.4;
    headGroup.add(rightEar);

    // 6. Sacred Tilak & Trishul on Forehead
    const tilakGeo = new THREE.BoxGeometry(0.08, 0.26, 0.04);
    const tilakMat = new THREE.MeshBasicMaterial({ color: 0xD50000 });
    const tilakMesh = new THREE.Mesh(tilakGeo, tilakMat);
    tilakMesh.position.set(0, 0.25, 0.64);
    headGroup.add(tilakMesh);

    // 7. Radiant Golden Crown (Mukut)
    const crownGroup = new THREE.Group();
    crownGroup.position.set(0, 0.65, 0);

    const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.58, 0.35, 16), goldMat);
    const crownTier = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.75, 16), goldMat);
    crownTier.position.y = 0.45;

    // Gem on crown
    const gemMesh = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00E5FF }));
    gemMesh.position.set(0, 0.25, 0.48);

    crownGroup.add(crownBase, crownTier, gemMesh);
    headGroup.add(crownGroup);

    this.mesh.add(headGroup);

    // 8. Arms & Modak Offering
    // Right Hand (Abhaya Mudra - Blessing hand)
    const armGeo = new THREE.CapsuleGeometry(0.16, 0.55, 6, 8);
    const rightArm = new THREE.Mesh(armGeo, skinMat);
    rightArm.position.set(0.9, 1.45, 0.3);
    rightArm.rotation.set(-0.6, 0, -0.4);
    this.mesh.add(rightArm);

    // Left Hand holding delicious Modak
    const leftArm = new THREE.Mesh(armGeo, skinMat);
    leftArm.position.set(-0.9, 1.35, 0.4);
    leftArm.rotation.set(-0.4, 0, 0.4);
    this.mesh.add(leftArm);

    // Modak in Hand
    const modakGeo = new THREE.ConeGeometry(0.18, 0.3, 12);
    const modakMesh = new THREE.Mesh(modakGeo, modakMat);
    modakMesh.position.set(-0.85, 1.35, 0.8);
    modakMesh.rotation.x = 0.2;
    this.mesh.add(modakMesh);

    // 9. Divine Rotating Halo (Prabha Mandala)
    const haloGeo = new THREE.TorusGeometry(1.6, 0.08, 12, 32);
    const haloMat = new THREE.MeshStandardMaterial({
      color: 0xFFD700,
      emissive: 0xFFD700,
      emissiveIntensity: 0.9,
      roughness: 0.1
    });
    this.haloMesh = new THREE.Mesh(haloGeo, haloMat);
    this.haloMesh.position.set(0, 2.4, -0.4);
    this.mesh.add(this.haloMesh);

    // Initial position on the sacred altar
    this.mesh.position.set(0, 0, -12);
  }

  update(delta) {
    this.animTime += delta;

    // Gentle divine breathing bob
    this.mesh.position.y = Math.sin(this.animTime * 1.8) * 0.08;

    // Rotating golden halo
    if (this.haloMesh) {
      this.haloMesh.rotation.z += delta * 0.6;
    }
  }

  setPosition(x, y, z) {
    this.mesh.position.set(x, y, z);
  }

  setVisible(visible) {
    this.mesh.visible = visible;
  }
}
