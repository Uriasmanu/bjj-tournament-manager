# Requisitos - Tela de Setup de Área

**Versão:** 1.1  
**Data:** 2026-05-16  
**Tela:** `/scoreboard/setup`  
**Status:** Implementado

---

## 1. Visão Geral

| Campo | Descrição |
|-------|-----------|
| **Nome** | Setup de Área |
| **Caminho** | `/scoreboard/setup` |
| **Resumo** | Tela de configuração inicial onde o organizador define a área de luta e importa as chaves de luta para uma competição |
| **Atores** | Organizador, Árbitr |
| **Dependências** | Tipos TypeScript (`ChaveLuta`, `Luta`, `DadosArea`), Hooks (`useStorage`, `useImportacao`) |

---

## 2. Requisitos Funcionais

### RF-001: Definição de Área

| ID | Descrição | Prioridade |
|----|-----------|------------|
| RF-001.1 | O usuário deve poder inserir o nome da área (ex: "Área 1", "Quadra A") | Obrigatório |
| RF-001.2 | O nome da área deve ser salvo apenas uma vez e não editável após clicar em Próximo | Obrigatório |
| RF-001.3 | O campo deve validar que o nome não está vazio antes de permitir a definição | Obrigatório |
| RF-001.4 | Após definida, a área deve exibir o nome com indicador visual de "Definida" | Obrigatório |

### RF-002: Importação de Chaves

| ID | Descrição | Prioridade |
|----|-----------|------------|
| RF-002.1 | O usuário deve poder selecionar múltiplos arquivos JSON simultaneamente | Obrigatório |
| RF-002.2 | O sistema deve validar o formato de cada arquivo JSON importado | Obrigatório |
| RF-002.3 | O sistema deve exibir feedback visual individual para cada arquivo (sucesso ou erro) | Obrigatório |
| RF-002.4 | Arquivos válidos devem ser adicionados à lista de chaves importadas | Obrigatório |
| RF-002.5 | Arquivos inválidos devem exibir mensagem de erro específica | Obrigatório |
| RF-002.6 | O estado de "importando" deve ser indicado durante o processamento | Obrigatório |
| RF-002.7 | O usuário deve poder limpar os resultados de importação | Obrigatório |

### RF-003: Exibição de Chaves Importadas

| ID | Descrição | Prioridade |
|----|-----------|------------|
| RF-003.1 | Cada chave importada deve exibir: categoria, quantidade de lutas, status | Obrigatório |
| RF-003.2 | O sistema deve mostrar o progresso de lutas concluídas (ex: 2/5) | Obrigatório |
| RF-003.3 | Cada luta dentro da chave deve exibir: nome dos atletas vs | Obrigatório |
| RF-003.4 | Lutas concluídas devem exibir o nome do vencedor | Obrigatório |
| RF-003.5 | Cada chave deve ter botão para excluir | Obrigatório |

### RF-004: Gerenciamento de Dados

| ID | Descrição | Prioridade |
|----|-----------|------------|
| RF-004.1 | Os dados devem ser salvos automaticamente no localStorage | Obrigatório |
| RF-004.2 | Ao carregar a página, os dados devem ser restaurados do localStorage | Obrigatório |
| RF-004.3 | O usuário deve poder limpar todos os dados com confirmação | Obrigatório |

### RF-005: Criar Luta Manual

| ID | Descrição | Prioridade |
|----|-----------|------------|
| RF-005.1 | O botão "Criar Luta Manual" deve abrir um modal/form | Obrigatório |
| RF-005.2 | O form deve ter campos: Atleta 1 (nome), Equipe 1, Atleta 2 (nome), Equipe 2 | Obrigatório |
| RF-005.3 | Os campos de nome são obrigatórios, equipes são opcionais | Obrigatório |
| RF-005.4 | Ao submeter, criar uma nova chave com categoria "Luta Manual" | Obrigatório |

### RF-006: Navegação

| ID | Descrição | Prioridade |
|----|-----------|------------|
| RF-006.1 | O botão "Próximo" deve redirecionar para `/scoreboard` | Obrigatório |
| RF-006.2 | O botão deve estar desabilitado se não houver chaves importadas | Obrigatório |
| RF-006.3 | O link "Voltar ao Início" deve redirecionar para `/` | Obrigatório |

### RF-007: Tela de Scoreboard

| ID | Descrição | Prioridade |
|----|-----------|------------|
| RF-007.1 | Ao acessar `/scoreboard`, carregar chaves do localStorage | Obrigatório |
| RF-007.2 | Se não houver chaves, exibir mensagem e botão para setup | Obrigatório |
| RF-007.3 | Se houver chaves, exibir lista de chaves com suas lutas pendentes | Obrigatório |
| RF-007.4 | Cada luta pendente permite clicar para iniciar a pontuação | Obrigatório |
| RF-007.5 | O header do placar mostra: área, categoria, botão Voltar e Trocar | Obrigatório |
| RF-007.6 | Ao clicar em "Trocar", volta para a seleção de lutas | Obrigatório |
| RF-007.7 | Ao finalizar, baixa JSON com resultado da luta | Obrigatório |

---

## 3. Requisitos de Interface

### Layout

| Requisito | Descrição |
|-----------|-----------|
| UI-001 | Fundo escuro (`bg-[#0A0A0A]`) |
| UI-002 | Largura máxima do conteúdo: `max-w-4xl` centralizado |
| UI-003 | Espaçamento vertical entre seções: `space-y-6` |
| UI-004 | Cards com fundo escuro (`bg-zinc-900`) e borda (`border-zinc-800`) |

### Componentes

| Componente | Descrição |
|------------|-----------|
| **AreaCard** | Campo de entrada + botão "Definir Área" ou área definida com Badge |
| **ImportacaoCard** | Botão para selecionar arquivos com loading state |
| **ResultadoImportacaoCard** | Lista de cards com ícone de sucesso/erro, nome do arquivo, detalhes |
| **ChaveList** | Lista de chaves com: categoria, status, progresso, botão excluir, campo árbitro |
| **ActionButtons** | Botões "Próximo" e "Criar Luta Manual" |

### Feedback Visual

| Tipo | Descrição |
|------|-----------|
| Sucesso | Card verde com `CheckCircle` |
| Erro | Card vermelho com `XCircle` |
| Loading | Texto "Importando..." no botão |
| Toast | Mensagem temporária (3s) após ações |

---

## 4. Requisitos de Dados

### Estrutura do JSON de Importação

```json
{
  "categoria": "Branca Infantil",
  "lutas": [
    {
      "id": 1,
      "round": 1,
      "atleta1": { "nome": "João Silva", "equipe": "Team Brasil" },
      "atleta2": { "nome": "Maria Santos", "equipe": "Team São Paulo" }
    }
  ]
}
```

### Estrutura de Dados Internos

```typescript
interface ChaveLuta {
  categoria: string
  lutas: Luta[]
  arbitro?: string
  status: "pendente" | "em_andamento" | "concluida"
}

interface DadosArea {
  area: string
  criadoEm: string
  chaves: ChaveLuta[]
}
```

### Validações

| Campo | Regra |
|-------|-------|
| `categoria` | Obrigatório, não vazio |
| `lutas` | Obrigatório, array não vazio |
| `atleta1.nome` | Obrigatório |
| `atleta2.nome` | Obrigatório |

---

## 5. Requisitos Não Funcionais

| Requisito | Descrição |
|-----------|-----------|
| **Performance** | Importação de arquivos deve ser assíncrona sem blocking |
| **UX** | Feedback imediato em todas as ações do usuário |
| **Segurança** | Validar JSON antes de processar para evitar erros |
| **Responsividade** | Layout deve funcionar em diferentes tamanhos de tela |

---

## 6. Casos de Uso

### CU-001: Definir Área

1. Usuário acessa a tela
2. Insere nome no campo
3. Clica em "Definir Área"
4. Sistema valida nome não vazio
5. Sistema salva no localStorage
6. Exibe indicador visual de área definida

### CU-002: Importar Chaves

1. Usuário clica em "Selecionar Arquivos JSON"
2. Seleciona um ou mais arquivos
3. Sistema processa cada arquivo:
   - **Sucesso**: Adiciona à lista, exibe card verde
   - **Erro**: Exibe card vermelho com mensagem
4. Atualiza localStorage com novas chaves

### CU-003: Excluir Chave

1. Usuário clica no botão de lixeira na chave
2. Sistema solicita confirmação
3. Se confirmado, remove chave da lista
4. Atualiza localStorage

### CU-004: Criar Luta Manual

1. Usuário clica em "Criar Luta Manual"
2. Sistema solicita nome do Atleta 1
3. Sistema solicita nome do Atleta 2
4. Sistema opcionalmente solicita equipes
5. Cria nova chave com categoria "Luta Manual"
6. Adiciona à lista de chaves

### CU-005: Prosseguir para Placar

1. Usuário clica em "Próximo"
2. Sistema verifica se há chaves
3. Se houver, redireciona para `/scoreboard`

---

## 7. Critérios de Aceitação

| ID | Critério | Teste |
|----|----------|-------|
| CA-001 | Campo de área permite entrada de texto | Inserir texto e verificar valor no state |
| CA-002 | Área não pode ser editada após definida | Definir área e tentar editar - não deve permitir |
| CA-003 | Múltiplos arquivos podem ser importados | Selecionar 3 arquivos JSON - todos devem ser processados |
| CA-004 | Arquivo inválido mostra erro específico | Importar JSON malformado - deve exibir mensagem de erro |
| CA-005 | Lista de chaves exibe todas as informações | Verificar categoria, quantidade, status, lutas |
| CA-006 | Árbitro é por chave, não por luta | Campo árbitro está no header da chave |
| CA-007 | Botão excluir remove a chave | Clicar em excluir - chave deve ser removida |
| CA-008 | Botão próximo redireciona corretamente | Clicar em próximo com chaves - deve ir para /scoreboard |
| CA-009 | Botão próximo desabilitado sem chaves | Acessar sem importar - botão deve estar disabled |
| CA-010 | Dados persistem ao recarregar | Importar chaves, recarregar página - dados devem estar lá |
| CA-011 | Criar Luta Manual adiciona nova chave | Criar luta manual - nova chave deve aparecer na lista |
| CA-012 | Limpar dados remove tudo | Clicar limpar com confirmação - localStorage deve estar vazio |

---

## 8. Histórico de Versões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.1 | 2026-05-16 | Corrigido: Árbitro por chave, removido botão iniciar, adicionado excluir, criado luta manual |
| 1.0 | 2026-05-16 | Versão inicial implementada |

---

*Documento atualizado em: 2026-05-16*