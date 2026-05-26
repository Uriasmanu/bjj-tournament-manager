"use client"

import { useState, useMemo } from "react"
import { ChaveLuta, Atleta } from "@/app/types"
import { Trophy, Users } from "lucide-react"

interface SeletorLutaProps {
  chaves: ChaveLuta[]
  onIniciar: (categoria: string, atleta1: Atleta, atleta2: Atleta) => void
}

export function SeletorLuta({ chaves, onIniciar }: SeletorLutaProps) {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("")
  const [atleta1Selecionado, setAtleta1Selecionado] = useState<Atleta | null>(null)
  const [atleta2Selecionado, setAtleta2Selecionado] = useState<Atleta | null>(null)

  const chaveAtual = chaves.find((c) => c.categoria === categoriaSelecionada)

  const atletasDisponiveis = useMemo(() => {
    if (!chaveAtual) return []

    const atletas: Atleta[] = []
    chaveAtual.lutas.forEach((luta) => {
      if (luta.resultado?.status !== "concluida") {
        if (luta.atleta1?.id && !atletas.find(a => a.id === luta.atleta1?.id)) {
          atletas.push(luta.atleta1)
        }
        if (luta.atleta2?.id && !atletas.find(a => a.id === luta.atleta2?.id)) {
          atletas.push(luta.atleta2)
        }
      }
    })

    return atletas
  }, [chaveAtual])

  const podeIniciar =
    categoriaSelecionada && atleta1Selecionado && atleta2Selecionado

  const handleIniciar = () => {
    if (podeIniciar && atleta1Selecionado && atleta2Selecionado) {
      onIniciar(categoriaSelecionada, atleta1Selecionado, atleta2Selecionado)
    }
  }

  const limparSelecao = () => {
    setCategoriaSelecionada("")
    setAtleta1Selecionado(null)
    setAtleta2Selecionado(null)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-8">
      <div className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full border border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-8 h-8 text-[#D4AF37]" />
          <h2 className="text-3xl font-bold text-white">Selecionar Luta</h2>
        </div>

        {/* Seleção de Categoria */}
        <div className="mb-6">
          <label className="block text-gray-400 text-sm mb-2">
            Categoria / Chave
          </label>
          <select
            value={categoriaSelecionada}
            onChange={(e) => {
              setCategoriaSelecionada(e.target.value)
              setAtleta1Selecionado(null)
              setAtleta2Selecionado(null)
            }}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 text-lg"
          >
            <option value="">Selecione uma categoria...</option>
            {chaves.map((chave) => {
              const lutasPendentes = chave.lutas.filter(
                (l) => l.atleta1?.id && l.atleta2?.id
              ).filter(
                (l) => l.resultado?.status !== "concluida"
              ).length
              return (
                <option key={chave.categoria} value={chave.categoria}>
                  {chave.categoria} ({lutasPendentes} lutas pendentes)
                </option>
              )
            })}
          </select>
        </div>

        {categoriaSelecionada && (
          <>
            {/* Selection dos Atletas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-6">
              {/* Atleta 1 - Azul */}
              <div className="text-center">
                <label className="block text-blue-400 font-bold mb-2">
                  Atleta 1 (Azul)
                </label>
                <select
                  value={atleta1Selecionado?.id || ""}
                  onChange={(e) => {
                    const atleta = atletasDisponiveis.find(
                      (a) => a.nome === e.target.value
                    )
                    setAtleta1Selecionado(atleta || null)
                  }}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600"
                >
                  <option value="">Selecione...</option>
                  {atletasDisponiveis
                    .filter((a) => a.id !== atleta2Selecionado?.id)
                    .map((atleta) => (
                      <option key={atleta.id} value={atleta.id}>
                        {atleta.nome}
                      </option>
                    ))}
                </select>
                {atleta1Selecionado && (
                  <p className="text-gray-400 text-sm mt-2">
                    {atleta1Selecionado.equipe}
                  </p>
                )}
              </div>

              {/* VS */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700 border-2 border-[#D4AF37]">
                  <span className="text-2xl font-bold text-[#D4AF37]">VS</span>
                </div>
              </div>

              {/* Atleta 2 - Branco */}
              <div className="text-center">
                <label className="block text-gray-200 font-bold mb-2">
                  Atleta 2 (Branco)
                </label>
                <select
                  value={atleta2Selecionado?.id || ""}
                  onChange={(e) => {
                    const atleta = atletasDisponiveis.find(
                      (a) => a.id === e.target.value
                    )
                    setAtleta2Selecionado(atleta || null)
                  }}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600"
                >
                  <option value="">Selecione...</option>
                  {atletasDisponiveis
                    .filter((a) => a.id !== atleta1Selecionado?.id)
                    .map((atleta) => (
                      <option key={atleta.id} value={atleta.id}>
                        {atleta.nome}
                      </option>
                    ))}
                </select>
                {atleta2Selecionado && (
                  <p className="text-gray-400 text-sm mt-2">
                    {atleta2Selecionado.equipe}
                  </p>
                )}
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4">
              <button
                onClick={limparSelecao}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-bold transition-colors"
              >
                Limpar
              </button>
              <button
                onClick={handleIniciar}
                disabled={!podeIniciar}
                className={`flex-1 py-3 rounded-lg font-bold transition-colors ${
                  podeIniciar
                    ? "bg-[#D4AF37] hover:bg-[#f0c844] text-black"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
              >
                Iniciar Luta
              </button>
            </div>
          </>
        )}

        {/* Info quando não há chaves */}
        {chaves.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-4" />
            <p>Nenhuma chave importada.</p>
            <p className="text-sm mt-2">
              Vá para a tela de setup para importar as chaves de luta.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}