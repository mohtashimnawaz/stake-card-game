import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const GameInterface: React.FC = () => {
  const wallet = useWallet();
  const [gameCreated, setGameCreated] = useState(false);

  if (!wallet.connected) {
    return (
      <div className="text-center">
        <div className="bg-gray-800 rounded-lg p-8 inline-block">
          <h2 className="text-2xl font-bold text-white mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-300 mb-6">
            Connect your Phantom wallet to start playing
          </p>
          <WalletMultiButton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <WalletMultiButton />
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Game Status</h3>
        <p className="text-gray-300 mb-4">
          Wallet connected! The game is ready to be implemented with the smart contract.
        </p>
        
        <div className="space-y-4">
          <div className="bg-green-800 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-green-200 mb-2">✅ Smart Contract Features</h4>
            <ul className="text-green-300 text-sm space-y-1">
              <li>• Game creation with stake amounts</li>
              <li>• Player joining mechanism</li>
              <li>• Card dealing and turn management</li>
              <li>• Winner determination</li>
              <li>• Token distribution</li>
            </ul>
          </div>
          
          <div className="bg-blue-800 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-blue-200 mb-2">🎮 How to Play</h4>
            <ol className="text-blue-300 text-sm space-y-1">
              <li>1. Create a game with your stake amount</li>
              <li>2. Wait for another player to join</li>
              <li>3. Play cards in turns (5 rounds)</li>
              <li>4. Winner takes all staked tokens</li>
            </ol>
          </div>
          
          <div className="bg-yellow-800 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-yellow-200 mb-2">🔧 Next Steps</h4>
            <p className="text-yellow-300 text-sm">
              Deploy the smart contract to devnet and connect the frontend to enable full gameplay.
              The contract is ready and the UI framework is in place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameInterface;
