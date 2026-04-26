# Roadmap de Implementação - Reorganização do BJJ Tournament Manager

## Visão Geral

Reorganização da aplicação para separar dois fluxos principais:
1. **Menu Principal** (`/`) - Escolher entre "Organizar Torneio" ou "Placar Eletrônico"
2. **Dashboard de Organização** (`/dashboard`) - Gerenciar torneio (sem acesso ao placar)
3. **Módulo de Placar** (`/scoreboard`) - Controle em tempo real das lutas (sem menus de organização)

---

## Fases de Implementação

### FASE 1 — Menu Principal e Reorganização de Rotas

**Objetivo:** Criar a tela inicial com menu de seleção e reorganizar o dashboard.

**Tarefas:**

1. **Criar página inicial (`/app/page.tsx`)**
   - Layout responsivo com dois cards principais
   - Card 1: "Organizar Torneio" (ícone Settings, cor azul)
     - Descrição: "Gerencie competidores, crie chaves, configure áreas de luta e organize todo o torneio"
     - Botão: "Acessar Dashboard" → `/dashboard`
   - Card 2: "Placar Eletrônico" (ícone Clock, cor ouro)
     - Descrição: "Controle em tempo real das lutas ativas, pontuação BJJ e cronômetro para projeção em TV"
     - Botão: "Abrir Placar" → `/scoreboard`
   - Design: Background escuro (gray-900), cards com hover effect dourado
   - Responsividade: Lado a lado em desktop, empilhado em mobile

2. **Criar pasta `/app/dashboard`**
   - Mover conteúdo do atual `/app/page.tsx` para `/app/dashboard/page.tsx`
   - Manter toda a lógica de organização (competidores, chaves, áreas, árbitros, etc.)
   - Remover referência ao placar do menu
   - Adicionar botão "Voltar" que leva para `/` (menu principal)

3. **Atualizar componentes do dashboard**
   - No arquivo dashboard/page.tsx, mudar seção de "Módulos Operacionais" para "Módulos de Organização"
   - Remover card "Placar Eletrônico" do menu principal do dashboard
   - Atualizar título de section se necessário

4. **Criar estilos para o Menu Principal**
   - Componentizar o menu em `components/MainMenu.tsx` (opcional, para reutilização)
   - Definir breakpoints responsive
   - Implementar hover effects com Tailwind

**Critério de Aceite:**
- Ao acessar `/`, exibir menu com dois cards principais
- Clicar em "Acessar Dashboard" leva para `/dashboard`
- Clicar em "Abrir Placar" leva para `/scoreboard`
- Dashboard não exibe card de placar
- Dashboard tem botão de voltar para `/`
- Layout responsivo funciona em mobile

**Tempo Estimado:** 2-3 horas

---

### FASE 2 — Reorganização do Módulo de Placar

**Objetivo:** Criar experiência dedicada ao placar, separada da organização.

**Tarefas:**

1. **Criar estrutura base do placar em `/app/scoreboard`**
   - `page.tsx` - Seletor de área (primeira tela do placar)
   - `[areaId]/page.tsx` - Placar interativo (já existe, revisar)

2. **Atualizar `/app/scoreboard/page.tsx`**
   - Remover referência ao menu de organização
   - Manter apenas seletor de área
   - Adicionar descrição clara sobre o módulo
   - Botão "Voltar" leva para `/` (menu principal)

3. **Atualizar `/app/scoreboard/[areaId]/page.tsx`**
   - Remover ou ocultar navbar de organização
   - Manter interface de placar totalmente focada em:
     - Seletor de área (se necessário trocar)
     - Placar em tempo real
     - Controles de pontuação
     - Cronômetro
   - Suporte a fullscreen sem elementos de organização
   - Botão de voltar leva para `/scoreboard` (seletor de área)

4. **Remover Links de Placar do Dashboard**
   - Garantir que `/dashboard` não tenha referência ao placar
   - Remover MenuCard ou Link para `/scoreboard`

5. **Atualizar componentes de placar**
   - Revisar `components/scoreboard/*` para garantir que não dependem de contextos de organização
   - Confirmar que hooks `useScoreboard` e `useTimer` funcionam independentemente

**Critério de Aceite:**
- Ao acessar `/scoreboard`, exibir seletor de área
- Botão "Voltar" no seletor leva para `/` (menu principal)
- Ao acessar `/scoreboard/[areaId]`, exibir placar sem elementos de organização
- Fullscreen funciona corretamente
- Nenhum link ou menu da organização está visível no placar

**Tempo Estimado:** 2-3 horas

---

### FASE 3 — Validação de Fluxos de Navegação

**Objetivo:** Garantir que os dois fluxos (organização e placar) funcionam independentemente.

**Tarefas:**

1. **Testar fluxo de organização**
   - `/` → clique "Organizar Torneio" → `/dashboard`
   - Dentro do dashboard, todos os links de organização funcionam
   - Dashboard não exibe elementos do placar
   - Botão "Voltar" retorna para `/`

2. **Testar fluxo de placar**
   - `/` → clique "Placar" → `/scoreboard`
   - Seletor de área funciona
   - Clicar em uma área → `/scoreboard/[areaId]`
   - Placar funciona completamente
   - Botão "Voltar" retorna para `/scoreboard`
   - De `/scoreboard` clicar "Voltar" retorna para `/`

3. **Testar responsividade**
   - Menu principal em mobile (cards empilhados)
   - Dashboard em mobile (layouts se ajustam)
   - Placar em mobile (cronômetro legível)

4. **Testar transições e estados**
   - Loading states durante navegação
   - Erro ao acessar rota inválida (ex: `/dashboard` sem torneio)
   - Erro ao acessar placar sem áreas

**Critério de Aceite:**
- Todos os fluxos funcionam conforme esperado
- Sem loops infinitos de navegação
- Sem elementos misturados entre seções
- Responsividade mantida em todas as telas

**Tempo Estimado:** 1-2 horas

---

### FASE 4 — Ajustes de UI/UX

**Objetivo:** Refinar a experiência visual e garantir consistência.

**Tarefas:**

1. **Menu Principal**
   - Revisar espaçamento dos cards
   - Validar cores (Settings = azul, Clock = ouro)
   - Ajustar tamanho de fontes para legibilidade
   - Adicionar ícones Lucide corretos
   - Testar hover effects

2. **Dashboard**
   - Confirmar que "Módulos de Organização" está bem nomeado
   - Verificar que cards não incluem placar
   - Revisar botão "Voltar" estilo e posicionamento
   - Testar header e stats cards

3. **Placar**
   - Revisar layout de seletor de área
   - Confirmar que interface de placar é intuitiva
   - Validar fullscreen em diferentes resoluções
   - Testar controles de pontuação

4. **Transições e Animações**
   - Adicionar smooth transitions entre pages
   - Revisar loading skeletons
   - Testar fade-ins/fade-outs

**Critério de Aceite:**
- Interface visualmente consistente
- Ícones corretos em todos os cards
- Cores seguem spec (azul para organização, ouro para placar)
- Fonte legível em todos os tamanhos
- Nenhum elemento "cortado" ou mal posicionado

**Tempo Estimado:** 1-2 horas

---

### FASE 5 — Documentação e Testes

**Objetivo:** Documentar a nova estrutura e realizar testes finais.

**Tarefas:**

1. **Atualizar Documentação**
   - Descrever novo fluxo no README
   - Documentar rotas principais
   - Explicar separação entre organização e placar

2. **Testes Manuais**
   - Testar todos os fluxos em diferentes navegadores
   - Testar em dispositivos móveis (simulador)
   - Verificar performance
   - Verificar loading e erros

3. **Testes de Regressão**
   - Verificar que funcionalidades de organização ainda funcionam
   - Verificar que placar continua funcionando
   - Verificar imports/exports

4. **Feedback Visual**
   - Adicionar toast/notificações onde apropriado
   - Melhorar mensagens de erro
   - Validar campos antes de submissão

**Critério de Aceite:**
- Documentação atualizada
- Todos os testes passam
- Sem erros no console
- Performance aceitável (carregamento < 2s)

**Tempo Estimado:** 2-3 horas

---

## Estrutura de Arquivos Resultante

```
app/
├── page.tsx                  # Menu Principal (novo)
├── dashboard/
│   └── page.tsx              # Dashboard de Organização (movido de app/page.tsx)
├── scoreboard/
│   ├── page.tsx              # Seletor de Área
│   └── [areaId]/
│       └── page.tsx          # Placar Interativo
├── competitors/              # Mantém estrutura existente
├── brackets/                 # Mantém estrutura existente
├── areas/                    # Mantém estrutura existente
├── referees/                 # Mantém estrutura existente
├── results/                  # Mantém estrutura existente
└── ...outros módulos...

components/
├── MainMenu.tsx              # Novo - Menu Principal (opcional)
├── MenuCard.tsx              # Reutilizado
├── StatsCard.tsx             # Reutilizado
├── scoreboard/               # Já existe
│   ├── ScorePanel.tsx
│   ├── FighterCard.tsx
│   ├── TimerDisplay.tsx
│   ├── TimerControls.tsx
│   ├── ScoreButton.tsx
│   ├── AreaSelector.tsx
│   ├── UndoButton.tsx
│   └── FinishMatchModal.tsx
└── ...outros componentes...
```

---

## Checklist de Implementação

- [ ] **FASE 1**
  - [ ] Criar página inicial (`/app/page.tsx`)
  - [ ] Mover dashboard para `/app/dashboard/page.tsx`
  - [ ] Remover card de placar do dashboard
  - [ ] Adicionar botão "Voltar" no dashboard
  - [ ] Testar navegação

- [ ] **FASE 2**
  - [ ] Revisar `/app/scoreboard/page.tsx`
  - [ ] Revisar `/app/scoreboard/[areaId]/page.tsx`
  - [ ] Remover links de organização do placar
  - [ ] Adicionar botão "Voltar" no seletor de área
  - [ ] Validar componentes de placar

- [ ] **FASE 3**
  - [ ] Testar fluxo de organização completo
  - [ ] Testar fluxo de placar completo
  - [ ] Testar responsividade
  - [ ] Testar transições

- [ ] **FASE 4**
  - [ ] Revisar UI do menu principal
  - [ ] Revisar UI do dashboard
  - [ ] Revisar UI do placar
  - [ ] Refinar cores e ícones

- [ ] **FASE 5**
  - [ ] Atualizar documentação
  - [ ] Executar testes manuais
  - [ ] Testes de regressão
  - [ ] Validar feedback visual

---

## Tempo Total Estimado

- Fase 1: 2-3 horas
- Fase 2: 2-3 horas
- Fase 3: 1-2 horas
- Fase 4: 1-2 horas
- Fase 5: 2-3 horas

**Total: 8-13 horas**

---

## Notas Importantes

1. **Sem Breaking Changes**: A reorganização não altera funcionalidades existentes, apenas reorganiza as rotas e fluxos de navegação.

2. **Independência dos Módulos**: Organização e Placar funcionam completamente independentes, sem compartilharem estado ou contexto.

3. **Preservação de Dados**: Todos os dados continuam sendo persistidos normalmente via JSON.

4. **Retrocompatibilidade**: Links antigos podem redirecionar (ex: `/` redireciona para `/dashboard` se necessário).

5. **Escalabilidade**: A nova estrutura facilita futuras expansões (ex: adicionar novo módulo de relatórios).

---

## Próximos Passos Após Implementação

1. Adicionar autenticação (se necessário)
2. Implementar histórico de torneios múltiplos
3. Adicionar temas (claro/escuro)
4. Otimizar performance com React.memo e lazy loading
5. Adicionar mais testes unitários e de integração
