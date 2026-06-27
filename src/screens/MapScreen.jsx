import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MONANIMALS } from '../config/monanimals';
import { HACKATHON_CENTER, SPAWN_CONFIG } from '../config/monad';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;

// Custom MonAnimal marker icon
function createMonIcon(mon) {
  return L.divIcon({
    className: 'mon-map-marker',
    html: `<div style="
      width: 44px; height: 44px;
      background: radial-gradient(circle, rgba(131,110,249,0.3) 0%, transparent 70%);
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%;
      animation: pulse-ring 2s ease-out infinite;
    ">
      <img src="${mon.image}" style="width: 32px; height: 32px; object-fit: contain; filter: drop-shadow(0 2px 8px rgba(131,110,249,0.5));" />
    </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

// Player marker
const playerIcon = L.divIcon({
  className: 'player-marker',
  html: `<div style="
    width: 20px; height: 20px;
    background: var(--monad-purple, #836EF9);
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 0 20px rgba(131,110,249,0.6), 0 0 40px rgba(131,110,249,0.3);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Auto-pan to player
function AutoCenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], map.getZoom(), { animate: true });
    }
  }, [position, map]);
  return null;
}

export default function MapScreen({ theme, wallet, geo, game, onCatchStart }) {
  const mapCenter = geo.position || { lat: HACKATHON_CENTER.lat, lng: HACKATHON_CENTER.lng };
  const firstLoad = useRef(true);

  // Set map tile URL based on theme
  const tileUrl = theme === 'light' 
    ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  // Resolve MonAnimal data for each spawn
  const spawnMarkers = useMemo(() =>
    game.spawns
      .filter((s) => !s.caught)
      .map((spawn) => ({
        ...spawn,
        monData: MONANIMALS.find((m) => m.id === spawn.monAnimal.id),
      })),
    [game.spawns]
  );

  const handleCatchClick = (spawn) => {
    if (!geo.position) {
      alert("Konum bilgin alınamıyor.");
      return;
    }
    const distance = geo.getDistance(geo.position.lat, geo.position.lng, spawn.position.lat, spawn.position.lng);
    if (distance > 30) { // Catch radius increased to 30 meters
      alert(`Çok uzaksın! MonAnimal senden ${Math.round(distance)} metre uzakta. Yaklaşmalısın!`);
      return;
    }
    onCatchStart(spawn);
  };

  return (
    <div className="map-container">
      {/* Map overlay UI */}
      <div className="map-overlay">
        <div className="map-stats-pill">
          <span>🎯</span>
          <span>{game.playerStats.totalCatches} caught</span>
        </div>

        {wallet.deepLink && !wallet.isConnected ? (
          <a
            href={wallet.deepLink}
            className="wallet-btn"
            style={{ textDecoration: 'none' }}
          >
            <span className="wallet-dot" />
            <span>Open App</span>
          </a>
        ) : (
          <button
            className={`wallet-btn ${wallet.isConnected ? 'connected' : ''}`}
            onClick={wallet.isConnected ? wallet.disconnect : wallet.connect}
            title={wallet.isConnected ? "Click to disconnect" : "Connect Wallet"}
          >
            <span className="wallet-dot" />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span>{wallet.isConnected ? wallet.shortAddress : 'Connect'}</span>
              {wallet.isConnected && (
                <span style={{ fontSize: 10, color: 'var(--monad-glow)' }}>{wallet.balance} MON</span>
              )}
            </div>
          </button>
        )}
      </div>

      {wallet.error && (
        <div style={{
          position: 'absolute',
          top: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          background: 'rgba(220, 38, 38, 0.9)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          {wallet.error}
        </div>
      )}

      {/* Nearby MonAnimals counter */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 20px',
        background: 'rgba(13, 6, 32, 0.9)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(131, 110, 249, 0.3)',
        borderRadius: 'var(--radius-full)',
        fontSize: 13,
        fontWeight: 600,
      }}>
        <span style={{ animation: 'pulse-ring 2s ease-out infinite', width: 8, height: 8, background: '#34D399', borderRadius: '50%', display: 'inline-block' }} />
        {spawnMarkers.length} MonAnimals nearby
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={18}
        maxZoom={22}
        zoomControl={false}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          url={tileUrl}
          maxNativeZoom={19}
          maxZoom={22}
        />

        {/* Auto center on first load */}
        {firstLoad.current && geo.position && <AutoCenter position={geo.position} />}

        {/* Player marker */}
        {geo.position && (
          <Marker position={[geo.position.lat, geo.position.lng]} icon={playerIcon}>
            <Popup>
              <div style={{ textAlign: 'center', fontFamily: 'Inter', color: '#333' }}>
                <strong>You are here</strong><br />
                <small>Score: {game.playerStats.score}</small>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Catch radius */}
        {geo.position && (
          <Circle
            center={[geo.position.lat, geo.position.lng]}
            radius={SPAWN_CONFIG.catchRadius}
            pathOptions={{
              color: '#836EF9',
              fillColor: '#836EF9',
              fillOpacity: 0.05,
              weight: 1,
              dashArray: '8 4',
            }}
          />
        )}

        {/* MonAnimal spawn markers */}
        {spawnMarkers.map((spawn) => (
          <Marker
            key={spawn.id}
            position={[spawn.position.lat, spawn.position.lng]}
            icon={createMonIcon(spawn.monData)}
            eventHandlers={{
              click: () => handleCatchClick(spawn),
            }}
          >
            <Popup>
              <div style={{ textAlign: 'center', fontFamily: 'Inter', color: '#333', padding: 4 }}>
                <strong>{spawn.monData.name}</strong><br />
                <span style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: spawn.monData.rarity === 'Legendary' ? '#FBBF24' :
                    spawn.monData.rarity === 'Epic' ? '#A78BFA' :
                    spawn.monData.rarity === 'Rare' ? '#60A5FA' :
                    spawn.monData.rarity === 'Uncommon' ? '#34D399' : '#9CA3AF',
                  color: '#fff',
                  fontWeight: 600,
                }}>{spawn.monData.rarity}</span>
                <br /><br />
                <button
                  onClick={() => handleCatchClick(spawn)}
                  style={{
                    padding: '6px 16px',
                    background: '#836EF9',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  🎯 Catch!
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Hackathon venue marker */}
        <Circle
          center={[HACKATHON_CENTER.lat, HACKATHON_CENTER.lng]}
          radius={200}
          pathOptions={{
            color: '#A78BFA',
            fillColor: '#A78BFA',
            fillOpacity: 0.08,
            weight: 2,
          }}
        />
      </MapContainer>
    </div>
  );
}
