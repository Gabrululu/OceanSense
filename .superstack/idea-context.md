# OceanSense — Idea Context

## Summary

DePIN de monitoreo oceánico para el litoral peruano. Red de boyas IoT operadas por pescadores artesanales que registran datos oceánicos en Solana, con recompensas en cPEN (stablecoin pegged al Sol Peruano).

## Idea

- **Nombre**: OceanSense
- **Categoría**: DePIN + DeSci + Stablecoin regional
- **Hackathon**: WayLearn × Solana Foundation — Categoría BlueSky (DeSci + Fidelización)
- **Chain**: Solana (Devnet → Mainnet)
- **Descripción**: Red descentralizada de boyas IoT operadas por pescadores artesanales (Perú, 77,326 operadores potenciales, 3,080 km de litoral) que registran temperatura, salinidad, oleaje y contaminación on-chain, recompensando a los operadores en cPEN.

## Validation

```json
{
  "demand_signals": [
    "El Niño 2023-2024 causó $3B en pérdidas económicas en Perú por falta de monitoreo descentralizado",
    "77,326 pescadores artesanales afectados por falta de datos oceánicos en tiempo real (IMARPE ENEPA IV, 2022-2023)",
    "Sistemas actuales (IMARPE, SENAMHI) son centralizados con cobertura insuficiente",
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
      "description": "Bootstrap problem: ¿quién financia el vault USDC inicial? Mitigado en parte el 24 ago 2026: el modelo original no tenía cooldown on-chain (se podía spamear submit_reading y farmear sin límite) y pagaba $1-5 USDC/lectura x 100 boyas x 24h = $2,400-12,000/día. El rediseño agrega cooldown de 1h por boya (tope real de 24 lecturas/boya/día) y baja los montos a $0.20-2.00, dejando el peor caso en ~$4,800/día y un caso típico (mix de niveles) cerca de ~$700/día para 100 boyas — sigue siendo un costo real que hay que financiar, pero ahora escala de forma predecible en vez de ser explotable sin límite",
      "severity": "medium"
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
      "description": "Oracle de tipo de cambio PEN/USD para mantener el peg de cPEN — el programa se redesplegó de cero el 24 ago 2026 (APbuzcAP5NjhhnqJmEMLX7uEMBRsLHLuZ7rUV9VNsbfx) con la tasa 3.36 ya live y verificada on-chain (el programa anterior EawytSi... quedó huérfano); sigue siendo una constante hardcodeada que no refleja variaciones del mercado hasta que se integre un oráculo (Pyth/Switchboard)",
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
