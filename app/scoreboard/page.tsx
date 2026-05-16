"use client"

import { Suspense, useState, useCallback, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { ScoreboardTimer } from "@/app/components/Timer"
import { ScoreHeader } from "@/app/components/scoreboard/ScoreHeader"
import { AtletaCard, AtletaState, LutadorInfo } from "@/app/components/scoreboard/AtletaCard"
import { CheckCircle } from "lucide-react"

const FAIXAS = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]

function ScoreboardContent() {
  const searchParams = useSearchParams()

  const area = searchParams.get("area") || "Área 1"
  const arbitro = searchParams.get("arbitro") || "Não definido"

  const initialState = useMemo(() => ({
    montada: 0,
    passagem: 0,
    queda: 0,
    vantagem: 0,
    punicao: 0,
  }), [])

  const [lutador1, setLutador1] = useState<LutadorInfo>({
    nome: searchParams.get("atleta1") || "Atleta 1",
    faixa: searchParams.get("faixa1") || "Branca",
    equipe: searchParams.get("equipe1") || "Equipe A",
  })

  const [lutador2, setLutador2] = useState<LutadorInfo>({
    nome: searchParams.get("atleta2") || "Atleta 2",
    faixa: searchParams.get("faixa2") || "Branca",
    equipe: searchParams.get("equipe2") || "Equipe B",
  })

  const [isEditing, setIsEditing] = useState(false)
  const [showConfirmFinalizar, setShowConfirmFinalizar] = useState(false)

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

  const handleFinalizar = () => {
    const p1Total = p1.montada + p1.passagem + p1.queda
    const p2Total = p2.montada + p2.passagem + p2.queda

    const resultado = {
      data: new Date().toISOString(),
      area,
      arbitro,
      categoria: searchParams.get("categoria") || "",
      resultado: {
        atleta1: {
          nome: lutador1.nome,
          faixa: lutador1.faixa,
          equipe: lutador1.equipe,
          pontos: {
            montada: p1.montada,
            passagem: p1.passagem,
            queda: p1.queda,
          },
          vantagem: p1.vantagem,
          penalidade: p1.punicao,
          total: p1Total,
        },
        atleta2: {
          nome: lutador2.nome,
          faixa: lutador2.faixa,
          equipe: lutador2.equipe,
          pontos: {
            montada: p2.montada,
            passagem: p2.passagem,
            queda: p2.queda,
          },
          vantagem: p2.vantagem,
          penalidade: p2.punicao,
          total: p2Total,
        },
      },
      vencedor: p1Total > p2Total ? lutador1.nome : p2Total > p1Total ? lutador2.nome : "Empate",
    }

    const json = JSON.stringify(resultado, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `luta-${lutador1.nome}-vs-${lutador2.nome}-${Date.now()}.json`
    a.click()

    URL.revokeObjectURL(url)
    setShowConfirmFinalizar(false)
  }

  const toggleEdicao = () => {
    setIsEditing(!isEditing)
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black relative select-none">
      <ScoreHeader area={area} arbitro={arbitro} />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="bg-black border-4 border-gray-700 p-3 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center min-w-[220px]">
          <ScoreboardTimer onReset={resetAll} />
        </div>
      </div>

      <AtletaCard
        lutador={lutador1}
        estado={p1}
        onScoreChange={(cat, val) => handleScoreChange(1, cat, val)}
        isLight={false}
      />

      <div className="border-b-2 border-black" />

      <AtletaCard
        lutador={lutador2}
        estado={p2}
        onScoreChange={(cat, val) => handleScoreChange(2, cat, val)}
        isLight={true}
      />

      {/* Botão Finalizar e Editar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-4">
        <button
          onClick={toggleEdicao}
          className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
        >
          {isEditing ? "Fechar Edição" : "Editar Lutadores"}
        </button>
        <button
          onClick={() => setShowConfirmFinalizar(true)}
          className="bg-[#D4AF37] hover:bg-[#f0c844] text-black px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Finalizar Luta
        </button>
      </div>

      {/* Modal de Edição de Lutadores */}
      {isEditing && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Editar Lutadores</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Atleta 1 */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-blue-400">Atleta 1 (Azul)</h3>
                <div>
                  <label className="text-gray-400 text-sm">Nome</label>
                  <input
                    type="text"
                    value={lutador1.nome}
                    onChange={(e) => setLutador1({ ...lutador1, nome: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Faixa</label>
                  <select
                    value={lutador1.faixa}
                    onChange={(e) => setLutador1({ ...lutador1, faixa: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600"
                  >
                    {FAIXAS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Equipe</label>
                  <input
                    type="text"
                    value={lutador1.equipe}
                    onChange={(e) => setLutador1({ ...lutador1, equipe: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600"
                  />
                </div>
              </div>

              {/* Atleta 2 */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-200">Atleta 2 (Branco)</h3>
                <div>
                  <label className="text-gray-400 text-sm">Nome</label>
                  <input
                    type="text"
                    value={lutador2.nome}
                    onChange={(e) => setLutador2({ ...lutador2, nome: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Faixa</label>
                  <select
                    value={lutador2.faixa}
                    onChange={(e) => setLutador2({ ...lutador2, faixa: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600"
                  >
                    {FAIXAS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Equipe</label>
                  <input
                    type="text"
                    value={lutador2.equipe}
                    onChange={(e) => setLutador2({ ...lutador2, equipe: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={toggleEdicao}
                className="bg-[#4338CA] hover:bg-[#5a47e8] text-white px-6 py-2 rounded-lg font-bold"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      {showConfirmFinalizar && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">Finalizar Luta?</h2>
            <p className="text-gray-400 mb-6">
              Ao finalizar, o resultado será baixado automaticamente em formato JSON.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowConfirmFinalizar(false)}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleFinalizar}
                className="bg-[#D4AF37] hover:bg-[#f0c844] text-black px-4 py-2 rounded-lg font-bold"
              >
                Confirmar e Baixar
              </button>
            </div>
          </div>
        </div>
      )}
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