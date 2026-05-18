"use client"

import { cn } from "@/lib/utils"
import { ChaveLuta, BracketRound, Luta } from "@/app/types"
import { BracketEmptyState } from "./BracketEmptyState"
import { BracketChampion } from "./BracketChampion"
import { ChampionModal } from "./ChampionModal"
import { getUnicoAtleta, podeIniciarLuta } from "@/app/lib/bracket-utils"
import { useState, useEffect, useMemo, useRef } from "react"
import { Trophy, Edit3 } from "lucide-react"
import { canInteract } from "@/lib/bracket-utils"

interface BracketLayoutProps {
  rounds: BracketRound[]
  chave: ChaveLuta
  activeFightId?: string
  onFightClick?: (luta: Luta) => void
  mode?: "live" | "readonly"
  className?: string
}

interface CompetitorNode {
  id: string
  round: number
  position: number
  side: "L" | "R"
  luta: Luta
}

export function BracketLayout({ rounds, chave, activeFightId, onFightClick, mode = "live", className }: BracketLayoutProps) {
  const [showChampionModal, setShowChampionModal] = useState(false)
  const [championTrigger, setChampionTrigger] = useState(0)
  const [editingNode, setEditingNode] = useState<{ side: "L" | "R"; round: number; position: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const todasLutasConcluidas = useMemo(() => {
    return chave.lutas.every(l => 
      l.resultado?.status === "concluida" || 
      (!l.atleta1?.id || !l.atleta2?.id)
    )
  }, [chave.lutas])

  const podeExibirCampeao = chave.status === "concluida" && !!chave.vencedorAtletaId && todasLutasConcluidas
  const champion = podeExibirCampeao ? findChampion(chave) : undefined

  const nodes = useMemo(() => {
    const result: CompetitorNode[] = []
    
    rounds.forEach((round, roundIndex) => {
      const side: "L" | "R" = round.label === "Round 1" 
        ? (roundIndex < rounds.length / 2 ? "L" : "R")
        : "L"
      
      round.matchups.forEach((matchup, pos) => {
        const luta = chave.lutas.find(l => l.id === matchup.id)
        if (!luta) return
        
        result.push({
          id: matchup.id,
          round: roundIndex + 1,
          position: pos,
          side: round.label === "Round 1" && pos >= 4 ? "R" : "L",
          luta
        })
      })
    })
    
    return result
  }, [rounds, chave.lutas])

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

  useEffect(() => {
    const timer = setTimeout(() => {
      drawConnections()
    }, 100)
    return () => clearTimeout(timer)
  }, [nodes, chave])

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

  const round1Lutas = chave.lutas.filter(l => l.round === 1)
  const round2Lutas = chave.lutas.filter(l => l.round === 2)
  const round3Lutas = chave.lutas.filter(l => l.round === 3)
  const finalLutas = chave.lutas.filter(l => l.round === Math.max(...chave.lutas.map(l => l.round)))

  const leftRound1 = round1Lutas.filter(l => l.position < 4).slice(0, 4)
  const rightRound1 = round1Lutas.filter(l => l.position >= 4).slice(0, 4)

  return (
    <>
      <div className={cn("w-full overflow-x-auto", className)}>
        <div className="min-w-[900px] p-4 relative">
          <svg 
            ref={svgRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          />

          <div className="grid grid-cols-7 gap-4 items-stretch relative z-10">
            {/* ================= LADO ESQUERDO ================= */}
            
            {/* Round 1 - Oitavas Esquerda */}
            <div className="col-span-1 flex flex-col justify-around min-h-[480px]">
              {leftRound1.map((luta, idx) => (
                <RoundPair key={luta.id} luta={luta} idx={idx} side="L" round={1} />
              ))}
            </div>

            {/* Round 2 - Quartas Esquerda */}
            <div className="col-span-1 flex flex-col justify-around min-h-[480px]">
              {round2Lutas.filter((_, i) => i < 2).map((luta, idx) => (
                <div key={luta.id} className="flex flex-col gap-16 py-2">
                  <CompetitorCard 
                    luta={luta} 
                    side="L" 
                    round={2} 
                    position={idx}
                    isFinalist={false}
                    podeAvancar={canInteract(luta, chave)}
                  />
                </div>
              ))}
            </div>

            {/* Round 3 - Semifinal Esquerda */}
            <div className="col-span-1 flex flex-col justify-around min-h-[480px]">
              <div className="flex flex-col gap-36 py-2">
                {round3Lutas.filter((_, i) => i < 1).map((luta, idx) => (
                  <CompetitorCard 
                    key={luta.id} 
                    luta={luta} 
                    side="L" 
                    round={3} 
                    position={idx}
                    isFinalist={false}
                    podeAvancar={canInteract(luta, chave)}
                  />
                ))}
              </div>
            </div>

            {/* ================= PAINEL CENTRAL ================= */}
            <div className="col-span-1 flex flex-col justify-center items-center gap-8 min-h-[480px]">
              
              {/* Finalista Esquerdo */}
              <div className="flex flex-col items-center w-full">
                <span className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Finalista Esquerdo</span>
                <CompetitorCard 
                  luta={findFinalLuta(chave, 0)} 
                  side="F" 
                  round={0} 
                  position={0}
                  isFinalist={true}
                  podeAvancar={true}
                />
              </div>

              {/* Troféu Central */}
              <div className="flex flex-col items-center">
                <div className="bg-yellow-500 text-slate-950 p-2 rounded-full shadow-lg">
                  <Trophy className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">Disputa de Ouro</span>
              </div>

              {/* Finalista Direito */}
              <div className="flex flex-col items-center w-full">
                <CompetitorCard 
                  luta={findFinalLuta(chave, 1)} 
                  side="F" 
                  round={0} 
                  position={1}
                  isFinalist={true}
                  podeAvancar={true}
                />
                <span className="text-[10px] font-bold text-slate-500 uppercase mt-1 tracking-wider">Finalista Direito</span>
              </div>
            </div>

            {/* Round 3 - Semifinal Direita */}
            <div className="col-span-1 flex flex-col justify-around min-h-[480px]">
              <div className="flex flex-col gap-36 py-2">
                {round3Lutas.filter((_, i) => i >= 1).map((luta, idx) => (
                  <CompetitorCard 
                    key={luta.id} 
                    luta={luta} 
                    side="R" 
                    round={3} 
                    position={idx + 1}
                    isFinalist={false}
                    podeAvancar={canInteract(luta, chave)}
                  />
                ))}
              </div>
            </div>

            {/* Round 2 - Quartas Direita */}
            <div className="col-span-1 flex flex-col justify-around min-h-[480px]">
              {round2Lutas.filter((_, i) => i >= 2).map((luta, idx) => (
                <div key={luta.id} className="flex flex-col gap-16 py-2">
                  <CompetitorCard 
                    luta={luta} 
                    side="R" 
                    round={2} 
                    position={idx + 2}
                    isFinalist={false}
                    podeAvancar={canInteract(luta, chave)}
                  />
                </div>
              ))}
            </div>

            {/* Round 1 - Oitavas Direita */}
            <div className="col-span-1 flex flex-col justify-around min-h-[480px]">
              {rightRound1.map((luta, idx) => (
                <RoundPair key={luta.id} luta={luta} idx={idx} side="R" round={1} />
              ))}
            </div>
          </div>

          {/* ================= PÓDIO ================= */}
          <div className="w-full flex justify-center mt-8">
            <div className="w-full max-w-xl border-t-2 border-slate-300 pt-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2 text-center">Classificação Final</h3>
              <div className="flex flex-col gap-1 text-sm font-semibold">
                <PodiumLine label="1º" colorClass="text-amber-500" value={champion ? `${champion.nome} (${champion.equipe})` : "-- Aguardando final --"} />
                <PodiumLine label="2º" colorClass="text-slate-400" value={getRunnerUp()} />
                <PodiumLine label="3º" colorClass="text-amber-700" value={getThirdPlace("left")} />
                <PodiumLine label="3º" colorClass="text-amber-700" value={getThirdPlace("right")} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showChampionModal && champion && (
        <ChampionModal
          champion={champion}
          categoryName={chave.categoria}
          onClose={() => setShowChampionModal(false)}
        />
      )}

      {editingNode && (
        <EditModal 
          node={editingNode}
          chave={chave}
          onClose={() => setEditingNode(null)}
        />
      )}
    </>
  )
}

function CompetitorCard({ 
  luta, 
  side, 
  round, 
  position, 
  isFinalist,
  podeAvancar,
}: { 
  luta?: Luta
  side: "L" | "R" | "F"
  round: number
  position: number
  isFinalist: boolean
  podeAvancar: boolean
}) {
  const isEmpty = !luta?.atleta1?.id && !luta?.atleta2?.id
  const isBye = !!luta?.atleta1?.id !== !!luta?.atleta2?.id
  const isConcluida = luta?.resultado?.status === "concluida"
  const isActive = false

  const borderClass = isFinalist 
    ? "border-yellow-500 shadow-md" 
    : "border-slate-950 shadow-sm"

  return (
    <div 
      className={cn(
        "bg-white p-2 text-xs flex flex-col justify-center min-h-[52px] border-2 relative transition-all duration-200",
        borderClass,
        isEmpty && "bg-slate-50",
        isConcluida && "bg-slate-100"
      )}
    >
      {luta?.atleta1?.id ? (
        <>
          <div className="font-bold uppercase truncate pr-5 text-slate-900">
            {luta.atleta1.nome}
          </div>
          <div className="text-[10px] text-slate-500 uppercase truncate">
            {luta.atleta1.equipe}
          </div>
          {luta.atleta1.id && isConcluida && (
            <div className="absolute right-1 top-1 bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
              VENCEU
            </div>
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
        </>
      )}
    </div>
  )
}

function RoundPair({ luta, idx, side, round }: { luta: Luta; idx: number; side: "L" | "R"; round: number }) {
  return (
    <div className="flex flex-col gap-3 py-2">
      <CompetitorCard luta={luta} side={side} round={round} position={idx * 2} isFinalist={false} podeAvancar={true} />
      <CompetitorCard luta={undefined} side={side} round={round} position={idx * 2 + 1} isFinalist={false} podeAvancar={true} />
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

function findFinalLuta(chave: ChaveLuta, index: number): Luta | undefined {
  const maxRound = Math.max(...chave.lutas.map(l => l.round))
  const finalLutas = chave.lutas.filter(l => l.round === maxRound)
  return finalLutas[index]
}

function findChampion(chave: ChaveLuta): { id: string; nome: string; equipe: string; faixa?: string } | undefined {
  if (!chave.vencedorAtletaId) return undefined
  for (const luta of chave.lutas) {
    if (luta.atleta1?.id === chave.vencedorAtletaId) return luta.atleta1
    if (luta.atleta2?.id === chave.vencedorAtletaId) return luta.atleta2
  }
  return undefined
}

function getRunnerUp(): string {
  return "-- Aguardando disputa de ouro --"
}

function getThirdPlace(side: "left" | "right"): string {
  return `-- Definido automaticamente pelo perdedor da semifinal ${side} --`
}

function drawConnections() {
  // SVG connection logic would be implemented here
}

function EditModal({ node, chave, onClose }: { node: { side: "L" | "R"; round: number; position: number }; chave: ChaveLuta; onClose: () => void }) {
  return null // Placeholder - would implement modal if needed
}

function canInteract(luta: Luta, chave: ChaveLuta): boolean {
  if (!luta.atleta1?.id || !luta.atleta2?.id) return false
  return podeIniciarLuta(luta, chave)
}