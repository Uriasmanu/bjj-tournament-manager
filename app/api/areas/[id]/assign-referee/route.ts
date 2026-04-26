import { NextRequest, NextResponse } from 'next/server';
import { readAreas, writeAreas, readReferees } from '@/lib/storage';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const body = await request.json();

  const data = await readAreas();
  const index = data.areas.findIndex((entry) => entry.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Área não encontrada' }, { status: 404 });
  }

  const updatedArea = { ...data.areas[index] };

  if (body.refereeId !== undefined) {
    if (body.refereeId !== null) {
      const refereesData = await readReferees();
      const referee = refereesData.referees.find(
        (r) => r.id === body.refereeId && r.isActive
      );
      if (!referee) {
        return NextResponse.json(
          { error: 'Árbitro principal não encontrado ou inativo' },
          { status: 400 }
        );
      }
    }
    updatedArea.refereeId = body.refereeId;
  }

  if (body.assistantRefereeId !== undefined) {
    if (body.assistantRefereeId !== null) {
      const refereesData = await readReferees();
      const assistant = refereesData.referees.find(
        (r) => r.id === body.assistantRefereeId && r.isActive
      );
      if (!assistant) {
        return NextResponse.json(
          { error: 'Árbitro assistente não encontrado ou inativo' },
          { status: 400 }
        );
      }
    }
    updatedArea.assistantRefereeId = body.assistantRefereeId;
  }

  data.areas[index] = updatedArea;
  await writeAreas(data);

  return NextResponse.json(updatedArea);
}
