import { ScoreButton } from "./ScoreButton"
import { VantagemPunicao } from "./VantagemPunicao"
import { TotalScore } from "./TotalScore"
import { BadgeFaixa } from "./BadgeFaixa"

export type AtletaState = {
  montada: number
  passagem: number
  queda: number
  vantagem: number
  punicao: number
}

export type LutadorInfo = {
  nome: string
  faixa: string
  equipe: string
}

interface AtletaCardProps {
  lutador: LutadorInfo
  estado: AtletaState
  onScoreChange: (categoria: keyof AtletaState, valor: number) => void
  isLight?: boolean
  onFinalizacao?: () => void
  onDesclassificacao?: () => void
  cor?: "azul" | "branco"
}

export function AtletaCard({ 
  lutador, 
  estado, 
  onScoreChange, 
  isLight = false,
  onFinalizacao,
  onDesclassificacao,
  cor = "azul"
}: AtletaCardProps) {
  const total = estado.montada + estado.passagem + estado.queda
  const bgColor = isLight ? "bg-white" : "bg-blue-700"
  const textColor = isLight ? "text-black" : "text-white"
  const teamColor = isLight ? "text-gray-500" : "text-blue-200"

  return (
    <div className={`flex-1 ${bgColor} ${textColor} flex flex-col px-8 ${isLight ? "pt-4 pb-16" : "pt-16 pb-4"} justify-center relative`}>
      {/* Botão discreto de Desclassificação */}
      <div className="absolute top-2 right-2 opacity-30 hover:opacity-100 transition-opacity">
        {onDesclassificacao && (
          <button
            onClick={onDesclassificacao}
            className={`text-xs px-2 py-1 rounded font-bold ${
              cor === "azul" 
                ? "bg-blue-900 text-red-300 hover:bg-blue-800" 
                : "bg-gray-200 text-red-600 hover:bg-gray-300"
            }`}
            title="Desclassificação"
          >
            DSQ
          </button>
        )}
      </div>

      <div className="flex justify-between items-center h-full w-full">
        <div className="flex flex-col justify-center max-w-[65%]">
          <div className="text-5xl font-black uppercase tracking-tight mb-1 truncate">
            {lutador.nome}
          </div>
          
          <div className="mb-2">
            <BadgeFaixa faixa={lutador.faixa} />
          </div>
          
          <div className={`text-xl font-bold uppercase tracking-wider mb-4 ${teamColor}`}>
            {lutador.equipe}
          </div>

          <div className="flex items-center gap-4">
            <ScoreButton
              value={4}
              currentValue={estado.montada}
              label="Montada / Costas"
              onIncrement={() => onScoreChange("montada", 4)}
              onDecrement={() => onScoreChange("montada", -4)}
              isLight={isLight}
            />
            <ScoreButton
              value={3}
              currentValue={estado.passagem}
              label="Passagem Guarda"
              onIncrement={() => onScoreChange("passagem", 3)}
              onDecrement={() => onScoreChange("passagem", -3)}
              isLight={isLight}
            />
            <ScoreButton
              value={2}
              currentValue={estado.queda}
              label="Queda/Rasp./Joelho"
              onIncrement={() => onScoreChange("queda", 2)}
              onDecrement={() => onScoreChange("queda", -2)}
              isLight={isLight}
            />
            <VantagemPunicao
              vantagem={estado.vantagem}
              punicao={estado.punicao}
              onVantagemChange={(v) => onScoreChange("vantagem", v)}
              onPunicaoChange={(v) => onScoreChange("punicao", v)}
            />
          </div>
        </div>

        <TotalScore total={total} isLight={isLight} />
      </div>
    </div>
  )
}