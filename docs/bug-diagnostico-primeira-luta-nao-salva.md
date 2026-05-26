# Diagnóstico e Plano de Correção
# Bug: Resultado da primeira luta não persiste no JSON

## Sumário

Após importar os JSONs e finalizar a primeira luta, o fluxo visual completa-se (placar → confirmação → volta à tela de chaves), mas o resultado **não é salvo no arquivo JSON**. É necessário entrar na luta uma segunda vez para que o salvamento ocorra.

---

## Rastreamento do Fluxo

### Setup (importação)

**Arquivo:** `app/scoreboard/setup/page.tsx`

1. Usuário importa arquivos JSON → `handleImportar()` (linha 89)
2. `importarArquivos()` → `processarChave()` (`useImportacao.ts:50`) cria `ChaveLuta[]` com `resultado` preenchido (`status: "pendente"`) para TODAS as lutas
3. BYE fights são processados (linhas 93-140): cada BYE gera 2 lutas (Round 1 com `tags: ["AVANÇOU"]` + Round 2)
4. Dados salvos via `salvarDados(area, novasChaves)` (linha 144)
5. Usuário clica "Próximo" → `handleProximo()` (linha 76) → `salvarDados(area, chaves)` → `router.push("/scoreboard")`

### Scoreboard (seleção de luta)

**Arquivo:** `app/scoreboard/page.tsx`

1. `carregarDados()` (linha 29) → `getDadosIniciais()` (`useStorage.ts:38`) → fetch GET da API → `setChaves(dados.chaves)` (linha 32)
2. Componente `SeletorLutas` renderiza (linha 117) com prop `chaves`
3. **`chaveAtiva`** é estado LOCAL do `SeletorLutas` (linha 152), **inicializado UMA ÚNICA VEZ** a partir da prop `chaves`
4. Usuário clica "Iniciar →" (linha 254) → `onSelecionarLuta(chaveAtiva, luta)`
   - `luta` = `chaveAtiva.lutas[idx]` (objeto DENTRO de `chaveAtiva`)
5. `ScoreboardPage.handleSelecionarLuta` (linha 40):
   - `setChaveSelecionada(chave)` — linha 41
   - `setChaveId(chave.id)` — linha 42
   - `setLutaSelecionada(luta)` — linha 43

### Placar (finalização)

**Arquivo:** `app/scoreboard/page.tsx` — componente `PlacarCompleto` (linha 311)

1. Renderiza (linha 132) com props:
   - `chaves` — estado de `ScoreboardPage` (carregado da API, linha 135)
   - `chaveId` — `chaveAtiva.id` (linha 137)
   - `luta` → `lutaSelecionada` (referência direta, linha 138)
2. Usuário clica "Finalizar Luta" (linha 514) → seleciona vencedor → seleciona tipo
3. `handleConfirmarTipo()` (linha 430) → chama `marcarLutaConcluida` (linha 456):

```typescript
const chavesAtualizadas = await marcarLutaConcluida(
  area,        // prop do PlacarCompleto (linha 312)
  chaveId,     // prop (linha 315) = chaveAtiva.id
  luta.id,     // prop (linha 316) = lutaSelecionada.id
  dadosResultado,
  chaves       // prop (linha 313)
)
```

4. `setChaves(chavesAtualizadas)` (linha 463)
5. `onTrocarChave()` (linha 469) → `handleTrocarChave` (linha 46):
   - `await carregarDados()` — recarrega dados da API
   - `setLutaSelecionada(null)`
   - `setChaveSelecionada(null)`
   - `setChaveId("")`

### `marcarLutaConcluida`

**Arquivo:** `app/hooks/useStorage.ts` — função `marcarLutaConcluida` (linha 120)

```typescript
const chavesAtualizadas = [...chaves]                      // linha 127
const chave = chavesAtualizadas.find(c => c.id === chaveId) // linha 129
if (!chave) return chavesAtualizadas                        // linha 130 — EARLY RETURN: não salva!

const luta = chave.lutas.find(l => l.id === lutaId)         // linha 132
if (!luta) return chavesAtualizadas                         // linha 133 — EARLY RETURN: não salva!
```

**Se `chaveId` não for encontrado em `chaves`, a função retorna SEM chamar `salvarDados()`.**

---

## Causa Raiz

### Problema 1: Referência inconsistente entre `luta` prop e `chaves` prop

`PlacarCompleto` recebe `luta` e `chaves` como props de origens DIFERENTES:

| Prop | Origem | Tipo |
|------|--------|------|
| `luta` | `handleSelecionarLuta` → `setLutaSelecionada(luta)` | Objeto vindo de `SeletorLutas.chaveAtiva.lutas[idx]` |
| `chaves` | Estado de `ScoreboardPage` (setado por `carregarDados()`) | Array carregado da API (resposta JSON) |

O `chaveAtiva` do `SeletorLutas` é um **estado local** (linha 152) que só é atualizado via `useEffect` (linha 174) **exclusivamente** quando há uma chave com `status === "em_andamento"`. Em todas as outras situações (re-renderização por mudança de `chaves`, carregamento assíncrono, etc.), `chaveAtiva` mantém a referência original.

Quando o `handleTrocarChave()` recarrega os dados via `carregarDados()`, o `SeletorLutas` re-renderiza com novas referências de `chaves`, mas `chaveAtiva` continua apontando para o objeto ANTIGO. Embora os IDs sejam os mesmos, os objetos são diferentes.

**O ID do `luta` prop é o mesmo ID que está dentro de `chaves` — portanto o `find` DEVERIA funcionar em teoria.** No entanto, o NEXT.JS 16 tem comportamento de hidratação e renderização no servidor que pode causar divergências entre o estado inicial e os dados carregados assincronamente.

### Problema 2: `salvarDados` sempre usa POST e gera novo `id` + `criadoEm`

`app/hooks/useStorage.ts:68-73`:
```typescript
const dadosArea: DadosArea = {
  id: generateUUID(),                            // NOVO ID a cada save
  area,
  criadoEm: new Date().toISOString(),            // NOVA data de criação!
  chaves,
}
```

Isso significa que a cada `salvarDados`, o `id` do `DadosArea` muda e a data de criação é resetada. O POST no API route (linha 42-67) sobrescreve completamente o arquivo.

### Problema 3: `advanceWinner` sobrescreve `resultado` perdendo `AtletaDesclassificadoId`

`app/lib/bracket-utils.ts` — linhas 314-340, 369-394, 484-509:

Em TODAS as branches, `advanceWinner` cria um `novoResultado` e define:
```typescript
AtletaDesclassificadoId: null   // hardcoded!
```

Isso sobrescreve o valor que havia sido corretamente computado por `marcarLutaConcluida` (linhas 165-167 de `useStorage.ts`):
```typescript
AtletaDesclassificadoId: dadosResultado.desclassificacao
  ? (dadosResultado.desclassificacao === "atleta1" ? luta.atleta1?.id : luta.atleta2?.id) || null
  : null,
```

Isso causa **perda de dados** em casos de desclassificação.

### Problema 4: Early returns silenciosos em `marcarLutaConcluida`

`app/hooks/useStorage.ts` — linhas 129-133:

Quando a chave ou a luta não é encontrada, a função retorna o array original (`chavesAtualizadas`) SEM dar nenhum feedback. `handleConfirmarTipo` recebe esse array de volta e chama `setChaves(chavesAtualizadas)` — que é o mesmo conteúdo. Depois chama `onTrocarChave()` que recarrega os dados da API. Como nada foi salvo, os dados continuam os mesmos.

### Problema 5: `handleTrocarChave` não é aguardado (fire-and-forget)

`app/scoreboard/page.tsx` — linha 469:
```typescript
onTrocarChave()
```

`onTrocarChave` é `handleTrocarChave` que é `async`, mas não é `await`'do. Os state updates (`setLutaSelecionada(null)`, etc.) são disparados mas o `carregarDados()` roda concorrentemente. Isso pode criar race conditions durante a re-renderização.

---

## Arquivos e Lógicas que Precisam ser Corrigidos

---

### Arquivo 1: `app/hooks/useStorage.ts`

#### Correção 1.1: Mudar `salvarDados` para usar PUT (preservar `criadoEm`)

**Arquivo:** `app/hooks/useStorage.ts` — função `salvarDados` (linhas 64-86)

**Problema:** POST sempre escreve novo arquivo com novo `criadoEm` e ignora dados existentes.

**Solução:** Alterar para usar PUT (que faz merge com dados existentes) ou mudar a chamada para PUT:

```typescript
export async function salvarDados(area: string, chaves: ChaveLuta[]): Promise<boolean> {
  try {
    localStorage.setItem("bjj_tournament_area_nome", area)
    const response = await fetch(API_URL, {
      method: "PUT",  // <-- mudar de POST para PUT
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ area, chaves })
    })
    return response.ok
  } catch (error) {
    console.error("Failed to save data:", error)
    return false
  }
}
```

**Impacto:** O PUT handler no API route faz merge: preserva `criadoEm` existente, só atualiza `chaves` e `atualizadoEm`.

#### Correção 1.2: Adicionar validação robusta em `marcarLutaConcluida`

**Arquivo:** `app/hooks/useStorage.ts` — função `marcarLutaConcluida` (linhas 120-199)

**Problema:** Early returns silenciosos sem feedback.

**Solução:** Adicionar logging e verificação de retorno de `salvarDados`:

```typescript
export async function marcarLutaConcluida(
  area: string,
  chaveId: string,
  lutaId: string,
  dadosResultado: DadosResultadoLuta,
  chaves: ChaveLuta[]
): Promise<{ chaves: ChaveLuta[]; sucesso: boolean }> {
  const chavesAtualizadas = [...chaves]

  const chave = chavesAtualizadas.find(c => c.id === chaveId)
  if (!chave) {
    console.error(`marcarLutaConcluida: Chave ${chaveId} não encontrada em ${chaves.length} chaves`)
    return { chaves: chavesAtualizadas, sucesso: false }
  }

  const luta = chave.lutas.find(l => l.id === lutaId)
  if (!luta) {
    console.error(`marcarLutaConcluida: Luta ${lutaId} não encontrada na chave ${chaveId} (${chave.lutas.length} lutas)`)
    return { chaves: chavesAtualizadas, sucesso: false }
  }
  
  // ... resto do código ...

  const saveOk = await salvarDados(area, chavesFinais)
  if (!saveOk) {
    console.error("marcarLutaConcluida: salvarDados falhou!")
  }
  return { chaves: chavesFinais, sucesso: saveOk }
}
```

**Mudança no tipo de retorno:** `Promise<ChaveLuta[]>` → `Promise<{ chaves: ChaveLuta[]; sucesso: boolean }>`

#### Correção 1.3: Preservar `AtletaDesclassificadoId` no resultado passado para `advanceWinner`

**Arquivo:** `app/hooks/useStorage.ts` — linhas 140-168

**Problema:** O resultado criado tem `AtletaDesclassificadoId` correto, mas `advanceWinner` o sobrescreve com `null`.

**Solução:** O resultado deve ser passado para `advanceWinner` de forma que ele não recrie o resultado. OU, mais simples, modificar `advanceWinner` para preservar o campo (ver Correção 2.1).

---

### Arquivo 2: `app/lib/bracket-utils.ts`

#### Correção 2.1: Preservar `AtletaDesclassificadoId` em `advanceWinner`

**Arquivo:** `app/lib/bracket-utils.ts` — 3 branches que criam `novoResultado`:
- Final: linhas 314-340
- DSQ+BYE: linhas 369-394
- Normal: linhas 484-509

**Solução:** Em cada branch, mudar de:
```typescript
AtletaDesclassificadoId: null,  // hardcoded — PERDE DADOS
```
Para:
```typescript
AtletaDesclassificadoId: luta.resultado?.AtletaDesclassificadoId || null,
```

**Exemplo (branch Normal, linha 508):**
```typescript
const novoResultado: ResultadoLuta = {
  id: crypto.randomUUID(),
  // ... todos os campos ...
  vencedorAtletaId: winner.id,
  perdedorAtletaId: loser.id,
  AtletaDesclassificadoId: luta.resultado?.AtletaDesclassificadoId || null,  // <-- corrigido
}
```

Mesma correção nas outras 2 branches (linhas 339 e 393), trocando `null` por `completed.resultado?.AtletaDesclassificadoId || null`.

---

### Arquivo 3: `app/scoreboard/page.tsx`

#### Correção 3.1: Derivar a luta a partir de `chaves` + `chaveId` no `PlacarCompleto`

**Arquivo:** `app/scoreboard/page.tsx` — componente `PlacarCompleto` (linhas 311-640)

**Problema:** `handleConfirmarTipo` usa `luta.id` do prop (que veio de `SeletorLutas`) e `chaves` (do estado da `ScoreboardPage`). Se as referências divergirem, `marcarLutaConcluida` não encontra a luta.

**Solução:** Adicionar um `useMemo` que deriva a luta atual a partir de `chaves` + `chaveId`, garantindo que venham da mesma árvore de objetos:

```typescript
// Dentro de PlacarCompleto, após a declaração dos props (linha 311):
interface PlacarCompletoProps {
  area: string
  chaves: ChaveLuta[]
  setChaves: React.Dispatch<React.SetStateAction<ChaveLuta[]>>
  chaveId: string
  luta: Luta            // ← manter por compatibilidade, mas não usar diretamente
  onTrocarChave: () => void
}

function PlacarCompleto({ area, chaves, setChaves, chaveId, luta: lutaProp, onTrocarChave }: PlacarCompletoProps) {
  const lutaRef = useRef(lutaProp.id)
  
  // Deriva a luta das chaves atuais para garantir consistência
  const luta = useMemo(() => {
    const chave = chaves.find(c => c.id === chaveId)
    const encontrada = chave?.lutas.find(l => l.id === lutaRef.current)
    return encontrada || lutaProp  // fallback para a prop original
  }, [chaves, chaveId, lutaProp])
```

**Efeito:** `luta.id` usado em `handleConfirmarTipo` (linha 459) passa a ser SEMPRE da mesma árvore que `chaves`.

#### Correção 3.2: Atualizar `handleConfirmarTipo` e `handleSalvarDSQ` para tratar retorno

**Arquivo:** `app/scoreboard/page.tsx` — linhas 376-416 e 430-469

**Problema:** As funções ignoram se o save foi bem-sucedido. Mesmo que `marcarLutaConcluida` retorne sem salvar, elas continuam o fluxo normal.

**Solução:** Verificar o retorno e condicionar `onTrocarChave()` ao sucesso:

```typescript
const handleConfirmarTipo = async (tipo: "pontos" | "finalizacao") => {
  // ... montar dadosResultado ...

  const resultado = await marcarLutaConcluida(area, chaveId, luta.id, dadosResultado, chaves)

  if (!resultado.sucesso) {
    console.error("Falha ao salvar resultado da luta")
    // Opcional: mostrar toast de erro
    return  // ← NÃO volta para a tela de chaves se falhou
  }

  setChaves(resultado.chaves)
  // ... resetar modais ...
  onTrocarChave()
}
```

**Adaptação para `handleSalvarDSQ`** (linhas 376-416): mesmo padrão.

#### Correção 3.3: Aguardar `onTrocarChave()` em `handleConfirmarTipo`

**Arquivo:** `app/scoreboard/page.tsx` — linha 469

**Problema:** `onTrocarChave()` é async mas não é `await`'do.

**Solução:**

```typescript
onTrocarChave()  // ❌ atual
```

```typescript
await onTrocarChave()  // ✅ corrigido
```

**Efeito:** Garante que `carregarDados()` complete antes do componente re-renderizar com o estado resetado.

#### Correção 3.4: Atualizar `SeletorLutas.chaveAtiva` quando `chaves` mudar

**Arquivo:** `app/scoreboard/page.tsx` — `SeletorLutas` (linhas 151-299)

**Problema:** `useEffect` na linha 174 só atualiza `chaveAtiva` se encontrar chave `"em_andamento"`. Se `chaves` for recarregada (ex: após `handleTrocarChave`), `chaveAtiva` ainda aponta para o objeto antigo.

**Solução:** Ampliar o `useEffect` para também atualizar `chaveAtiva` quando a chave ativa não for mais encontrada no novo `chaves`:

```typescript
useEffect(() => {
  // Priority 1: chave com "em_andamento"
  const emAndamento = chaves.find(c => c.status === "em_andamento")
  if (emAndamento && (!chaveAtiva || chaveAtiva.status !== "em_andamento")) {
    setChaveAtiva(emAndamento)
    localStorage.setItem("bjj_tournament_ultima_categoria", emAndamento.id)
    return
  }

  // Priority 2: se chaveAtiva atual não existe mais nas novas chaves
  if (chaveAtiva && !chaves.some(c => c.id === chaveAtiva.id)) {
    const novaChave = chaves[0] || null
    setChaveAtiva(novaChave)
    if (novaChave) {
      localStorage.setItem("bjj_tournament_ultima_categoria", novaChave.id)
    }
  }
}, [chaves])
```

#### Correção 3.5: Atualizar a assinatura de `marcarLutaConcluida`

**Arquivo:** `app/scoreboard/page.tsx` — import (linha 11) e usos (linhas 403-408, 456-462)

A função `marcarLutaConcluida` agora retorna `{ chaves: ChaveLuta[]; sucesso: boolean }`, então a desestruturação precisa mudar:

```typescript
import { getDadosIniciais, adicionarNovaLuta, marcarLutaConcluida, type ResultadoSave } from "@/app/hooks/useStorage"
```

```typescript
const { chaves: chavesAtualizadas, sucesso } = await marcarLutaConcluida(
  area, chaveId, luta.id, dadosResultado, chaves
)
```

---

### Arquivo 4: `app/api/area/route.ts`

#### Correção 4: Validar estrutura dos dados no POST

**Arquivo:** `app/api/area/route.ts` — handler POST (linhas 42-67)

**Problema:** O handler não valida se `chaves` é um array de objetos válidos. Se dados corrompidos forem enviados, ainda assim o arquivo é escrito.

**Solução:** Adicionar validação básica:

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { area, chaves } = body

    if (!area) {
      return NextResponse.json({ error: "Area name is required" }, { status: 400 })
    }

    if (!Array.isArray(chaves)) {
      return NextResponse.json({ error: "Chaves must be an array" }, { status: 400 })
    }

    // Validar estrutura básica de cada chave
    for (const chave of chaves) {
      if (!chave.id || !chave.categoria || !Array.isArray(chave.lutas)) {
        return NextResponse.json({
          error: `Chave inválida: ${chave.categoria || "sem categoria"}`
        }, { status: 400 })
      }
    }

    await ensureDataDir()
    const filePath = getAreaFilePath(area)
    
    const dados = {
      area,
      chaves,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    }

    await writeFile(filePath, JSON.stringify(dados, null, 2), "utf-8")
    return NextResponse.json({ success: true, message: "Area saved successfully" })
  } catch (error) {
    console.error("POST /api/area error:", error)
    return NextResponse.json({ error: "Failed to save area data" }, { status: 500 })
  }
}
```

---

## Resumo de Todas as Correções

| # | Arquivo | O que corrigir | Impacto |
|---|---------|---------------|---------|
| 1.1 | `app/hooks/useStorage.ts` | `salvarDados`: usar PUT em vez de POST | Preserva `criadoEm`; usa merge lógico |
| 1.2 | `app/hooks/useStorage.ts` | `marcarLutaConcluida`: retornar `{ chaves, sucesso }` | Permite caller detectar falha |
| 1.3 | `app/hooks/useStorage.ts` | Preservar `AtletaDesclassificadoId` | Dados de desclassificação não são perdidos |
| 2.1 | `app/lib/bracket-utils.ts` | 3 branches: `AtletaDesclassificadoId` ← ler do resultado original | Dados de desclassificação preservados |
| 3.1 | `app/scoreboard/page.tsx` | `PlacarCompleto`: derivar luta de `chaves` + `chaveId` (useMemo + useRef) | Garante que `luta` e `chaves` estão sempre na mesma árvore |
| 3.2 | `app/scoreboard/page.tsx` | `handleConfirmarTipo`/`handleSalvarDSQ`: verificar `sucesso` do retorno | Só volta à tela de chaves se salvou |
| 3.3 | `app/scoreboard/page.tsx` | `await onTrocarChave()` | Aguarda recarregamento antes de resetar estado |
| 3.4 | `app/scoreboard/page.tsx` | `SeletorLutas.useEffect`: atualizar `chaveAtiva` se chave atual sumiu | `chaveAtiva` sempre espelha `chaves` prop |
| 3.5 | `app/scoreboard/page.tsx` | Import e uso de `marcarLutaConcluida` com nova assinatura | Adaptação à mudança de retorno |
| 4 | `app/api/area/route.ts` | POST: validar estrutura de `chaves` | Rejeita dados corrompidos |

---

## Fluxo Correto Pós-Correção

```
Setup (importa JSONs)
  ↓
salvarDados(area, chaves) — usa PUT (preserva criadoEm)
  ↓
Navega para /scoreboard
  ↓
carregarDados() — carrega dados da API
  ↓
SeletorLutas — chaveAtiva derivada de chaves (sempre sincronizada)
  ↓
Usuário clica "Iniciar →"
  ↓
PlacarCompleto:
  - luta = useMemo() derivado de chaves + chaveId
  - luta.id sempre consistente com chaves
  ↓
handleConfirmarTipo → marcarLutaConcluida
  ↓
marcarLutaConcluida:
  - Busca chave/luta em chaves (sempre encontra)
  - Cria resultado (preserva AtletaDesclassificadoId)
  - advanceWinner: preserva AtletaDesclassificadoId
  - salvarDados: PUT → sucesso
  - Retorna { chaves, sucesso: true }
  ↓
handleConfirmarTipo:
  - Verifica sucesso === true
  - setChaves(chavesAtualizadas)
  - await onTrocarChave()
  ↓
carregarDados() — recarrega dados salvos da API
  ↓
SeletorLutas — mostra luta como concluída ✅
```
