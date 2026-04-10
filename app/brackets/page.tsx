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

// --- COMPONENTES SHADCN (SIMULADOS PARA O ARQUIVO ÚNICO) ---
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function GerarChavesPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Mock de dados conforme a spec
  const atletasElegiveis = [
    { id: '1', nome: 'Manoela Silva', equipe: 'Alliance', peso: '68.5kg', faixa: 'AZUL' },
    { id: '2', nome: 'Ana Oliveira', equipe: 'Checkmat', peso: '69.2kg', faixa: 'AZUL' },
    { id: '3', nome: 'Beatriz Santos', equipe: 'Gracie Barra', peso: '70.0kg', faixa: 'AZUL' },
    { id: '4', nome: 'Carla Souza', equipe: 'Dream Art', weight: '67.8kg', faixa: 'AZUL' },
    { id: '5', nome: 'Daniela Lima', equipe: 'Nova União', weight: '69.9kg', faixa: 'AZUL' },
  ]

  const toggleAtleta = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER PREMIUM - BACKGROUND ANTHRACITE COM GRADIENTE */}
      <header className="bg-gradient-to-r from-[#1A1A1A] to-gray-800 text-white p-8 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <Link 
            href="/brackets" 
            className="group inline-flex items-center text-xs font-bold text-gray-400 hover:text-[#D4AF37] transition-all mb-4 tracking-widest"
          >
            <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            VOLTAR PARA O TORNEIO
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                <Trophy className="text-[#D4AF37]" size={28} />
                Gerar Nova Chave
              </h1>
              <p className="text-gray-400 text-sm font-medium">Configure os parâmetros e selecione os atletas para o chaveamento.</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 -mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUNA ESQUERDA: CONFIGURAÇÕES (4 COLUNAS) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-0 shadow-2xl overflow-hidden rounded-xl">
            <CardHeader className="bg-[#1A1A1A] text-white py-4">
              <CardTitle className="text-xs font-bold flex items-center gap-2 uppercase tracking-[0.2em]">
                <Filter size={16} className="text-[#D4AF37]" /> Parâmetros da Categoria
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6 bg-white">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Título da Chave</label>
                <Input 
                  placeholder="Ex: Adulto / Azul / Pena" 
                  className="h-12 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Graduação (Faixa)</label>
                <Select>
                  <SelectTrigger className="h-12 bg-gray-50">
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
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Peso Mín (kg)</label>
                  <Input type="number" placeholder="0.0" className="h-12 bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Peso Máx (kg)</label>
                  <Input type="number" placeholder="70.0" className="h-12 bg-gray-50" />
                </div>
              </div>

              <Separator />

              <div className="p-4 bg-[#003366]/5 border-l-4 border-[#003366] rounded-r-lg space-y-2">
                <div className="flex gap-2 text-[#003366]">
                  <Info size={18} className="shrink-0" />
                  <p className="text-xs font-bold leading-tight uppercase tracking-tighter">Regras de Validação</p>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  O sistema filtrará automaticamente atletas que estejam dentro do intervalo de peso e graduação selecionados.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COLUNA DIREITA: LISTA DE ATLETAS (8 COLUNAS) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-0 shadow-2xl overflow-hidden rounded-xl bg-white">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">Atletas Elegíveis</h3>
                <p className="text-xs text-gray-400 font-medium">Selecione quem participará deste chaveamento específico.</p>
              </div>
              <div className="relative w-full md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input placeholder="Buscar atleta..." className="pl-10 h-10 bg-gray-50 border-0 text-sm" />
              </div>
            </div>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black tracking-[0.15em]">
                      <th className="px-6 py-4 w-12">
                        <Checkbox className="border-gray-300" />
                      </th>
                      <th className="px-6 py-4 text-left">Competidor / Equipe</th>
                      <th className="px-6 py-4 text-center">Peso</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {atletasElegiveis.map((atleta) => (
                      <tr 
                        key={atleta.id} 
                        className="group hover:bg-gray-50/80 transition-all cursor-pointer"
                        onClick={() => toggleAtleta(atleta.id)}
                      >
                        <td className="px-6 py-5">
                          <Checkbox 
                            checked={selectedIds.includes(atleta.id)}
                            onCheckedChange={() => toggleAtleta(atleta.id)}
                            className="data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
                          />
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-gray-900 group-hover:text-[#003366] transition-colors">
                              {atleta.nome}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                              {atleta.equipe}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <Badge variant="outline" className="font-mono text-[10px] bg-white text-gray-500 border-gray-200 group-hover:border-[#D4AF37] transition-colors">
                            {atleta.peso}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <ChevronRight size={16} className="inline text-gray-200 group-hover:text-[#D4AF37] transition-all group-hover:translate-x-1" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>

            {/* BARRA DE FINALIZAÇÃO - FOOTER DO CARD */}
            <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="bg-[#1A1A1A] p-2 rounded-lg text-[#D4AF37]">
                    <Users size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-gray-900 leading-none">{selectedIds.length}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Selecionados</span>
                  </div>
                </div>

                {selectedIds.length % 2 !== 0 && selectedIds.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
                    <AlertTriangle size={14} className="text-amber-600" />
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-tighter">Aviso: Número ímpar (Bye Ativo)</span>
                  </div>
                )}
              </div>

              <Button 
                disabled={selectedIds.length < 2}
                className="w-full md:w-auto h-14 px-10 bg-[#1A1A1A] hover:bg-[#D4AF37] hover:text-black text-white font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 disabled:opacity-30"
              >
                <ShieldCheck size={20} className="mr-3" />
                Gerar Chaveamento
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}