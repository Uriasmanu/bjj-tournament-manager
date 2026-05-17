"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Upload, Plus, MapPin, Save, Download, Trophy, Play, CheckCircle, XCircle } from "lucide-react"
import { ChaveLuta, Luta, DadosArea } from "@/app/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const STORAGE_KEY = "bjj_tournament_area"

interface ChaveImportada {
  categoria: string
  lutas: Array<{
    id?: number
    round?: number
    atleta1?: { nome?: string; equipe?: string }
    atleta2?: { nome?: string; equipe?: string }
  }>
}

function gerarIdUnico(): number {
  return Date.now() + Math.floor(Math.random() * 1000)
}

const dadosIniciais = (typeof window !== "undefined") 
  ? (() => {
      const dadosSalvos = localStorage.getItem(STORAGE_KEY)
      if (dadosSalvos) {
        try {
          const dados: DadosArea = JSON.parse(dadosSalvos)
          return { area: dados.area || "", chaves: dados.chaves || [], areaDefinida: !!dados.area }
        } catch { return { area: "", chaves: [], areaDefinida: false } }
      }
      return { area: "", chaves: [], areaDefinida: false }
    })()
  : { area: "", chaves: [], areaDefinida: false }

interface ToastProps {
  tipo: "sucesso" | "erro"
  mensagem: string
}

function Toast({ tipo, mensagem }: ToastProps) {
  if (tipo === "sucesso") {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-400 text-sm">
        <CheckCircle className="w-4 h-4" />
        {mensagem}
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
      <XCircle className="w-4 h-4" />
      {mensagem}
    </div>
  )
}

export default function ScoreboardSetupPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [area, setArea] = useState(dadosIniciais.area)
  const [chaves, setChaves] = useState<ChaveLuta[]>(dadosIniciais.chaves)
  const [toast, setToast] = useState<ToastProps | null>(null)
  const [areaJaDefinida, setAreaJaDefinida] = useState(dadosIniciais.areaDefinida)
  const [loadingImport, setLoadingImport] = useState(false)

  const showToast = (tipo: "sucesso" | "erro", mensagem: string) => {
    setToast({ tipo, mensagem })
    setTimeout(() => setToast(null), 3000)
  }

  const salvarDados = (novaArea: string, novasChaves: ChaveLuta[]) => {
    const dados: DadosArea = {
      area: novaArea,
      criadoEm: areaJaDefinida ? (JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}').criadoEm || new Date().toISOString()) : new Date().toISOString(),
      chaves: novasChaves
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados))
  }

  const handleSalvarArea = () => {
    if (!area.trim()) {
      showToast("erro", "Por favor, defina o nome da área.")
      return
    }
    setAreaJaDefinida(true)
    salvarDados(area, chaves)
    showToast("sucesso", "Área definida com sucesso!")
  }

  const handleProximo = () => {
    if (chaves.length === 0) {
      showToast("erro", "Importe pelo menos uma chave de luta.")
      return
    }
    salvarDados(area, chaves)
    router.push("/scoreboard")
  }

  const handleImportarChaves = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setLoadingImport(true)
    const chavesImportadas: ChaveLuta[] = []
    let arquivosProcessados = 0

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string) as ChaveImportada
          
          if (!data.categoria || !Array.isArray(data.lutas)) {
            throw new Error("Deve ter 'categoria' e 'lutas'")
          }

          const lutasComId: Luta[] = data.lutas.map((luta, index) => ({
            id: luta.id || gerarIdUnico() + index,
            round: luta.round || 1,
            atleta1: { nome: luta.atleta1?.nome || "", equipe: luta.atleta1?.equipe || "" },
            atleta2: { nome: luta.atleta2?.nome || "", equipe: luta.atleta2?.equipe || "" },
            resultado: {
              pontosAtleta1: 0, pontosAtleta2: 0,
              vantagensAtleta1: 0, vantagensAtleta2: 0,
              penalidadesAtleta1: 0, penalidadesAtleta2: 0,
              tempoDecorrido: 0,
              finalizacaoAtleta1: false, finalizacaoAtleta2: false,
              desclassificacao: null, vencedor: null,
              tipoVitoria: "pontos", status: "pendente"
            }
          }))

          chavesImportadas.push({
            categoria: data.categoria,
            lutas: lutasComId,
            status: "pendente"
          })

        } catch {
          showToast("erro", `Erro ao processar ${file.name}`)
        }

        arquivosProcessados++
        if (arquivosProcessados === files.length) {
          if (chavesImportadas.length > 0) {
            const novasChaves = [...chaves, ...chavesImportadas]
            setChaves(novasChaves)
            salvarDados(area, novasChaves)
            showToast("sucesso", `${chavesImportadas.length} chave(s) importada(s) com sucesso!`)
          }
          setLoadingImport(false)
        }
      }

      reader.readAsText(file)
    })

    event.target.value = ""
  }

  const handleAtualizarArbitro = (chaveIndex: number, lutaId: number, nomeArbitro: string) => {
    const novasChaves = [...chaves]
    const luta = novasChaves[chaveIndex].lutas.find(l => l.id === lutaId)
    if (luta) {
      // @ts-expect-error --arbitro is defined in type but TS not detecting it
      luta.arbitro = nomeArterior
    }
    setChaves(novasChaves)
    salvarDados(area, novasChaves)
  }

  const handleIniciarLuta = (chaveIndex: number, lutaId: number) => {
    const chave = chaves[chaveIndex]
    const luta = chave.lutas.find(l => l.id === lutaId)
    if (!luta) return

    const novasChaves = [...chaves]
    novasChaves[chaveIndex].status = "em_andamento"
    setChaves(novasChaves)
    salvarDados(area, novasChaves)

    const params = new URLSearchParams({
      area, categoria: chave.categoria, lutaId: lutaId.toString(),
      atleta1: luta.atleta1.nome, equipe1: luta.atleta1.equipe,
      atleta2: luta.atleta2.nome, equipe2: luta.atleta2.equipe,
      arbitro: luta.arbitro || "",
    })

    router.push(`/scoreboard?${params.toString()}`)
  }

  const handleExportarArea = () => {
    const dadosExport = {
      area, exportadoEm: new Date().toISOString(),
      totalChaves: chaves.length,
      totalLutas: chaves.reduce((acc, c) => acc + c.lutas.length, 0),
      lutasConcluidas: chaves.reduce((acc, c) => acc + c.lutas.filter(l => l.resultado?.status === "concluida").length, 0),
      chaves
    }

    const json = JSON.stringify(dadosExport, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `area-${area.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast("sucesso", "Área exportada com sucesso!")
  }

  const handleLimparDados = () => {
    if (confirm("Tem certeza que deseja limpar todos os dados?")) {
      localStorage.removeItem(STORAGE_KEY)
      setArea("")
      setChaves([])
      setAreaJaDefinida(false)
      showToast("sucesso", "Dados limpos com sucesso!")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "concluida": return <Badge className="bg-green-600">Concluída</Badge>
      case "em_andamento": return <Badge className="bg-yellow-600">Em Andamento</Badge>
      default: return <Badge variant="secondary">Pendente</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-[#D4AF37] hover:text-[#f0c844] transition-colors">
            ← Voltar ao Início
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLimparDados} className="text-red-400 hover:text-red-300">
            Limpar Dados
          </Button>
        </div>

        <h1 className="text-4xl font-bold text-white">Setup de Área</h1>
        <p className="text-gray-400">Configure a área e importe as chaves de luta</p>

        {toast && <Toast tipo={toast.tipo} mensagem={toast.mensagem} />}

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center gap-3">
            <MapPin className="w-6 h-6 text-[#D4AF37]" />
            <div>
              <CardTitle className="text-white">Área de Luta</CardTitle>
              <CardDescription className="text-gray-400">Defina o nome da área uma única vez</CardDescription>
            </div>
            {areaJaDefinida && <Badge className="ml-auto bg-green-600">Definida</Badge>}
          </CardHeader>
          <CardContent>
            {!areaJaDefinida ? (
              <div className="flex gap-4">
                <Input
                  placeholder="Ex: Área 1, Quadra A"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="flex-1 bg-zinc-800 border-zinc-700 text-white"
                />
                <Button onClick={handleSalvarArea} className="bg-[#4338CA] hover:bg-[#5a47e8]">
                  <Save className="w-4 h-4 mr-2" />
                  Definir Área
                </Button>
              </div>
            ) : (
              <div className="text-white text-lg">
                <span className="text-[#D4AF37] font-bold">{area}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {areaJaDefinida && (
          <>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center gap-3">
                <Upload className="w-6 h-6 text-[#4338CA]" />
                <div>
                  <CardTitle className="text-white">Importar Chaves de Luta</CardTitle>
                  <CardDescription className="text-gray-400">
                    Selecione um ou mais arquivos JSON com as chaves de luta
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  multiple
                  onChange={handleImportarChaves}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={loadingImport}
                  className="bg-[#4338CA] hover:bg-[#5a47e8]"
                >
                  {loadingImport ? "Importando..." : "Selecionar Arquivos JSON"}
                </Button>
              </CardContent>
            </Card>

            {chaves.length > 0 && (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Chaves Importadas ({chaves.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {chaves.map((chave, chaveIndex) => (
                    <div key={chaveIndex} className="border border-zinc-700 rounded-lg overflow-hidden">
                      <div className="bg-zinc-800 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Trophy className="w-5 h-5 text-[#D4AF37]" />
                          <span className="text-white font-bold">{chave.categoria}</span>
                          <span className="text-gray-400 text-sm">({chave.lutas.length} lutas)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400 text-sm">
                            {chave.lutas.filter(l => l.resultado?.status === "concluida").length}/{chave.lutas.length}
                          </span>
                          {getStatusBadge(chave.status)}
                        </div>
                      </div>
                      <div className="divide-y divide-zinc-800">
                        {chave.lutas.map((luta, lutaIndex) => (
                          <div key={lutaIndex} className="px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="text-gray-500 text-sm">Luta {lutaIndex + 1}</span>
                              <span className="text-white">{luta.atleta1.nome}</span>
                              <span className="text-gray-500">vs</span>
                              <span className="text-white">{luta.atleta2.nome}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              {luta.resultado?.status === "concluida" ? (
                                <span className="text-green-400 text-sm">
                                  {luta.resultado.vencedor === "atleta1" ? luta.atleta1.nome : luta.resultado.vencedor === "atleta2" ? luta.atleta2.nome : "Empate"} venceu
                                </span>
                              ) : (
                                <>
                                  <Input
                                    placeholder="Árbitro..."
                                    value={luta.arbitro || ""}
                                    onChange={(e) => handleAtualizarArbitro(chaveIndex, luta.id, e.target.value)}
                                    className="w-40 bg-zinc-800 border-zinc-700 text-white text-sm h-8"
                                  />
                                  <Button size="sm" onClick={() => handleIniciarLuta(chaveIndex, luta.id)} className="bg-[#D4AF37] hover:bg-[#f0c844] text-black">
                                    <Play className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Button
                onClick={handleProximo}
                disabled={chaves.length === 0}
                className="flex-1 bg-[#D4AF37] hover:bg-[#f0c844] text-black font-bold"
              >
                Próximo
              </Button>
              {chaves.length > 0 && (
                <Button onClick={handleExportarArea} variant="outline" className="border-green-600 text-green-400 hover:bg-green-600/20">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <Button variant="outline" onClick={() => router.push("/scoreboard")} className="border-zinc-700 text-gray-300 hover:bg-zinc-800">
                <Plus className="w-4 h-4 mr-2" />
                Criar Luta Manual (Sem Importar)
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}