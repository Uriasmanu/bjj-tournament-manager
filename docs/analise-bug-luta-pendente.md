# Análise de Bug: Chave concluída mostra luta pendente

## Sumário

A chave **"Branca Adulto Masculino - 65kg"** (`id: 98d4364d-3c52-43eb-9ca3-7f6b4cc10570`) tem todas as 3 lutas reais concluídas, o vencedor definido (`vencedorAtletaId` preenchido), mas o sistema continua exibindo "1 pendente" e mantém `status: "em_andamento"`.

**Causa raiz:** Uma luta **BYE** (round 1, position 1, `atleta2: null`) ainda possui `resultado.status: "pendente"`. O código que conta lutas pendentes filtrando por `resultado?.status !== "concluida"` contabiliza essa luta BYE como pendente, mesmo ela nunca tendo sido uma luta real.

---

## Estrutura dos dados problemáticos

`data/area-1.json` — chave `98d4364d-...`:

| Ordem | Luta ID | Round | Pos | atleta1 | atleta2 | status | BYE? |
|-------|---------|-------|-----|---------|---------|--------|------|
| 1 | `f6e58935` | 1 | 0 | João Silva | Carlos Santos | concluida | Não |
| 2 | **`b61c0218`** | **1** | **1** | **Pedro Lima** | **null** | **pendente** | **Sim** |
| 3 | `aaea076a` | 2 | 3 | Pedro Lima | Carlos Santos | concluida | Não |
| 4 | `8afffaed` | 3 | 0 | João Silva | Carlos Santos | concluida | Não |

Propriedades da chave: `status: "em_andamento"`, `vencedorAtletaId: "df102450..."` (João Silva).

---

## Arquivos com o bug (4 ocorrências)

### 1. `app/hooks/useStorage.ts:189` — **CRÍTICO (causa raiz funcional)**

Define se a chave deve ser marcada como concluída:

```typescript
const temLutasPendentes = (chaveResult as ChaveLuta).lutas.some(
  l => l.resultado?.status !== "concluida"
)
```

**Problema:** A luta BYE (`b61c0218`) tem `resultado.status: "pendente"` → `temLutasPendentes` = `true` → chave permanece `"em_andamento"`.

### 2. `app/scoreboard/page.tsx:235` — **Impacto visual (UI)**

```typescript
const pendentes = chave.lutas.filter(
  l => l.resultado?.status !== "concluida"
).length
```

**Problema:** Exibe "(1) pendentes" no `<select>` de categorias mesmo após todas as lutas reais terminarem.

### 3. `app/components/scoreboard/SeletorLuta.tsx:77` — **Impacto visual (UI)**

```typescript
const lutasPendentes = chave.lutas.filter(
  (l) => l.resultado?.status !== "concluida"
).length
```

**Problema:** Mesmo filtro incorreto — conta BYE como pendente.

### 4. `app/components/scoreboard/BracketPanel.tsx:30` — **Impacto visual (UI)**

```typescript
const lutasPendentes = chave.lutas.filter(
  l => l.resultado?.status !== "concluida"
).length
```

**Problema:** Mesmo filtro incorreto — conta BYE como pendente.

---

## Por que o BYE nunca recebe `status: "concluida"`

No `advanceWinner()` em `app/lib/bracket-utils.ts`:

**Fluxo de desclassificação (linhas 358-443):**
- Quando há DSQ no Round 1 de uma chave de 3 competidores, o `round2ByeLuta` recebe apenas `tags: ["AVANÇOU"]` (linha 417).
- **Nunca** altera `resultado.status` da luta BYE.

**Fluxo sem DSQ (linhas 446-474):**
- O perdedor do Round 1 é colocado no slot vazio do Round 2.
- A luta BYE original permanece intacta com `status: "pendente"`.

**Ou seja:** A luta BYE nunca é "concluída" porque ela nunca aconteceu — é um placeholder estrutural. O sistema deveria ignorá-la ao verificar lutas pendentes.

---

## `getMatchupStatus()` já resolve corretamente (mas não é usado onde deveria)

Em `app/lib/bracket-utils.ts:106-111`:

```typescript
function getMatchupStatus(luta: Luta): MatchupStatus {
  if (!luta.atleta1?.id && !luta.atleta2?.id) return "pending"
  if (!luta.atleta1?.id || !luta.atleta2?.id) return "bye"   // ← BYE detectado!
  if (luta.resultado?.status === "concluida") return "completed"
  return "pending"
}
```

Esta função é usada **apenas para renderização visual** (BracketLayout, BracketMatchupCard). O `useStorage.ts` e os componentes de UI deveriam usar lógica equivalente.

---

## `areAllRound1FightsCompleted()` já usa o padrão correto

Em `app/lib/bracket-utils.ts:289-293`:

```typescript
function areAllRound1FightsCompleted(chave: ChaveLuta): boolean {
  return chave.lutas
    .filter(l => l.round === 1)
    .every(l => isByeSlot(l) || l.resultado?.status === "concluida")
}
```

Repare: este código **já exclui BYE slots** da verificação (`isByeSlot(l) || ...`). Este é o padrão correto que deveria ser usado em todos os lugares.

`isByeSlot()` em `bracket-utils.ts:624`:
```typescript
export function isByeSlot(luta: Luta): boolean {
  return !luta.atleta1?.id || !luta.atleta2?.id
}
```

---

## Requisito funcional

> **REQ-FINALIZACAO-CHAVE:** Uma chave deve ser considerada "concluida" **quando todas as lutas reais** (aquelas com `atleta1` e `atleta2` preenchidos) tiverem `resultado.status === "concluida"`. Lutas BYE (com pelo menos um atleta `null`) **não devem ser contabilizadas** como pendentes para fins de determinação do status da chave.

> **REQ-CONTAGEM-PENDENTES:** A contagem de "lutas pendentes" exibida na interface (UI) deve refletir apenas lutas reais não concluídas. Lutas BYE nunca devem aparecer na contagem.

---

## Plano de implementação

| # | Arquivo | Linha | Ação | Complexidade |
|---|---------|-------|------|-------------|
| 1 | `app/lib/bracket-utils.ts` | — | Exportar `isRealFight` (já existe `isByeSlot` exportada; opcionalmente exportar `isRealFight` como `!!l.atleta1?.id && !!l.atleta2?.id`) | Baixa |
| 2 | `app/hooks/useStorage.ts` | 189 | Alterar filtro para ignorar BYE slots: `.filter(l => isRealFight(l)).some(l => l.resultado?.status !== "concluida")` | Baixa |
| 3 | `app/scoreboard/page.tsx` | 235 | Alterar filtro para ignorar BYE slots | Baixa |
| 4 | `app/components/scoreboard/SeletorLuta.tsx` | 77 | Alterar filtro para ignorar BYE slots | Baixa |
| 5 | `app/components/scoreboard/BracketPanel.tsx` | 30 | Alterar filtro para ignorar BYE slots | Baixa |
| 6 | Teste | — | Validar que chave com BYE + todas as lutas reais concluídas fica `status: "concluida"` | Média |

### Detalhamento das correções

**Passo 1 — Extrair função utilitária (ou usar `isByeSlot` já exportada)**

`isByeSlot` já está exportada em `bracket-utils.ts:624`. Pode ser importada onde necessário.

Alternativa: exportar `isRealFight` (complemento lógico):
```typescript
export function isRealFight(luta: Luta): boolean {
  return !!luta.atleta1?.id && !!luta.atleta2?.id
}
```
(já existe como função privada `isRealFight` na linha 285)

**Passo 2 — Corrigir `useStorage.ts` (linha 189)**

```typescript
// ANTES (bug):
const temLutasPendentes = (chaveResult as ChaveLuta).lutas.some(
  l => l.resultado?.status !== "concluida"
)

// DEPOIS (corrigido):
const temLutasPendentes = (chaveResult as ChaveLuta).lutas
  .filter(l => isRealFight(l))
  .some(l => l.resultado?.status !== "concluida")
```

**Passo 3 — Corrigir UI (`page.tsx:235`, `SeletorLuta.tsx:77`, `BracketPanel.tsx:30`)**

Mesmo padrão: adicionar `.filter(l => !!l.atleta1?.id && !!l.atleta2?.id)` antes de contar pendentes.

```typescript
// Padrão para todas as UI:
const pendentes = chave.lutas
  .filter(l => l.atleta1?.id && l.atleta2?.id)
  .filter(l => l.resultado?.status !== "concluida").length
```

### Validação

Após as correções, para a chave `98d4364d-...`:
- 3 lutas reais (filtro passa)
- 1 BYE (filtro remove)
- 0 lutas reais pendentes (todas concluídas)
- `temLutasPendentes = false`
- `status` da chave → `"concluida"`
- UI exibirá "(0) pendentes"
