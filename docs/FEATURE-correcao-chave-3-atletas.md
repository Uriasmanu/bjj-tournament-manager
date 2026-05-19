# Feature: Correção de Geração de Chave para 3 Atletas

## Objetivo

Documentar todas as alterações necessárias para corrigir o fluxo de chaves com exatamente 3 atletas.

O objetivo é:
- impedir a criação de `round 3` durante a importação;
- manter apenas `round 1` e `round 2` após importar uma chave de 3 atletas;
- criar `round 3` somente dinamicamente durante o torneio quando a condição de desclassificação for atendida.

---

## Estado atual do código avaliado

### 1. Importação de chaves

- `app/scoreboard/setup/page.tsx` inicialmente criava `round 3` em chaves de 3 competidores durante a importação.
- Esse comportamento foi removido na importação, mas o caminho de importação ainda não tem validação forte para descartar `round 3` vindo do JSON.
- `app/hooks/useImportacao.ts` gera posições com `generatePosition(lutas)` e importa os rounds conforme enviados, sem forçar a remoção de `round 3` pré-existente.

### 2. Lógica de avanço de bracket

- `app/lib/bracket-utils.ts` contém `advanceWinner()`, que já faz tratamento especial para chaves de 3 competidores.
- Hoje, `advanceWinner()` cria `round 3` ao detectar uma desclassificação no Round 1 e um `bye` existente, mas:
  - não valida se todas lutas do Round 1 foram concluídas;
  - não valida se a desclassificação ocorreu em uma luta real (não BYE);
  - ainda tem lógica de criação de duas lutas de `round 3` para outros cenários.

### 3. Fluxo de marcação de resultado

- `app/hooks/useStorage.ts` atualiza o resultado da luta e chama `advanceWinner()` com o vencedor/loser.
- Essa função é o ponto onde o `round 3` dinâmico deve ser criado corretamente.

---

## Requisitos do bug

Para `totalCompetidores === 3`:
- durante a importação, criar apenas `round 1` e `round 2`;
- não criar `round 3` automaticamente;
- criar `round 3` dinamicamente apenas se:
  1. a desclassificação ocorrer em uma luta real do `round 1`;
  2. todas as lutas do `round 1` estiverem concluídas;
  3. o torneio tiver exatamente 3 competidores.

### Estrutura esperada após importação

| Round | Position | Atleta1 | Atleta2 | Descrição |
|-------|----------|---------|---------|-----------|
| 1 | 0 | atleta | atleta | luta real |
| 1 | 1 | atleta | null | BYE |
| 2 | 1 | atleta | null | BYE avançado |

### Estrutura esperada após desclassificação

| Round | Position | Atleta1 | Atleta2 | Descrição |
|-------|----------|---------|---------|-----------|
| 1 | 0 | vencedor da luta real | perdedor desclassificado | luta concluída |
| 1 | 1 | BYE | null | BYE |
| 2 | 1 | atleta do BYE | null | BYE avançado |
| 3 | 0 | vencedor do Round 1 | atleta do BYE | luta criada dinamicamente |

---

## Plano detalhado de alterações

### 1. `app/scoreboard/setup/page.tsx`

Alterar `handleImportar()` para:
- manter apenas a criação de `round 1` e `round 2` quando houver BYE;
- remover qualquer bloco que adicione `round 3` para `isThreeCompetitors`;
- deixar a importação responsável apenas por montar o estado inicial da chave.

### 2. `app/hooks/useImportacao.ts`

Alterar o fluxo de importação para:
- normalizar os dados importados e reconstruir posições com `generatePosition(lutas)`;
- validar e descartar `lutas` com `round >= 3` em chaves de 3 competidores;
- garantir que o objeto final de importação contenha somente rounds 1 e 2 para chaves de 3 atletas.

### 3. `app/lib/bracket-utils.ts`

Alterar `advanceWinner()` para:
- detectar chaves com `totalCompetidores === 3`;
- somente criar `round 3` quando:
  - a luta concluída for do `round 1`;
  - a luta for real (ambos atletas têm `id`);
  - `resultado.tipoVitoria === "desclassificacao"`;
  - todas as lutas do `round 1` estiverem concluídas.

Adicionar helper(s) para:
- encontrar a luta de `round 2` que corresponde ao avanço do BYE;
- criar um único objeto `Luta` de `round 3`, `position: 0`, com `atleta1` vencedor do Round 1 e `atleta2` atleta do BYE;
- atribuir `previousMatchIds` com o ID do Round 1 e o ID da luta de Round 2 do BYE;
- inicializar o novo Round 3 como pendente.

### 4. `app/hooks/useStorage.ts`

Verificar se o fluxo de `marcarLutaConcluida()` já atualiza corretamente o resultado e invoca `advanceWinner()`.

### 5. `app/components/bracket/BracketLayout.tsx`

Revisar a label de exibição de `round 3` para chaves de 3 competidores. Se necessário, ajustar para que `round 3` seja exibido como final.

---

## Casos de teste necessários

### Cenário A: Importação de chave com 3 atletas

- importar JSON de chave com 3 competidores;
- validar que somente `round 1` e `round 2` existem;
- validar que não há `round 3`.

### Cenário B: Criação dinâmica de Round 3 após desclassificação

- iniciar com chave de 3 atletas importada;
- concluir a luta real do `round 1` com desclassificação;
- validar que todas as lutas do `round 1` estão concluídas;
- validar que `round 3` é criado automaticamente com uma única luta.

### Cenário C: Desclassificação em BYE não deve criar Round 3

- garantir que uma desclassificação em BYE não gere `round 3`.

### Cenário D: Round 1 ainda pendente não deve gerar Round 3

- garantir que `round 3` só seja criado quando todas as lutas do `round 1` estiverem concluídas.

---

## Resumo do que precisa ser alterado

| Arquivo | Alteração necessária |
|---------|----------------------|
| `app/scoreboard/setup/page.tsx` | remover criação de `round 3` na importação |
| `app/hooks/useImportacao.ts` | garantir importação segura e descartar `round 3` importado |
| `app/lib/bracket-utils.ts` | criar `round 3` dinamicamente apenas quando todas as condições forem atendidas |
| `app/hooks/useStorage.ts` | confirmar fluxo de resultado e dependência no `advanceWinner()` |
| `app/components/bracket/BracketLayout.tsx` | revisar label de `round 3` para chaves de 3 competidores |

---

## Importante

A correção deve ser feita em duas camadas:
1. prevenir `round 3` no estado inicial importado;
2. permitir `round 3` apenas no fluxo de torneio quando todas as condições especificadas forem atendidas.

Assim, a chave de 3 atletas começa consistente e a final dinâmica só aparece quando o torneio realmente exigir.

