# Plano de Implementação - Tela de Setup de Área

**Tela:** `/scoreboard/setup`
**Objetivo:** Configurar área, importar chaves de luta e exportar resultados

---

## Visão Geral

Esta funcionalidade substitui completamente a página atual de setup, adicionando:

| Item | Descrição | Complexidade |
|------|-----------|--------------|
| 1 | Definição do nome da área (apenas primeira vez) | Baixa |
| 2 | Importar múltiplos JSONs de chaves de luta | Alta |
| 3 | Lista de chaves importadas comvisualização | Média |
| 4 | Edição do nome do árbitro por luta | Baixa |
| 5 | Botão iniciar luta (por par) | Média |
| 6 | Exportar JSON da área completa | Alta |

---

## Nova Funcionalidade: Seleção de Chave e Lutadores no Placar

**Local:** Tela de placar `/scoreboard`
**Objetivo:** Permitir selecionar qual chave/categoria e quais atletas vão lutar.

### Fluxo Alternativo (sem usar a lista de chaves)

1. Árbitros pode acessar o placar diretamente
2. Selecionar a chave/categoria (ex: Branca Infantil)
3. Escolher quais dois atletas vão lutar (ex: Lucas vs Caio)
4. Iniciar a luta normalmente

### Justificativa

Nem sempre as lutas seguem a ordem exata da chave importada. O árbitro pode precisar:
- Trocar a ordem das lutas
- Iniciar uma luta de outra chave
- Criar uma luta não prevista originalmente

---

## Fase 0: Seleção de Chave e Lutadores no Placar (Nova)

### Tarefas

- [ ] **T-000A** - Criar componente de seleção de chave (dropdown)
- [ ] **T-000B** - Carregar todas as chaves importadas da área
- [ ] **T-000C** - Exibir lista de categorias/chaves disponíveis
- [ ] **T-000D** - Criar seletor de atletas (dropdown para cada lado)
- [ ] **T-000E** - Listar todos os atletas da chave selecionada
- [ ] **T-000F** - Permitir escolher atleta 1 e atleta 2
- [ ] **T-000G** - Exibir preview da luta selecionada
- [ ] **T-000H** - Botão "Iniciar Luta" com os atletas selecionados

### Implementação - Estrutura de Dados

```typescript
// Lista de todos os atletas de uma chave (sem lutar)
interface AtletaDisponivel {
  nome: string
  equipe: string
  faixa?: string
  status: "disponivel" | "lutando" | "eliminado"
}

// Chave com lista de atletas disponíveis
interface ChaveComAtletas {
  categoria: string
  atletas: AtletaDisponivel[]
  lutasConcluidas: string[] // nomes dos vencedores
}
```

### Implementação - Componente SeletorChave

```tsx
interface SeletorLutaProps {
  chaves: ChaveLuta[]
  onSelecionar: (categoria: string, atleta1: Atleta, atleta2: Atleta) => void
}

export function SeletorLuta({ chaves, onSelecionar }: SeletorLutaProps) {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("")
  const [atleta1, setAtleta1] = useState<Atleta | null>(null)
  const [atleta2, setAtleta2] = useState<Atleta | null>(null)

  const chaveAtual = chaves.find(c => c.categoria === categoriaSelecionada)
  
  // Extrair atletas únicos de todas as lutas da chave
  const atletasDisponiveis = useMemo(() => {
    if (!chaveAtual) return []
    
    const nomes = new Set<string>()
    chaveAtual.lutas.forEach(luta => {
      nomes.add(luta.atleta1.nome)
      nomes.add(luta.atleta2.nome)
    })
    
    return Array.from(nomes).map(nome => {
      const luta = chaveAtual.lutas.find(l => 
        l.atleta1.nome === nome || l.atleta2.nome === nome
      )
      return {
        nome,
        equipe: luta?.atleta1.nome === nome 
          ? luta.atleta1.equipe 
          : luta?.atleta2.equipe || "",
        faixa: "Branca" // ou pegar do dados
      }
    })
  }, [chaveAtual])

  const podeIniciar = categoriaSelecionada && atleta1 && atleta2

  return (
    <div className="seletor-luta">
      {/* Seleção de Categoria/Chave */}
      <select 
        value={categoriaSelecionada}
        onChange={(e) => {
          setCategoriaSelecionada(e.target.value)
          setAtleta1(null)
          setAtleta2(null)
        }}
      >
        <option value="">Selecione a Categoria</option>
        {chaves.map(chave => (
          <option key={chave.categoria} value={chave.categoria}>
            {chave.categoria} ({chave.lutas.length} lutas)
          </option>
        ))}
      </select>

      {/* Seleção Atleta 1 */}
      <div className="atleta-selector">
        <label>Atleta 1 (Azul)</label>
        <select 
          value={atleta1?.nome || ""}
          onChange={(e) => setAtleta1(atletasDisponiveis.find(a => a.nome === e.target.value) || null)}
        >
          <option value="">Selecione...</option>
          {atletasDisponiveis.map(atleta => (
            <option key={atleta.nome} value={atleta.nome}>
              {atleta.nome} - {atleta.equipe}
            </option>
          ))}
        </select>
      </div>

      {/* VS */}
      <div className="vs">VS</div>

      {/* Seleção Atleta 2 */}
      <div className="atleta-selector">
        <label>Atleta 2 (Branco)</label>
        <select 
          value={atleta2?.nome || ""}
          onChange={(e) => setAtleta2(atletasDisponiveis.find(a => a.nome === e.target.value) || null)}
        >
          <option value="">Selecione...</option>
          {atletasDisponiveis.map(atleta => (
            <option key={atleta.nome} value={atleta.nome}>
              {atleta.nome} - {atleta.equipe}
            </option>
          ))}
        </select>
      </div>

      {/* Botão Iniciar */}
      <button 
        disabled={!podeIniciar}
        onClick={() => onSelecionar(categoriaSelecionada, atleta1!, atleta2!)}
      >
        Iniciar Luta
      </button>
    </div>
  )
}
```

### Layout Visual do Seletor

```
┌─────────────────────────────────────────────────────────────┐
│  Selecionar Luta                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Categoria: [Branca Infantil v]                             │
│                                                             │
│  Atleta 1 (Azul):  [Lucas v]                                │
│                  Lucas - Team Brasil                        │
│                                                             │
│       ┌─────────────────────────────────────┐              │
│       │              VS                      │              │
│       └─────────────────────────────────────┘              │
│                                                             │
│  Atleta 2 (Branco): [Caio v]                                │
│                  Caio - Team SP                             │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           INICIAR LUTA                                │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Integração no Fluxo

O seletor aparece como **modal ou seção inicial** no placar quando:
- A página é acessada sem parâmetros de luta
- Ou quando o usuário clica em "Nova Luta"

Depois de selecionar, os dados são passados para o restante do placar normalmente. |

---

## Estrutura de Dados

### JSON de Chave de Luta (importação)
```json
{
  "categoria": "Branca Infantil",
  "lutas": [
    {
      "id": 1,
      "round": 1,
      "atleta1": { "nome": "João Silva", "equipe": "Team Brasil" },
      "atleta2": { "nome": "Maria Santos", "equipe": "Team São Paulo" }
    },
    {
      "id": 2,
      "round": 1,
      "atleta1": { "nome": "Pedro Santos", "equipe": "Team Brasil" },
      "atleta2": { "nome": "Lucas Oliveira", "equipe": "Team SP" }
    }
  ]
}
```

### JSON de Área (salvo em `data/`)
```json
{
  "area": "Área 1",
  "criadoEm": "2026-05-16T10:00:00Z",
  "chaves": [
    {
      "categoria": "Branca Infantil",
      "lutas": [...],
      "vencedor": null,
      "status": "pendente"
    }
  ]
}
```

---

## Fase 1: Estrutura Base e Definição de Área

### Tarefas

- [ ] **T-001** - Criar tipo TypeScript para `DadosArea`, `ChaveLuta`, `Luta`
- [ ] **T-002** - Verificar se já existe arquivo JSON para a área
- [ ] **T-003** - Se não existir, mostrar campo para definir nome da área
- [ ] **T-004** - Se existir, carregar dados automaticamente
- [ ] **T-005** - Criar estrutura de pasta `data/` se não existir
- [ ] **T-006** - Função para salvar JSON da área

### Implementação - Tipos

```typescript
// types/setup.ts
interface Atleta {
  nome: string
  equipe: string
  faixa?: string
}

interface ResultadoLuta {
  pontosAtleta1: number
  pontosAtleta2: number
  vantagensAtleta1: number
  vantagensAtleta2: number
  penalidadesAtleta1: number
  penalidadesAtleta2: number
  tempoDecorrido: number
  finalizacao: boolean
  desclassificacao: "atleta1" | "atleta2" | null
  vencedor: "atleta1" | "atleta2" | "empate" | null
  tipoVitoria: "pontos" | "finalizacao" | "desclassificacao" | "empate"
  status: "pendente" | "concluida"
}

interface Luta {
  id: number
  round: number
  atleta1: Atleta
  atleta2: Atleta
  resultado?: ResultadoLuta
  arbitro?: string
  dataLuta?: string
}

interface ChaveLuta {
  categoria: string
  lutas: Luta[]
  vencedor?: string
  status: "pendente" | "em_andamento" | "concluida"
}

interface DadosArea {
  area: string
  criadoEm: string
  chaves: ChaveLuta[]
}
```

### Implementação - Verificar/Criar Área

```typescript
// Função para verificar se área existe
const verificarArea = (nomeArea: string): DadosArea | null => {
  const caminho = `data/${nomeArea.toLowerCase().replace(/\s+/g, '-')}.json`
  // Se existir, retorna os dados
  // Se não, retorna null (mostrar campo de definição)
}
```

---

## Fase 2: Importação de JSONs

### Tarefas

- [ ] **T-007** - Criar componente de drag-and-drop ou botão de seleção múltipla
- [ ] **T-008** - Validar estrutura do JSON importado
- [ ] **T-009** - Ler e mesclar chaves no array principal
- [ ] **T-010** - Exibir preview das chaves importadas
- [ ] **T-011** - Tratar erros de JSON inválido
- [ ] **T-012** - Salvar área automaticamente após importação
- [ ] **T-013** - Permitir importar mais de um arquivo

### Implementação - Leitura de Arquivos

```typescript
const handleImportarChaves = async (arquivos: FileList) => {
  const chavesImportadas: ChaveLuta[] = []

  for (const arquivo of arquivos) {
    const texto = await arquivo.text()
    const dados = JSON.parse(texto)
    
    // Validar estrutura mínima
    if (!dados.categoria || !Array.isArray(dados.lutas)) {
      throw new Error("JSON inválido: missing categoria or lutas")
    }

    // Adicionar IDs únicos às lutas se não existirem
    dados.lutas = dados.lutas.map((luta: any, index: number) => ({
      ...luta,
      id: luta.id || index + 1,
      round: luta.round || 1,
      resultado: { status: "pendente" }
    }))

    chavesImportadas.push(dados)
  }

  // Mesclar com chaves existentes
  const novasChaves = [...chavesExistentes, ...chavesImportadas]
  
  // Salvar
  await salvarArea({ ...dadosArea, chaves: novasChaves })
}
```

---

## Fase 3: Lista de Chaves e Visualização

### Tarefas

- [ ] **T-014** - Renderizar lista de chaves importadas
- [ ] **T-015** - Para cada chave, mostrar: categoria, número de lutas, progresso
- [ ] **T-016** - Indicador visual de status (pendente, em andamento, concluída)
- [ ] **T-017** - Exibir lista de lutas dentro de cada chave
- [ ] **T-018** - Mostrar nomes dos atletas de cada luta
- [ ] **T-019** - Mostrar resultado se luta já foi concluída

### Implementação - Componente ListaChaves

```tsx
// Estrutura visual de cada chave
<div className="chave-card">
  <div className="chave-header">
    <h3>{chave.categoria}</h3>
    <span className="badge">{chave.lutas.length} lutas</span>
    <span className={`status ${chave.status}`}>
      {chave.status === "concluida" ? "✓ Concluída" : "Pendente"}
    </span>
  </div>
  
  <div className="lutas-list">
    {chave.lutas.map(luta => (
      <div className="luta-item">
        <span>{luta.atleta1.nome}</span>
        <span>vs</span>
        <span>{luta.atleta2.nome}</span>
        
        {/* Se luta concluída, mostrar resultado */}
        {luta.resultado?.status === "concluida" && (
          <span className="resultado">
            {luta.resultado.vencedor === "atleta1" ? "✓" : "✗"}
          </span>
        )}
        
        {/* Botão iniciar se luta pendente */}
        <button onClick={() => iniciarLuta(chave.categoria, luta.id)}>
          Iniciar
        </button>
      </div>
    ))}
  </div>
</div>
```

---

## Fase 4: Edição de Árbitro e Iniciar Luta

### Tarefas

- [ ] **T-020** - Campo editável para nome do árbitro em cada luta
- [ ] **T-021** - Salvar nome do árbitro junto com a luta
- [ ] **T-022** - Botão "Iniciar" em cada luta pendente
- [ ] **T-023** - Ao iniciar, redirecionar para `/scoreboard` com parâmetros:
  - área
  - categoria
  - ID da luta
  - nomes dos atletas
  - equipes
  - nome do árbitro

### Implementação - Redirecionamento

```typescript
const iniciarLuta = (chaveCategoria: string, lutaId: number) => {
  const params = new URLSearchParams({
    area: dadosArea.area,
    categoria: chaveCategoria,
    lutaId: lutaId.toString(),
    atleta1: luta.atleta1.nome,
    equipe1: luta.atleta1.equipe,
    atleta2: luta.atleta2.nome,
    equipe2: luta.atleta2.equipe,
    arbitro: luta.arbitro || "",
  })
  
  router.push(`/scoreboard?${params.toString()}`)
}
```

---

## Fase 5: Exportação da Área

### Tarefas

- [ ] **T-024** - Criar botão "Exportar Área"
- [ ] **T-025** - Consolidar todas as chaves e resultados
- [ ] **T-026** - Gerar JSON completo com estrutura padronizada
- [ ] **T-027** - Iniciar download do arquivo
- [ ] **T-028** - Nome do arquivo: `area-[nome]-[data].json`

### Implementação - Exportar

```typescript
const exportarArea = () => {
  const dadosExport = {
    area: dadosArea.area,
    exportadoEm: new Date().toISOString(),
    totalChaves: dadosArea.chaves.length,
    totalLutas: dadosArea.chaves.reduce((acc, c) => acc + c.lutas.length, 0),
    lutasConcluidas: dadosArea.chaves.reduce(
      (acc, c) => acc + c.lutas.filter(l => l.resultado?.status === "concluida").length, 
      0
    ),
    chaves: dadosArea.chaves
  }

  const json = JSON.stringify(dadosExport, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement("a")
  a.href = url
  a.download = `area-${dadosArea.area.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`
  a.click()
  
  URL.revokeObjectURL(url)
}
```

---

## Layout Visual Esperado

```
┌─────────────────────────────────────────────────────────────┐
│  ← Voltar                                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ÁREA 1                                              │   │
│  │  定义 em: 16/05/2026 14:30                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  IMPORTAR CHAVES DE LUTA                            │   │
│  │  ┌─────────────────────────────────────────────┐     │   │
│  │  │  Arraste arquivos JSON aqui                 │     │   │
│  │  │  ou clique para selecionar                 │     │   │
│  │  └─────────────────────────────────────────────┘     │   │
│  │  [Selecionar Arquivos]                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ── CHAVES IMPORTADAS ─────────────────────────────────────│
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Branca Infantil (4 lutas)           [Concluída]   │   │
│  │  ├─ João vs Maria    (Pendente)  [Arbitro: ____]   │   │
│  │  ├─ Pedro vs Lucas   (Pendente)  [Arbitro: ____]   │   │
│  │  ├─ Paulo vs André   (Concluída) → João venceu     │   │
│  │  └─ Carlos vs Brian   (Concluída) → Pedro venceu     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Azul Adulto (2 lutas)               [Pendente]    │   │
│  │  ├─ Silva vs Santos  (Pendente)  [Arbitro: ____]    │   │
│  │  └─ Oliveira vs Costa (Pendente) [Arbitro: ____]    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [EXPORTAR ÁREA (JSON)]                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Checklist de Validação

### Fase 1 - Estrutura Base
- [ ] Tipos TypeScript definidos
- [ ] Verificação de área existente funciona
- [ ] Campo de definição de área (apenas primeira vez)
- [ ] Arquivo JSON pode ser criado

### Fase 2 - Importação
- [ ] Múltiplos arquivos podem ser selecionados
- [ ] Validação de estrutura do JSON
- [ ] Erros exibidos para JSON inválido
- [ ] Chaves mescladas corretamente
- [ ] Preview das chaves importadas

### Fase 3 - Lista de Chaves
- [ ] Todas as chaves renderizadas
- [ ] Status visível (pendente/concluída)
- [ ] Lutas listadas dentro de cada chave
- [ ] Resultados visíveis para lutas concluídas

### Fase 4 - Edição e Início
- [ ] Árbitro pode ser editado em cada luta
- [ ] Botão Iniciar redireciona corretamente
- [ ] Parâmetros passados via URL

### Fase 5 - Exportação
- [ ] Botão Exportar visível
- [ ] JSON gerado com todos os dados
- [ ] Download iniciado automaticamente
- [ ] Arquivo nomeado corretamente

---

## Pré-requisitos

- Pasta `data/` criada no diretório do projeto
- Componentes existentes do scoreboard funcionando

---

## Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| JSON mal formatado | Alto | Validação rigorosa antes de processar |
| Perda de dados | Alto | Auto-save após cada importação |
| Conflito de IDs | Médio | Gerar IDs únicos automaticamente |
|many arquivos grandes | Médio | Limitar tamanho ou mostrar loading |

---

*Roadmap criado em: 2026-05-16*
*Versão: 1.0*