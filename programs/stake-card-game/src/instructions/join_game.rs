use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::{constants::*, state::*, GameError};

#[derive(Accounts)]
pub struct JoinGame<'info> {
    #[account(
        mut,
        seeds = [GAME_SEED, &game.game_id.to_le_bytes()],
        bump = game.bump
    )]
    pub game: Account<'info, Game>,
    
    #[account(
        mut,
        seeds = [VAULT_SEED, game.key().as_ref()],
        bump = game.vault_bump
    )]
    pub vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub player: Signer<'info>,
    
    #[account(
        mut,
        constraint = player_token_account.mint == vault.mint,
        constraint = player_token_account.owner == player.key()
    )]
    pub player_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

pub fn join_game_handler(ctx: Context<JoinGame>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    
    require!(game.status == GameStatus::WaitingForPlayer, GameError::GameAlreadyStarted);
    require!(game.players.len() < MAX_PLAYERS, GameError::GameFull);
    require!(game.creator != ctx.accounts.player.key(), GameError::CannotJoinOwnGame);
    
    // Check if player is already in the game
    require!(
        !game.players.iter().any(|p| p.pubkey == ctx.accounts.player.key()),
        GameError::PlayerNotInGame
    );
    
    let stake_amount = game.stake_amount;
    
    // Transfer stake from player to vault
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.player_token_account.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
            authority: ctx.accounts.player.to_account_info(),
        },
    );
    
    token::transfer(transfer_ctx, stake_amount)?;
    
    // Add player to game
    let new_player = Player {
        pubkey: ctx.accounts.player.key(),
        hand: Vec::new(),
        stake_amount,
        has_played: false,
        played_card: None,
    };
    
    game.players.push(new_player);
    game.total_pool += stake_amount;
    
    // Start the game if we have enough players
    if game.players.len() == MAX_PLAYERS {
        game.status = GameStatus::InProgress;
        game.deal_cards();
        
        msg!("Game started! Players have been dealt their cards.");
    }
    
    msg!("Player {} joined game {}", ctx.accounts.player.key(), game.game_id);
    
    Ok(())
}
