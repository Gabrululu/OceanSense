# OceanSense — Idea Context

## Summary

DePIN de monitoreo oceánico para el litoral peruano. Red de boyas IoT operadas por pescadores artesanales que registran datos oceánicos en Solana, con recompensas en cPEN (stablecoin pegged al Sol Peruano).

## Idea

- **Nombre**: OceanSense
- **Categoría**: DePIN + DeSci + Stablecoin regional
- **Hackathon**: WayLearn × Solana Foundation — Categoría BlueSky (DeSci + Fidelización)
- **Chain**: Solana (Devnet → Mainnet)
- **Descripción**: Red descentralizada de boyas IoT operadas por pescadores artesanales (Perú, 40,000 operadores potenciales, 3,080 km de litoral) que registran temperatura, salinidad, oleaje y contaminación on-chain, recompensando a los operadores en cPEN.

## Validation

```json
{
  "demand_signals": [
    "El Niño 2023-2024 causó $3B en pérdidas económicas en Perú por falta de monitoreo descentralizado",
    "40,000 pescadores artesanales afectados por falta de datos oceánicos en tiempo real",
    "Sistemas actuales (IMARPE, SENAHMI) son centralizados con cobertura insuficiente",
    "WeatherXM demuestra que el modelo DePIN para datos ambientales funciona y tiene demanda",
    "Solana lidera DePIN: Helium, Hivemapper, GEODNET prueban el modelo de incentivos"
  ],
  "risks": [
    {
      "category": "hardware",
      "description": "Integración IoT real (ESP32 + sensores CTD) es trabajo futuro — el MVP on-chain existe pero sin hardware físico la red no puede operar",
      "severity": "high"
    },
    {
      "category": "economic",
      "description": "Bootstrap problem: ¿quién financia el vault USDC inicial? A $1-5 USDC/lectura x red de 100 boyas x 24h = $2,400-12,000/día en recompensas necesarias",
      "severity": "high"
    },
    {
      "category": "regulatory",
      "description": "cPEN como stablecoin pegged al PEN requiere análisis de cumplimiento con SBS/SUNAT — operar un synthetic PEN puede tener implicancias regulatorias",
      "severity": "medium"
    },
    {
      "category": "market",
      "description": "UX para pescadores artesanales: conectividad, smartphones, onboarding con wallets de Solana es una barrera de adopción significativa",
      "severity": "medium"
    },
    {
      "category": "technical",
      "description": "Oracle de tipo de cambio PEN/USD para mantener el peg de cPEN — actualmente hardcodeado a 3.80, lo que no refleja variaciones del mercado",
      "severity": "medium"
    }
  ],
  "go_no_go": "go",
  "confidence": 0.72,
  "scores": {
    "founder_fit": 2,
    "mvp_speed": 3,
    "distribution": 2,
    "market_pull": 3,
    "revenue": 2,
    "total": 12,
    "threshold": 8
  },
  "next_steps": [
    "Conseguir 3-5 pescadores reales para prueba piloto con datos mock (validar UX antes de hardware)",
    "Definir modelo de financiamiento del vault: grant de Solana Foundation, PRODUCE, o co-inversión con aseguradoras pesqueras",
    "Consultar con abogado fintech peruano sobre implicancias de cPEN con SBS — considerar reemplazar por USDC puro en v1",
    "Integrar Pyth Network para oracle PEN/USD en lugar del rate hardcodeado",
    "Construir prototipo hardware mínimo: ESP32 + sensor DS18B20 (temperatura) + SIM 4G para primera prueba real",
    "Presentar a IMARPE/PRODUCE como datos complementarios (B2G) — fuente de financiamiento institucional",
    "Registrar en Colosseum para hackathon — categoría DePIN/DeSci tiene tracción"
  ],
  "integration_vs_build": "El programa on-chain personalizado es la decisión correcta — la lógica de incentivos DePIN, el vault colateralizado y el token cPEN requieren lógica on-chain propia. Integración recomendada para: Pyth (oracle PEN/USD), Token-2022 (ya integrado correctamente), posible integración futura con Marinade/Jito para rendimiento sobre el colateral USDC del vault."
}
```
