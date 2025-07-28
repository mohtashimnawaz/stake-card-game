use anchor_lang::prelude::*;

#[error_code]
pub enum GameError {
    #[msg("Game is already full")]
    GameFull,
    #[msg("Game has already started")]
    GameAlreadyStarted,
    #[msg("Game has not started yet")]
    GameNotStarted,
    #[msg("Game has already ended")]
    GameAlreadyEnded,
    #[msg("Not your turn")]
    NotYourTurn,
    #[msg("Invalid card played")]
    InvalidCard,
    #[msg("Insufficient stake amount")]
    InsufficientStake,
    #[msg("Player not in game")]
    PlayerNotInGame,
    #[msg("Cannot join own game")]
    CannotJoinOwnGame,
    #[msg("Game result already claimed")]
    ResultAlreadyClaimed,
    #[msg("Only winner can claim")]
    OnlyWinnerCanClaim,
}
