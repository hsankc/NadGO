import { useState, useRef, useCallback, useEffect } from 'react';
import { useCamera } from '../hooks/useCamera';
import { MONANIMALS, RARITY_COLORS } from '../config/monanimals';
import { ethers } from 'ethers';
import { TREASURY_ADDRESS } from '../config/monad';

export default function CatchScreen({ spawn, game, wallet, onClose }) {
  const mon = MONANIMALS.find((m) => m.id === spawn.monAnimal.id);
  const camera = useCamera();
  const [phase, setPhase] = useState('ready'); // ready | throwing | result
  const [catchResult, setCatchResult] = useState(null);
  const [throwAnim, setThrowAnim] = useState(false);
  const [coinPos, setCoinPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [needsPermission, setNeedsPermission] = useState(false);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const initialOrientation = useRef(null);

  // Start camera and gyroscope on mount
  useEffect(() => {
    camera.startCamera();
    const handleOrientation = (event) => {
      if (!initialOrientation.current) {
        initialOrientation.current = {
          alpha: event.alpha || 0,
          beta: event.beta || 0,
          gamma: event.gamma || 0
        };
      }
      setOrientation({
        alpha: (event.alpha || 0) - initialOrientation.current.alpha,
        beta: (event.beta || 0) - initialOrientation.current.beta,
        gamma: (event.gamma || 0) - initialOrientation.current.gamma
      });
    };

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      setNeedsPermission(true);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      camera.stopCamera();
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const requestOrientationPermission = async () => {
    try {
      const response = await DeviceOrientationEvent.requestPermission();
      if (response === 'granted') {
        setNeedsPermission(false);
        window.addEventListener('deviceorientation', (event) => {
          if (!initialOrientation.current) {
            initialOrientation.current = {
              alpha: event.alpha || 0,
              beta: event.beta || 0,
              gamma: event.gamma || 0
            };
          }
          setOrientation({
            alpha: (event.alpha || 0) - initialOrientation.current.alpha,
            beta: (event.beta || 0) - initialOrientation.current.beta,
            gamma: (event.gamma || 0) - initialOrientation.current.gamma
          });
        });
      }
    } catch (e) {
      console.warn("DeviceOrientation error:", e);
    }
  };

  const lastMoveY = useRef(0);
  const velocityY = useRef(0);
  const lastMoveX = useRef(0);

  const handlePointerDown = useCallback((e) => {
    if (phase !== 'ready') return;
    setIsDragging(true);
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    startY.current = clientY;
    lastMoveY.current = clientY;
    lastMoveX.current = clientX;
    velocityY.current = 0;
  }, [phase]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging || phase !== 'ready') return;
    const currentY = e.clientY || e.touches?.[0]?.clientY || 0;
    const currentX = e.clientX || e.touches?.[0]?.clientX || 0;
    const deltaY = startY.current - currentY;
    // Track velocity for wobble intensity
    velocityY.current = lastMoveY.current - currentY;
    const driftX = (currentX - lastMoveX.current) * 0.3;
    lastMoveY.current = currentY;
    if (deltaY > 0) {
      setCoinPos({ x: driftX, y: -deltaY * 0.5 });
    }
  }, [isDragging, phase]);

  const [feedAttempts, setFeedAttempts] = useState(0);

  const handlePointerUp = useCallback(async (e) => {
    if (!isDragging) return;
    setIsDragging(false);

    const currentY = e.clientY || e.changedTouches?.[0]?.clientY || 0;
    const deltaY = startY.current - currentY;

    // Need minimum swipe distance to throw
    if (deltaY > 60) {
      if (!wallet.isConnected || !wallet.signer) {
        alert("Please connect your wallet first!");
        setCoinPos({ x: 0, y: 0 });
        return;
      }

      try {
        setPhase('pending'); // Prevent further dragging while tx is processing
        // Send 0.01 MON to treasury before catching
        const tx = await wallet.signer.sendTransaction({
          to: TREASURY_ADDRESS,
          value: ethers.parseEther("0.01")
        });
        
        // Wait for tx confirmation
        await tx.wait();
        wallet.fetchBalance(); // Refresh balance

        setPhase('throwing');
        setThrowAnim(true);

        const currentAttempt = feedAttempts + 1;
        setFeedAttempts(currentAttempt);

        // Animate coin throw
        setTimeout(() => {
          const isFirstCatch = game.playerStats.totalCatches === 0;
          const result = game.catchMonAnimal(spawn.id, isFirstCatch, currentAttempt);
          console.log("CATCH RESULT:", result, "SPAWN ID:", spawn.id);
          setCatchResult(result);
          setPhase('result');
          setThrowAnim(false);
        }, 800);
      } catch (err) {
        console.error("Transaction failed or rejected", err);
        setPhase('ready'); // Revert back so they can try again
        setCoinPos({ x: 0, y: 0 }); // reset coin position
      }
    } else {
      setCoinPos({ x: 0, y: 0 });
    }
  }, [isDragging, game, spawn.id, wallet, feedAttempts]);

  const handleRetry = () => {
    setPhase('ready');
    setCatchResult(null);
    setCoinPos({ x: 0, y: 0 });
  };

  const rarityColor = RARITY_COLORS[mon.rarity];

  return (
    <div
      className="catch-container"
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    >
      {/* Camera background */}
      <div className="catch-camera-bg">
        <video
          ref={camera.videoRef}
          autoPlay
          playsInline
          muted
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            display: camera.isCameraOn ? 'block' : 'none'
          }}
        />
        {!camera.isCameraOn && (
          <div style={{
            width: '100%',
            height: '100%',
            background: 'radial-gradient(ellipse at 50% 40%, rgba(131,110,249,0.2) 0%, var(--bg-primary) 70%)',
          }} />
        )}
        {/* Dark overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: camera.isCameraOn ? 'rgba(13, 6, 32, 0.2)' : 'rgba(13, 6, 32, 0.4)',
        }} />
      </div>

      {/* Header */}
      <div className="catch-header" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <button className="btn btn-ghost" onClick={onClose} style={{ color: 'white' }}>
          ← Back
        </button>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {wallet.isConnected && (
            <div style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(13,6,32,0.8)',
              border: '1px solid rgba(131,110,249,0.5)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--monad-glow)',
            }}>
              {wallet.balance} MON
            </div>
          )}
          <div style={{
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            background: `${rarityColor}22`,
            border: `1px solid ${rarityColor}66`,
            fontSize: 11,
            fontWeight: 700,
            color: rarityColor,
            letterSpacing: 1,
          }}>
            {mon.rarity.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Monster scene */}
      {phase !== 'result' && (
        <div
          className="catch-scene"
          style={{
            transform: `translate(${-orientation.gamma * 2}px, ${-orientation.beta * 2}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          {/* Target ring */}
          <div className="catch-ring" style={{
            borderColor: rarityColor,
          }} />

          {/* MonAnimal */}
          <img
            src={mon.image}
            alt={mon.name}
            className="catch-monster"
            style={{
              filter: `drop-shadow(0 8px 24px ${rarityColor}66)`,
            }}
          />

          {/* Monster name */}
          <div style={{
            position: 'absolute',
            top: '20%',
            textAlign: 'center',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 24,
              fontWeight: 800,
              color: 'white',
              textShadow: `0 0 20px ${rarityColor}88`,
            }}>
              {mon.name}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              {mon.type} • Power {mon.basePower}
            </p>
          </div>
        </div>
      )}

      {/* iOS Gyro Permission */}
      {needsPermission && (
        <div style={{
          position: 'absolute',
          top: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          textAlign: 'center',
          background: 'rgba(13,6,32,0.8)',
          padding: 16,
          borderRadius: 12,
        }}>
          <p style={{ color: 'white', fontSize: 12, marginBottom: 8 }}>Enable AR Camera features</p>
          <button className="btn btn-primary" onClick={requestOrientationPermission}>
            Allow Gyroscope
          </button>
        </div>
      )}

      {/* Catch result */}
      {phase === 'result' && catchResult && (
        <div className={`catch-result ${catchResult.success ? 'catch-result-success' : 'catch-result-fail'}`}>
          <img
            src={mon.image}
            alt={mon.name}
            style={{
              width: catchResult.success ? 200 : 150,
              height: catchResult.success ? 200 : 150,
              objectFit: 'contain',
              marginBottom: 24,
              animation: catchResult.success
                ? 'monster-float 2s ease-in-out infinite'
                : 'none',
              opacity: catchResult.success ? 1 : 0.5,
              filter: catchResult.success
                ? `drop-shadow(0 0 40px ${rarityColor})`
                : 'grayscale(0.5)',
            }}
          />

          <div className="catch-result-text">
            {catchResult.success ? 'CAUGHT!' : 'Escaped!'}
          </div>

          {catchResult.success && catchResult.isNew && (
            <p style={{
              color: 'var(--monad-glow)',
              fontSize: 14,
              fontWeight: 600,
              marginTop: 8,
            }}>
              ✨ New MonAnimal added to Library!
            </p>
          )}

          {catchResult.success && !catchResult.isNew && (
            <p style={{
              color: 'var(--success)',
              fontSize: 14,
              fontWeight: 600,
              marginTop: 8,
            }}>
              ⚡ {mon.name} powered up!
            </p>
          )}

          {!catchResult.success && (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💨</div>
              <h2 style={{ color: 'var(--danger)', marginBottom: 8 }}>Oh no!</h2>
              <p>The {mon.name} ate the Monad and escaped!</p>
              {feedAttempts > 0 && (
                <p style={{ color: 'var(--monad-glow)', fontSize: 14, marginTop: 8, fontWeight: 'bold' }}>
                  Catch chance increased by +25%!
                </p>
              )}
              <button
                className="btn btn-primary"
                onClick={handleRetry}
                style={{ marginTop: 20 }}
              >
                Try Again (-0.01 MON)
              </button>
            </>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 32, width: '100%', maxWidth: 300 }}>
            {catchResult.success ? (
              <button className="btn btn-primary btn-full" onClick={onClose}>
                Awesome! 🎉
              </button>
            ) : (
              <button className="btn btn-secondary btn-full" onClick={onClose}>
                Back to Map
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      {phase === 'ready' && (
        <div style={{
          position: 'absolute',
          bottom: 40,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10,
        }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
            Swipe up to throw $MON coin
          </p>

          {/* Swipe Coin */}
          <div
            className="catch-coin"
            onPointerDown={handlePointerDown}
            onTouchStart={handlePointerDown}
            style={{
              position: 'relative',
              left: 'auto',
              bottom: 'auto',
              marginTop: 32,
              transform: isDragging
                ? `translateY(${coinPos.y}px) translateX(${coinPos.x}px) rotateX(${Math.min(Math.abs(coinPos.y) * 0.8, 60)}deg) rotateZ(${coinPos.x * 2}deg) scale(${Math.max(1 + coinPos.y * 0.002, 0.4)})`
                : `translateY(${coinPos.y}px) scale(1)`,
              transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transformStyle: 'preserve-3d',
              perspective: 800,
            }}
          >
            ◇
          </div>
        </div>
      )}

      {/* Throwing animation */}
      {phase === 'throwing' && (
        <div style={{
          position: 'absolute',
          bottom: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
        }}>
          <div style={{
            width: 50,
            height: 50,
            background: 'linear-gradient(135deg, var(--monad-purple), var(--monad-glow))',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 900,
            color: 'white',
            animation: 'coin-throw 0.8s ease-out forwards',
            boxShadow: 'var(--glow-lg)',
          }}>
            ◇
          </div>
        </div>
      )}
    </div>
  );
}
