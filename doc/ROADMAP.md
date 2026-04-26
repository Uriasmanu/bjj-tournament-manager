# Roadmap de Desenvolvimento - Módulo de Placar (Scoreboard)

## Objetivo
Criar as funcionalidades necessárias para que o módulo de Placar funcione conforme a especificação, permitindo controle em tempo real de lutas ativas com pontuação, cronômetro e integração com áreas e árbitros.

## Visão Geral
O roadmap descreve as etapas de implementação para construir suporte completo a:
- seleção de área para placar
- exibição de informações da luta (lutadores, árbitro, área)
- controle de pontuação BJJ (pontos, vantagens, punições)
- cronômetro programável manualmente
- finalização de lutas e atualização automática das chaves
- suporte a undo (desfazer última ação)
- layout otimizado para projeção em TV

## Fase 1 — Tipos e estrutura de dados
- Verificar e atualizar tipos `Match` e `MatchScore` em `types/index.ts` se necessário
- Adicionar tipos auxiliares para o placar:
  - `ScoreAction` (tipo de ação: addPoints, addAdvantage, addPenalty)
  - `TimerState` (elapsed, isRunning, duration)
- Atualizar `data/brackets.json` com estrutura de pontuação se necessário

## Fase 2 — Hook de cronômetro
- Criar `hooks/useTimer.ts` com funcionalidades:
  - `elapsed`: tempo decorrido em segundos
  - `isRunning`: estado do cronômetro
  - `duration`: duração total programada
  - `start()`: iniciar cronômetro
  - `pause()`: pausar cronômetro
  - `reset()`: zerar cronômetro
  - `setDuration(seconds)`: definir duração manualmente
- Implementar usando `useRef` e `setInterval`
- Estado apenas em memória (sem persistência entre abas)

## Fase 3 — Hook de placar e estado
- Criar `hooks/useScoreboard.ts` com gerenciamento de estado:
  - `match`: luta atual ativa na área
  - `area`: informações da área (nome, árbitro)
  - `fighters`: nomes e dados dos lutadores
  - `addPoints(fighter: 1|2, points: 2|3|4)`: adicionar pontos
  - `addAdvantage(fighter: 1|2)`: adicionar vantagem
  - `addPenalty(fighter: 1|2)`: adicionar punição
  - `undo()`: desfazer última ação
  - `finishMatch(winnerId: string, reason: 'points'|'submission')`: finalizar luta
  - Histórico de ações (stack) para suporte a undo
- Integração com APIs de áreas e chaves para buscar dados
- Validação de regras BJJ de pontuação

## Fase 4 — Componentes do placar
- Criar componentes auxiliares:
  - `ScorePanel`: painel principal com pontuações lado a lado
  - `ScoreButton`: botões para adicionar pontos/vantagens/punições
  - `TimerDisplay`: display do cronômetro com fonte mono
  - `TimerControls`: controles play/pause/reset
  - `AreaSelector`: seletor de área ativa
  - `FighterCard`: cartão com nome, pontos, vantagens, punições
  - `UndoButton`: botão para desfazer ação
  - `FinishMatchModal`: modal para finalizar luta com opções
- Design otimizado para TV/projeção (cores contrastantes, fonte grande)
- Usar shadcn/ui com customizações visuais

## Fase 5 — Páginas do placar
- Criar `app/scoreboard/page.tsx`:
  - Seletor de área
  - Redirecionamento para placar da área selecionada
- Criar `app/scoreboard/[areaId]/page.tsx`:
  - Layout fullscreen otimizado para TV
  - Placar interativo completo
  - Suporte a query param `?fullscreen=true` para ocultar navbar
- Responsividade para diferentes tamanhos de tela

## Fase 6 — Integração com áreas e árbitros
- Buscar dados da área ativa (nome, árbitro principal)
- Exibir nome do árbitro no placar
- Validar que área tem árbitro antes de iniciar placar
- Integração com módulo de competidores para nomes dos lutadores
- Atualização automática do bracket ao finalizar luta

## Fase 7 — Regras de negócio e validações
- Implementar regras BJJ:
  - Pontos: 2, 3, 4 pontos
  - Vantagens: +1 sem somar pontos
  - Punições: +1 ponto para o adversário no desempate
  - Vitória por pontos ou finalização
- Validações:
  - Não permitir ações se luta não estiver ativa
  - Cronômetro para automaticamente ao chegar em 00:00
  - Undo limitado à última ação
- Tratamento de erros e estados de loading

## Fase 8 — Testes e validação do módulo
- Testes unitários para:
  - Hook de cronômetro (start, pause, reset)
  - Hook de placar (addPoints, undo, finishMatch)
  - Regras de pontuação BJJ
  - Validações de estado
- Testes de integração para:
  - Integração com APIs de áreas e chaves
  - Persistência de resultados
- Casos de borda:
  - Luta sem árbitro
  - Undo múltiplo
  - Finalização por tempo vs finalização

## Fase 9 — Entrega e documentação
- Revisar UX e mensagens de erro
- Otimizar layout para projeção em TV
- Validar conformidade com spec do módulo 7
- Documentar uso do placar (controles, atalhos)
- Testar em diferentes navegadores e dispositivos
- Manter roadmap alinhado com `doc/spec.md`

## Localização do arquivo
- `doc/ROADMAP.md`

## Observação
Este roadmap foca no placar como módulo independente, mas integrado com áreas, árbitros e chaves. O cronômetro é programável manualmente e os resultados são registrados nas chaves ao finalizar a luta.