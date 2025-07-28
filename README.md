# 🃏 Stake-to-Play Zero-Sum Card Game

A decentralized card game built on Solana where players stake tokens to enter and the winner takes all. This is a complete implementation of a mini PVP card game with smart contract backend and React frontend.

## 🎮 Game Overview

- **Players**: 2 players per game
- **Entry**: Both players stake equal amounts of tokens
- **Gameplay**: 5 rounds of card battles
- **Winning**: Player with the most cards remaining wins the entire stake pool
- **Zero-Sum**: Winner takes all staked tokens

## 🛠️ Tech Stack

### Smart Contract
- **Language**: Rust
- **Framework**: Anchor (Solana)
- **Features**: 
  - SPL Token integration
  - PDA-based game state storage
  - Secure token transfers via CPI
  - Winner verification and payout

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Wallet**: Phantom wallet integration
- **Build Tool**: Vite
- **State Management**: React hooks

## 📋 Features

### Smart Contract Features
- ✅ Create game with stake amount
- ✅ Join existing games
- ✅ Card dealing and shuffling
- ✅ Turn-based gameplay
- ✅ Round winner determination
- ✅ Game winner calculation
- ✅ Secure token distribution
- ✅ Anti-cheat mechanisms

### Frontend Features
- ✅ Wallet connection (Phantom)
- ✅ Game creation interface
- ✅ Join game functionality
- ✅ Interactive card display
- ✅ Real-time game state updates
- ✅ Turn indicators
- ✅ Win/loss notifications
- ✅ Token claiming interface

## 🚀 Getting Started

### Prerequisites

1. **Rust & Solana CLI**
   ```bash
   # Install Rust
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   
   # Install Solana CLI
   sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
   ```

2. **Anchor CLI**
   ```bash
   npm install -g @coral-xyz/anchor-cli
   ```

3. **Node.js 18+**
   ```bash
   # Install Node.js from https://nodejs.org/ or use nvm
   nvm install 18
   nvm use 18
   ```

4. **Phantom Wallet**
   - Install from https://phantom.app/
   - Create a wallet and switch to Devnet

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd stake-card-game
   ```

2. **Install dependencies**
   ```bash
   # Root dependencies (for testing)
   npm install
   
   # Frontend dependencies
   cd app
   npm install
   cd ..
   ```

3. **Setup Solana for development**
   ```bash
   # Set to devnet
   solana config set --url devnet
   
   # Create a keypair (if you don't have one)
   solana-keygen new
   
   # Airdrop some SOL for testing
   solana airdrop 2
   ```

### Building and Deployment

1. **Build the smart contract**
   ```bash
   anchor build
   ```

2. **Deploy to devnet**
   ```bash
   anchor deploy --provider.cluster devnet
   ```

3. **Start the frontend**
   ```bash
   cd app
   npm run dev
   ```

4. **Open the application**
   - Navigate to `http://localhost:5173`
   - Connect your Phantom wallet
   - Make sure you're on Devnet

## 🎯 How to Play

### 1. Setup
1. Connect your Phantom wallet (ensure you're on Devnet)
2. Click "Setup Test Tokens" to create test tokens for playing
3. The system will create a mock token and give you some for testing

### 2. Create a Game
1. Click "Create New Game"
2. Set a Game ID (unique number)
3. Set stake amount (minimum 1,000,000 = 0.001 tokens)
4. Click "Create Game"
5. Wait for another player to join

### 3. Join a Game
1. Click "Join Existing Game"
2. Enter the Game ID of an existing game
3. Click "Join Game"
4. The game will start automatically when 2 players are present

### 4. Playing Cards
1. Once the game starts, each player gets 5 cards
2. Players take turns playing one card per round
3. Higher value cards win the round (Ace is high)
4. The game consists of 5 rounds
5. Player with the most cards remaining wins

### 5. Claiming Winnings
1. When the game ends, the winner can claim all staked tokens
2. Click "Claim Winnings" to transfer tokens to your wallet
3. In case of a tie, both players can claim half

## 🏗️ Architecture

### Smart Contract Structure

```
programs/stake-card-game/src/
├── lib.rs                 # Main program entry point
├── constants.rs           # Game constants and seeds
├── error.rs              # Custom error definitions
├── state/
│   ├── mod.rs
│   └── game.rs           # Game state and logic
└── instructions/
    ├── mod.rs
    ├── initialize.rs     # Program initialization
    ├── create_game.rs    # Game creation logic
    ├── join_game.rs      # Player joining logic
    ├── play_card.rs      # Card playing logic
    └── claim_winnings.rs # Prize distribution
```

### Frontend Structure

```
app/src/
├── main.tsx              # App entry point
├── App.tsx               # Main app component
├── index.css             # Global styles
├── components/
│   ├── GameInterface.tsx # Main game interface
│   ├── GameControls.tsx  # Game creation/joining controls
│   ├── GameBoard.tsx     # Game board and gameplay
│   └── Card.tsx          # Individual card component
├── types/
│   └── stake_card_game.ts # Generated TypeScript types
└── idl/
    └── stake_card_game.json # Generated IDL file
```

## 🧪 Testing

### Run Smart Contract Tests
```bash
# Start local validator (in separate terminal)
solana-test-validator

# Run tests
anchor test --skip-local-validator
```

### Frontend Testing
The frontend can be tested by:
1. Starting the dev server (`npm run dev`)
2. Connecting to devnet
3. Creating and joining games
4. Playing through complete game scenarios

## 🔧 Configuration

### Anchor.toml
- Configure cluster endpoints
- Set program IDs
- Adjust build settings

### tailwind.config.js
- Customize UI theme
- Add custom components
- Modify responsive breakpoints

## 📝 Game Rules

1. **Entry**: Each player must stake the same amount of tokens
2. **Cards**: Standard deck (52 cards), each player gets 5 cards
3. **Rounds**: 5 rounds total
4. **Turn Order**: Players alternate turns, winner of previous round goes first
5. **Card Values**: Ace (high) = 14, King = 13, Queen = 12, Jack = 11, others face value
6. **Winning**: Player with most cards remaining after 5 rounds wins
7. **Ties**: In case of equal cards, both players can claim half the pool
8. **Payout**: Winner takes entire stake pool (loser gets nothing)

## 🔐 Security Features

- **PDA-based Authorization**: Game state stored in Program Derived Addresses
- **Stake Escrow**: Tokens held in vault until game completion
- **Turn Validation**: Only current player can make moves
- **Card Validation**: Players can only play cards from their hand
- **Winner Verification**: Smart contract determines winner based on game rules
- **Claim Protection**: Only winners can claim, and only once

## 🚨 Known Issues & Limitations

1. **Stack Overflow Warning**: The sorting function in dependencies exceeds stack limits (cosmetic warning)
2. **Test Mode**: Currently uses mock tokens for testing
3. **Single Game**: Frontend only handles one game at a time
4. **No Reconnection**: Page refresh loses game state (would need backend persistence)
5. **Devnet Only**: Configured for development network

## 🛣️ Future Enhancements

- [ ] Multiple concurrent games
- [ ] Spectator mode
- [ ] Game history and statistics
- [ ] Tournament brackets
- [ ] Different game modes (Texas Hold'em, etc.)
- [ ] NFT card collections
- [ ] Leaderboards and rankings
- [ ] Mobile responsive design improvements
- [ ] Real-time multiplayer with WebSockets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [Anchor Framework](https://anchor-lang.com/)
- Frontend powered by [React](https://reactjs.org/) and [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Solana wallet integration via [@solana/wallet-adapter](https://github.com/solana-labs/wallet-adapter)

---

**Happy Gaming! 🎮**

For questions or support, please open an issue in the repository.
