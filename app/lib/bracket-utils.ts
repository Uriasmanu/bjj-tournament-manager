import {
  ChaveLuta,
  BracketRound,
  BracketMatchup,
  FighterSlot,
  MatchupStatus,
  ResultadoLuta,
  Luta,
  Atleta
} from "@/app/types"

// ============================================================
// Helper para detectar chave com 3 competidores
// ============================================================
export function isThreeCompetitorsChave(chave: ChaveLuta): boolean {
  return chave.totalCompetidores === 3
}

// ============================================================
// buildBracketFromChaveLuta
// ============================================================
export function buildBracketFromChaveLuta(chave: ChaveLuta): BracketRound[] {
  const rounds = groupByRound(chave.lutas)
  const result: BracketRound[] = []

  const round1Lutas = rounds.get(1) || []
  const leftLutas = round1Lutas.filter(l => l.position < 2)
  const rightLutas = round1Lutas.filter(l => l.position >= 2)

  if (leftLutas.length > 0 || rightLutas.length > 0) {
    result.push({
      label: "Round 1",
      matchups: round1Lutas.map(l => toMatchup(l, "Round 1")),
      side: "left",
    })
  }

  const round2Lutas = rounds.get(2) || []
  if (round2Lutas.length > 0) {
    result.push({
      label: "Quartas",
      matchups: round2Lutas.map(l => toMatchup(l, "Quartas")),
      side: "center",
    })
  }

  const round3Lutas = rounds.get(3) || []
  if (round3Lutas.length > 0) {
    const isThreeCompetitors = isThreeCompetitorsChave(chave)
    const label = isThreeCompetitors ? "Final" : "Semifinal"
    result.push({
      label,
      matchups: round3Lutas.map(l => toMatchup(l, label)),
      side: "center",
    })
  }

  const maxRound = rounds.size > 0 ? Math.max(...Array.from(rounds.keys())) : 1
  const finalLutas = rounds.get(maxRound) || []
  if (finalLutas.length > 0 || rounds.size === 0) {
    result.push({
      label: "Final",
      matchups: finalLutas.map(l => toMatchup(l, "Final")),
      side: "center",
    })
  }

  return result
}

function groupByRound(lutas: Luta[]): Map<number, Luta[]> {
  const map = new Map<number, Luta[]>()
  lutas.forEach(luta => {
    const existing = map.get(luta.round) || []
    existing.push(luta)
    map.set(luta.round, existing)
  })
  return map
}

function toMatchup(luta: Luta, label: string): BracketMatchup {
  return {
    id: luta.id,
    round: luta.round,
    position: luta.position,
    fighter1: toFighterSlot(luta.atleta1, "top"),
    fighter2: toFighterSlot(luta.atleta2, "bottom"),
    result: luta.resultado,
    status: getMatchupStatus(luta),
    label,
    nextMatchId: luta.nextMatchId,
    previousMatchIds: luta.previousMatchIds,
  }
}

function toFighterSlot(atleta: Atleta | null | undefined, position: "top" | "bottom"): FighterSlot {
  const isBye = !atleta || !atleta.id
  return {
    athlete: atleta,
    seed: undefined,
    isBye,
    resultStatus: null,
  }
}

function getMatchupStatus(luta: Luta): MatchupStatus {
  if (!luta.atleta1?.id && !luta.atleta2?.id) return "pending"
  if (!luta.atleta1?.id || !luta.atleta2?.id) return "bye"
  if (luta.resultado?.status === "concluida") return "completed"
  return "pending"
}

// ============================================================
// generatePosition - Gera position automaticamente baseado na ordem do array
// round 1: usa lógica interleaved (1,9,3,11,5,13,7,15 para cards 1-16)
// round 2: posições 0,1 (esq), 2,3 (dir)
// round 3: posições 0 (esq), 1 (dir)
// CORREÇÃO: Considera fluxo visual e tratamento de BYE
// ============================================================
export function generatePosition(lutas: Luta[]): Luta[] {
  const rounds = new Map<number, Luta[]>()
  
  // Agrupar por round
  lutas.forEach(luta => {
    const existing = rounds.get(luta.round) || []
    existing.push(luta)
    rounds.set(luta.round, existing)
  })

  return lutas.map(luta => {
    const roundLutas = rounds.get(luta.round) || []
    const indexInRound = roundLutas.findIndex(l => l.id === luta.id)

    let position: number

    if (luta.round === 1) {
      // Round 1 - mantém lógica atual
      position = indexInRound
    } else {
      // Rounds 2+: Verificar se veio de BYE
      const prevMatchIds = luta.previousMatchIds || []
      
      const hasByeOrigin = prevMatchIds.some(prevId => {
        const prevLuta = lutas.find(l => l.id === prevId)
        return prevLuta && (!prevLuta.atleta1?.id || !prevLuta.atleta2?.id)
      })

      if (hasByeOrigin && prevMatchIds.length > 0) {
        // Luta veio de BYE - calcular posição baseada na luta de origem
        const sourceLuta = lutas.find(l => l.id === prevMatchIds[0])
        position = calculateByePosition(sourceLuta, indexInRound, lutas)
      } else {
        // Luta normal - usar índice
        position = indexInRound
      }
    }

    return { ...luta, position }
  })
}

function calculateByePosition(sourceLuta: Luta | undefined, fallbackIndex: number, lutas: Luta[]): number {
  if (!sourceLuta) return fallbackIndex
  
  const sourcePosition = sourceLuta.position
  const sourceRound = sourceLuta.round
  
  // Lado direito: posições ímpares (1,3,5,7)
  // Lado esquerdo: posições pares (0,2,4,6)
  const isRightSide = sourcePosition % 2 === 1
  
  if (sourceRound === 1) {
    // Para Round 2: manter o lado do Round 1
    // Right side (pos 1,3,5,7) -> Round 2: posições 2,3
    // Left side (pos 0,2,4,6) -> Round 2: posições 0,1
    if (isRightSide) {
      const rightSideLutas = lutas.filter(l => l.round === 2 && l.position >= 2)
      if (rightSideLutas.length > 0) {
        return 3
      }
      return 2
    } else {
      const leftSideLutas = lutas.filter(l => l.round === 2 && l.position < 2)
      if (leftSideLutas.length > 0) {
        return 1
      }
      return 0
    }
  }
  
  if (sourceRound === 2) {
    // Se veio do Round 2 (Quartas), mapear para semifinal
    // Right side: position 2,3 -> semifinal position 1
    // Left side: position 0,1 -> semifinal position 0
    if (sourcePosition >= 2) {
      return 1
    }
    return 0
  }
  
  return fallbackIndex
}

// ============================================================
// getCardNumber - Retorna o número do card baseado no round, índice e lado
// round: 1, 2, 3
// indexInRound: índice da luta dentro do round (0, 1, 2, ...)
// isLeftSide: true = lado esquerdo, false = lado direito
// isAtleta1: true = retorna card do atleta1, false = card do atleta2
// ============================================================
export function getCardNumber(round: number, indexInRound: number, isLeftSide: boolean, isAtleta1: boolean): number {
  // Round 1 (Oitavas) - 4 lutas por lado
  if (round === 1) {
    if (isLeftSide) {
      // Lado esquerdo: índice 0→1,2 | 1→3,4 | 2→5,6 | 3→7,8
      return isAtleta1 ? indexInRound * 2 + 1 : indexInRound * 2 + 2
    } else {
      // Lado direito: índice 0→9,10 | 1→11,12 | 2→13,14 | 3→15,16
      return isAtleta1 ? indexInRound * 2 + 9 : indexInRound * 2 + 10
    }
  }

  // Round 2 (Quartas) - 2 lutas por lado
  if (round === 2) {
    if (isLeftSide) {
      // Lado esquerdo: índice 0→17,18 | 1→19,20
      return isAtleta1 ? 17 + indexInRound * 2 : 18 + indexInRound * 2
    } else {
      // Lado direito: índice 0→25,26 | 1→27,28
      return isAtleta1 ? 25 + indexInRound * 2 : 26 + indexInRound * 2
    }
  }

  // Round 3 (Semifinal) - 1 luta por lado
  if (round === 3) {
    if (isLeftSide) {
      // Lado esquerdo: índice 0→21,22
      return isAtleta1 ? 21 + indexInRound * 2 : 22 + indexInRound * 2
    } else {
      // Lado direito: índice 0→23,24
      return isAtleta1 ? 23 + indexInRound * 2 : 24 + indexInRound * 2
    }
  }

  return 0
}

// ============================================================
// getNextPosition - Determina a próxima posição baseado em round/position fixos
// Retorna: { round, position, useAtleta1 }
// ============================================================
function getNextPosition(round: number, position: number, isWinnerAtleta1: boolean): { round: number; position: number; useAtleta1: boolean } | null {
  // Round 1 (Oitavas) - Lado Esquerdo
  // position 0 (card 1-2) -> round 2, position 0 (cards 17-18) - impar vai para atleta1, par para atleta2
  if (round === 1 && position === 0) return { round: 2, position: 0, useAtleta1: true }
  if (round === 1 && position === 1) return { round: 2, position: 0, useAtleta1: false }
  // position 2 (card 3-4) -> round 2, position 1 (cards 19-20)
  if (round === 1 && position === 2) return { round: 2, position: 1, useAtleta1: true }
  if (round === 1 && position === 3) return { round: 2, position: 1, useAtleta1: false }

  // Round 1 (Oitavas) - Lado Direito
  // position 4 (card 9-10) -> round 2, position 2 (cards 25-26)
  if (round === 1 && position === 4) return { round: 2, position: 2, useAtleta1: true }
  if (round === 1 && position === 5) return { round: 2, position: 2, useAtleta1: false }
  // position 6 (card 11-12) -> round 2, position 3 (cards 27-28)
  if (round === 1 && position === 6) return { round: 2, position: 3, useAtleta1: true }
  if (round === 1 && position === 7) return { round: 2, position: 3, useAtleta1: false }

  // Round 2 (Quartas) - Lado Esquerdo
  // position 0 (cards 17-18) -> round 3, position 0 (cards 21-22)
  if (round === 2 && position === 0) return { round: 3, position: 0, useAtleta1: true }
  if (round === 2 && position === 1) return { round: 3, position: 0, useAtleta1: false }

  // Round 2 (Quartas) - Lado Direito
  // position 2 (cards 25-26) -> round 3, position 1 (cards 23-24)
  if (round === 2 && position === 2) return { round: 3, position: 1, useAtleta1: true }
  if (round === 2 && position === 3) return { round: 3, position: 1, useAtleta1: false }

  // Round 3 (Semifinal) - Final
  if (round === 3) return null

  return null
}

export function isRealFight(luta: Luta): boolean {
  return !!luta.atleta1?.id && !!luta.atleta2?.id
}

function areAllRound1FightsCompleted(chave: ChaveLuta): boolean {
  return chave.lutas
    .filter(l => l.round === 1)
    .every(l => isByeSlot(l) || l.resultado?.status === "concluida")
}

// ============================================================
// advanceWinner
// ============================================================
export function advanceWinner(
  chave: ChaveLuta,
  completedFightId: string,
  winner: Atleta,
  loser: Atleta
): ChaveLuta {
  const completed = chave.lutas.find(l => l.id === completedFightId)
  if (!completed) return chave

  const round = completed.round
  const position = completed.position

  // Verificar se é a final (round 3)
  const maxRound = Math.max(...chave.lutas.map(l => l.round))
  const isFinal = round === maxRound

  if (isFinal) {
    const novoResultado: ResultadoLuta = {
      id: crypto.randomUUID(),
      pontosAtleta1: completed.resultado?.pontosAtleta1 || 0,
      pontosAtleta2: completed.resultado?.pontosAtleta2 || 0,
      montadasAtleta1: completed.resultado?.montadasAtleta1 || 0,
      montadasAtleta2: completed.resultado?.montadasAtleta2 || 0,
      passagensAtleta1: completed.resultado?.passagensAtleta1 || 0,
      passagensAtleta2: completed.resultado?.passagensAtleta2 || 0,
      quedasAtleta1: completed.resultado?.quedasAtleta1 || 0,
      quedasAtleta2: completed.resultado?.quedasAtleta2 || 0,
      vantagensAtleta1: completed.resultado?.vantagensAtleta1 || 0,
      vantagensAtleta2: completed.resultado?.vantagensAtleta2 || 0,
      penalidadesAtleta1: completed.resultado?.penalidadesAtleta1 || 0,
      penalidadesAtleta2: completed.resultado?.penalidadesAtleta2 || 0,
      tempoDecorrido: completed.resultado?.tempoDecorrido || 0,
      finalizacaoAtleta1: completed.resultado?.finalizacaoAtleta1 || false,
      finalizacaoAtleta2: completed.resultado?.finalizacaoAtleta2 || false,
      desclassificacao: completed.resultado?.desclassificacao || null,
      vencedor: completed.resultado?.vencedor || null,
      tipoVitoria: completed.resultado?.tipoVitoria || "pontos",
      status: "concluida",
      lutaId: completed.id,
      vencedorAtletaId: winner.id,
      perdedorAtletaId: loser.id,
      AtletaDesclassificadoId: completed.resultado?.AtletaDesclassificadoId || null,
    }
    return {
      ...chave,
      status: "concluida",
      vencedorAtletaId: winner.id,
      lutas: chave.lutas.map(luta => {
        if (luta.id === completedFightId) {
          return { ...luta, resultado: novoResultado }
        }
        return luta
      })
    }
  }

  const isDesclassificacao = completed.resultado?.tipoVitoria === "desclassificacao"

  const isThreeCompetitors = isThreeCompetitorsChave(chave)

  if (isDesclassificacao && round === 1 && isRealFight(completed)) {
    const byeLuta = chave.lutas.find(l =>
      l.round === 1 && (!l.atleta1?.id || !l.atleta2?.id)
    )

    if (byeLuta) {
      const round2ByeLuta = chave.lutas.find(l =>
        l.round === 2 && l.previousMatchIds?.includes(byeLuta.id)
      )

      if (round2ByeLuta) {
        const novoResultado: ResultadoLuta = {
          id: crypto.randomUUID(),
          pontosAtleta1: completed.resultado?.pontosAtleta1 || 0,
          pontosAtleta2: completed.resultado?.pontosAtleta2 || 0,
          montadasAtleta1: completed.resultado?.montadasAtleta1 || 0,
          montadasAtleta2: completed.resultado?.montadasAtleta2 || 0,
          passagensAtleta1: completed.resultado?.passagensAtleta1 || 0,
          passagensAtleta2: completed.resultado?.passagensAtleta2 || 0,
          quedasAtleta1: completed.resultado?.quedasAtleta1 || 0,
          quedasAtleta2: completed.resultado?.quedasAtleta2 || 0,
          vantagensAtleta1: completed.resultado?.vantagensAtleta1 || 0,
          vantagensAtleta2: completed.resultado?.vantagensAtleta2 || 0,
          penalidadesAtleta1: completed.resultado?.penalidadesAtleta1 || 0,
          penalidadesAtleta2: completed.resultado?.penalidadesAtleta2 || 0,
          tempoDecorrido: completed.resultado?.tempoDecorrido || 0,
          finalizacaoAtleta1: completed.resultado?.finalizacaoAtleta1 || false,
          finalizacaoAtleta2: completed.resultado?.finalizacaoAtleta2 || false,
          desclassificacao: completed.resultado?.desclassificacao || null,
          vencedor: completed.resultado?.vencedor || null,
          tipoVitoria: completed.resultado?.tipoVitoria || "desclassificacao",
          status: "concluida",
          lutaId: completed.id,
          vencedorAtletaId: winner.id,
          perdedorAtletaId: loser.id,
          AtletaDesclassificadoId: completed.resultado?.AtletaDesclassificadoId || null,
        }

        if (isThreeCompetitors && areAllRound1FightsCompleted(chave)) {
          const lutaRound3: Luta = {
            id: crypto.randomUUID(),
            round: 3,
            position: 0,
            previousMatchIds: [completed.id, round2ByeLuta.id],
            atleta1: winner,
            atleta2: round2ByeLuta.atleta1,
            resultado: { status: "pendente" } as ResultadoLuta
          }

          const existingRound3 = chave.lutas.some(l => l.round === 3 && l.position === 0)
          if (existingRound3) {
            return {
              ...chave,
              status: "em_andamento",
              lutas: chave.lutas.map(luta => {
                if (luta.id === completedFightId) {
                  return { ...luta, resultado: novoResultado }
                }
                if (luta.id === round2ByeLuta.id) {
                  return { ...luta, tags: ["AVANÇOU"] }
                }
                return luta
              })
            }
          }

          return {
            ...chave,
            status: "em_andamento",
            lutas: [
              ...chave.lutas.map(luta => {
                if (luta.id === completedFightId) {
                  return { ...luta, resultado: novoResultado }
                }
                if (luta.id === round2ByeLuta.id) {
                  return { ...luta, tags: ["AVANÇOU"] }
                }
                return luta
              }),
              lutaRound3
            ]
          }
        }
      }
    }
  }

  // Consolação para 3 atletas sem DSQ: perdedor do Round 1 vai para Round 2
  if (isThreeCompetitors && !isDesclassificacao && round === 1 && isRealFight(completed)) {
    let lutasAtualizadas = chave.lutas

    const round2ByeLuta = lutasAtualizadas.find(l =>
      l.round === 2 && (!l.atleta1?.id || !l.atleta2?.id)
    )
    if (round2ByeLuta) {
      const emptySlot = !round2ByeLuta.atleta1?.id ? ("atleta1" as const) : ("atleta2" as const)
      lutasAtualizadas = lutasAtualizadas.map(luta =>
        luta.id === round2ByeLuta.id ? { ...luta, [emptySlot]: loser } : luta
      )
    }

    // Garantir que Round 3 position 0 exista para receber o vencedor
    if (!lutasAtualizadas.some(l => l.round === 3 && l.position === 0)) {
      const round3Luta: Luta = {
        id: crypto.randomUUID(),
        round: 3,
        position: 0,
        previousMatchIds: [],
        atleta1: null,
        atleta2: null,
        resultado: { status: "pendente" } as ResultadoLuta
      }
      lutasAtualizadas = [...lutasAtualizadas, round3Luta]
    }

    chave = { ...chave, lutas: lutasAtualizadas }
  }

  // Para chaves com 3 competidores, o vencedor do Round 1 vai direto para Round 3
  let nextPos: { round: number; position: number; useAtleta1: boolean } | null

  if (isThreeCompetitors && round === 1) {
    const round3Luta = chave.lutas.find(l => l.round === 3 && l.position === 0)
    if (round3Luta) {
      nextPos = { round: 3, position: 0, useAtleta1: true }
    } else {
      nextPos = null
    }
  } else if (isThreeCompetitors && round === 2) {
    const round3Luta = chave.lutas.find(l => l.round === 3 && l.position === 0)
    if (round3Luta) {
      nextPos = { round: 3, position: 0, useAtleta1: false }
    } else {
      nextPos = null
    }
  } else {
    const isWinnerAtleta1 = completed.atleta1?.id === winner.id
    nextPos = getNextPosition(round, position, isWinnerAtleta1)
  }
  if (!nextPos) {
    return {
      ...chave,
      status: "concluida",
      vencedorAtletaId: winner.id,
    }
  }

  // Buscar a próxima luta
  const nextLuta = chave.lutas.find(l =>
    l.round === nextPos.round && l.position === nextPos.position
  )

  if (!nextLuta) {
    return {
      ...chave,
      status: "concluida",
      vencedorAtletaId: winner.id,
    }
  }

  const updatedLutas = chave.lutas.map(luta => {
    // Atualizar luta concluída
    if (luta.id === completedFightId) {
      const novoResultado: ResultadoLuta = {
        id: crypto.randomUUID(),
        pontosAtleta1: luta.resultado?.pontosAtleta1 || 0,
        pontosAtleta2: luta.resultado?.pontosAtleta2 || 0,
        montadasAtleta1: luta.resultado?.montadasAtleta1 || 0,
        montadasAtleta2: luta.resultado?.montadasAtleta2 || 0,
        passagensAtleta1: luta.resultado?.passagensAtleta1 || 0,
        passagensAtleta2: luta.resultado?.passagensAtleta2 || 0,
        quedasAtleta1: luta.resultado?.quedasAtleta1 || 0,
        quedasAtleta2: luta.resultado?.quedasAtleta2 || 0,
        vantagensAtleta1: luta.resultado?.vantagensAtleta1 || 0,
        vantagensAtleta2: luta.resultado?.vantagensAtleta2 || 0,
        penalidadesAtleta1: luta.resultado?.penalidadesAtleta1 || 0,
        penalidadesAtleta2: luta.resultado?.penalidadesAtleta2 || 0,
        tempoDecorrido: luta.resultado?.tempoDecorrido || 0,
        finalizacaoAtleta1: luta.resultado?.finalizacaoAtleta1 || false,
        finalizacaoAtleta2: luta.resultado?.finalizacaoAtleta2 || false,
        desclassificacao: luta.resultado?.desclassificacao || null,
        vencedor: luta.resultado?.vencedor || null,
        tipoVitoria: luta.resultado?.tipoVitoria || "pontos",
        status: "concluida",
        lutaId: luta.id,
        vencedorAtletaId: winner.id,
        perdedorAtletaId: loser.id,
        AtletaDesclassificadoId: luta.resultado?.AtletaDesclassificadoId || null,
      }
      return { ...luta, resultado: novoResultado }
    }

    // Atualizar próxima luta com o vencedor usando a posição correta
    if (luta.id === nextLuta.id) {
      if (nextPos.useAtleta1) {
        return { ...luta, atleta1: winner }
      } else {
        return { ...luta, atleta2: winner }
      }
    }

    return luta
  })

  return {
    ...chave,
    status: "em_andamento",
    lutas: updatedLutas,
  }
}

// ============================================================
// getFighterTags & getFighterStatus
// ============================================================
export type ResultTagVariant = "success" | "danger" | "danger-bold" | "info"

export interface ResultTag {
  label: "VENCEU" | "PERDEU" | "DESCLASS." | "FINALIZOU"
  variant: ResultTagVariant
}

export function getFighterTags(resultado: ResultadoLuta | undefined, fighter: "atleta1" | "atleta2"): ResultTag[] {
  if (!resultado || resultado.status !== "concluida") return []

  const tags: ResultTag[] = []

  if (resultado.desclassificacao) {
    if (resultado.desclassificacao === fighter) {
      tags.push({ label: "DESCLASS.", variant: "danger-bold" })
    } else {
      tags.push({ label: "VENCEU", variant: "success" })
    }
  } else if (resultado.vencedor === fighter) {
    tags.push({ label: "VENCEU", variant: "success" })
    const isFinalizacao = fighter === "atleta1" ? resultado.finalizacaoAtleta1 : resultado.finalizacaoAtleta2
    if (isFinalizacao) {
      tags.push({ label: "FINALIZOU", variant: "info" })
    }
  } else {
    tags.push({ label: "PERDEU", variant: "danger" })
  }

  return tags
}

export function getFighterStatus(resultado: ResultadoLuta | undefined, fighter: "atleta1" | "atleta2"): "winner" | "loser" | "disqualified" | null {
  if (!resultado || resultado.status !== "concluida") return null

  if (resultado.desclassificacao === fighter) return "disqualified"
  if (resultado.vencedor === fighter) return "winner"
  return "loser"
}

// ============================================================
// Helpers
// ============================================================
export function getRoundLabel(round: number): string {
  switch (round) {
    case 1: return "Round 1"
    case 2: return "Quartas"
    case 3: return "Semifinal"
    case 4: return "Final"
    default: return `Round ${round}`
  }
}

export function isByeSlot(luta: Luta): boolean {
  return !luta.atleta1?.id || !luta.atleta2?.id
}

export function getLutaById(chave: ChaveLuta, lutaId: string): Luta | undefined {
  return chave.lutas.find(l => l.id === lutaId)
}

export function findAtletaById(chave: ChaveLuta, atletaId: string): Atleta | undefined {
  for (const luta of chave.lutas) {
    if (luta.atleta1?.id === atletaId) return luta.atleta1
    if (luta.atleta2?.id === atletaId) return luta.atleta2
  }
  return undefined
}

export function getUnicoAtleta(chave: ChaveLuta): Atleta | undefined {
  const nomes = new Set<string>()
  let ultimo: Atleta | undefined
  for (const luta of chave.lutas) {
    if (luta.atleta1?.nome) {
      if (!nomes.has(luta.atleta1.nome)) {
        nomes.add(luta.atleta1.nome)
        ultimo = luta.atleta1
      }
    }
    if (luta.atleta2?.nome) {
      if (!nomes.has(luta.atleta2.nome)) {
        nomes.add(luta.atleta2.nome)
        ultimo = luta.atleta2
      }
    }
  }
  return nomes.size === 1 ? ultimo : undefined
}

export function podeIniciarLuta(luta: Luta, chave: ChaveLuta): boolean {
  if (!luta.atleta1?.id || !luta.atleta2?.id) return false

  if (luta.previousMatchIds && luta.previousMatchIds.length > 0) {
    for (const prevId of luta.previousMatchIds) {
      const lutaAnterior = chave.lutas.find(l => l.id === prevId)
      if (!lutaAnterior) continue

      const eraBye = !lutaAnterior.atleta1?.id || !lutaAnterior.atleta2?.id
      if (!eraBye && lutaAnterior.resultado?.status !== "concluida") {
        return false
      }
    }
  }

  return true
}

export function canInteract(luta: Luta, chave: ChaveLuta): boolean {
  if (!luta.atleta1?.id || !luta.atleta2?.id) return false
  return podeIniciarLuta(luta, chave)
}