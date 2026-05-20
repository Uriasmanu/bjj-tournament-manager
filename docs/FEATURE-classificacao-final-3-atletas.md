# FEATURE: Classificação Final para chaves de 3 atletas

## Objetivo

Corrigir a renderização da Classificação Final no componente de bracket para chaves com 3 atletas.

### Comportamento esperado
- Campeão: atleta vencedor do combate final.
- Vice-campeão: atleta derrotado no combate final.
- 3º lugar: atleta eliminado na luta anterior (ou atleta desclassificado) e não o perdedor da final.
- Para chaves de 3 competidores, somente um terceiro lugar deve aparecer.
- O pódio deve ser derivado a partir dos resultados válidos, mesmo que `chave.status` ainda esteja `em_andamento`.

## Cenário conhecido

Dados de `data/area-1.json` em `Branca Adulto Masculino - 65kg`:

- `João Silva` venceu `Carlos Santos` por desclassificação na primeira luta.
- `Pedro Lima` avançou por BYE para a final.
- `João Silva` venceu `Pedro Lima` na luta de round 3.

Problema atual:
- `1º` e `2º` aparecem vazios.
- `3º` mostra `Pedro Lima` (perdedor da final), em vez de `Carlos Santos`.

## Requisitos

1. O componente de classificação final deve derivar o pódio a partir dos resultados da chave.
2. `finalWinner` deve ser o atleta vencedor do combate final.
3. `finalRunnerUp` deve ser o atleta derrotado no combate final.
4. Em chaves com `totalCompetidores === 3`:
   - o terceiro lugar deve ser calculado a partir da eliminação anterior ao final;
   - não usar o perdedor da única luta de round 3 como terceiro lugar;
   - exibir apenas uma linha de bronze.
5. O componente não deve depender estritamente de `chave.status === "concluida"` para renderizar o campeão e vice, se o resultado final já está concluído.
6. O atleta desclassificado deve ser incluído na classificação final quando sua eliminação for a terceira colocação.

## Impacto técnico

O problema está em `app/components/bracket/BracketLayout.tsx`:

- `finalWinner` depende de `chave.status === "concluida"` para retornar um campeão.
- `finalRunnerUp` é calculado a partir de `finalLutas[0]` mas não trata corretamente o caso de chaves de 3 atletas.
- `thirdPlaceLeft` e `thirdPlaceRight` usam a mesma luta em chaves de 3 atletas, resultando em bronze incorreto.

## Plano de implementação

1. Ajustar a derivação de campeão/vice:
   - aceitar `chave.vencedorAtletaId` ou buscar o vencedor no último combate concluído.
   - usar o combate de maior round (`maxRound`) como final.
2. Implementar regra específica para chaves de 3 atletas:
   - localizar a luta anterior ao final que eliminou o terceiro colocado;
   - garantir que o atleta eliminado por desclassificação seja considerado terceiro lugar.
3. Ajustar a renderização do pódio:
   - mostrar 1º e 2º sempre que a final estiver concluída;
   - mostrar apenas um `3º` para `totalCompetidores === 3`;
   - manter dois terceiros lugares apenas para chaves com 4 ou mais competidores.
4. Validar com o JSON de exemplo e adicionar um caso de teste ou fixture para:
   - chave de 3 atletas com BYE;
   - atleta eliminado por desclassificação;
   - final concluída com `chave.status` possivelmente `em_andamento`.

## Critérios de aceitação

- Para `Branca Adulto Masculino - 65kg` em `data/area-1.json`:
  - `1º` deve exibir `João Silva (Team Alpha)`;
  - `2º` deve exibir `Pedro Lima (Team Gamma)`;
  - `3º` deve exibir `Carlos Santos (Team Beta)`.
- O componente não deve preencher `3º` com o perdedor da final em chaves de 3 atletas.
- O pódio deve continuar consistente para chaves maiores com dois terceiros lugares.
- O cálculo do pódio deve ser baseado em resultados de luta válidos e IDs de atleta.
