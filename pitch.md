# Ocean-Sense — Pitch

Todo lo necesario para hablar del proyecto: qué es, qué problema resuelve, cómo funciona, por qué es creíble, y bloques de texto listos para pegar en un deck, un post o una candidatura de hackathon. Para colores/tipografía/logo, ver [`brandkit.md`](./brandkit.md) — este archivo es solo contenido/narrativa.

Todas las cifras salen de `README.md` — no inventar números nuevos al armar slides.

---

## 1. One-liner

> DePIN ocean monitoring + cPEN stablecoin for Peru's coastline.

---

## 2. Elevator pitch, en 3 largos

### 15 segundos
> Ocean-Sense paga a pescadores artesanales peruanos en un stablecoin propio por cada dato oceánico que suben a Solana desde sus boyas — resolviendo un vacío de monitoreo que le costó al país $3,000 millones en el último El Niño.

### 30 segundos
> Ocean-Sense es una red DePIN de boyas IoT operadas por pescadores artesanales que registra datos oceánicos en tiempo real sobre Solana, con recompensas automáticas en cPEN — un stablecoin anclado al Sol peruano. Cada lectura de temperatura, salinidad, oleaje o contaminación queda registrada on-chain de forma inmutable, y las alertas críticas se pagan 10 veces más para incentivar el reporte urgente.

### 1 minuto (problema + solución completa)
> Perú tiene 3,080 km de litoral sin monitoreo oceánico en tiempo real. La falta de datos confiables sobre temperatura, corrientes y contaminación afecta directamente a 77,326 pescadores artesanales. El fenómeno El Niño 2023–2024 causó $3,000 millones en pérdidas económicas porque no existía infraestructura descentralizada de alerta temprana. Los sistemas actuales (IMARPE, SENAMHI) son centralizados, tienen cobertura insuficiente y no incentivan la participación comunitaria.
>
> Ocean-Sense resuelve esto combinando DePIN + un stablecoin local en un solo protocolo: los pescadores operan boyas IoT en sus zonas de pesca, las boyas envían lecturas oceánicas a Solana vía transacciones, el programa on-chain valida y registra cada lectura de forma inmutable, y los operadores reciben cPEN — pegado 1:1 al Sol peruano — por cada dato válido. Las alertas críticas de contaminación se emiten en tiempo real on-chain y pagan 10× más, para que reportar rápido sea lo más rentable.

---

## 3. El problema

- **3,080 km** de litoral peruano sin monitoreo oceánico en tiempo real.
- **77,326 pescadores artesanales** (23,138 embarcaciones) afectados directamente por la falta de datos confiables — cifra oficial de la Cuarta Encuesta Estructural de la Pesquería Artesanal de IMARPE (ENEPA IV, 2022–2023).
- **$3,000 millones USD** en pérdidas económicas por el fenómeno El Niño 2023–2024 — sin infraestructura descentralizada de alerta temprana.
- Los sistemas existentes (**IMARPE, SENAMHI**) son centralizados, con cobertura insuficiente, y no dan ningún incentivo para que la comunidad participe activamente.

**El insight central:** el activo más valioso para monitorear el océano — los pescadores que ya están en el agua todos los días — no tiene ningún incentivo económico para reportar lo que ve. Ocean-Sense se lo da.

---

## 4. Por qué ahora (agosto 2026)

Esto no es un problema hipotético para justificar el pitch — está pasando mientras se escribe este documento.

### El Niño 2026-2027 se está intensificando, no calmando

- El **ENFEN mantiene "Alerta de El Niño Costero"** activa en todo el litoral peruano. La probabilidad de un evento **extraordinario subió a 41%** y la de uno **fuerte a 43%** — un empeoramiento respecto al pronóstico de julio 2026, con las probabilidades de escenarios moderado/débil reducidas a un margen mínimo.
- Pronóstico oficial: **intensidad fuerte en agosto–septiembre 2026**, oscilando entre **fuerte y muy fuerte de octubre 2026 a febrero 2027**, con el fenómeno extendiéndose hasta abril 2027.
- NOAA coincide desde el lado internacional: **más de 90% de probabilidad de un evento muy fuerte** para el verano boreal 2026–27 — posiblemente **uno de los más intensos jamás registrados** desde que existen registros comparables (1950), con 69% de probabilidad de que el índice RONI supere +2.5°C.
- **Impacto ya medible, no proyectado:** la biomasa de anchoveta centro-norte permanece deprimida frente a la costa central, concentrada dentro de las **10 millas náuticas** — la franja exacta donde opera la pesca artesanal.

### El vacío institucional es real, y hasta sus defensores lo admiten

- **DHN** publica avisos frecuentes y granulares (oleaje, viento) segmentados por tramo de costa, actualizados cada 2–3 días — muestra que hay demanda real de datos frecuentes y localizados, exactamente lo que una red de boyas puede alimentar de forma distribuida y en tiempo real.
- **IMARPE** monitorea con buques científicos (BIC), boyas ARGO, gliders y satélite — instrumental sofisticado pero disperso, orientado a mar abierto, no a una red densa cerca de la costa.
- En julio de 2026 hubo una **controversia pública** sobre si IMARPE tiene "boyas insuficientes". El artículo que salió a defenderlo, aun así, termina reconociendo que "Perú necesita invertir más [...] y expandir sus capacidades de observación". Ocean-Sense no compite con la ciencia de mar abierto de IMARPE — llena el vacío nearshore y en tiempo real que incluso sus propios defensores admiten que falta.

### Por qué esto importa para el pitch

No estamos vendiendo una solución a un problema pasado (El Niño 2023–2024, ya en el README). Estamos ofreciendo infraestructura justo cuando el próximo evento — potencialmente el más fuerte en más de 70 años — está escalando en tiempo real frente a la costa que este protocolo busca monitorear.

**Fuentes:**
- [ENFEN — Comunicado Oficial N° 11-2026](https://www.gob.pe/institucion/imarpe/noticias/1406677-comunicado-oficial-enfen-n-11-2026-estado-del-sistema-de-alerta-alerta-de-el-nino-costero)
- [Infobae — "El Niño Costero se intensifica..." (15 ago 2026)](https://www.infobae.com/peru/2026/08/15/el-nino-costero-se-intensifica-y-anticipan-temperaturas-muy-por-encima-de-lo-normal-hasta-2027/)
- [NOAA GFDL — August 2026 El Niño Predictions](https://www.gfdl.noaa.gov/prediction/august-2026-el-nino-predictions/)
- [The Watchers — "El Niño forecast to reach historic strength..." (17 ago 2026)](https://watchers.news/2026/08/17/el-nino-forecast-to-reach-historic-strength-ahead-of-winter-2026-27/)
- [DHN — Avisos Especiales](https://www.dhn.mil.pe/portal/avisos-especiales)
- [IMARPE SIOFEN — Monitoreo](https://siofen.imarpe.gob.pe/principal/monitoreo)
- [Infobae — "Lo que no se dijo sobre el IMARPE" (1 jul 2026)](https://www.infobae.com/peru/2026/07/01/lo-que-no-se-dijo-sobre-el-imarpe/)
- [IMARPE — ENEPA IV (2022–2023), cifra de 77,326 pescadores](https://cdn.www.gob.pe/uploads/document/file/6908889/5966295-cuarta-encuesta-estructural-de-la-pesqueria-artesanal-en-el-litoral-peruano-enepa-iv-2022-2023.pdf)

---

## 5. La solución — cómo funciona

1. El pescador registra su boya IoT en Solana (`register_buoy`).
2. La boya envía lecturas oceánicas — temperatura, salinidad, oleaje, nivel de contaminación (`submit_reading`).
3. El programa on-chain valida y graba cada lectura de forma inmutable.
4. El operador recibe **cPEN** (Crypto PEN, pegado 1:1 al Sol peruano) por cada dato válido.
5. Las alertas críticas de contaminación se emiten en tiempo real on-chain.

### Modelo de recompensas (rediseñado para ser sostenible, no solo generoso)

| Nivel de contaminación | Descripción | Pago |
|---|---|---|
| 0 | Agua limpia | 0.20 USDC |
| 1 | Contaminación leve | 0.30 USDC |
| 2 | Contaminación moderada | 0.75 USDC |
| 3 | Contaminación crítica 🚨 | **2.00 USDC (10×)** |

+ **1.00 USDC de bono único** la primera vez que una boya envía su primera lectura (incentiva sumar operadores nuevos sin ser un costo recurrente).

La primera versión de este modelo pagaba 1.00–5.00 USDC por lectura **sin ningún límite de frecuencia on-chain** — cualquiera podía llamar `submit_reading` en loop y farmear recompensas, porque una transacción en Solana cuesta centavos. Dos cambios lo arreglan: un **cooldown de 1 hora por boya** (verificado contra el reloj on-chain, no contra un timestamp que manda el cliente y se podría falsear) que pone un techo matemático real al costo del protocolo, y montos base más bajos con un múltiplo crítico más alto (10× en vez de 5×) — reportar una alerta real sigue siendo, con claridad, lo más rentable que puede hacer un pescador.

### cPEN — el stablecoin

| Propiedad | Valor |
|---|---|
| Nombre / símbolo | Crypto PEN / cPEN |
| Peg | 1 cPEN = 1 Sol peruano (PEN) |
| Colateral | USDC (1 USDC = 3.36 cPEN — tasa de mercado real, 24 ago 2026) |
| Estándar | Token-2022 |
| Transfer fee | 0.5% (50 bps) |
| Freeze authority | Sí — compliance SBS/UIF |

### Cómo se monetiza (y cómo eso financia las recompensas)

Los datos crudos son públicos por diseño — viven en PDAs permissionless en Solana, cualquiera los lee vía RPC sin pedir permiso. Eso significa que no se puede poner un paywall al dato crudo; lo que sí se monetiza es la capa de encima: agregación, exportación histórica, alertas en tiempo real y SLA — vendida como suscripción institucional a PRODUCE, SERNANP, DICAPI, la Marina, aseguradoras e investigadores.

No hay un sistema de facturación separado. Una "suscripción" institucional es, literalmente, un `fund_vault()` real — la misma instrucción de vault de USDC del programa (antes inactiva, ahora inicializada) de la que los operadores retiran vía `claim_reward`. El ingreso por datos y el pago a los pescadores **son el mismo pool**, no dos sistemas que hay que conciliar. Esto se puede ver funcionando en `/data`: tiers de precio (ilustrativos), un panel que hace la suscripción en vivo contra Devnet, y un endpoint `/api/v1/readings` real que se puede golpear en el momento — no es una maqueta.

---

## 6. Por qué es creíble (no es solo una idea)

Para un jurado de hackathon, esto es lo que separa a Ocean-Sense de un mockup:

- **Programa on-chain funcionando**: instrucciones completas de registro de boya, envío de lectura, vault de USDC, claim de recompensas, y el módulo cPEN completo (mint/redeem/claim) — todo con tests en TypeScript.
- **Frontend funcional de punta a punta**: dashboard con mapa en vivo, formulario de registro/lectura, claim de recompensas, swap cPEN↔USDC — no son wireframes, es la app real corriendo en Solana Devnet.
- **SDK propio**: `@oceansense/sdk`, cliente TypeScript agnóstico de framework, para que terceros puedan integrar sin copiar el código del frontend.
- **Gateway IoT real**: puente HTTP Node.js que conecta un ESP32 físico a una transacción de Solana — no es una simulación, hay un camino de hardware a blockchain ya construido.
- **Monetización demostrada, no solo mencionada**: `/data` hace una suscripción institucional real (`fund_vault` contra Devnet) y expone un endpoint de datos real (`/api/v1/readings`) — el modelo de negocio completo (quién paga → cómo se financian las recompensas) se puede ver funcionando, no solo leerlo en un slide.
- **Especificación de hardware completa**: `BUOY_SPEC.md` documenta el prototipo físico de la boya, no solo el software.
- **Modelo económico auditado y corregido, no solo demoístico**: el sistema de recompensas se probó en vivo contra Devnet, se detectó que no tenía límite de frecuencia (riesgo real de farming), y se rediseñó con cooldown on-chain y montos calibrados — la clase de rigor que un jurado técnico puede verificar leyendo el código, no solo el pitch.

---

## 7. Por qué Solana

| Criterio | Por qué importa para Ocean-Sense |
|---|---|
| Fees < $0.001 | Los pescadores suben lecturas cada hora — fees altos harían el modelo inviable |
| Confirmación sub-segundo | Las alertas de contaminación deben llegar en segundos, no minutos |
| Token-2022 | Transfer Fee y Freeze Authority nativos, sin código extra para compliance |
| Ecosistema DePIN líder | Solana ya es el hogar de Helium, Hivemapper, GEODNET |
| Componible | Otros protocolos pueden leer los datos de Ocean-Sense sin permiso |

---

## 8. Estado actual y roadmap

### ✅ Hecho (Solana Frontier Hackathon)
Registro on-chain de boyas con PDAs · lecturas oceánicas inmutables con alertas de contaminación · vault de USDC + claim vía CPI · token cPEN con Token-2022 (Transfer Fee + Metadata + Freeze) · mint/redeem cPEN↔USDC con vault de colateral · frontend completo (dashboard, mapa, claim, swap) · soporte multi-wallet (Phantom, Solflare, Backpack, Coinbase) · suite de tests en TypeScript · tipo de cambio USD/PEN en vivo · SDK propio · gateway IoT ESP32→Solana · especificación de hardware · demo de monetización (`/data` — suscripciones institucionales vía `fund_vault` + endpoint `/api/v1/readings`).

### 🔜 Después del hackathon
Oráculo on-chain de tipo de cambio PEN/USD (Pyth/Switchboard) · validación cruzada entre pares de lecturas anómalas · staking de operadores (skin in the game) · despliegue de la boya física v0.1 frente a la costa de Lima.

### 🔮 Visión a largo plazo
Predicción de zonas de pesca con IA · dashboard para PRODUCE, SERNANP, DICAPI y la Marina de Guerra del Perú · marketplace de datos oceánicos para investigadores y aseguradoras · expansión a otras costas de Latinoamérica.

---

## 9. Contexto de hackathon

> Construido para el **Solana Frontier Hackathon** — Colosseum × Solana Foundation, 2026.

Postulado en los tracks **Public Goods** y **University** — un protocolo diseñado para darle a más de 77,000 pescadores artesanales del litoral peruano la inteligencia oceánica en tiempo real que nunca tuvieron.

---

## 10. Taglines

- **Principal** (hero del sitio): *"An ocean that pays back."*
- **Secundaria** (footer): *"Built for the Peruvian coast."*
- **Alternativa para pitch en español**: *"Un océano que retribuye."*

---

## 11. Bloques de copy listos para usar

**Bio corta (Twitter/X, Discord — ~160 caracteres):**
> DePIN ocean monitoring for Peru's coast. IoT buoys → Solana → cPEN rewards for artisanal fishers. Built on Solana Devnet.

**Descripción larga (LinkedIn, listing de hackathon):**
> Ocean-Sense is a DePIN network of IoT buoys operated by artisanal fishers along Peru's 3,080 km coastline. Every verified ocean reading — temperature, salinity, wave height, pollution — is recorded on Solana and rewarded in cPEN, a stablecoin pegged to the Peruvian Sol. Built with Anchor + Token-2022 on Solana Devnet.

**Meta description (ya en producción — reusar tal cual para SEO/OG):**
> Decentralized ocean monitoring network for Peru's coastline. IoT buoys operated by artisanal fishers, rewarded in cPEN on Solana.

**CTA de cierre de slide:**
> An ocean that pays back. — oceansense.app *(o el dominio que corresponda)*

---

## 12. Estructura sugerida para un pitch deck

Un orden que sigue el problema→por qué ahora→solución→credibilidad→visión clásico, con los materiales de este archivo mapeados a cada slide:

1. **Portada** — logo + tagline (*"An ocean that pays back."*)
2. **El problema** — sección 3, con las 3 cifras grandes (3,080 km / 77,326 / $3B)
3. **Por qué ahora** — sección 4, El Niño 2026 intensificándose + el vacío institucional (con fuentes)
4. **La solución** — sección 5, diagrama de 5 pasos
5. **El incentivo** — tabla de recompensas (sección 5), remarcar el cooldown anti-spam y el 10× en crítico
6. **El modelo de negocio** — cómo se monetiza y cómo eso financia las recompensas (sección 5, "Cómo se monetiza")
7. **Demo / producto real** — screenshots del dashboard, mapa, claim, data access (sección 6)
8. **Por qué Solana** — tabla de la sección 7
9. **Estado actual** — checklist de lo construido (sección 8)
10. **Roadmap** — post-hackathon + visión (sección 8)
11. **Cierre** — contexto de hackathon (sección 9) + tagline

Contenido slide-by-slide completo en [`DECK.md`](DECK.md).

---

## 13. Preguntas frecuentes al pitchear

**¿Esto ya funciona con pescadores reales?**
No todavía — está en Solana Devnet como prototipo del hackathon. El roadmap post-hackathon incluye el despliegue de la boya física v0.1 frente a la costa de Lima — el mismo lugar donde ya está registrada la boya piloto en Devnet (`LIMA-001`).

**¿Cómo se mantiene el peg 1 cPEN = 1 PEN?**
Colateralizado con USDC al tipo de cambio vigente (actualizado a 1 USDC = 3.36 cPEN, la tasa de mercado real; el roadmap incluye un oráculo on-chain para que ese tipo de cambio sea dinámico vía Pyth/Switchboard en vez de una constante que hay que actualizar a mano).

**¿Por qué bajaron las recompensas de 1–5 USDC a 0.20–2 USDC por lectura?**
Porque el modelo original no tenía límite de frecuencia on-chain — se podía spamear `submit_reading` y farmear recompensas casi gratis (una transacción en Solana cuesta centavos). El nuevo modelo agrega un cooldown de 1 hora por boya y baja los montos base, pero sube el múltiplo de la alerta crítica de 5× a 10× — el costo del protocolo ahora escala de forma predecible, y reportar algo urgente sigue siendo, con más margen que antes, lo más rentable de hacer.

**¿Por qué no usar una blockchain más establecida para pagos?**
Por costo y velocidad: con fees por debajo de $0.001 y confirmación sub-segundo, es el único entorno donde pagar por cada lectura horaria de cientos de boyas es económicamente viable.

**¿Qué pasa si alguien manda datos falsos para cobrar más?**
Es la razón del ítem de roadmap "validación cruzada entre pares" — hoy el prototipo confía en el operador registrado por PDA; la validación cruzada y el staking son los siguientes pasos para mitigar el riesgo de datos falsos.
