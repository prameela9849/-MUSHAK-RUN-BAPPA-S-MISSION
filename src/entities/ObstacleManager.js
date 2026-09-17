// ==========================================================================
// MUSHAK RUN: BAPPA'S MISSION - OBSTACLE MANAGER
// Procedural festival obstacles (Carts, Drums, Hurdles, Toran Arches) with guaranteed fair paths
// ==========================================================================

import * as THREE from 'three';
import { LANES, LANE_WIDTH } from './Mushak.js';

export const ObstacleType = {
  CART: 'CART',           // High obstacle, must switch lanes
  DRUMS: 'DRUMS',         // High obstacle, must switch lanes
  HURDLE: 'HURDLE',       // Low ground obstacle, must jump over
  TORAN_ARCH: 'TORAN_ARCH'// High hanging banner, must slide under
};

export class ObstacleManager {
  constructor(scene) {
    this.scene = scene;
    this.activeObstacles = [];
    this.nextSpawnZ = -35;
    this.spawnInterval = 28; // Spacing in meters between obstacle clusters

    this.initMaterials();
  }

  initMaterials() {
    this.woodMat = new THREE.MeshStandardMaterial({ color: 0x5D4037, roughness: 0.8 });
    this.goldMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.3, metalness: 0.7 });
    this.canopyMat = new THREE.MeshStandardMaterial({ color: 0xD50000, roughness: 0.6 });
    this.drumMat = new THREE.MeshStandardMaterial({ color: 0xE65100, roughness: 0.5 });
    this.flowerMat = new THREE.MeshStandardMaterial({ color: 0xFFB300, roughness: 0.4 });
    this.bannerMat = new THREE.MeshStandardMaterial({ color: 0x9C27B0, roughness: 0.5 });
  }

  // Factory to create a Festival Cart (Blocks 1 lane)
  createCartMesh() {
    const group = new THREE.Group();

    // Body
    const bodyGeo = new THREE.BoxGeometry(1.6, 1.2, 2.2);
    const bodyMesh = new THREE.Mesh(bodyGeo, this.woodMat);
    bodyMesh.position.y = 0.9;
    bodyMesh.castShadow = true;
    group.add(bodyMesh);

    // Festive Canopy Roof
    const roofGeo = new THREE.ConeGeometry(1.3, 0.8, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roofMesh = new THREE.Mesh(roofGeo, this.canopyMat);
    roofMesh.position.y = 1.9;
    roofMesh.castShadow = true;
    group.add(roofMesh);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.12, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    [-0.85, 0.85].forEach(wx => {
      [-0.6, 0.6].forEach(wz => {
        const wheel = new THREE.Mesh(wheelGeo, this.goldMat);
        wheel.position.set(wx, 0.45, wz);
        group.add(wheel);
      });
    });

    return group;
  }

  // Factory to create Festival Drums (Dhol stack)
  createDrumsMesh() {
    const group = new THREE.Group();

    // Bottom Dhol
    const drumGeo1 = new THREE.CylinderGeometry(0.55, 0.55, 1.3, 16);
    drumGeo1.rotateZ(Math.PI / 2);
    const drum1 = new THREE.Mesh(drumGeo1, this.drumMat);
    drum1.position.y = 0.55;
    drum1.castShadow = true;
    group.add(drum1);

    // Top Dhol
    const drumGeo2 = new THREE.CylinderGeometry(0.42, 0.42, 1.1, 16);
    drumGeo2.rotateZ(Math.PI / 2);
    const drum2 = new THREE.Mesh(drumGeo2, this.canopyMat);
    drum2.position.y = 1.35;
    drum2.castShadow = true;
    group.add(drum2);

    // Gold Ribbons & Tassels
    const ribMesh = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.04, 6, 16), this.goldMat);
    ribMesh.position.y = 0.55;
    group.add(ribMesh);

    return group;
  }

  // Factory to create a Low Jump Hurdle (Requires Jumping)
  createHurdleMesh() {
    const group = new THREE.Group();

    // Horizontal wooden barrier bar
    const barGeo = new THREE.BoxGeometry(1.8, 0.22, 0.18);
    const barMesh = new THREE.Mesh(barGeo, this.woodMat);
    barMesh.position.y = 0.45;
    barMesh.castShadow = true;
    group.add(barMesh);

    // Side Posts
    [-0.85, 0.85].forEach(px => {
      const postGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8);
      const postMesh = new THREE.Mesh(postGeo, this.goldMat);
      postMesh.position.set(px, 0.3, 0);
      group.add(postMesh);
    });

    // Marigold Garland decoration
    const garlandGeo = new THREE.TorusGeometry(0.75, 0.06, 6, 12, Math.PI);
    garlandGeo.rotateZ(Math.PI);
    const garland = new THREE.Mesh(garlandGeo, this.flowerMat);
    garland.position.set(0, 0.45, 0.08);
    group.add(garland);

    return group;
  }

  // Factory to create a Low Hanging Toran Banner (Requires Sliding)
  createToranArchMesh() {
    const group = new THREE.Group();

    // High Banner Beam (Clearance at bottom: ~1.0m, requires sliding)
    const bannerGeo = new THREE.BoxGeometry(1.9, 1.1, 0.15);
    const bannerMesh = new THREE.Mesh(bannerGeo, this.bannerMat);
    bannerMesh.position.y = 1.65;
    bannerMesh.castShadow = true;
    group.add(bannerMesh);

    // Gold Tassels
    const tasselGeo = new THREE.ConeGeometry(0.12, 0.3, 6);
    [-0.6, 0, 0.6].forEach(tx => {
      const tassel = new THREE.Mesh(tasselGeo, this.goldMat);
      tassel.position.set(tx, 1.0, 0);
      tassel.rotation.x = Math.PI;
      group.add(tassel);
    });

    // Side Supporting Bamboo poles
    [-0.92, 0.92].forEach(px => {
      const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.4, 8);
      const poleMesh = new THREE.Mesh(poleGeo, this.woodMat);
      poleMesh.position.set(px, 1.2, 0);
      group.add(poleMesh);
    });

    return group;
  }

  // Update loop: Spawns upcoming clusters and purges past obstacles
  update(delta, playerZ, gameSpeed) {
    // Dynamic difficulty spacing: gradually tightens from 28m down to 18m
    const currentSpacing = Math.max(18, 28 - Math.abs(playerZ) / 400);

    // Spawn new row ahead of player
    if (this.nextSpawnZ > playerZ - 180) {
      this.spawnObstacleRow(this.nextSpawnZ);
      this.nextSpawnZ -= currentSpacing;
    }

    // Purge old obstacles behind player
    for (let i = this.activeObstacles.length - 1; i >= 0; i--) {
      const obs = this.activeObstacles[i];
      if (obs.group.position.z > playerZ + 20) {
        this.scene.remove(obs.group);
        this.activeObstacles.splice(i, 1);
      }
    }
  }

  // Spawns a guaranteed solvable 3-lane pattern
  spawnObstacleRow(posZ) {
    const lanes = [LANES.LEFT, LANES.CENTER, LANES.RIGHT];
    const patternType = Math.random();

    // Strategy for guaranteed fair paths:
    // Pattern 1: 1 Cart/Drums in 1 lane (2 lanes open)
    // Pattern 2: 2 Carts in 2 lanes (1 lane open)
    // Pattern 3: 1 Hurdle (Jump) + 1 Cart (1 lane open, 1 jumpable, 1 blocked)
    // Pattern 4: 1 Toran Arch (Slide) + 1 Cart (1 lane open, 1 slidable, 1 blocked)

    if (patternType < 0.35) {
      // 1 Cart/Drum in random lane
      const laneIdx = Math.floor(Math.random() * 3);
      const type = Math.random() < 0.5 ? ObstacleType.CART : ObstacleType.DRUMS;
      this.createObstacle(type, lanes[laneIdx], posZ);
    } else if (patternType < 0.65) {
      // 1 Hurdle (Jump) in one lane + 1 Cart in another (leaving 1 fully open)
      const openLane = Math.floor(Math.random() * 3);
      const remaining = [0, 1, 2].filter(i => i !== openLane);
      
      this.createObstacle(ObstacleType.HURDLE, lanes[remaining[0]], posZ);
      this.createObstacle(ObstacleType.CART, lanes[remaining[1]], posZ);
    } else if (patternType < 0.85) {
      // 1 Toran Arch (Slide) + 1 Cart (leaving 1 open)
      const openLane = Math.floor(Math.random() * 3);
      const remaining = [0, 1, 2].filter(i => i !== openLane);
      
      this.createObstacle(ObstacleType.TORAN_ARCH, lanes[remaining[0]], posZ);
      this.createObstacle(ObstacleType.DRUMS, lanes[remaining[1]], posZ);
    } else {
      // 2 Carts (leaving 1 open lane)
      const openLane = Math.floor(Math.random() * 3);
      const blockedLanes = [0, 1, 2].filter(i => i !== openLane);
      blockedLanes.forEach(bIdx => {
        const type = Math.random() < 0.5 ? ObstacleType.CART : ObstacleType.DRUMS;
        this.createObstacle(type, lanes[bIdx], posZ);
      });
    }
  }

  createObstacle(type, posX, posZ) {
    let meshGroup = null;
    let collider = new THREE.Box3();
    let size = new THREE.Vector3();
    let centerOffset = new THREE.Vector3();

    switch (type) {
      case ObstacleType.CART:
        meshGroup = this.createCartMesh();
        size.set(1.5, 2.0, 1.8);
        centerOffset.set(0, 1.0, 0);
        break;
      case ObstacleType.DRUMS:
        meshGroup = this.createDrumsMesh();
        size.set(1.4, 1.8, 1.4);
        centerOffset.set(0, 0.9, 0);
        break;
      case ObstacleType.HURDLE:
        meshGroup = this.createHurdleMesh();
        // Low collider box: mushak can jump over if posY > 1.2
        size.set(1.7, 0.7, 0.4);
        centerOffset.set(0, 0.35, 0);
        break;
      case ObstacleType.TORAN_ARCH:
        meshGroup = this.createToranArchMesh();
        // High collider box: mushak can slide under if sliding!
        size.set(1.8, 1.4, 0.4);
        centerOffset.set(0, 1.65, 0);
        break;
    }

    meshGroup.position.set(posX, 0, posZ);
    this.scene.add(meshGroup);

    // Initial bounding box
    const pos = meshGroup.position;
    collider.min.set(pos.x + centerOffset.x - size.x / 2, pos.y + centerOffset.y - size.y / 2, pos.z + centerOffset.z - size.z / 2);
    collider.max.set(pos.x + centerOffset.x + size.x / 2, pos.y + centerOffset.y + size.y / 2, pos.z + centerOffset.z + size.z / 2);

    this.activeObstacles.push({
      type,
      group: meshGroup,
      collider,
      size,
      centerOffset
    });
  }

  // Check collision between Mushak and all active obstacles
  checkCollision(mushak) {
    const mushakBox = mushak.collider;

    for (let i = 0; i < this.activeObstacles.length; i++) {
      const obs = this.activeObstacles[i];

      // Quick Z distance cull
      if (Math.abs(obs.group.position.z - mushak.mesh.position.z) > 3.0) continue;

      // Special Mechanics for Jump and Slide:
      if (obs.type === ObstacleType.HURDLE && mushak.posY > 1.15) {
        // Successfully jumped over hurdle!
        continue;
      }
      if (obs.type === ObstacleType.TORAN_ARCH && mushak.isSliding) {
        // Successfully slid under Toran banner!
        continue;
      }

      // Check Box Intersection
      if (mushakBox.intersectsBox(obs.collider)) {
        return { collided: true, obstacle: obs };
      }
    }

    return { collided: false };
  }

  reset() {
    this.activeObstacles.forEach(obs => {
      this.scene.remove(obs.group);
    });
    this.activeObstacles = [];
    this.nextSpawnZ = -35;
  }
}
