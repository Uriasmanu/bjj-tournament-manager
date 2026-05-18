/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Trophy, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChaveLuta, Luta } from "@/app/types"
import type { AtletaState, LutadorInfo } from "@/app/components/scoreboard/AtletaCard"
import { getDadosIniciais, adicionarNovaLuta, marcarLutaConcluida } from "@/app/hooks/useStorage"
import { generateUUID } from "@/app/lib/uuid"
import { AdicionarLutaModal, NovaLutaData } from "@/app/components/scoreboard/AdicionarLutaModal"
import { ScoreboardTimer } from "@/app/components/Timer"
import { ScoreHeader } from "@/app/components/scoreboard/ScoreHeader"
import { AtletaCard } from "@/app/components/scoreboard/AtletaCard"

function gerarIdUnico(): string {
  return generateUUID()
}

export default function ScoreboardPage() {
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)
  const [area, setArea] = useState("")
  const [chaves, setChaves] = useState<ChaveLuta[]>([])
  const [chaveSelecionada, setChaveSelecionada] = useState<ChaveLuta | null>(null)
  const [lutaSelecionada, setLutaSelecionada] = useState<Luta | null>(null)
  const [chaveId, setChaveId] = useState<string>("")
  const [mostrarModalAdicionar, setMostrarModalAdicionar] = useState(false)

  const carregarDados = useCallback(async () => {
    const dados = await getDadosIniciais()
    setArea(dados.area)
    setChaves(dados.chaves)
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  const handleSelecionarLuta = (chave: ChaveLuta, luta: Luta) => {
    setChaveSelecionada(chave)
    setChaveId(chave.id)
    setLutaSelecionada(luta)
  }

  const handleTrocarChave = async () => {
    await carregarDados()
    setLutaSelecionada(null)
    setChaveSelecionada(null)
    setChaveId("")
  }

  const handleAdicionarNovaLuta = async (data: NovaLutaData) => {
    const novaLuta: Luta = {
      id: gerarIdUnico(),
      round: 1,
      atleta1: { nome: data.nomeAtleta1, equipe: data.equipe1 },
      atleta2: { nome: data.nomeAtleta2, equipe: data.equipe2 },
      resultado: {
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
        status: "pendente",
        montadasAtleta1: 0,
        montadasAtleta2: 0,
        passagensAtleta1: 0,
        passagensAtleta2: 0,
        quedasAtleta1: 0,
        quedasAtleta2: 0
      }
    }

    const chavesAtualizadas = await adicionarNovaLuta(area, chaves, novaLuta)
    setChaves(chavesAtualizadas)
  }

  if (!isHydrated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <div className="text-2xl text-[#D4AF37] font-bold tracking-widest animate-pulse">
          Carregando...
        </div>
      </div>
    )
  }

  if (chaves.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] p-8 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-white mb-4">Nenhuma chave importada</h1>
        <p className="text-gray-400 mb-8">Importe as chaves de luta na tela de setup primeiro.</p>
        <Button onClick={() => router.push("/scoreboard/setup")} className="bg-[#4338CA] hover:bg-[#5a47e8]">
          Ir para Setup
        </Button>
      </div>
    )
  }

  if (!lutaSelecionada || !chaveSelecionada || !chaveId) {
    return (
      <>
        <SeletorLutas
          chaves={chaves}
          onSelecionarLuta={handleSelecionarLuta}
        />
        <AdicionarLutaModal
          isOpen={mostrarModalAdicionar}
          onClose={() => setMostrarModalAdicionar(false)}
          onSubmit={handleAdicionarNovaLuta}
        />
      </>
    )
  }

  return (
    <PlacarCompleto
      area={area}
      chaves={chaves}
      setChaves={setChaves}
      chaveId={chaveId}
      luta={lutaSelecionada}
      onTrocarChave={handleTrocarChave}
    />
  )
}

interface SeletorLutasProps {
  chaves: ChaveLuta[]
  onSelecionarLuta: (chave: ChaveLuta, luta: Luta) => void
}

function SeletorLutas({ chaves, onSelecionarLuta }: SeletorLutasProps) {
  const [mostrarModalAdicionar, setMostrarModalAdicionar] = useState(false)
  const [chavesState, setChavesState] = useState(chaves)

  useEffect(() => {
    getDadosIniciais().then(dados => {
      setChavesState(dados.chaves)
    })
  }, [])

  const handleAdicionarLuta = async (data: NovaLutaData) => {
    const area = (await getDadosIniciais()).area

    const novaLuta: Luta = {
      id: generateUUID(),
      round: 1,
      position: 0,
      atleta1: { id: generateUUID(), nome: data.nomeAtleta1, equipe: data.equipe1 },
      atleta2: { id: generateUUID(), nome: data.nomeAtleta2, equipe: data.equipe2 },
      resultado: {
        id: generateUUID(),
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
        status: "pendente",
        montadasAtleta1: 0,
        montadasAtleta2: 0,
        passagensAtleta1: 0,
        passagensAtleta2: 0,
        quedasAtleta1: 0,
        quedasAtleta2: 0,
        lutaId: null,
        vencedorAtletaId: null,
        perdedorAtletaId: null,
        AtletaDesclassificadoId: null,
      }
    }

    const chavesAtualizadas = await adicionarNovaLuta(area, chavesState, novaLuta)
    setChavesState(chavesAtualizadas)
    setMostrarModalAdicionar(false)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-[#D4AF37] hover:text-[#f0c844] transition-colors mb-6 inline-block">
          ← Voltar
        </Link>

        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold text-white">Selecionar Luta</h1>
          <Button 
            onClick={() => setMostrarModalAdicionar(true)}
            className="bg-[#4338CA] hover:bg-[#5a47e8]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Luta
          </Button>
        </div>
        <p className="text-gray-400 mb-8">Escolha a chave e a luta para iniciar</p>

        <div className="space-y-4">
          {chavesState.map((chave, index) => (
            <div 
              key={index} 
              className="border border-zinc-700 rounded-lg overflow-hidden"
            >
              <div className="bg-zinc-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-white font-bold">{chave.categoria}</span>
                  <span className="text-gray-400 text-sm">({chave.lutas.length} lutas)</span>
                </div>
                <span className="text-gray-400 text-sm">
                  {chave.lutas.filter(l => l.resultado?.status === "concluida").length}/{chave.lutas.length}
                </span>
              </div>

              <div className="divide-y divide-zinc-800">
                {chave.lutas.map((luta, lutaIndex) => {
                  const isConcluida = luta.resultado?.status === "concluida"
                  return (
                    <div
                      key={lutaIndex}
                      className={`flex items-center justify-between px-4 py-3 ${
                        isConcluida ? "bg-green-900/20" : "hover:bg-zinc-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-gray-500 text-sm">Luta {lutaIndex + 1}</span>
                        <span className={`font-medium ${isConcluida ? "text-green-400" : "text-white"}`}>
                          {luta.atleta1?.nome || "BYE"}
                        </span>
                        <span className="text-gray-500">vs</span>
                        <span className={`font-medium ${isConcluida ? "text-green-400" : "text-white"}`}>
                          {luta.atleta2?.nome || "BYE"}
                        </span>
                        {isConcluida && (
                          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                            Concluída
                          </span>
                        )}
                      </div>
                      {!isConcluida && (
                        <button
                          onClick={() => onSelecionarLuta(chave, luta)}
                          className="text-[#D4AF37] text-sm hover:underline"
                        >
                          Iniciar →
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AdicionarLutaModal
        isOpen={mostrarModalAdicionar}
        onClose={() => setMostrarModalAdicionar(false)}
        onSubmit={handleAdicionarLuta}
      />
    </div>
  )
}

interface PlacarCompletoProps {
  area: string
  chaves: ChaveLuta[]
  setChaves: React.Dispatch<React.SetStateAction<ChaveLuta[]>>
  chaveId: string
  luta: Luta
  onTrocarChave: () => void
}

function PlacarCompleto({ 
  area, 
  chaves, 
  setChaves, 
  chaveId, 
  luta, 
  onTrocarChave 
}: PlacarCompletoProps) {
  const [p1, setP1] = useState<AtletaState>({ montada: 0, passagem: 0, queda: 0, vantagem: 0, punicao: 0 })
  const [p2, setP2] = useState<AtletaState>({ montada: 0, passagem: 0, queda: 0, vantagem: 0, punicao: 0 })
  const [arbitro, setArbitro] = useState("")
  const [showConfirmFinalizar, setShowConfirmFinalizar] = useState(false)
  const [etapaConfirmacao, setEtapaConfirmacao] = useState<"vencedor" | "tipo" | null>(null)
  const [vencedorSelecionado, setVencedorSelecionado] = useState<"atleta1" | "atleta2" | null>(null)
  const [showDSQ, setShowDSQ] = useState(false)
  const [atletaDSQ, setAtletaDSQ] = useState<1 | 2 | null>(null)
  const [etapaDSQ, setEtapaDSQ] = useState<"escolher" | "confirmar">("escolher")
  const [tempoDecorrido, setTempoDecorrido] = useState(0)

  const initialState = { montada: 0, passagem: 0, queda: 0, vantagem: 0, punicao: 0 }

  const [lutador1] = useState<LutadorInfo>({
    nome: luta.atleta1?.nome || "",
    faixa: luta.atleta1?.faixa || "Branca",
    equipe: luta.atleta1?.equipe || "",
  })

  const [lutador2] = useState<LutadorInfo>({
    nome: luta.atleta2?.nome || "",
    faixa: luta.atleta2?.faixa || "Branca",
    equipe: luta.atleta2?.equipe || "",
  })

  const handleScoreChange = (player: 1 | 2, category: keyof AtletaState, value: number) => {
    const setState = player === 1 ? setP1 : setP2
    setState((prev) => ({
      ...prev,
      [category]: Math.max(0, prev[category] + value),
    }))
  }

  const resetAll = () => {
    setP1(initialState)
    setP2(initialState)
  }

  const handleDesclassificacao = (atleta: 1 | 2) => {
    setAtletaDSQ(atleta)
    setEtapaDSQ("escolher")
    setShowDSQ(true)
  }

  const handleConfirmarDSQ = () => {
    if (etapaDSQ === "escolher") {
      setEtapaDSQ("confirmar")
    } else {
      handleSalvarDSQ()
    }
  }

  const handleSelecionarAtletaDSQ = (atleta: 1 | 2) => {
    setAtletaDSQ(atleta)
    setEtapaDSQ("confirmar")
  }

  const handleSalvarDSQ = async () => {
    const vencedor = atletaDSQ === 1 ? "atleta2" : "atleta1"
    const pontos1 = p1.montada + p1.passagem + p1.queda
    const pontos2 = p2.montada + p2.passagem + p2.queda
    
    const dadosResultado = {
      pontosAtleta1: pontos1,
      pontosAtleta2: pontos2,
      vantagensAtleta1: p1.vantagem,
      vantagensAtleta2: p2.vantagem,
      penalidadesAtleta1: p1.punicao,
      penalidadesAtleta2: p2.punicao,
      tempoDecorrido,
      finalizacaoAtleta1: false,
      finalizacaoAtleta2: false,
      desclassificacao: atletaDSQ === 1 ? "atleta1" as const : "atleta2" as const,
      tipoVitoria: "desclassificacao" as const,
      vencedor: vencedor as "atleta1" | "atleta2",
      
      montadasAtleta1: p1.montada,
      montadasAtleta2: p2.montada,
      passagensAtleta1: p1.passagem,
      passagensAtleta2: p2.passagem,
      quedasAtleta1: p1.queda,
      quedasAtleta2: p2.queda
    }
    
    const chavesAtualizadas = await marcarLutaConcluida(
      area, 
      chaveId, 
      luta.id, 
      dadosResultado,
      chaves
    )
    setChaves(chavesAtualizadas)
    
    setShowDSQ(false)
    setAtletaDSQ(null)
    setEtapaDSQ("escolher")
    
    onTrocarChave()
  }

  const handleFinalizarClick = () => {
    setShowConfirmFinalizar(true)
    setEtapaConfirmacao("vencedor")
    setVencedorSelecionado(null)
  }

  const handleConfirmarVencedor = (vencedor: "atleta1" | "atleta2") => {
    setVencedorSelecionado(vencedor)
    setEtapaConfirmacao("tipo")
  }

  const handleConfirmarTipo = async (tipo: "pontos" | "finalizacao") => {
    const pontos1 = p1.montada + p1.passagem + p1.queda
    const pontos2 = p2.montada + p2.passagem + p2.queda
    
    const dadosResultado = {
      pontosAtleta1: pontos1,
      pontosAtleta2: pontos2,
      vantagensAtleta1: p1.vantagem,
      vantagensAtleta2: p2.vantagem,
      penalidadesAtleta1: p1.punicao,
      penalidadesAtleta2: p2.punicao,
      tempoDecorrido,
      finalizacaoAtleta1: tipo === "finalizacao" && vencedorSelecionado === "atleta1",
      finalizacaoAtleta2: tipo === "finalizacao" && vencedorSelecionado === "atleta2",
      desclassificacao: null,
      tipoVitoria: tipo,
      vencedor: vencedorSelecionado,
      
      montadasAtleta1: p1.montada,
      montadasAtleta2: p2.montada,
      passagensAtleta1: p1.passagem,
      passagensAtleta2: p2.passagem,
      quedasAtleta1: p1.queda,
      quedasAtleta2: p2.queda
    }
    
    const chavesAtualizadas = await marcarLutaConcluida(
      area, 
      chaveId, 
      luta.id, 
      dadosResultado,
      chaves
    )
    setChaves(chavesAtualizadas)
    
    setShowConfirmFinalizar(false)
    setEtapaConfirmacao(null)
    setVencedorSelecionado(null)
    
    onTrocarChave()
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black relative select-none">
      <ScoreHeader 
        area={area} 
        arbitro={arbitro}
        onArbitroChange={setArbitro}
      />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="bg-black border-4 border-gray-700 p-3 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center min-w-[220px]">
          <ScoreboardTimer onReset={resetAll} onTimeUpdate={setTempoDecorrido} />
        </div>
      </div>

      <AtletaCard
        lutador={lutador1}
        estado={p1}
        onScoreChange={(cat, val) => handleScoreChange(1, cat, val)}
        isLight={false}
        cor="branco"
        onDesclassificacao={() => handleDesclassificacao(1)}
      />

      <div className="border-b-2 border-black" />

      <AtletaCard
        lutador={lutador2}
        estado={p2}
        onScoreChange={(cat, val) => handleScoreChange(2, cat, val)}
        isLight={true}
        cor="branco"
        onDesclassificacao={() => handleDesclassificacao(2)}
      />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-4">
        <button
          onClick={onTrocarChave}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
        >
          Nova Luta
        </button>
        <button
          onClick={handleFinalizarClick}
          className="bg-[#D4AF37] hover:bg-[#f0c844] text-black px-4 py-2 rounded-lg font-bold text-sm transition-colors"
        >
          Finalizar Luta
        </button>
      </div>

      {showDSQ && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            {etapaDSQ === "escolher" ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-4">Desclassificar Atleta</h2>
                <p className="text-gray-400 mb-6">Qual atleta será desclassificado?</p>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleSelecionarAtletaDSQ(1)}
                    className="flex-1 bg-red-700 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-bold"
                  >
                    {lutador1.nome}
                  </button>
                  <button
                    onClick={() => handleSelecionarAtletaDSQ(2)}
                    className="flex-1 bg-red-700 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-bold"
                  >
                    {lutador2.nome}
                  </button>
                </div>
                <button
                  onClick={() => { setShowDSQ(false); setAtletaDSQ(null); setEtapaDSQ("escolher"); }}
                  className="w-full mt-4 text-gray-400 hover:text-white text-sm"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white mb-4">Confirmar Desclassificação</h2>
                <p className="text-gray-400 mb-6">
                  Tem certeza que deseja desclassificar {atletaDSQ === 1 ? lutador1.nome : lutador2.nome}?
                </p>
                <p className="text-yellow-400 mb-6 text-sm">
                  {atletaDSQ === 1 ? lutador2.nome : lutador1.nome} será declarado vencedor.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={handleConfirmarDSQ}
                    className="flex-1 bg-red-700 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-bold"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => { setEtapaDSQ("escolher"); }}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-3 rounded-lg font-bold"
                  >
                    Voltar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showConfirmFinalizar && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            {etapaConfirmacao === "vencedor" ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-4">Quem venceu?</h2>
                <p className="text-gray-400 mb-6">
                  {lutador1.nome} vs {lutador2.nome}
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleConfirmarVencedor("atleta1")}
                    className="flex-1 bg-blue-700 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-bold"
                  >
                    {lutador1.nome}
                  </button>
                  <button
                    onClick={() => handleConfirmarVencedor("atleta2")}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-3 rounded-lg font-bold"
                  >
                    {lutador2.nome}
                  </button>
                </div>
                <button
                  onClick={() => { setShowConfirmFinalizar(false); setEtapaConfirmacao(null); }}
                  className="w-full mt-4 text-gray-400 hover:text-white text-sm"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white mb-4">Tipo de vitória?</h2>
                <p className="text-gray-400 mb-2">
                  {vencedorSelecionado === "atleta1" ? lutador1.nome : lutador2.nome} venceu
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleConfirmarTipo("pontos")}
                    className="flex-1 bg-[#D4AF37] hover:bg-[#f0c844] text-black px-4 py-3 rounded-lg font-bold"
                  >
                    Pontos
                  </button>
                  <button
                    onClick={() => handleConfirmarTipo("finalizacao")}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-lg font-bold"
                  >
                    Finalização
                  </button>
                </div>
                <button
                  onClick={() => { setShowConfirmFinalizar(false); setEtapaConfirmacao(null); }}
                  className="w-full mt-4 text-gray-400 hover:text-white text-sm"
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}