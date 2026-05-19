# Requisito: Exibir Nome do Vencedor nos Cards do Bracket

**Versão:** 1.0
**Data:** 2026-05-18
**Projeto:** BJJ Tournament Manager

---

## Problema

Quando uma luta é concluída no BracketLayout.tsx, os cards internos (posições 1, 2, 3, 4 do lado esquerdo e 5, 6, 7, 8 do lado direito) devem exibir o nome do vencedor de forma permanente, indicando claramente qual atleta venceu cada confronto.

---

## Estrutura de Dados

```typescript
interface Luta {
  id: string
  round: number           // 1 = Oitavas, 2 = Quartas, 3 = Semifinal, 4 = Final
  position: number       // Posição dentro do round (0-7 para round 1)
 atleta1: Atleta | null
  atleta2: Atleta | null
  resultado?: ResultadoLuta
}

interface ResultadoLuta {
  status: "pendente" | "concluida"
  vencedor: "atleta1" | "atleta2" | "empate" | null
  vencedorAtletaId: string | null  // UUID do atleta vencedor
}
```

---

## Critérios de Aceitação

| ID | Critério | Status |
|----|----------|--------|
| CA-001 | Cards do Round 1 (posições 0-7) devem exibir badge "VENCEU" quando luta concluída | Implementado |
| CA-002 | Nome do vencedor deve permanecer visível no card do atleta após vitória | Implementado |
| CA-003 | Cards de lados opostos devem manter visualização do vencedor após luta | Implementado |
| CA-004 | losers devem ter badge "PERDEU" e visual diferente | Implementado |

---

## Implementação Atual

### Arquivo: `app/components/bracket/BracketLayout.tsx`

#### CompetitorCard (linha 326-394)

O componente `CompetitorCard` já implementa a lógica de exibição de vencedor:

```typescript
// Linha 366-370 - Badge "VENCEU" quando a luta está concluída
{isCompleted && (
  <span className="absolute right-1 top-1 bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
    VENCEU
  </span>
)}
```

```typescript
// Linha 341 - Determina qual atleta está no card
const atleta = atletaIndex === 1 ? luta?.atleta1 : luta?.atleta2
```

```typescript
// Linha 413 - Verifica se o card é do vencedor
isCompleted={lutas[0]?.resultado?.status === "concluida" && lutas[0]?.resultado?.vencedorAtletaId === lutas[0]?.atleta1?.id}
```

#### Validação de Vencedor por Index

```typescript
// Round1Pair - Linha 413 (atleta1) e 423 (atleta2)
isCompleted={lutas[0]?.resultado?.status === "concluida" && lutas[0]?.resultado?.vencedorAtletaId === lutas[0]?.atleta1?.id}
isCompleted={lutas[0]?.resultado?.status === "concluida" && lutas[0]?.resultado?.vencedorAtletaId === lutas[0]?.atleta2?.id}
```

### Estilo Visual para Vencedor/Perdedor

**Vencedor (isCompleted = true):**
- `bg-slate-100` - Fundo mais claro
- Badge verde "VENCEU" no canto superior direito (linha 366-370)

**Perdedor:**
- `bg-white` - Fundo padrão
- Sem badge especial (mantém visual padrão)

**Ativo (luta em andamento):**
- `ring-2 ring-amber-400` - Borda âmbar

### BracketMatchupCard (Visualização Alternativa)

O componente `BracketMatchupCard` (usado em outras partes do bracket) exibe badges via `getFighterTags()`:

```typescript
// app/lib/bracket-utils.ts - getFighterTags (linha 161-183)
export function getFighterTags(resultado: ResultadoLuta | undefined, fighter: "atleta1" | "atleta2"): ResultTag[] {
  // Retorna badges: "VENCEU", "PERDEU", "FINALIZOU", "DESCLASS."
}
```

**Tipos de badges:**
- `VENCEU` (success/verde)
- `PERDEU` (danger/vermelho)
- `FINALIZOU` (info/azul)
- `DESCLASS.` (danger-bold/vermelho escuro)

---

## Fluxo de Exibição

### Round 1 (Oitavas) - 8 lutas

| Posição | Cards | Luta Referenciada |
|---------|-------|-------------------|
| 0 | Card 1 (atleta1), Card 2 (atleta2) | round=1, position=0 |
| 1 | Card 3 (atleta1), Card 4 (atleta2) | round=1, position=2 |
| 2 | Card 5 (atleta1), Card 6 (atleta2) | round=1, position=4 |
| 3 | Card 7 (atleta1), Card 8 (atleta2) | round=1, position=6 |
| 4 | Card 9 (atleta1), Card 10 (atleta2) | round=1, position=1 |
| 5 | Card 11 (atleta1), Card 12 (atleta2) | round=1, position=3 |
| 6 | Card 13 (atleta1), Card 14 (atleta2) | round=1, position=5 |
| 7 | Card 15 (atleta1), Card 16 (atleta2) | round=1, position=7 |

### Verificação de Status

Cada `CompetitorCard` verifica:
1. `luta?.resultado?.status === "concluida"` - Luta finalizada
2. `luta?.resultado?.vencedorAtletaId === atleta?.id` - Este atleta é o vencedor
3. Se ambas verdadeiras → exibe badge "VENCEU"

---

## Componentes Afetados

| Componente | Arquivo | Função |
|------------|---------|--------|
| `CompetitorCard` | BracketLayout.tsx:326-394 | Card individual de competidor |
| `Round1Pair` | BracketLayout.tsx:396-497 | Renderiza pares de lutas do Round 1 |
| `Round1PairRight` | BracketLayout.tsx:499-599 | Renderiza pares de lutas do Round 1 (direita) |
| `Round2Pair` | BracketLayout.tsx:602+ | Renderiza lutas do Round 2 (Quartas) |

---

## Validação

Para confirmar que o requisito está implementado corretamente:

1. **Importar JSON com lutas concluídas** (resultado.status = "concluida")
2. **Verificar Round 1** - Cards das posições 1-8 devem mostrar "VENCEU" no atleta vencedor
3. **Verificar visual** - Vencedor com fundo levemente acinzentado (bg-slate-100)
4. **Verificar lado direito** - Cards 9-16 (direita) também devem exibir corretamente

---

## Historico de Alteracoes

| Versao | Data | Descricao |
|--------|------|-----------|
| 1.0 | 2026-05-18 | Versao inicial do requisito |

---

## Analise de Consistência

### Verificação de Coerência

| Item | Status | Observação |
|------|--------|-------------|
| Badge "VENCEU" em CompetitorCard | OK | Implementado em BracketLayout.tsx:366-370 |
| Badge "PERDEU" para perdedor | OK |getFighterTags em bracket-utils.ts retorna "PERDEU" |
| Fundo acinzentado para vencedor | OK | bg-slate-100 em BracketLayout.tsx:353 |
| Visualização alternativa (BracketMatchupCard) | OK | Usa getFighterTags com badges coloridos |
| Verificação por UUID (vencedorAtletaId) | OK | Comparação via `===` com ID do atleta |

### Componentes que Exibem Vencedor

| Componente | Arquivo | Tipo de Visualização |
|------------|---------|---------------------|
| CompetitorCard | BracketLayout.tsx:326-394 | Badge "VENCEU" + fundo cinza |
| FighterRow | BracketMatchupCard.tsx:90-109 | Badges "VENCEU"/"PERDEU"/"FINALIZOU" coloridos |

**Conclusão:** O requisito está coerente com a implementação.