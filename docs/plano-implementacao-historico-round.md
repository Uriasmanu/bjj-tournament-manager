# Plano de Implementação: Manutenção de Histórico de Round na Importação

**Versão:** 1.0
**Data:** 2026-05-19
**Projeto:** BJJ Tournament Manager

---

## 1. Visão Geral

Este plano detalha as etapas de implementação para manter o histórico de round quando um atleta com valor `null` é importado em uma chave de luta.

---

## 2. Estrutura de Tarefas

### Tarefa 1: Adicionar campo `tags` na interface Luta

**Arquivo:** `app/types/index.ts`

**Descrição:** Adicionar o campo opcional `tags?: string[]` na interface `Luta` para armazenar as tags de avanço.

**Alteração:**
```typescript
// Antes (linha 35-46)
export interface Luta {
  id: string
  round: number
  position: number
  atleta1: Atleta | null
  atleta2: Atleta | null
  resultado?: ResultadoLuta
  arbitro?: string
  dataLuta?: string
  nextMatchId?: string
  previousMatchIds?: string[]
}

// Depois
export interface Luta {
  id: string
  round: number
  position: number
  atleta1: Atleta | null
  atleta2: Atleta | null
  resultado?: ResultadoLuta
  arbitro?: string
  dataLuta?: string
  nextMatchId?: string
  previousMatchIds?: string[]
  tags?: string[]  // NOVO CAMPO
}
```

**Critério de Conclusão:** Interface Luta atualizada com campo tags

---

### Tarefa 2: Modificar lógica de importação

**Arquivo:** `app/scoreboard/setup/page.tsx`
**Função:** `handleImportar` (linhas 89-109)

**Descrição:** Alterar a lógica para criar duas lutas (uma no round 1 com tag "AVANÇOU", outra no round 2) quando um dos atletas for null.

**Lógica Atual:**
```typescript
const chavesAtualizadas = chavesImportadas.map(chave => ({
  ...chave,
  lutas: chave.lutas.map(luta => {
    if (luta.atleta1 === null || luta.atleta2 === null) {
      return { ...luta, round: 2 }
    }
    return luta
  })
}))
```

**Nova Lógica:**
```typescript
const chavesAtualizadas = chavesImportadas.map(chave => {
  const novasLutas: Luta[] = []

  chave.lutas.forEach(luta => {
    // Verificar se algum atleta é null
    const temAtletaNull = luta.atleta1 === null || luta.atleta2 === null

    if (temAtletaNull) {
      // Criar cópia no round 1 com tag "AVANÇOU"
      const lutaRound1: Luta = {
        ...luta,
        id: generateUUID(),
        round: 1,
        tags: ["AVANÇOU"]
      }
      novasLutas.push(lutaRound1)

      // Manter registro no round 2
      const lutaRound2: Luta = {
        ...luta,
        round: 2
      }
      novasLutas.push(lutaRound2)
    } else {
      // Manter comportamento original (atleta normal)
      novasLutas.push(luta)
    }
  })

  return {
    ...chave,
    lutas: novasLutas
  }
})
```

**Critério de Conclusão:** Lógica de importação cria duas lutas quando há atleta null

---

### Tarefa 3: Exibir tag na interface do Bracket

**Arquivo:** `app/components/bracket/BracketMatchupCard.tsx` (ou similar)

**Descrição:** Adicionar a exibição da tag "AVANÇOU" nos cards de luta.

**Verificar antes:** Localizar o componente que exibe as lutas no bracket

```bash
# Buscar componente de display de luta no bracket
grep -r "VENCEU" --include="*.tsx" app/components/
grep -r "getFighterTags" --include="*.tsx" app/
```

**Implementação Sugerida:**
```tsx
// Dentro do componente de card de luta
{/* Existing tags from getFighterTags */}
{luta.tags?.includes("AVANÇOU") && (
  <Badge variant="info">AVANÇOU</Badge>
)}
```

**Critério de Conclusão:** Tag "AVANÇOU" visível no bracket

---

### Tarefa 4: Atualizar função de importação para manter compatibilidade

**Arquivo:** `app/hooks/useImportacao.ts`

**Descrição:** Garantir que o hook de importação continue funcionando corretamente com a nova estrutura.

**Verificação:** Executar teste de importação com arquivo JSON de exemplo.

**Critério de Conclusão:** Importação funciona com dados existentes

---

### Tarefa 5: Testar o fluxo completo

**Descrição:** Realizar teste end-to-end do fluxo de importação.

**Passos de Teste:**
1. Criar arquivo JSON de teste com atleta null
2. Importar o arquivo na tela de setup
3. Verificar se foram criadas duas lutas (round 1 e round 2)
4. Verificar se a tag "AVANÇOU" aparece no round 1
5. Verificar se o bracket exibe corretamente

**Critério de Conclusão:** Fluxo completo funcionando

---

## 3. Ordem de Execução

```
Tarefa 1: Adicionar campo tags na interface Luta
    │
    ▼
Tarefa 2: Modificar lógica de importação
    │
    ▼
Tarefa 3: Exibir tag na interface do Bracket
    │
    ▼
Tarefa 4: Atualizar função de importação
    │
    ▼
Tarefa 5: Testar o fluxo completo
```

---

## 4. Dependências

| Tarefa | Dependência |
|--------|-------------|
| Tarefa 2 | Tarefa 1 |
| Tarefa 3 | Tarefa 1 |
| Tarefa 4 | Tarefa 2 |
| Tarefa 5 | Tarefas 1, 2, 3, 4 |

---

## 5. Critérios de Qualidade

- [ ] Código segue convenções do projeto (TypeScript)
- [ ] Novos campos são opcionais (backward compatible)
- [ ] UUIDs são gerados corretamente para novas entidades
- [ ] Nenhuma regressão no fluxo existente de importação
- [ ] Tags são exibidas corretamente na interface

---

## 6. Riscos Identificados

| Risco | Mitigação |
|-------|-----------|
| Regressão na importação | Testar com arquivos JSON existentes |
| performance na criação de cópias | Limitar a cópias apenas para casos necessários |
| Tag não visível no bracket | Verificar componente de renderização |

---

## 7. Referências

- Requisito: `docs/requisito-historico-round-importacao.md`
- Arquivo de exemplo para teste: `exemplos/chave-4-lutadores.json`