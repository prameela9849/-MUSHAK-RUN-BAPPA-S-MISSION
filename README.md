# 🐭 MUSHAK RUN: BAPPA'S MISSION

> **"Bappa Commands. Mushak Runs."**
> A vibrant 3D endless runner celebrating Ganesh Chaturthi built with Three.js, Web Audio API, and Node.js.

---

## 🌟 Overview

**MUSHAK RUN: BAPPA'S MISSION** is a real, fully interactive 3D browser endless runner game. Lord Ganesha guides the sacred festival preparations by issuing sequential mission commands (Modaks, Diyas, Flags, Flowers, Puja items, Rangoli, and Offerings), while the player controls Mushak running down festive temple streets, dodging hurdles and chariots, collecting sacred items, activating divine power-ups, and competing on a global persistent high score leaderboard.

---

## 🎮 Gameplay Features

- **3D Runner Physics & Track**: Procedural festive temple street with 3 responsive running lanes, dynamic lighting, celebratory particle aura, and camera follow.
- **Divine Mission Progression**: Sequential Ganesha orders advancing across runs.
- **Vighna Shields at 1000m Milestones**: Guaranteed Shield pickup opportunities at every 1000m gameplay distance ($1000\text{m}, 2000\text{m}, 3000\text{m}, \dots$) protecting Mushak from 1 obstacle collision for 30 seconds.
- **Power-Up Arsenal**:
  - 🛡️ **Vighna Shield**: Divine protection absorbing 1 obstacle impact (30s duration).
  - 🧲 **Modak Magnet**: Magnetically attracts nearby sacred items (30s duration).
  - ⚡ **Mushak Rush**: Turbo dash through hurdles (8s duration).
  - ✨ **Bappa's Blessing**: 2x Score multiplier (12s duration).
- **One-Touch Pause / Continue**: Single dynamic toggle button (`[ ⏸ PAUSE ]` $\leftrightarrow$ `[ ▶ CONTINUE ]`) that freezes all metrics, powerup timers, and music, resuming seamlessly without resetting.
- **Authentic Retro Audio Track**: Integrated with *"Retro Game"* by The_Mountain, seamless looping, pause/resume syncing, and procedural Web Audio SFX.
- **Persistent Leaderboard**: Real backend API with automatic score saving on Game Over (1 player = 1 best score upserting) and a clean 4-column display (Rank, Player Name, Score, Distance).

---

## 🕹️ Controls

| Action | Keyboard | Touch / Mobile |
| :--- | :--- | :--- |
| **Move Left** | `◀` / `A` | Swipe Left / Tap `◀` |
| **Move Right** | `▶` / `D` | Swipe Right / Tap `▶` |
| **Jump** | `▲` / `W` / `Space` | Swipe Up / Tap `▲ JUMP` |
| **Slide** | `▼` / `S` | Swipe Down / Tap `▼ SLIDE` |
| **Pause / Continue** | `ESC` / `P` / UI Button | Tap `[ ⏸ PAUSE ]` |

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/prameela9849/mushak-run-bappas-mission.git

# Navigate to project directory
cd mushak-run-bappas-mission

# Install dependencies
npm install
```

### 3. Run Locally
```bash
# Start backend server (Port 3001)
node server/server.js

# In a separate terminal, start Vite frontend dev server (Port 3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to play!

### 4. Production Build
```bash
npm run build
```

---

## 🛠️ Technology Stack

- **3D Graphics**: [Three.js](https://threejs.org/) (WebGL)
- **Frontend / Bundler**: Vanilla JavaScript (ES Modules), HTML5, CSS3, [Vite](https://vitejs.dev/)
- **Backend**: [Node.js](https://nodejs.org/), [Express](https://expressjs.com/) REST API
- **Audio**: HTML5 Audio & Web Audio API synthesis
- **Fonts**: Google Fonts (*Cinzel*, *Outfit*, *Yatra One*)

---

## 📜 License
MIT License. Created for Ganesh Chaturthi celebration. Music track *"Retro Game"* by The_Mountain under Pixabay Content License.
