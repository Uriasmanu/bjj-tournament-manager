"use client"

import { Download, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ActionButtonsProps {
  temChaves: boolean
  onProximo: () => void
  onExportar: () => void
  onCriarManual: () => void
}

export function ActionButtons({ temChaves, onProximo, onExportar, onCriarManual }: ActionButtonsProps) {
  return (
    <>
      <div className="flex gap-4">
        <Button
          onClick={onProximo}
          disabled={!temChaves}
          className="flex-1 bg-[#D4AF37] hover:bg-[#f0c844] text-black font-bold"
        >
          Próximo
        </Button>
        {temChaves && (
          <Button 
            onClick={onExportar} 
            variant="outline" 
            className="border-green-600 text-green-400 hover:bg-green-600/20"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        )}
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <Button 
          onClick={onCriarManual} 
          className="bg-zinc-700 hover:bg-zinc-600 text-white border border-zinc-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar Luta Manual (Sem Importar)
        </Button>
      </div>
    </>
  )
}