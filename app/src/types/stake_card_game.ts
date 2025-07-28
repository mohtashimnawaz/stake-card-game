/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/stake_card_game.json`.
 */
export type StakeCardGame = {
  "address": "6zuXD18EnpDUDmuQE7rnLScq5feMbGCbSwArD9m9schE",
  "metadata": {
    "name": "stakeCardGame",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "claimWinnings",
      "discriminator": [
        161,
        215,
        24,
        59,
        14,
        236,
        242,
        221
      ],
      "accounts": [
        {
          "name": "game",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "game.game_id",
                "account": "game"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "game"
              }
            ]
          }
        },
        {
          "name": "winner",
          "writable": true,
          "signer": true
        },
        {
          "name": "winnerTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "createGame",
      "discriminator": [
        124,
        69,
        75,
        66,
        184,
        220,
        72,
        206
      ],
      "accounts": [
        {
          "name": "game",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "gameId"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "game"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "creatorTokenAccount",
          "writable": true
        },
        {
          "name": "mint"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "u64"
        },
        {
          "name": "stakeAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [],
      "args": []
    },
    {
      "name": "joinGame",
      "discriminator": [
        107,
        112,
        18,
        38,
        56,
        173,
        60,
        128
      ],
      "accounts": [
        {
          "name": "game",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "game.game_id",
                "account": "game"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "game"
              }
            ]
          }
        },
        {
          "name": "player",
          "writable": true,
          "signer": true
        },
        {
          "name": "playerTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "playCard",
      "discriminator": [
        63,
        150,
        161,
        24,
        68,
        231,
        108,
        9
      ],
      "accounts": [
        {
          "name": "game",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "game.game_id",
                "account": "game"
              }
            ]
          }
        },
        {
          "name": "player",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "card",
          "type": {
            "defined": {
              "name": "card"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "game",
      "discriminator": [
        27,
        90,
        166,
        125,
        74,
        100,
        121,
        18
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "gameFull",
      "msg": "Game is already full"
    },
    {
      "code": 6001,
      "name": "gameAlreadyStarted",
      "msg": "Game has already started"
    },
    {
      "code": 6002,
      "name": "gameNotStarted",
      "msg": "Game has not started yet"
    },
    {
      "code": 6003,
      "name": "gameAlreadyEnded",
      "msg": "Game has already ended"
    },
    {
      "code": 6004,
      "name": "notYourTurn",
      "msg": "Not your turn"
    },
    {
      "code": 6005,
      "name": "invalidCard",
      "msg": "Invalid card played"
    },
    {
      "code": 6006,
      "name": "insufficientStake",
      "msg": "Insufficient stake amount"
    },
    {
      "code": 6007,
      "name": "playerNotInGame",
      "msg": "Player not in game"
    },
    {
      "code": 6008,
      "name": "cannotJoinOwnGame",
      "msg": "Cannot join own game"
    },
    {
      "code": 6009,
      "name": "resultAlreadyClaimed",
      "msg": "Game result already claimed"
    },
    {
      "code": 6010,
      "name": "onlyWinnerCanClaim",
      "msg": "Only winner can claim"
    }
  ],
  "types": [
    {
      "name": "card",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "suit",
            "type": {
              "defined": {
                "name": "suit"
              }
            }
          },
          {
            "name": "value",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "gameId",
            "type": "u64"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "players",
            "type": {
              "vec": {
                "defined": {
                  "name": "player"
                }
              }
            }
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "gameStatus"
              }
            }
          },
          {
            "name": "currentRound",
            "type": "u8"
          },
          {
            "name": "totalRounds",
            "type": "u8"
          },
          {
            "name": "stakeAmount",
            "type": "u64"
          },
          {
            "name": "totalPool",
            "type": "u64"
          },
          {
            "name": "winner",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "resultClaimed",
            "type": "bool"
          },
          {
            "name": "deck",
            "type": {
              "vec": {
                "defined": {
                  "name": "card"
                }
              }
            }
          },
          {
            "name": "currentTurn",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "gameStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "waitingForPlayer"
          },
          {
            "name": "inProgress"
          },
          {
            "name": "ended"
          }
        ]
      }
    },
    {
      "name": "player",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pubkey",
            "type": "pubkey"
          },
          {
            "name": "hand",
            "type": {
              "vec": {
                "defined": {
                  "name": "card"
                }
              }
            }
          },
          {
            "name": "stakeAmount",
            "type": "u64"
          },
          {
            "name": "hasPlayed",
            "type": "bool"
          },
          {
            "name": "playedCard",
            "type": {
              "option": {
                "defined": {
                  "name": "card"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "suit",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "hearts"
          },
          {
            "name": "diamonds"
          },
          {
            "name": "clubs"
          },
          {
            "name": "spades"
          }
        ]
      }
    }
  ]
};
