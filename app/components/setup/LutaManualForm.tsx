"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface LutaManualFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: LutaManualData) => void
}

export interface LutaManualData {
  nomeAtleta1: string
  equipe1: string
  faixa1: string
  nomeAtleta2: string
  equipe2: string
  faixa2: string
}

export function LutaManualForm({ isOpen, onClose, onSubmit }: LutaManualFormProps) {
  const [nomeAtleta1, setNomeAtleta1] = useState("")
  const [equipe1, setEquipe1] = useState("")
  const [faixa1, setFaixa1] = useState("")
  const [nomeAtleta2, setNomeAtleta2] = useState("")
  const [equipe2, setEquipe2] = useState("")
  const [faixa2, setFaixa2] = useState("")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nomeAtleta1.trim() || !nomeAtleta2.trim()) return

    onSubmit({
      nomeAtleta1: nomeAtleta1.trim(),
      equipe1: equipe1.trim(),
      faixa1: faixa1,
      nomeAtleta2: nomeAtleta2.trim(),
      equipe2: equipe2.trim(),
      faixa2: faixa2
    })

    setNomeAtleta1("")
    setEquipe1("")
    setFaixa1("")
    setNomeAtleta2("")
    setEquipe2("")
    setFaixa2("")
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Criar Luta Manual</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Atleta 1 *</label>
            <Input
              placeholder="Nome do atleta 1"
              value={nomeAtleta1}
              onChange={(e) => setNomeAtleta1(e.target.value)}
              required
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Equipe 1 (opcional)</label>
            <Input
              placeholder="Nome da equipe"
              value={equipe1}
              onChange={(e) => setEquipe1(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Faixa Atleta 1</label>
            <select
              value={faixa1}
              onChange={(e) => setFaixa1(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white"
            >
              <option value="">Selecione</option>
              <option value="Branca">Branca</option>
              <option value="Azul">Azul</option>
              <option value="Roxa">Roxa</option>
              <option value="Marrom">Marrom</option>
              <option value="Preta">Preta</option>
            </select>
          </div>

          <div className="border-t border-zinc-700 my-4" />

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Atleta 2 *</label>
            <Input
              placeholder="Nome do atleta 2"
              value={nomeAtleta2}
              onChange={(e) => setNomeAtleta2(e.target.value)}
              required
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Equipe 2 (opcional)</label>
            <Input
              placeholder="Nome da equipe"
              value={equipe2}
              onChange={(e) => setEquipe2(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Faixa Atleta 2</label>
            <select
              value={faixa2}
              onChange={(e) => setFaixa2(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white"
            >
              <option value="">Selecione</option>
              <option value="Branca">Branca</option>
              <option value="Azul">Azul</option>
              <option value="Roxa">Roxa</option>
              <option value="Marrom">Marrom</option>
              <option value="Preta">Preta</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-zinc-700 text-gray-700 bg-gray-200 hover:bg-gray-300">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-[#D4AF37] hover:bg-[#f0c844] text-black font-bold">
              Criar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}