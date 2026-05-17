import { ChaveLuta, Luta, DadosArea, DadosResultadoLuta } from "@/app/types"

const API_URL = "/api/area"

export interface DadosIniciais {
  area: string
  chaves: ChaveLuta[]
  areaDefinida: boolean
}

export interface DadosResultadoLuta {
  pontosAtleta1: number
  pontosAtleta2: number
  vantagensAtleta1: number
  vantagensAtleta2: number
  penalidadesAtleta1: number
  penalidadesAtleta2: number
  tempoDecorrido: number
  finalizacaoAtleta1: boolean
  finalizacaoAtleta2: boolean
  desclassificacao: "atleta1" | "atleta2" | null
  tipoVitoria: "pontos" | "finalizacao" | "desclassificacao" | "empate"
  vencedor: "atleta1" | "atleta2" | "empate" | null
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
  dadosResultado: DadosResultadoLuta,
  chaves: ChaveLuta[]
): Promise<ChaveLuta[]> {
  const chavesAtualizadas = [...chaves]
  
  const chave = chavesAtualizadas[chaveIndex]
  const luta = chave.lutas.find(l => l.id === lutaId)
  
  if (luta && luta.resultado) {
    luta.resultado.status = "concluida"
    luta.resultado.pontosAtleta1 = dadosResultado.pontosAtleta1
    luta.resultado.pontosAtleta2 = dadosResultado.pontosAtleta2
    luta.resultado.vantagensAtleta1 = dadosResultado.vantagensAtleta1
    luta.resultado.vantagensAtleta2 = dadosResultado.vantagensAtleta2
    luta.resultado.penalidadesAtleta1 = dadosResultado.penalidadesAtleta1
    luta.resultado.penalidadesAtleta2 = dadosResultado.penalidadesAtleta2
    luta.resultado.tempoDecorrido = dadosResultado.tempoDecorrido
    luta.resultado.finalizacaoAtleta1 = dadosResultado.finalizacaoAtleta1
    luta.resultado.finalizacaoAtleta2 = dadosResultado.finalizacaoAtleta2
    luta.resultado.desclassificacao = dadosResultado.desclassificacao
    luta.resultado.tipoVitoria = dadosResultado.tipoVitoria
    luta.resultado.vencedor = dadosResultado.vencedor
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