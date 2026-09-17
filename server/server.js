import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data', 'leaderboard.json');

// Ensure data directory and file exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

app.use(cors());
app.use(express.json({ limit: '100kb' }));

// Helper to read leaderboard safely and consolidate any duplicates (1 player = 1 best score)
function readLeaderboard() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Consolidate duplicates: keep only highest best score per unique player
    const playerMap = new Map();
    for (const entry of parsed) {
      if (!entry || !entry.playerName) continue;
      const key = (entry.playerId || entry.playerName).toLowerCase().trim();
      const score = Number(entry.score) || 0;
      const dist = Number(entry.distance) || 0;

      if (!playerMap.has(key)) {
        playerMap.set(key, { ...entry, score, distance: dist });
      } else {
        const existing = playerMap.get(key);
        if (score > existing.score || (score === existing.score && dist > existing.distance)) {
          playerMap.set(key, { ...existing, ...entry, score, distance: dist });
        }
      }
    }

    const consolidated = Array.from(playerMap.values());
    consolidated.sort((a, b) => (Number(b.score) - Number(a.score)) || (Number(b.distance) - Number(a.distance)));
    return consolidated;
  } catch (err) {
    console.error('Error reading leaderboard file:', err);
    return [];
  }
}

// Helper to write leaderboard safely
function writeLeaderboard(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing leaderboard file:', err);
    return false;
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), game: "Mushak Run: Bappa's Mission" });
});

// GET /api/leaderboard - Returns real submitted scores sorted by score DESC (one best score per player)
app.get('/api/leaderboard', (req, res) => {
  try {
    const list = readLeaderboard();
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const ranked = list.slice(0, limit).map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
    res.json({ success: true, count: ranked.length, data: ranked });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve leaderboard data' });
  }
});

// POST /api/leaderboard - Upsert real run: One player appears ONLY ONCE with their BEST SCORE
app.post('/api/leaderboard', (req, res) => {
  try {
    const { playerId, playerName, score, distance, collectiblesCount, orderName } = req.body;

    // Validation
    if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Player name is required.' });
    }

    const cleanedName = playerName.trim().slice(0, 25).replace(/[<>]/g, ''); // sanitize HTML
    const cleanedPlayerId = (typeof playerId === 'string' && playerId.trim().length > 0) 
      ? playerId.trim().slice(0, 60)
      : 'player_' + cleanedName.toLowerCase().replace(/\s+/g, '_');

    const numScore = Math.floor(Number(score));
    const numDist = Math.floor(Number(distance));
    const numCollectibles = Math.floor(Number(collectiblesCount)) || 0;

    if (isNaN(numScore) || numScore < 0) {
      return res.status(400).json({ success: false, error: 'Invalid score value.' });
    }
    if (isNaN(numDist) || numDist < 0) {
      return res.status(400).json({ success: false, error: 'Invalid distance value.' });
    }

    const list = readLeaderboard();

    // Check if player already has a record (by playerId or exact playerName match)
    const existingIndex = list.findIndex(e => 
      (e.playerId && e.playerId === cleanedPlayerId) || 
      (e.playerName && e.playerName.toLowerCase() === cleanedName.toLowerCase())
    );

    let savedEntry = null;
    let isNewBest = false;

    if (existingIndex !== -1) {
      const existing = list[existingIndex];
      // If current score is higher (or equal score with greater distance), update to new best!
      if (numScore > Number(existing.score) || (numScore === Number(existing.score) && numDist > Number(existing.distance))) {
        existing.score = numScore;
        existing.distance = numDist;
        existing.collectiblesCount = numCollectibles;
        existing.playerName = cleanedName;
        existing.playerId = cleanedPlayerId;
        existing.orderName = typeof orderName === 'string' ? orderName.trim().slice(0, 50) : existing.orderName;
        existing.updatedAt = new Date().toISOString();
        isNewBest = true;
      } else {
        // Keep existing best score, but ensure playerId is synchronized
        if (!existing.playerId) existing.playerId = cleanedPlayerId;
        isNewBest = false;
      }
      savedEntry = existing;
    } else {
      // Create new unique player record
      savedEntry = {
        id: 'run_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        playerId: cleanedPlayerId,
        playerName: cleanedName,
        score: numScore,
        distance: numDist,
        collectiblesCount: numCollectibles,
        orderName: typeof orderName === 'string' ? orderName.trim().slice(0, 50) : 'Sacred Modaks',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      list.push(savedEntry);
      isNewBest = true;
    }

    // Keep sorted strictly descending by numeric score, then distance
    list.sort((a, b) => (Number(b.score) - Number(a.score)) || (Number(b.distance) - Number(a.distance)));
    const trimmed = list.slice(0, 200);

    const saved = writeLeaderboard(trimmed);
    if (!saved) {
      return res.status(500).json({ success: false, error: 'Failed to save score to database.' });
    }

    // Determine rank of the player
    const rank = trimmed.findIndex(e => 
      (e.playerId && e.playerId === cleanedPlayerId) || 
      (e.playerName && e.playerName.toLowerCase() === cleanedName.toLowerCase())
    ) + 1;

    res.status(200).json({
      success: true,
      message: isNewBest ? '✨ New personal best score saved!' : 'Score recorded (Personal best preserved)!',
      entry: { ...savedEntry, rank },
      isNewBest
    });
  } catch (err) {
    console.error('Error in score submission:', err);
    res.status(500).json({ success: false, error: 'Internal server error while saving score.' });
  }
});

// Serve static frontend in production if dist exists
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🌸 Bappa's Mission Server running on port ${PORT}`);
});
