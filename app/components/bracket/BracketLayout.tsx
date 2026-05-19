"use client"

import { cn } from "@/lib/utils"
import { ChaveLuta, BracketRound, Luta } from "@/app/types"
import { BracketEmptyState } from "./BracketEmptyState"
import { BracketChampion } from "./BracketChampion"
import { getUnicoAtleta, podeIniciarLuta } from "@/app/lib/bracket-utils"
import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { Trophy, Edit3 } from "lucide-react"

interface BracketLayoutProps {
  rounds: BracketRound[]
  chave: ChaveLuta
  activeFightId?: string
  onFightClick?: (luta: Luta) => void
  mode?: "live" | "readonly"
  className?: string
}

export function BracketLayout({ rounds, chave, activeFightId, onFightClick, mode = "live", className }: BracketLayoutProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  const todasLutasConcluidas = useMemo(() => {
    return chave.lutas.every(l =>
      l.resultado?.status === "concluida" ||
      (!l.atleta1?.id || !l.atleta2?.id)
    )
  }, [chave.lutas])

  const podeExibirCampeao = chave.status === "concluida" && !!chave.vencedorAtletaId && todasLutasConcluidas
  const champion = podeExibirCampeao ? findChampion(chave) : undefined

  useEffect(() => {
    const timer = setTimeout(() => drawConnections(), 100)
    return () => clearTimeout(timer)
  }, [chave.lutas])

  if (!chave || !chave.lutas || chave.lutas.length === 0) {
    return <BracketEmptyState />
  }

  if (chave.totalCompetidores === 1) {
    const unico = getUnicoAtleta(chave)
    return (
      <div className={cn("flex flex-col items-center gap-4", className)}>
        {unico && <BracketChampion champion={unico} categoryName={chave.categoria} />}
        <p className="text-gray-400 text-sm">Declarado campeão por falta de oponentes</p>
      </div>
    )
  }

  const leftRound1 = useMemo(() => {
    const r1Lutas = chave.lutas.filter(l => l.round === 1)
    return [
      r1Lutas.find(l => l.position === 0),
      r1Lutas.find(l => l.position === 2),
      r1Lutas.find(l => l.position === 4),
      r1Lutas.find(l => l.position === 6),
    ].filter(Boolean) as Luta[]
  }, [chave.lutas])

  const rightRound1 = useMemo(() => {
    const r1Lutas = chave.lutas.filter(l => l.round === 1)
    return [
      r1Lutas.find(l => l.position === 1),
      r1Lutas.find(l => l.position === 3),
      r1Lutas.find(l => l.position === 5),
      r1Lutas.find(l => l.position === 7),
    ].filter(Boolean) as Luta[]
  }, [chave.lutas])

  const leftRound2 = useMemo(() => {
    const r2Lutas = chave.lutas.filter(l => l.round === 2)
    return [
      r2Lutas.find(l => l.position === 0),
      r2Lutas.find(l => l.position === 1),
    ].filter(Boolean) as Luta[]
  }, [chave.lutas])

  const rightRound2 = useMemo(() => {
    const r2Lutas = chave.lutas.filter(l => l.round === 2)
    return [
      r2Lutas.find(l => l.position === 2),
      r2Lutas.find(l => l.position === 3),
    ].filter(Boolean) as Luta[]
  }, [chave.lutas])


  const leftSemi = useMemo(() => {
    return chave.lutas.filter(l => l.round === 3 && l.position === 0)
  }, [chave.lutas])

  const rightSemi = useMemo(() => {
    return chave.lutas.filter(l => l.round === 3 && l.position === 1)
  }, [chave.lutas])

  const maxRound = useMemo(() => Math.max(...chave.lutas.map(l => l.round)), [chave.lutas])
  const finalLutas = useMemo(() => {
    return chave.lutas.filter(l => l.round === maxRound)
  }, [chave.lutas, maxRound])

  const winnerLeft = useMemo(() => {
    const leftSemiLuta = chave.lutas.find(l => l.round === 3 && l.position === 0)
    if (leftSemiLuta?.resultado?.status === "concluida") {
      return leftSemiLuta.atleta1?.id === leftSemiLuta.resultado?.vencedorAtletaId
        ? leftSemiLuta.atleta1
        : leftSemiLuta.atleta2
    }
    return undefined
  }, [chave.lutas])

  const winnerRight = useMemo(() => {
    const rightSemiLuta = chave.lutas.find(l => l.round === 3 && l.position === 1)
    if (rightSemiLuta?.resultado?.status === "concluida") {
      return rightSemiLuta.atleta1?.id === rightSemiLuta.resultado?.vencedorAtletaId
        ? rightSemiLuta.atleta1
        : rightSemiLuta.atleta2
    }
    return undefined
  }, [chave.lutas])

  const finalWinner = champion
  const finalRunnerUp = useMemo(() => {
    if (!champion) return undefined
    const finalLuta = finalLutas[0]
    if (finalLuta?.resultado?.status === "concluida") {
      return finalLuta.atleta1?.id === champion.id ? finalLuta.atleta2 : finalLuta.atleta1
    }
    return undefined
  }, [finalLutas, champion])

  const thirdPlaceLeft = useMemo(() => {
    const leftSemiLuta = chave.lutas.find(l => l.round === 3 && l.position === 0)
    if (leftSemiLuta?.resultado?.status === "concluida") {
      return leftSemiLuta.atleta1?.id === leftSemiLuta.resultado?.vencedorAtletaId
        ? leftSemiLuta.atleta2
        : leftSemiLuta.atleta1
    }
    return undefined
  }, [chave.lutas])

  const thirdPlaceRight = useMemo(() => {
    const rightSemiLuta = chave.lutas.find(l => l.round === 3 && l.position === 1)
    if (rightSemiLuta?.resultado?.status === "concluida") {
      return rightSemiLuta.atleta1?.id === rightSemiLuta.resultado?.vencedorAtletaId
        ? rightSemiLuta.atleta2
        : rightSemiLuta.atleta1
    }
    return undefined
  }, [chave.lutas])

  const handleFightClick = useCallback((luta: Luta) => {
    if (mode !== "live") return
    if (!podeIniciarLuta(luta, chave)) return
    onFightClick?.(luta)
  }, [mode, chave, onFightClick])

  const drawConnections = useCallback(() => {
    if (!svgRef.current) return
    svgRef.current.innerHTML = ""

    const container = svgRef.current.parentElement
    if (!container) return

    const pairs = [
      { from: "L-1-0", to: "L-1-1", toCol: "node-L-2-0" },
      { from: "L-1-2", to: "L-1-3", toCol: "node-L-2-0" },
      { from: "L-1-4", to: "L-1-5", toCol: "node-L-2-1" },
      { from: "L-1-6", to: "L-1-7", toCol: "node-L-2-1" },
      { from: "L-2-0", to: "L-2-1", toCol: "node-L-3-0" },
      { from: "L-2-2", to: "L-2-3", toCol: "node-L-3-1" },
      { from: "R-1-0", to: "R-1-1", toCol: "node-R-2-0" },
      { from: "R-1-2", to: "R-1-3", toCol: "node-R-2-0" },
      { from: "R-1-4", to: "R-1-5", toCol: "node-R-2-1" },
      { from: "R-1-6", to: "R-1-7", toCol: "node-R-2-1" },
      { from: "R-2-0", to: "R-2-1", toCol: "node-R-3-0" },
      { from: "R-2-2", to: "R-2-3", toCol: "node-R-3-1" },
      { from: "L-3-0", to: "L-3-1", toCol: "node-F-0" },
      { from: "R-3-0", to: "R-3-1", toCol: "node-F-1" },
    ]

    pairs.forEach(({ from, to, toCol }) => {
      const fromEl = document.getElementById(`node-${from}`)
      const toEl = document.getElementById(`node-${to}`)
      const colEl = document.getElementById(toCol)

      if (!fromEl || !toEl || !colEl) return

      const fromRect = fromEl.getBoundingClientRect()
      const toRect = toEl.getBoundingClientRect()
      const colRect = colEl.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      const x1 = fromRect.right - containerRect.left
      const y1 = (fromRect.top + fromRect.bottom) / 2 - containerRect.top
      const x2 = toRect.right - containerRect.left
      const y2 = (toRect.top + toRect.bottom) / 2 - containerRect.top
      const x3 = colRect.left - containerRect.left - 10
      const y3 = (colRect.top + colRect.bottom) / 2 - containerRect.top

      const midX = (x1 + x3) / 2

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
      const d = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2} M ${midX} ${(y1 + y2) / 2} L ${x3} ${y3}`
      path.setAttribute("d", d)
      path.setAttribute("stroke", "#0f172a")
      path.setAttribute("stroke-width", "2")
      path.setAttribute("fill", "none")
      svgRef.current?.appendChild(path)
    })
  }, [])

  return (
    <>
      <div className={cn("w-full p-4 relative", className)}>
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        />

        <div className="grid grid-cols-7 gap-4 items-stretch relative z-10">

          {/* ================= LADO ESQUERDO ================= */}

          {/* Round 1 - Oitavas Esquerda */}
          <div className="col-span-1 flex flex-col justify-around min-h-[480px]">
            <Round1Pair lutas={leftRound1} side="L" round={1} baseIndex={0} onClick={handleFightClick} activeFightId={activeFightId} mode={mode} />
          </div>

          {/* Round 2 - Quartas Esquerda */}
          <div className="col-span-1 flex flex-col justify-around min-h-[480px]">
            <Round2Pair lutas={leftRound2} side="L" round={2} onClick={handleFightClick} activeFightId={activeFightId} mode={mode} />
          </div>

          {/* Round 3 - Semifinal Esquerda */}
          <div className="col-span-1 flex flex-col justify-around min-h-[480px]">
            <div className="flex flex-col gap-36 py-2">
              <SemiFinalCard luta={leftSemi[0]} side="L" round={3} position={0} onClick={handleFightClick} activeFightId={activeFightId} mode={mode} />
              <SemiFinalCard luta={leftSemi[1]} side="L" round={3} position={1} onClick={handleFightClick} activeFightId={activeFightId} mode={mode} />
            </div>
          </div>

          {/* ================= PAINEL CENTRAL ================= */}
          <div className="col-span-1 flex flex-col justify-center items-center gap-8 min-h-[480px]">

            {/* Finalista Esquerdo */}
            <div className="flex flex-col items-center w-full">
              <span className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Finalista</span>
              <FinalistCard atleta={winnerLeft || undefined} position={0} cardPosition={28} />
            </div>
          </div>

          {/* Round 3 - Semifinal Direita */}
          <div className="col-span-1 flex flex-col justify-around min-h-[480px]">
            <div className="flex flex-col gap-36 py-2">
              <SemiFinalCard luta={rightSemi[0]} side="R" round={3} position={0} onClick={handleFightClick} activeFightId={activeFightId} mode={mode} />
              <SemiFinalCard luta={rightSemi[1]} side="R" round={3} position={1} onClick={handleFightClick} activeFightId={activeFightId} mode={mode} />
            </div>
          </div>

          {/* Round 2 - Quartas Direita */}
          <div className="col-span-1 flex flex-col justify-around min-h-[480px]">
            <Round2PairRight lutas={rightRound2} side="R" round={2} onClick={handleFightClick} activeFightId={activeFightId} mode={mode} />
          </div>

          {/* Round 1 - Oitavas Direita */}
          <div className="col-span-1 flex flex-col justify-around min-h-[480px]">
            <Round1PairRight lutas={rightRound1} side="R" round={1} baseIndex={4} onClick={handleFightClick} activeFightId={activeFightId} mode={mode} />
          </div>
        </div>

        {/* ================= PÓDIO ================= */}
        <div className="w-full flex justify-center mt-8">
          <div className="w-full max-w-xl border-t-2 border-slate-300 pt-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2 text-center">Classificação Final</h3>
            <div className="flex flex-col gap-1 text-sm font-semibold">
              <PodiumLine
                label="1º"
                colorClass="text-amber-500"
                value={finalWinner ? `${finalWinner.nome} (${finalWinner.equipe})` : "-- Aguardando final --"}
              />
              <PodiumLine
                label="2º"
                colorClass="text-slate-400"
                value={finalRunnerUp ? `${finalRunnerUp.nome} (${finalRunnerUp.equipe})` : "-- Aguardando disputa de ouro --"}
              />
              <PodiumLine
                label="3º"
                colorClass="text-amber-700"
                value={thirdPlaceLeft ? `${thirdPlaceLeft.nome} (${thirdPlaceLeft.equipe})` : "-- Definido automaticamente pelo perdedor da semifinal esquerda --"}
              />
              <PodiumLine
                label="3º"
                colorClass="text-amber-700"
                value={thirdPlaceRight ? `${thirdPlaceRight.nome} (${thirdPlaceRight.equipe})` : "-- Definido automaticamente pelo perdedor da semifinal direita --"}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function CompetitorCard({
  luta,
  nodeId,
  onClick,
  isActive,
  isCompleted,
  isFinalist = false,
  mode = "live",
  cardPosition,
  atletaIndex = 1
}: {
  luta?: Luta
  nodeId: string
  onClick?: () => void
  isActive?: boolean
  isCompleted?: boolean
  isFinalist?: boolean
  mode?: "live" | "readonly"
  cardPosition?: number
  atletaIndex?: 1 | 2
}) {
  const atleta = atletaIndex === 1 ? luta?.atleta1 : luta?.atleta2
  const temAtleta = atleta?.id
  const borderClass = isFinalist ? "border-yellow-500 shadow-md" : "border-slate-950 shadow-sm"

  return (
    <div
      id={nodeId}
      onClick={onClick}
      className={cn(
        "bg-white p-2 text-xs flex flex-col justify-center min-h-[52px] border-2 relative transition-all duration-200",
        borderClass,
        !temAtleta && "bg-slate-50",
        isCompleted && "bg-slate-100",
        isActive && "ring-2 ring-amber-400",
        onClick && temAtleta && mode === "live" && "hover:bg-slate-50 cursor-pointer"
      )}
    >
      {temAtleta ? (
        <>
          <div className="font-bold uppercase truncate pr-8 text-slate-900">
            {atleta?.nome || "-- Vazio --"}
          </div>
          <div className="text-[10px] text-slate-500 uppercase truncate">
            {atleta?.equipe || "Equipe"}
          </div>
          {isCompleted && (
            <span className="absolute right-1 top-1 bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
              VENCEU
            </span>
          )}
          {cardPosition !== undefined && (
            <span className="absolute right-1 bottom-1 text-[10px] font-bold text-slate-400">
              {cardPosition + 1}
            </span>
          )}
        </>
      ) : (
        <>
          <div className="font-bold uppercase truncate pr-8 text-slate-400 italic">
            -- Vazio --
          </div>
          <div className="text-[10px] text-slate-400 uppercase truncate">
            Equipe
          </div>
          {cardPosition !== undefined && (
            <span className="absolute right-1 bottom-1 text-[10px] font-bold text-slate-400">
              {cardPosition + 1}
            </span>
          )}
        </>
      )}
    </div>
  )
}

function Round1Pair({ lutas, side, round, baseIndex, onClick, activeFightId, mode }: {
  lutas: Luta[]
  side: "L" | "R"
  round: number
  baseIndex: number
  onClick?: (luta: Luta) => void
  activeFightId?: string
  mode?: "live" | "readonly"
}) {
  return (
    <>
      <div className="flex flex-col gap-3 py-2">
        <CompetitorCard
          luta={lutas[0]}
          nodeId={`node-${side}-${round}-${baseIndex}-1`}
          onClick={lutas[0] ? () => onClick?.(lutas[0]) : undefined}
          isActive={activeFightId === lutas[0]?.id}
          isCompleted={lutas[0]?.resultado?.status === "concluida" && lutas[0]?.resultado?.vencedorAtletaId === lutas[0]?.atleta1?.id}
          mode={mode}
          cardPosition={baseIndex * 2}
          atletaIndex={1}
        />
        <CompetitorCard
          luta={lutas[0]}
          nodeId={`node-${side}-${round}-${baseIndex}-2`}
          onClick={lutas[0] ? () => onClick?.(lutas[0]) : undefined}
          isActive={activeFightId === lutas[0]?.id}
          isCompleted={lutas[0]?.resultado?.status === "concluida" && lutas[0]?.resultado?.vencedorAtletaId === lutas[0]?.atleta2?.id}
          mode={mode}
          cardPosition={baseIndex * 2 + 1}
          atletaIndex={2}
        />
      </div>
      <div className="flex flex-col gap-3 py-2">
        <CompetitorCard
          luta={lutas[1]}
          nodeId={`node-${side}-${round}-${baseIndex + 1}-1`}
          onClick={lutas[1] ? () => onClick?.(lutas[1]) : undefined}
          isActive={activeFightId === lutas[1]?.id}
          isCompleted={lutas[1]?.resultado?.status === "concluida" && lutas[1]?.resultado?.vencedorAtletaId === lutas[1]?.atleta1?.id}
          mode={mode}
          cardPosition={(baseIndex + 1) * 2}
          atletaIndex={1}
        />
        <CompetitorCard
          luta={lutas[1]}
          nodeId={`node-${side}-${round}-${baseIndex + 1}-2`}
          onClick={lutas[1] ? () => onClick?.(lutas[1]) : undefined}
          isActive={activeFightId === lutas[1]?.id}
          isCompleted={lutas[1]?.resultado?.status === "concluida" && lutas[1]?.resultado?.vencedorAtletaId === lutas[1]?.atleta2?.id}
          mode={mode}
          cardPosition={(baseIndex + 1) * 2 + 1}
          atletaIndex={2}
        />
      </div>
      <div className="flex flex-col gap-3 py-2">
        <CompetitorCard
          luta={lutas[2]}
          nodeId={`node-${side}-${round}-${baseIndex + 2}-1`}
          onClick={lutas[2] ? () => onClick?.(lutas[2]) : undefined}
          isActive={activeFightId === lutas[2]?.id}
          isCompleted={lutas[2]?.resultado?.status === "concluida" && lutas[2]?.resultado?.vencedorAtletaId === lutas[2]?.atleta1?.id}
          mode={mode}
          cardPosition={(baseIndex + 2) * 2}
          atletaIndex={1}
        />
        <CompetitorCard
          luta={lutas[2]}
          nodeId={`node-${side}-${round}-${baseIndex + 2}-2`}
          onClick={lutas[2] ? () => onClick?.(lutas[2]) : undefined}
          isActive={activeFightId === lutas[2]?.id}
          isCompleted={lutas[2]?.resultado?.status === "concluida" && lutas[2]?.resultado?.vencedorAtletaId === lutas[2]?.atleta2?.id}
          mode={mode}
          cardPosition={(baseIndex + 2) * 2 + 1}
          atletaIndex={2}
        />
      </div>
      <div className="flex flex-col gap-3 py-2">
        <CompetitorCard
          luta={lutas[3]}
          nodeId={`node-${side}-${round}-${baseIndex + 3}-1`}
          onClick={lutas[3] ? () => onClick?.(lutas[3]) : undefined}
          isActive={activeFightId === lutas[3]?.id}
          isCompleted={lutas[3]?.resultado?.status === "concluida" && lutas[3]?.resultado?.vencedorAtletaId === lutas[3]?.atleta1?.id}
          mode={mode}
          cardPosition={(baseIndex + 3) * 2}
          atletaIndex={1}
        />
        <CompetitorCard
          luta={lutas[3]}
          nodeId={`node-${side}-${round}-${baseIndex + 3}-2`}
          onClick={lutas[3] ? () => onClick?.(lutas[3]) : undefined}
          isActive={activeFightId === lutas[3]?.id}
          isCompleted={lutas[3]?.resultado?.status === "concluida" && lutas[3]?.resultado?.vencedorAtletaId === lutas[3]?.atleta2?.id}
          mode={mode}
          cardPosition={(baseIndex + 3) * 2 + 1}
          atletaIndex={2}
        />
      </div>
    </>
  )
}

function Round1PairRight({ lutas, side, round, baseIndex, onClick, activeFightId, mode }: {
  lutas: Luta[]
  side: "L" | "R"
  round: number
  baseIndex: number
  onClick?: (luta: Luta) => void
  activeFightId?: string
  mode?: "live" | "readonly"
}) {
  return (
    <>
      <div className="flex flex-col gap-3 py-2">
        <CompetitorCard
          luta={lutas[0]}
          nodeId={`node-${side}-${round}-${baseIndex}-1`}
          onClick={lutas[0] ? () => onClick?.(lutas[0]) : undefined}
          isActive={activeFightId === lutas[0]?.id}
          isCompleted={lutas[0]?.resultado?.status === "concluida" && lutas[0]?.resultado?.vencedorAtletaId === lutas[0]?.atleta1?.id}
          mode={mode}
          cardPosition={8}
          atletaIndex={1}
        />
        <CompetitorCard
          luta={lutas[0]}
          nodeId={`node-${side}-${round}-${baseIndex}-2`}
          onClick={lutas[0] ? () => onClick?.(lutas[0]) : undefined}
          isActive={activeFightId === lutas[0]?.id}
          isCompleted={lutas[0]?.resultado?.status === "concluida" && lutas[0]?.resultado?.vencedorAtletaId === lutas[0]?.atleta2?.id}
          mode={mode}
          cardPosition={9}
          atletaIndex={2}
        />
      </div>
      <div className="flex flex-col gap-3 py-2">
        <CompetitorCard
          luta={lutas[1]}
          nodeId={`node-${side}-${round}-${baseIndex + 1}-1`}
          onClick={lutas[1] ? () => onClick?.(lutas[1]) : undefined}
          isActive={activeFightId === lutas[1]?.id}
          isCompleted={lutas[1]?.resultado?.status === "concluida" && lutas[1]?.resultado?.vencedorAtletaId === lutas[1]?.atleta1?.id}
          mode={mode}
          cardPosition={10}
          atletaIndex={1}
        />
        <CompetitorCard
          luta={lutas[1]}
          nodeId={`node-${side}-${round}-${baseIndex + 1}-2`}
          onClick={lutas[1] ? () => onClick?.(lutas[1]) : undefined}
          isActive={activeFightId === lutas[1]?.id}
          isCompleted={lutas[1]?.resultado?.status === "concluida" && lutas[1]?.resultado?.vencedorAtletaId === lutas[1]?.atleta2?.id}
          mode={mode}
          cardPosition={11}
          atletaIndex={2}
        />
      </div>
      <div className="flex flex-col gap-3 py-2">
        <CompetitorCard
          luta={lutas[2]}
          nodeId={`node-${side}-${round}-${baseIndex + 2}-1`}
          onClick={lutas[2] ? () => onClick?.(lutas[2]) : undefined}
          isActive={activeFightId === lutas[2]?.id}
          isCompleted={lutas[2]?.resultado?.status === "concluida" && lutas[2]?.resultado?.vencedorAtletaId === lutas[2]?.atleta1?.id}
          mode={mode}
          cardPosition={12}
          atletaIndex={1}
        />
        <CompetitorCard
          luta={lutas[2]}
          nodeId={`node-${side}-${round}-${baseIndex + 2}-2`}
          onClick={lutas[2] ? () => onClick?.(lutas[2]) : undefined}
          isActive={activeFightId === lutas[2]?.id}
          isCompleted={lutas[2]?.resultado?.status === "concluida" && lutas[2]?.resultado?.vencedorAtletaId === lutas[2]?.atleta2?.id}
          mode={mode}
          cardPosition={13}
          atletaIndex={2}
        />
      </div>
      <div className="flex flex-col gap-3 py-2">
        <CompetitorCard
          luta={lutas[3]}
          nodeId={`node-${side}-${round}-${baseIndex + 3}-1`}
          onClick={lutas[3] ? () => onClick?.(lutas[3]) : undefined}
          isActive={activeFightId === lutas[3]?.id}
          isCompleted={lutas[3]?.resultado?.status === "concluida" && lutas[3]?.resultado?.vencedorAtletaId === lutas[3]?.atleta1?.id}
          mode={mode}
          cardPosition={14}
          atletaIndex={1}
        />
        <CompetitorCard
          luta={lutas[3]}
          nodeId={`node-${side}-${round}-${baseIndex + 3}-2`}
          onClick={lutas[3] ? () => onClick?.(lutas[3]) : undefined}
          isActive={activeFightId === lutas[3]?.id}
          isCompleted={lutas[3]?.resultado?.status === "concluida" && lutas[3]?.resultado?.vencedorAtletaId === lutas[3]?.atleta2?.id}
          mode={mode}
          cardPosition={15}
          atletaIndex={2}
        />
      </div>
    </>
  )
}

function Round2Pair({ lutas, side, round, onClick, activeFightId, mode }: {
  lutas: Luta[]
  side: "L" | "R"
  round: number
  onClick?: (luta: Luta) => void
  activeFightId?: string
  mode?: "live" | "readonly"
}) {
  return (
    <>
      <div className="flex flex-col gap-16 py-2">
        <CompetitorCard
          luta={lutas[0]}
          nodeId={`node-${side}-${round}-0-1`}
          onClick={lutas[0] ? () => onClick?.(lutas[0]) : undefined}
          isActive={activeFightId === lutas[0]?.id}
          isCompleted={lutas[0]?.resultado?.status === "concluida" && lutas[0]?.resultado?.vencedorAtletaId === lutas[0]?.atleta1?.id}
          mode={mode}
          cardPosition={16}
          atletaIndex={1}
        />
        <CompetitorCard
          luta={lutas[0]}
          nodeId={`node-${side}-${round}-0-2`}
          onClick={lutas[0] ? () => onClick?.(lutas[0]) : undefined}
          isActive={activeFightId === lutas[0]?.id}
          isCompleted={lutas[0]?.resultado?.status === "concluida" && lutas[0]?.resultado?.vencedorAtletaId === lutas[0]?.atleta2?.id}
          mode={mode}
          cardPosition={17}
          atletaIndex={2}
        />
      </div>
      <div className="flex flex-col gap-16 py-2">
        <CompetitorCard
          luta={lutas[1]}
          nodeId={`node-${side}-${round}-1-1`}
          onClick={lutas[1] ? () => onClick?.(lutas[1]) : undefined}
          isActive={activeFightId === lutas[1]?.id}
          isCompleted={lutas[1]?.resultado?.status === "concluida" && lutas[1]?.resultado?.vencedorAtletaId === lutas[1]?.atleta1?.id}
          mode={mode}
          cardPosition={18}
          atletaIndex={1}
        />
        <CompetitorCard
          luta={lutas[1]}
          nodeId={`node-${side}-${round}-1-2`}
          onClick={lutas[1] ? () => onClick?.(lutas[1]) : undefined}
          isActive={activeFightId === lutas[1]?.id}
          isCompleted={lutas[1]?.resultado?.status === "concluida" && lutas[1]?.resultado?.vencedorAtletaId === lutas[1]?.atleta2?.id}
          mode={mode}
          cardPosition={19}
          atletaIndex={2}
        />
      </div>
    </>
  )
}

function Round2PairRight({ lutas, side, round, onClick, activeFightId, mode }: {
  lutas: Luta[]
  side: "L" | "R"
  round: number
  onClick?: (luta: Luta) => void
  activeFightId?: string
  mode?: "live" | "readonly"
}) {
  return (
    <>
      <div className="flex flex-col gap-16 py-2">
        <CompetitorCard
          luta={lutas[0]}
          nodeId={`node-${side}-${round}-2-1`}
          onClick={lutas[0] ? () => onClick?.(lutas[0]) : undefined}
          isActive={activeFightId === lutas[0]?.id}
          isCompleted={lutas[0]?.resultado?.status === "concluida" && lutas[0]?.resultado?.vencedorAtletaId === lutas[0]?.atleta1?.id}
          mode={mode}
          cardPosition={24}
          atletaIndex={1}
        />
        <CompetitorCard
          luta={lutas[0]}
          nodeId={`node-${side}-${round}-2-2`}
          onClick={lutas[0] ? () => onClick?.(lutas[0]) : undefined}
          isActive={activeFightId === lutas[0]?.id}
          isCompleted={lutas[0]?.resultado?.status === "concluida" && lutas[0]?.resultado?.vencedorAtletaId === lutas[0]?.atleta2?.id}
          mode={mode}
          cardPosition={25}
          atletaIndex={2}
        />
      </div>
      <div className="flex flex-col gap-16 py-2">
        <CompetitorCard
          luta={lutas[1]}
          nodeId={`node-${side}-${round}-3-1`}
          onClick={lutas[1] ? () => onClick?.(lutas[1]) : undefined}
          isActive={activeFightId === lutas[1]?.id}
          isCompleted={lutas[1]?.resultado?.status === "concluida" && lutas[1]?.resultado?.vencedorAtletaId === lutas[1]?.atleta1?.id}
          mode={mode}
          cardPosition={26}
          atletaIndex={1}
        />
        <CompetitorCard
          luta={lutas[1]}
          nodeId={`node-${side}-${round}-3-2`}
          onClick={lutas[1] ? () => onClick?.(lutas[1]) : undefined}
          isActive={activeFightId === lutas[1]?.id}
          isCompleted={lutas[1]?.resultado?.status === "concluida" && lutas[1]?.resultado?.vencedorAtletaId === lutas[1]?.atleta2?.id}
          mode={mode}
          cardPosition={27}
          atletaIndex={2}
        />
      </div>
    </>
  )
}

function SemiFinalCard({ luta, side, round, position, onClick, activeFightId, mode }: {
  luta?: Luta
  side: "L" | "R"
  round: number
  position: number
  onClick?: (luta: Luta) => void
  activeFightId?: string
  mode?: "live" | "readonly"
}) {
  const cardPosition = side === "L" ? 20 + position : 22 + position
  return (
    <div className="flex flex-col gap-3">
      <CompetitorCard
        luta={luta}
        nodeId={`node-${side}-${round}-${position}-1`}
        onClick={luta ? () => onClick?.(luta) : undefined}
        isActive={activeFightId === luta?.id}
        isCompleted={luta?.resultado?.status === "concluida" && luta?.resultado?.vencedorAtletaId === luta?.atleta1?.id}
        mode={mode}
        cardPosition={cardPosition}
        atletaIndex={1}
      />
    </div>
  )
}

function FinalistCard({ atleta, position, cardPosition, onClick }: {
  atleta?: { id: string; nome: string; equipe: string; faixa?: string } | null
  position: number
  cardPosition?: number
  onClick?: () => void
}) {
  return (
    <div
      id={`node-F-${position}`}
      className="competitor-card border-2 border-yellow-500 bg-white p-2 text-xs flex flex-col justify-center min-h-[52px] w-full shadow-md relative transition-all duration-200"
    >
      {atleta?.id ? (
        <>
          <div className="font-bold uppercase truncate pr-5 text-slate-900">
            {atleta.nome}
          </div>
          <div className="text-[10px] text-slate-500 uppercase truncate">
            {atleta.equipe}
          </div>
          {cardPosition !== undefined && (
            <span className="absolute right-1 bottom-1 text-[10px] font-bold text-slate-400">
              {cardPosition + 1}
            </span>
          )}
        </>
      ) : (
        <>
          <div className="font-bold uppercase truncate pr-5 text-slate-400 italic">
            -- Vazio --
          </div>
          <div className="text-[10px] text-slate-400 uppercase truncate">
            Equipe
          </div>
          {cardPosition !== undefined && (
            <span className="absolute right-1 bottom-1 text-[10px] font-bold text-slate-400">
              {cardPosition + 1}
            </span>
          )}
        </>
      )}
    </div>
  )
}

function PodiumLine({ label, colorClass, value }: { label: string; colorClass: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("w-8 text-right font-black", colorClass)}>{label}</span>
      <div className="flex-1 border-b border-slate-900 px-2 py-0.5 text-xs font-bold uppercase min-h-[24px]">
        {value.includes("--") ? (
          <span className="text-slate-400 italic">{value}</span>
        ) : (
          <span className="text-slate-900">{value}</span>
        )}
      </div>
    </div>
  )
}

function findChampion(chave: ChaveLuta): { id: string; nome: string; equipe: string; faixa?: string } | undefined {
  if (!chave.vencedorAtletaId) return undefined
  for (const luta of chave.lutas) {
    if (luta.atleta1?.id === chave.vencedorAtletaId) return luta.atleta1
    if (luta.atleta2?.id === chave.vencedorAtletaId) return luta.atleta2
  }
  return undefined
}