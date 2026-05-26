# Diagnóstico e Plano de Correção
# Bug: Vencedor não avança visualmente para o próximo card (3 atletas)

## Regra de Negócio (Obrigatória)

Exclusivamente para chaves com **total de 3 atletas**, ao finalizar a primeira luta real do Round 1:

1. **Vencedor** da 1ª luta → vai para o **card 9** (Round 2, position 0, atleta1) e **aguarda**
2. **Perdedor** da 1ª luta → luta contra o **atleta que avançou por BYE**
3. **Vencedor** desse confronto (perdedor vs BYE) → vai para o **card 10** (Round 2, position 0, atleta2) para enfrentar o vencedor que aguarda no card 9
4. **Card 9 vs Card 10** → final da chave de 3 atletas

## Estrutura Esperada

```
Situação inicial:
  R1P0: A vs B (luta real)
  R1P1: C vs null (BYE)

R1P0 finalizado (A vence):
  A → card 9 (R2P0 atleta1) — aguarda
  B (perdedor) vs C (BYE) → nova luta
  Vencedor(B vs C) → card 10 (R2P0 atleta2) — enfrenta A

R2P0: A vs Vencedor(B vs C) — FINAL
```

## Mapeamento Cards × Posições

| Card | Lado | Posição | Slot |
|------|------|---------|------|
| 9 | Esquerdo | R2 position 0 | atleta1 |
| 10 | Esquerdo | R2 position 0 | atleta2 |

## O que o Código Atual Faz (INCORRETO)

O código atual (`advanceWinner` em `bracket-utils.ts`) coloca o **vencedor** da 1ª luta para enfrentar o atleta do BYE, o que está errado. O correto é o **perdedor** enfrentar o atleta do BYE, e o vencedor aguardar no card 9.

## Próximos Passos (Pendentes de Implementação)

- [ ] `advanceWinner`: quando `isThreeCompetitors && !isDesclassificacao && round === 1`, colocar vencedor no card 9 (R2P0 atleta1) e criar luta entre perdedor vs atleta do BYE
- [ ] A luta "perdedor vs BYE" precisa ser criada dinamicamente (não existe no JSON importado)
- [ ] O vencedor da luta "perdedor vs BYE" avança para card 10 (R2P0 atleta2)
- [ ] Card 9 vs card 10 = final da chave
