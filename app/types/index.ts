export interface Atleta {
  id: string
  nome: string
  equipe: string
  faixa?: string
}

export interface ResultadoLuta {
  id: string
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
  vencedor: "atleta1" | "atleta2" | "empate" | null
  tipoVitoria: "pontos" | "finalizacao" | "desclassificacao" | "empate"
  status: "pendente" | "concluida"
  montadasAtleta1: number
  montadasAtleta2: number
  passagensAtleta1: number
  passagensAtleta2: number
  quedasAtleta1: number
  quedasAtleta2: number
  lutaId: string | null
  vencedorAtletaId: string | null
  perdedorAtletaId: string | null
  AtletaDesclassificadoId: string | null
}

export interface Luta {
  id: string
  round: number
  position: number
  atleta1: Atleta | null
  atleta2: Atleta | null
  resultado?: ResultadoLuta
  arbitro?: string
  dataLuta?: string
  nextMatchId?: string
  previousMatchIds?: string[]
}

export interface ClassificacaoFinal {
  chaveId: string
  campeao?: {
    id: string
    nome: string
    equipe: string
    faixa?: string
  }
  vice?: {
    id: string
    nome: string
    equipe: string
    faixa?: string
  }
  terceiroA?: {
    id: string
    nome: string
    equipe: string
    faixa?: string
  }
  terceiroB?: {
    id: string
    nome: string
    equipe: string
    faixa?: string
  }
  dataAtualizacao: string
}

export interface ChaveLuta {
  id: string
  categoria: string
  lutas: Luta[]
  arbitro?: string
  vencedorAtletaId?: string
  status: "pendente" | "em_andamento" | "concluida"
  totalCompetidores: number
  classificacaoFinal?: ClassificacaoFinal
}

export interface DadosArea {
  id: string
  area: string
  criadoEm: string
  atualizadoEm?: string
  chaves: ChaveLuta[]
  classificacoes?: ClassificacaoFinal[]
}

export const FAIXAS = ["Branca", "Azul", "Roxa", "Marrom", "Preta"] as const
export type Faixa = typeof FAIXAS[number]

export const CORES_FAIXA: Record<Faixa, string> = {
  "Branca": "bg-white text-black border-2 border-gray-300",
  "Azul": "bg-blue-700 text-white",
  "Roxa": "bg-purple-700 text-white",
  "Marrom": "bg-amber-900 text-white",
  "Preta": "bg-black text-white border-2 border-gray-500",
}

// Tipos auxiliares para renderização do bracket (não persiste no backend)

export type MatchupStatus = "pending" | "bye" | "live" | "completed"

export interface FighterSlot {
  athlete?: Atleta | null
  sourceMatchId?: string
  seed?: number
  isBye: boolean
  resultStatus: "winner" | "loser" | "disqualified" | null
}

export interface BracketMatchup {
  id: string
  round: number
  position: number
  fighter1?: FighterSlot
  fighter2?: FighterSlot
  result?: ResultadoLuta
  status: MatchupStatus
  label: string
  nextMatchId?: string
  previousMatchIds?: string[]
}

export interface BracketRound {
  label: string
  matchups: BracketMatchup[]
  side: "left" | "right" | "center"
}