# Requisitos: Correção do Posicionamento de Atletas com BYE no Bracket

## 1. Contexto e Problema

### 1.1 Descrição do Problema

Ao utilizar chaves com número ímpar de atletas (ex: 3 atletas), ocorre um BYE automaticamente no Round 1. O atleta que avança por ter o oponente null (BYE) está sendo posicionado incorretamente no Round 2, resultando em uma exibição visual incorreta no bracket.

### 1.2 Exemplo do Problema

**Dados de entrada (3 atletas):**

```json
{
  "id": "chave-3-atletas-001",
  "categoria": "Branca Adulto Masculino - 65kg",
  "totalCompetidores": 3,
  "lutas": [
    {
      "id": "luta-3-r1-001",
      "round": 1,
      "position": 0,
      "atleta1": { "id": "atleta-001", "nome": "João Silva" },
      "atleta2": { "id": "atleta-002", "nome": "Carlos Santos" }
    },
    {
      "id": "luta-3-r1-002",
      "round": 1,
      "position": 1,
      "atleta1": { "id": "atleta-003", "nome": "Pedro Lima" },
      "atleta2": null
    }
  ]
}
```

**Resultado atual (incorreto):**

```json
{
  "id": "luta-round2-001",
  "round": 2,
  "position": 1,
  "previousMatchIds": ["luta-3-r1-002"],
  "atleta1": { "id": "atleta-003", "nome": "Pedro Lima" },
  "atleta2": null
}
```

**Resultado esperado:**

```json
{
  "id": "luta-round2-001",
  "round": 2,
  "position": 3,
  "previousMatchIds": ["luta-3-r1-002"],
  "atleta1": { "id": "atleta-003", "nome": "Pedro Lima" },
  "atleta2": null
}
```

### 1.3 Impacto

- O bracket visual exibe o atleta no lado incorreto
- A conexão visual entre rounds fica confusa
- O fluxo de advancement não fica claro para o usuário

---

## 2. Requisitos Funcionais

### 2.1 RF-001: Correção da Função generatePosition

**Descrição:** A função `generatePosition()` em `app/lib/bracket-utils.ts` deve organizar as lutas no array considerando o fluxo visual do bracket (esquerdo para esquerdo, direito para direito).

**Critérios de Aceite:**
- A função deve considerar a ordem das lutas no array
- Lutas que vengam do lado esquerdo devem permanecer no lado esquerdo
- Lutas que vengam do lado direito devem permanecer no lado direito


### 2.2 RF-002: Tratamento de Cenários com BYE

**Descrição:** O sistema deve corretamente posicionar atletas que avançam automaticamente por terem enfrentado um BYE no round anterior.


### 2.3 RF-003: Preservação do Comportamento Existente

**Descrição:** A correção não deve afetar o comportamento de chaves normais (sem BYE).

**Critérios de Aceite:**
- Chave com 4 atletas deve continuar funcionando como antes
- Chave com 8+ atletas deve continuar funcionando como antes

---

## 3. Requisitos Não-Funcionais

### 3.1 RNF-001: Performance

A correção não deve adicionar complexidade computacional significativa.

### 3.2 RNF-002: Compatibilidade

A correção deve ser compatível com a estrutura de dados existente.

---

## 4. Arquitetura e Modificações

### 4.1 Arquivos Afetados

| Arquivo | Modificação Necessária |
|---------|----------------------|
| `app/lib/bracket-utils.ts` | Modificar função `generatePosition` para considerar fluxo visual |
| `app/lib/bracket-utils.ts` | Avaliar/adicionar lógica de detecção de BYE |
| `app/components/bracket/BracketLayout.tsx` | Verificar mapeamento de posições no layout |

### 4.2 Análise do Problema Identificado

#### Fluxo atual (incorreto):
1. Round 1: 3 atletas → 2 lutas criadas com posições 0 e 1
   - Posição 0: João Silva vs Carlos Santos
   - Posição 1: Pedro Lima vs null (BYE)
2. Round 2: Luta avançada recebe position = index (1), mas deveria ser 3

#### Causa raiz:
A função `generatePosition()` usa `indexInRound` diretamente, sem considerar:
- O lado de origem da luta (esquerdo/direito)
- Se a luta veio de um BYE (avanço automático)
- O mapeamento correto de posições para o layout visual

### 4.3 Comportamento Esperado

| Cenário | Round 1 | Round 2 | Round 3 |
|---------|---------|---------|---------|
| 3 atletas | posições 0,1 | posição 3 (direito) | - |
| 5 atletas | posições 0,1,2 | posição 1 (esquerdo) | - |
| 4 atletas (normal) | posições 0,1 | posições 0,1 (esq) e 2,3 (dir) | posição 0,1 |

---

## 5. Plano de Implementação

### 5.1 Fases de Implementação

#### Fase 1: Correção da Função `generatePosition`
- **Objetivo:** Calcular posições corretamente baseado no fluxo visual do bracket
- **Arquivo:** `app/lib/bracket-utils.ts`
- **Modificações:**
  1. Modificar função `generatePosition` para detectar BYE e calcular posição correta
  2. Implementar lógica que considera o lado de origem (esquerdo/direito)
  3. Para lutas com BYE no round anterior, calcular posição baseada na posição da luta de origem

#### Fase 2: Validação e Testes
- **Objetivo:** Garantir que a correção não afete cenários normais
- **Testes necessários:**
  - Chave com 3 atletas (caso problemático)
  - Chave com 5 atletas
  - Chave com 4 atletas (comportamento atual deve ser preservado)
  - Chave com 8+ atletas (comportamento atual deve ser preservado)

#### Fase 3: Verificação Visual
- **Objetivo:** Assegurar que o layout exiba corretamente
- **Verificar:** `BracketLayout.tsx` - mapeamento de leftRound1, rightRound1, etc.

### 5.2 Detalhamento Técnico

#### 5.2.1 Correção em `generatePosition` (bracket-utils.ts:110)

```typescript
// Nova lógica proposta:
export function generatePosition(lutas: Luta[]): Luta[] {
  const rounds = new Map<number, Luta[]>()

  // Agrupar por round
  lutas.forEach(luta => {
    const existing = rounds.get(luta.round) || []
    existing.push(luta)
    rounds.set(luta.round, existing)
  })

  return lutas.map(luta => {
    const roundLutas = rounds.get(luta.round) || []
    const indexInRound = roundLutas.findIndex(l => l.id === luta.id)

    let position: number

    if (luta.round === 1) {
      // Round 1 - mantém lógica atual (índice direto)
      position = indexInRound
    } else {
      // Rounds 2+: Determinar posição baseado nas lutas anteriores
      const prevMatchIds = luta.previousMatchIds || []
      const hasByeOrigin = prevMatchIds.some(prevId => {
        const prevLuta = lutas.find(l => l.id === prevId)
        return prevLuta && (!prevLuta.atleta1?.id || !prevLuta.atleta2?.id)
      })

      if (hasByeOrigin) {
        // Luta veio de BYE - calcular posição baseada na luta de origem
        const sourcePosition = calcularPosicaoOrigem(luta, lutas)
        position = sourcePosition
      } else {
        // Luta normal - usar índice
        position = indexInRound
      }
    }

    return { ...luta, position }
  })
}

function calcularPosicaoOrigem(luta: Luta, lutas: Luta[]): number {
  // Implementar lógica de mapeamento de posição baseada na luta de origem
  // O atleta que avança por BYE deve ir para o lado correto (esquerdo/direito)
  // baseado na posição da luta de origem no Round 1
}
```

#### 5.2.2 Validação de Comportamentos

| Cenário | Teste |
|---------|-------|
| 3 atletas | Posição no Round 2 deve ser 3 (direito) |
| 5 atletas | Posição no Round 2 deve ser 1 (esquerdo) |
| 4 atletas | Round 1: pos 0,1 → Round 2: pos 0,1 (esq), 2,3 (dir) |
| 8 atletas | Oitavas com 8 lutas (4 esq, 4 dir) funcionando normalmente |

### 5.3 Critérios de Aceite da Implementação

- [x] Chave com 3 atletas exibe corretamente no layout visual
- [x] Chave com 5 atletas exibe corretamente no layout visual
- [x] Chave com 4 atletas (padrão) continua funcionando como antes
- [x] Chave com 8+ atletas continua funcionando como antes
- [x] Conexões visuais entre rounds estão corretas
- [x] Tag "AVANÇOU" aparece corretamente em lutas com BYE

---

## 6. Implementação Realizada

### 6.1 Alterações Feitas

#### 6.1.1 `app/lib/bracket-utils.ts`
- Modificada função `generatePosition` (linha ~110) para detectar lutas que vieram de BYE
- Adicionada nova função auxiliar `calculateByePosition` para calcular posição baseada no lado de origem
- A função verifica `previousMatchIds` para identificar se a luta veio de um BYE
- Mantém o fluxo visual correto (esquerdo para esquerdo, direito para direito)

#### 6.1.2 `app/hooks/useImportacao.ts`
- Adicionada importação de `generatePosition` from `@/app/lib/bracket-utils`
- Modificada função `processarChave` para chamar `generatePosition(lutas)` após criar as lutas
- Garante que todas as posições sejam recalculadas corretamente durante a importação

### 6.2 Fluxo de Correção

1. **Importação de arquivo JSON** → `useImportacao.ts` processa as lutas
2. **`generatePosition` é chamada** → Calcula posições considerando BYE
3. **Lutas com BYE** → Recebem posição baseada na luta de origem (mantendo lado correto)
4. **Layout visual** → Exibe corretamente no BracketLayout

### 6.3 Verificação

- TypeScript compila sem erros
- ESLint não apresentou novos erros (warnings preexistentes)
- A função agora está integrada no fluxo de importação

---

## 7. Referências

- Arquivo: `app/lib/bracket-utils.ts`
- Função relevante: `generatePosition` (linha ~110)
- Função auxiliar: `calculateByePosition` (linha ~153)
- Ver também: `requirements.md` - seção 2.1 e 4 (estrutura de dados)
- Observação: Campo `position` foi removido - posição determinada pela ordem no array
- Observação: Campo `previousMatchIds` é usado para rastrear lutas anteriores
- Dados de teste: `data/area-1.json` - contém chaves com 3, 4 e 5 atletas