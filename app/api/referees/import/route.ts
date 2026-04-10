
import { NextRequest, NextResponse } from 'next/server';
import { readReferees, writeReferees } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

const VALID_BELTS = [
    'WHITE', 'GRAY', 'YELLOW', 'ORANGE', 'GREEN',
    'BLUE', 'PURPLE', 'BROWN', 'BLACK'
];

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const referees = Array.isArray(body)
            ? body
            : body?.referees;

        if (!Array.isArray(referees)) {
            return NextResponse.json(
                { error: 'Formato inválido. Use um array ou { referees: [] }' },
                { status: 400 }
            );
        }

        const data = await readReferees();

        const errors: string[] = [];
        const skipped: string[] = [];
        const toInsert: any[] = [];

        const now = new Date().toISOString();

        referees.forEach((c, index) => {
            const line = index + 1;

            const name = c.name?.trim();
            const team = c.team?.trim();
            const weight = Number(c.weight);
            const age = Number(c.age);
            const belt = c.belt;

            
            if (!name) {
                errors.push(`Linha ${line}: nome obrigatório`);
                return;
            }

            if (!team) {
                errors.push(`Linha ${line}: "${name}" - equipe obrigatória`);
                return;
            }

            if (!weight || weight <= 0 || weight >= 300) {
                errors.push(`Linha ${line}: "${name}" - peso inválido (${c.weight})`);
                return;
            }

            if (!age || age < 4 || age > 100) {
                errors.push(`Linha ${line}: "${name}" - idade inválida (${c.age})`);
                return;
            }

            if (!VALID_BELTS.includes(belt)) {
                errors.push(`Linha ${line}: "${name}" - faixa inválida (${belt})`);
                return;
            }

            
            const exists = data.referees.some(
                existing =>
                    existing.name === name &&
                    existing.team === team &&
                    existing.isActive
            );

            if (exists) {
                skipped.push(`Linha ${line}: "${name}" já existe`);
                return;
            }

            
            toInsert.push({
                id: uuidv4(),
                name,
                team,
                weight,
                age,
                belt,
                coach: c.coach || null,
                registrationDate: now,
                isActive: true,
            });
        });

        
        if (toInsert.length > 0) {
            data.referees.push(...toInsert);
            await writereferees(data);
        }

        return NextResponse.json({
            success: true,
            imported: toInsert.length,
            skipped: skipped.length,
            errors: errors.length,
            details: {
                errors,
                skipped
            }
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