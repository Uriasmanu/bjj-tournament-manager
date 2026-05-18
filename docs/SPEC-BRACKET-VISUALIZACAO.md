# SPEC: Visualização Gráfica de Chave de Luta

## 1. Visão Geral

**Nome da Feature:** Visualização Gráfica de Chave de Luta (Bracket View)
**Módulo:** Scoreboard
**Prioridade:** Alta
**Estimativa:** —
**Histórico:** HU-001

---

## 2. Objetivo

Permitir que organizadores e espectadores visualizem a chave de luta de forma gráfica e dinâmica durante o andamento do campeonato, com atualização em tempo real conforme os resultados das lutas são definidos. A geração/criação da chave é feita em outro módulo da aplicação.

---

## 3. Estrutura Visual da Chave

A chave é renderizada em formato **horizontal duplo** — 4 competidores de cada lado convergindo para o centro.

### 3.1 Chave Completa (8 competidores)

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

**Lutas Round 1:** `1×2`, `3×4`, `5×6`, `7×8`
**Lutas Quartas:** `Q1 = Vencedor(1×2) × Vencedor(3×4)`, `Q2 = Vencedor(5×6) × Vencedor(7×8)`
**Lutas Semifinal:** `S1 = Vencedor(Q1) × Vencedor(Q2)`
**Luta Final:** `Final = Vencedor(S1) × Vencedor(S2)`

### 3.2 Regras de BYE

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

### 3.3 BYE Dinâmico durante o campeonato

Se durante o campeonato um competidor é **desclassificado antes de lutar**, ele recebe o status de BYE para a próxima fase — o próximo competidor avança automaticamente. Isso é tratado como uma desclassificação normal.

---

## 4. Tags nos Cards

Cada card de luta deve exibir **tags de status** pequenas e discretas.

### 4.1 Tags de Resultado

| Tag | Cor | Condição |
|-----|-----|----------|
| `VENCEU` | Verde (`#22c55e`) | Lutador venceu a luta |
| `DESCLASS.` | Vermelho escuro (`#991b1b`) + borda | Lutador foi desclassificado |

### 4.2 Posicionamento

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

### 4.3 Lógica de Exibição

- Se `resultado.vencedor === "atleta1"` → atleta1 exibe `[VENCEU]``
- Se `resultado.tipoVitoria === "desclassificacao"`:
  - Se `resultado.desclassificacao === "atleta1"` → atleta1 exibe `[DESCLASS.]`, atleta2 exibe `[VENCEU]`
  - Se `resultado.desclassificacao === "atleta2"` → atleta2 exibe `[DESCLASS.]`, atleta1 exibe `[VENCEU]`

---

## 5. Modelo de Dados

### 5.1 Tipos Existentes (não alterar)

O modelo atual de `Luta` e `ChaveLuta` já existe e não precisa ser modificado para esta feature. A visualização do bracket consome os dados existentes.

```typescript
interface Luta {
  id: number
  round: number
  atleta1: Atleta
  atleta2: Atleta
  resultado?: ResultadoLuta
  // ...
}
```

### 5.2 Tipos Auxiliares para Renderização

```typescript
interface BracketMatchup {
  id: string                    // Ex: "1-2", "Q1", "S1", "final"
  round: number                // 1, 2, 3, 4 (4 = Final)
  position: number             // Posição vertical no bracket
  fighter1?: FighterSlot
  fighter2?: FighterSlot
  result?: ResultadoLuta
  status: MatchupStatus
  label?: string               // "Round 1", "Quartas", "Semifinal", "Final"
}

type MatchupStatus = "pending" | "bye" | "live" | "completed"

interface FighterSlot {
  athlete?: Atleta
  sourceMatchId?: string        // ID da luta de origem
  seed?: number                // Posição do seed (1-8)
  isBye: boolean
}

interface BracketRound {
  label: string                // "Round 1", "Quartas", "Semifinal", "Final"
  matchups: BracketMatchup[]
  side: "left" | "right" | "center"
}
```

### 5.3 Transformação de Dados

A função `buildBracketFromChaveLuta` transforma `ChaveLuta` (formato atual) em estrutura de bracket visual:

```typescript
function buildBracketFromChaveLuta(chave: ChaveLuta): BracketRound[] {
  // Baseado no round e id das lutas, organiza em colunas
  // Round 1 = esquerda, rounds intermediários = centro, Final = centro
  // Agrupa lutas por round e atribui side (left/right/center)
}
```

---

## 6. Componentes UI

### 6.1 `BracketVisualizer`

Componente raiz que recebe `ChaveLuta` e renderiza o bracket.

**Props:**
```typescript
interface BracketVisualizerProps {
  chave: ChaveLuta
  onFightClick?: (luta: Luta) => void
  activeFightId?: number
  mode?: "live" | "readonly"
}
```

### 6.2 `BracketMatchupCard`

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
- Tags de resultado abaixo do nome
- Score (se finalizado): `2x1` ou similar
- Botão "Lutar" se ambos competidores presentes e luta pendente

**Estados visuais:**
| Estado | Background | Borda |
|--------|-----------|-------|
| Pending | `#f3f4f6` | `#e5e7eb` |
| Live | `#fef3c7` | `#f59e0b` (pulsante) |
| Completed (winner) | `#dcfce7` | `#22c55e` |
| Completed (loser) | `#fee2e2` | `#ef4444` |
| Bye | `#6b7280` | `#4b5563` |

### 6.3 `BracketColumn`

Coluna vertical que agrupa matchups de uma rodada.

**Props:**
```typescript
interface BracketColumnProps {
  round: BracketRound
  connectorLines?: React.ReactNode
}
```

### 6.4 `BracketChampion`

Card especial para exibir o campeão.

**Visual:**
- Fundo dourado gradiente (`#fbbf24` → `#f59e0b`)
- Ícone de troféu 🏆
- Nome do campeão + equipe
- Badge "CAMPEÃO"

### 6.5 `ResultBadge`

Tag pequena para exibir resultado do competidor.

**Props:**
```typescript
interface ResultBadgeProps {
  status: "winner" | "loser" | "disqualified" | null
  submission?: boolean
}
```

---

## 7. Fluxo de Dados

### 7.1 Entrada de Dados

O componente recebe `ChaveLuta` (já existente). A geração da chave é responsabilidade de outro módulo — aqui apenas consume e visualiza.

### 7.2 Atualização Dinâmica

1. `SeletorLutas` exibe o `BracketVisualizer` com a chave carregada
2. Usuário seleciona uma luta → `onFightClick(luta)` → abre scoring
3. Ao finalizar luta → `marcarLutaConcluida()` atualiza `chave.lutas`
4. `BracketVisualizer` re-renderiza com dados atualizados
5. Vencedor aparece advancement na próxima fase visualmente

### 7.3 Avanço do Vencedor

Quando uma luta é concluída:
1. Identificar luta atual pelo `id`
2. Calcular próximo `id` baseado em `round` e posição
3. Preencher competidores da próxima luta com o vencedor
4. Re-renderizar bracket

```typescript
function getNextMatchId(lutaId: number, round: number, totalLutasRound1: number): number {
  // Round 1: id 1,2,3,4 → next round ids 5,6,7,8 (pattern)
  // Round 2: id 5,6,7,8 → next round id 9,10 (pattern)
  // Round 3: id 9,10 → next round id 11 (final)
  const roundStartId = Math.pow(2, round - 1)
  const matchIndex = (lutaId - roundStartId) % (totalLutasRound1 / Math.pow(2, round - 1))
  return roundStartId + totalLutasRound1 / Math.pow(2, round - 1) + Math.floor(matchIndex / 2)
}
```

### 7.4 Persistência

A atualização do bracket é feita através do fluxo existente:
1. Scoreboard atualiza estado local
2. `useStorage.ts` → `marcarLutaConcluida()` → API `PUT /api/area`
3. Scoreboard re-carrega dados via `GET /api/area`
4. `BracketVisualizer` atualiza com novos dados

---

## 8. Layout Visual Detalhado

### 8.1 Estrutura CSS/Grid

```
<div class="flex items-center justify-center gap-4 overflow-x-auto">
  <!-- Coluna Round 1 (left) -->
  <div class="flex flex-col gap-4">
    <BracketMatchupCard />  // 1×2
    <BracketMatchupCard />  // 3×4
  </div>

  <!-- Coluna Round 1 (right) -->
  <div class="flex flex-col gap-4">
    <BracketMatchupCard />  // 5×6
    <BracketMatchupCard />  // 7×8
  </div>

  <!-- Connector lines (SVG) -->
  <svg>...</svg>

  <!-- Coluna Quartas -->
  <div class="flex flex-col gap-8 justify-around">
    <BracketMatchupCard />  // Q1
    <BracketMatchupCard />  // Q2
  </div>

  <!-- Connector lines -->

  <!-- Coluna Semifinal -->
  <div class="flex flex-col justify-center">
    <BracketMatchupCard />  // S1
  </div>

  <!-- Coluna Final -->
  <div class="flex flex-col justify-center">
    <BracketMatchupCard />  // Final
  </div>
</div>
```

### 8.2 Responsividade

| Tela | Comportamento |
|------|--------------|
| Desktop (>1024px) | Bracket completo horizontal |
| Tablet (768-1024px) | Scroll horizontal, cards menores |
| Mobile (<768px) | Stack vertical por rodada (Round 1 → Quartas → ...) |

### 8.3 Cores

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

### 8.4 Linhas de Conexão

- SVG com linhas ortogonais
- Cor: `stroke-gray-400`
- Largura: `stroke-2`
- Curvas suaves com `stroke-linecap: round`

---

## 9. Funcionalidades

### 9.1 Seleção de Luta

- Clique em card pendente/live abre o scoring
- Card ativo recebe borda destacada (`ring-2 ring-amber-400`)
- Cards completed não são clicáveis (readonly)

### 9.2 Destaque de Luta ao Vivo

- Ao selecionar uma luta, o bracket marca ela como `live`
- Card com animação pulsante de borda
- Score em tempo real aparece no card (opcional)

### 9.3 Atualização em Tempo Real

- Após finalizar luta, bracket re-renderiza
- Vencedor avança para próxima fase
- Próxima luta muda status de `pending` para disponível

### 9.4 Exibição Pública (readonly)

- `mode="readonly"` desabilita todos os cliques
- Tags de resultado permanecem visíveis
- último resultado pode ter badge "AO VIVO" se ainda em progresso

### 9.5 Declaração de Campeão

Quando a luta final é concluída:
1. Card da Final exibe winner tag
2. Banner/modal aparece: `"🎉 {Nome} é o CAMPEÃO!"`
3. `ChaveLuta.status` atualizado para `"concluida"`
4. `ChaveLuta.vencedor` preenchido com o nome

---

## 10. Critérios de Aceitação

- [ ] **AC1:** Dado 8 competidores, exibir bracket com 4 de cada lado convergindo para o centro
- [ ] **AC2:** Dado número ímpar de competidores (3, 5, 7), exibir BYEs corretamente
- [ ] **AC3:** Ao finalizar uma luta, o vencedor avança automaticamente na visualização
- [ ] **AC4:** Cards exibem tags `[VENCEU]`, `[PERDEU]`, `[DESCLASS.]` corretamente
- [ ] **AC5:** Luta em andamento é destacada com borda pulsante
- [ ] **AC6:** Ao finalizar luta final, modal de campeão é exibido
- [ ] **AC7:** Layout responsivo funciona em desktop, tablet e mobile
- [ ] **AC8:** Linhas de conexão entre os rounds são renderizadas corretamente
- [ ] **AC9:** Bracket atualiza em tempo real após cada resultado sem reload
- [ ] **AC10:** Mode `readonly` funciona para espectadores

---

## 11. Integração

### 11.1 Com `scoreboard/page.tsx`

- `<BracketVisualizer>` adicionado ao scoreboard (abaixo ou ao lado do score)
- `SeletorLutas` existente pode ser substituído ou complementado pelo bracket
- `onFightClick` abre scoring panel

### 11.2 Com `SeletorLuta.tsx`

- Substituir lista de lutas por `BracketVisualizer`
- Manter dropdown de categoria

### 11.3 Com API

- Nenhuma alteração na API necessária
- `BracketVisualizer` consome dados existentes de `ChaveLuta`

---

## 12. Dependências

- **Shadcn/ui**: Card, Badge (já instalados)
- **Tailwind CSS 4**: Estilização
- **SVG**: Linhas de conexão
- **Lucide React**: Ícones (troféu, etc.)

---

## 13. Roadmap

1. **Fase 1:** Tipos + função de transformação `buildBracketFromChaveLuta`
2. **Fase 2:** Componente `BracketMatchupCard` com todos os estados
3. **Fase 3:** Componente `ResultBadge` com tags de resultado
4. **Fase 4:** Layout `BracketVisualizer` com colunas e linhas de conexão
5. **Fase 5:** Lógica de avanço de vencedor + re-render
6. **Fase 6:** Champion declaration + responsividade