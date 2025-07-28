import React from 'react';
import { web3 } from '@coral-xyz/anchor';
import Card from './Card';

interface GameBoardProps {
  gameState: any;
  userPublicKey: web3.PublicKey | null;
  onPlayCard: (gameId: number, card: any) => Promise<void>;
  onClaimWinnings: (gameId: number) => Promise<void>;
  selectedCard: any;
  setSelectedCard: (card: any) => void;
  loading: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  userPublicKey,
  onPlayCard,
  onClaimWinnings,
  selectedCard,
  setSelectedCard,
  loading
}) => {
  const isUserInGame = gameState.players.some((p: any) => 
    p.pubkey.toString() === userPublicKey?.toString()
  );

  const userPlayer = gameState.players.find((p: any) => 
    p.pubkey.toString() === userPublicKey?.toString()
  );

  const opponentPlayer = gameState.players.find((p: any) => 
    p.pubkey.toString() !== userPublicKey?.toString()
  );

  const isUserTurn = userPlayer && 
    gameState.currentTurn === gameState.players.findIndex((p: any) => 
      p.pubkey.toString() === userPublicKey?.toString()
    );

  const getStatusText = () => {
    if (gameState.status.waitingForPlayer) {
      return 'Waiting for second player...';
    }
    if (gameState.status.inProgress) {
      if (isUserTurn) {
        return "It's your turn!";
      }
      return "Waiting for opponent...";
    }
    if (gameState.status.ended) {
      if (gameState.winner?.toString() === userPublicKey?.toString()) {
        return 'You won! 🎉';
      } else if (gameState.winner) {
        return 'You lost 😔';
      } else {
        return "It's a tie!";
      }
    }
    return 'Unknown status';
  };

  const getStatusColor = () => {
    if (gameState.status.waitingForPlayer) return 'text-yellow-400';
    if (gameState.status.inProgress) {
      return isUserTurn ? 'text-green-400' : 'text-blue-400';
    }
    if (gameState.status.ended) {
      if (gameState.winner?.toString() === userPublicKey?.toString()) {
        return 'text-green-400';
      } else if (gameState.winner) {
        return 'text-red-400';
      } else {
        return 'text-yellow-400';
      }
    }
    return 'text-gray-400';
  };

  if (!isUserInGame) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-300">You are not in this game.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Game #{gameState.gameId.toString()}
        </h2>
        <p className={`text-lg font-semibold ${getStatusColor()}`}>
          {getStatusText()}
        </p>
        <div className="text-sm text-gray-400 mt-2">
          Round {gameState.currentRound + 1} of {gameState.totalRounds} | 
          Pool: {(gameState.totalPool.toNumber() / 1_000_000).toFixed(3)} tokens
        </div>
      </div>

      {/* Game Area */}
      <div className="game-board">
        {/* Opponent Area */}
        {opponentPlayer && (
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Opponent ({opponentPlayer.pubkey.toString().slice(0, 8)}...)
            </h3>
            <div className="text-sm text-gray-400 mb-2">
              Cards: {opponentPlayer.hand.length}
            </div>
            {opponentPlayer.playedCard && (
              <div className="flex justify-center">
                <Card 
                  card={opponentPlayer.playedCard} 
                  faceDown={false}
                  onClick={() => {}}
                />
              </div>
            )}
          </div>
        )}

        {/* Current Round Cards */}
        {gameState.status.inProgress && gameState.players.some((p: any) => p.hasPlayed) && (
          <div className="text-center mb-6">
            <h4 className="text-lg font-semibold text-white mb-4">Current Round</h4>
            <div className="flex justify-center gap-4">
              {gameState.players.map((player: any, index: number) => (
                player.hasPlayed && (
                  <div key={index} className="text-center">
                    <div className="text-sm text-gray-400 mb-2">
                      {player.pubkey.toString() === userPublicKey?.toString() ? 'You' : 'Opponent'}
                    </div>
                    <Card 
                      card={player.playedCard} 
                      faceDown={false}
                      onClick={() => {}}
                    />
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* User Area */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Your Hand</h3>
          <div className="hand">
            {userPlayer.hand.map((card: any, index: number) => (
              <Card
                key={index}
                card={card}
                faceDown={false}
                selected={selectedCard === card}
                onClick={() => setSelectedCard(card)}
                disabled={!isUserTurn || gameState.status.ended}
              />
            ))}
          </div>

          {/* Play Card Button */}
          {isUserTurn && selectedCard && gameState.status.inProgress && (
            <button
              onClick={() => onPlayCard(gameState.gameId.toNumber(), selectedCard)}
              disabled={loading}
              className="btn btn-primary mt-4"
            >
              {loading ? 'Playing...' : 'Play Selected Card'}
            </button>
          )}

          {/* Claim Winnings Button */}
          {gameState.status.ended && 
           !gameState.resultClaimed && 
           (gameState.winner?.toString() === userPublicKey?.toString() || !gameState.winner) && (
            <button
              onClick={() => onClaimWinnings(gameState.gameId.toNumber())}
              disabled={loading}
              className="btn btn-success mt-4"
            >
              {loading ? 'Claiming...' : 'Claim Winnings'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
