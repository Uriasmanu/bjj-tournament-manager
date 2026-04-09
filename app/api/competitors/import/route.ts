// src/app/api/competitors/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readCompetitors, writeCompetitors } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

const VALID_BELTS = [
    'WHITE', 'GRAY', 'YELLOW', 'ORANGE', 'GREEN',
    'BLUE', 'PURPLE', 'BROWN', 'BLACK'
];

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!Array.isArray(body)) {
            return NextResponse.json(
                { error: 'Formato inválido. Esperado um array JSON.' },
                { status: 400 }
            );
        }

        const data = await readCompetitors();
        const errors: string[] = [];


        body.forEach((c, index) => {
            const line = index + 1;

            if (!c.name) {
                errors.push(`- Linha ${line}: "${c.name || 'Sem nome'}" - campo 'name' obrigatório`);
            }

            if (!c.team) {
                errors.push(`- Linha ${line}: "${c.name}" - campo 'team' obrigatório`);
            }

            if (typeof c.weight !== 'number' || c.weight <= 0 || c.weight >= 300) {
                errors.push(`- Linha ${line}: "${c.name}" - peso ${c.weight} deve ser entre 0 e 300`);
            }

            if (typeof c.age !== 'number' || c.age < 4 || c.age > 100) {
                errors.push(`- Linha ${line}: "${c.name}" - idade ${c.age} deve ser entre 4 e 100`);
            }

            if (!VALID_BELTS.includes(c.belt)) {
                errors.push(
                    `- Linha ${line}: "${c.name}" - faixa "${c.belt}" inválida`
                );
            }


            const exists = data.competitors.some(
                existing =>
                    existing.name === c.name &&
                    existing.team === c.team &&
                    existing.isActive
            );

            if (exists) {
                errors.push(
                    `- Linha ${line}: "${c.name}" - já existe competidor ativo nesta equipe`
                );
            }
        });


        if (errors.length > 0) {
            return NextResponse.json(
                {
                    error:
                        `❌ Importação cancelada. Os seguintes competidores estão inválidos:\n\n` +
                        errors.join('\n'),
                },
                { status: 400 }
            );
        }


        const now = new Date().toISOString();

        const newCompetitors = body.map(c => ({
            id: uuidv4(),
            name: c.name,
            team: c.team,
            weight: c.weight,
            age: c.age,
            belt: c.belt,
            coach: c.coach || null,
            registrationDate: now,
            isActive: true,
        }));

        data.competitors.push(...newCompetitors);

        await writeCompetitors(data);

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json(
            { error: 'Erro ao processar arquivo' },
            { status: 500 }
        );
    }
}