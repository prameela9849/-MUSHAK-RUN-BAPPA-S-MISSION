// ==========================================================================
// MUSHAK RUN: BAPPA'S MISSION - MAIN ENTRY POINT
// ==========================================================================

import { Engine } from './core/Engine.js';
import { StateMachine, GameState } from './core/StateMachine.js';
import { GameLoop } from './core/GameLoop.js';
import { Mushak } from './entities/Mushak.js';
import { Ganesha } from './entities/Ganesha.js';
import { EnvironmentManager } from './entities/EnvironmentManager.js';
import { ObstacleManager } from './entities/ObstacleManager.js';
import { CollectibleManager } from './entities/CollectibleManager.js';
import { PowerupManager } from './entities/PowerupManager.js';
import { InputManager } from './systems/InputManager.js';
import { UIManager } from './ui/UIManager.js';
import { audioSystem } from './systems/AudioSystem.js';

window.addEventListener('DOMContentLoaded', () => {
  // 1. Get 3D Canvas
  const canvas = document.getElementById('game-canvas');
  if (!canvas) {
    console.error('Failed to find #game-canvas');
    return;
  }

  // 2. Initialize Core Engine & State Machine
  const engine = new Engine(canvas);
  const stateMachine = new StateMachine(GameState.MAIN_MENU);

  // 3. Initialize 3D Entities & Managers
  const mushak = new Mushak(engine.scene);
  const ganesha = new Ganesha(engine.scene);
  const environmentManager = new EnvironmentManager(engine.scene);
  const obstacleManager = new ObstacleManager(engine.scene);
  const collectibleManager = new CollectibleManager(engine.scene);
  const powerupManager = new PowerupManager(engine.scene);

  // 4. Initialize Input & UI Managers
  const inputManager = new InputManager();
  const uiManager = new UIManager(stateMachine);

  // 5. Initialize Game Loop Coordinator
  const gameLoop = new GameLoop({
    engine,
    stateMachine,
    uiManager,
    mushak,
    ganesha,
    environmentManager,
    obstacleManager,
    collectibleManager,
    powerupManager,
    inputManager
  });

  // 6. User Interaction Audio Unlock
  const unlockAudio = () => {
    audioSystem.ensureContext();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio);
  window.addEventListener('keydown', unlockAudio);

  console.log("🌸 MUSHAK RUN: BAPPA'S MISSION initialized successfully!");
});
