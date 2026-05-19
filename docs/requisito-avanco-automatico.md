# Requisito: Avanço Automático de Vencedor (BYE)

## Visão Geral

Este documento especifica a lógica de atualização automática para lutas com atleta ausente (BYE) durante a importação de chaves.

## Problema

Quando um arquivo JSON de chave de luta é importado, podem existir lutas onde um dos atletas é `null` (atleta x null). Estas lutas representam "BYEs" (lutas onde um atleta avança automaticamente sem competir).

## Regra de Negócio

**Quando importar arquivos JSON de chaves, antes de salvar o JSON da área:**

Para cada luta na chave importada onde `atleta1 === null` OU `atleta2 === null`:
1. Manter o registro original com `round: 1` e marcar como `avancouAutomaticamente: true`
2. Criar uma nova luta com `round: 2` contendo apenas o atleta presente

## Fluxo de Implementação

### 1. Importação de Arquivo JSON
1. Usuário seleciona arquivo(s) JSON de chave
2. Arquivo é lido e parseado pelo hook `useImportacao`
3. Função `processarChave()` converte dados brutos em `ChaveLuta`

### 2. Processamento de Lutas com BYE
Após a função `processarChave()` retornar:
1. Iterar sobre todas as lutas da chave
2. Para cada luta onde `atleta1 === null` OU `atleta2 === null`:
   - Marcar a luta original com `avancouAutomaticamente: true`
   - Criar uma nova luta com `round: 2` contendo apenas o atleta presente

### 3. Salvamento na Área
Após o processamento, salvar os dados atualizados no JSON da área.

## Campo Novo na Interface Luta

**Arquivo:** `app/types/index.ts`

```typescript
export interface Luta {
  // ... campos existentes ...
  avancouAutomaticamente?: boolean
}
```

## Localização no Código

**Arquivo:** `app/scoreboard/setup/page.tsx`
**Função:** `handleImportar`

```typescript
const handleImportar = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const chavesImportadas = await importarArquivos(event.target.files)

  if (chavesImportadas.length > 0) {
    const chavesAtualizadas = chavesImportadas.map(chave => {
      const lutasAtualizadas: Luta[] = []

      chave.lutas.forEach(luta => {
        const isBye = luta.atleta1 === null || luta.atleta2 === null

        if (isBye) {
          const lutaOriginal: Luta = {
            ...luta,
            round: 1,
            avancouAutomaticamente: true
          }

          const AtletaPresente = luta.atleta1 ?? luta.atleta2
          const novaLuta: Luta = {
            id: generateUUID(),
            round: 2,
            position: luta.position,
            atleta1: AtletaPresente,
            atleta2: null,
            resultado: {
              id: generateUUID(),
              pontosAtleta1: 0,
              pontosAtleta2: 0,
              vantagensAtleta1: 0,
              vantagensAtleta2: 0,
              penalidadesAtleta1: 0,
              penalidadesAtleta2: 0,
              tempoDecorrido: 0,
              finalizacaoAtleta1: false,
              finalizacaoAtleta2: false,
              desclassificacao: null,
              vencedor: "atleta1",
              tipoVitoria: "pontos",
              status: "concluida",
              montadasAtleta1: 0,
              montadasAtleta2: 0,
              passagensAtleta1: 0,
              passagensAtleta2: 0,
              quedasAtleta1: 0,
              quedasAtleta2: 0,
              lutaId: null,
              vencedorAtletaId: AtletaPresente?.id ?? null,
              perdedorAtletaId: null,
              AtletaDesclassificadoId: null,
            }
          }

          lutasAtualizadas.push(lutaOriginal, novaLuta)
        } else {
          lutasAtualizadas.push(luta)
        }
      })

      return { ...chave, lutas: lutasAtualizadas }
    })

    const novasChaves = [...chaves, ...chavesAtualizadas]
    setChaves(novasChaves)
    await salvarDados(area, novasChaves)
  }

  event.target.value = ""
}
```

## Exemplos

### Caso 1: Luta com Atleta Ausente (BYE)
**JSON importado:**
```json
{
  "id": "chave-001",
  "categoria": "Branca Adulto",
  "lutas": [
    {
      "id": "luta-001",
      "round": 1,
      "atleta1": { "id": "atleta-001", "nome": "João", "equipe": "Team A" },
      "atleta2": null
    }
  ]
}
```

**Resultado após importação:**

**Luta 1 (original):**
```typescript
{
  id: "luta-001",
  round: 1,
  avancouAutomaticamente: true,
  atleta1: { id: "atleta-001", "nome": "João", "equipe": "Team A" },
  atleta2: null,
  resultado: { status: "concluida", vencedor: "atleta1" }
}
```

**Luta 2 (nova):**
```typescript
{
  id: "nova-luta-uuid",
  round: 2,
  avancouAutomaticamente: false,
  atleta1: { id: "atleta-001", "nome": "João", "equipe": "Team A" },
  atleta2: null,
  resultado: { status: "pendente" }
}
```

### Caso 2: Luta Normal (ambos atletas presentes)
**JSON importado:**
```json
{
  "id": "luta-002",
  "round": 1,
  "atleta1": { "id": "atleta-001", "nome": "João" },
  "atleta2": { "id": "atleta-002", "nome": "Maria" }
}
```

**Resultado após importação:**
```typescript
{
  id: "luta-002",
  round: 1,
  avancouAutomaticamente: false,
  atleta1: { id: "atleta-001", "nome": "João" },
  atleta2: { id: "atleta-002", "nome": "Maria" }
}
```

## Tag Visual

A tag `avancouAutomaticamente: true` deve ser exibida na interface:
- Na visualização da chave/bracket
- Como badge/badge de status
- Texto: "Avançou" ou "W.O."

## Requisitos Relacionados

- **HU-011:** Avanço Automático de Vencedor
- **HU-012:** Lutas com Atleta Ausente (BYE)
- **Requisito:** `docs/requisito-luta-sem-atleta.md`

## Histórico

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0 | 2026-05-18 | Versão inicial |
| 1.1 | 2026-05-18 | Atualizado: criar cópia round 1 + nova luta round 2 + tag avancouAutomaticamente |