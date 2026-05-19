"use client"

import { cn } from "@/lib/utils"
import { Luta, ResultadoLuta } from "@/app/types"
import { getFighterTags, getFighterStatus } from "@/app/lib/bracket-utils"
import { ResultBadgeList } from "./ResultBadge"

interface BracketMatchupCardProps {
  luta: Luta
  onClick?: () => void
  isActive?: boolean
  side: "left" | "right" | "center"
  mode?: "live" | "readonly"
}

function getCardStyles(status: "pending" | "bye" | "live" | "completed", winnerSide: "atleta1" | "atleta2" | null, fighter: "atleta1" | "atleta2") {
  if (status === "bye") {
    return "bg-gray-300 border-gray-400"
  }

  if (status === "completed") {
    if (winnerSide === fighter) {
      return "bg-green-50 border-green-500"
    }
    return "bg-red-50 border-red-400"
  }

  if (status === "live") {
    return "bg-amber-50 border-amber-400"
  }

  return "bg-gray-50 border-gray-200"
}

export function BracketMatchupCard({ luta, onClick, isActive, side, mode = "live" }: BracketMatchupCardProps) {
  const isCompleted = luta.resultado?.status === "concluida"
  const status: "pending" | "bye" | "live" | "completed" = isCompleted ? "completed" : isActive ? "live" : (isBye(luta) ? "bye" : "pending")

  const winnerSide = isCompleted && luta.resultado?.vencedor
    ? (luta.resultado.vencedor === "atleta1" ? "atleta1" : "atleta2")
    : null

  const podeClicar = mode === "live" && status !== "completed" && status !== "bye" && !!luta.atleta1?.id && !!luta.atleta2?.id

  const borderClass = isActive ? "ring-2 ring-amber-400" : ""

  return (
    <div
      onClick={podeClicar ? onClick : undefined}
      className={cn(
        "w-[160px] border-2 rounded-lg overflow-hidden cursor-pointer transition-all",
        getCardStyles(status, winnerSide, "atleta1"),
        status === "live" && "animate-pulse",
        podeClicar ? "hover:bg-gray-100 hover:border-gray-400 cursor-pointer" : "cursor-default",
        !podeClicar && "cursor-default",
        borderClass
      )}
    >
      <FighterRow
        atleta={luta.atleta1}
        result={luta.resultado}
        fighter="atleta1"
        status={getFighterStatus(luta.resultado, "atleta1")}
        tags={getFighterTags(luta.resultado, "atleta1")}
        advanceTag={luta.tags?.includes("AVANÇOU")}
        round={luta.round}
        opponentIsNull={!luta.atleta2?.id}
      />

      <div className="bg-gray-200 text-gray-500 text-xs font-bold text-center py-1 border-y border-gray-300">
        {isCompleted && luta.resultado ? `${luta.resultado.pontosAtleta1} x ${luta.resultado.pontosAtleta2}` : "VS"}
      </div>

      <FighterRow
        atleta={luta.atleta2}
        result={luta.resultado}
        fighter="atleta2"
        status={getFighterStatus(luta.resultado, "atleta2")}
        tags={getFighterTags(luta.resultado, "atleta2")}
        advanceTag={luta.tags?.includes("AVANÇOU")}
        round={luta.round}
        opponentIsNull={!luta.atleta1?.id}
      />
    </div>
  )
}

interface FighterRowProps {
  atleta: Luta["atleta1"]
  result?: ResultadoLuta
  fighter: "atleta1" | "atleta2"
  status: ReturnType<typeof getFighterStatus>
  tags: ReturnType<typeof getFighterTags>
  advanceTag?: boolean
  round?: number
  opponentIsNull?: boolean
}

function FighterRow({ atleta, status, tags, advanceTag, round, opponentIsNull }: FighterRowProps) {
  const isBye = !atleta?.id
  const showAdvanceTag = opponentIsNull && round === 1

  if (isBye) {
    return (
      <div className="bg-gray-200 px-3 py-2">
        <span className="text-gray-500 text-sm font-medium">BYE</span>
        {!showAdvanceTag && <span className="text-gray-400 text-xs block">Avanca</span>}
      </div>
    )
  }

  return (
    <div className="px-3 py-2">
      <p className="font-semibold text-gray-900 text-sm truncate">{atleta.nome}</p>
      <p className="text-gray-500 text-xs truncate">{atleta.equipe}</p>
      {showAdvanceTag && (
        <span className="inline-block bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded font-medium">
          AVANÇOU
        </span>
      )}
      {advanceTag && !showAdvanceTag && (
        <span className="inline-block bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded font-medium">
          AVANÇOU
        </span>
      )}
      <ResultBadgeList tags={tags} />
    </div>
  )
}

function isBye(luta: Luta): boolean {
  return !luta.atleta1?.id || !luta.atleta2?.id
}