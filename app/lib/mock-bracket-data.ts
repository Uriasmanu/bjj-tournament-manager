import { ChaveLuta, Luta, Atleta, ResultadoLuta } from "@/app/types"
import { generateUUID } from "@/app/lib/uuid"

function createAtleta(nome: string, equipe: string, faixa?: string): Atleta {
  return { id: generateUUID(), nome, equipe, faixa }
}

function createLuta(round: number, position: number, atleta1: Atleta | null, atleta2: Atleta | null, nextMatchId?: string, previousMatchIds?: string[]): Luta {
  return {
    id: generateUUID(),
    round,
    position,
    atleta1,
    atleta2,
    nextMatchId,
    previousMatchIds,
  }
}

export const mockChave8Competidores: ChaveLuta = {
  id: generateUUID(),
  categoria: "Branca Adulto Masculino - 80kg",
  status: "em_andamento",
  totalCompetidores: 8,
  lutas: [
    createLuta(1, 0, createAtleta("João Silva", "Team Alpha"), createAtleta("Carlos Santos", "Team Beta")),
    createLuta(1, 1, createAtleta("Pedro Lima", "Team Gamma"), createAtleta("Andre Souza", "Team Delta")),
    createLuta(1, 2, createAtleta("Lucas Rocha", "Team Epsilon"), createAtleta("Rafael Costa", "Team Zeta")),
    createLuta(1, 3, createAtleta("Bruno Martins", "Team Eta"), createAtleta("Thiago Nunes", "Team Theta")),
  ]
}

mockChave8Competidores.lutas[0].nextMatchId = mockChave8Competidores.lutas[0].id
mockChave8Competidores.lutas[1].nextMatchId = mockChave8Competidores.lutas[0].id

export const mockChave4Competidores: ChaveLuta = {
  id: generateUUID(),
  categoria: "Azul Adulto Masculino - 70kg",
  status: "pendente",
  totalCompetidores: 4,
  lutas: [
    createLuta(1, 0, createAtleta("Marcos Paulo", "Team Alpha"), createAtleta("Felipe Dias", "Team Beta")),
    createLuta(1, 1, createAtleta("Guilherme Reis", "Team Gamma"), createAtleta("Henrique Bastos", "Team Delta")),
  ]
}

export const mockChave3Competidores: ChaveLuta = {
  id: generateUUID(),
  categoria: "Roxa Adulto Masculino - 75kg",
  status: "pendente",
  totalCompetidores: 3,
  lutas: [
    createLuta(1, 0, createAtleta("Daniel Ferreira", "Team Alpha"), createAtleta("Igor Matos", "Team Beta")),
    createLuta(1, 1, createAtleta(null as any, ""), createAtleta("Leonardo Gomes", "Team Delta")),
  ]
}

export const mockChaveConcluida: ChaveLuta = {
  id: generateUUID(),
  categoria: "Branca Juvenile Masculino - 60kg",
  status: "concluida",
  totalCompetidores: 2,
  vencedorAtletaId: generateUUID(),
  lutas: [
    createLuta(1, 0, createAtleta("Matheus Oliveira", "Team Alpha"), createAtleta("Gustavo Silva", "Team Beta")),
  ]
}

const winner = mockChaveConcluida.lutas[0].atleta1!
mockChaveConcluida.vencedorAtletaId = winner.id

export function createMockChave(tamanho: number, categoria: string): ChaveLuta {
  const nomes = ["João", "Maria", "Carlos", "Ana", "Pedro", "Lucia", "Rafael", "Julia"]
  const equipes = ["Team Alpha", "Team Beta", "Team Gamma", "Team Delta"]

  const atletas: Atleta[] = []
  for (let i = 0; i < tamanho; i++) {
    atletas.push(createAtleta(`${nomes[i % nomes.length]} ${i+1}`, `${equipes[i % equipes.length]}`, "Branca"))
  }

  const lutas: Luta[] = []
  for (let i = 0; i < Math.ceil(atletas.length / 2); i++) {
    const a1 = atletas[i * 2] || null
    const a2 = atletas[i * 2 + 1] || null
    lutas.push(createLuta(1, i, a1, a2))
  }

  return {
    id: generateUUID(),
    categoria,
    status: "pendente",
    totalCompetidores: tamanho,
    lutas,
  }
}