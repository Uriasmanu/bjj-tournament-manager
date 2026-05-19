import { useState, useCallback } from "react"
import { ChaveLuta, Luta } from "@/app/types"
import { generateUUID } from "@/app/lib/uuid"
import { generatePosition } from "@/app/lib/bracket-utils"

export interface ResultadoImportacao {
  nomeArquivo: string
  sucesso: boolean
  mensagem?: string
  categoria?: string
  quantidadeLutas?: number
}

interface ChaveRaw {
  id?: string
  categoria: string
  lutas: Array<{
    id?: string
    round?: number
    position?: number
    nextMatchId?: string
    previousMatchIds?: string[]
    atleta1?: { id?: string; nome?: string; equipe?: string; faixa?: string }
    atleta2?: { id?: string; nome?: string; equipe?: string; faixa?: string }
  }>
}

function validarChave(data: unknown): { valido: boolean; dados?: ChaveRaw; erro?: string } {
  if (typeof data !== "object" || data === null) {
    return { valido: false, erro: "Formato inválido" }
  }

  const chave = data as Record<string, unknown>

  if (typeof chave.categoria !== "string" || !chave.categoria.trim()) {
    return { valido: false, erro: "Campo 'categoria' é obrigatório" }
  }

  if (!Array.isArray(chave.lutas)) {
    return { valido: false, erro: "Campo 'lutas' deve ser um array" }
  }

  if (chave.lutas.length === 0) {
    return { valido: false, erro: "A chave não contém lutas" }
  }

  return { valido: true, dados: data as ChaveRaw }
}

function processarChave(data: ChaveRaw): ChaveLuta {
  const lutas: Luta[] = data.lutas.map((luta, index) => ({
    id: luta.id || generateUUID(),
    round: luta.round || 1,
    position: luta.position ?? index,
    nextMatchId: luta.nextMatchId,
    previousMatchIds: luta.previousMatchIds,
    atleta1: luta.atleta1
      ? { id: luta.atleta1.id || generateUUID(), nome: luta.atleta1.nome || "", equipe: luta.atleta1.equipe || "", faixa: luta.atleta1.faixa }
      : null,
    atleta2: luta.atleta2
      ? { id: luta.atleta2.id || generateUUID(), nome: luta.atleta2.nome || "", equipe: luta.atleta2.equipe || "", faixa: luta.atleta2.faixa }
      : null,
    resultado: {
      id: generateUUID(),
      pontosAtleta1: 0,
      pontosAtleta2: 0,
      vantagensAtleta1: 0,
      vantagensAtleta2: 0,
      penalidadesAtleta1: 0,
      penalidadesAtleta2: 0,
      tempoDecorrido: 0,
      finalizacaoAtleta1: false,
      finalizacaoAtleta2: false,
      desclassificacao: null,
      vencedor: null,
      tipoVitoria: "pontos" as const,
      status: "pendente" as const,
      montadasAtleta1: 0,
      montadasAtleta2: 0,
      passagensAtleta1: 0,
      passagensAtleta2: 0,
      quedasAtleta1: 0,
      quedasAtleta2: 0,
      lutaId: null,
      vencedorAtletaId: null,
      perdedorAtletaId: null,
      AtletaDesclassificadoId: null,
    }
  }))

  const nomes = new Set<string>()
  lutas.forEach(l => {
    if (l.atleta1?.nome) nomes.add(l.atleta1.nome)
    if (l.atleta2?.nome) nomes.add(l.atleta2.nome)
  })

  const totalCompetidores = nomes.size
  const lutasNormalizadas = totalCompetidores === 3 ? lutas.filter(luta => luta.round <= 2) : lutas
  const lutasComPosicoesCorretas = generatePosition(lutasNormalizadas)

  return {
    id: data.id || generateUUID(),
    categoria: data.categoria,
    lutas: lutasComPosicoesCorretas,
    status: "pendente",
    totalCompetidores,
  }
}

export function useImportacao() {
  const [resultados, setResultados] = useState<ResultadoImportacao[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const importarArquivos = useCallback((files: FileList | null): Promise<ChaveLuta[]> => {
    if (!files || files.length === 0) {
      return Promise.resolve([])
    }

    setIsLoading(true)
    const chavesImportadas: ChaveLuta[] = []
    const resultadosTemp: ResultadoImportacao[] = []
    let processados = 0

    return new Promise((resolve) => {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()

        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string)
            const validacao = validarChave(data)

            if (!validacao.valido || !validacao.dados) {
              resultadosTemp.push({
                nomeArquivo: file.name,
                sucesso: false,
                mensagem: validacao.erro || "Formato inválido"
              })
            } else {
              const chave = processarChave(validacao.dados)
              chavesImportadas.push(chave)

              resultadosTemp.push({
                nomeArquivo: file.name,
                sucesso: true,
                categoria: chave.categoria,
                quantidadeLutas: chave.lutas.length
              })
            }
          } catch {
            resultadosTemp.push({
              nomeArquivo: file.name,
              sucesso: false,
              mensagem: "Erro ao analisar JSON"
            })
          }

          processados++
          if (processados === files.length) {
            setResultados(resultadosTemp)
            setIsLoading(false)
            resolve(chavesImportadas)
          }
        }

        reader.onerror = () => {
          resultadosTemp.push({
            nomeArquivo: file.name,
            sucesso: false,
            mensagem: "Erro ao ler arquivo"
          })

          processados++
          if (processados === files.length) {
            setResultados(resultadosTemp)
            setIsLoading(false)
            resolve(chavesImportadas)
          }
        }

        reader.readAsText(file)
      })
    })
  }, [])

  const limparResultados = useCallback(() => {
    setResultados([])
  }, [])

  return {
    resultados,
    isLoading,
    importarArquivos,
    limparResultados
  }
}