import fs from 'fs';
import path from 'path';

let inMemoryLeaderboard = [
  {
    id: "run_init_001",
    playerId: "devotee_rahul_01",
    playerName: "Rahul Devotee",
    score: 8520,
    distance: 1240,
    collectiblesCount: 68,
    orderName: "Sacred Modaks",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 50, 100);
      inMemoryLeaderboard.sort((a, b) => (Number(b.score) - Number(a.score)) || (Number(b.distance) - Number(a.distance)));
      const ranked = inMemoryLeaderboard.slice(0, limit).map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
      return res.status(200).json({ success: true, count: ranked.length, data: ranked });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to retrieve leaderboard data' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { playerId, playerName, score, distance, collectiblesCount, orderName } = req.body || {};

      if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Player name is required.' });
      }

      const cleanedName = playerName.trim().slice(0, 25).replace(/[<>]/g, '');
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

      const existingIndex = inMemoryLeaderboard.findIndex(e =>
        (e.playerId && e.playerId === cleanedPlayerId) ||
        (e.playerName && e.playerName.toLowerCase().trim() === cleanedName.toLowerCase().trim())
      );

      let savedEntry = null;
      let isNewBest = false;

      if (existingIndex !== -1) {
        const existing = inMemoryLeaderboard[existingIndex];
        if (numScore > existing.score) {
          existing.score = numScore;
          existing.distance = numDist;
          existing.collectiblesCount = numCollectibles;
          existing.orderName = orderName || existing.orderName;
          existing.playerName = cleanedName;
          existing.updatedAt = new Date().toISOString();
          savedEntry = existing;
          isNewBest = true;
        } else {
          savedEntry = existing;
          isNewBest = false;
        }
      } else {
        const newRecord = {
          id: 'run_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          playerId: cleanedPlayerId,
          playerName: cleanedName,
          score: numScore,
          distance: numDist,
          collectiblesCount: numCollectibles,
          orderName: orderName || 'Sacred Modaks',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        inMemoryLeaderboard.push(newRecord);
        savedEntry = newRecord;
        isNewBest = true;
      }

      inMemoryLeaderboard.sort((a, b) => (Number(b.score) - Number(a.score)) || (Number(b.distance) - Number(a.distance)));

      return res.status(200).json({
        success: true,
        message: isNewBest ? '✨ New best score recorded!' : 'Score preserved (Best score maintained).',
        entry: savedEntry,
        isNewBest
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to record run score' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
