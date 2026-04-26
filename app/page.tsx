'use client'

import { useRouter } from 'next/navigation'
import { Clock, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function MainMenu() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            BJJ <span className="text-amber-500">TOURNAMENT MANAGER</span>
          </h1>
          <p className="text-gray-400">Escolha como deseja utilizar o sistema</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Organizar Torneio Card */}
          <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-all cursor-pointer hover:shadow-lg hover:shadow-blue-500/20">
            <CardHeader className="pb-4">
              <div className="mb-4 p-4 bg-blue-600 w-fit rounded-lg">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Organizar Torneio
              </CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Gerencie competidores, crie chaves, configure áreas de luta e organize todo o torneio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg"
              >
                Acessar Dashboard
              </Button>
            </CardContent>
          </Card>

          {/* Placar Eletrônico Card */}
          <Card className="bg-gray-800 border-gray-700 hover:border-amber-500 transition-all cursor-pointer hover:shadow-lg hover:shadow-amber-500/20">
            <CardHeader className="pb-4">
              <div className="mb-4 p-4 bg-amber-600 w-fit rounded-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Placar Eletrônico
              </CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Controle em tempo real das lutas ativas, pontuação BJJ e cronômetro para projeção em TV
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push('/scoreboard')}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-6 text-lg"
              >
                Abrir Placar
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}