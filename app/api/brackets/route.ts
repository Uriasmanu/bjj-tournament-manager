
import { NextRequest, NextResponse } from 'next/server';
import { readBrackets, writeBrackets, readCompetitors } from '@/lib/storage';
import { Bracket, BracketStatus, Match } from '@/types';


function createEmptyScore(competitorId: string) {
    return {
        competitorId: competitorId,
        points: 0,
        advantages: 0,
        penalties: 0,
        submission: false
    };
}

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, belt, competitorIds } = body;


        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 });
        }
        if (!belt) {
            return NextResponse.json({ error: 'Faixa é obrigatória' }, { status: 400 });
        }
        if (!competitorIds || !Array.isArray(competitorIds) || competitorIds.length < 2) {
            return NextResponse.json({ error: 'Selecione pelo menos 2 competidores' }, { status: 400 });
        }

        const bracketsData = await readBrackets();
        const competitorsData = await readCompetitors();

        const selectedCompetitors = competitorsData.competitors.filter(c =>
            competitorIds.includes(c.id) && c.isActive && c.belt === belt
        );

        if (selectedCompetitors.length !== competitorIds.length) {
            return NextResponse.json(
                { error: 'Competidores inválidos ou não pertencem à faixa' },
                { status: 400 }
            );
        }

        const weights = selectedCompetitors.map(c => c.weight);
        const weightMin = Math.min(...weights);
        const weightMax = Math.max(...weights);
        const shuffled = shuffleArray(competitorIds);
        const matches: Match[] = [];


        if (shuffled.length === 3) {
            const [A, B, C] = shuffled;
            const match1Id = crypto.randomUUID();
            const match2Id = crypto.randomUUID();


            matches.push({
                id: match1Id,
                fighter1: A,
                fighter2: B,
                score1: createEmptyScore(A),
                score2: createEmptyScore(B),
                winnerId: null,
                round: 1,
                finished: false
            });


            matches.push({
                id: match2Id,
                fighter1: C,
                fighter2: null,
                score1: createEmptyScore(C),
                score2: null,
                dependsOn: { matchId: match1Id, type: 'LOSER' },
                winnerId: null,
                round: 2,
                finished: false
            });


            matches.push({
                id: crypto.randomUUID(),
                fighter1: null,
                fighter2: null,
                score1: null,
                score2: null,
                dependsOn: [
                    { matchId: match1Id, type: 'WINNER' },
                    { matchId: match2Id, type: 'WINNER' }
                ],
                winnerId: null,
                round: 3,
                finished: false
            });

        } else {

            for (let i = 0; i < shuffled.length; i += 2) {
                const f1 = shuffled[i];
                const f2 = shuffled[i + 1] || null;

                matches.push({
                    id: crypto.randomUUID(),
                    fighter1: f1,
                    fighter2: f2,
                    score1: createEmptyScore(f1),
                    score2: f2 ? createEmptyScore(f2) : null,
                    winnerId: f2 ? null : f1,
                    round: 1,
                    finished: f2 ? false : true
                });
            }
        }

        const newBracket: Bracket = {
            id: crypto.randomUUID(),
            title: title.trim(),
            belt,
            competitors: shuffled,
            matches,
            status: 'PENDING',
            refereeId: null,
            areaId: null,
            createdAt: new Date().toISOString(),
            metadata: {
                totalCompetitors: selectedCompetitors.length,
                weightRange: { min: weightMin, max: weightMax },
                hasBye: selectedCompetitors.length % 2 !== 0
            }
        };

        bracketsData.brackets.push(newBracket);
        await writeBrackets(bracketsData);

        return NextResponse.json(newBracket, { status: 201 });

    } catch (error) {
        console.error('Erro ao criar chave:', error);
        return NextResponse.json({ error: 'Erro interno ao criar chave' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const data = await readBrackets();

        return NextResponse.json(data.brackets, { status: 200 });

    } catch (error) {
        console.error('Erro ao buscar chaves:', error);

        return NextResponse.json(
            { error: 'Erro interno ao buscar chaves' },
            { status: 500 }
        );
    }
}