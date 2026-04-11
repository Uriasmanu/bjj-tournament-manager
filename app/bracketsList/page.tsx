'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, ListChecks, Loader2, AlertTriangle, Calendar, Weight, Users, Eye } from "lucide-react";

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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">

            
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

                                        
                                        <Link href={`/brackets/${bracket.id}`} className="md:self-center">
                                            <Button
                                                size="default"
                                                variant="outline"
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
                                                <Eye size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                <span>Visualizar Chave</span>
                                                <span className="hidden md:inline"> Completa</span>
                                            </Button>
                                        </Link>
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
        </div>
    );
}