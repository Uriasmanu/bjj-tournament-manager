'use client';

import React, { useState } from 'react';
import { X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bracket, Match, Belt, beltLabels } from "@/types";

// Função auxiliar para cores das faixas
function getBeltColor(belt: Belt) {
    switch (belt) {
        case "WHITE": return "bg-gray-100 text-gray-900 border-gray-300";
        case "GRAY": return "bg-gray-500 text-white border-gray-600";
        case "YELLOW": return "bg-yellow-100 text-yellow-900 border-yellow-300";
        case "ORANGE": return "bg-orange-100 text-orange-900 border-orange-300";
        case "GREEN": return "bg-green-100 text-green-900 border-green-300";
        case "BLUE": return "bg-blue-100 text-blue-900 border-blue-300";
        case "PURPLE": return "bg-purple-100 text-purple-900 border-purple-300";
        case "BROWN": return "bg-amber-100 text-amber-900 border-amber-300";
        case "BLACK": return "bg-gray-800 text-white border-gray-700";
        default: return "bg-gray-100 text-gray-900 border-gray-300";
    }
}

interface BracketModalProps {
    bracket: Bracket | null;
    onClose: () => void;
}

export function BracketModal({ bracket, onClose }: BracketModalProps) {
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

    if (!bracket) return null;

    // Função para organizar as lutas por round
    const getMatchesByRound = () => {
        const rounds: { [key: number]: Match[] } = {};
        bracket.matches.forEach(match => {
            if (!rounds[match.round]) {
                rounds[match.round] = [];
            }
            rounds[match.round].push(match);
        });
        return rounds;
    };

    // Função para buscar nome do competidor
    const getCompetitorName = (competitorId: string | null) => {
        if (!competitorId) return "Aguardando";
        // Aqui você pode buscar o nome real do competidor de uma API/contexto
        // Por enquanto, vamos mostrar o ID
        return competitorId.replace('comp-', 'Atleta ');
    };

    // Função para renderizar uma luta
    const renderMatch = (match: Match, round: number, index: number) => {
        const isFinal = round === Math.max(...bracket.matches.map(m => m.round));
        
        return (
            <div key={match.id} className="relative">
                <div 
                    className={`
                        bg-white border-2 rounded-lg p-3 min-w-[200px] cursor-pointer transition-all
                        ${match.finished ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-yellow-500'}
                        ${selectedMatch?.id === match.id ? 'ring-2 ring-yellow-500 shadow-lg' : ''}
                    `}
                    onClick={() => setSelectedMatch(match)}
                >
                    {/* Fighter 1 */}
                    <div className={`
                        flex items-center justify-between p-2 rounded
                        ${match.winnerId === match.fighter1 ? 'bg-green-100 font-bold' : ''}
                    `}>
                        <span className="text-sm text-gray-900">
                            {getCompetitorName(match.fighter1)}
                        </span>
                        {match.score1 && (
                            <span className="font-bold text-gray-900">{match.score1.points}</span>
                        )}
                    </div>
                    
                    {/* VS ou BYE */}
                    <div className="text-center text-xs text-gray-400 my-1">VS</div>
                    
                    {/* Fighter 2 */}
                    <div className={`
                        flex items-center justify-between p-2 rounded
                        ${match.winnerId === match.fighter2 ? 'bg-green-100 font-bold' : ''}
                    `}>
                        <span className="text-sm text-gray-900">
                            {getCompetitorName(match.fighter2)}
                        </span>
                        {match.score2 && (
                            <span className="font-bold text-gray-900">{match.score2.points}</span>
                        )}
                    </div>

                    {/* Status Badge */}
                    {match.finished ? (
                        <div className="mt-2 text-xs text-green-600 font-semibold text-center">
                            Finalizada
                        </div>
                    ) : match.winnerId ? (
                        <div className="mt-2 text-xs text-blue-600 font-semibold text-center">
                            Vitória por pontos
                        </div>
                    ) : (
                        <div className="mt-2 text-xs text-gray-400 text-center">
                            Pendente
                        </div>
                    )}
                </div>

                {/* Conexão para próxima rodada */}
                {!isFinal && (
                    <div className="absolute top-1/2 -right-6 transform -translate-y-1/2">
                        <ChevronRight className="text-gray-400" size={20} />
                    </div>
                )}
            </div>
        );
    };

    const rounds = getMatchesByRound();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative bg-gray-50 rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] flex flex-col">
                
                {/* Header do Modal - Fixo no topo */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 rounded-t-xl flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">{bracket.title}</h2>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-sm border ${getBeltColor(bracket.belt as Belt)}`}>
                                    {beltLabels[bracket.belt as Belt] || bracket.belt}
                                </span>
                                <span className="text-sm text-gray-300">
                                    {bracket.metadata?.totalCompetitors} atletas
                                </span>
                                <span className="text-sm text-gray-300">
                                    {bracket.metadata?.weightRange.min}kg - {bracket.metadata?.weightRange.max}kg
                                </span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-white hover:bg-white/20 flex-shrink-0"
                        >
                            <X size={24} />
                        </Button>
                    </div>
                </div>

                {/* Conteúdo do Modal - Scrollável */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Desenho da Chave - Scroll horizontal independente */}
                    <div className="overflow-x-auto pb-4">
                        <div className="flex justify-start items-start gap-8 min-w-max">
                            {Object.entries(rounds)
                                .sort(([a], [b]) => Number(a) - Number(b))
                                .map(([round, matches]) => (
                                    <div key={round} className="flex flex-col gap-4 min-w-[240px]">
                                        <div className="text-center mb-4">
                                            <h3 className="font-bold text-gray-900 text-lg">
                                                {Number(round) === Math.max(...bracket.matches.map(m => m.round)) 
                                                    ? "FINAL" 
                                                    : `${round}ª Rodada`}
                                            </h3>
                                            <div className="h-0.5 bg-yellow-500 w-12 mx-auto mt-2"></div>
                                        </div>
                                        <div className="flex flex-col gap-6">
                                            {matches.map((match, idx) => renderMatch(match, Number(round), idx))}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Detalhes da Luta Selecionada */}
                    {selectedMatch && (
                        <div className="mt-8 pt-6 border-t-2 border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Detalhes da Luta</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-white rounded-lg p-4 shadow">
                                    <div className="font-semibold text-green-600 mb-2">Atleta 1</div>
                                    <p className="text-gray-900">{getCompetitorName(selectedMatch.fighter1)}</p>
                                    {selectedMatch.score1 && (
                                        <div className="mt-2 text-sm text-gray-600">
                                            Pontos: <span className="font-bold">{selectedMatch.score1.points}</span><br/>
                                            Vantagens: {selectedMatch.score1.advantages}<br/>
                                            Penalidades: {selectedMatch.score1.penalties}
                                        </div>
                                    )}
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow">
                                    <div className="font-semibold text-blue-600 mb-2">Atleta 2</div>
                                    <p className="text-gray-900">{getCompetitorName(selectedMatch.fighter2)}</p>
                                    {selectedMatch.score2 && (
                                        <div className="mt-2 text-sm text-gray-600">
                                            Pontos: <span className="font-bold">{selectedMatch.score2.points}</span><br/>
                                            Vantagens: {selectedMatch.score2.advantages}<br/>
                                            Penalidades: {selectedMatch.score2.penalties}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {selectedMatch.winnerId && (
                                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="text-yellow-800 font-semibold">
                                        Vencedor: {getCompetitorName(selectedMatch.winnerId)}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}