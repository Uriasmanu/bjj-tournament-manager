import { ChaveLuta, Luta, DadosArea } from "@/app/types"

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

function getCriadoEm(): string {
  const dadosSalvos = localStorage.getItem(STORAGE_KEY)
  if (dadosSalvos) {
    try {
      const dados: DadosArea = JSON.parse(dadosSalvos)
      return dados.criadoEm || new Date().toISOString()
    } catch { return new Date().toISOString() }
  }
  return new Date().toISOString()
}

export function salvarDados(area: string, chaves: ChaveLuta[], criadoEmAnterior?: string): void {
  const dados: DadosArea = {
    area,
    chaves,
    criadoEm: criadoEmAnterior || getCriadoEm()
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dados))
}

export function limparDados(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function adicionarNovaLuta(area: string, chaves: ChaveLuta[], novaLuta: Luta): ChaveLuta[] {
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

  const dados: DadosArea = {
    area,
    chaves: chavesAtualizadas,
    criadoEm: getCriadoEm(),
    atualizadoEm: new Date().toISOString()
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dados))
  
  return chavesAtualizadas
}

export function marcarLutaConcluida(
  area: string, 
  chaveIndex: number, 
  lutaId: number, 
  vencedor: string, 
  chaves: ChaveLuta[]
): ChaveLuta[] {
  const chavesAtualizadas = [...chaves]
  
  const chave = chavesAtualizadas[chaveIndex]
  const luta = chave.lutas.find(l => l.id === lutaId)
  
  if (luta && luta.resultado) {
    luta.resultado.status = "concluida"
    if (vencedor === "finalizacao") {
      luta.resultado.tipoVitoria = "finalizacao"
      // Quem finalizou - precisa saber qual atleta
      // Por enquanto, deixamos null e determinamos pelo tipo
    } else if (vencedor === "desclassificacao") {
      luta.resultado.tipoVitoria = "desclassificacao"
    } else if (vencedor === "empate") {
      luta.resultado.vencedor = "empate"
    } else {
      luta.resultado.vencedor = vencedor as "atleta1" | "atleta2"
    }
  }
  
  const temLutasPendentes = chave.lutas.some(l => l.resultado?.status !== "concluida")
  chave.status = temLutasPendentes ? "em_andamento" : "concluida"
  
  const dados: DadosArea = {
    area,
    chaves: chavesAtualizadas,
    criadoEm: getCriadoEm(),
    atualizadoEm: new Date().toISOString()
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dados))
  
  return chavesAtualizadas
}