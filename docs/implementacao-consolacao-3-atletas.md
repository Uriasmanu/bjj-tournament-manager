# Implementação: Consolação para Chaves de 3 Atletas

## 1. Objetivo

Implementar uma luta de consolação em chaves com exatamente **3 competidores**: o perdedor da luta do Round 1 (que não tenha sido por desclassificação) deve lutar contra o competidor que avançou automaticamente via BYE.

---

## 2. Análise Forense: Por que a implementação não funcionou

### 2.1 O que o JSON atual prova

O arquivo `data/area-1.json` contém o estado da chave de 3 atletas após a execução:

| Luta | Round | Pos | Atleta 1 | Atleta 2 | Status |
|------|-------|-----|----------|----------|--------|
| Luta 1 | 1 | 0 | João Silva | Carlos Santos | **concluída** |
| Luta 2 | 1 | 1 | Pedro Lima | null | pendente |
| Luta 3 | 2 | 3 | Pedro Lima | **null** | pendente |

**Total: 3 lutas. Round 3 não existe. Round 2 `atleta2` é null.**

### 2.2 Rastreamento de execução: o que REALMENTE aconteceu

O fluxo foi o EXISTENTE (código original), não o novo:

```
1. usuário finaliza Round 1 (João vence Carlos)
2. marcarLutaConcluida() atualiza resultado e chama advanceWinner()
3. advanceWinner():
   round = 1
   isDesclassificacao = false  (tipoVitoria = "pontos")
   isThreeCompetitors = true
   
   → bloco DSQ: ignora (isDesclassificacao é false)
   
   → linha 448: if (isThreeCompetitors && round === 1)
     const round3Luta = chave.lutas.find(round === 3)  // undefined!
     nextPos = null
   
   → linha 460: if (!nextPos)
     return { status: "concluida", vencedorAtletaId: joao.id }
     // ⚠️ A FUNÇÃO RETORNA AQUI —  o novo bloco NUNCA é alcançado!

4. marcarLutaConcluida():
   temLutasPendentes = true  (BYE ainda pendente)
   chave.status = "em_andamento"  // sobrescreve "concluida"

5. Resultado final (no JSON):
   ✅ Round 1 concluída
   ✅ vencedorAtletaId = João
   ❌ Round 2 atleta2 = null  (Carlos NUNCA foi colocado lá)
   ❌ Round 3 NÃO foi criado
   ❌ Nenhuma luta Pedro vs Carlos
```

### 2.3 Causa raiz: o código novo nunca executou

O JSON é IDÊNTICO ao que o código EXISTENTE produz. O novo bloco proposto no documento não foi alcançado por UM destes motivos:

| # | Causa possível | Como identificar |
|---|----------------|-----------------|
| 1 | **Código inserido no local errado** — após a linha `if (!nextPos) return`, que já tinha encerrado a função | O JSON tem 3 lutas e `vencedorAtletaId` preenchido |
| 2 | **Placeholder `novoResultado` não substituído** — o comentário `/* criar resultado... */` quebra a compilação TypeScript | O servidor next.js mostraria erro de compilação |
| 3 | **Outro erro de sintaxe/import** — variável não declarada, tipo incorreto | O servidor mostraria erro, e o bundle antigo seria servido |
| 4 | **Código nunca adicionado ao arquivo** — as alterações não foram salvas | O JSON reflete o comportamento original |

### 2.4 Localização exata do problema no código

O ponto crítico na função `advanceWinner()` é este trecho (código original):

```typescript
  // BLOCO DSQ
  if (isDesclassificacao && round === 1 && isRealFight(completed)) {
    // ... lógica de desclassificação ...
    // retorna early com Round 3 criado
  }
                              ←  O NOVO BLOCO DEVE FICAR AQUI
  // BLOCO nextPos (EXISTENTE)
  // Para chaves com 3 competidores, o vencedor do Round 1 vai direto para Round 3
  let nextPos: ...
  if (isThreeCompetitors && round === 1) {
    // ... nextPos = null quando Round 3 não existe ...
  }
  if (!nextPos) {
    return { status: "concluida", vencedorAtletaId: winner.id }  // ← RETORNA AQUI
  }
                              ←  NÃO ADICIONAR AQUI! (dead code)
```

**Regra de ouro:** O novo código deve vir **entre** o bloco DSQ e o bloco `nextPos`. Se vier depois de `if (!nextPos) return`, nunca será executado.

### 2.5 O que significa "card 12"?

No layout do bracket (componente `BracketLayout.tsx`), cada atleta é renderizado em um "card" com número. O mapeamento para chave de 3 atletas é:

| Card | Localização | Atleta | O que deveria mostrar |
|------|-------------|--------|----------------------|
| 11 | Round 2, lado direito, `atleta1` | Pedro Lima (BYE) | ✅ Já mostra Pedro |
| **12** | Round 2, lado direito, **`atleta2`** | **Carlos Santos (perdedor)** | ❌ Mostra "-- Vazio --" |

O card 12 é renderizado por `CompetitorCard` em `Round2PairRight` (linha ~614):
```typescript
<CompetitorCard
  luta={lutas[0]}           // Round 2, position 3
  nodeId={`node-${side}-${round}-2-2`}
  cardPosition={12}
  atletaIndex={2}            // atleta2
/>
```

Como `atleta2` da luta de Round 2 é `null` no JSON, o card exibe "-- Vazio --". O código novo deve popular `atleta2` com o perdedor Carlos para que este card mostre o nome correto e a luta se torne clicável.

---

## 3. Diagnóstico dos problemas na especificação original

### Problema 1 (CRÍTICO): Placeholder `novoResultado` não é código executável

A seção 4.1.1 continha `const novoResultado: ResultadoLuta = /* criar resultado igual aos blocos existentes */` — um comentário, não código. Sem a construção explícita do objeto `novoResultado`, o TypeScript produz erro de compilação e o bloco inteiro não executa.

**Solução:** Código completo inline, sem placeholders.

### Problema 2 (CRÍTICO): Round 2 → Round 3 com posição incorreta

O Round 2 de consolação é criado com `position: 3` durante o import. Quando `advanceWinner` processa o Round 2, a função `getNextPosition(2, 3, ...)` retorna `{ round: 3, position: 1 }`, mas o Round 3 foi criado com `position: 0`. A busca por `round === 3 && position === 1` retorna `undefined`, e o bracket é encerrado prematuramente sem a Final.

**Solução:** Adicionar condição especial para `isThreeCompetitors && round === 2` no bloco `nextPos`, redirecionando para `position: 0` com `useAtleta1: false`.

### Problema 3: Seção 4.1.1 assume `atleta2` como slot vazio do BYE

O código em 4.1.1 sempre faz `return { ...round2ByeLuta, atleta2: perdedor }`. Se o BYE estiver em `atleta2` (e não `atleta1`), o perdedor sobrescreve o competidor do BYE.

**Solução:** Verificar dinamicamente qual slot está vazio (`!round2ByeLuta.atleta1?.id` vs `!round2ByeLuta.atleta2?.id`).

### Problema 4 (CRÍTICO): Round 3 não era criado para o fluxo não-DSQ

O bloco de consolação colocava o perdedor no Round 2 mas não garantia a existência do Round 3. Como `processarChave` em `useImportacao.ts` filtra `round <= 2` para chaves de 3 atletas, o Round 3 **não existe** na chave. O bloco `nextPos` para `isThreeCompetitors && round === 1` então faz:

```typescript
const round3Luta = chave.lutas.find(l => l.round === 3 && l.position === 0)
// round3Luta = undefined!
if (round3Luta) { ... } else { nextPos = null }
```

Com `nextPos = null`, a função cai em `if (!nextPos) return { status: "concluida", vencedorAtletaId: winner.id }`, encerrando a chave prematuramente — a chave fica "concluida" com apenas uma luta e sem Round 3.

**Solução:** O bloco de consolação agora cria Round 3 position 0 se ele não existir, antes de deixar o fluxo continuar para `nextPos`.

---

## 4. Arquivos Afetados

| Arquivo | Tipo de Alteração |
|---------|-------------------|
| `app/lib/bracket-utils.ts` | **Principal** — 2 blocos adicionados em `advanceWinner()` |
| `app/components/bracket/BracketLayout.tsx` | Secundário — `thirdPlace` ajustado |

Nenhuma alteração necessária em:
- `useStorage.ts`, `setup/page.tsx`, `useImportacao.ts`, `types/index.ts`, `useBracket.ts`

---

## 5. O que foi implementado (versão simplificada e final)

Diferente da especificação original complexa, a implementação real é mais enxuta:
- Em vez de duplicar a lógica de `nextPos` dentro do novo bloco, apenas coloca o **perdedor** no Round 2 e deixa o fluxo existente de `nextPos` colocar o **vencedor** no Round 3.
- Isso reduz duplicação e aproveita o código existente de `updatedLutas` (linhas ~510-519) para marcar a luta concluída e atualizar a próxima.

### 5.1 `app/lib/bracket-utils.ts` — Função `advanceWinner()`

#### [ALTERAÇÃO 1] Consolação: perdedor no Round 2 + criar Round 3

**Inserido entre** o fechamento do bloco DSQ (linha 443) e o comentário `// Para chaves com 3 competidores...` (linha 461).

```typescript
  // Consolação para 3 atletas sem DSQ: perdedor do Round 1 vai para Round 2
  if (isThreeCompetitors && !isDesclassificacao && round === 1 && isRealFight(completed)) {
    let lutasAtualizadas = chave.lutas

    const round2ByeLuta = lutasAtualizadas.find(l =>
      l.round === 2 && (!l.atleta1?.id || !l.atleta2?.id)
    )
    if (round2ByeLuta) {
      const emptySlot = !round2ByeLuta.atleta1?.id ? ("atleta1" as const) : ("atleta2" as const)
      lutasAtualizadas = lutasAtualizadas.map(luta =>
        luta.id === round2ByeLuta.id ? { ...luta, [emptySlot]: loser } : luta
      )
    }

    // Garantir que Round 3 position 0 exista para receber o vencedor
    if (!lutasAtualizadas.some(l => l.round === 3 && l.position === 0)) {
      const round3Luta: Luta = {
        id: crypto.randomUUID(),
        round: 3,
        position: 0,
        previousMatchIds: [],
        atleta1: null,
        atleta2: null,
        resultado: { status: "pendente" } as ResultadoLuta
      }
      lutasAtualizadas = [...lutasAtualizadas, round3Luta]
    }

    chave = { ...chave, lutas: lutasAtualizadas }
  }
```

**Funcionamento:**
1. Detecta chave de 3 atletas, Round 1, sem DSQ, luta real (não BYE)
2. Encontra a luta do Round 2 que tem um slot vazio (BYE já ocupou o outro)
3. Detecta qual slot está vazio (`atleta1` ou `atleta2`) — **não assume** `atleta2`
4. Coloca o perdedor no slot vazio do Round 2
5. **Cria Round 3 position 0 se não existir** (com `atleta1: null, atleta2: null`) — essencial porque `processarChave` filtra `round <= 2` para 3 atletas
6. O fluxo existente de `nextPos` (logo abaixo) encontra Round 3 e coloca o vencedor no slot correto

#### [ALTERAÇÃO 2] `nextPos` para ambos os rounds em chave de 3 atletas

**Adicionado** como `else if (isThreeCompetitors && round === 2)` no bloco `nextPos` existente. O bloco de `round === 1` também foi simplificado.

```typescript
  if (isThreeCompetitors && round === 1) {
    const round3Luta = chave.lutas.find(l => l.round === 3 && l.position === 0)
    if (round3Luta) {
      nextPos = { round: 3, position: 0, useAtleta1: true }
    } else {
      nextPos = null
    }
  } else if (isThreeCompetitors && round === 2) {
    const round3Luta = chave.lutas.find(l => l.round === 3 && l.position === 0)
    if (round3Luta) {
      nextPos = { round: 3, position: 0, useAtleta1: false }
    } else {
      nextPos = null
    }
```

**Regra fixa (não depende de posição original):**
- Vencedor do Round 1 → sempre `atleta1` do Round 3
- Vencedor do Round 2 (consolação) → sempre `atleta2` do Round 3
- Isso garante que o JSON final tenha o vencedor do R1 em `atleta1` e o vencedor do R2 em `atleta2`, independente de qual slot cada um ocupava em suas lutas anteriores

### 5.2 `app/components/bracket/BracketLayout.tsx` — Lógica de `thirdPlace`

**Antes:** Mostrava o perdedor do Round 1 como 3º lugar (incorreto para consolação).

**Depois:**
```typescript
const thirdPlace = useMemo(() => {
    if (!isThreeCompetitors) return undefined
    const round1RealFight = chave.lutas.find(l => l.round === 1 && l.atleta1?.id && l.atleta2?.id)
    // Caso DSQ: atleta desclassificado é o terceiro lugar
    if (round1RealFight?.resultado?.status === "concluida" && round1RealFight.resultado.desclassificacao) {
      const r = round1RealFight.resultado
      if (r.desclassificacao === "atleta1") return round1RealFight.atleta1
      if (r.desclassificacao === "atleta2") return round1RealFight.atleta2
    }
    // Caso normal: perdedor do Round 2 (consolação) é o terceiro lugar
    const round2Fight = chave.lutas.find(l => l.round === 2 && l.atleta1?.id && l.atleta2?.id)
    if (round2Fight?.resultado?.status === "concluida") {
      const r = round2Fight.resultado
      return round2Fight.atleta1?.id === r.vencedorAtletaId ? round2Fight.atleta2 : round2Fight.atleta1
    }
    return undefined
  }, [chave.lutas, isThreeCompetitors])
```

**Mudanças:**
1. DSQ: verifica `r.desclassificacao` (não `tipoVitoria`) — apenas os DSQ reais retornam o atleta do R1
2. Não-DSQ: aguarda o Round 2 concluir e mostra o **perdedor do Round 2** como 3º lugar
3. Enquanto Round 2 não estiver concluído, retorna `undefined` (sem medalha de 3º lugar)

---

## 6. Fluxo Completo (3 atletas, sem DSQ)

```
Estado inicial (após importação):
  R1: [Atleta A vs Atleta B]  +  [BYE: Atleta C vs null]
  R2: [Atleta C vs null]
  R3: (não existe — processarChave filtra round <= 2)

1. Usuário conclui R1 (A vence B)
   → advanceWinner(R1):
      isDesclassificacao = false
      isThreeCompetitors = true
      
      → Altereção 1:
         a. coloca B (perdedor) no slot vazio do R2
            R2: [Atleta C vs Atleta B]
         b. cria Round 3 position 0 (se não existir)
            R3: [null vs null] ← criado!
      
      → nextPos: R1 vencedor (A) → R3 position 0, useAtleta1=true (sempre atleta1)
      
      → updatedLutas:
        R1: resultado = concluida
        R3 atleta1 = A
      
   Resultado:
      R1: [A vs B] concluída, vencedor A
      R2: [C vs B] pendente  ← agora é uma luta real!
      R3: [A vs null] pendente

2. Usuário conclui R2 (C vence B)
   → advanceWinner(R2):
      isThreeCompetitors = true, round = 2
      
      → Altereção 2: nextPos = { round:3, position:0, useAtleta1: false } (sempre atleta2)
      
      → updatedLutas:
        R2: resultado = concluida
        R3 atleta2 = C
      
   Resultado:
      R2: [C vs B] concluída, vencedor C
      R3: [A vs C] pendente  ← FINAL pronta!
      3º lugar: B (perdedor do R2)

3. Usuário conclui R3 (A vence C)
   → advanceWinner(R3):
      isFinal = true
      → chave.status = "concluida"
      → campeão = A
```

---

## 7. Verificação

### TypeScript: ✅ sem erros (`npx tsc --noEmit` limpo)
### Lint: ✅ sem novos warnings (25 issues pré-existentes)
### Alterações: 2 arquivos, ~30 linhas totais

### Checklist:
- [x] `ALTERAÇÃO 1` inserida após bloco DSQ, antes de `nextPos` (linha 445)
- [x] `ALTERAÇÃO 1` cria Round 3 position 0 se não existir (essencial para fluxo não-DSQ)
- [x] `ALTERAÇÃO 2` adicionada como `else if` no bloco `nextPos` (linha 472)
- [x] Usa detecção dinâmica de slot vazio (não assume `atleta2`)
- [x] Round 2 → Round 3 usa slot oposto ao vencedor do R1
- [x] `thirdPlace` lê do Round 2 (consolação) primeiro, DSQ como fallback
- [x] Fluxo DSQ não foi modificado
- [x] Chaves 2, 4, 5+ atletas não foram tocadas
