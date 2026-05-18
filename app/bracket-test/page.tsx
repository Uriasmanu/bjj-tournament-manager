"use client"

import { useState } from "react"
import { ChaveLuta } from "@/app/types"
import { BracketVisualizer } from "@/app/components/bracket"
import { createMockChave } from "@/app/lib/mock-bracket-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function BracketTestPage() {
  const [chave, setChave] = useState<ChaveLuta>(() => createMockChave(8, "Branca Adulto - 80kg"))

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-white text-2xl font-bold mb-6">Bracket Visualizer - Teste</h1>

        <div className="flex gap-4 mb-6">
          {[2, 3, 4, 5, 6, 7, 8].map(n => (
            <Button
              key={n}
              variant="outline"
              className="text-white border-gray-600 hover:bg-gray-800"
              onClick={() => setChave(createMockChave(n, `${n} competidores`))}
            >
              {n} competidores
            </Button>
          ))}
        </div>

        <Card className="bg-gray-800 border-gray-700 p-6">
          <CardHeader>
            <CardTitle className="text-white">{chave.categoria}</CardTitle>
          </CardHeader>
          <CardContent>
            <BracketVisualizer
              chave={chave}
              mode="live"
              onFightClick={(luta) => {
                alert(`Luta clicada: ${luta.atleta1?.nome || "BYE"} vs ${luta.atleta2?.nome || "BYE"}`)
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}