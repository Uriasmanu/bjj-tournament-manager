# Requisitos do Sistema - BJJ Tournament Manager

**Versão:** 1.0
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

## 2. Stack Tecnológico

| Componente | Tecnologia | Versão |
|------------|------------|--------|
| Framework | Next.js | 16.2.6 |
| UI | React | 19.2.4 |
| Estilização | Tailwind CSS | 4.x |
| Componentes | Shadcn UI | latest |
| Ícones | Lucide React | latest |
| Linguagem | TypeScript | 5.x |

---

## 3. Paleta de Cores

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

## 4. Estrutura de Pastas

```
app/
├── page.tsx                      # Tela inicial (seleção)
├── layout.tsx                    # Layout raiz
├── globals.css                   # Estilos globais
├── admin/                        # Painel administrativo
│   ├── page.tsx                  # Dashboard admin
│   └── layout.tsx                # Layout admin
├── scoreboard/                   # Interface de placar
│   ├── setup/                    # Pré-placar (importação)
│   │   └── page.tsx              # Configuração de luta
│   ├── page.tsx                  # Placar principal
│   └── layout.tsx                # Layout scoreboard
└── components/
    ├── ui/                       # Componentes Shadcn
    └── shared/                   # Componentes compartilhados

docs/
├── requirements.md              # Este documento
├── roadmap.md                   # Plano de implementação
└── user-stories.md               # Histórias detalhadas
```

---

## 5. Histórias de Usuário

### HU-001: Tela de Seleção de Entrada

**Como** usuário do sistema,
**Eu quero** ver uma tela inicial que me permita escolher entre acessar o painel de administração ou a tela de placar,
**Para** que eu possa navegar facilmente para a função desejada.

**Critérios de Aceitação:**
- [ ] Dois botões grandes e claramente identificáveis
- [ ] Botão "Administração" redireciona para `/admin`
- [ ] Botão "Placar" redireciona para `/scoreboard/setup`
- [ ] Interface responsiva (mobile-first)
- [ ] Ícones representativos (settings para admin, timer para placar)
- [ ] Design profissional para ambiente de competição

**Wireframe:**
```
┌─────────────────────────────────────┐
│         🏆 BJJ Tournament          │
│                                     │
│   ┌─────────────┐   ┌─────────────┐  │
│   │   ADMIN    │   │   PLACAR    │  │
│   │            │   │            │  │
│   │  Painel de │   │   Exibir    │  │
│   │  Controle  │   │ Resultados  │  │
│   └─────────────┘   └─────────────┘  │
│                                     │
│    Selecione sua área de acesso     │
└─────────────────────────────────────┘
```

---

### HU-002: Tela de Pré-Placar (Configuração)

**Como** organizador/árbitro,
**Eu quero** configurar os dados da luta antes de iniciar o placar,
**Para** que o público veja as informações corretas durante a apresentação.

**Critérios de Aceitação:**
- [ ] Botão para importar arquivo JSON da chave de luta
- [ ] Campo para registrar número/nome da área de luta
- [ ] Campo para registrar nome do árbitro responsável
- [ ] Exibição de preview dos dados importados
- [ ] Validação de JSON com mensagem de erro clara
- [ ] Botão "Iniciar Placar" redireciona para `/scoreboard`

**Fluxo:**
1. Usuário acessa `/scoreboard/setup`
2. Importa arquivo JSON da chave de luta
3. Preenche área e nome do árbitro
4. Clica em "Iniciar Placar"
5. Sistema redireciona para `/scoreboard`

---

### HU-003: Cronômetro de Luta

**Como** árbitro,
**Eu quero** controlar o tempo de luta com contagem regressiva,
**Para** que a luta tenha duração definida e controlada.

**Critérios de Aceitação:**
- [ ] Tempo pode ser configurado manualmente (minutos:segundos)
- [ ] Inicia em contagem regressiva automática
- [ ] Controles: Iniciar, Pausar, Reiniciar
- [ ] Alerta visual nos últimos 30 segundos (mudança de cor)
- [ ] Suporte a lógica de parcial (mestre/penalt)
- [ ] Display grande e visível

---

### HU-004: Sistema de Pontuação

**Como** árbitro,
**Eu quero** registrar e controlar a pontuação dos lutadores,
**Para** que o placar reflita corretamente o andamento da luta.

**Critérios de Aceitação:**
- [ ] Botões de pontuação: 2 pontos, 3 pontos, 4 pontos
- [ ] Contador de vantagens (+1)
- [ ] Contador de penalidades (-1)
- [ ] Botão "Desfazer" para remover última pontuação
- [ ] Histórico das últimas ações (pontos marcados)
- [ ] Exibição: nome do atleta, equipe e categoria (ex: "Faxia Branca Infantil")

---

### HU-005: Placar em Tempo Real

**Como** espectador ou atleta,
**Eu quero** visualizar o placar em tempo real,
**Para** acompanhar o andamento da luta durante a competição.

**Critérios de Aceitação:**
- [ ] Design otimizado para telão/projetor (alto contraste)
- [ ] Exibição de nomes dos lutadores (fonte grande)
- [ ] Exibição de equipes de cada lutador
- [ ] Exibição da categoria da luta
- [ ] Exibição de área e nome do árbitro (topo)
- [ ] Pontuação atual de cada lutador
- [ ] Contador de vantagens e penalidades
- [ ] Cronômetro regressivo visível
- [ ] Layout responsivo (320px até 4K)

---

## 6. Requisitos Não Funcionais

### 6.1 Performance

- Tempo de carregamento inicial < 3 segundos
- Atualização do placar em tempo real < 100ms de latência

### 6.2 Usabilidade

- Interface responsiva para telas de 320px até 4K
- Contraste de cores conforme WCAG 2.1 AA
- Feedback visual claro para todas as interações

### 6.3 Manutenibilidade

- Componentes reutilizáveis
- Código modular e bem estruturado
- Documentação de componentes

---

## 7. Glossário de Termos

| Termo | Definição |
|-------|-----------|
| Chave de Luta | JSON contendo a estrutura de confrontos de uma categoria |
| Área de Luta | Local físico onde ocorre a luta (ex: "Área 1", "Quadra A") |
| Vantagem | Ponto menor dado por proximidade de pontuação |
| Penalidade | Despoint por infração (ex: fuga, falta de competição) |

---

*Documento gerado em: 2026-05-16*
*Versão: 1.0*