import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { StakeCardGame } from "../target/types/stake_card_game";
import { 
  TOKEN_PROGRAM_ID, 
  createMint, 
  createAccount, 
  mintTo,
  getAccount
} from "@solana/spl-token";
import { Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { expect } from "chai";

describe("stake-card-game", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.StakeCardGame as Program<StakeCardGame>;
  const provider = anchor.getProvider();

  // Test accounts
  let mint: anchor.web3.PublicKey;
  let player1: Keypair;
  let player2: Keypair;
  let player1TokenAccount: anchor.web3.PublicKey;
  let player2TokenAccount: anchor.web3.PublicKey;
  const gameId = new anchor.BN(1);
  const stakeAmount = new anchor.BN(1000000); // 0.001 SOL worth of tokens

  before(async () => {
    // Create test keypairs
    player1 = Keypair.generate();
    player2 = Keypair.generate();

    // Airdrop SOL to test accounts
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(player1.publicKey, 2 * LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(player2.publicKey, 2 * LAMPORTS_PER_SOL)
    );

    // Create mint
    mint = await createMint(
      provider.connection,
      player1,
      player1.publicKey,
      null,
      6 // 6 decimals
    );

    // Create token accounts
    player1TokenAccount = await createAccount(
      provider.connection,
      player1,
      mint,
      player1.publicKey
    );

    player2TokenAccount = await createAccount(
      provider.connection,
      player2,
      mint,
      player2.publicKey
    );

    // Mint tokens to players
    await mintTo(
      provider.connection,
      player1,
      mint,
      player1TokenAccount,
      player1.publicKey,
      10_000_000 // 10 tokens
    );

    await mintTo(
      provider.connection,
      player1,
      mint,
      player2TokenAccount,
      player1.publicKey,
      10_000_000 // 10 tokens
    );
  });

  it("Creates a new game", async () => {
    const [gamePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("game"), gameId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), gamePda.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .createGame(gameId, stakeAmount)
      .accounts({
        game: gamePda,
        vault: vaultPda,
        creator: player1.publicKey,
        creatorTokenAccount: player1TokenAccount,
        mint: mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([player1])
      .rpc();

    console.log("Create game transaction signature:", tx);

    // Verify game state
    const gameAccount = await program.account.game.fetch(gamePda);
    expect(gameAccount.gameId.toNumber()).to.equal(gameId.toNumber());
    expect(gameAccount.creator.toString()).to.equal(player1.publicKey.toString());
    expect(gameAccount.stakeAmount.toNumber()).to.equal(stakeAmount.toNumber());
    expect(gameAccount.players.length).to.equal(1);
    expect(gameAccount.status).to.deep.equal({ waitingForPlayer: {} });

    // Check vault balance
    const vaultAccount = await getAccount(provider.connection, vaultPda);
    expect(Number(vaultAccount.amount)).to.equal(stakeAmount.toNumber());
  });

  it("Player 2 joins the game", async () => {
    const [gamePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("game"), gameId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), gamePda.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .joinGame()
      .accounts({
        game: gamePda,
        vault: vaultPda,
        player: player2.publicKey,
        playerTokenAccount: player2TokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([player2])
      .rpc();

    console.log("Join game transaction signature:", tx);

    // Verify game state
    const gameAccount = await program.account.game.fetch(gamePda);
    expect(gameAccount.players.length).to.equal(2);
    expect(gameAccount.status).to.deep.equal({ inProgress: {} });
    expect(gameAccount.totalPool.toNumber()).to.equal(stakeAmount.toNumber() * 2);

    // Check that players have cards
    expect(gameAccount.players[0].hand.length).to.equal(5);
    expect(gameAccount.players[1].hand.length).to.equal(5);
  });

  it("Players play a round", async () => {
    const [gamePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("game"), gameId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Get current game state
    let gameAccount = await program.account.game.fetch(gamePda);
    
    // Player 1 plays first (current turn should be 0)
    const player1Card = gameAccount.players[0].hand[0];
    
    const tx1 = await program.methods
      .playCard(player1Card)
      .accounts({
        game: gamePda,
        player: player1.publicKey,
      })
      .signers([player1])
      .rpc();

    console.log("Player 1 play card transaction:", tx1);

    // Player 2 plays
    gameAccount = await program.account.game.fetch(gamePda);
    const player2Card = gameAccount.players[1].hand[0];
    
    const tx2 = await program.methods
      .playCard(player2Card)
      .accounts({
        game: gamePda,
        player: player2.publicKey,
      })
      .signers([player2])
      .rpc();

    console.log("Player 2 play card transaction:", tx2);

    // Check game state after round
    gameAccount = await program.account.game.fetch(gamePda);
    expect(gameAccount.currentRound).to.equal(1);
    expect(gameAccount.players[0].hasPlayed).to.be.false; // Reset for next round
    expect(gameAccount.players[1].hasPlayed).to.be.false;
  });

  it("Completes the game and claims winnings", async () => {
    const [gamePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("game"), gameId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), gamePda.toBuffer()],
      program.programId
    );

    let gameAccount = await program.account.game.fetch(gamePda);

    // Play remaining rounds until game ends
    while (gameAccount.status.inProgress && gameAccount.currentRound < 5) {
      // Determine whose turn it is
      const currentPlayer = gameAccount.currentTurn === 0 ? player1 : player2;
      const currentPlayerTokenAccount = gameAccount.currentTurn === 0 ? player1TokenAccount : player2TokenAccount;
      const playerIndex = gameAccount.currentTurn;
      const card = gameAccount.players[playerIndex].hand[0];

      await program.methods
        .playCard(card)
        .accounts({
          game: gamePda,
          player: currentPlayer.publicKey,
        })
        .signers([currentPlayer])
        .rpc();

      gameAccount = await program.account.game.fetch(gamePda);

      // If both players have played, move to next round
      if (gameAccount.players.every(p => p.hasPlayed)) {
        // Wait for the round to process
        gameAccount = await program.account.game.fetch(gamePda);
      }
    }

    // Ensure game has ended
    gameAccount = await program.account.game.fetch(gamePda);
    expect(gameAccount.status).to.deep.equal({ ended: {} });

    // If there's a winner, they can claim
    if (gameAccount.winner) {
      const winner = gameAccount.winner;
      const winnerSigner = winner.equals(player1.publicKey) ? player1 : player2;
      const winnerTokenAccount = winner.equals(player1.publicKey) ? player1TokenAccount : player2TokenAccount;

      const tx = await program.methods
        .claimWinnings()
        .accounts({
          game: gamePda,
          vault: vaultPda,
          winner: winner,
          winnerTokenAccount: winnerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([winnerSigner])
        .rpc();

      console.log("Claim winnings transaction:", tx);

      // Verify the winner received the tokens
      const finalGameAccount = await program.account.game.fetch(gamePda);
      expect(finalGameAccount.resultClaimed).to.be.true;
    }
  });
});
