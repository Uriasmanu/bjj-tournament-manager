// src/app/gerar-chaves/page.tsx
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
    CheckCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function GerarChavesPage() {
    const router = useRouter();
    const [competitors, setCompetitors] = useState<Competitor[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [belt, setBelt] = useState("");
    const [title, setTitle] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const res = await fetch('/api/competitors');
                const data = await res.json();
                setCompetitors(data);
            } catch (e) {
                console.error(e);
                setError("Erro ao carregar competidores");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const atletasOrdenados = [...competitors]
        .filter(c => c.belt === belt)
        .sort((a, b) => {
            const idadeA = calculateAge(a.dateBirth);
            const idadeB = calculateAge(b.dateBirth);

            if (idadeA !== idadeB) {
                return idadeA - idadeB;
            }

            return a.weight - b.weight;
        });

    const toggleAtleta = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
        setError("");
    };

    const handleGenerateBracket = async () => {
        // Validações
        if (selectedIds.length < 2) {
            setError("Selecione pelo menos 2 competidores");
            return;
        }

        if (!title || title.trim() === "") {
            setError("Digite um título para a chave");
            return;
        }

        if (!belt) {
            setError("Selecione uma faixa");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const response = await fetch('/api/brackets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title.trim(),
                    belt: belt,
                    competitorIds: selectedIds // ✅ Enviando os IDs
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao criar chave');
            }

            // Sucesso
            setSelectedIds([]);
            setTitle("");
            setBelt("");
            
            alert(`Chave "${data.title}" criada com sucesso!`);
            
            // Redirecionar para lista de chaves
            setTimeout(() => {
                router.push('/brackets');
            }, 1000);
            
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

    const canGenerate = selectedIds.length >= 2 && title && title.trim() !== "" && belt && !saving;

    return (
        <div className="h-screen bg-gray-50 flex flex-col">
            <header className="bg-[#1A1A1A] text-white p-6 shadow-md">
                <Link href="/" className="text-xs text-gray-400 flex items-center gap-2 mb-2">
                    <ArrowLeft size={14} />
                    VOLTAR
                </Link>
                <h1 className="text-2xl font-black flex items-center gap-2">
                    <Trophy className="text-[#D4AF37]" />
                    Montar Chave
                </h1>
            </header>

            <main className="flex-1 max-w-6xl w-full mx-auto p-6 flex flex-col gap-6 min-h-0">
                <Card className="p-6 flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-gray-200 shadow-sm">
                    <div className="flex gap-4 w-full md:w-auto">
                        <Input
                            placeholder="Título da chave"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setError("");
                            }}
                            className="h-11 w-64 text-gray-900 bg-white"
                        />

                        <Select 
                            onValueChange={(value) => {
                                setBelt(value);
                                setSelectedIds([]);
                                setError("");
                            }} 
                            value={belt}
                        >
                            <SelectTrigger className="h-11 w-48 bg-white border-slate-300 shadow-sm focus:ring-2 focus:ring-[#D4AF37]">
                                <SelectValue placeholder="Selecionar faixa" />
                            </SelectTrigger>

                            <SelectContent className="bg-white border border-slate-300 shadow-xl">
                                {(Object.keys(beltLabels) as Belt[]).map((beltKey) => (
                                    <SelectItem
                                        key={beltKey}
                                        value={beltKey}
                                        className="cursor-pointer py-3 text-gray-900 focus:bg-blue-900 focus:text-white"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-3 h-3 rounded-full border border-slate-400 shrink-0"
                                                style={{ backgroundColor: beltColors[beltKey] }}
                                            />
                                            <span className="font-bold uppercase text-xs">
                                                {beltLabels[beltKey]}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleGenerateBracket}
                        disabled={!canGenerate}
                        className="h-11 px-6 bg-[#1A1A1A] hover:bg-[#D4AF37] hover:text-black text-white font-bold"
                    >
                        {saving ? (
                            <Loader2 size={16} className="animate-spin mr-2" />
                        ) : (
                            <ShieldCheck size={16} className="mr-2" />
                        )}
                        {saving ? "Salvando..." : "Salvar Chave"}
                    </Button>
                </Card>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <AlertTriangle size={16} />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                <Card className="flex-1 flex flex-col min-h-0 bg-white border border-gray-200 shadow-sm">
                    <CardContent className="p-0 flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                <Loader2 className="animate-spin" />
                            </div>
                        ) : !belt ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                <Trophy size={32} className="opacity-50" />
                                <span>Selecione uma faixa para começar</span>
                            </div>
                        ) : atletasOrdenados.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                <Users size={32} className="opacity-50" />
                                <span>Nenhum competidor encontrado para esta faixa</span>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="sticky top-0 bg-gray-100 z-10">
                                    <tr>
                                        <th className="px-6 py-2 w-12"></th>
                                        <th className="px-6 py-2 text-left text-xs text-gray-600">Competidor</th>
                                        <th className="px-6 py-2 text-center text-xs text-gray-600">Peso</th>
                                        <th className="px-6 py-2 text-center text-xs text-gray-600">Faixa</th>
                                        <th className="px-6 py-2 text-center text-xs text-gray-600">Idade</th>
                                        <th className="w-12"></th>
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
                                                <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
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
                                                <td className="px-6 py-3">
                                                    <div className="flex flex-col">
                                                        <span className={`text-sm font-semibold ${isSelected ? 'text-[#B8960F]' : 'text-gray-800'}`}>
                                                            {c.name}
                                                        </span>
                                                        <span className="text-xs text-gray-500 font-medium">{c.team}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <Badge className="bg-gray-100 text-gray-800 border border-gray-200 text-xs">
                                                        {c.weight}kg
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${getBeltColor(c.belt)}`}>
                                                        {beltLabels[c.belt as Belt] || c.belt}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                                                            {idade} anos
                                                        </Badge>
                                                        <span className="text-[9px] font-bold uppercase">
                                                            {idade < 18 ? "Infantil" : idade < 30 ? "Adulto" : "Master"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="pr-6 text-right">
                                                    <ChevronRight size={16} className="text-gray-300" />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </CardContent>

                    <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-gray-700 px-3 py-1 bg-white rounded-full border shadow-sm">
                                <Users size={16} className="text-[#D4AF37]" />
                                <span className="font-bold text-sm">{selectedIds.length} selecionados</span>
                            </div>
                            {selectedIds.length % 2 !== 0 && selectedIds.length > 0 && (
                                <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold bg-amber-50 px-2 py-1 rounded border border-amber-100">
                                    <AlertTriangle size={14} />
                                    Bye automático
                                </div>
                            )}
                            {selectedIds.length >= 2 && (
                                <div className="flex items-center gap-1.5 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded border border-green-100">
                                    <CheckCircle size={14} />
                                    Pronto para gerar
                                </div>
                            )}
                        </div>

                        <Button
                            onClick={handleGenerateBracket}
                            disabled={!canGenerate}
                            className="bg-[#1A1A1A] hover:bg-[#D4AF37] hover:text-black text-white font-bold px-8"
                        >
                            {saving ? (
                                <Loader2 size={16} className="animate-spin mr-2" />
                            ) : (
                                <ShieldCheck size={16} className="mr-2" />
                            )}
                            {saving ? "Gerando..." : "Gerar Chave"}
                        </Button>
                    </div>
                </Card>
            </main>
        </div>
    );
}