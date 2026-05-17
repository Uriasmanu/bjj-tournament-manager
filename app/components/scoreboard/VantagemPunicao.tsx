interface VantagemPunicaoProps {
  vantagem: number
  punicao: number
  onVantagemChange: (delta: number) => void
  onPunicaoChange: (delta: number) => void
}

export function VantagemPunicao({ vantagem, punicao, onVantagemChange, onPunicaoChange }: VantagemPunicaoProps) {
  return (
    <div className="flex gap-3 ml-3">
      <div className="bg-yellow-400 text-black p-3 flex flex-col items-center rounded-lg border-2 border-black min-w-[100px]">
        <span className="text-xs font-black uppercase tracking-wider mb-1">Vantagem</span>
        <div className="flex items-center gap-3">
          <span className="text-4xl font-black font-mono">{vantagem}</span>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onVantagemChange(1)}
              className="bg-white hover:bg-gray-100 text-black px-3 py-1.5 rounded text-lg font-black border border-black/20"
            >
              +
            </button>
            <button
              onClick={() => onVantagemChange(-1)}
              className="bg-white hover:bg-gray-100 text-black px-3 py-1.5 rounded text-lg font-black border border-black/20"
            >
              -
            </button>
          </div>
        </div>
      </div>

      <div className="bg-red-600 text-white p-3 flex flex-col items-center rounded-lg border-2 border-white min-w-[100px]">
        <span className="text-xs font-black uppercase tracking-wider mb-1">Punição</span>
        <div className="flex items-center gap-3">
          <span className="text-4xl font-black font-mono">{punicao}</span>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onPunicaoChange(1)}
              className="bg-white text-red-600 hover:bg-gray-100 px-3 py-1.5 rounded text-lg font-black"
            >
              +
            </button>
            <button
              onClick={() => onPunicaoChange(-1)}
              className="bg-white text-red-600 hover:bg-gray-100 px-3 py-1.5 rounded text-lg font-black"
            >
              -
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}