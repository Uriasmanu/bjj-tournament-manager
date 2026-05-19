# Requisito: Manutenção de Histórico de Round na Importação de Chaves

**Versão:** 1.0
**Data:** 2026-05-19
**Projeto:** BJJ Tournament Manager

---

## 1. Objetivo

Este documento define o requisito funcional para manter o histórico de round quando um atleta com valor `null` é importado em uma chave de luta.

---

## 2. Problema Atual

### 2.1 Comportamento Observado

Ao importar um arquivo JSON de chave de luta, quando um dos atletas é `null` (atleta não definido), o sistema coloca a luta diretamente no **round 2** sem manter uma cópia no **round 1**.

### 2.2 Localização do Problema

**Arquivo:** `app/scoreboard/setup/page.tsx`
**Função:** `handleImportar` (linhas 93-101)

```typescript
const chavesAtualizadas = chavesImportadas.map(chave => ({
  ...chave,
  lutas: chave.lutas.map(luta => {
    if (luta.atleta1 === null || luta.atleta2 === null) {
      return { ...luta, round: 2 }  // ← Problema: sem histórico no round 1
    }
    return luta
  })
}))
```

### 2.3 Impacto

- O histórico do round 1 é perdido
- Não há registro visual de que o atleta avançou automaticamente
- A rastreabilidade do atleta na chave é comprometida

---

## 3. RequisitoFuncional

### RF-001: Manutenção de Histórico de Round na Importação

**Descrição:** Ao importar um arquivo JSON de chave, quando um dos atletas for `null` (atleta não definido), o sistema deve:

1. **Criar uma cópia do registro no round 1** (manter histórico)
2. **Adicionar uma tag de "AVANÇOU"** nessa cópia do round 1
3. **Manter o registro no round 2** (comportamento atual)

---

## 4. Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| **RN-001** | Esta regra é **exclusiva** do momento da importação das chaves |
| **RN-002** | Não deve afetar o fluxo normal de avanço de atletas durante o tournament |
| **RN-003** | A tag "AVANÇOU" deve ser exibida na interface do bracket |

---

## 5. Cenários de Teste

### Cenário 1: Atleta null (atleta2)

**Entrada (JSON):**
```json
{
  "categoria": "Branca Adulto",
  "lutas": [
    {
      "round": 1,
      "position": 0,
      "atleta1": { "nome": "João Silva", "equipe": "Team A" },
      "atleta2": null
    }
  ]
}
```

**Saída Esperada:**
- Luta no **round 1**: `atleta1 = João Silva`, `atleta2 = null`, `tags = ["AVANÇOU"]`
- Luta no **round 2**: `atleta1 = João Silva`, `atleta2 = null`

### Cenário 2: Ambos atletas definidos (sem alteração)

**Entrada (JSON):**
```json
{
  "categoria": "Branca Adulto",
  "lutas": [
    {
      "round": 1,
      "position": 0,
      "atleta1": { "nome": "João Silva", "equipe": "Team A" },
      "atleta2": { "nome": "Maria Santos", "equipe": "Team B" }
    }
  ]
}
```

**Saída Esperada:**
- Apenas uma luta no **round 1** (sem tag)

### Cenário 3: Atleta null (atleta1)

**Entrada (JSON):**
```json
{
  "categoria": "Branca Adulto",
  "lutas": [
    {
      "round": 1,
      "position": 0,
      "atleta1": null,
      "atleta2": { "nome": "Maria Santos", "equipe": "Team B" }
    }
  ]
}
```

**Saída Esperada:**
- Luta no **round 1**: `atleta1 = null`, `atleta2 = Maria Santos`, `tags = ["AVANÇOU"]`
- Luta no **round 2**: `atleta1 = null`, `atleta2 = Maria Santos`

---

## 6. Critérios de Aceitação

| ID | Critério | Método de Verificação |
|----|----------|----------------------|
| CA-001 | Ao importar JSON com atleta null, criar registro no round 1 com tag "AVANÇOU" | Verificar se a luta com round=1 contém a tag |
| CA-002 | Ao importar JSON com atleta null, manter registro no round 2 | Verificar se a luta com round=2 existe |
| CA-003 | A tag "AVANÇOU" deve ser visível na interface do bracket | Verificar renderização no componente de bracket |
| CA-004 | Esta lógica não deve afetar o fluxo manual de advancement de vitórias | Testar fluxo normal de luta sem importação |
| CA-005 | Esta lógica só deve executar no momento da importação de chaves | Verificar que lutas criadas manualmente não têm essa lógica |

---

## 7. Estrutura de Dados Proposta

### 7.1 Novo Campo na Interface Luta

```typescript
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

### 7.2 Exemplo de Dados Resultantes

```json
{
  "id": "uuid-luta-1",
  "round": 1,
  "position": 0,
  "atleta1": { "id": "uuid-atleta-1", "nome": "João Silva", "equipe": "Team A" },
  "atleta2": null,
  "tags": ["AVANÇOU"],
  "nextMatchId": "uuid-luta-2"
}
```

---

## 8. Restrições Técnicas

1. **Compatibilidade**: A mudança deve ser compatível com dados existentes
2. **性能**: A lógica de importação não deve ter degradação significativa de performance
3. **UUID**: Todos os IDs devem continuar sendo UUID v4 conforme requisitos existentes

---

## 9. Referências

- Requisito relacionado: [requirements.md - HU-012](./requirements.md#hu-012-lutas-com-atleta-ausente-bye)
- Arquivo afetado: `app/scoreboard/setup/page.tsx`
- Tipo modificado: `app/types/index.ts` (interface Luta)