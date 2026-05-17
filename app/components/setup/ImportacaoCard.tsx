"use client"

import { Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ImportacaoCardProps {
  isLoading: boolean
  onSelecionarArquivos: () => void
}

export function ImportacaoCard({ isLoading, onSelecionarArquivos }: ImportacaoCardProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="flex flex-row items-center gap-3">
        <Upload className="w-6 h-6 text-[#4338CA]" />
        <div>
          <CardTitle className="text-white">Importar Chaves de Luta</CardTitle>
          <CardDescription className="text-gray-400">
            Selecione um ou mais arquivos JSON com as chaves de luta
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={onSelecionarArquivos} 
          disabled={isLoading}
          className="bg-[#4338CA] hover:bg-[#5a47e8]"
        >
          {isLoading ? "Importando..." : "Selecionar Arquivos JSON"}
        </Button>
      </CardContent>
    </Card>
  )
}