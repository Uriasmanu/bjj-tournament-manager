"use client"

import { CheckCircle, XCircle, FileJson, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export interface ResultadoImportacao {
  nomeArquivo: string
  sucesso: boolean
  mensagem?: string
  categoria?: string
  quantidadeLutas?: number
}

interface ResultadoImportacaoCardProps {
  resultados: ResultadoImportacao[]
  onLimpar: () => void
}

export function ResultadoImportacaoCard({ resultados, onLimpar }: ResultadoImportacaoCardProps) {
  if (resultados.length === 0) return null

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Resultado da Importação</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onLimpar}
          className="text-gray-400 hover:text-white"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {resultados.map((resultado, index) => (
          <ResultadoItem key={index} resultado={resultado} />
        ))}
      </CardContent>
    </Card>
  )
}

function ResultadoItem({ resultado }: { resultado: ResultadoImportacao }) {
  const isSucesso = resultado.sucesso
  const containerClass = isSucesso 
    ? "bg-green-500/10 border-green-500/30" 
    : "bg-red-500/10 border-red-500/30"
  const iconColor = isSucesso ? "text-green-400" : "text-red-400"
  const textColor = isSucesso ? "text-white" : "text-red-300"

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${containerClass}`}>
      {isSucesso ? (
        <CheckCircle className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
      ) : (
        <XCircle className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
      )}
      <div className="flex-1 min-w-0">
        {isSucesso ? (
          <>
            <div className="flex items-center gap-2">
              <FileJson className={`w-4 h-4 ${iconColor}`} />
              <span className={`${textColor} font-medium truncate`}>
                {resultado.nomeArquivo}
              </span>
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {resultado.categoria} • {resultado.quantidadeLutas} luta(s)
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <FileJson className={`w-4 h-4 ${iconColor}`} />
              <span className={`${textColor} font-medium truncate`}>
                {resultado.nomeArquivo}
              </span>
            </div>
            <div className={`text-sm mt-1 ${iconColor}`}>
              {resultado.mensagem}
            </div>
          </>
        )}
      </div>
    </div>
  )
}