// ==========================================================================
// MUSHAK RUN: BAPPA'S MISSION - UI MANAGER
// One-Time Player Name Setup, Automatic Leaderboard Save, and Immediate 30s HUD updates
// ==========================================================================

import { GameState } from '../core/StateMachine.js';
import { audioSystem } from '../systems/AudioSystem.js';
import { leaderboardService } from '../systems/LeaderboardService.js';
import { orderSystem } from '../systems/OrderSystem.js';
import { scoreSystem } from '../systems/ScoreSystem.js';

export class UIManager {
  constructor(stateMachine) {
    this.sm = stateMachine;
    this.lastRunStats = null;

    this.screens = {
      [GameState.MAIN_MENU]: document.getElementById('screen-main-menu'),
      [GameState.NAME_SETUP]: document.getElementById('screen-name-setup'),
      [GameState.ORDER_INTRO]: document.getElementById('screen-order-briefing'),
      [GameState.PAUSED]: document.getElementById('screen-pause'),
      [GameState.GAME_OVER]: document.getElementById('screen-game-over'),
      [GameState.LEADERBOARD]: document.getElementById('screen-leaderboard'),
      [GameState.HOW_TO_PLAY]: document.getElementById('screen-how-to-play'),
      [GameState.SETTINGS]: document.getElementById('screen-settings')
    };

    this.hudOverlay = document.getElementById('hud-overlay');

    // HUD Elements
    this.hudOrderText = document.getElementById('hud-order-text');
    this.hudScoreValue = document.getElementById('hud-score-value');
    this.hudMultiplierTag = document.getElementById('hud-multiplier-tag');
    this.hudDistanceValue = document.getElementById('hud-distance-value');
    this.hudItemIcon = document.getElementById('hud-item-icon');
    this.hudItemCount = document.getElementById('hud-item-count');
    this.hudPowerupsContainer = document.getElementById('hud-powerups-container');

    // Quick Audio & HUD Action Buttons
    this.quickSoundBtn = document.getElementById('quick-sound-btn');
    this.quickMusicBtn = document.getElementById('quick-music-btn');
    this.btnHudPause = document.getElementById('btn-hud-pause');
    this.pauseBtnIcon = document.getElementById('pause-btn-icon');
    this.pauseBtnText = document.getElementById('pause-btn-text');

    // Menu Elements
    this.menuDevoteeLabel = document.getElementById('menu-current-devotee-label');

    // Initial Name Setup Elements
    this.initPlayerNameInput = document.getElementById('init-player-name-input');
    this.formNameSetup = document.getElementById('form-name-setup');

    // Order Briefing Elements
    this.orderSeqIndicator = document.getElementById('order-sequence-indicator');
    this.ganeshaOrderDialogue = document.getElementById('ganesha-order-dialogue');
    this.targetItemIcon = document.getElementById('target-item-icon');
    this.targetItemName = document.getElementById('target-item-name');
    this.targetItemDesc = document.getElementById('target-item-desc');

    // Game Over Elements
    this.goScoreVal = document.getElementById('go-score-val');
    this.goDistanceVal = document.getElementById('go-distance-val');
    this.goCollectedVal = document.getElementById('go-collected-val');
    this.goItemIcon = document.getElementById('go-item-icon');
    this.goOrderVal = document.getElementById('go-order-val');
    this.goNextOrderText = document.getElementById('go-next-order-text');
    this.saveStatusBanner = document.getElementById('game-over-save-status');
    this.saveStatusText = document.getElementById('save-status-text');
    this.saveStatusIcon = document.getElementById('save-status-icon');

    // Pause Elements
    this.pauseStatScore = document.getElementById('pause-stat-score');
    this.pauseStatDistance = document.getElementById('pause-stat-distance');

    // Leaderboard Elements
    this.leaderboardBody = document.getElementById('leaderboard-table-body');
    this.leaderboardEmpty = document.getElementById('leaderboard-empty-state');
    this.leaderboardLoading = document.getElementById('leaderboard-loading-state');

    // Settings Elements
    this.settingPlayerNameInput = document.getElementById('setting-player-name-input');
    this.settingSoundToggle = document.getElementById('setting-sound-toggle');
    this.settingMusicToggle = document.getElementById('setting-music-toggle');
    this.settingParticlesToggle = document.getElementById('setting-particles-toggle');

    this.toastContainer = document.getElementById('toast-container');

    this.callbacks = {
      onStartRun: () => {},
      onResume: () => {},
      onRestart: () => {},
      onNextRun: () => {}
    };

    this.init();
  }

  init() {
    this.sm.onStateChange(this.handleStateChange.bind(this));
    this.bindButtons();
    this.syncAudioButtons();
    this.syncDevoteeName();
  }

  syncDevoteeName() {
    const savedName = leaderboardService.getSavedPlayerName();
    if (this.menuDevoteeLabel) {
      if (savedName) {
        this.menuDevoteeLabel.innerHTML = `Devotee: <strong>${this.escapeHtml(savedName)}</strong>`;
      } else {
        this.menuDevoteeLabel.innerHTML = `Welcome to <strong>Bappa's Mission</strong>`;
      }
    }
    if (this.settingPlayerNameInput && savedName) {
      this.settingPlayerNameInput.value = savedName;
    }
    if (this.initPlayerNameInput && savedName) {
      this.initPlayerNameInput.value = savedName;
    }
  }

  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  bindButtons() {
    // 1. Quick Audio
    this.quickSoundBtn?.addEventListener('click', () => {
      audioSystem.playClick();
      const enabled = audioSystem.toggleSound();
      this.syncAudioButtons();
      this.showToast(`Sound SFX: ${enabled ? 'ON' : 'OFF'}`);
    });

    this.quickMusicBtn?.addEventListener('click', () => {
      audioSystem.playClick();
      const enabled = audioSystem.toggleMusic();
      this.syncAudioButtons();
      this.showToast(`Festive Music: ${enabled ? 'ON' : 'OFF'}`);
    });

    // 2. Main Menu Play Button (One-time name setup check)
    document.getElementById('btn-menu-play')?.addEventListener('click', () => {
      audioSystem.playClick();
      audioSystem.ensureContext();

      const savedName = leaderboardService.getSavedPlayerName();
      if (!savedName || !savedName.trim()) {
        // Show one-time devotee name modal
        this.sm.setState(GameState.NAME_SETUP);
      } else {
        // Already have name -> proceed straight to Ganesha's command
        this.sm.setState(GameState.ORDER_INTRO);
      }
    });

    // 3. One-Time Devotee Setup Form
    const handleInitialNameSubmit = () => {
      const name = this.initPlayerNameInput?.value?.trim();
      if (!name) {
        this.showToast('Please enter your name to begin!');
        return;
      }
      audioSystem.playClick();
      leaderboardService.setSavedPlayerName(name);
      this.syncDevoteeName();
      this.showToast(`Welcome Devotee ${name}! 🕉️`);
      this.sm.setState(GameState.ORDER_INTRO);
    };

    document.getElementById('btn-submit-initial-name')?.addEventListener('click', handleInitialNameSubmit);
    this.formNameSetup?.addEventListener('submit', (e) => {
      e.preventDefault();
      handleInitialNameSubmit();
    });

    document.getElementById('btn-menu-leaderboard')?.addEventListener('click', () => {
      audioSystem.playClick();
      this.sm.setState(GameState.LEADERBOARD);
    });

    document.getElementById('btn-menu-how-to-play')?.addEventListener('click', () => {
      audioSystem.playClick();
      this.sm.setState(GameState.HOW_TO_PLAY);
    });

    document.getElementById('btn-menu-settings')?.addEventListener('click', () => {
      audioSystem.playClick();
      this.syncDevoteeName();
      this.sm.setState(GameState.SETTINGS);
    });

    // 4. Order Briefing Start Button
    document.getElementById('btn-start-run')?.addEventListener('click', () => {
      audioSystem.playClick();
      this.callbacks.onStartRun();
    });

    // 5. Single Toggle Gameplay HUD Pause / Continue Button
    this.btnHudPause?.addEventListener('click', () => {
      audioSystem.playClick();
      if (this.sm.is(GameState.PLAYING)) {
        this.sm.setState(GameState.PAUSED, scoreSystem.getStats());
      } else if (this.sm.is(GameState.PAUSED)) {
        this.callbacks.onResume();
      }
    });

    // 6. Pause Modal Actions
    document.getElementById('btn-pause-restart')?.addEventListener('click', () => {
      audioSystem.playClick();
      this.callbacks.onRestart();
    });

    document.getElementById('btn-pause-menu')?.addEventListener('click', () => {
      audioSystem.playClick();
      this.sm.setState(GameState.MAIN_MENU);
    });

    // 7. Game Over Modal Buttons (No manual submit button)
    document.getElementById('btn-go-next-run')?.addEventListener('click', () => {
      audioSystem.playClick();
      this.callbacks.onNextRun();
    });

    document.getElementById('btn-go-leaderboard')?.addEventListener('click', () => {
      audioSystem.playClick();
      this.sm.setState(GameState.LEADERBOARD);
    });

    document.getElementById('btn-go-menu')?.addEventListener('click', () => {
      audioSystem.playClick();
      this.sm.setState(GameState.MAIN_MENU);
    });

    // 8. Leaderboard Modal Buttons
    document.getElementById('btn-leaderboard-back')?.addEventListener('click', () => {
      audioSystem.playClick();
      this.sm.setState(this.sm.previousState === GameState.GAME_OVER ? GameState.GAME_OVER : GameState.MAIN_MENU);
    });

    document.getElementById('btn-leaderboard-refresh')?.addEventListener('click', () => {
      audioSystem.playClick();
      this.loadLeaderboardData();
    });

    // 9. How to Play Modal Button
    document.getElementById('btn-how-to-back')?.addEventListener('click', () => {
      audioSystem.playClick();
      this.sm.setState(GameState.MAIN_MENU);
    });

    // 10. Settings Name Update
    document.getElementById('btn-settings-save-name')?.addEventListener('click', () => {
      const newName = this.settingPlayerNameInput?.value?.trim();
      if (!newName) {
        this.showToast('Please enter a valid name.');
        return;
      }
      audioSystem.playClick();
      leaderboardService.setSavedPlayerName(newName);
      this.syncDevoteeName();
      this.showToast('Devotee name updated!');
    });

    // Settings Modal Toggles
    this.settingSoundToggle?.addEventListener('change', (e) => {
      audioSystem.toggleSound(e.target.checked);
      this.syncAudioButtons();
    });

    this.settingMusicToggle?.addEventListener('change', (e) => {
      audioSystem.toggleMusic(e.target.checked);
      this.syncAudioButtons();
    });

    document.getElementById('btn-settings-back')?.addEventListener('click', () => {
      audioSystem.playClick();
      this.sm.setState(GameState.MAIN_MENU);
    });
  }

  syncAudioButtons() {
    if (this.quickSoundBtn) {
      this.quickSoundBtn.innerHTML = `<span class="icon">${audioSystem.soundEnabled ? '🔊' : '🔇'}</span>`;
      this.quickSoundBtn.style.opacity = audioSystem.soundEnabled ? '1' : '0.5';
    }
    if (this.quickMusicBtn) {
      this.quickMusicBtn.innerHTML = `<span class="icon">${audioSystem.musicEnabled ? '🎵' : '🔇'}</span>`;
      this.quickMusicBtn.style.opacity = audioSystem.musicEnabled ? '1' : '0.5';
    }
    if (this.settingSoundToggle) this.settingSoundToggle.checked = audioSystem.soundEnabled;
    if (this.settingMusicToggle) this.settingMusicToggle.checked = audioSystem.musicEnabled;
  }

  handleStateChange(newState, oldState, payload) {
    // Hide all modal screens
    Object.values(this.screens).forEach(screen => {
      if (screen) screen.classList.remove('active');
    });

    // Show active screen
    const targetScreen = this.screens[newState];
    if (targetScreen) {
      targetScreen.classList.add('active');
    }

    // Toggle HUD visibility (active during both PLAYING and PAUSED states)
    if (newState === GameState.PLAYING || newState === GameState.PAUSED) {
      this.hudOverlay?.classList.add('active');
      this.btnHudPause?.classList.remove('hud-pause-hidden');
    } else {
      this.hudOverlay?.classList.remove('active');
      this.btnHudPause?.classList.add('hud-pause-hidden');
    }

    // Update single Pause/Continue toggle button state
    if (this.btnHudPause) {
      if (newState === GameState.PAUSED) {
        this.btnHudPause.classList.add('is-paused');
        if (this.pauseBtnIcon) this.pauseBtnIcon.textContent = '▶';
        if (this.pauseBtnText) this.pauseBtnText.textContent = 'CONTINUE';
      } else {
        this.btnHudPause.classList.remove('is-paused');
        if (this.pauseBtnIcon) this.pauseBtnIcon.textContent = '⏸';
        if (this.pauseBtnText) this.pauseBtnText.textContent = 'PAUSE';
      }
    }

    // Background Music State Transitions
    if (newState === GameState.PAUSED) {
      audioSystem.pauseMusic();
    } else if (newState === GameState.PLAYING) {
      audioSystem.resumeMusic();
    } else if (newState === GameState.GAME_OVER) {
      audioSystem.pauseMusic();
    } else if (newState === GameState.MAIN_MENU) {
      audioSystem.startMusic();
    }

    // Specific screen state updates
    if (newState === GameState.MAIN_MENU) {
      this.syncDevoteeName();
    } else if (newState === GameState.NAME_SETUP) {
      if (this.initPlayerNameInput) {
        setTimeout(() => this.initPlayerNameInput.focus(), 150);
      }
    } else if (newState === GameState.ORDER_INTRO) {
      this.updateOrderBriefingUI();
    } else if (newState === GameState.PAUSED) {
      if (payload) {
        if (this.pauseStatScore) this.pauseStatScore.textContent = Number(payload.score).toLocaleString();
        if (this.pauseStatDistance) this.pauseStatDistance.textContent = `${payload.distance} m`;
      }
    } else if (newState === GameState.GAME_OVER) {
      this.updateGameOverUI(payload);
    } else if (newState === GameState.LEADERBOARD) {
      this.loadLeaderboardData();
    }
  }

  updateOrderBriefingUI() {
    const order = orderSystem.getCurrentOrder();
    if (this.orderSeqIndicator) this.orderSeqIndicator.textContent = orderSystem.getOrderProgressText();
    if (this.ganeshaOrderDialogue) this.ganeshaOrderDialogue.textContent = `"${order.dialogue}"`;
    if (this.targetItemIcon) this.targetItemIcon.textContent = order.icon;
    if (this.targetItemName) this.targetItemName.textContent = order.name;
    if (this.targetItemDesc) this.targetItemDesc.textContent = order.desc;
  }

  updateGameOverUI(stats = {}) {
    const currentOrder = orderSystem.getCurrentOrder();
    const nextOrder = orderSystem.getNextOrder();

    // Freeze snapshot stats
    this.lastRunStats = {
      score: typeof stats.score === 'number' ? stats.score : scoreSystem.score,
      distance: typeof stats.distance === 'number' ? stats.distance : Math.floor(scoreSystem.distance),
      collectiblesCount: typeof stats.collectiblesCount === 'number' ? stats.collectiblesCount : scoreSystem.collectiblesCount,
      orderName: stats.orderName || currentOrder.name,
      shortOrderName: stats.shortOrderName || currentOrder.shortName,
      icon: stats.icon || currentOrder.icon,
      savedStatus: stats.savedStatus || 'success',
      isNewBest: stats.isNewBest
    };

    if (this.goScoreVal) this.goScoreVal.textContent = Number(this.lastRunStats.score).toLocaleString();
    if (this.goDistanceVal) this.goDistanceVal.textContent = `${this.lastRunStats.distance} m`;
    if (this.goCollectedVal) this.goCollectedVal.textContent = this.lastRunStats.collectiblesCount;
    if (this.goItemIcon) this.goItemIcon.textContent = this.lastRunStats.icon;
    if (this.goOrderVal) this.goOrderVal.textContent = this.lastRunStats.shortOrderName;

    if (this.goNextOrderText) {
      this.goNextOrderText.textContent = `"${nextOrder.dialogue}"`;
    }

    // Update Automatic Save Status
    this.updateSaveStatusBadge(this.lastRunStats.savedStatus, this.lastRunStats.isNewBest);
  }

  updateSaveStatusBadge(status, isNewBest) {
    if (!this.saveStatusBanner || !this.saveStatusText) return;

    if (status === 'success') {
      this.saveStatusBanner.className = 'auto-save-banner';
      if (this.saveStatusIcon) this.saveStatusIcon.textContent = '✨';
      this.saveStatusText.textContent = isNewBest
        ? '✨ New personal best score saved to Leaderboard!'
        : '✨ Score saved (Personal best score preserved)!';
    } else if (status === 'saving') {
      this.saveStatusBanner.className = 'auto-save-banner';
      if (this.saveStatusIcon) this.saveStatusIcon.textContent = '⏳';
      this.saveStatusText.textContent = 'Saving score to Leaderboard...';
    } else {
      this.saveStatusBanner.className = 'auto-save-banner error';
      if (this.saveStatusIcon) this.saveStatusIcon.textContent = '⚠️';
      this.saveStatusText.textContent = 'Unable to save score. Please try again.';
    }
  }

  async loadLeaderboardData() {
    if (this.leaderboardLoading) this.leaderboardLoading.classList.remove('hidden');
    if (this.leaderboardEmpty) this.leaderboardEmpty.classList.add('hidden');
    if (this.leaderboardBody) this.leaderboardBody.innerHTML = '';

    const records = await leaderboardService.fetchTopScores(50);

    if (this.leaderboardLoading) this.leaderboardLoading.classList.add('hidden');

    if (!records || records.length === 0) {
      if (this.leaderboardEmpty) this.leaderboardEmpty.classList.remove('hidden');
      return;
    }

    if (this.leaderboardBody) {
      this.leaderboardBody.innerHTML = records.map((entry, idx) => {
        const rank = idx + 1;
        const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : '';

        return `
          <tr>
            <td class="col-rank"><span class="rank-pill ${rankClass}">${rank}</span></td>
            <td class="col-player player-cell">${this.escapeHtml(entry.playerName || 'Devotee')}</td>
            <td class="col-score score-cell">${Number(entry.score).toLocaleString()}</td>
            <td class="col-distance distance-cell">${entry.distance} m</td>
          </tr>
        `;
      }).join('');
    }
  }

  escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }

  // Real-time HUD updates called every frame during gameplay (immediate 30s display)
  updateHUD({ score, distance, collectiblesCount, multiplier, activePowerups }) {
    if (this.hudScoreValue) this.hudScoreValue.textContent = Number(score).toLocaleString();
    if (this.hudDistanceValue) this.hudDistanceValue.textContent = `${distance} m`;
    if (this.hudItemCount) this.hudItemCount.textContent = collectiblesCount;

    // Multiplier tag
    if (this.hudMultiplierTag) {
      if (multiplier > 1) {
        this.hudMultiplierTag.classList.remove('hidden');
        this.hudMultiplierTag.textContent = `${multiplier}x MULTIPLIER`;
      } else {
        this.hudMultiplierTag.classList.add('hidden');
      }
    }

    // Active Powerups Cards with Exact Countdown Seconds (shows 30s immediately on pickup)
    if (this.hudPowerupsContainer && activePowerups) {
      this.hudPowerupsContainer.innerHTML = activePowerups.map(p => {
        const remainingSec = Math.ceil(p.remaining);
        const isExpiringSoon = remainingSec <= 5;
        return `
          <div class="hud-powerup-card ${isExpiringSoon ? 'pulse-danger' : ''}">
            <span class="hud-p-icon">${p.icon}</span>
            <div class="hud-p-info">
              <div class="hud-p-title-row">
                <span class="hud-p-title">${p.name}</span>
                <span class="hud-p-timer">${remainingSec}s</span>
              </div>
              <div class="hud-p-bar-bg">
                <div class="hud-p-bar-fill" style="width: ${p.percent}%"></div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  setupHUDForOrder(order) {
    if (this.hudOrderText) this.hudOrderText.textContent = `"${order.shortName}"`;
    if (this.hudItemIcon) this.hudItemIcon.textContent = order.icon;
  }

  showToast(message) {
    if (!this.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.textContent = message;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3200);
  }
}
