import { useState, useCallback } from "react"
import { ChaveLuta, Luta } from "@/app/types"

export interface ResultadoImportacao {
  nomeArquivo: string
  sucesso: boolean
  mensagem?: string
  categoria?: string
  quantidadeLutas?: number
}

interface ChaveRaw {
  categoria: string
  lutas: Array<{
    id?: number
    round?: number
    atleta1?: { nome?: string; equipe?: string }
    atleta2?: { nome?: string; equipe?: string }
  }>
}

function gerarIdUnico(): number {
  return Date.now() + Math.floor(Math.random() * 1000)
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
    id: luta.id || gerarIdUnico() + index,
    round: luta.round || 1,
    atleta1: { nome: luta.atleta1?.nome || "", equipe: luta.atleta1?.equipe || "" },
    atleta2: { nome: luta.atleta2?.nome || "", equipe: luta.atleta2?.equipe || "" },
    resultado: {
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
      status: "pendente" as const
    }
  }))

  return {
    categoria: data.categoria,
    lutas,
    status: "pendente"
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