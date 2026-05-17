"use client"

import { MapPin, Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AreaCardProps {
  area: string
  definido: boolean
  onChangeArea: (value: string) => void
  onDefinirArea: () => void
}

export function AreaCard({ area, definido, onChangeArea, onDefinirArea }: AreaCardProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="flex flex-row items-center gap-3">
        <MapPin className="w-6 h-6 text-[#D4AF37]" />
        <div>
          <CardTitle className="text-white">Área de Luta</CardTitle>
          <CardDescription className="text-gray-400">
            Defina o nome da área uma única vez
          </CardDescription>
        </div>
        {definido && <Badge className="ml-auto bg-green-600">Definida</Badge>}
      </CardHeader>
      <CardContent>
        {!definido ? (
          <div className="flex gap-4">
            <Input
              placeholder="Ex: Área 1, Quadra A"
              value={area}
              onChange={(e) => onChangeArea(e.target.value)}
              className="flex-1 bg-zinc-800 border-zinc-700 text-white"
            />
            <Button 
              onClick={onDefinirArea} 
              disabled={!area.trim()}
              className="bg-[#4338CA] hover:bg-[#5a47e8]"
            >
              <Save className="w-4 h-4 mr-2" />
              Definir Área
            </Button>
          </div>
        ) : (
          <div className="text-white text-lg">
            <span className="text-[#D4AF37] font-bold">{area}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}