"use client"

import React, { useState } from 'react'
import {
  ArrowLeft,
  Users,
  Filter,
  Plus,
  ShieldCheck,
  Info,
  Search,
  ChevronRight,
  Trophy,
  AlertTriangle
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

export default function GerarChavesPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const atletasElegiveis = [
    { id: '1', nome: 'Manoela Silva', equipe: 'Alliance', peso: '68.5kg', faixa: 'AZUL' },
    { id: '2', nome: 'Ana Oliveira', equipe: 'Checkmat', peso: '69.2kg', faixa: 'AZUL' },
    { id: '3', nome: 'Beatriz Santos', equipe: 'Gracie Barra', peso: '70.0kg', faixa: 'AZUL' },
    { id: '4', nome: 'Carla Souza', equipe: 'Dream Art', weight: '67.8kg', faixa: 'AZUL' },
    { id: '5', nome: 'Daniela Lima', equipe: 'Nova União', weight: '69.9kg', faixa: 'AZUL' },
    { id: '6', nome: 'Fernanda Rocha', equipe: 'Alliance', peso: '65.5kg', faixa: 'AZUL' },
    { id: '7', nome: 'Juliana Paes', equipe: 'Checkmat', peso: '66.2kg', faixa: 'AZUL' },
    { id: '8', nome: 'Patrícia Amorim', equipe: 'Gracie Barra', peso: '71.0kg', faixa: 'AZUL' },
  ]

  const toggleAtleta = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  return (
    <div className="max-h-screen overflow-hidden bg-gray-50 flex flex-col">
      {/* HEADER FIXO */}
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
              <p className="text-gray-400 text-xs font-medium">Configure os parâmetros e selecione os atletas.</p>
            </div>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL COM ALTURA CALCULADA */}
      <main className="max-w-7xl w-full mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* COLUNA ESQUERDA - FILTROS (SCROLL INDEPENDENTE SE NECESSÁRIO) */}
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
                  <Input type="number" placeholder="70.0" className="h-11 bg-gray-50" />
                </div>
              </div>

              <Separator />

              <div className="p-4 bg-[#003366]/5 border-l-4 border-[#003366] rounded-r-lg">
                <div className="flex gap-2 text-[#003366] mb-1">
                  <Info size={16} className="shrink-0" />
                  <p className="text-xs font-bold uppercase">Validação</p>
                </div>
                <p className="text-[11px] text-gray-600">O sistema filtrará atletas conforme peso e faixa.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COLUNA DIREITA - TABELA COM SCROLL INTERNO */}
        <div className="lg:col-span-8 h-full min-h-0">
          <Card className="border-0 shadow-2xl overflow-hidden rounded-xl bg-white h-full flex flex-col">
            
            {/* SUB-HEADER CARD (FIXO) */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-5 border-b border-gray-100 shrink-0">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#D4AF37] rounded-full"></div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Atletas Elegíveis</h3>
                </div>
                <div className="relative w-full md:w-72">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar atleta..."
                    className="pl-11 h-10 bg-white text-sm rounded-lg"
                  />
                </div>
              </div>
            </div>
            
            {/* ÁREA DE SCROLL DA TABELA */}
            <CardContent className="p-0 flex-1 overflow-y-auto scrollbar-thin">
              <div className="min-w-[600px]">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
                    <tr className="border-b border-gray-200">
                      <th className="px-8 py-3 w-12"></th>
                      <th className="px-8 py-3 text-left text-[11px] font-black uppercase text-gray-500 tracking-wider">Competidor</th>
                      <th className="px-8 py-3 text-center text-[11px] font-black uppercase text-gray-500 tracking-wider">Peso</th>
                      <th className="px-8 py-3 text-right text-[11px] font-black uppercase text-gray-500 tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {atletasElegiveis.map((atleta) => (
                      <tr
                        key={atleta.id}
                        className={`group hover:bg-[#D4AF37]/5 transition-colors cursor-pointer ${selectedIds.includes(atleta.id) ? 'bg-[#D4AF37]/5' : ''}`}
                        onClick={() => toggleAtleta(atleta.id)}
                      >
                        <td className="px-8 py-4">
                          <Checkbox
                            checked={selectedIds.includes(atleta.id)}
                            onCheckedChange={() => toggleAtleta(atleta.id)}
                            className="data-[state=checked]:bg-[#D4AF37] border-gray-300"
                          />
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${selectedIds.includes(atleta.id) ? 'bg-[#D4AF37]' : 'bg-gray-300'}`}>
                              {atleta.nome.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className={`text-sm font-bold ${selectedIds.includes(atleta.id) ? 'text-[#D4AF37]' : 'text-gray-900'}`}>{atleta.nome}</span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase">{atleta.equipe}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-center">
                          <Badge variant="outline" className="font-mono text-[10px] font-bold">{atleta.peso}</Badge>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <ChevronRight size={16} className="inline text-gray-300 group-hover:text-[#D4AF37]" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>

            {/* RODAPÉ DO CARD (FIXO) */}
            <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 shrink-0 mt-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#1A1A1A] p-2 rounded-lg text-[#D4AF37]">
                      <Users size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-black text-gray-900 leading-none">{selectedIds.length}</span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Selecionados</span>
                    </div>
                  </div>

                  {selectedIds.length % 2 !== 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertTriangle size={12} className="text-amber-600" />
                      <span className="text-[10px] font-black text-amber-800 uppercase">Número Ímpar (1 Bye)</span>
                    </div>
                  )}
                </div>

                <Button
                  disabled={selectedIds.length < 2}
                  className="w-full md:w-auto px-8 bg-[#1A1A1A] hover:bg-[#D4AF37] hover:text-black text-white font-bold uppercase text-xs tracking-wider rounded-xl gap-2 transition-all"
                >
                  <ShieldCheck size={16} />
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