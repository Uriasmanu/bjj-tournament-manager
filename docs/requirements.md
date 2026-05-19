# Requisitos do Sistema - BJJ Tournament Manager

**Versão:** 7.6
**Data:** 2026-05-19
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
| GET | `/api/area?id=UUID` | Retorna dados de uma área pelo UUID |
| GET | `/api/area?area=NOME` | Retorna dados de uma área pelo nome (busca em todos os arquivos) |
| POST | `/api/area` | Cria/sobrescreve dados de uma área |
| PUT | `/api/area` | Atualiza dados de uma área (mantém existentes) |
| DELETE | `/api/area?area=NOME` | Remove arquivo da área pelo nome |

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

### 8.4 Finalização da Luta

1. Clicar em "Finalizar Luta"
2. Modal 1: **Selecionar Vencedor** — escolhe qual atleta venceu
3. Modal 2: **Selecionar Tipo de Vitória** — pontos ou finalização
4. Se DSQ: Modal 1 pergunta qual atleta, Modal 2 pede confirmação antes de salvar
5. `ResultadoLuta` criado com UUID próprio, vinculado à `Luta.id`
6. JSON da área é atualizado com todos os campos do resultado
7. Status da luta muda para `"concluida"`

### 8.5 Conclusão da Chave

- Todas as lutas processadas
- `ChaveLuta.vencedorAtletaId` preenchido com o UUID do campeão
- `ChaveLuta.status` atualiza automaticamente (pendente → em_andamento → concluida)

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
| `CompetitorCard` | Card individual de competidor com nome, equipe, resultado |
| `Round1Pair` | Par de competidores das oitavas (8 lutas por lado) |
| `Round2Pair` | Par de competidores das quartas (2 lutas por lado) |
| `SemiFinalCard` | Card da semifinal (apenas 1 competidor por card) |
| `FinalistCard` | Card de finalista no painel central |
| `PodiumLine` | Linha de classificação final (1º, 2º, 3º) |

### 9.3 Painel Central

O painel central exibe apenas o **Finalista**, mostrando o vencedor da semifinal esquerda quando concluída.

### 9.3.1 Modal de Campeão (ChampionModal)

**Arquivo:** `app/components/bracket/ChampionModal.tsx`

Componente modal que exibe o campeão quando a chave é concluída:
- Fundo com gradiente dourado (amber-300 a amber-500)
- Ícone de troféu
- Nome do campeão
- Equipe do campeão
- Label "CAMPEÃO" em destaque
- Nome da categoria
- Botão de fechar (opcional)

### 9.3.2 Card de Campeão no Bracket (BracketChampion)

**Arquivo:** `app/components/bracket/BracketChampion.tsx`

Componente compacte para exibir o campeão diretamente no bracket:
- Fundo com gradiente dourado (amber-300 a amber-500)
- Ícone de troféu pequeno
- Nome do campeão em texto pequeno
- Equipe do campeão
- Badge "CAMPEÃO" com fundo amber
- Nome da categoria abaixo
- Estado de "Aguardando campeão..." quando não há campeão

### 9.4 Classificação Final (Pódio)

O pódio é exibido abaixo do bracket com:
- **1º Lugar**: Campeão (cor dourada)
- **2º Lugar**: Vice-campeão (cor cinza)
- **3º Lugar**: Dois terceiros lugares (cor âmbar)

Os terceiros lugares são calculados automaticamente:
- `thirdPlaceLeft`: Perdedor da semifinal esquerda
- `thirdPlaceRight`: Perdedor da semifinal direita

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
| Button | `@/components/ui/button` | Botões principais e ações |
| Card | `@/components/ui/card` | Containers de conteúdo |
| Dialog | `@/components/ui/dialog` | Modais e confirmações |
| Input | `@/components/ui/input` | Campos de texto |
| Select | `@/components/ui/select` | Dropdowns |
| Toast | `@/components/ui/toast` | Notificações |
| Badge | `@/components/ui/badge` | Labels e badges de status |

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
| `buildBracketFromChaveLuta()` | Converte ChaveLuta em array de BracketRound para visualização |
| `generatePosition()` | Calcula posições automaticamente considerando fluxo visual e BYE |
| `calculateByePosition()` | Função auxiliar para calcular posição de atleta que avança por BYE |
| `advanceWinner()` | Move automaticamente o vencedor para a próxima luta |
| `getFighterTags()` | Retorna tags de resultado (VENCEU, PERDEU, DESCLASS., FINALIZOU) |
| `getFighterStatus()` | Retorna status do resultado |
| `getRoundLabel()` | Retorna label do round (Round 1, Quartas, Semifinal, Final) |
| `isByeSlot()` | Verifica se a luta é um bye |
| `getLutaById()` | Busca luta por ID na chave |
| `findAtletaById()` | Busca atleta por ID na chave |
| `podeIniciarLuta()` | Verifica se a luta pode ser iniciada (lutas anteriores concluídas) |
| `canInteract()` | Verifica se a luta pode ser interagida |
| `getUnicoAtleta()` | Retorna único atleta em chaves com 1 competidor |

---

## 17. Hooks Personalizados

| Hook | Arquivo | Descrição |
|------|---------|------------|
| `useStorage` | `app/hooks/useStorage.ts` | Gerenciamento de dados (salvar, carregar, finalizar luta) |
| `useImportacao` | `app/hooks/useImportacao.ts` | Importação de arquivos JSON |
| `useBracket` | `app/hooks/useBracket.ts` | Hook para visualização de bracket |

---

## 18. Fluxo: Migração e Avanço de Vencedor

### 17.1 Migração de Dados
Ao carregar dados de uma área, o sistema executa `migrateAllData()` que:
1. Verifica se cada entidade tem UUID válido
2. Gera novos UUIDs para entidades sem ID válido
3. Preserva todos os dados existentes durante a migração

### 17.2 Avanço Automático de Vencedor
Ao finalizar uma luta com `marcarLutaConcluida()`:
1. Cria `ResultadoLuta` com UUID próprio
2. Identifica o vencedor e perdedor
3. Se `nextMatchId` existir na luta atualizada, move o vencedor para a próxima luta
4. Atualiza o status da chave automaticamente

---

## 19. Validação de UUID

Função em `app/lib/uuid.ts`:
- `generateUUID()`: Gera UUID v4 usando `crypto.randomUUID()`
- `isValidUUID(value)`: Valida se uma string é um UUID v4 válido

Regex: `/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`

---

## 20. Correção de Posicionamento de BYE no Bracket

### 20.1 Problema

Ao utilizar chaves com número ímpar de atletas (ex: 3 atletas), ocorre um BYE automaticamente no Round 1. O atleta que avança por ter o oponente null (BYE) estava sendo posicionado incorretamente no Round 2, resultando em uma exibição visual incorreta no bracket.

**Exemplo do problema:**
- 3 atletas: posições 0 e 1 no Round 1
- Posição 1 (BYE no lado direito) deveria ir para posição 3 no Round 2
- Mas estava sendo calculada como `Math.floor(1/2) = 0` (incorreto!)

### 20.2 Arquivos Modificados

| Arquivo | Modificação |
|---------|-------------|
| `app/scoreboard/setup/page.tsx` | Função `handleImportar` - cálculo de posição para BYE |
| `app/lib/bracket-utils.ts` | Função `generatePosition` e `calculateByePosition` |
| `app/hooks/useImportacao.ts` | 调用 `generatePosition` no fluxo de importação |

### 20.3 Lógica de Correção

**Em `app/scoreboard/setup/page.tsx:handleImportar`:**

```typescript
// Lógica corrigida para calcular posição do BYE no Round 2
let positionRound2: number
if (luta.position % 2 === 1) {
  // BYE no lado direito (posição ímpar) → posição 3 no Round 2
  positionRound2 = 3
} else {
  // BYE no lado esquerdo (posição par) → posição 1 no Round 2
  positionRound2 = 1
}
```

### 20.4 Comportamento Esperado

| Cenário | Round 1 | Round 2 |
|---------|---------|---------|
| 3 atletas (BYE pos 1) | posições 0,1 | posição 3 (direito) |
| 5 atletas (BYE pos 2) | posições 0,1,2 | posição 1 (esquerdo) |
| 4 atletas (normal) | posições 0,1 | posições 0,1 (esq), 2,3 (dir) |

### 20.5 Referência

- Documento detalhado: `docs/requisitos-correcao-position.md`

---

## 21. Tags de Status no Bracket

### 21.1 Visão Geral

O sistema exibe tags de status no bracket para diferentes cenários de luta:

| Tag | Cor | Condição |
|-----|-----|----------|
| AVANÇOU | Azul | Atleta avançou por BYE (atleta2 = null no Round 1) |
| VENCEU | Verde | Atleta venceu a luta |
| DESCLASSIFICADO | Vermelho | Atleta foi desclassificado |

### 21.2 Implementação

**Arquivo:** `app/components/bracket/BracketLayout.tsx` - Componente `CompetitorCard`

**Lógica de Exibição:**

```typescript
// Tag AVANÇOU (BYE)
const showAdvanceTag = temAtleta && opponentIsNull && luta?.round === 1

// Tag DESCLASSIFICADO
const isDesclassificado = temAtleta && luta?.resultado?.status === "concluida" &&
  ((atletaIndex === 1 && luta.resultado.desclassificacao === "atleta1") ||
   (atletaIndex === 2 && luta.resultado.desclassificacao === "atleta2"))

// Tag VENCEU (apenas se não for BYE e não for desclassificado)
{isCompleted && !showAdvanceTag && !isDesclassificado && "VENCEU"}
```

### 21.3 Estilos Visuais

| Tag | Classe CSS | Texto |
|-----|------------|-------|
| AVANÇOU | `bg-blue-100 text-blue-700` | AVANÇOU |
| VENCEU | `bg-green-500 text-white` | VENCEU |
| DESCLASSIFICADO | `bg-red-600 text-white` | DESCLASSIFICADO |

Para atletas desclassificados, o nome também recebe:
- Cor: `text-red-600`
- Estilo: `line-through` (tachado)

---

## 22. Posicionamento de Elementos no Card do Competidor

### 22.1 Visão Geral

Cada card de competidor no bracket contém dois elementos posicionados nos cantos superiores/inferiores direitos:

| Elemento | Posição | Descrição |
|----------|---------|-----------|
| **Número do Card** | Canto superior direito | Identificador numérico da posição no bracket |
| **Tag de Status** | Canto inferior direito | Indica estado do competidor (AVANÇOU, VENCEU, DESCLASSIFICADO) |

### 22.2 Regras de Posicionamento

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

### 22.3 Implementação

**Arquivo:** `app/components/bracket/BracketLayout.tsx` - Componente `CompetitorCard`

```typescript
// Número do card - sempre no canto superior direito
{cardPosition !== undefined && (
  <span className="absolute right-1 top-1 text-[10px] font-bold text-slate-400">
    {cardPosition}
  </span>
)}

// Tags de status - sempre no canto inferior direito
{showAdvanceTag && (
  <span className="absolute right-1 bottom-1 bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded font-bold">
    AVANÇOU
  </span>
)}
```

### 22.4 Estados do Card

| Estado | Número do Card | Tag |
|--------|---------------|-----|
| Com atleta, pendente | Superior direito | Nenhuma |
| Com atleta, avançado (BYE) | Superior direito | Inferior direito (AVANÇOU) |
| Com atleta, venceu | Superior direito | Inferior direito (VENCEU) |
| Com atleta, desclassificado | Superior direito | Inferior direito (DESCLASSIFICADO) |
| Sem atleta (vazio) | Superior direito | Nenhuma |

---

*Documento atualizado em: 2026-05-19*
*Versão: 7.7*
*Mudanças principais:*
*- Adicionada seção 22 - Posicionamento de Elementos no Card do Competidor*
*- Definida regra: número do card sempre no canto superior direito*
*- Definida regra: tags de status sempre no canto inferior direito*
*- Corrigido posicionamento do cardPosition em cards vazios (agora superior direito)*

*Versão anterior (7.6):*
*- Atualizada numeração dos cards (1-15) na seção 9.6*
*- Renumerados os cards do bracket para novolayout de 15 competidores*
*- Cards de posição 1-4: Round 1 lado esquerdo*
*- Cards de posição 5-8: Round 1 lado direito*
*- Cards de posição 9-10: Round 2 lado esquerdo*
*- Cards de posição 11-12: Round 2 lado direito*
*- Card de posição 13: Semifinal esquerda*
*- Card de posição 14: Semifinal direita*
*- Card de posição 15: Final*

*Versão 7.5:*
*- Adicionada seção 9 - BracketLayout com estrutura, componentes e classificação final*
*- Removido troféu central "Disputa de Ouro" do layout*
*- Simplificado painel central para exibir apenas Finalista*
*- SemiFinalCard agora renderiza apenas um competidor (não par)*
*- Mantido pódio com 1º, 2º e dois 3º lugares automáticos*
*- Renumeradas seções subsequentes*
*- Adicionada seção 9.6 com numeração dos cards (0-28)*
*- FinalistCard agora aceita prop cardPosition*
*- Adicionada seção 20 - Correção de Posicionamento de BYE no Bracket*
*- Adicionada seção 21 - Tags de Status no Bracket (AVANÇOU, VENCEU, DESCLASSIFICADO)*
*- Adicionado campo `avancou?: boolean` na interface Atleta*
*- Adicionado campo `classificacaoFinal?: ClassificacaoFinal` na interface ChaveLuta*
*- Adicionada subseção 9.3.1 - ChampionModal (modal de exibição do campeão)*
*- Adicionada subseção 9.3.2 - BracketChampion (card compacto de campeão no bracket)*
*- Adicionada HU-001b - Painel Administrativo (admin/page.tsx)*