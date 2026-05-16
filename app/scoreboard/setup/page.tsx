import Link from "next/link"
import { Upload, Plus } from "lucide-react"

export default function ScoreboardSetupPage() {
  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-2">Configurar Luta</h2>
        <p className="text-gray-400 mb-8">Importe dados de uma competição ou crie uma luta manualmente</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Card */}
          <div className="bg-white bg-opacity-5 border border-gray-700 rounded-lg p-8 hover:border-[#4338CA] transition-colors">
            <div className="flex justify-center mb-6">
              <div className="bg-[#4338CA] p-4 rounded-full">
                <Upload className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 text-center">Importar</h3>
            <p className="text-gray-400 text-center mb-6">
              Carregue dados de uma competição já criada
            </p>
            <button className="w-full bg-[#4338CA] hover:bg-[#5a47e8] text-white py-2 rounded-lg font-semibold transition-colors">
              Selecionar Arquivo
            </button>
          </div>

          {/* Manual Setup Card */}
          <div className="bg-white bg-opacity-5 border border-gray-700 rounded-lg p-8 hover:border-[#4338CA] transition-colors">
            <div className="flex justify-center mb-6">
              <div className="bg-[#4338CA] p-4 rounded-full">
                <Plus className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 text-center">Manual</h3>
            <p className="text-gray-400 text-center mb-6">
              Configure uma luta manualmente agora
            </p>
            <button className="w-full bg-[#4338CA] hover:bg-[#5a47e8] text-white py-2 rounded-lg font-semibold transition-colors">
              Criar Luta
            </button>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link href="/scoreboard" className="text-[#D4AF37] hover:text-[#f0c844] transition-colors">
            ← Voltar ao Placar
          </Link>
        </div>
      </div>
    </div>
  )
}
