import React, { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { 
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo
} from '@solana/spl-token';
import toast from 'react-hot-toast';

import GameBoard from './GameBoard';
import GameControls from './GameControls';
// Import the IDL as JSON
import idl from '../idl/stake_card_game.json';

const PROGRAM_ID = new web3.PublicKey('6zuXD18EnpDUDmuQE7rnLScq5feMbGCbSwArD9m9schE');

interface GameState {
  gameId: number;
  creator: web3.PublicKey;
  players: any[];
  status: any;
  currentRound: number;
  totalRounds: number;
  stakeAmount: BN;
  totalPool: BN;
  winner: web3.PublicKey | null;
  resultClaimed: boolean;
}

const GameInterface: React.FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [program, setProgram] = useState<Program | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [mint, setMint] = useState<web3.PublicKey | null>(null);
  const [userTokenAccount, setUserTokenAccount] = useState<web3.PublicKey | null>(null);
  const [selectedCard, setSelectedCard] = useState<any>(null);

  // Initialize program
  useEffect(() => {
    if (wallet.publicKey && wallet.signTransaction) {
      const provider = new AnchorProvider(
        connection,
        wallet as any,
        { commitment: 'confirmed' }
      );
      const programInstance = new Program(idl as any, PROGRAM_ID, provider);
      setProgram(programInstance);
    }
  }, [connection, wallet]);

  // Setup token accounts for testing
  const setupTokenAccounts = useCallback(async () => {
    if (!wallet.publicKey || !program) return;

    try {
      setLoading(true);

      // For demo purposes, create a test mint
      // In production, you'd use an existing token
      const mintKeypair = web3.Keypair.generate();
      
      const mintAccount = await createMint(
        connection,
        wallet as any,
        wallet.publicKey,
        null,
        6
      );

      setMint(mintAccount);

      // Create user token account
      const tokenAccount = await createAccount(
        connection,
        wallet as any,
        mintAccount,
        wallet.publicKey
      );

      setUserTokenAccount(tokenAccount);

      // Mint some test tokens
      await mintTo(
        connection,
        wallet as any,
        mintAccount,
        tokenAccount,
        wallet.publicKey,
        10_000_000 // 10 tokens
      );

      toast.success('Test tokens setup complete!');
    } catch (error) {
      console.error('Error setting up tokens:', error);
      toast.error('Failed to setup test tokens');
    } finally {
      setLoading(false);
    }
  }, [connection, wallet, program]);

  const createGame = useCallback(async (gameId: number, stakeAmount: number) => {
    if (!program || !wallet.publicKey || !mint || !userTokenAccount) {
      toast.error('Please setup tokens first');
      return;
    }

    try {
      setLoading(true);

      const [gamePda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from('game'), new BN(gameId).toArrayLike(Buffer, 'le', 8)],
        program.programId
      );

      const [vaultPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), gamePda.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .createGame(new BN(gameId), new BN(stakeAmount))
        .accounts({
          game: gamePda,
          vault: vaultPda,
          creator: wallet.publicKey,
          creatorTokenAccount: userTokenAccount,
          mint: mint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      toast.success('Game created successfully!');
      await fetchGameState(gameId);
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error('Failed to create game');
    } finally {
      setLoading(false);
    }
  }, [program, wallet, mint, userTokenAccount]);

  const joinGame = useCallback(async (gameId: number) => {
    if (!program || !wallet.publicKey || !userTokenAccount) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      setLoading(true);

      const [gamePda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from('game'), new BN(gameId).toArrayLike(Buffer, 'le', 8)],
        program.programId
      );

      const [vaultPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), gamePda.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .joinGame()
        .accounts({
          game: gamePda,
          vault: vaultPda,
          player: wallet.publicKey,
          playerTokenAccount: userTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      toast.success('Joined game successfully!');
      await fetchGameState(gameId);
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error('Failed to join game');
    } finally {
      setLoading(false);
    }
  }, [program, wallet, userTokenAccount]);

  const playCard = useCallback(async (gameId: number, card: any) => {
    if (!program || !wallet.publicKey) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      setLoading(true);

      const [gamePda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from('game'), new BN(gameId).toArrayLike(Buffer, 'le', 8)],
        program.programId
      );

      const tx = await program.methods
        .playCard(card)
        .accounts({
          game: gamePda,
          player: wallet.publicKey,
        })
        .rpc();

      toast.success('Card played!');
      await fetchGameState(gameId);
      setSelectedCard(null);
    } catch (error) {
      console.error('Error playing card:', error);
      toast.error('Failed to play card');
    } finally {
      setLoading(false);
    }
  }, [program, wallet]);

  const claimWinnings = useCallback(async (gameId: number) => {
    if (!program || !wallet.publicKey || !userTokenAccount) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      setLoading(true);

      const [gamePda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from('game'), new BN(gameId).toArrayLike(Buffer, 'le', 8)],
        program.programId
      );

      const [vaultPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), gamePda.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .claimWinnings()
        .accounts({
          game: gamePda,
          vault: vaultPda,
          winner: wallet.publicKey,
          winnerTokenAccount: userTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      toast.success('Winnings claimed!');
      await fetchGameState(gameId);
    } catch (error) {
      console.error('Error claiming winnings:', error);
      toast.error('Failed to claim winnings');
    } finally {
      setLoading(false);
    }
  }, [program, wallet, userTokenAccount]);

  const fetchGameState = useCallback(async (gameId: number) => {
    if (!program) return;

    try {
      const [gamePda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from('game'), new BN(gameId).toArrayLike(Buffer, 'le', 8)],
        program.programId
      );

      const gameAccount = await program.account.game.fetch(gamePda);
      setGameState(gameAccount as any);
    } catch (error) {
      console.error('Error fetching game state:', error);
    }
  }, [program]);

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

      {!mint && (
        <div className="bg-yellow-800 rounded-lg p-4 text-center">
          <p className="text-yellow-200 mb-4">
            Setup test tokens to start playing
          </p>
          <button
            onClick={setupTokenAccounts}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Setting up...' : 'Setup Test Tokens'}
          </button>
        </div>
      )}

      {mint && !gameState && (
        <GameControls
          onCreateGame={createGame}
          onJoinGame={joinGame}
          loading={loading}
        />
      )}

      {gameState && (
        <GameBoard
          gameState={gameState}
          userPublicKey={wallet.publicKey}
          onPlayCard={playCard}
          onClaimWinnings={claimWinnings}
          selectedCard={selectedCard}
          setSelectedCard={setSelectedCard}
          loading={loading}
        />
      )}
    </div>
  );
};

export default GameInterface;
