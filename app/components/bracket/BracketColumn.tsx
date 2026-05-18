"use client"

import { cn } from "@/lib/utils"
import { BracketRound, Luta } from "@/app/types"
import { BracketMatchupCard } from "./BracketMatchupCard"

interface BracketColumnProps {
  round: BracketRound
  lutas: Luta[]
  onFightClick?: (luta: Luta) => void
  activeFightId?: string
  mode?: "live" | "readonly"
}

export function BracketColumn({ round, lutas, onFightClick, activeFightId, mode = "live" }: BracketColumnProps) {
  const getLutaById = (id: string) => lutas.find(l => l.id === id)

  const gapClass = round.label === "Round 1" ? "gap-16" : round.label === "Quartas" ? "gap-16" : "gap-8"

  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-400 uppercase tracking-wide text-center mb-3">
        {round.label}
      </span>
      <div className={cn("flex flex-col", gapClass)}>
        {round.matchups.map(matchup => {
          const luta = getLutaById(matchup.id)
          if (!luta) return null
          return (
            <BracketMatchupCard
              key={matchup.id}
              luta={luta}
              onClick={() => onFightClick?.(luta)}
              isActive={activeFightId === matchup.id}
              side={round.side}
              mode={mode}
            />
          )
        })}
      </div>
    </div>
  )
}