// ==========================================================================
// MUSHAK RUN: BAPPA'S MISSION - STATE MACHINE
// Manages clear transitions between application and gameplay states
// ==========================================================================

export const GameState = {
  MAIN_MENU: 'MAIN_MENU',
  NAME_SETUP: 'NAME_SETUP',
  ORDER_INTRO: 'ORDER_INTRO',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
  LEADERBOARD: 'LEADERBOARD',
  HOW_TO_PLAY: 'HOW_TO_PLAY',
  SETTINGS: 'SETTINGS'
};

export class StateMachine {
  constructor(initialState = GameState.MAIN_MENU) {
    this.currentState = initialState;
    this.previousState = null;
    this.listeners = [];
  }

  getState() {
    return this.currentState;
  }

  is(state) {
    return this.currentState === state;
  }

  setState(newState, payload = {}) {
    if (this.currentState === newState) return;
    this.previousState = this.currentState;
    this.currentState = newState;

    this.listeners.forEach(fn => fn(this.currentState, this.previousState, payload));
  }

  onStateChange(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }
}
