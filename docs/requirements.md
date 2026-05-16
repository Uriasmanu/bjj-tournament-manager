# Requisitos do Sistema - BJJ Tournament Manager

**Versão:** 3.0
**Data:** 2026-05-16
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

## 2. Armazenamento de Dados (JSON)

O sistema utiliza **JSON** como formato principal para armazenamento e persistência de dados das competições.

### Estrutura de Arquivos

**Pasta `data/`:**
```
data/
├── area-1.json       # Dados da Área 1
├── area-2.json      # Dados da Área 2
└── ...
```

**Estrutura do JSON por Área:**
```json
{
  "area": "Área 1",
  "criadoEm": "2026-05-16T10:00:00Z",
  "chaves": [
    {
      "id": 1,
      "categoria": "Branca Infantil",
      "lutas": [
        {
          "id": 1,
          "round": 1,
          "atleta1": {
            "nome": "João Silva",
            "faixa": "Branca",
            "equipe": "Team Brasil"
          },
          "atleta2": {
            "nome": "Maria Santos",
            "faixa": "Branca",
            "equipe": "Team São Paulo"
          },
          "resultado": {
            "pontosAtleta1": 4,
            "pontosAtleta2": 2,
            "vantagensAtleta1": 1,
            "vantagensAtleta2": 0,
            "penalidadesAtleta1": 0,
            "penalidadesAtleta2": 1,
            "tempoDecorrido": 180,
            "finalizacao": false,
            "desclassificacao": null,
            "vencedor": "atleta1",
            "status": "concluida"
          },
          "arbitro": "João Arbito",
          "dataLuta": "2026-05-16T14:30:00Z"
        }
      ],
      "vencedor": "João Silva",
      "status": "concluida"
    }
  ]
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

---

## 5. Estrutura de Pastas

```
app/
├── page.tsx                  # Tela inicial (seleção)
├── layout.tsx                # Layout raiz
├── globals.css               # Estilos globais
├── admin/                    # Painel administrativo
│   ├── page.tsx             # Dashboard admin
│   ├── layout.tsx           # Layout admin
│   └── matches/             # Controle de lutas
│       └── page.tsx         # Página de pontuação
├── scoreboard/              # Interface de placar
│   ├── setup/               # Pré-placar (importação de chaves)
│   │   └── page.tsx         # Configuração de luta
│   ├── page.tsx             # Placar principal
│   └── layout.tsx           # Layout scoreboard
└── components/
    ├── Timer.tsx            # Componente de cronômetro
    └── scoreboard/          # Componentes do placar

data/                        # Dados persistidos (JSON)
└── [area-nome].json         # Arquivos de área

docs/
├── requirements.md          # Este documento
└── roadmap.md               # Plano de implementação
```

---

## 6. Fluxo do Sistema

### 6.1 Início do Torneio

1. **Definir Área**: Organizador define o nome da área (ex: "Área 1") - **não editável depois**
2. **Importar Chaves**: Organizador importa arquivos JSON com as chaves de luta
3. **Carregar na Área**: JSONs são salvos em `data/area-[nome].json`

### 6.2 Durante o Torneio

1. **Selecionar Chave**: Árbitro seleciona uma chave da lista
2. **Editar Árbitro**: Pode editar o nome do árbitro para a luta
3. **Iniciar Luta**: Redireciona para `/scoreboard` com dados da luta

### 6.3 Durante a Luta

1. **Registrar Pontos**: Árbitros registram montada (4), passagem (3), queda (2)
2. **Vantagens/Punições**: Contador de vantagens e penalidades
3. **Cronômetro**: Contagem regressiva com controle
4. **Finalização**: Botão discreto para marcar finalização (submissão/knockout)
5. **Desclassificação**: Botão discreto para desclassificar atleta

### 6.4 Finalização da Luta

1. Clicar em "Finalizar Luta"
2. Sistema determina vencedor:
   - Se finalização → atleta que finalizou vence
   - Se desclassificação → outro atleta vence
   - Se nenhum → quem tiver mais pontos + vantagens vence
3. JSON da área é atualizado com resultado
4. Download do JSON individual da luta

### 6.5 Conclusão da Chave

- Todas as lutas processadas
- Exportar JSON da área com todos os resultados

---

## 7. Histórias de Usuário

### HU-001: Tela de Seleção de Entrada

**Como** usuário do sistema,
**Eu quero** ver uma tela inicial que me permita escolher entre acessar o painel de administração ou a tela de placar,
**Para** que eu possa navegar facilmente para a função desejada.

**Critérios de Aceitação:**
- [x] Dois botões grandes e claramente identificáveis
- [x] Botão "Administração" redireciona para `/admin`
- [x] Botão "Placar" redireciona para `/scoreboard/setup`

---

### HU-002: Tela de Pré-Placar (Setup de Área)

**Como** organizador/árbitro,
**Eu quero** configurar a área de luta e importar as chaves de luta,
**Para** que o sistema esteja preparado para o torneo.

**Critérios de Aceitação:**
- [ ] Campo para definir nome da área (apenas uma vez, no início)
- [ ] Botão para importar múltiplos arquivos JSON de chaves de luta
- [ ] Lista de chaves importadas comvisualização
- [ ] Cada chave mostra: categoria, número de lutas, status
- [ ] Botão para editar nome do árbitro em cada luta
- [ ] Botão "Iniciar Luta" para cada par de atletas
- [ ] Botão para exportar JSON da área (ao final de todas as lutas)
- [ ] Ao exportar, gerar JSON completo com todos os resultados

---

### HU-003: Cronômetro de Luta

**Como** árbitro,
**Eu quero** controlar o tempo de luta com contagem regressiva,
**Para** que a luta tenha duração definida e controlada.

**Critérios de Aceitação:**
- [x] Tempos predefinidos: Select com opções de 2, 5, 6 e 10 minutos
- [x] Configuração manual: Campos de minutos e segundos
- [x] Contagem regressiva automática
- [x] Controles: Iniciar/Parar, Reiniciar
- [x] Alerta visual nos últimos 10 segundos (vermelho)
- [x] Reiniciar zera todos os pontos também

---

### HU-004: Sistema de Pontuação

**Como** árbitro,
**Eu quero** registrar e controlar a pontuação dos lutadores,
**Para** que o placar reflita corretamente o andamento da luta.

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

---

### HU-005: Placar em Tempo Real

**Como** espectador ou atleta,
**Eu quero** visualizar o placar em tempo real,
**Para** acompanhar o andamento da luta durante a competição.

**Critérios de Aceitação:**
- [x] Layout otimizado para telão/projetor
- [x] Atleta 1 (Azul) na metade superior
- [x] Atleta 2 (Branco) na metade inferior
- [x] Header com área de luta e nome do árbitro
- [x] Cronômetro flutuante centralizado
- [x] Nomes, equipes e faixas dos lutadores
- [x] Pontuação individual e total
- [x] Vantagens e punições
- [x] Botão "Voltar" no header
- [x] Botão "Editar Lutadores" (modal)
- [x] Botão "Finalizar Luta" com confirmação

---

### HU-006: Finalização e Desclassificação

**Como** árbitro,
**Eu quero** marcar se houve finalização ou desclassificação,
**Para** que o sistema determine corretamente o vencedor.

**Critérios de Aceitação:**
- [ ] Botão discreto de **Finalização** no placar (para cada atleta)
- [ ] Ao clicar em Finalização do lado do atleta → marcar como campeão por finalização
- [ ] Botão discreto de **Desclassificação** no placar (para cada atleta)
- [ ] Ao clicar em Desclassificação → outro atleta vence automaticamente
- [ ] Lógica de determinação do vencedor:
  1. Se finalização → vence quem finalizou
  2. Se desclassificação → vence o outro
  3. Se nenhum → vence quem tiver mais pontos + vantagens

---

### HU-007: Persistência de Dados

**Como** organizador,
**Eu quero** que os dados sejam salvos automaticamente,
**Para** que não perca informações em caso de refresh ou erro.

**Critérios de Aceitação:**
- [ ] Ao clicar em "Finalizar Luta", atualizar JSON da área com:
  - Pontuações finais
  - Tempo decorrido
  - Nome do árbitro
  - Status (concluida)
  - Vencedor determinado
  - Se houve finalização ou desclassificação
- [ ] Dados salvos em `data/area-[nome].json`
- [ ] Ao exportar, gerar JSON completo de todas as chaves e resultados

---

## 8. Estrutura do JSON de Resultado (por luta)

```json
{
  "id": 1,
  "categoria": "Branca Infantil",
  "round": 1,
  "atleta1": {
    "nome": "João Silva",
    "faixa": "Branca",
    "equipe": "Team Brasil"
  },
  "atleta2": {
    "nome": "Maria Santos",
    "faixa": "Branca",
    "equipe": "Team São Paulo"
  },
  "resultado": {
    "pontosAtleta1": 4,
    "pontosAtleta2": 2,
    "vantagensAtleta1": 1,
    "vantagensAtleta2": 0,
    "penalidadesAtleta1": 0,
    "penalidadesAtleta2": 1,
    "tempoDecorrido": 180,
    "finalizacao": true,
    "desclassificacao": null,
    "vencedor": "atleta1",
    "tipoVitoria": "finalizacao",
    "status": "concluida"
  },
  "arbitro": "João Arbito",
  "dataLuta": "2026-05-16T14:30:00Z"
}
```

---

## 9. Glossário de Termos

| Termo | Definição |
|-------|-----------|
| Chave de Luta | Conjunto de confrontos de uma categoria |
| Área de Luta | Local físico onde ocorre a luta (definido no início) |
| Finalização | Vitória por submissão ou knockout (prioridade máxima) |
| Desclassificação | Eliminação por infração (outro atleta vence) |
| Pontos + Vantagens | Critério de desempate após finalização |
| Exportar Área | Gerar JSON completo com todos os resultados |

---

*Documento atualizado em: 2026-05-16*
*Versão: 3.0*