'use client'

import React from 'react'
import {
  Trophy, Users, Swords, MapPin, Shield,
  Clock, LayoutGrid, Settings, Download,
  ChevronRight, Activity, Calendar, Loader2,
  Brackets
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MenuCard } from '@/components/ui/MenuCard'
import { StatsCard } from '@/components/StatsCard'

export default function Dashboard() {
  const [isExporting, setIsExporting] = React.useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsExporting(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-bjj-gold/10 rounded-lg border border-bjj-gold/30">
                <Trophy className="w-6 h-6 text-bjj-gold" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight uppercase italic">
                  BJJ <span className="text-bjj-gold">Tournament</span> Manager
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="border-green-500/50 text-green-400 gap-1">
                    <Activity className="w-3 h-3" /> Torneio Ativo
                  </Badge>
                  <span className="text-xs text-zinc-500">•</span>
                  <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono uppercase">
                    <Calendar className="w-3 h-3" /> 15 Março 2024
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full lg:w-auto">
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={isExporting}
                className="border-zinc-800 text-zinc-400 hover:text-white flex-1 lg:flex-none"
              >
                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Exportar
              </Button>
              <Button className="bg-bjj-gold text-black hover:bg-yellow-500 gap-2 flex-1 lg:flex-none font-bold italic">
                <Settings className="h-4 w-4" /> Configurações
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Seção de Estatísticas */}
        <section className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Atletas" value="128" trend="+12" icon={Users} />
            <StatsCard title="Chaves Ativas" value="12" trend="4 categorias" icon={Swords} />
            <StatsCard title="Áreas de Luta" value="4" status="todas ativas" icon={MapPin} />
            <StatsCard title="Lutas Concluídas" value="45/120" progress={45 / 120} icon={Activity} />
          </div>
        </section>

        {/* Seção de Módulos */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-bjj-gold" />
              <h2 className="text-xl font-bold uppercase tracking-tight italic">Módulos Operacionais</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MenuCard 
              href="/competitors" title="Competidores" 
              description="Gerencie atletas, inscrições e pesagem." 
              icon={Users} badge="128 ativos" 
            />
            <MenuCard 
              href="/brackets" title="Chaves" 
              description="Configure chaves por faixa, peso e idade." 
              icon={Brackets} badge="12 chaves" 
            />
            <MenuCard 
              href="/scoreboard" title="Placar Eletrônico" 
              description="Controle de pontos e cronômetro em tempo real." 
              icon={Clock} highlight status="em uso" 
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