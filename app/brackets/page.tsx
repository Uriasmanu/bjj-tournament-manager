"use client"

import React, { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  ChevronRight,
  Trophy,
  AlertTriangle,
  Loader2
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Belt, beltLabels, beltColors } from "@/types"

interface Competitor {
  id: string
  name: string
  team: string
  weight: string
  belt: string
  isActive: boolean
}

export default function GerarChavesPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const [belt, setBelt] = useState("")
  const [title, setTitle] = useState("")

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const res = await fetch('/api/competitors')
        const data = await res.json()
        setCompetitors(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const atletasFiltrados = competitors.filter(c => c.belt === belt)

  const toggleAtleta = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const getBeltColor = (belt: string) => {
    switch (belt) {
      case "WHITE": return "bg-gray-200 text-gray-700"
      case "BLUE": return "bg-blue-100 text-blue-700"
      case "PURPLE": return "bg-purple-100 text-purple-700"
      case "BROWN": return "bg-amber-200 text-amber-900"
      case "BLACK": return "bg-gray-900 text-white"
      default: return "bg-gray-100 text-gray-600"
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <header className="bg-[#1A1A1A] text-white p-6 shadow-md">
        <Link href="/" className="text-xs text-gray-400 flex items-center gap-2 mb-2">
          <ArrowLeft size={14} />
          VOLTAR
        </Link>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Trophy className="text-[#D4AF37]" />
          Montar Chave
        </h1>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 flex flex-col gap-6 min-h-0">
        <Card className="p-6 flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-gray-200 shadow-sm">
          <div className="flex gap-4 w-full md:w-auto">
            <Input
              placeholder="Título da chave"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 w-64 text-gray-900 bg-white"
            />

            <Select onValueChange={setBelt} value={belt}>
              <SelectTrigger className="h-11 w-48 bg-white border-slate-300 shadow-sm focus:ring-2 focus:ring-[#D4AF37] [&>span]:text-gray-900">
                <SelectValue placeholder="Selecionar faixa" />
              </SelectTrigger>

              <SelectContent className="bg-white border border-slate-300 shadow-xl">
                {(Object.keys(beltLabels) as Belt[]).map((belt) => (
                  <SelectItem
                    key={belt}
                    value={belt}
                    className="focus:bg-slate-100 cursor-pointer py-3 text-gray-900 hover:text-gray-900 [&>span]:text-gray-900"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full border border-slate-400 shrink-0"
                        style={{ backgroundColor: beltColors[belt] }}
                      />
                      <span className="font-bold uppercase text-xs text-gray-900">
                        {beltLabels[belt]}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            disabled={selectedIds.length < 2 || !title || !belt}
            className="h-11 px-6 bg-[#1A1A1A] hover:bg-[#D4AF37] hover:text-black text-white font-bold"
          >
            <ShieldCheck size={16} />
            Salvar Chave
          </Button>
        </Card>

        <Card className="flex-1 flex flex-col min-h-0 bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {loading ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                <Loader2 className="animate-spin" />
              </div>
            ) : !belt ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                Selecione uma faixa para começar
              </div>
            ) : (
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-100">
                  <tr>
                    <th className="px-6 py-2"></th>
                    <th className="px-6 py-2 text-left text-xs text-gray-600">Competidor</th>
                    <th className="px-6 py-2 text-center text-xs text-gray-600">Peso / Faixa</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {atletasFiltrados.map((c, index) => (
                    <tr
                      key={c.id}
                      onClick={() => toggleAtleta(c.id)}
                      className={`
                        cursor-pointer transition-colors
                        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        hover:bg-[#D4AF37]/10
                        ${selectedIds.includes(c.id) ? 'bg-[#D4AF37]/20' : ''}
                      `}
                    >
                      <td className="px-6 py-3">
                        <Checkbox
                          checked={selectedIds.includes(c.id)}
                          className="
                            border-gray-400
                            data-[state=checked]:bg-[#D4AF37]
                            data-[state=checked]:border-[#D4AF37]
                            data-[state=checked]:text-black
                          "
                        />
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex flex-col">
                          <span className={`text-sm font-semibold ${selectedIds.includes(c.id) ? 'text-[#B8960F]' : 'text-gray-800'}`}>
                            {c.name}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            {c.team}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Badge className="bg-gray-100 text-gray-800 border border-gray-200 text-xs">
                            {c.weight}kg
                          </Badge>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getBeltColor(c.belt)}`}>
                            {beltLabels[c.belt as Belt] || c.belt}
                          </span>
                        </div>
                      </td>
                      <td className="pr-6 text-right">
                        <ChevronRight size={16} className="text-gray-300" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>

          <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <Users size={18} />
                <span className="font-bold text-sm">{selectedIds.length}</span>
              </div>
              {selectedIds.length % 2 !== 0 && selectedIds.length > 0 && (
                <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold">
                  <AlertTriangle size={14} />
                  Bye automático
                </div>
              )}
            </div>
            <Button
              disabled={selectedIds.length < 2 || !title || !belt}
              className="bg-[#1A1A1A] hover:bg-[#D4AF37] hover:text-black text-white"
            >
              <ShieldCheck size={16} />
              Gerar Chave
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}