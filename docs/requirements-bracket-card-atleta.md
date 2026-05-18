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

### RF-001: Cada Atleta em um Card Separado

**Descrição:** Cada atleta deve occupar seu próprio card. Cada luta gera DOIS cards.

**Comportamento Atual:**
- Cada card exibe `atleta1` da luta
- Luta 1 gera 1 card (João Pereira), deveria gerar 2 cards (João + Leandro)
- Luta 2 gera 1 card (Marcelo), deveria gerar 2 cards (Marcelo + vazio)
- Luta 3 gera 1 card (Paulo), deveria gerar 2 cards (Paulo + Renato)

**Comportamento Esperado (usando JSON de exemplo):**
- Card 1: João Pereira (Team Alpha) - atleta1 da luta 1
- Card 2: Leandro Borges (Gracie Barra) - atleta2 da luta 1
- Card 3: Marcelo Filho (ATOS JJ) - atleta1 da luta 2
- Card 4: (vazio) - atleta2 da luta 2
- Card 5: Paulo Henrique (Alliance) - atleta1 da luta 3
- Card 6: Renato Silva (Checkmat) - atleta2 da luta 3

**Implementação:**
- Adicionar prop `atletaIndex: 1 | 2` ao `CompetitorCard`
- Se `atletaIndex === 1`: renderizar `luta.atleta1`
- Se `atletaIndex === 2`: renderizar `luta.atleta2`
- Em cada par de lutas, renderizar DOIS cards por luta
- Ajustar `nodeId` para ser único por card (ex: `node-L-1-0-1` e `node-L-1-0-2`)


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

### RV-003: Mostrar Posição no Card Vazio

**Descrição:** Exibir o número da posição (card) no canto direito dos cards vazios.

**Localização no Código:**
- Arquivo: `BracketLayout.tsx`
- Componente: `CompetitorCard` (linha ~342-379)

**Ação:**
- Quando `atleta1` for null (card vazio), exibir no canto direito o número da posição
- Cor: cinza (#6B7280 ou text-slate-500)
- Posição: canto direito do card
- Usar a prop `nodeId` ou calcular a partir dela para obter o número

**Exemplo:**
- Card vazio mostra "1" no canto direito se for position 0
- Card vazio mostra "2" no canto direito se for position 1

---

## 4. Restrições Técnicas

1. **Manter o formato atual:** O layout visual do bracket (grid de 7 colunas) deve permanecer inalterado
2. **Preservar funcionalidade:** Todos os cliques em luta, status de conclusão e conexão de linhas devem continuar funcionando
3. **Sem breaking changes:** A interface do componente deve permanecer compatível com as props existentes

---

## 5. Critérios de Aceitação

- [x] Cards vazios exibem número da posição no canto direito (cor cinza)
- [ ] Cada card exibe apenas UM atleta (atleta1 OU atleta2)
- [ ] Cada luta gera DOIS cards (um para cada atleta)
- [ ] Card 1: João Pereira, Card 2: Leandro Borges (mesma luta)
- [ ] Se atleta2 for null, card exibe "Aguardando oponente"
- [ ] Efeito de piscar (`animate-pulse`) removido dos cards
- [ ] Modal de campeão (`ChampionModal`) completamente removido
- [ ] Layout do bracket permanece visualmente idêntico
- [ ] Conexões SVG entre nodes continuam funcionando
- [ ] Comportamento de clique nas lutas permanece inalterado

---

## 6. Arquivos Envolvidos

| Arquivo | Ação |
|---------|------|
| `app/components/bracket/BracketLayout.tsx` | Modificar cards e remover modal |

---

*Documento criado em: 2026-05-18*