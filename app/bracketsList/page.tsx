'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, ListChecks, Loader2, AlertTriangle, Calendar, Weight, Users, Eye, X, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Belt, beltLabels, Bracket, Match } from "@/types";

// Componente do Modal/Overlay
function BracketModal({ bracket, onClose }: { bracket: Bracket | null; onClose: () => void }) {
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
            <div className="relative bg-gray-50 rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
                
                {/* Header do Modal */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">{bracket.title}</h2>
                            <div className="flex items-center gap-3 mt-2">
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
                            className="text-white hover:bg-white/20"
                        >
                            <X size={24} />
                        </Button>
                    </div>
                </div>

                {/* Conteúdo do Modal */}
                <div className="overflow-auto p-6">
                    {/* Desenho da Chave */}
                    <div className="flex justify-center items-start gap-8 overflow-x-auto pb-4">
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

                {/* Footer do Modal */}
                <div className="bg-gray-100 p-4 sticky bottom-0 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Fechar
                    </Button>
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900">
                        Editar Chave
                    </Button>
                </div>
            </div>
        </div>
    );
}

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

export default function BracketsListPage() {
    const [brackets, setBrackets] = useState<Bracket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedBracket, setSelectedBracket] = useState<Bracket | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        async function fetchBrackets() {
            try {
                setLoading(true);
                const res = await fetch('/api/brackets');
                if (!res.ok) throw new Error("Erro ao buscar chaves");
                const data = await res.json();
                setBrackets(data);
            } catch (err) {
                console.error(err);
                setError("Não foi possível carregar as chaves.");
            } finally {
                setLoading(false);
            }
        }
        fetchBrackets();
    }, []);

    const handleViewBracket = (bracket: Bracket) => {
        setSelectedBracket(bracket);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
            
            {/* Header (mantido igual) */}
            <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 shadow-lg border-b border-gray-700">
                <div className="max-w-6xl mx-auto flex items-center justify-between w-full">
                    <div>
                        <Link
                            href="/"
                            className="text-gray-300 flex items-center gap-2 mb-3 hover:text-yellow-400 transition-all duration-200 text-sm font-medium group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            VOLTAR PARA DASHBOARD
                        </Link>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/10 rounded-lg">
                                <Trophy className="text-yellow-400" size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight">
                                    Chaves Geradas
                                </h1>
                                <p className="text-gray-400 text-sm mt-1">
                                    Gerencie e visualize todas as chaves de competição
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button
                        asChild
                        className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold shadow-lg transition-all duration-200 hover:scale-105"
                    >
                        <Link href="/brackets">
                            <ListChecks size={16} className="mr-2" />
                            Nova Chave
                        </Link>
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 flex flex-col gap-6">

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="relative">
                            <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
                            <Loader2 className="animate-spin mb-4 text-yellow-600" size={48} />
                        </div>
                        <span className="text-gray-600 font-medium">Carregando chaves...</span>
                        <p className="text-gray-400 text-sm mt-2">Isso pode levar alguns segundos</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-5 py-4 rounded-lg flex items-center gap-3 shadow-sm">
                        <AlertTriangle size={20} className="text-red-500" />
                        <div>
                            <p className="font-semibold">Erro ao carregar</p>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                ) : brackets.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                            <Trophy size={48} className="text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium text-lg">Nenhuma chave encontrada</p>
                        <p className="text-gray-400 text-sm mt-2">Crie sua primeira chave de competição</p>
                        <Button asChild className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-gray-900">
                            <Link href="/brackets">
                                <ListChecks size={16} className="mr-2" />
                                Criar Nova Chave
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-5">
                        {brackets.map((bracket) => (
                            <Card
                                key={bracket.id}
                                className="bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
                            >
                                <div className={`h-1 w-full ${getBeltColor(bracket.belt as Belt).split(' ')[0]}`}></div>

                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 flex-wrap mb-3">
                                                <h2 className="text-xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors">
                                                    {bracket.title}
                                                </h2>
                                                <div className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border ${getBeltColor(bracket.belt as Belt)}`}>
                                                    {beltLabels[bracket.belt as Belt] || bracket.belt}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    <span>
                                                        {new Date(bracket.createdAt).toLocaleDateString('pt-BR', {
                                                            day: '2-digit',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>

                                                {bracket.metadata && (
                                                    <>
                                                        <div className="flex items-center gap-1.5">
                                                            <Weight size={14} className="text-gray-400" />
                                                            <span>
                                                                {bracket.metadata.weightRange.min}kg - {bracket.metadata.weightRange.max}kg
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-1.5">
                                                            <Users size={14} className="text-gray-400" />
                                                            <span className="font-semibold text-gray-700">
                                                                {bracket.metadata.totalCompetitors} atletas
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="md:self-center">
                                            <Button
                                                size="default"
                                                variant="outline"
                                                onClick={() => handleViewBracket(bracket)}
                                                className="
                                                    !bg-transparent
                                                    border-yellow-600 
                                                    text-yellow-700 
                                                    hover:!bg-yellow-600 
                                                    hover:text-white 
                                                    hover:border-yellow-700
                                                    active:scale-[0.98]
                                                    font-bold 
                                                    gap-2 
                                                    transition-all 
                                                    duration-200 
                                                    shadow-sm
                                                    cursor-pointer
                                                "
                                            >
                                                <Eye size={16} className="transition-transform group-hover:scale-110" />
                                                <span>Visualizar Chave</span>
                                                <span className="hidden md:inline"> Completa</span>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {!loading && !error && brackets.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>Total de chaves: <strong className="text-gray-900">{brackets.length}</strong></span>
                        </div>
                    </div>
                )}

            </main>

            {isModalOpen && (
                <BracketModal 
                    bracket={selectedBracket} 
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedBracket(null);
                    }}
                />
            )}
        </div>
    );
}