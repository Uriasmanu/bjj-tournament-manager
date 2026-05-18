"use client"

import { cn } from "@/lib/utils"
import { ChaveLuta, BracketRound, Luta } from "@/app/types"
import { useBracket } from "@/hooks/useBracket"
import { BracketEmptyState } from "./BracketEmptyState"
import { BracketColumn } from "./BracketColumn"
import { BracketChampion } from "./BracketChampion"
import { ChampionModal } from "./ChampionModal"
import { getUnicoAtleta } from "@/app/lib/bracket-utils"
import { useState, useEffect } from "react"

interface BracketLayoutProps {
  rounds: BracketRound[]
  chave: ChaveLuta
  activeFightId?: string
  onFightClick?: (luta: Luta) => void
  mode?: "live" | "readonly"
  className?: string
}

export function BracketLayout({ rounds, chave, activeFightId, onFightClick, mode = "live", className }: BracketLayoutProps) {
  const [showChampionModal, setShowChampionModal] = useState(false)
  const [championTrigger, setChampionTrigger] = useState(0)
  const { champion } = useBracket({ chave, activeFightId, onFightClick, mode })

  useEffect(() => {
    if (chave.status === "concluida" && champion) {
      setShowChampionModal(true)
    }
  }, [championTrigger])

  useEffect(() => {
    if (chave.status === "concluida" && champion) {
      setChampionTrigger(prev => prev + 1)
    }
  }, [chave.status, champion])

  if (!chave || !chave.lutas || chave.lutas.length === 0) {
    return <BracketEmptyState />
  }

  const round1 = rounds.find(r => r.label === "Round 1")
  const roundQuartas = rounds.find(r => r.label === "Quartas")
  const roundSemi = rounds.find(r => r.label === "Semifinal")
  const roundFinal = rounds.find(r => r.label === "Final")

  if (chave.totalCompetidores === 1) {
    const unico = getUnicoAtleta(chave)
    return (
      <div className={cn("flex flex-col items-center gap-4", className)}>
        {unico && <BracketChampion champion={unico} categoryName={chave.categoria} />}
        <p className="text-gray-400 text-sm">Declarado campeão por falta de oponentes</p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop: horizontal layout */}
      <div className={cn("hidden md:flex items-center justify-center gap-0 overflow-x-auto p-4", className)}>
        <div className="flex items-center gap-2">
          {/* Round 1 - Left side (positions 0,1) */}
          {round1 && (
            <div className="flex flex-col gap-16">
              <span className="text-xs text-gray-400 uppercase tracking-wide text-center mb-2">Round 1</span>
              {round1.matchups.filter(m => m.position < 2).map(matchup => {
                const luta = chave.lutas.find(l => l.id === matchup.id)
                if (!luta) return null
                return (
                  <BracketMatchupCardInline
                    key={matchup.id}
                    luta={luta}
                    onClick={() => onFightClick?.(luta)}
                    isActive={activeFightId === matchup.id}
                    mode={mode}
                  />
                )
              })}
            </div>
          )}

          {/* Round 1 - Right side (positions 2,3) */}
          {round1 && round1.matchups.filter(m => m.position >= 2).length > 0 && (
            <div className="flex flex-col gap-16 mt-[64px]">
              <span className="text-xs text-gray-400 uppercase tracking-wide text-center mb-2">&nbsp;</span>
              {round1.matchups.filter(m => m.position >= 2).map(matchup => {
                const luta = chave.lutas.find(l => l.id === matchup.id)
                if (!luta) return null
                return (
                  <BracketMatchupCardInline
                    key={matchup.id}
                    luta={luta}
                    onClick={() => onFightClick?.(luta)}
                    isActive={activeFightId === matchup.id}
                    mode={mode}
                  />
                )
              })}
            </div>
          )}

          {/* Connector */}
          <ConnectorLine />

          {/* Quartas (center) */}
          {roundQuartas && (
            <div className="flex flex-col gap-16">
              <span className="text-xs text-gray-400 uppercase tracking-wide text-center mb-2">Quartas</span>
              {roundQuartas.matchups.map(matchup => {
                const luta = chave.lutas.find(l => l.id === matchup.id)
                if (!luta) return null
                return (
                  <BracketMatchupCardInline
                    key={matchup.id}
                    luta={luta}
                    onClick={() => onFightClick?.(luta)}
                    isActive={activeFightId === matchup.id}
                    mode={mode}
                  />
                )
              })}
            </div>
          )}

          {/* Connector */}
          <ConnectorLine />

          {/* Semifinal */}
          {roundSemi && (
            <div className="flex flex-col justify-center gap-8">
              <span className="text-xs text-gray-400 uppercase tracking-wide text-center mb-2">Semifinal</span>
              {roundSemi.matchups.map(matchup => {
                const luta = chave.lutas.find(l => l.id === matchup.id)
                if (!luta) return null
                return (
                  <BracketMatchupCardInline
                    key={matchup.id}
                    luta={luta}
                    onClick={() => onFightClick?.(luta)}
                    isActive={activeFightId === matchup.id}
                    mode={mode}
                  />
                )
              })}
            </div>
          )}

          {/* Connector */}
          <ConnectorLine />

          {/* Final + Champion */}
          {roundFinal && (
            <div className="flex flex-col justify-center gap-4">
              <span className="text-xs text-gray-400 uppercase tracking-wide text-center mb-2">Final</span>
              {roundFinal.matchups.map(matchup => {
                const luta = chave.lutas.find(l => l.id === matchup.id)
                if (!luta) return null
                return (
                  <BracketMatchupCardInline
                    key={matchup.id}
                    luta={luta}
                    onClick={() => onFightClick?.(luta)}
                    isActive={activeFightId === matchup.id}
                    mode={mode}
                  />
                )
              })}
              <BracketChampion champion={champion} categoryName={chave.categoria} />
            </div>
          )}
        </div>
      </div>

      {/* Mobile: vertical stack layout */}
      <div className={cn("flex md:hidden flex-col gap-6 p-4", className)}>
        {rounds.map((round, idx) => (
          <div key={round.label} className="w-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400 uppercase tracking-wide">{round.label}</span>
              <span className="text-xs text-gray-500">{round.matchups.length} luta(s)</span>
            </div>
            <div className="space-y-3">
              {round.matchups.map(matchup => {
                const luta = chave.lutas.find(l => l.id === matchup.id)
                if (!luta) return null
                return (
                  <BracketMatchupCardInline
                    key={matchup.id}
                    luta={luta}
                    onClick={() => onFightClick?.(luta)}
                    isActive={activeFightId === matchup.id}
                    mode={mode}
                    className="w-full"
                  />
                )
              })}
            </div>
            {idx < rounds.length - 1 && (
              <div className="flex justify-center py-2">
                <svg className="w-4 h-8">
                  <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#6b7280" strokeWidth="2" />
                </svg>
              </div>
            )}
          </div>
        ))}
        {champion && (
          <div className="mt-4">
            <BracketChampion champion={champion} categoryName={chave.categoria} />
          </div>
        )}
      </div>

      {showChampionModal && champion && (
        <ChampionModal
          champion={champion}
          categoryName={chave.categoria}
          onClose={() => setShowChampionModal(false)}
        />
      )}
    </>
  )
}

function BracketMatchupCardInline({
  luta,
  onClick,
  isActive,
  mode = "live",
  className,
}: {
  luta: Luta
  onClick?: () => void
  isActive?: boolean
  mode?: "live" | "readonly"
  className?: string
}) {
  const isCompleted = luta.resultado?.status === "concluida"
  const isLive = isActive

  const bgClass = isCompleted
    ? "bg-gray-100 border-gray-300"
    : isLive
    ? "bg-amber-50 border-amber-400"
    : "bg-white border-gray-200"

  const borderClass = isLive ? "ring-2 ring-amber-400" : "border-2"
  const podeClicar = mode === "live" && !isCompleted && !!luta.atleta1?.id && !!luta.atleta2?.id

  return (
    <div
      onClick={podeClicar ? onClick : undefined}
      className={cn(
        "w-[160px] rounded-lg overflow-hidden cursor-pointer transition-all",
        bgClass,
        borderClass,
        isLive && "animate-pulse",
        podeClicar ? "hover:shadow-md cursor-pointer" : "cursor-default",
        className
      )}
    >
      <FighterCell atleta={luta.atleta1} resultado={luta.resultado} fighter="atleta1" />
      <div className="bg-gray-200 text-gray-500 text-xs font-bold text-center py-1 border-y border-gray-300">
        {isCompleted && luta.resultado ? `${luta.resultado.pontosAtleta1} x ${luta.resultado.pontosAtleta2}` : "VS"}
      </div>
      <FighterCell atleta={luta.atleta2} resultado={luta.resultado} fighter="atleta2" />
    </div>
  )
}

function FighterCell({
  atleta,
  resultado,
  fighter,
}: {
  atleta: Luta["atleta1"]
  resultado?: Luta["resultado"]
  fighter: "atleta1" | "atleta2"
}) {
  if (!atleta?.id) {
    return (
      <div className="bg-gray-200 px-3 py-2">
        <span className="text-gray-500 text-sm font-medium">BYE</span>
      </div>
    )
  }

  const tags: { label: string; class: string }[] = []

  if (resultado?.status === "concluida") {
    if (resultado.desclassificacao === fighter) {
      tags.push({ label: "DESCLASS.", class: "bg-red-800 text-white text-xs px-2 py-0.5 rounded-full border-2 border-red-600" })
    } else if (resultado.vencedor === fighter) {
      tags.push({ label: "VENCEU", class: "bg-green-500 text-white text-xs px-2 py-0.5 rounded-full" })
      if ((fighter === "atleta1" ? resultado.finalizacaoAtleta1 : resultado.finalizacaoAtleta2)) {
        tags.push({ label: "FINALIZOU", class: "bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full" })
      }
    } else {
      tags.push({ label: "PERDEU", class: "bg-red-500 text-white text-xs px-2 py-0.5 rounded-full" })
    }
  }

  return (
    <div className="px-3 py-2">
      <p className="font-semibold text-gray-900 text-sm truncate">{atleta.nome}</p>
      <p className="text-gray-500 text-xs truncate">{atleta.equipe}</p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {tags.map((tag, i) => (
            <span key={i} className={tag.class}>{tag.label}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function ConnectorLine() {
  return (
    <div className="w-4 flex flex-col justify-around h-full min-h-[200px]">
      <svg width="16" height="100%" viewBox="0 0 16 200" preserveAspectRatio="none">
        <path d="M 8 0 L 8 200" stroke="#d1d5db" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
}