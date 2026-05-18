# Requisito - Correção do Componente BracketLayout

**ID:** REQ-001-CORRECAO-BRACKET
**Data:** 2026-05-18
**Projeto:** BJJ Tournament Manager
**Componente:** BracketLayout.tsx

---

## 1. Objetivo

Corrigir o componente `BracketLayout.tsx` para exibir cada atleta em um card separado, removendo o efeito visual de piscar e o modal de vencedor.

---

## 2. Requisito Funcional

### RF-001: Cada Atleta Ocupa um Card Separado

**Descrição:** Cada luta deve renderizar DOIS cards - um para cada atleta.

**Comportamento Atual:**
- Cada par de lutas (ex: Round1Pair) renderiza 4 cards
- Cada card exibe apenas `luta.atleta1`
- `atleta2` não é renderizado/visível

**Comportamento Esperado:**
- Cada par de lutas deve renderizar 8 cards (2 por luta):
  - Card 1: `luta[0].atleta1`
  - Card 2: `luta[0].atleta2`
  - Card 3: `luta[1].atleta1`
  - Card 4: `luta[1].atleta2`
  - ...e assim sucessivamente
- Ambos os atletas de cada luta devem ser visíveis

**Nota:** A estrutura visual do bracket (grid de 7 colunas) está correta - apenas adicionar cards para `atleta2`.

**Implementação:**
- Duplicar os cards em cada par de lutas
- No primeiro card renderizar `atleta1`, no segundo card renderizar `atleta2`
- Ajustar `nodeId` para serem únicos (ex: `node-L-1-0-a1` e `node-L-1-0-a2`)


---

## 3. Requisito Visual

### RV-001: Remover Efeito de Piscar (Animate Pulse)

**Descrição:** Eliminar a animação de pulsing que indica a luta ativa.

**Localização no Código:**
- Arquivo: `BracketLayout.tsx`
- Linha ~351: `isActive && "ring-2 ring-amber-400 animate-pulse"`

**Ação:**
- Remover a classe `animate-pulse` do `CompetitorCard`
- Manter o anel de destaque (`ring-2 ring-amber-400`) para indicar luta ativa

---

### RV-002: Remover Modal de Vencedor (ChampionModal)

**Descrição:** Eliminar a exibição automática do modal de campeão ao final da chave.

**Localização no Código:**
- Arquivo: `BracketLayout.tsx`
- Linha ~7: Importação de `ChampionModal`
- Linha ~22-46: Estados e effects relacionados ao modal
- Linha ~311-317: Renderização condicional do modal

**Ação:**
- Remover importação do `ChampionModal`
- Remover estados `showChampionModal` e `championTrigger`
- Remover effects que controlam a exibição do modal
- Remover a renderização condicional do `ChampionModal`

**Justificativa:** O modal causa interrupção no fluxo do sistema e não é desejado pelo usuário.

---

## 4. Restrições Técnicas

1. **Manter o formato atual:** O layout visual do bracket (grid de 7 colunas) deve permanecer inalterado
2. **Preservar funcionalidade:** Todos os cliques em luta, status de conclusão e conexão de linhas devem continuar funcionando
3. **Sem breaking changes:** A interface do componente deve permanecer compatível com as props existentes

---

## 5. Critérios de Aceitação

- [ ] Cada luta exibe DOIS cards (atleta 1 e atleta 2)
- [ ] Ambos os nomes são visíveis simultaneamente no bracket
- [ ] Efeito de piscar (`animate-pulse`) removido dos cards
- [ ] Modal de campeão (`ChampionModal`) completamente removido
- [ ] Layout do bracket permanece visualmente idêntico (grid 7 colunas)
- [ ] Conexões SVG entre nodes continuam funcionando
- [ ] Comportamento de clique nas lutas permanece inalterado

---

## 6. Arquivos Envolvidos

| Arquivo | Ação |
|---------|------|
| `app/components/bracket/BracketLayout.tsx` | Modificar cards e remover modal |

---

*Documento criado em: 2026-05-18*