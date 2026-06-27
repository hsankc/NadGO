import { useState } from 'react';
import { MONANIMALS } from '../config/monanimals';

const steps = [
  {
    title: 'Welcome to NadGO',
    subtitle: 'Catch MonAnimals on Monad blockchain',
    content: 'Explore the world, catch the 7 legendary MonAnimals, battle other trainers, and build your collection as NFTs on Monad — the fastest EVM chain.',
    emoji: '⚡',
  },
  {
    title: 'Connect Wallet',
    subtitle: 'MetaMask required',
    content: 'Connect your MetaMask wallet to mint caught MonAnimals as NFTs and participate in battles. Make sure you have some testnet MON.',
    emoji: '👛',
    isWalletStep: true,
  },
  {
    title: 'Your First Catch',
    subtitle: 'Swipe to throw a $MON coin',
    content: 'Find MonAnimals on the map, tap to engage, then swipe up to throw a $MON coin. Time it right to catch them! Duplicates power up your existing MonAnimal.',
    emoji: '🎯',
  },
];

export default function OnboardingScreen({ wallet, onComplete }) {
  const [step, setStep] = useState(0);
  const current = steps[step];

  const handleNext = () => {
    // Block proceeding from wallet step if not connected
    if (current.isWalletStep && !wallet.isConnected) {
      alert("Please connect your wallet to continue!");
      return;
    }
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      if (!wallet.isConnected) {
        alert("Please connect your wallet first!");
        return;
      }
      onComplete();
    }
  };

  const handleSkip = () => {
    if (!wallet.isConnected) {
      alert("Please connect your wallet to play NadGO!");
      return;
    }
    onComplete();
  };

  return (
    <div className="onboarding-container">
      {/* Background particles */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at 50% 30%, rgba(131, 110, 249, 0.15) 0%, transparent 60%)`,
        pointerEvents: 'none',
      }} />

      {/* Step indicator */}
      <div style={{
        position: 'absolute',
        top: 48,
        display: 'flex',
        gap: 8,
      }}>
        {steps.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? 32 : 8,
              height: 8,
              borderRadius: 4,
              background: i === step ? 'var(--monad-purple)' : 'var(--bg-card)',
              transition: 'all 0.3s ease',
              boxShadow: i === step ? 'var(--glow-sm)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Mascot display */}
      {step === 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {MONANIMALS.slice(0, 4).map((mon) => (
            <img
              key={mon.id}
              src={mon.image}
              alt={mon.name}
              style={{
                width: 64,
                height: 64,
                objectFit: 'contain',
                animation: `monster-float 3s ease-in-out infinite`,
                animationDelay: `${mon.id * 0.3}s`,
                filter: 'drop-shadow(0 4px 12px rgba(131, 110, 249, 0.3))',
              }}
            />
          ))}
        </div>
      )}

      {step === 2 && (
        <img
          src={MONANIMALS[0].image}
          alt="Chog"
          className="onboarding-mascot"
        />
      )}

      {/* Content */}
      <div style={{ fontSize: 64, marginBottom: 16 }}>{current.emoji}</div>
      <h1 className="onboarding-logo" style={{ fontSize: step === 0 ? 42 : 32 }}>
        {current.title}
      </h1>
      <p style={{
        color: 'var(--monad-purple-light)',
        fontSize: 14,
        fontWeight: 600,
        marginBottom: 16,
        letterSpacing: 1,
      }}>
        {current.subtitle}
      </p>
      <p style={{
        color: 'var(--text-secondary)',
        fontSize: 15,
        lineHeight: 1.6,
        maxWidth: 340,
        marginBottom: 40,
      }}>
        {current.content}
      </p>

      {/* Wallet connect step */}
      {current.isWalletStep && !wallet.isConnected && (
        wallet.deepLink ? (
          <a
            href={wallet.deepLink}
            className="btn btn-primary btn-lg"
            style={{ marginBottom: 16, display: 'inline-flex', textDecoration: 'none' }}
          >
            🦊 Open in MetaMask App
          </a>
        ) : (
          <button
            className="btn btn-primary btn-lg"
            onClick={wallet.connect}
            disabled={wallet.isConnecting}
            style={{ marginBottom: 16 }}
          >
            {wallet.isConnecting ? (
              <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
            ) : (
              <>🦊 Connect Wallet</>
            )}
          </button>
        )
      )}

      {current.isWalletStep && wallet.isConnected && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 20px',
          background: 'rgba(52, 211, 153, 0.1)',
          border: '1px solid rgba(52, 211, 153, 0.3)',
          borderRadius: 12,
          marginBottom: 16,
          color: 'var(--success)',
          fontWeight: 600,
        }}>
          ✅ Connected: {wallet.shortAddress}
        </div>
      )}

      {wallet.error && (
        <p style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 16 }}>
          {wallet.error}
        </p>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 340 }}>
        <button className="btn btn-ghost" onClick={handleSkip}>
          Skip
        </button>
        <button
          className="btn btn-primary btn-full"
          onClick={handleNext}
        >
          {step === steps.length - 1 ? "Let's GO! 🚀" : 'Next →'}
        </button>
      </div>
    </div>
  );
}
