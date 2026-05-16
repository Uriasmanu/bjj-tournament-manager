"use client"

import { Suspense, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { ScoreboardTimer } from "@/app/components/Timer"
import { ScoreHeader } from "@/app/components/scoreboard/ScoreHeader"
import { AtletaCard, AtletaState } from "@/app/components/scoreboard/AtletaCard"

function ScoreboardContent() {
  const searchParams = useSearchParams()

  const area = searchParams.get("area") || "Área 1"
  const arbitro = searchParams.get("arbitro") || "Não definido"
  const nomeAtleta1 = searchParams.get("atleta1") || "Atleta 1"
  const equipeAtleta1 = searchParams.get("equipe1") || "Equipe A"
  const nomeAtleta2 = searchParams.get("atleta2") || "Atleta 2"
  const equipeAtleta2 = searchParams.get("equipe2") || "Equipe B"

  const initialState: AtletaState = {
    montada: 0,
    passagem: 0,
    queda: 0,
    vantagem: 0,
    punicao: 0,
  }

  const [p1, setP1] = useState<AtletaState>(initialState)
  const [p2, setP2] = useState<AtletaState>(initialState)

  const handleScoreChange = (player: 1 | 2, category: keyof AtletaState, value: number) => {
    const setState = player === 1 ? setP1 : setP2
    setState((prev) => ({
      ...prev,
      [category]: Math.max(0, prev[category] + value),
    }))
  }

  const resetAll = useCallback(() => {
    setP1(initialState)
    setP2(initialState)
  }, [initialState])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black relative select-none">
      <ScoreHeader area={area} arbitro={arbitro} />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="bg-black border-4 border-gray-700 p-3 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center min-w-[220px]">
          <ScoreboardTimer onReset={resetAll} />
        </div>
      </div>

      <AtletaCard
        nome={nomeAtleta1}
        equipe={equipeAtleta1}
        estado={p1}
        onScoreChange={(cat, val) => handleScoreChange(1, cat, val)}
        isLight={false}
      />

      <div className="border-b-2 border-black" />

      <AtletaCard
        nome={nomeAtleta2}
        equipe={equipeAtleta2}
        estado={p2}
        onScoreChange={(cat, val) => handleScoreChange(2, cat, val)}
        isLight={true}
      />
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <div className="text-2xl text-[#D4AF37] font-bold tracking-widest animate-pulse">
        Carregando placar...
      </div>
    </div>
  )
}

export default function ScoreboardPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ScoreboardContent />
    </Suspense>
  )
}