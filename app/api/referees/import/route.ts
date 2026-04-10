import { NextRequest, NextResponse } from 'next/server';
import { readReferees, writeReferees } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';
import { Referee, BeltReferee } from '@/types';

const VALID_BELTS: BeltReferee[] = ['PURPLE', 'BROWN', 'BLACK'];

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
        const updated: string[] = [];
        const inserted: string[] = [];
        const skipped: string[] = [];

        const now = new Date().toISOString();

        referees.forEach((r: Partial<Referee>, index: number) => {
            const line = index + 1;

            const name = r.name?.trim();
            const city = r.city?.trim() || '';
            const beltReferee = r.beltReferee;
            const providedId = r.id;


            if (!name) {
                errors.push(`Linha ${line}: nome obrigatório`);
                return;
            }

            if (!beltReferee || !VALID_BELTS.includes(beltReferee)) {
                errors.push(`Linha ${line}: "${name}" - faixa inválida (${beltReferee})`);
                return;
            }


            let existingIndex = -1;
            let matchType = '';

            if (providedId) {
                existingIndex = data.referees.findIndex(
                    existing => existing.id === providedId
                );
                if (existingIndex !== -1) {
                    matchType = 'id';
                }
            }


            if (existingIndex === -1) {
                existingIndex = data.referees.findIndex(
                    existing => existing.name === name
                );
                if (existingIndex !== -1) {
                    matchType = 'name';
                }
            }

            if (existingIndex !== -1) {

                const existingReferee = data.referees[existingIndex];


                const hasChanges =
                    existingReferee.name !== name ||
                    existingReferee.city !== city ||
                    existingReferee.beltReferee !== beltReferee;

                if (hasChanges) {
                    const updatedReferee: Referee = {
                        ...existingReferee,
                        name: name,
                        city: city || existingReferee.city,
                        beltReferee: beltReferee,
                        isActive: true,


                    };

                    data.referees[existingIndex] = updatedReferee;

                    let changes = [];
                    if (existingReferee.name !== name) changes.push(`nome: "${existingReferee.name}" → "${name}"`);
                    if (existingReferee.beltReferee !== beltReferee) changes.push(`faixa: ${existingReferee.beltReferee} → ${beltReferee}`);
                    if (existingReferee.city !== city && city) changes.push(`cidade: ${existingReferee.city} → ${city}`);

                    updated.push(`Linha ${line}: "${name}" atualizado (${changes.join(', ')}) [match por ${matchType}]`);
                } else {
                    skipped.push(`Linha ${line}: "${name}" - nenhuma alteração detectada`);
                }
            } else {

                const newReferee: Referee = {
                    id: providedId || uuidv4(),
                    name,
                    city,
                    beltReferee,
                    registrationDate: now,
                    isActive: true,
                };

                data.referees.push(newReferee);
                inserted.push(`Linha ${line}: "${name}" importado ${providedId ? '(com ID existente)' : '(novo ID)'}`);
            }
        });


        if (updated.length > 0 || inserted.length > 0) {
            await writeReferees(data);
        }


        let message = '';
        if (inserted.length > 0) message += `${inserted.length} importado(s). `;
        if (updated.length > 0) message += `${updated.length} atualizado(s). `;
        if (skipped.length > 0) message += `${skipped.length} ignorado(s). `;
        if (errors.length > 0) message += `${errors.length} erro(s).`;

        return NextResponse.json({
            success: true,
            imported: inserted.length,
            updated: updated.length,
            skipped: skipped.length,
            errors: errors.length,
            details: {
                errors,
                inserted,
                updated,
                skipped
            },
            message: message.trim()
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