# Roadmap de Desenvolvimento

## Objetivo
Criar as funcionalidades necessárias para que o módulo `5. Módulo de Áreas de Luta` funcione conforme a especificação.

## Visão Geral
O roadmap descreve as etapas de implementação para construir suporte completo a:
- cadastro de áreas de luta
- edição e exclusão de áreas
- vinculação de chaves/lutas às áreas
- manutenção de `bracketCount`
- atribuição de árbitros às áreas
- programação de lutas e fila de area
- validação de regras de negócio

## Fase 1 — Tipos e estrutura de dados
- Definir tipo `Area` em `src/types/index.ts`
- Definir tipo `ScheduledMatch`
- Adicionar campos obrigatórios:
  - `id`
  - `name`
  - `currentMatchId`
  - `scheduledMatches`
  - `refereeId`
  - `assistantRefereeId`
  - `bracketCount`
- Atualizar `data/areas.json` com estrutura inicial

## Fase 2 — Persistência e API
- Implementar leitura e escrita de `data/areas.json`
- Criar APIs:
  - `GET /api/areas`
  - `POST /api/areas`
  - `PUT /api/areas/[id]`
  - `DELETE /api/areas/[id]`
  - `POST /api/areas/[id]/schedule`
  - `POST /api/areas/[id]/assign-referee`
- Validar dados de entrada no servidor:
  - `name` obrigatório
  - `refereeId` somente árbitro ativo
  - não excluir área com luta ativa

## Fase 3 — Regras de negócio e integridade ✅
- Criar `lib/areaUtils.ts` com funções utilitárias:
  - `canStartMatch()`: valida se área pode iniciar luta
  - `canDeleteArea()`: valida se área pode ser excluída
  - `updateBracketCount()`: mantém bracketCount sincronizado
  - `addScheduledMatch()`: adiciona luta à fila com validações
  - `removeScheduledMatch()`: remove luta da fila
  - `advanceToNextMatch()`: avança para próxima luta da fila
  - `finishCurrentMatch()`: finaliza luta atual e avança
  - `assignMatchToArea()`: atribui luta diretamente à área
  - `reorderScheduledMatches()`: reordena fila de lutas
- Integrar validações nas APIs existentes:
  - Validação de árbitros ativos em criação/edição
  - Prevenção de exclusão com luta ativa
  - Controle de duplicatas em agendamento
  - Atualização automática de bracketCount

## Fase 4 — Hook de cliente e estado ✅
- Criar `hooks/useAreas.ts` com gerenciamento de estado:
  - `getAreas()`: busca áreas com filtro opcional
  - `createArea()`: cria nova área com validação
  - `updateArea()`: atualiza área existente
  - `deleteArea()`: exclui área com validações
  - `scheduleMatch()`: agenda luta na área
  - `assignReferee()`: atribui árbitros à área
  - `advanceMatch()`: avança para próxima luta
  - Tratamento de erros e estados de loading
- Criar API `POST /api/areas/[id]/advance` para avanço de lutas

## Fase 5 — UI de gerenciamento de áreas ✅
- Criar `app/areas/page.tsx` - página principal das áreas
- Criar componentes auxiliares:
  - `AreaCard`: exibe informações da área com status visual
  - `AreaForm`: formulário modal para criar/editar áreas
  - `AreaScheduleSummary`: resumo da agenda de lutas
- Implementar validações na UI:
  - Alerta visual quando árbitro não atribuído
  - Desabilitação de exclusão com luta ativa
  - Feedback visual de lutas ativas (ring verde)
- Criar componente `ui/form.tsx` para formulários consistentes
  - `updateArea`
  - `deleteArea`
  - `scheduleMatch`
  - `assignReferee`
  - `advanceMatch`
- Sincronizar com módulos de árbitros e chaves
- Manter refetch pós operação e feedback de erro

## Fase 5 — UI de gerenciamento de áreas
- Criar `src/app/areas/page.tsx`
- Exibir lista de áreas com:
  - nome
  - árbitro principal
  - árbitro assistente
  - fila de lutas
  - `bracketCount`
- Botões:
  - criar área
  - editar área
  - excluir área
  - abrir agenda da área
- Criar componentes auxiliares:
  - `AreaForm`
  - `AreaCard`
  - `AreaScheduleSummary`
- Validar na UI:
  - impedimento de exclusão com luta ativa
  - alerta quando não há árbitro

## Fase 6 — Agendamento de lutas e vínculo com chaves
- Criar `src/app/areas/[id]/schedule/page.tsx`
- Exibir fila de `scheduledMatches`
- Incluir controles:
  - agendar nova luta
  - remover luta agendada
  - avançar para próxima luta
- Garantir que o agendamento:
  - usa lutas existentes do módulo de chaves
  - não duplica `matchId`
  - respeita status da chave
- Atualizar `bracketCount` automaticamente

## Fase 7 — Atribuição de árbitros por área
- Implementar seleção de árbitro principal ativo
- Permitir árbitro assistente opcional
- Exibir árbitros na listagem de áreas
- Validar regra:
  - área ativa precisa de árbitro principal
  - alerta visual quando faltam árbitros

## Fase 8 — Testes e validação do módulo
- Testes unitários para:
  - criação/edição/exclusão de área
  - cálculo de `bracketCount`
  - bloqueio de exclusão com luta ativa
  - validação de árbitro ativo
- Testes de integração para API de áreas
- Casos de borda:
  - área sem árbitro
  - área com fila vazia
  - luta casada movida entre áreas

## Fase 9 — Entrega e documentação
- Revisar UX e mensagens de erro
- Cobrir estados vazios:
  - sem áreas cadastradas
  - sem lutas agendadas
- Validar conformidade com a spec do módulo 5
- Manter o roadmap alinhado com `doc/spec.md`

## Localização do arquivo
- `doc/ROADMAP.md`

---

## Observação
Se quiser, posso também gerar um roadmap mais detalhado apenas para o módulo de Áreas de Luta, com datas estimadas e dependências entre tarefas.