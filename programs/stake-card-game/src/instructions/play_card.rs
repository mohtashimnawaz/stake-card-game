use anchor_lang::prelude::*;
use crate::{state::*, GameError};

#[derive(Accounts)]
pub struct PlayCard<'info> {
    #[account(
        mut,
        seeds = [crate::constants::GAME_SEED, &game.game_id.to_le_bytes()],
        bump = game.bump
    )]
    pub game: Account<'info, Game>,
    
    pub player: Signer<'info>,
}

pub fn play_card_handler(ctx: Context<PlayCard>, card: Card) -> Result<()> {
    let game = &mut ctx.accounts.game;
    
    require!(game.status == GameStatus::InProgress, GameError::GameNotStarted);
    require!(!game.result_claimed, GameError::GameAlreadyEnded);
    
    // Find the player index
    let player_index = game
        .players
        .iter()
        .position(|p| p.pubkey == ctx.accounts.player.key())
        .ok_or(GameError::PlayerNotInGame)?;
    
    // Check if it's the player's turn (simple alternating turns)
    require!(
        (game.current_turn as usize) % game.players.len() == player_index,
        GameError::NotYourTurn
    );
    
    // Verify the player can play this card
    require!(
        game.can_play_card(&ctx.accounts.player.key(), &card),
        GameError::InvalidCard
    );
    
    // Play the card
    game.play_card(&ctx.accounts.player.key(), card)?;
    
    msg!("Player {} played card: {:?} of {:?}", 
         ctx.accounts.player.key(), 
         card.value, 
         card.suit);
    
    // Check if all players have played
    if game.players.iter().all(|p| p.has_played) {
        // Determine round winner
        if let Some(winner_idx) = game.get_round_winner() {
            msg!("Round {} winner: {}", 
                 game.current_round + 1, 
                 game.players[winner_idx].pubkey);
            
            // Winner gets to go first next round
            game.current_turn = winner_idx as u8;
        } else {
            msg!("Round {} was a tie!", game.current_round + 1);
        }
        
        game.current_round += 1;
        game.reset_round();
        
        // Check if game is over
        if game.current_round >= game.total_rounds || 
           game.players.iter().any(|p| p.hand.is_empty()) {
            game.status = GameStatus::Ended;
            game.winner = game.determine_game_winner();
            
            if let Some(winner) = game.winner {
                msg!("Game ended! Winner: {}", winner);
            } else {
                msg!("Game ended in a tie!");
            }
        }
    } else {
        // Move to next player's turn
        game.current_turn = (game.current_turn + 1) % (game.players.len() as u8);
    }
    
    Ok(())
}
