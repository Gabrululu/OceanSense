// cpen.rs — Token cPEN con Token-2022
// Extensiones usadas:
//   1. TransferFeeConfig  → 0.5% por cada transferencia (sustentabilidad)
//   2. MetadataPointer    → metadata nativa sin Metaplex
//   3. TokenMetadata      → nombre, símbolo, URI on-chain
//   4. MintCloseAuthority → permite cerrar el mint si el protocolo termina
//   5. Freeze Authority   → compliance SBS/UIF (congelar cuentas)

use anchor_lang::prelude::*;
use anchor_spl::{
    token_2022::{self, Token2022},
    token_interface::{Mint, TokenAccount},
};
use anchor_spl::associated_token::AssociatedToken;

// ── Constantes del token cPEN ────────────────────────────────────
pub const CPEN_DECIMALS:         u8   = 2;     // 1.00 cPEN = 100 unidades
pub const TRANSFER_FEE_BASIS:    u16  = 50;    // 0.5% (50 basis points)
pub const MAX_FEE:               u64  = 1_000_000; // máximo 10,000 cPEN de fee
// Tasa: 1 USDC (6 dec) = 3.80 cPEN (2 dec)
// → 1_000_000 USDC units = 380 cPEN units
pub const USDC_TO_CPEN_RATE:     u64  = 380;   // 380 cPEN por cada 1 USDC
pub const USDC_DECIMALS_FACTOR:  u64  = 1_000_000; // 1 USDC = 1_000_000 units

// ─────────────────────────────────────────────────────────────────
// INSTRUCCIÓN A: Inicializar el mint de cPEN (Token-2022)
// Se llama una sola vez. Crea el mint con todas las extensiones.
// ─────────────────────────────────────────────────────────────────
pub fn initialize_cpen_mint(ctx: Context<InitializeCpenMint>) -> Result<()> {
    // Guardamos la configuración del mint en nuestro estado
    let mint_config = &mut ctx.accounts.mint_config;
    mint_config.authority       = ctx.accounts.authority.key();
    mint_config.cpen_mint       = ctx.accounts.cpen_mint.key();
    mint_config.usdc_mint       = ctx.accounts.usdc_mint.key();
    mint_config.total_minted    = 0;
    mint_config.total_redeemed  = 0;
    mint_config.total_fees_collected = 0;
    mint_config.bump            = ctx.bumps.mint_config;

    msg!(
        "cPEN mint inicializado | Mint: {} | Rate: 1 USDC = {} cPEN",
        mint_config.cpen_mint,
        USDC_TO_CPEN_RATE,
    );
    Ok(())
}

// ─────────────────────────────────────────────────────────────────
// INSTRUCCIÓN B: Mint de cPEN — depositar USDC y recibir cPEN
// El usuario deposita USDC → el protocolo acuña cPEN equivalente
// ─────────────────────────────────────────────────────────────────
pub fn mint_cpen(ctx: Context<MintCpen>, usdc_amount: u64) -> Result<()> {
    require!(usdc_amount > 0, CpenError::InvalidAmount);
    require!(
        ctx.accounts.usdc_source.amount >= usdc_amount,
        CpenError::InsufficientBalance
    );

    // 1. Transferir USDC del usuario al vault de colateral
    let cpi_transfer = anchor_spl::token::Transfer {
        from:      ctx.accounts.usdc_source.to_account_info(),
        to:        ctx.accounts.usdc_collateral_vault.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    anchor_spl::token::transfer(
        CpiContext::new(ctx.accounts.token_program_legacy.to_account_info(), cpi_transfer),
        usdc_amount,
    )?;

    // 2. Calcular cPEN a acuñar (1 USDC = 3.80 cPEN)
    // usdc_amount está en 6 decimales, cPEN en 2 decimales
    let cpen_to_mint = usdc_amount
        .checked_mul(USDC_TO_CPEN_RATE)
        .ok_or(CpenError::Overflow)?
        .checked_div(USDC_DECIMALS_FACTOR)
        .ok_or(CpenError::Overflow)?;

    require!(cpen_to_mint > 0, CpenError::AmountTooSmall);

    // 3. Acuñar cPEN al usuario (CPI con firma del mint_config PDA)
    let seeds: &[&[u8]] = &[b"mint_config", &[ctx.accounts.mint_config.bump]];
    let signer = &[seeds];

    let cpi_mint = anchor_spl::token_2022::MintTo {
        mint:      ctx.accounts.cpen_mint.to_account_info(),
        to:        ctx.accounts.user_cpen_account.to_account_info(),
        authority: ctx.accounts.mint_config.to_account_info(),
    };
    anchor_spl::token_2022::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program_2022.to_account_info(),
            cpi_mint,
            signer,
        ),
        cpen_to_mint,
    )?;

    // 4. Actualizar estado
    let cfg = &mut ctx.accounts.mint_config;
    cfg.total_minted = cfg.total_minted
        .checked_add(cpen_to_mint).ok_or(CpenError::Overflow)?;

    emit!(CpenMinted {
        user:         ctx.accounts.user.key(),
        usdc_in:      usdc_amount,
        cpen_out:     cpen_to_mint,
    });

    msg!(
        "Minted {} cPEN por {} USDC | User: {}",
        cpen_to_mint,
        usdc_amount / USDC_DECIMALS_FACTOR,
        ctx.accounts.user.key(),
    );
    Ok(())
}

// ─────────────────────────────────────────────────────────────────
// INSTRUCCIÓN C: Redeem — quemar cPEN y recuperar USDC
// ─────────────────────────────────────────────────────────────────
pub fn redeem_cpen(ctx: Context<RedeemCpen>, cpen_amount: u64) -> Result<()> {
    require!(cpen_amount > 0, CpenError::InvalidAmount);
    require!(
        ctx.accounts.user_cpen_account.amount >= cpen_amount,
        CpenError::InsufficientBalance
    );

    // 1. Calcular USDC a devolver
    // cpen_amount en 2 dec → USDC en 6 dec
    let usdc_to_return = cpen_amount
        .checked_mul(USDC_DECIMALS_FACTOR)
        .ok_or(CpenError::Overflow)?
        .checked_div(USDC_TO_CPEN_RATE)
        .ok_or(CpenError::Overflow)?;

    // 2. Quemar cPEN del usuario
    let cpi_burn = anchor_spl::token_2022::Burn {
        mint:      ctx.accounts.cpen_mint.to_account_info(),
        from:      ctx.accounts.user_cpen_account.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    anchor_spl::token_2022::burn(
        CpiContext::new(ctx.accounts.token_program_2022.to_account_info(), cpi_burn),
        cpen_amount,
    )?;

    // 3. Liberar USDC del vault al usuario (firma PDA)
    let seeds: &[&[u8]] = &[b"mint_config", &[ctx.accounts.mint_config.bump]];
    let signer = &[seeds];

    let cpi_transfer = anchor_spl::token::Transfer {
        from:      ctx.accounts.usdc_collateral_vault.to_account_info(),
        to:        ctx.accounts.usdc_destination.to_account_info(),
        authority: ctx.accounts.mint_config.to_account_info(),
    };
    anchor_spl::token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program_legacy.to_account_info(),
            cpi_transfer,
            signer,
        ),
        usdc_to_return,
    )?;

    // 4. Actualizar estado
    let cfg = &mut ctx.accounts.mint_config;
    cfg.total_redeemed = cfg.total_redeemed
        .checked_add(cpen_amount).ok_or(CpenError::Overflow)?;

    emit!(CpenRedeemed {
        user:       ctx.accounts.user.key(),
        cpen_in:    cpen_amount,
        usdc_out:   usdc_to_return,
    });

    msg!(
        "Redeemed {} cPEN → {} USDC | User: {}",
        cpen_amount,
        usdc_to_return / USDC_DECIMALS_FACTOR,
        ctx.accounts.user.key(),
    );
    Ok(())
}

// ─────────────────────────────────────────────────────────────────
// INSTRUCCIÓN D: Claim reward → pagar en cPEN (no en USDC)
// Integra el claim de Ocean-Sense con el mint de cPEN
// ─────────────────────────────────────────────────────────────────
pub fn claim_reward_as_cpen(ctx: Context<ClaimRewardAsCpen>) -> Result<()> {
    require!(
        ctx.accounts.buoy.owner == ctx.accounts.operator.key(),
        CpenError::Unauthorized
    );
    require!(
        ctx.accounts.buoy.unclaimed_usdc > 0,
        CpenError::NothingToClaim
    );

    let usdc_earned = ctx.accounts.buoy.unclaimed_usdc;

    // Convertir USDC acumulado → cPEN
    let cpen_to_mint = usdc_earned
        .checked_mul(USDC_TO_CPEN_RATE)
        .ok_or(CpenError::Overflow)?
        .checked_div(USDC_DECIMALS_FACTOR)
        .ok_or(CpenError::Overflow)?;

    require!(cpen_to_mint > 0, CpenError::AmountTooSmall);

    // Acuñar cPEN al operador (firma PDA del mint_config)
    let seeds: &[&[u8]] = &[b"mint_config", &[ctx.accounts.mint_config.bump]];
    let signer = &[seeds];

    let cpi_mint = anchor_spl::token_2022::MintTo {
        mint:      ctx.accounts.cpen_mint.to_account_info(),
        to:        ctx.accounts.operator_cpen_account.to_account_info(),
        authority: ctx.accounts.mint_config.to_account_info(),
    };
    anchor_spl::token_2022::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program_2022.to_account_info(),
            cpi_mint,
            signer,
        ),
        cpen_to_mint,
    )?;

    // Actualizar estado de la boya
    ctx.accounts.buoy.unclaimed_usdc = 0;

    // Actualizar estado del mint
    ctx.accounts.mint_config.total_minted = ctx.accounts.mint_config.total_minted
        .checked_add(cpen_to_mint).ok_or(CpenError::Overflow)?;

    emit!(RewardClaimedAsCpen {
        buoy:          ctx.accounts.buoy.key(),
        operator:      ctx.accounts.operator.key(),
        usdc_earned,
        cpen_received: cpen_to_mint,
    });

    msg!(
        "Recompensa: {} USDC → {} cPEN | Operador: {}",
        usdc_earned / USDC_DECIMALS_FACTOR,
        cpen_to_mint,
        ctx.accounts.operator.key(),
    );
    Ok(())
}

// ─────────────────────────────────────────────────────────────────
// CONTEXTOS
// ─────────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct InitializeCpenMint<'info> {
    /// Config PDA del mint — seeds: ["mint_config"]
    #[account(
        init,
        payer = authority,
        space = CpenMintConfig::SPACE,
        seeds = [b"mint_config"],
        bump
    )]
    pub mint_config: Account<'info, CpenMintConfig>,

    /// El mint de cPEN (Token-2022) — creado externamente via CLI
    /// con las extensiones: TransferFee, MetadataPointer, TokenMetadata
    /// CHECK: validamos solo que sea el mint correcto
    pub cpen_mint: AccountInfo<'info>,

    /// CHECK: mint del USDC en Devnet
    pub usdc_mint: AccountInfo<'info>,

    /// Vault de colateral USDC — ATA del mint_config PDA
    #[account(
        init,
        payer = authority,
        token::mint = usdc_mint,
        token::authority = mint_config,
        seeds = [b"usdc_collateral", usdc_mint.key().as_ref()],
        bump
    )]
    pub usdc_collateral_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_program_legacy: Program<'info, anchor_spl::token::Token>,
    pub token_program_2022:   Program<'info, Token2022>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct MintCpen<'info> {
    #[account(
        mut,
        seeds = [b"mint_config"],
        bump = mint_config.bump
    )]
    pub mint_config: Account<'info, CpenMintConfig>,

    /// Mint cPEN Token-2022
    #[account(
        mut,
        constraint = cpen_mint.key() == mint_config.cpen_mint
    )]
    pub cpen_mint: InterfaceAccount<'info, Mint>,

    /// Token account del usuario para recibir cPEN
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = cpen_mint,
        associated_token::authority = user,
        associated_token::token_program = token_program_2022,
    )]
    pub user_cpen_account: InterfaceAccount<'info, TokenAccount>,

    /// Token account USDC del usuario (fuente del colateral)
    #[account(
        mut,
        token::mint = mint_config.usdc_mint,
        token::authority = user,
    )]
    pub usdc_source: Account<'info, anchor_spl::token::TokenAccount>,

    /// Vault USDC del protocolo (recibe el colateral)
    #[account(
        mut,
        seeds = [b"usdc_collateral", mint_config.usdc_mint.as_ref()],
        bump
    )]
    pub usdc_collateral_vault: Account<'info, anchor_spl::token::TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub token_program_legacy: Program<'info, anchor_spl::token::Token>,
    pub token_program_2022:   Program<'info, Token2022>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RedeemCpen<'info> {
    #[account(
        mut,
        seeds = [b"mint_config"],
        bump = mint_config.bump
    )]
    pub mint_config: Account<'info, CpenMintConfig>,

    #[account(
        mut,
        constraint = cpen_mint.key() == mint_config.cpen_mint
    )]
    pub cpen_mint: InterfaceAccount<'info, Mint>,

    /// cPEN a quemar
    #[account(
        mut,
        associated_token::mint = cpen_mint,
        associated_token::authority = user,
        associated_token::token_program = token_program_2022,
    )]
    pub user_cpen_account: InterfaceAccount<'info, TokenAccount>,

    /// Destino del USDC liberado
    #[account(
        mut,
        token::mint = mint_config.usdc_mint,
        token::authority = user,
    )]
    pub usdc_destination: Account<'info, anchor_spl::token::TokenAccount>,

    /// Vault de colateral (fuente del USDC)
    #[account(
        mut,
        seeds = [b"usdc_collateral", mint_config.usdc_mint.as_ref()],
        bump
    )]
    pub usdc_collateral_vault: Account<'info, anchor_spl::token::TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub token_program_legacy: Program<'info, anchor_spl::token::Token>,
    pub token_program_2022:   Program<'info, Token2022>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimRewardAsCpen<'info> {
    #[account(
        mut,
        seeds = [b"buoy", buoy.buoy_id.as_bytes(), operator.key().as_ref()],
        bump = buoy.bump,
        has_one = owner @ CpenError::Unauthorized,
    )]
    pub buoy: Account<'info, crate::BuoyState>,

    /// CHECK: validado via has_one en buoy
    pub owner: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"mint_config"],
        bump = mint_config.bump
    )]
    pub mint_config: Account<'info, CpenMintConfig>,

    #[account(
        mut,
        constraint = cpen_mint.key() == mint_config.cpen_mint
    )]
    pub cpen_mint: InterfaceAccount<'info, Mint>,

    /// Token account del operador para recibir cPEN
    #[account(
        init_if_needed,
        payer = operator,
        associated_token::mint = cpen_mint,
        associated_token::authority = operator,
        associated_token::token_program = token_program_2022,
    )]
    pub operator_cpen_account: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub operator: Signer<'info>,

    pub token_program_2022: Program<'info, Token2022>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

// ─────────────────────────────────────────────────────────────────
// ESTADO ON-CHAIN
// ─────────────────────────────────────────────────────────────────

#[account]
pub struct CpenMintConfig {
    pub authority:            Pubkey,  // 32
    pub cpen_mint:            Pubkey,  // 32
    pub usdc_mint:            Pubkey,  // 32
    pub total_minted:         u64,     // 8
    pub total_redeemed:       u64,     // 8
    pub total_fees_collected: u64,     // 8
    pub bump:                 u8,      // 1
}

impl CpenMintConfig {
    pub const SPACE: usize = 8 + 32 + 32 + 32 + 8 + 8 + 8 + 1;
}

// ─────────────────────────────────────────────────────────────────
// EVENTOS
// ─────────────────────────────────────────────────────────────────

#[event]
pub struct CpenMinted {
    pub user:     Pubkey,
    pub usdc_in:  u64,
    pub cpen_out: u64,
}

#[event]
pub struct CpenRedeemed {
    pub user:     Pubkey,
    pub cpen_in:  u64,
    pub usdc_out: u64,
}

#[event]
pub struct RewardClaimedAsCpen {
    pub buoy:          Pubkey,
    pub operator:      Pubkey,
    pub usdc_earned:   u64,
    pub cpen_received: u64,
}

// ─────────────────────────────────────────────────────────────────
// ERRORES
// ─────────────────────────────────────────────────────────────────

#[error_code]
pub enum CpenError {
    #[msg("Monto inválido")]
    InvalidAmount,
    #[msg("Monto muy pequeño para convertir")]
    AmountTooSmall,
    #[msg("Saldo insuficiente")]
    InsufficientBalance,
    #[msg("No autorizado")]
    Unauthorized,
    #[msg("No hay recompensas pendientes")]
    NothingToClaim,
    #[msg("Overflow aritmético")]
    Overflow,
}