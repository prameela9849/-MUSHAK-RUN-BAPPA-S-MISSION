// ==========================================================================
// MUSHAK RUN: BAPPA'S MISSION - ENVIRONMENT MANAGER
// Procedural infinite festival street, glowing diyas, rangoli tiles, torans, lanterns
// ==========================================================================

import * as THREE from 'three';

const CHUNK_LENGTH = 40;
const NUM_CHUNKS = 8;
const ROAD_WIDTH = 8.5;

export class EnvironmentManager {
  constructor(scene) {
    this.scene = scene;
    this.chunks = [];
    this.nextChunkZ = 0;
    this.floatingLanterns = [];
    this.animTime = 0;

    this.initMaterials();
    this.initChunks();
    this.initSkyLanterns();
  }

  initMaterials() {
    // 1. Street Pavement (Festive Sandstone Road)
    this.roadMat = new THREE.MeshStandardMaterial({
      color: 0x3d1448, // Deep festival purple-tinged stone
      roughness: 0.85
    });

    // 2. Center & Lane Dividers (Golden Marigold inlays)
    this.laneLineMat = new THREE.MeshStandardMaterial({
      color: 0xFFB300,
      emissive: 0xFF8F00,
      emissiveIntensity: 0.4,
      roughness: 0.4
    });

    // 3. Sidewalk Curbs (Terracotta & Gold)
    this.curbMat = new THREE.MeshStandardMaterial({
      color: 0x8D6E63,
      roughness: 0.7
    });

    // 4. Temple Pillars & Architecture
    this.pillarMat = new THREE.MeshStandardMaterial({
      color: 0xFFCC80,
      roughness: 0.6
    });

    // 5. Building Facades (Vibrant Festival Hues)
    this.buildingColors = [
      0xE65100, // Saffron Orange
      0xAD1457, // Deep Rose Pink
      0x4A148C, // Royal Purple
      0x00695C, // Peacock Emerald
      0xEF6C00  // Golden Amber
    ];
    this.buildingMaterials = this.buildingColors.map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 }));

    // 6. Marigold Toran Garlands
    this.toranMat = new THREE.MeshStandardMaterial({
      color: 0xFFB300,
      roughness: 0.5,
      emissive: 0xFF6F00,
      emissiveIntensity: 0.3
    });

    // 7. Diya Flame Material
    this.flameMat = new THREE.MeshStandardMaterial({
      color: 0xFFEB3B,
      emissive: 0xFF6D00,
      emissiveIntensity: 1.2
    });
  }

  initChunks() {
    for (let i = 0; i < NUM_CHUNKS; i++) {
      const chunk = this.createChunk(i * -CHUNK_LENGTH);
      this.chunks.push(chunk);
      this.scene.add(chunk.group);
    }
    this.nextChunkZ = -NUM_CHUNKS * CHUNK_LENGTH;
  }

  createChunk(posZ) {
    const group = new THREE.Group();
    group.position.z = posZ;

    // A. Main Road Slab
    const roadGeo = new THREE.PlaneGeometry(ROAD_WIDTH, CHUNK_LENGTH);
    roadGeo.rotateX(-Math.PI / 2);
    const roadMesh = new THREE.Mesh(roadGeo, this.roadMat);
    roadMesh.receiveShadow = true;
    group.add(roadMesh);

    // B. Lane Divider Inlays (Left and Right lane markings)
    [-1.1, 1.1].forEach(xOffset => {
      const lineGeo = new THREE.PlaneGeometry(0.16, CHUNK_LENGTH);
      lineGeo.rotateX(-Math.PI / 2);
      const lineMesh = new THREE.Mesh(lineGeo, this.laneLineMat);
      lineMesh.position.set(xOffset, 0.01, 0);
      group.add(lineMesh);
    });

    // C. Rangoli Floor Mandalas (Every 20m)
    for (let rz = -CHUNK_LENGTH / 4; rz <= CHUNK_LENGTH / 4; rz += CHUNK_LENGTH / 2) {
      const rangoliGeo = new THREE.CircleGeometry(1.6, 8);
      rangoliGeo.rotateX(-Math.PI / 2);
      const rangoliMat = new THREE.MeshBasicMaterial({
        color: 0xFFD54F,
        transparent: true,
        opacity: 0.6
      });
      const rangoliMesh = new THREE.Mesh(rangoliGeo, rangoliMat);
      rangoliMesh.position.set(0, 0.02, rz);
      group.add(rangoliMesh);
    }

    // D. Sidewalks & Roadside Diyas
    [-ROAD_WIDTH / 2 - 1.2, ROAD_WIDTH / 2 + 1.2].forEach((xSide, sideIdx) => {
      const curbGeo = new THREE.BoxGeometry(2.4, 0.3, CHUNK_LENGTH);
      const curbMesh = new THREE.Mesh(curbGeo, this.curbMat);
      curbMesh.position.set(xSide, 0.15, 0);
      curbMesh.receiveShadow = true;
      group.add(curbMesh);

      // Glowing Diyas along curbs every 10m
      for (let dz = -CHUNK_LENGTH / 2 + 5; dz < CHUNK_LENGTH / 2; dz += 10) {
        const diyaGroup = new THREE.Group();
        diyaGroup.position.set(xSide + (sideIdx === 0 ? 0.6 : -0.6), 0.3, dz);

        // Terracotta Cup
        const cupGeo = new THREE.CylinderGeometry(0.22, 0.12, 0.14, 8);
        const cupMesh = new THREE.Mesh(cupGeo, this.curbMat);
        diyaGroup.add(cupMesh);

        // Glowing Flame
        const flameGeo = new THREE.ConeGeometry(0.09, 0.22, 6);
        const flameMesh = new THREE.Mesh(flameGeo, this.flameMat);
        flameMesh.position.y = 0.15;
        diyaGroup.add(flameMesh);

        group.add(diyaGroup);
      }
    });

    // E. Temple Pillars & Overhead Torans (Flower Garlands spanning the street)
    const toranZ = 0;
    const leftPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 6, 8), this.pillarMat);
    leftPillar.position.set(-ROAD_WIDTH / 2 - 0.5, 3, toranZ);
    leftPillar.castShadow = true;
    group.add(leftPillar);

    const rightPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 6, 8), this.pillarMat);
    rightPillar.position.set(ROAD_WIDTH / 2 + 0.5, 3, toranZ);
    rightPillar.castShadow = true;
    group.add(rightPillar);

    // Toran Curve hanging overhead
    const toranCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-ROAD_WIDTH / 2 - 0.5, 5.5, toranZ),
      new THREE.Vector3(0, 4.7, toranZ),
      new THREE.Vector3(ROAD_WIDTH / 2 + 0.5, 5.5, toranZ)
    ]);
    const toranGeo = new THREE.TubeGeometry(toranCurve, 16, 0.14, 6, false);
    const toranMesh = new THREE.Mesh(toranGeo, this.toranMat);
    group.add(toranMesh);

    // F. Festival Heritage Buildings on sides
    [-ROAD_WIDTH / 2 - 6.5, ROAD_WIDTH / 2 + 6.5].forEach(bX => {
      for (let bz = -CHUNK_LENGTH / 2 + 10; bz < CHUNK_LENGTH / 2; bz += 20) {
        const mat = this.buildingMaterials[Math.floor(Math.random() * this.buildingMaterials.length)];
        const height = 10 + Math.random() * 6;
        const bGeo = new THREE.BoxGeometry(7, height, 16);
        const bMesh = new THREE.Mesh(bGeo, mat);
        bMesh.position.set(bX, height / 2, bz);
        bMesh.receiveShadow = true;
        group.add(bMesh);

        // Building roof ornament / Mandap peak
        const roofGeo = new THREE.ConeGeometry(4.5, 3.5, 4);
        roofGeo.rotateY(Math.PI / 4);
        const roofMesh = new THREE.Mesh(roofGeo, this.laneLineMat);
        roofMesh.position.set(bX, height + 1.75, bz);
        group.add(roofMesh);
      }
    });

    return { group, z: posZ };
  }

  initSkyLanterns() {
    const lanternGeo = new THREE.CylinderGeometry(0.5, 0.35, 0.9, 8);
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xFF6D00,
      emissive: 0xFFB300,
      emissiveIntensity: 0.9,
      roughness: 0.3
    });

    for (let i = 0; i < 25; i++) {
      const lantern = new THREE.Mesh(lanternGeo, lanternMat);
      lantern.position.set(
        (Math.random() - 0.5) * 60,
        15 + Math.random() * 25,
        -Math.random() * 300
      );
      this.floatingLanterns.push({
        mesh: lantern,
        baseY: lantern.position.y,
        speedY: 0.4 + Math.random() * 0.4,
        swaySpeed: 0.5 + Math.random() * 0.8,
        swayOffset: Math.random() * Math.PI * 2
      });
      this.scene.add(lantern);
    }
  }

  // Update track chunks and recycle seamlessly past player
  update(delta, playerZ) {
    this.animTime += delta;

    // 1. Recycle Chunks
    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];
      // When chunk is 20m behind player, move it to the front
      if (chunk.group.position.z > playerZ + CHUNK_LENGTH) {
        chunk.group.position.z = this.nextChunkZ;
        this.nextChunkZ -= CHUNK_LENGTH;
      }
    }

    // 2. Animate Floating Sky Lanterns
    for (let i = 0; i < this.floatingLanterns.length; i++) {
      const item = this.floatingLanterns[i];
      item.mesh.position.y += item.speedY * delta;
      item.mesh.position.x += Math.sin(this.animTime * item.swaySpeed + item.swayOffset) * delta * 0.5;

      // Wrap lanterns when too high or far behind
      if (item.mesh.position.y > 45) {
        item.mesh.position.y = 12;
      }
      if (item.mesh.position.z > playerZ + 40) {
        item.mesh.position.z = playerZ - 260 - Math.random() * 60;
      }
    }
  }

  reset() {
    this.nextChunkZ = 0;
    for (let i = 0; i < this.chunks.length; i++) {
      this.chunks[i].group.position.z = i * -CHUNK_LENGTH;
    }
    this.nextChunkZ = -NUM_CHUNKS * CHUNK_LENGTH;

    this.floatingLanterns.forEach(item => {
      item.mesh.position.set(
        (Math.random() - 0.5) * 60,
        15 + Math.random() * 25,
        -Math.random() * 300
      );
    });
  }
}
