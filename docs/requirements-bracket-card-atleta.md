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

### RF-001: Exibir Ambos Atletas na Luta

**Descrição:** Cada card de luta deve exibir ambos os atletas (`atleta1` e `atleta2`) claramente visíveis.

**Comportamento Atual:**
- Cada `CompetitorCard` exibe apenas `luta.atleta1`
- `atleta2` não é renderizado no card

**Comportamento Esperado:**
- Manter a estrutura de 2 cards por par de lutas (já existe)
- Modificar o `CompetitorCard` para exibir:
  - Card 1: `luta.atleta1`
  - Card 2: `luta.atleta2`
- Ambos os nomes devem ser visíveis no bracket

**Implementação:**
- No `CompetitorCard`, adicionar um parâmetro para indicar se deve renderizar `atleta1` ou `atleta2`
- Passar `atletaIndex: 1 | 2` para controlar qual atleta exibir
- Alternativamente: criar um segundo card para `atleta2` em cada par

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

- [ ] Cada card exibe o atleta correto (atleta1 OU atleta2, não apenas atleta1)
- [ ] Ambos os nomes de cada luta são visíveis no bracket
- [ ] Estrutura de cards existente preservada (mantém o formato visual)
- [ ] Efeito de piscar (`animate-pulse`) removido dos cards
- [ ] Modal de campeão (`ChampionModal`) completamente removido
- [ ] Conexões SVG entre nodes continuam funcionando
- [ ] Comportamento de clique nas lutas permanece inalterado

---

## 6. Arquivos Envolvidos

| Arquivo | Ação |
|---------|------|
| `app/components/bracket/BracketLayout.tsx` | Modificar cards e remover modal |

---

*Documento criado em: 2026-05-18*