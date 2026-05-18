"use client"

import { useState } from "react"
import { ChaveLuta } from "@/app/types"
import { BracketVisualizer } from "@/app/components/bracket"
import { cn } from "@/lib/utils"

interface BracketPanelProps {
  chaves: ChaveLuta[]
  activeLutaId?: string
  onFightSelect?: (luta: any) => void
  mode?: "live" | "readonly"
  className?: string
}

export function BracketPanel({ chaves, activeLutaId, onFightSelect, mode = "live", className }: BracketPanelProps) {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("")

  const chaveAtual = chaves.find(c => c.id === categoriaSelecionada) || chaves[0]

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="mb-2">
        <select
          value={categoriaSelecionada || (chaves[0]?.id || "")}
          onChange={(e) => setCategoriaSelecionada(e.target.value)}
          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 text-sm"
        >
          {chaves.map((chave) => {
            const lutasPendentes = chave.lutas.filter(l => l.resultado?.status !== "concluida").length
            return (
              <option key={chave.id} value={chave.id}>
                {chave.categoria} ({lutasPendentes} pendentes)
              </option>
            )
          })}
        </select>
      </div>

      {chaveAtual && (
        <BracketVisualizer
          chave={chaveAtual}
          onFightClick={onFightSelect}
          activeFightId={activeLutaId}
          mode={mode}
        />
      )}
    </div>
  )
}