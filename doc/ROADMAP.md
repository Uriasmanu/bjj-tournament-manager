# Roadmap - BJJ Tournament Manager

## Status Geral
- **Início do projeto:** 2026-04-07
- **Versão atual:** 0.1.0 (MVP - Módulo de Competidores)
- **Progresso:** 1/8 módulos implementados (12.5%)

---

## Módulos do Sistema

### ✅ 1. Módulo de Competidores (Implementado)
- [x] Estrutura de dados (`types/index.ts`)
- [x] Criar competidor (`POST /api/competitors`)
- [x] Editar competidor (`PUT /api/competitors/:id`)
- [x] Listar competidores (`GET /api/competitors`)
- [x] Filtrable por faixa, equipe, nome
- [x] Filtragem de ativos/inativos
- [x] Soft delete de competidor (`DELETE /api/competitors/:id`)
- [x] Validação de campos (Zod)
- [x] UI página de competidores
- [x] UI formulário de cadastro/edição
- [x] Badge de faixa com cores
- [x] Persistência em `data/competitors.json`
- [x] Verificação de duplicidade (name + team)

**Funcionalidades pontuais faltantes:**
- [ ] Importar competidores (JSON)
- [ ] Exportar competidores (JSON)

---

### ⏳ 2. Módulo de Torneio (Planejado)
- [ ] Estrutura de dados para `Tournament`
- [ ] Criar torneio (`POST /api/tournaments`)
- [ ] Editar torneio (`PUT /api/tournaments/:id`)
- [ ] Listar torneios (`GET /api/tournaments`)
- [ ] Definir status: DRAFT → ACTIVE → COMPLETED
- [ ] UI página de torneios
- [ ] UI formulário de criação/edição
- [ ] Persistência em `data/tournament.json`
- [ ] Validação de datas (startDate < endDate)
- [ ] Soft delete de torneio

---

### ⏳ 3. Módulo de Árbitros (Planejado)
- [ ] Estrutura de dados para `Referee`
- [ ] Criar árbitro (`POST /api/referees`)
- [ ] Editar árbitro (`PUT /api/referees/:id`)
- [ ] Listar árbitros (`GET /api/referees`)
- [ ] Soft delete de árbitro
- [ ] UI página de árbitros
- [ ] UI formulário de cadastro/edição
- [ ] Persistência em `data/referees.json`
- [ ] Verificação se árbitro pode ser excluído (não vinculado a chave/área ativa)
- [ ] Filtro por graduação mínima (recomendado: Roxa)

---

### ⏳ 4. Módulo de Chaves (Brackets) (Planejado)
- [ ] Estrutura de dados para `Bracket` e `Match`
- [ ] Criar chave (`POST /api/brackets`)
  - [ ] Selecionar faixa (belt)
  - [ ] Definir limite de peso (min/max)
  - [ ] Filtrar competidores automaticamente
  - [ ] Opção de adicionar/remover competidor manualmente
- [ ] Editar chave (`PUT /api/brackets/:id`)
- [ ] Listar chaves (`GET /api/brackets`)
- [ ] Gerar bracket (algoritmo de eliminação simples)
  - [ ] Distribuição automática de bye para número ímpar
  - [ ] Criação de `Match[]` associadas
- [ ] Visualizar bracket em árvore
- [ ] Atribuir árbitro à chave
- [ ] Soft delete de chave (somente se PENDING)
- [ ] UI página de chaves
- [ ] UI editor de chave
- [ ] UI visualizador de bracket em árvore
- [ ] Persistência em `data/brackets.json`

---

### ⏳ 5. Módulo de Áreas de Luta (Planejado)
- [ ] Estrutura de dados para `Area` e `ScheduledMatch`
- [ ] Criar área (`POST /api/areas`)
- [ ] Editar área (`PUT /api/areas/:id`)
- [ ] Listar áreas (`GET /api/areas`)
- [ ] Atribuir árbitro principal à área
- [ ] Atribuir árbitro assistente à área (opcional)
- [ ] Programar luta em área (`POST /api/areas/:id/schedule`)
- [ ] Remover luta programada
- [ ] Avançar para próxima luta na fila
- [ ] Soft delete de área (somente se sem luta ativa)
- [ ] UI página de áreas
- [ ] UI programador de lutas
- [ ] UI exibição de fila de lutas por área
- [ ] Persistência em `data/areas.json`

---

### ⏳ 6. Módulo de Lutas Casadas (Planejado)
- [ ] Estrutura de dados para `MarriedMatch`
- [ ] Criar luta casada (`POST /api/married-matches`)
- [ ] Editar luta casada (`PUT /api/married-matches/:id`)
- [ ] Listar lutas casadas (`GET /api/married-matches`)
- [ ] Atribuir área à luta casada
- [ ] Remover luta casada
- [ ] Mover luta casada para outra área (se não iniciada)
- [ ] UI página de lutas casadas
- [ ] UI editor de luta casada
- [ ] Persistência em `data/marriedMatches.json`

---

### ⏳ 7. Módulo de Placar e Cronômetro (Planejado)
- [ ] Estrutura de dados para `MatchScore` e `ScoreAction`
- [ ] Iniciar luta em área (`POST /api/areas/:id/start-match`)
- [ ] Registrar ponto (adicionar score)
  - [ ] Pontos (0, 2, 3, 4, 6, 12 pontos)
  - [ ] Vantagem
  - [ ] Punição
- [ ] Cronômetro em tempo real
  - [ ] Iniciar/pausar/retomar cronômetro
  - [ ] Tempo total conforme faixa/categoria
  - [ ] Alerta em fim de tempo
- [ ] Desfazer última ação
- [ ] Finalizar luta
  - [ ] Por tempo (vencedor com maior pontuação)
  - [ ] Por finalização (toque manual)
- [ ] Persistência de `Match` com histórico de score
- [ ] UI página de luta ativa
- [ ] UI controle de pontuação (botões por ponto)
- [ ] UI cronômetro
- [ ] UI confirmação de vencedor

---

### ⏳ 8. Módulo de Relatórios e Exportação (Planejado)
- [ ] Relatório geral do torneio
  - [ ] Total de competidores
  - [ ] Total de chaves
  - [ ] Total de lutas
  - [ ] Total de áreas
- [ ] Relatório por faixa
- [ ] Relatório por chave
- [ ] Relatório por área
  - [ ] Lutas realizadas por tatame
  - [ ] Árbitros atuantes
- [ ] Relatório por árbitro
  - [ ] Chaves arbitradas
  - [ ] Lutas arbitradas
- [ ] Exportar dados completos (JSON consolidado)
  - [ ] `tournament.json`
  - [ ] `competitors.json`
  - [ ] `brackets.json`
  - [ ] `matches.json`
  - [ ] `areas.json`
  - [ ] `referees.json`
  - [ ] `marriedMatches.json`
- [ ] Importar dados (consolidar múltiplas fontes)
- [ ] Gerar relatório em PDF
- [ ] UI página de relatórios
- [ ] Persistência em `exports/[timestamp]_export.json`

---

## Tarefas Transversais

### Infraestrutura e Qualidade
- [ ] Testes unitários (Jest)
- [ ] Testes de integração
- [ ] Testes E2E (Playwright/Cypress)
- [ ] Linter e formatação (ESLint, Prettier)
- [ ] CI/CD (GitHub Actions ou similar)
- [ ] Documentação API (Swagger/OpenAPI)
- [ ] Deploy (Vercel, AWS, etc.)

### Experiência do Usuário
- [ ] Dark mode
- [ ] Responsividade mobile
- [ ] Acessibilidade (WCAG 2.1)
- [ ] Geração de relatórios em PDF
- [ ] Notificações em tempo real (WebSocket/SSE)
- [ ] Autenticação de usuários
- [ ] Controle de permissões por papel

### Performance e Segurança
- [ ] Paginação de listas grandes
- [ ] Cache estratégico
- [ ] Validação no backend
- [ ] Rate limiting
- [ ] Sanitização de entrada
- [ ] HTTPS obrigatório em produção

---

## Timeline Estimada

1. **Fase 1 (Atual):** Módulo de Competidores ✅
2. **Fase 2:** Módulo de Torneio + Árbitros (2-3 semanas)
3. **Fase 3:** Módulo de Chaves + Áreas (3-4 semanas)
4. **Fase 4:** Módulo de Placar e Cronômetro (2-3 semanas)
5. **Fase 5:** Módulo de Lutas Casadas + Relatórios (2-3 semanas)
6. **Fase 6:** Testes, Documentação e Deploy (2 semanas)

**Estimativa total:** 12-16 semanas para MVP completo

---

## Notas
- O projeto usa Next.js com armazenamento em arquivos JSON locais
- UI utiliza shadcn/ui + Tailwind CSS + Lucide React
- Validação com Zod
- Todas as exclusões são soft delete (`isActive: false`)
- O sistema não permite reset após iniciar (dados imutáveis)
