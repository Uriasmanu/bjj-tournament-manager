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

        <div className="lg:col-span-8">
          <Card className="border-0 shadow-2xl overflow-hidden rounded-xl bg-white h-full flex flex-col">
            <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-[#D4AF37] rounded-full"></div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                      Atletas Elegíveis
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
                    Selecione os atletas que participarão deste chaveamento
                  </p>
                </div>
                <div className="relative w-full md:w-80">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar atleta por nome ou equipe..."
                    className="pl-11 h-11 bg-white border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 text-sm rounded-lg transition-all text-gray-900"
                  />
                </div>
              </div>
            </div>
            
            <CardContent className="p-0 flex-1 overflow-y-auto">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="border-b border-gray-200">
                      <th className="px-8 py-4 w-12">
                      </th>
                      <th className="px-8 py-4 text-left">
                        <span className="text-[11px] font-black uppercase text-gray-500 tracking-wider">Competidor / Equipe</span>
                      </th>
                      <th className="px-8 py-4 text-center">
                        <span className="text-[11px] font-black uppercase text-gray-500 tracking-wider">Peso</span>
                      </th>
                      <th className="px-8 py-4 text-right">
                        <span className="text-[11px] font-black uppercase text-gray-500 tracking-wider">Status</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {atletasElegiveis.map((atleta, index) => (
                      <tr
                        key={atleta.id}
                        className={`group hover:bg-gradient-to-r hover:from-[#D4AF37]/5 hover:to-transparent transition-all duration-200 cursor-pointer ${selectedIds.includes(atleta.id) ? 'bg-[#D4AF37]/5' : ''
                          }`}
                        onClick={() => toggleAtleta(atleta.id)}
                      >
                        <td className="px-8 py-4">
                          <Checkbox
                            checked={selectedIds.includes(atleta.id)}
                            onCheckedChange={() => toggleAtleta(atleta.id)}
                            className="data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37] border-gray-300"
                          />
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${selectedIds.includes(atleta.id)
                              ? 'from-[#D4AF37] to-[#B8960F]'
                              : 'from-gray-200 to-gray-300'
                              } flex items-center justify-center text-white font-bold text-xs transition-all duration-200`}>
                              {atleta.nome.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className={`text-sm font-bold transition-colors duration-200 ${selectedIds.includes(atleta.id)
                                ? 'text-[#D4AF37]'
                                : 'text-gray-900 group-hover:text-[#003366]'
                                }`}>
                                {atleta.nome}
                              </span>
                              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">
                                {atleta.equipe}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-center">
                          <Badge variant="outline" className={`font-mono text-[11px] font-bold px-3 py-1 rounded-full transition-all duration-200 ${selectedIds.includes(atleta.id)
                            ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]'
                            : 'bg-white text-gray-600 border-gray-200 group-hover:border-[#D4AF37] group-hover:text-[#D4AF37]'
                            }`}>
                            {atleta.peso}
                          </Badge>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <ChevronRight size={18} className={`inline transition-all duration-200 ${selectedIds.includes(atleta.id)
                            ? 'text-[#D4AF37] translate-x-1'
                            : 'text-gray-200 group-hover:text-[#D4AF37] group-hover:translate-x-1'
                            }`} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                
                {atletasElegiveis.length === 0 && (
                  <div className="text-center py-16">
                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">Nenhum atleta encontrado</p>
                    <p className="text-sm text-gray-400 mt-1">Ajuste os filtros para ver mais resultados</p>
                  </div>
                )}
              </div>
            </CardContent>

            
            <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-t border-gray-100 mt-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap items-center gap-8">
                  
                  <div className="flex items-center gap-4 bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100">
                    <div className="bg-[#1A1A1A] p-2.5 rounded-lg text-[#D4AF37]">
                      <Users size={22} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-gray-900 leading-none">{selectedIds.length}</span>
                      <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Atletas Selecionados</span>
                    </div>
                  </div>

                  
                  {selectedIds.length % 2 !== 0 && selectedIds.length > 0 && (
                    <div className="flex items-center gap-2.5 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl shadow-sm">
                      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                        <AlertTriangle size={14} className="text-amber-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-amber-800 uppercase tracking-wide">Número ímpar de atletas</span>
                        <span className="text-[10px] text-amber-600">Um "Bye" será automaticamente adicionado</span>
                      </div>
                    </div>
                  )}

                  
                  {selectedIds.length < 2 && selectedIds.length > 0 && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Info size={16} />
                      <span className="text-[11px] font-medium">Selecione pelo menos 2 atletas</span>
                    </div>
                  )}
                </div>

                <Button
                  disabled={selectedIds.length < 2}
                  className="w-full md:w-auto h-12 px-8 bg-gradient-to-r from-[#1A1A1A] to-gray-800 hover:from-[#D4AF37] hover:to-[#B8960F] hover:text-black text-white font-bold uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl gap-2"
                >
                  <ShieldCheck size={18} />
                  Gerar Chaveamento
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}