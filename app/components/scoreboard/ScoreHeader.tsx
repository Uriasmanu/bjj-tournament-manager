import { MapPin, User } from "lucide-react"

interface ScoreHeaderProps {
  area: string
  arbitro: string
}

export function ScoreHeader({ area, arbitro }: ScoreHeaderProps) {
  return (
    <div className="absolute top-0 left-0 right-0 bg-black/90 border-b border-gray-800 p-3 flex justify-between items-center z-30 px-6">
      <div className="flex items-center gap-2 text-[#D4AF37]">
        <MapPin className="w-5 h-5" />
        <span className="text-xl font-bold tracking-wide">{area}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-300">
        <User className="w-5 h-5" />
        <span className="text-lg font-medium">Árbitro: {arbitro}</span>
      </div>
    </div>
  )
}