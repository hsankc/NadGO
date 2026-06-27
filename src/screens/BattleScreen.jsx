import { useState } from 'react';
import { MONANIMALS, RARITY_COLORS } from '../config/monanimals';

export default function BattleScreen({ wallet, game }) {
  const [selectedMon, setSelectedMon] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResultText, setShowResultText] = useState(false);

  const collectionWithData = game.collection.map((c) => ({
    ...c,
    monData: MONANIMALS.find((m) => m.id === c.monAnimalId),
  }));

  const handleBattle = () => {
    if (!selectedMon) return;
    setIsAnimating(true);
    setShowResultText(false);

    // Calculate result immediately so we can animate the characters
    const result = game.doBattle(selectedMon.monAnimalId);
    setBattleResult({
      ...result,
      myMonData: MONANIMALS.find((m) => m.id === result.myMonAnimalId),
      myEquipment: selectedMon.equipment || [],
      oppMonData: MONANIMALS.find((m) => m.id === result.opponentMonAnimalId),
    });

    // Show result text after clash animation finishes
    setTimeout(() => {
      setIsAnimating(false);
      setShowResultText(true);
    }, 2500);
  };

  const resetBattle = () => {
    setSelectedMon(null);
    setBattleResult(null);
    setShowResultText(false);
    setIsAnimating(false);
  };

  return (
    <div style={{ paddingBottom: 100, height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div className="screen-header">
        <h1 className="screen-title">Battle Arena</h1>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          W:{game.playerStats.wins} / L:{game.playerStats.losses}
        </div>
      </div>

      {/* Battle result or Animating */}
      {battleResult && (
        <div className="battle-arena" style={{ position: 'relative' }}>
          {isAnimating && <div className="clash-explosion">💥</div>}

          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 14,
            color: 'var(--text-muted)',
            letterSpacing: 2,
            marginTop: 8,
            opacity: showResultText ? 1 : 0,
            transition: 'opacity 0.3s'
          }}>
            BATTLE RESULT
          </div>

          {/* My MonAnimal */}
          <div className={`glass-card battle-card ${isAnimating ? 'anim-fighter-left' : ''}`}>
            <img
              src={battleResult.myMonData.image}
              alt={battleResult.myMonData.name}
              className="battle-card-image"
              style={{
                opacity: isAnimating ? 1 : (battleResult.won ? 1 : 0.5),
                filter: isAnimating ? 'none' : (battleResult.won
                  ? `drop-shadow(0 0 20px ${RARITY_COLORS[battleResult.myMonData.rarity]})`
                  : 'grayscale(0.3)'),
                transition: 'all 0.5s'
              }}
            />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>
              {battleResult.myMonData.name} {battleResult.myEquipment.map(e => e.split(' ')[0]).join('')}
            </h3>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              fontWeight: 900,
              color: battleResult.won ? 'var(--success)' : 'var(--danger)',
              marginTop: 4,
              opacity: showResultText ? 1 : 0,
              transition: 'opacity 0.5s'
            }}>
              {battleResult.myScore}
            </div>
          </div>

          <div className={`battle-vs ${isAnimating ? 'anim-vs' : ''}`}>
            {isAnimating ? 'VS' : (battleResult.won ? '🏆' : '💀')}
          </div>

          {/* Opponent */}
          <div className={`glass-card battle-card ${isAnimating ? 'anim-fighter-right' : ''}`}>
            <img
              src={battleResult.oppMonData.image}
              alt={battleResult.oppMonData.name}
              className="battle-card-image"
              style={{
                opacity: isAnimating ? 1 : (battleResult.won ? 0.5 : 1),
                filter: isAnimating ? 'none' : (!battleResult.won
                  ? `drop-shadow(0 0 20px ${RARITY_COLORS[battleResult.oppMonData.rarity]})`
                  : 'grayscale(0.3)'),
                transition: 'all 0.5s'
              }}
            />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>
              {battleResult.oppMonData.name}
            </h3>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              fontWeight: 900,
              color: !battleResult.won ? 'var(--success)' : 'var(--danger)',
              marginTop: 4,
              opacity: showResultText ? 1 : 0,
              transition: 'opacity 0.5s'
            }}>
              {battleResult.opponentScore}
            </div>
          </div>

          {showResultText && (
            <>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 24,
                fontWeight: 800,
                color: battleResult.won ? 'var(--success)' : 'var(--danger)',
                marginTop: 8,
                textAlign: 'center',
                animation: 'fade-in 0.5s ease-out'
              }}>
                {battleResult.won ? 'VICTORY!' : 'DEFEAT'}
                <div style={{ fontSize: 14, marginTop: 4, color: battleResult.won ? 'var(--success)' : 'var(--danger)' }}>
                  {battleResult.won ? '+50 Score' : '-20 Score'}
                </div>
              </div>

              <button className="btn btn-primary btn-lg btn-full" onClick={resetBattle} style={{ maxWidth: 300, animation: 'fade-in 0.8s ease-out' }}>
                Battle Again ⚔️
              </button>
            </>
          )}
        </div>
      )}

      {/* Selection */}
      {!battleResult && !isAnimating && (
        <div style={{ padding: 16 }}>
          {collectionWithData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">⚔️</div>
              <div className="empty-state-title">No MonAnimals</div>
              <p className="empty-state-desc">
                Catch some MonAnimals first to start battling!
              </p>
            </div>
          ) : (
            <>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 14,
                color: 'var(--text-secondary)',
                marginBottom: 12,
                letterSpacing: 1,
              }}>
                Choose Your Fighter
              </h3>

              <div className="grid-2" style={{ marginBottom: 20 }}>
                {collectionWithData.map((item) => (
                  <div
                    key={item.id}
                    className={`mon-card rarity-${item.monData.rarity.toLowerCase()}`}
                    style={{
                      borderColor: selectedMon?.monAnimalId === item.monAnimalId
                        ? 'var(--monad-purple)'
                        : undefined,
                      boxShadow: selectedMon?.monAnimalId === item.monAnimalId
                        ? 'var(--glow-md)'
                        : undefined,
                    }}
                    onClick={() => setSelectedMon(item)}
                  >
                    {selectedMon?.monAnimalId === item.monAnimalId && (
                      <div style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 20,
                        height: 20,
                        background: 'var(--monad-purple)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                      }}>
                        ✓
                      </div>
                    )}
                    <img
                      src={item.monData.image}
                      alt={item.monData.name}
                      className="mon-card-image"
                    />
                    <div className="mon-card-name">{item.monData.name} {(item.equipment || []).map(e => e.split(' ')[0]).join('')}</div>
                    <div className="mon-card-stats">
                      <span className="mon-card-stat">⚡ {item.power}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-primary btn-lg btn-full"
                disabled={!selectedMon}
                onClick={handleBattle}
                style={{ opacity: selectedMon ? 1 : 0.5 }}
              >
                ⚔️ Find Opponent & Battle!
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
