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
import ProfileScreen from './screens/ProfileScreen';
import PermissionsScreen from './screens/PermissionsScreen';

const SCREENS = {
  MAP: 'map',
  LIBRARY: 'library',
  BATTLE: 'battle',
  LEADERBOARD: 'leaderboard',
  PROFILE: 'profile',
};

function BottomNav({ activeScreen, onNavigate }) {
  const items = [
    { id: SCREENS.MAP, icon: '🗺️', label: 'Explore' },
    { id: SCREENS.LIBRARY, icon: '📚', label: 'Library' },
    { id: SCREENS.BATTLE, icon: '⚔️', label: 'Battle' },
    { id: SCREENS.LEADERBOARD, icon: '🏆', label: 'Ranks' },
    { id: SCREENS.PROFILE, icon: '👤', label: 'Profile' },
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
  const [showPermissions, setShowPermissions] = useState(() => {
    return !localStorage.getItem('nadgo-permissions-granted');
  });
  const [catchingSpawn, setCatchingSpawn] = useState(null);

  const [isScanning, setIsScanning] = useState(false);

  const wallet = useWallet();
  const geo = useGeolocation();
  const game = useGameState(wallet.address);

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

  const handlePermissionsComplete = () => {
    localStorage.setItem('nadgo-permissions-granted', 'true');
    setShowPermissions(false);
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

  // Show permissions step
  if (showPermissions) {
    return <PermissionsScreen onComplete={handlePermissionsComplete} />;
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
            toggleTheme={toggleTheme}
            wallet={wallet}
            geo={geo}
            game={game}
            onCatchStart={handleCatchStart}
            onScanStart={handleScanStart}
          />
        )}
        {activeScreen === SCREENS.LIBRARY && (
          <LibraryScreen
            theme={theme}
            toggleTheme={toggleTheme}
            wallet={wallet}
            game={game}
          />
        )}
        {activeScreen === SCREENS.BATTLE && (
          <BattleScreen
            theme={theme}
            toggleTheme={toggleTheme}
            wallet={wallet}
            game={game}
          />
        )}
        {activeScreen === SCREENS.LEADERBOARD && (
          <LeaderboardScreen
            theme={theme}
            toggleTheme={toggleTheme}
            wallet={wallet}
            game={game}
          />
        )}
        {activeScreen === SCREENS.PROFILE && (
          <ProfileScreen
            theme={theme}
            toggleTheme={toggleTheme}
            wallet={wallet}
            game={game}
          />
        )}
      </div>
      <BottomNav activeScreen={activeScreen} onNavigate={setActiveScreen} />
    </div>
  );
}
