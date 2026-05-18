"use client"

import { useMemo } from "react"
import { ChaveLuta, Luta } from "@/app/types"
import { useBracket } from "@/hooks/useBracket"
import { buildBracketFromChaveLuta } from "@/app/lib/bracket-utils"
import { BracketLayout } from "./BracketLayout"
import { BracketEmptyState } from "./BracketEmptyState"
import { cn } from "@/lib/utils"

interface BracketVisualizerProps {
  chave: ChaveLuta
  onFightClick?: (luta: Luta) => void
  activeFightId?: string
  mode?: "live" | "readonly"
  className?: string
}

export function BracketVisualizer({ chave, onFightClick, activeFightId, mode = "live", className }: BracketVisualizerProps) {
  const { handleFightClick } = useBracket({ chave, activeFightId, onFightClick, mode })

  const rounds = useMemo(() => buildBracketFromChaveLuta(chave), [chave])

  if (!chave || !chave.lutas || chave.lutas.length === 0) {
    return <BracketEmptyState className={className} />
  }

  return (
    <div className={cn("w-full", className)}>
      <BracketLayout
        rounds={rounds}
        chave={chave}
        activeFightId={activeFightId}
        onFightClick={handleFightClick}
        mode={mode}
      />
    </div>
  )
}