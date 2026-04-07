Aqui está a spec atualizada com as novas informações:

---

# Spec: BJJ Tournament Manager

## Visão Geral

Aplicação web em Next.js para gerenciamento de torneios de Brazilian Jiu-Jitsu (BJJ). Permite cadastrar competidores, organizar chaves de luta por faixa e categoria de peso, gerenciar áreas de luta, controlar placar em tempo real com cronômetro, suporte a lutas casadas, registro de árbitros por área, e geração de relatórios finais do torneio.

Armazenamento: múltiplos arquivos JSON locais via sistema de arquivos do servidor Next.js (API Routes), simulando um banco de dados relacional.

**UI Library:** [shadcn/ui](https://ui.shadcn.com) — componentes acessíveis e customizáveis via Radix UI + Tailwind CSS.
**Ícones:** [Lucide React](https://lucide.dev) — conjunto consistente de ícones SVG.

---

## Paleta de Cores

O sistema utiliza a seguinte paleta de cores base, inspirada no BJJ:

| Cor | Uso |
|---|---|
| **Amarelo (Gold)** | Destaques, botões principais, títulos, elementos de ação |
| **Azul (Blue)** | Fundos secundários, hover states, links, bordas de destaque |
| **Branco (White)** | Texto principal, fundos claros (modo claro) |
| **Preto (Black)** | Fundo principal (modo escuro), textos secundários, contraste |

### Configuração Tailwind

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'bjj-gold': '#FFD700',
        'bjj-gold-dark': '#DAA520',
        'bjj-blue': '#1E3A8A',
        'bjj-blue-light': '#3B82F6',
        'bjj-white': '#FFFFFF',
        'bjj-black': '#111111',
        'bjj-gray': '#2A2A2A',
      }
    }
  }
}
```

---

## Domínio e Terminologia

| Termo | Definição |
|---|---|
| Torneio | Evento principal, contém todas as configurações e metadados do campeonato |
| Competidor | Atleta inscrito no torneio |
| Faixa | Graduação do atleta (Branca, Cinza, Amarela, Laranja, Verde, Azul, Roxa, Marrom, Preta) |
| Categoria de Peso | Faixa de peso (ex: Pluma, Leve, Médio, Pesado, Super Pesado, Pesadíssimo) |
| Chave | Bracket de eliminação simples entre competidores da mesma faixa e categoria |
| Área de Luta | Tatame físico numerado onde as lutas acontecem |
| Luta | Confronto entre dois competidores com placar e tempo |
| Luta Casada | Luta previamente definida que será atribuída a uma área específica |
| Placar | Pontuação corrente de uma luta ativa |
| Punição | Penalidade que conta no placar do adversário |
| Vantagem | Ponto parcial registrado individualmente |
| Árbitro | Profissional responsável por arbitrar as lutas em uma área |
| Soft Delete | Exclusão lógica — mantém o registro no sistema com flag `isActive: false` |

---

## Módulos do Sistema

### 1. Módulo de Torneio

**Objetivo:** Gerenciar o torneio principal e suas configurações.

**Dados do Torneio:**

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `id` | UUID | Sim | Gerado automaticamente |
| `name` | string | Sim | Nome do torneio |
| `startDate` | string (ISO date) | Sim | Data de início |
| `endDate` | string (ISO date) | Sim | Data de término |
| `location` | string | Sim | Local do evento |
| `organization` | string | Sim | Organizador/ federação |
| `status` | enum TournamentStatus | Sim | DRAFT / ACTIVE / COMPLETED |
| `createdAt` | string (ISO datetime) | Sim | Data de criação |
| `updatedAt` | string (ISO datetime) | Sim | Última atualização |

**Ações:**
- `Criar torneio`
- `Editar torneio`
- `Ativar torneio`
- `Finalizar torneio`
- `Gerar relatório final`

---

### 2. Módulo de Competidores

**Objetivo:** Cadastrar e gerenciar os atletas inscritos.

**Dados do competidor:**

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `id` | UUID | Sim | Gerado automaticamente |
| `name` | string | Sim | Nome completo |
| `team` | string | Sim | Nome da academia/equipe |
| `weight` | number (kg) | Sim | Peso em quilogramas |
| `age` | number | Sim | Idade em anos |
| `belt` | enum Belt | Sim | Ver enum abaixo |
| `coach` | string | Não | Nome do técnico |
| `registrationDate` | string (ISO datetime) | Sim | Data de inscrição |
| `isActive` | boolean | Sim | Soft delete — `true` por padrão |

**Enum Belt (ordem de graduação):**
```
WHITE | GRAY | YELLOW | ORANGE | GREEN | BLUE | PURPLE | BROWN | BLACK
```

**Regras:**
- Não é permitido cadastrar dois competidores com o mesmo nome na mesma equipe.
- Peso deve ser > 0 e < 300.
- Idade deve ser >= 4 e <= 100.
- Todos os campos obrigatórios são exigidos.
- **Exclusão é sempre soft delete:** competidor não é removido do banco, apenas marcado como `isActive: false`. Impede que o competidor seja incluído em novas chaves, mas mantém histórico.

**Ações:**
- `Criar competidor`
- `Editar competidor`
- `Excluir competidor` (soft delete — marca como inativo)
- `Listar competidores` com filtro por faixa, equipe, nome e status (ativos/inativos)
- `Importar competidores` (CSV/JSON)
- `Exportar competidores`

---

### 3. Módulo de Árbitros

**Objetivo:** Cadastrar e gerenciar os árbitros do torneio.

**Dados do Árbitro:**

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `id` | UUID | Sim | Gerado automaticamente |
| `name` | string | Sim | Nome completo |
| `belt` | enum Belt | Sim | Graduação mínima recomendada: Roxa |
| `certification` | string | Não | Certificação / federação |
| `experience` | number | Não | Anos de experiência |
| `isActive` | boolean | Sim | Soft delete — `true` por padrão |

**Ações:**
- `Criar árbitro`
- `Editar árbitro`
- `Excluir árbitro` (soft delete — somente se não estiver associado a uma chave/área ativa)
- `Listar árbitros`
- `Atribuir árbitro a área`

---

### 4. Módulo de Chaves (Brackets)

**Objetivo:** Organizar os competidores em brackets de eliminação simples por faixa e categoria de peso.

**Categoria de peso (por faixa etária e faixa de graduação — simplificado para o sistema):**

O usuário define manualmente os limites de peso para criar uma categoria. Não há categorias pré-fixadas.

**Dados da Chave:**

| Campo | Tipo | Observação |
|---|---|---|
| `id` | UUID | Gerado automaticamente |
| `belt` | enum Belt | Faixa dos competidores |
| `weightMin` | number | Peso mínimo em kg |
| `weightMax` | number | Peso máximo em kg |
| `label` | string | Nome da categoria (ex: "Azul - Leve") |
| `competitors` | Competitor[] | Competidores elegíveis filtrados automaticamente |
| `matches` | Match[] | Lutas geradas pelo bracket |
| `status` | enum: PENDING / IN_PROGRESS / FINISHED | Status da chave |
| `refereeId` | UUID ou null | Árbitro responsável pela chave |
| `areaId` | UUID ou null | Área preferencial para esta chave |

**Regras:**
- Ao criar uma chave, o sistema filtra automaticamente os competidores cadastrados que correspondem à faixa e ao intervalo de peso definidos.
- O usuário pode remover ou adicionar competidores manualmente antes de gerar as lutas.
- O bracket é de eliminação simples (single elimination).
- Com número ímpar de competidores, o sistema distribui bye automaticamente.
- Uma chave não pode ser editada após o status mudar para `IN_PROGRESS`.
- Cada chave pode ter um árbitro designado.

**Ações:**
- `Criar chave` (definir faixa + faixa de peso + árbitro)
- `Ver competidores elegíveis`
- `Adicionar/remover competidor da chave`
- `Gerar bracket` (cria as lutas)
- `Visualizar bracket` (exibição em árvore)
- `Atribuir árbitro à chave`
- `Excluir chave` (somente se PENDING)

---

### 5. Módulo de Áreas de Luta

**Objetivo:** Gerenciar os tatames físicos disponíveis no evento e suas lutas programadas.

**Dados da Área:**

| Campo | Tipo | Observação |
|---|---|---|
| `id` | UUID | Gerado automaticamente |
| `name` | string | Ex: "Tatame 1", "Área A" |
| `currentMatchId` | UUID ou null | Luta atualmente em curso |
| `scheduledMatches` | ScheduledMatch[] | Fila de lutas programadas para esta área |
| `refereeId` | UUID ou null | Árbitro principal da área |
| `assistantRefereeId` | UUID ou null | Árbitro assistente (opcional) |

**ScheduledMatch:**

| Campo | Tipo | Observação |
|---|---|---|
| `matchId` | UUID | ID da luta agendada |
| `order` | number | Ordem na fila |
| `estimatedTime` | string | Horário estimado (opcional) |
| `isMarried` | boolean | Se é uma luta casada |

**Regras:**
- Uma área pode ter no máximo uma luta ativa por vez.
- Ao atribuir uma luta a uma área, o status da luta muda para `IN_PROGRESS`.
- Lutas casadas podem ser pré-definidas para uma área específica.

**Ações:**
- `Criar área`
- `Editar nome da área`
- `Atribuir árbitro à área`
- `Programar luta na área` (incluindo lutas casadas)
- `Remover luta programada`
- `Avançar para próxima luta`
- `Excluir área` (somente se sem luta ativa)
- `Listar áreas` com status atual e fila de lutas
- `Exportar programação de áreas`
- `Importar programação de áreas`

---

### 6. Módulo de Lutas Casadas

**Objetivo:** Permitir a definição antecipada de lutas específicas em áreas determinadas.

**Dados da Luta Casada:**

| Campo | Tipo | Observação |
|---|---|---|
| `id` | UUID | Gerado automaticamente |
| `competitorAId` | UUID | ID do competidor A |
| `competitorBId` | UUID | ID do competidor B |
| `areaId` | UUID | Área designada para a luta |
| `scheduledTime` | string (ISO datetime) | Horário agendado |
| `bracketId` | UUID ou null | Chave a que pertence (se aplicável) |
| `notes` | string | Observações adicionais |

**Regras:**
- Ao criar uma luta casada, ela é automaticamente adicionada à fila da área designada.
- A luta casada pode ser movida para outra área antes de iniciar.
- Os competidores devem estar cadastrados no sistema.

**Ações:**
- `Criar luta casada`
- `Editar luta casada`
- `Remover luta casada`
- `Mover para outra área`
- `Listar lutas casadas`

---

### 7. Módulo de Placar (Scoreboard)

**Objetivo:** Controlar o placar e o cronômetro de uma luta ativa em uma área.

**Dados da Luta (Match):**

| Campo | Tipo | Observação |
|---|---|---|
| `id` | UUID | Gerado automaticamente |
| `bracketId` | UUID | Chave a que pertence |
| `competitorA` | Competitor | Lutador do lado A |
| `competitorB` | Competitor | Lutador do lado B |
| `areaId` | UUID ou null | Área onde ocorre |
| `status` | enum: PENDING / IN_PROGRESS / FINISHED | |
| `scoreA` | ScoreData | Pontuação do competidor A |
| `scoreB` | ScoreData | Pontuação do competidor B |
| `duration` | number (segundos) | Tempo total da luta |
| `elapsedTime` | number (segundos) | Tempo decorrido |
| `winner` | UUID ou null | ID do vencedor |
| `isMarried` | boolean | Indica se é uma luta casada |
| `refereeId` | UUID | Árbitro que arbitrou a luta |

**ScoreData:**
```json
{
  "points": 0,
  "advantages": 0,
  "penalties": 0
}
```

**Regras de pontuação BJJ:**
- **2 pontos:** Derrubada, varredura, saída por baixo
- **3 pontos:** Passagem de guarda
- **4 pontos:** Montada, pegada nas costas, knee-on-belly
- **Vantagem:** Registro de tentativa incompleta (não soma na desistência)
- **Punição:** Penalidade ao competidor infrator — conta como +1 ponto para o adversário no critério de desempate
- Vencedor por pontos: maior pontuação ao fim do tempo
- Critério de desempate: vantagens > punições do adversário
- Vencedor por finalização: encerrar a luta manualmente com vitória definida

**Cronômetro:**
- Tempo configurável antes de iniciar (padrão: 5 minutos)
- Ações: Iniciar, Pausar, Retomar, Zerar
- Ao chegar em 00:00, o cronômetro para e o sistema indica fim de luta

**Ações do placar:**
- `Selecionar área` para abrir o placar daquela área
- `Adicionar pontos` (+2, +3, +4) para A ou B
- `Adicionar vantagem` para A ou B
- `Adicionar punição` para A ou B
- `Desfazer última ação` (undo — apenas a última)
- `Finalizar luta` (com vencedor por tempo ou por finalização)
- Ao finalizar: avança o bracket automaticamente

**Nota sobre persistência do cronômetro:** O estado do cronômetro é armazenado apenas em memória durante a luta ativa. Não há persistência entre abas, pois as pontuações são marcadas ao vivo e o sistema oferece a opção de desfazer ações quando necessário.

---

### 8. Módulo de Relatórios e Exportação

**Objetivo:** Consolidar e exportar informações do torneio.

**Tipos de Relatório:**

| Relatório | Descrição |
|---|---|
| Relatório Final do Torneio | Visão completa: competidores, chaves, resultados por área |
| Relatório por Área | Lutas realizadas por tatame, árbitros atuantes |
| Relatório por Árbitro | Chaves e lutas arbitradas por cada árbitro |
| Relatório de Resultados | Colocações finais por chave |
| Exportação Completa | Todos os JSONs consolidados em um arquivo |

**Ações:**
- `Gerar relatório final do torneio`
- `Exportar dados (torneio + competidores + chaves + áreas + árbitros)`
- `Importar dados` (para consolidar informações de múltiplas fontes)
- `Consolidar dados` (juntar informações de arquivos locais diferentes)

**Importante:** O sistema **não** permite resetar o torneio após iniciado. Dados são imutáveis uma vez registrados. Para um novo torneio, deve-se iniciar uma nova instância/arquivo.

---

## Estrutura de Arquivos de Dados

O sistema utiliza múltiplos arquivos JSON separados, simulando um banco de dados relacional. Cada arquivo tem uma responsabilidade específica e são lidos/escritos conforme necessário.

### Estrutura de Pastas

```
data/
├── tournament.json      # Configuração principal do torneio
├── competitors.json     # Cadastro de competidores
├── brackets.json        # Chaves e brackets
├── matches.json         # Lutas (inclui histórico de placares)
├── areas.json           # Áreas de luta e programação
├── referees.json        # Cadastro de árbitros
├── marriedMatches.json  # Lutas casadas predefinidas
├── results.json         # Resultados consolidados do torneio
└── exports/             # Pasta para arquivos de exportação/importação
    └── [timestamp]_export.json
```

### Exemplos de Estrutura dos JSONs

#### `data/tournament.json` — Configuração do Torneio

```json
{
  "id": "uuid",
  "name": "Campeonato Brasileiro de BJJ 2025",
  "startDate": "2025-08-10",
  "endDate": "2025-08-12",
  "location": "Ginásio do Ibirapuera, São Paulo",
  "organization": "CBJJ",
  "status": "ACTIVE",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-08-01T14:30:00Z"
}
```

#### `data/competitors.json` — Competidores

```json
{
  "competitors": [
    {
      "id": "uuid",
      "name": "João Silva",
      "team": "Alliance",
      "weight": 74.5,
      "age": 28,
      "belt": "BLUE",
      "coach": "Fábio Gurgel",
      "registrationDate": "2025-07-01T09:00:00Z",
      "isActive": true
    }
  ]
}
```

#### `data/brackets.json` — Chaves

```json
{
  "brackets": [
    {
      "id": "uuid",
      "belt": "BLUE",
      "weightMin": 70,
      "weightMax": 79,
      "label": "Azul - Leve",
      "competitors": ["competitorId1", "competitorId2"],
      "matches": ["matchId1", "matchId2"],
      "status": "PENDING",
      "refereeId": "refereeId1",
      "areaId": null,
      "createdAt": "2025-08-01T10:00:00Z"
    }
  ]
}
```

#### `data/matches.json` — Lutas

```json
{
  "matches": [
    {
      "id": "uuid",
      "bracketId": "uuid",
      "competitorA": {
        "competitorId": "uuid",
        "name": "João Silva",
        "team": "Alliance",
        "belt": "BLUE",
        "weight": 74.5
      },
      "competitorB": {
        "competitorId": "uuid",
        "name": "Pedro Rocha",
        "team": "Checkmat",
        "belt": "BLUE",
        "weight": 73.0
      },
      "areaId": "areaId1",
      "status": "FINISHED",
      "scoreA": {
        "points": 6,
        "advantages": 1,
        "penalties": 0
      },
      "scoreB": {
        "points": 2,
        "advantages": 0,
        "penalties": 1
      },
      "duration": 300,
      "elapsedTime": 298,
      "winner": "competitorId1",
      "isMarried": false,
      "refereeId": "refereeId1",
      "finishedAt": "2025-08-10T10:42:00Z"
    }
  ]
}
```

#### `data/areas.json` — Áreas de Luta

```json
{
  "areas": [
    {
      "id": "uuid",
      "name": "Tatame 1",
      "currentMatchId": "matchId1",
      "scheduledMatches": [
        {
          "matchId": "matchId2",
          "order": 1,
          "estimatedTime": "2025-08-10T11:00:00Z",
          "isMarried": false
        }
      ],
      "refereeId": "refereeId1",
      "assistantRefereeId": "refereeId2"
    }
  ]
}
```

#### `data/referees.json` — Árbitros

```json
{
  "referees": [
    {
      "id": "uuid",
      "name": "Carlos Eduardo",
      "belt": "PURPLE",
      "certification": "CBJJ Nível 2",
      "experience": 5,
      "isActive": true
    }
  ]
}
```

#### `data/marriedMatches.json` — Lutas Casadas

```json
{
  "marriedMatches": [
    {
      "id": "uuid",
      "competitorAId": "competitorId1",
      "competitorBId": "competitorId2",
      "areaId": "areaId1",
      "scheduledTime": "2025-08-10T14:00:00Z",
      "bracketId": null,
      "notes": "Final absoluto"
    }
  ]
}
```

#### `data/results.json` — Resultados Consolidados

```json
{
  "generatedAt": "2025-08-12T20:00:00Z",
  "tournament": {
    "id": "uuid",
    "name": "Campeonato Brasileiro de BJJ 2025"
  },
  "brackets": [
    {
      "bracketId": "uuid",
      "label": "Azul - Leve",
      "belt": "BLUE",
      "weightMin": 70,
      "weightMax": 79,
      "status": "FINISHED",
      "refereeName": "Carlos Eduardo",
      "placements": [...],
      "rounds": [...]
    }
  ],
  "areaHistory": [...],
  "refereeSummary": [...],
  "statistics": {
    "totalCompetitors": 128,
    "totalBrackets": 12,
    "totalMatches": 120,
    "totalAreas": 4,
    "totalReferees": 8,
    "submissions": 45,
    "pointsVictories": 60,
    "walkovers": 10,
    "dq": 5
  }
}
```

---

## API Routes

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/tournament` | Retorna configuração do torneio |
| `POST` | `/api/tournament` | Cria/atualiza torneio |
| `GET` | `/api/competitors` | Lista competidores |
| `POST` | `/api/competitors` | Cria competidor |
| `PUT` | `/api/competitors/[id]` | Atualiza competidor |
| `DELETE` | `/api/competitors/[id]` | Soft delete competidor |
| `GET` | `/api/brackets` | Lista chaves |
| `POST` | `/api/brackets` | Cria chave |
| `POST` | `/api/brackets/[id]/generate` | Gera bracket |
| `GET` | `/api/areas` | Lista áreas |
| `POST` | `/api/areas` | Cria área |
| `POST` | `/api/areas/[id]/schedule` | Programa luta na área |
| `GET` | `/api/referees` | Lista árbitros |
| `POST` | `/api/referees` | Cria árbitro |
| `GET` | `/api/married-matches` | Lista lutas casadas |
| `POST` | `/api/married-matches` | Cria luta casada |
| `GET` | `/api/results` | Retorna resultados consolidados |
| `POST` | `/api/results/finalize` | Finaliza torneio e gera relatório |
| `POST` | `/api/export` | Exporta todos os dados |
| `POST` | `/api/import` | Importa dados consolidados |

**Nota:** Não há rota de reset. O torneio não pode ser resetado após iniciado.

---

## Navegação e Telas

| Rota | Tela |
|---|---|
| `/` | Dashboard — resumo do torneio (TELA INICIAL com todos os menus) |
| `/tournament/setup` | Configuração inicial do torneio |
| `/competitors` | Lista e cadastro de competidores |
| `/competitors/import` | Importação de competidores |
| `/brackets` | Lista de chaves + criação |
| `/brackets/[id]` | Visualização do bracket (árvore) |
| `/brackets/[id]/referee` | Atribuição de árbitro à chave |
| `/areas` | Gerenciamento de áreas |
| `/areas/[id]/schedule` | Programação de lutas na área |
| `/scoreboard` | Seletor de área + placar ativo |
| `/scoreboard/[areaId]` | Placar em tela cheia |
| `/referees` | Cadastro e gestão de árbitros |
| `/married-matches` | Gerenciamento de lutas casadas |
| `/schedule` | Visão geral da programação |
| `/results` | Resultados finais — relatório completo |
| `/results/export` | Exportação de dados |
| `/import` | Importação e consolidação de dados |

---

## Fora de Escopo (v1)

- Autenticação de usuário
- Torneios múltiplos simultâneos (embora o JSON suporte, a UI é para um torneio por vez)
- Integração com banco de dados externo (PostgreSQL, MongoDB)
- Histórico de torneios anteriores (múltiplos eventos)
- Categorias de peso pré-definidas por federação
- Notificações em tempo real via WebSocket
- Aplicação mobile nativa
- **Reset do torneio** (não implementado — dados são imutáveis)

---

## Critérios de Aceite Globais

- Toda operação de escrita persiste imediatamente no JSON correspondente.
- A aplicação deve funcionar sem internet (dados locais).
- O placar em `/scoreboard/[areaId]` deve ser utilizável em tela cheia (projetado para TV/monitor).
- Listas com mais de 20 itens devem ter paginação ou scroll virtual.
- O sistema deve oferecer opção de desfazer última ação do placar.
- É possível exportar e importar dados para consolidação entre diferentes instâncias.
- O relatório final deve conter todas as informações do torneio: competidores, chaves, resultados por área e sumário de árbitros.
- **Não é possível resetar o torneio** — dados são permanentes.
- **Exclusão de competidores e árbitros é soft delete** — mantém histórico.

---

# Plano de Implementação

## Stack

| Item | Decisão |
|---|---|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS + **shadcn/ui** + cores customizadas |
| Componentes | **shadcn/ui** (Button, Card, Dialog, Input, Select, Table, Tabs, etc.) |
| Ícones | **Lucide React** |
| Formulários | React Hook Form + Zod (validação) |
| Persistência | Múltiplos JSONs locais via `fs` em API Routes |
| Estado cliente | `useState` + `useReducer` + `Context API` |
| Cronômetro | `useRef` + `setInterval` (sem persistência entre abas) |
| Geração de UUID | `crypto.randomUUID()` |
| Testes | Vitest (unitário) |
| Notificações | **shadcn/ui Toast** ou **Sonner** |

---

## Fases de Implementação

---

### FASE 1 — Fundação e Estrutura de Dados

**Objetivo:** Criar a base do projeto com tipos, persistência e API.

#### Tarefas

**1.1 — Setup do Projeto**
- [ ] Criar projeto Next.js 14 com TypeScript e Tailwind: `npx create-next-app@latest bjj-tournament --typescript --tailwind --app`
- [ ] Instalar e configurar **shadcn/ui**:
  ```bash
  npx shadcn-ui@latest init
  # Selecionar: Estilo New York, Neutral, CSS variables, yes
  ```
- [ ] Configurar cores customizadas no `tailwind.config.js` (amarelo, azul, branco, preto)
- [ ] Instalar **Lucide React**:
  ```bash
  npm install lucide-react
  ```
- [ ] Instalar dependências adicionais:
  ```bash
  npm install react-hook-form zod @hookform/resolvers sonner
  ```
- [ ] Configurar `eslint` e `prettier`
- [ ] Criar estrutura de pastas: `src/types`, `src/lib`, `src/hooks`, `src/components`, `src/app`
- [ ] Criar pasta `data/` com todos os arquivos JSON iniciais vazios

**1.2 — Definição de Tipos**
- [ ] Criar `src/types/index.ts` com todos os tipos necessários
- [ ] Tipos: `Tournament`, `Belt`, `Competitor`, `ScoreData`, `Match`, `MatchStatus`, `FinishType`, `Bracket`, `BracketStatus`, `Area`, `ScheduledMatch`, `Referee`, `MarriedMatch`, `TournamentData`, `ResultsData`
- [ ] Incluir `isActive` nos tipos que suportam soft delete
- [ ] Exportar todos os tipos de um barrel `src/types/index.ts`

**1.3 — Camada de Persistência**
- [ ] Criar `src/lib/storage.ts` com funções para cada arquivo JSON
- [ ] Criar `src/lib/atomicWrite.ts` para escrita atômica (evitar corrupção)
- [ ] Garantir que todos os arquivos são inicializados caso não existam

**1.4 — API Routes Base**
- [ ] Criar rotas para cada entidade usando os padrões do Next.js App Router

**1.5 — Setup de UI Base**
- [ ] Adicionar componentes shadcn/ui essenciais:
  ```bash
  npx shadcn-ui@latest add button card dialog input label select table tabs toast form
  ```
- [ ] Configurar `Sonner` para toasts no `layout.tsx`
- [ ] Criar layout base com navbar e sidebar (usando shadcn/ui components)

**Critério de aceite:** Todas as rotas GET retornam os JSONs corretamente. Interface base com navbar funcional.

---

### FASE 2 — Tela Inicial (Dashboard com Todos os Menus)

**Objetivo:** Criar a tela inicial contemplando todos os menus que serão implementados futuramente.

#### Tarefas

**2.1 — Componentes do Dashboard**
- [ ] Criar `src/components/dashboard/MenuCard.tsx` — card com ícone Lucide, título, descrição e link
- [ ] Criar `src/components/dashboard/StatsCard.tsx` — card com estatísticas (total competidores, chaves, etc.)

**2.2 — Página Inicial**
- [ ] `src/app/page.tsx` — Dashboard com:
  - Cabeçalho com nome do torneio (se configurado)
  - Grid de cards para cada módulo:
    - Torneio (configuração)
    - Competidores
    - Árbitros
    - Chaves (Brackets)
    - Áreas de Luta
    - Lutas Casadas
    - Placar (Scoreboard)
    - Programação
    - Resultados
    - Exportar/Importar
  - Cards com estatísticas principais (competidores, chaves ativas, áreas, lutas finalizadas)

**2.3 — Estados**
- [ ] Estado vazio (nenhum torneio configurado) — exibir botão para criar torneio
- [ ] Loading skeleton para estatísticas

**Critério de aceite:** Tela inicial exibe todos os menus do sistema, mesmo que as funcionalidades ainda não estejam implementadas. Clicar em um menu navega para a respectiva rota (algumas rotas podem exibir "Em breve").

---

### FASE 3 — Módulo de Torneio

**Objetivo:** Configuração inicial do torneio.

#### Tarefas

**3.1 — Hook de Torneio**
- [ ] Criar `src/hooks/useTournament.ts` com: `tournament`, `createTournament`, `updateTournament`, `activateTournament`, `finalizeTournament`

**3.2 — Componentes**
- [ ] `TournamentForm` — usando `react-hook-form` + `zod` + shadcn/ui `Form`
- [ ] `TournamentStatusBadge` — usando shadcn/ui `Badge`

**3.3 — Página**
- [ ] `src/app/tournament/setup/page.tsx` — configuração inicial

**Critério de aceite:** É possível criar e editar o torneio. Status reflete no dashboard.

---

### FASE 4 — Módulo de Competidores

**Objetivo:** CRUD completo de competidores com componentes shadcn/ui.

#### Tarefas

**4.1 — Hook de Competidores**
- [ ] Criar `src/hooks/useCompetitors.ts` com operações CRUD + import/export (soft delete)

**4.2 — Componentes**
- [ ] `CompetitorForm` — shadcn/ui `Dialog` + `Form` com validação Zod
- [ ] `CompetitorCard` — shadcn/ui `Card` com Lucide ícones (`User`, `Weight`, `Award`)
- [ ] `CompetitorList` — shadcn/ui `Table` com filtros e toggle para mostrar inativos
- [ ] `BeltBadge` — componente customizado com cores mapeadas para cada faixa
- [ ] `CompetitorImportModal` — shadcn/ui `Dialog` com upload de arquivo

**4.3 — Páginas**
- [ ] `src/app/competitors/page.tsx` — lista com botão "Novo Competidor"
- [ ] `src/app/competitors/import/page.tsx` — importação

**Critério de aceite:** CRUD completo com soft delete, filtros funcionando, dados persistem.

---

### FASE 5 — Módulo de Árbitros

**Objetivo:** CRUD de árbitros com soft delete.

#### Tarefas

**5.1 — Hook de Árbitros**
- [ ] Criar `src/hooks/useReferees.ts` com operações CRUD (soft delete)

**5.2 — Componentes**
- [ ] `RefereeForm` — shadcn/ui `Form` + `Dialog`
- [ ] `RefereeList` — shadcn/ui `Table`
- [ ] `RefereeBadge` — componente com ícone Lucide `Shield`

**5.3 — Página**
- [ ] `src/app/referees/page.tsx`

**Critério de aceite:** CRUD completo de árbitros com soft delete.

---

### FASE 6 — Módulo de Chaves (Brackets)

**Objetivo:** Criar e gerenciar brackets de eliminação simples.

#### Tarefas

**6.1 — Lógica de Bracket**
- [ ] Criar `src/lib/bracket.ts` com função `generateBracket` (bloquear com menos de 2 competidores)
- [ ] Criar `src/lib/bracketUtils.ts` com `advanceBracket`
- [ ] Criar `src/lib/placementCalculator.ts` com `calculatePlacements`

**6.2 — Hook de Brackets**
- [ ] Criar `src/hooks/useBrackets.ts` com operações

**6.3 — Componentes**
- [ ] `BracketForm` — shadcn/ui `Form` com `Select` para faixa, `Input` para pesos
- [ ] `EligibleCompetitorsList` — shadcn/ui `Checkbox` + `Table`
- [ ] `BracketTree` — visualização responsiva (CSS Grid + shadcn/ui `Card`)
- [ ] `BracketCard` — shadcn/ui `Card` com ícones

**6.4 — Páginas**
- [ ] `src/app/brackets/page.tsx`
- [ ] `src/app/brackets/[id]/page.tsx`
- [ ] `src/app/brackets/[id]/referee/page.tsx`

**Critério de aceite:** Criação de chave funcional, bracket gerado corretamente, erro se menos de 2 competidores.

---

### FASE 7 — Módulo de Áreas de Luta e Lutas Casadas

**Objetivo:** Gerenciar tatames e programar lutas.

#### Tarefas

**7.1 — Hook de Áreas**
- [ ] Criar `src/hooks/useAreas.ts` com operações

**7.2 — Hook de Lutas Casadas**
- [ ] Criar `src/hooks/useMarriedMatches.ts`

**7.3 — Componentes**
- [ ] `AreaCard` — shadcn/ui `Card` com status indicator
- [ ] `AreaForm` — shadcn/ui `Dialog` + `Form`
- [ ] `MatchAssignModal` — shadcn/ui `Dialog` com `Select`
- [ ] `SchedulePanel` — visualização de fila usando shadcn/ui `ScrollArea`
- [ ] `MarriedMatchForm` — shadcn/ui `Form` com `DateTimePicker` customizado
- [ ] `ScheduleView` — grade usando CSS Grid + shadcn/ui `Card`

**7.4 — Páginas**
- [ ] `src/app/areas/page.tsx`
- [ ] `src/app/areas/[id]/schedule/page.tsx`
- [ ] `src/app/married-matches/page.tsx`
- [ ] `src/app/schedule/page.tsx`

**Critério de aceite:** Gerenciamento completo de áreas, programação de lutas, lutas casadas.

---

### FASE 8 — Módulo de Placar

**Objetivo:** Placar interativo com cronômetro e undo.

#### Tarefas

**8.1 — Hook de Cronômetro**
- [ ] Criar `src/hooks/useTimer.ts` com: `elapsed`, `isRunning`, `start`, `pause`, `reset`, `setDuration`
- [ ] Usar `useRef` + `setInterval` — **sem persistência entre abas**
- [ ] Apenas estado em memória durante a luta ativa

**8.2 — Hook de Placar**
- [ ] Criar `src/hooks/useScoreboard.ts` com: `match`, `addPoints`, `addAdvantage`, `addPenalty`, `undo`, `finishMatch`
- [ ] Implementar histórico de ações (stack) para suporte a `undo`
- [ ] Ao chamar `finishMatch`: persistir resultado via API, atualizar bracket

**8.3 — Componentes**
- [ ] `ScorePanel` — shadcn/ui `Card` com design otimizado para TV
- [ ] `ScoreButton` — shadcn/ui `Button` com ícones Lucide
- [ ] `TimerDisplay` — componente com `font-mono` e tamanho responsivo
- [ ] `TimerControls` — shadcn/ui `Button` com ícones
- [ ] `AreaSelector` — shadcn/ui `Select`
- [ ] `FinishMatchModal` — shadcn/ui `Dialog` com opções de finalização
- [ ] `UndoButton` — botão específico para desfazer última ação

**8.4 — Páginas**
- [ ] `src/app/scoreboard/page.tsx`
- [ ] `src/app/scoreboard/[areaId]/page.tsx` — layout fullscreen

**Critério de aceite:** Placar funcional, undo funcionando, cronômetro funciona sem persistência entre abas.

---

### FASE 9 — Dashboard, Resultados e Exportação

**Objetivo:** Refinamento do dashboard, relatórios finais e funcionalidades de exportação/importação.

#### Tarefas

**9.1 — Refinamento do Dashboard**
- [ ] Integrar estatísticas reais (competidores, chaves, lutas, áreas)
- [ ] Exibir torneio ativo e status

**9.2 — Página de Resultados**
- [ ] `src/app/results/page.tsx` — shadcn/ui `Tabs` para: Pódios, Histórico por Área, Sumário de Árbitros, Estatísticas
- [ ] Botão "Finalizar Torneio" — gera relatório completo e muda status para COMPLETED

**9.3 — Exportação e Importação**
- [ ] `src/app/results/export/page.tsx`
- [ ] `src/app/import/page.tsx`
- [ ] Lógica de merge/consolidação baseada em timestamps e UUIDs

**9.4 — Tratamento de Erros**
- [ ] Toast do Sonner para feedback de operações
- [ ] Empty states com ícones Lucide
- [ ] Loading skeletons (shadcn/ui `Skeleton`)

**9.5 — Testes Unitários**
- [ ] Testes para `generateBracket` (casos: 2, 3, 4, 5, 8 competidores — erro com 1)
- [ ] Testes para `advanceBracket`
- [ ] Testes para lógica de pontuação e undo
- [ ] Testes para `calculatePlacements`

---

## Componentes Shadcn/ui a Serem Utilizados

| Componente | Uso |
|---|---|
| `Button` | Todas as ações do sistema |
| `Card` | Dashboard, listagens, ScorePanel |
| `Dialog` | Formulários modais |
| `Form` | Todos os formulários com validação |
| `Input` | Campos de texto, busca, filtros |
| `Select` | Seleção de faixa, área, árbitro |
| `Table` | Listas de competidores, árbitros, chaves |
| `Tabs` | Navegação na página de resultados |
| `Toast` / `Sonner` | Notificações de sucesso/erro |
| `Badge` | Status, faixas |
| `Checkbox` | Seleção de competidores elegíveis |
| `ScrollArea` | Listas longas, fila de lutas |
| `Skeleton` | Loading states |
| `NavigationMenu` | Navbar principal |
| `Separator` | Divisão entre seções |
| `Tooltip` | Dicas em botões de ação |

---

## Ícones Lucide a Serem Utilizados

| Ícone | Uso |
|---|---|
| `Trophy` | Dashboard, pódio |
| `Users` | Competidores |
| `Swords` | Lutas, chaves |
| `MapPin` | Áreas |
| `Shield` | Árbitros |
| `Clock` | Cronômetro |
| `Plus`, `Minus` | Pontuação |
| `Play`, `Pause`, `RotateCcw` | Controles do cronômetro |
| `Undo` | Desfazer ação |
| `Check` | Confirmar |
| `X` | Cancelar |
| `Trash` | Soft delete |
| `Edit` | Editar |
| `Upload`, `Download` | Importar/Exportar |
| `Calendar` | Datas |
| `Weight` | Categoria de peso |
| `Award` | Faixa/graduação |
| `Flag` | Finalização |
| `LayoutGrid` | Dashboard |
| `List` | Listagens |
| `Settings` | Configurações do torneio |
| `Home` | Home/Dashboard |

---

## Ordem de Entrega Recomendada

```
Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5 → Fase 6 → Fase 7 → Fase 8 → Fase 9
```

**Importante:** A Fase 2 (Tela Inicial) deve ser entregue logo após a Fase 1 para que o cliente já visualize a estrutura completa do sistema.

---

## Riscos e Decisões Abertas

| Risco | Decisão |
|---|---|
| Concorrência de escrita no JSON | Uso de escrita atômica para evitar corrupção |
| Persistência do cronômetro em múltiplas abas | **Não implementar** — pontos são marcados ao vivo, com opção de desfazer |
| Bracket com 1 competidor | Bloquear geração — exibir erro "Mínimo 2 competidores" |
| Competidor excluído que está em bracket ativo | **Soft delete** — impedir reativação, mas manter no histórico |
| Resetar torneio acidentalmente | **Não implementar reset** — dados são imutáveis |
| Tela de placar em TV | Rota `?fullscreen=true` oculta navbar e usa CSS fullscreen |
| Corrupção de JSON por escrita parcial | Write atômico (temp file + rename) |
| Consolidação de dados de múltiplas fontes | Merge strategy baseada em timestamps e UUIDs |
| Acessibilidade | shadcn/ui já fornece componentes acessíveis (Radix UI) |


Novas Informaçoes que precizam ser consideradas na revisão do spec:

precisa ter sempre o fundo branco nos layouts

4. Regras de negócio do competidor
A maior parte das regras da spec de competidor está correta, mas vale ajustar detalhes menores conforme o código:

O enum Belt atual é:
WHITE | GRAY | YELLOW | ORANGE | GREEN | BLUE | PURPLE | BROWN | BLACK
O campo coach é opcional e é armazenado como string | null
registrationDate é gerado automaticamente no backend como ISO string
A validação de peso usa min(0.1) e max(300) no formulário
A validação de idade usa min(4) e max(100) no formulário
A verificação de duplicidade em POST/PUT considera name + team + isActive
Esses pontos estão OK, mas recomendo incluir no spec a forma exata de persistência que é implementada hoje.

5. Endpoint e filtros atuais
Documentar corretamente a API atual:

GET /api/competitors?name=&belt=&team=&showInactive=true
POST /api/competitors
PUT /api/competitors/:id
DELETE /api/competitors/:id (soft delete)
Isso fica mais alinhado com o código atual do que a spec geral de múltiplos módulos.

6. Melhorar a separação entre “implementado” e “planejado”
A spec atual mistura:

funcionalidades já feitas
funcionalidades planejadas para o futuro
Seria útil separar em seções:

Funcionalidades atuais
Funcionalidades planejadas
Roadmap
Assim a documentação não dá a impressão de que todo o projeto já está pronto.
