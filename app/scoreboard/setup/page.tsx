"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Upload, Plus, AlertCircle, CheckCircle, ArrowRight, MapPin, User } from "lucide-react"

interface Atleta {
  nome: string
  equipe: string
}

interface ChaveLuta {
  categoria?: string
  luta?: {
    atleta1: Atleta
    atleta2: Atleta
  }
}

export default function ScoreboardSetupPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [chaveData, setChaveData] = useState<ChaveLuta | null>(null)
  const [erro, setErro] = useState<string>("")
  const [sucesso, setSucesso] = useState(false)
  const [area, setArea] = useState("")
  const [arbitro, setArbitro] = useState("")

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        
        if (!data.luta || !data.luta.atleta1 || !data.luta.atleta2) {
          throw new Error("JSON inválido: estrutura esperada { luta: { atleta1: {}, atleta2: {} } }")
        }

        setChaveData(data)
        setErro("")
        setSucesso(true)
        
        if (data.categoria) {
          setArea(data.categoria)
        }
      } catch (err) {
        setErro("Erro ao processar JSON: formato inválido. Verifique a estrutura do arquivo.")
        setChaveData(null)
        setSucesso(false)
      }
    }

    reader.readAsText(file)
  }

  const handleIniciarPlacar = () => {
    if (!chaveData) {
      setErro("Por favor, importe um arquivo JSON ou configure manualmente.")
      return
    }

    const params = new URLSearchParams({
      area: area || "Área 1",
      arbitro: arbitro || "Não definido",
      categoria: chaveData.categoria || "",
      atleta1: chaveData.luta?.atleta1?.nome || "",
      equipe1: chaveData.luta?.atleta1?.equipe || "",
      atleta2: chaveData.luta?.atleta2?.nome || "",
      equipe2: chaveData.luta?.atleta2?.equipe || "",
    })

    router.push(`/scoreboard?${params.toString()}`)
  }

  const handleCriarManual = () => {
    const params = new URLSearchParams({
      area: area || "Área 1",
      arbitro: arbitro || "Não definido",
      categoria: "Livre",
      atleta1: "Atleta 1",
      equipe1: "Equipe A",
      atleta2: "Atleta 2",
      equipe2: "Equipe B",
    })

    router.push(`/scoreboard?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link href="/" className="text-[#D4AF37] hover:text-[#f0c844] transition-colors">
          ← Voltar ao Início
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Configurar Placar</h1>
        <p className="text-gray-400 mb-8">Configure os dados da luta antes de iniciar o placar</p>

        {/* Área e Árbitro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <MapPin className="w-4 h-4" />
              Área de Luta
            </label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Ex: Área 1, Quadra A"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-[#4338CA] focus:outline-none"
            />
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <User className="w-4 h-4" />
              Árbitro
            </label>
            <input
              type="text"
              value={arbitro}
              onChange={(e) => setArbitro(e.target.value)}
              placeholder="Nome do árbitro"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-[#4338CA] focus:outline-none"
            />
          </div>
        </div>

        {/* Importar JSON */}
        <div className="bg-white bg-opacity-5 border border-gray-700 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-6 h-6 text-[#4338CA]" />
            <h2 className="text-xl font-bold text-white">Importar Chave de Luta (JSON)</h2>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#4338CA] hover:bg-[#5a47e8] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Selecionar Arquivo JSON
          </button>

          {/* Erro */}
          {erro && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-red-900 bg-opacity-30 border border-red-600 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-sm">{erro}</span>
            </div>
          )}

          {/* Sucesso */}
          {sucesso && chaveData && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-green-900 bg-opacity-30 border border-green-600 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 text-sm">Arquivo importado com sucesso!</span>
            </div>
          )}

          {/* Preview */}
          {chaveData && (
            <div className="mt-4 p-4 bg-gray-700 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Preview dos Dados:</h3>
              {chaveData.categoria && (
                <p className="text-gray-400 text-sm mb-2">
                  <span className="text-[#D4AF37]">Categoria:</span> {chaveData.categoria}
                </p>
              )}
              {chaveData.luta && (
                <div className="space-y-2">
                  <p className="text-white">
                    <span className="text-[#D4AF37]">Atleta 1:</span>{" "}
                    {chaveData.luta.atleta1.nome} ({chaveData.luta.atleta1.equipe})
                  </p>
                  <p className="text-white">
                    <span className="text-[#D4AF37]">Atleta 2:</span>{" "}
                    {chaveData.luta.atleta2.nome} ({chaveData.luta.atleta2.equipe})
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={handleIniciarPlacar}
            disabled={!chaveData}
            className="flex-1 flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#f0c844] disabled:bg-gray-600 disabled:cursor-not-allowed text-black px-6 py-4 rounded-lg font-bold transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            Iniciar Placar
          </button>

          <button
            onClick={handleCriarManual}
            className="flex-1 flex items-center justify-center gap-2 bg-[#4338CA] hover:bg-[#5a47e8] text-white px-6 py-4 rounded-lg font-bold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Criar Luta Manual
          </button>
        </div>
      </div>
    </div>
  )
}