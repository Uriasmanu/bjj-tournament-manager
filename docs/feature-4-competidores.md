# Feature: Chave de 4 Competidores — Final Direta e 3º Lugar Automático

**Versão:** 2.0
**Data:** 2026-05-28
**Status:** Proposta

---

## 1. Resumo

Implementar fluxo completo de chaveamento para **exatamente 4 competidores**, com:
- Vencedores do Round 1 avançando **diretamente para o Round 3 (Final)** sem passar por Round 2
- Perdedores do Round 1 recebem o 3° lugar automaticamente, **sem luta de consolação**
- Round 3 sendo a Final com ambos os atletas preenchidos (diferente do comportamento atual onde apenas um lado é populado)

> **Importante:** Esta regra (sem consolação, 3º lugar automático) é **exclusiva para chaves com exatamente 4 competidores**. Chaves com 5 ou mais competidores mantêm o fluxo tradicional com semifinais e luta de consolação.

---

## 2. Comportamento Atual (a ser corrigido)

### 2.1 Estrutura atual

Para uma chave com 4 competidores no formato atual:

```json
{
  "categoria": "Azul Adulto Masculino - 70kg",
  "totalCompetidores": 4,
  "lutas": [
    { "round": 1, "position": 0, "atleta1": "Marcos", "atleta2": "Felipe" },
    { "round": 1, "position": 1, "atleta1": "Guilherme", "atleta2": "Henrique" }
  ]
}
```

### 2.2 Fluxo de avanço atual (código)

A função `getNextPosition()` em `bracket-utils.ts` mapeia:

```
Round 1, position 0 → Round 2, position 0, useAtleta1: true
Round 1, position 1 → Round 2, position 0, useAtleta1: false
Round 2, position 0 → Round 3, position 0, useAtleta1: true
```

### 2.3 Resultado indesejado

```
Round 1: [Marcos vs Felipe]  → Marcos vence → vai para Round 2 atleta1
         [Guilherme vs Henrique] → Henrique vence → vai para Round 2 atleta2

Round 2: [Marcos vs Henrique] → Marcos vence → vai para Round 3 atleta1

Round 3: [Marcos vs ___]  ← APENAS atleta1 preenchido!
```

**Problemas:**
1. Round 2 funciona como "semifinal" mas é uma única luta com ambos vencedores do R1 — não há separação entre semi e final
2. Round 3 (Final) fica **incompleto** — apenas `atleta1` recebe o vencedor, `atleta2` permanece `null`
3. **Não há definição de 3º lugar** — os perdedores (Felipe e Guilherme) não têm luta de consolação nem recebem 3º lugar automaticamente
4. O pódio não consegue derivar corretamente o 3º lugar pois não há semifinais com 2 lutas

---

## 3. Comportamento Desejado

### 3.1 Fluxo alvo

```
Round 1: [Marcos vs Felipe]  → Marcos vence, Felipe perde (3º lugar)
         [Guilherme vs Henrique] → Henrique vence, Guilherme perde (3º lugar)

Após concluir ambas lutas do Round 1:

Round 3 (Final):      [Marcos vs Henrique]  ← vencedores do R1 disputam título
```

### 3.2 Regras de negócio

| # | Regra | Detalhes |
|---|-------|----------|
| RN-4.1 | Vencedor do R1 pos 0 → R3 atleta1 | O vencedor da luta na posição 0 do Round 1 vai diretamente para a Final (Round 3, position 0, `atleta1`) |
| RN-4.2 | Vencedor do R1 pos 1 → R3 atleta2 | O vencedor da luta na posição 1 do Round 1 vai diretamente para a Final (Round 3, position 0, `atleta2`) |
| RN-4.3 | Perdedor do R1 → 3º lugar automático | Os perdedores de ambas as lutas do Round 1 recebem o 3º lugar automaticamente. **Não há luta de consolação (Round 2).** Esta regra é **exclusiva** para chaves com exatamente 4 competidores. |
| RN-4.4 | Round 3 é a Final | O vencedor do Round 3 é o **campeão**, o perdedor é o **vice-campeão** |
| RN-4.5 | Round 3 é criado dinamicamente | Se ainda não existir na chave, é criado durante `advanceWinner()` |
| RN-4.6 | Status da chave | `pendente` → `em_andamento` (após 1ª luta R1 concluída) → `concluida` (apenas quando R3 estiver concluído) |
| RN-4.7 | DSQ no R1 de 4 competidores | Comportamento similar ao DSQ de 3 competidores: atleta desclassificado não avança, o vencedor vai para R3, o desclassificado **não** recebe 3º lugar |

### 3.3 Exemplo completo

**Dados de entrada:**
```json
{
  "categoria": "Azul Adulto Masculino - 70kg",
  "totalCompetidores": 4,
  "lutas": [
    { "round": 1, "position": 0, "atleta1": "Marcos Paulo", "atleta2": "Felipe Dias" },
    { "round": 1, "position": 1, "atleta1": "Guilherme Reis", "atleta2": "Henrique Bastos" }
  ]
}
```

**Passo 1 — Luta 1 (pos 0): Marcos vence Felipe:**
```json
{
  "lutas": [
    { "round": 1, "position": 0, "atleta1": "Marcos", "atleta2": "Felipe", "resultado": { "vencedor": "atleta1", "status": "concluida" } },
    { "round": 1, "position": 1, "atleta1": "Guilherme", "atleta2": "Henrique", "resultado": { "status": "pendente" } },
    // CRIADO DINAMICAMENTE:
    { "round": 3, "position": 0, "atleta1": "Marcos", "atleta2": null, "resultado": { "status": "pendente" } }
  ],
  "status": "em_andamento"
}
```

**Passo 2 — Luta 2 (pos 1): Henrique vence Guilherme:**
```json
{
  "lutas": [
    { "round": 1, "position": 0, "resultado": { "vencedor": "atleta1", "status": "concluida" } },
    { "round": 1, "position": 1, "resultado": { "vencedor": "atleta2", "status": "concluida" } },
    { "round": 3, "position": 0, "atleta1": "Marcos", "atleta2": "Henrique", "resultado": { "status": "pendente" } }
  ],
  "status": "em_andamento"
}
```

**Passo 3 — Final (R3): Marcos vence Henrique:**
```json
{
  "lutas": [
    { "round": 1, "position": 0, "resultado": { "vencedor": "atleta1", "status": "concluida" } },
    { "round": 1, "position": 1, "resultado": { "vencedor": "atleta2", "status": "concluida" } },
    { "round": 3, "position": 0, "resultado": { "vencedor": "atleta1", "status": "concluida" } }
  ],
  "status": "concluida",
  "vencedorAtletaId": "marcos-uuid"
}
```

**Pódio final:**
| Posição | Atleta |
|---------|--------|
| 1º (Campeão) | Marcos Paulo |
| 2º (Vice) | Henrique Bastos |
| 3º | Felipe Dias e Guilherme Reis |

---

## 4. Arquivos Afetados

### 4.1 `app/lib/bracket-utils.ts` — ALTERAÇÕES CRÍTICAS

| Função | Tipo de Alteração | Descrição |
|--------|-------------------|-----------|
| `isThreeCompetitorsChave` | **Nova função auxiliar** | Criar `isFourCompetitorsChave(chave)` equivalente |
| `advanceWinner` | **Alteração maior** | Adicionar bloco específico para `totalCompetidores === 4` — vencedor do R1 vai direto para R3, perdedor recebe 3º lugar automaticamente (sem criar R2) |
| `getNextPosition` | **Sem alteração** | Função permanece igual (não será usada para 4 competidores) |
| `buildBracketFromChaveLuta` | **Alteração** | Ajustar label do Round 3 de "Semifinal" para "Final" quando `totalCompetidores === 4` |

### 4.2 `app/components/bracket/BracketLayout.tsx` — ALTERAÇÕES

| Seção | Tipo de Alteração | Descrição |
|-------|-------------------|-----------|
| `isThreeCompetitors` | **Adicionar** `isFourCompetitors` | Nova constante derivada de `chave.totalCompetidores === 4` |
| `rightSemi` (linha 86-91) | **Alteração** | Para 4 competidores, R3 pos 0 deve aparecer em `leftSemi` e o `rightSemi` deve ser undefined (não duplicar) |
| `thirdPlaceLeft` (linha 133-143) | **Alteração** | Para 4 competidores, retornar undefined (3º lugar vem dos perdedores do R1, não de uma luta de consolação) |
| `thirdPlaceRight` (linha 145-154) | **Alteração** | Para 4 competidores, retornar undefined (apenas um 3º lugar compartilhado) |
| `thirdPlace` (linha 156-172) | **Alteração** | Para 4 competidores, exibir ambos perdedores do R1 como 3º lugar |
| `drawConnections` SVG (linha 187-195) | **Alteração** | Remover conexões de R2 (inexistente para 4 comps). Adicionar conexão direta: ambos R1 → R3 |
| Painel Central (linha 268-273) | **Alteração** | Para 4 comps, exibir o vencedor da semi esquerda OU o vencedor do R3 quando concluído |
| Pódio (linha 304-340) | **Alteração** | Para 4 competidores, exibir ambos perdedores do R1 na linha de 3º lugar |

### 4.3 `app/components/bracket/BracketVisualizer.tsx` — SEM ALTERAÇÕES

O componente apenas delega para `BracketLayout`, então não requer alterações.

### 4.4 `app/hooks/useStorage.ts` — SEM ALTERAÇÕES

Para 4 competidores, não há Round 2 (consolação), portanto não há lutas extras a serem consideradas. O fluxo `marcarLutaConcluida` chama `advanceWinner` que gerencia a criação do R3 dinamicamente.

### 4.5 `app/types/index.ts` — SEM ALTERAÇÕES

Nenhum novo tipo é necessário. O modelo atual já suporta rounds 1 e 3.

### 4.6 `app/hooks/useImportacao.ts` — SEM ALTERAÇÕES

Durante a importação, para 4 competidores, apenas Round 1 é importado. Round 3 é criado dinamicamente por `advanceWinner()`. O código atual em `useImportacao.ts:98` já filtra rounds > 2 para chaves de 3 atletas — não precisa estender para 4 pois o JSON de entrada já deve conter apenas Round 1.

### 4.7 `app/scoreboard/setup/page.tsx` — SEM ALTERAÇÕES

A função `handleImportar` já cria lutas de Round 2 para BYE apenas quando há atleta null no Round 1. Para 4 competidores, ambos os atletas existem, então nenhum tratamento especial é necessário.

### 4.8 `docs/requirements.md` — ATUALIZAÇÃO DE DOCUMENTAÇÃO

Adicionar nova seção "Chaves de 4 Competidores" na documentação de requisitos.

---

## 5. Plano de Implementação Detalhado

### 5.1 Nova função utilitária: `isFourCompetitorsChave`

**Arquivo:** `app/lib/bracket-utils.ts`
**Local:** Após linha 17 (`isThreeCompetitorsChave`)

```typescript
export function isFourCompetitorsChave(chave: ChaveLuta): boolean {
  return chave.totalCompetidores === 4
}
```

### 5.2 Bloco de avanço para 4 competidores em `advanceWinner`

**Arquivo:** `app/lib/bracket-utils.ts`
**Local:** Novo bloco antes do bloco genérico (após linha 474, antes de `let nextPos`)

**Lógica:**

```typescript
// ============================================================
// Bloco específico para 4 competidores (sem consolação)
// ============================================================
if (isFourCompetidores && round === 1 && isRealFight(completed)) {
  // Vencedor → Round 3 (Final)
  // Perdedor → 3º lugar automático (sem luta de consolação)

  // Determinar posição: vencedor de pos 0 → atleta1 do R3, pos 1 → atleta2 do R3
  const isLeftSide = position === 0

  // Criar/encontrar Round 3 position 0
  let round3Luta = chave.lutas.find(l => l.round === 3 && l.position === 0)
  if (!round3Luta) {
    round3Luta = {
      id: crypto.randomUUID(),
      round: 3,
      position: 0,
      atleta1: null,
      atleta2: null,
      resultado: { status: "pendente" } as ResultadoLuta
    }
  }

  // Posicionar vencedor
  if (isLeftSide) {
    round3Luta = { ...round3Luta, atleta1: winner }
  } else {
    round3Luta = { ...round3Luta, atleta2: winner }
  }

  // Atualizar lutas na chave
  const lutasAtualizadas = chave.lutas.map(l => {
    if (l.id === completedFightId) {
      return { ...l, resultado: /* resultado da luta concluída */ }
    }
    if (l.id === round3Luta.id) return round3Luta
    return l
  })

  // Adicionar R3 se não existia antes
  if (!chave.lutas.some(l => l.id === round3Luta.id)) lutasAtualizadas.push(round3Luta)

  return { ...chave, status: "em_andamento", lutas: lutasAtualizadas }
}

// Para 4 comps, Round 3 (final) conclui a chave
if (isFourCompetidores && round === 3) {
  return {
    ...chave,
    status: "concluida",
    vencedorAtletaId: winner.id,
    lutas: chave.lutas.map(l => l.id === completedFightId ? { ...l, resultado } : l)
  }
}
```

> **Nota:** O código acima é uma representação conceitual. A implementação real deve reutilizar a estrutura de `novoResultado` já existente no `advanceWinner`, incluindo preservação de `AtletaDesclassificadoId`. Diferente da versão anterior deste documento, **não há criação de Round 2 (consolação)** — os perdedores do R1 recebem 3º lugar automaticamente.

### 5.3 Atualização de `buildBracketFromChaveLuta`

**Arquivo:** `app/lib/bracket-utils.ts`
**Local:** Linha 49-50

**Antes:**
```typescript
const isThreeCompetitors = isThreeCompetitorsChave(chave)
const label = isThreeCompetitors ? "Final" : "Semifinal"
```

**Depois:**
```typescript
const isThreeCompetitors = isThreeCompetitorsChave(chave)
const isFourCompetitors = isFourCompetitorsChave(chave)
const label = (isThreeCompetitors || isFourCompetitors) ? "Final" : "Semifinal"
```

### 5.4 Atualização de `BracketLayout.tsx`

| Passo | Local | Ação |
|-------|-------|------|
| 5.4.1 | Linha 80 | Adicionar `const isFourCompetitors = chave.totalCompetidores === 4` |
| 5.4.2 | Linha 87 | Alterar condição de `isThreeCompetitors` para incluir `isFourCompetitors`: `if ((isThreeCompetitors || isFourCompetitors) && leftSemi[0]?.atleta2)` |
| 5.4.3 | Linha 133-143 | `thirdPlaceLeft`: para 4 competidores, retornar undefined (3º lugar vem dos perdedores do R1) |
| 5.4.4 | Linha 145-154 | `thirdPlaceRight`: para 4 competidores, retornar undefined (apenas 1 terceiro lugar) |
| 5.4.5 | Linha 156-172 | `thirdPlace`: estender condição de `!isThreeCompetitors` para `!isThreeCompetitors && !isFourCompetitors` no early return. Adicionar lógica: perdedores do R1 são o 3º lugar |
| 5.4.6 | Linha 133 (novo) | Adicionar `thirdPlaceConsolation` para 4 competidores: ambos perdedores do R1 dividem o 3º lugar |
| 5.4.7 | Linha 188-194 | `drawConnections`: Remover conexões de R2. Adicionar conexão direta de R1-P0 e R1-P1 → R3 |
| 5.4.8 | Linha 304-340 | Pódio: para 4 competidores, exibir ambos perdedores do R1 na linha de 3º lugar |

### 5.5 Validação do comportamento (casos de teste)

| # | Cenário | Entrada | Resultado Esperado |
|---|---------|---------|-------------------|
| 1 | Fluxo normal | 4 atletas, ambos R1 concluídos | R3 (final) criado com ambos atletas preenchidos. Perdedores do R1 são 3º lugar automático |
| 2 | R3 concluído | R3 finalizado | Chave `concluida`, campeão e vice definidos, 3º lugar = ambos perdedores do R1 |
| 3 | DSQ no R1 pos 0 | Atleta1 desclassificado | Atleta2 vence e vai para R3 atleta1. Atleta1 (DSQ) não recebe 3º lugar |
| 4 | DSQ no R1 pos 1 | Atleta2 desclassificado | Atleta1 vence e vai para R3 atleta2. Atleta2 (DSQ) não recebe 3º lugar |
| 5 | Ordem inversa (pos 1 resolvida antes de pos 0) | Henrique vence antes de Marcos | R3 atleta2 = Henrique. Quando Marcos vencer, R3 atleta1 = Marcos |

---

## 6. Risco e Impacto

### 6.1 Impacto em chaves existentes

A alteração afeta **apenas chaves com `totalCompetidores === 4`**. Chaves com 2, 3, 5, 6, 7 ou 8 competidores continuam com o comportamento atual inalterado.

### 6.2 Risco de regressão

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| Quebrar posicionamento de chaves com 5+ competidores | Baixa | O código existente para `!isFourCompetitors` continua inalterado |
| Quebrar visualização de chaves com 4 competidores existentes | Média | Dados existentes no `data/area-1.json` com 4 comps podem ter estrutura diferente da nova — verificar migração |
| Pódio incorreto para 4 competidores | Média | Testar todos os estados da chave (pendente, em_andamento, concluida) |

### 6.3 Dependências entre tarefas

```
5.1 → 5.2 (advanceWinner precisa da função auxiliar)
5.2 → 5.3 (buildBracketFromChaveLuta precisa do novo fluxo)
5.2 → 5.4 (BracketLayout precisa do novo fluxo)
5.4 → 5.5 (testes dependem da implementação completa)
```

---

## 7. Referências

- Código atual de 3 competidores em `app/lib/bracket-utils.ts:358-474` (modelo para implementação)
- Documento de requisitos principal: `docs/requirements.md` (seção 10 — Chaves de 3 Competidores)
- Bug conhecido: `docs/analise-bug-luta-pendente.md` (relevante para validação de contagem de pendentes)
- Dados de exemplo: `data/area-1.json` — chave "Azul Adulto Masculino - 70kg" (4 competidores)
