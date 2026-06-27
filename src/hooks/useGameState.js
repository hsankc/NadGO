import { useState, useCallback, useEffect } from 'react';
import { MONANIMALS, getRandomMonAnimal, RARITY_MULTIPLIER } from '../config/monanimals';
import { HACKATHON_CENTER, SPAWN_CONFIG } from '../config/monad';

// Generate a random spawn point near a center
function randomSpawn(center, radiusMeters) {
  const radiusDeg = radiusMeters / 111320;
  const angle = Math.random() * 2 * Math.PI;
  const dist = Math.random() * radiusDeg;
  return {
    lat: center.lat + dist * Math.cos(angle),
    lng: center.lng + dist * Math.sin(angle) / Math.cos((center.lat * Math.PI) / 180),
  };
}

// Generate initial spawns
function generateSpawns(center, count) {
  const spawns = [];
  
  // Presentation Mode: Spawn 1 of every single MonAnimal nearby
  for (let i = 0; i < MONANIMALS.length; i++) {
    const mon = MONANIMALS[i];
    // Scatter around ~5-15 meters (0.00005 to 0.00015 degrees)
    const signLat = Math.random() > 0.5 ? 1 : -1;
    const signLng = Math.random() > 0.5 ? 1 : -1;
    
    const pos = {
      lat: center.lat + signLat * (0.00005 + Math.random() * 0.00010),
      lng: center.lng + signLng * (0.00005 + Math.random() * 0.00010),
    };
    spawns.push({
      id: `spawn-pres-${Date.now()}-${i}`,
      monAnimal: mon,
      position: pos,
      spawnedAt: Date.now(),
      caught: false,
    });
  }

  // Generate the rest randomly in the 2km radius
  for (let i = MONANIMALS.length; i < count; i++) {
    const mon = getRandomMonAnimal();
    const pos = randomSpawn(center, HACKATHON_CENTER.radius);
    spawns.push({
      id: `spawn-${Date.now()}-${i}`,
      monAnimal: mon,
      position: pos,
      spawnedAt: Date.now(),
      caught: false,
    });
  }
  return spawns;
}

export function useGameState() {
  // Collection of caught MonAnimals
  const [collection, setCollection] = useState(() => {
    try {
      const saved = localStorage.getItem('nadgo-collection');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Active map spawns
  const [spawns, setSpawns] = useState(() =>
    generateSpawns(HACKATHON_CENTER, SPAWN_CONFIG.maxSpawns)
  );

  // Battle history
  const [battleHistory, setBattleHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('nadgo-battles');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Player stats
  const [playerStats, setPlayerStats] = useState(() => {
    try {
      const saved = localStorage.getItem('nadgo-stats');
      return saved ? JSON.parse(saved) : {
        totalCatches: 0,
        totalBattles: 0,
        wins: 0,
        losses: 0,
        zonesVisited: [],
        score: 0,
      };
    } catch {
      return { totalCatches: 0, totalBattles: 0, wins: 0, losses: 0, zonesVisited: [], score: 0 };
    }
  });

  // Activity feed
  const [activityFeed, setActivityFeed] = useState([]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('nadgo-collection', JSON.stringify(collection));
  }, [collection]);

  useEffect(() => {
    localStorage.setItem('nadgo-battles', JSON.stringify(battleHistory));
  }, [battleHistory]);

  useEffect(() => {
    localStorage.setItem('nadgo-stats', JSON.stringify(playerStats));
  }, [playerStats]);

  // Respawn timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSpawns((prev) => {
        const active = prev.filter((s) => !s.caught);
        if (active.length < SPAWN_CONFIG.maxSpawns) {
          const newSpawns = generateSpawns(
            HACKATHON_CENTER,
            SPAWN_CONFIG.maxSpawns - active.length
          );
          return [...active, ...newSpawns];
        }
        return prev;
      });
    }, SPAWN_CONFIG.respawnIntervalMs);

    return () => clearInterval(interval);
  }, []);

  // Catch a MonAnimal
  const catchMonAnimal = useCallback((spawnId, forceSuccess = false) => {
    const spawn = spawns.find((s) => s.id === spawnId);
    if (!spawn || spawn.caught) return null;

    const mon = spawn.monAnimal;
    const catchRoll = Math.random();
    const success = forceSuccess || catchRoll <= mon.catchRate;

    if (success) {
      // Mark spawn as caught
      setSpawns((prev) =>
        prev.map((s) => (s.id === spawnId ? { ...s, caught: true } : s))
      );

      // Check if already in collection (duplicate = power up)
      setCollection((prev) => {
        const existing = prev.find((c) => c.monAnimalId === mon.id);
        if (existing) {
          // Power up!
          const powerBoost = 5 + Math.floor(Math.random() * 10);
          return prev.map((c) =>
            c.monAnimalId === mon.id
              ? {
                  ...c,
                  power: c.power + powerBoost,
                  catchCount: c.catchCount + 1,
                  lastCaughtAt: Date.now(),
                }
              : c
          );
        } else {
          // New catch!
          return [
            ...prev,
            {
              id: `catch-${Date.now()}`,
              monAnimalId: mon.id,
              power: mon.basePower + Math.floor(Math.random() * 20),
              hp: mon.baseHp,
              speed: mon.baseSpeed,
              catchCount: 1,
              caughtAt: Date.now(),
              lastCaughtAt: Date.now(),
              zone: 'Ankara',
            },
          ];
        }
      });

      // Update stats
      setPlayerStats((prev) => ({
        ...prev,
        totalCatches: prev.totalCatches + 1,
        score: prev.score + 10 * RARITY_MULTIPLIER[mon.rarity],
      }));

      // Add to feed
      addActivity(`Caught a ${mon.rarity} ${mon.name}! 🎉`);

      return { success: true, monAnimal: mon, isNew: !collection.find((c) => c.monAnimalId === mon.id) };
    }

    return { success: false, monAnimal: mon };
  }, [spawns, collection]);

  // Feed a MonAnimal (hackathon mechanic)
  const feedMonAnimal = useCallback((monAnimalId) => {
    const powerBoost = 1 + Math.floor(Math.random() * 10);
    setCollection((prev) =>
      prev.map((c) =>
        c.monAnimalId === monAnimalId
          ? { ...c, power: c.power + powerBoost }
          : c
      )
    );

    const mon = MONANIMALS.find((m) => m.id === monAnimalId);
    addActivity(`Fed ${mon?.name} +${powerBoost} power! 🍖`);
    return powerBoost;
  }, []);

  // Battle
  const doBattle = useCallback((myMonId, opponentCollection) => {
    const myMon = collection.find((c) => c.monAnimalId === myMonId);
    if (!myMon) return null;

    const monData = MONANIMALS.find((m) => m.id === myMonId);
    const rarityMultiplier = RARITY_MULTIPLIER[monData.rarity];

    // Generate opponent
    const opponent = opponentCollection || (() => {
      const oppMon = getRandomMonAnimal();
      return {
        monAnimalId: oppMon.id,
        power: oppMon.basePower + Math.floor(Math.random() * 30),
        catchCount: 1 + Math.floor(Math.random() * 5),
      };
    })();

    const oppMonData = MONANIMALS.find((m) => m.id === opponent.monAnimalId);
    const oppRarityMultiplier = RARITY_MULTIPLIER[oppMonData.rarity];

    // Battle score: power*2 + rarity*10 + random(0-20)
    const myScore = myMon.power * 2 + rarityMultiplier * 10 + Math.floor(Math.random() * 20);
    const oppScore = opponent.power * 2 + oppRarityMultiplier * 10 + Math.floor(Math.random() * 20);

    const won = myScore > oppScore;

    const result = {
      id: `battle-${Date.now()}`,
      myMonAnimalId: myMonId,
      myScore,
      opponentMonAnimalId: opponent.monAnimalId,
      opponentScore: oppScore,
      won,
      timestamp: Date.now(),
    };

    setBattleHistory((prev) => [result, ...prev]);
    setPlayerStats((prev) => ({
      ...prev,
      totalBattles: prev.totalBattles + 1,
      wins: prev.wins + (won ? 1 : 0),
      losses: prev.losses + (won ? 0 : 1),
      score: prev.score + (won ? 25 : 5),
    }));

    addActivity(
      won
        ? `Won a battle! ${monData.name} vs ${oppMonData.name} ⚔️`
        : `Lost a battle. ${monData.name} vs ${oppMonData.name} 💀`
    );

    return result;
  }, [collection]);

  // Activity feed
  const addActivity = useCallback((message) => {
    setActivityFeed((prev) => [
      { id: `act-${Date.now()}`, message, timestamp: Date.now() },
      ...prev.slice(0, 49),
    ]);
  }, []);

  // Leaderboard data (simulated + player)
  const getLeaderboard = useCallback(() => {
    const fakeUsers = [
      { name: '0xMon...Chad', score: 420, catches: 15, avatar: '🟣' },
      { name: '0xNad...King', score: 380, catches: 12, avatar: '👑' },
      { name: '0xDev...Blitz', score: 310, catches: 10, avatar: '⚡' },
      { name: '0xChog...Fan', score: 250, catches: 8, avatar: '🦔' },
      { name: '0xAnk...Dev', score: 180, catches: 6, avatar: '🚀' },
    ];

    const playerEntry = {
      name: 'You',
      score: playerStats.score,
      catches: playerStats.totalCatches,
      avatar: '🎮',
      isPlayer: true,
    };

    const all = [...fakeUsers, playerEntry].sort((a, b) => b.score - a.score);
    return all;
  }, [playerStats]);

  return {
    collection,
    spawns,
    battleHistory,
    playerStats,
    activityFeed,
    catchMonAnimal,
    feedMonAnimal,
    doBattle,
    getLeaderboard,
    addActivity,
  };
}
