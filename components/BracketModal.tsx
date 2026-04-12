'use client';

import React, { useState } from 'react';
import { X, Trophy, Info, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bracket, Match, Belt, beltLabels } from "@/types";

// Configurações de cores das faixas (BJJ)
const BELT_STYLES: Record<string, string> = {
    WHITE: "bg-gray-100 text-gray-900 border-gray-300",
    GRAY: "bg-gray-500 text-white border-gray-600",
    YELLOW: "bg-yellow-400 text-gray-900 border-yellow-600",
    ORANGE: "bg-orange-500 text-white border-orange-700",
    GREEN: "bg-green-600 text-white border-green-800",
    BLUE: "bg-blue-600 text-white border-blue-800",
    PURPLE: "bg-purple-600 text-white border-purple-800",
    BROWN: "bg-amber-800 text-white border-amber-900",
    BLACK: "bg-gray-900 text-white border-gray-700",
};

interface BracketModalProps {
    bracket: Bracket | null;
    onClose: () => void;
}

export function BracketModal({ bracket, onClose }: BracketModalProps) {
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

    if (!bracket) return null;

    // Agrupa lutas por rodada
    const getMatchesByRound = () => {
        const rounds: Record<number, Match[]> = {};
        bracket.matches.forEach(match => {
            if (!rounds[match.round]) rounds[match.round] = [];
            rounds[match.round].push(match);
        });
        return rounds;
    };

    const getCompetitorName = (id: string | null) => id ? id.replace('comp-', 'Atleta ') : "A definir";
    
    const rounds = getMatchesByRound();
    const sortedRounds = Object.keys(rounds).map(Number).sort((a, b) => a - b);
    const maxRound = Math.max(...sortedRounds, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative bg-[#f4f4f5] rounded-2xl shadow-2xl max-w-[95vw] w-full max-h-[92vh] flex flex-col overflow-hidden border border-white/10">
                
                {/* HEADER */}
                <header className="bg-gray-900 text-white p-5 shrink-0 border-b-2 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                                <Trophy className="text-yellow-500" size={20} />
                                {bracket.title}
                            </h2>
                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${BELT_STYLES[bracket.belt] || BELT_STYLES.WHITE}`}>
                                    {beltLabels[bracket.belt as Belt] || bracket.belt}
                                </span>
                                <span className="text-[11px] text-gray-400 font-bold uppercase">
                                    {bracket.metadata?.totalCompetitors} Atletas • Categoria {bracket.metadata?.weightRange.max}kg
                                </span>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10 text-white rounded-full">
                            <X size={24} />
                        </Button>
                    </div>
                </header>

                {/* AREA DAS CHAVES */}
                <div className="flex-1 overflow-auto bg-[dotted-grid] bg-white">
                    <div className="p-12 min-w-max">
                        <div className="flex gap-0 items-stretch">
                            {sortedRounds.map((round, roundIdx) => (
                                <div key={round} className="flex flex-col w-[300px] relative">
                                    
                                    {/* Nome da Fase */}
                                    <div className="text-center mb-12">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                                            {round === maxRound ? "Final" : round === maxRound - 1 ? "Semi-Final" : `Rodada ${round}`}
                                        </h3>
                                    </div>

                                    {/* Container de Lutas da Rodada */}
                                    <div className="flex flex-col justify-around flex-1">
                                        {rounds[round].map((match, matchIdx) => (
                                            <div key={match.id} className="relative py-10 flex items-center pr-10">
                                                
                                                {/* Card da Luta */}
                                                <div 
                                                    onClick={() => setSelectedMatch(match)}
                                                    className={`
                                                        w-full z-10 bg-white border-2 rounded-lg shadow-sm cursor-pointer transition-all
                                                        ${match.finished ? 'border-gray-200' : 'border-gray-300 hover:border-yellow-500'}
                                                        ${selectedMatch?.id === match.id ? 'ring-2 ring-yellow-500 border-yellow-500 scale-[1.02] shadow-lg' : ''}
                                                    `}
                                                >
                                                    <AthleteLine 
                                                        name={getCompetitorName(match.fighter1)} 
                                                        points={match.score1?.points} 
                                                        isWinner={match.winnerId === match.fighter1 && match.finished} 
                                                    />
                                                    <div className="h-[1px] bg-gray-100 mx-3" />
                                                    <AthleteLine 
                                                        name={getCompetitorName(match.fighter2)} 
                                                        points={match.score2?.points} 
                                                        isWinner={match.winnerId === match.fighter2 && match.finished} 
                                                    />
                                                </div>

                                                {/* CONECTORES (LINHAS) */}
                                                {round < maxRound && (
                                                    <div className="absolute right-0 w-10 h-full flex items-center">
                                                        {/* Linha Horizontal saindo do card */}
                                                        <div className="w-full h-0.5 bg-gray-300" />
                                                        
                                                        {/* Linha Vertical (Braço) */}
                                                        <div className={`
                                                            absolute right-0 w-0.5 bg-gray-300
                                                            ${matchIdx % 2 === 0 
                                                                ? 'h-1/2 top-1/2' // Metade inferior
                                                                : 'h-1/2 bottom-1/2' // Metade superior
                                                            }
                                                        `} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* DETALHES DA LUTA SELECIONADA */}
                {selectedMatch && (
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 animate-in slide-in-from-bottom-5">
                        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-5">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest flex items-center gap-1">
                                    <Info size={12} /> Detalhes do Confronto
                                </span>
                                <button onClick={() => setSelectedMatch(null)} className="text-gray-400 hover:text-gray-600">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <AthleteScoreDetail 
                                    name={getCompetitorName(selectedMatch.fighter1)} 
                                    score={selectedMatch.score1} 
                                    isWinner={selectedMatch.winnerId === selectedMatch.fighter1}
                                    side="left"
                                />
                                <AthleteScoreDetail 
                                    name={getCompetitorName(selectedMatch.fighter2)} 
                                    score={selectedMatch.score2} 
                                    isWinner={selectedMatch.winnerId === selectedMatch.fighter2}
                                    side="right"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <footer className="p-4 bg-gray-100 border-t border-gray-200 flex justify-end shrink-0">
                    <Button onClick={onClose} className="bg-gray-900 hover:bg-black text-white px-8 font-bold text-xs uppercase">
                        Fechar Visualização
                    </Button>
                </footer>
            </div>
        </div>
    );
}

function AthleteLine({ name, points, isWinner }: { name: string, points?: number, isWinner: boolean }) {
    return (
        <div className={`flex items-center justify-between p-3 ${isWinner ? 'bg-green-50/50' : ''}`}>
            <span className={`text-xs truncate max-w-[180px] ${isWinner ? 'font-black text-gray-900' : 'text-gray-500'}`}>
                {name}
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isWinner ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {points ?? 0}
            </span>
        </div>
    );
}

function AthleteScoreDetail({ name, score, isWinner, side }: any) {
    const sideColor = side === 'left' ? "bg-green-600" : "bg-blue-600";
    return (
        <div className={`p-4 rounded-lg border-2 ${isWinner ? 'border-yellow-500 bg-yellow-50/20' : 'border-gray-100'}`}>
            <div className={`w-full h-1 rounded-full mb-3 ${sideColor}`} />
            <div className="text-sm font-bold text-gray-900 mb-3 truncate">{name}</div>
            <div className="grid grid-cols-3 gap-1">
                <div className="text-center">
                    <p className="text-[8px] text-gray-400 font-bold uppercase">Pts</p>
                    <p className="text-sm font-black">{score?.points || 0}</p>
                </div>
                <div className="text-center">
                    <p className="text-[8px] text-gray-400 font-bold uppercase">Vant</p>
                    <p className="text-sm font-black">{score?.advantages || 0}</p>
                </div>
                <div className="text-center">
                    <p className="text-[8px] text-gray-400 font-bold uppercase text-red-400">Pen</p>
                    <p className="text-sm font-black text-red-500">{score?.penalties || 0}</p>
                </div>
            </div>
        </div>
    );
}