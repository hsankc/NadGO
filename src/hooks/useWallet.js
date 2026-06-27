import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { MONAD_TESTNET } from '../config/monad';

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0.00');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const isConnected = !!account;
  const isCorrectChain = chainId === MONAD_TESTNET.chainId;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const deepLink = isMobile && typeof window.ethereum === 'undefined'
    ? `https://metamask.app.link/dapp/${window.location.host}`
    : null;

  const fetchBalance = async (prov, addr) => {
    try {
      const bal = await prov.getBalance(addr);
      setBalance(Number(ethers.formatEther(bal)).toFixed(4));
    } catch (e) {
      console.warn("Failed to fetch balance", e);
    }
  };

  // Check if already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            const prov = new ethers.BrowserProvider(window.ethereum);
            setProvider(prov);
            const sig = await prov.getSigner();
            setSigner(sig);
            const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
            setChainId(parseInt(currentChainId, 16));
            fetchBalance(prov, accounts[0]);
            return;
          }
        } catch (err) {
          console.error("MetaMask check error:", err);
        }
      }
    };
    
    checkConnection();
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    // If MetaMask is installed, use it
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const prov = new ethers.BrowserProvider(window.ethereum);
          setProvider(prov);
          const sig = await prov.getSigner();
          setSigner(sig);
          const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
          setChainId(parseInt(currentChainId, 16));
          fetchBalance(prov, accounts[0]);
          
          // Auto switch to Monad Testnet if not on it
          if (parseInt(currentChainId, 16) !== MONAD_TESTNET.chainId) {
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: MONAD_TESTNET.chainIdHex }],
              });
              setChainId(MONAD_TESTNET.chainId);
            } catch (switchError) {
              if (switchError.code === 4902) {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: MONAD_TESTNET.chainIdHex,
                      chainName: MONAD_TESTNET.chainName,
                      nativeCurrency: MONAD_TESTNET.nativeCurrency,
                      rpcUrls: MONAD_TESTNET.rpcUrls,
                      blockExplorerUrls: MONAD_TESTNET.blockExplorerUrls,
                    },
                  ],
                });
                setChainId(MONAD_TESTNET.chainId);
              }
            }
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsConnecting(false);
      }
      return;
    }

    if (deepLink) {
      window.location.href = deepLink;
    } else {
      setError("MetaMask is not installed. Please install MetaMask to continue.");
    }
    setIsConnecting(false);
  }, [deepLink]);

  const switchToMonad = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_TESTNET.chainIdHex }],
      });
    } catch (switchError) {
      // Chain not added — add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: MONAD_TESTNET.chainIdHex,
                chainName: MONAD_TESTNET.chainName,
                nativeCurrency: MONAD_TESTNET.nativeCurrency,
                rpcUrls: MONAD_TESTNET.rpcUrls,
                blockExplorerUrls: MONAD_TESTNET.blockExplorerUrls,
              },
            ],
          });
        } catch (addError) {
          setError('Failed to add Monad network: ' + addError.message);
        }
      } else {
        setError('Failed to switch network: ' + switchError.message);
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setSigner(null);
    setBalance('0.00');
  }, []);

  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : '';

  return {
    account,
    shortAddress,
    balance,
    provider,
    signer,
    chainId,
    isConnected,
    isCorrectChain,
    isConnecting,
    error,
    deepLink,
    connect,
    switchToMonad,
    disconnect,
    fetchBalance: () => { if(provider && account) fetchBalance(provider, account) }
  };
}
