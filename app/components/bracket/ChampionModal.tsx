"use client"

import { Trophy } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Atleta } from "@/app/types"
import { cn } from "@/lib/utils"

interface ChampionModalProps {
  champion: Atleta
  categoryName: string
  onClose?: () => void
  className?: string
}

export function ChampionModal({ champion, categoryName, onClose, className }: ChampionModalProps) {
  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/60", className)}>
      <Card className="bg-gradient-to-br from-amber-300 to-amber-500 border-2 border-amber-600 p-8 max-w-md w-full mx-4 text-center shadow-2xl">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-900" />
        <h2 className="text-2xl font-bold text-amber-900 mb-2">
          {champion.nome}
        </h2>
        <p className="text-amber-800 font-medium mb-2">
          {champion.equipe}
        </p>
        <p className="text-amber-900 font-bold text-xl uppercase tracking-wide">
          CAMPEÃO
        </p>
        <p className="text-amber-700 text-sm mt-2">
          {categoryName}
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-amber-900 text-amber-100 rounded-lg font-semibold hover:bg-amber-950 transition-colors"
          >
            Fechar
          </button>
        )}
      </Card>
    </div>
  )
}