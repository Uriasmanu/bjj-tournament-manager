"use client"

import { Trophy } from "lucide-react"
import { ChaveLuta } from "@/app/types"
import { cn } from "@/lib/utils"

interface BracketEmptyStateProps {
  className?: string
}

export function BracketEmptyState({ className }: BracketEmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <Trophy className="w-12 h-12 text-gray-500 mb-4" />
      <p className="text-gray-400">Nenhuma chave de luta carregada.</p>
      <p className="text-gray-500 text-sm mt-2">
        Selecione uma chave na tela de setup para visualizar o bracket.
      </p>
    </div>
  )
}