# Ocean-Sense — Pitch Deck

Slide-by-slide deck content, ready to paste into slides. This expands [`pitch.md`](pitch.md)'s §12 "Estructura sugerida" into actual per-slide copy instead of just section pointers — every number and sentence here is pulled verbatim from `pitch.md` / `README.md`, not re-derived. For colors, typography, and logo usage, see [`brandkit.md`](brandkit.md).

11 slides, problem → why now → solution → business model → credibility → vision.

---

## Slide 1 — Portada

**Visual:** logo centered, dark navy background, aqua glow accent (see `brandkit.md`).

> **Ocean-Sense**
> An ocean that pays back.

Sub-line: *DePIN ocean monitoring + cPEN stablecoin for Peru's coastline.*

---

## Slide 2 — El problema

**Three big numbers, large type, side by side:**

| 3,080 km | 77,326 | $3B |
|---|---|---|
| litoral peruano sin monitoreo en tiempo real | pescadores artesanales afectados (IMARPE ENEPA IV, 2022–2023) | pérdidas por El Niño 2023–2024 |

**Body copy:**
> Los sistemas existentes (IMARPE, SENAMHI) son centralizados, con cobertura insuficiente, y no dan ningún incentivo para que la comunidad participe.

**Closing line (the insight, said out loud):**
> El activo más valioso para monitorear el océano — los pescadores que ya están en el agua todos los días — no tiene ningún incentivo económico para reportar lo que ve. Ocean-Sense se lo da.

---

## Slide 3 — Por qué ahora

**Headline:** *No es un problema hipotético — está pasando mientras se arma este pitch.*

- ENFEN: **41% probabilidad de El Niño extraordinario**, **43% fuerte** — empeorando mes a mes.
- NOAA: **>90% probabilidad de un evento muy fuerte** para 2026–27, posiblemente uno de los más intensos desde 1950.
- Impacto ya medible: biomasa de anchoveta deprimida dentro de las **10 millas náuticas** — exactamente donde opera la pesca artesanal.
- Hasta los defensores de IMARPE admiten en julio 2026 que Perú necesita "expandir sus capacidades de observación."

**Citation line (small type, bottom of slide):** ENFEN Comunicado Oficial N°11-2026 · NOAA GFDL · Infobae (15 y 1 jul 2026) · DHN · IMARPE SIOFEN — full links in `pitch.md` §4.

---

## Slide 4 — La solución

**5-step diagram (horizontal flow):**

1. Pescadores operan boyas IoT en sus zonas de pesca
2. Boyas envían lecturas oceánicas a Solana
3. El programa on-chain valida y graba cada lectura de forma inmutable
4. El operador recibe **cPEN** por cada dato válido
5. Alertas críticas de contaminación se emiten en tiempo real on-chain

**Tagline under the diagram:** *DePIN + stablecoin local, en un solo protocolo.*

---

## Slide 5 — El incentivo

**Reward table:**

| Nivel | Descripción | Pago |
|---|---|---|
| 0 | Agua limpia | 0.20 USDC |
| 1 | Contaminación leve | 0.30 USDC |
| 2 | Contaminación moderada | 0.75 USDC |
| 3 | Contaminación crítica 🚨 | **2.00 USDC (10×)** |

\+ **1.00 USDC de bono único** en la primera lectura de cada boya nueva.

**Callout box:** *Cooldown de 1 hora por boya, verificado contra el reloj on-chain — sin techo, el modelo original se podía farmear en loop por centavos de fee. Ahora el costo del protocolo escala de forma predecible.*

---

## Slide 6 — El modelo de negocio

**Headline:** *Los datos son públicos y gratis. Lo que se cobra es la capa de encima.*

- Cualquiera lee las lecturas crudas directo de Solana — son PDAs permissionless, no se puede poner un paywall a un ledger público.
- Lo que se vende: agregación, exportación histórica, alertas en tiempo real y SLA — a PRODUCE, SERNANP, DICAPI, la Marina, aseguradoras e investigadores.
- **No hay un sistema de facturación aparte.** Una suscripción institucional es un `fund_vault()` real — el mismo vault de USDC del que los operadores cobran. El ingreso por datos y las recompensas de los pescadores son el mismo pool.

**Callout box:** *`/data` lo hace en vivo: tiers de precio, un botón que dispara una suscripción real contra Devnet, y un endpoint `/api/v1/readings` que se puede golpear en el momento.*

---

## Slide 7 — Demo / producto real

**Visual:** 4–5 screenshots — dashboard con mapa en vivo, formulario de lectura, pantalla de claim, swap cPEN↔USDC, página de data access.

**Caption:** *No son wireframes — es la app real corriendo en Solana Devnet.*

(Take fresh screenshots before presenting — grab them from `/`, `/reading`, `/claim`, `/cpen`, `/data` on the running app.)

---

## Slide 8 — Por qué Solana

| Criterio | Por qué importa |
|---|---|
| Fees < $0.001 | Lecturas cada hora — fees altos harían el modelo inviable |
| Confirmación sub-segundo | Alertas de contaminación deben llegar en segundos |
| Token-2022 | Transfer Fee + Freeze Authority nativos, sin código extra |
| Ecosistema DePIN líder | Ya es el hogar de Helium, Hivemapper, GEODNET |
| Componible | Otros protocolos leen los datos de Ocean-Sense sin permiso |

---

## Slide 9 — Estado actual

**Headline:** *No es solo una idea.*

✅ Programa on-chain funcionando (boyas, lecturas, vault USDC, cPEN mint/redeem/claim) · Frontend completo (dashboard, mapa, claim, swap) · Demo de monetización (`/data` — suscripciones institucionales + API real) · SDK propio (`@oceansense/sdk`) · Gateway IoT real (ESP32 → HTTP → Solana) · `BUOY_SPEC.md` — hardware documentado · Modelo económico auditado y corregido en vivo (no solo demoístico) · Live en Solana Devnet, dirección real, boya `LIMA-001` operativa.

---

## Slide 10 — Roadmap

**Después del hackathon:** oráculo Pyth/Switchboard para el tipo de cambio · validación cruzada de lecturas anómalas · staking de operadores · boya física v0.1 frente a la costa de Lima · gatear `/api/v1` por API key y facturación real por tier.

**Visión:** predicción de zonas de pesca con IA · dashboard para PRODUCE/SERNANP/DICAPI/Marina · marketplace de datos oceánicos a mayor escala · expansión a otras costas de LATAM.

---

## Slide 11 — Cierre

> Construido para el **Solana Frontier Hackathon** — Colosseum × Solana Foundation, 2026.
> Postulado en **Public Goods** y **University**.

**Closing line, large type:**
> An ocean that pays back.

CTA: *oceansense.app (o el dominio que corresponda)*
