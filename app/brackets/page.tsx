"use client"

import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Users,
  Filter,
  ShieldCheck,
  Info,
  Search,
  ChevronRight,
  Trophy,
  AlertTriangle,
  Loader2
} from "lucide-react"
import Link from "next/link"

// --- COMPONENTES SHADCN ---
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Tipo baseado na sua API
interface Competitor {
  id: string;
  name: string;
  team: string;
  weight: string;
  belt: string;
  isActive: boolean;
}

export default function GerarChavesPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [atletas, setAtletas] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Busca os dados da API
  useEffect(() => {
    async function fetchAtletas() {
      try {
        setLoading(true)
        const response = await fetch('/api/competitors')
        const data = await response.json()
        setAtletas(data)
      } catch (error) {
        console.error("Erro ao carregar competidores:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAtletas()
  }, [])

  // Filtro local por nome/equipe (além do filtro da API se desejar implementar)
  const atletasFiltrados = atletas.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.team.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleAtleta = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  return (
    <div className="max-h-screen overflow-hidden bg-gray-50 flex flex-col">

      <header className="bg-gradient-to-r from-[#1A1A1A] to-gray-800 text-white p-6 shadow-xl shrink-0">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/brackets"
            className="group inline-flex items-center text-xs font-bold text-gray-400 hover:text-[#D4AF37] transition-all mb-3 tracking-widest"
          >
            <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            VOLTAR PARA O TORNEIO
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                <Trophy className="text-[#D4AF37]" size={24} />
                Gerar Nova Chave
              </h1>
              <p className="text-gray-400 text-xs font-medium">Configure os parâmetros e selecione os atletas da API.</p>
            </div>
          </div>
        </div>
      </header>


      <main className="max-w-7xl w-full mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">


        <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2">
          <Card className="border-0 shadow-2xl overflow-hidden rounded-xl bg-white">
            <CardHeader className="bg-[#1A1A1A] text-white py-4">
              <CardTitle className="text-xs font-bold flex items-center gap-2 uppercase tracking-[0.2em]">
                <Filter size={16} className="text-[#D4AF37]" /> Parâmetros
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Título da Chave</label>
                <Input placeholder="Ex: Adulto / Azul / Pena" className="h-11 bg-gray-50" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Graduação</label>
                <Select>
                  <SelectTrigger className="h-11 bg-gray-50">
                    <SelectValue placeholder="Selecione a faixa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WHITE">BRANCA</SelectItem>
                    <SelectItem value="BLUE">AZUL</SelectItem>
                    <SelectItem value="PURPLE">ROXA</SelectItem>
                    <SelectItem value="BROWN">MARROM</SelectItem>
                    <SelectItem value="BLACK">PRETA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Peso Mín</label>
                  <Input type="number" placeholder="0.0" className="h-11 bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Peso Máx</label>
                  <Input type="number" placeholder="100.0" className="h-11 bg-gray-50" />
                </div>
              </div>

              <Separator />

              <div className="p-4 bg-[#003366]/5 border-l-4 border-[#003366] rounded-r-lg">
                <div className="flex gap-2 text-[#003366] mb-1">
                  <Info size={16} className="shrink-0" />
                  <p className="text-xs font-bold uppercase">Validação</p>
                </div>
                <p className="text-[11px] text-gray-600">Apenas competidores ativos são listados por padrão.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 h-full min-h-0">
          <Card className="border-0 shadow-2xl overflow-hidden rounded-xl bg-white h-full flex flex-col">


            <div className="bg-white px-8 py-4 shrink-0">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#D4AF37] rounded-full"></div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Atletas Elegíveis</h3>
                </div>
                <div className="relative w-full md:w-72">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar atleta..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 text-gray-900 h-10 bg-gray-50 border-none text-sm rounded-lg focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
                  />
                </div>
              </div>
            </div>


            <CardContent className="p-0 flex-1 overflow-y-auto scrollbar-thin">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                  <Loader2 className="animate-spin" size={32} />
                  <span className="text-sm font-medium">Carregando competidores...</span>
                </div>
              ) : (
                <div className="min-w-[600px]">
                  <table className="w-full border-collapse">

                    <thead className="bg-white sticky top-0 z-20">
                      <tr className="border-b border-gray-100">
                        <th className="w-16 px-8 py-3 text-left">

                        </th>
                        <th className="px-4 py-3 text-left">
                          <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Competidor / Equipe</span>
                        </th>
                        <th className="px-4 py-3 text-center">
                          <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Peso / Faixa</span>
                        </th>
                        <th className="px-8 py-3 text-right w-20"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {atletasFiltrados.map((atleta) => (
                        <tr
                          key={atleta.id}
                          className={`group hover:bg-[#D4AF37]/5 transition-colors cursor-pointer ${selectedIds.includes(atleta.id) ? 'bg-[#D4AF37]/5' : ''}`}
                          onClick={() => toggleAtleta(atleta.id)}
                        >
                          <td className="px-8 py-4">
                            <Checkbox
                              checked={selectedIds.includes(atleta.id)}
                              className="data-[state=checked]:bg-[#D4AF37] border-gray-300"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm ${selectedIds.includes(atleta.id) ? 'bg-[#D4AF37]' : 'bg-gray-400'}`}>
                                {atleta.name.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className={`text-sm font-bold leading-tight ${selectedIds.includes(atleta.id) ? 'text-[#D4AF37]' : 'text-gray-900'}`}>{atleta.name}</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{atleta.team}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Badge variant="outline" className="font-mono text-[10px] font-bold border-gray-200 text-gray-900">{atleta.weight}kg</Badge>
                              <span className="text-[9px] font-black text-gray-500 uppercase">{atleta.belt}</span>
                            </div>
                          </td>
                          <td className="px-8 py-4 text-right">
                            <ChevronRight size={18} className="inline text-gray-200 group-hover:text-[#D4AF37] transition-all group-hover:translate-x-1" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {atletasFiltrados.length === 0 && (
                    <div className="flex flex-col items-center py-20 text-gray-400">
                      <Users size={40} className="mb-4 opacity-20" />
                      <p className="text-sm font-medium">Nenhum competidor encontrado.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>


            <div className="bg-white px-8 py-5 border-t border-gray-100 shrink-0 mt-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#1A1A1A] p-2 rounded-lg text-[#D4AF37] shadow-lg">
                      <Users size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-black text-gray-900 leading-none">{selectedIds.length}</span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Selecionados</span>
                    </div>
                  </div>

                  {selectedIds.length % 2 !== 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg">
                      <AlertTriangle size={14} className="text-amber-600" />
                      <span className="text-[10px] font-black text-amber-800 uppercase tracking-tighter">Número Ímpar (1 Bye)</span>
                    </div>
                  )}
                </div>

                <Button
                  disabled={selectedIds.length < 2 || loading}
                  className="w-full md:w-auto h-12 px-10 bg-[#1A1A1A] hover:bg-[#D4AF37] hover:text-black text-white font-bold uppercase text-xs tracking-[0.15em] rounded-xl gap-3 transition-all shadow-md active:scale-95"
                >
                  <ShieldCheck size={18} />
                  Gerar Chaveamento
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}