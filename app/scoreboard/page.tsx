import Link from "next/link"

export default function ScoreboardPage() {
  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-[#4338CA] to-[#5a47e8] rounded-lg p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-4">Placar ao Vivo</h2>
          <p className="text-gray-100 mb-6">
            Selecione uma luta para acompanhar em tempo real
          </p>
        </div>

        <div className="text-center py-12">
          <p className="text-gray-400 mb-6">Nenhuma luta carregada no momento.</p>
          <Link href="/scoreboard/setup" className="inline-block bg-[#4338CA] hover:bg-[#5a47e8] text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            Carregar Luta
          </Link>
        </div>
      </div>
    </div>
  )
}
