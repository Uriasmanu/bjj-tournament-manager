export interface Atleta {
  nome: string
  equipe: string
  faixa?: string
}

export interface ResultadoLuta {
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
}

export interface Luta {
  id: number
  round: number
  atleta1: Atleta
  atleta2: Atleta
  resultado?: ResultadoLuta
  arbitro?: string
  dataLuta?: string
}

export interface ChaveLuta {
  categoria: string
  lutas: Luta[]
  arbitro?: string
  vencedor?: string
  status: "pendente" | "em_andamento" | "concluida"
}

export interface DadosArea {
  area: string
  criadoEm: string
  atualizadoEm?: string
  chaves: ChaveLuta[]
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