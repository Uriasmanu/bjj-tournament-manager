# Requisitos do Sistema - BJJ Tournament Manager

**Versão:** 5.0
**Data:** 2026-05-17
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

### 2.1 Componentes UI
- **OBRIGATÓRIO**: Usar sempre componentes do **Shadcn UI** nas implementações
- Componentes disponíveis: Button, Card, Dialog, Input, Select, Toast, etc.
- Localização: `@/components/ui/`

### 2.2 Botões com Fundo Branco
- **OBRIGATÓRIO**: Quando um botão tiver fundo branco (#FFFFFF), o texto deve ser obrigatoriamente escuro (#000000 ou similar)
- Isso garante contraste e acessibilidade

### 2.3 Layout Responsivo
- O sistema deve funcionar em desktop e dispositivos móveis
- Layout otimizado para telão/projetor no scoreboard

---

## 3. Armazenamento de Dados (JSON)

O sistema utiliza **JSON** como formato principal para armazenamento e persistência de dados das competências.

### Estrutura de Arquivos

**Pasta `data/`:**
```
data/
├── area-1.json       # Dados da Área 1
├── area-2.json      # Dados da Área 2
└── ...
```

### API REST

O sistema expõe uma API para manipulação de dados:

| Método | Endpoint | Descrição |
|--------|-----------|------------|
| GET | `/api/area?area=NOME` | Retorna dados de uma área |
| POST | `/api/area` | Cria/sobrescreve dados de uma área |
| PUT | `/api/area` | Atualiza dados de uma área (mantém existentes) |
| DELETE | `/api/area?area=NOME` | Remove arquivo da área |

---

## 4. Estrutura de Dados

### Tipos TypeScript

```typescript
// Atleta
interface Atleta {
  nome: string
  equipe: string
  faixa?: string
}

// Resultado da Luta
interface ResultadoLuta {
  // Pontuação total
  pontosAtleta1: number
  pontosAtleta2: number
  
  // Detalhamento de pontos por tipo
  montadasAtleta1: number     // 4 pontos cada
  montadasAtleta2: number
  passagensAtleta1: number     // 3 pontos cada
  passagensAtleta2: number
  quedasAtleta1: number       // 2 pontos cada
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
}

// Luta
interface Luta {
  id: number
  round: number
  atleta1: Atleta
  atleta2: Atleta
  resultado?: ResultadoLuta
  arbitro?: string
  dataLuta?: string
}

// Chave de Luta
interface ChaveLuta {
  categoria: string
  lutas: Luta[]
  arbitro?: string
  vencedor?: string
  status: "pendente" | "em_andamento" | "concluida"
}

// Dados da Área
interface DadosArea {
  area: string
  criadoEm: string
  atualizadoEm?: string
  chaves: ChaveLuta[]
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
│   └── index.ts             # Interfaces e tipos
├── hooks/                    # Hooks personalizados
│   ├── useStorage.ts         # Persistência (API)
│   └── useImportacao.ts     # Importação de JSONs
├── api/                      # Rotas de API
│   └── area/
│       └── route.ts         # API REST de área
├── admin/                    # Painel administrativo
│   ├── page.tsx             # Dashboard admin
│   ├── layout.tsx           # Layout admin
│   └── matches/             # Controle de lutas
│       └── page.tsx         # Página de pontuação
├── scoreboard/              # Interface de placar
│   ├── setup/               # Pré-placar (importação de chaves)
│   │   └── page.tsx         # Configuração de área
│   ├── page.tsx             # Placar principal
│   └── layout.tsx           # Layout scoreboard
└── components/
    ├── ui/                  # Componentes Shadcn
    │   ├── button.tsx
    │   ├── card.tsx
    │   ├── dialog.tsx
    │   ├── input.tsx
    │   └── ...
    ├── Timer.tsx            # Componente de cronômetro
    └── scoreboard/          # Componentes do placar
        ├── AtletaCard.tsx
        ├── ScoreHeader.tsx
        ├── ScoreButton.tsx
        ├── VantagemPunicao.tsx
        ├── AdicionarLutaModal.tsx
        └── ...
    └── setup/               # Componentes do setup
        ├── AreaCard.tsx
        ├── ImportacaoCard.tsx
        ├── ChaveList.tsx
        └── ...

data/                        # Dados persistidos (JSON)
└── [area-nome].json         # Arquivos de área

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

1. **Definir Área**: Organizador define o nome da área (ex: "Área 1") - **não editável depois**
2. **Importar Chaves**: Organizador importa arquivos JSON com as chaves de luta
3. **Carregar na Área**: JSONs são salvos em `data/[area].json` via API

### 8.2 Durante o Torneio

1. **Selecionar Chave**: Árbitro seleciona uma chave da lista
2. **Selecionar Luta**: Escolher qual luta da chave será disputada
3. **Iniciar Luta**: Redireciona para `/scoreboard` com dados da luta

### 8.3 Durante a Luta

1. **Registrar Pontos**: Árbitros registram montada (4), passagem (3), queda (2)
2. **Vantagens/Punições**: Contador de vantagens e penalidades
3. **Cronômetro**: Contagem regressiva com controle, retorna tempo decorrido
4. **Editar Árbitro**: Campo editável no header para nome do árbitro
5. **Desclassificação**: Botão discreto (30% opacity) para desclassificar atleta

### 8.4 Finalização da Luta

1. Clicar em "Finalizar Luta"
2. Modal 1: **Selecionar Vencedor** - escolhe qual atleta venceu
3. Modal 2: **Selecionar Tipo de Vitória** - pontos ou finalização
4. Se DSQ: Modal 1 pergunta qual atleta, Modal 2 pede confirmação antes de salvar
5. JSON da área é atualizado com todos os campos do resultado
6. Status da luta muda para "concluida"

### 8.5 Conclusão da Chave

- Todas as lutas processadas
- Status da chave atualiza automaticamente (pendente → em_andamento → concluida)

---

## 9. Dados Salvos no Resultado

Ao finalizar uma luta, o sistema salva os seguintes dados para auditoria:

| Campo | Descrição |
|-------|-----------|
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

---

## 10. Histórias de Usuário

### HU-001: Tela de Seleção de Entrada

**Critérios de Aceitação:**
- [x] Dois botões grandes e claramente identificáveis
- [x] Botão "Administração" redireciona para `/admin`
- [x] Botão "Placar" redireciona para `/scoreboard/setup`

---

### HU-002: Tela de Pré-Placar (Setup de Área)

**Critérios de Aceitação:**
- [x] Campo para definir nome da área (apenas uma vez, no início)
- [x] Botão para importar múltiplos arquivos JSON de chaves de luta
- [x] Validação: categoria obrigatória, array de lutas não vazio
- [x] Lista de chaves importadas comvisualização
- [x] Cada chave mostra: categoria, número de lutas, status
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
  - Pontuações finais detalhadas (montadas, passagens, quedas)
  - Total de pontos
  - Tempo decorrido
  - Nome do árbitro
  - Status (concluida)
  - Vencedor determinado
  - Tipo de vitória
  - Flags de finalização e desclassificação
- [x] Dados salvos em `data/[area].json` via API REST

---

### HU-008: Nova Luta

**Critérios de Aceitação:**
- [x] Botão "Nova Luta" retorna para tela de seleção de lutas
- [x] Lutas concluídas aparecem com badge verde "Concluída"
- [x] Lutas pendentes têm botão "Iniciar"

---

## 11. Estrutura do JSON de Importação

```json
{
  "categoria": "Branca Infantil",
  "lutas": [
    {
      "id": 1,
      "round": 1,
      "atleta1": {
        "nome": "João Silva",
        "equipe": "Team Brasil"
      },
      "atleta2": {
        "nome": "Maria Santos",
        "equipe": "Team São Paulo"
      }
    }
  ]
}
```

### Regras de Validação
- `categoria` é obrigatório (string não vazia)
- `lutas` é obrigatório (array não vazio)
- Cada luta deve ter `atleta1` e `atleta2` com `nome` e `equipe`
- Árbitros são definidos por chave (opcional), não por luta individual

---

## 12. Glossário de Termos

| Termo | Definição |
|-------|-----------|
| Chave de Luta | Conjunto de confrontos de uma categoria |
| Área de Luta | Local físico onde ocorre a luta (definido no início) |
| Montada | Posição de控制了4 pontos) |
| Passagem | Passagem de guarda (3 pontos) |
| Queda | Queda ou raspagem (2 pontos) |
| Finalização | Vitória por submissão ou knockout (prioridade máxima) |
| Desclassificação (DSQ) | Eliminação por infração (outro atleta vence) |
| Pontos + Vantagens | Critério de desempate após finalização |
| Status da Luta | pendente → em_andamento → concluida |
| Status da Chave | pendente → em_andamento → concluida |

---

## 13. Componentes Shadcn Disponíveis

O sistema utiliza os seguintes componentes do Shadcn UI:

| Componente | Localização | Uso |
|------------|-------------|-----|
| Button | `@/components/ui/button` | Botões principais e ações |
| Card | `@/components/ui/card` | Containers de conteúdo |
| Dialog | `@/components/ui/dialog` | Modais e confirmações |
| Input | `@/components/ui/input` | Campos de texto |
| Select | `@/components/ui/select` | Dropdowns |
| Toast | `@/components/ui/toast` | Notificações |

---

*Documento atualizado em: 2026-05-17*
*Versão: 5.0*