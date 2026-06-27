import { useState } from 'react';
import { MONANIMALS, RARITY_COLORS } from '../config/monanimals';

export default function LibraryScreen({ wallet, game }) {
  const [selectedMon, setSelectedMon] = useState(null);
  const [filter, setFilter] = useState('all');

  const collectionWithData = game.collection.map((c) => ({
    ...c,
    monData: MONANIMALS.find((m) => m.id === c.monAnimalId),
  }));

  const filtered = filter === 'all'
    ? collectionWithData
    : collectionWithData.filter((c) => c.monData.rarity === filter);

  const rarityClass = (rarity) => rarity.toLowerCase();

  return (
    <div>
      {/* Header */}
      <div className="screen-header">
        <h1 className="screen-title">Library</h1>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {game.collection.length} / {MONANIMALS.length}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="tabs">
        {['all', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'].map((f) => (
          <button
            key={f}
            className={`tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {/* Collection grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗺️</div>
          <div className="empty-state-title">No MonAnimals Yet</div>
          <p className="empty-state-desc">
            Go explore the map to find and catch MonAnimals!
          </p>
        </div>
      ) : (
        <div className="grid-2" style={{ padding: '0 16px 16px' }}>
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`mon-card rarity-${rarityClass(item.monData.rarity)}`}
              onClick={() => setSelectedMon(item)}
            >
              <img
                src={item.monData.image}
                alt={item.monData.name}
                className="mon-card-image"
              />
              <div className="mon-card-name">{item.monData.name}</div>
              <div className={`rarity-badge ${rarityClass(item.monData.rarity)}`}>
                {item.monData.rarity}
              </div>
              <div className="mon-card-stats">
                <span className="mon-card-stat">⚡ {item.power}</span>
                <span className="mon-card-stat">×{item.catchCount}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All MonAnimals (uncaught shown as silhouettes) */}
      <div style={{ padding: '0 16px 16px' }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 14,
          color: 'var(--text-secondary)',
          marginBottom: 12,
          letterSpacing: 1,
        }}>
          MonAnimal Index
        </h3>
        <div className="grid-3">
          {MONANIMALS.map((mon) => {
            const caught = game.collection.find((c) => c.monAnimalId === mon.id);
            return (
              <div
                key={mon.id}
                className="glass-card"
                style={{
                  textAlign: 'center',
                  padding: 12,
                  opacity: caught ? 1 : 0.4,
                  cursor: caught ? 'pointer' : 'default',
                }}
                onClick={() => caught && setSelectedMon({ ...caught, monData: mon })}
              >
                <img
                  src={mon.image}
                  alt={mon.name}
                  style={{
                    width: 48,
                    height: 48,
                    objectFit: 'contain',
                    margin: '0 auto 6px',
                    filter: caught ? 'none' : 'brightness(0) saturate(0)',
                  }}
                />
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: 'var(--font-display)',
                }}>
                  {caught ? mon.name : '???'} {caught && (caught.equipment || []).map(e => e.split(' ')[0]).join('')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedMon && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-overlay)',
            backdropFilter: 'blur(20px)',
            padding: 24,
            animation: 'fade-in 0.3s ease',
          }}
          onClick={() => setSelectedMon(null)}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: 380,
              width: '100%',
              padding: 24,
              textAlign: 'center',
              animation: 'slide-up 0.4s var(--ease-spring)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedMon.monData.image}
              alt={selectedMon.monData.name}
              style={{
                width: 150,
                height: 150,
                objectFit: 'contain',
                margin: '0 auto 16px',
                animation: 'monster-float 3s ease-in-out infinite',
                filter: `drop-shadow(0 8px 32px ${RARITY_COLORS[selectedMon.monData.rarity]}66)`,
              }}
            />

            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 24,
              fontWeight: 800,
              marginBottom: 4,
            }}>
              {selectedMon.monData.name} {(selectedMon.equipment || []).map(e => e.split(' ')[0]).join('')}
            </h2>

            <div className={`rarity-badge ${rarityClass(selectedMon.monData.rarity)}`}
              style={{ marginBottom: 16 }}>
              {selectedMon.monData.type} • {selectedMon.monData.rarity}
            </div>

            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              marginBottom: 16,
            }}>
              {[
                { label: 'Power', value: selectedMon.power, icon: '⚡' },
                { label: 'HP', value: selectedMon.hp, icon: '❤️' },
                { label: 'Speed', value: selectedMon.speed || selectedMon.monData.baseSpeed, icon: '💨' },
              ].map((stat) => (
                <div key={stat.label} style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 10,
                }}>
                  <div style={{ fontSize: 16 }}>{stat.icon}</div>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'var(--monad-purple-light)',
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Extra info */}
            <div style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              display: 'flex',
              justifyContent: 'space-around',
              marginBottom: 16,
              padding: '8px 0',
              borderTop: '1px solid var(--glass-border)',
              borderBottom: '1px solid var(--glass-border)',
            }}>
              <span>Caught ×{selectedMon.catchCount}</span>
              <span>Zone: {selectedMon.zone}</span>
            </div>

            {/* Lore */}
            <p style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: 20,
              fontStyle: 'italic',
            }}>
              "{selectedMon.monData.lore}"
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-secondary btn-full"
                onClick={() => {
                  const boost = game.feedMonAnimal(selectedMon.monAnimalId);
                  setSelectedMon((prev) => ({
                    ...prev,
                    power: prev.power + boost,
                  }));
                }}
              >
                🍖 Feed (+Power)
              </button>
              <button className="btn btn-primary btn-full" onClick={() => setSelectedMon(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
