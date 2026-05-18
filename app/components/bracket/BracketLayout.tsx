"use client"

import { cn } from "@/lib/utils"
import { ChaveLuta, BracketRound, Luta } from "@/app/types"
import { BracketEmptyState } from "./BracketEmptyState"
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
  const champion = chave.vencedorAtletaId
    ? findChampion(chave)
    : undefined

  useEffect(() => {
    if (chave.status === "concluida" && champion) {
      setChampionTrigger(prev => prev + 1)
    }
  }, [chave.status, champion])

  useEffect(() => {
    if (championTrigger > 0 && champion) {
      setShowChampionModal(true)
    }
  }, [championTrigger])

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

  const leftMatchups = round1 ? splitLeftRight(round1.matchups).left : []
  const rightMatchups = round1 ? splitLeftRight(round1.matchups).right : []
  const leftGap = leftMatchups.length > 1 ? `gap-${getGap(leftMatchups.length)}` : "gap-4"
  const rightGap = rightMatchups.length > 1 ? `gap-${getGap(rightMatchups.length)}` : "gap-4"

  const leftOffset = round1 ? getVerticalOffset(round1.matchups.length) : 0

  return (
    <>
      <div className={cn("overflow-x-auto", className)}>
        <div className="flex items-center justify-center gap-0 p-4 min-w-max">
          {/* LEFT SIDE - Round 1 positions left half */}
          <div className={cn("flex flex-col", leftGap)} style={{ marginTop: `${leftOffset}px` }}>
            {leftMatchups.map(matchup => {
              const luta = findLuta(chave, matchup.id)
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

          {/* QUARTAS - Next round from left */}
          {roundQuartas && leftMatchups.length > 0 && (
            <>
              <ConnectorV />
              <div className={cn("flex flex-col", getGap(roundQuartas.matchups.length))}>
                {roundQuartas.matchups.map(matchup => {
                  const luta = findLuta(chave, matchup.id)
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
            </>
          )}

          {/* SEMIFINAL */}
          {roundSemi && (
            <>
              <ConnectorV />
              <div className={cn("flex flex-col", getGap(roundSemi.matchups.length))}>
                {roundSemi.matchups.map(matchup => {
                  const luta = findLuta(chave, matchup.id)
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
            </>
          )}

          {/* FINAL + CAMPEÃO */}
          {roundFinal && (
            <>
              <ConnectorV />
              <div className="flex flex-col items-center gap-3">
                {roundFinal.matchups.map(matchup => {
                  const luta = findLuta(chave, matchup.id)
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
                {champion && (
                  <BracketChampion champion={champion} categoryName={chave.categoria} />
                )}
              </div>
            </>
          )}

          {/* RIGHT SIDE - Round 1 positions right half (AFTER final) */}
          {rightMatchups.length > 0 && (
            <>
              <ConnectorV />
              <div className={cn("flex flex-col", rightGap)} style={{ marginTop: `${leftOffset}px` }}>
                {rightMatchups.map(matchup => {
                  const luta = findLuta(chave, matchup.id)
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
            </>
          )}
        </div>
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

function splitLeftRight(matchups: BracketRound["matchups"]) {
  const half = Math.ceil(matchups.length / 2)
  return {
    left: matchups.slice(0, half),
    right: matchups.slice(half),
  }
}

function getGap(count: number): string {
  switch (count) {
    case 1: return "gap-4"
    case 2: return "gap-8"
    case 3: return "gap-6"
    case 4: return "gap-4"
    default: return "gap-4"
  }
}

function getVerticalOffset(fightCount: number): number {
  switch (fightCount) {
    case 1: return 0
    case 2: return 50
    case 3: return 30
    case 4: return 0
    default: return 0
  }
}

function findLuta(chave: ChaveLuta, id: string): Luta | undefined {
  return chave.lutas.find(l => l.id === id)
}

function findChampion(chave: ChaveLuta): { id: string; nome: string; equipe: string; faixa?: string } | undefined {
  if (!chave.vencedorAtletaId) return undefined
  for (const luta of chave.lutas) {
    if (luta.atleta1?.id === chave.vencedorAtletaId) return luta.atleta1
    if (luta.atleta2?.id === chave.vencedorAtletaId) return luta.atleta2
  }
  return undefined
}

function BracketMatchupCardInline({
  luta,
  onClick,
  isActive,
  mode = "live",
}: {
  luta: Luta
  onClick?: () => void
  isActive?: boolean
  mode?: "live" | "readonly"
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
        podeClicar ? "hover:shadow-md cursor-pointer" : "cursor-default"
      )}
    >
      <FighterCell
        atleta={luta.atleta1}
        resultado={luta.resultado}
        fighter="atleta1"
      />
      <div className="bg-gray-200 text-gray-500 text-xs font-bold text-center py-1 border-y border-gray-300">
        {isCompleted && luta.resultado
          ? `${luta.resultado.pontosAtleta1} x ${luta.resultado.pontosAtleta2}`
          : "VS"}
      </div>
      <FighterCell
        atleta={luta.atleta2}
        resultado={luta.resultado}
        fighter="atleta2"
      />
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
        <span className="text-gray-400 text-xs block">Avanca</span>
      </div>
    )
  }

  const tags: { label: string; className: string }[] = []

  if (resultado?.status === "concluida") {
    if (resultado.desclassificacao === fighter) {
      tags.push({ label: "DESCLASS.", className: "bg-red-800 text-white text-xs px-2 py-0.5 rounded-full border-2 border-red-600" })
      tags.push({ label: "VENCEU", className: "bg-green-500 text-white text-xs px-2 py-0.5 rounded-full" })
    } else if (resultado.vencedor === fighter) {
      tags.push({ label: "VENCEU", className: "bg-green-500 text-white text-xs px-2 py-0.5 rounded-full" })
      if ((fighter === "atleta1" ? resultado.finalizacaoAtleta1 : resultado.finalizacaoAtleta2)) {
        tags.push({ label: "FINALIZOU", className: "bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full" })
      }
    } else {
      tags.push({ label: "PERDEU", className: "bg-red-500 text-white text-xs px-2 py-0.5 rounded-full" })
    }
  }

  return (
    <div className="px-3 py-2">
      <p className="font-semibold text-gray-900 text-sm truncate">{atleta.nome}</p>
      <p className="text-gray-500 text-xs truncate">{atleta.equipe}</p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {tags.map((tag, i) => (
            <span key={i} className={tag.className}>{tag.label}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function ConnectorV() {
  return (
    <div className="w-4 flex-shrink-0 flex flex-col justify-around min-h-[80px]">
      <svg width="16" height="100%" viewBox="0 0 16 100" preserveAspectRatio="none">
        <path d="M 8 0 L 8 100" stroke="#d1d5db" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
}