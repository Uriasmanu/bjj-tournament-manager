'use client'

import React from 'react'
import {
  Trophy, Users, Swords, MapPin, Shield,
  Clock, LayoutGrid, Settings, Download,
  Activity, Calendar, Loader2, Brackets
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MenuCard } from '@/components/MenuCard'
import { StatsCard } from '@/components/StatsCard'

export default function Dashboard() {
  const [isExporting, setIsExporting] = React.useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsExporting(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header com fundo branco e borda suave */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              {/* Ícone em azul */}
              <div className="p-2 bg-blue-600 rounded-lg shadow-sm">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2">
                  BJJ <span className="text-blue-600">TOURNAMENT</span>
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-none gap-1 font-medium">
                    <Activity className="w-3 h-3" /> Ativo
                  </Badge>
                  <span className="text-slate-300">|</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold uppercase tracking-wider">
                    <Calendar className="w-3 h-3 text-blue-600" /> 15 Março 2024
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full lg:w-auto">
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={isExporting}
                className="border-slate-200 text-slate-600 hover:bg-slate-50 flex-1 lg:flex-none font-semibold"
              >
                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4 text-blue-600" />}
                Exportar
              </Button>
              <Button className="bg-slate-950 text-white hover:bg-blue-700 transition-colors gap-2 flex-1 lg:flex-none font-bold">
                <Settings className="h-4 w-4" /> Configurações
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Seção de Estatísticas - Cards brancos com bordas sutis */}
        <section className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Atletas" value="128" trend="+12" icon={Users} className="bg-white border-slate-200 shadow-sm" />
            <StatsCard title="Chaves Ativas" value="12" trend="4 categorias" icon={Swords} className="bg-white border-slate-200 shadow-sm" />
            <StatsCard title="Áreas de Luta" value="4" status="todas ativas" icon={MapPin} className="bg-white border-slate-200 shadow-sm" />
            <StatsCard title="Lutas Concluídas" value="45/120" progress={45 / 120} icon={Activity} className="bg-white border-slate-200 shadow-sm" />
          </div>
        </section>

        {/* Seção de Módulos */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Módulos Operacionais</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* MenuCards agora devem seguir o padrão: Fundo branco, ícones em azul/preto */}
            <MenuCard 
              href="/competitors" title="Competidores" 
              description="Gerencie atletas, inscrições e pesagem." 
              icon={Users} badge="128 ativos" 
              className="hover:border-blue-500 transition-all"
            />
            <MenuCard 
              href="/brackets" title="Chaves" 
              description="Configure chaves por faixa, peso e idade." 
              icon={Brackets} badge="12 chaves" 
              className="hover:border-blue-500 transition-all"
            />
            <MenuCard 
              href="/scoreboard" title="Placar Eletrônico" 
              description="Controle de pontos e cronômetro em tempo real." 
              icon={Clock} highlight status="em uso" 
              className="border-blue-100 bg-blue-50/50"
            />
            <MenuCard 
              href="/areas" title="Áreas de Luta" 
              description="Gerencie tatames e horários de lutas." 
              icon={MapPin} status="4 ativas" 
            />
            <MenuCard 
              href="/referees" title="Árbitros" 
              description="Cadastre e atribua oficiais às áreas de luta." 
              icon={Shield} badge="8 oficiais" 
            />
            <MenuCard 
              href="/results" title="Resultados" 
              description="Acesse relatórios e classificações finais." 
              icon={Trophy} 
            />
          </div>
        </section>
      </main>
    </div>
  )
}