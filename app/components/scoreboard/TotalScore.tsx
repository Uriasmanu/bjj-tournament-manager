interface TotalScoreProps {
  total: number
  isLight?: boolean
}

export function TotalScore({ total, isLight = false }: TotalScoreProps) {
  const formattedTotal = total.toString().padStart(2, "0")

  return (
    <div className="flex flex-col items-center justify-center pr-4">
      <span className={`text-xs font-bold uppercase tracking-widest mb-1 ${isLight ? "text-gray-500" : "text-blue-200"}`}>
        Pontos
      </span>
      <span className={`text-[11rem] font-black leading-none font-mono tracking-tighter ${
        isLight ? "text-black" : "text-white"
      }`}>
        {formattedTotal}
      </span>
    </div>
  )
}