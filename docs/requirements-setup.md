# Requisitos - Tela de Setup de Área

**Versão:** 1.0  
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
| RF-001.2 | O nome da área deve ser salvo apenas uma vez (editável após definição, não editavel depois de clicar em proximo) | Obrigatório |
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
| RF-003.5 | Lutas pendentes devem permitir edição do nome do árbitro | Obrigatório | [Errado, o arbitro é por chave e não por luta]
| RF-003.6 | Cada luta pendente deve ter botão para iniciar a luta | Obrigatório | [Não é para ter botão de iniciar]

### RF-001: Gerenciamento de Dados

| ID | Descrição | Prioridade |
|----|-----------|------------|
| RF-004.1 | Os dados devem ser salvos automaticamente no localStorage | Obrigatório |
| RF-004.2 | Ao carregar a página, os dados devem ser restaurados do localStorage | Obrigatório |
| RF-004.3 | O usuário deve poder exportar todos os dados da área como JSON | Obrigatório | [O exporta area não vai mais ficar aqui, remova]
| RF-004.4 | O usuário deve poder limpar todos os dados com confirmação | Obrigatório |
| RF-004.5 | O arquivo exportado deve incluir: área, data de exportação, total de chaves, total de lutas, lutas concluídas | Obrigatório |

Eu posso excluir a chave da luta apos importa
o btão criar luta manualmente adiciona como se fosse um JSON importado
A categoria vem na chave não é usado nas lutas casadas

### RF-005: Navegação

| ID | Descrição | Prioridade |
|----|-----------|------------|
| RF-005.1 | O botão "Próximo" deve redirecionar para `/scoreboard` | Obrigatório |
| RF-005.2 | O botão deve estar desabilitado se não houver chaves importadas | Obrigatório |
| RF-005.3 | O botão "Criar Luta Manual" deve permitir criar luta sem importação | Obrigatório |
| RF-005.4 | O link "Voltar ao Início" deve redirecionar para `/` | Obrigatório |

depois de clicar em proximo, o usuario pode selecionar a chae ( deve trazer o nome da chave)

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
| **ChaveList** | Lista expansível de chaves com suas lutas |
| **ActionButtons** | Botões "Próximo", "Exportar" e "Criar Luta Manual" |

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
5. Sistema salva no arquivo JSON dentro cda aplicação
6. Exibe indicador visual de área definida

### CU-002: Importar Chaves

1. Usuário clica em "Selecionar Arquivos JSON"
2. Seleciona um ou mais arquivos
3. Sistema processa cada arquivo:
   - **Sucesso**: Adiciona à lista, exibe card verde
   - **Erro**: Exibe card vermelho com mensagem
4. Atualiza arquivo JSON dentro cda aplicação com novas chaves

### CU-003: Iniciar Luta

1. Usuário preenche nome do árbitro (opcional)
2. Clica no botão play de uma luta
3. Sistema atualiza status da chave para "em_andamento"
4. Sistema redireciona para `/scoreboard` com parâmetros da luta

---

## 7. Critérios de Aceitação

| ID | Critério | Teste |
|----|----------|-------|
| CA-001 | Campo de área permite entrada de texto | Inserir texto e verificar valor no state |
| CA-002 | Área não pode ser editada após definida | Definir área e tentar editar - não deve permitir |
| CA-003 | Múltiplos arquivos podem ser importados | Selecionar 3 arquivos JSON - todos devem ser processados |
| CA-004 | Arquivo inválido mostra erro específico | Importar JSON malformado - deve exibir mensagem de erro |
| CA-005 | Lista de chaves exibe todas as informações | Verificar categoria, quantidade, status, lutas |
| CA-006 | Botão próximo redireciona corretamente | Clicar em próximo com chaves - deve ir para /scoreboard |
| CA-007 | Botão próximo desabilitado sem chaves | Acessar sem importar - botão deve estar disabled |
| CA-008 | Dados persistem ao recarregar | Importar chaves, recarregar página - dados devem estar lá |
| CA-009 | Exportar gera JSON válido | Clicar exportar - arquivo deve ter todos os dados |
| CA-010 | Limpar dados remove tudo | Clicar limpar com confirmação - localStorage deve estar vazio |

---

## 8. Histórico de Versões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0 | 2026-05-16 | Versão inicial implementada |

---

*Documento criado em: 2026-05-16*