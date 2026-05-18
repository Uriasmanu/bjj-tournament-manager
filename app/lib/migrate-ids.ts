import { ChaveLuta, Luta, Atleta, ResultadoLuta, DadosArea } from "@/app/types"
import { generateUUID, isValidUUID } from "./uuid"

export function migrateChaveLuta(chave: ChaveLuta): ChaveLuta {
  if (isValidUUID(chave.id)) return chave

  return {
    ...chave,
    id: generateUUID(),
    lutas: chave.lutas.map(migrateLuta),
    totalCompetidores: calculateTotalCompetidores(chave.lutas),
    vencedorAtletaId: resolveVencedorId(chave.vencedor, chave.lutas),
  }
}

function migrateLuta(luta: Luta): Luta {
  if (isValidUUID(luta.id)) return luta

  return {
    ...luta,
    id: generateUUID(),
    atleta1: migrateAtleta(luta.atleta1),
    atleta2: migrateAtleta(luta.atleta2),
    resultado: luta.resultado ? migrateResultado(luta.resultado) : undefined,
    nextMatchId: undefined,
    previousMatchIds: undefined,
  }
}

function migrateAtleta(atleta: Atleta | null | undefined): Atleta | null {
  if (!atleta) return null
  if (isValidUUID(atleta.id)) return atleta
  return { ...atleta, id: generateUUID() }
}

function migrateResultado(resultado: ResultadoLuta): ResultadoLuta {
  if (isValidUUID(resultado.id)) return resultado
  return {
    ...resultado,
    id: generateUUID(),
    lutaId: null,
    vencedorAtletaId: null,
    perdedorAtletaId: null,
    AtletaDesclassificadoId: null,
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

function resolveVencedorId(vencedorNome: string | undefined, lutas: Luta[]): string | undefined {
  if (!vencedorNome) return undefined
  for (const luta of lutas) {
    if (luta.atleta1?.nome === vencedorNome) return luta.atleta1?.id
    if (luta.atleta2?.nome === vencedorNome) return luta.atleta2?.id
  }
  return undefined
}

export function migrateDadosArea(dados: DadosArea): DadosArea {
  if (isValidUUID(dados.id)) return dados
  return {
    ...dados,
    id: generateUUID(),
    chaves: dados.chaves.map(migrateChaveLuta),
  }
}

export function migrateAllData(dados: DadosArea): DadosArea {
  return migrateDadosArea(dados)
}