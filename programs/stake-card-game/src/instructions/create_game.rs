use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::{constants::*, state::*, GameError};

#[derive(Accounts)]
#[instruction(game_id: u64, stake_amount: u64)]
pub struct CreateGame<'info> {
    #[account(
        init,
        payer = creator,
        space = Game::LEN,
        seeds = [GAME_SEED, &game_id.to_le_bytes()],
        bump
    )]
    pub game: Account<'info, Game>,
    
    #[account(
        init,
        payer = creator,
        seeds = [VAULT_SEED, game.key().as_ref()],
        bump,
        token::mint = mint,
        token::authority = game
    )]
    pub vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        mut,
        constraint = creator_token_account.mint == mint.key(),
        constraint = creator_token_account.owner == creator.key()
    )]
    pub creator_token_account: Account<'info, TokenAccount>,
    
    pub mint: Account<'info, token::Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn create_game_handler(ctx: Context<CreateGame>, game_id: u64, stake_amount: u64) -> Result<()> {
    require!(stake_amount >= MIN_STAKE_AMOUNT, GameError::InsufficientStake);
    
    let game = &mut ctx.accounts.game;
    let clock = Clock::get()?;
    
    // Initialize the game
    game.game_id = game_id;
    game.creator = ctx.accounts.creator.key();
    game.status = GameStatus::WaitingForPlayer;
    game.current_round = 0;
    game.total_rounds = 5; // Best of 5 rounds
    game.stake_amount = stake_amount;
    game.total_pool = 0;
    game.winner = None;
    game.result_claimed = false;
    game.deck = Game::initialize_deck();
    game.current_turn = 0;
    game.bump = ctx.bumps.game;
    game.vault_bump = ctx.bumps.vault;
    
    // Shuffle the deck using current slot
    game.shuffle_deck(clock.slot);
    
    // Add creator as first player
    let creator_player = Player {
        pubkey: ctx.accounts.creator.key(),
        hand: Vec::new(),
        stake_amount,
        has_played: false,
        played_card: None,
    };
    
    game.players = vec![creator_player];
    
    // Transfer stake from creator to vault
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.creator_token_account.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
            authority: ctx.accounts.creator.to_account_info(),
        },
    );
    
    token::transfer(transfer_ctx, stake_amount)?;
    game.total_pool += stake_amount;
    
    msg!("Game created with ID: {} by {}", game_id, ctx.accounts.creator.key());
    
    Ok(())
}
