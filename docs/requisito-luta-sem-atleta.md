# Requisito: Lutas com Atleta Ausente (BYE)

**Versão:** 1.1
**Data:** 2026-05-18
**Projeto:** BJJ Tournament Manager

---

## Problema

Lutas com a seguinte estrutura não podem ser iniciadas:

```json
{
  "round": 1,
  "position": 2,
  "atleta1": { "nome": "Rafael Lima", "equipe": "Checkmat", "faixa": "Branca" },
  "atleta2": null
}
```

O sistema deve impedir que essas lutas sejam iniciadas, deixando o botão de iniciar desabilitado.

---

## Estrutura de Dados Afetada

```typescript
interface Luta {
  id: string
  round: number
  position: number
  atleta1: Atleta | null
  atleta2: Atleta | null  // pode ser null (BYE)
  resultado?: ResultadoLuta
}
```

---

## Critérios de Aceitação

| ID | Critério | Status |
|----|----------|--------|
| CA-001 | Lutas onde `atleta2` é `null` ou não possui `id` devem ser tratadas como "BYE" | Implementado |
| CA-002 | O botão/card de iniciar luta deve ficar **desabilitado** para lutas com BYE | Implementado |
| CA-003 | Lutas com BYE devem ser marcadas com status visual específico (cor cinza) | Implementado |
| CA-004 | O sistema deve exibir "BYE" + "Avanca" no lugar do nome do atleta ausente | Implementado |
| CA-005 | Botão "Iniciar Luta" no SeletorLuta deve ser desabilitado quando um dos atletas não estiver disponível | Pendente |
| CA-006 | Sistema deve garantir que apenas lutas com ambos atletas definidos possam iniciar | Pendente |

---

## Plano de Implementação

### Fase 1: Análise e Identificação (Concluído)

- [x] Identificar locais onde lutas são iniciadas
- [x] Mapear componentes afetados: `SeletorLuta.tsx`, `BracketMatchupCard.tsx`

### Fase 2: Implementação no Componente de Bracket (Concluído)

- [x] Verificar se `podeClicar` em `BracketMatchupCard.tsx` valida ambos atletas
- [x] Aplicar estilo visual para status "bye" (bg-gray-300)
- [x] Renderizar "BYE" + "Avanca" quando atleta ausente

### Fase 3: Implementação no SeletorLuta (Pendente)

**Arquivo:** `app/components/scoreboard/SeletorLuta.tsx`

**Alteração necessária:**
```typescript
// Linha 37-38 - Atualizar lógica de podeIniciar
const podeIniciar =
  categoriaSelecionada && 
  atleta1Selecionado && 
  atleta2Selecionado &&
  !!atleta1Selecionado.id &&   // Verificar que possui ID
  !!atleta2Selecionado.id       // Verificar que possui ID
```

**Justificativa:** O `SeletorLuta.tsx` permite selecionar atletas manualmente, mas não valida se ambos possuem ID válido antes de permitir iniciar a luta.

### Fase 4: Validação e Testes

- [ ] Criar JSON de teste com `atleta2: null`
- [ ] Testar fluxo no Scoreboard (SeletorLuta)
- [ ] Testar visualização no Bracket
- [ ] Verificar que botão permanece desabilitado

---

## Checklist de Implementação

### Componente: BracketMatchupCard.tsx

| Item | Descrição | Status |
|------|------------|--------|
| 1 | Validação `!!luta.atleta1?.id && !!luta.atleta2?.id` em `podeClicar` | OK |
| 2 | Função `isBye(luta)` retorna true quando atleta sem ID | OK |
| 3 | Estilo visual "bye" = bg-gray-300 border-gray-400 | OK |
| 4 | Renderização "BYE" + "Avanca" no FighterRow | OK |

### Componente: SeletorLuta.tsx

| Item | Descrição | Status |
|------|------------|--------|
| 1 | Validar `atleta1Selecionado?.id` antes de iniciar | Pendente |
| 2 | Validar `atleta2Selecionado?.id` antes de iniciar | Pendente |
| 3 | Botão desabilitado quando atleta sem ID | Pendente |
| 4 | Feedback visual para usuário (opcional) | Pendente |

### Componente: ChaveList.tsx

| Item | Descrição | Status |
|------|------------|--------|
| 1 | Exibir "BYE" quando atleta é null (linha 108-109) | OK |
| 2 | Estilo diferenciado para nome ausente (text-gray-400) | OK |

---

## Implementação Atual

### Arquivo: `app/components/bracket/BracketMatchupCard.tsx`

```typescript
// Linha 43 - Verificação se a luta pode ser clicada
const podeClicar = mode === "live" && 
                   status !== "completed" && 
                   status !== "bye" && 
                   !!luta.atleta1?.id && 
                   !!luta.atleta2?.id
```

```typescript
// Linha 111-113 - Função para verificar se é BYE
function isBye(luta: Luta): boolean {
  return !luta.atleta1?.id || !luta.atleta2?.id
}
```

### Estilo Visual (BYE)

```typescript
// Linha 17-19
if (status === "bye") {
  return "bg-gray-300 border-gray-400"
}
```

### Renderização do BYE

```typescript
// FighterRow - Linha 91-99
if (isBye) {
  return (
    <div className="bg-gray-200 px-3 py-2">
      <span className="text-gray-500 text-sm font-medium">BYE</span>
      <span className="text-gray-400 text-xs block">Avanca</span>
    </div>
  )
}
```

---

## Validacao

Para confirmar que o requisito está implementado corretamente:

1. Importar JSON com luta contendo `atleta2: null`
2. Tentar clicar no card da luta — não deve permitir clique
3. O card deve exibir cor cinza (bg-gray-300)
4. Deve exibir "BYE" no lugar do nome do atleta ausente
5. No SeletorLuta, tentar iniciar luta com atleta que não possui ID — deve estar desabilitado

---

## Arquivos a Modificar

| Arquivo | Modificação | Prioridade |
|---------|-------------|------------|
| `app/components/scoreboard/SeletorLuta.tsx` | Adicionar validação de ID nos atletas | Alta |
| `docs/requirements.md` | Adicionar referência ao HU-012 | Baixa |

---

## Historico de Alteracoes

| Versao | Data | Descricao |
|--------|------|-----------|
| 1.0 | 2026-05-18 | Versao inicial do requisito |
| 1.1 | 2026-05-18 | Adicionado plano de implementação e checklist |