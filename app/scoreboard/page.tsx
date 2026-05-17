"use client"

import { Suspense, useState, useCallback, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { ScoreboardTimer } from "@/app/components/Timer"
import { ScoreHeader } from "@/app/components/scoreboard/ScoreHeader"
import { AtletaCard, AtletaState, LutadorInfo } from "@/app/components/scoreboard/AtletaCard"
import { SeletorLuta } from "@/app/components/scoreboard/SeletorLuta"
import { CheckCircle } from "lucide-react"
import { ChaveLuta, Atleta, ResultadoLuta } from "@/app/types"

const FAIXAS = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]

const resultadoPendente: ResultadoLuta = {
  pontosAtleta1: 0,
  pontosAtleta2: 0,
  vantagensAtleta1: 0,
  vantagensAtleta2: 0,
  penalidadesAtleta1: 0,
  penalidadesAtleta2: 0,
  tempoDecorrido: 0,
  finalizacaoAtleta1: false,
  finalizacaoAtleta2: false,
  desclassificacao: null,
  vencedor: null,
  tipoVitoria: "pontos",
  status: "pendente"
}

// Chaves de exemplo (mockadas - será substituído pelos dados reais)
const CHAVES_EXEMPLO: ChaveLuta[] = [
  {
    categoria: "Branca Infantil",
    status: "pendente",
    lutas: [
      { id: 1, round: 1, atleta1: { nome: "Lucas", equipe: "Team Brasil" }, atleta2: { nome: "Caio", equipe: "Team SP" }, resultado: resultadoPendente },
      { id: 2, round: 1, atleta1: { nome: "Pedro", equipe: "Team Brasil" }, atleta2: { nome: "João", equipe: "Team RJ" }, resultado: resultadoPendente },
      { id: 3, round: 2, atleta1: { nome: "Lucas", equipe: "Team Brasil" }, atleta2: { nome: "Pedro", equipe: "Team Brasil" }, resultado: resultadoPendente },
    ]
  },
  {
    categoria: "Azul Adulto",
    status: "pendente",
    lutas: [
      { id: 1, round: 1, atleta1: { nome: "Carlos", equipe: "Team SP" }, atleta2: { nome: "André", equipe: "Team Brasil" }, resultado: resultadoPendente },
    ]
  }
]

function ScoreboardContent() {
  const searchParams = useSearchParams()

  const area = searchParams.get("area") || "Área 1"
  const arbitro = searchParams.get("arbitro") || "Não definido"
  const categoria = searchParams.get("categoria") || ""

  // Estado para controlar modo de seleção vs modo de luta
  const [modoSelecao, setModoSelecao] = useState(!categoria)
  const [chaves] = useState<ChaveLuta[]>(CHAVES_EXEMPLO)

  const initialState = useMemo(() => ({
    montada: 0,
    passagem: 0,
    queda: 0,
    vantagem: 0,
    punicao: 0,
  }), [])

  const [lutador1, setLutador1] = useState<LutadorInfo>({
    nome: searchParams.get("atleta1") || "",
    faixa: searchParams.get("faixa1") || "Branca",
    equipe: searchParams.get("equipe1") || "",
  })

  const [lutador2, setLutador2] = useState<LutadorInfo>({
    nome: searchParams.get("atleta2") || "",
    faixa: searchParams.get("faixa2") || "Branca",
    equipe: searchParams.get("equipe2") || "",
  })

  const [p1, setP1] = useState<AtletaState>(initialState)
  const [p2, setP2] = useState<AtletaState>(initialState)

  const [isEditing, setIsEditing] = useState(false)
  const [showConfirmFinalizar, setShowConfirmFinalizar] = useState(false)

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

  // Função chamada quando usuário seleciona luta no seletor
  const handleSelecionarLuta = (categoriaSelecionada: string, atleta1: Atleta, atleta2: Atleta) => {
    setLutador1({
      nome: atleta1.nome,
      faixa: atleta1.faixa || "Branca",
      equipe: atleta1.equipe,
    })
    setLutador2({
      nome: atleta2.nome,
      faixa: atleta2.faixa || "Branca",
      equipe: atleta2.equipe,
    })
    setP1(initialState)
    setP2(initialState)
    setModoSelecao(false)
  }

  const handleFinalizar = () => {
    const p1Total = p1.montada + p1.passagem + p1.queda
    const p2Total = p2.montada + p2.passagem + p2.queda

    const resultado = {
      data: new Date().toISOString(),
      area,
      arbitro,
      categoria,
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

  // Se está em modo de seleção, mostrar o seletor
  if (modoSelecao) {
    return (
      <SeletorLuta
        chaves={chaves}
        onIniciar={handleSelecionarLuta}
      />
    )
  }

  // Se não tem luta selecionada, mostrar opções
  if (!lutador1.nome || !lutador2.nome) {
    return (
      <SeletorLuta
        chaves={chaves}
        onIniciar={handleSelecionarLuta}
      />
    )
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

      {/* Botões de ação */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-4">
        <button
          onClick={() => setModoSelecao(true)}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
        >
          Nova Luta
        </button>
        <button
          onClick={toggleEdicao}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
        >
          {isEditing ? "Fechar" : "Editar"}
        </button>
        <button
          onClick={() => setShowConfirmFinalizar(true)}
          className="bg-[#D4AF37] hover:bg-[#f0c844] text-black px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Finalizar
        </button>
      </div>

      {/* Modal de Edição de Lutadores */}
      {isEditing && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Editar Lutadores</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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