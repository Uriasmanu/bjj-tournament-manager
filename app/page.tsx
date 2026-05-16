import Link from "next/link"
import { Settings, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold text-[#D4AF37] mb-2">BJJ Tournament</h1>
        <p className="text-gray-400 text-lg">Sistema de Gerenciamento de Competições</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-2xl">
        <Link href="/admin" className="flex-1">
          <div className="bg-[#4338CA] hover:bg-[#5a47e8] transition-colors rounded-lg p-8 h-full flex flex-col items-center justify-center gap-4 cursor-pointer shadow-lg">
            <Settings className="w-16 h-16 text-white" />
            <h2 className="text-2xl font-bold text-white">Administração</h2>
            <p className="text-gray-200 text-center">
              Gerencie atletas, lutas e competições
            </p>
          </div>
        </Link>

        <Link href="/scoreboard/setup" className="flex-1">
          <div className="bg-[#4338CA] hover:bg-[#5a47e8] transition-colors rounded-lg p-8 h-full flex flex-col items-center justify-center gap-4 cursor-pointer shadow-lg">
            <Zap className="w-16 h-16 text-white" />
            <h2 className="text-2xl font-bold text-white">Placar</h2>
            <p className="text-gray-200 text-center">
              Acompanhe as lutas em tempo real
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}