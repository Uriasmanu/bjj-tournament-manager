import { NextRequest, NextResponse } from 'next/server';
import { readAreas, writeAreas } from '@/lib/storage';
import { addScheduledMatch } from '@/lib/areaUtils';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const body = await request.json();

  if (!body.matchId) {
    return NextResponse.json(
      { error: 'matchId é obrigatório' },
      { status: 400 }
    );
  }

  const data = await readAreas();
  const area = data.areas.find((entry) => entry.id === id);

  if (!area) {
    return NextResponse.json({ error: 'Área não encontrada' }, { status: 404 });
  }

  if (area.scheduledMatches.some((item) => item.matchId === body.matchId)) {
    return NextResponse.json(
      { error: 'Esta luta já está agendada nesta área' },
      { status: 400 }
    );
  }

  const updatedArea = addScheduledMatch(
    area,
    body.matchId,
    body.order,
    body.estimatedTime,
    Boolean(body.isMarried)
  );

  // Atualiza no array
  const index = data.areas.findIndex((entry) => entry.id === id);
  data.areas[index] = updatedArea;

  await writeAreas(data);

  return NextResponse.json(updatedArea, { status: 201 });
}
