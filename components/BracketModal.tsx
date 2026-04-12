import React, { useState, useEffect } from "react";
import { Trophy, X, Medal, Save, RefreshCw } from "lucide-react";
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
  onSave?: (data: BracketData) => Promise<void>;
}

interface BracketData {
  competitors: Competitor[];
  podium: Podium;
  winners: Record<string, string>;
}

/* ================= COMPONENT ================= */

export function BracketModal({ bracket, onClose, onSave }: BracketModalProps) {
  if (!bracket) return null;

  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [podium, setPodium] = useState<Podium>({ first: "", second: "", third: "" });
  const [winners, setWinners] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load bracket data when component mounts
  useEffect(() => {
    loadBracketData();
  }, [bracket]);

  const loadBracketData = async () => {
    setLoading(true);
    try {
      // Try to load saved data first
      const response = await fetch(`/api/brackets/${bracket.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.competitors) setCompetitors(data.competitors);
        if (data.podium) setPodium(data.podium);
        if (data.winners) setWinners(data.winners);
      } else {
        // Initialize with bracket competitors if available
        const initialCompetitors = bracket.competitors?.map((comp, idx) => ({
          id: comp.id || idx + 1,
          name: comp.name || "",
          team: comp.team || "",
        })) || Array.from({ length: 16 }, (_, i) => ({
          id: i + 1,
          name: "",
          team: "",
        }));
        setCompetitors(initialCompetitors);
      }
    } catch (error) {
      console.error("Error loading bracket data:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveBracketData = async () => {
    if (!onSave) return;
    
    setSaving(true);
    try {
      await onSave({
        competitors,
        podium,
        winners,
      });
    } catch (error) {
      console.error("Error saving bracket:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateCompetitor = (index: number, field: keyof Competitor, value: string) => {
    const updated = [...competitors];
    updated[index] = { ...updated[index], [field]: value.toUpperCase() };
    setCompetitors(updated);
    
    // Auto-update podium if this competitor advances
    updatePodiumFromCompetitors(updated);
  };

  const updatePodiumFromCompetitors = (comps: Competitor[]) => {
    // Logic to determine podium from bracket winners
    const finalWinner = winners["final"] || comps.find(c => c.name)?.name || "";
    const runnerUp = winners["semifinal1"] || "";
    const thirdPlace = winners["semifinal2"] || "";
    
    setPodium({
      first: finalWinner,
      second: runnerUp,
      third: thirdPlace,
    });
  };

  const updateWinner = (matchId: string, competitorName: string) => {
    setWinners(prev => ({ ...prev, [matchId]: competitorName.toUpperCase() }));
  };

  const AthleteBox = ({ index, matchId }: { index: number; matchId?: string }) => (
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

  const ProgressBox = ({ 
    matchId, 
    width = "w-40",
    leftMatchId,
    rightMatchId 
  }: { 
    matchId: string; 
    width?: string;
    leftMatchId?: string;
    rightMatchId?: string;
  }) => {
    const winner = winners[matchId] || "";
    
    // Auto-determine winner from child matches
    useEffect(() => {
      if (leftMatchId && rightMatchId && winners[leftMatchId] && winners[rightMatchId]) {
        // This would need actual match logic to determine winner
        // For now, just a placeholder
        if (!winners[matchId]) {
          // You could implement match simulation logic here
        }
      }
    }, [winners, leftMatchId, rightMatchId]);
    
    return (
      <div className={`border-2 border-gray-300 bg-gray-50 ${width} h-10 rounded shadow-inner`}>
        <input
          type="text"
          className="w-full h-full text-[10px] font-bold px-2 outline-none text-center uppercase focus:bg-white transition-colors"
          placeholder="VENCEDOR"
          value={winner}
          onChange={(e) => updateWinner(matchId, e.target.value)}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900/90">
        <div className="bg-white p-8 rounded-lg">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

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
          <div className="flex gap-2">
            {onSave && (
              <button 
                onClick={saveBracketData}
                disabled={saving}
                className="p-2 hover:bg-green-100 rounded-full transition-all text-green-600"
              >
                <Save className={`w-6 h-6 ${saving ? 'animate-pulse' : ''}`} />
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-all">
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Área da Chave com Scroll */}
        <div className="flex-1 overflow-auto p-8 bg-[#f8fafc]">
          <div className="inline-flex items-center min-w-max gap-4 h-full relative">
            
            {/* LADO ESQUERDO */}
            <div className="flex items-center">
              <div className="flex flex-col gap-6">
                {[0, 2, 4, 6].map((i) => (
                  <div key={i} className="flex flex-col gap-2 relative">
                    <AthleteBox index={i} matchId={`round1_left_${i/2}`} />
                    <AthleteBox index={i + 1} matchId={`round1_left_${i/2}_2`} />
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-[60px] border-y-2 border-r-2 border-gray-300 rounded-r-lg" />
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col gap-[112px] ml-8">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="relative">
                    <ProgressBox 
                      matchId={`quarter_left_${i}`}
                      leftMatchId={`round1_left_${i*2}`}
                      rightMatchId={`round1_left_${i*2+1}`}
                    />
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-[120px] border-y-2 border-r-2 border-gray-300 rounded-r-lg" />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-[248px] ml-8">
                {[0, 1].map((i) => (
                  <ProgressBox 
                    key={i}
                    matchId={`semi_left_${i}`}
                    leftMatchId={`quarter_left_${i*2}`}
                    rightMatchId={`quarter_left_${i*2+1}`}
                  />
                ))}
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
                  <ProgressBox 
                    matchId="final_left"
                    leftMatchId="semi_left_0"
                    rightMatchId="semi_left_1"
                  />
                  <ProgressBox 
                    matchId="final_right"
                    leftMatchId="semi_right_0"
                    rightMatchId="semi_right_1"
                  />
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
              <div className="flex flex-col gap-6">
                {[8, 10, 12, 14].map((i) => (
                  <div key={i} className="flex flex-col gap-2 relative">
                    <AthleteBox index={i} matchId={`round1_right_${(i-8)/2}`} />
                    <AthleteBox index={i + 1} matchId={`round1_right_${(i-8)/2}_2`} />
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-[60px] border-y-2 border-l-2 border-gray-300 rounded-l-lg" />
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col gap-[112px] mr-8">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="relative">
                    <ProgressBox matchId={`quarter_right_${i}`} />
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-[120px] border-y-2 border-l-2 border-gray-300 rounded-l-lg" />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-[248px] mr-8">
                {[0, 1].map((i) => (
                  <ProgressBox key={i} matchId={`semi_right_${i}`} />
                ))}
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
            {onSave ? "✅ Alterações salvas automaticamente" : "⚠️ Modo visualização - sem salvamento"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BracketModal;