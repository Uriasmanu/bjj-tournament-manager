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

        const competitors = Array.isArray(body)
            ? body
            : body?.competitors;

        if (!Array.isArray(competitors)) {
            return NextResponse.json(
                { error: 'Formato inválido. Use um array ou { competitors: [] }' },
                { status: 400 }
            );
        }

        const data = await readCompetitors();
        const errors: string[] = [];

        competitors.forEach((c, index) => {
            const line = index + 1;

            const name = c.name?.trim();
            const team = c.team?.trim();
            const weight = Number(c.weight);
            const age = Number(c.age);
            const belt = c.belt;

            if (!name) {
                errors.push(`- Linha ${line}: nome obrigatório`);
            }

            if (!team) {
                errors.push(`- Linha ${line}: "${name}" - equipe obrigatória`);
            }

            if (!weight || weight <= 0 || weight >= 300) {
                errors.push(`- Linha ${line}: "${name}" - peso inválido (${c.weight})`);
            }

            if (!age || age < 4 || age > 100) {
                errors.push(`- Linha ${line}: "${name}" - idade inválida (${c.age})`);
            }

            if (!VALID_BELTS.includes(belt)) {
                errors.push(`- Linha ${line}: "${name}" - faixa inválida (${belt})`);
            }

            const exists = data.competitors.some(
                existing =>
                    existing.name === name &&
                    existing.team === team &&
                    existing.isActive
            );

            if (exists) {
                errors.push(
                    `- Linha ${line}: "${name}" - já existe competidor ativo nesta equipe`
                );
            }
        });

        if (errors.length > 0) {
            return NextResponse.json(
                {
                    error:
                        `❌ Importação cancelada. Problemas encontrados:\n\n` +
                        errors.join('\n'),
                },
                { status: 400 }
            );
        }

        const now = new Date().toISOString();

        const newCompetitors = competitors.map(c => ({
            id: uuidv4(),
            name: c.name.trim(),
            team: c.team.trim(),
            weight: Number(c.weight),
            age: Number(c.age),
            belt: c.belt,
            coach: c.coach || null,
            registrationDate: now,
            isActive: true,
        }));

        data.competitors.push(...newCompetitors);

        await writeCompetitors(data);

        return NextResponse.json({
            success: true,
            imported: newCompetitors.length
        });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error: 'Erro ao processar arquivo. Verifique se é um JSON válido.'
            },
            { status: 500 }
        );
    }
}