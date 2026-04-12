import React, { useState, useEffect } from "react";
import { Trophy, X } from "lucide-react";
import { Belt, beltLabels, Bracket as GlobalBracket } from "@/types";

/* ================= TYPES ================= */

type Competitor = {
  id: number;
  name: string;
  team: string;
};

type Podium = {
  first: string;
  second: string;
  third: string;
};

// Removido o isOpen daqui para alinhar com a chamada na listagem
interface BracketModalProps {
  bracket: GlobalBracket | null;
  onClose: () => void;
}

/* ================= COMPONENT ================= */

export function BracketModal({
  bracket,
  onClose,
}: BracketModalProps) {
  // O modal só renderiza se houver um bracket selecionado
  if (!bracket) return null;

  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [podium, setPodium] = useState<Podium>({
    first: "",
    second: "",
    third: "",
  });

  useEffect(() => {
    // Inicializa com 16 slots vazios
    const initialCompetitors = Array.from({ length: 16 }, (_, i) => ({
      id: i + 1,
      name: "",
      team: "",
    }));
    
    setCompetitors(initialCompetitors);
    setPodium({ first: "", second: "", third: "" });
  }, [bracket]);

  const updateCompetitor = (
    index: number,
    field: keyof Competitor,
    value: string
  ) => {
    const updated = [...competitors];
    updated[index] = {
      ...updated[index],
      [field]: value.toUpperCase(),
    };
    setCompetitors(updated);
  };

  const AthleteBox = ({ index }: { index: number }) => (
    <div className="flex flex-col border border-gray-400 bg-white w-48 h-12 shadow-sm mb-2 overflow-hidden">
      <input
        type="text"
        placeholder="NOME DO ATLETA"
        className="text-[10px] font-bold px-1 h-1/2 border-b border-gray-200 outline-none focus:bg-blue-50"
        value={competitors[index]?.name || ""}
        onChange={(e) => updateCompetitor(index, "name", e.target.value)}
      />
      <input
        type="text"
        placeholder="ACADEMIA"
        className="text-[8px] px-1 h-1/2 outline-none focus:bg-blue-50 text-gray-600"
        value={competitors[index]?.team || ""}
        onChange={(e) => updateCompetitor(index, "team", e.target.value)}
      />
    </div>
  );

  const ProgressBox = () => (
    <div className="border border-gray-400 bg-white w-40 h-10 shadow-sm">
      <input
        type="text"
        className="w-full h-full text-[10px] font-bold px-1 outline-none text-center uppercase focus:bg-yellow-50"
        placeholder="..."
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-7xl max-h-[95vh] overflow-auto bg-gray-50 rounded-xl shadow-2xl p-8 text-gray-900">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-500" />
        </button>

        <div className="text-center mb-12 uppercase">
          <h1 className="text-3xl font-black tracking-widest text-gray-900">
            {bracket.title}
          </h1>
          <h2 className="text-xl font-bold text-gray-700">
            {beltLabels[bracket.belt as Belt] || bracket.belt}
          </h2>
          <h3 className="text-lg font-semibold text-gray-500">
            {bracket.metadata?.weightRange 
                ? `${bracket.metadata.weightRange.min}KG - ${bracket.metadata.weightRange.max}KG` 
                : "PESO NÃO DEFINIDO"}
          </h3>
        </div>

        <div className="flex justify-between items-center min-w-[1100px] gap-4 pb-8">
          {/* LADO ESQUERDO */}
          <div className="flex items-center gap-8">
            <div className="flex flex-col gap-4">
              {[0, 2, 4, 6].map((i) => (
                <div key={i} className="flex flex-col gap-1">
                  <AthleteBox index={i} />
                  <AthleteBox index={i + 1} />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-[72px]">
              {[0, 1, 2, 3].map((i) => <ProgressBox key={i} />)}
            </div>
            <div className="flex flex-col gap-[168px]">
              {[0, 1].map((i) => <ProgressBox key={i} />)}
            </div>
          </div>

          {/* FINAL */}
          <div className="flex flex-col gap-8 items-center px-4">
            <div className="flex items-center gap-2 font-bold bg-yellow-100 px-6 py-2 rounded-full border border-yellow-200 shadow-sm">
              <Trophy className="w-5 h-5 text-yellow-600" />
              FINAL
            </div>
            <div className="flex gap-4">
              <ProgressBox />
              <ProgressBox />
            </div>
          </div>

          {/* LADO DIREITO */}
          <div className="flex items-center gap-8 flex-row-reverse">
            <div className="flex flex-col gap-4">
              {[8, 10, 12, 14].map((i) => (
                <div key={i} className="flex flex-col gap-1">
                  <AthleteBox index={i} />
                  <AthleteBox index={i + 1} />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-[72px]">
              {[0, 1, 2, 3].map((i) => <ProgressBox key={i} />)}
            </div>
            <div className="flex flex-col gap-[168px]">
              {[0, 1].map((i) => <ProgressBox key={i} />)}
            </div>
          </div>
        </div>

        {/* PÓDIO */}
        <div className="mt-8 max-w-md mx-auto border-t-2 border-gray-900 pt-8">
          <h4 className="text-center font-black mb-6 tracking-widest text-gray-900">
            RESULTADOS DO PÓDIO
          </h4>
          {[
            { label: "1º", key: "first" },
            { label: "2º", key: "second" },
            { label: "3º", key: "third" },
          ].map((pos) => (
            <div key={pos.key} className="flex items-center gap-4 border-b border-gray-400 pb-1 mb-4">
              <span className="font-bold text-lg w-10 text-gray-700">{pos.label}</span>
              <input
                className="flex-1 bg-transparent outline-none font-bold uppercase placeholder:text-gray-300"
                placeholder="NOME DO ATLETA"
                value={podium[pos.key as keyof Podium]}
                onChange={(e) =>
                  setPodium({ ...podium, [pos.key]: e.target.value.toUpperCase() })
                }
              />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-[10px] text-gray-400 uppercase tracking-tighter">
          ⚠️ Warning: Os campos são editáveis diretamente na tela para preenchimento manual durante o evento.
        </div>
      </div>
    </div>
  );
}

export default BracketModal;