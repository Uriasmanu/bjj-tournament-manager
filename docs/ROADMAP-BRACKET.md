# ROADMAP: Visualização Gráfica de Chave de Luta

**Feature:** SPEC-BRACKET-VISUALIZACAO.md (v3.0)
**Total de Tasks:** 48
**Fases:** 6

---

## VISÃO GERAL DO ROADMAP

A implementação é dividida em **6 fases sequenciais**, onde cada fase deve ser testada antes de avançar. As fases 1-3 são fundamentais (tipos + componentes base), fases 4-6 são de integração e polish.

### Pré-requisitos
- Verificar se `crypto.randomUUID()` está disponível (Node 14.17+ / todos browsers modernos)
- Verificar componentes Shadcn instalados: Card, Badge, Button, Dialog
- Verificar Lucide React instalado (ícones Trophy, etc.)

---

## FASE 1: Tipos e Infraestrutura de Dados (12 tasks)

**Objetivo:** Atualizar tipos TypeScript para UUID e criar utilitários de transformação.

---

### TASK 1.1 — Atualizar tipos base em `app/types/index.ts`

**Arquivo:** `app/types/index.ts`

**Descrição:** Migrar todos os IDs de `number` para `string` (UUID v4) e adicionar campos de referência.

**Alterações:**

```typescript
// Atleta — adicionar id UUID
export interface Atleta {
  id: string                  // UUID v4 — NOVO
  nome: string
  equipe: string
  faixa?: string
}

// ResultadoLuta — adicionar id UUID + referências
export interface ResultadoLuta {
  id: string                  // UUID v4 — NOVO
  pontosAtleta1: number
  pontosAtleta2: number
  vantagensAtleta1: number
  vantagensAtleta2: number
  // ... todos os campos existentes ...
  montadasAtleta1: number
  montadasAtleta2: number
  passagensAtleta1: number
  passagensAtleta2: number
  quedasAtleta1: number
  quedasAtleta2: number
  // NOVOS CAMPOS
  lutaId: string | null           // UUID da luta
  vencedorAtletaId: string | null  // UUID do vencedor
  perdedorAtletaId: string | null  // UUID do perdedor
  AtletaDesclassificadoId: string | null
}

// Luta — migrar id e adicionar referências de chaveamento
export interface Luta {
  id: string                  // UUID v4 — ALTERADO (antes: number)
  round: number              // 1, 2, 3, 4 (não é ID)
  position: number           // Posição no round (não é ID)
  atleta1: Atleta
  atleta2: Atleta
  resultado?: ResultadoLuta
  arbitro?: string
  dataLuta?: string
  // NOVOS CAMPOS
  nextMatchId?: string        // UUID da próxima luta na chave
  previousMatchIds?: string[] // UUIDs das lutas anteriores
}

// ChaveLuta — adicionar id UUID + totalCompetidores
export interface ChaveLuta {
  id: string                  // UUID v4 — NOVO
  categoria: string
  lutas: Luta[]
  arbitro?: string
  vencedorAtletaId?: string   // UUID do campeão — ALTERADO (antes: string de nome)
  status: "pendente" | "em_andamento" | "concluida"
  totalCompetidores: number   // NOVO — quantos competidores na chave
}

// DadosArea — adicionar id UUID
export interface DadosArea {
  id: string                  // UUID v4 — NOVO
  area: string
  criadoEm: string
  atualizadoEm?: string
  chaves: ChaveLuta[]
}
```

**Critério de aceitação:** TypeScript compila sem erros após alteração.

---

### TASK 1.2 — Adicionar tipos auxiliares para renderização do bracket

**Arquivo:** `app/types/index.ts` (ao final do arquivo)

**Descrição:** Criar tipos usados exclusivamente para renderização do bracket visual (não são salvos no backend).

```typescript
// Tipos auxiliares para renderização do bracket (não persiste)

export type MatchupStatus = "pending" | "bye" | "live" | "completed"

export interface FighterSlot {
  athlete?: Atleta
  sourceMatchId?: string        // UUID da luta de origem
  seed?: number                 // Seed do competidor (não é ID)
  isBye: boolean
  resultStatus: "winner" | "loser" | "disqualified" | null
}

export interface BracketMatchup {
  id: string                    // UUID v4 da luta
  round: number                 // 1, 2, 3, 4 (não é ID)
  position: number              // Posição vertical (não é ID)
  fighter1?: FighterSlot
  fighter2?: FighterSlot
  result?: ResultadoLuta
  status: MatchupStatus
  label: string                 // "Round 1", "Quartas", "Semifinal", "Final"
  nextMatchId?: string          // UUID da próxima luta
  previousMatchIds?: string[]   // UUIDs das lutas anteriores
}

export interface BracketRound {
  label: string                  // "Round 1", "Quartas", "Semifinal", "Final"
  matchups: BracketMatchup[]
  side: "left" | "right" | "center"
}
```

---

### TASK 1.3 — Criar utilitário de geração de UUID

**Arquivo:** `app/lib/uuid.ts` (NOVO)

**Descrição:** Criar utilitário para geração de UUIDs consistente.

```typescript
export function generateUUID(): string {
  return crypto.randomUUID()
}

export function hasValidUUID(value: unknown): boolean {
  if (typeof value !== "string") return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}
```

**Critério:** `generateUUID()` retorna string no formato UUID v4.

---

### TASK 1.4 — Criar utilitário de migração de IDs (backward compatibility)

**Arquivo:** `app/lib/migrate-ids.ts` (NOVO)

**Descrição:** Criar função para migrar dados existentes (sem UUID) para o novo formato. Necessário para não quebrar dados já salvos no JSON.

```typescript
import { generateUUID } from "./uuid"
import { ChaveLuta, Luta, Atleta, ResultadoLuta } from "@/app/types"

export function migrateChaveLuta(chave: ChaveLuta): ChaveLuta {
  // Se já tem id UUID, não migrar
  if (isUUID(chave.id)) return chave

  return {
    ...chave,
    id: generateUUID(),
    lutas: chave.lutas.map(migrateLuta),
    totalCompetidores: calculateTotalCompetidores(chave.lutas),
    vencedorAtletaId: resolveVencedorId(chave.vencedor, chave.lutas),
  }
}

function migrateLuta(luta: Luta): Luta {
  if (isUUID(luta.id)) return luta

  return {
    ...luta,
    id: generateUUID(),
    atleta1: migrateAtleta(luta.atleta1),
    atleta2: migrateAtleta(luta.atleta2),
    resultado: luta.resultado ? migrateResultado(luta.resultado) : undefined,
  }
}

function migrateAtleta(atleta: Atleta): Atleta {
  if (isUUID(atleta.id)) return atleta
  return { ...atleta, id: generateUUID() }
}

function migrateResultado(resultado: ResultadoLuta): ResultadoLuta {
  if (isUUID(resultado.id)) return resultado
  return {
    ...resultado,
    id: generateUUID(),
    lutaId: null,
    vencedorAtletaId: null,
    perdedorAtletaId: null,
    AtletaDesclassificadoId: null,
  }
}

function calculateTotalCompetidores(lutas: Luta[]): number {
  const nomes = new Set<string>()
  lutas.forEach(l => {
    nomes.add(l.atleta1.nome)
    nomes.add(l.atleta2.nome)
  })
  return nomes.size
}
```

---

### TASK 1.5 — Criar função `buildBracketFromChaveLuta`

**Arquivo:** `app/lib/bracket-utils.ts` (NOVO)

**Descrição:** Função principal que transforma `ChaveLuta` (dados do backend) em estrutura visual `BracketRound[]`.

```typescript
import { ChaveLuta, BracketRound, BracketMatchup, FighterSlot, MatchupStatus, ResultadoLuta } from "@/app/types"

export function buildBracketFromChaveLuta(chave: ChaveLuta): BracketRound[] {
  const rounds = groupByRound(chave.lutas)

  // round 1: positions 0,1 → left; positions 2,3 → right
  // round 2+: center
  // round final: center

  const result: BracketRound[] = []

  // Round 1: verificar se tem 4 lutas (pode ter menos com BYEs)
  const round1Lutas = rounds.get(1) || []
  const leftLutas = round1Lutas.filter(l => l.position < 2)
  const rightLutas = round1Lutas.filter(l => l.position >= 2)

  if (leftLutas.length > 0 || rightLutas.length > 0) {
    result.push({
      label: "Round 1",
      matchups: [
        ...leftLutas.map(l => toMatchup(l, "Round 1")),
        ...rightLutas.map(l => toMatchup(l, "Round 1")),
      ],
      side: "left",
    })
  }

  // Quartas (round 2)
  const round2Lutas = rounds.get(2) || []
  if (round2Lutas.length > 0) {
    result.push({
      label: "Quartas",
      matchups: round2Lutas.map(l => toMatchup(l, "Quartas")),
      side: "center",
    })
  }

  // Semifinal (round 3)
  const round3Lutas = rounds.get(3) || []
  if (round3Lutas.length > 0) {
    result.push({
      label: "Semifinal",
      matchups: round3Lutas.map(l => toMatchup(l, "Semifinal")),
      side: "center",
    })
  }

  // Final (round 4 ou a última existente)
  const maxRound = Math.max(...Array.from(rounds.keys()))
  const finalLutas = rounds.get(maxRound) || []
  if (finalLutas.length > 0) {
    const isSingleFight = maxRound > 1 || rounds.size === 1
    result.push({
      label: isSingleFight && maxRound === 1 ? "Final" : "Final",
      matchups: finalLutas.map(l => toMatchup(l, "Final")),
      side: "center",
    })
  }

  return result
}

function groupByRound(lutas: Luta[]): Map<number, Luta[]> {
  const map = new Map<number, Luta[]>()
  lutas.forEach(luta => {
    const existing = map.get(luta.round) || []
    existing.push(luta)
    map.set(luta.round, existing)
  })
  return map
}

function toMatchup(luta: Luta, label: string): BracketMatchup {
  return {
    id: luta.id,
    round: luta.round,
    position: luta.position,
    fighter1: toFighterSlot(luta.atleta1, luta.previousMatchIds?.[0], false),
    fighter2: toFighterSlot(luta.atleta2, luta.previousMatchIds?.[1], false),
    result: luta.resultado,
    status: getMatchupStatus(luta),
    label,
    nextMatchId: luta.nextMatchId,
    previousMatchIds: luta.previousMatchIds,
  }
}

function toFighterSlot(atleta: Atleta | undefined, sourceMatchId?: string, isBye = false): FighterSlot {
  return {
    athlete: atleta,
    sourceMatchId,
    isBye: isBye || !atleta,
    resultStatus: null,
  }
}

function getMatchupStatus(luta: Luta): MatchupStatus {
  if (!luta.atleta1?.id && !luta.atleta2?.id) return "pending"
  if (!luta.atleta1?.id || !luta.atleta2?.id) return "bye"
  if (luta.resultado?.status === "concluida") return "completed"
  return "pending"
}
```

---

### TASK 1.6 — Criar função `advanceWinner`

**Arquivo:** `app/lib/bracket-utils.ts`

**Descrição:** Implementar lógica de avanço do vencedor para a próxima luta.

```typescript
import { ChaveLuta, Luta, Atleta } from "@/app/types"

export function advanceWinner(
  chave: ChaveLuta,
  completedFightId: string,
  winner: Atleta,
  loser: Atleta
): ChaveLuta {
  const completed = chave.lutas.find(l => l.id === completedFightId)
  if (!completed) return chave

  const nextId = completed.nextMatchId

  if (!nextId) {
    // Luta final — marcar campeão
    return {
      ...chave,
      status: "concluida",
      vencedorAtletaId: winner.id,
    }
  }

  const next = chave.lutas.find(l => l.id === nextId)
  if (!next) return chave

  const updatedLutas = chave.lutas.map(luta => {
    if (luta.id !== nextId) return luta

    // Descobrir em qual slot colocar baseado em previousMatchIds
    const prevIds = luta.previousMatchIds || []
    const idx = prevIds.indexOf(completedFightId)

    if (idx === 0 || (idx === -1 && !luta.atleta1?.id)) {
      return { ...luta, atleta1: winner }
    } else if (idx === 1 || (idx === -1 && !luta.atleta2?.id)) {
      return { ...luta, atleta2: winner }
    }

    return luta
  })

  return {
    ...chave,
    status: "em_andamento",
    lutas: updatedLutas,
  }
}
```

---

### TASK 1.7 — Criar função `getResultTags`

**Arquivo:** `app/lib/bracket-utils.ts`

**Descrição:** Calcular quais tags devem ser exibidas para cada competidor baseado no resultado.

```typescript
import { ResultadoLuta, Atleta } from "@/app/types"

export interface ResultTag {
  label: "VENCEU" | "PERDEU" | "DESCLASS." | "FINALIZOU"
  variant: "success" | "danger" | "danger-bold" | "info"
}

export function getFighterTags(resultado: ResultadoLuta | undefined, fighter: "atleta1" | "atleta2"): ResultTag[] {
  if (!resultado || resultado.status !== "concluida") return []

  const tags: ResultTag[] = []

  if (resultado.desclassificacao) {
    if (resultado.desclassificacao === fighter) {
      tags.push({ label: "DESCLASS.", variant: "danger-bold" })
    } else {
      tags.push({ label: "VENCEU", variant: "success" })
    }
  } else if (resultado.vencedor === fighter) {
    tags.push({ label: "VENCEU", variant: "success" })
    if (resultado.tipoVitoria === "finalizacao") {
      const isFinalizacao = fighter === "atleta1" ? resultado.finalizacaoAtleta1 : resultado.finalizacaoAtleta2
      if (isFinalizacao) {
        tags.push({ label: "FINALIZOU", variant: "info" })
      }
    }
  } else {
    tags.push({ label: "PERDEU", variant: "danger" })
  }

  return tags
}

export function getFighterStatus(resultado: ResultadoLuta | undefined, fighter: "atleta1" | "atleta2"): "winner" | "loser" | "disqualified" | null {
  if (!resultado || resultado.status !== "concluida") return null

  if (resultado.desclassificacao === fighter) return "disqualified"
  if (resultado.vencedor === fighter) return "winner"
  return "loser"
}
```

---

### TASK 1.8 — Atualizar `useStorage.ts` para suportar UUID

**Arquivo:** `app/hooks/useStorage.ts`

**Descrição:** Atualizar todas as funções para usar UUID ao invés de índices numéricos.

**Alterações na função `marcarLutaConcluida`:**

```typescript
// ANTES:
export async function marcarLutaConcluida(
  area: string,
  chaveIndex: number,
  lutaId: number,  // ← number
  dadosResultado: DadosResultadoLuta,
  chaves: ChaveLuta[]
): Promise<ChaveLuta[]>

// NOVAMENTE:
export async function marcarLutaConcluida(
  area: string,
  chaveId: string,  // ← UUID
  lutaId: string,   // ← UUID
  dadosResultado: DadosResultadoLuta,
  chaves: ChaveLuta[]
): Promise<ChaveLuta[]> {
  const chavesAtualizadas = chaves.map(chave => {
    if (chave.id !== chaveId) return chave

    const luta = chave.lutas.find(l => l.id === lutaId)
    if (!luta) return chave

    // Aplicar resultado
    // ...

    const temLutasPendentes = chave.lutas.some(l => l.resultado?.status !== "concluida")
    return { ...chave, status: temLutasPendentes ? "em_andamento" : "concluida" }
  })

  await salvarDados(area, chavesAtualizadas)
  return chavesAtualizadas
}
```

**Também atualizar:**
- `adicionarNovaLuta` — gerar UUID para nova Luta e ChaveLuta se necessário
- `getDadosIniciais` — chamar `migrateChaveLuta` em dados recebidos
- `salvarDados` — migrar IDs antes de salvar se necessário

**Critério:** Nenhuma função usa mais `chaveIndex: number` para operações. Todos os acessos são via UUID.

---

### TASK 1.9 — Criar hook `useBracket`

**Arquivo:** `app/hooks/useBracket.ts` (NOVO)

**Descrição:** Hook que gerencia o estado reativo do bracket e fornece métodos para interação.

```typescript
"use client"

import { useState, useCallback, useMemo } from "react"
import { ChaveLuta, BracketRound, Luta } from "@/app/types"
import { buildBracketFromChaveLuta } from "@/app/lib/bracket-utils"

interface UseBracketProps {
  chave: ChaveLuta
  activeFightId?: string
  onFightClick?: (luta: Luta) => void
  mode?: "live" | "readonly"
}

export function useBracket({ chave, activeFightId, onFightClick, mode = "live" }: UseBracketProps) {
  const [localActiveId, setLocalActiveId] = useState<string | undefined>(activeFightId)

  const rounds = useMemo(() => buildBracketFromChaveLuta(chave), [chave])

  const handleFightClick = useCallback((luta: Luta) => {
    if (mode === "readonly") return
    setLocalActiveId(luta.id)
    onFightClick?.(luta)
  }, [mode, onFightClick])

  const isActive = useCallback((lutaId: string) => {
    return localActiveId === lutaId || activeFightId === lutaId
  }, [localActiveId, activeFightId])

  return {
    rounds,
    activeFightId: localActiveId || activeFightId,
    handleFightClick,
    isActive,
    mode,
    champion: chave.vencedorAtletaId
      ? findAtletaById(chave, chave.vencedorAtletaId)
      : undefined,
    status: chave.status,
  }
}

function findAtletaById(chave: ChaveLuta, atletaId: string) {
  for (const luta of chave.lutas) {
    if (luta.atleta1.id === atletaId) return luta.atleta1
    if (luta.atleta2.id === atletaId) return luta.atleta2
  }
  return undefined
}
```

---

### TASK 1.10 — Criar função helper de matchups

**Arquivo:** `app/lib/bracket-utils.ts`

**Descrição:** Funções auxiliares para calcular estrutura da chave (número de rounds, posições, etc.).

```typescript
export function calculateBracketStructure(totalCompetidores: number) {
  // Determina quais rounds existem
  const rounds: { round: number; label: string; side: "left" | "right" | "center" }[] = []

  // Round 1: sempre existe se > 1 competidor
  if (totalCompetidores > 1) {
    rounds.push({ round: 1, label: "Round 1", side: "left" })
  }

  // Quartas: 4+ competidores
  if (totalCompetidores >= 4) {
    rounds.push({ round: 2, label: "Quartas", side: "center" })
  }

  // Semifinal: 2+ competidores
  if (totalCompetidores >= 2) {
    rounds.push({ round: 3, label: "Semifinal", side: "center" })
  }

  // Final: sempre existe se > 1 competidor
  if (totalCompetidores > 1) {
    rounds.push({ round: 4, label: "Final", side: "center" })
  }

  return rounds
}

export function getByeCount(totalCompetidores: number): number {
  if (totalCompetidores <= 1) return 7
  if (totalCompetidores === 2) return 6
  if (totalCompetidores === 3) return 5
  if (totalCompetidores === 4) return 4
  if (totalCompetidores === 5) return 3
  if (totalCompetidores === 6) return 2
  if (totalCompetidores === 7) return 1
  return 0
}

export function getRoundLabel(round: number): string {
  switch (round) {
    case 1: return "Round 1"
    case 2: return "Quartas"
    case 3: return "Semifinal"
    case 4: return "Final"
    default: return `Round ${round}`
  }
}

export function isByeSlot(luta: Luta): boolean {
  const hasAthlete1 = !!luta.atleta1?.id
  const hasAthlete2 = !!luta.atleta2?.id
  return !hasAthlete1 || !hasAthlete2
}

export function getLoserFromResult(resultado: ResultadoLuta | undefined, winnerId: string): string | null {
  if (!resultado?.status === "concluida") return null
  // Implementar lógica para retornar o ID do perdedor
  return null
}
```

---

### TASK 1.11 — Documentar estratégia de migração

**Arquivo:** `docs/ROADMAP-BRACKET-MIGRATION.md` (NOVO)

**Descrição:** Documento técnicos sobre como será feita a migração de dados existentes.

```
# Estratégia de Migração de IDs

## Problema
Dados existentes no JSON usam IDs numéricos (e sem UUID nos atletas).
IDs gerados automaticamente: crypto.randomUUID()

## Estratégia

### Na leitura (GET /api/area)
1. Receber dados do JSON
2. Verificar se `ChaveLuta.id` é UUID válido
3. Se não for → aplicar `migrateChaveLuta()` a todas as chaves
4. Retornar dados migrados ao frontend

### Na escrita (POST/PUT /api/area)
1. Frontend sempre envia com UUIDs
2. Backend aceita ambos (migrados ou não)
3. Dados persistidos sempre têm UUID

### Na importação de JSON
1. Parsear JSON importado
2. Gerar UUIDs para todas as entidades sem ID
3. Calcular `totalCompetidores`
4. Construir `nextMatchId` e `previousMatchIds` automaticamente
5. Salvar com UUIDs

## Validação
- `isUUID(id)` retorna true → dado já migrado
- `isUUID(id)` retorna false → aplicar migração
```

---

### TASK 1.12 — Criar testes unitários para Fase 1

**Arquivo:** `app/lib/__tests__/bracket-utils.test.ts` (NOVO — criar diretório se não existir)

**Descrição:** Testes unitários para validar funções de transformação.

```typescript
// Testes para:
describe("buildBracketFromChaveLuta", () => {
  it("deve agrupar lutas por round", () => { ... })
  it("deve identificar side left para positions 0,1", () => { ... })
  it("deve identificar side right para positions 2,3", () => { ... })
})

describe("advanceWinner", () => {
  it("deve avançar vencedor para nextMatchId", () => { ... })
  it("deve marcar campeão quando não há nextMatchId", () => { ... })
})

describe("getFighterTags", () => {
  it("deve retornar VENCEU para vencedor", () => { ... })
  it("deve retornar PERDEU para perdedor", () => { ... })
  it("deve retornar DESCLASS. para desclassificado", () => { ... })
  it("deve retornar FINALIZOU quando houve finalização", () => { ... })
})

describe("generateUUID", () => {
  it("deve gerar UUID válido", () => { ... })
  it("deve gerar UUIDs únicos", () => { ... })
})
```

**Critério de aceitação da Fase 1:** Todos os testes passando + TypeScript compila.

---

## FASE 2: Componentes Base do Bracket (10 tasks)

**Objetivo:** Criar os componentes visuais primários (cards, badges, colunas).

---

### TASK 2.1 — Criar componente `ResultBadge`

**Arquivo:** `app/components/bracket/ResultBadge.tsx` (NOVO — criar diretório)

**Descrição:** Tag pequena que exibe resultado do competidor.

```typescript
"use client"

import { Badge } from "@/components/ui/badge"
import { ResultTag } from "@/app/lib/bracket-utils"

interface ResultBadgeProps {
  tag: ResultTag
}

const variantClasses = {
  success: "bg-green-500 text-white text-xs px-2 py-0.5 rounded-full",
  danger: "bg-red-500 text-white text-xs px-2 py-0.5 rounded-full",
  "danger-bold": "bg-red-800 text-white text-xs px-2 py-0.5 rounded-full border-2 border-red-600",
  info: "bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full",
}

export function ResultBadge({ tag }: ResultBadgeProps) {
  return (
    <span className={variantClasses[tag.variant]}>
      {tag.label}
    </span>
  )
}
```

---

### TASK 2.2 — Criar componente `BracketMatchupCard`

**Arquivo:** `app/components/bracket/BracketMatchupCard.tsx` (NOVO)

**Descrição:** Card individual de cada luta. Comporta dois competidores em layout vertical. Exibe tags de resultado. Estados: pending, live, completed (winner/loser), bye.

**Estrutura visual:**
```
┌────────────────────────┐
│ [Seed 1] João Silva    │  ← competidor 1 (topo)
│          Academia ABC  │
│          [VENCEU]      │  ← tags de resultado
├────────────────────────┤
│         VS             │  ← separador central
├────────────────────────┤
│ [Seed 2] Maria Santos   │  ← competidor 2 (base)
│          Academia XYZ  │
│          [PERDEU]      │  ← tags de resultado
└────────────────────────┘
```

**Props:**
```typescript
interface BracketMatchupCardProps {
  luta: Luta
  onClick?: () => void
  isActive?: boolean
  side: "left" | "right"
  mode?: "live" | "readonly"
}
```

**Estados visuais:**
| Estado | Background | Borda |
|--------|-----------|-------|
| Pending | `bg-gray-50` | `border border-gray-200` |
| Pending hover | `bg-gray-100` | `border border-gray-400 cursor-pointer` |
| Live | `bg-amber-50` | `border-2 border-amber-400` (animate-pulse) |
| Completed winner | `bg-green-50` | `border-2 border-green-500` |
| Completed loser | `bg-red-50` | `border-2 border-red-400` |
| Bye | `bg-gray-300` | `border border-gray-400` |

**Critério:** Todos os 5 estados visuais renderizam corretamente. Tags `[VENCEU]`, `[PERDEU]`, `[DESCLASS.]`, `[FINALIZOU]` aparecem quando aplicável.

---

### TASK 2.3 — Criar componente `BracketColumn`

**Arquivo:** `app/components/bracket/BracketColumn.tsx` (NOVO)

**Descrição:** Container vertical que agrupa matchups de uma rodada com espaçamento adequado.

```typescript
interface BracketColumnProps {
  round: BracketRound
  onFightClick?: (luta: Luta) => void
  activeFightId?: string
  mode?: "live" | "readonly"
}
```

**Estrutura:**
```
<div className="flex flex-col gap-{gap}">
  <span className="text-xs text-gray-400 uppercase text-center">{round.label}</span>
  {round.matchups.map(matchup => (
    <BracketMatchupCard
      key={matchup.id}
      luta={findLuta(matchup.id)}
      onClick={() => onFightClick(findLuta(matchup.id))}
      isActive={activeFightId === matchup.id}
      side={round.side}
      mode={mode}
    />
  ))}
</div>
```

**Lógica de gap:**
- Round 1 (left/right): `gap-16` (espaçamento amplo entre 1×2 e 3×4)
- Quartas: `gap-16` ou `gap-32` (espaçamento grande)
- Semifinal: `justify-center` (centralizado vertical)
- Final: `justify-center`

---

### TASK 2.4 — Criar componente `BracketChampion`

**Arquivo:** `app/components/bracket/BracketChampion.tsx` (NOVO)

**Descrição:** Card especial para exibir o campeão da categoria.

```typescript
interface BracketChampionProps {
  champion?: Atleta
  categoryName: string
}
```

**Visual:**
- Fundo: `bg-gradient-to-br from-amber-300 to-amber-500`
- Borda: `border-2 border-amber-600`
- Ícone: Trophy do Lucide React
- Nome + equipe em `font-bold text-lg`
- Badge "CAMPEÃO" em dourado

**Caso 1 competidor:**
- Mensagem: `"{nome} é o CAMPEÃO por falta de oponentes"`
- Mesmo visual dourado

**Caso nenhum campeão:**
- Card vazio com placeholder "Aguardando campeão..."

---

### TASK 2.5 — Criar componente `BracketConnector` (SVG)

**Arquivo:** `app/components/bracket/BracketConnector.tsx` (NOVO)

**Descrição:** Linhas SVG que conectam matchups entre rounds mostrando o fluxo de avanço.

```typescript
interface BracketConnectorProps {
  fromMatchups: BracketMatchup[]
  toMatchups: BracketMatchup[]
  fromSide: "left" | "right" | "center"
  toSide: "left" | "right" | "center"
}
```

**Lógica:**
- Calcular posições Y dos matchups de origem e destino
- Desenhar linhas ortogonais (90°) com curvas suaves
- Cor: `stroke-gray-300`
- Espessura: `stroke-2`
- Cantos: `stroke-linecap: round`

**Exemplo de caminho:**
```
Ponto A ─┐
         ├──┐
Ponto B ─┘  ├──┐
             │
         ┌───┘
         │
         └─► Ponto Destino
```

**Critério:** Linhas conectam corretamente os matchups de rounds adjacentes. Não há sobreposição de linhas.

---

### TASK 2.6 — Criar componente `BracketMatchupCard` com animação

**Arquivo:** `app/components/bracket/BracketMatchupCard.tsx` (continuação)

**Descrição:** Adicionar animação de borda pulsante para estado `live`.

```typescript
// No estado "live" do card:
<div className="animate-pulse border-2 border-amber-400 shadow-lg shadow-amber-200">
  {/* conteúdo do card */}
</div>
```

**Também adicionar:**
- Hover effect para cards pendentes clicáveis
- Cursor pointer para estados interativos
- `cursor-not-allowed` para cards completed no modo readonly

---

### TASK 2.7 — Criar componente `BracketCardHeader`

**Arquivo:** `app/components/bracket/BracketCardHeader.tsx` (NOVO)

**Descrição:** Cabeçalho informativo de cada card mostrando round/label e score (se finalizado).

```typescript
interface BracketCardHeaderProps {
  label: string
  luta: Luta
}
```

**Exibe:**
- Nome do round ("Round 1", "Quartas", etc.)
- Score final se luta concluída: `"2 x 1"`
- Ícone de relógio se luta ao vivo

---

### TASK 2.8 — Criar utilitário de calculadora de posições para SVG

**Arquivo:** `app/lib/bracket-positions.ts` (NOVO)

**Descrição:** Calcula posições X/Y dos matchups para renderizar os conectores SVG.

```typescript
export interface MatchupPosition {
  matchId: string
  x: number
  y: number
  centerX: number
  centerY: number
}

export function calculateMatchupPositions(
  rounds: BracketRound[],
  cardWidth: number = 160,
  cardHeight: number = 120,
  gapX: number = 32,
  gapY: number = 64
): Map<string, MatchupPosition> {
  const positions = new Map<string, MatchupPosition>()

  let currentX = 0

  for (const round of rounds) {
    const roundX = currentX
    const matchCount = round.matchups.length

    round.matchups.forEach((matchup, index) => {
      const y = index * (cardHeight + gapY)
      positions.set(matchup.id, {
        matchId: matchup.id,
        x: roundX,
        y,
        centerX: roundX + cardWidth / 2,
        centerY: y + cardHeight / 2,
      })
    })

    currentX += cardWidth + gapX
  }

  return positions
}
```

---

### TASK 2.9 — Criar `BracketRoundLabel`

**Arquivo:** `app/components/bracket/BracketRoundLabel.tsx` (NOVO)

**Descrição:** Label kecilho上方 de cada coluna mostrando o nome do round.

```typescript
interface BracketRoundLabelProps {
  label: string
  side: "left" | "right" | "center"
}
```

**Visual:** `text-xs text-gray-500 uppercase tracking-wide text-center mb-2`

---

### TASK 2.10 — Testes para componentes Fase 2

**Arquivo:** `app/components/bracket/__tests__/` (NOVO)

**Descrição:** Testar os componentes da Fase 2.

```typescript
describe("ResultBadge", () => {
  it("deve renderizar tag VENCEU com cor verde", () => { ... })
  it("deve renderizar tag DESCLASS. com borda vermelha", () => { ... })
})

describe("BracketMatchupCard", () => {
  it("deve renderizar ambos competidores", () => { ... })
  it("deve mostrar tags de resultado quando luta concluída", () => { ... })
  it("deve aplicar estilos de estado correto (pending/live/completed)", () => { ... })
})
```

---

## FASE 3: Layout do Bracket e Composição (10 tasks)

**Objetivo:** Compor todos os componentes em layouts funcionais e conectar dados.

---

### TASK 3.1 — Criar componente `BracketLayout`

**Arquivo:** `app/components/bracket/BracketLayout.tsx` (NOVO)

**Descrição:** Container principal que organiza todas as colunas e conexões em formato horizontal duplo.

```typescript
interface BracketLayoutProps {
  rounds: BracketRound[]
  chaves: ChaveLuta[]          // acesso às lutas completas
  activeFightId?: string
  onFightClick?: (luta: Luta) => void
  mode?: "live" | "readonly"
}
```

**Estrutura HTML:**
```tsx
<div className="flex items-center justify-center gap-0 overflow-x-auto p-4">

  {/* LADO ESQUERDO */}
  <div className="flex flex-col gap-16">
    {/* Round 1 - Left (positions 0,1) */}
    <BracketColumn
      round={rounds.find(r => r.label === "Round 1")}
      onFightClick={onFightClick}
      activeFightId={activeFightId}
      mode={mode}
    />
  </div>

  {/* Separador esquerdo */}
  {rounds.length > 1 && <BracketConnector {...} />}

  {/* CENTRO - Quartas/Semifinal/Final */}
  <div className="flex flex-col gap-32">
    {/* Quartas */}
    {rounds.find(r => r.label === "Quartas") && (
      <BracketColumn {...} />
    )}

    {/* Semifinal */}
    {rounds.find(r => r.label === "Semifinal") && (
      <BracketColumn {...} />
    )}

    {/* Final */}
    {rounds.find(r => r.label === "Final") && (
      <div className="flex flex-col">
        <BracketColumn {...} />
        <BracketChampion champion={...} categoryName={...} />
      </div>
    )}
  </div>

  {/* LADO DIREITO */}
  <div className="flex flex-col gap-16">
    {/* Round 1 - Right (positions 2,3) */}
    {/* Renderiza separadamente para layout correto */}
  </div>

</div>
```

**Critério:** Bracket renderiza em formato horizontal duplo (4 left, 4 right convergindo para centro).

---

### TASK 3.2 — Criar `BracketVisualizer` (componente raiz)

**Arquivo:** `app/components/bracket/BracketVisualizer.tsx` (NOVO)

**Descrição:** Componente exportado principal que o scoreboard vai consumir.

```typescript
interface BracketVisualizerProps {
  chave: ChaveLuta
  onFightClick?: (luta: Luta) => void
  activeFightId?: string
  mode?: "live" | "readonly"
  className?: string
}

export function BracketVisualizer({ chave, onFightClick, activeFightId, mode, className }: BracketVisualizerProps) {
  const { rounds, handleFightClick, isActive } = useBracket({
    chave,
    activeFightId,
    onFightClick,
    mode,
  })

  return (
    <div className={cn("w-full", className)}>
      <BracketLayout
        rounds={rounds}
        chaves={[chave]}        // Para lookup de lutas
        activeFightId={activeFightId}
        onFightClick={handleFightClick}
        mode={mode}
      />
    </div>
  )
}
```

**Exportar também:**
```typescript
export { BracketMatchupCard } from "./BracketMatchupCard"
export { BracketColumn } from "./BracketColumn"
export { BracketChampion } from "./BracketChampion"
export { ResultBadge } from "./ResultBadge"
export { BracketConnector } from "./BracketConnector"
export { BracketLayout } from "./BracketLayout"
```

---

### TASK 3.3 — Implementar responsividade mobile (stack vertical)

**Arquivo:** `app/components/bracket/BracketLayout.tsx` (atualizar)

**Descrição:** Adicionar layout vertical para mobile (<768px).

```tsx
// No BracketLayout:
<div className={cn(
  "flex items-center justify-center gap-0 overflow-x-auto p-4",
  "hidden md:flex"  // Desktop: horizontal
)}>
  {/* layout horizontal */}
</div>

<div className={cn(
  "flex flex-col gap-8 p-4",
  "flex md:hidden"  // Mobile: vertical
)}>
  {/* Layout vertical: um round abaixo do outro */}
  {rounds.map((round, idx) => (
    <div key={round.label} className="w-full">
      <BracketRoundLabel label={round.label} side="center" />
      <div className="space-y-4">
        {round.matchups.map(matchup => (
          <BracketMatchupCard
            key={matchup.id}
            luta={findLuta(matchup.id)}
            onClick={() => onFightClick(findLuta(matchup.id))}
            isActive={activeFightId === matchup.id}
            side="center"
            mode={mode}
          />
        ))}
      </div>
      {/* Connector vertical entre rounds */}
      {idx < rounds.length - 1 && (
        <div className="flex justify-center py-2">
          <svg className="w-4 h-8">
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="gray" strokeWidth="2" />
          </svg>
        </div>
      )}
    </div>
  ))}
  {/* Champion ao final */}
  <BracketChampion champion={champion} categoryName={chave.categoria} />
</div>
```

---

### TASK 3.4 — Adicionar suporte a BYE visual no card

**Arquivo:** `app/components/bracket/BracketMatchupCard.tsx` (atualizar)

**Descrição:** Quando `luta.atleta1` ou `luta.atleta2` é null/undefined, exibir slot de BYE.

```tsx
// No BracketMatchupCard:
function FighterDisplay({ atleta, isBye, resultStatus }: FighterDisplayProps) {
  if (isBye || !atleta?.id) {
    return (
      <div className="bg-gray-300 border border-gray-400 rounded px-3 py-2">
        <span className="text-gray-500 text-sm font-medium">BYE</span>
        <span className="text-gray-400 text-xs block">Avança automaticamente</span>
      </div>
    )
  }
  return (
    <div>
      {/* Nome + equipe + tags */}
    </div>
  )
}
```

---

### TASK 3.5 — Criar `ChampionModal`

**Arquivo:** `app/components/bracket/ChampionModal.tsx` (NOVO)

**Descrição:** Modal/banner que aparece quando a luta final é decidida.

```tsx
interface ChampionModalProps {
  champion: Atleta
  categoryName: string
  onClose?: () => void
}

export function ChampionModal({ champion, categoryName }: ChampionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gradient-to-br from-amber-300 to-amber-500 rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-900" />
        <h2 className="text-2xl font-bold text-amber-900 mb-2">
          {champion.nome}
        </h2>
        <p className="text-amber-800 font-medium mb-2">
          {champion.equipe}
        </p>
        <p className="text-amber-900 font-bold text-xl uppercase tracking-wide">
          CAMPEÃO
        </p>
        <p className="text-amber-700 text-sm mt-2">
          {categoryName}
        </p>
      </div>
    </div>
  )
}
```

**Trigger:** Quando `ChaveLuta.status === "concluida"` e existe `vencedorAtletaId`.

---

### TASK 3.6 — Criar `BracketScore` (exibição de score no card)

**Arquivo:** `app/components/bracket/BracketScore.tsx` (NOVO)

**Descrição:** Exibe score final no card quando luta está concluída.

```typescript
interface BracketScoreProps {
  luta: Luta
}
```

**Visual:** Exibe abaixo do nome: `"2 × 1"` onde 2 é pontos do vencedor e 1 do perdedor.

**Lógica:**
```tsx
if (luta.resultado?.status === "concluida") {
  const p1 = luta.resultado.pontosAtleta1
  const p2 = luta.resultado.pontosAtleta2
  return (
    <span className="text-sm font-bold">
      {p1} × {p2}
    </span>
  )
}
```

---

### TASK 3.7 — Criar `BracketToolbar`

**Arquivo:** `app/components/bracket/BracketToolbar.tsx` (NOVO)

**Descrição:** Barra de ferramentas opcional para controlar visualização.

```typescript
interface BracketToolbarProps {
  mode: "live" | "readonly"
  onModeChange?: (mode: "live" | "readonly") => void
  categoryName: string
  status: "pendente" | "em_andamento" | "concluida"
}
```

**Funcionalidades:**
- Toggle entre modo live/readonly
- Nome da categoria
- Indicador de status (badge)
- Botão de zoom (opcional)

---

### TASK 3.8 — Criar `BracketEmptyState`

**Arquivo:** `app/components/bracket/BracketEmptyState.tsx` (NOVO)

**Descrição:** Estado vazio quando não há chaves carregadas.

```typescript
export function BracketEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Trophy className="w-12 h-12 text-gray-500 mb-4" />
      <p className="text-gray-400">Nenhuma chave de luta carregada.</p>
      <p className="text-gray-500 text-sm mt-2">
        Selecione uma chave na tela de setup para visualizar o bracket.
      </p>
    </div>
  )
}
```

---

### TASK 3.9 — Criar `index.ts` barrel export

**Arquivo:** `app/components/bracket/index.ts` (NOVO)

**Descrição:** Exportar todos os componentes do bracket de um único ponto.

```typescript
export { BracketVisualizer } from "./BracketVisualizer"
export { BracketLayout } from "./BracketLayout"
export { BracketMatchupCard } from "./BracketMatchupCard"
export { BracketColumn } from "./BracketColumn"
export { BracketChampion } from "./BracketChampion"
export { BracketConnector } from "./BracketConnector"
export { ResultBadge } from "./ResultBadge"
export { BracketScore } from "./BracketScore"
export { ChampionModal } from "./ChampionModal"
export { BracketToolbar } from "./BracketToolbar"
export { BracketEmptyState } from "./BracketEmptyState"
```

---

### TASK 3.10 — Testes de integração Fase 3

**Arquivo:** `app/components/bracket/__tests__/BracketVisualizer.test.tsx` (NOVO)

**Descrição:** Testes de integração verificando composição dos componentes.

```typescript
describe("BracketVisualizer", () => {
  it("deve renderizar bracket com 8 competidores", () => { ... })
  it("deve renderizar bracket com 3 competidores e BYE", () => { ... })
  it("deve renderizar champion quando chave concluída", () => { ... })
  it("deve mostrar ChampionModal quando luta final é decidida", () => { ... })
  it("deve responsivar para mobile (stack vertical)", () => { ... })
  it("deve renderizar em modo readonly sem cliques", () => { ... })
})
```

---

## FASE 4: Integração com Scoreboard (8 tasks)

**Objetivo:** Integrar o BracketVisualizer no scoreboard existente.

---

### TASK 4.1 — Identificar pontos de integração no scoreboard

**Arquivos:** `app/scoreboard/page.tsx`, `app/components/scoreboard/SeletorLuta.tsx`

**Descrição:** Mapear onde o BracketVisualizer será inserido e como comunicará com o scoreboard.

**Pontos de integração identificados:**

1. **`SeletorLuta.tsx`** — substituir lista de lutas por `BracketVisualizer`
2. **`scoreboard/page.tsx`** — adicionar `BracketVisualizer` na sidebar ou acima do score
3. **`useStorage.ts`** — `marcarLutaConcluida` já existente deve funcionar com UUIDs

**Diagrama de integração:**
```
SeletorLuta (BracketVisualizer)
    │
    ├── onFightClick(luta: Luta) → scoreboard/page.tsx
    │       ├── define activeFightId
    │       └── abre PlacarCompleto com luta selecionada
    │
    ├── PlacarCompleto (scoring)
    │       └── handleFinalizarLuta → useStorage.marcarLutaConcluida()
    │
    └── BracketVisualizer (re-renderiza)
            └── tags atualizadas, advancement visual
```

---

### TASK 4.2 — Criar componente `BracketPanel`

**Arquivo:** `app/components/scoreboard/BracketPanel.tsx` (NOVO)

**Descrição:** Wrapper que integra o BracketVisualizer no layout do scoreboard.

```typescript
interface BracketPanelProps {
  chaves: ChaveLuta[]
  activeLuta?: Luta
  onFightSelect?: (luta: Luta) => void
  mode?: "live" | "readonly"
}
```

**Funcionalidades:**
- Dropdown de seleção de categoria (igual SeletorLuta atual)
- `BracketVisualizer` abaixo do dropdown
- Área compacta para não ocupar todo o screen
- Scroll se necessário

---

### TASK 4.3 — Atualizar `SeletorLuta.tsx` para usar BracketVisualizer

**Arquivo:** `app/components/scoreboard/SeletorLuta.tsx` (atualizar)

**Descrição:** Substituir a seleção manual de atletas pelo BracketVisualizer interativo.

**Alterações:**
1. Manter dropdown de seleção de categoria (unchanged)
2. Abaixo do dropdown, renderizar `BracketVisualizer` para a chave selecionada
3. Remover selects de atleta1/atleta2 (não mais necessário — bracket é interativo)
4. Quando usuário clica em card do bracket → `onFightClick(luta)` → inicia scoring

**Código simplificado:**
```tsx
// ANTES: selects manuais de atletas
// DEPOIS:

{categoriaSelecionada && (
  <div className="mt-4">
    <BracketVisualizer
      chave={chaveAtual}
      onFightClick={(luta) => {
        onIniciar(chaveAtual.categoria, luta.atleta1, luta.atleta2)
      }}
      mode="live"
    />
  </div>
)}
```

---

### TASK 4.4 — Criar `BracketSidebar` para o scoreboard

**Arquivo:** `app/components/scoreboard/BracketSidebar.tsx` (NOVO)

**Descrição:** Sidebar compacta que exibe o bracket ao lado do placar principal.

```typescript
interface BracketSidebarProps {
  chave: ChaveLuta
  activeLutaId?: string
  onFightSelect?: (luta: Luta) => void
}
```

**Layout:**
- Posicionado à direita ou abaixo do PlacarCompleto
- Largura máxima: 400px
- Scroll vertical se bracket é grande
- Sempre visível durante o scoring

---

### TASK 4.5 — Atualizar `scoreboard/page.tsx` para passar UUID

**Arquivo:** `app/scoreboard/page.tsx`

**Descrição:** Garantir que ao selecionar uma luta, o UUID seja passado para o scoring.

**Alterações:**
- Ao clicar em card do bracket, `onFightClick(luta)` fornece `luta.id` (UUID)
- Passar `activeLutaId` para o BracketSidebar
- Ao finalizar luta, usar UUID para atualizar resultado

---

### TASK 4.6 — Atualizar `marcarLutaConcluida` para advancement

**Arquivo:** `app/hooks/useStorage.ts` (atualizar TASK 1.8)

**Descrição:** Após salvar resultado, chamar `advanceWinner` para atualizar a chave visualmente.

```typescript
import { advanceWinner } from "@/app/lib/bracket-utils"

export async function marcarLutaConcluida(/* ... */): Promise<ChaveLuta[]> {
  // ... existing code ...

  // Após aplicar resultado:
  const winner = /* determine winner Atleta */;
  const loser = /* determine loser Atleta */;

  const chavesAtualizadas = chaves.map(chave => {
    if (chave.id !== chaveId) return chave
    return advanceWinner(chave, lutaId, winner, loser)
  })

  await salvarDados(area, chavesAtualizadas)
  return chavesAtualizadas
}
```

---

### TASK 4.7 — Criar mock data para teste de integração

**Arquivo:** `app/lib/mock-bracket-data.ts` (NOVO)

**Descrição:** Dados mockados de teste para validar integração antes de ter dados reais.

```typescript
import { ChaveLuta, Luta, Atleta } from "@/app/types"
import { generateUUID } from "@/app/lib/uuid"

export const mockChave8Competidores: ChaveLuta = {
  id: generateUUID(),
  categoria: "Branca Adulto Masculino - 80kg",
  status: "em_andamento",
  totalCompetidores: 8,
  lutas: [
    // Round 1 - Left (positions 0,1)
    {
      id: generateUUID(), round: 1, position: 0,
      nextMatchId: "QUARTAS_1_ID",
      previousMatchIds: [],
      atleta1: { id: generateUUID(), nome: "João Silva", equipe: "Team Alpha", faixa: "Branca" },
      atleta2: { id: generateUUID(), nome: "Carlos Santos", equipe: "Team Beta", faixa: "Branca" },
    },
    // ... mais 7 lutas
  ]
}

export const mockChave3Competidores: ChaveLuta = { /* ... */ }
export const mockChave4Competidores: ChaveLuta = { /* ... */ }
```

---

### TASK 4.8 — Teste de integração completo

**Descrição:** Testar o fluxo completo: seleção → scoring → finalização → advancement no bracket.

```typescript
describe("Fluxo completo Bracket + Scoreboard", () => {
  it("selecionar luta via bracket abre scoring", () => { ... })
  it("finalizar luta atualiza bracket e avança vencedor", () => { ... })
  it("luta final concluída mostra ChampionModal", () => { ... })
  it("bracket atualiza após reload de dados", () => { ... })
})
```

---

## FASE 5: Polish e Edge Cases (5 tasks)

**Objetivo:** Tratar edge cases, animações e ajustes finais.

---

### TASK 5.1 — Implementar animação de advancement

**Arquivo:** `app/components/bracket/BracketMatchupCard.tsx`

**Descrição:** Quando o vencedor avança, adicionar animação visual no card destino.

```tsx
// Adicionar animação quando novo competidor aparece:
const hasNewFighter = useRef(false) // detectar mudança

useEffect(() => {
  if (hasNewFighter.current) {
    // trigger animação de highlight por 1 segundo
    setHighlightNew(true)
    setTimeout(() => setHighlightNew(false), 1000)
  }
}, [atleta1, atleta2])
```

**Animação:** Borda verde pulsando 1x + background verde claro temporário.

---

### TASK 5.2 — Tratar edge case: 1 competidor

**Arquivo:** `app/components/bracket/BracketVisualizer.tsx` (atualizar)

**Descrição:** Se `totalCompetidores === 1`, declarar campeão automaticamente.

```tsx
if (chave.totalCompetidores === 1) {
  const unicoAtleta = getUnicoAtleta(chave)
  return (
    <div className="text-center p-8">
      <BracketChampion champion={unicoAtleta} categoryName={chave.categoria} />
      <p className="text-gray-400 text-sm mt-2">
        {unicoAtleta.nome} declarado campeão por falta de oponentes
      </p>
    </div>
  )
}
```

---

### TASK 5.3 — Tratar edge case: BYE dinâmico por desclassificação

**Arquivo:** `app/components/bracket/BracketMatchupCard.tsx`

**Descrição:** Quando um competidor é desclassificado antes de lutar, o bracket deve mostrar advancement automático.

**Lógica:**
- Se competidor tem `resultado.desclassificacao` e ainda não lutou (slot vazio no próximo round)
- Exibir slot do advancement com visual de "[DESCLASS.] - Avança automaticamente"

---

### TASK 5.4 — Animações CSS para transições de estado

**Arquivo:** `app/components/bracket/BracketAnimations.ts` (NOVO — ou adicionar em globals.css)

**Descrição:** Adicionar animações CSS suaves para transições de estado.

```css
/* Pulse animation para luta live */
@keyframes livePulse {
  0%, 100% { border-color: #f59e0b; box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
  50% { border-color: #fbbf24; box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
}

/* Highlight animation para advancement */
@keyframes winnerHighlight {
  0% { background-color: #dcfce7; transform: scale(1); }
  50% { background-color: #86efac; transform: scale(1.02); }
  100% { background-color: #dcfce7; transform: scale(1); }
}

/* Tag fade-in */
@keyframes tagFadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.tag-animate {
  animation: tagFadeIn 0.3s ease-out;
}
```

---

### TASK 5.5 — Testes de edge cases

**Descrição:** Testes para todos os edge cases.

```typescript
describe("Edge Cases", () => {
  it("deve renderizar campeão automático com 1 competidor", () => { ... })
  it("deve renderizar BYE visual quando competidor falta", () => { ... })
  it("deve tratar desclassificação como advancement", () => { ... })
  it("deve calcular estrutuda correta para 3 competidores", () => { ... })
  it("deve calcular estrutura correta para 5 competidores", () => { ... })
  it("deve funcionar com dados migrados (sem UUID inicial)", () => { ... })
})
```

---

## FASE 6: Validação e Documentação (3 tasks)

**Objetivo:** Validação final, verificação de ACs e documentação.

---

### TASK 6.1 — Verificar todos os Critérios de Aceitação

**Descrição:** Executar teste manual para cada AC do SPEC-BRACKET-VISUALIZACAO.md.

| AC | Descrição | Status | Evidência |
|----|-----------|--------|-----------|
| AC1 | Bracket com 8 competidores (4+4) | | |
| AC2 | BYEs corretos (3, 5, 7 competidores) | | |
| AC3 | Avanço automático via UUID após resultado | | |
| AC4 | Tags [VENCEU], [PERDEU], [DESCLASS.], [FINALIZOU] | | |
| AC5 | Luta live com borda pulsante | | |
| AC6 | Modal de campeão na final | | |
| AC7 | Responsivo desktop/tablet/mobile | | |
| AC8 | Linhas SVG de conexão | | |
| AC9 | Re-render em tempo real (sem reload) | | |
| AC10 | Mode readonly para espectadores | | |
| AC11 | Operações usam UUID (não índices) | | |
| AC12 | Campeão automático com 1 competidor | | |

---

### TASK 6.2 — Atualizar SPEC-BRACKET-VISUALIZACAO.md com status

**Arquivo:** `docs/SPEC-BRACKET-VISUALIZACAO.md` (atualizar)

**Descrição:** Marcar critérios de aceitação como verificados e adicionar notas de implementação.

- Marcar ACs implementados com `[x]`
- Adicionar notas sobre decisões técnicas tomadas
- Documentar limitações conhecidas

---

### TASK 6.3 — Criar changelog da feature

**Arquivo:** `docs/CHANGELOG-BRACKET.md` (NOVO)

**Descrição:** Documentar todas as mudanças feitas.

```
# Changelog - Visualização Gráfica de Chave de Luta

## v1.0.0 — 2026-05-XX

### Adicionado
- Componentes do bracket em app/components/bracket/
- Tipos UUID em app/types/index.ts
- Hook useBracket em app/hooks/useBracket.ts
- Funções de bracket em app/lib/bracket-utils.ts
- Integração com scoreboard

### Breaking Changes
- IDs agora são UUIDs v4 (antes: numbers)
- Função marcarLutaConcluida agora usa UUID (antes: chaveIndex/lutaId number)
- ChaveLuta.id agora é string UUID (antes: não existia)

### Notas
- Migração automática de dados legacy (IDs numéricos → UUID)
- Todos os arquivos JSON existentes serão migrados na próxima leitura
```

---

## RESUMO DO ROADMAP

| Fase | Nome | Tasks | Complexidade |
|------|------|-------|-------------|
| 1 | Tipos e Infraestrutura | 12 | Alta |
| 2 | Componentes Base | 10 | Média |
| 3 | Layout e Composição | 10 | Alta |
| 4 | Integração Scoreboard | 8 | Alta |
| 5 | Polish e Edge Cases | 5 | Média |
| 6 | Validação e Docs | 3 | Baixa |
| **TOTAL** | | **48** | |

### Dependências entre fases:
```
Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5 → Fase 6
  ↑         ↑         ↑         ↑         ↑
  └─────────┴─────────┴─────────┴─────────┴ (testes ao longo de todas)
```

### Priorização interna das tasks (dentro de cada fase):
1. **Tasks críticas** (bloqueiam outras) — fazer primeiro
2. **Tasks de componentes** — paralelizáveis entre si
3. **Tasks de testes** — fazer após os componentes correspondentes

### Files a criar/modificar:

```
NOVOS ARQUIVOS:
app/types/index.ts                    (atualizar — adicionar UUIDs)
app/lib/uuid.ts                      (NOVO)
app/lib/migrate-ids.ts               (NOVO)
app/lib/bracket-utils.ts             (NOVO)
app/lib/bracket-positions.ts         (NOVO)
app/hooks/useBracket.ts              (NOVO)
app/lib/mock-bracket-data.ts         (NOVO)
app/components/bracket/              (NOVO DIRETÓRIO)
  index.ts
  BracketVisualizer.tsx
  BracketLayout.tsx
  BracketMatchupCard.tsx
  BracketColumn.tsx
  BracketChampion.tsx
  BracketConnector.tsx
  BracketScore.tsx
  BracketCardHeader.tsx
  BracketRoundLabel.tsx
  ResultBadge.tsx
  ChampionModal.tsx
  BracketToolbar.tsx
  BracketEmptyState.tsx
  BracketAnimations.ts
app/components/scoreboard/BracketPanel.tsx    (NOVO)
app/components/scoreboard/BracketSidebar.tsx  (NOVO)
app/lib/__tests__/bracket-utils.test.ts       (NOVO)
app/components/bracket/__tests__/             (NOVO)
docs/ROADMAP-BRACKET-MIGRATION.md             (NOVO)
docs/CHANGELOG-BRACKET.md                    (NOVO)

ARQUIVOS A ATUALIZAR:
app/types/index.ts              (Task 1.1, 1.2)
app/hooks/useStorage.ts        (Task 1.8, 4.6)
app/components/scoreboard/SeletorLuta.tsx   (Task 4.3)
app/scoreboard/page.tsx        (Task 4.5)
app/globals.css                (Task 5.4 — animações)
```