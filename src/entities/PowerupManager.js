// ==========================================================================
// MUSHAK RUN: BAPPA'S MISSION - POWER-UP MANAGER
// Rare Vighna Shields (450m+ intervals), Modak Magnet, and immediate 30s HUD updates
// ==========================================================================

import * as THREE from 'three';
import { LANES } from './Mushak.js';

export const PowerupType = {
  SHIELD: 'SHIELD',       // Vighna Shield: Rare divine protection for 30s
  MAGNET: 'MAGNET',       // Modak Magnet: Pulls nearby items for 30s
  RUSH: 'RUSH',           // Mushak Rush: Invincible turbo dash for 8s
  BLESSING: 'BLESSING'    // Bappa's Blessing: 2x score multiplier for 12s
};

export const POWERUP_CONFIGS = {
  [PowerupType.SHIELD]: {
    name: 'Vighna Shield',
    icon: '🛡️',
    color: 0x00E676,
    duration: 30.0 // Exactly 30 seconds
  },
  [PowerupType.MAGNET]: {
    name: 'Modak Magnet',
    icon: '🧲',
    color: 0x00B0FF,
    duration: 30.0 // Exactly 30 seconds
  },
  [PowerupType.RUSH]: {
    name: 'Mushak Rush',
    icon: '⚡',
    color: 0xFF6D00,
    duration: 8.0
  },
  [PowerupType.BLESSING]: {
    name: "Bappa's Blessing",
    icon: '✨',
    color: 0xFFD700,
    duration: 12.0
  }
};

export class PowerupManager {
  constructor(scene) {
    this.scene = scene;
    this.spawnedPickups = [];
    this.activePowerups = {}; // Single source of truth for timers: { [type]: { name, icon, remaining, max, color } }
    this.hasShield = false;

    // Regular power-up spawn scheduler (Magnet, Rush, Blessing)
    this.nextRegularSpawnZ = -80;

    // Vighna Shield 1000m milestone tracker (1000m, 2000m, 3000m, 4000m...)
    this.nextShieldMilestone = 1000;

    this.animTime = 0;
    this.onPowerupActivated = () => {};

    this.initMaterials();
  }

  setActivationCallback(cb) {
    this.onPowerupActivated = cb || (() => {});
  }

  initMaterials() {
    this.capsuleMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85
    });

    this.orbMats = {
      [PowerupType.SHIELD]: new THREE.MeshStandardMaterial({ color: 0x00E676, emissive: 0x00C853, emissiveIntensity: 0.8 }),
      [PowerupType.MAGNET]: new THREE.MeshStandardMaterial({ color: 0x00B0FF, emissive: 0x0091EA, emissiveIntensity: 0.8 }),
      [PowerupType.RUSH]: new THREE.MeshStandardMaterial({ color: 0xFF6D00, emissive: 0xFF3D00, emissiveIntensity: 0.8 }),
      [PowerupType.BLESSING]: new THREE.MeshStandardMaterial({ color: 0xFFD700, emissive: 0xFFA000, emissiveIntensity: 0.9 })
    };
  }

  // Create 3D power-up pickup orb
  createPickupMesh(type) {
    const group = new THREE.Group();

    // Outer translucent sphere
    const outerGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const outerMesh = new THREE.Mesh(outerGeo, this.capsuleMat);
    group.add(outerMesh);

    // Inner glowing core
    const coreGeo = new THREE.OctahedronGeometry(0.3, 0);
    const coreMesh = new THREE.Mesh(coreGeo, this.orbMats[type]);
    group.add(coreMesh);

    // Rotating orbital ring
    const ringGeo = new THREE.TorusGeometry(0.65, 0.04, 6, 16);
    const ringMesh = new THREE.Mesh(ringGeo, this.orbMats[type]);
    ringMesh.rotation.x = Math.PI / 3;
    group.add(ringMesh);

    return group;
  }

  // Update loop called each frame only during active gameplay (automatically pauses when game pauses)
  update(delta, playerZ, mushak, distanceMeters = 0) {
    this.animTime += delta;

    // 1. Vighna Shield Spawning at exact 1000m distance milestones (1000m, 2000m, 3000m, 4000m...)
    while (distanceMeters >= this.nextShieldMilestone) {
      const spawnZ = (mushak && mushak.mesh ? mushak.mesh.position.z : playerZ) - 28;
      this.spawnShieldPickup(spawnZ);
      this.nextShieldMilestone += 1000;
    }

    // 2. Regular Power-Up Spawning (Magnet, Rush, Blessing every 95m-130m)
    if (this.nextRegularSpawnZ > playerZ - 180) {
      this.spawnRegularPickup(this.nextRegularSpawnZ);
      this.nextRegularSpawnZ -= 100 + Math.random() * 30;
    }

    // 3. Animate and purge pickups
    for (let i = this.spawnedPickups.length - 1; i >= 0; i--) {
      const p = this.spawnedPickups[i];
      p.group.rotation.y += delta * 3;
      p.group.position.y = 1.0 + Math.sin(this.animTime * 3 + p.floatOffset) * 0.2;

      if (p.group.position.z > playerZ + 15) {
        this.scene.remove(p.group);
        this.spawnedPickups.splice(i, 1);
      }
    }

    // 4. Update Active Power-Up Timers via delta time
    for (const type in this.activePowerups) {
      const p = this.activePowerups[type];
      p.remaining -= delta;

      if (p.remaining <= 0) {
        this.deactivatePowerup(type, mushak);
      }
    }
  }

  spawnShieldPickup(posZ) {
    const lanes = [LANES.LEFT, LANES.CENTER, LANES.RIGHT];
    const laneX = lanes[Math.floor(Math.random() * 3)];

    const meshGroup = this.createPickupMesh(PowerupType.SHIELD);
    meshGroup.position.set(laneX, 1.0, posZ);
    this.scene.add(meshGroup);

    this.spawnedPickups.push({
      type: PowerupType.SHIELD,
      group: meshGroup,
      floatOffset: Math.random() * Math.PI * 2,
      radius: 0.85
    });
  }

  spawnRegularPickup(posZ) {
    const lanes = [LANES.LEFT, LANES.CENTER, LANES.RIGHT];
    const laneX = lanes[Math.floor(Math.random() * 3)];
    // Exclude Shield from regular pool so shields remain strictly rare
    const regularTypes = [PowerupType.MAGNET, PowerupType.RUSH, PowerupType.BLESSING];
    const chosenType = regularTypes[Math.floor(Math.random() * regularTypes.length)];

    const meshGroup = this.createPickupMesh(chosenType);
    meshGroup.position.set(laneX, 1.0, posZ);
    this.scene.add(meshGroup);

    this.spawnedPickups.push({
      type: chosenType,
      group: meshGroup,
      floatOffset: Math.random() * Math.PI * 2,
      radius: 0.85
    });
  }

  // Check collision between Mushak and power-up pickups
  checkCollisions(mushak) {
    const playerPos = mushak.mesh.position;
    const playerRadius = 0.85;
    const collected = [];

    for (let i = this.spawnedPickups.length - 1; i >= 0; i--) {
      const p = this.spawnedPickups[i];
      const pPos = p.group.position;

      const dx = playerPos.x - pPos.x;
      const dy = (playerPos.y + (mushak.isSliding ? 0.3 : 0.6)) - pPos.y;
      const dz = playerPos.z - pPos.z;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < (playerRadius + p.radius) * (playerRadius + p.radius)) {
        collected.push(p.type);
        this.activatePowerup(p.type, mushak);
        this.scene.remove(p.group);
        this.spawnedPickups.splice(i, 1);
      }
    }

    return collected;
  }

  // Activate or reset duration if already active
  activatePowerup(type, mushak) {
    const config = POWERUP_CONFIGS[type];
    const duration = config.duration;

    // Reset duration cleanly on re-collection without creating multiple timers
    this.activePowerups[type] = {
      name: config.name,
      icon: config.icon,
      remaining: duration,
      max: duration,
      color: config.color
    };

    if (type === PowerupType.SHIELD) {
      this.hasShield = true;
      if (mushak) mushak.setShield(true);
    } else if (type === PowerupType.BLESSING) {
      if (mushak) mushak.setBlessing(true);
    } else if (type === PowerupType.RUSH) {
      if (mushak) mushak.setRush(true);
    }

    // Trigger instant HUD update callback so timer shows 30s immediately on this exact frame
    if (this.onPowerupActivated) {
      this.onPowerupActivated(type, this.getActivePowerupsList());
    }
  }

  deactivatePowerup(type, mushak) {
    if (type === PowerupType.SHIELD) {
      this.hasShield = false;
      if (mushak) mushak.setShield(false);
    } else if (type === PowerupType.BLESSING) {
      if (mushak) mushak.setBlessing(false);
    } else if (type === PowerupType.RUSH) {
      if (mushak) mushak.setRush(false);
    }
    delete this.activePowerups[type];
  }

  // Check if shield protects Mushak against collision
  isShieldActive() {
    return this.hasShield && !!this.activePowerups[PowerupType.SHIELD];
  }

  isMagnetActive() {
    return !!this.activePowerups[PowerupType.MAGNET] || !!this.activePowerups[PowerupType.RUSH];
  }

  isRushActive() {
    return !!this.activePowerups[PowerupType.RUSH];
  }

  isBlessingActive() {
    return !!this.activePowerups[PowerupType.BLESSING];
  }

  getActivePowerupsList() {
    return Object.entries(this.activePowerups).map(([type, data]) => ({
      type,
      name: data.name,
      icon: data.icon,
      remaining: Math.max(0, data.remaining),
      max: data.max,
      percent: Math.max(0, Math.min(100, (data.remaining / data.max) * 100))
    }));
  }

  reset(mushak) {
    this.spawnedPickups.forEach(p => {
      this.scene.remove(p.group);
    });
    this.spawnedPickups = [];
    this.activePowerups = {};
    this.hasShield = false;

    this.nextRegularSpawnZ = -80;
    this.nextShieldMilestone = 1000;

    if (mushak) {
      mushak.setShield(false);
      mushak.setBlessing(false);
      mushak.setRush(false);
    }
  }
}
