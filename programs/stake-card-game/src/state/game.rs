use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum GameStatus {
    WaitingForPlayer,
    InProgress,
    Ended,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum Suit {
    Hearts,
    Diamonds,
    Clubs,
    Spades,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub struct Card {
    pub suit: Suit,
    pub value: u8, // 1-13 (Ace=1, Jack=11, Queen=12, King=13)
}

impl Card {
    pub fn get_score(&self) -> u8 {
        match self.value {
            1 => 14, // Ace is high
            _ => self.value,
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Player {
    pub pubkey: Pubkey,
    pub hand: Vec<Card>,
    pub stake_amount: u64,
    pub has_played: bool,
    pub played_card: Option<Card>,
}

#[account]
pub struct Game {
    pub game_id: u64,
    pub creator: Pubkey,
    pub players: Vec<Player>,
    pub status: GameStatus,
    pub current_round: u8,
    pub total_rounds: u8,
    pub stake_amount: u64,
    pub total_pool: u64,
    pub winner: Option<Pubkey>,
    pub result_claimed: bool,
    pub deck: Vec<Card>,
    pub current_turn: u8,
    pub bump: u8,
    pub vault_bump: u8,
}

impl Game {
    pub const LEN: usize = 8 + // discriminator
        8 + // game_id
        32 + // creator
        4 + (2 * (32 + 4 + 5 * 8 + 1 + 1 + 8)) + // players (max 2 players with hands of 5 cards)
        1 + // status
        1 + // current_round
        1 + // total_rounds
        8 + // stake_amount
        8 + // total_pool
        1 + 32 + // winner (Option<Pubkey>)
        1 + // result_claimed
        4 + 52 * 8 + // deck (max 52 cards)
        1 + // current_turn
        1 + // bump
        1; // vault_bump

    pub fn initialize_deck() -> Vec<Card> {
        let mut deck = Vec::new();
        
        for suit in [Suit::Hearts, Suit::Diamonds, Suit::Clubs, Suit::Spades] {
            for value in 1..=13 {
                deck.push(Card { suit, value });
            }
        }
        
        deck
    }

    pub fn shuffle_deck(&mut self, slot: u64) {
        // Simple shuffle using slot as seed
        let mut rng_state = slot;
        for i in (1..self.deck.len()).rev() {
            rng_state = rng_state.wrapping_mul(1103515245).wrapping_add(12345);
            let j = (rng_state as usize) % (i + 1);
            self.deck.swap(i, j);
        }
    }

    pub fn deal_cards(&mut self) {
        let cards_per_player = 5;
        
        for i in 0..self.players.len() {
            let start_idx = i * cards_per_player;
            let end_idx = start_idx + cards_per_player;
            
            self.players[i].hand = self.deck[start_idx..end_idx].to_vec();
        }
    }

    pub fn get_round_winner(&self) -> Option<usize> {
        if self.players.len() != 2 || !self.players.iter().all(|p| p.has_played) {
            return None;
        }

        let card1 = self.players[0].played_card?;
        let card2 = self.players[1].played_card?;

        let score1 = card1.get_score();
        let score2 = card2.get_score();

        if score1 > score2 {
            Some(0)
        } else if score2 > score1 {
            Some(1)
        } else {
            None // Tie
        }
    }

    pub fn can_play_card(&self, player_pubkey: &Pubkey, card: &Card) -> bool {
        if let Some(player) = self.players.iter().find(|p| p.pubkey == *player_pubkey) {
            player.hand.contains(card) && !player.has_played
        } else {
            false
        }
    }

    pub fn play_card(&mut self, player_pubkey: &Pubkey, card: Card) -> Result<()> {
        if let Some(player) = self.players.iter_mut().find(|p| p.pubkey == *player_pubkey) {
            if let Some(pos) = player.hand.iter().position(|c| *c == card) {
                player.hand.remove(pos);
                player.played_card = Some(card);
                player.has_played = true;
                Ok(())
            } else {
                Err(error!(crate::GameError::InvalidCard))
            }
        } else {
            Err(error!(crate::GameError::PlayerNotInGame))
        }
    }

    pub fn reset_round(&mut self) {
        for player in &mut self.players {
            player.has_played = false;
            player.played_card = None;
        }
    }

    pub fn determine_game_winner(&self) -> Option<Pubkey> {
        // Simple scoring: player with most cards remaining wins
        // In case of tie, return None
        if self.players.len() != 2 {
            return None;
        }

        let cards1 = self.players[0].hand.len();
        let cards2 = self.players[1].hand.len();

        if cards1 > cards2 {
            Some(self.players[0].pubkey)
        } else if cards2 > cards1 {
            Some(self.players[1].pubkey)
        } else {
            None // Tie
        }
    }
}
