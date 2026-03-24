use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

// ─── Tasa de conversión: 1 USDC (6 decimales) por cada 1_000_000 lamports ───
// En Devnet usamos USDC mock con 6 decimales, igual que mainnet
// 1 lectura normal   = 1_000_000 lamports → 1 USDC (6 decimales) = 1_000_000 unidades
// 1 lectura crítica  = 5_000_000 lamports → 5 USDC
const LAMPORTS_TO_USDC: u64 = 1; // ratio 1:1 para simplificar en Devnet

#[program]
pub mod ocean_sense {
    use super::*;

    // ─────────────────────────────────────────────────────────
    // INSTRUCCIÓN 1: Registrar una nueva boya
    // ─────────────────────────────────────────────────────────
    pub fn register_buoy(
        ctx: Context<RegisterBuoy>,
        buoy_id: String,
        latitude: i64,
        longitude: i64,
        location_name: String,
    ) -> Result<()> {
        require!(buoy_id.len() <= 32, OceanSenseError::StringTooLong);
        require!(location_name.len() <= 64, OceanSenseError::StringTooLong);

        let buoy_key = ctx.accounts.buoy.key();
        let operator_key = ctx.accounts.operator.key();

        let buoy = &mut ctx.accounts.buoy;
        buoy.owner = operator_key;
        buoy.buoy_id = buoy_id;
        buoy.latitude = latitude;
        buoy.longitude = longitude;
        buoy.location_name = location_name;
        buoy.is_active = true;
        buoy.total_readings = 0;
        buoy.total_rewards = 0;
        buoy.unclaimed_usdc = 0;
        buoy.last_reading_timestamp = 0;
        buoy.bump = ctx.bumps.buoy;

        emit!(BuoyRegistered {
            buoy: buoy_key,
            owner: operator_key,
            buoy_id: buoy.buoy_id.clone(),
            latitude: buoy.latitude,
            longitude: buoy.longitude,
        });

        msg!("Boya registrada: {}", buoy.buoy_id);
        Ok(())
    }

    // ─────────────────────────────────────────────────────────
    // INSTRUCCIÓN 2: Enviar lectura oceánica
    // ─────────────────────────────────────────────────────────
    pub fn submit_reading(
        ctx: Context<SubmitReading>,
        temperature: i32,
        salinity: u32,
        wave_height: u32,
        pollution_level: u8,
        timestamp: i64,
    ) -> Result<()> {
        require!(pollution_level <= 3, OceanSenseError::InvalidPollutionLevel);
        require!(ctx.accounts.buoy.is_active, OceanSenseError::BuoyNotActive);
        require!(
            ctx.accounts.buoy.owner == ctx.accounts.operator.key(),
            OceanSenseError::Unauthorized
        );

        // Recompensa en unidades USDC (6 decimales)
        let usdc_reward: u64 = match pollution_level {
            3 => 5_000_000, // 5.00 USDC — alerta crítica
            2 => 2_000_000, // 2.00 USDC — moderado
            _ => 1_000_000, // 1.00 USDC — normal
        };

        // Extraer valores antes de borrows mutables
        let buoy_key     = ctx.accounts.buoy.key();
        let operator_key = ctx.accounts.operator.key();
        let reading_index      = ctx.accounts.buoy.total_readings;
        let buoy_latitude      = ctx.accounts.buoy.latitude;
        let buoy_longitude     = ctx.accounts.buoy.longitude;
        let buoy_id_str        = ctx.accounts.buoy.buoy_id.clone();
        let location_name_str  = ctx.accounts.buoy.location_name.clone();

        // Guardar la lectura en su PDA
        let reading = &mut ctx.accounts.reading;
        reading.buoy           = buoy_key;
        reading.operator       = operator_key;
        reading.temperature    = temperature;
        reading.salinity       = salinity;
        reading.wave_height    = wave_height;
        reading.pollution_level = pollution_level;
        reading.timestamp      = timestamp;
        reading.usdc_reward    = usdc_reward;
        reading.reading_index  = reading_index;
        reading.claimed        = false;

        // Actualizar estadísticas de la boya
        let buoy = &mut ctx.accounts.buoy;
        buoy.total_readings = buoy.total_readings
            .checked_add(1).ok_or(OceanSenseError::Overflow)?;
        buoy.total_rewards = buoy.total_rewards
            .checked_add(usdc_reward).ok_or(OceanSenseError::Overflow)?;
        buoy.unclaimed_usdc = buoy.unclaimed_usdc
            .checked_add(usdc_reward).ok_or(OceanSenseError::Overflow)?;
        buoy.last_reading_timestamp = timestamp;

        emit!(ReadingSubmitted {
            buoy: buoy_key,
            operator: operator_key,
            temperature,
            salinity,
            pollution_level,
            usdc_reward,
            timestamp,
        });

        if pollution_level == 3 {
            emit!(PollutionAlert {
                buoy: buoy_key,
                latitude: buoy_latitude,
                longitude: buoy_longitude,
                pollution_level,
                timestamp,
            });
            msg!("ALERTA: Contaminacion critica detectada en {}", location_name_str);
        }

        msg!(
            "Lectura | Boya: {} | Temp: {}.{}C | Contaminacion: {} | Recompensa: {} USDC",
            buoy_id_str,
            temperature / 100,
            temperature.abs() % 100,
            pollution_level,
            usdc_reward / 1_000_000,
        );
        Ok(())
    }

    // ─────────────────────────────────────────────────────────
    // INSTRUCCIÓN 3: Activar / desactivar boya
    // ─────────────────────────────────────────────────────────
    pub fn toggle_buoy(ctx: Context<ToggleBuoy>, active: bool) -> Result<()> {
        require!(
            ctx.accounts.buoy.owner == ctx.accounts.operator.key(),
            OceanSenseError::Unauthorized
        );
        ctx.accounts.buoy.is_active = active;
        msg!(
            "Boya {} -> {}",
            ctx.accounts.buoy.buoy_id,
            if active { "ACTIVA" } else { "INACTIVA" }
        );
        Ok(())
    }

    // ─────────────────────────────────────────────────────────
    // INSTRUCCIÓN 4: Inicializar el vault global de USDC
    // Solo se llama una vez al desplegar el protocolo
    // ─────────────────────────────────────────────────────────
    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        let vault_state = &mut ctx.accounts.vault_state;
        vault_state.authority    = ctx.accounts.authority.key();
        vault_state.usdc_mint    = ctx.accounts.usdc_mint.key();
        vault_state.vault_bump   = ctx.bumps.vault_state;
        vault_state.total_paid   = 0;
        vault_state.total_funded = 0;

        msg!(
            "Vault inicializado | Authority: {} | USDC mint: {}",
            vault_state.authority,
            vault_state.usdc_mint,
        );
        Ok(())
    }

    // ─────────────────────────────────────────────────────────
    // INSTRUCCIÓN 5: Fondear el vault con USDC
    // La organización/protocol deposita USDC para pagar operadores
    // ─────────────────────────────────────────────────────────
    pub fn fund_vault(ctx: Context<FundVault>, amount: u64) -> Result<()> {
        require!(amount > 0, OceanSenseError::InvalidAmount);

        // CPI: transferir USDC de la wallet del funder al vault
        let cpi_accounts = Transfer {
            from:      ctx.accounts.funder_token_account.to_account_info(),
            to:        ctx.accounts.vault_token_account.to_account_info(),
            authority: ctx.accounts.funder.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
        );
        token::transfer(cpi_ctx, amount)?;

        ctx.accounts.vault_state.total_funded = ctx.accounts.vault_state.total_funded
            .checked_add(amount).ok_or(OceanSenseError::Overflow)?;

        msg!("Vault fondeado con {} USDC", amount / 1_000_000);
        Ok(())
    }

    // ─────────────────────────────────────────────────────────
    // INSTRUCCIÓN 6: Reclamar recompensas en USDC
    // El operador cobra todas sus recompensas acumuladas
    // Esta es la instrucción central del Día 1
    // ─────────────────────────────────────────────────────────
    pub fn claim_reward(ctx: Context<ClaimReward>) -> Result<()> {
        let operator_key = ctx.accounts.operator.key();

        // Validaciones
        require!(
            ctx.accounts.buoy.owner == operator_key,
            OceanSenseError::Unauthorized
        );
        require!(
            ctx.accounts.buoy.unclaimed_usdc > 0,
            OceanSenseError::NothingToClaim
        );

        let amount_to_pay = ctx.accounts.buoy.unclaimed_usdc;

        // Verificar que el vault tiene fondos suficientes
        require!(
            ctx.accounts.vault_token_account.amount >= amount_to_pay,
            OceanSenseError::InsufficientVaultFunds
        );

        // ── CPI con firma del vault PDA ──────────────────────
        // El vault_state PDA firma la transferencia como authority
        // Seeds del vault_state: ["vault_state"]
        let vault_seeds: &[&[u8]] = &[b"vault_state", &[ctx.accounts.vault_state.vault_bump]];
        let signer_seeds = &[vault_seeds];

        let cpi_accounts = Transfer {
            from:      ctx.accounts.vault_token_account.to_account_info(),
            to:        ctx.accounts.operator_token_account.to_account_info(),
            authority: ctx.accounts.vault_state.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer_seeds,
        );
        token::transfer(cpi_ctx, amount_to_pay)?;

        // Actualizar estado
        let buoy = &mut ctx.accounts.buoy;
        buoy.unclaimed_usdc = 0;

        ctx.accounts.vault_state.total_paid = ctx.accounts.vault_state.total_paid
            .checked_add(amount_to_pay).ok_or(OceanSenseError::Overflow)?;

        emit!(RewardClaimed {
            buoy:            ctx.accounts.buoy.key(),
            operator:        operator_key,
            usdc_amount:     amount_to_pay,
        });

        msg!(
            "Recompensa cobrada | Operador: {} | USDC: {}",
            operator_key,
            amount_to_pay / 1_000_000,
        );
        Ok(())
    }
}

// ─────────────────────────────────────────────────────────────
// CONTEXTOS DE CUENTAS
// ─────────────────────────────────────────────────────────────

#[derive(Accounts)]
#[instruction(buoy_id: String)]
pub struct RegisterBuoy<'info> {
    #[account(
        init,
        payer = operator,
        space = BuoyState::SPACE,
        seeds = [b"buoy", buoy_id.as_bytes(), operator.key().as_ref()],
        bump
    )]
    pub buoy: Account<'info, BuoyState>,

    #[account(mut)]
    pub operator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitReading<'info> {
    #[account(mut)]
    pub buoy: Account<'info, BuoyState>,

    #[account(
        init,
        payer = operator,
        space = OceanReading::SPACE,
        seeds = [
            b"reading",
            buoy.key().as_ref(),
            &buoy.total_readings.to_le_bytes()
        ],
        bump
    )]
    pub reading: Account<'info, OceanReading>,

    #[account(mut)]
    pub operator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ToggleBuoy<'info> {
    #[account(mut)]
    pub buoy: Account<'info, BuoyState>,

    pub operator: Signer<'info>,
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    /// Estado global del vault — PDA seeds: ["vault_state"]
    #[account(
        init,
        payer = authority,
        space = VaultState::SPACE,
        seeds = [b"vault_state"],
        bump
    )]
    pub vault_state: Account<'info, VaultState>,

    /// Cuenta de token SPL del vault (custodia el USDC)
    /// Es un ATA (Associated Token Account) del vault_state PDA
    #[account(
        init,
        payer = authority,
        token::mint = usdc_mint,
        token::authority = vault_state,
        seeds = [b"vault_token", usdc_mint.key().as_ref()],
        bump
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    /// CHECK: El mint del USDC en Devnet.
    /// Validamos solo que sea una cuenta existente.
    pub usdc_mint: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct FundVault<'info> {
    #[account(
        mut,
        seeds = [b"vault_state"],
        bump = vault_state.vault_bump
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(
        mut,
        seeds = [b"vault_token", vault_state.usdc_mint.as_ref()],
        bump
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    /// Token account del funder (quien deposita USDC al vault)
    #[account(
        mut,
        token::mint = vault_state.usdc_mint,
        token::authority = funder,
    )]
    pub funder_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub funder: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimReward<'info> {
    #[account(
        mut,
        seeds = [b"buoy", buoy.buoy_id.as_bytes(), operator.key().as_ref()],
        bump = buoy.bump,
        has_one = owner @ OceanSenseError::Unauthorized,
    )]
    pub buoy: Account<'info, BuoyState>,

    /// CHECK: usamos has_one en buoy para validar que owner == operator
    pub owner: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"vault_state"],
        bump = vault_state.vault_bump
    )]
    pub vault_state: Account<'info, VaultState>,

    /// Vault que custodia el USDC — firmado via PDA
    #[account(
        mut,
        seeds = [b"vault_token", vault_state.usdc_mint.as_ref()],
        bump
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    /// Token account del operador donde recibe el USDC
    #[account(
        mut,
        token::mint = vault_state.usdc_mint,
        token::authority = operator,
    )]
    pub operator_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub operator: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

// ─────────────────────────────────────────────────────────────
// ESTADOS ON-CHAIN
// ─────────────────────────────────────────────────────────────

#[account]
pub struct BuoyState {
    pub owner: Pubkey,               // 32
    pub buoy_id: String,             // 4 + 32
    pub latitude: i64,               // 8
    pub longitude: i64,              // 8
    pub location_name: String,       // 4 + 64
    pub is_active: bool,             // 1
    pub total_readings: u64,         // 8
    pub total_rewards: u64,          // 8  (USDC acumulado histórico)
    pub unclaimed_usdc: u64,         // 8  (USDC pendiente de cobrar) ← NUEVO
    pub last_reading_timestamp: i64, // 8
    pub bump: u8,                    // 1
}

impl BuoyState {
    pub const SPACE: usize = 8 + 32 + (4+32) + 8 + 8 + (4+64) + 1 + 8 + 8 + 8 + 8 + 1;
}

#[account]
pub struct OceanReading {
    pub buoy: Pubkey,            // 32
    pub operator: Pubkey,        // 32
    pub temperature: i32,        // 4
    pub salinity: u32,           // 4
    pub wave_height: u32,        // 4
    pub pollution_level: u8,     // 1
    pub timestamp: i64,          // 8
    pub usdc_reward: u64,        // 8  (antes: reward_lamports)
    pub reading_index: u64,      // 8
    pub claimed: bool,           // 1  ← NUEVO: ¿ya se cobró esta lectura?
}

impl OceanReading {
    pub const SPACE: usize = 8 + 32 + 32 + 4 + 4 + 4 + 1 + 8 + 8 + 8 + 1;
}

#[account]
pub struct VaultState {
    pub authority: Pubkey,   // 32  — quien puede administrar el vault
    pub usdc_mint: Pubkey,   // 32  — mint del USDC en Devnet
    pub total_funded: u64,   // 8   — USDC total depositado
    pub total_paid: u64,     // 8   — USDC total pagado a operadores
    pub vault_bump: u8,      // 1
}

impl VaultState {
    pub const SPACE: usize = 8 + 32 + 32 + 8 + 8 + 1;
}

// ─────────────────────────────────────────────────────────────
// EVENTOS
// ─────────────────────────────────────────────────────────────

#[event]
pub struct BuoyRegistered {
    pub buoy: Pubkey,
    pub owner: Pubkey,
    pub buoy_id: String,
    pub latitude: i64,
    pub longitude: i64,
}

#[event]
pub struct ReadingSubmitted {
    pub buoy: Pubkey,
    pub operator: Pubkey,
    pub temperature: i32,
    pub salinity: u32,
    pub pollution_level: u8,
    pub usdc_reward: u64,
    pub timestamp: i64,
}

#[event]
pub struct PollutionAlert {
    pub buoy: Pubkey,
    pub latitude: i64,
    pub longitude: i64,
    pub pollution_level: u8,
    pub timestamp: i64,
}

#[event]
pub struct RewardClaimed {
    pub buoy: Pubkey,
    pub operator: Pubkey,
    pub usdc_amount: u64,
}

// ─────────────────────────────────────────────────────────────
// ERRORES PERSONALIZADOS
// ─────────────────────────────────────────────────────────────

#[error_code]
pub enum OceanSenseError {
    #[msg("El string excede el tamaño permitido")]
    StringTooLong,
    #[msg("Nivel de contaminación inválido (0-3)")]
    InvalidPollutionLevel,
    #[msg("La boya no está activa")]
    BuoyNotActive,
    #[msg("Solo el operador dueño puede realizar esta acción")]
    Unauthorized,
    #[msg("Overflow aritmético")]
    Overflow,
    #[msg("No hay recompensas pendientes de cobro")]
    NothingToClaim,
    #[msg("El vault no tiene fondos suficientes")]
    InsufficientVaultFunds,
    #[msg("Monto inválido")]
    InvalidAmount,
}
