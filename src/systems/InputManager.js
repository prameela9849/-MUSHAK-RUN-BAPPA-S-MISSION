// ==========================================================================
// MUSHAK RUN: BAPPA'S MISSION - INPUT MANAGER
// Keyboard, Swipe Gestures, and Mobile Touch Button handling
// ==========================================================================

export class InputManager {
  constructor() {
    this.callbacks = {
      onLeft: () => {},
      onRight: () => {},
      onJump: () => {},
      onSlide: () => {},
      onPause: () => {}
    };

    this.touchStartX = 0;
    this.touchStartY = 0;
    this.minSwipeDistance = 30; // Min px for a valid swipe

    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundTouchStart = this.handleTouchStart.bind(this);
    this.boundTouchEnd = this.handleTouchEnd.bind(this);
  }

  init(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };

    window.addEventListener('keydown', this.boundKeyDown);
    
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
      canvas.addEventListener('touchstart', this.boundTouchStart, { passive: true });
      canvas.addEventListener('touchend', this.boundTouchEnd, { passive: true });
    }

    // Bind on-screen touch buttons
    this.bindTouchButton('btn-touch-left', () => this.callbacks.onLeft());
    this.bindTouchButton('btn-touch-right', () => this.callbacks.onRight());
    this.bindTouchButton('btn-touch-jump', () => this.callbacks.onJump());
    this.bindTouchButton('btn-touch-slide', () => this.callbacks.onSlide());
  }

  bindTouchButton(id, handler) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handler();
      });
      el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handler();
      }, { passive: false });
    }
  }

  handleKeyDown(e) {
    // If typing in an input field (e.g. player name input), don't trigger game inputs
    if (e.target && e.target.tagName === 'INPUT') return;

    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        e.preventDefault();
        this.callbacks.onLeft();
        break;
      case 'ArrowRight':
      case 'KeyD':
        e.preventDefault();
        this.callbacks.onRight();
        break;
      case 'ArrowUp':
      case 'KeyW':
      case 'Space':
        e.preventDefault();
        this.callbacks.onJump();
        break;
      case 'ArrowDown':
      case 'KeyS':
        e.preventDefault();
        this.callbacks.onSlide();
        break;
      case 'KeyP':
      case 'Escape':
        e.preventDefault();
        this.callbacks.onPause();
        break;
    }
  }

  handleTouchStart(e) {
    if (e.touches && e.touches.length > 0) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }
  }

  handleTouchEnd(e) {
    if (!e.changedTouches || e.changedTouches.length === 0) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const diffX = endX - this.touchStartX;
    const diffY = endY - this.touchStartY;

    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);

    if (Math.max(absX, absY) > this.minSwipeDistance) {
      if (absX > absY) {
        // Horizontal Swipe
        if (diffX > 0) {
          this.callbacks.onRight();
        } else {
          this.callbacks.onLeft();
        }
      } else {
        // Vertical Swipe
        if (diffY > 0) {
          this.callbacks.onSlide();
        } else {
          this.callbacks.onJump();
        }
      }
    }
  }

  destroy() {
    window.removeEventListener('keydown', this.boundKeyDown);
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
      canvas.removeEventListener('touchstart', this.boundTouchStart);
      canvas.removeEventListener('touchend', this.boundTouchEnd);
    }
  }
}
