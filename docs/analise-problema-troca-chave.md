# Análise: Problema ao Trocar de Chave no Scoreboard

## Resumo

O usuário não consegue trocar de chave (categoria/bracket) na tela `/scoreboard`. Quando tenta selecionar uma chave diferente no dropdown, a seleção é revertida automaticamente para a chave que está com status `"em_andamento"`.

---

## Arquivos com Problemas

### 1. `app/scoreboard/page.tsx`

**Localização:** Função `SeletorLutas`, `useEffect` (linhas 174-189)

**Problema principal (impede a troca):**

O `useEffect` monitora as dependências `[chaves, chaveAtiva]` e, **sempre** que o usuário altera `chaveAtiva` manualmente (via `handleChangeChave`), o efeito reexecuta. A lógica interna verifica:

```typescript
const emAndamento = chaves.find(c => c.status === "em_andamento")
if (emAndamento && (!chaveAtiva || chaveAtiva.status !== "em_andamento")) {
  setChaveAtiva(emAndamento) // <-- SOBRESCREVE a escolha do usuário
  localStorage.setItem("bjj_tournament_ultima_categoria", emAndamento.id)
  return
}
```

Se existe qualquer chave com `status === "em_andamento"` e a chave atualmente selecionada NÃO está `"em_andamento"`, o efeito **sobrescreve** a `chaveAtiva` para a chave em andamento. Isso torna impossível selecionar uma chave pendente ou concluída via dropdown enquanto houver uma chave em andamento.

**Problema secundário:**

`handleTrocarChave` (linhas 46-51) recarrega os dados mas **não limpa** o item `bjj_tournament_ultima_categoria` do `localStorage`. Isso faz com que, ao remontar `SeletorLutas`, o estado inicial (`useState` linha 152) recupere uma chave potencialmente desatualizada do `localStorage`, contribuindo para comportamento inconsistente.

```typescript
const handleTrocarChave = async () => {
    await carregarDados()
    setLutaSelecionada(null)
    setChaveSelecionada(null)
    setChaveId("")
    // FALTA: limpar localStorage item "bjj_tournament_ultima_categoria"
}
```

---

### 2. `app/hooks/useStorage.ts`

**Localização:** Função `marcarLutaConcluida` (linhas 113-200)

**Problema:**

A função recebe `chaves` por parâmetro e usa este array para encontrar a chave e a luta. Após finalizar a luta, chama `advanceWinner` e depois `salvarDados`. O fluxo está correto, mas **não há verificação de concorrência**: se duas lutas forem finalizadas simultaneamente (improvável mas possível em cenários de teste), uma pode sobrescrever os dados da outra.

Mais relevante: o `advanceWinner` é chamado com `chaveResult` extraído de `chavesComLutaAtualizada`, que por sua vez foi mapeado a partir do array `chavesAtualizadas` (cópia do parâmetro `chaves`). Se o componente pai tiver uma versão desatualizada de `chaves` (devido ao closure do `PlacarCompleto`), a função pode operar sobre dados antigos.

**Observação:** O `PlacarCompleto` usa `useMemo` (linha 328) para encontrar a luta atual dentro de `chaves`. Se `chaves` estiver desatualizado, a luta pode não ser encontrada e o fallback `return encontrada || lutaProp` retorna a `lutaProp` original, que pode ter dados inconsistentes.

---

### 3. `app/api/area/route.ts`

**Localização:** Função `PUT` (linhas 82-115)

**Problema potencial:**

O método `PUT` faz merge dos dados existentes com os novos:

```typescript
const dados = {
  ...existingData,
  chaves: chaves || existingData.chaves,
  atualizadoEm: new Date().toISOString()
}
```

Se `chaves` for um array vazio (`[]`), ele é truthy, então a lógica `chaves || existingData.chaves` funciona. Mas se houver falha na serialização/parse do JSON no frontend, o array pode chegar vazio ou incompleto, sobrescrevendo dados existentes.

**Não há confirmação de escrita:** a função retorna `{ success: true }` imediatamente após `writeFile`, sem verificar se o arquivo foi realmente escrito em disco. O `GET` subsequente feito por `carregarDados()` pode receber dados parciais se o cache do sistema de arquivos não tiver sido atualizado.

---

## Fluxo do Problema (Passo a Passo)

1. Usuário importa múltiplas chaves (ex: Chave A "pendente", Chave B "pendente")
2. Usuário seleciona uma luta da Chave B → `handleSelecionarLuta` → `PlacarCompleto` é renderizado
3. O timer/placar inicia → `marcarLutaConcluida` NÃO é chamado ainda, mas... na verdade, o status da chave só muda quando uma luta é finalizada em `marcarLutaConcluida`:
   ```typescript
   const temLutasPendentes = (chaveResult as ChaveLuta).lutas.some(l => l.resultado?.status !== "concluida")
   return { ...c, status: temLutasPendentes ? "em_andamento" : "concluida" }
   ```
   O status só muda para `"em_andamento"` após uma luta ser concluída mas ainda haver lutas pendentes. Para chaves com apenas uma luta (ex: manual), a chave vai direto de "pendente" para "concluida".
4. Usuário finaliza a luta → status da Chave B vira `"em_andamento"` (se houver mais lutas) ou `"concluida"` (se era a última)
5. `handleTrocarChave` é chamado → dados recarregados → `SeletorLutas` é montado
6. Usuário tenta selecionar Chave A (status "pendente") no dropdown
7. `handleChangeChave` altera `chaveAtiva` para Chave A
8. `useEffect` roda: encontra Chave B com `status === "em_andamento"` → **sobrescreve** `chaveAtiva` de volta para Chave B
9. Usuário não consegue trocar de chave

---

## Arquivos que Precisam de Correção

| Arquivo | Linhas | Problema | Impacto |
|---------|--------|----------|---------|
| `app/scoreboard/page.tsx` | 152-189 | `useEffect` em `SeletorLutas` sobrescreve seleção manual do usuário | **IMPEDE** troca de chave |
| `app/scoreboard/page.tsx` | 46-51 | `handleTrocarChave` não limpa `localStorage` | Causa estado inconsistente ao remontar |
| `app/hooks/useStorage.ts` | 113-200 | `marcarLutaConcluida` pode operar com `chaves` desatualizado | Dados podem ficar inconsistentes |
| `app/api/area/route.ts` | 82-115 | `PUT` sem validação de escrita em disco | Rara inconsistência entre salvar e recarregar |
