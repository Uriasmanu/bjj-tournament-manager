# Requisito - Correção do Componente BracketLayout

**ID:** REQ-001-CORRECAO-BRACKET
**Data:** 2026-05-18
**Projeto:** BJJ Tournament Manager
**Componente:** BracketLayout.tsx

---

## 1. Objetivo

Corrigir o componente `BracketLayout.tsx` para exibir cada atleta em um card separado, removendo o efeito visual de piscar e o modal de vencedor. O posicionamento dos cards deve seguir a ordem de distribuição conforme a numeração dos cards.

---

## 2. Requisito Funcional

### RF-001: Cada Atleta em um Card Separado

**Descrição:** Cada atleta deve ocupar seu próprio card. Cada luta gera DOIS cards.

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

### RF-002: Ordem de Distribuição dos Nomes nos Cards

**Descrição:** A ordem de distribuição dos nomes nos cards deve seguir a sequência de pairing do bracket. Leve em consideração que os cards têm numeração fixa. Isso não vai mudar, porém os atletas irán preencher ambos os lados. Sem mudar o formato atual, apenas a distribuição das lutas. Repito: em hipótese alguma mude a ordem dos números dos cards, apenas ajuste para a distribuição correta.

**Ordem de Distribuição:**
A distribuição dos nomes deve seguir a ordem de numeração conforme o exemplo:

| Posição do Card | Luta (par) |
|----------------|------------|
| 1 (cardPosition 0) | Atleta 1 (luta 1) |
| 2 (cardPosition 1) | Atleta 2 (luta 1) |
| 3 (cardPosition 2) | Atleta 3 (luta 3) |
| 4 (cardPosition 3) | Atleta 4 (luta 3) |
| 5 (cardPosition 4) | Atleta 5 (luta 5) |
| 6 (cardPosition 5) | Atleta 6 (luta 5) |
| 7 (cardPosition 6) | Atleta 7 (luta 7) |
| 8 (cardPosition 7) | Atleta 8 (luta 7) |
| 9 (cardPosition 8) | Atleta 9 (luta 2) |
| 10 (cardPosition 9) | Atleta 10 (luta 2) |
| 11 (cardPosition 10) | Atleta 11 (luta 4) |
| 12 (cardPosition 11) | Atleta 12 (luta 4) |
| ... | ... |

**Sequência de pairing:**
- 1x2 (luta 1) → cards 1 e 2
- 9x10 (luta 2) → cards 9 e 10
- 3x4 (luta 3) → cards 3 e 4
- 11x12 (luta 4) → cards 11 e 12
- 5x6 (luta 5) → cards 5 e 6
- 13x14 (luta 6) → cards 13 e 14
- 7x8 (luta 7) → cards 7 e 8
- 15x16 (luta 8) → cards 15 e 16
- E assim sucessivamente

**Nota:** A ordem de distribuição não segue a sequência natural (1, 2, 3, 4...), mas sim a sequência de pairing do bracket de eliminatórias.


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
- [x] Cada card exibe apenas UM atleta (atleta1 OU atleta2)
- [x] Cada luta gera DOIS cards (um para cada atleta)
- [x] Card 1: João Pereira, Card 2: Leandro Borges (mesma luta)
- [x] Se atleta2 for null, card exibe "Aguardando oponente"
- [x] Efeito de piscar (`animate-pulse`) removido dos cards
- [x] Modal de campeão (`ChampionModal`) completamente removido
- [x] Layout do bracket permanece visualmente idêntico
- [x] Conexões SVG entre nodes continuam funcionando
- [x] Comportamento de clique nas lutas permanece inalterado
- [] Ordem de distribuição segue a sequência de pairing (1x2, 9x10, 3x4, 11x12...)

---

## 6. Arquivos Envolvidos

| Arquivo | Ação |
|---------|------|
| `app/components/bracket/BracketLayout.tsx` | Modificar cards e remover modal |

---

*Documento criado em: 2026-05-18*