import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ScoreboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="bg-black border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#D4AF37] hover:text-[#f0c844] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Voltar</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">🏆 Placar BJJ</h1>
          <div className="w-16"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}
