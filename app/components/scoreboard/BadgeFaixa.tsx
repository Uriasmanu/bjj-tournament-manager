interface BadgeFaixaProps {
  faixa: string
}

const coresFaixa: Record<string, string> = {
  "Branca": "bg-white text-black border-2 border-gray-300",
  "Azul": "bg-blue-700 text-white",
  "Roxa": "bg-purple-700 text-white",
  "Marrom": "bg-amber-900 text-white",
  "Preta": "bg-black text-white border-2 border-gray-500",
}

export function BadgeFaixa({ faixa }: BadgeFaixaProps) {
  const classes = coresFaixa[faixa] || coresFaixa["Branca"]
  
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${classes}`}>
      Faixa {faixa}
    </span>
  )
}