# Roadmap de Implementação - Feature Natal

**Adicionar funcionalidades à tela de placar:**
1. Botão Voltar
2. Criação manual de luta (atleta, faixa, equipe)
3. Finalizar luta e exportar JSON

---

## Visão Geral

Esta feature adiciona três funcionalidades à tela de placar existente:

| Item | Descrição | Complexidade |
|------|-----------|--------------|
| 1 | Botão Voltar na tela de placar | Baixa |
| 2 | Criação manual de luta (atleta, faixa, equipe) + Exibição visual da faixa | Média |
| 3 | Finalizar luta e exportar JSON | Alta |

---

## Fase 1: Botão Voltar

**Objetivo:** Adicionar botão de retorno na tela de placar.

### Tarefas

- [ ] **T-001** - Adicionar botão "Voltar" no header do scoreboard
- [ ] **T-002** - O botão deve redirecionar para `/scoreboard/setup`
- [ ] **T-003** - Estilizar o botão com ícone de seta e cor dourada
- [ ] **T-004** - Posicionar no canto superior esquerdo

### Implementação

No componente `ScoreHeader.tsx`:

```tsx
<Link href="/scoreboard/setup" className="text-[#D4AF37] hover:text-[#f0c844]">
  <ArrowLeft className="w-6 h-6" />
</Link>
```

---

## Fase 2: Criação Manual de Luta + Exibição de Faixa

**Objetivo:** Permitir criar/editarmanualmente os dados dos lutadores e exibir a cor da faixa no placar.

### Tarefas

- [ ] **T-005** - Criar componente `EditLutador` (modal ou campo editável)
- [ ] **T-006** - Adicionar campos editáveis para:
  - Nome do atleta
  - Faixa (Branca, Azul, Roxa, Marrom, Preta)
  - Equipe/Academia
- [ ] **T-007** - Permitir edição de ambos os atletas
- [ ] **T-008** - Salvar estado localmente durante a luta
- [ ] **T-009** - Na página de setup, permitir criar manualmente sem JSON

### NOVO - Exibição da Cor da Faixa no Placar

- [ ] **T-010** - Criar componente visual `BadgeFaixa` para exibir a cor
- [ ] **T-011** - Definir cores das faixas:
  - Branca: `#FFFFFF` (branco)
  - Azul: `#1E40AF` (azul)
  - Roxa: `#7C3AED` (roxo)
  - Marrom: `#78350F` (marrom)
  - Preta: `#000000` (preto)
- [ ] **T-012** - Exibir badge da faixa abaixo do nome do atleta
- [ ] **T-013** - Exibir texto da faixa (ex: "Faixa Branca") abaixo do nome

### Estrutura de Dados

```typescript
interface Lutador {
  nome: string
  faixa: string      // "Branca", "Azul", "Roxa", "Marrom", "Preta"
  equipe: string
}
```

### Cores das Faixas (Tailwind)

| Faixa | Cor de Fundo | Cor do Texto |
|-------|--------------|--------------|
| Branca | `bg-white` | `text-black` |
| Azul | `bg-blue-700` | `text-white` |
| Roxa | `bg-purple-700` | `text-white` |
| Marrom | `bg-amber-900` | `text-white` |
| Preta | `bg-black` | `text-white` |

### Implementação do Badge de Faixa

```tsx
interface BadgeFaixaProps {
  faixa: string
}

const coresFaixa: Record<string, string> = {
  "Branca": "bg-white text-black border-2 border-gray-300",
  "Azul": "bg-blue-700 text-white",
  "Roxa": "bg-purple-700 text-white",
  "Marrom": "bg-amber-900 text-white",
  "Preta": "bg-black text-white border-2 border-gray-500",
}

export function BadgeFaixa({ faixa }: BadgeFaixaProps) {
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${coresFaixa[faixa] || coresFaixa["Branca"]}`}>
      Faixa {faixa}
    </span>
  )
}
```

### Implementação - Opção 1: Campos Editáveis no Placar

No componente `AtletaCard.tsx`, permitir clique no nome/equipe para editar:

```tsx
const [isEditing, setIsEditing] = useState(false)

return (
  <div onClick={() => setIsEditing(true)}>
    {isEditing ? (
      <input
        value={nome}
        onChange={(e) => onNomeChange(e.target.value)}
        className="bg-transparent text-5xl font-black"
      />
    ) : (
      <div className="text-5xl font-black">{nome}</div>
    )}
  </div>
)
```

### Implementação - Opção 2: Modal de Configuração

Criar novo componente `ConfigLuta.tsx` com campos para ambos os atletas:

- Nome Atleta 1 | Select Faixa | Equipe
- Nome Atleta 2 | Select Faixa | Equipe

---

## Fase 3: Finalizar Luta e Exportar JSON

**Objetivo:** Ao clicar em "Finalizar", gerar arquivo JSON com todo o resultado da luta.

### Tarefas

- [ ] **T-014** - Criar botão "Finalizar Luta" no placar
- [ ] **T-015** - Coletar dados da luta:
  - Nomes dos atletas
  - Faixas
  - Equipes
  - Pontuações finais (montada, passagem, queda, vantagens, punições)
  - Pontuação total
  - Vencedor (maior pontuação)
  - Tempo total da luta
- [ ] **T-016** - Gerar JSON com estrutura padronizada
- [ ] **T-017** - Implementar download do arquivo JSON
- [ ] **T-018** - Resetar estado após finalizar (ou redirecionar)
- [ ] **T-019** - Adicionar confirmação antes de finalizar

### Estrutura do JSON de Resultado

```json
{
  "data": "2026-05-16T20:30:00Z",
  "area": "Área 1",
  "arbitro": "João Silva",
  "categoria": "Branca Infantil",
  "tempoTotal": 300,
  "resultado": {
    "atleta1": {
      "nome": "João Silva",
      "faixa": "Branca",
      "equipe": "Team Brasil",
      "pontos": {
        "montada": 4,
        "passagem": 3,
        "queda": 2
      },
      "vantagens": 1,
      "penalidades": 0,
      "total": 9
    },
    "atleta2": {
      "nome": "Maria Santos",
      "faixa": "Branca",
      "equipe": "Team São Paulo",
      "pontos": {
        "montada": 0,
        "passagem": 3,
        "queda": 4
      },
      "vantagens": 0,
      "penalidades": 1,
      "total": 7
    }
  },
  "vencedor": "atleta1"
}
```

### Implementação do Download

```typescript
const gerarJSON = () => {
  const dados = {
    data: new Date().toISOString(),
    area,
    arbitro,
    categoria,
    tempoTotal: tempoDecorrido,
    resultado: {
      atleta1: { nome, faixa, equipe, pontos: p1, total: p1Total },
      atleta2: { nome, faixa, equipe, pontos: p2, total: p2Total },
    },
    vencedor: p1Total > p2Total ? "atleta1" : p2Total > p1Total ? "atleta2" : "empate"
  }

  const json = JSON.stringify(dados, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = `luta-${atleta1}-vs-${atleta2}-${Date.now()}.json`
  a.click()
}
```

---

## Layout Visual Esperado

```
┌─────────────────────────────────────────────────────────────┐
│ [Voltar]  ÁREA 1                            Árbitro: João   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ATLETA 1 (AZUL)                    [Faixa Branca]    │
│  │ Team Brasil                                         │
│  │                                                      │   │
│  │ [Montada 4pts] [Passagem 3pts] [Queda 2pts] [V|P]  │   │
│  │    +4 -4        +3 -3         +2 -2        +/-  +/- │   │
│  │                                                      │   │
│  │                              TOTAL: 00               │   │
│  └─────────────────────────────────────────────────────┘   │
│              ┌────────────────────────┐                    │
│              │       05:00            │                    │
│              │  [Iniciar] [Reiniciar] │                    │
│              └────────────────────────┘                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ATLETA 2 (BRANCO)                   [Faixa Azul]    │
│  │ Team São Paulo                                    │
│  │                                                      │   │
│  │ [Montada 4pts] [Passagem 3pts] [Queda 2pts] [V|P]  │   │
│  │    +4 -4        +3 -3         +2 -2        +/-  +/- │   │
│  │                                                      │   │
│  │                              TOTAL: 00               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│           [Finalizar Luta]                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Diagrama de Gantt

```
Semana    | 1       | 2       |
---------------------------
Fase 1    | ████    |         |
Fase 2    |  ██████ |         |
Fase 3    |         |  ███████|
```

---

## Checklist de Validação

### Fase 1 - Botão Voltar
- [ ] Botão visível no topo do placar
- [ ] Link redireciona para /scoreboard/setup
- [ ] Estilização com cor dourada

### Fase 2 - Criação Manual + Exibição de Faixa
- [ ] Campos de nome editáveis
- [ ] Dropdown de seleção de faixa
- [ ] Campos de equipe editáveis
- [ ] Dados salvos corretamente
- [ ] Badge de faixa exibido abaixo do nome
- [ ] Cores corretas para cada faixa

### Fase 3 - Finalizar Luta
- [ ] Botão "Finalizar Luta" visível
- [ ] Confirmação antes de finalizar
- [ ] JSON gerado com dados corretos (incluindo faixa)
- [ ] Download do arquivo iniciado automaticamente
- [ ] Dados do JSON incluem: nomes, faixas, equipes, pontuações, vencedor

---

## Pré-requisitos

- Tela de placar existente (`/scoreboard`)
- Componentes de pontuação funcionando
- Cronômetro operacional

---

## Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Editar dados durante luta | Médio | Salvar estado local |
| JSON mal formatado | Alto | Validar estrutura antes do download |
| Conflito com dados da URL | Médio | Priorizar dados locais vs URL params |
| Contraste da faixa com fundo | Médio | Testar combinação de cores (branca em fundo branco) |

---

*Roadmap atualizado em: 2026-05-16*
*Versão: 2.0*