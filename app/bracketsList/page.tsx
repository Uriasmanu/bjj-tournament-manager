'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, ListChecks, Loader2, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Belt, beltLabels, Bracket } from "@/types";


function calculateAge(dateBirth: string): number {
    if (!dateBirth) return 0;
    const [y, m, d] = dateBirth.split("-").map(Number);
    const birth = new Date(y, m - 1, d);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

function getBeltColor(belt: Belt) {
    switch (belt) {
        case "WHITE": return "bg-gray-200 text-gray-700";
        case "GRAY": return "bg-gray-400 text-white";
        case "YELLOW": return "bg-yellow-200 text-yellow-800";
        case "ORANGE": return "bg-orange-200 text-orange-800";
        case "GREEN": return "bg-green-200 text-green-800";
        case "BLUE": return "bg-blue-100 text-blue-700";
        case "PURPLE": return "bg-purple-100 text-purple-700";
        case "BROWN": return "bg-amber-200 text-amber-900";
        case "BLACK": return "bg-gray-900 text-white";
        default: return "bg-gray-100 text-gray-600";
    }
}

export default function BracketsListPage() {
    const [brackets, setBrackets] = useState<Bracket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            
            
            <header className="bg-[#1A1A1A] text-white p-6 shadow-md">
                <div className="max-w-5xl mx-auto flex items-center justify-between w-full">
                    <div>
                        <Link href="/" className="text-xs text-gray-400 flex items-center gap-2 mb-2 hover:text-white transition-colors">
                            <ArrowLeft size={14} />
                            VOLTAR
                        </Link>

                        <h1 className="text-2xl font-black flex items-center gap-2">
                            <Trophy className="text-[#D4AF37]" />
                            Chaves Geradas
                        </h1>
                    </div>

                    <Button
                        asChild
                        className="bg-[#D4AF37] text-black hover:bg-yellow-500 font-bold"
                    >
                        <Link href="/brackets">
                            <ListChecks size={16} className="mr-2" />
                            Nova Chave
                        </Link>
                    </Button>
                </div>
            </header>

            
            <main className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col gap-6">

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Loader2 className="animate-spin mb-2" size={32} />
                        <span>Carregando chaves...</span>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <AlertTriangle size={18} />
                        <span>{error}</span>
                    </div>
                ) : brackets.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <Trophy size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Nenhuma chave encontrada.</p>
                    </div>
                ) : (
                    brackets.map((bracket) => (
                        <Card key={bracket.id} className="bg-white border shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-5 flex flex-col gap-4">

                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <h2 className="text-lg font-bold text-gray-800">
                                            {bracket.title}
                                        </h2>
                                        <span className="text-[10px] text-gray-400 uppercase font-medium">
                                            Criada em: {new Date(bracket.createdAt).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>

                                    <span className={`text-xs font-bold px-3 py-1 rounded shadow-sm ${getBeltColor(bracket.belt as Belt)}`}>
                                        {beltLabels[bracket.belt as Belt] || bracket.belt}
                                    </span>
                                </div>

                                {bracket.metadata && (
                                    <div className="flex gap-2">
                                        <Badge variant="outline" className="text-[10px] text-gray-500 border-gray-200">
                                            Min: {bracket.metadata.weightRange.min}kg / Max: {bracket.metadata.weightRange.max}kg
                                        </Badge>
                                        <Badge variant="outline" className="text-[10px] text-gray-500 border-gray-200">
                                            {bracket.metadata.totalCompetitors} Atletas
                                        </Badge>
                                    </div>
                                )}

                                <div className="pt-2 border-t flex justify-end">
                                    <Link href={`/brackets/${bracket.id}`}>
                                        <Button size="sm" variant="ghost" className="text-blue-600 font-bold hover:text-blue-700 p-0">
                                            VISUALIZAR CHAVE COMPLETA →
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}

            </main>
        </div>
    );
}