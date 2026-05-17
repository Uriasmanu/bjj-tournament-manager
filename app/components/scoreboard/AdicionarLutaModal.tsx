"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AdicionarLutaModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: NovaLutaData) => void
}

export interface NovaLutaData {
  nomeAtleta1: string
  equipe1: string
  nomeAtleta2: string
  equipe2: string
}

export function AdicionarLutaModal({ isOpen, onClose, onSubmit }: AdicionarLutaModalProps) {
  const [nomeAtleta1, setNomeAtleta1] = useState("")
  const [equipe1, setEquipe1] = useState("")
  const [nomeAtleta2, setNomeAtleta2] = useState("")
  const [equipe2, setEquipe2] = useState("")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nomeAtleta1.trim() || !nomeAtleta2.trim()) return

    onSubmit({
      nomeAtleta1: nomeAtleta1.trim(),
      equipe1: equipe1.trim(),
      nomeAtleta2: nomeAtleta2.trim(),
      equipe2: equipe2.trim()
    })

    setNomeAtleta1("")
    setEquipe1("")
    setNomeAtleta2("")
    setEquipe2("")
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Nova Luta Casada</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Atleta Azul *</label>
            <Input
              placeholder="Nome do atleta"
              value={nomeAtleta1}
              onChange={(e) => setNomeAtleta1(e.target.value)}
              required
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Equipe (opcional)</label>
            <Input
              placeholder="Nome da equipe"
              value={equipe1}
              onChange={(e) => setEquipe1(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="border-t border-zinc-700 my-4" />

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Atleta Branco *</label>
            <Input
              placeholder="Nome do atleta"
              value={nomeAtleta2}
              onChange={(e) => setNomeAtleta2(e.target.value)}
              required
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Equipe (opcional)</label>
            <Input
              placeholder="Nome da equipe"
              value={equipe2}
              onChange={(e) => setEquipe2(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-zinc-700 text-gray-300">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-[#4338CA] hover:bg-[#5a47e8]">
              Adicionar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}