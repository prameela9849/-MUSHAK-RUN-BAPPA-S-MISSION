// ==========================================================================
// MUSHAK RUN: BAPPA'S MISSION - COLLECTIBLE MANAGER
// Dynamic 3D sacred collectibles matching Ganesha's active order + Magnet suction
// ==========================================================================

import * as THREE from 'three';
import { LANES, LANE_WIDTH } from './Mushak.js';

export class CollectibleManager {
  constructor(scene) {
    this.scene = scene;
    this.activeItems = [];
    this.nextSpawnZ = -20;
    this.currentOrderType = 'modak';
    this.animTime = 0;

    this.initMaterials();
  }

  setOrderType(orderType) {
    this.currentOrderType = orderType;
  }

  initMaterials() {
    this.goldSweetMat = new THREE.MeshStandardMaterial({
      color: 0xFFD700,
      emissive: 0xFFA000,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.2
    });

    this.diyaClayMat = new THREE.MeshStandardMaterial({ color: 0xD84315, roughness: 0.7 });
    this.diyaFlameMat = new THREE.MeshStandardMaterial({ color: 0xFFEB3B, emissive: 0xFF6D00, emissiveIntensity: 1.5 });
    this.flagMat = new THREE.MeshStandardMaterial({ color: 0xFF3D00, roughness: 0.4 });
    this.flowerMat = new THREE.MeshStandardMaterial({ color: 0xFF9100, emissive: 0xFF3D00, emissiveIntensity: 0.3 });
    this.pujaMat = new THREE.MeshStandardMaterial({ color: 0x00E5FF, emissive: 0x00B0FF, emissiveIntensity: 0.4 });
    this.rangoliMat = new THREE.MeshStandardMaterial({ color: 0x76FF03, emissive: 0x64DD17, emissiveIntensity: 0.5 });
    this.coconutMat = new THREE.MeshStandardMaterial({ color: 0x8D6E63, roughness: 0.8 });
  }

  // Factory methods for each order type
  createItemMesh(type) {
    const group = new THREE.Group();

    switch (type) {
      case 'modak': {
        // Golden Pleated Modak
        const modakGeo = new THREE.ConeGeometry(0.32, 0.52, 12);
        const modakMesh = new THREE.Mesh(modakGeo, this.goldSweetMat);
        modakMesh.position.y = 0.26;
        group.add(modakMesh);

        // Halo aura
        const auraGeo = new THREE.TorusGeometry(0.4, 0.03, 8, 16);
        auraGeo.rotateX(Math.PI / 2);
        const auraMesh = new THREE.Mesh(auraGeo, this.goldSweetMat);
        auraMesh.position.y = 0.26;
        group.add(auraMesh);
        break;
      }

      case 'diya': {
        // Terracotta Diya with glowing flame
        const baseGeo = new THREE.CylinderGeometry(0.3, 0.15, 0.2, 10);
        const baseMesh = new THREE.Mesh(baseGeo, this.diyaClayMat);
        baseMesh.position.y = 0.1;
        group.add(baseMesh);

        const flameGeo = new THREE.ConeGeometry(0.12, 0.3, 8);
        const flameMesh = new THREE.Mesh(flameGeo, this.diyaFlameMat);
        flameMesh.position.y = 0.32;
        group.add(flameMesh);
        break;
      }

      case 'flag': {
        // Saffron Festival Flag
        const staffGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6);
        const staffMesh = new THREE.Mesh(staffGeo, this.goldSweetMat);
        staffMesh.position.y = 0.45;
        group.add(staffMesh);

        const clothGeo = new THREE.ConeGeometry(0.3, 0.5, 3);
        clothGeo.rotateZ(Math.PI / 2);
        const clothMesh = new THREE.Mesh(clothGeo, this.flagMat);
        clothMesh.position.set(0.2, 0.65, 0);
        group.add(clothMesh);
        break;
      }

      case 'flower': {
        // Marigold Lotus Blossom
        const centerGeo = new THREE.SphereGeometry(0.18, 10, 10);
        const centerMesh = new THREE.Mesh(centerGeo, this.goldSweetMat);
        centerMesh.position.y = 0.3;
        group.add(centerMesh);

        for (let p = 0; p < 6; p++) {
          const angle = (p / 6) * Math.PI * 2;
          const petalGeo = new THREE.SphereGeometry(0.12, 8, 8);
          petalGeo.scale(1.6, 0.4, 1.0);
          const petal = new THREE.Mesh(petalGeo, this.flowerMat);
          petal.position.set(Math.cos(angle) * 0.26, 0.3, Math.sin(angle) * 0.26);
          group.add(petal);
        }
        break;
      }

      case 'puja': {
        // Sacred Kalash & Bell
        const potGeo = new THREE.SphereGeometry(0.28, 12, 12);
        const potMesh = new THREE.Mesh(potGeo, this.pujaMat);
        potMesh.position.y = 0.28;
        group.add(potMesh);

        const topGeo = new THREE.ConeGeometry(0.18, 0.3, 8);
        const topMesh = new THREE.Mesh(topGeo, this.goldSweetMat);
        topMesh.position.y = 0.55;
        group.add(topMesh);
        break;
      }

      case 'rangoli': {
        // Auspicious Rangoli Star
        const starGeo = new THREE.OctahedronGeometry(0.3, 0);
        const starMesh = new THREE.Mesh(starGeo, this.rangoliMat);
        starMesh.position.y = 0.35;
        group.add(starMesh);
        break;
      }

      case 'celebration':
      default: {
        // Sacred Coconut
        const cocoGeo = new THREE.SphereGeometry(0.26, 12, 12);
        cocoGeo.scale(0.9, 1.15, 0.9);
        const cocoMesh = new THREE.Mesh(cocoGeo, this.coconutMat);
        cocoMesh.position.y = 0.3;
        group.add(cocoMesh);

        const leafGeo = new THREE.ConeGeometry(0.14, 0.28, 4);
        const leafMesh = new THREE.Mesh(leafGeo, this.rangoliMat);
        leafMesh.position.y = 0.52;
        group.add(leafMesh);
        break;
      }
    }

    return group;
  }

  // Spawns lines or jumping arcs of collectibles
  update(delta, playerZ, isMagnetActive, mushakPos) {
    this.animTime += delta;

    // Spawn ahead
    if (this.nextSpawnZ > playerZ - 160) {
      this.spawnPattern(this.nextSpawnZ);
      this.nextSpawnZ -= 16 + Math.random() * 8;
    }

    // Update active items
    for (let i = this.activeItems.length - 1; i >= 0; i--) {
      const item = this.activeItems[i];

      // Item rotation & bobbing
      item.group.rotation.y += delta * 2.5;
      item.group.position.y = item.baseY + Math.sin(this.animTime * 4 + item.floatOffset) * 0.15;

      // Magnet suction logic
      if (isMagnetActive && mushakPos) {
        const distToPlayer = item.group.position.distanceTo(mushakPos);
        if (distToPlayer < 12.0) {
          // Accelerate toward Mushak
          item.group.position.x += (mushakPos.x - item.group.position.x) * delta * 8;
          item.group.position.y += (mushakPos.y + 0.5 - item.group.position.y) * delta * 8;
          item.group.position.z += (mushakPos.z - item.group.position.z) * delta * 8;
        }
      }

      // Purge past items behind player
      if (item.group.position.z > playerZ + 15) {
        this.scene.remove(item.group);
        this.activeItems.splice(i, 1);
      }
    }
  }

  spawnPattern(posZ) {
    const lanes = [LANES.LEFT, LANES.CENTER, LANES.RIGHT];
    const laneX = lanes[Math.floor(Math.random() * 3)];
    const patternStyle = Math.random();

    if (patternStyle < 0.6) {
      // Line of 3 items
      for (let k = 0; k < 3; k++) {
        this.createCollectible(this.currentOrderType, laneX, 0.8, posZ - k * 3);
      }
    } else {
      // Jump Arc (elevated in middle)
      const heights = [0.8, 1.8, 0.8];
      for (let k = 0; k < 3; k++) {
        this.createCollectible(this.currentOrderType, laneX, heights[k], posZ - k * 3);
      }
    }
  }

  createCollectible(type, posX, posY, posZ) {
    const meshGroup = this.createItemMesh(type);
    meshGroup.position.set(posX, posY, posZ);
    this.scene.add(meshGroup);

    this.activeItems.push({
      type,
      group: meshGroup,
      baseY: posY,
      floatOffset: Math.random() * Math.PI * 2,
      radius: 0.65
    });
  }

  // Check overlap with Mushak
  checkCollisions(mushak) {
    const collected = [];
    const playerPos = mushak.mesh.position;
    const playerRadius = 0.75;

    for (let i = this.activeItems.length - 1; i >= 0; i--) {
      const item = this.activeItems[i];
      const itemPos = item.group.position;

      // Distance check
      const dx = playerPos.x - itemPos.x;
      const dy = (playerPos.y + (mushak.isSliding ? 0.3 : 0.6)) - itemPos.y;
      const dz = playerPos.z - itemPos.z;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < (playerRadius + item.radius) * (playerRadius + item.radius)) {
        collected.push(item);
        this.scene.remove(item.group);
        this.activeItems.splice(i, 1);
      }
    }

    return collected;
  }

  reset() {
    this.activeItems.forEach(item => {
      this.scene.remove(item.group);
    });
    this.activeItems = [];
    this.nextSpawnZ = -20;
  }
}
