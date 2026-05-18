# SPEC: Correções da Visualização de Chave de Luta v2

**Versão:** 2.0
**Data:** 2026-05-18
**Status:** Pendente de Implementação

---

## 1. Proteção de Chaves Iniciadas

### Problema
Depois que uma chave é iniciada (tem lutas com resultados), ela não pode ser deletada. Deve desabilitar o botão de limpar dados e deletar

### Solução
Em `app/components/setup/ChaveList.tsx` e `app/scoreboard/setup/page.tsx`:

1. **Adicionar flag de proteção:**
   ```typescript
   const chavePodeSerDeletada = (chave: ChaveLuta) => {
     return !chave.lutas.some(l => l.resultado?.status === "concluida")
   }
   ```

2. **Ocultar botão deletar quando protegida:**
   ```tsx
   {chavePodeSerDeletada(chave) && (
     <button onClick={() => handleDelete(chave.id)}>🗑️</button>
   )}
   ```



---

## 2. Formulário de Criação de Lutas Manuais

### Problema
- Botão "Cancelar" está com texto branco sobre fundo branco
- Falta seletor de cor de faixa

### Solução em `app/components/scoreboard/AdicionarLutaModal.tsx`:

1. **Corrigir botão cancelar:**
   ```tsx
   <button 
     onClick={onClose}
     className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg"
   >
     Cancelar
   </button>
   ```

2. **Adicionar seletor de faixa para cada atleta do infantil ao adulto:**
   ```tsx
   <div>
     <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Faixa Atleta 1</label>
     <select 
       value={data.faixa1 || ""}
       onChange={(e) => setData({ ...data, faixa1: e.target.value })}
       className="w-full border-2 border-gray-700 rounded-lg p-2.5 text-sm bg-gray-800 text-white"
     >
       <option value="">Selecione</option>
       <option value="Branca">Branca</option>
       <option value="Azul">Azul</option>
       <option value="Roxa">Roxa</option>
       <option value="Marrom">Marrom</option>
       <option value="Preta">Preta</option>
     </select>
   </div>
   ```

---

## 3. Remover Animação de Piscada (Pulse)

### Problema
A visualização da chave tem animação de piscar que é irritante.

### Solução em `app/components/bracket/BracketLayout.tsx`:

1. **Remover `animate-pulse` de todos os cards:**
   ```tsx
   // ANTES:
   isActive && "ring-2 ring-amber-400 animate-pulse"
   
   // DEPOIS:
   isActive && "ring-2 ring-amber-400"
   ```

2. **Manter apenas borda de destaque** (sem piscar)

---

## 4. Posicionamento Alternado dos Atletas

### Problema
Formato atual:
```
carlos
x
lucas
rafael
x
vazio
```

Deveria ser:
```
carlos          rafael
x                    x
lucas             vazio
```

### Solução
Na função `Round1Pair` e `Round1PairRight`, organizar em pares horizontais:

```tsx
function Round1Pair({ lutas, side, round, baseIndex, onClick, activeFightId, mode }: {
  lutas: Luta[]
  side: "L" | "R"
  round: number
  baseIndex: number
  onClick?: (luta: Luta) => void
  activeFightId?: string
  mode?: "live" | "readonly"
}) {
  // Par 1: posição 0 (direita) e 1 (esquerda)
  // Par 2: posição 2 (direita) e 3 (esquerda)
  
  return (
    <>
      {/* PAR 1 - Alternado */}
      <div className="flex flex-row gap-3 py-2">
        {/* Posição 0 - DIREITA */}
        <CompetitorCard 
          luta={lutas[0]} 
          nodeId={`node-${side}-${round}-${baseIndex}`}
          onClick={lutas[0] ? () => onClick?.(lutas[0]) : undefined}
          isActive={activeFightId === lutas[0]?.id}
          isCompleted={lutas[0]?.resultado?.status === "concluida"}
          mode={mode}
        />
        {/* Posição 1 - ESQUERDA */}
        <CompetitorCard 
          luta={lutas[1]} 
          nodeId={`node-${side}-${round}-${baseIndex + 1}`}
          onClick={lutas[1] ? () => onClick?.(lutas[1]) : undefined}
          isActive={activeFightId === lutas[1]?.id}
          isCompleted={lutas[1]?.resultado?.status === "concluida"}
          mode={mode}
        />
      </div>
      
      {/* PAR 2 - Alternado */}
      <div className="flex flex-row gap-3 py-2">
        {/* Posição 2 - DIREITA */}
        <CompetitorCard 
          luta={lutas[2]} 
          nodeId={`node-${side}-${round}-${baseIndex + 2}`}
          onClick={lutas[2] ? () => onClick?.(lutas[2]) : undefined}
          isActive={activeFightId === lutas[2]?.id}
          isCompleted={lutas[2]?.resultado?.status === "concluida"}
          mode={mode}
        />
        {/* Posição 3 - ESQUERDA */}
        <CompetitorCard 
          luta={lutas[3]} 
          nodeId={`node-${side}-${round}-${baseIndex + 3}`}
          onClick={lutas[3] ? () => onClick?.(lutas[3]) : undefined}
          isActive={activeFightId === lutas[3]?.id}
          isCompleted={lutas[3]?.resultado?.status === "concluida"}
          mode={mode}
        />
      </div>
    </>
  )
}
```

**Alternância:** 
- Posição 0 = direita, 1 = esquerda
- Posição 2 = direita, 3 = esquerda
- Posição 4 = direita, 5 = esquerda
- E assim por diante

---

## 5. Bloquear Lutas com Atleta Vazio

### Problema
Em scoreboard está deixando clicar em lutas onde `atleta2` é `null` (BYE não resolvido ainda).

### Solução
Na função `canInteract` em `app/lib/bracket-utils.ts` e no componente `CompetitorCard`:

```typescript
export function podeIniciarLuta(luta: Luta, chave: ChaveLuta): boolean {
  // Verifica se tem DOIS atletas válidos
  if (!luta.atleta1?.id || !luta.atleta2?.id) return false

  // Verifica dependências
  if (luta.previousMatchIds && luta.previousMatchIds.length > 0) {
    for (const prevId of luta.previousMatchIds) {
      const lutaAnterior = chave.lutas.find(l => l.id === prevId)
      if (!lutaAnterior) continue
      
      const eraBye = !lutaAnterior.atleta1?.id || !lutaAnterior.atleta2?.id
      if (!eraBye && lutaAnterior.resultado?.status !== "concluida") {
        return false
      }
    }
  }

  return true
}
```

No componente:
```tsx
const podeClicar = mode === "live" && podeIniciarLuta(luta, chave)

return (
  <div 
    onClick={podeClicar ? onClick : undefined}
    className={cn(
      // ... estilos
      podeClicar ? "cursor-pointer hover:bg-slate-50" : "cursor-not-allowed opacity-50"
    )}
  >
```

---

## 6. Cada Atleta Ocupa um Card Separado

### Problema
Apenas `atleta1` é exibido no card. Cada atleta precisa do seu próprio card.

### Solução
O modelo de dados já tem `atleta1` e `atleta2`. Precisa criar cards para AMBOS:

```tsx
function LutaCard({ luta, nodeId, onClick, isActive, mode }: {
  luta: Luta
  nodeId: string
  onClick?: () => void
  isActive?: boolean
  mode?: "live" | "readonly"
}) {
  const podeClicar = podeIniciarLuta(luta, {})
  
  return (
    <div className="flex flex-col gap-1">
      {/* Card Atleta 1 */}
      <div className={cn("competitor-card border-2", 
        luta.atleta1?.id ? "bg-white" : "bg-gray-100 border-dashed"
      )}>
        {luta.atleta1?.id ? (
          <>
            <div className="font-bold">{luta.atleta1.nome}</div>
            <div className="text-xs text-gray-500">{luta.atleta1.equipe}</div>
          </>
        ) : (
          <div className="text-gray-400 italic">Vazio</div>
        )}
      </div>
      
      {/* Divisor */}
      <div className="text-center text-gray-400 text-xs py-1">
        {luta.resultado?.status === "concluida" ? "X" : "VS"}
      </div>
      
      {/* Card Atleta 2 */}
      <div className={cn("competitor-card border-2",
        luta.atleta2?.id ? "bg-white" : "bg-gray-100 border-dashed"
      )}>
        {luta.atleta2?.id ? (
          <>
            <div className="font-bold">{luta.atleta2.nome}</div>
            <div className="text-xs text-gray-500">{luta.atleta2.equipe}</div>
          </>
        ) : (
          <div className="text-gray-400 italic">Vazio</div>
        )}
      </div>
    </div>
  )
}
```

---

## 7. Número do Card e Avanço do Vencedor

### Problema
- Cada card precisa ter um número na ponta superior esquerda
- Quando uma luta termina, o vencedor deve avançar para o próximo card

### Solução

1. **Adicionar número no card:**
   ```tsx
   <div className="relative">
     <span className="absolute top-0 left-0 bg-slate-900 text-white text-[10px] px-1 rounded-br">
       {position + 1}
     </span>
     {/* Conteúdo do card */}
   </div>
   ```

2. **Lógica de advancement já existe** em `advanceWinner()` em `app/lib/bracket-utils.ts`, mas precisa ser chamada quando a luta é finalizada.

No hook `useStorage.ts`, após `marcarLutaConcluida`:
```typescript
// Após salvar resultado, avançar vencedor
if (winnerAtleta && loserAtleta) {
  const chaveAtualizada = advanceWinner(
    chavesAtualizadas.find(c => c.id === chaveId)!,
    lutaId,
    winnerAtleta,
    loserAtleta
  )
  // usar chaveAtualizada para salvar
}
```

---

## 8. Cor do Texto do Pódio

### Problema
O texto da classificação final está preto no fundo preto.

### Solução em `app/components/bracket/BracketLayout.tsx`:

```tsx
function PodiumLine({ label, colorClass, value }: { 
  label: string; 
  colorClass: string; 
  value: string 
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("w-8 text-right font-black", colorClass)}>{label}</span>
      <div className="flex-1 border-b border-slate-700 px-2 py-0.5 text-xs font-bold uppercase min-h-[24px]">
        {value.includes("--") ? (
          <span className="text-gray-400 italic">{value}</span>
        ) : (
          <span className="text-gray-200">{value}</span>  // ← Cor clara
        )}
      </div>
    </div>
  )
}
```

Mudar de `text-slate-900` para `text-gray-200` quando houver valor.

---

## 9. Estrutura de Dados para Classificação Final

### Problema
O JSON da área precisa ter um lugar dedicado para a classificação final de cada chave.

### Solução

No `app/types/index.ts`, adicionar novo tipo:

```typescript
export interface ClassificacaoFinal {
  chaveId: string
  campeao?: {
    id: string
    nome: string
    equipe: string
    faixa?: string
  }
  vice?: {
    id: string
    nome: string
    equipe: string
    faixa?: string
  }
  terceiroA?: {
    id: string
    nome: string
    equipe: string
    faixa?: string
  }
  terceiroB?: {
    id: string
    nome: string
    equipe: string
    faixa?: string
  }
  dataAtualizacao: string
}

export interface ChaveLuta {
  id: string
  categoria: string
  lutas: Luta[]
  arbitro?: string
  vencedorAtletaId?: string
  status: "pendente" | "em_andamento" | "concluida"
  totalCompetidores: number
  classificacaoFinal?: ClassificacaoFinal  // ← NOVO
}
```

Em `app/hooks/useStorage.ts`, função `marcarLutaConcluida`:
```typescript
// Após marcar luta como concluída, atualizar classificação
if (chave.status === "concluida" && chave.vencedorAtletaId) {
  const classificacao = calcularClassificacao(chave)
  chave.classificacaoFinal = classificacao
}
```

---

## 10. JSON Exemplo de Chave

```json
{
  "categoria": "Branca Masculino Adulto - Pluma (57kg)",
  "lutas": [
    {
      "round": 1,
      "position": 0,
      "atleta1": { "nome": "Carlos Silva", "equipe": "Team Alpha", "faixa": "Branca" },
      "atleta2": { "nome": "Pedro Santos", "equipe": "Gracie Barra", "faixa": "Branca" }
    },
    {
      "round": 1,
      "position": 1,
      "atleta1": { "nome": "Lucas Oliveira", "equipe": "ATOS JJ", "faixa": "Branca" },
      "atleta2": { "nome": "André Costa", "equipe": "Alliance", "faixa": "Branca" }
    },
    {
      "round": 1,
      "position": 2,
      "atleta1": { "nome": "Rafael Lima", "equipe": "Checkmat", "faixa": "Branca" },
      "atleta2": null
    }
]
}

> **Nota:** A classificação deve ser salva no JSON da área e não no JSON da chave.
---

## Resumo das Correções

| # | Problema | Arquivo | Prioridade |
|---|----------|---------|------------|
| 1 | Proteção de chaves iniciadas | `ChaveList.tsx`, `setup/page.tsx` | Alta |
| 2 | Formulário de lutas manuais | `AdicionarLutaModal.tsx` | Alta |
| 3 | Remover animação pulse | `BracketLayout.tsx` | Média |
| 4 | Posicionamento alternado | `BracketLayout.tsx` | Alta |
| 5 | Bloquear lutas vazias | `bracket-utils.ts` | Alta |
| 6 | Cards separados por atleta | `BracketLayout.tsx` | Alta |
| 7 | Número no card + advancement | `BracketLayout.tsx`, `useStorage.ts` | Alta |
| 8 | Cor do texto do pódio | `BracketLayout.tsx` | Alta |
| 9 | Classificação final no JSON | `types/index.ts`, `useStorage.ts` | Alta |

---

## Critérios de Aceitação

- [ ] CA1: Chaves com lutas concluídas não podem ser deletadas
- [ ] CA2: Formulário de adicionar luta tem seletor de faixa e botão cancelar visível
- [ ] CA3: Cards não pulsam mais
- [ ] CA4: Atletas posicionados alternadamente (0 direita, 1 esquerda, 2 direita...)
- [ ] CA5: Lutas com atletas faltando não são clicáveis
- [ ] CA6: Cada atleta tem seu próprio card visual
- [ ] CA7: Cards mostram número de posição (1, 2, 3...)
- [ ] CA8: Texto do pódio é legível (claro sobre escuro)
- [ ] CA9: Classificação final persistida no JSON

---

# ROADMAP DE IMPLEMENTAÇÃO

## FASE 1: Estrutura Base (Tasks 1-2)

### Task 1.1: Proteger chaves iniciadas na lista
**Arquivos:** `app/components/setup/ChaveList.tsx`
**Dependências:** Nenhuma
**Descrição:**
- [ ] 1.1.1 Ler o arquivo ChaveList.tsx e entender a estrutura atual
- [ ] 1.1.2 Identificar onde os botões de deletar/limpar são renderizados
- [ ] 1.1.3 Criar função `chavePodeSerDeletada(chave)` que retorna false se alguma luta tiver `resultado.status === "concluida"`
- [ ] 1.1.4 Ocultar botão deletar usando renderização condicional
- [ ] 1.1.5 Ocultar botão "Limpar Dados" quando a chave estiver protegida

### Task 1.2: Proteger chaves na página de setup
**Arquivos:** `app/scoreboard/setup/page.tsx`
**Dependências:** Task 1.1
**Descrição:**
- [ ] 1.2.1 Ler o arquivo setup/page.tsx
- [ ] 1.2.2 Aplicar a mesma lógica de proteção usada em ChaveList.tsx
- [ ] 1.2.3 Verificar se há outros botões de ação que precisam ser protegidos

---

## FASE 2: Formulário de Lutas (Tasks 2)

### Task 2.1: Corrigir formulário de criação de lutas manuais
**Arquivos:** `app/components/scoreboard/AdicionarLutaModal.tsx`
**Dependências:** Nenhuma
**Descrição:**
- [ ] 2.1.1 Ler o arquivo AdicionarLutaModal.tsx
- [ ] 2.1.2 Identificar o botão "Cancelar" e alterar classes para texto visível (text-gray-700 bg-gray-200)
- [ ] 2.1.3 Adicionar campo select para "Faixa Atleta 1" (Branca, Azul, Roxa, Marrom, Preta)
- [ ] 2.1.4 Adicionar campo select para "Faixa Atleta 2" com as mesmas opções
- [ ] 2.1.5 Garantir que os campos de faixa façam parte do state `data`
- [ ] 2.1.6 Testar visualmente o modal após as alterações

---

## FASE 3: Visualização da Chave (Tasks 3-8)

### Task 3.1: Remover animação de pulse dos cards
**Arquivos:** `app/components/bracket/BracketLayout.tsx`
**Dependências:** Nenhuma
**Descrição:**
- [ ] 3.1.1 Ler o arquivo BracketLayout.tsx
- [ ] 3.1.2 Buscar todos os lugares onde `animate-pulse` é usado
- [ ] 3.1.3 Remover a classe `animate-pulse` mantendo o `ring-2 ring-amber-400` para destaque
- [ ] 3.1.4 Verificar se há outros componentes com animate-pulse que precisam ser limpos

### Task 4.1: Implementar posicionamento alternado dos atletas
**Arquivos:** `app/components/bracket/BracketLayout.tsx`
**Dependências:** Task 3.1
**Descrição:**
- [ ] 4.1.1 Localizar a função `Round1Pair` no arquivo
- [ ] 4.1.2 Modificar o layout para organizar em pares horizontais (flex-row)
- [ ] 4.1.3 Implementar alternância: posição 0 = direita, 1 = esquerda, 2 = direita, 3 = esquerda
- [ ] 4.1.4 Criar wrapper `<div className="flex flex-row gap-3 py-2">` para cada par
- [ ] 4.1.5 Aplicar mesma lógica para `Round1PairRight` se existir

### Task 5.1: Bloquear lutas com atleta vazio
**Arquivos:** `app/lib/bracket-utils.ts`, `app/components/bracket/BracketLayout.tsx`
**Dependências:** Task 4.1
**Descrição:**
- [ ] 5.1.1 Ler o arquivo bracket-utils.ts
- [ ] 5.1.2 Verificar se existe função `podeIniciarLuta` ou criar
- [ ] 5.1.3 Implementar verificação: retorna false se `atleta1.id` ou `atleta2.id` forem null
- [ ] 5.1.4 Verificar dependências (lutas anteriores devem estar concluídas)
- [ ] 5.1.5 No componente CompetitorCard, usar `podeIniciarLuta` para controlar click
- [ ] 5.1.6 Aplicar estilo `cursor-not-allowed opacity-50` quando não clicável

### Task 6.1: Separar cards para cada atleta
**Arquivos:** `app/components/bracket/BracketLayout.tsx`
**Dependências:** Task 5.1
**Descrição:**
- [ ] 6.1.1 Localizar componente que renderiza o card do atleta
- [ ] 6.1.2 Modificar para renderizar DOIS cards (atleta1 e atleta2) em vez de um
- [ ] 6.1.3 Adicionar divisor entre os cards com "VS" ou "X" (se concluída)
- [ ] 6.1.4 Aplicar estilo diferente para card vazio (border-dashed, bg-gray-100)
- [ ] 6.1.5 Exibir nome e equipe de cada atleta no seu respectivos card

### Task 7.1: Adicionar número do card e lógica de avanço
**Arquivos:** `app/components/bracket/BracketLayout.tsx`, `app/hooks/useStorage.ts`
**Dependências:** Task 6.1
**Descrição:**
- [ ] 7.1.1 Adicionar badge com número no canto superior esquerdo de cada card
- [ ] 7.1.2 Usar `<span className="absolute top-0 left-0 bg-slate-900 text-white text-[10px] px-1 rounded-br">`
- [ ] 7.1.3 Passar prop `position` para o componente do card
- [ ] 7.1.4 Em useStorage.ts, na função `marcarLutaConcluida`, adicionar chamada a `advanceWinner`
- [ ] 7.1.5 Garantir que o vencedor seja inserido no próximo card (prox fights)

### Task 8.1: Corrigir cor do texto do pódio
**Arquivos:** `app/components/bracket/BracketLayout.tsx`
**Dependências:** Task 7.1
**Descrição:**
- [ ] 8.1.1 Localizar função `PodiumLine` no arquivo
- [ ] 8.1.2 Alterar cor do texto de `text-slate-900` para `text-gray-200` quando houver valor
- [ ] 8.1.3 Manter `text-gray-400 italic` quando o valor for "--" (sem valor)

---

## FASE 4: Dados e Persistência (Tasks 9)

### Task 9.1: Adicionar classificação final aos tipos e persistência
**Arquivos:** `app/types/index.ts`, `app/hooks/useStorage.ts`
**Dependências:** Task 8.1
**Descrição:**
- [ ] 9.1.1 Ler o arquivo types/index.ts
- [ ] 9.1.2 Adicionar interface `ClassificacaoFinal` com campos: chaveId, campeao, vice, terceiroA, terceiroB, dataAtualizacao
- [ ] 9.1.3 Adicionar campo opcional `classificacaoFinal?: ClassificacaoFinal` na interface `ChaveLuta`
- [ ] 9.1.4 Em useStorage.ts, identificar função de conclusão de chave
- [ ] 9.1.5 Ao marcar luta como concluída, verificar se chave terminó (última luta)
- [ ] 9.1.6 Se chave terminou, calcular e salvar classificação no JSON da área (não da chave)
- [ ] 9.1.7 Criar função auxiliar `calcularClassificacao(chave)` se necessário

---

## FASE 5: Integração e Testes (Task 10)

### Task 10.1: Teste integrado de todas as correções
**Arquivos:** Múltiplos
**Dependências:** Tasks 1-9
**Descrição:**
- [ ] 10.1.1 Executar `npm run build` para verificar erros de Typescript
- [ ] 10.1.2 Executar `npm run lint` se existir
- [ ] 10.1.3 Testar manualmente cada critério de aceitação:
  - CA1: Criar chave, iniciar luta, verificar que botão delete sumiu
  - CA2: Abrir modal de adicionar luta, verificar faixa e botão cancelar
  - CA3: Visualizar chave, verificar que não pulsa
  - CA4: Verificar alternância direita/esquerda nos cards
  - CA5: Tentar clicar em luta com BYE, verificar que não clica
  - CA6: Verificar dois cards por luta (atleta1 e atleta2)
  - CA7: Verificar números nos cantos dos cards
  - CA8: Verificar pódio com texto claro
  - CA9: Finalizar chave completa, verificar JSON da área

---

## ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

```
FASE 1 (Estrutura Base)
├── Task 1.1: Proteger chaves em ChaveList.tsx
└── Task 1.2: Proteger chaves em setup/page.tsx

FASE 2 (Formulário)
└── Task 2.1: Corrigir AdicionarLutaModal.tsx

FASE 3 (Visualização)
├── Task 3.1: Remover animate-pulse
├── Task 4.1: Posicionamento alternado
├── Task 5.1: Bloquear lutas vazias
├── Task 6.1: Cards separados
├── Task 7.1: Números + avanço
└── Task 8.1: Corrigir pódio

FASE 4 (Dados)
└── Task 9.1: Classificação final

FASE 5 (Testes)
└── Task 10.1: Testes integrados
```

---

## ESTIMATIVA DE TEMPO

| Fase | Tasks | Complexidade | Tempo Estimado |
|------|-------|--------------|----------------|
| Fase 1 | 2 | Baixa | 1-2 horas |
| Fase 2 | 1 | Média | 1 hora |
| Fase 3 | 6 | Alta | 4-6 horas |
| Fase 4 | 1 | Média | 1-2 horas |
| Fase 5 | 1 | Média | 1-2 horas |
| **TOTAL** | **11** | - | **8-13 horas**