import { useState, useEffect } from 'react';
import { useWallet } from './hooks/useWallet';
import { useGeolocation } from './hooks/useGeolocation';
import { useGameState } from './hooks/useGameState';
import MapScreen from './screens/MapScreen';
import CatchScreen from './screens/CatchScreen';
import LibraryScreen from './screens/LibraryScreen';
import BattleScreen from './screens/BattleScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import ScannerScreen from './screens/ScannerScreen';

const SCREENS = {
  MAP: 'map',
  LIBRARY: 'library',
  BATTLE: 'battle',
  LEADERBOARD: 'leaderboard',
};

function BottomNav({ activeScreen, onNavigate }) {
  const items = [
    { id: SCREENS.MAP, icon: '🗺️', label: 'Explore' },
    { id: SCREENS.LIBRARY, icon: '📚', label: 'Library' },
    { id: SCREENS.BATTLE, icon: '⚔️', label: 'Battle' },
    { id: SCREENS.LEADERBOARD, icon: '🏆', label: 'Ranks' },
  ];

  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${activeScreen === item.id ? 'active' : ''}`}
          onClick={() => onNavigate(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState(SCREENS.MAP);
  const [theme, setTheme] = useState('dark');
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('nadgo-onboarded');
  });
  const [catchingSpawn, setCatchingSpawn] = useState(null);

  const [isScanning, setIsScanning] = useState(false);

  const wallet = useWallet();
  const geo = useGeolocation();
  const game = useGameState();

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('nadgo-onboarded', 'true');
    setShowOnboarding(false);
  };

  const handleCatchStart = (spawn) => {
    setCatchingSpawn(spawn);
  };

  const handleCatchEnd = () => {
    setCatchingSpawn(null);
  };

  const handleScanStart = () => {
    setIsScanning(true);
  };

  const handleScanEnd = () => {
    setIsScanning(false);
  };

  // Show onboarding
  if (showOnboarding) {
    return (
      <OnboardingScreen
        wallet={wallet}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // Show catch screen
  if (catchingSpawn) {
    return (
      <CatchScreen
        spawn={catchingSpawn}
        game={game}
        wallet={wallet}
        onClose={handleCatchEnd}
      />
    );
  }

  // Show scanner screen
  if (isScanning) {
    return (
      <ScannerScreen
        wallet={wallet}
        game={game}
        onClose={handleScanEnd}
      />
    );
  }

  return (
    <div className="app-container">
      <div className="screen-container">
        {activeScreen === SCREENS.MAP && (
          <MapScreen
            theme={theme}
            wallet={wallet}
            geo={geo}
            game={game}
            onCatchStart={handleCatchStart}
            onScanStart={handleScanStart}
          />
        )}
        {activeScreen === SCREENS.LIBRARY && (
          <LibraryScreen
            wallet={wallet}
            game={game}
          />
        )}
        {activeScreen === SCREENS.BATTLE && (
          <BattleScreen
            wallet={wallet}
            game={game}
          />
        )}
        {activeScreen === SCREENS.LEADERBOARD && (
          <LeaderboardScreen
            wallet={wallet}
            game={game}
          />
        )}
      </div>
      <BottomNav activeScreen={activeScreen} onNavigate={setActiveScreen} />

      {/* Theme Toggle Floating Button */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 400,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'var(--bg-card)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--glow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
        }}
      >
        {theme === 'dark' ? '🌞' : '🌙'}
      </button>
    </div>
  );
}
