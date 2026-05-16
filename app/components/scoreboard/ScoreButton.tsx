interface ScoreButtonProps {
  value: number
  currentValue: number
  label: string
  onIncrement: () => void
  onDecrement: () => void
  isLight?: boolean
}

export function ScoreButton({ value, currentValue, label, onIncrement, onDecrement, isLight = false }: ScoreButtonProps) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-xs font-bold h-8 text-center flex items-center leading-tight mb-1 ${isLight ? "text-gray-600" : "text-blue-100"}`}>
        {label}
      </span>
      <div className={`border text-5xl py-2 px-4 rounded-md mb-2 text-center font-black min-w-[100px] ${
        isLight ? "bg-gray-100 border-gray-300" : "bg-blue-800 border-blue-600"
      }`}>
        {currentValue}
      </div>
      <div className="flex gap-1.5 w-full">
        <button
          onClick={onIncrement}
          className={`flex-1 py-1 rounded font-extrabold transition-colors ${
            isLight 
              ? "bg-black text-white hover:bg-gray-900" 
              : "bg-white text-blue-700 hover:bg-blue-50"
          }`}
        >
          +{value}
        </button>
        <button
          onClick={onDecrement}
          className={`flex-1 py-1 rounded font-extrabold transition-colors ${
            isLight 
              ? "bg-gray-200 text-black hover:bg-gray-300" 
              : "bg-blue-900 text-white hover:bg-blue-950 border border-blue-600"
          }`}
        >
          -{value}
        </button>
      </div>
    </div>
  )
}