# Requisitos do Sistema - BJJ Tournament Manager

**Versão:** 2.0
**Data:** 2026-05-16
**Projeto:** Sistema de Gerenciamento de Competições de Jiu-Jitsu Brasileiro

---

## 1. Visão Geral

| Campo | Valor |
|-------|-------|
| Nome do Projeto | BJJ Tournament Manager |
| Tipo | Aplicação Web (SPA) |
| Resumo | Sistema de gerenciamento de competições de Jiu-Jitsu Brasileiro com duas interfaces: painel administrativo para árbitros e placar em tempo real para exibição pública |
| Público-alvo | Árbitros, organizadores, atletas e espectadores de competições de Jiu-Jitsu |

---

## 2. Armazenamento de Dados

O sistema utiliza **JSON** como formato principal para importação de dados.

### Estruturas de Dados (JSON)

**Arquivo de Chave de Luta:**
```json
{
  "categoria": "Branca Infantil",
  "luta": {
    "atleta1": {
      "nome": "João Silva",
      "equipe": "Team Brasil"
    },
    "atleta2": {
      "nome": "Maria Santos",
      "equipe": "Team São Paulo"
    }
  }
}
```

---

## 3. Stack Tecnológico

| Componente | Tecnologia | Versão |
|------------|------------|--------|
| Framework | Next.js | 16.2.6 |
| UI | React | 19.2.4 |
| Estilização | Tailwind CSS | 4.x |
| Componentes | Shadcn UI | latest |
| Ícones | Lucide React | latest |
| Linguagem | TypeScript | 5.x |

---

## 4. Paleta de Cores

| Cor | Hexadecimal | Uso |
|-----|-------------|-----|
| Azul Anil | `#4338CA` | Cor primária, botões principais, highlights |
| Preto | `#0A0A0A` | Fundos principais, sidebars, áreas de destaque |
| Branco | `#FFFFFF` | Cards, áreas de conteúdo, texto em fundos escuros |
| Dourado | `#D4AF37` | Destaques especiais, títulos, elementos premium |

### Aplicação

- **Azul Anil**: Interface principal, botões, ícones ativados
- **Preto**: Fundos escuros, navegação
- **Branco**: Conteúdo, cards, elementos claros
- **Dourado**: Títulos importantes, indicações de vitória

---

## 5. Estrutura de Pastas

```
app/
├── page.tsx                      # Tela inicial (seleção)
├── layout.tsx                    # Layout raiz
├── globals.css                   # Estilos globais
├── admin/                        # Painel administrativo
│   ├── page.tsx                  # Dashboard admin
│   ├── layout.tsx                # Layout admin
│   └── matches/                  # Controle de lutas
│       └── page.tsx              # Página de pontuação
├── scoreboard/                   # Interface de placar
│   ├── setup/                    # Pré-placar (importação)
│   │   └── page.tsx              # Configuração de luta
│   ├── page.tsx                  # Placar principal
│   └── layout.tsx                # Layout scoreboard
└── components/
    ├── Timer.tsx                 # Componente de cronômetro
    └── scoreboard/              # Componentes do placar
        ├── AtletaCard.tsx        # Card do atleta
        ├── ScoreButton.tsx      # Botão de pontuação
        ├── VantagemPunicao.tsx  # Contador V/P
        ├── TotalScore.tsx       # Pontuação total
        └── ScoreHeader.tsx      # Header área/árbitro

docs/
├── requirements.md              # Este documento
├── roadmap.md                   # Plano de implementação
└── user-stories.md             # Histórias detalhadas
```

---

## 6. Histórias de Usuário

### HU-001: Tela de Seleção de Entrada

**Como** usuário do sistema,
**Eu quero** ver uma tela inicial que me permita escolher entre acessar o painel de administração ou a tela de placar,
**Para** que eu possa navegar facilmente para a função desejada.

**Critérios de Aceitação:**
- [x] Dois botões grandes e claramente identificáveis
- [x] Botão "Administração" redireciona para `/admin`
- [x] Botão "Placar" redireciona para `/scoreboard/setup`
- [x] Interface responsiva (mobile-first)
- [x] Ícones representativos (settings para admin, timer para placar)
- [x] Design profissional para ambiente de competição

---

### HU-002: Tela de Pré-Placar (Configuração)

**Como** organizador/árbitro,
**Eu quero** carregar os dados da luta via JSON e configurar a área e árbitro,
**Para** que o placar exiba as informações corretas.

**Critérios de Aceitação:**
- [x] Botão para importar arquivo JSON da chave de luta
- [x] Campo para registrar número/nome da área de luta
- [x] Campo para registrar nome do árbitro responsável
- [x] Exibição de preview dos dados importados
- [x] Validação de JSON com mensagem de erro clara
- [x] Botão "Iniciar Placar" redireciona para `/scoreboard` com dados na URL
- [x] Botão "Criar Luta Manual" para configuração rápida

**Fluxo:**
1. Usuário acessa `/scoreboard/setup`
2. Importa arquivo JSON da chave de luta (ou cria manualmente)
3. Preenche área e nome do árbitro
4. Clica em "Iniciar Placar"
5. Sistema redireciona para `/scoreboard` com dados via URL params

---

### HU-003: Cronômetro de Luta

**Como** árbitro,
**Eu quero** controlar o tempo de luta com contagem regressiva,
**Para** que a luta tenha duração definida e controlada.

**Critérios de Aceitação:**
- [x] **Tempos predefinidos**: Select com opções de 2, 5, 6 e 10 minutos
- [x] **Configuração manual**: Campos de minutos e segundos para definir tempo customizado
- [x] Inicia em contagem regressiva automática
- [x] Controles: Iniciar/Parar, Reiniciar
- [x] **Alerta visual**: Cronômetro fica vermelho nos últimos 10 segundos
- [x] Display grande e visível (centralizado na tela)
- [x] **Reset integrado**: Botão "Reiniciar" zera cronômetro E todos os pontos/punições

---

### HU-004: Sistema de Pontuação

**Como** árbitro,
**Eu quero** registrar e controlar a pontuação dos lutadores,
**Para** que o placar reflita corretamente o andamento da luta.

**Critérios de Aceitação:**
- [x] **Categorias de pontuação detalhadas**:
  - Montada / Pegada nas Costas = **4 pontos**
  - Passagem de Guarda = **3 pontos**
  - Queda, Raspagem, Joelho na barriga = **2 pontos**
- [x] **Botões de incremento/decremento** para cada categoria
- [x] Valores começam em **0** e atualizam individualmente
- [x] **Pontuação total** calculada automaticamente (montada + passagem + queda)
- [x] Contador de **vantagens** (+1/-1) com botão próprio
- [x] Contador de **penalidades/punições** (-1/+1) com botão próprio
- [x] **Punições sempre vermelhas** (bg-red-600) para ambos atletas
- [x] Exibição: nome do atleta, equipe

---

### HU-005: Placar em Tempo Real

**Como** espectador ou atleta,
**Eu quero** visualizar o placar em tempo real,
**Para** acompanhar o andamento da luta durante a competição.

**Critérios de Aceitação:**
- [x] Layout otimizado para telão/projetor (tela cheia, alto contraste)
- [x] **Atleta 1 (Azul)**: exibido na metade superior da tela
- [x] **Atleta 2 (Branco)**: exibido na metade inferior da tela
- [x] Header fixo no topo com área de luta e nome do árbitro
- [x] Cronômetro flutuante centralizado verticalmente
- [x] Nomes dos lutadores em fonte grande e preta
- [x] Equipes exibidas abaixo dos nomes
- [x] Pontuação individual de cada categoria
- [x] Pontuação total grande e visível
- [x] Contadores de vantagens e punições
- [x] Botão "Reiniciar" zera todo o estado (pontos, tempo, vantagens, punições)

---

## 7. Estrutura do Placar (Detalhada)

### Layout Visual

```
┌─────────────────────────────────────────────────────────────┐
│  ÁREA 1                                    Árbitro: João   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ATLETA 1 (AZUL)                                      │   │
│  │ Equipe: Team Brasil                                  │   │
│  │                                                      │   │
│  │ [Montada 4pts] [Passagem 3pts] [Queda 2pts] [V|P]  │   │
│  │    +4 -4        +3 -3         +2 -2        +/-  +/- │   │
│  │                                                      │   │
│  │                              TOTAL: 00               │   │
│  └─────────────────────────────────────────────────────┘   │
│              ┌────────────────────────┐                    │
│              │       05:00            │                    │
│              │  [Iniciar] [Reiniciar] │                    │
│              │  [Select] [Manual]     │                    │
│              └────────────────────────┘                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ATLETA 2 (BRANCO)                                   │   │
│  │ Equipe: Team São Paulo                             │   │
│  │                                                      │   │
│  │ [Montada 4pts] [Passagem 3pts] [Queda 2pts] [V|P]  │   │
│  │    +4 -4        +3 -3         +2 -2        +/-  +/- │   │
│  │                                                      │   │
│  │                              TOTAL: 00               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Componentes do Placar

| Componente | Descrição |
|------------|-----------|
| ScoreHeader | Exibe área e árbitro no topo |
| AtletaCard | Container doatleta com nome, equipe e pontuação |
| ScoreButton | Botões +/-, label e valor atual da categoria |
| VantagemPunicao | Contadores de vantagem (amarelo) e punição (vermelho) |
| TotalScore | Exibição da pontuação total |
| ScoreboardTimer | Cronômetro com controles e configurações |

---

## 8. Requisitos Não Funcionais

### 8.1 Performance

- Tempo de carregamento inicial < 3 segundos
- Atualização instantânea da pontuação (state local)

### 8.2 Usabilidade

- Interface otimizada para telão (fonte grande, alto contraste)
- Layout responsivo para diferentes tamanhos de tela
- Feedback visual claro nas interações
- Botões com tamanho adequado para toque

### 8.3 Manutenibilidade

- Componentes React reutilizáveis
- Código modular e bem estruturado
- Tipos TypeScript definidos

---

## 9. Glossário de Termos

| Termo | Definição |
|-------|-----------|
| Chave de Luta | JSON contendo a estrutura de confrontos de uma categoria |
| Área de Luta | Local físico onde ocorre a luta (ex: "Área 1", "Quadra A") |
| Montada | Posição de controle nas costas do oponente (4 pontos) |
| Passagem de Guarda | Técnica de passar a guarda do oponente (3 pontos) |
| Queda/Raspagem | Técnicas de chão básicas (2 pontos) |
| Vantagem | Ponto menor dado por proximidade de pontuação |
| Punição | Penalidade por infração (fuga, falta de competição) |
| Reset | Botão que zera todo o estado da luta |

---

*Documento atualizado em: 2026-05-16*
*Versão: 2.0*