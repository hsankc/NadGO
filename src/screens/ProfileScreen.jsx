import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { ethers } from 'ethers';
import { MONANIMALS } from '../config/monanimals';
import { QRCodeSVG } from 'qrcode.react';

const TREASURY_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
const APP_URL = "https://monadgo.vercel.app";

export default function ProfileScreen({ wallet, game }) {
  const [isScanning, setIsScanning] = useState(false);
  const [claimedPower, setClaimedPower] = useState(() => localStorage.getItem('nadgo-claimed-power') === 'true');
  const [claimedMon, setClaimedMon] = useState(() => localStorage.getItem('nadgo-claimed-mon') === 'true');
  const [selectedStoreMon, setSelectedStoreMon] = useState('');
  const [showQR, setShowQR] = useState(false);

  const { playerStats, badges, addBadge, claimBadgePower, claimBadgeMon } = game;

  const handleBuyItem = async (type, cost, power) => {
    if (!selectedStoreMon) {
      alert("Please select a MonAnimal first!");
      return;
    }
    if (!wallet.isConnected || !wallet.signer) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      const tx = await wallet.signer.sendTransaction({
        to: TREASURY_ADDRESS,
        value: ethers.parseEther(cost.toString())
      });
      await tx.wait();
      wallet.fetchBalance();

      if (type === 'Power Boost') {
        game.buyPower(selectedStoreMon, power, cost);
      } else {
        game.buyEquipment(selectedStoreMon, type, cost, power);
      }
      alert(`Successfully purchased ${type}!`);
    } catch (e) {
      console.error(e);
      alert("Transaction failed or cancelled");
    }
  };

  const handleScanClick = () => {
    setIsScanning(!isScanning);
  };

  const handleScanResult = (result) => {
    if (!result || !result[0]) return;
    const value = result[0].rawValue;
    
    if (value === "nadgo://badge/ankara-hackathon-26") {
      setIsScanning(false);
      if (!badges.includes('Ankara Hackathon \'26')) {
        addBadge('Ankara Hackathon \'26');
        alert("🎉 Successfully scanned! You earned the 'Ankara Hackathon \\'26' badge!");
      } else {
        alert("You already have this badge!");
      }
    }
  };

  const handleClaimPower = () => {
    if (claimedPower) return;
    claimBadgePower();
    setClaimedPower(true);
    localStorage.setItem('nadgo-claimed-power', 'true');
    alert("⚡ All your MonAnimals received +20 Power!");
  };

  const handleClaimMon = () => {
    if (claimedMon) return;
    claimBadgeMon();
    setClaimedMon(true);
    localStorage.setItem('nadgo-claimed-mon', 'true');
    alert("💧 10 Testnet MON has been simulated and added to your activity feed!");
  };

  return (
    <div style={{ padding: 20, paddingTop: 60, paddingBottom: 100, overflowY: 'auto', height: '100%' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 8, color: 'var(--monad-glow)' }}>
        Profile
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
        Manage your stats and event badges.
      </p>

      {/* Wallet Info */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 24,
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 16
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, var(--monad-purple), var(--monad-glow))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32
        }}>
          🎮
        </div>
        <div>
          <h2 style={{ fontSize: 20, margin: 0, color: 'var(--text-primary)' }}>
            {wallet.isConnected ? wallet.shortAddress : 'Guest Player'}
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: 14 }}>
            {wallet.isConnected ? `${wallet.balance} MON` : 'Connect wallet to play'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <h3 style={{ fontSize: 18, marginBottom: 16, color: 'var(--text-secondary)' }}>Player Stats</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
        <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--monad-glow)' }}>{playerStats.score}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Score</div>
        </div>
        <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--info)' }}>{playerStats.totalCatches}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>MonAnimals Caught</div>
        </div>
        <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--success)' }}>{playerStats.wins}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Battle Wins</div>
        </div>
        <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--danger)' }}>{playerStats.losses}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Battle Losses</div>
        </div>
      </div>

      {/* Social Quests Section */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, color: 'var(--text-secondary)', margin: 0 }}>Social Quests 🏅</h3>
          <button className="btn btn-secondary" onClick={() => setShowQR(true)} style={{ padding: '6px 14px', fontSize: 13 }}>
            📲 Share App
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Wallet Connected */}
          <div className="glass-card" style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>👛</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Connect Wallet</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>+20 Score</div>
              </div>
            </div>
            <span style={{ color: wallet.isConnected ? 'var(--success)' : 'var(--text-muted)', fontWeight: 700 }}>
              {wallet.isConnected ? '✅ Done' : '⏳ Pending'}
            </span>
          </div>

          {/* Connect X */}
          <div className="glass-card" style={{ padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>🐦</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Connect X (Twitter)</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>+20 Score</div>
                </div>
              </div>
              {game.socialQuests.xConnected ? (
                <span style={{ color: 'var(--success)', fontWeight: 700 }}>✅ @{game.socialQuests.xUsername}</span>
              ) : (
                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => {
                  const username = prompt("Enter your X (Twitter) username:");
                  if (username && username.trim()) {
                    game.connectX(username.trim().replace('@', ''));
                  }
                }}>
                  Connect
                </button>
              )}
            </div>
          </div>

          {/* Tweet Quest */}
          <div className="glass-card" style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>📣</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Share on X</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>+20 Score</div>
              </div>
            </div>
            {game.socialQuests.tweeted ? (
              <span style={{ color: 'var(--success)', fontWeight: 700 }}>✅ Done</span>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: 11 }} onClick={() => {
                  const tweetText = encodeURIComponent("I'm playing Monad Go — a Pokémon GO style game on Monad blockchain! Catch MonAnimals, battle & earn! 🎮⚡\n\n@monad_dev");
                  window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
                }}>
                  Tweet 🐦
                </button>
                <button className="btn btn-primary" style={{ padding: '6px 10px', fontSize: 11 }} onClick={() => game.claimTweet()}>
                  Done ✓
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }} onClick={() => setShowQR(false)}>
          <div className="glass-card" style={{ padding: 32, textAlign: 'center', maxWidth: 320 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 4 }}>Join Monad Go!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 20 }}>Scan to play on your phone</p>
            <div style={{ background: 'white', padding: 16, borderRadius: 12, display: 'inline-block', marginBottom: 16 }}>
              <QRCodeSVG value={APP_URL} size={200} level="H" />
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', wordBreak: 'break-all' }}>{APP_URL}</p>
            <button className="btn btn-primary btn-full" onClick={() => setShowQR(false)} style={{ marginTop: 16 }}>Close</button>
          </div>
        </div>
      )}

      {/* Monad Store Section */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 16 }}>Monad Store 🛒</h3>
        
        {/* Score to MON Converter */}
        <div className="glass-card" style={{ padding: 16, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: 16 }}>Score to MON</h4>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Convert 100 Score to 0.05 Testnet MON</p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              if (game.playerStats.score >= 100) {
                game.convertScoreToMon(100, 0.05);
                alert("Simulated: 100 Score converted to 0.05 MON!");
              } else {
                alert("Not enough score!");
              }
            }}
            disabled={game.playerStats.score < 100}
            style={{ padding: '8px 16px' }}
          >
            Convert 💱
          </button>
        </div>

        {/* Equipment Shop */}
        <div className="glass-card" style={{ padding: 16 }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Buy Equipment & Power</h4>
          
          <select 
            value={selectedStoreMon} 
            onChange={(e) => setSelectedStoreMon(e.target.value)}
            style={{ width: '100%', padding: 12, marginBottom: 16, borderRadius: 8, background: 'var(--bg-primary)', color: 'white', border: '1px solid var(--glass-border)' }}
          >
            <option value="">-- Select a MonAnimal --</option>
            {game.collection.map(c => {
              const data = MONANIMALS.find(m => m.id === c.monAnimalId);
              return <option key={c.id} value={c.monAnimalId}>{data.name} (Power: {c.power})</option>
            })}
          </select>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button className="btn btn-secondary" onClick={() => handleBuyItem('🎩 Hat', 0.05, 10)}>
              🎩 Hat (+10)<br/>0.05 MON
            </button>
            <button className="btn btn-secondary" onClick={() => handleBuyItem('⚔️ Sword', 0.1, 25)}>
              ⚔️ Sword (+25)<br/>0.1 MON
            </button>
            <button className="btn btn-secondary" onClick={() => handleBuyItem('🪓 Axe', 0.2, 50)}>
              🪓 Axe (+50)<br/>0.2 MON
            </button>
            <button className="btn btn-secondary" onClick={() => handleBuyItem('Power Boost', 0.05, 20)}>
              ⚡ +20 Power<br/>0.05 MON
            </button>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, color: 'var(--text-secondary)' }}>Event Badges</h3>
        <button
          className="btn btn-primary"
          onClick={handleScanClick}
          style={{ padding: '8px 16px', fontSize: 14 }}
        >
          {isScanning ? 'Cancel Scan' : '📷 Scan Event QR'}
        </button>
      </div>

      {isScanning && (
        <div style={{ padding: 16, textAlign: 'center', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--monad-glow)', marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <Scanner onScan={handleScanResult} />
          </div>
          <p style={{ color: 'var(--monad-glow)', marginTop: 16, fontWeight: 'bold' }}>Point camera at Hackathon QR Code</p>
        </div>
      )}

      {badges.length === 0 && !isScanning ? (
        <div style={{ padding: 32, textAlign: 'center', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--glass-border)', color: 'var(--text-muted)' }}>
          No badges yet. Scan a QR code at a real-world event to earn badges!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {badges.map(badge => (
            <div key={badge} style={{ background: 'var(--bg-card)', border: '1px solid var(--monad-glow)', borderRadius: 'var(--radius-lg)', padding: 20, boxShadow: 'var(--glow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 32 }}>🇹🇷</div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>{badge}</h4>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Exclusive Event Attendee</p>
                </div>
              </div>
              
              {/* Badge Perks */}
              {badge === 'Ankara Hackathon \'26' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--glass-border)' }}>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', fontWeight: 'bold' }}>Event Perks:</p>
                  <button
                    onClick={handleClaimPower}
                    disabled={claimedPower}
                    style={{
                      background: claimedPower ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #A78BFA, #836EF9)',
                      color: claimedPower ? 'var(--text-muted)' : '#fff',
                      border: 'none', padding: '12px 16px', borderRadius: 12, fontWeight: 'bold', cursor: claimedPower ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {claimedPower ? '✅ Power Claimed' : '⚡ Claim +20 Power for all MonAnimals'}
                  </button>
                  <button
                    onClick={handleClaimMon}
                    disabled={claimedMon}
                    style={{
                      background: claimedMon ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #34D399, #10B981)',
                      color: claimedMon ? 'var(--text-muted)' : '#fff',
                      border: 'none', padding: '12px 16px', borderRadius: 12, fontWeight: 'bold', cursor: claimedMon ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {claimedMon ? '✅ Faucet Claimed' : '💧 Claim 10 Testnet MON (Mock)'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
