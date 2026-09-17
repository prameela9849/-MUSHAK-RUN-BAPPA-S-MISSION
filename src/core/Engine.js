// ==========================================================================
// MUSHAK RUN: BAPPA'S MISSION - 3D ENGINE (THREE.JS CORE)
// 60fps WebGL Rendering, Festive Lighting, Camera Follow & Particles
// ==========================================================================

import * as THREE from 'three';

export class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    this.dirLight = null;
    this.ambientLight = null;
    this.hemiLight = null;

    this.cameraOffset = new THREE.Vector3(0, 3.8, 6.8);
    this.cameraLookOffset = new THREE.Vector3(0, 1.2, -4);
    this.cameraTargetPos = new THREE.Vector3();
    this.cameraShakeIntensity = 0;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.init();
  }

  init() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a062f);
    // Festive purple/golden mist fog
    this.scene.fog = new THREE.FogExp2(0x1f0738, 0.015);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      58,
      this.width / this.height,
      0.1,
      600
    );
    this.camera.position.set(0, 4, 7);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // 4. Festive Lighting Setup
    this.setupLighting();

    // 5. Responsive Resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  setupLighting() {
    // Warm festive ambient base
    this.ambientLight = new THREE.AmbientLight(0xffeedd, 0.9);
    this.scene.add(this.ambientLight);

    // Hemisphere sky/ground contrast: sky gold/purple, ground warm amber
    this.hemiLight = new THREE.HemisphereLight(0xffdfba, 0x4a154b, 0.85);
    this.hemiLight.position.set(0, 40, 0);
    this.scene.add(this.hemiLight);

    // Directional Sun / Divine Ray
    this.dirLight = new THREE.DirectionalLight(0xfff3cf, 1.8);
    this.dirLight.position.set(15, 30, 20);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 120;
    this.dirLight.shadow.camera.left = -20;
    this.dirLight.shadow.camera.right = 20;
    this.dirLight.shadow.camera.top = 20;
    this.dirLight.shadow.camera.bottom = -20;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);
  }

  // Smooth third-person camera tracking behind Mushak
  updateCamera(mushakPos, delta) {
    if (!mushakPos) return;

    // Target position behind Mushak
    const desiredX = mushakPos.x * 0.45; // Subtle lane dampening for cinematic camera
    const desiredY = mushakPos.y + this.cameraOffset.y;
    const desiredZ = mushakPos.z + this.cameraOffset.z;

    this.cameraTargetPos.set(desiredX, desiredY, desiredZ);

    // Camera shake decay
    let shakeX = 0;
    let shakeY = 0;
    if (this.cameraShakeIntensity > 0) {
      shakeX = (Math.random() - 0.5) * this.cameraShakeIntensity;
      shakeY = (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.cameraShakeIntensity = Math.max(0, this.cameraShakeIntensity - delta * 3);
    }

    // Smooth Lerp
    this.camera.position.x += (this.cameraTargetPos.x + shakeX - this.camera.position.x) * Math.min(1, delta * 10);
    this.camera.position.y += (this.cameraTargetPos.y + shakeY - this.camera.position.y) * Math.min(1, delta * 8);
    this.camera.position.z = desiredZ; // Match Z directly for zero stutter

    // Directional light follows player forward to keep shadows crisp
    if (this.dirLight) {
      this.dirLight.position.z = mushakPos.z + 15;
      this.dirLight.target.position.set(0, 0, mushakPos.z - 10);
      this.dirLight.target.updateMatrixWorld();
    }

    // Camera LookAt
    const lookAtZ = mushakPos.z + this.cameraLookOffset.z;
    const lookAtY = mushakPos.y + this.cameraLookOffset.y;
    this.camera.lookAt(mushakPos.x * 0.3, lookAtY, lookAtZ);
  }

  triggerCameraShake(intensity = 0.4) {
    this.cameraShakeIntensity = intensity;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    if (this.camera) {
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
    }
    if (this.renderer) {
      this.renderer.setSize(this.width, this.height);
    }
  }
}
