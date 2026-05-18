# SPEC: Visualização Gráfica de Chave de Luta

## 1. Visão Geral

**Nome da Feature:** Visualização Gráfica de Chave de Luta (Bracket View)
**Módulo:** Scoreboard
**Prioridade:** Alta
**Estimativa:** —
**Histórico:** HU-001
**Versão:** 3.0

---

## 2. Objetivo

Permitir que organizadores e espectadores visualizem a chave de luta de forma gráfica e dinâmica durante o andamento do campeonato, com atualização em tempo real conforme os resultados das lutas são definidos. A geração/criação da chave é feita em outro módulo da aplicação.

---

## 3. Identificadores (UUID)

**IMPORTANTE:** Todos os identificadores do sistema são UUIDs v4. Campos numéricos como `round`, `position`, `seed` e `totalCompetidores` **não são IDs** — são valores de posição/contagem.

| Entidade | Campo ID | Tipo |
|----------|---------|------|
| `Atleta` | `id` | `string` (UUID v4) |
| `Luta` | `id` | `string` (UUID v4) |
| `ChaveLuta` | `id` | `string` (UUID v4) |
| `ResultadoLuta` | `id` | `string` (UUID v4) |
| `DadosArea` | `id` | `string` (UUID v4) |

**Referências por UUID:**
- `Luta.nextMatchId?: string` — UUID da próxima luta na chave
- `Luta.previousMatchIds?: string[]` — UUIDs das duas lutas anteriores que alimentam esta
- `ResultadoLuta.lutaId` — UUID da luta
- `ResultadoLuta.vencedorAtletaId` — UUID do vencedor
- `ResultadoLuta.perdedorAtletaId` — UUID do perdedor

---

## 4. Estrutura Visual da Chave

A chave é renderizada em formato **horizontal duplo** — competidores do lado esquerdo (1-4) e direito (5-8) convergindo para o centro.

### 4.1 Chave Completa (8 competidores)

```
LADO ESQUERDO                          CENTRO                               LADO DIREITO

Seed 1 ───┐
         ├──┐
Seed 2 ───┘  │
            ├── QUARTAS Q1 ──┐
Seed 3 ───┐  │               │
         ├──┘               │              ┌── SEMIFINAL S1 ──┐
Seed 4 ───┘                  │              │                 ├── FINAL
                            │              └─────────────────┘
Seed 5 ───┐                  │              ┌── SEMIFINAL S2 ──┐
         ├──┐               │              │                 │
Seed 6 ───┘  │              │              └─────────────────┘
            ├── QUARTAS Q2 ──┘
Seed 7 ───┐  │
         ├──┘
Seed 8 ───┘
```

**Lutas do Round 1 (4 lutas):**
- `Q1_partida1`: Seed 1 × Seed 2
- `Q1_partida2`: Seed 3 × Seed 4
- `Q2_partida1`: Seed 5 × Seed 6
- `Q2_partida2`: Seed 7 × Seed 8

**Lutas Quartas (2 lutas):**
- `Q1`: Vencedor(Q1_partida1) × Vencedor(Q1_partida2)
- `Q2`: Vencedor(Q2_partida1) × Vencedor(Q2_partida2)

**Lutas Semifinal (2 lutas):**
- `S1`: Vencedor(Q1) × Vencedor(Q2)

**Luta Final (1 luta):**
- `Final`: Vencedor(S1) × Vencedor(S2)

**Total de lutas: 7**

### 4.2 Regras de BYE

Quando o número de competidores é menor que 8, a diferença é preenchida com BYEs. O competidor de seed mais alto recebe BYE e avança automaticamente para a próxima rodada.

#### 7 competidores (1 BYE)

```
LADO ESQUERDO                          CENTRO                               LADO DIREITO

Seed 1 ───┐
         ├──┐
Seed 2 ───┘  │
            ├── QUARTAS Q1 ──┐
Seed 3 ───┐  │               │
         ├──┘               │              ┌── SEMIFINAL S1 ──┐
Seed 4 ───┘                  │              │                 ├── FINAL
                            │              └─────────────────┘
          BYE ──────────────┘              ┌── SEMIFINAL S2 ──┐
Seed 5 ───┐                               │                 │
         ├──┐                              └─────────────────┘
Seed 6 ───┘  │
            ├── QUARTAS Q2 ──┘
Seed 7 ───┐  │
         ├──┘
   (não luta)         │
                      │
          BYE ───────┘
```

- **Seed 1 × Seed 2** → vencedor vai para Q1
- **Seed 3 × Seed 4** → vencedor vai para Q1
- **BYE Seed 5** → avança direto para S2
- **Seed 6 × Seed 7** → vencedor vai para Q2 → vence → vai para S2
- **S2** = Vencedor(Q2) × BYE (Seed 5)

#### 6 competidores (2 BYEs)

```
LADO ESQUERDO                          CENTRO                               LADO DIREITO

Seed 1 ───┐
         ├──┐
Seed 2 ───┘  │
            ├── QUARTAS Q1 ──┐
Seed 3 ───┐  │               │
         ├──┘               │              ┌── SEMIFINAL S1 ──┐
Seed 4 ───┘                  │              │                 ├── FINAL
                            │              └─────────────────┘
          BYE ──────────────┘              ┌── SEMIFINAL S2 ──┐
Seed 5 ───┐                               │                 │
         ├──┐                              └─────────────────┘
Seed 6 ───┘  │
            ├── QUARTAS Q2 ──┘
          BYE
          BYE ──────────────┘
```

- **Seed 1 × Seed 2** → Q1
- **Seed 3 × Seed 4** → Q1
- **BYE Seed 5** → S2 direto
- **BYE Seed 6** → Q2 direto → vence Q2 → S2

#### 5 competidores (3 BYEs)

```
LADO ESQUERDO                          CENTRO                               LADO DIREITO

Seed 1 ───┐
         ├──┐
Seed 2 ───┘  │
            ├── QUARTAS Q1 ──┐
Seed 3 ───┐  │               │
         ├──┘               │              ┌── SEMIFINAL S1 ──┐
Seed 4 ───┘                  │              │                 ├── FINAL
                            │              └─────────────────┘
          BYE ──────────────┘              ┌── SEMIFINAL S2 ──┐
Seed 5 ───┐                               │                 │
         ├──┐                              └─────────────────┘
          BYE ──────────────┘
          BYE
          BYE ──────────────┘
```

- **Seed 1 × Seed 2** → Q1
- **BYE Seed 3** → Q1 direto
- **BYE Seed 4** → S2 direto
- **BYE Seed 5** → S2 direto

#### 4 competidores (4 BYEs)

```
LADO ESQUERDO                          CENTRO                               LADO DIREITO

Seed 1 ───┐
         ├──┐
Seed 2 ───┘  │
            ├── SEMIFINAL S1 ──┐
          BYE ──┘               │              ┌── FINAL ──┐
Seed 3 ───┐                     │              │           ├── CAMPEÃO
         ├──┐                   │              └───────────┘
Seed 4 ───┘  │                   │
            ├── SEMIFINAL S2 ──┘
          BYE ──┘
          BYE
          BYE ────────────────┘
```

- **Seed 1 × Seed 2** → S1
- **BYE Seed 3** → S1 direto
- **BYE Seed 4** → S2 direto

#### 3 competidores (5 BYEs)

```
LADO ESQUERDO                          CENTRO                               LADO DIREITO

Seed 1 ───┐
         ├──┐
Seed 2 ───┘  │
            ├── SEMIFINAL S1 ──┐
          BYE ──┘               │              ┌── FINAL ──┐
          BYE ──┘                │              │           ├── CAMPEÃO
Seed 3 ───┐                     │              └───────────┘
         ├──┐                   │
         │  ├── SEMIFINAL S2 ──┘
         │
         └──┘
```

- **Seed 1 × Seed 2** → S1 → vence → Final
- **BYE Seed 3** → S2 direto → vence S2 → Final

#### 2 competidores (6 BYEs)

```
LADO ESQUERDO                          CENTRO                               LADO DIREITO

Seed 1 ───┐
         ├──┐
Seed 2 ───┘  │
            ├── FINAL ──┐
          BYE ──┘        │              ┌── CAMPEÃO
          BYE ──┘        │              │
          BYE ──┘        │              │
          BYE ──┘        │              │
          BYE ──┘        │              │
          BYE ──┘        └──────────────┘
```

- Seed 1 × Seed 2 → Final (directamente, sem rodadas anteriores)

#### 1 competidor

- Declarado campeão automaticamente
- Nenhuma luta necessária
- Exibe mensagem: `"{Nome} é o CAMPEÃO por falta de oponentes"`

### 4.3 BYE Dinâmico durante o campeonato

Se durante o campeonato um competidor é **desclassificado antes de lutar**, o próximo competidor da chave avança automaticamente. Isso é tratado como uma desclassificação normal — o competidor desclassificado é marcado com `[DESCLASS.]` e o advancement ocorre via `Luta.nextMatchId`.

---

## 5. Tags nos Cards

Cada card de luta deve exibir **tags de status** pequenas e discretas abaixo do nome do competidor.

### 5.1 Tags de Resultado

| Tag | Cor | Condição |
|-----|-----|----------|
| `VENCEU` | Verde (`#22c55e`) | Lutador venceu a luta |
| `PERDEU` | Vermelho (`#ef4444`) | Lutador perdeu a luta |
| `DESCLASS.` | Vermelho escuro (`#991b1b`) + borda vermelha | Lutador foi desclassificado |
| `FINALIZOU` | Azul (`#3b82f6`) | Lutador venceu por finalização |

### 5.2 Posicionamento

Tags aparecem abaixo do nome + equipe, em fonte `text-xs`, estilo badge/pill.

```
┌──────────────────────┐
│ João Silva           │
│ Academia Alpha       │
│ [VENCEU]             │
└──────────────────────┘

┌──────────────────────┐
│ Maria Santos         │
│ Academia Beta        │
│ [DESCLASS.]          │
└──────────────────────┘
```

### 5.3 Lógica de Exibição

```
SE resultado.existe:
  SE resultado.desclassificacao == "atleta1":
    atleta1.exibeTag("DESCLASS.")
    atleta2.exibeTag("VENCEU")
  SE resultado.desclassificacao == "atleta2":
    atleta2.exibeTag("DESCLASS.")
    atleta1.exibeTag("VENCEU")
  SE resultado.vencedor == "atleta1":
    atleta1.exibeTag("VENCEU")
    atleta2.exibeTag("PERDEU")
  SE resultado.vencedor == "atleta2":
    atleta2.exibeTag("VENCEU")
    atleta1.exibeTag("PERDEU")

  SE resultado.finalizacaoAtleta1 == true:
    atleta1.exibeTag("FINALIZOU") //叠加
  SE resultado.finalizacaoAtleta2 == true:
    atleta2.exibeTag("FINALIZOU") //叠加

  SE resultado.tipoVitoria == "desclassificacao":
    // já coberto acima
  SE resultado.tipoVitoria == "finalizacao":
    vencedor.exibeTag("FINALIZOU")
```

---

## 6. Modelo de Dados

### 6.1 Tipos Existentes (não alterar)

O modelo atual de `Luta` e `ChaveLuta` já existe. A visualização do bracket consome os dados existentes. Todos os IDs são UUIDs.

```typescript
interface Luta {
  id: string              // UUID v4 — identificador único da luta
  round: number            // 1, 2, 3, 4 (não é ID — posição na chave)
  position: number         // Posição vertical no round (não é ID)
  atleta1: Atleta           // Inclui id UUID
  atleta2: Atleta          // Inclui id UUID
  resultado?: ResultadoLuta
  arbitro?: string
  dataLuta?: string
  nextMatchId?: string     // UUID da próxima luta na chave
  previousMatchIds?: string[] // UUIDs das lutas anteriores (até 2)
}

interface Atleta {
  id: string              // UUID v4
  nome: string
  equipe: string
  faixa?: string
}

interface ResultadoLuta {
  id: string              // UUID v4
  pontosAtleta1: number
  pontosAtleta2: number
  finalizacaoAtleta1: boolean
  finalizacaoAtleta2: boolean
  desclassificacao: "atleta1" | "atleta2" | null
  vencedor: "atleta1" | "atleta2" | null
  tipoVitoria: "pontos" | "finalizacao" | "desclassificacao"
  status: "pendente" | "concluida"
  lutaId: string
  vencedorAtletaId: string | null
  perdedorAtletaId: string | null
}

interface ChaveLuta {
  id: string              // UUID v4
  categoria: string
  lutas: Luta[]
  arbitro?: string
  vencedorAtletaId?: string
  status: "pendente" | "em_andamento" | "concluida"
  totalCompetidores: number
}
```

### 6.2 Tipos Auxiliares para Renderização

```typescript
interface BracketMatchup {
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

type MatchupStatus = "pending" | "bye" | "live" | "completed"

interface FighterSlot {
  athlete?: Atleta
  sourceMatchId?: string        // UUID da luta de origem
  seed?: number                 // Seed do competidor (não é ID)
  isBye: boolean
  resultStatus: "winner" | "loser" | "disqualified" | null
}

interface BracketRound {
  label: string                  // "Round 1", "Quartas", "Semifinal", "Final"
  matchups: BracketMatchup[]
  side: "left" | "right" | "center"
}
```

### 6.3 Função de Transformação

```typescript
function buildBracketFromChaveLuta(chave: ChaveLuta): BracketRound[] {
  // 1. Agrupar lutas por round
  // 2. Atribuir side:
  //    - round 1: positions 0,1 → left; positions 2,3 → right
  //    - rounds intermediários (quartas, semi): center
  //    - final: center
  // 3. Identificar BYEs (lutas onde apenas 1 competidor existe)
  // 4. Preencher FighterSlot com sourceMatchId (UUID da luta de origem)
  // 5. Aplicar tags de resultado a partir de ResultadoLuta
  // 6. Mapear nextMatchId / previousMatchIds (UUIDs)
}
```

### 6.4 Avanço do Vencedor via UUID

```typescript
function advanceWinner(chave: ChaveLuta, completedFightId: string, winner: Atleta): ChaveLuta {
  const completed = chave.lutas.find(l => l.id === completedFightId)
  if (!completed) return chave

  const nextId = completed.nextMatchId
  if (!nextId) {
    // É a luta final — marcar campeão
    return {
      ...chave,
      status: "concluida",
      vencedorAtletaId: winner.id
    }
  }

  const next = chave.lutas.find(l => l.id === nextId)
  if (!next) return chave

  // Preencher o slot disponível na próxima luta com o vencedor
  const updated = { ...chave }
  const updatedLutas = updated.lutas.map(l => {
    if (l.id !== nextId) return l
    // Determinar em qual slot colocar baseado em previousMatchIds
    const prevIdx = l.previousMatchIds?.indexOf(completedFightId) ?? -1
    if (prevIdx === 0 || (prevIdx === -1 && !l.atleta1?.id)) {
      return { ...l, atleta1: winner }
    } else if (prevIdx === 1 || (prevIdx === -1 && !l.atleta2?.id)) {
      return { ...l, atleta2: winner }
    }
    return l
  })

  return { ...updated, lutas: updatedLutas }
}
```

**IMPORTANTE:** Toda lógica de busca usa `id` (UUID). `round` e `position` são usados **apenas** para posicionamento visual.

---

## 7. Componentes UI

### 7.1 `BracketVisualizer`

Componente raiz que recebe `ChaveLuta` e renderiza o bracket.

```typescript
interface BracketVisualizerProps {
  chave: ChaveLuta
  onFightClick?: (luta: Luta) => void
  activeFightId?: string     // UUID da luta ativa
  mode?: "live" | "readonly"
}
```

### 7.2 `BracketMatchupCard`

Card individual de cada luta. Layout vertical: competidor 1 no topo, competidor 2 na base.

```typescript
interface BracketMatchupCardProps {
  luta: Luta
  onClick?: () => void
  isActive?: boolean
  side: "left" | "right"
}
```

**Estados visuais:**

| Estado | Background | Borda |
|--------|-----------|-------|
| Pending | `bg-gray-100` | `border-gray-300` |
| Live | `bg-amber-100` | `border-amber-400` (pulsante) |
| Completed (winner) | `bg-green-100` | `border-green-500` |
| Completed (loser) | `bg-red-100` | `border-red-500` |
| Bye | `bg-gray-400` | `border-gray-500` |

### 7.3 `BracketColumn`

Agrupa matchups de uma rodada.

```typescript
interface BracketColumnProps {
  round: BracketRound
  connectors?: React.ReactNode
}
```

### 7.4 `BracketChampion`

Exibe o campeão com visual diferenciado.

```typescript
interface BracketChampionProps {
  champion?: Atleta
  categoryName: string
}
```

Visual: fundo dourado gradiente, ícone de troféu, nome + equipe, badge "CAMPEÃO".

### 7.5 `ResultBadge`

Tag pequena para exibir resultado do competidor.

```typescript
interface ResultBadgeProps {
  status: "winner" | "loser" | "disqualified" | null
  submission?: boolean
}
```

Tags: `[VENCEU]` (verde), `[PERDEU]` (vermelho), `[DESCLASS.]` (vermelho escuro com borda), `[FINALIZOU]` (azul).

### 7.6 `BracketConnector`

Linhas SVG que conectam as lutas mostrando o fluxo do bracket.

```typescript
interface BracketConnectorProps {
  from: { x: number; y: number; matchId: string }
  to: { x: number; y: number; matchId: string }
}
```

Estilo: linhas ortogonais (90°), cor `stroke-gray-400`, espessura `stroke-2`, cantos arredondados.

### 7.7 `BracketLayout`

Container principal que organiza todas as colunas e conexões.

```typescript
interface BracketLayoutProps {
  rounds: BracketRound[]
  activeFightId?: string
  onFightClick?: (luta: Luta) => void
  mode?: "live" | "readonly"
}
```

Estrutura interna:
```
<div class="flex items-center justify-center overflow-x-auto">
  <BracketColumn round={leftRound} />
  <BracketConnector from={left} to={center} />
  <BracketColumn round={centerRound} />
  <BracketConnector from={center} to={final} />
  <BracketColumn round={finalRound} />
  <BracketChampion />
</div>
```

---

## 8. Fluxo de Dados

### 8.1 Entrada

Componente recebe `ChaveLuta` com UUIDs. Geração da chave é responsabilidade de outro módulo.

### 8.2 Seleção de Luta

1. Usuário clica em card pendente/live
2. `onFightClick(luta)` recebe `Luta` com `id` (UUID)
3. Abre scoring panel

### 8.3 Atualização após resultado

1. Árbitro finaliza luta
2. `marcarLutaConcluida()` atualiza `ResultadoLuta` e `Luta.status`
3. `advanceWinner()` preenche próximo slot
4. API salva via `PUT /api/area`
5. `BracketVisualizer` re-renderiza com novo estado
6. Vencedor aparece advancement visualmente

### 8.4 Persistência

Todas as buscas de lutas usam `id` (UUID), não índices numéricos.

---

## 9. Layout Visual Detalhado

### 9.1 Estrutura CSS

```
LADO ESQUERDO               CENTRO                            LADO DIREITO

<div class="flex items-center justify-center gap-0 overflow-x-auto">

  <!-- Round 1 - Left (positions 0,1) -->
  <div class="flex flex-col gap-16">
    <BracketMatchupCard />  // 1×2
    <BracketMatchupCard />  // 3×4
  </div>

  <!-- Connector Round 1 → Quartas -->
  <svg class="w-8 h-full"> connectors </svg>

  <!-- Quartas (positions 0,1 → left; 2,3 → right) -->
  <div class="flex flex-col gap-32">
    <BracketMatchupCard />  // Q1: V(1×2) × V(3×4)
    <BracketMatchupCard />  // Q2: V(5×6) × V(7×8)
  </div>

  <!-- Connector Quartas → Semifinal -->
  <svg class="w-8 h-full"> connectors </svg>

  <!-- Semifinal -->
  <div class="flex flex-col justify-center">
    <BracketMatchupCard />  // S1
  </div>

  <!-- Connector Semifinal → Final -->
  <svg class="w-8 h-full"> connector </svg>

  <!-- Final -->
  <div class="flex flex-col justify-center">
    <BracketMatchupCard />  // Final
  </div>

  <!-- Campeão -->
  <BracketChampion />

</div>
```

### 9.2 Responsividade

| Tela | Comportamento |
|------|--------------|
| Desktop (>1024px) | Bracket completo em linha horizontal |
| Tablet (768-1024px) | Scroll horizontal, cards compactos |
| Mobile (<768px) | Stack vertical por rodada (Round 1 → Quartas → Semifinal → Final) |

### 9.3 Cores detalhadas

| Elemento | Background | Borda | Texto |
|---------|-----------|-------|-------|
| Pending | `bg-gray-50` | `border-gray-200` | gray-700 |
| Pending (hover) | `bg-gray-100` | `border-gray-400` | — |
| Live | `bg-amber-50` | `border-amber-400` | gray-900 |
| Live (animação) | — | `animate-pulse` | — |
| Winner | `bg-green-50` | `border-green-500` | gray-900 |
| Loser | `bg-red-50` | `border-red-400` | gray-700 |
| Bye | `bg-gray-300` | `border-gray-400` | gray-600 |
| Champion | `bg-gradient-to-br from-amber-300 to-amber-500` | `border-amber-600` | gray-900 |
| Tag VENCEU | `bg-green-500 text-white` | — | — |
| Tag PERDEU | `bg-red-500 text-white` | — | — |
| Tag DESCLASS. | `bg-red-800 text-white border-2 border-red-600` | — | — |
| Tag FINALIZOU | `bg-blue-500 text-white` | — | — |

---

## 10. Funcionalidades

### 10.1 Seleção de Luta
- Clique em card pendente/live abre o scoring
- Card ativo recebe `ring-2 ring-amber-400`
- Cards completed não são clicáveis (mode readonly)
- Identificação via `Luta.id` (UUID)

### 10.2 Destaque de Luta ao Vivo
- `activeFightId` (UUID) marca a luta ativa
- Animação de borda pulsante no card
- Score em tempo real pode aparecer no card (opcional)

### 10.3 Atualização em Tempo Real
- Após finalizar, bracket re-renderiza
- Vencedor avança via `Luta.nextMatchId` (UUID)
- Próxima luta muda status para disponível

### 10.4 Mode readonly
- `mode="readonly"` desabilita cliques
- Tags de resultado permanecem visíveis

### 10.5 Declaração de Campeão

Quando a luta final é concluída:
1. Card da Final exibe tag `[VENCEU]` no ganador
2. Banner/modal: `"🏆 {Nome} é o CAMPEÃO da categoria {categoria}!"`
3. `ChaveLuta.status` → `"concluida"`
4. `ChaveLuta.vencedorAtletaId` preenchido (UUID)

---

## 11. Critérios de Aceitação

- [ ] **AC1:** Dado 8 competidores, exibir bracket com 4 de cada lado convergindo para o centro
- [ ] **AC2:** Dado número ímpar de competidores (3, 5, 7), exibir BYEs corretamente na estrutura 4-left / 4-right
- [ ] **AC3:** Ao finalizar uma luta, o vencedor avança automaticamente (via `Luta.nextMatchId` UUID)
- [ ] **AC4:** Cards exibem tags `[VENCEU]`, `[PERDEU]`, `[DESCLASS.]`, `[FINALIZOU]` corretamente
- [ ] **AC5:** Luta em andamento é destacada com borda pulsante
- [ ] **AC6:** Ao finalizar luta final, modal de campeão é exibido com nome e categoria
- [ ] **AC7:** Layout responsivo funciona em desktop, tablet e mobile
- [ ] **AC8:** Linhas de conexão (SVG) entre rounds são renderizadas corretamente
- [ ] **AC9:** Bracket atualiza em tempo real após cada resultado sem reload
- [ ] **AC10:** Mode `readonly` funciona para espectadores
- [ ] **AC11:** Todas as operações de busca/mapeamento usam UUID como identificador (não índices numéricos)
- [ ] **AC12:** Campeão com 1 competidor é declarado automaticamente com mensagem explicativa

---

## 12. Integração

### 12.1 Com `scoreboard/page.tsx`
- `<BracketVisualizer>` adicionado ao scoreboard
- `onFightClick` recebe `Luta` com `id` (UUID) e abre scoring

### 12.2 Com `SeletorLutas`
- Substituir lista de lutas por `BracketVisualizer`
- Manter dropdown de categoria

### 12.3 Com API
- Nenhuma alteração na API necessária
- Consome dados existentes de `ChaveLuta`

---

## 13. Dependências

- **Shadcn/ui**: Card, Badge (já instalados)
- **Tailwind CSS 4**: Estilização
- **SVG**: Linhas de conexão
- **Lucide React**: Ícones (Trophy, etc.)
- **crypto.randomUUID()**: Geração de UUIDs (built-in)

---

## 14. Roadmap

1. **Fase 1:** Tipos + função `buildBracketFromChaveLuta` + `advanceWinner` (UUID-based)
2. **Fase 2:** Componente `BracketMatchupCard` com todos os estados visuais
3. **Fase 3:** Componente `ResultBadge` com lógica de tags
4. **Fase 4:** Layout `BracketLayout` com colunas e linhas de conexão (SVG)
5. **Fase 5:** Lógica de advancement via UUID + re-render automático
6. **Fase 6:** Champion declaration + responsividade mobile