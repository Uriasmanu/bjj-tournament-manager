'use client';

import React, { useEffect, useState } from 'react';
import {
    ArrowLeft,
    Users,
    ShieldCheck,
    ChevronRight,
    Trophy,
    AlertTriangle,
    Loader2,
    CheckCircle,
    ListChecks,
    BarChart3,
    Lock,
    Sparkles
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Belt, beltLabels, beltColors, Competitor } from "@/types";

function calculateAge(dateBirth: string): number {
    if (!dateBirth) return 0;
    const [year, month, day] = dateBirth.split('-').map(Number);
    const today = new Date();
    const birth = new Date(year, month - 1, day);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

interface BracketInfo {
    id: string;
    title: string;
    belt: string;
    competitorCount: number;
}

export default function GerarChavesPage() {
    const router = useRouter();
    const [competitors, setCompetitors] = useState<Competitor[]>([]);
    const [brackets, setBrackets] = useState<BracketInfo[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [belt, setBelt] = useState("");
    const [error, setError] = useState("");
    const [generatedTitle, setGeneratedTitle] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const [competitorsRes, bracketsRes] = await Promise.all([
                    fetch('/api/competitors'),
                    fetch('/api/brackets')
                ]);

                const competitorsData = await competitorsRes.json();
                const bracketsData = await bracketsRes.json();

                setCompetitors(competitorsData);
                setBrackets(bracketsData);
            } catch (e) {
                console.error(e);
                setError("Erro ao carregar dados");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedIds.length > 0 && belt) {
            const selectedCompetitors = competitors.filter(c => selectedIds.includes(c.id));
            if (selectedCompetitors.length > 0) {
                const weights = selectedCompetitors.map(c => c.weight);
                const minWeight = Math.min(...weights);
                const maxWeight = Math.max(...weights);

                let weightRange = "";
                if (minWeight === maxWeight) {
                    weightRange = `${minWeight}kg`;
                } else {
                    weightRange = `${minWeight}kg - ${maxWeight}kg`;
                }

                const existingBracketsForBelt = brackets.filter(b => b.belt === belt);
                const nextLetter = String.fromCharCode(65 + existingBracketsForBelt.length);
                const beltName = beltLabels[belt as Belt] || belt;
                const title = `Chave ${nextLetter} - ${beltName} - ${weightRange}`;
                setGeneratedTitle(title);
            } else {
                setGeneratedTitle("");
            }
        } else {
            setGeneratedTitle("");
        }
    }, [selectedIds, belt, competitors, brackets]);

    const availableCompetitors = competitors.filter(c => !c.alreadyInBracket);
    const getAvailableByBelt = (beltValue: string) => availableCompetitors.filter(c => c.belt === beltValue);
    const atletasDisponiveis = competitors.filter(c => c.belt === belt && !c.alreadyInBracket);
    const atletasIndisponiveis = competitors.filter(c => c.belt === belt && c.alreadyInBracket);
    const atletasOrdenados = [...atletasDisponiveis].sort((a, b) => {
        const idadeA = calculateAge(a.dateBirth);
        const idadeB = calculateAge(b.dateBirth);
        if (idadeA !== idadeB) return idadeA - idadeB;
        return a.weight - b.weight;
    });
    const totalByBelt = (beltValue: string) => competitors.filter(c => c.belt === beltValue).length;
    const bracketsByBelt = (beltValue: string) => brackets.filter(b => b.belt === beltValue);

    const toggleAtleta = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
        setError("");
    };

    const handleGenerateBracket = async () => {
        if (selectedIds.length < 2) {
            setError("Selecione pelo menos 2 competidores");
            return;
        }
        if (!belt) {
            setError("Selecione uma faixa");
            return;
        }
        if (!generatedTitle) {
            setError("Erro ao gerar título da chave");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const response = await fetch('/api/brackets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: generatedTitle,
                    belt: belt,
                    competitorIds: selectedIds
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Erro ao criar chave');

            const [bracketsRes, competitorsRes] = await Promise.all([
                fetch('/api/brackets'),
                fetch('/api/competitors')
            ]);

            const bracketsData = await bracketsRes.json();
            const competitorsData = await competitorsRes.json();

            setBrackets(bracketsData);
            setCompetitors(competitorsData);
            setSelectedIds([]);
            setBelt("");
            setGeneratedTitle("");

            setTimeout(() => router.push('/brackets'), 1000);
        } catch (err: any) {
            console.error('Erro ao gerar chave:', err);
            setError(err.message || 'Erro ao gerar chave. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const getBeltColor = (belt: string) => {
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
    };

    const canGenerate = selectedIds.length >= 2 && belt && !saving && generatedTitle !== "";
    const selectedCompetitorsStats = () => {
        if (selectedIds.length === 0) return null;
        const selected = competitors.filter(c => selectedIds.includes(c.id));
        const weights = selected.map(c => c.weight);
        const minWeight = Math.min(...weights);
        const maxWeight = Math.max(...weights);
        return { minWeight, maxWeight, count: selected.length };
    };
    const stats = selectedCompetitorsStats();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-[#1A1A1A] text-white p-4 md:p-6 shadow-md sticky top-0 z-20">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <Link href="/" className="text-xs text-gray-400 flex items-center gap-2 mb-1 md:mb-2">
                            <ArrowLeft size={14} />
                            VOLTAR
                        </Link>
                        <h1 className="text-xl md:text-2xl font-black flex items-center gap-2">
                            <Trophy className="text-[#D4AF37]" size={20} />
                            Montar Chave
                        </h1>
                    </div>

                    <Button
                        onClick={() => router.push('/bracketsList')}
                        variant="outline"
                        size="sm"
                        className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                    >
                        <ListChecks size={16} className="mr-2" />
                        <span className="hidden sm:inline">Ver Chaves Criadas</span>
                        <span className="sm:hidden">Chaves</span>
                    </Button>
                </div>
            </header>

            <main className="flex-1 max-w-6xl w-full mx-auto p-3 md:p-6 flex flex-col gap-4 md:gap-6">
                {!loading && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                            <CardContent className="p-3 md:p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] md:text-xs text-blue-600 font-semibold uppercase">Total Chaves</p>
                                        <p className="text-xl md:text-2xl font-bold text-blue-900">{brackets.length}</p>
                                    </div>
                                    <BarChart3 className="text-blue-500" size={24} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                            <CardContent className="p-3 md:p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] md:text-xs text-green-600 font-semibold uppercase">Disponíveis</p>
                                        <p className="text-xl md:text-2xl font-bold text-green-900">{availableCompetitors.length}</p>
                                    </div>
                                    <Users className="text-green-500" size={24} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="col-span-2 md:col-span-1 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                            <CardContent className="p-3 md:p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] md:text-xs text-purple-600 font-semibold uppercase">Total</p>
                                        <p className="text-xl md:text-2xl font-bold text-purple-900">{competitors.length}</p>
                                    </div>
                                    <Trophy className="text-purple-500" size={24} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {generatedTitle && (
                    <Card className="bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 border-[#D4AF37]/30">
                        <CardContent className="p-3 md:p-4">
                            <div className="flex items-center gap-2 md:gap-3">
                                <Sparkles className="text-[#D4AF37] shrink-0" size={18} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] md:text-xs text-gray-500 uppercase font-semibold">Título gerado</p>
                                    <p className="text-sm md:text-base font-bold text-gray-800 truncate">{generatedTitle}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="flex flex-col sm:flex-row gap-3 text-gray-800">
                    <Select
                        onValueChange={(value) => {
                            setBelt(value);
                            setSelectedIds([]);
                            setError("");
                        }}
                        value={belt}
                    >
                        <SelectTrigger className="h-10 bg-white border-slate-300 text-gray-800 shadow-sm focus:ring-2 focus:ring-[#D4AF37]">
                            <SelectValue placeholder="Selecionar faixa" />
                        </SelectTrigger>

                        <SelectContent className="bg-white border border-slate-300 shadow-xl">
                            {(Object.keys(beltLabels) as Belt[]).map((beltKey) => {
                                const disponiveis = getAvailableByBelt(beltKey).length;
                                const total = totalByBelt(beltKey);
                                const chaves = bracketsByBelt(beltKey).length;

                                return (
                                    <SelectItem
                                        key={beltKey}
                                        value={beltKey}
                                        disabled={disponiveis === 0}
                                        className="cursor-pointer py-2 text-gray-900"
                                    >
                                        <div className="flex items-center justify-between w-full gap-3">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full border border-slate-400 shrink-0"
                                                    style={{ backgroundColor: beltColors[beltKey] }}
                                                />
                                                <span className="font-bold uppercase text-xs">
                                                    {beltLabels[beltKey]}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                {disponiveis > 0 ? (
                                                    <span className="text-green-600">{disponiveis}/{total}</span>
                                                ) : (
                                                    <span className="text-red-500">0/{total}</span>
                                                )}
                                                {chaves > 0 && (
                                                    <span className="text-blue-500 flex items-center gap-0.5">
                                                        <BarChart3 size={10} />
                                                        {chaves}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>

                    {stats && (
                        <div className="flex items-center gap-2 text-xs">
                            <Badge variant="outline" className="bg-blue-50 whitespace-nowrap text-gray-800 ">
                                {stats.count} atletas
                            </Badge>
                            <Badge variant="outline" className="bg-green-50 whitespace-nowrap text-gray-800">
                                {stats.minWeight === stats.maxWeight ?
                                    `${stats.minWeight}kg` :
                                    `${stats.minWeight}-${stats.maxWeight}kg`}
                            </Badge>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center gap-2">
                        <AlertTriangle size={14} />
                        <span className="text-xs md:text-sm">{error}</span>
                    </div>
                )}

                <Card className="flex-1 flex flex-col min-h-[400px] md:min-h-0 bg-white border border-gray-200 shadow-sm">
                    <CardContent className="p-0 flex-1 overflow-auto">
                        {loading ? (
                            <div className="h-full min-h-[300px] flex items-center justify-center text-gray-400">
                                <Loader2 className="animate-spin mr-2" size={24} />
                                <span>Carregando...</span>
                            </div>
                        ) : !belt ? (
                            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-gray-400 gap-2 p-4">
                                <Trophy size={32} className="opacity-50" />
                                <span className="text-sm">Selecione uma faixa para começar</span>
                            </div>
                        ) : atletasOrdenados.length === 0 ? (
                            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-gray-400 gap-3 p-4">
                                <Lock size={40} className="opacity-30" />
                                <div className="text-center">
                                    <p className="font-semibold text-gray-500 text-sm">
                                        {atletasIndisponiveis.length > 0
                                            ? `Todos os ${atletasIndisponiveis.length} competidores já estão em chaves`
                                            : "Nenhum competidor encontrado"}
                                    </p>
                                    {atletasIndisponiveis.length > 0 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push('/bracketsList')}
                                            className="text-xs mt-3"
                                        >
                                            <ListChecks size={12} className="mr-1" />
                                            Ver chaves existentes
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="bg-gray-50 border-b px-3 md:px-6 py-2 md:py-3 flex flex-wrap justify-between items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] md:text-xs font-bold px-2 py-1 rounded ${getBeltColor(belt)}`}>
                                            {beltLabels[belt as Belt]}
                                        </span>
                                        <span className="text-xs md:text-sm text-gray-600">
                                            <span className="font-semibold text-green-600">{atletasOrdenados.length}</span> disponíveis
                                            {atletasIndisponiveis.length > 0 && (
                                                <span className="text-gray-400 ml-1">
                                                    • {atletasIndisponiveis.length} em chaves
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    {bracketsByBelt(belt).length > 0 && (
                                        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 text-xs">
                                            <BarChart3 size={10} className="mr-1" />
                                            {bracketsByBelt(belt).length} chave(s)
                                        </Badge>
                                    )}
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[500px]">
                                        <thead className="sticky top-0 bg-gray-100 z-10">
                                            <tr>
                                                <th className="px-3 md:px-6 py-2 w-10 md:w-12"></th>
                                                <th className="px-3 md:px-6 py-2 text-left text-[10px] md:text-xs text-gray-600">Competidor</th>
                                                <th className="px-3 md:px-6 py-2 text-center text-[10px] md:text-xs text-gray-600">Peso</th>
                                                <th className="px-3 md:px-6 py-2 text-center text-[10px] md:text-xs text-gray-600">Faixa</th>
                                                <th className="px-3 md:px-6 py-2 text-center text-[10px] md:text-xs text-gray-600">Idade</th>
                                                <th className="w-8 md:w-12"></th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {atletasOrdenados.map((c, index) => {
                                                const idade = calculateAge(c.dateBirth);
                                                const isSelected = selectedIds.includes(c.id);

                                                return (
                                                    <tr
                                                        key={c.id}
                                                        onClick={() => toggleAtleta(c.id)}
                                                        className={`
                                                            cursor-pointer transition-colors
                                                            ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                                            hover:bg-[#D4AF37]/10
                                                            ${isSelected ? 'bg-[#D4AF37]/20' : ''}
                                                        `}
                                                    >
                                                        <td className="px-3 md:px-6 py-2 md:py-3" onClick={(e) => e.stopPropagation()}>
                                                            <Checkbox
                                                                checked={isSelected}
                                                                onCheckedChange={() => toggleAtleta(c.id)}
                                                            className="
                                                                border-gray-400 
                                                                data-[state=checked]:bg-[#D4AF37] 
                                                                data-[state=checked]:border-[#D4AF37] 
                                                                data-[state=checked]:text-black
                                                            "
                                                            />
                                                        </td>
                                                        <td className="px-3 md:px-6 py-2 md:py-3">
                                                            <div className="flex flex-col">
                                                                <span className={`text-xs md:text-sm font-semibold ${isSelected ? 'text-[#B8960F]' : 'text-gray-800'}`}>
                                                                    {c.name}
                                                                </span>
                                                                <span className="text-[10px] md:text-xs text-gray-500">{c.team}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 md:px-6 py-2 md:py-3 text-center">
                                                            <Badge className="bg-gray-100 text-gray-800 border border-gray-200 text-[10px] md:text-xs">
                                                                {c.weight}kg
                                                            </Badge>
                                                        </td>
                                                        <td className="px-3 md:px-6 py-2 md:py-3 text-center">
                                                            <span className={`text-[8px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded ${getBeltColor(c.belt)}`}>
                                                                {beltLabels[c.belt as Belt] || c.belt}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 md:px-6 py-2 md:py-3 text-center">
                                                            <div className="flex flex-col items-center gap-0.5">
                                                                <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] md:text-xs">
                                                                    {idade} anos
                                                                </Badge>
                                                                <span className="text-[8px] md:text-[9px] font-bold">
                                                                    {idade < 18 ? "Infantil" : idade < 30 ? "Adulto" : "Master"}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="pr-3 md:pr-6 text-right">
                                                            <ChevronRight size={14} className="text-gray-300" />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </CardContent>

                    {belt && atletasOrdenados.length > 0 && (
                        <div className="p-3 md:p-4 border-t bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3">
                            <div className="flex items-center gap-2 flex-wrap justify-center">
                                <div className="flex items-center gap-2 text-gray-700 px-2 md:px-3 py-1 bg-white rounded-full border shadow-sm">
                                    <Users size={14} className="text-[#D4AF37]" />
                                    <span className="font-bold text-xs md:text-sm">{selectedIds.length} selecionados</span>
                                </div>
                                {selectedIds.length % 2 !== 0 && selectedIds.length > 0 && (
                                    <div className="flex items-center gap-1 text-amber-600 text-[10px] md:text-xs font-bold bg-amber-50 px-2 py-1 rounded border border-amber-100">
                                        <AlertTriangle size={12} />
                                        Bye
                                    </div>
                                )}
                                {selectedIds.length >= 2 && (
                                    <div className="flex items-center gap-1 text-green-600 text-[10px] md:text-xs font-bold bg-green-50 px-2 py-1 rounded border border-green-100">
                                        <CheckCircle size={12} />
                                        Pronto
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={handleGenerateBracket}
                                disabled={!canGenerate}
                                size="sm"
                                className="bg-[#1A1A1A] hover:bg-[#D4AF37] hover:text-black text-white font-bold px-4 md:px-8"
                            >
                                {saving ? (
                                    <Loader2 size={14} className="animate-spin mr-2" />
                                ) : (
                                    <ShieldCheck size={14} className="mr-2" />
                                )}
                                {saving ? "Gerando..." : "Gerar Chave"}
                            </Button>
                        </div>
                    )}
                </Card>
            </main>
        </div>
    );
}