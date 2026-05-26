"use client"

import { ChaveLuta, Luta, DadosArea, Atleta } from "@/app/types"
import { generateUUID } from "@/app/lib/uuid"
import { migrateAllData } from "@/app/lib/migrate-ids"
import { advanceWinner } from "@/app/lib/bracket-utils"

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

  montadasAtleta1: number
  montadasAtleta2: number
  passagensAtleta1: number
  passagensAtleta2: number
  quedasAtleta1: number
  quedasAtleta2: number
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

    const dadosMigrados = migrateAllData(dados)

    return {
      area: dadosMigrados.area || dadosSalvos,
      chaves: dadosMigrados.chaves || [],
      areaDefinida: !!dadosMigrados.area
    }
  } catch {
    return { area: dadosSalvos, chaves: [], areaDefinida: true }
  }
}

export async function salvarDados(area: string, chaves: ChaveLuta[]): Promise<boolean> {
  try {
    localStorage.setItem("bjj_tournament_area_nome", area)

    const response = await fetch(API_URL, {
      method: "PUT",
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
      id: generateUUID(),
      categoria: "Luta Manual",
      lutas: [],
      status: "pendente",
      totalCompetidores: 0,
    }
  }

  const chaveAtualizada: ChaveLuta = {
    ...chaveManual,
    lutas: [...chaveManual.lutas, novaLuta],
    totalCompetidores: calculateTotalCompetidores([...chaveManual.lutas, novaLuta]),
  }

  const chavesAtualizadas = chaves.map(c =>
    c.categoria === "Luta Manual" ? chaveAtualizada : c
  )

  if (!chaves.some(c => c.categoria === "Luta Manual")) {
    chavesAtualizadas.push(chaveAtualizada)
  }

  await salvarDados(area, chavesAtualizadas)

  return chavesAtualizadas
}

export async function marcarLutaConcluida(
  area: string,
  chaveId: string,
  lutaId: string,
  dadosResultado: DadosResultadoLuta,
  chaves: ChaveLuta[]
): Promise<{ chaves: ChaveLuta[]; sucesso: boolean }> {
  const chavesAtualizadas = [...chaves]

  const chave = chavesAtualizadas.find(c => c.id === chaveId)
  if (!chave) {
    console.error(`marcarLutaConcluida: Chave ${chaveId} não encontrada em ${chaves.length} chaves`)
    return { chaves: chavesAtualizadas, sucesso: false }
  }

  const luta = chave.lutas.find(l => l.id === lutaId)
  if (!luta) {
    console.error(`marcarLutaConcluida: Luta ${lutaId} não encontrada na chave ${chaveId} (${chave.lutas.length} lutas)`)
    return { chaves: chavesAtualizadas, sucesso: false }
  }

  const winnerAtleta: Atleta | null = dadosResultado.vencedor === "atleta1" ? luta.atleta1 : dadosResultado.vencedor === "atleta2" ? luta.atleta2 : null
  const loserAtleta: Atleta | null = winnerAtleta
    ? (dadosResultado.vencedor === "atleta1" ? luta.atleta2 : luta.atleta1)
    : null

  const resultado = {
    ...luta.resultado,
    id: generateUUID(),
    pontosAtleta1: dadosResultado.pontosAtleta1,
    pontosAtleta2: dadosResultado.pontosAtleta2,
    vantagensAtleta1: dadosResultado.vantagensAtleta1,
    vantagensAtleta2: dadosResultado.vantagensAtleta2,
    penalidadesAtleta1: dadosResultado.penalidadesAtleta1,
    penalidadesAtleta2: dadosResultado.penalidadesAtleta2,
    tempoDecorrido: dadosResultado.tempoDecorrido,
    finalizacaoAtleta1: dadosResultado.finalizacaoAtleta1,
    finalizacaoAtleta2: dadosResultado.finalizacaoAtleta2,
    desclassificacao: dadosResultado.desclassificacao,
    tipoVitoria: dadosResultado.tipoVitoria,
    vencedor: dadosResultado.vencedor,
    status: "concluida" as const,
    montadasAtleta1: dadosResultado.montadasAtleta1,
    montadasAtleta2: dadosResultado.montadasAtleta2,
    passagensAtleta1: dadosResultado.passagensAtleta1,
    passagensAtleta2: dadosResultado.passagensAtleta2,
    quedasAtleta1: dadosResultado.quedasAtleta1,
    quedasAtleta2: dadosResultado.quedasAtleta2,
    lutaId: lutaId,
    vencedorAtletaId: winnerAtleta?.id || null,
    perdedorAtletaId: loserAtleta?.id || null,
    AtletaDesclassificadoId: dadosResultado.desclassificacao
      ? (dadosResultado.desclassificacao === "atleta1" ? luta.atleta1?.id : luta.atleta2?.id) || null
      : null,
  }

  const lutaAtualizada: Luta = { ...luta, resultado }

  const chavesComLutaAtualizada = chavesAtualizadas.map(c => {
    if (c.id !== chaveId) return c
    return {
      ...c,
      lutas: c.lutas.map(l => l.id === lutaId ? lutaAtualizada : l)
    }
  })

  let chaveResult = chavesComLutaAtualizada.find(c => c.id === chaveId)
  if (chaveResult && winnerAtleta && loserAtleta) {
    chaveResult = advanceWinner(chaveResult, lutaId, winnerAtleta, loserAtleta)
  }

  const finalChaves = chavesComLutaAtualizada.map(c => {
    if (c.id !== chaveId) return c
    return chaveResult as ChaveLuta
  })

  const temLutasPendentes = (chaveResult as ChaveLuta).lutas.filter(l => l.atleta1?.id && l.atleta2?.id).some(l => l.resultado?.status !== "concluida")
  const chavesFinais = finalChaves.map(c => {
    if (c.id !== chaveId) return c
    return { ...c, status: temLutasPendentes ? "em_andamento" as const : "concluida" as const }
  })

  const saveOk = await salvarDados(area, chavesFinais)
  if (!saveOk) {
    console.error("marcarLutaConcluida: salvarDados falhou!")
  }
  return { chaves: chavesFinais, sucesso: saveOk }
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

function calculateTotalCompetidores(lutas: Luta[]): number {
  const nomes = new Set<string>()
  lutas.forEach(l => {
    if (l.atleta1?.nome) nomes.add(l.atleta1.nome)
    if (l.atleta2?.nome) nomes.add(l.atleta2.nome)
  })
  return nomes.size
}