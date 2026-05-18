# SPEC: Correções da Visualização de Chave de Luta

## 1. Visão Geral

**Nome da Feature:** Correções - Bracket Visualizer
**Módulo:** Scoreboard
**Prioridade:** Alta
**Versão:** 1.0
**Data:** 2026-05-18

---

## 2. Problemas a Corrigir

### 2.1 PROBLEMA 1: Formato do Bracket

**Descrição:** O formato atual do bracket não está agradando. Precisa de uma reformulação visual.

**Solução:** Revisar o layout do `BracketLayout.tsx` para:

```
Layout horizontal duplo (corrigido):
┌──────────┬──────────┬──────────┬─────────┬──────────┐
│ ROUND 1   │ QUARTAS  │ SEMI    │ FINAL   │ CAMPEÃO  │
├──────────┤          │         │         │          │
│ L1  L2   │          │         │         │          │
│ ↓    ↓   │   Q1     │         │         │          │
│         ├──────────┤         │         │          │
│ L3  L4   │          │   S1    │   F     │   🏆     │
│ ↓    ↓   │   Q2     │         │         │          │
│         ├──────────┤         │         │          │
│         │          │         │         │          │
└──────────┴──────────┴─────────┴─────────┴──────────┘
```

- **Desktop:** Layout horizontal com 5 colunas (Round 1, Quartas, Semifinal, Final, Campeão)
- **Round 1:** Split em dois grupos (left positions 0,1 e right positions 2,3)
- **Quartas:** 2 cards centralizados
- **Semifinal:** Card centralizado
- **Final:** Card centralizado com borda dourada
- **Campeão:** Card dourado abaixo da Final

**Responsividade:**
- Mobile (<768px): Stack vertical por rodada
- Tablet (768-1024px): Scroll horizontal

---

### 2.2 PROBLEMA 2: Lutas com BYE Iniciáveis Prematuramente

**Descrição:** O sistema permite iniciar lutas onde um dos atletas é BYE antes de as lutas anteriores serem concluídas. O BYE é substituido pelo vencedor da luta anterior que esta relacionada a chave, ou seja em A, B , C quem perdeu de A X B vai ter o nome substituido e pintado de vermelho e vai lutar contra o C. Enquanto isso o vencedor de A X B vai para uma nova chave vencedor x BYE. Quando terminar a luta de perdedor x C, quem ganhou vai ter o nome subsitituido no vencedor x BYE

**Solução:** Implementar bloqueio de lutas baseado em dependências.

**Regras:**
1. Uma luta só pode ser clicável se:
   - Ambos atletas têm `id` válido (não é BYE)
   - OU é um slot de BYE que veio de uma luta já concluída
2. Se a luta depende de resultados anteriores (via `previousMatchIds`), verificar se:
   - A luta anterior está com `resultado.status === "concluida"`
   - OU o atleta avanço por BYE (luta anterior era BYE)

**Bloqueio visual:**
```tsx
// Se luta não pode ser clicada:
<div className="opacity-50 cursor-not-allowed">
  {/* card normal mas com visual desabilitado */}
</div>

// Tooltip explicando por que não pode clicar:
<span title="Aguarde o resultado da luta anterior">
```

**Lógica de verificação:**
```typescript
function podeIniciarLuta(luta: Luta, chave: ChaveLuta): boolean {
  // Se não tem dois atletas, não pode iniciar
  if (!luta.atleta1?.id || !luta.atleta2?.id) return false

  // Verificar dependências
  if (luta.previousMatchIds && luta.previousMatchIds.length > 0) {
    for (const prevId of luta.previousMatchIds) {
      const lutaAnterior = chave.lutas.find(l => l.id === prevId)
      if (!lutaAnterior) continue
      
      // Se a luta anterior não está concluída E não era BYE, não pode iniciar
      if (lutaAnterior.resultado?.status !== "concluida") {
        const eraBye = !lutaAnterior.atleta1?.id || !lutaAnterior.atleta2?.id
        if (!eraBye) return false
      }
    }
  }

  return true
}
```

---

### 2.3 PROBLEMA 3: Botão "Ocultar Bracket" com Texto Invisível

**Descrição:** O botão de ocultar bracket tem texto branco sobre fundo branco.

**Solução:** Corrigir cores do botão em `BracketPanel.tsx`.

**Antes:**
```tsx
<button className="text-white">
  Ocultar Bracket
</button>
```

**Depois:**
```tsx
<button className="text-gray-700 bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-lg">
  <ChevronDown className="w-4 h-4 mr-1" />
  Ocultar Bracket
</button>
```

**Paleta de cores para botões:**
- Primário: `bg-blue-600 text-white hover:bg-blue-700`
- Secundário: `bg-gray-200 text-gray-700 hover:bg-gray-300`
- Perigo: `bg-red-600 text-white hover:bg-red-700`

---

### 2.4 PROBLEMA 4: Campeão Exibido Antes do Término

**Descrição:** O bracket está mostrando o campeão antes de todas as lutas serem concluídas.

**Solução:** O card de campeão só deve aparecer quando:
1. `chave.status === "concluida"`
2. `chave.vencedorAtletaId` está preenchido
3. TODAS as lutas estão com `resultado.status === "concluida"`

**Lógica:**
```tsx
const todasLutasConcluidas = chave.lutas.every(
  l => l.resultado?.status === "concluida" || 
      (!l.atleta1?.id || !l.atleta2?.id) // BYEs não precisam de resultado
)

const podeExibirCampeao = chave.status === "concluida" && 
                          !!chave.vencedorAtletaId && 
                          todasLutasConcluidas

{/* Só mostrar campeão quando todas as lutas estão concluídas */}
{podeExibirCampeao && <BracketChampion champion={champion} />}
```

**Visual intermediário:**
```tsx
{/* Antes de poder mostrar campeão */}
{!podeExibirCampeao && (
  <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg">
    <Trophy className="w-8 h-8 text-gray-400" />
    <p className="text-gray-400 text-sm">Aguardando finalização das lutas...</p>
  </div>
)}
```

---

### 2.5 PROBLEMA 5: Resumo de Pontuação Visível

**Descrição:** O bracket está mostrando um resumo de pontuação que não deveria ser exibido.

**Solução:** Remover a exibição de pontuação do `BracketMatchupCard`.

**O que NÃO deve aparecer:**
```
X x Y  ← REMOVER
```

**O que DEVE aparecer:**
```
┌────────────────────┐
│ João Silva         │
│ Academia ABC       │
│ [VENCEU]           │
├────────────────────┤
│        VS          │
├────────────────────┤
│ Maria Santos       │
│ Academia XYZ       │
│ [PERDEU]           │
└────────────────────┘
```

**No card, na linha central:**
```tsx
// ANTES:
<div className="bg-gray-200 text-gray-500 text-xs font-bold text-center py-1 border-y border-gray-300">
  {isCompleted && luta.resultado
    ? `${luta.resultado.pontosAtleta1} x ${luta.resultado.pontosAtleta2}`
    : "VS"}
</div>

// DEPOIS:
<div className="bg-gray-200 text-gray-500 text-xs font-bold text-center py-1 border-y border-gray-300">
  VS
</div>
```

**Exceção:** Em lutas concluídas no modo `live`, pode mostrar um badge pequeno com quem venceu, mas SEM pontuação numérica.

---

### 2.6 PROBLEMA 6: Tag "VENCEU" em Desclassificado

**Descrição:** Quando um atleta é desclassificado, o card mostra tanto "DESCLASS." quanto "VENCEU" para o outro atleta, mas a tag "VENCEU" fica logo abaixo de "DESCLASS." no mesmo card, o que é confuso visualmente.

**Solução:** Reorganizar as tags no card do desclassificado.

**Card do DESCLASSIFICADO:**
```
┌────────────────────┐
│ João Silva         │
│ Academia ABC       │
│ [DESCLASS.]        │  ← TAG PRINCIPAL (maior, borda destacada)
└────────────────────┘
```
- Tag "DESCLASS." em destaque com borda vermelha
- NENHUMA outra tag neste card
- Background: `bg-red-50`, Border: `border-red-400`

**Card do VENCEDOR POR DESCLASSIFICAÇÃO:**
```
┌────────────────────┐
│ Maria Santos       │
│ Academia XYZ       │
│ [VENCEU]           │  ← TAG ÚNICA
└────────────────────┘
```
- Apenas tag "VENCEU" (verde)
- NÃO mostrar "FINALIZOU" se foi por desclassificação
- Background: `bg-green-50`, Border: `border-green-400`

**Lógica de tags (corrigida):**
```typescript
function getFighterTags(resultado: ResultadoLuta | undefined, fighter: "atleta1" | "atleta2"): ResultTag[] {
  if (!resultado || resultado.status !== "concluida") return []

  const tags: ResultTag[] = []

  // CASO 1: DESCLASSIFICAÇÃO
  if (resultado.desclassificacao) {
    if (resultado.desclassificacao === fighter) {
      // Este atleta foi desclassificado
      tags.push({ label: "DESCLASS.", variant: "danger-bold" })
      // NÃO adiciona "PERDEU" - a desclassificação já implica
    } else {
      // Este atleta venceu por desclassificação do outro
      tags.push({ label: "VENCEU", variant: "success" })
      // NÃO mostrar "FINALIZOU" - foi por desclassificação, não finalização
    }
    return tags // Retorna aqui, não continua
  }

  // CASO 2: VITÓRIA POR FINALIZAÇÃO
  if (resultado.vencedor === fighter && resultado.tipoVitoria === "finalizacao") {
    const finalizou = fighter === "atleta1" ? resultado.finalizacaoAtleta1 : resultado.finalizacaoAtleta2
    if (finalizou) {
      tags.push({ label: "VENCEU", variant: "success" })
      tags.push({ label: "FINALIZOU", variant: "info" })
    } else {
      tags.push({ label: "VENCEU", variant: "success" })
    }
    return tags
  }

  // CASO 3: VITÓRIA POR PONTOS
  if (resultado.vencedor === fighter) {
    tags.push({ label: "VENCEU", variant: "success" })
  } else {
    tags.push({ label: "PERDEU", variant: "danger" })
  }

  return tags
}
```

---

### 2.7 PROBLEMA 7: Select de Categoria Volta para Início

**Descrição:** O select de categoria sempre volta para a primeira opção, dificultando o fluxo do usuário que precisa voltar para a chave que acabou de ser atualizada.

**Solução:** Implementar persistência da última categoria selecionada.

**Abordagem:** Salvar a última categoria selecionada no localStorage e restaurar ao carregar.

```typescript
const ULTIMA_CATEGORIA_KEY = "bjj_tournament_ultima_categoria"

export function SeletorLuta({ chaves, onIniciar }: SeletorLutaProps) {
  // Carregar última categoria selecionada
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(ULTIMA_CATEGORIA_KEY)
      if (saved && chaves.some(c => c.id === saved)) {
        return saved
      }
    }
    return chaves[0]?.id || ""
  })

  // Salvar categoria selecionada quando mudar
  useEffect(() => {
    if (categoriaSelecionada) {
      localStorage.setItem(ULTIMA_CATEGORIA_KEY, categoriaSelecionada)
    }
  }, [categoriaSelecionada])

  // Sugerir última categoria atualizada (prioridade maior)
  useEffect(() => {
    // Encontrar a chave com status mais recente
    const chaveRecemAtualizada = chaves
      .filter(c => c.status === "em_andamento")
      .sort((a, b) => {
        const aTime = a.lutas.find(l => l.resultado?.status === "concluida")?.dataLuta
        const bTime = b.lutas.find(l => l.resultado?.status === "concluida")?.dataLuta
        return (bTime || "").localeCompare(aTime || "")
      })[0]

    if (chaveRecemAtualizada && chaveRecemAtualizada.status === "em_andamento") {
      setCategoriaSelecionada(chaveRecemAtualizada.id)
    }
  }, [chaves])
}
```

**Comportamento:**
1. Ao carregar a página, verifica se há categoria salva e restaura
2. Se não houver, mantém a primeira categoria
3. Se houver chave "em_andamento", prioriza mostrar ela
4. Ao selecionar categoria, salva no localStorage

**Nota:** Usar `chave.id` (UUID) para persistência, não `categoria` (nome) — mais confiável.

---

## 3. Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `app/components/bracket/BracketLayout.tsx` | Problema 1 - Formato do bracket |
| `app/components/bracket/BracketMatchupCard.tsx` | Problema 2 - Bloquear BYEs, Problema 5 - Remover pontuação, Problema 6 - Tags de desclassificação |
| `app/components/bracket/BracketChampion.tsx` | Problema 4 - Só mostrar quando concluído |
| `app/components/scoreboard/BracketPanel.tsx` | Problema 3 - Cores do botão |
| `app/components/scoreboard/SeletorLuta.tsx` | Problema 7 - Persistir última categoria |
| `app/lib/bracket-utils.ts` | Adicionar `podeIniciarLuta()` |

---

## 4. Critérios de Aceitação

- [ ] **CA1:** Bracket exibe formato horizontal com Round 1 dividido em dois grupos (left/right)
- [ ] **CA2:** Lutas com BYE过早 não podem ser clicadas enquanto dependências não estão resolvidas
- [ ] **CA3:** Botão "Ocultar Bracket" tem texto legível (não branco sobre branco)
- [ ] **CA4:** Card de campeão só aparece quando TODAS as lutas estão concluídas
- [ ] **CA5:** Cards não exibem pontuação numérica (ex: "2 x 1")
- [ ] **CA6:** Atleta desclassificado só mostra tag "DESCLASS." (não mostra "PERDEU")
- [ ] **CA7:** Select de categoria volta para última seleção ao recarregar a página

---

## 5. Checklist de Implementação

- [ ] Revisar `BracketLayout.tsx` com novo formato
- [ ] Implementar `podeIniciarLuta()` em `bracket-utils.ts`
- [ ] Bloquear clicks em lutas não disponíveis
- [ ] Corrigir cores do botão em `BracketPanel.tsx`
- [ ] Adicionar verificação `todasLutasConcluidas` antes de mostrar campeão
- [ ] Remover pontuação dos cards
- [ ] Corrigir lógica de tags para desclassificação
- [ ] Implementar persistência de categoria no `SeletorLuta.tsx`
- [ ] Testar todos os cenários

---

## 6. Dependências

Nenhuma nova dependência necessária. Apenas correções de lógica e estilo.