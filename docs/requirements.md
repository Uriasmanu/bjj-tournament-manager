# Requisitos do Sistema — BJJ Tournament Manager

**Versão:** 9.0
**Data:** 2026-05-26
**Projeto:** Sistema de Gerenciamento de Competições de Jiu-Jitsu Brasileiro

---

## 1. Visão Geral

| Campo | Valor |
|-------|-------|
| Nome do Projeto | BJJ Tournament Manager |
| Tipo | Aplicação Web (SPA, Next.js App Router) |
| Resumo | Sistema de gerenciamento de competições de Jiu-Jitsu Brasileiro com gestão de chaves de luta, painel administrativo para árbitros e placar em tempo real para exibição pública |
| Público-alvo | Árbitros, organizadores, atletas e espectadores de competições de Jiu-Jitsu |
| Persistência | Arquivos JSON no sistema de arquivos via API REST (sem banco de dados) |
| Stack | Next.js 16.2.6, React 19.2.4, Tailwind CSS 4, TypeScript 5, Shadcn UI |

---

## 2. Regras de Implementação

### 2.1 Identificadores (UUID)

**Todos os IDs do sistema devem ser UUIDs v4**, sem exceções. Isso garante unicidade global, evitar conflitos em importações/merge de dados e rastreabilidade.

| Entidade | Tipo do ID | Formato |
|----------|-----------|---------|
| `Atleta` | `id: string` | `uuid-v4` |
| `Luta` | `id: string` | `uuid-v4` |
| `ChaveLuta` | `id: string` | `uuid-v4` |
| `DadosArea` | `id: string` | `uuid-v4` |
| `ResultadoLuta` | `id: string` | `uuid-v4` |

> **IMPORTANTE:** Campos numéricos como `round` e `seed` **não são IDs** — estes permanecem como `number`. O campo `position` é usado para posicionamento no layout do bracket.

### 2.2 Componentes UI
- **OBRIGATÓRIO**: Usar sempre componentes do **Shadcn UI** nas implementações
- Componentes disponíveis atualmente: Button, Card, Input, Badge
- **Dialog, Select e Toast do Shadcn não estão implementados** — modais usam divs customizadas ou sobreposição simples
- Localização: `@/components/ui/`

### 2.3 Botões com Fundo Branco
- **OBRIGATÓRIO**: Quando um botão tiver fundo branco (#FFFFFF), o texto deve ser obrigatoriamente escuro (#000000 ou similar)

### 2.4 Layout Responsivo
- O sistema deve funcionar em desktop e dispositivos móveis
- Layout otimizado para telão/projetor no scoreboard

### 2.5 Hydration Guard
Todas as páginas com estado cliente (`"use client"`) implementam proteção de hidratação:

```typescript
const [isHydrated, setIsHydrated] = useState(false)
useEffect(() => { setIsHydrated(true) }, [])
if (!isHydrated) return null // ou loading state
```

### 2.6 LocalStorage
Chaves utilizadas no localStorage:

| Chave | Uso | Localização |
|-------|-----|-------------|
| `bjj_tournament_area_nome` | Nome da área ativa | `useStorage.ts`, `scoreboard/setup/page.tsx` |
| `bjj_tournament_ultima_categoria` | Última categoria selecionada | `scoreboard/page.tsx` |

---

## 3. Armazenamento de Dados (JSON)

O sistema utiliza **JSON** como formato principal para armazenamento e persistência de dados.

### Estrutura de Arquivos

```
data/
├── area-1.json           # Dados da Área (nome sanitizado: lower case + hífens)
└── ...
```

### API REST

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/area?area=NOME` | Retorna dados de uma área pelo nome. Lê `data/[nome-sanitizado].json`. Retorna estrutura vazia padrão se arquivo não existir |
| POST | `/api/area` | Cria/sobrescreve dados de uma área |
| PUT | `/api/area` | Atualiza dados de uma área (merge com existentes, preserva `criadoEm`, atualiza `atualizadoEm`) |
| DELETE | `/api/area?area=NOME` | **NÃO IMPLEMENTADO** — chamado por `limparDados()` mas a API retorna 405 |

> O nome do arquivo é gerado via `area.toLowerCase().replace(/[^a-z0-9]/g, "-") + ".json"`.

---

## 4. Estrutura de Dados (Modelos TypeScript)

### Atleta
```typescript
interface Atleta {
  id: string            // UUID v4
  nome: string
  equipe: string
  faixa?: string        // Opcional: "Branca" | "Azul" | "Roxa" | "Marrom" | "Preta"
  avancou?: boolean     // Indica se o atleta avançou por BYE
}
```

### ResultadoLuta
```typescript
interface ResultadoLuta {
  id: string                    // UUID v4
  // Pontuação total
  pontosAtleta1: number
  pontosAtleta2: number
  // Detalhamento (4 pts cada)
  montadasAtleta1: number
  montadasAtleta2: number
  // Detalhamento (3 pts cada)
  passagensAtleta1: number
  passagensAtleta2: number
  // Detalhamento (2 pts cada)
  quedasAtleta1: number
  quedasAtleta2: number
  // Vantagens e penalidades
  vantagensAtleta1: number
  vantagensAtleta2: number
  penalidadesAtleta1: number
  penalidadesAtleta2: number
  // Tempo
  tempoDecorrido: number
  // Flags de resultado
  finalizacaoAtleta1: boolean
  finalizacaoAtleta2: boolean
  desclassificacao: "atleta1" | "atleta2" | null
  vencedor: "atleta1" | "atleta2" | "empate" | null
  tipoVitoria: "pontos" | "finalizacao" | "desclassificacao" | "empate"
  status: "pendente" | "concluida"
  // Referências
  lutaId: string | null             // UUID da luta
  vencedorAtletaId: string | null   // UUID do vencedor
  perdedorAtletaId: string | null   // UUID do perdedor
  AtletaDesclassificadoId: string | null  // UUID do desclassificado
}
```

### Luta
```typescript
interface Luta {
  id: string               // UUID v4
  round: number            // 1, 2, 3, 4 (não é ID)
  position: number         // Posição no layout do bracket (preenchido automaticamente)
  atleta1: Atleta | null
  atleta2: Atleta | null
  resultado?: ResultadoLuta
  arbitro?: string
  dataLuta?: string
  nextMatchId?: string     // UUID da próxima luta
  previousMatchIds?: string[]  // UUIDs das lutas anteriores
  tags?: string[]           // Ex: ["AVANÇOU"] para BYE
}
```

### ChaveLuta
```typescript
interface ChaveLuta {
  id: string                    // UUID v4
  categoria: string             // Ex: "Branca Adulto Masculino - 65kg"
  lutas: Luta[]
  arbitro?: string
  vencedorAtletaId?: string     // UUID do campeão
  status: "pendente" | "em_andamento" | "concluida"
  totalCompetidores: number
  classificacaoFinal?: ClassificacaoFinal
}
```

### ClassificacaoFinal (Pódio)
```typescript
interface ClassificacaoFinal {
  chaveId: string
  campeao?: { id: string; nome: string; equipe: string; faixa?: string }
  vice?: { id: string; nome: string; equipe: string; faixa?: string }
  terceiroA?: { id: string; nome: string; equipe: string; faixa?: string }
  terceiroB?: { id: string; nome: string; equipe: string; faixa?: string }
  dataAtualizacao: string
}
```

### DadosArea
```typescript
interface DadosArea {
  id: string                // UUID v4
  area: string              // Nome da área (ex: "Área 1")
  criadoEm: string          // ISO timestamp
  atualizadoEm?: string     // ISO timestamp
  chaves: ChaveLuta[]
  classificacoes?: ClassificacaoFinal[]
}
```

### Tipos de Visualização (não persistidos)
```typescript
type MatchupStatus = "pending" | "bye" | "live" | "completed"

interface FighterSlot {
  athlete?: Atleta | null
  sourceMatchId?: string
  seed?: number
  isBye: boolean
  resultStatus: "winner" | "loser" | "disqualified" | null
}

interface BracketMatchup {
  id: string; round: number; position: number
  fighter1?: FighterSlot; fighter2?: FighterSlot
  result?: ResultadoLuta; status: MatchupStatus
  label: string; nextMatchId?: string; previousMatchIds?: string[]
}

interface BracketRound {
  label: string; matchups: BracketMatchup[]
  side: "left" | "right" | "center"
}
```

### Constantes de Faixas
```typescript
const FAIXAS = ["Branca", "Azul", "Roxa", "Marrom", "Preta"] as const
type Faixa = typeof FAIXAS[number]

const CORES_FAIXA: Record<Faixa, string> = {
  "Branca": "bg-white text-black border-2 border-gray-300",
  "Azul": "bg-blue-700 text-white",
  "Roxa": "bg-purple-700 text-white",
  "Marrom": "bg-amber-900 text-white",
  "Preta": "bg-black text-white border-2 border-gray-500",
}
```

---

## 5. Stack Tecnológico

| Componente | Tecnologia | Versão |
|------------|------------|--------|
| Framework | Next.js | 16.2.6 (App Router) |
| UI | React | 19.2.4 |
| Estilização | Tailwind CSS | 4.x (`@tailwindcss/postcss`) |
| Componentes | Shadcn UI | latest (config: `radix-nova`, RSC: true) |
| Ícones | Lucide React | 1.16.x |
| Linguagem | TypeScript | 5.x |
| Gerenciamento de classes | clsx + tailwind-merge | via `@/lib/utils.ts` |
| Fontes | Geist, Geist Mono (Next.js font) | — |
| CSS Animations | tw-animate-css | 1.4.x |

---

## 6. Paleta de Cores

| Cor | Hexadecimal | Uso |
|-----|-------------|-----|
| Azul Anil | `#4338CA` | Cor primária, botões principais, highlights |
| Preto | `#0A0A0A` | Fundos principais, sidebars, áreas de destaque |
| Branco | `#FFFFFF` | Cards, áreas de conteúdo, texto em fundos escuros |
| Dourado | `#D4AF37` | Destaques especiais, títulos, botões de finalizar, elementos premium |
| Verde | `#22C55E` | Status de luta concluída |
| Vermelho | `#DC2626` | Botões de desclassificação, alertas |

---

## 7. Estrutura de Pastas (Completa)

```
bjj-tournament-manager/
├── app/
│   ├── page.tsx                     # Tela inicial (Home)
│   ├── layout.tsx                   # Layout raiz (fontes Geist)
│   ├── globals.css                  # Tailwind v4 + Shadcn tokens
│   ├── api/area/route.ts            # API REST de área (GET/POST/PUT)
│   ├── admin/
│   │   ├── layout.tsx               # Layout admin com sidebar
│   │   ├── page.tsx                 # Dashboard admin (cards de atalho)
│   │   └── matches/page.tsx         # Página de teste de pontuação (hardcoded)
│   ├── bracket-test/page.tsx        # Página de teste de bracket
│   ├── scoreboard/
│   │   ├── layout.tsx               # Layout scoreboard (bg preto)
│   │   ├── page.tsx                 # Placar principal + SeletorLutas + PlacarCompleto
│   │   └── setup/page.tsx           # Setup de área (importação de JSONs)
│   ├── hooks/
│   │   ├── useStorage.ts            # Persistência via API (CRUD)
│   │   ├── useImportacao.ts         # Importação de arquivos JSON
│   │   └── useBracket.ts            # Hook para visualização de bracket
│   ├── lib/
│   │   ├── uuid.ts                  # Geração/validação de UUID v4
│   │   ├── migrate-ids.ts           # Migração de IDs legados para UUID
│   │   ├── bracket-utils.ts         # Lógica de bracket/chaveamento
│   │   ├── mock-bracket-data.ts     # Dados mock para teste
│   │   └── utils.ts                 # cn() utility (clsx + tailwind-merge)
│   ├── types/index.ts               # Interfaces e tipos globais
│   └── components/
│       ├── Timer.tsx                # Cronômetro (ScoreboardTimer)
│       ├── scoreboard/
│       │   ├── AtletaCard.tsx       # Card de atleta com pontuação
│       │   ├── BadgeFaixa.tsx       # Badge de faixa (correspondente)
│       │   ├── ScoreButton.tsx      # Botão de pontuação (+/-)
│       │   ├── ScoreHeader.tsx      # Header com área e árbitro editável
│       │   ├── TotalScore.tsx       # Placar total (grande)
│       │   ├── VantagemPunicao.tsx  # Controles de vantagem/punição
│       │   ├── AdicionarLutaModal.tsx  # Modal de criação de luta manual
│       │   ├── SeletorLuta.tsx      # [NÃO USADO] Substituído por lógica inline
│       │   ├── BracketPanel.tsx     # [NÃO USADO] Substituído por BracketVisualizer
│       │   └── useScoreSound.ts     # [NÃO USADO] Efeito sonoro (Web Audio)
│       ├── bracket/
│       │   ├── index.ts             # Re-exports
│       │   ├── BracketVisualizer.tsx  # Componente principal de bracket
│       │   ├── BracketLayout.tsx    # Grid 7 colunas + SVG connections + pódio
│       │   ├── BracketChampion.tsx  # Card de campeão (chaves de 1 competidor)
│       │   ├── BracketEmptyState.tsx  # Estado vazio
│       │   ├── BracketColumn.tsx    # [NÃO USADO] Legado
│       │   ├── BracketMatchupCard.tsx # [NÃO USADO] Legado
│       │   ├── ResultBadge.tsx      # [NÃO USADO] Legado
│       │   └── ChampionModal.tsx    # [NÃO USADO] Modal de campeão
│       └── setup/
│           ├── index.ts             # Re-exports
│           ├── AreaCard.tsx         # Card de definição de área
│           ├── ImportacaoCard.tsx   # Card de importação de JSON
│           ├── ResultadoImportacaoCard.tsx  # Resultados da importação
│           ├── ChaveList.tsx        # Lista de chaves importadas
│           ├── ActionButtons.tsx    # Botões "Próximo" e "Criar Luta Manual"
│           ├── LutaManualForm.tsx   # Formulário de luta manual
│           └── Toast.tsx            # Toast customizado (não Shadcn)
├── components/ui/                   # Componentes Shadcn
│   ├── button.tsx, card.tsx, input.tsx, badge.tsx
├── data/
│   └── area-1.json                 # Dados de exemplo
├── docs/
│   ├── requirements.md              # Este documento
│   └── analise-bug-luta-pendente.md # Bug analysis: BYE count
├── lib/utils.ts                     # cn() utility
├── package.json, tsconfig.json, next.config.ts, postcss.config.mjs, components.json
└── AGENTS.md                        # Aviso sobre breaking changes do Next.js
```

---

## 8. Regras de Negócio — Sistema de Pontuação BJJ

### 8.1 Pontuação Base

| Ação | Pontos | Descrição |
|------|--------|-----------|
| Montada / Pegada nas Costas | 4 | Posição de controle dominante |
| Passagem de Guarda | 3 | Superar a guarda do oponente |
| Queda, Raspagem, Joelho na barriga | 2 | Takedown, sweep ou joelho na barriga |

### 8.2 Cálculo de Pontos

```
Total = montadas * 4 + passagens * 3 + quedas * 2
```

Cada tipo de ponto é contado individualmente (não apenas o total). O sistema salva a quantidade de cada tipo no `ResultadoLuta` para auditoria.

### 8.3 Vantagens e Penalidades

- **Vantagens**: Contador independente (+1/-1), não convertido em pontos
- **Penalidades**: Contador independente (+1/-1), não convertido em pontos
- Ambos são exibidos no placar e salvos no resultado, mas **não entram no cálculo de pontos totais**

### 8.4 Determinação do Vencedor

1. **Finalização**: Se `finalizacaoAtleta1` ou `finalizacaoAtleta2` for true → quem finalizou vence
2. **Desclassificação (DSQ)**: Se `desclassificacao` for definido → o outro atleta vence automaticamente
3. **Pontos**: Se nenhum dos acima → vence quem tiver mais pontos (montada + passagem + queda)
4. **Critério de desempate**: Pontos + vantagens (implementado na lógica de `marcarLutaConcluida`)

### 8.5 Tipos de Vitória

| Tipo | Descrição | Campo |
|------|-----------|-------|
| `pontos` | Vitória por pontos acumulados | `tipoVitoria: "pontos"` |
| `finalizacao` | Vitória por finalização/submissão | `tipoVitoria: "finalizacao"` |
| `desclassificacao` | Vitória por desclassificação do oponente | `tipoVitoria: "desclassificacao"` |
| `empate` | Empate | `tipoVitoria: "empate"` |

---

## 9. Regras de Negócio — Chaves (Bracket)

### 9.1 Status da Chave

| Status | Descrição | Transição |
|--------|-----------|-----------|
| `pendente` | Nenhuma luta foi concluída | → `em_andamento` (primeira luta concluída) |
| `em_andamento` | Pelo menos uma luta concluída, mas ainda há lutas reais pendentes | → `concluida` (todas as lutas reais concluídas) |
| `concluida` | Todas as lutas reais foram concluídas | Terminal |

### 9.2 Ciclo de Vida da Chave

1. Importação (JSON) ou criação manual → `status: "pendente"`
2. Primeira luta concluída → `status: "em_andamento"`
3. Todas as lutas reais concluídas → `status: "concluida"`
4. Campeão definido em `vencedorAtletaId`

### 9.3 Determinação de Lutas Pendentes (Regra Crítica)

**Regra (já corrigida no código):**

> `REQ-FINALIZACAO-CHAVE`: Uma chave deve ser considerada "concluida" **quando todas as lutas reais** (aquelas com `atleta1` e `atleta2` preenchidos) tiverem `resultado.status === "concluida"`. Lutas BYE (com pelo menos um atleta `null`) **não devem ser contabilizadas** como pendentes.

Em `useStorage.ts:189`:
```typescript
const temLutasPendentes = chave.lutas
  .filter(l => l.atleta1?.id && l.atleta2?.id)  // apenas lutas reais
  .some(l => l.resultado?.status !== "concluida")
```

### 9.4 Avanço Automático de Vencedor

**Função:** `advanceWinner()` em `app/lib/bracket-utils.ts`

**Regras:**

1. **Luta final** (round === maxRound): Marca chave como `concluida`, define `vencedorAtletaId`
2. **Luta não-final**: Coloca vencedor na próxima luta via `nextMatchId` ou posicionamento
3. **Preserva** `AtletaDesclassificadoId` durante o avanço (não sobrescreve com null)

### 9.5 Tratamento de BYE

- Luta é considerada BYE se `atleta1?.id` ou `atleta2?.id` for `null`/`undefined`
- Lutas BYE **não podem ser iniciadas** (botão desabilitado)
- Lutas BYE **não contam** como pendentes para status da chave
- Atleta presente em luta BYE avança automaticamente para próxima fase
- Exibição: "BYE" no lugar do nome, tag "AVANÇOU", cor cinza
- Função `isByeSlot(luta)`: retorna `!luta.atleta1?.id || !luta.atleta2?.id`
- Função `isRealFight(luta)`: retorna `!!luta.atleta1?.id && !!luta.atleta2?.id`

### 9.6 Posicionamento no Bracket (`generatePosition`)

| Round | Lado Esquerdo (posições pares) | Lado Direito (posições ímpares) |
|-------|-------------------------------|---------------------------------|
| Round 1 | 0, 2, 4, 6 | 1, 3, 5, 7 |
| Round 2 | 0, 1 | 2, 3 |
| Round 3 | 0 | 1 |

Para BYE:
- BYE no lado direito (posição ímpar) → Round 2 posição 3
- BYE no lado esquerdo (posição par) → Round 2 posição 1

### 9.7 Função `podeIniciarLuta`

Uma luta só pode ser iniciada se:
1. Ambos `atleta1` e `atleta2` têm `id` (não é BYE)
2. Todas as lutas anteriores (`previousMatchIds`) estão concluídas OU eram BYE

---

## 10. Regras de Negócio — Chaves de 3 Competidores

### 10.1 Estrutura

Para `totalCompetidores === 3`:
- Round 1: [A vs B], [C vs null (BYE)]
- Round 2: Luta de consolação (perdedor do R1 vs C)
- Round 3: Final (vencedor do R1 vs vencedor do R2)
- Round 3 **não é criado na importação** — é populado dinamicamente

### 10.2 Fluxo Normal (sem DSQ)

```
Round 1: [A vs B] → A vence
         [C vs null] → C avança (BYE)

advanceWinner(Round 1):
  → Coloca B (perdedor) no slot vazio do Round 2
    Round 2: [C vs B]
  → Cria Round 3 (se não existir)
  → Vencedor A → Round 3 atleta1

Round 2: [C vs B] → C vence

advanceWinner(Round 2):
  → Vencedor C → Round 3 atleta2
  → Round 3: [A vs C] FINAL
```

### 10.3 Fluxo com DSQ

```
Round 1: [A vs B] → B desclassificado, A vence
         [C vs null] → C avança (BYE)

advanceWinner(Round 1):
  → isDesclassificacao = true
  → Cria Round 3: atleta1 = A, atleta2 = C
  → Round 2 marcado como "AVANÇOU" (não é disputado)
  → Round 3: [A vs C] FINAL
```

### 10.4 Pódio para 3 Competidores

- **1º**: Vencedor da Final
- **2º**: Perdedor da Final
- **3º**: Apenas um terceiro lugar
  - Se houve DSQ no R1: atleta desclassificado é o 3º lugar
  - Se não houve DSQ: perdedor do Round 2 (consolação) é o 3º lugar
- O perdedor da final **nunca** é usado como 3º lugar (ele é vice-campeão)

---

## 11. Regras de Negócio — Chaves de 4 Competidores

### 11.1 Estrutura

Para `totalCompetidores === 4`:
- Round 1: [A vs B], [C vs D] (duas lutas reais)
- Round 3: Final (vencedor de A vs B vs vencedor de C vs D)
- **Não há Round 2** — vencedores do R1 avançam diretamente para R3
- Round 3 **não é criado na importação** — é populado dinamicamente por `advanceWinner()`

### 11.2 Fluxo Normal

```
Round 1: [A vs B] → A vence, B perde (3º lugar automático)
         [C vs D] → C vence, D perde (3º lugar automático)

advanceWinner(Round 1, position 0):
  → A (vencedor) → Round 3 atleta1
  → Cria Round 3 se não existir

advanceWinner(Round 1, position 1):
  → C (vencedor) → Round 3 atleta2

Round 3: [A vs C] FINAL (criado dinamicamente)
```

### 11.3 Fluxo com DSQ

- Atleta desclassificado **não avança** e **não recebe 3º lugar**
- O vencedor vai para R3 normalmente
- O 3º lugar é apenas o perdedor da outra luta do R1 (ou apenas um dos dois, se houver DSQ)

### 11.4 Pódio para 4 Competidores

- **1º**: Vencedor da Final
- **2º**: Perdedor da Final
- **3º**: Ambos perdedores do Round 1 (duas pessoas dividem o 3º lugar)
  - **Exceção DSQ**: Se um dos perdedores foi desclassificado, ele **não** recebe 3º lugar

### 11.5 Status da Chave

- `pendente` → Primeira luta R1 concluída (`em_andamento`)
- `em_andamento` → R3 criado, aguardando conclusão
- `concluida` → R3 concluído

---

## 12. Regras de Negócio — Pódio e Classificação Final

### 12.1 Derivação do Campeão

Ordem de precedência:
1. `chave.vencedorAtletaId` — se presente, busca o atleta em todas as lutas via `findChampion()`
2. Último combate concluído (`maxRound`) — se `isFinalConcluida` for true, o vencedor do último combate é o campeão

### 12.2 Derivação do Vice

- Perdedor do último combate (final)

### 12.3 Derivação do 3º Lugar (4+ competidores)

- `thirdPlaceLeft`: Perdedor da semifinal esquerda (round 3, position 0)
- `thirdPlaceRight`: Perdedor da semifinal direita (round 3, position 1)
- Ambos os 3º lugares são exibidos

### 12.4 Quando o Pódio é Exibido

- **1º e 2º**: Exibidos mesmo com `chave.status === "em_andamento"`, desde que o combate final esteja concluído (`resultado.status === "concluida"`)
- **3º**: Exibido quando a semifinal/consolação correspondente está concluída

---

## 13. Regras de Negócio — Finalização de Luta

### 13.1 Fluxo Normal

1. Árbitro clica em "Finalizar Luta" (botão dourado no placar)
2. **Modal 1**: Selecionar Vencedor — dois botões grandes, um para cada atleta
3. **Modal 2**: Selecionar Tipo de Vitória — "Pontos" ou "Finalização"
4. Sistema cria `ResultadoLuta` com UUID próprio via `crypto.randomUUID()`
5. JSON da área é atualizado via API PUT
6. Status da luta muda para `"concluida"`
7. `advanceWinner()` é chamado para mover vencedor para próxima luta
8. Se `salvarDados()` falhar, fluxo é interrompido (retorna ao seletor com erro no console)
9. Após salvar com sucesso, sistema recarrega dados e retorna ao seletor de lutas

### 13.2 Fluxo de Desclassificação (DSQ)

1. Botão "DSQ" discreto (30% opacity, hover 100%) no canto superior direito de cada `AtletaCard`
2. **Modal 1**: "Qual atleta será desclassificado?" — dois botões com nomes
3. **Modal 2**: Confirmação — "Tem certeza?" + mostra quem será declarado vencedor
4. Regras:
   - Se atleta1 for desclassificado → atleta2 vence
   - Se atleta2 for desclassificado → atleta1 vence
5. `tipoVitoria` = `"desclassificacao"`
6. `desclassificacao` = `"atleta1"` ou `"atleta2"`
7. `AtletaDesclassificadoId` é preservado durante `advanceWinner()`

### 13.3 Dados Salvos no Resultado

| Campo | Descrição |
|-------|-----------|
| `id` | UUID único |
| `pontosAtleta1/2` | Total de pontos |
| `montadasAtleta1/2` | Quantidade de montadas (4 pts cada) |
| `passagensAtleta1/2` | Quantidade de passagens (3 pts cada) |
| `quedasAtleta1/2` | Quantidade de quedas/raspagens (2 pts cada) |
| `vantagensAtleta1/2` | Contador de vantagens |
| `penalidadesAtleta1/2` | Contador de penalidades |
| `tempoDecorrido` | Tempo em segundos |
| `finalizacaoAtleta1/2` | Flag de finalização |
| `desclassificacao` | Qual atleta foi desclassificado |
| `tipoVitoria` | Tipo: pontos, finalizacao, desclassificacao |
| `vencedor` | `atleta1`, `atleta2` ou `null` |
| `status` | `concluida` |
| `lutaId` | UUID da luta |
| `vencedorAtletaId` | UUID do vencedor |
| `perdedorAtletaId` | UUID do perdedor |
| `AtletaDesclassificadoId` | UUID do desclassificado (se houver) |

---

## 13. Regras de Negócio — Fluxo de Importação

### 13.1 Formato do JSON de Importação

```json
{
  "id": "uuid-v4 (opcional)",
  "categoria": "Branca Infantil",
  "totalCompetidores": 8,
  "lutas": [
    {
      "id": "uuid-v4 (opcional)",
      "round": 1,
      "atleta1": { "id": "uuid-v4 (opcional)", "nome": "João", "equipe": "Team" },
      "atleta2": { "id": "uuid-v4 (opcional)", "nome": "Maria", "equipe": "Team" },
      "nextMatchId": "uuid (opcional)",
      "previousMatchIds": ["uuid (opcional)"]
    }
  ]
}
```

### 13.2 Regras de Validação

| Regra | Ação se inválida |
|-------|------------------|
| Deve ser objeto JSON válido | Erro: "Formato inválido" |
| `categoria` string não vazia | Erro: "Campo 'categoria' é obrigatório" |
| `lutas` deve ser array | Erro: "Campo 'lutas' deve ser um array" |
| `lutas` array não vazio | Erro: "A chave não contém lutas" |

### 13.3 Processamento na Importação

1. UUIDs gerados para IDs ausentes (ChaveLuta, Luta, Atleta, ResultadoLuta)
2. `ResultadoLuta` inicial criado com status `"pendente"`
3. Contagem de competidores únicos por nome
4. **Chaves de 3 atletas**: Remove rounds > 2 (Round 3 não deve vir na importação)
5. `generatePosition()` chamado para calcular posições corretas
6. **BYE na importação**: Para lutas Round 1 com atleta `null`, cria automaticamente:
   - Luta Round 1 com tag `"AVANÇOU"` e `nextMatchId` apontando para Round 2
   - Luta Round 2 com `previousMatchIds` apontando para Round 1, position calculada
   - Posição Round 2: BYE posição ímpar → posição 3, BYE posição par → posição 1

---

## 15. Regras de Negócio — Migração de UUID

### 15.1 Migração Automática

Ao carregar dados da API, `migrateAllData()` é executado:
1. Verifica se cada entidade tem UUID v4 válido
2. Gera novos UUIDs para entidades sem ID válido
3. **Atenção**: `migrateLuta()` limpa `nextMatchId` e `previousMatchIds`
4. **Atenção**: `migrateResultado()` limpa `lutaId`, `vencedorAtletaId`, `perdedorAtletaId`, `AtletaDesclassificadoId`
5. Preserva UUIDs existentes em dados já migrados

### 15.2 Geração de UUID

- Usar `crypto.randomUUID()` (built-in do Node.js/browser)
- Regex de validação: `/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`

---

## 16. Regras de Negócio — Criação Manual de Lutas

### 16.1 Duas Implementações

**Setup (`/scoreboard/setup`):**
- Componente: `LutaManualForm`
- Sempre cria nova `ChaveLuta` com categoria "Luta Manual"
- Campos: nome (obrigatório), equipe (opcional), faixa (dropdown) para ambos atletas
- `totalCompetidores` = 2

**Scoreboard (`/scoreboard`):**
- Componente: `AdicionarLutaModal`
- Adiciona à chave "Luta Manual" existente (ou cria nova)
- Campos: nome (obrigatório), equipe (opcional) para ambos atletas — **sem campo de faixa**
- Recalcula `totalCompetidores`

---

## 17. Regras de Negócio — Cronômetro

### 16.1 Componente `ScoreboardTimer`

| Funcionalidade | Descrição |
|---------------|-----------|
| Tempos predefinidos | Select: 2min (120s), 5min (300s), 6min (360s), 10min (600s) |
| Configuração manual | Campos minutos/segundos, toggle "Definir tempo manualmente" |
| Controles | Iniciar/Parar, Reiniciar |
| Alerta visual | ≤10s: texto vermelho; 0: texto cinza |
| Tempo decorrido | Reportado via `onTimeUpdate` a cada tick |
| Reset | Zera tempo e notifica via `onReset` |

### 17.2 Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `onTimeEnd` | `() => void` | Callback quando tempo chega a 0 |
| `onReset` | `() => void` | Callback quando timer é reiniciado |
| `onTimeUpdate` | `(elapsedSeconds: number) => void` | Reporta tempo decorrido |

---

## 18. Utilitários de Bracket

### Funções em `app/lib/bracket-utils.ts`

| Função | Descrição |
|--------|-----------|
| `isThreeCompetitorsChave(chave)` | Verifica se `totalCompetidores === 3` |
| `isFourCompetitorsChave(chave)` | Verifica se `totalCompetidores === 4` |
| `buildBracketFromChaveLuta(chave)` | Converte ChaveLuta em `BracketRound[]` para visualização |
| `generatePosition(lutas)` | Calcula posições automaticamente considerando BYE |
| `calculateByePosition(sourceLuta, fallback, lutas)` | Calcula posição de atleta que avança por BYE |
| `isRealFight(luta)` | Ambos atletas têm ID |
| `advanceWinner(chave, fightId, winner, loser)` | Move vencedor para próxima luta |
| `getFighterTags(resultado, fighter)` | Retorna tags: VENCEU, PERDEU, DESCLASS., FINALIZOU |
| `getFighterStatus(resultado, fighter)` | Retorna "winner", "loser", "disqualified" ou null |
| `getRoundLabel(round)` | 1→"Round 1", 2→"Quartas", 3→"Semifinal", 4→"Final" |
| `isByeSlot(luta)` | Verifica se é BYE |
| `getLutaById(chave, lutaId)` | Busca luta por ID |
| `findAtletaById(chave, atletaId)` | Busca atleta por ID em todas as lutas |
| `getUnicoAtleta(chave)` | Retorna atleta único em chaves de 1 competidor |
| `podeIniciarLuta(luta, chave)` | Verifica se luta pode ser iniciada |
| `canInteract(luta, chave)` | Mesmo que `podeIniciarLuta` |

---

## 19. Visualização de Bracket

### 19.1 Estrutura do Layout

### 18.2 Componentes Internos

| Componente | Descrição |
|------------|-----------|
| `CompetitorCard` | Card individual de competidor com nome, equipe, resultado, tags |
| `Round1Pair` | Par de competidores lado esquerdo |
| `Round1PairRight` | Par de competidores lado direito |
| `Round2Pair` / `Round2PairRight` | Quartas de final |
| `SemiFinalCard` | Card de semifinal (suporta `forceAtletaIndex` para chaves de 3) |
| `FinalistCard` | Card de finalista no painel central |
| `PodiumLine` | Linha de classificação final (1º, 2º, 3º) |

### 19.3 Conexões SVG

### 18.4 Numeração dos Cards

| Fase | Lado | Card Positions |
|------|------|----------------|
| Round 1 | Esquerdo | 1-4 |
| Round 1 | Direito | 5-8 |
| Round 2 | Esquerdo | 9-10 |
| Round 2 | Direito | 11-12 |
| Semifinal | Esquerdo | 13 |
| Semifinal | Direito | 14 |
| Final | Central | 15 |

### 19.5 Tags de Resultado no Card

| Tag | Cor | Condição |
|-----|-----|----------|
| VENCEU | Verde | Atleta venceu a luta |
| PERDEU | Vermelho | Atleta perdeu a luta |
| DESCLASSIFICADO | Vermelho (texto) | Atleta foi desclassificado |
| FINALIZOU | Azul | Atleta venceu por finalização |
| AVANÇOU | Azul (fundo) | Atleta avançou por BYE |
| (nenhuma) | — | Resultado pendente |

---

## 20. Hooks Personalizados

### 19.1 `useStorage` (`app/hooks/useStorage.ts`)

| Função | Retorno | Descrição |
|--------|---------|-----------|
| `getDadosIniciais()` | `DadosIniciais` | Lê localStorage + API → migra UUIDs |
| `salvarDados(area, chaves)` | `boolean` | Salva localStorage + API PUT |
| `adicionarNovaLuta(area, chaves, luta)` | `ChaveLuta[]` | Adiciona luta à chave "Luta Manual" |
| `marcarLutaConcluida(area, chaveId, lutaId, dados, chaves)` | `{ chaves, sucesso }` | Finaliza luta, cria resultado, advanceWinner |
| `limparDados(area)` | `void` | Remove localStorage + tenta DELETE API |

### 19.2 `useImportacao` (`app/hooks/useImportacao.ts`)

| Função | Descrição |
|--------|-----------|
| `importarArquivos(files)` | Lê JSONs via FileReader, valida, processa e retorna `ChaveLuta[]` |
| `limparResultados()` | Limpa lista de resultados |

### 20.3 useBracket

| Retorno | Descrição |
|---------|-----------|
| `rounds` | `BracketRound[]` — rounds processados via `buildBracketFromChaveLuta` |
| `handleFightClick` | Handler que ignora cliques em modo readonly |
| `champion` | Atleta campeão |
| `status` | `MatchupStatus` |

---

## 21. Rotas e Páginas

### 20.1 Rotas Existentes

| Rota | Arquivo | Tipo | Descrição |
|------|---------|------|-----------|
| `/` | `app/page.tsx` | Server | Home: dois botões (Admin / Placar) |
| `/admin` | `app/admin/page.tsx` | Server | Dashboard admin com cards de atalho |
| `/admin/matches` | `app/admin/matches/page.tsx` | Client | Teste de pontuação (hardcoded, sem persistência) |
| `/scoreboard/setup` | `app/scoreboard/setup/page.tsx` | Client | Setup: definir área, importar JSONs, criar lutas manuais |
| `/scoreboard` | `app/scoreboard/page.tsx` | Client | Scoreboard principal: seletor de lutas + placar |
| `/bracket-test` | `app/bracket-test/page.tsx` | Client | Página de teste de bracket (desenvolvimento) |

### 21.2 Rotas que Retornam 404

| Rota | Referenciada em | Motivo |
|------|----------------|--------|
| `/admin/athletes` | Sidebar admin + dashboard | Não implementada |
| `/admin/categories` | Sidebar admin + dashboard | Não implementada |
| `/admin/reports` | Sidebar admin + dashboard | Não implementada |

---

## 22. Componentes Legado (Não Utilizados)

| Componente | Arquivo | Motivo |
|------------|---------|--------|
| `SeletorLuta` | `components/scoreboard/SeletorLuta.tsx` | Substituído por lógica inline em `scoreboard/page.tsx` |
| `BracketPanel` | `components/scoreboard/BracketPanel.tsx` | Substituído por `BracketVisualizer` + seletor inline |
| `BracketColumn` | `components/bracket/BracketColumn.tsx` | Substituído pelo layout grid 7 colunas em `BracketLayout` |
| `BracketMatchupCard` | `components/bracket/BracketMatchupCard.tsx` | Substituído por `CompetitorCard` em `BracketLayout` |
| `ResultBadge` / `ResultBadgeList` | `components/bracket/ResultBadge.tsx` | Usado apenas por `BracketMatchupCard` |
| `useScoreSound` | `components/scoreboard/useScoreSound.ts` | Nenhum componente o importa |
| `ChampionModal` | `components/bracket/ChampionModal.tsx` | Nenhuma página o aciona |

---


## 24. Glossário de Termos

| Termo | Definição |
|-------|-----------|
| UUID | Identificador único universal (v4), formato `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` |
| Chave de Luta (Bracket) | Conjunto de confrontos de uma categoria |
| Área de Luta | Local físico onde ocorre a luta |
| Montada | Posição de controle (4 pontos) |
| Passagem | Passagem de guarda (3 pontos) |
| Queda | Queda ou raspagem (2 pontos) |
| Finalização | Vitória por submissão |
| Desclassificação (DSQ) | Eliminação por infração |
| BYE | Atleta1 x null; atleta presente avança automaticamente |
| Consolação | Luta extra para definir 3º lugar (chaves de 3 atletas) |
| round | Número do round na chave (1, 2, 3, 4) — **não é ID** |
| position | Posição da luta no layout visual do bracket |
| nextMatchId | UUID da próxima luta que o vencedor avança |
| previousMatchIds | UUIDs das lutas que alimentam esta luta |
| Status da Luta | `pendente` → `concluida` |
| Status da Chave | `pendente` → `em_andamento` → `concluida` |
