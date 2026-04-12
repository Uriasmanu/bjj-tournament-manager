import React from "react";
import { Trophy, X, Medal } from "lucide-react";
import { Belt, beltLabels, Bracket } from "@/types";

interface BracketModalProps {
  bracket: Bracket | null;
  onClose: () => void;
}

export function BracketModal({ bracket, onClose }: BracketModalProps) {
  if (!bracket) return null;

  const slots = Array.from({ length: 16 }, (_, i) => ({
    name: bracket.competitors[i]?.name || "",
    team: bracket.competitors[i]?.team || "",
  }));

  const AthleteBox = ({ index }: { index: number }) => {
    const { name, team } = slots[index];
    const isEmpty = !name;

    return (
      <div
        className={`flex flex-col border-2 bg-white w-44 h-14 shadow-sm rounded-md overflow-hidden ${
          isEmpty ? "border-gray-100" : "border-gray-200"
        }`}
      >
        <div
          className={`text-[11px] font-bold px-2 h-1/2 border-b border-gray-50 flex items-center uppercase truncate ${
            isEmpty ? "text-gray-300" : "text-gray-800"
          }`}
        >
          {name || "—"}
        </div>
        <div className="text-[9px] px-2 h-1/2 flex items-center text-gray-400 uppercase italic truncate">
          {team}
        </div>
      </div>
    );
  };

  const ProgressBox = ({ value, width = "w-40" }: { value?: string; width?: string }) => (
    <div
      className={`border-2 border-gray-200 bg-gray-50/50 ${width} h-10 rounded flex items-center justify-center shadow-inner`}
    >
      <span className="text-[10px] font-bold text-gray-600 uppercase truncate px-2">
        {value || ""}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-2 md:p-6 text-slate-900">
      <div className="relative w-full max-w-[98vw] h-[95vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">

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

        <div className="flex-1 overflow-auto p-8 bg-[#f8fafc]">
          <div className="inline-flex items-center min-w-max gap-4 h-full relative">

            <div className="flex items-center">
              <div className="flex flex-col gap-6">
                {[0, 4, 8, 12].map((i) => (
                  <div key={i} className="flex flex-col gap-2 relative">
                    <AthleteBox index={i} />
                    <AthleteBox index={i + 1} />
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-[60px] border-y-2 border-r-2 border-gray-200 rounded-r-lg" />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-[112px] ml-8">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="relative">
                    <ProgressBox value={bracket.winners?.[`quarter_left_${i}`]} />
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-[120px] border-y-2 border-r-2 border-gray-200 rounded-r-lg" />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-[248px] ml-8">
                {[0, 1].map((i) => (
                  <ProgressBox key={i} value={bracket.winners?.[`semi_left_${i}`]} />
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-10 px-12">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 font-black bg-amber-100 text-amber-700 px-8 py-3 rounded-xl border-2 border-amber-200 shadow-md">
                  <Trophy className="w-6 h-6" />
                  GRANDE FINAL
                </div>
                <div className="flex gap-6">
                  <ProgressBox value={bracket.winners?.final_left} />
                  <ProgressBox value={bracket.winners?.final_right} />
                </div>
              </div>

              <div className="w-full bg-white p-6 rounded-xl border-2 border-slate-200 shadow-sm">
                <h4 className="text-center font-black text-sm mb-4 tracking-widest text-slate-400">
                  PÓDIO OFICIAL
                </h4>
                <div className="space-y-3">
                  {[
                    { label: "1º", color: "text-amber-500", key: "first" },
                    { label: "2º", color: "text-slate-400", key: "second" },
                    { label: "3º", color: "text-amber-700", key: "third" },
                  ].map((pos) => (
                    <div key={pos.key} className="flex items-center gap-3 border-b border-slate-100 pb-2">
                      <Medal className={`w-5 h-5 ${pos.color}`} />
                      <span className="font-bold text-sm w-6">{pos.label}</span>
                      <span className="flex-1 text-xs font-bold uppercase text-slate-700">
                        {bracket.podium?.[pos.key as keyof typeof bracket.podium] || "---"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-row-reverse items-center">
              <div className="flex flex-col gap-6">
                {[2, 6, 10, 14].map((i) => (
                  <div key={i} className="flex flex-col gap-2 relative">
                    <AthleteBox index={i} />
                    <AthleteBox index={i + 1} />
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-[60px] border-y-2 border-l-2 border-gray-200 rounded-l-lg" />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-[112px] mr-8">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="relative">
                    <ProgressBox value={bracket.winners?.[`quarter_right_${i}`]} />
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-[120px] border-y-2 border-l-2 border-gray-200 rounded-l-lg" />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-[248px] mr-8">
                {[0, 1].map((i) => (
                  <ProgressBox key={i} value={bracket.winners?.[`semi_right_${i}`]} />
                ))}
              </div>
            </div>

          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t flex justify-end text-[10px] text-slate-400 font-medium">
          <div className="uppercase tracking-widest">Modo de Visualização</div>
        </div>
      </div>
    </div>
  );
}

export default BracketModal;