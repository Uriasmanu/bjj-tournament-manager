# Requisitos do Sistema - BJJ Tournament Manager

**Versão:** 8.0
**Data:** 2026-05-20
**Projeto:** Sistema de Gerenciamento de Competições de Jiu-Jitsu Brasileiro

---

## 1. Visão Geral

| Campo | Valor |
|-------|-------|
| Nome do Projeto | BJJ Tournament Manager |
| Tipo | Aplicação Web (SPA) |
| Resumo | Sistema de gerenciamento de competições de Jiu-Jitsu Brasileiro com gestão de chaves de luta, painel administrativo para árbitros e placar em tempo real para exibição pública |
| Público-alvo | Árbitros, organizadores, atletas e espectadores de competições de Jiu-Jitsu |

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
- Componentes disponíveis: Button, Card, Dialog, Input, Select, Toast, etc.
- Localização: `@/components/ui/`

### 2.3 Botões com Fundo Branco
- **OBRIGATÓRIO**: Quando um botão tiver fundo branco (#FFFFFF), o texto deve ser obrigatoriamente escuro (#000000 ou similar)
- Isso garante contraste e acessibilidade

### 2.4 Layout Responsivo
- O sistema deve funcionar em desktop e dispositivos móveis
- Layout otimizado para telão/projetor no scoreboard

---

## 3. Armazenamento de Dados (JSON)

O sistema utiliza **JSON** como formato principal para armazenamento e persistência de dados das competências.

### Estrutura de Arquivos

**Pasta `data/`:**
```
data/
├── [uuid-area-1].json    # Dados da Área 1 (nome do arquivo = id da área)
├── [uuid-area-2].json     # Dados da Área 2
└── ...
```

### API REST

O sistema expõe uma API para manipulação de dados:

| Método | Endpoint | Descrição |
|--------|-----------|------------|
| GET | `/api/area?area=NOME` | Retorna dados de uma área pelo nome (lê `data/[nome].json`). Retorna estrutura vazia padrão se arquivo não existir |
| POST | `/api/area` | Cria/sobrescreve dados de uma área |
| PUT | `/api/area` | Atualiza dados de uma área (faz merge com existentes, atualiza `atualizadoEm`) |
| DELETE | `/api/area?area=NOME` | **NÃO IMPLEMENTADO** — chamado por `limparDados()` mas a API retorna 405 |

> **OBSERVAÇÃO:** A consulta por UUID (`?id=UUID`) não está implementada. Apenas consulta por nome de área é suportada. O nome do arquivo é gerado via `area.toLowerCase().replace(/[^a-z0-9]/g, "-") + ".json"`.

---

## 4. Estrutura de Dados

### Tipos TypeScript

```typescript
// Atleta
interface Atleta {
  id: string                  // UUID v4 — identificador único do atleta
  nome: string
  equipe: string
  faixa?: string
  avancou?: boolean           // Indica se o atleta avançou por BYE
}

// Resultado da Luta
interface ResultadoLuta {
  id: string                  // UUID v4 — identificador único do resultado
  // Pontuação total
  pontosAtleta1: number
  pontosAtleta2: number

  // Detalhamento de pontos por tipo
  montadasAtleta1: number     // 4 pontos cada
  montadasAtleta2: number
  passagensAtleta1: number    // 3 pontos cada
  passagensAtleta2: number
  quedasAtleta1: number      // 2 pontos cada
  quedasAtleta2: number

  // Vantagens e penalidades
  vantagensAtleta1: number
  vantagensAtleta2: number
  penalidadesAtleta1: number
  penalidadesAtleta2: number

  // Tempo
  tempoDecorrido: number

  // Resultado
  finalizacaoAtleta1: boolean
  finalizacaoAtleta2: boolean
  desclassificacao: "atleta1" | "atleta2" | null
  vencedor: "atleta1" | "atleta2" | "empate" | null
  tipoVitoria: "pontos" | "finalizacao" | "desclassificacao" | "empate"
  status: "pendente" | "concluida"

  // Referências por UUID
  lutaId: string             // UUID da luta a que este resultado pertence
  vencedorAtletaId: string | null  // UUID do atleta vencedor
  perdedorAtletaId: string | null  // UUID do atleta perdedor
 AtletaDesclassificadoId: string | null  // UUID do atleta desclassificado (se houver)
}

// Luta
interface Luta {
  id: string                  // UUID v4 — identificador único da luta
  round: number              // 1, 2, 3, 4 (não é ID, é posição na chave)
  position: number           // Posição da luta no bracket (usado para visualização)
  atleta1: Atleta             // Inclui id UUID
  atleta2: Atleta             // Inclui id UUID
  resultado?: ResultadoLuta   // Inclui id UUID
  arbitro?: string
  dataLuta?: string
  tags?: string[]            // Tags como ["AVANÇOU"] para BYE

  // Referências de chaveamento (por UUID)
  nextMatchId?: string       // UUID da próxima luta na chave
  previousMatchIds?: string[] // UUIDs das lutas anteriores (usado para BYE)
}

// Chave de Luta
interface ChaveLuta {
  id: string                  // UUID v4 — identificador único da chave
  categoria: string
  lutas: Luta[]
  arbitro?: string
  vencedorAtletaId?: string   // UUID do campeão
  status: "pendente" | "em_andamento" | "concluida"
  totalCompetidores: number   // Quantidade de competidores na chave
  classificacaoFinal?: ClassificacaoFinal  // Dados do pódio (1º, 2º, 3º)
}

// Classificação Final (Pódio)
interface ClassificacaoFinal {
  chaveId: string
  campeao?: {
    id: string
    nome: string
    equipe: string
    faixa?: string
  }
  vice?: {
    id: string
    nome: string
    equipe: string
    faixa?: string
  }
  terceiroA?: {
    id: string
    nome: string
    equipe: string
    faixa?: string
  }
  terceiroB?: {
    id: string
    nome: string
    equipe: string
    faixa?: string
  }
  dataAtualizacao: string
}

// Dados da Área
interface DadosArea {
  id: string                  // UUID v4 — identificador único da área
  area: string                // Nome da área (ex: "Área 1")
  criadoEm: string
  atualizadoEm?: string
  chaves: ChaveLuta[]
  classificacoes?: ClassificacaoFinal[]
}

// Tipos para Visualização de Bracket
type MatchupStatus = "pending" | "bye" | "live" | "completed"

interface FighterSlot {
  athlete?: Atleta | null
  sourceMatchId?: string
  seed?: number
  isBye: boolean
  resultStatus: "winner" | "loser" | "disqualified" | null
}

interface BracketMatchup {
  id: string
  round: number
  position: number
  fighter1?: FighterSlot
  fighter2?: FighterSlot
  result?: ResultadoLuta
  status: MatchupStatus
  label: string
  nextMatchId?: string
  previousMatchIds?: string[]
}

interface BracketRound {
  label: string
  matchups: BracketMatchup[]
  side: "left" | "right" | "center"
}

// Constantes de Faixas
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
| Framework | Next.js | 16.2.6 |
| UI | React | 19.2.4 |
| Estilização | Tailwind CSS | 4.x |
| Componentes | Shadcn UI | latest |
| Ícones | Lucide React | latest |
| Linguagem | TypeScript | 5.x |

---

## 6. Paleta de Cores

| Cor | Hexadecimal | Uso |
|-----|-------------|-----|
| Azul Anil | `#4338CA` | Cor primária, botões principais, highlights |
| Preto | `#0A0A0A` | Fundos principais, sidebars, áreas de destaque |
| Branco | `#FFFFFF` | Cards, áreas de conteúdo, texto em fundos escuros |
| Dourado | `#D4AF37` | Destaques especiais, títulos, elementos premium |
| Verde | `#22C55E` | Status de luta concluída |
| Vermelho | `#DC2626` | Botões de desclassificação, alertas |

---

## 7. Estrutura de Pastas

```
app/
├── page.tsx                  # Tela inicial (seleção)
├── layout.tsx                # Layout raiz
├── globals.css               # Estilos globais
├── types/                    # Tipos TypeScript
│   └── index.ts             # Interfaces e tipos (UUID para todos os ids)
├── hooks/                    # Hooks personalizados
│   ├── useStorage.ts         # Persistência (API)
│   ├── useImportacao.ts     # Importação de JSONs
│   └── useBracket.ts        # Hook para visualização de bracket
├── api/                      # Rotas de API
│   └── area/
│       └── route.ts         # API REST de área
├── admin/                    # Painel administrativo
│   ├── page.tsx             # Dashboard admin
│   ├── layout.tsx           # Layout admin (com sidebar)
│   └── matches/             # Controle de lutas
│       └── page.tsx         # Página de pontuação
├── scoreboard/              # Interface de placar
│   ├── setup/               # Pré-placar (importação de chaves)
│   │   └── page.tsx         # Configuração de área
│   ├── page.tsx             # Placar principal + seletor de lutas
│   └── layout.tsx           # Layout scoreboard
├── lib/                     # Utilitários
│   ├── uuid.ts              # Geração e validação de UUIDs
│   ├── migrate-ids.ts       # Migração de IDs antigos para UUID
│   ├── bracket-utils.ts     # Utilitários para bracket
│   ├── mock-bracket-data.ts # Dados mock para teste
│   └── utils.ts             # Funções utilitárias
└── components/
    ├── ui/                  # Componentes Shadcn
    │   ├── button.tsx
    │   ├── card.tsx
    │   ├── badge.tsx
    │   ├── dialog.tsx
    │   ├── input.tsx
    │   └── ...
    ├── Timer.tsx            # Componente de cronômetro
    ├── scoreboard/          # Componentes do placar
    │   ├── AtletaCard.tsx
    │   ├── ScoreHeader.tsx
    │   ├── ScoreButton.tsx
    │   ├── VantagemPunicao.tsx
    │   ├── AdicionarLutaModal.tsx
    │   ├── TotalScore.tsx
    │   ├── SeletorLuta.tsx
    │   ├── BracketPanel.tsx
    │   ├── BadgeFaixa.tsx
    │   └── useScoreSound.ts
    ├── bracket/             # Componentes de visualização de bracket
    │   ├── BracketVisualizer.tsx
    │   ├── BracketLayout.tsx
    │   ├── BracketColumn.tsx
    │   ├── BracketMatchupCard.tsx
    │   ├── BracketChampion.tsx      # Card compacto de campeão no bracket
    │   ├── BracketEmptyState.tsx
    │   ├── ChampionModal.tsx       # Modal de exibição do campeão
    │   ├── ResultBadge.tsx
    │   └── index.ts
    └── setup/               # Componentes do setup
        ├── AreaCard.tsx
        ├── ImportacaoCard.tsx
        ├── ChaveList.tsx
        ├── ActionButtons.tsx
        ├── LutaManualForm.tsx
        ├── ResultadoImportacaoCard.tsx
        └── Toast.tsx

data/                        # Dados persistidos (JSON)
└── [uuid-da-area].json      # Arquivos de área nomeados por UUID

exemplos/                    # Arquivos de exemplo para teste
├── chave-3-lutadores.json
├── chave-4-lutadores.json
└── chave-5-lutadores.json

docs/
├── requirements.md          # Este documento
└── ...
```

---

## 8. Fluxo do Sistema

### 8.1 Início do Torneio

1. **Definir Área**: Organizador define o nome da área (ex: "Área 1") — `id` gerado como UUID automaticamente
2. **Importar Chaves**: Organizador importa arquivos JSON com as chaves de luta
3. **Carregar na Área**: JSONs são salvos em `data/[uuid-da-area].json` via API

### 8.2 Durante o Torneio

1. **Selecionar Chave**: Árbitro seleciona uma chave da lista (pela `id: string`)
2. **Selecionar Luta**: Escolher qual luta da chave será disputada (pela `id: string` da `Luta`)
3. **Iniciar Luta**: Redireciona para `/scoreboard` com UUID da luta

### 8.3 Durante a Luta

1. **Registrar Pontos**: Árbitros registram montada (4), passagem (3), queda (2)
2. **Vantagens/Punições**: Contador de vantagens e penalidades
3. **Cronômetro**: Contagem regressiva com controle, retorna tempo decorrido
4. **Editar Árbitro**: Campo editável no header para nome do árbitro
5. **Desclassificação**: Botão discreto (30% opacity) para desclassificar atleta

### 8.4 Finalização da Luta (Fluxo Normal)

1. Clicar em "Finalizar Luta" (botão dourado no placar)
2. Modal 1: **Selecionar Vencedor** — dois botões grandes, um para cada atleta
3. Modal 2: **Selecionar Tipo de Vitória** — "Pontos" ou "Finalização"
4. Sistema determina vencedor:
   - Se finalização → vence quem finalizou
   - Se nenhum → vence quem tiver mais pontos + vantagens
5. `ResultadoLuta` criado com UUID próprio via `crypto.randomUUID()`, vinculado à `Luta.id`
6. JSON da área é atualizado com todos os campos do resultado via API PUT
7. Status da luta muda para `"concluida"`
8. `advanceWinner()` é chamado para mover vencedor para próxima luta (se houver)
9. Sistema verifica `sucesso` do retorno de `marcarLutaConcluida()` — se `false`, interrompe o fluxo e registra erro no console (não retorna ao seletor)
10. Após salvar com sucesso, sistema recarrega dados (`await carregarDados()`) e retorna ao seletor de lutas

### 8.5 Fluxo de Desclassificação (DSQ)

1. Botão "DSQ" discreto (30% opacity, hover 100%) no canto superior direito de cada `AtletaCard`
2. Modal 1: **Confirmar Atleta** — pergunta "Tem certeza que deseja desclassificar [atleta]?"
3. Modal 2: **Confirmação Final** — mostra qual atleta será declarado vencedor automaticamente, pede confirmação
4. Regras:
   - Se atleta1 for desclassificado → atleta2 vence automaticamente
   - Se atleta2 for desclassificado → atleta1 vence automaticamente
5. `tipoVitoria` salvo como `"desclassificacao"`
6. `desclassificacao` campo salvo como `"atleta1"` ou `"atleta2"`
7. Dados persistem via `marcarLutaConcluida()` no hook `useStorage`
8. `AtletaDesclassificadoId` é preservado durante `advanceWinner()` (não é mais sobrescrito com `null`)
9. Atleta desclassificado recebe tag vermelha "DESCLASSIFICADO" no bracket

### 8.6 Conclusão da Chave

- Todas as lutas processadas
- `ChaveLuta.vencedorAtletaId` preenchido com o UUID do campeão
- `ChaveLuta.status` atualiza automaticamente (pendente → em_andamento → concluida)
- Em chaves de 3 atletas: se a luta final do round 3 estiver concluída, o pódio é derivado mesmo com `chave.status === "em_andamento"`
- `advanceWinner()` define `status: "concluida"` quando a última luta (maior round) é finalizada

---

## 9. BracketLayout - Visualização de Chave

O componente `BracketLayout.tsx` exibe a chave de luta em formato visual com as seguintes características:

### 9.1 Estrutura do Layout

- **Grid de 7 colunas**: Oitavas Esquerda → Quartas Esquerda → Semifinal Esquerda → Painel Central → Semifinal Direita → Quartas Direita → Oitavas Direita
- **Conexões SVG**: Linhas que conectam os nodes das lutas automaticamente
- **Modo de exibição**: Suporta `mode="live"` (interativo) ou `mode="readonly"` (somente leitura)

### 9.2 Componentes do Bracket

| Componente | Descrição |
|------------|-----------|
| `CompetitorCard` | Card individual de competidor com nome, equipe, resultado, cardPosition (canto superior direito), tags de status (canto inferior direito) |
| `Round1Pair` | Par de competidores das oitavas (cards posição 1-4) |
| `Round1PairRight` | Par de competidores das oitavas lado direito (cards posição 5-8) |
| `Round2Pair` | Par de competidores das quartas lado esquerdo (cards posição 9-10) |
| `Round2PairRight` | Par de competidores das quartas lado direito (cards posição 11-12) |
| `SemiFinalCard` | Card da semifinal (posição 13 ou 14), com suporte a `forceAtletaIndex` para chaves de 3 atletas |
| `FinalistCard` | Card de finalista no painel central (posição 15) |
| `PodiumLine` | Linha de classificação final (1º, 2º, 3º) |
| `findChampion()` | Função auxiliar que busca o campeão pelo `chave.vencedorAtletaId` em todas as lutas |

**Componentes não utilizados (legado):**
| Componente | Arquivo | Motivo |
|------------|---------|--------|
| `BracketColumn` | `bracket/BracketColumn.tsx` | Substituído pelo layout de grid 7 colunas no `BracketLayout` |
| `BracketMatchupCard` | `bracket/BracketMatchupCard.tsx` | Substituído pelo `CompetitorCard` no `BracketLayout` |
| `ResultBadge` / `ResultBadgeList` | `bracket/ResultBadge.tsx` | Usado apenas pelo `BracketMatchupCard` (não utilizado) |

### 9.3 Painel Central

O painel central exibe apenas o **Finalista**, mostrando o vencedor da semifinal esquerda quando concluída.

### 9.3.1 Modal de Campeão (ChampionModal)

**Arquivo:** `app/components/bracket/ChampionModal.tsx`

Componente modal que exibe o campeão (criado mas **não integrado** a nenhum fluxo da aplicação):
- Fundo com gradiente dourado (amber-300 a amber-500)
- Ícone de troféu grande
- Nome do campeão
- Equipe do campeão
- Label "CAMPEÃO" em destaque
- Nome da categoria
- Botão de fechar (opcional via prop `onClose`)
- Props: `champion: Atleta`, `categoryName`, `onClose?`, `className?`

> **Status:** Componente existe mas nunca é acionado. Nenhuma página ou hook dispara o modal.

### 9.3.2 Card de Campeão no Bracket (BracketChampion)

**Arquivo:** `app/components/bracket/BracketChampion.tsx`

Componente compacto para exibir o campeão diretamente no bracket, usado apenas para **chaves de 1 competidor**:
- Fundo com gradiente dourado (amber-300 a amber-500)
- Ícone de troféu pequeno
- Nome do campeão em texto pequeno
- Equipe do campeão
- Badge "CAMPEÃO" com fundo amber
- Nome da categoria abaixo
- Estado de "Aguardando campeão..." quando não há campeão
- Props: `champion?: Atleta`, `categoryName: string`

### 9.4 Classificação Final (Pódio)

O pódio é exibido abaixo do bracket em uma lista vertical:

- **1º Lugar**: Campeão (cor `text-amber-500`)
- **2º Lugar**: Vice-campeão (cor `text-slate-400`)
- **3º Lugar**: Um ou dois terceiros lugares (cor `text-amber-700`)

#### 9.4.1 Derivação do Campeão e Vice

O campeão é derivado na seguinte ordem de precedência:
1. `chave.vencedorAtletaId` — se presente, busca o atleta em todas as lutas via `findChampion()`
2. Último combate concluído (`maxRound`) — se `isFinalConcluida` for true, o vencedor do último combate é o campeão

O vice-campeão é o perdedor do último combate (final).

A exibição de 1º e 2º não depende estritamente de `chave.status === "concluida"`. Se o combate final estiver concluído (`resultado.status === "concluida"`), o pódio é exibido mesmo com `chave.status === "em_andamento"`.

#### 9.4.2 Derivação do Terceiro Lugar

**Para chaves com 4 ou mais competidores:**
- `thirdPlaceLeft`: Perdedor da semifinal esquerda (round 3, position 0)
- `thirdPlaceRight`: Perdedor da semifinal direita (round 3, position 1)
- Ambos os 3º lugares são exibidos

**Para chaves com exatamente 3 competidores:**
- `thirdPlace`: Calculado a partir da luta real do round 1 (com ambos atletas presentes)
- O perdedor da luta do round 1 (ou o atleta desclassificado, se DSQ) é o terceiro lugar
- Apenas **um** 3º lugar é exibido
- O perdedor da final **não** é usado como terceiro lugar (ele é o vice-campeão)

#### 9.4.3 Tratamento de Desclassificação no Pódio

Em todos os cálculos de terceiro lugar, o sistema verifica `resultado.desclassificacao`:
- Se `desclassificacao === "atleta1"` → `atleta1` é o perdedor/terceiro lugar
- Se `desclassificacao === "atleta2"` → `atleta2` é o perdedor/terceiro lugar

### 9.5 Estados de Exibição

| Estado | Comportamento |
|--------|---------------|
| Em andamento | Mostra competidores nas lutas |
| Concluída | Mostra resultado "VENCEU" no card |
| Pending | Mostra "-- Vazio --" |
| BYE | Não permite iniciar luta |

### 9.6 Numeração dos Cards

Cada card de competidor exibe um número de posição para identificação (cardPosition). Com 15 competidores:

| Fase | Lado | Posições |
|------|------|-----------|
| Round 1 | Esquerdo | 1-4 |
| Round 1 | Direito | 5-8 |
| Round 2 | Esquerdo | 9-10 |
| Round 2 | Direito | 11-12 |
| Semifinal | Esquerdo | 13 |
| Semifinal | Direito | 14 |
| Final | Central | 15 |

### 9.7 Referência

- Arquivo: `app/components/bracket/BracketLayout.tsx`

---

## 10. Dados Salvos no Resultado

Ao finalizar uma luta, o sistema salva os seguintes dados para auditoria:

| Campo | Descrição |
|-------|-----------|
| id | UUID único do resultado |
| pontosAtleta1/2 | Total de pontos do atleta |
| montadasAtleta1/2 | Quantidade de montadas (4 pontos cada) |
| passagensAtleta1/2 | Quantidade de passagens de guarda (3 pontos cada) |
| quedasAtleta1/2 | Quantidade de quedas/raspagens (2 pontos cada) |
| vantagensAtleta1/2 | Contador de vantagens |
| penalidadesAtleta1/2 | Contador de penalidades |
| tempoDecorrido | Tempo total decorrido em segundos |
| finalizacaoAtleta1/2 | Indica se houve finalização |
| desclassificacao | Indica qual atleta foi desclassificado |
| tipoVitoria | Tipo: pontos, finalizacao, desclassificacao, empate |
| vencedor | Quem venceu a luta |
| status | Status: pendente ou concluida |
| lutaId | UUID da luta |
| vencedorAtletaId | UUID do atleta vencedor |
| perdedorAtletaId | UUID do atleta perdedor |
| AtletaDesclassificadoId | UUID do atleta desclassificado (se houver) |

---

## 11. Histórias de Usuário

### HU-001: Tela de Seleção de Entrada

**Critérios de Aceitação:**
- [x] Dois botões grandes e claramente identificáveis
- [x] Botão "Administração" redireciona para `/admin`
- [x] Botão "Placar" redireciona para `/scoreboard/setup`

---

### HU-001b: Painel Administrativo

**Critérios de Aceitação:**
- [x] Header com título "Painel Administrativo" e descrição
- [x] Cards de ações rápidas: Atletas, Categorias, Lutas, Relatórios
- [x] Cards com ícone, título, descrição e contagem
- [x] Seção de boas-vindas com instruções para começar
- [x] Links para gerenciar cada seção
- [x] Botão para voltar à tela inicial
- [x] Layout responsivo com grid adaptativo

---

### HU-002: Tela de Pré-Placar (Setup de Área)

**Critérios de Aceitação:**
- [x] Campo para definir nome da área (apenas uma vez, no início)
- [x] Botão para importar múltiplos arquivos JSON de chaves de luta
- [x] Validação: categoria obrigatória, array de lutas não vazio
- [x] Lista de chaves importadas comvisualização
- [x] Cada chave mostra: categoria, número de lutas, status, UUID
- [x] Botão "Iniciar Luta" para cada par de atletas
- [x] Botão para criar luta manual (sem arquivo JSON)
- [x] Botão para limpar todos os dados

---

### HU-003: Cronômetro de Luta

**Critérios de Aceitação:**
- [x] Tempos predefinidos: Select com opções de 2, 5, 6 e 10 minutos
- [x] Configuração manual: Campos de minutos e segundos
- [x] Contagem regressiva automática
- [x] Controles: Iniciar/Parar, Reiniciar
- [x] Alerta visual nos últimos 10 segundos (vermelho)
- [x] Reiniciar zera todos os pontos também
- [x] Retorna tempo decorrido para registro no resultado

---

### HU-004: Sistema de Pontuação

**Critérios de Aceitação:**
- [x] Montada / Pegada nas Costas = **4 pontos**
- [x] Passagem de Guarda = **3 pontos**
- [x] Queda, Raspagem, Joelho na barriga = **2 pontos**
- [x] Botões +/para cada categoria
- [x] Valores começam em 0 e atualizam individualmente
- [x] Pontuação total calculada automaticamente
- [x] Contador de **vantagens** (+1/-1)
- [x] Contador de **penalidades** (-1/+1)
- [x] Exibição: nome do atleta, equipe, faixa
- [x] **Registro detalhado**: salva quantidade de cada tipo de ponto

---

### HU-005: Placar em Tempo Real

**Critérios de Aceitação:**
- [x] Layout otimizado para telão/projetor
- [x] Atleta 1 (Branco) na metade superior
- [x] Atleta 2 (Branco) na metade inferior
- [x] Header com área de luta e nome do árbitro (editável)
- [x] Cronômetro flutuante centralizado
- [x] Nomes, equipes e faixas dos lutadores
- [x] Pontuação individual e total
- [x] Vantagens e punições
- [x] Botão "Nova Luta" para selecionar outra luta
- [x] Botão "Finalizar Luta" com confirmação em 2 etapas

---

### HU-006: Finalização e Desclassificação

**Critérios de Aceitação:**
- [x] Botão discreto de **Desclassificação** no placar (para cada atleta)
- [x] Ao clicar em DSQ → Modal pergunta qual atleta será desclassificado
- [x] Modal pede **confirmação** antes de salvar
- [x] Lógica de determinação do vencedor:
  1. Se finalização → vence quem finalizou
  2. Se desclassificação → vence o outro
  3. Se nenhum → vence quem tiver mais pontos + vantagens

---

### HU-007: Persistência de Dados

**Critérios de Aceitação:**
- [x] Ao clicar em "Finalizar Luta", atualizar JSON da área com:
  - UUID do resultado (`ResultadoLuta.id`)
  - UUIDs dos atletas (`Atleta.id`)
  - Pontuações finais detalhadas (montadas, passagens, quedas)
  - Total de pontos
  - Tempo decorrido
  - Nome do árbitro
  - Status (concluida)
  - Vencedor determinado
  - Tipo de vitória
  - Flags de finalização e desclassificação
  - Referências por UUID (`vencedorAtletaId`, `perdedorAtletaId`, etc.)
- [x] Dados salvos em `data/[uuid-da-area].json` via API REST

---

### HU-008: Nova Luta

**Critérios de Aceitação:**
- [x] Botão "Nova Luta" retorna para tela de seleção de lutas
- [x] Lutas concluídas aparecem com badge verde "Concluída"
- [x] Lutas pendentes têm botão "Iniciar"
- [x] Seleção de luta feita pelo `Luta.id` (UUID)

---

### HU-009: Visualização de Bracket

**Critérios de Aceitação:**
- [x] Visualização gráfica da chave de luta em formato de árvore
- [x] Aba para mostrar/ocultar o bracket
- [x] Indicação visual de lutas concluídas (resultado)
- [x] Indicação visual de lutas ativas/pendentes
- [x] Suporte a byes (lutas com apenas um atleta)
- [x] Posicionamento dinâmico baseado no round (Round 1, Quartas, Semifinal, Final)

---

### HU-010: Migração de Dados para UUID

**Critérios de Aceitação:**
- [x] Ao carregar dados JSON sem UUID, gerar automaticamente
- [x] Gerar UUIDs para: `Atleta.id`, `Luta.id`, `ChaveLuta.id`, `ResultadoLuta.id`
- [x] Manter UUIDs existentes em dados já migrados
- [x] Função `migrateAllData()` executada ao carregar dados da API

---

### HU-011: Avanço Automático de Vencedor

**Critérios de Aceitação:**
- [x] Ao finalizar luta, automaticamente mover vencedor para próxima luta
- [x] `nextMatchId` indica para qual luta o vencedor avança
- [x] `previousMatchIds` indica de quais lutas vêm os competidores
- [x] Atualizar automaticamente o status da chave (pendente → em_andamento → concluida)

---

### HU-012: Lutas com Atleta Ausente (BYE)

**Critérios de Aceitação:**
- [x] Lutas onde `atleta2` é `null` ou não possui `id` devem ser tratadas como "BYE"
- [x] O botão/card de iniciar luta deve ficar **desabilitado** para lutas com BYE
- [x] Lutas com BYE devem ser marcadas com status visual específico (cor cinza)
- [x] O sistema deve exibir "BYE" + "Avanca" no lugar do nome do atleta ausente
- [x] Sistema deve garantir que apenas lutas com ambos atletas definidos possam iniciar

**Implementação:**

1. **BracketMatchupCard.tsx** (linha 43):
   ```typescript
   const podeClicar = mode === "live" && 
                      status !== "completed" && 
                      status !== "bye" && 
                      !!luta.atleta1?.id && 
                      !!luta.atleta2?.id
   ```
   - Função `isBye(luta)` retorna `true` quando atleta não possui `id`
   - Status "bye" = cor cinza (bg-gray-300)

2. **scoreboard/page.tsx** (linha 248-261):
   ```typescript
   const podeSelecionar = !!luta.atleta1?.id && !!luta.atleta2?.id
   onClick={() => !isConcluida && podeSelecionar && onSelecionarLuta(chaveAtiva, luta)}
   ```
   - Estilo visual: `opacity-50 cursor-not-allowed` para lutas com BYE

**Referência:** Ver `docs/requisito-luta-sem-atleta.md` para detalhes completos

---

## 12. Estrutura do JSON de Importação

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "categoria": "Branca Infantil",
  "totalCompetidores": 8,
  "lutas": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "round": 1,
      "atleta1": {
        "id": "550e8400-e29b-41d4-a716-446655440011",
        "nome": "João Silva",
        "equipe": "Team Brasil"
      },
      "atleta2": {
        "id": "550e8400-e29b-41d4-a716-446655440012",
        "nome": "Maria Santos",
        "equipe": "Team São Paulo"
      }
    }
  ]
}
```

### Regras de Validação
- `id` é obrigatório (UUID v4) para a `ChaveLuta`
- `categoria` é obrigatório (string não vazia)
- `lutas` é obrigatório (array não vazio)
- Cada luta deve ter `id` (UUID v4)
- Cada luta deve ter `atleta1` e `atleta2` com `id` (UUID v4), `nome` e `equipe`
- `nextMatchId` (UUID) opcional para indicar a próxima luta na chave
- `previousMatchIds` (UUID[]) opcional para indicar de quais lutas este match recebe competidores

---

## 13. Glossário de Termos

| Termo | Definição |
|-------|-----------|
| UUID | Identificador único universal (v4), formato `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` |
| Chave de Luta | Conjunto de confrontos de uma categoria, identificada por `ChaveLuta.id` |
| Área de Luta | Local físico onde ocorre a luta (identificado por `DadosArea.id` UUID) |
| Montada | Posição de controle (4 pontos) |
| Passagem | Passagem de guarda (3 pontos) |
| Queda | Queda ou raspagem (2 pontos) |
| Finalização | Vitória por submissão ou knockout (prioridade máxima) |
| Desclassificação (DSQ) | Eliminação por infração (outro atleta vence) |
| Pontos + Vantagens | Critério de desempate após finalização |
| Status da Luta | pendente → em_andamento → concluida |
| Status da Chave | pendente → em_andamento → concluida |
| `nextMatchId` | UUID da próxima luta na chave que o vencedor avança |
| `previousMatchIds` | Array de UUIDs das lutas anteriores (usado para追踪 BYE e fluxo do bracket) |
| round | Número do round na chave (1, 2, 3, 4) — **não é ID** |
| BYE | Atleta1 x null (atleta2 vazio); o atleta presente avança automaticamente para próxima fase |

---

## 14. Componentes Shadcn Disponíveis

O sistema utiliza os seguintes componentes do Shadcn UI:

| Componente | Localização | Uso |
|------------|-------------|-----|
| Button | `@/components/ui/button` | Botões principais e ações. Variantes: default, outline, secondary, ghost, destructive, link. Tamanhos: default, xs, sm, lg, icon, icon-xs, icon-sm, icon-lg |
| Card | `@/components/ui/card` | Containers de conteúdo com sub-componentes: CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter. Suporta `size="sm"` |
| Input | `@/components/ui/input` | Campos de texto simples |
| Badge | `@/components/ui/badge` | Labels e badges de status. Variantes: default, secondary, destructive, outline, ghost, link |

> **NOTA:** `Dialog`, `Select` e `Toast` do Shadcn UI **não estão implementados**. Modais usam divs customizadas (ex: `AdicionarLutaModal`, `LutaManualForm`) ou sobreposição simples. Notificações usam componente `Toast` customizado em `components/setup/Toast.tsx`.

---

## 15. Regras de Geração de UUID

- Usar `crypto.randomUUID()` (built-in do Node.js/ browser) para gerar UUIDs v4
- Ao importar JSON externo sem UUIDs, gerar UUIDs automaticamente para `id` de `ChaveLuta`, `Luta`, `Atleta` e `ResultadoLuta`
- Manter UUIDs consistentes durante toda a sessão — não regerar IDs de entidades já salvas

---

## 16. Utilitários de Bracket

O sistema possui utilitários em `app/lib/bracket-utils.ts`:

| Função | Descrição |
|--------|------------|
| `isThreeCompetitorsChave(chave)` | Verifica se `totalCompetidores === 3` |
| `buildBracketFromChaveLuta(chave)` | Converte ChaveLuta em array de BracketRound para visualização. Round 3 vira "Semifinal" (ou "Final" para 3 competidores) |
| `generatePosition(lutas)` | Calcula posições automaticamente considerando fluxo visual e BYE. Para rounds > 1, verifica `previousMatchIds` para determinar se veio de BYE |
| `calculateByePosition(sourceLuta, fallbackIndex, lutas)` | Calcula posição de atleta que avança por BYE. BYE lado direito → posições ímpares (2-3 no R2), lado esquerdo → posições pares (0-1 no R2) |
| `getCardNumber(round, indexInRound, isLeftSide, isAtleta1)` | Mapeia round/índice/lado para número de card (1-28) |
| `getNextPosition(round, position, isWinnerAtleta1)` | Determina a próxima posição na chave (Round 1 → 2 → 3) |
| `isRealFight(luta)` | Ambos atletas têm ID |
| `areAllRound1FightsCompleted(chave)` | Todas as lutas do round 1 estão concluídas ou são BYE |
| `advanceWinner(chave, completedFightId, winner, loser)` | Move automaticamente o vencedor para a próxima luta. Lógica completa: final → marca chave concluída; DSQ em R1 de 3 atletas → cria round 3 dinamicamente; normal → atualiza próxima luta com vencedor |
| `getFighterTags(resultado, fighter)` | Retorna tags de resultado: VENCEU (verde), PERDEU (vermelho), DESCLASS. (vermelho negrito), FINALIZOU (azul) |
| `getFighterStatus(resultado, fighter)` | Retorna "winner", "loser", "disqualified" ou null |
| `getRoundLabel(round)` | Mapeia 1→"Round 1", 2→"Quartas", 3→"Semifinal", 4→"Final" |
| `isByeSlot(luta)` | Verifica se a luta é um bye (atleta sem ID) |
| `getLutaById(chave, lutaId)` | Busca luta por ID na chave |
| `findAtletaById(chave, atletaId)` | Busca atleta por ID em todas as lutas da chave |
| `getUnicoAtleta(chave)` | Retorna único atleta em chaves com 1 competidor (baseado em nome único) |
| `podeIniciarLuta(luta, chave)` | Verifica se a luta pode ser iniciada: ambos atletas existem E todas as lutas anteriores estão concluídas (ou eram BYE) |
| `canInteract(luta, chave)` | Mesma verificação que `podeIniciarLuta` |

### Funções de Migração (`app/lib/migrate-ids.ts`)

| Função | Descrição |
|--------|------------|
| `migrateAllData(dados)` | Ponto de entrada: executa migração completa de UUIDs para todos os dados |
| `migrateDadosArea(dados)` | Migra UUID da área e de todas as chaves |
| `migrateChaveLuta(chave)` | Migra UUID da chave e de todas as lutas |
| `migrateLuta(luta)` | Migra UUID da luta, atletas e resultado. **ATENÇÃO**: limpa `nextMatchId` e `previousMatchIds` |
| `migrateAtleta(atleta)` | Gera UUID se ausente |
| `migrateResultado(resultado)` | Gera UUID se ausente. **ATENÇÃO**: limpa `lutaId`, `vencedorAtletaId`, `perdedorAtletaId`, `AtletaDesclassificadoId` |

---

## 17. Hooks Personalizados

### 17.1 `useStorage` (`app/hooks/useStorage.ts`)

Funções assíncronas para persistência de dados via API:

| Função | Descrição |
|--------|------------|
| `getDadosIniciais()` | Lê `localStorage("bjj_tournament_area_nome")`, busca dados da API, executa `migrateAllData()`. Retorna `{ area, chaves, areaDefinida }` ou valores padrão |
| `salvarDados(area, chaves)` | Salva nome da área no localStorage, faz PUT para API (preserva `criadoEm` existente via merge) |
| `adicionarNovaLuta(area, chaves, novaLuta)` | Adiciona luta a bracket existente (ou cria "Luta Manual"), recalcula `totalCompetidores` |
| `marcarLutaConcluida(area, chaveId, lutaId, dadosResultado, chaves)` | Cria `ResultadoLuta` com UUID, determina vencedor/perdedor, persiste todos os detalhes de pontuação, chama `advanceWinner()`, atualiza status da chave. **Retorna** `{ chaves: ChaveLuta[]; sucesso: boolean }` — `sucesso` indica se `salvarDados()` foi bem-sucedido. Early returns registram erro no console se chave/luta não for encontrada |
| `limparDados(area)` | Remove chave do localStorage e chama DELETE API (não implementado no backend) |
| `calculateTotalCompetidores(lutas)` | Conta nomes únicos de atletas |

### 17.2 `useImportacao` (`app/hooks/useImportacao.ts`)

| Item | Descrição |
|------|------------|
| Estado | `resultados: ResultadoImportacao[]`, `isLoading: boolean` |
| `importarArquivos(files)` | Lê múltiplos JSONs via FileReader, valida estrutura, processa (`processarChave`), retorna array de resultados |
| `limparResultados()` | Limpa lista de resultados |
| `validarChave(data)` | Valida: deve ser objeto, `categoria` string não vazia, `lutas` array não vazio |
| `processarChave(data)` | Gera UUIDs para IDs ausentes, cria `ResultadoLuta` pendente, conta competidores únicos, **filtra rounds > 2 para chaves de 3 atletas**, chama `generatePosition()` |

### 17.3 `useBracket` (`app/hooks/useBracket.ts`)

| Prop | Tipo | Descrição |
|------|------|------------|
| `chave` | `ChaveLuta` | Dados da chave |
| `activeFightId?` | `string` | ID da luta ativa |
| `onFightClick?` | `(luta: Luta) => void` | Callback de clique |
| `mode?` | `"live" \| "readonly"` | Modo de interação |

| Retorno | Descrição |
|---------|------------|
| `rounds` | `BracketRound[]` — rounds processados via `buildBracketFromChaveLuta` |
| `handleFightClick` | Handler que ignora cliques em modo readonly |
| `champion` | Atleta campeão (buscado por `findAtletaById`) |
| `status` | `MatchupStatus` |

### 17.4 Hooks não utilizados

| Hook | Arquivo | Descrição |
|------|---------|------------|
| `useScoreSound` | `app/components/scoreboard/useScoreSound.ts` | Reproduz som via Web Audio API (tom senoidal 800Hz/400Hz, 100ms). Exportado mas **não importado** por nenhum componente |

---

## 18. Fluxo: Migração e Avanço de Vencedor

### 17.1 Migração de Dados
Ao carregar dados de uma área, o sistema executa `migrateAllData()` que:
1. Verifica se cada entidade tem UUID válido
2. Gera novos UUIDs para entidades sem ID válido
3. Preserva todos os dados existentes durante a migração

### 17.2 Avanço Automático de Vencedor
Ao finalizar uma luta com `marcarLutaConcluida()`:
1. Busca chave e luta nas `chaves` recebidas — se não encontrar, loga erro e retorna `{ chaves, sucesso: false }`
2. Cria `ResultadoLuta` com UUID próprio, preservando `AtletaDesclassificadoId` do resultado original
3. Identifica o vencedor e perdedor
4. Chama `advanceWinner()` que também preserva `AtletaDesclassificadoId` (não mais hardcoded como `null`)
5. Salva dados via `salvarDados()` usando **PUT** (preserva `criadoEm` do arquivo existente)
6. Se `salvarDados()` falhar, retorna `{ chaves, sucesso: false }`
7. Retorna `{ chaves: chavesFinais, sucesso: true }`

---

## 19. Componente de Timer

**Arquivo:** `app/components/Timer.tsx`
**Exportado como:** `ScoreboardTimer`

### Props

| Prop | Tipo | Descrição |
|------|------|------------|
| `onTimeEnd?` | `() => void` | Callback quando o tempo chega a zero |
| `onReset?` | `() => void` | Callback quando o timer é reiniciado |
| `onTimeUpdate?` | `(elapsedSeconds: number) => void` | Reporta o tempo decorrido a cada tick |

### Funcionalidades

- **Tempos predefinidos**: Select com opções de 2min, 5min, 6min e 10min
- **Configuração manual**: Campos de minutos e segundos (toggle via botão "Personalizar")
- **Controles**: Iniciar/Parar e Reiniciar
- **Estados visuais**:
  - Normal: texto branco
  - Alerta (\(\le\) 10s): texto vermelho
  - Finalizado (0): texto cinza
- **Elapsed time**: Reportado via `onTimeUpdate` para registro no resultado da luta
- **Cleanup**: Interval é limpo no unmount do componente

---

## 20. Página de Admin — Controle de Lutas

**Arquivo:** `app/admin/matches/page.tsx`

Página standalone de teste de pontuação (NÃO integrada com dados reais):

### Características

- Atletas hardcoded: "João Silva" (Team Brasil) vs "Maria Santos" (Team São Paulo)
- Botões de pontuação: +2, +3, +4 por atleta
- Vantagem (+Vant) e Penalidade (-Pen)
- Componente `ScoreboardTimer` incluso
- **Sistema de Undo**: Array `HistoricoPontuacao` rastreia cada ação; `desfazer()` reverte a última ação
- **Reset**: `resetLuta()` zera pontuações, vantagens, penalidades e histórico
- Exibição de histórico (últimas 10 ações, ordem reversa)

### Limitações

- Não persiste dados (nenhuma chamada à API)
- Botão "Finalizar Luta" apenas reseta pontuações sem salvar
- Rota `/admin/athletes`, `/admin/categories`, `/admin/reports` não existem (links no sidebar levam a 404)

---

## 21. Páginas de Desenvolvimento / Teste

### 21.1 Bracket Test (`/bracket-test`)

**Arquivo:** `app/bracket-test/page.tsx`

Página de desenvolvimento para testar o visualizador de bracket:
- Botões para gerar chaves de 2 a 8 competidores
- Usa `createMockChave()` de `mock-bracket-data.ts`
- Renderiza `BracketVisualizer` em modo `"live"`
- Clique em luta exibe alerta

### 21.2 Dados Mock (`app/lib/mock-bracket-data.ts`)

Funções para gerar dados de teste:

| Função | Descrição |
|--------|------------|
| `createAtleta(id, nome, equipe)` | Cria objeto Atleta |
| `createLuta(id, round, position, atleta1, atleta2)` | Cria objeto Luta |
| `mockChave8Competidores` | Chave pré-definida com 8 competidores |
| `mockChave4Competidores` | Chave pré-definida com 4 competidores |
| `mockChave3Competidores` | Chave pré-definida com 3 competidores |
| `mockChaveConcluida` | Chave pré-definida concluída |
| `createMockChave(tamanho, categoria?)` | Gera chave com N competidores (lida com número ímpar criando BYE) |

---

## 22. Componentes Legado (Não Utilizados)

Os seguintes componentes existem no código mas **não são importados ou utilizados** por nenhuma página ou componente ativo:

| Componente | Arquivo | Razão |
|------------|---------|-------|
| `SeletorLuta` | `components/scoreboard/SeletorLuta.tsx` | Substituído por lógica inline em `scoreboard/page.tsx` |
| `BracketPanel` | `components/scoreboard/BracketPanel.tsx` | Substituído por `BracketVisualizer` + seletor inline |
| `BracketColumn` | `components/bracket/BracketColumn.tsx` | Substituído pelo layout grid 7 colunas em `BracketLayout` |
| `BracketMatchupCard` | `components/bracket/BracketMatchupCard.tsx` | Substituído por `CompetitorCard` em `BracketLayout` |
| `ResultBadge` / `ResultBadgeList` | `components/bracket/ResultBadge.tsx` | Usado apenas por `BracketMatchupCard` |
| `useScoreSound` | `components/scoreboard/useScoreSound.ts` | Nenhum componente o importa |
| `ChampionModal` | `components/bracket/ChampionModal.tsx` | Nenhuma página o aciona |

---

## 23. Padrões de Implementação

### 23.1 Hydration Guard

Todas as páginas com estado cliente (`"use client"`) implementam proteção de hidratação:

```typescript
const [isHydrated, setIsHydrated] = useState(false)
useEffect(() => { setIsHydrated(true) }, [])
if (!isHydrated) return null // ou loading state
```

### 23.2 LocalStorage

Chaves utilizadas no localStorage:

| Chave | Uso | Localização |
|-------|-----|-------------|
| `bjj_tournament_area_nome` | Nome da área ativa | `useStorage.ts`, `scoreboard/setup/page.tsx` |
| `bjj_tournament_ultima_categoria` | Última categoria selecionada | `scoreboard/page.tsx` |

### 23.3 Consistência de Referências no Placar

Para evitar o bug em que o resultado da primeira luta não persistia (chave/luta não encontrada em `marcarLutaConcluida`):

1. **PlacarCompleto** (`app/scoreboard/page.tsx`): a `luta` é derivada via `useMemo` a partir de `chaves` + `chaveId`, garantindo que ambos venham da mesma árvore de objetos. A prop `luta` original é usada como fallback e seu `id` é o valor de busca.

2. **SeletorLutas**: o `useEffect` que sincroniza `chaveAtiva` com as `chaves` agora também trata o caso de a chave ativa atual não existir mais no array (ex: após recarregamento de dados), selecionando a primeira chave disponível como fallback.

3. **Async safety**: `onTrocarChave()` é `await`'do em `handleConfirmarTipo` e `handleSalvarDSQ`, garantindo que `carregarDados()` complete antes da re-renderização com estado resetado.

### 23.3 Criação de Luta Manual

Duas implementações diferentes:

| Contexto | Componente | Campos |
|----------|-----------|--------|
| Setup (`/scoreboard/setup`) | `LutaManualForm` | nome (obrigatório), equipe (opcional), faixa (dropdown) para ambos atletas |
| Scoreboard (`/scoreboard`) | `AdicionarLutaModal` | nome (obrigatório), equipe (opcional) para ambos atletas — **sem campo de faixa** |

### 23.4 Carregamento de Dados

Fluxo completo de inicialização (`scoreboard/page.tsx` e `scoreboard/setup/page.tsx`):
1. `getDadosIniciais()` → lê localStorage + API → executa `migrateAllData()`
2. Se dados vazios, redireciona para setup
3. Se chaves existem, auto-seleciona chave com status `em_andamento`
4. Guarda de hidratação evita flash de conteúdo não renderizado

---

## 24. Exemplos de Dados

> **NOTA:** A pasta `exemplos/` mencionada na estrutura de pastas **não existe** no repositório. Os arquivos `chave-3-lutadores.json`, `chave-4-lutadores.json` e `chave-5-lutadores.json` não foram criados.

Para dados de exemplo, utilize o arquivo `data/area-1.json` que contém:
- Chave de 5 competidores (Roxa Adulto Masculino - 75kg) — pendente, com BYE
- Chave de 3 competidores (Branca Adulto Masculino - 65kg) — em andamento, com desclassificação e final concluída
- Chave de 4 competidores (Azul Adulto Masculino - 70kg) — pendente

> **ATENÇÃO:** O arquivo `data/area-1.json` contém IDs de atleta não-UUID (`"atleta-012"`, `"atleta-003"`) que são normalizados pela migração ao carregar, mas quebram correspondência de IDs entre lutas.

---

## 25. Validação de UUID

Função em `app/lib/uuid.ts`:
- `generateUUID()`: Gera UUID v4 usando `crypto.randomUUID()`
- `isValidUUID(value)`: Valida se uma string é um UUID v4 válido

Regex: `/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`

---

## 26. Correção de Posicionamento de BYE no Bracket

### 26.1 Problema

Ao utilizar chaves com número ímpar de atletas (ex: 3 atletas), ocorre um BYE automaticamente no Round 1. O atleta que avança por ter o oponente null (BYE) estava sendo posicionado incorretamente no Round 2, resultando em uma exibição visual incorreta no bracket.

**Exemplo do problema:**
- 3 atletas: posições 0 e 1 no Round 1
- Posição 1 (BYE no lado direito) deveria ir para posição 3 no Round 2
- Mas estava sendo calculada como `Math.floor(1/2) = 0` (incorreto!)

### 26.2 Arquivos Modificados

| Arquivo | Modificação |
|---------|-------------|
| `app/scoreboard/setup/page.tsx` | Função `handleImportar` - cálculo de posição para BYE |
| `app/lib/bracket-utils.ts` | Função `generatePosition` e `calculateByePosition` |
| `app/hooks/useImportacao.ts` | `generatePosition` no fluxo de importação |

### 26.3 Lógica de Correção

**Em `app/scoreboard/setup/page.tsx:handleImportar`:**

```typescript
let positionRound2: number
if (luta.position % 2 === 1) {
  // BYE no lado direito (posição ímpar) → posição 3 no Round 2
  positionRound2 = 3
} else {
  // BYE no lado esquerdo (posição par) → posição 1 no Round 2
  positionRound2 = 1
}
```

### 26.4 Comportamento Esperado

| Cenário | Round 1 | Round 2 |
|---------|---------|---------|
| 3 atletas (BYE pos 1) | posições 0,1 | posição 3 (direito) |
| 5 atletas (BYE pos 2) | posições 0,1,2 | posição 1 (esquerdo) |
| 4 atletas (normal) | posições 0,1 | posições 0,1 (esq), 2,3 (dir) |

### 26.5 Referência

- Documento detalhado: `docs/requisitos-correcao-position.md`

### 26.6 Correção de Geração de Round 3 para 3 Atletas

#### 26.6.1 Problema

Chaves com exatamente 3 atletas estavam criando `round 3` automaticamente durante a importação, resultando em uma final/semifinal precoce e em um estado inicial incorreto.

#### 26.6.2 Regras de Negócio

Para `totalCompetidores === 3`:
- durante a importação, criar apenas `round 1` e `round 2`;
- `round 3` não deve ser gerado durante o processo de importação;
- `round 3` deve ser criado dinamicamente durante o torneio apenas quando todas as condições a seguir forem atendidas:
  1. a desclassificação ocorrer em uma luta real do `round 1` (ambos atletas presentes);
  2. todas as lutas do `round 1` estiverem concluídas;
  3. existir um atleta que avançou por BYE em `round 2`.

#### 26.6.3 Fluxo Correto

1. Importação de dados
   - criar apenas `round 1` e `round 2` para chaves de 3 atletas.
2. Durante o torneio
   - finalizar a luta real do `round 1` com desclassificação;
   - verificar que todas as lutas do `round 1` estão concluídas;
   - só então criar `round 3` com uma única luta.

#### 26.6.4 Arquivos Impactados

| Arquivo | Modificação |
|---------|-------------|
| `app/scoreboard/setup/page.tsx` | Garantir que a importação não gere `round 3` para 3 atletas |
| `app/hooks/useImportacao.ts` | Normalizar importação e descartar rounds > 2 em chaves de 3 atletas |
| `app/lib/bracket-utils.ts` | Criar `round 3` dinamicamente em `advanceWinner()` |
| `app/hooks/useStorage.ts` | Usar `advanceWinner()` ao concluir luta |

#### 26.6.5 Comportamento Esperado

| Situação | Resultado |
|----------|-----------|
| Importação de chave com 3 atletas | apenas `round 1` e `round 2` existem |
| Desclassificação em luta real do `round 1` com todas as lutas de `round 1` concluídas | `round 3` é criado dinamicamente |
| Desclassificação em BYE | `round 3` não é criado |
| Round 1 ainda pendente | `round 3` não é criado |

#### 26.6.6 Observação

Se o arquivo de importação já contiver lutas com `round >= 3`, essas lutas devem ser descartadas para chaves de 3 atletas, pois o bracket deve começar sem a fase final pré-gerada.

---

## 27. Tags de Status no Bracket

### 27.1 Visão Geral

O sistema exibe tags de status no bracket para diferentes cenários de luta:

| Tag | Cor | Condição |
|-----|-----|----------|
| AVANÇOU | Azul | Atleta avançou por BYE (atleta2 = null no Round 1) |
| VENCEU | Verde | Atleta venceu a luta |
| DESCLASSIFICADO | Vermelho | Atleta foi desclassificado |

### 27.2 Implementação

**Arquivo:** `app/components/bracket/BracketLayout.tsx` - Componente `CompetitorCard`

**Lógica de Exibição:**

```typescript
const showAdvanceTag = temAtleta && opponentIsNull && luta?.round === 1

const isDesclassificado = temAtleta && luta?.resultado?.status === "concluida" &&
  ((atletaIndex === 1 && luta.resultado.desclassificacao === "atleta1") ||
   (atletaIndex === 2 && luta.resultado.desclassificacao === "atleta2"))

{isCompleted && !showAdvanceTag && !isDesclassificado && "VENCEU"}
```

### 27.3 Estilos Visuais

| Tag | Classe CSS | Texto |
|-----|------------|-------|
| AVANÇOU | `bg-blue-100 text-blue-700` | AVANÇOU |
| VENCEU | `bg-green-500 text-white` | VENCEU |
| DESCLASSIFICADO | `bg-red-600 text-white` | DESCLASSIFICADO |

Para atletas desclassificados, o nome também recebe:
- Cor: `text-red-600`
- Estilo: `line-through` (tachado)

---

## 28. Posicionamento de Elementos no Card do Competidor

### 28.1 Visão Geral

Cada card de competidor no bracket contém dois elementos posicionados nos cantos superiores/inferiores direitos:

| Elemento | Posição | Descrição |
|----------|---------|-----------|
| **Número do Card** | Canto superior direito | Identificador numérico da posição no bracket |
| **Tag de Status** | Canto inferior direito | Indica estado do competidor (AVANÇOU, VENCEU, DESCLASSIFICADO) |

### 28.2 Regras de Posicionamento

**Número do Card (cardPosition):**
- **OBRIGATÓRIO**: Sempre no canto **superior direito** do card
- Classe CSS: `absolute right-1 top-1`
- Aplica-se tanto para cards com atleta quanto para cards vazios
- Fonte: `text-[10px] font-bold text-slate-400`

**Tags de Status:**
- **OBRIGATÓRIO**: Sempre no canto **inferior direito** do card
- Classe CSS: `absolute right-1 bottom-1`
- Tags suportadas: AVANÇOU (azul), VENCEU (verde), DESCLASSIFICADO (vermelho)
- Fonte: `text-[9px] px-1.5 py-0.5 rounded font-bold`

### 28.3 Implementação

**Arquivo:** `app/components/bracket/BracketLayout.tsx` - Componente `CompetitorCard`

```typescript
{cardPosition !== undefined && (
  <span className="absolute right-1 top-1 text-[10px] font-bold text-slate-400">
    {cardPosition}
  </span>
)}

{showAdvanceTag && (
  <span className="absolute right-1 bottom-1 bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded font-bold">
    AVANÇOU
  </span>
)}
```

### 28.4 Estados do Card

| Estado | Número do Card | Tag |
|--------|---------------|-----|
| Com atleta, pendente | Superior direito | Nenhuma |
| Com atleta, avançado (BYE) | Superior direito | Inferior direito (AVANÇOU) |
| Com atleta, venceu | Superior direito | Inferior direito (VENCEU) |
| Com atleta, desclassificado | Superior direito | Inferior direito (DESCLASSIFICADO) |
| Sem atleta (vazio) | Superior direito | Nenhuma |

---

*Documento atualizado em: 2026-05-20*
*Versão: 8.0*
*Mudanças principais:*
*- Documento reestruturado e sincronizado com o código-fonte real*
*- Seção 8.4: Fluxo de Finalização atualizado com detalhes de 2 etapas e chamada a advanceWinner()*
*- Seção 8.5: Novo fluxo detalhado de Desclassificação (DSQ)*
*- Seção 9.2: Componentes do Bracket atualizados com Round1PairRight, Round2PairRight, findChampion()*
*- Seção 9.2: Adicionada lista de componentes legado não utilizados*
*- Seção 9.4: Classificação Final reescrita com regras completas de derivação do pódio*
*- Seção 9.4.1: Derivação de campeão/vice (não depende de chave.status)*
*- Seção 9.4.2: Regras de terceiro lugar para 3+ e 3 competidores*
*- Seção 9.4.3: Tratamento de desclassificação no pódio*
*- Seção 9.3.1: ChampionModal marcado como não integrado*
*- Seção 9.3.2: BracketChampion esclarecido como apenas para 1 competidor*
*- Seção 14: Componentes Shadcn corrigidos (Dialog/Select/Toast não existem)*
*- Seção 16: Utilitários expandidos com todas as funções reais + migrate-ids*
*- Seção 17: Hooks detalhados com API completa + hook não utilizado (useScoreSound)*
*- Seção 19: Novo — Componente de Timer (ScoreboardTimer)*
*- Seção 20: Novo — Admin Controle de Lutas (com undo system)*
*- Seção 21: Novo — Páginas de Teste (bracket-test + mock data)*
*- Seção 22: Novo — Componentes Legado (não utilizados)*
*- Seção 23: Novo — Padrões de Implementação (hydration guard, localStorage, luta manual, carregamento)*
*- Seção 24: Novo — Exemplos de Dados (exemplos/ não existe; usar data/area-1.json)*
*- Seção 25: Validação de UUID (era seção 19)*
*- Seção 26: Correção de BYE renumerada (era seção 20)*
*- Seção 27: Tags de Status renumerada (era seção 21)*
*- Seção 28: Posicionamento renumerada (era seção 22)*
*- API corrigida (DELETE não implementado, GET por UUID não existe)*
*- Adicionados padrões: hydration guard, localStorage keys, diferenças entre LutaManualForm e AdicionarLutaModal*
*- Adicionado alerta sobre IDs não-UUID em data/area-1.json*