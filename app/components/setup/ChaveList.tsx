"use client"

import { Trophy, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChaveLuta, Luta } from "@/app/types"

interface ChaveListProps {
  chaves: ChaveLuta[]
  onExcluirChave: (chaveIndex: number) => void
}

export function ChaveList({ chaves, onExcluirChave }: ChaveListProps) {
  if (chaves.length === 0) return null

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Chaves Importadas ({chaves.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {chaves.map((chave, chaveIndex) => (
          <ChaveItem
            key={chaveIndex}
            chave={chave}
            chaveIndex={chaveIndex}
            onExcluirChave={onExcluirChave}
          />
        ))}
      </CardContent>
    </Card>
  )
}

interface ChaveItemProps {
  chave: ChaveLuta
  chaveIndex: number
  onExcluirChave: (chaveIndex: number) => void
}

function ChaveItem({ chave, chaveIndex, onExcluirChave }: ChaveItemProps) {
  const lutasConcluidas = chave.lutas.filter(l => l.resultado?.status === "concluida").length

  return (
    <div className="border border-zinc-700 rounded-lg overflow-hidden">
      <div className="bg-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-[#D4AF37]" />
          <span className="text-white font-bold">{chave.categoria}</span>
          <span className="text-gray-400 text-sm">({chave.lutas.length} lutas)</span>
          {chave.totalCompetidores > 0 && (
            <span className="text-gray-500 text-xs">({chave.totalCompetidores} competidores)</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">
            {lutasConcluidas}/{chave.lutas.length}
          </span>
          <StatusBadge status={chave.status} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onExcluirChave(chaveIndex)}
            className="text-red-400 hover:text-red-300 p-1 h-8"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="divide-y divide-zinc-800">
        {chave.lutas.map((luta, lutaIndex) => (
          <LutaItem
            key={lutaIndex}
            luta={luta}
            lutaIndex={lutaIndex}
          />
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "concluida":
      return <Badge className="bg-green-600">Concluída</Badge>
    case "em_andamento":
      return <Badge className="bg-yellow-600">Em Andamento</Badge>
    default:
      return <Badge variant="secondary">Pendente</Badge>
  }
}

interface LutaItemProps {
  luta: Luta
  lutaIndex: number
}

function LutaItem({ luta, lutaIndex }: LutaItemProps) {
  const isConcluida = luta.resultado?.status === "concluida"
  const vencedor = luta.resultado?.vencedor

  const nome1 = luta.atleta1?.nome || "BYE"
  const nome2 = luta.atleta2?.nome || "BYE"

  return (
    <div className="px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-gray-500 text-sm">Luta {lutaIndex + 1}</span>
        <span className={luta.atleta1 ? "text-white" : "text-gray-400"}>{nome1}</span>
        <span className="text-gray-500">vs</span>
        <span className={luta.atleta2 ? "text-white" : "text-gray-400"}>{nome2}</span>
      </div>
      {isConcluida && (
        <span className="text-green-400 text-sm">
          {getNomeVencedor(vencedor, nome1, nome2)} venceu
        </span>
      )}
    </div>
  )
}

function getNomeVencedor(vencedor: string | null | undefined, nome1: string, nome2: string): string {
  if (vencedor === "atleta1") return nome1
  if (vencedor === "atleta2") return nome2
  return "Empate"
}