'use client';

import React, { useState } from 'react';
import { X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bracket, Match, Belt, beltLabels } from "@/types";
import { useCompetitor } from "@/hooks/useCompetitor"; // Importe o hook acima

interface BracketModalProps {
    bracket: Bracket | null;
    onClose: () => void;
}

// Sub-componente para exibir Nome e Equipe via ID
function AthleteDisplay({ id }: { id: string | null }) {
    const { data, loading } = useCompetitor(id);

    if (!id || id.startsWith('bye')) return <span className="text-gray-400 italic">Aguardando</span>;
    if (loading) return <span className="animate-pulse text-gray-300 italic">Carregando...</span>;
    
    return (
        <div className="flex flex-col leading-tight overflow-hidden text-left">
            <span className="truncate font-semibold">{data?.name || "Desconhecido"}</span>
            {data?.team && (
                <span className="text-[10px] opacity-60 truncate uppercase font-normal">
                    {data.team}
                </span>
            )}
        </div>
    );
}

export function BracketModal({ bracket, onClose }: BracketModalProps) {
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

    if (!bracket) return null;

    const getMatchesByRound = () => {
        const rounds: { [key: number]: Match[] } = {};
        bracket.matches.forEach(match => {
            if (!rounds[match.round]) rounds[match.round] = [];
            rounds[match.round].push(match);
        });
        return rounds;
    };

    const rounds = getMatchesByRound();
    const maxRound = Math.max(...bracket.matches.map(m => m.round));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative bg-gray-50 rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                
                <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">{bracket.title}</h2>
                            <div className="flex items-center gap-3 mt-2">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getBeltColor(bracket.belt as Belt)}`}>
                                    {beltLabels[bracket.belt as Belt] || bracket.belt}
                                </span>
                                <span className="text-sm text-gray-300">{bracket.metadata?.totalCompetitors} atletas</span>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                            <X size={24} />
                        </Button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
                        <div className="flex gap-8 min-w-max px-2">
                            {Object.entries(rounds)
                                .sort(([a], [b]) => Number(a) - Number(b))
                                .map(([round, matches]) => (
                                    <div key={round} className="flex flex-col gap-4 w-[260px]">
                                        <div className="text-center">
                                            <h3 className="font-bold text-gray-900 uppercase">
                                                {Number(round) === maxRound ? "Final" : `${round}ª Rodada`}
                                            </h3>
                                            <div className="h-1 bg-yellow-500 w-8 mx-auto mt-1 rounded-full"></div>
                                        </div>
                                        
                                        <div className="flex flex-col gap-6 justify-around h-full py-4">
                                            {matches.map((match) => (
                                                <MatchItem 
                                                    key={match.id}
                                                    match={match}
                                                    isFinal={Number(round) === maxRound}
                                                    isSelected={selectedMatch?.id === match.id}
                                                    onSelect={() => setSelectedMatch(match)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {selectedMatch && (
                        <MatchDetails 
                            match={selectedMatch} 
                        />
                    )}
                </div>

                <footer className="bg-gray-100 p-4 shrink-0 flex justify-end border-t border-gray-200">
                    <Button variant="outline" onClick={onClose}>Fechar</Button>
                </footer>
            </div>
        </div>
    );
}

function MatchItem({ match, isFinal, isSelected, onSelect }: any) {
    return (
        <div className="relative group">
            <div 
                className={`
                    bg-white border-2 rounded-lg p-3 cursor-pointer transition-all shadow-sm
                    ${match.finished ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-yellow-500'}
                    ${isSelected ? 'ring-2 ring-yellow-500 border-yellow-500 shadow-md scale-[1.02]' : ''}
                `}
                onClick={onSelect}
            >
                <AthleteRow id={match.fighter1} score={match.score1} isWinner={match.winnerId === match.fighter1} />
                <div className="text-center text-[10px] text-gray-400 font-bold my-1">VS</div>
                <AthleteRow id={match.fighter2} score={match.score2} isWinner={match.winnerId === match.fighter2} />
            </div>

            {!isFinal && (
                <div className="absolute top-1/2 -right-6 -translate-y-1/2 text-gray-300">
                    <ChevronRight size={20} />
                </div>
            )}
        </div>
    );
}

function AthleteRow({ id, score, isWinner }: any) {
    return (
        <div className={`flex items-center justify-between p-1.5 rounded min-h-[40px] ${isWinner ? 'bg-green-100 font-bold text-green-800 border-l-4 border-green-500' : 'text-gray-700'}`}>
            <div className="flex-1 min-w-0">
                <AthleteDisplay id={id} />
            </div>
            {score && (
                <div className="ml-2 flex flex-col items-end">
                    <span className="text-xs font-bold">{score.points}</span>
                </div>
            )}
        </div>
    );
}

function MatchDetails({ match }: any) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm animate-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-yellow-500 rounded-full"></span>
                Detalhes do Combate
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
                {[
                    { athlete: match.fighter1, score: match.score1, label: "Atleta 1", color: "border-green-200 bg-green-50/30" },
                    { athlete: match.fighter2, score: match.score2, label: "Atleta 2", color: "border-blue-200 bg-blue-50/30" }
                ].map((item, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border ${item.color}`}>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{item.label}</p>
                        <div className="text-lg mb-2 text-gray-900">
                            <AthleteDisplay id={item.athlete} />
                        </div>
                        {item.score && (
                            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                                <div className="bg-white p-2 rounded shadow-sm">
                                    <p className="text-xs text-gray-500">Pts</p>
                                    <p className="font-bold text-gray-900">{item.score.points}</p>
                                </div>
                                <div className="bg-white p-2 rounded shadow-sm">
                                    <p className="text-xs text-gray-500">Vant</p>
                                    <p className="font-bold text-gray-900">{item.score.advantages}</p>
                                </div>
                                <div className="bg-white p-2 rounded shadow-sm">
                                    <p className="text-xs text-gray-500">Pen</p>
                                    <p className="font-bold text-red-600">{item.score.penalties}</p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function getBeltColor(belt: Belt) {
    const colors: Record<string, string> = {
        WHITE: "bg-gray-100 text-gray-900 border-gray-300",
        GRAY: "bg-gray-500 text-white border-gray-600",
        YELLOW: "bg-yellow-100 text-yellow-900 border-yellow-300",
        ORANGE: "bg-orange-100 text-orange-900 border-orange-300",
        GREEN: "bg-green-100 text-green-900 border-green-300",
        BLUE: "bg-blue-100 text-blue-900 border-blue-300",
        PURPLE: "bg-purple-100 text-purple-900 border-purple-300",
        BROWN: "bg-amber-100 text-amber-900 border-amber-300",
        BLACK: "bg-gray-800 text-white border-gray-700",
    };
    return colors[belt] || colors.WHITE;
}