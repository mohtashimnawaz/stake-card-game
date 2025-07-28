import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { Toaster } from 'react-hot-toast';

import GameInterface from './components/GameInterfaceSimple';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  // Configure the network
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Configure wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900">
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
            <div className="container mx-auto px-4 py-8">
              <header className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">
                  🃏 Stake Card Game
                </h1>
                <p className="text-gray-300">
                  A zero-sum card game where winner takes all!
                </p>
              </header>
              
              <GameInterface />
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
