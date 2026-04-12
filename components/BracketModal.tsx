import React, { useState, useEffect } from "react";
import { Trophy, X, Medal } from "lucide-react";
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

interface BracketModalProps {
  bracket: GlobalBracket | null;
  onClose: () => void;
}

/* ================= COMPONENT ================= */

export function BracketModal({ bracket, onClose }: BracketModalProps) {
  if (!bracket) return null;

  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [podium, setPodium] = useState<Podium>({ first: "", second: "", third: "" });

  useEffect(() => {
    const initialCompetitors = Array.from({ length: 16 }, (_, i) => ({
      id: i + 1,
      name: "",
      team: "",
    }));
    setCompetitors(initialCompetitors);
    setPodium({ first: "", second: "", third: "" });
  }, [bracket]);

  const updateCompetitor = (index: number, field: keyof Competitor, value: string) => {
    const updated = [...competitors];
    updated[index] = { ...updated[index], [field]: value.toUpperCase() };
    setCompetitors(updated);
  };

  // Componente de Atleta com design mais limpo
  const AthleteBox = ({ index }: { index: number }) => (
    <div className="flex flex-col border-2 border-gray-300 bg-white w-44 h-14 shadow-sm rounded-md transition-all focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
      <input
        type="text"
        placeholder="NOME DO ATLETA"
        className="text-[11px] font-bold px-2 h-1/2 border-b border-gray-100 outline-none uppercase"
        value={competitors[index]?.name || ""}
        onChange={(e) => updateCompetitor(index, "name", e.target.value)}
      />
      <input
        type="text"
        placeholder="ACADEMIA"
        className="text-[9px] px-2 h-1/2 outline-none text-gray-500 uppercase italic"
        value={competitors[index]?.team || ""}
        onChange={(e) => updateCompetitor(index, "team", e.target.value)}
      />
    </div>
  );

  // Box de progresso (vencedores das fases)
  const ProgressBox = ({ width = "w-40" }: { width?: string }) => (
    <div className={`border-2 border-gray-300 bg-gray-50 ${width} h-10 rounded shadow-inner`}>
      <input
        type="text"
        className="w-full h-full text-[10px] font-bold px-2 outline-none text-center uppercase focus:bg-white transition-colors"
        placeholder="VENCEDOR"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-2 md:p-6">
      <div className="relative w-full max-w-[98vw] h-[95vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden text-slate-900">
        
        {/* Header Fixo */}
        <div className="flex justify-between items-center p-6 border-b bg-slate-50">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              {bracket.title}
            </h1>
            <div className="flex gap-4 mt-1">
              <span className="px-2 py-0.5 bg-slate-200 rounded text-xs font-bold text-slate-700 uppercase">
                {beltLabels[bracket.belt as Belt] || bracket.belt}
              </span>
              <span className="px-2 py-0.5 bg-blue-100 rounded text-xs font-bold text-blue-700">
                {bracket.metadata?.weightRange 
                  ? `${bracket.metadata.weightRange.min}KG - ${bracket.metadata.weightRange.max}KG` 
                  : "PESO NÃO DEFINIDO"}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-all">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Área da Chave com Scroll */}
        <div className="flex-1 overflow-auto p-8 bg-[#f8fafc]">
          <div className="inline-flex items-center min-w-max gap-4 h-full relative">
            
            {/* LADO ESQUERDO (Oitavas, Quartas, Semi) */}
            <div className="flex items-center">
              {/* Oitavas */}
              <div className="flex flex-col gap-6">
                {[0, 2, 4, 6].map((i) => (
                  <div key={i} className="flex flex-col gap-2 relative">
                    <AthleteBox index={i} />
                    <AthleteBox index={i + 1} />
                    {/* Conector p/ Próxima fase */}
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-[60px] border-y-2 border-r-2 border-gray-300 rounded-r-lg" />
                  </div>
                ))}
              </div>
              
              {/* Quartas */}
              <div className="flex flex-col gap-[112px] ml-8">
                {[0, 1, 2, 3].map((i) => (
                   <div key={i} className="relative">
                      <ProgressBox />
                      <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-[120px] border-y-2 border-r-2 border-gray-300 rounded-r-lg" />
                   </div>
                ))}
              </div>

              {/* Semi-Final */}
              <div className="flex flex-col gap-[248px] ml-8">
                {[0, 1].map((i) => <ProgressBox key={i} />)}
              </div>
            </div>

            {/* CENTRO (FINAL) */}
            <div className="flex flex-col items-center gap-10 px-12">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 font-black bg-amber-100 text-amber-700 px-8 py-3 rounded-xl border-2 border-amber-200 shadow-md">
                  <Trophy className="w-6 h-6" />
                  GRANDE FINAL
                </div>
                <div className="flex gap-6">
                  <ProgressBox width="w-48" />
                  <ProgressBox width="w-48" />
                </div>
              </div>

              {/* Pódio Centralizado */}
              <div className="w-full bg-white p-6 rounded-xl border-2 border-slate-200 shadow-sm">
                <h4 className="text-center font-black text-sm mb-4 tracking-widest text-slate-400">PÓDIO OFICIAL</h4>
                <div className="space-y-3">
                  {[
                    { label: "1º", color: "text-amber-500", key: "first" },
                    { label: "2º", color: "text-slate-400", key: "second" },
                    { label: "3º", color: "text-amber-700", key: "third" },
                  ].map((pos) => (
                    <div key={pos.key} className="flex items-center gap-3 border-b border-slate-100 pb-2">
                      <Medal className={`w-5 h-5 ${pos.color}`} />
                      <span className="font-bold text-sm w-6">{pos.label}</span>
                      <input
                        className="flex-1 text-xs font-bold uppercase outline-none placeholder:text-slate-300"
                        placeholder="NOME DO ATLETA"
                        value={podium[pos.key as keyof Podium]}
                        onChange={(e) => setPodium({ ...podium, [pos.key]: e.target.value.toUpperCase() })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* LADO DIREITO (Espelhado) */}
            <div className="flex flex-row-reverse items-center">
              {/* Oitavas */}
              <div className="flex flex-col gap-6">
                {[8, 10, 12, 14].map((i) => (
                  <div key={i} className="flex flex-col gap-2 relative">
                    <AthleteBox index={i} />
                    <AthleteBox index={i + 1} />
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-[60px] border-y-2 border-l-2 border-gray-300 rounded-l-lg" />
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col gap-[112px] mr-8">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="relative">
                    <ProgressBox />
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-[120px] border-y-2 border-l-2 border-gray-300 rounded-l-lg" />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-[248px] mr-8">
                {[0, 1].map((i) => <ProgressBox key={i} />)}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t flex justify-between items-center text-[10px] text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            MODO DE EDIÇÃO AO VIVO ATIVO
          </div>
          <div className="uppercase tracking-widest">
            ⚠️ Warning: O preenchimento manual não requer salvamento automático
          </div>
        </div>
      </div>
    </div>
  );
}

export default BracketModal;