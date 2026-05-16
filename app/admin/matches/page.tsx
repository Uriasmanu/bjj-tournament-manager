"use client"

import { useState } from "react"
import { ScoreboardTimer } from "@/app/components/Timer"
import { Undo2, Trophy } from "lucide-react"

interface Lutador {
  nome: string
  equipe: string
  pontos: number
  vantagens: number
  penalidades: number
}

interface HistoricoPontuacao {
  id: number
  tipo: "ponto" | "vantagem" | "penalidade"
  valor: number
  lutador: "atleta1" | "atleta2"
  descricao: string
}

export default function MatchesPage() {
  const [atleta1, setAtleta1] = useState<Lutador>({
    nome: "João Silva",
    equipe: "Team Brasil",
    pontos: 0,
    vantagens: 0,
    penalidades: 0,
  })

  const [atleta2, setAtleta2] = useState<Lutador>({
    nome: "Maria Santos",
    equipe: "Team São Paulo",
    pontos: 0,
    vantagens: 0,
    penalidades: 0,
  })

  const [historico, setHistorico] = useState<HistoricoPontuacao[]>([])
  const [historyId, setHistoryId] = useState(0)

  const adicionarPonto = (lutador: "atleta1" | "atleta2", valor: number) => {
    const descricao = `${valor} ponto${valor > 1 ? "s" : ""}`
    
    if (lutador === "atleta1") {
      setAtleta1((prev) => ({ ...prev, pontos: prev.pontos + valor }))
    } else {
      setAtleta2((prev) => ({ ...prev, pontos: prev.pontos + valor }))
    }

    setHistorico((prev) => [
      ...prev,
      { id: historyId, tipo: "ponto", valor, lutador, descricao },
    ])
    setHistoryId((prev) => prev + 1)
  }

  const adicionarVantagem = (lutador: "atleta1" | "atleta2") => {
    if (lutador === "atleta1") {
      setAtleta1((prev) => ({ ...prev, vantagens: prev.vantagens + 1 }))
    } else {
      setAtleta2((prev) => ({ ...prev, vantagens: prev.vantagens + 1 }))
    }

    setHistorico((prev) => [
      ...prev,
      { id: historyId, tipo: "vantagem", valor: 1, lutador, descricao: "Vantagem" },
    ])
    setHistoryId((prev) => prev + 1)
  }

  const adicionarPenalidade = (lutador: "atleta1" | "atleta2") => {
    if (lutador === "atleta1") {
      setAtleta1((prev) => ({ ...prev, penalidades: prev.penalidades + 1 }))
    } else {
      setAtleta2((prev) => ({ ...prev, penalidades: prev.penalidades + 1 }))
    }

    setHistorico((prev) => [
      ...prev,
      { id: historyId, tipo: "penalidade", valor: 1, lutador, descricao: "Penalidade" },
    ])
    setHistoryId((prev) => prev + 1)
  }

  const desfazer = () => {
    if (historico.length === 0) return

    const ultima = historico[historico.length - 1]

    if (ultima.tipo === "ponto") {
      if (ultima.lutador === "atleta1") {
        setAtleta1((prev) => ({ ...prev, pontos: prev.pontos - ultima.valor }))
      } else {
        setAtleta2((prev) => ({ ...prev, pontos: prev.pontos - ultima.valor }))
      }
    } else if (ultima.tipo === "vantagem") {
      if (ultima.lutador === "atleta1") {
        setAtleta1((prev) => ({ ...prev, vantagens: prev.vantagens - 1 }))
      } else {
        setAtleta2((prev) => ({ ...prev, vantagens: prev.vantagens - 1 }))
      }
    } else if (ultima.tipo === "penalidade") {
      if (ultima.lutador === "atleta1") {
        setAtleta1((prev) => ({ ...prev, penalidades: prev.penalidades - 1 }))
      } else {
        setAtleta2((prev) => ({ ...prev, penalidades: prev.penalidades - 1 }))
      }
    }

    setHistorico((prev) => prev.slice(0, -1))
  }

  const resetLuta = () => {
    setAtleta1({ ...atleta1, pontos: 0, vantagens: 0, penalidades: 0 })
    setAtleta2({ ...atleta2, pontos: 0, vantagens: 0, penalidades: 0 })
    setHistorico([])
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Controle de Luta</h1>
        <p className="text-gray-400">Gerencie a pontuação e o tempo da luta</p>
      </div>

      {/* Info da Categoria */}
      <div className="bg-[#4338CA] bg-opacity-20 border border-[#4338CA] rounded-lg p-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-400 text-sm">Categoria:</span>
            <span className="text-white font-semibold ml-2">Branca Infantil</span>
          </div>
          <div>
            <span className="text-gray-400 text-sm">Área:</span>
            <span className="text-white font-semibold ml-2">Área 1</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Atleta 1 */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-1">{atleta1.nome}</h2>
          <p className="text-gray-400 mb-4">{atleta1.equipe}</p>

          <div className="text-6xl font-bold text-[#D4AF37] text-center mb-6">
            {atleta1.pontos}
          </div>

          <div className="space-y-3">
            <p className="text-gray-400 text-sm">Pontos</p>
            <div className="flex gap-2">
              {[2, 3, 4].map((pts) => (
                <button
                  key={pts}
                  onClick={() => adicionarPonto("atleta1", pts)}
                  className="flex-1 bg-[#4338CA] hover:bg-[#5a47e8] text-white py-3 rounded-lg font-bold transition-colors"
                >
                  +{pts}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => adicionarVantagem("atleta1")}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                +Vant
              </button>
              <button
                onClick={() => adicionarPenalidade("atleta1")}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                -Pen
              </button>
            </div>

            <div className="flex justify-between text-sm mt-4">
              <span className="text-gray-400">
                Vantagens: <span className="text-white font-bold">{atleta1.vantagens}</span>
              </span>
              <span className="text-gray-400">
                Penalidades: <span className="text-white font-bold">{atleta1.penalidades}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Cronômetro */}
        <div className="flex flex-col items-center justify-center bg-gray-900 rounded-lg p-6 border border-gray-700">
          <ScoreboardTimer />
        </div>

        {/* Atleta 2 */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-1">{atleta2.nome}</h2>
          <p className="text-gray-400 mb-4">{atleta2.equipe}</p>

          <div className="text-6xl font-bold text-[#D4AF37] text-center mb-6">
            {atleta2.pontos}
          </div>

          <div className="space-y-3">
            <p className="text-gray-400 text-sm">Pontos</p>
            <div className="flex gap-2">
              {[2, 3, 4].map((pts) => (
                <button
                  key={pts}
                  onClick={() => adicionarPonto("atleta2", pts)}
                  className="flex-1 bg-[#4338CA] hover:bg-[#5a47e8] text-white py-3 rounded-lg font-bold transition-colors"
                >
                  +{pts}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => adicionarVantagem("atleta2")}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                +Vant
              </button>
              <button
                onClick={() => adicionarPenalidade("atleta2")}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                -Pen
              </button>
            </div>

            <div className="flex justify-between text-sm mt-4">
              <span className="text-gray-400">
                Vantagens: <span className="text-white font-bold">{atleta2.vantagens}</span>
              </span>
              <span className="text-gray-400">
                Penalidades: <span className="text-white font-bold">{atleta2.penalidades}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de Desfazer e Reset */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={desfazer}
          disabled={historico.length === 0}
          className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <Undo2 className="w-5 h-5" />
          Desfazer
        </button>
        <button
          onClick={resetLuta}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <Trophy className="w-5 h-5" />
          Finalizar Luta
        </button>
      </div>

      {/* Histórico */}
      {historico.length > 0 && (
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Histórico de Pontuações</h3>
          <div className="flex flex-wrap gap-2">
            {[...historico].reverse().slice(0, 10).map((item) => (
              <span
                key={item.id}
                className={`
                  px-3 py-1 rounded-full text-sm
                  ${item.tipo === "ponto" ? "bg-[#4338CA] text-white" : ""}
                  ${item.tipo === "vantagem" ? "bg-green-600 text-white" : ""}
                  ${item.tipo === "penalidade" ? "bg-red-600 text-white" : ""}
                `}
              >
                {item.lutador === "atleta1" ? "Athlete 1" : "Athlete 2"}: {item.descricao}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}