// src/app/api/brackets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readBrackets, writeBrackets, readCompetitors } from '@/lib/storage';
import { Bracket, BracketStatus } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, belt, competitorIds } = body;

        // Validações
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return NextResponse.json(
                { error: 'Título é obrigatório' },
                { status: 400 }
            );
        }

        if (!belt) {
            return NextResponse.json(
                { error: 'Faixa é obrigatória' },
                { status: 400 }
            );
        }

        if (!competitorIds || !Array.isArray(competitorIds) || competitorIds.length < 2) {
            return NextResponse.json(
                { error: 'Selecione pelo menos 2 competidores' },
                { status: 400 }
            );
        }

        // Buscar dados
        const bracketsData = await readBrackets();
        const competitorsData = await readCompetitors();

        // Validar competidores
        const selectedCompetitors = competitorsData.competitors.filter(c => 
            competitorIds.includes(c.id) && c.isActive && c.belt === belt
        );

        if (selectedCompetitors.length !== competitorIds.length) {
            return NextResponse.json(
                { error: 'Alguns competidores são inválidos, estão inativos ou não pertencem à faixa selecionada' },
                { status: 400 }
            );
        }

        // Calcular range de peso
        const weights = selectedCompetitors.map(c => c.weight);
        const weightMin = Math.min(...weights);
        const weightMax = Math.max(...weights);
        const hasBye = selectedCompetitors.length % 2 !== 0;

        // Criar nova chave
        const newBracket: Bracket = {
            id: crypto.randomUUID(),
            title: title.trim(),
            belt,
            competitors: competitorIds, // ✅ Salvando os IDs dos competidores
            matches: [],
            status: 'PENDING',
            refereeId: null,
            areaId: null,
            createdAt: new Date().toISOString(),
            metadata: {
                totalCompetitors: selectedCompetitors.length,
                weightRange: {
                    min: weightMin,
                    max: weightMax
                },
                hasBye
            }
        };

        // Salvar
        bracketsData.brackets.push(newBracket);
        await writeBrackets(bracketsData);

        return NextResponse.json(newBracket, { status: 201 });

    } catch (error) {
        console.error('Erro ao criar chave:', error);
        return NextResponse.json(
            { error: 'Erro interno ao criar chave' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const belt = searchParams.get('belt');
        const status = searchParams.get('status') as BracketStatus | null;
        const id = searchParams.get('id');

        const bracketsData = await readBrackets();
        let brackets = bracketsData.brackets;

        // Buscar chave específica por ID
        if (id) {
            const bracket = brackets.find(b => b.id === id);
            if (!bracket) {
                return NextResponse.json(
                    { error: 'Chave não encontrada' },
                    { status: 404 }
                );
            }

            // Buscar detalhes dos competidores
            const competitorsData = await readCompetitors();
            const competitorsDetails = competitorsData.competitors.filter(c => 
                bracket.competitors.includes(c.id)
            );

            return NextResponse.json({
                ...bracket,
                competitorsDetails
            });
        }

        // Filtrar chaves
        if (belt) {
            brackets = brackets.filter(b => b.belt === belt);
        }

        if (status) {
            brackets = brackets.filter(b => b.status === status);
        }

        // Ordenar por data de criação (mais recente primeiro)
        brackets.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json(brackets);

    } catch (error) {
        console.error('Erro ao buscar chaves:', error);
        return NextResponse.json(
            { error: 'Erro interno ao buscar chaves' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID da chave é obrigatório' },
                { status: 400 }
            );
        }

        const bracketsData = await readBrackets();
        const bracketIndex = bracketsData.brackets.findIndex(b => b.id === id);

        if (bracketIndex === -1) {
            return NextResponse.json(
                { error: 'Chave não encontrada' },
                { status: 404 }
            );
        }

        // Remover chave
        bracketsData.brackets.splice(bracketIndex, 1);
        await writeBrackets(bracketsData);

        return NextResponse.json(
            { message: 'Chave removida com sucesso' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Erro ao deletar chave:', error);
        return NextResponse.json(
            { error: 'Erro interno ao deletar chave' },
            { status: 500 }
        );
    }
}