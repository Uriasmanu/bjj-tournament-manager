import { useState, useCallback, useMemo } from "react"
import { ChaveLuta, BracketRound, Luta, Atleta } from "@/app/types"
import { buildBracketFromChaveLuta, findAtletaById } from "@/app/lib/bracket-utils"

interface UseBracketProps {
  chave: ChaveLuta
  activeFightId?: string
  onFightClick?: (luta: Luta) => void
  mode?: "live" | "readonly"
}

interface UseBracketReturn {
  rounds: BracketRound[]
  activeFightId: string | undefined
  handleFightClick: (luta: Luta) => void
  isActive: (lutaId: string) => boolean
  mode: "live" | "readonly"
  champion: Atleta | undefined
  status: ChaveLuta["status"]
}

export function useBracket({ chave, activeFightId, onFightClick, mode = "live" }: UseBracketProps): UseBracketReturn {
  const [localActiveId, setLocalActiveId] = useState<string | undefined>(activeFightId)

  const rounds = useMemo(() => buildBracketFromChaveLuta(chave), [chave])

  const handleFightClick = useCallback((luta: Luta) => {
    if (mode === "readonly") return
    setLocalActiveId(luta.id)
    onFightClick?.(luta)
  }, [mode, onFightClick])

  const isActive = useCallback((lutaId: string) => {
    return localActiveId === lutaId || activeFightId === lutaId
  }, [localActiveId, activeFightId])

  const champion = useMemo(() => {
    if (!chave.vencedorAtletaId) return undefined
    return findAtletaById(chave, chave.vencedorAtletaId)
  }, [chave])

  return {
    rounds,
    activeFightId: localActiveId || activeFightId,
    handleFightClick,
    isActive,
    mode,
    champion,
    status: chave.status,
  }
}