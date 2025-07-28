use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::{constants::*, state::*, GameError};

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
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
    pub winner: Signer<'info>,
    
    #[account(
        mut,
        constraint = winner_token_account.mint == vault.mint,
        constraint = winner_token_account.owner == winner.key()
    )]
    pub winner_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

pub fn claim_winnings_handler(ctx: Context<ClaimWinnings>) -> Result<()> {
    {
        let game = &ctx.accounts.game;
        
        require!(game.status == GameStatus::Ended, GameError::GameNotStarted);
        require!(!game.result_claimed, GameError::ResultAlreadyClaimed);
        
        // Check if there's a winner and if the claimer is the winner
        match game.winner {
            Some(winner_pubkey) => {
                require!(
                    winner_pubkey == ctx.accounts.winner.key(),
                    GameError::OnlyWinnerCanClaim
                );
            }
            None => {
                // In case of a tie, both players can claim half
                require!(
                    game.players.iter().any(|p| p.pubkey == ctx.accounts.winner.key()),
                    GameError::PlayerNotInGame
                );
            }
        }
    }
    
    let (total_winnings, has_winner, game_id_bytes, game_bump) = {
        let game = &ctx.accounts.game;
        (
            game.total_pool,
            game.winner.is_some(),
            game.game_id.to_le_bytes(),
            game.bump
        )
    };
    
    let amount_to_transfer = if has_winner {
        total_winnings // Winner takes all
    } else {
        total_winnings / 2 // Split in case of tie
    };
    
    // Create PDA signer seeds
    let signer_seeds: &[&[&[u8]]] = &[&[
        GAME_SEED,
        &game_id_bytes,
        &[game_bump]
    ]];
    
    // Transfer winnings from vault to winner
    let cpi_accounts = Transfer {
        from: ctx.accounts.vault.to_account_info(),
        to: ctx.accounts.winner_token_account.to_account_info(),
        authority: ctx.accounts.game.to_account_info(),
    };
    
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
    
    token::transfer(cpi_ctx, amount_to_transfer)?;
    
    // Update game state after transfer
    let game = &mut ctx.accounts.game;
    if has_winner {
        game.result_claimed = true;
        msg!("Winner {} claimed {} tokens", ctx.accounts.winner.key(), amount_to_transfer);
    } else {
        // For ties, mark as claimed after both players claim
        game.total_pool -= amount_to_transfer;
        if game.total_pool == 0 {
            game.result_claimed = true;
        }
        msg!("Player {} claimed {} tokens (tie scenario)", ctx.accounts.winner.key(), amount_to_transfer);
    }
    
    Ok(())
}
