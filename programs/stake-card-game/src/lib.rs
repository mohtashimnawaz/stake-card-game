pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;
pub use error::GameError;

declare_id!("6zuXD18EnpDUDmuQE7rnLScq5feMbGCbSwArD9m9schE");

#[program]
pub mod stake_card_game {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }

    pub fn create_game(ctx: Context<CreateGame>, game_id: u64, stake_amount: u64) -> Result<()> {
        create_game::create_game_handler(ctx, game_id, stake_amount)
    }

    pub fn join_game(ctx: Context<JoinGame>) -> Result<()> {
        join_game::join_game_handler(ctx)
    }

    pub fn play_card(ctx: Context<PlayCard>, card: Card) -> Result<()> {
        play_card::play_card_handler(ctx, card)
    }

    pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
        claim_winnings::claim_winnings_handler(ctx)
    }
}
