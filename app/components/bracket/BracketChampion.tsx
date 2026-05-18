"use client"

import { Trophy } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Atleta } from "@/app/types"

interface BracketChampionProps {
  champion?: Atleta
  categoryName: string
}

export function BracketChampion({ champion, categoryName }: BracketChampionProps) {
  if (!champion) {
    return (
      <Card className="bg-gray-100 border-gray-300 p-4 text-center min-w-[140px]">
        <p className="text-gray-500 text-sm">Aguardando campeão...</p>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-amber-300 to-amber-500 border-2 border-amber-600 p-4 text-center min-w-[140px] shadow-lg">
      <Trophy className="w-8 h-8 mx-auto mb-2 text-amber-900" />
      <p className="font-bold text-amber-900 text-sm">{champion.nome}</p>
      <p className="text-amber-800 text-xs">{champion.equipe}</p>
      <div className="mt-2 bg-amber-900 text-amber-100 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
        CAMPEÃO
      </div>
      <p className="text-amber-700 text-xs mt-1">{categoryName}</p>
    </Card>
  )
}