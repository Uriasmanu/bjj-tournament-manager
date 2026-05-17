/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Trophy, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChaveLuta, Luta } from "@/app/types"
import type { AtletaState, LutadorInfo } from "@/app/components/scoreboard/AtletaCard"
import { getDadosIniciais, adicionarNovaLuta, marcarLutaConcluida } from "@/app/hooks/useStorage"
import { AdicionarLutaModal, NovaLutaData } from "@/app/components/scoreboard/AdicionarLutaModal"
import { ScoreboardTimer } from "@/app/components/Timer"
import { ScoreHeader } from "@/app/components/scoreboard/ScoreHeader"
import { AtletaCard } from "@/app/components/scoreboard/AtletaCard"
import { CheckCircle } from "lucide-react"

function gerarIdUnico(): number {
  return Date.now() + Math.floor(Math.random() * 1000)
}

export default function ScoreboardPage() {
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)
  const [area, setArea] = useState("")
  const [chaves, setChaves] = useState<ChaveLuta[]>([])
  const [chaveSelecionada, setChaveSelecionada] = useState<ChaveLuta | null>(null)
  const [lutaSelecionada, setLutaSelecionada] = useState<Luta | null>(null)
  const [chaveIndex, setChaveIndex] = useState<number>(-1)
  const [mostrarModalAdicionar, setMostrarModalAdicionar] = useState(false)

  useEffect(() => {
    const dados = getDadosIniciais()
    setArea(dados.area)
    setChaves(dados.chaves)
    setIsHydrated(true)
  }, [])

  const handleSelecionarLuta = (chave: ChaveLuta, chaveIdx: number, luta: Luta) => {
    setChaveSelecionada(chave)
    setChaveIndex(chaveIdx)
    setLutaSelecionada(luta)
  }

  const handleTrocarChave = () => {
    setLutaSelecionada(null)
    setChaveSelecionada(null)
    setChaveIndex(-1)
  }

  const handleVoltar = () => {
    setLutaSelecionada(null)
    setChaveSelecionada(null)
    setChaveIndex(-1)
  }

  const handleAdicionarNovaLuta = (data: NovaLutaData) => {
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
        status: "pendente"
      }
    }

    const chavesAtualizadas = adicionarNovaLuta(area, chaves, novaLuta)
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

  if (!lutaSelecionada || !chaveSelecionada || chaveIndex < 0) {
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
      chave={chaveSelecionada}
      chaveIndex={chaveIndex}
      luta={lutaSelecionada}
      onTrocarChave={handleTrocarChave}
      onVoltar={handleVoltar}
    />
  )
}

interface SeletorLutasProps {
  chaves: ChaveLuta[]
  onSelecionarLuta: (chave: ChaveLuta, chaveIdx: number, luta: Luta) => void
}

function SeletorLutas({ chaves, onSelecionarLuta }: SeletorLutasProps) {
  const [mostrarModalAdicionar, setMostrarModalAdicionar] = useState(false)
  const [chavesState, setChavesState] = useState(chaves)

  useEffect(() => {
    const dados = getDadosIniciais()
    setChavesState(dados.chaves)
  }, [])

  const handleAdicionarLuta = (data: NovaLutaData) => {
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
        status: "pendente"
      }
    }

    const area = getDadosIniciais().area
    const chavesAtualizadas = adicionarNovaLuta(area, chavesState, novaLuta)
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
                {chave.lutas
                  .filter(luta => luta.resultado?.status !== "concluida")
                  .map((luta, lutaIndex) => (
                    <button
                      key={lutaIndex}
                      onClick={() => onSelecionarLuta(chave, index, luta)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-800/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-gray-500 text-sm">Luta {lutaIndex + 1}</span>
                        <span className="text-white font-medium">{luta.atleta1.nome}</span>
                        <span className="text-gray-500">vs</span>
                        <span className="text-white font-medium">{luta.atleta2.nome}</span>
                      </div>
                      <span className="text-[#D4AF37] text-sm">Iniciar →</span>
                    </button>
                  ))}
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
  chave: ChaveLuta
  chaveIndex: number
  luta: Luta
  onTrocarChave: () => void
  onVoltar: () => void
}

function PlacarCompleto({ 
  area, 
  chaves, 
  setChaves, 
  chave, 
  chaveIndex, 
  luta, 
  onTrocarChave, 
  onVoltar 
}: PlacarCompletoProps) {
  const initialState = useMemo(() => ({
    montada: 0,
    passagem: 0,
    queda: 0,
    vantagem: 0,
    punicao: 0,
  }), [])

  const [lutador1] = useState<LutadorInfo>({
    nome: luta.atleta1.nome,
    faixa: "Branca",
    equipe: luta.atleta1.equipe,
  })

  const [lutador2] = useState<LutadorInfo>({
    nome: luta.atleta2.nome,
    faixa: "Branca",
    equipe: luta.atleta2.equipe,
  })

  const [p1, setP1] = useState<AtletaState>(initialState)
  const [p2, setP2] = useState<AtletaState>(initialState)
  const [tipoVitoria, setTipoVitoria] = useState<"pontos" | "finalizacao" | "desclassificacao" | null>(null)
  const [showConfirmFinalizar, setShowConfirmFinalizar] = useState(false)

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
    setTipoVitoria(null)
  }

  const handleFinalizacao = (atleta: 1 | 2) => {
    setTipoVitoria("finalizacao")
    setShowConfirmFinalizar(true)
  }

  const handleDesclassificacao = (atleta: 1 | 2) => {
    setTipoVitoria("desclassificacao")
    setShowConfirmFinalizar(true)
  }

  const handleFinalizar = () => {
    let vencedor = ""
    
    if (tipoVitoria === "finalizacao") {
      // Se foi por finalização, quem finalizou vence
      // Precisamos saber qual atleta - por enquanto, vamos perguntar
      vencedor = "finalizacao"
    } else if (tipoVitoria === "desclassificacao") {
      // Se foi por desclassificação, o outro vence
      // Precisamos saber qual atleta - por enquanto, vamos perguntar
      vencedor = "desclassificacao"
    } else {
      // Por pontos
      const p1Total = p1.montada + p1.passagem + p1.queda
      const p2Total = p2.montada + p2.passagem + p2.queda
      
      if (p1Total > p2Total) {
        vencedor = "atleta1"
      } else if (p2Total > p1Total) {
        vencedor = "atleta2"
      } else {
        // Verificar vantagens
        if (p1.vantagem > p2.vantagem) {
          vencedor = "atleta1"
        } else if (p2.vantagem > p1.vantagem) {
          vencedor = "atleta2"
        } else {
          vencedor = "empate"
        }
      }
    }

    // Salvar no localStorage
    const chavesAtualizadas = marcarLutaConcluida(area, chaveIndex, luta.id, vencedor, chaves)
    setChaves(chavesAtualizadas)

    // Baixar JSON do resultado
    const p1Total = p1.montada + p1.passagem + p1.queda
    const p2Total = p2.montada + p2.passagem + p2.queda

    const resultado = {
      area,
      categoria: chave.categoria,
      lutaId: luta.id,
      data: new Date().toISOString(),
      tipoVitoria: tipoVitoria || "pontos",
      lutadores: {
        atleta1: { nome: lutador1.nome, equipe: lutador1.equipe },
        atleta2: { nome: lutador2.nome, equipe: lutador2.equipe }
      },
      pontuacao: {
        atleta1: { montada: p1.montada, passagem: p1.passagem, queda: p1.queda, vantagens: p1.vantagem, penalidades: p1.punicao, total: p1Total },
        atleta2: { montada: p2.montada, passagem: p2.passagem, queda: p2.queda, vantagens: p2.vantagem, penalidades: p2.punicao, total: p2Total }
      },
      vencedor: p1Total > p2Total ? lutador1.nome : p2Total > p1Total ? lutador2.nome : "Empate"
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
    setTipoVitoria(null)
    
    // Voltar para seleção
    onTrocarChave()
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black relative select-none">
      <ScoreHeader area={area} arbitro="Árbitr" />

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
        cor="azul"
        onFinalizacao={() => handleFinalizacao(1)}
        onDesclassificacao={() => handleDesclassificacao(1)}
      />

      <div className="border-b-2 border-black" />

      <AtletaCard
        lutador={lutador2}
        estado={p2}
        onScoreChange={(cat, val) => handleScoreChange(2, cat, val)}
        isLight={true}
        cor="branco"
        onFinalizacao={() => handleFinalizacao(2)}
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
          onClick={() => setShowConfirmFinalizar(true)}
          className="bg-[#D4AF37] hover:bg-[#f0c844] text-black px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Finalizar
        </button>
      </div>

      {showConfirmFinalizar && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">Finalizar Luta?</h2>
            <p className="text-gray-400 mb-2">
              {lutador1.nome} vs {lutador2.nome}
            </p>
            {tipoVitoria && (
              <p className="text-yellow-400 mb-4 text-sm">
                Tipo de vitória: {tipoVitoria === "finalizacao" ? "Finalização" : "Desclassificação"}
              </p>
            )}
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => { setShowConfirmFinalizar(false); setTipoVitoria(null); }}
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