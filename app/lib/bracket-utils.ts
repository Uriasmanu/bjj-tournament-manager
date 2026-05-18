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
    result.push({
      label: "Semifinal",
      matchups: round3Lutas.map(l => toMatchup(l, "Semifinal")),
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

  const nextId = completed.nextMatchId

  if (!nextId) {
    return {
      ...chave,
      status: "concluida",
      vencedorAtletaId: winner.id,
    }
  }

  const next = chave.lutas.find(l => l.id === nextId)
  if (!next) return chave

  const updatedLutas = chave.lutas.map(luta => {
    if (luta.id !== nextId) return luta

    const prevIds = luta.previousMatchIds || []
    const idx = prevIds.indexOf(completedFightId)

    if (idx === 0 || (idx === -1 && !luta.atleta1?.id)) {
      return { ...luta, atleta1: winner }
    } else if (idx === 1 || (idx === -1 && !luta.atleta2?.id)) {
      return { ...luta, atleta2: winner }
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