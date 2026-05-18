# SPEC: Visualização Gráfica de Chave de Luta

## 1. Visão Geral

**Nome da Feature:** Visualização Gráfica de Chave de Luta (Bracket View)
**Módulo:** Scoreboard
**Prioridade:** Alta
**Estimativa:** —
**Histórico:** HU-001
**Versão:** 2.0

---

## 2. Objetivo

Permitir que organizadores e espectadores visualizem a chave de luta de forma gráfica e dinâmica durante o andamento do campeonato, com atualização em tempo real conforme os resultados das lutas são definidos. A geração/criação da chave é feita em outro módulo da aplicação.

---

## 3. Identificadores (UUID)

**IMPORTANTE:** Todos os identificadores do sistema são UUIDs v4. Campos numéricos como `round`, `position`, `seed` e `totalCompetidores` **não são IDs** — são valores de posição/ contagem.

| Entidade | Campo ID | Tipo |
|----------|---------|------|
| `Atleta` | `id` | `string` (UUID v4) |
| `Luta` | `id` | `string` (UUID v4) |
| `ChaveLuta` | `id` | `string` (UUID v4) |
| `ResultadoLuta` | `id` | `string` (UUID v4) |
| `DadosArea` | `id` | `string` (UUID v4) |

**Referências por UUID:**
- `Luta.nextMatchId?: string` — UUID da próxima luta na chave
- `Luta.previousMatchIds?: string[]` — UUIDs das lutas anteriores
- `ResultadoLuta.lutaId` — UUID da luta
- `ResultadoLuta.vencedorAtletaId` — UUID do vencedor
- `ResultadoLuta.perdedorAtletaId` — UUID do perdedor

---

## 4. Estrutura Visual da Chave

A chave é renderizada em formato **horizontal duplo** — 4 competidores de cada lado convergindo para o centro.

### 4.1 Chave Completa (8 competidores)

```
┌───────────┐  ┌───────────┐                                                      ┌───────────┐  ┌───────────┐
│ 1 - A    │──│           │                                                      │           │──│ 2 - B    │
└───────────┘  │           │     ┌───────────┐                         ┌───────────┐ │           │  └───────────┘
┌───────────┐  │  Q1       │──┐  │           │                         │           │  │  Q2       │  ┌───────────┐
│ 3 - C    │──│           │  │  │  S1       │                         │  S2       │  │           │──│ 4 - D    │
└───────────┘  └───────────┘  │  │           │──┐                  ┌──│           │  └───────────┘  └───────────┘
                              │  └───────────┘  │                  │  └───────────┘
┌───────────┐  ┌───────────┐  │                 │                  │  ┌───────────┐  ┌───────────┐
│ 5 - E    │──│           │──┴──┐              │                  │  └───────────┘  │           │──│ 6 - F    │
└───────────┘  │           │     │     ┌───────────┐  ┌───────────┐ │           │  └───────────┘
┌───────────┐  │  Q3       │     │     │           │  │           │  │  Q4       │  ┌───────────┐
│ 7 - G    │──│           │─────┴─────│  FINAL    │──│  FINAL    │──│           │──│ 8 - H    │
└───────────┘  └───────────┘           └───────────┘  └───────────┘  └───────────┘  └───────────┘
```

**Lutas Round 1:** `1×2`, `3×4`, `5×6`, `7×8` — identificadas por `Luta.id` (UUID)
**Lutas Quartas:** `Q1 = Vencedor(1×2) × Vencedor(3×4)`, `Q2 = Vencedor(5×6) × Vencedor(7×8)`
**Lutas Semifinal:** `S1 = Vencedor(Q1) × Vencedor(Q2)`
**Luta Final:** `Final = Vencedor(S1) × Vencedor(S2)`

### 4.2 Regras de BYE

Quando o número de competidores for ímpar, competidores recebem BYE:

**3 competidores:**
```
┌───────────┐  ┌───────────┐                              ┌───────────┐
│ 1 - A    │──│           │                              │           │──│ 3 - C    │
└───────────┘  │  S1       │──┐               ┌───────────┐ │           │  └───────────┘
┌───────────┐  │           │  │               │           │  │           │
│ 2 - B    │──│           │──┴───────────────│  FINAL    │──│           │
└───────────┘  └───────────┘                  └───────────┘  └───────────┘
```
- 1×2 lutam; 3 x perdedor; vencedor x vencedor

**5 competidores:**
```
┌───────────┐  ┌───────────┐                              ┌───────────┐  ┌───────────┐
│ 1 - A    │──│           │                              │           │──│ 2 - B    │
└───────────┘  │  Q1       │──┐               ┌───────────┐│           │  └───────────┘
┌───────────┐  │           │  │               │           ││           │
│ 3 - C    │──│           │──┴───────────────│  S1       ││           │──┤
└───────────┘  └───────────┘                  │           │└───────────┘
                                               └───────────┘
┌───────────┐  ┌───────────┐
│ 4 - D    │──│  BYE      │────────────────────┘
└───────────┘  └───────────┘
┌───────────┐  ┌───────────┐
│ 5 - E    │──│  BYE      │──────────────────────┘
└───────────┘  └───────────┘
```

Em campeonatos de Jiu-Jitsu, chaves com 5 atletas geralmente utilizam o sistema de eliminatória simples com repescagem ou o formato clássico de chaves de pirâmide, mas com o uso de "baia" (bye) para ajustar o número ímpar de competidores.

Como o número ideal para uma chave perfeita de eliminação simples é uma potência de 2 (4, 8, 16, 32), o número 5 exige um sorteio prévio para definir quem avança sem lutar na primeira rodada.

O fluxo principal funciona da seguinte forma:

1. A Luta de Triagem (Quartas de Final)
Atleta A e Atleta B fazem a única luta da primeira rodada.

Atleta C, Atleta D e Atleta E avançam direto para as semifinais por sorteio (recebem o bye).

2. As Semifinais
Semifinal 1: O vencedor da luta entre (A x B) enfrenta o Atleta C.

Semifinal 2: O Atleta D enfrenta o Atleta E.

3. A Final
O vencedor da Semifinal 1 enfrenta o vencedor da Semifinal 2 para decidir o 1º e 2º lugar.

Como funciona a definição do 3º lugar?
A distribuição da medalha de bronze depende da federação que organiza o evento:

Padrão IBJJF / CBJJ: Não há luta pelo terceiro lugar. Os dois atletas que perderam nas semifinais dividem o pódio e ambos recebem a medalha de bronze.

**2 competidores:** Apenas 1 luta (Final) diretamente.

**1 competidor:** Declarado campeão automaticamente.

### 4.3 BYE Dinâmico durante o campeonato

Se durante o campeonato um competidor é **desclassificado antes de lutar**, ele recebe o status de BYE para a próxima fase — o próximo competidor avança automaticamente. Isso é tratado como uma desclassificação normal.

---

## 5. Tags nos Cards

Cada card de luta deve exibir **tags de status** pequenas e discretas.

### 5.1 Tags de Resultado

| Tag | Cor | Condição |
|-----|-----|----------|
| `VENCEU` | Verde (`#22c55e`) | Lutador venceu a luta |
| `DESCLASS.` | Vermelho escuro (`#991b1b`) + borda | Lutador foi desclassificado |

### 5.2 Posicionamento

As tags devem aparecer **abaixo do nome do competidor** no card, em fonte pequena (text-xs) e estilo badge/pill.

```
┌─────────────────────┐
│ João Silva          │
│ Academia Alpha      │
│ [VENCEU]            │  ← tag verde
└─────────────────────┘

┌─────────────────────┐
│ Maria Santos       │
│ Academia Beta       │
│ [DESCLASS.]         │  ← tag vermelho escuro + borda vermelha
└─────────────────────┘
```

### 5.3 Lógica de Exibição

- Se `resultado.vencedor === "atleta1"` → atleta1 exibe `[VENCEU]``
- Se `resultado.tipoVitoria === "finalizacao"` → vencedor exibe `[FINALIZOU]` adicional
- Se `resultado.tipoVitoria === "desclassificacao"`:
  - Se `resultado.desclassificacao === "atleta1"` → atleta1 exibe `[DESCLASS.]`, atleta2 exibe `[VENCEU]`
  - Se `resultado.desclassificacao === "atleta2"` → atleta2 exibe `[DESCLASS.]`, atleta1 exibe `[VENCEU]`

---

## 6. Modelo de Dados

### 6.1 Tipos Existentes (não alterar)

O modelo atual de `Luta` e `ChaveLuta` já existe e não precisa ser modificado para esta feature. A visualização do bracket consome os dados existentes. Todos os IDs são UUIDs.

```typescript
interface Luta {
  id: string              // UUID v4 — identificador único
  round: number            // Posição na chave (não é ID)
  position: number         // Posição vertical (não é ID)
  atleta1: Atleta           // Inclui id UUID
  atleta2: Atleta          // Inclui id UUID
  resultado?: ResultadoLuta
  arbitro?: string
  dataLuta?: string
  nextMatchId?: string     // UUID da próxima luta
  previousMatchIds?: string[] // UUIDs das lutas anteriores
}
```

### 6.2 Tipos Auxiliares para Renderização

```typescript
interface BracketMatchup {
  id: string                    // UUID v4 da luta
  round: number                 // 1, 2, 3, 4 (não é ID)
  position: number              // Posição vertical no bracket (não é ID)
  fighter1?: FighterSlot
  fighter2?: FighterSlot
  result?: ResultadoLuta
  status: MatchupStatus
  label?: string                // "Round 1", "Quartas", "Semifinal", "Final"
  nextMatchId?: string          // UUID da próxima luta
  previousMatchIds?: string[]   // UUIDs das lutas anteriores
}

type MatchupStatus = "pending" | "bye" | "live" | "completed"

interface FighterSlot {
  athlete?: Atleta               // Inclui id UUID
  sourceMatchId?: string        // UUID da luta de origem
  seed?: number                 // Posição do seed (não é ID)
  isBye: boolean
  status: "winner" | "loser" | "disqualified" | null
}

interface BracketRound {
  label: string                  // "Round 1", "Quartas", "Semifinal", "Final"
  matchups: BracketMatchup[]
  side: "left" | "right" | "center"
}
```

### 6.3 Transformação de Dados

A função `buildBracketFromChaveLuta` transforma `ChaveLuta` em estrutura de bracket visual:

```typescript
function buildBracketFromChaveLuta(chave: ChaveLuta): BracketRound[] {
  // 1. Agrupa lutas por round
  // 2. Atribui side (left/right/center) baseado na posição
  //    - Round 1: 4 fights → 2 left (positions 0,1), 2 right (positions 2,3)
  //    - Rounds intermediários: center
  //    - Final: center
  // 3. Identifica BYEs (lutas com apenas 1 competidor)
  // 4. Preenche FighterSlot com base em previousMatchIds/nextMatchId (UUIDs)
  // 5. Aplica tags de resultado a partir de ResultadoLuta
}
```

### 6.4 Avanço do Vencedor via UUID

Quando uma luta é concluída:

1. Identificar luta atual pelo `Luta.id` (UUID)
2. Encontrar próxima luta: `Luta.nextMatchId` (UUID)
3. Preencher o `FighterSlot` da próxima luta com o vencedor
4. Re-renderizar bracket

```typescript
function advanceWinner(chave: ChaveLuta, completedFightId: string, winner: Atleta): ChaveLuta {
  const completedFight = chave.lutas.find(l => l.id === completedFightId)
  if (!completedFight) return chave

  const nextFightId = completedFight.nextMatchId
  if (!nextFightId) return chave

  const nextFight = chave.lutas.find(l => l.id === nextFightId)
  if (!nextFight) return chave

  // Preencher o slot disponível na próxima luta
  if (!nextFight.atleta1 || nextFight.atleta1.id === winner.id) {
    // Se atleta1 é o vencedor ou está vazio
  }
  // ... lógica de preenchimento baseada em previousMatchIds (UUIDs)

  return updatedChave
}
```

**IMPORTANTE:** Toda a lógica de busca de lutas usa `id` (UUID), nunca índices numéricos ou `round` como determinante. `round` e `position` são usados apenas para posicionamento visual.

---

## 7. Componentes UI

### 7.1 `BracketVisualizer`

Componente raiz que recebe `ChaveLuta` e renderiza o bracket.

**Props:**
```typescript
interface BracketVisualizerProps {
  chave: ChaveLuta
  onFightClick?: (luta: Luta) => void
  activeFightId?: string     // UUID da luta ativa
  mode?: "live" | "readonly"
}
```

### 7.2 `BracketMatchupCard`

Card individual de cada luta.

**Propriedades:**
```typescript
interface BracketMatchupCardProps {
  luta: Luta
  onClick?: () => void
  isActive?: boolean
  side: "left" | "right"
}
```

**Visual:**
- Competidor 1 no topo, Competidor 2 na base (layout vertical dentro do card)
- Nome + Equipe de cada competidor
- Tags de resultado abaixo do nome (`[VENCEU]`, `[PERDEU]`, `[DESCLASS.]`)
- Score (se finalizado)
- Botão "Lutar" se ambos competidores presentes e luta pendente

**Estados visuais:**
| Estado | Background | Borda |
|--------|-----------|-------|
| Pending | `#f3f4f6` | `#e5e7eb` |
| Live | `#fef3c7` | `#f59e0b` (pulsante) |
| Completed (winner) | `#dcfce7` | `#22c55e` |
| Completed (loser) | `#fee2e2` | `#ef4444` |
| Bye | `#6b7280` | `#4b5563` |

### 7.3 `BracketColumn`

Coluna vertical que agrupa matchups de uma rodada.

**Props:**
```typescript
interface BracketColumnProps {
  round: BracketRound
  connectorLines?: React.ReactNode
}
```

### 7.4 `BracketChampion`

Card especial para exibir o campeão.

**Props:**
```typescript
interface BracketChampionProps {
  champion?: Atleta   // Atleta com id UUID
  categoryName: string
}
```

**Visual:**
- Fundo dourado gradiente (`#fbbf24` → `#f59e0b`)
- Ícone de troféu
- Nome do campeão + equipe
- Badge "CAMPEÃO"

### 7.5 `ResultBadge`

Tag pequena para exibir resultado do competidor.

**Props:**
```typescript
interface ResultBadgeProps {
  status: "winner" | "loser" | "disqualified" | null
  submission?: boolean       // true → exibe "FINALIZOU"
}
```

### 7.6 `BracketConnector`

Linhas SVG que conectam as lutas.

**Props:**
```typescript
interface BracketConnectorProps {
  fromPosition: { x: number; y: number }
  toPosition: { x: number; y: number }
  matchupIds: { from: string; to: string }  // UUIDs das lutas
}
```

---

## 8. Fluxo de Dados

### 8.1 Entrada de Dados

O componente recebe `ChaveLuta` (já existente com UUIDs). A geração da chave é responsabilidade de outro módulo — aqui apenas consume e visualiza.

### 8.2 Atualização Dinâmica

1. `SeletorLutas` exibe o `BracketVisualizer` com a chave carregada
2. Usuário seleciona uma luta → `onFightClick(luta)` recebe `Luta.id` (UUID)
3. Ao finalizar luta → `marcarLutaConcluida()` atualiza `chave.lutas` referencing `Luta.id` (UUID)
4. `BracketVisualizer` re-renderiza com dados atualizados
5. Vencedor aparece advancement na próxima fase visualmente

### 8.3 Persistência

A atualização do bracket é feita através do fluxo existente:
1. Scoreboard atualiza estado local
2. `useStorage.ts` → `marcarLutaConcluida()` → API `PUT /api/area`
3. Scoreboard re-carrega dados via `GET /api/area`
4. `BracketVisualizer` atualiza com novos dados

**Todas as buscas de lutas usam `id` (UUID), não índices numéricos.**

---

## 9. Layout Visual Detalhado

### 9.1 Estrutura CSS/Grid

```
<div class="flex items-center justify-center gap-4 overflow-x-auto">
  <!-- Coluna Round 1 (left) -->
  <div class="flex flex-col gap-4">
    <BracketMatchupCard />  // positions 0,1 → lado esquerdo (1×2, 3×4)
    <BracketMatchupCard />
  </div>

  <!-- Coluna Round 1 (right) -->
  <div class="flex flex-col gap-4">
    <BracketMatchupCard />  // positions 2,3 → lado direito (5×6, 7×8)
    <BracketMatchupCard />
  </div>

  <!-- Connector lines (SVG) -->
  <svg>...</svg>

  <!-- Coluna Quartas (center) -->
  <div class="flex flex-col gap-8 justify-around">
    <BracketMatchupCard />  // Q1: positions 0,1 → alimentado por left
    <BracketMatchupCard />  // Q2: positions 2,3 → alimentado por right
  </div>

  <!-- Coluna Semifinal (center) -->
  <div class="flex flex-col justify-center">
    <BracketMatchupCard />  // S1
  </div>

  <!-- Coluna Final (center) -->
  <div class="flex flex-col justify-center">
    <BracketMatchupCard />  // Final
    <BracketChampion />     // 🏆 Campeão
  </div>
</div>
```

### 9.2 Responsividade

| Tela | Comportamento |
|------|--------------|
| Desktop (>1024px) | Bracket completo horizontal |
| Tablet (768-1024px) | Scroll horizontal, cards menores |
| Mobile (<768px) | Stack vertical por rodada (Round 1 → Quartas → ...) |

### 9.3 Cores

| Elemento | Cor |
|----------|-----|
| Pending background | `bg-gray-100` |
| Pending border | `border-gray-300` |
| Live background | `bg-amber-100` |
| Live border | `border-amber-400` (animate-pulse) |
| Winner background | `bg-green-100` |
| Winner border | `border-green-500` |
| Loser background | `bg-red-100` |
| Loser border | `border-red-500` |
| Bye background | `bg-gray-400` |
| Champion background | `bg-gradient-to-br from-amber-300 to-amber-500` |
| Tag winner | `bg-green-500 text-white text-xs px-2 py-0.5 rounded-full` |
| Tag loser | `bg-red-500 text-white text-xs px-2 py-0.5 rounded-full` |
| Tag disqualified | `bg-red-800 text-white text-xs px-2 py-0.5 rounded-full border-2 border-red-600` |
| Tag submission | `bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full` |

### 9.4 Linhas de Conexão

- SVG com linhas ortogonais
- Cor: `stroke-gray-400`
- Largura: `stroke-2`
- Curvas suaves com `stroke-linecap: round`

---

## 10. Funcionalidades

### 10.1 Seleção de Luta

- Clique em card pendente/live abre o scoring
- Card ativo recebe borda destacada (`ring-2 ring-amber-400`)
- Cards completed não são clicáveis (readonly)
- Seleção feita pelo `Luta.id` (UUID)

### 10.2 Destaque de Luta ao Vivo

- Ao selecionar uma luta, o bracket marca ela como `live`
- Card com animação pulsante de borda
- Score em tempo real aparece no card (opcional)
- Identificação da luta ativa pelo `activeFightId: string` (UUID)

### 10.3 Atualização em Tempo Real

- Após finalizar luta, bracket re-renderiza
- Vencedor avança para próxima fase (via `Luta.nextMatchId` UUID)
- Próxima luta muda status de `pending` para disponível

### 10.4 Exibição Pública (readonly)

- `mode="readonly"` desabilita todos os cliques
- Tags de resultado permanecem visíveis

### 10.5 Declaração de Campeão

Quando a luta final é concluída:
1. Card da Final exibe winner tag
2. Banner/modal aparece: `"🏆 {Nome} é o CAMPEÃO da categoria {categoria}!"`
3. `ChaveLuta.status` atualizado para `"concluida"`
4. `ChaveLuta.vencedorAtletaId` preenchido com o UUID do campeão

---

## 11. Critérios de Aceitação

- [ ] **AC1:** Dado 8 competidores, exibir bracket com 4 de cada lado convergindo para o centro
- [ ] **AC2:** Dado número ímpar de competidores (3, 5, 7), exibir BYEs corretamente
- [ ] **AC3:** Ao finalizar uma luta, o vencedor avança automaticamente na visualização (via UUID)
- [ ] **AC4:** Cards exibem tags `[VENCEU]`, `[PERDEU]`, `[DESCLASS.]`, `[FINALIZOU]` corretamente
- [ ] **AC5:** Luta em andamento é destacada com borda pulsante
- [ ] **AC6:** Ao finalizar luta final, modal de campeão é exibido
- [ ] **AC7:** Layout responsivo funciona em desktop, tablet e mobile
- [ ] **AC8:** Linhas de conexão entre os rounds são renderizadas corretamente
- [ ] **AC9:** Bracket atualiza em tempo real após cada resultado sem reload
- [ ] **AC10:** Mode `readonly` funciona para espectadores
- [ ] **AC11:** Todas as operações de busca/mapeamento de lutas usam UUID como identificador

---

## 12. Integração

### 12.1 Com `scoreboard/page.tsx`

- `<BracketVisualizer>` adicionado ao scoreboard (abaixo ou ao lado do score)
- `SeletorLutas` existente pode ser substituído ou complementado pelo bracket
- `onFightClick` recebe `Luta` com `id` (UUID) e abre scoring panel

### 12.2 Com `SeletorLuta.tsx`

- Substituir lista de lutas por `BracketVisualizer`
- Manter dropdown de categoria

### 12.3 Com API

- Nenhuma alteração na API necessária
- `BracketVisualizer` consome dados existentes de `ChaveLuta` (com UUIDs)

---

## 13. Dependências

- **Shadcn/ui**: Card, Badge (já instalados)
- **Tailwind CSS 4**: Estilização
- **SVG**: Linhas de conexão
- **Lucide React**: Ícones (troféu, etc.)
- **crypto.randomUUID()**: Geração de UUIDs (built-in)

---

## 14. Roadmap

1. **Fase 1:** Tipos + função `buildBracketFromChaveLuta` (UUID-based)
2. **Fase 2:** Componente `BracketMatchupCard` com todos os estados
3. **Fase 3:** Componente `ResultBadge` com tags de resultado
4. **Fase 4:** Layout `BracketVisualizer` com colunas e linhas de conexão
5. **Fase 5:** Lógica de avanço de vencedor via UUID + re-render
6. **Fase 6:** Champion declaration + responsividade