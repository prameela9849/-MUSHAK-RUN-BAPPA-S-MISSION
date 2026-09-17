// ==========================================================================
// MUSHAK RUN: BAPPA'S MISSION - GAME LOOP & GAMEPLAY COORDINATOR
// Automatic Leaderboard Save on Collision, Instant 30s Powerup HUD update
// ==========================================================================

import * as THREE from 'three';
import { GameState } from './StateMachine.js';
import { audioSystem } from '../systems/AudioSystem.js';
import { orderSystem } from '../systems/OrderSystem.js';
import { scoreSystem } from '../systems/ScoreSystem.js';
import { leaderboardService } from '../systems/LeaderboardService.js';

export class GameLoop {
  constructor({ engine, stateMachine, uiManager, mushak, ganesha, environmentManager, obstacleManager, collectibleManager, powerupManager, inputManager }) {
    this.engine = engine;
    this.sm = stateMachine;
    this.ui = uiManager;
    this.mushak = mushak;
    this.ganesha = ganesha;
    this.env = environmentManager;
    this.obstacles = obstacleManager;
    this.collectibles = collectibleManager;
    this.powerups = powerupManager;
    this.input = inputManager;

    this.clock = new THREE.Clock();
    this.isRunning = false;

    // Running Gameplay Metrics
    this.baseSpeed = 15;        // Base meters per second
    this.maxSpeed = 28;         // Top difficulty speed
    this.currentSpeed = this.baseSpeed;
    this.playerZ = 0;           // Forward progression (negative Z)
    this.invulnerableTimer = 0; // Brief invulnerability after shield absorb
    this.isEndingRun = false;   // Flag to freeze all score/movement the millisecond collision happens
    this.hasSubmittedRun = false; // Prevents any duplicate leaderboard save calls
    this.frozenRunResult = null;// Immutable run result snapshot for Game Over and Leaderboard

    this.init();
  }

  init() {
    // Immediate HUD update callback on power-up collection (shows 30s on exact pickup frame)
    this.powerups.setActivationCallback(() => {
      this.ui.updateHUD({
        score: scoreSystem.score,
        distance: Math.floor(scoreSystem.distance),
        collectiblesCount: scoreSystem.collectiblesCount,
        multiplier: scoreSystem.multiplier,
        activePowerups: this.powerups.getActivePowerupsList()
      });
    });

    // Bind Input Actions
    this.input.init({
      onLeft: () => {
        if (this.sm.is(GameState.PLAYING) && !this.isEndingRun) {
          this.mushak.moveLeft();
          audioSystem.playJump();
        }
      },
      onRight: () => {
        if (this.sm.is(GameState.PLAYING) && !this.isEndingRun) {
          this.mushak.moveRight();
          audioSystem.playJump();
        }
      },
      onJump: () => {
        if (this.sm.is(GameState.PLAYING) && !this.isEndingRun) {
          this.mushak.jump();
          audioSystem.playJump();
        }
      },
      onSlide: () => {
        if (this.sm.is(GameState.PLAYING) && !this.isEndingRun) {
          this.mushak.slide();
          audioSystem.playSlide();
        }
      },
      onPause: () => {
        if (this.sm.is(GameState.PLAYING) && !this.isEndingRun) {
          this.sm.setState(GameState.PAUSED, scoreSystem.getStats());
        } else if (this.sm.is(GameState.PAUSED)) {
          this.resumeRun();
        }
      }
    });

    // Bind UI Callbacks
    this.ui.setCallbacks({
      onStartRun: () => this.startRun(),
      onResume: () => this.resumeRun(),
      onRestart: () => this.restartRun(),
      onNextRun: () => this.playNextRun()
    });

    // Start Animation Loop
    this.isRunning = true;
    requestAnimationFrame(this.animate.bind(this));
  }

  startRun() {
    this.resetRunData();
    const currentOrder = orderSystem.getCurrentOrder();
    this.collectibles.setOrderType(currentOrder.type);
    this.ui.setupHUDForOrder(currentOrder);

    // Hide Ganesha during the active run
    this.ganesha.setVisible(false);

    this.sm.setState(GameState.PLAYING);
  }

  resumeRun() {
    this.clock.getDelta(); // Clear delta jump after pausing
    this.sm.setState(GameState.PLAYING);
  }

  restartRun() {
    this.resetRunData();
    const currentOrder = orderSystem.getCurrentOrder();
    this.collectibles.setOrderType(currentOrder.type);
    this.ui.setupHUDForOrder(currentOrder);
    this.ganesha.setVisible(false);
    this.sm.setState(GameState.PLAYING);
  }

  playNextRun() {
    // Advance to next Ganesha order in sequence
    orderSystem.advanceOrder();
    this.sm.setState(GameState.ORDER_INTRO);
  }

  resetRunData() {
    this.playerZ = 0;
    this.currentSpeed = this.baseSpeed;
    this.invulnerableTimer = 0;
    this.isEndingRun = false;
    this.hasSubmittedRun = false;
    this.frozenRunResult = null;

    scoreSystem.reset();
    this.mushak.reset();
    this.obstacles.reset();
    this.collectibles.reset();
    this.powerups.reset(this.mushak);
    this.env.reset();
  }

  // --- MAIN ANIMATION / TICK LOOP ---
  animate() {
    if (!this.isRunning) return;
    requestAnimationFrame(this.animate.bind(this));

    const delta = Math.min(this.clock.getDelta(), 0.1); // Clamp delta to avoid frame spikes

    const currentState = this.sm.getState();

    switch (currentState) {
      case GameState.MAIN_MENU:
        this.updateMenuCinematic(delta);
        break;

      case GameState.ORDER_INTRO:
        this.updateOrderIntro(delta);
        break;

      case GameState.PLAYING:
        if (!this.isEndingRun) {
          this.updateGameplay(delta);
        }
        break;

      case GameState.PAUSED:
        // Everything frozen during pause (powerup timers, distance, score, physics)
        break;

      case GameState.GAME_OVER:
        this.updateGameOver(delta);
        break;

      default:
        // Idle rendering for modals
        this.ganesha.update(delta);
        break;
    }

    // Render 3D scene
    this.engine.render();
  }

  updateMenuCinematic(delta) {
    this.ganesha.setVisible(true);
    this.ganesha.setPosition(0, 0, -5);
    this.ganesha.update(delta);

    this.mushak.mesh.position.set(1.5, 0.55, -4);
    this.mushak.mesh.rotation.y = -Math.PI / 4;

    this.env.update(delta, 0);
    this.engine.camera.position.set(0, 3.2, 2);
    this.engine.camera.lookAt(0, 1.8, -4.5);
  }

  updateOrderIntro(delta) {
    this.ganesha.setVisible(true);
    this.ganesha.setPosition(0, 0, -6);
    this.ganesha.update(delta);

    this.mushak.mesh.position.set(0, 0.55, -3);
    this.mushak.mesh.rotation.y = Math.PI; // Mushak respectfully facing Bappa

    this.env.update(delta, 0);
    this.engine.camera.position.set(0, 3.4, 0.5);
    this.engine.camera.lookAt(0, 1.9, -5.5);
  }

  updateGameplay(delta) {
    // 1. Progressive Difficulty Speed Scaling (fair curve)
    const distanceMeters = scoreSystem.distance;
    const speedBoost = this.powerups.isRushActive() ? 6.0 : 0;
    const targetSpeed = Math.min(this.maxSpeed, this.baseSpeed + distanceMeters * 0.015) + speedBoost;
    this.currentSpeed += (targetSpeed - this.currentSpeed) * delta * 2;

    // 2. Advance Forward
    this.playerZ -= this.currentSpeed * delta;

    // 3. Update Distance & Score
    scoreSystem.updateDistance(this.currentSpeed, delta);
    scoreSystem.setMultiplier(this.powerups.isBlessingActive() ? 2 : 1);

    // 4. Update Mushak
    this.mushak.update(delta, this.playerZ, this.currentSpeed);

    // 5. Update Environment Chunks
    this.env.update(delta, this.playerZ);

    // 6. Update Obstacles
    this.obstacles.update(delta, this.playerZ, this.currentSpeed);

    // 7. Update Collectibles & Magnet (pulls items for 30s)
    const isMagnet = this.powerups.isMagnetActive();
    this.collectibles.update(delta, this.playerZ, isMagnet, this.mushak.mesh.position);

    // 8. Update Powerups (delta-based countdown for Shield 30s, Magnet 30s, 1000m milestones)
    this.powerups.update(delta, this.playerZ, this.mushak, scoreSystem.distance);

    // 9. Check Collectible Pickups
    const gatheredItems = this.collectibles.checkCollisions(this.mushak);
    if (gatheredItems.length > 0) {
      gatheredItems.forEach(item => {
        scoreSystem.addCollectible(100);
        audioSystem.playCollect(item.type);
      });
    }

    // 10. Check Power-Up Pickups
    const gatheredPowerups = this.powerups.checkCollisions(this.mushak);
    if (gatheredPowerups.length > 0) {
      gatheredPowerups.forEach(pType => {
        audioSystem.playPowerup();
        scoreSystem.addBonusPoints(250);
        const name = this.powerups.activePowerups[pType]?.name || pType;
        this.ui.showToast(`✨ ${name} Activated!`);
      });
    }

    // 11. Invulnerability timer decay
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= delta;
    }

    // 12. Check Obstacle Collisions
    const collision = this.obstacles.checkCollision(this.mushak);
    if (collision.collided && this.invulnerableTimer <= 0) {
      if (this.powerups.isRushActive()) {
        // Rush mode smashes through obstacles
        scoreSystem.addBonusPoints(150);
        this.engine.triggerCameraShake(0.25);
      } else if (this.powerups.isShieldActive()) {
        // Rare Vighna Shield absorbs collision during its 30s active duration!
        audioSystem.playShieldBreak();
        this.engine.triggerCameraShake(0.35);
        this.invulnerableTimer = 1.2; // 1.2s mercy invulnerability
        this.ui.showToast('🛡️ Vighna Shield protected Mushak!');
      } else {
        // Lethal Collision -> Freeze Run and Trigger Game Over
        this.triggerGameOver();
        return;
      }
    }

    // 13. Update Camera Tracking
    this.engine.updateCamera(this.mushak.mesh.position, delta);

    // 14. Update HUD
    this.ui.updateHUD({
      score: scoreSystem.score,
      distance: Math.floor(scoreSystem.distance),
      collectiblesCount: scoreSystem.collectiblesCount,
      multiplier: scoreSystem.multiplier,
      activePowerups: this.powerups.getActivePowerupsList()
    });
  }

  // Instantly freezes all gameplay metrics and automatically submits to Leaderboard
  triggerGameOver() {
    if (this.isEndingRun) return;
    this.isEndingRun = true;

    audioSystem.playCollision();
    audioSystem.playGameOver();
    this.engine.triggerCameraShake(0.6);

    this.mushak.triggerDeathAnimation();

    // Capture the exact final score, distance and collectibles at the moment of collision
    const currentOrder = orderSystem.getCurrentOrder();
    this.frozenRunResult = {
      score: scoreSystem.score,
      distance: Math.floor(scoreSystem.distance),
      collectiblesCount: scoreSystem.collectiblesCount,
      orderName: currentOrder.name,
      shortOrderName: currentOrder.shortName,
      icon: currentOrder.icon,
      savedStatus: 'saving',
      timestamp: new Date().toISOString()
    };

    // Automatically submit score to leaderboard exactly ONCE per run
    if (!this.hasSubmittedRun) {
      this.hasSubmittedRun = true;
      const playerName = leaderboardService.getSavedPlayerName() || 'Devotee';

      leaderboardService.submitScore({
        playerName,
        score: this.frozenRunResult.score,
        distance: this.frozenRunResult.distance,
        collectiblesCount: this.frozenRunResult.collectiblesCount,
        orderName: this.frozenRunResult.orderName
      }).then(res => {
        if (res && res.success) {
          this.frozenRunResult.savedStatus = 'success';
          this.frozenRunResult.isNewBest = res.isNewBest;
        } else {
          this.frozenRunResult.savedStatus = 'error';
        }
        if (this.sm.is(GameState.GAME_OVER)) {
          this.ui.updateSaveStatusBadge(this.frozenRunResult.savedStatus, this.frozenRunResult.isNewBest);
        }
      }).catch(err => {
        console.warn('Auto save error:', err);
        this.frozenRunResult.savedStatus = 'error';
        if (this.sm.is(GameState.GAME_OVER)) {
          this.ui.updateSaveStatusBadge('error');
        }
      });
    }

    // Transition to Game Over screen with frozen stats
    setTimeout(() => {
      this.sm.setState(GameState.GAME_OVER, this.frozenRunResult);
    }, 450);
  }

  updateGameOver(delta) {
    // Camera gently stays focused on fallen Mushak
    this.engine.updateCamera(this.mushak.mesh.position, delta);
  }
}
