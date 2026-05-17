"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ActionButtonsProps {
  temChaves: boolean
  onProximo: () => void
  onCriarManual: () => void
}

export function ActionButtons({ temChaves, onProximo, onCriarManual }: ActionButtonsProps) {
  return (
    <>
      <Button
        onClick={onProximo}
        disabled={!temChaves}
        className="w-full bg-[#D4AF37] hover:bg-[#f0c844] text-black font-bold py-6 text-lg"
      >
        Próximo
      </Button>

      <div className="pt-4 border-t border-zinc-800">
        <Button 
          onClick={onCriarManual} 
          className="bg-zinc-700 hover:bg-zinc-600 text-white border border-zinc-600 w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar Luta Manual
        </Button>
      </div>
    </>
  )
}