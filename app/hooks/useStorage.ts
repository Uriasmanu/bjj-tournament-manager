import { ChaveLuta, DadosArea } from "@/app/types"

const STORAGE_KEY = "bjj_tournament_area"

export interface DadosIniciais {
  area: string
  chaves: ChaveLuta[]
  areaDefinida: boolean
}

export function getDadosIniciais(): DadosIniciais {
  if (typeof window === "undefined") {
    return { area: "", chaves: [], areaDefinida: false }
  }

  const dadosSalvos = localStorage.getItem(STORAGE_KEY)
  if (!dadosSalvos) {
    return { area: "", chaves: [], areaDefinida: false }
  }

  try {
    const dados: DadosArea = JSON.parse(dadosSalvos)
    return {
      area: dados.area || "",
      chaves: dados.chaves || [],
      areaDefinida: !!dados.area
    }
  } catch {
    return { area: "", chaves: [], areaDefinida: false }
  }
}

export function salvarDados(area: string, chaves: ChaveLuta[], criadoEmAnterior?: string): void {
  const dados: DadosArea = {
    area,
    chaves,
    criadoEm: criadoEmAnterior || new Date().toISOString()
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dados))
}

export function limparDados(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function exportarDados(area: string, chaves: ChaveLuta[]): void {
  const dadosExport = {
    area,
    exportadoEm: new Date().toISOString(),
    totalChaves: chaves.length,
    totalLutas: chaves.reduce((acc, c) => acc + c.lutas.length, 0),
    lutasConcluidas: chaves.reduce((acc, c) => acc + c.lutas.filter(l => l.resultado?.status === "concluida").length, 0),
    chaves
  }

  const json = JSON.stringify(dadosExport, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `area-${area.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
}