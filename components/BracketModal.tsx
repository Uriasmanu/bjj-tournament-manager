'use client';

import React, { useState } from 'react';
import { X, ChevronRight, Info, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bracket, Match, Belt, beltLabels } from "@/types";

// Utilitário de cores para as faixas (BJJ Standard)
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

    // Agrupa as lutas por rodada para o desenho horizontal
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative bg-[#f8f9fa] rounded-2xl shadow-2xl max-w-7xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-white/20">
                
                {/* HEADER FIXO */}
                <header className="bg-gray-900 text-white p-5 shrink-0 border-b border-yellow-500/30">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-2">
                                <Trophy className="text-yellow-500" size={20} />
                                {bracket.title}
                            </h2>
                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${BELT_STYLES[bracket.belt] || BELT_STYLES.WHITE}`}>
                                    {beltLabels[bracket.belt as Belt] || bracket.belt}
                                </span>
                                <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                                    {bracket.metadata?.totalCompetitors} Atletas • {bracket.metadata?.weightRange.min}kg - {bracket.metadata?.weightRange.max}kg
                                </span>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10 text-white rounded-full">
                            <X size={24} />
                        </Button>
                    </div>
                </header>

                {/* CONTEÚDO SCROLLÁVEL VERTICAL */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    
                    {/* CHAVE SCROLLÁVEL HORIZONTAL */}
                    <div className="p-6 md:p-10 overflow-x-auto custom-scrollbar bg-white/50">
                        <div className="flex gap-10 min-w-max items-start">
                            {sortedRounds.map((round) => (
                                <div key={round} className="flex flex-col gap-6 w-[260px]">
                                    {/* Título da Rodada */}
                                    <div className="text-center">
                                        <h3 className="font-black text-gray-400 text-xs uppercase tracking-widest mb-2">
                                            {round === maxRound ? "Disputa Final" : `Rodada ${round}`}
                                        </h3>
                                        <div className="h-1 bg-yellow-500 w-8 mx-auto rounded-full"></div>
                                    </div>

                                    {/* Lista de Lutas da Rodada */}
                                    <div className="flex flex-col gap-6">
                                        {rounds[round].map((match) => (
                                            <div key={match.id} className="relative">
                                                <div 
                                                    onClick={() => setSelectedMatch(match)}
                                                    className={`
                                                        bg-white border-2 rounded-xl p-3 cursor-pointer transition-all duration-200 shadow-sm
                                                        ${match.finished ? 'border-green-500/40 bg-green-50/10' : 'border-gray-200 hover:border-yellow-500'}
                                                        ${selectedMatch?.id === match.id ? 'ring-2 ring-yellow-500 border-yellow-500 shadow-lg' : ''}
                                                    `}
                                                >
                                                    <AthleteLine 
                                                        name={getCompetitorName(match.fighter1)} 
                                                        points={match.score1?.points} 
                                                        isWinner={match.winnerId === match.fighter1 && match.finished} 
                                                    />
                                                    
                                                    <div className="flex items-center gap-2 my-2 opacity-30">
                                                        <div className="h-[1px] bg-gray-400 flex-1"></div>
                                                        <span className="text-[9px] font-bold">VS</span>
                                                        <div className="h-[1px] bg-gray-400 flex-1"></div>
                                                    </div>

                                                    <AthleteLine 
                                                        name={getCompetitorName(match.fighter2)} 
                                                        points={match.score2?.points} 
                                                        isWinner={match.winnerId === match.fighter2 && match.finished} 
                                                    />
                                                </div>

                                                {/* Seta de conexão */}
                                                {round < maxRound && (
                                                    <div className="absolute top-1/2 -right-7 -translate-y-1/2 text-gray-300">
                                                        <ChevronRight size={20} strokeWidth={3} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* DETALHES DA LUTA (Abaixo da chave) */}
                    {selectedMatch && (
                        <div className="m-6 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm animate-in slide-in-from-bottom-4">
                            <h4 className="flex items-center gap-2 text-sm font-black uppercase text-gray-500 mb-6">
                                <Info size={16} className="text-yellow-600" />
                                Resultado Detalhado
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    )}
                </div>

                {/* FOOTER FIXO */}
                <footer className="p-4 bg-gray-100 border-t border-gray-200 flex justify-end shrink-0">
                    <Button onClick={onClose} variant="default" className="bg-gray-900 hover:bg-black text-white px-8 font-bold">
                        Fechar Chave
                    </Button>
                </footer>
            </div>
        </div>
    );
}

// Sub-componentes para clareza
function AthleteLine({ name, points, isWinner }: { name: string, points?: number, isWinner: boolean }) {
    return (
        <div className={`flex items-center justify-between ${isWinner ? 'text-green-700 font-bold' : 'text-gray-600'}`}>
            <span className="text-sm truncate pr-2">{name}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded font-mono ${isWinner ? 'bg-green-100' : 'bg-gray-100 text-gray-400'}`}>
                {points ?? 0}
            </span>
        </div>
    );
}

function AthleteScoreDetail({ name, score, isWinner, side }: any) {
    const winnerStyles = isWinner ? "border-yellow-500 bg-yellow-50/30" : "border-gray-100 bg-white";
    const sideColor = side === 'left' ? "bg-green-600" : "bg-blue-600";

    return (
        <div className={`relative p-5 rounded-xl border-2 transition-all ${winnerStyles}`}>
            {isWinner && (
                <div className="absolute -top-3 left-4 bg-yellow-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase shadow-sm">
                    Vencedor
                </div>
            )}
            <div className={`w-1 h-8 rounded-full mb-3 ${sideColor}`} />
            <div className="text-lg font-black text-gray-900 truncate mb-4">{name}</div>
            
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-50 p-2 rounded-lg text-center">
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Pontos</p>
                    <p className="text-xl font-black text-gray-800">{score?.points || 0}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg text-center">
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Vant.</p>
                    <p className="text-xl font-black text-gray-800">{score?.advantages || 0}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg text-center">
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Penal.</p>
                    <p className="text-xl font-black text-red-500">{score?.penalties || 0}</p>
                </div>
            </div>
        </div>
    );
}