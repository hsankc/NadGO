import { useState, useRef, useCallback, useEffect } from 'react';
import { useCamera } from '../hooks/useCamera';
import { MONANIMALS, RARITY_COLORS } from '../config/monanimals';
import { ethers } from 'ethers';
import { TREASURY_ADDRESS } from '../config/monad';

export default function ScannerScreen({ wallet, game, onClose }) {
  const camera = useCamera();
  const [phase, setPhase] = useState('scanning'); // scanning | found | feeding | power_thrown | claimed
  const [targetId, setTargetId] = useState(0); // Which mascot to "find"
  const [mon, setMon] = useState(null);
  const [coinPos, setCoinPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [powerPoints, setPowerPoints] = useState(0);
  const startY = useRef(0);

  // Start camera on mount
  useEffect(() => {
    camera.startCamera();
    return () => {
      camera.stopCamera();
    };
  }, []);

  const handleScan = () => {
    setPhase('scanning_anim');
    setTimeout(() => {
      setMon(MONANIMALS.find(m => m.id === targetId));
      setPhase('found');
    }, 1500);
  };

  const handlePointerDown = useCallback((e) => {
    if (phase !== 'found') return;
    setIsDragging(true);
    startY.current = e.clientY || e.touches?.[0]?.clientY || 0;
  }, [phase]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    const currentY = e.clientY || e.touches?.[0]?.clientY || 0;
    const deltaY = startY.current - currentY;
    if (deltaY > 0) {
      setCoinPos({ x: 0, y: -deltaY * 0.5 });
    }
  }, [isDragging]);

  const handlePointerUp = useCallback(async (e) => {
    if (!isDragging) return;
    setIsDragging(false);

    const currentY = e.clientY || e.changedTouches?.[0]?.clientY || 0;
    const deltaY = startY.current - currentY;

    if (deltaY > 60) {
      if (!wallet.isConnected || !wallet.signer) {
        alert("Please connect your wallet first!");
        setCoinPos({ x: 0, y: 0 });
        return;
      }

      setPhase('feeding');
      try {
        const tx = await wallet.signer.sendTransaction({
          to: TREASURY_ADDRESS,
          value: ethers.parseEther("0.01")
        });
        
        await tx.wait();
        wallet.fetchBalance(); 
        
        // Success! Mascot throws power
        const points = 10 + Math.floor(Math.random() * 40); // 10-50 power
        setPowerPoints(points);
        setPhase('power_thrown');
      } catch (err) {
        console.error("Tx failed", err);
        setPhase('found');
        setCoinPos({ x: 0, y: 0 });
      }
    } else {
      setCoinPos({ x: 0, y: 0 });
    }
  }, [isDragging, phase, wallet]);

  const handleClaimPower = () => {
    game.claimScannerPower(mon.id, powerPoints);
    setPhase('claimed');
  };

  const rarityColor = mon ? RARITY_COLORS[mon.rarity] : '#fff';

  return (
    <div className="catch-container"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    >
      <div className="catch-camera-bg">
        <video
          ref={camera.videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: camera.isCameraOn ? 'block' : 'none' }}
        />
        {!camera.isCameraOn && (
          <div style={{ width: '100%', height: '100%', background: 'var(--bg-primary)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,6,32,0.1)' }} />
        
        {/* Scanner overlay UI */}
        {phase === 'scanning' && (
          <div style={{
            position: 'absolute', inset: 0, 
            background: 'linear-gradient(to bottom, rgba(131,110,249,0.1) 0%, transparent 100%)',
            pointerEvents: 'none'
          }} />
        )}
      </div>

      <div className="catch-header" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <button className="btn btn-ghost" onClick={onClose} style={{ color: 'white', zIndex: 50 }}>
          ← Back
        </button>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {wallet.isConnected && (
            <div style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(13,6,32,0.8)',
              border: '1px solid rgba(131,110,249,0.5)',
              fontSize: 12, fontWeight: 600, color: 'var(--monad-glow)',
            }}>
              {wallet.balance} MON
            </div>
          )}
        </div>
      </div>

      {phase === 'scanning' && (
        <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, textAlign: 'center', zIndex: 20 }}>
          {/* Subtle selector for the presenter to pick which mascot is being scanned */}
          <select 
            value={targetId}
            onChange={(e) => setTargetId(Number(e.target.value))}
            style={{
              background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: 8,
              padding: '4px 8px', marginBottom: 20, fontSize: 10, opacity: 0.5
            }}
          >
            {MONANIMALS.map(m => <option key={m.id} value={m.id}>Target: {m.name}</option>)}
          </select>
          <br/>
          <button className="btn btn-primary" onClick={handleScan} style={{ padding: '16px 32px', fontSize: 18, borderRadius: 30 }}>
            🔍 Analyze Mascot
          </button>
        </div>
      )}

      {phase === 'scanning_anim' && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, border: '4px solid var(--monad-glow)', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--monad-glow)', marginTop: 16, fontWeight: 'bold' }}>AI Processing...</p>
        </div>
      )}

      {mon && phase !== 'scanning' && phase !== 'scanning_anim' && (
        <div className="catch-scene" style={{ animation: 'fade-in 0.5s ease-out' }}>
          <img
            src={mon.image}
            alt={mon.name}
            style={{
              width: 200, height: 200, objectFit: 'contain',
              filter: `drop-shadow(0 8px 32px ${rarityColor})`,
              animation: phase === 'power_thrown' ? 'monster-bounce 1s ease-in-out infinite' : 'monster-float 3s ease-in-out infinite'
            }}
          />
          <div style={{ position: 'absolute', top: '15%', textAlign: 'center', width: '100%' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'white', textShadow: `0 0 20px ${rarityColor}` }}>
              {mon.name} Detected!
            </h2>
          </div>
        </div>
      )}

      {phase === 'found' && (
        <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, fontWeight: 600 }}>
            Swipe up to Feed (0.01 MON)
          </p>
          <div
            onPointerDown={handlePointerDown}
            onTouchStart={handlePointerDown}
            style={{
              position: 'relative', left: 'auto', bottom: 'auto', marginTop: 32,
              width: 60, height: 60, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--monad-purple), var(--monad-glow))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24,
              boxShadow: '0 0 20px var(--monad-glow)', cursor: 'grab',
              transform: `translateY(${coinPos.y}px)`, transition: isDragging ? 'none' : 'transform 0.3s ease'
            }}
          >
            🍖
          </div>
        </div>
      )}

      {phase === 'feeding' && (
        <div style={{ position: 'absolute', bottom: 100, width: '100%', textAlign: 'center', zIndex: 20 }}>
          <p style={{ color: 'var(--monad-glow)', fontSize: 18, fontWeight: 'bold', animation: 'pulse 1s infinite' }}>
            Feeding Transaction Pending...
          </p>
        </div>
      )}

      {phase === 'power_thrown' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30, background: 'rgba(0,0,0,0.4)' }}>
          <div 
            onClick={handleClaimPower}
            style={{
              width: 120, height: 120, borderRadius: '50%',
              background: `radial-gradient(circle at 30% 30%, #fff, ${rarityColor})`,
              boxShadow: `0 0 50px ${rarityColor}, inset 0 0 20px #fff`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', animation: 'power-pulse 1s ease-in-out infinite, power-throw 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
              transform: 'scale(0)'
            }}
          >
            <span style={{ fontSize: 32 }}>⚡</span>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>+{powerPoints}</span>
          </div>
          <p style={{ position: 'absolute', bottom: 120, color: '#fff', fontSize: 20, fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)', animation: 'pulse 1.5s infinite' }}>
            Tap to Claim Power!
          </p>
        </div>
      )}

      {phase === 'claimed' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 30, background: 'rgba(13,6,32,0.8)' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h2 style={{ color: 'var(--success)', fontSize: 32, marginBottom: 8 }}>Power Claimed!</h2>
          <p style={{ color: '#fff', fontSize: 18, marginBottom: 32 }}>{mon.name} granted you {powerPoints} Power!</p>
          <button className="btn btn-primary" onClick={onClose} style={{ padding: '16px 32px', fontSize: 18, borderRadius: 30 }}>
            Back to Map
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes power-throw {
          0% { transform: scale(0) translateY(-200px); }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes power-pulse {
          0% { box-shadow: 0 0 30px ${rarityColor}; }
          50% { box-shadow: 0 0 60px ${rarityColor}, 0 0 20px #fff; }
          100% { box-shadow: 0 0 30px ${rarityColor}; }
        }
        @keyframes monster-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
