import Link from "next/link"
import { MapPin, User, ArrowLeft } from "lucide-react"

interface ScoreHeaderProps {
  area: string
  arbitro: string
  onArbitroChange?: (value: string) => void
}

export function ScoreHeader({ area, arbitro, onArbitroChange }: ScoreHeaderProps) {
  return (
    <div className="absolute top-0 left-0 right-0 bg-black/90 border-b border-gray-800 p-3 flex justify-between items-center z-30 px-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/scoreboard" 
          className="flex items-center gap-2 text-[#D4AF37] hover:text-[#f0c844] transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="text-lg font-medium">Voltar</span>
        </Link>
        <div className="flex items-center gap-2 text-[#D4AF37] border-l border-gray-700 pl-4">
          <MapPin className="w-5 h-5" />
          <span className="text-xl font-bold tracking-wide">{area}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <User className="w-5 h-5 text-gray-400" />
        {onArbitroChange ? (
          <input
            type="text"
            value={arbitro}
            onChange={(e) => onArbitroChange(e.target.value)}
            placeholder="Nome do árbitro..."
            className="bg-transparent text-gray-300 text-lg font-medium border-none outline-none placeholder-gray-500 w-48"
          />
        ) : (
          <span className="text-lg font-medium text-gray-300">Árbitr: {arbitro}</span>
        )}
      </div>
    </div>
  )
}