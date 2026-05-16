"use client"

import { Suspense, useState, useRef } from "react"
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

  const audioCtxRef = useRef<AudioContext | null>(null)

  const playBeep = (freq: number, duration: number) => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      audioCtxRef.current = new AudioCtx()
    }
    const ctx = audioCtxRef.current
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.value = freq
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration)
    osc.stop(ctx.currentTime + duration)
  }

  const updateSubScore = (player: 1 | 2, category: keyof AtletaState, value: number) => {
    const setState = player === 1 ? setP1 : setP2
    setState((prev) => {
      const newValue = Math.max(0, prev[category] + value)
      if (category !== "vantagem" && category !== "punicao") {
        playBeep(value > 0 ? 800 : 400, 0.1)
      }
      return { ...prev, [category]: newValue }
    })
  }

  const p1Total = p1.montada + p1.passagem + p1.queda
  const p2Total = p2.montada + p2.passagem + p2.queda

  const formatScore = (n: number) => n.toString().padStart(2, "0")

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black relative select-none">
      
      {/* HEADER FIXO NO TOPO */}
      <div className="absolute top-0 left-0 right-0 bg-black/90 border-b border-gray-800 p-3 flex justify-between items-center z-30 px-6">
        <div className="flex items-center gap-2 text-[#D4AF37]">
          <MapPin className="w-5 h-5" />
          <span className="text-xl font-bold tracking-wide">{area}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <User className="w-5 h-5" />
          <span className="text-lg font-medium">Árbitro: {arbitro}</span>
        </div>
      </div>

      {/* CRONÔMETRO CENTRAL ABSOLUTO */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="bg-black border-4 border-gray-700 p-3 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center min-w-[220px]">
          <ScoreboardTimer />
        </div>
      </div>

      {/* ATLETA SUPERIOR (AZUL) */}
      <div className="flex-1 bg-blue-700 text-white flex flex-col pt-16 pb-4 px-8 border-b-2 border-black justify-center">
        <div className="flex justify-between items-center h-full w-full">
          
          {/* Lado Esquerdo: Nome, Equipe e Parciais */}
          <div className="flex flex-col justify-center max-w-[65%]">
            <div className="text-5xl font-black uppercase tracking-tight mb-1 truncate">
              {searchParams.get("atleta1") || "Atleta 1"}
            </div>
            <div className="text-xl font-bold text-blue-200 uppercase tracking-wider mb-4">
              {searchParams.get("equipe1") || "Equipe A"}
            </div>

            <div className="flex items-center gap-4">
              {/* Montada / Pegada nas Costas - 4 pontos */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold h-8 text-center flex items-center leading-tight text-blue-100 mb-1">
                  Montada / Costas
                </span>
                <div className="bg-blue-800 border border-blue-600 text-5xl py-2 px-4 rounded-md mb-2 text-center font-black min-w-[100px]">
                  {p1.montada}
                </div>
                <div className="flex gap-1.5 w-full">
                  <button
                    onClick={() => updateSubScore(1, "montada", 4)}
                    className="flex-1 bg-white text-blue-700 py-1 rounded font-extrabold hover:bg-blue-50 transition-colors"
                  >
                    +4
                  </button>
                  <button
                    onClick={() => updateSubScore(1, "montada", -4)}
                    className="flex-1 bg-blue-900 text-white py-1 rounded font-extrabold hover:bg-blue-950 border border-blue-600 transition-colors"
                  >
                    -4
                  </button>
                </div>
              </div>

              {/* Passagem de Guarda - 3 pontos */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold h-8 text-center flex items-center leading-tight text-blue-100 mb-1">
                  Passagem Guarda
                </span>
                <div className="bg-blue-800 border border-blue-600 text-5xl py-2 px-4 rounded-md mb-2 text-center font-black min-w-[100px]">
                  {p1.passagem}
                </div>
                <div className="flex gap-1.5 w-full">
                  <button
                    onClick={() => updateSubScore(1, "passagem", 3)}
                    className="flex-1 bg-white text-blue-700 py-1 rounded font-extrabold hover:bg-blue-50 transition-colors"
                  >
                    +3
                  </button>
                  <button
                    onClick={() => updateSubScore(1, "passagem", -3)}
                    className="flex-1 bg-blue-900 text-white py-1 rounded font-extrabold hover:bg-blue-950 border border-blue-600 transition-colors"
                  >
                    -3
                  </button>
                </div>
              </div>

              {/* Queda, Raspagem, Joelho na barriga - 2 pontos */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold h-8 text-center flex items-center leading-tight text-blue-100 mb-1">
                  Queda/Rasp./Joelho
                </span>
                <div className="bg-blue-800 border border-blue-600 text-5xl py-2 px-4 rounded-md mb-2 text-center font-black min-w-[100px]">
                  {p1.queda}
                </div>
                <div className="flex gap-1.5 w-full">
                  <button
                    onClick={() => updateSubScore(1, "queda", 2)}
                    className="flex-1 bg-white text-blue-700 py-1 rounded font-extrabold hover:bg-blue-50 transition-colors"
                  >
                    +2
                  </button>
                  <button
                    onClick={() => updateSubScore(1, "queda", -2)}
                    className="flex-1 bg-blue-900 text-white py-1 rounded font-extrabold hover:bg-blue-950 border border-blue-600 transition-colors"
                  >
                    -2
                  </button>
                </div>
              </div>

              {/* Vantagem e Punição */}
              <div className="flex gap-2 ml-2">
                <div className="bg-yellow-400 text-black p-2 flex flex-col items-center rounded-lg border-2 border-black min-w-[85px]">
                  <span className="text-[10px] font-black uppercase tracking-wider mb-1">Vantagem</span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black font-mono">{p1.vantagem}</span>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => updateSubScore(1, "vantagem", 1)}
                        className="bg-white hover:bg-gray-100 text-black px-2 py-0.5 rounded text-xs font-black border border-black/20"
                      >
                        +
                      </button>
                      <button
                        onClick={() => updateSubScore(1, "vantagem", -1)}
                        className="bg-white hover:bg-gray-100 text-black px-2 py-0.5 rounded text-xs font-black border border-black/20"
                      >
                        -
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-red-600 text-white p-2 flex flex-col items-center rounded-lg border-2 border-white min-w-[85px]">
                  <span className="text-[10px] font-black uppercase tracking-wider mb-1">Punição</span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black font-mono">{p1.punicao}</span>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => updateSubScore(1, "punicao", 1)}
                        className="bg-white hover:bg-gray-100 text-black px-2 py-0.5 rounded text-xs font-black"
                      >
                        +
                      </button>
                      <button
                        onClick={() => updateSubScore(1, "punicao", -1)}
                        className="bg-white hover:bg-gray-100 text-black px-2 py-0.5 rounded text-xs font-black"
                      >
                        -
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Direito: TOTAL PLACAR */}
          <div className="flex flex-col items-center justify-center pr-4">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-1">Pontos</span>
            <span className="text-[11rem] font-black leading-none font-mono tracking-tighter">
              {formatScore(p1Total)}
            </span>
          </div>
        </div>
      </div>

      {/* ATLETA INFERIOR (BRANCO) */}
      <div className="flex-1 bg-white text-black flex flex-col pt-4 pb-16 px-8 justify-center">
        <div className="flex justify-between items-center h-full w-full">
          
          {/* Lado Esquerdo: Nome, Equipe e Parciais */}
          <div className="flex flex-col justify-center max-w-[65%]">
            <div className="text-5xl font-black uppercase tracking-tight mb-1 truncate">
              {searchParams.get("atleta2") || "Atleta 2"}
            </div>
            <div className="text-xl font-bold text-gray-500 uppercase tracking-wider mb-4">
              {searchParams.get("equipe2") || "Equipe B"}
            </div>

            <div className="flex items-center gap-4">
              {/* Montada / Pegada nas Costas - 4 pontos */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold h-8 text-center flex items-center leading-tight text-gray-600 mb-1">
                  Montada / Costas
                </span>
                <div className="bg-gray-100 border border-gray-300 text-5xl py-2 px-4 rounded-md mb-2 text-center font-black min-w-[100px]">
                  {p2.montada}
                </div>
                <div className="flex gap-1.5 w-full">
                  <button
                    onClick={() => updateSubScore(2, "montada", 4)}
                    className="flex-1 bg-black text-white py-1 rounded font-extrabold hover:bg-gray-900 transition-colors"
                  >
                    +4
                  </button>
                  <button
                    onClick={() => updateSubScore(2, "montada", -4)}
                    className="flex-1 bg-gray-200 text-black py-1 rounded font-extrabold hover:bg-gray-300 transition-colors"
                  >
                    -4
                  </button>
                </div>
              </div>

              {/* Passagem de Guarda - 3 pontos */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold h-8 text-center flex items-center leading-tight text-gray-600 mb-1">
                  Passagem Guarda
                </span>
                <div className="bg-gray-100 border border-gray-300 text-5xl py-2 px-4 rounded-md mb-2 text-center font-black min-w-[100px]">
                  {p2.passagem}
                </div>
                <div className="flex gap-1.5 w-full">
                  <button
                    onClick={() => updateSubScore(2, "passagem", 3)}
                    className="flex-1 bg-black text-white py-1 rounded font-extrabold hover:bg-gray-900 transition-colors"
                  >
                    +3
                  </button>
                  <button
                    onClick={() => updateSubScore(2, "passagem", -3)}
                    className="flex-1 bg-gray-200 text-black py-1 rounded font-extrabold hover:bg-gray-300 transition-colors"
                  >
                    -3
                  </button>
                </div>
              </div>

              {/* Queda, Raspagem, Joelho na barriga - 2 pontos */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold h-8 text-center flex items-center leading-tight text-gray-600 mb-1">
                  Queda/Rasp./Joelho
                </span>
                <div className="bg-gray-100 border border-gray-300 text-5xl py-2 px-4 rounded-md mb-2 text-center font-black min-w-[100px]">
                  {p2.queda}
                </div>
                <div className="flex gap-1.5 w-full">
                  <button
                    onClick={() => updateSubScore(2, "queda", 2)}
                    className="flex-1 bg-black text-white py-1 rounded font-extrabold hover:bg-gray-900 transition-colors"
                  >
                    +2
                  </button>
                  <button
                    onClick={() => updateSubScore(2, "queda", -2)}
                    className="flex-1 bg-gray-200 text-black py-1 rounded font-extrabold hover:bg-gray-300 transition-colors"
                  >
                    -2
                  </button>
                </div>
              </div>

              {/* Vantagem e Punição */}
              <div className="flex gap-2 ml-2">
                <div className="bg-yellow-400 text-black p-2 flex flex-col items-center rounded-lg border-2 border-black min-w-[85px]">
                  <span className="text-[10px] font-black uppercase tracking-wider mb-1">Vantagem</span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black font-mono">{p2.vantagem}</span>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => updateSubScore(2, "vantagem", 1)}
                        className="bg-white hover:bg-gray-100 text-black px-2 py-0.5 rounded text-xs font-black border border-black/20"
                      >
                        +
                      </button>
                      <button
                        onClick={() => updateSubScore(2, "vantagem", -1)}
                        className="bg-white hover:bg-gray-100 text-black px-2 py-0.5 rounded text-xs font-black border border-black/20"
                      >
                        -
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-red-600 text-white p-2 flex flex-col items-center rounded-lg border-2 border-black min-w-[85px]">
                  <span className="text-[10px] font-black uppercase tracking-wider mb-1 text-white">Punição</span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black font-mono text-white">{p2.punicao}</span>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => updateSubScore(2, "punicao", 1)}
                        className="bg-white hover:bg-gray-100 text-black px-2 py-0.5 rounded text-xs font-black"
                      >
                        +
                      </button>
                      <button
                        onClick={() => updateSubScore(2, "punicao", -1)}
                        className="bg-white hover:bg-gray-100 text-black px-2 py-0.5 rounded text-xs font-black"
                      >
                        -
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Direito: TOTAL PLACAR */}
          <div className="flex flex-col items-center justify-center pr-4">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Pontos</span>
            <span className="text-[11rem] font-black leading-none font-mono tracking-tighter text-black">
              {formatScore(p2Total)}
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <div className="text-2xl text-[#D4AF37] font-bold tracking-widest animate-pulse">Carregando placar...</div>
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