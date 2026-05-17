/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { ChaveLuta, Luta } from "@/app/types"

import { 
  ToastProvider,
  AreaCard,
  ImportacaoCard,
  ResultadoImportacaoCard,
  ChaveList,
  ActionButtons
} from "@/app/components/setup"

import { 
  getDadosIniciais, 
  salvarDados, 
  limparDados 
} from "@/app/hooks/useStorage"
import { useImportacao } from "@/app/hooks/useImportacao"

interface ToastState {
  tipo: "sucesso" | "erro"
  mensagem: string
}

function gerarIdUnico(): number {
  return Date.now() + Math.floor(Math.random() * 1000)
}

export default function ScoreboardSetupPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [area, setArea] = useState("")
  const [chaves, setChaves] = useState<ChaveLuta[]>([])
  const [toast, setToast] = useState<ToastState | null>(null)
  const [areaDefinida, setAreaDefinida] = useState(false)
  const [criadoEm, setCriadoEm] = useState<string | undefined>(undefined)
  const [isHydrated, setIsHydrated] = useState(false)

  const { resultados, isLoading: isImportando, importarArquivos, limparResultados } = useImportacao()

  useEffect(() => {
    const dados = getDadosIniciais()
    setArea(dados.area)
    setChaves(dados.chaves)
    setAreaDefinida(dados.areaDefinida)
    setCriadoEm(dados.areaDefinida ? new Date().toISOString() : undefined)
    setIsHydrated(true)
  }, [])

  const showToast = (tipo: "sucesso" | "erro", mensagem: string) => {
    setToast({ tipo, mensagem })
    setTimeout(() => setToast(null), 3000)
  }

  const handleDefinirArea = () => {
    if (!area.trim()) {
      showToast("erro", "Por favor, defina o nome da área.")
      return
    }
    const agora = new Date().toISOString()
    setCriadoEm(agora)
    setAreaDefinida(true)
    salvarDados(area, chaves, agora)
    showToast("sucesso", "Área definida com sucesso!")
  }

  const handleProximo = () => {
    if (chaves.length === 0) {
      showToast("erro", "Importe pelo menos uma chave de luta.")
      return
    }
    salvarDados(area, chaves, criadoEm)
    router.push("/scoreboard")
  }

  const handleSelecionarArquivos = () => {
    fileInputRef.current?.click()
  }

  const handleImportar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const chavesImportadas = await importarArquivos(event.target.files)
    
    if (chavesImportadas.length > 0) {
      const novasChaves = [...chaves, ...chavesImportadas]
      setChaves(novasChaves)
      salvarDados(area, novasChaves, criadoEm)
    }

    event.target.value = ""
  }

  const handleAtualizarArbitroChave = (chaveIndex: number, nomeArbitro: string) => {
    const novasChaves = [...chaves]
    // @ts-expect-error --arbitro exists in type
    novasChaves[chaveIndex].arbitr = nomeArbitro
    setChaves(novasChaves)
    salvarDados(area, novasChaves, criadoEm)
  }

  const handleExcluirChave = (chaveIndex: number) => {
    if (confirm("Tem certeza que deseja excluir esta chave?")) {
      const novasChaves = chaves.filter((_, index) => index !== chaveIndex)
      setChaves(novasChaves)
      salvarDados(area, novasChaves, criadoEm)
      showToast("sucesso", "Chave excluída com sucesso!")
    }
  }

  const handleCriarLutaManual = () => {
    const nomeAtleta1 = prompt("Nome do Atleta 1:")
    if (!nomeAtleta1?.trim()) return

    const nomeAtleta2 = prompt("Nome do Atleta 2:")
    if (!nomeAtleta2?.trim()) return

    const nomeEquipe1 = prompt("Equipe do Atleta 1 (opcional):") || ""
    const nomeEquipe2 = prompt("Equipe do Atleta 2 (opcional):") || ""

    const novaLuta: Luta = {
      id: gerarIdUnico(),
      round: 1,
      atleta1: { nome: nomeAtleta1.trim(), equipe: nomeEquipe1.trim() },
      atleta2: { nome: nomeAtleta2.trim(), equipe: nomeEquipe2.trim() },
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

    const novaChave: ChaveLuta = {
      categoria: "Luta Manual",
      lutas: [novaLuta],
      status: "pendente"
    }

    const novasChaves = [...chaves, novaChave]
    setChaves(novasChaves)
    salvarDados(area, novasChaves, criadoEm)
    showToast("sucesso", "Luta manual criada com sucesso!")
  }

  const handleLimparDados = () => {
    if (confirm("Tem certeza que deseja limpar todos os dados?")) {
      limparDados()
      setArea("")
      setChaves([])
      setAreaDefinida(false)
      setCriadoEm(undefined)
      limparResultados()
      showToast("sucesso", "Dados limpos com sucesso!")
    }
  }

  if (!isHydrated) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Cabecalho onLimpar={handleLimparDados} />
        
        <h1 className="text-4xl font-bold text-white">Setup de Área</h1>
        <p className="text-gray-400">Configure a área e importe as chaves de luta</p>

        <ToastProvider toast={toast} />

        <AreaCard
          area={area}
          definido={areaDefinida}
          onChangeArea={setArea}
          onDefinirArea={handleDefinirArea}
        />

        {areaDefinida && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              multiple
              onChange={handleImportar}
              className="hidden"
            />

            <ImportacaoCard
              isLoading={isImportando}
              onSelecionarArquivos={handleSelecionarArquivos}
            />

            <ResultadoImportacaoCard
              resultados={resultados}
              onLimpar={limparResultados}
            />

            <ChaveList
              chaves={chaves}
              onAtualizarArbitroChave={handleAtualizarArbitroChave}
              onExcluirChave={handleExcluirChave}
            />

            <ActionButtons
              temChaves={chaves.length > 0}
              onProximo={handleProximo}
              onCriarManual={handleCriarLutaManual}
            />
          </>
        )}
      </div>
    </div>
  )
}

function Cabecalho({ onLimpar }: { onLimpar: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <Link 
        href="/" 
        className="text-[#D4AF37] hover:text-[#f0c844] transition-colors"
      >
        ← Voltar ao Início
      </Link>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onLimpar} 
        className="text-red-400 hover:text-red-300"
      >
        Limpar Dados
      </Button>
    </div>
  )
}