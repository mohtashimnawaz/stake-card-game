import React, { useState } from 'react';

interface GameControlsProps {
  onCreateGame: (gameId: number, stakeAmount: number) => Promise<void>;
  onJoinGame: (gameId: number) => Promise<void>;
  loading: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  onCreateGame,
  onJoinGame,
  loading
}) => {
  const [gameId, setGameId] = useState(1);
  const [stakeAmount, setStakeAmount] = useState(1000000); // 0.001 token
  const [joinGameId, setJoinGameId] = useState(1);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Create Game */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Create New Game</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Game ID
            </label>
            <input
              type="number"
              value={gameId}
              onChange={(e) => setGameId(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500"
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stake Amount (tokens)
            </label>
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500"
              min="1000000"
              step="1000000"
            />
            <p className="text-xs text-gray-400 mt-1">
              Minimum: 1,000,000 (0.001 token)
            </p>
          </div>
          
          <button
            onClick={() => onCreateGame(gameId, stakeAmount)}
            disabled={loading}
            className="w-full btn btn-primary"
          >
            {loading ? 'Creating...' : 'Create Game'}
          </button>
        </div>
      </div>

      {/* Join Game */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Join Existing Game</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Game ID to Join
            </label>
            <input
              type="number"
              value={joinGameId}
              onChange={(e) => setJoinGameId(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500"
              min="1"
            />
          </div>
          
          <button
            onClick={() => onJoinGame(joinGameId)}
            disabled={loading}
            className="w-full btn btn-secondary"
          >
            {loading ? 'Joining...' : 'Join Game'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameControls;
