import { ChaveLuta, Luta, DadosArea } from "@/app/types"

const API_URL = "/api/area"

export interface DadosIniciais {
  area: string
  chaves: ChaveLuta[]
  areaDefinida: boolean
}

export async function getDadosIniciais(): Promise<DadosIniciais> {
  const dadosSalvos = localStorage.getItem("bjj_tournament_area_nome")
  
  if (!dadosSalvos) {
    return { area: "", chaves: [], areaDefinida: false }
  }

  try {
    const response = await fetch(`${API_URL}?area=${encodeURIComponent(dadosSalvos)}`)
    if (!response.ok) {
      return { area: dadosSalvos, chaves: [], areaDefinida: true }
    }
    const dados: DadosArea = await response.json()
    return {
      area: dados.area || dadosSalvos,
      chaves: dados.chaves || [],
      areaDefinida: !!dados.area
    }
  } catch {
    return { area: dadosSalvos, chaves: [], areaDefinida: true }
  }
}

export async function salvarDados(area: string, chaves: ChaveLuta[]): Promise<boolean> {
  try {
    localStorage.setItem("bjj_tournament_area_nome", area)
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ area, chaves })
    })
    
    return response.ok
  } catch (error) {
    console.error("Failed to save data:", error)
    return false
  }
}

export async function adicionarNovaLuta(area: string, chaves: ChaveLuta[], novaLuta: Luta): Promise<ChaveLuta[]> {
  let chaveManual = chaves.find(c => c.categoria === "Luta Manual")
  
  if (!chaveManual) {
    chaveManual = {
      categoria: "Luta Manual",
      lutas: [],
      status: "pendente"
    }
  }
  
  chaveManual.lutas.push(novaLuta)
  
  const chavesAtualizadas = chaves.map(c => 
    c.categoria === "Luta Manual" ? chaveManual! : c
  )
  
  if (!chaves.some(c => c.categoria === "Luta Manual")) {
    chavesAtualizadas.push(chaveManual!)
  }

  await salvarDados(area, chavesAtualizadas)
  
  return chavesAtualizadas
}

export async function marcarLutaConcluida(
  area: string, 
  chaveIndex: number, 
  lutaId: number, 
  vencedor: string, 
  chaves: ChaveLuta[]
): Promise<ChaveLuta[]> {
  const chavesAtualizadas = [...chaves]
  
  const chave = chavesAtualizadas[chaveIndex]
  const luta = chave.lutas.find(l => l.id === lutaId)
  
  if (luta && luta.resultado) {
    luta.resultado.status = "concluida"
    if (vencedor === "empate") {
      luta.resultado.vencedor = "empate"
    } else if (vencedor === "finalizacao") {
      luta.resultado.tipoVitoria = "finalizacao"
    } else if (vencedor === "desclassificacao") {
      luta.resultado.tipoVitoria = "desclassificacao"
    } else {
      luta.resultado.vencedor = vencedor as "atleta1" | "atleta2"
    }
  }
  
  const temLutasPendentes = chave.lutas.some(l => l.resultado?.status !== "concluida")
  chave.status = temLutasPendentes ? "em_andamento" : "concluida"
  
  await salvarDados(area, chavesAtualizadas)
  
  return chavesAtualizadas
}

export async function limparDados(area: string): Promise<void> {
  localStorage.removeItem("bjj_tournament_area_nome")
  
  if (area) {
    try {
      await fetch(`/api/area?area=${encodeURIComponent(area)}`, {
        method: "DELETE",
      })
    } catch (error) {
      console.error("Erro ao limpar dados da API:", error)
    }
  }
}