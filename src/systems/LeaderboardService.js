// ==========================================================================
// MUSHAK RUN: BAPPA'S MISSION - LEADERBOARD SERVICE
// Unique Player Identity + Automatic Upsert (1 Player = 1 Best Score)
// ==========================================================================

export class LeaderboardService {
  constructor() {
    this.apiBase = '/api/leaderboard';
    this.playerId = this.getOrCreatePlayerId();
    this.savedPlayerName = localStorage.getItem('mushak_player_name') || '';
  }

  getOrCreatePlayerId() {
    let id = localStorage.getItem('mushak_player_id');
    if (!id || typeof id !== 'string') {
      id = 'devotee_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
      localStorage.setItem('mushak_player_id', id);
    }
    return id;
  }

  getPlayerId() {
    return this.playerId;
  }

  getSavedPlayerName() {
    return this.savedPlayerName;
  }

  setSavedPlayerName(name) {
    this.savedPlayerName = name.trim().slice(0, 25);
    localStorage.setItem('mushak_player_name', this.savedPlayerName);
  }

  clearSavedPlayerName() {
    this.savedPlayerName = '';
    localStorage.removeItem('mushak_player_name');
  }

  // Fetch top records from real backend with local fallback
  async fetchTopScores(limit = 50) {
    try {
      const response = await fetch(`${this.apiBase}?limit=${limit}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          // Update local backup
          localStorage.setItem('mushak_cached_leaderboard', JSON.stringify(result.data));
          return result.data;
        }
      }
      throw new Error('Backend responded with error');
    } catch (err) {
      console.warn('Backend unavailable, loading local cached scores:', err);
      return this.getLocalScores();
    }
  }

  // Submit real score automatically (Upsert to player's best score)
  async submitScore({ playerName, score, distance, collectiblesCount, orderName }) {
    const effectiveName = (playerName || this.savedPlayerName || 'Devotee').trim().slice(0, 25);
    if (effectiveName) {
      this.setSavedPlayerName(effectiveName);
    }

    const payload = {
      playerId: this.playerId,
      playerName: effectiveName,
      score: Math.max(0, Math.floor(score)),
      distance: Math.max(0, Math.floor(distance)),
      collectiblesCount: Math.max(0, Math.floor(collectiblesCount)),
      orderName: orderName || 'Sacred Modaks'
    };

    try {
      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (response.ok && result.success) {
        this.saveLocalScore(result.entry);
        return {
          success: true,
          message: result.message,
          entry: result.entry,
          isNewBest: result.isNewBest
        };
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (err) {
      console.warn('Network submission failed, saving locally:', err);
      const localEntry = {
        id: 'local_' + this.playerId,
        playerId: this.playerId,
        playerName: payload.playerName,
        score: payload.score,
        distance: payload.distance,
        collectiblesCount: payload.collectiblesCount,
        orderName: payload.orderName,
        updatedAt: new Date().toISOString()
      };
      this.saveLocalScore(localEntry);
      return {
        success: true,
        isOffline: true,
        message: 'Score saved locally (Best score tracked)!',
        entry: localEntry
      };
    }
  }

  // Local fallback storage helpers (ensuring 1 player = 1 best score)
  getLocalScores() {
    try {
      const raw = localStorage.getItem('mushak_cached_leaderboard');
      const list = raw ? JSON.parse(raw) : [];
      return list.sort((a, b) => Number(b.score) - Number(a.score)).map((e, i) => ({ ...e, rank: i + 1 }));
    } catch {
      return [];
    }
  }

  saveLocalScore(entry) {
    try {
      const list = this.getLocalScores();
      const existingIdx = list.findIndex(e => 
        (e.playerId && e.playerId === entry.playerId) || 
        (e.playerName && e.playerName.toLowerCase() === entry.playerName.toLowerCase())
      );

      if (existingIdx !== -1) {
        if (Number(entry.score) > Number(list[existingIdx].score)) {
          list[existingIdx] = { ...list[existingIdx], ...entry };
        }
      } else {
        list.push(entry);
      }

      list.sort((a, b) => Number(b.score) - Number(a.score));
      localStorage.setItem('mushak_cached_leaderboard', JSON.stringify(list.slice(0, 50)));
    } catch (e) {
      console.error('Error saving local score:', e);
    }
  }
}

export const leaderboardService = new LeaderboardService();
