"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { MapPin, User } from "lucide-react"
import { ScoreboardTimer } from "@/app/components/Timer"

interface AtletaState {
  montada: number
  passagem: number
  queda: number
  vantagem: number
  punicao: number
}

function ScoreboardContent() {
  const searchParams = useSearchParams()

  const area = searchParams.get("area") || "Área 1"
  const arbitro = searchParams.get("arbitro") || "Não definido"

  const [p1, setP1] = useState<AtletaState>({
    montada: 0,
    passagem: 0,
    queda: 0,
    vantagem: 0,
    punicao: 0,
  })

  const [p2, setP2] = useState<AtletaState>({
    montada: 0,
    passagem: 0,
    queda: 0,
    vantagem: 0,
    punicao: 0,
  })

  const updateSubScore = (player: 1 | 2, category: keyof AtletaState, value: number) => {
    const setState = player === 1 ? setP1 : setP2
    setState((prev) => {
      const newValue = Math.max(0, prev[category] + value)
      return { ...prev, [category]: newValue }
    })
  }

  const p1Total = p1.montada + p1.passagem + p1.queda
  const p2Total = p2.montada + p2.passagem + p2.queda

  const formatScore = (n: number) => n.toString().padStart(2, "0")

  return (
    <div className="flex flex-col h-screen overflow-hidden py-8">
      {/* ATLETA SUPERIOR (AZUL) */}
      <div className="flex-1 bg-blue-700 text-white flex flex-col p-4 border-b-4 border-black">
        <div className="flex justify-between items-start">
          <div className="flex-grow">
            <div className="text-6xl font-black uppercase mb-2">
              {searchParams.get("atleta1") || "Atleta 1"}
            </div>
            <div className="text-2xl font-bold text-blue-200 uppercase">
              {searchParams.get("equipe1") || "Equipe A"}
            </div>

            <div className="flex gap-4 mt-4">
              {/* Montada / Pegada nas Costas - 4 pontos */}
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold h-10 text-center flex items-center leading-tight">
                  Montada / Pegada<br />nas Costas
                </span>
                <div className="bg-blue-800 text-7xl p-4 rounded-sm mb-2 text-center font-black min-w-[100px]">
                  {p1.montada}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateSubScore(1, "montada", 4)}
                    className="bg-white text-blue-700 px-3 py-1 rounded font-bold"
                  >
                    +4
                  </button>
                  <button
                    onClick={() => updateSubScore(1, "montada", -4)}
                    className="bg-white text-blue-700 px-3 py-1 rounded font-bold"
                  >
                    -4
                  </button>
                </div>
              </div>

              {/* Passagem de Guarda - 3 pontos */}
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold h-10 text-center flex items-center leading-tight">
                  Passagem de<br />Guarda
                </span>
                <div className="bg-blue-800 text-7xl p-4 rounded-sm mb-2 text-center font-black min-w-[100px]">
                  {p1.passagem}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateSubScore(1, "passagem", 3)}
                    className="bg-white text-blue-700 px-3 py-1 rounded font-bold"
                  >
                    +3
                  </button>
                  <button
                    onClick={() => updateSubScore(1, "passagem", -3)}
                    className="bg-white text-blue-700 px-3 py-1 rounded font-bold"
                  >
                    -3
                  </button>
                </div>
              </div>

              {/* Queda, Raspagem, Joelho na barriga - 2 pontos */}
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold h-10 text-center flex items-center leading-tight">
                  Queda, Raspagem,<br />Joelho na barriga
                </span>
                <div className="bg-blue-800 text-7xl p-4 rounded-sm mb-2 text-center font-black min-w-[100px]">
                  {p1.queda}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateSubScore(1, "queda", 2)}
                    className="bg-white text-blue-700 px-3 py-1 rounded font-bold"
                  >
                    +2
                  </button>
                  <button
                    onClick={() => updateSubScore(1, "queda", -2)}
                    className="bg-white text-blue-700 px-3 py-1 rounded font-bold"
                  >
                    -2
                  </button>
                </div>
              </div>

              {/* Vantagem e Punição */}
              <div className="flex flex-col gap-2 ml-4">
                <div className="bg-yellow-400 text-black p-2 flex flex-col items-center rounded border-2 border-black">
                  <span className="text-xs font-bold uppercase">Vantagem</span>
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-black">{p1.vantagem}</span>
                    <div className="flex flex-col">
                      <button
                        onClick={() => updateSubScore(1, "vantagem", 1)}
                        className="bg-white text-xs px-2 mb-1 rounded"
                      >
                        +
                      </button>
                      <button
                        onClick={() => updateSubScore(1, "vantagem", -1)}
                        className="bg-white text-xs px-2 rounded"
                      >
                        -
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-red-600 text-white p-2 flex flex-col items-center rounded border-2 border-white">
                  <span className="text-xs font-bold uppercase">Punições</span>
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-black">{p1.punicao}</span>
                    <div className="flex flex-col">
                      <button
                        onClick={() => updateSubScore(1, "punicao", 1)}
                        className="bg-white text-black text-xs px-2 mb-1 rounded"
                      >
                        +
                      </button>
                      <button
                        onClick={() => updateSubScore(1, "punicao", -1)}
                        className="bg-white text-black text-xs px-2 rounded"
                      >
                        -
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TOTAL ATLETA 1 */}
          <div className="flex flex-col items-end pr-8">
            <span className="text-xl font-bold uppercase">Pontuação Total</span>
            <span className="text-[12rem] font-black leading-none font-mono">
              {formatScore(p1Total)}
            </span>
          </div>
        </div>
      </div>

      {/* CRONÔMETRO - centro */}
      <div className="absolute right-[40%] top-1/2 -translate-y-1/2 z-10 mr-4 flex flex-col items-center">
        <div className="bg-black border-4 border-gray-600 p-4 rounded-lg flex flex-col items-center shadow-2xl">
          <ScoreboardTimer />
        </div>
      </div>

      {/* ATLETA INFERIOR (BRANCO) */}
      <div className="flex-1 bg-white text-black flex flex-col p-4">
        <div className="flex justify-between items-start">
          <div className="flex-grow">
            <div className="text-6xl font-black uppercase mb-2">
              {searchParams.get("atleta2") || "Atleta 2"}
            </div>
            <div className="text-2xl font-bold text-gray-600 uppercase">
              {searchParams.get("equipe2") || "Equipe B"}
            </div>

            <div className="flex gap-4 mt-4">
              {/* Montada / Pegada nas Costas - 4 pontos */}
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold h-10 text-center flex items-center leading-tight text-black">
                  Montada / Pegada<br />nas Costas
                </span>
                <div className="bg-gray-100 text-7xl p-4 rounded-sm mb-2 text-center font-black min-w-[100px]">
                  {p2.montada}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateSubScore(2, "montada", 4)}
                    className="bg-black text-white px-3 py-1 rounded font-bold"
                  >
                    +4
                  </button>
                  <button
                    onClick={() => updateSubScore(2, "montada", -4)}
                    className="bg-black text-white px-3 py-1 rounded font-bold"
                  >
                    -4
                  </button>
                </div>
              </div>

              {/* Passagem de Guarda - 3 pontos */}
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold h-10 text-center flex items-center leading-tight text-black">
                  Passagem de<br />Guarda
                </span>
                <div className="bg-gray-100 text-7xl p-4 rounded-sm mb-2 text-center font-black min-w-[100px]">
                  {p2.passagem}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateSubScore(2, "passagem", 3)}
                    className="bg-black text-white px-3 py-1 rounded font-bold"
                  >
                    +3
                  </button>
                  <button
                    onClick={() => updateSubScore(2, "passagem", -3)}
                    className="bg-black text-white px-3 py-1 rounded font-bold"
                  >
                    -3
                  </button>
                </div>
              </div>

              {/* Queda, Raspagem, Joelho na barriga - 2 pontos */}
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold h-10 text-center flex items-center leading-tight text-black">
                  Queda, Raspagem,<br />Joelho na barriga
                </span>
                <div className="bg-gray-100 text-7xl p-4 rounded-sm mb-2 text-center font-black min-w-[100px]">
                  {p2.queda}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateSubScore(2, "queda", 2)}
                    className="bg-black text-white px-3 py-1 rounded font-bold"
                  >
                    +2
                  </button>
                  <button
                    onClick={() => updateSubScore(2, "queda", -2)}
                    className="bg-black text-white px-3 py-1 rounded font-bold"
                  >
                    -2
                  </button>
                </div>
              </div>

              {/* Vantagem e Punição */}
              <div className="flex flex-col gap-2 ml-4">
                <div className="bg-yellow-400 text-black p-2 flex flex-col items-center rounded border-2 border-black">
                  <span className="text-xs font-bold uppercase">Vantagem</span>
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-black">{p2.vantagem}</span>
                    <div className="flex flex-col">
                      <button
                        onClick={() => updateSubScore(2, "vantagem", 1)}
                        className="bg-black text-white text-xs px-2 mb-1 rounded"
                      >
                        +
                      </button>
                      <button
                        onClick={() => updateSubScore(2, "vantagem", -1)}
                        className="bg-black text-white text-xs px-2 rounded"
                      >
                        -
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-red-600 text-white p-2 flex flex-col items-center rounded border-2 border-black">
                  <span className="text-xs font-bold uppercase">Punições</span>
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-black">{p2.punicao}</span>
                    <div className="flex flex-col">
                      <button
                        onClick={() => updateSubScore(2, "punicao", 1)}
                        className="bg-white text-black text-xs px-2 mb-1 rounded"
                      >
                        +
                      </button>
                      <button
                        onClick={() => updateSubScore(2, "punicao", -1)}
                        className="bg-white text-black text-xs px-2 rounded"
                      >
                        -
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TOTAL ATLETA 2 */}
          <div className="flex flex-col items-end pr-8">
            <span className="text-xl font-bold uppercase">Pontuação Total</span>
            <span className="text-[12rem] font-black leading-none font-mono text-black">
              {formatScore(p2Total)}
            </span>
          </div>
        </div>
      </div>

      {/* Header fixo no topo com área e árbitro */}
      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-80 p-2 flex justify-between items-center z-20">
        <div className="flex items-center gap-2 text-[#D4AF37]">
          <MapPin className="w-5 h-5" />
          <span className="text-xl font-bold">{area}</span>
        </div>
        <div className="flex items-center gap-2 text-white">
          <User className="w-5 h-5" />
          <span className="text-lg">Árbitro: {arbitro}</span>
        </div>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <div className="text-2xl text-[#D4AF37]">Carregando placar...</div>
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