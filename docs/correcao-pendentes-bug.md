# Plano de Correção: Contagem de Lutas Pendentes Ignorando BYE

## Bug

No `/scoreboard`, ao selecionar uma chave no `<select>`, o texto mostra "1 pendente" mesmo quando a chave já terminou (ex: chave `5643ab37-2a5f-4b73-a664-feb2c9264b22` — "Branca Adulto Masculino - 65kg").

## Causa Raiz

A chave tem 4 lutas, sendo uma delas um **BYE** (apenas 1 atleta, tag `"AVANÇOU"`). O BYE tem `resultado.status: "pendente"` no JSON persistido (`data/area-1.json:77`), mas **nunca é uma luta real**. O filtro usado para contar pendentes:

```
chave.lutas.filter(l => l.resultado?.status !== "concluida").length
```

conta o BYE como pendente porque seu status nunca é alterado para `"concluida"`.

Consequências:
- O `<select>` mostra "1 pendente" mesmo com todas as lutas reais concluídas
- A `chave.status` fica `"em_andamento"` em vez de `"concluida"` (linha 189 do `useStorage.ts`)
- O BYE nunca tem seu `resultado.status` atualizado

## Arquivos a Modificar

### 1. `app/lib/bracket-utils.ts`

**O que**: Em `advanceWinner()`, onde o BYE é taggeado com `"AVANÇOU"` (linhas ~417, ~433), adicionar a marcação do `resultado` como `"concluida"`.

**Detalhes**: Quando uma luta BYE recebe a tag `"AVANÇOU"`, seu `resultado.status` deve ser setado para `"concluida"`, com `vencedor` apontando para o atleta que avançou, `vencedorAtletaId` populado, e demais campos zerados. Isso faz com que o filtro existente já passe a ignorá-la corretamente.

**Localizações no código** (2 ocorrências):
- ~linha 416: `if (luta.id === round2ByeLuta.id) { return { ...luta, tags: ["AVANÇOU"] } }`
- ~linha 432: `if (luta.id === round2ByeLuta.id) { return { ...luta, tags: ["AVANÇOU"] } }`

### 2. `app/hooks/useStorage.ts`

**O que**: Alterar a checagem de `temLutasPendentes` (linha 189) para excluir lutas BYE.

**Detalhes**: Substituir:
```ts
const temLutasPendentes = (chaveResult as ChaveLuta).lutas.some(
  l => l.resultado?.status !== "concluida"
)
```
por:
```ts
const temLutasPendentes = (chaveResult as ChaveLuta).lutas.some(
  l => !isByeSlot(l) && l.resultado?.status !== "concluida"
)
```
É necessário importar `isByeSlot` de `@/app/lib/bracket-utils`.

### 3. `app/scoreboard/page.tsx`

**O que**: Alterar o filtro de pendentes no `<select>` (linha 227).

**Detalhes**: Substituir:
```ts
const pendentes = chave.lutas.filter(l => l.resultado?.status !== "concluida").length
```
por:
```ts
const pendentes = chave.lutas.filter(l => !isByeSlot(l) && l.resultado?.status !== "concluida").length
```
Importar `isByeSlot` de `@/app/lib/bracket-utils`.

### 4. `app/components/scoreboard/SeletorLuta.tsx`

**O que**: Alterar o filtro de pendentes no `<select>` (linhas 76-78).

**Detalhes**: Mesma substituição do item 3. Importar `isByeSlot` de `@/app/lib/bracket-utils`.

### 5. `app/components/scoreboard/BracketPanel.tsx`

**O que**: Alterar o filtro de pendentes no `<select>` (linha 30).

**Detalhes**: Mesma substituição do item 3. Importar `isByeSlot` de `@/app/lib/bracket-utils`.

### 6. `app/hooks/useImportacao.ts`

**O que** (Opcional — preventivo): Durante o `processarChave()` (linha 50), identificar lutas BYE e marcá-las como `"concluida"` já na importação, com `vencedor` apontando para o atleta presente. Isso evita que novas importações gerem o mesmo problema.

### 7. `data/area-1.json` (correção de dados existentes)

**O que**: Corrigir o estado atual dos dados para a chave `5643ab37-...`.

**Detalhes**: A luta `8a85c4c8-6773-4006-9a7c-a32a899a904f` (BYE, Round 1, Position 1) deve ter seu `resultado` alterado para:
```json
{
  "status": "concluida",
  "vencedor": "atleta1",
  "vencedorAtletaId": "atleta-003"
}
```
E o `status` da chave (linha 184) deve ser alterado de `"em_andamento"` para `"concluida"`.

Também corrigir a segunda chave BYE (`40373005-...`) se aplicável — luta `694a652b-...` (Round 1, Position 2) também é BYE e está com `status: "pendente"`.

### 8. (Opcional) Script de migração em `app/lib/migrate-ids.ts`

**O que**: Adicionar uma migração que percorra todas as chaves e corrija lutas BYE que estão com `status: "pendente"`, setando-as para `"concluida"`. Isso garante que dados já existentes de outras áreas também sejam corrigidos automaticamente.

## Função Utilitária Chave

`isByeSlot()` já existe em `app/lib/bracket-utils.ts:624`:
```ts
export function isByeSlot(luta: Luta): boolean {
  return !luta.atleta1?.id || !luta.atleta2?.id
}
```

## Ordem Sugerida de Implementação (BYE)

1. Modificar `app/lib/bracket-utils.ts` — marcar BYE como concluído em `advanceWinner`
2. Modificar `app/hooks/useStorage.ts` — excluir BYE de `temLutasPendentes`
3. Modificar `app/scoreboard/page.tsx` — excluir BYE da contagem visual
4. Modificar `app/components/scoreboard/SeletorLuta.tsx` — excluir BYE da contagem visual
5. Modificar `app/components/scoreboard/BracketPanel.tsx` — excluir BYE da contagem visual
6. Corrigir `data/area-1.json` — dados corrompidos existentes
7. (Opcional) Adicionar migração em `migrate-ids.ts`
8. (Opcional) Adicionar proteção em `useImportacao.ts` na importação

---

# Bug 2: Seletor de Chave Não Funciona Após Chave ser Concluída

## Bug

No `/scoreboard`, depois que a última luta de uma chave é finalizada (ex: Carlos vence a final da chave `5643ab37-...`), o `<select>` que permite trocar de chave para de funcionar — o usuário não consegue mais selecionar outra chave.

## Causa Raiz

### Causa Primária: `useEffect` auto-força seleção para chave `"em_andamento"`

No componente `SeletorLutas` (`app/scoreboard/page.tsx`, linhas 174-189), existe um `useEffect` que monitora mudanças em `chaves` e `chaveAtiva`:

```tsx
useEffect(() => {
    const emAndamento = chaves.find(c => c.status === "em_andamento")
    if (emAndamento && (!chaveAtiva || chaveAtiva.status !== "em_andamento")) {
      setChaveAtiva(emAndamento)
      localStorage.setItem("bjj_tournament_ultima_categoria", emAndamento.id)
      return
    }

    if (chaveAtiva && !chaves.some(c => c.id === chaveAtiva.id)) {
      const novaChave = chaves[0] || null
      setChaveAtiva(novaChave)
      if (novaChave) {
        localStorage.setItem("bjj_tournament_ultima_categoria", novaChave.id)
      }
    }
  }, [chaves, chaveAtiva])
```

Esse efeito **sempre re-seleciona** qualquer chave com `status === "em_andamento"`, mesmo que o usuário tenha acabado de escolher outra chave no dropdown.

**Sequência do bug:**

1. Chave `5643ab37-...` está como `"em_andamento"` (devido ao BYE bug)
2. Usuário termina a última luta real → `handleConfirmarTipo()` → `onTrocarChave()` → `carregarDados()`
3. `SeletorLutas` é montado, `chaveAtiva` inicializa para `chaves[0]` (a chave `"em_andamento"`)
4. Usuário tenta selecionar outra chave no `<select>`
5. `handleChangeChave(novaChave)` → `setChaveAtiva(novaChave)`
6. O `useEffect` é disparado porque `chaveAtiva` mudou
7. O efeito encontra `chaves.find(c => c.status === "em_andamento")` → a chave original ainda está `"em_andamento"`
8. Entra no `if`: `emAndamento && (chaveAtiva.status !== "em_andamento")` → `true`
9. **`setChaveAtiva(emAndamento)`** → sobrescreve a escolha do usuário!

Isso acontece mesmo que o usuário queira simplesmente navegar para outra chave enquanto uma chave legítima está em andamento.

### Causa Secundária: BYE bug mantém chave como `"em_andamento"`

O bug do BYE (documentado acima) faz com que a chave permaneça com `status: "em_andamento"` mesmo depois que todas as lutas reais terminaram. Isso significa que o `useEffect` SEMPRE encontra uma `em_andamento` para forçar, mesmo quando a chave já deveria estar `"concluida"`.

Sem o BYE bug, a chave ficaria `"concluida"` e a condição `emAndamento && ...` seria falsa, permitindo a navegação. Com o BYE bug, o problema é permanente.

## Arquivos a Modificar

### 1. `app/scoreboard/page.tsx` — `SeletorLutas`, `useEffect` (linhas 174-189)

**O que**: Remover o bloco de auto-seleção para chave `"em_andamento"` do `useEffect`.

**Detalhes**: O bloco das linhas 175-180 deve ser removido. A função do `useEffect` deve se limitar apenas ao fallback para quando a `chaveAtiva` não existe mais no array `chaves` (linhas 182-188). A seleção inicial já é feita pelo `useState` initializer (linhas 152-162).

**Código resultante:**
```tsx
useEffect(() => {
    if (chaveAtiva && !chaves.some(c => c.id === chaveAtiva.id)) {
      const novaChave = chaves[0] || null
      setChaveAtiva(novaChave)
      if (novaChave) {
        localStorage.setItem("bjj_tournament_ultima_categoria", novaChave.id)
      }
    }
  }, [chaves, chaveAtiva])
```

### 2. `app/scoreboard/page.tsx` — `<select>` em `SeletorLutas` (linhas 218-234)

**O que**: Adicionar indicador visual de `"(concluída)"` no texto do `<option>` para chaves finalizadas, mantendo-as selecionáveis.

**Detalhes**: O `<option>` renderizado atualmente só mostra o contador de pendentes:
```tsx
{chave.categoria} ({pendentes} pendentes)
```

Para chaves com `status === "concluida"`, o texto deve exibir `"(concluída)"` ao invés do contador:
```tsx
{chave.categoria} ({pendentes} pendentes)
// Para concluída:
{chave.categoria} (concluída)
```

Como o elemento nativo `<option>` não permite estilização avançada (opacidade, cor de texto diferente), a distinção visual fica por conta do texto. Opcionalmente, pode-se substituir o `<select>` nativo por um componente customizado (ex: uma `<div>` com `role="combobox"`) que permita aplicar opacidade/estilo diferente por opção.

**Código alterado (mantendo `<select>` nativo):**
```tsx
{chaves.map((chave) => {
  const isConcluida = chave.status === "concluida"
  const pendentes = chave.lutas.filter(l => !isByeSlot(l) && l.resultado?.status !== "concluida").length
  return (
    <option key={chave.id} value={chave.id}>
      {chave.categoria} ({isConcluida ? "concluída" : `${pendentes} pendentes`})
    </option>
  )
})}
```

### 3. `app/lib/bracket-utils.ts` (BYE bug — já documentado acima)

**O que**: Necessário para corrigir a causa secundária. Sem o BYE bug, mesmo com o efeito problemático, a chave se tornaria `"concluida"` após a última luta e o efeito não a forçaria mais como seleção.

## Interdependência Entre os Bugs

- O Bug 1 (BYE counting errado) faz a chave ficar presa em `"em_andamento"`
- O Bug 2 (useEffect auto-selection) impede o usuário de trocar de chave enquanto qualquer chave estiver `"em_andamento"`
- **Corrigir apenas o Bug 2** já resolve o sintoma (poder trocar de chave), mas a chave ainda ficará incorretamente como `"em_andamento"` e o contador de pendentes ainda estará errado
- **Corrigir ambos** é necessário para o comportamento correto completo

## Ordem Sugerida de Implementação

1. Corrigir `app/scoreboard/page.tsx` (SeletorLutas, useEffect) — remover auto-seleção `"em_andamento"`
2. Seguir as correções do BYE bug na ordem documentada acima
