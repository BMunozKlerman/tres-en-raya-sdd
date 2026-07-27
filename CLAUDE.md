# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es este repositorio

Tarea 1 del Diploma de Postítulo en Ingeniería de Software (DCC, Universidad de Chile): un tres en raya (tic-tac-toe) con interfaz web, construido íntegramente con el flujo SDD (Spec-Driven Development) de Spec Kit — `constitution → specify → plan → tasks → implement`. Trabajo en grupo de 4 personas.

Se evalúa: proceso 60%, producto 30%, presentación 10%. La calidad de las specs, la trazabilidad de cada cambio y el uso correcto del agente pesan más que el código en sí.

## Requisitos funcionales

**RF-1 Modos de juego**
- Humano vs humano (mismo dispositivo).
- Humano vs agente.

**RF-2 Niveles del agente** (deben ser distinguibles jugando, no solo en el código):
- **sencillo**: elige entre las jugadas legales sin evaluar consecuencias; sin memoria.
- **medio**: gana si puede ganar en este turno, bloquea si el rival ganaría en el siguiente; tiene memoria de la partida en curso.
- **complejo**: nunca pierde una partida clásica; tiene memoria persistente entre partidas.

**RF-3 Modalidades**
- **clásica**: una ficha por turno en una casilla vacía; empate al llenarse el tablero; la victoria tiene precedencia sobre el empate si ambas se detectan en la novena jugada.
- **continua**: cada jugador tiene exactamente 3 fichas; hay una fase de colocación y luego una fase de movimiento hacia una casilla vacía; en esta modalidad **no existe el empate**.

**RF-4 Interfaz**
- Configuración de modo/nivel/ficha/modalidad antes de iniciar la partida.
- Reinicio disponible en cualquier momento.
- Marcador visible de la sesión.

**No funcionales**
- El agente debe responder en menos de 1 segundo, en cualquier nivel.
- El README debe permitir ejecutar el proyecto en 3 pasos o menos.
- Operable con mouse; operable por teclado es un objetivo deseable, no obligatorio.

## Reglas del proceso — no negociables

1. **La spec es la fuente de verdad.** Código, plan y tareas son derivados de ella. Ningún cambio de comportamiento empieza tocando código directamente.
2. **Depuración spec-first.** Un bug se reproduce primero como un test que falla (ese RED se commitea fallando), se diagnostica como un criterio incompleto o mal definido, se corrige `spec.md`, y solo entonces se regenera el código afectado. Nunca se parcha el código a mano.
3. **Cobertura total por criterio.** Todo criterio de aceptación (CA) debe estar cubierto por al menos un test cuyo nombre contenga el CA-ID correspondiente.
4. **Un commit por tarea**, con tests en verde antes de commitear. Nada de commits monolíticos ni squash: el historial de commits es la evidencia del proceso.
5. **Ediciones manuales solo para detalles sin comportamiento** (texto, CSS). Deben quedar registradas en la tabla correspondiente del README.
6. **Todo uso de IA fuera del flujo SDD se declara en el README.**

## Convenciones de nomenclatura

- User story: `US-<área>-<n>`
- Criterio de aceptación: `CA-<área>-<nn>`
- Tarea: `T-NNN`
- Commit: `T-NNN: descripción (CA-X-NN, ...)`
- Test: `describe('CA-X-NN', ...)`
- Áreas: `M` motor · `A` agentes · `I` interfaz · `N` no funcionales

### Formato EARS para criterios

- `EL SISTEMA SHALL <r>`
- `WHEN <e>, EL SISTEMA SHALL <r>`
- `WHILE <s>, EL SISTEMA SHALL <r>`
- `IF <c>, THEN EL SISTEMA SHALL <r>`
- `WHERE <f>, EL SISTEMA SHALL <r>`

Un criterio = una respuesta observable. Palabras vagas prohibidas: *correctamente, intuitivo, rápido, razonable*. Si no se puede nombrar la aserción del test en una frase, el criterio es ambiguo y hay que reescribirlo.

## Stack y arquitectura

- **Vite** + **JavaScript vanilla** (ES modules) + **Vitest**. Sin frameworks de UI ni dependencias de runtime.
- `src/engine.js` — motor puro: reglas, modalidades, fases. Sin DOM.
- `src/agents.js` — agentes puros (los 3 niveles). Sin DOM.
- `src/ui.js` — render y manejo de eventos.

Regla de dependencia: la UI depende del motor y de los agentes; el motor y los agentes **no conocen la UI**.

Estado inmutable: una jugada ilegal retorna un error y deja el estado intacto (no lo muta).

```
estado = {
  tablero: Array(9) de 'X' | 'O' | null,
  turno,
  modalidad,
  fase,
  fichasColocadas,
  resultado
}
```

### Contratos

- `jugadasLegales(estado) -> Jugada[]`
- `aplicarJugada(estado, jugada) -> estado' | {error, motivo}`
- `elegirJugada(estado, nivel, memoria) -> {jugada, memoria'}` — determinista.

## Secuencia de trabajo (Spec Kit)

Una feature a la vez, en este orden: `001-motor-de-juego → 002-agentes → 003-interfaz`.

Por feature:
1. `/speckit.specify` → commit
2. `/speckit.clarify` → commit
3. `/speckit.plan` → commit
4. `/speckit.tasks` → `/speckit.analyze` → commit
5. `/speckit.implement` **una tarea por invocación** (nunca sin argumentos)

### Dentro de cada `/speckit.implement`

1. Escribir el test RED con el CA-ID en el `describe`, demostrar que falla.
2. Commit `test(...)` con el test fallando.
3. Implementación mínima para que pase.
4. Suite completa en verde.
5. Commit `T-NNN`.
6. Registrar en `traceability.md`: TaskID, CA-IDs cubiertos, y el SHA **real** del commit.
7. Detenerse y reportar. No encadenar la siguiente tarea sin instrucción explícita.

## Qué NO hacer

- No escribir código de producción fuera de `/speckit.implement`.
- No elegir tecnología dentro de una spec (eso va en el plan).
- No describir algoritmos (minimax, poda alfa-beta, memoización) en la spec de agentes — la spec describe comportamiento observable; la técnica va en el plan.
- No parchar a mano un bug de comportamiento.
- No agregar funcionalidad que ningún criterio pida.
- No inventar SHA en `traceability.md`.
- No hacer squash de commits.
- No usar `/speckit.implement` sin argumentos.
- Si una tarea es insuficiente o contradice la spec: detenerse y reportar, no improvisar.

## Decisiones pendientes del grupo — BLOQUEANTES

Estas preguntas afectan directamente cómo se escriben las specs de motor y agentes para la modalidad continua. **Mientras una fila siga sin resolver, no se debe avanzar sobre esa parte de la spec** — hay que preguntar y detenerse, nunca decidir por cuenta propia.

| # | Pregunta | Decisión | Fecha |
|---|----------|----------|-------|
| 1 | En fase de movimiento, ¿a cualquier casilla vacía o solo adyacente? | _pendiente_ | |
| 2 | ¿Qué pasa si una posición se repite indefinidamente? | _pendiente_ | |
| 3 | ¿Se puede volver en el turno siguiente a la casilla recién dejada? | _pendiente_ | |
| 4 | ¿Quién abre la fase de movimiento tras la 6ª colocación? | _pendiente_ | |
| 5 | ¿Los 3 niveles juegan también en modalidad continua? | _pendiente_ | |
| 6 | "Memoria persistente": ¿solo la sesión del navegador o entre recargas? | _pendiente_ | |
| 7 | ¿Cómo se observa la memoria, si minimax ya juega óptimo sin ella? | _pendiente_ | |
| 8 | ¿Qué significa "óptimo" en continua, donde el árbol no termina ni hay empate? | _pendiente_ | |

## Estado actual

- [ ] `specify init` ejecutado
- [ ] `/speckit.constitution` commiteado
- [ ] Spec 001-motor-de-juego (specify/clarify/plan/tasks/analyze)
- [ ] Spec 002-agentes (specify/clarify/plan/tasks/analyze)
- [ ] Spec 003-interfaz (specify/clarify/plan/tasks/analyze)
- [ ] `traceability.md` con SHA reales al día
- [ ] README probado en frío (clon limpio, 3 pasos o menos)

### Bitácora de sesión

- 2026-07-26: Repositorio inicializado, CLAUDE.md creado. Pendientes las 8 decisiones bloqueantes del grupo antes de correr `/speckit.constitution`.
